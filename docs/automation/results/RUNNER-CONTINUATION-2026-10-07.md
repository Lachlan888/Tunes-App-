# Runner continuation and blocker email — 7 October 2026

- Owner clarification: notify by email for any new genuine blocked criterion, including one the runner will repair later, and continue useful work for about half an hour when ready work exists.
- CONTROL and RUNNER now target 30 minutes of useful work, permit up to six related chunks inside the existing 40-minute maximum, and require a small queue check after each chunk. The same owned run continues; it does not create another task or idle to fill time. Gates, safety and empty queues still allow an earlier stop.
- New blocker email says who acts next and the exact action. `control.py defer` with `attempts: 1` permits one email per fingerprint; later retry attempts and cooldowns do not resend. Runner-fixable repairs go into `state.json` `next_action` and the email says no owner action is needed.
- Updated the active hourly automation prompt and scheduler metadata. `P41-01` remains the next ready chunk. No current blocker exists, so no email was sent. No app code or production data changed.
- Verified the saved prompt and scheduler values, JSON syntax and documentation diff. Actual email delivery remains unverified until a genuine new blocker occurs.
