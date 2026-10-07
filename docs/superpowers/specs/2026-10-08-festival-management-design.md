# Festival management workflow

The owner needs one obvious app-wide Festival mode switch in Developer tools and a separate workspace for preparing each festival. The workspace must show what has been entered, what needs review, and what visitors can currently see.

## Scope and states

Festival mode remains the app-wide Home promotion switch. It does not publish or withdraw a hub. A published or archived hub keeps its direct link while mode is off. Only the owner can read draft management data or change festival records and settings.

The management header names the festival being edited and independently shows its lifecycle, whether it is selected for Home, and whether its Home promotion is live. Editing a festival never changes the selected festival. New festivals start as private drafts.

## Screens

Developer tools contains a compact Festival mode switch, the selected hub's name and state, and a link to Manage festivals. The switch saves immediately, reports success or failure, and cannot turn on without a selected published hub. It preserves the selected hub when toggled.

`/dev/festivals` is one URL-backed workspace. Its festival chooser and four tabs are **Details**, **Repertoire**, **Sessions**, and **Review & publish**. The selected festival and tab survive refresh and can be linked directly. Creating a draft is available above the tabs. Empty state gives the next action.

- Details groups identity, branding, and programme source fields. Saving details does not change lifecycle.
- Repertoire attaches public Lists, edits festival-only labels and order, and links to the original List editor. Detaching never changes the List or its tunes.
- Sessions shows compact dated rows with held-for-review state. Editors expand per session. New entries begin held for review. Unknown programme facts remain blank.
- Review & publish shows an owner preview, an evidence-based setup checklist, explicit lifecycle actions with confirmation for public exposure/withdrawal, and the app-wide selected-for-Home action. Selecting a hub while mode is on turns mode off first so it cannot silently switch the live Home feature.

The checklist reports saved core details, attached public lists, session count and review holds, and whether optional branding/programme source is present. It does not invent required counts or assert editorial approval. Publishing with no visitor-visible content shows a warning at the confirmation step.

## Presentation and accessibility

Use the existing editorial hierarchy: one page title, flat sections, thin rules, plain tabs, and clear state labels. Desktop and phone expose the same controls. Tab navigation has a visible current state and works by keyboard. Every save and lifecycle action has pending, success and failure feedback. Exact consequences appear beside the action. The owner retains final manual visual and functional acceptance.
