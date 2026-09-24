# Tunes App

Tunes is a living tunebook for remembering, practising and sharing traditional music. The app uses Next.js, React, TypeScript and Supabase.

## Resume development

Start with [the chunk runner](docs/automation/RUNNER.md), [live state](docs/automation/state.json), and only the current [chunk specification](docs/automation/PLAN.md). Each invocation completes one small verified chunk, then stops. Prompt 19 precedes final Prompt 18 hardening; completed Prompts 1–17 are preserved. Historical reports are not startup reads.

- [Current architecture and product context](docs/Tunes-App-Current-Context.md)
- [Numbered implementation prompts](docs/Prompt%20Series) — read only the current prompt unless more context is needed
- [UI/UX audit and design direction](docs/Tunes%20App%20%E2%80%94%20Full%20UI%2FUX%20Audit%20and%202026%20Product%20Design%20Direction.md) — consult only guidance directly required by the current chunk
- [Recent runner history through 14 September 2026](docs/archive/Prompt%20Runner%20History%20through%202026-09-14.md) — detailed Prompt 14–19 evidence and superseded recovery notes
- [Historical runner evidence](docs/archive/Prompt%20Runner%20History%20through%20Prompt%2013.md) — archived results, not a second live ledger

The local repository is the intended implementation snapshot. A checkpoint can include incomplete work; consult live state before treating it as release-ready. Preserve existing work and follow the runner's documented recovery and verification rules.

## Local development

Use the repository's existing local environment configuration. Keep credentials out of Git. If setting up a fresh machine, obtain the required environment values through the existing authorised setup process.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Checks

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Use relevant per-chunk verification evidence to distinguish known failures from new regressions. A passing test suite alone does not establish that an interrupted prompt meets its acceptance criteria.
