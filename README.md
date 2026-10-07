# Tunes

Tunes is a living tunebook for traditional musicians: find and keep tunes, practise them with a clear revision schedule, organise lists, and find repertoire to play with others. It uses Next.js, React, TypeScript, and Supabase.

## Product in one minute

- **Home** shows the next useful action and a small repertoire overview.
- **Practice** is the direct review flow. The UI shows the review interval in days and the actual due date; internal scheduling stages stay behind the scenes. Ratings are Rough, Shaky, and Solid.
- **Practice Diary** is a focused secondary workspace for reflections, Focus Areas, and tune history. Open it from the account menu; an optional invitation appears after a session only when the user's Diary preference is on.
- **Tunes** is the shared catalogue. A catalogue tune, a list membership, an active practice tune, and a Known tune have different meanings. Each tune has **Info** and **Reference** views; sources and folklore live in Info, playback lives in Reference.
- **Lists** organise tunes without automatically enrolling them in Practice.
- **Social** connects musicians. **Compare** is its own primary destination for finding shared repertoire.
- **Help & feedback stays visible on user-facing screens during beta.** It must remain usable without covering the current task.
- **Festival content appears only for a real partner festival selected and enabled by the app owner.** It is not a permanent everyday destination.

These are current product decisions, including the owner's October 2026 corrections. See [the product contract](docs/PRODUCT_CONTRACT.md) for precise behavior, copy, data rules, design direction, and acceptance criteria, and [the editorial visual system](docs/design/EDITORIAL_SYSTEM.md) for the Media Studio-informed style rules, alongside [the page mockups](docs/design/mockups/README.md) for visual reference. The contract takes precedence over the older [design audit](docs/Tunes%20App%20%E2%80%94%20Full%20UI%2FUX%20Audit%20and%202026%20Product%20Design%20Direction.md) where they differ.

## Where future agents start

1. Read [AGENTS.md](AGENTS.md) and the [product contract](docs/PRODUCT_CONTRACT.md).
2. Inspect the current code and uncommitted work before assuming a documented feature is live. [Current implementation context](docs/Tunes-App-Current-Context.md) is a code map, not a competing product brief.
3. For hourly work, follow [runner controls](docs/automation/CONTROL.md), [runner instructions](docs/automation/RUNNER.md), [live state](docs/automation/state.json), and only the [current chunk](docs/automation/PLAN.md). V02 is the current app-wide visual-system gate before P35-03 and later feature work; P1–P34 and P18 are completed history.
4. Record checks and remaining limitations in the chunk result. For V02, agents also perform and document rendered mobile/tablet/desktop visual checks of their assigned routes; the owner retains final manual functional and visual acceptance. Run targeted automated and required database/permission checks as appropriate.

## Local development

Use the repository's existing authorised environment configuration. Keep credentials out of Git.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Useful checks are `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`; use the checks appropriate to the changed slice. A local pass is not a deployment or user acceptance.
