# Calendar App — To-Do

## Deploy to Netlify (GitHub-connected)

Static site (no build step, no dependencies, no secrets), already pushed to `github.com/contatc2/calendar-app-demo` on `main`. Deploy method: connect the GitHub repo in the Netlify dashboard so it auto-deploys on every push to `main`.

- [x] **1. Add `netlify.toml`** at the project root declaring an explicit static-site config: no build command, publish directory `.`. Makes the deploy config repeatable and self-documenting instead of relying on dashboard defaults.
- [x] **2. Commit and push `netlify.toml`** to `main` so it's available when the site is linked.
- [x] **3. You link the repo in the Netlify dashboard** (netlify.com → Add new site → Import an existing project → GitHub → `contatc2/calendar-app-demo`). This step needs your Netlify login, so it's on you — I'll give exact steps when we get there.
  - Result: deployed to `https://contatc2-calendar-app.netlify.app`.
- [x] **4. Confirm the deploy succeeded** — check the Netlify-provided URL loads the calendar correctly (grid renders, today is highlighted).
  - Result: verified live via browser automation — August 2026 grid renders correctly, the 15th is highlighted as today, no console errors. Noted: the site is currently marked **private** in Netlify (visitor-access banner, "Only project members can view this site") — that's an account/team setting, not a code issue. Flagged to the user; public visibility toggle is in Site settings → Visitor access.
- [x] **5. Security pass** — confirm `netlify.toml` contains no secrets/tokens/env vars, and that nothing sensitive is exposed by the deploy (this app has no backend or API keys, so this should be a quick confirmation).
  - Result: `netlify.toml` contains only `[build] publish = "."` — no env vars, tokens, or secrets. No server/build step was introduced, so the app's existing security posture (no `innerHTML` with user data, no network calls, `localStorage`-only persistence) is unchanged by deployment.
- [x] **6. Review section** — summarize what changed.



## docs-helper sub-agent + README

- [x] **1. Create `.claude/agents/docs-helper.md`** — a reusable sub-agent (frontmatter: name, description, tools) whose job is to scan the app's source files and produce/refresh a beginner-friendly `README.md`.
  - Acceptance: agent definition scopes tools to read-only + Write (Read, Glob, Grep, Write — no Bash/Edit needed); description is specific enough that Claude Code picks it for "update the README" / "document this app" style requests; instructions tell it to actually read `index.html`/`app.js`/`style.css` rather than assume content, and to cover Setup, Features, Accessibility, and Example Usage.
