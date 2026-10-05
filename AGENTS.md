# Tunes agent entry point

Read [README.md](README.md) for setup and [docs/PRODUCT_CONTRACT.md](docs/PRODUCT_CONTRACT.md) for the current product decisions. The contract is the single source of truth for product behavior, navigation, and copy. Read [docs/design/EDITORIAL_SYSTEM.md](docs/design/EDITORIAL_SYSTEM.md) for the current Media Studio-informed presentation rules and required visual review. Direct user instructions supersede it. Older audits and completed prompt specifications are historical evidence when they disagree.

For the scheduled hourly runner, follow [docs/automation/CONTROL.md](docs/automation/CONTROL.md): run its preflight before reading application files, acquire the runner lock, then read [RUNNER.md](docs/automation/RUNNER.md), the small live state, the current chunk, and only relevant code. The active sequence is indexed in [PLAN.md](docs/automation/PLAN.md). Interactive tasks should check that lock before editing overlapping files and preserve all uncommitted work.

Do not claim a feature is shipped because code or a completed runner result exists. State what was verified locally, what remains user-owned manual acceptance, and whether deployment happened. Do not deploy, publish a festival, mutate production data, or send messages unless the current user request or runner instructions explicitly authorize it.
