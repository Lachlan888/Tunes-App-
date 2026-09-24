#!/usr/bin/env python3
"""Small local runner gate. No app reads, network calls or task-status guesses."""
import argparse
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import sys
import tempfile
import uuid


def now():
    return datetime.now(timezone.utc)


def stamp():
    return now().isoformat()


def read(path, default=None):
    return json.loads(path.read_text()) if path.exists() else default


def atomic(path, data):
    fd, name = tempfile.mkstemp(prefix='.' + path.name, dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(data, f, indent=2)
            f.write('\n')
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


@contextmanager
def guard(root):
    # Kernel lock releases even if this short-lived helper crashes.
    with (root / '.control.guard').open('a') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        yield


def lock_info(root):
    path = root / 'lock.json'
    if not path.exists():
        return None
    raw = path.read_bytes()
    data = json.loads(raw)
    return {
        'decision': 'inspect_owner',
        'owner_task_id': data.get('owner_task_id') or data.get('task_id') or data.get('thread_id'),
        'run_id': data.get('run_id'),
        'heartbeat_at': data.get('heartbeat_at') or data.get('heartbeat_utc') or data.get('heartbeat'),
        'lock_sha256': hashlib.sha256(raw).hexdigest(),
    }


def gate(root):
    locked = lock_info(root)
    if locked:
        return locked
    state = read(root / 'state.json', {})
    if state.get('status') == 'complete':
        return {'decision': 'complete_pause'}
    retries = read(root / 'retry.json', {})
    # Only defer the matching current item; another dependency-ready item can work.
    current = state.get('current_chunk') or state.get('current_slice')
    retry = retries.get(current, {})
    if retry.get('kind') == 'input':
        return {'decision': 'awaiting_input', 'item': current, 'fingerprint': retry['fingerprint']}
    if retry.get('next_retry_at') and now() < datetime.fromisoformat(retry['next_retry_at']):
        return {'decision': 'cooldown', 'item': current, 'next_retry_at': retry['next_retry_at']}
    return {'decision': 'ready', 'item': current, 'status': state.get('status')}


def owned(root, run_id):
    data = read(root / 'lock.json')
    if not data or data.get('run_id') != run_id:
        raise ValueError('Lock is not owned by this run; no mutation performed')
    return data


def execute(args):
    root = Path(args.directory).resolve()
    with guard(root):
        if args.action == 'preflight':
            return gate(root)
        if args.action == 'acquire':
            decision = gate(root)
            if args.resume_reason and decision['decision'] in ('cooldown', 'awaiting_input'):
                # A deliberate resume is allowed only after new input/environment
                # evidence, or to select genuinely independent ready work.
                decision = {'decision': 'ready', 'item': decision.get('item')}
            if decision['decision'] != 'ready':
                return decision
            run_id = str(uuid.uuid4())
            record = {'schema_version': 2, 'run_id': run_id,
                      'owner_task_id': args.task, 'started_at': stamp(),
                      'heartbeat_at': stamp(), 'item': decision.get('item')}
            try:
                with (root / 'lock.json').open('x') as f:
                    json.dump(record, f)
                    f.write('\n')
            except FileExistsError:
                return lock_info(root)
            return {'decision': 'acquired', 'run_id': run_id, 'item': decision.get('item')}
        if args.action == 'heartbeat':
            data = owned(root, args.run)
            data['heartbeat_at'] = stamp()
            atomic(root / 'lock.json', data)
            return {'decision': 'refreshed'}
        if args.action == 'release':
            owned(root, args.run)
            (root / 'lock.json').unlink()
            return {'decision': 'released'}
        if args.action == 'recover':
            info = lock_info(root)
            if not info:
                return {'decision': 'already_clear'}
            if info['owner_task_id'] != args.task or info['lock_sha256'] != args.sha256:
                raise ValueError('Owner or lock contents changed; obtain fresh status before recovery')
            # Caller must obtain this evidence from a fresh task-status tool response.
            # notLoaded/idle alone, elapsed age and absence of a PID are NOT evidence.
            destination = root / 'results' / 'recovery'
            destination.mkdir(parents=True, exist_ok=True)
            key = uuid.uuid4().hex
            atomic(destination / ('owner-' + key + '.json'), {
                'owner_task_id': args.task, 'terminal_turn_status': args.terminal_status,
                'evidence': args.evidence, 'checked_at': stamp(), 'lock_sha256': args.sha256})
            os.replace(root / 'lock.json', destination / ('lock-' + key + '.json'))
            return {'decision': 'recovered', 'next': 'acquire'}
        if args.action in ('defer', 'clear'):
            owned(root, args.run)
            path = root / 'retry.json'
            entries = read(path, {})
            if args.action == 'clear':
                entries.pop(args.item, None)
                atomic(path, entries)
                return {'decision': 'cleared', 'item': args.item}
            old = entries.get(args.item, {})
            same = old.get('fingerprint') == args.fingerprint and old.get('kind') == args.kind
            # Never extend a cooldown merely because another scheduled invocation arrived.
            if same and (old.get('kind') == 'input' or
                         (old.get('next_retry_at') and now() < datetime.fromisoformat(old['next_retry_at']))):
                return {'decision': 'already_deferred', 'item': args.item}
            attempts = old.get('attempts', 0) + 1 if same else 1
            delay = [1, 4, 24][min(attempts - 1, 2)]
            entries[args.item] = {'fingerprint': args.fingerprint, 'kind': args.kind,
                                  'attempts': attempts, 'last_checked_at': stamp(),
                                  'next_retry_at': None if args.kind == 'input' else
                                  (now() + timedelta(hours=delay)).isoformat()}
            atomic(path, entries)
            return {'decision': 'deferred', 'item': args.item, **entries[args.item]}
    raise ValueError('Unknown action')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', default=str(Path(__file__).resolve().parent))
    commands = parser.add_subparsers(dest='action', required=True)
    commands.add_parser('preflight')
    acquire = commands.add_parser('acquire')
    acquire.add_argument('--task', required=True, help='Actual Codex task ID; never a helper PID')
    acquire.add_argument('--resume-reason', choices=('input-received', 'environment-changed', 'independent-work'))
    for name in ('heartbeat', 'release', 'clear', 'defer'):
        sub = commands.add_parser(name)
        sub.add_argument('--run', required=True)
        if name in ('clear', 'defer'):
            sub.add_argument('--item', required=True)
        if name == 'defer':
            sub.add_argument('--fingerprint', required=True, help='Stable non-secret blocker code')
            sub.add_argument('--kind', choices=('input', 'transient'), required=True)
    recover = commands.add_parser('recover')
    recover.add_argument('--task', required=True)
    recover.add_argument('--sha256', required=True)
    recover.add_argument('--terminal-status', choices=('completed', 'interrupted', 'failed', 'cancelled'), required=True)
    recover.add_argument('--evidence', required=True, help='Fresh observed task/turn status and tool source')
    try:
        result = execute(parser.parse_args())
        print(json.dumps(result))
        return 0 if result['decision'] not in ('inspect_owner', 'cooldown', 'awaiting_input', 'complete_pause') else 10
    except (ValueError, OSError, KeyError) as error:
        print(json.dumps({'decision': 'error', 'reason': str(error)}))
        return 2


if __name__ == '__main__':
    sys.exit(main())