- [x] **2. Run the docs-helper agent to generate `README.md`** at the project root.
  - Acceptance: README exists with Setup (how to open/run the app — it's static, no build step), Features (calendar navigation, add/edit/delete events, persistence, validation), Accessibility (keyboard support, screen-reader labels, focus trap — summarized from the audit already in this file), and an Example Usage walkthrough (e.g. adding an event). Written for a beginner: short sentences, no unexplained jargon.
- [x] **3. Verify README against the actual code** — spot-check claims (storage key name, how to open the app, keyboard shortcuts) against `app.js`/`index.html` so nothing is invented.
  - Result: spot-checked `MAX_VISIBLE_EVENTS = 3`, `localStorage` usage, the "Title is required." error text, and the `aria-label` patterns for day buttons/event chips directly in `app.js` — all match what the README claims.
- [x] **4. Security pass** — confirm the README contains no secrets, API keys, or sensitive data (this app has none, but confirm by inspection) and that generating it required no changes to app code.
  - Result: README contains no keys/secrets/tokens; only mentions `localStorage` as a local, on-device store and notes events "aren't sent anywhere." No app source files (`index.html`/`app.js`/`style.css`) were touched — only `README.md` was added.
- [x] **5. Review section** — summarize what was added.

Simple month-view calendar app (vanilla HTML/CSS/JS, no build step, no dependencies). Events persist to `localStorage` as JSON.

## Review — Netlify deployment

Added `netlify.toml` (`[build] publish = "."`, no build command) declaring this as a plain static site, since it has no build step or dependencies. Committed and pushed to `main`. You connected the GitHub repo in the Netlify dashboard, which deployed it to `https://contatc2-calendar-app.netlify.app`.

Verified live via browser automation: the calendar grid renders correctly (August 2026, the 15th highlighted as today), and no console errors. One thing flagged, not fixed by this change: the site is currently marked **private** in Netlify's visitor-access settings, so it's only viewable while logged into the Netlify account — that's a dashboard toggle (Site settings → Visitor access), not something in the code.

Security pass: `netlify.toml` has no secrets, tokens, or env vars. No backend or build step was added, so nothing new is exposed — the app's existing security properties (no `innerHTML` with user input, no network calls, `localStorage`-only persistence) carry over unchanged to the deployed site.

## Checklist

- [x] **1. `index.html` shell**
  - Acceptance: page has header (month/year label, Prev/Next/Today buttons, Add Event button), an empty calendar grid container, and a hidden add/edit-event modal with title/date/time/description fields + Save/Delete/Cancel. Links `style.css` and `app.js` (deferred).

- [x] **2. `style.css` layout**
  - Acceptance: month grid renders as a 7-column CSS grid with a weekday header row; today's cell is visually highlighted; modal is centered and usable; at narrow viewport widths (~375px) the grid and modal remain usable without horizontal scrolling of the page.

- [x] **3. State & storage (`app.js`)**
  - Acceptance: events load from `localStorage["calendarEvents"]` on page load (empty array if missing/corrupt JSON); every add/edit/delete persists back to `localStorage` immediately; reloading the page preserves events.

- [x] **4. Month rendering (`app.js`)**
  - Acceptance: grid shows the correct number of days for the given month/year including leading/trailing blanks aligned to weekday; Prev/Next/Today buttons update the visible month; each day cell lists that day's events sorted by time; today is highlighted only when the real current month is visible.

- [x] **5. Add/edit modal (`app.js`)**
  - Acceptance: "Add Event" or clicking a day opens the modal in create mode (date pre-filled if a day was clicked); clicking an existing event opens it in edit mode with fields pre-filled and a visible Delete button; Save creates or updates the event, persists, re-renders the grid, and closes the modal; Cancel closes without saving.

- [x] **6. Delete event (`app.js`)**
  - Acceptance: Delete removes the event by id, persists, re-renders the grid, and closes the modal.

- [x] **7. Validation (`app.js`)**
  - Acceptance: empty/whitespace-only title blocks save with an inline error; missing or invalid date blocks save with an inline error; invalid time (if provided) blocks save with an inline error; errors clear once the field is corrected; no invalid event is ever written to storage.

- [x] **8. Security pass**
  - Acceptance: all user-supplied text (title/description) is rendered via `textContent`, never `innerHTML`/string-concatenated HTML — confirmed by code inspection; no external network requests; no secrets or sensitive data anywhere in the frontend code or storage.
  - Result: only `innerHTML` uses are `= ""` to clear containers before re-render (no user data ever passed to `innerHTML`); event chips, day numbers, and error messages all use `textContent`; no `eval`, no `document.write`, no network calls; storage only ever contains what the user typed into the form.

- [x] **9. Manual verification**
  - Acceptance: manually exercised in a browser — month navigation, add/edit/delete an event, reload confirms persistence, narrow-viewport check confirms responsive layout, invalid input confirms validation errors.
  - Result: verified live via Chrome automation against a local static server. Confirmed: month grid renders correctly (Aug 2026, today the 15th highlighted); empty-title save is blocked with an inline "Title is required." error; a full event (title/time/description) saves and appears as a chip on the correct day; the event survived a full page reload (localStorage persistence); Next/Today navigation works; clicking an event opens Edit mode pre-filled with a Delete button, and Delete removes it. Narrow-width check: the browser window in this session wouldn't shrink below ~736px, so the sub-640px breakpoint wasn't visually exercised live — confirmed instead by code inspection that the grid uses `repeat(7, 1fr)` and no fixed large pixel widths exist outside the capped `max-width` containers, so it cannot overflow horizontally at any width.

- [x] **10. Review section**
  - Acceptance: this file has a "Review" section at the bottom summarizing what changed, once all tasks above are complete.

## Review — docs-helper sub-agent + README

Added `.claude/agents/docs-helper.md`, a reusable sub-agent definition (read-only tools + `Write`) scoped to scanning this app's source and writing/refreshing a beginner-friendly `README.md`. It wasn't picked up by the live agent registry mid-session, so the same instructions were run once via a general-purpose agent to produce the actual `README.md` now; the definition file remains in place for future sessions to use directly.

`README.md` was added at the project root with four sections, each verified against the current code rather than assumed: **Setup** (open `index.html` directly — no build step; an optional local-server note for `localStorage` edge cases), **Features** (navigation, add/edit/delete, validation, persistence, overflow handling, light/dark mode, responsive layout), **Accessibility** (summarized from the audit below and cross-checked against the live code — keyboard access, focus trap, focus return, live-region announcements, required-field marking, contrast fixes), and **Example Usage** (a numbered walkthrough of adding an event).

No app source files were modified — only `README.md` was added. No secrets or sensitive data appear in it.

## Review — initial build

Built a small vanilla HTML/CSS/JS month-view calendar app, no dependencies or build step:

- **`index.html`** — page shell: header with month/year label, prev/next/today navigation, "Add Event" button, an empty grid container populated by JS, and an add/edit modal (title, date, time, description fields + Save/Delete/Cancel).
- **`style.css`** — 7-column CSS grid for the month view, today/hover states, modal styling, a `max-width: 640px` responsive breakpoint, and a `prefers-color-scheme: dark` variant.
- **`app.js`** — single IIFE holding all state and logic: `localStorage` load/save (key `calendarEvents`, corrupt/missing data falls back to `[]`), month-grid rendering (leading blanks, day highlighting, per-day event chips sorted by time), create/edit/delete via one shared modal, and inline validation (required non-empty title, required valid date, optional-but-valid time).
- **`tasks/todo.md`** (this file) — checklist with acceptance criteria, tracked and checked off as work progressed.

Security pass: all user-supplied text is rendered via `textContent`; the two `innerHTML` uses only ever clear a container (`= ""`) and never receive user data; no network calls, no `eval`, nothing sensitive stored — `localStorage` holds only what the user typed into the event form.

No automated test suite was added given the minimal vanilla-JS scope; correctness was confirmed by a live manual walkthrough in the browser (see task 9) plus code inspection for the one interaction (narrow-viewport resize) the test environment couldn't exercise directly.

## Accessibility audit

Findings from a manual review of `index.html` / `style.css` / `app.js` against WCAG 2.1 AA.

- [x] **A1. Day cells and event chips are unreachable by keyboard.** Fixed: the day number is now a real `<button>` (labeled e.g. "Today, August 15, 2026. Add event.") and each event chip is now a `<button>` too (labeled "Edit event: …"). The day-cell `<div>` keeps its click handler purely as a mouse convenience for clicking empty space; it was not made a `<button>` itself since it contains the two nested buttons above and real `<button>` nesting is invalid HTML.
- [x] **A2. Modal has no focus trap and doesn't return focus on close.** Fixed: added `trapModalTab`, wired to the existing document `keydown` listener, which wraps `Tab`/`Shift+Tab` at the first/last focusable element inside `#event-modal`. `openModal` now records the triggering element (`state.modalTrigger`); `closeModal` refocuses it if it still exists in the DOM (e.g. Cancel/Escape/backdrop), falling back to the Add Event button when it doesn't (e.g. after Save/Delete re-renders the grid and the old element is gone).
- [x] **A3. "Today" is conveyed by color only.** Fixed as part of A1: the day-number button's `aria-label` prefixes "Today, " for the current date, so it's announced regardless of the color badge.
- [x] **A4. Form errors aren't programmatically associated with their inputs.** Fixed: each input now has a static `aria-describedby` pointing at its (always-present, `aria-live="polite"`) error span, `clearErrors`/`validateForm` toggle `aria-invalid="true"/"false"`, and `validateForm` focuses the first invalid field.
- [x] **A5. Several event-chip color pairs fail WCAG AA contrast (light mode).** Fixed: darkened `.chip-0` to `#137333` (≈5.2:1), `.chip-3` to `#8a5000` (≈5.9:1), `.chip-5` to `#0f6848` (≈6.1:1). `.chip-1/2/4` were already passing and left unchanged. Dark-mode variants were already comfortably passing.
- [x] **A6. Month navigation isn't announced to screen readers.** Fixed: added `aria-live="polite"` to `#month-label`.
- [x] **A7. Title/Date inputs have no accessible "required" signal.** Fixed: added `aria-required="true"` to `#event-title` and `#event-date`.

Not flagged as blocking, lower priority (not implemented): no skip link (single small view, low value here); full ARIA `grid`/roving-tabindex pattern for the calendar (button-per-day per A1 is sufficient for AA; a true grid pattern is an enhancement, not a requirement).

### Accessibility review

Changes: `index.html` gained `id="event-modal"`, `aria-live="polite"` on the month label, `aria-required`/`aria-describedby` on the three validated inputs, and `aria-live="polite"` on the three error spans. `style.css` reset button chrome on the now-interactive `.day-number` and `.event-chip` elements and darkened three event-chip text colors that failed AA contrast. `app.js`: day numbers and event chips are now `<button>`s with descriptive `aria-label`s instead of unfocusable `<div>`s; `openModal`/`closeModal` gained trigger-tracking and a `Tab` focus trap (`trapModalTab`, `getFocusableElements`); `validateForm`/`clearErrors` gained `aria-invalid` toggling and first-invalid-field focus.

Verified live in a browser (Chrome, via local static server): tabbed to a day button (previously impossible — day cells and chips were unreachable by keyboard), opened the modal with Enter, confirmed `Shift+Tab` from the modal's first control wraps to its last control instead of escaping to the toolbar behind it, confirmed Escape returns focus to the triggering day button, confirmed submitting an empty title shows the inline error and moves focus to the Title field, and confirmed create/edit/delete of an event still works end-to-end (chip click opens Edit mode, Delete removes it). No console errors.

Security pass (per workflow step 8): all new `aria-label` values are set via `setAttribute`, never `innerHTML`, so user-supplied text (event title/time) reaching an attribute value can't inject markup; visible text still goes through `textContent` exactly as before. No new storage, network calls, or dependencies were introduced — this was a UI/markup/CSS-only change.
