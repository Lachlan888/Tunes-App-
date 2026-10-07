# Runner blocker handoff — 7 October 2026

- Owner request: email a clear action for a new genuine owner-action blocker; queue self-fixable issues as the next runner action.
- Updated `CONTROL.md` and `RUNNER.md` with a concrete `state.json` next-action format, one-time blocker email rules, and duplicate suppression through `control.py defer`'s `deferred`/`already_deferred` result.
- Updated the existing hourly automation prompt. Confirmed it remains active, hourly, on the same project and model. Connected Gmail profile identifies `lachlan.heycox@gmail.com` as the owner's address.
- No blocker exists in this batch, so no email was sent. `P41-01` remains ready; its integration checkpoint is the next action. No application code, production data, deployment or user acceptance changed.
- Verification: `git diff --check` passed for the two changed runner documents; inspected the saved automation prompt and status. Delivery will be verified on the first actual owner-action blocker.
