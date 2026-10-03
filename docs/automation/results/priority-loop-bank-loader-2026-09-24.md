# Priority loop-bank loader — 24 September 2026

## Delivered

- Added a compact floppy-disk control to the right of each A–D bank letter.
- The control opens a bank-specific saved-loop picker showing name, range and saved speed.
- Choosing a saved loop assigns it to that bank, activates the bank and loads its playback window without changing the other banks.
- Increased the pedal's minimum height and exposed Halve, Double and Clear as persistent footswitch-style controls.

## Verification

- `node --experimental-strip-types --test tests/reference-media.test.ts`: 19/19 passed.
- Scoped ESLint for the changed component, state helper and test: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed.

Manual functional and visual acceptance remains user-owned under the 23 September preference.

## Deployment

- User-authorised direct production deployment: `dpl_e5PsQb8t6oyBnGhRhvigfMDxepfC`.
- Vercel reported `READY` and aliased it to `https://tunes-app-three.vercel.app`.
- Per the user's instruction, no additional pre- or post-deploy checks were run in the deployment turn.
