# Runner cadence — 7 October 2026

- Changed the existing active automation from hourly to every 40 minutes (`FREQ=MINUTELY;INTERVAL=40;BYSECOND=0`), preserving its project, model, notification policy and prompt aside from cadence wording.
- Updated scheduler metadata and runner documentation. The separate batch ceiling remains 40 minutes with the final five reserved for checks and cleanup; the owner lock handles any overlap with the next scheduled start.
- Verified the saved automation recurrence and active status, scheduler JSON and documentation diff. No run was started by this change, no blocker email was sent, and `P41-01` remains ready.
