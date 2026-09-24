# Runner entry point moved

Read [automation/RUNNER.md](automation/RUNNER.md), then [automation/state.json](automation/state.json) and only the current chunk specification. This file is a compatibility pointer, not a live ledger; never append progress here.

The pre-conversion ledger is preserved byte-for-byte in [the historical snapshot](archive/automation-2026-09-14/Prompt%20Runner%20State.md). Earlier full ledgers remain archived. Do not read history by default.
