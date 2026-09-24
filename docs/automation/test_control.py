import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

SCRIPT = Path(__file__).with_name('control.py')


class ControlTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.state = self.root / 'state.json'
        self.state.write_text(json.dumps({'status': 'ready', 'current_chunk': 'A'}))

    def tearDown(self):
        self.temp.cleanup()

    def call(self, *args):
        p = subprocess.run([sys.executable, str(SCRIPT), '--directory', str(self.root), *args],
                           capture_output=True, text=True)
        return p.returncode, json.loads(p.stdout)

    def acquire(self):
        code, result = self.call('acquire', '--task', 'task-1')
        self.assertEqual(code, 0)
        self.assertEqual(result['decision'], 'acquired')
        return result['run_id']

    def test_ready_acquire_refresh_release(self):
        self.assertEqual(self.call('preflight')[1]['decision'], 'ready')
        run = self.acquire()
        self.assertEqual(self.call('heartbeat', '--run', run)[0], 0)
        self.assertEqual(self.call('release', '--run', run)[0], 0)
        self.assertFalse((self.root / 'lock.json').exists())

    def test_competing_acquisitions_have_exactly_one_winner(self):
        commands = [subprocess.Popen([sys.executable, str(SCRIPT), '--directory', str(self.root),
                    'acquire', '--task', 'task-' + str(i)], stdout=subprocess.PIPE, text=True) for i in range(8)]
        results = [json.loads(p.communicate()[0])['decision'] for p in commands]
        self.assertEqual(results.count('acquired'), 1)
        self.assertEqual(results.count('inspect_owner'), 7)

    def test_other_owner_cannot_refresh_or_release(self):
        self.acquire()
        before = (self.root / 'lock.json').read_bytes()
        for action in ['release', 'heartbeat']:
            self.assertEqual(self.call(action, '--run', 'wrong')[0], 2)
        self.assertEqual(before, (self.root / 'lock.json').read_bytes())

    def test_old_lock_not_expired_on_age(self):
        (self.root / 'lock.json').write_text(json.dumps({'task_id': 'old-task', 'heartbeat_at': '2000-01-01'}))
        self.assertEqual(self.call('preflight')[1]['decision'], 'inspect_owner')
        self.assertEqual(self.call('acquire', '--task', 'new')[0], 10)

    def test_interrupted_owner_recovered_without_completion_timestamp(self):
        self.acquire()
        info = self.call('preflight')[1]
        code, result = self.call('recover', '--task', 'task-1', '--sha256', info['lock_sha256'],
                                '--terminal-status', 'interrupted', '--evidence', 'fresh tool turn status')
        self.assertEqual((code, result['decision']), (0, 'recovered'))
        self.assertEqual(len(list((self.root / 'results/recovery').glob('lock-*.json'))), 1)
        self.acquire()

    def test_recovery_rejects_changed_lock(self):
        run = self.acquire()
        info = self.call('preflight')[1]
        self.call('heartbeat', '--run', run)
        self.assertEqual(self.call('recover', '--task', 'task-1', '--sha256', info['lock_sha256'],
                         '--terminal-status', 'completed', '--evidence', 'old status')[0], 2)
        self.assertTrue((self.root / 'lock.json').exists())

    def test_completed_state_does_no_work(self):
        self.state.write_text('{"status":"complete"}')
        self.assertEqual(self.call('acquire', '--task', 'task-1')[1]['decision'], 'complete_pause')
        self.assertFalse((self.root / 'lock.json').exists())

    def test_cooldown_does_not_move_on_repeated_invocations(self):
        run = self.acquire()
        command = ('defer', '--run', run, '--item', 'A', '--fingerprint', 'browser-unreachable', '--kind', 'transient')
        self.assertEqual(self.call(*command)[0], 0)
        before = (self.root / 'retry.json').read_bytes()
        self.assertEqual(self.call(*command)[1]['decision'], 'already_deferred')
        self.assertEqual(before, (self.root / 'retry.json').read_bytes())
        self.call('release', '--run', run)
        self.assertEqual(self.call('preflight')[1]['decision'], 'cooldown')
        self.assertEqual(self.call('acquire', '--task', 'task-2')[0], 10)

    def test_retry_backoff_1_4_24_hours(self):
        for expected in [1, 4, 24, 24]:
            if (self.root / 'retry.json').exists():
                data = json.loads((self.root / 'retry.json').read_text())
                data['A']['next_retry_at'] = (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat()
                (self.root / 'retry.json').write_text(json.dumps(data))
            run = self.acquire()
            _, result = self.call('defer', '--run', run, '--item', 'A', '--fingerprint', 'docker', '--kind', 'transient')
            gap = datetime.fromisoformat(result['next_retry_at']) - datetime.fromisoformat(result['last_checked_at'])
            self.assertAlmostEqual(gap.total_seconds()/3600, expected, places=3)
            self.call('release', '--run', run)

    def test_independent_item_is_not_blocked(self):
        run = self.acquire()
        self.call('defer', '--run', run, '--item', 'A', '--fingerprint', 'needs-input', '--kind', 'input')
        self.call('release', '--run', run)
        self.state.write_text('{"status":"ready","current_chunk":"B"}')
        self.assertEqual(self.call('preflight')[1]['decision'], 'ready')

    def test_explicit_new_input_can_resume_and_clear(self):
        run = self.acquire()
        self.call('defer', '--run', run, '--item', 'A', '--fingerprint', 'needs-input', '--kind', 'input')
        self.call('release', '--run', run)
        self.assertEqual(self.call('preflight')[1]['decision'], 'awaiting_input')
        code, result = self.call('acquire', '--task', 'task-2', '--resume-reason', 'input-received')
        self.assertEqual(code, 0)
        run = result['run_id']
        self.assertEqual(self.call('clear', '--run', run, '--item', 'A')[0], 0)
        self.call('release', '--run', run)
        self.assertEqual(self.call('preflight')[1]['decision'], 'ready')

    def test_resume_does_not_override_live_lock(self):
        self.acquire()
        self.assertEqual(self.call('acquire', '--task', 'task-2', '--resume-reason', 'independent-work')[0], 10)

    def test_malformed_state_fails_closed(self):
        self.state.write_text('{broken')
        self.assertEqual(self.call('acquire', '--task', 'task-1')[0], 2)
        self.assertFalse((self.root / 'lock.json').exists())


if __name__ == '__main__':
    unittest.main()
