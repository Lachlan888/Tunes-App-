# Responsive workbench browser checks

`responsive-workbench.mjs` exports `verifyResponsiveWorkbench(page, options)` for a standard Playwright Page in an already authenticated local test browser. It captures 390, 430, 768, 1024 and 1440px routes, checks horizontal overflow, duplicate IDs/panels and navigation visibility, and exercises Home keyboard/resize behavior, catalogue-preview focus, account-menu closure and Compare drawer behavior. Completed route captures are saved incrementally so interruption does not lose the matrix. Loading status regions must disappear before capture.

The standalone entry point accepts `TUNES_BROWSER_CDP` for an already authorized local test browser, `TUNES_TEST_URL` for the local server, and `TUNES_SCREENSHOT_DIR` for screenshots. Supply `TUNES_PLAYWRIGHT_MODULE` as an absolute path to an existing Playwright module if needed. No repository dependency was added. Do not export session cookies or credentials or connect to a production app URL.

## Prompt 17 acceptance evidence — 12 September 2026

The Codex in-app browser ran the equivalent read-only route and interaction scenarios. The standalone script is syntax/lint checked but its entry point was not executed. Explicit user approval for authenticated Tune Detail/reference verification is recorded in the runner ledger; earlier rejection notes are superseded.

`ui-feedback/prompt-17/index.html` and `matrix.json` contain 225 viewport screenshots across 45 routes/views at all five widths. This combines the initial nine index/collection routes with the recovered 36-route continuation, including Tune Detail's three views, Reference Media, List Reader/Manage, public-list detail, Setlist Read/Manage/Performance, Focused Practice, Diary Day/Week/Month, Trends/style, profiles and their tabs, Friends, Inbox Activity/Messages, badges/detail, Compare entry/populated results and all account groups. The remaining foci/index routes are also included.

Fresh interaction checks covered Home keyboard switching and focused-panel resize, catalogue preview focus/Escape, account-menu breakpoint closure with visible focus, Compare and Filters reverse-Tab containment and landscape sizing, and Reference Session Dock expansion, navigation suppression and focus restoration. Five-width catalogue resizing retained 20 rows and one navigation; server loader timing logs remained unchanged. This is server-side loader evidence, not a full network trace. The source uses one responsive panel tree and CSS, with no resize-driven data fetch.

Screenshots show viewports rather than complete page heights. No production form was submitted, rating recorded, message sent or data changed. Provider playback lifecycle and mutation testing are outside this responsive pass; the real YouTube iframe and provider timing were loaded for layout verification. No migrations were required. Temporary browser tab closed and viewport reset.
