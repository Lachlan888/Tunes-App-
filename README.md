# Tunes App

Tunes is a living tunebook for remembering, practising and sharing traditional music. The app uses Next.js, React, TypeScript and Supabase.

## Resume development

Start with [Prompt Runner State](docs/Prompt%20Runner%20State.md). It is the single live progress ledger and records the current prompt, unfinished work, verification results and recovery notes. Read it before assuming progress from a conversation or an older Git milestone.

- [Current architecture and product context](docs/Tunes-App-Current-Context.md)
- [Numbered implementation prompts](docs/Prompt%20Series) — read only the current prompt unless more context is needed
- [UI/UX audit and design direction](docs/Tunes%20App%20%E2%80%94%20Full%20UI%2FUX%20Audit%20and%202026%20Product%20Design%20Direction.md) — read the executive direction and relevant workstream
- [Historical runner evidence](docs/archive/Prompt%20Runner%20History%20through%20Prompt%2013.md) — archived results, not a second live ledger

The local repository is the intended implementation snapshot. A checkpoint can include incomplete work; consult the live ledger before treating it as release-ready. Preserve existing work and follow the runner's documented recovery and verification rules.

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

Use the live ledger to distinguish known failures from new regressions. A passing test suite alone does not establish that an interrupted prompt meets its acceptance criteria.
