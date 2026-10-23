# Implementation Plan: Todo List Life Dashboard

## Overview

Build the Todo List Life Dashboard as a single-page Vanilla JavaScript app with a layered architecture inside one ES module (`js/app.js`): a **pure logic layer** of side-effect-free exported functions (the testable core), a thin **I/O layer** (a LocalStorage `Storage` wrapper, DOM `render*` functions, and a timestamp-based `FocusTimer`), and a **controller/init layer** that wires DOM events to state transitions, persists via `Storage`, and re-renders. The production site ships one `index.html`, one `css/style.css`, and one `js/app.js` (no framework, no build step, no backend). The test stack — `package.json`, `vitest.config.js`, and `test/**/*.test.js` using Vitest + `fast-check` + jsdom — is dev-only and is not deployed.

Each pure-logic task exports functions and is immediately validated by its property-based test sub-tasks; later tasks build the I/O and controller layers on top and wire everything together in the final controller/init task. The 11 correctness properties from the design each become their own property-test sub-task placed next to the implementation it tests.

## Tasks

- [x] 1. Set up project structure and test infrastructure
  - [x] 1.1 Create project skeleton and production file scaffolding
    - Create `index.html` linking `css/style.css` and `js/app.js` (as `type="module"`), an empty `css/style.css`, and `js/app.js` as an ES module containing only the side-effect-safe boot guard (register `init` on `DOMContentLoaded` if `document` exists; `init` returns early when `#dashboard` is absent so test imports cause no DOM side effects)
    - _Requirements: 8.3, 11.1, 11.2_
  - [x] 1.2 Set up the test infrastructure
    - Create `package.json` with `vitest`, `fast-check`, and `jsdom` (or `happy-dom`) as dev dependencies and a `test` script (`vitest --run`)
    - Create `vitest.config.js` configuring the jsdom/happy-dom environment with native ESM so tests can import directly from `js/app.js`
    - Create the `test/` directory
    - _Requirements: (test infrastructure, supports all automated testing)_

- [x] 2. Implement greeting and date/time pure logic
  - [x] 2.1 Implement getGreeting, formatTime, formatDate
    - Export `getGreeting(hour)` mapping 05–11 → `'Good Morning'`, 12–16 → `'Good Afternoon'`, 17–20 → `'Good Evening'`, 21–04 → `'Good Night'`
    - Export `formatTime(date)` and `formatDate(date)` using `Intl.DateTimeFormat` for locale-aware local time (e.g. `09:42`) and day/month/year respectively
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 2.2 Write property test for greeting correctness and full partition
    - **Property 1: Greeting correctness and full partition**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Generator for `hour` over `0..23`; assert the exact mapping and that the four ranges partition all 24 hours with no overlap and no gap
  - [ ]* 2.3 Write property test for date and time formatting components
    - **Property 2: Date and time formatting contain required components**
    - **Validates: Requirements 1.1, 1.2**
    - Generator for an arbitrary `Date`; assert `formatTime` reflects the local hour and minute and `formatDate` contains the localized day, month, and year

- [x] 3. Implement timer display and task validation pure logic
  - [x] 3.1 Implement formatTimerDisplay, validateTaskText, createTask
    - Export `formatTimerDisplay(remainingMs)` returning `MM:SS`, clamping negatives to `00:00`
    - Export `validateTaskText(text)` returning `{ valid, error? }`, valid iff `text.trim().length` is 1–200
    - Export `createTask(text)` returning `{ id, text, createdAt: Date.now(), done: false }` with `id = crypto.randomUUID()` and a `Math.random`-based fallback
    - _Requirements: 2.1, 2.4, 3.1, 3.7_
  - [ ]* 3.2 Write property test for timer display round-trip and reset-to-duration
    - **Property 3: Timer display round-trip and reset-to-duration**
    - **Validates: Requirements 2.1, 2.4**
    - Generator for `remainingMs` including negatives; assert `parseTimerDisplay(formatTimerDisplay(remainingMs)) === remainingMs` for non-negatives and clamp to `00:00` for negatives
  - [ ]* 3.3 Write property test for valid task text acceptance and well-formed task
    - **Property 4: Valid task text is accepted and yields a well-formed task; invalid text is rejected**
    - **Validates: Requirements 3.1, 3.7**
    - Generator for arbitrary strings (including whitespace-only and long strings); assert `validateTaskText` accepts iff trimmed length is 1–200, and that `createTask` returns `done === false`, a non-empty unique `id`, and `text === s`

- [~] 4. Implement duplicate detection and sorting pure logic
  - [ ] 4.1 Implement normalizeTaskText, hasDuplicateTask, sortTasks
    - Export `normalizeTaskText(text)` returning `text.trim().toLowerCase()`
    - Export `hasDuplicateTask(text, tasks)` returning true iff some existing task's normalized text equals `normalizeTaskText(text)`
    - Export `sortTasks(tasks, sortBy)` returning a **new** array sorted by `'name'` (case-insensitive ascending), `'date'` (ascending `createdAt`), or `'status'` (ascending status name), without mutating the input, with a deterministic tie-break
    - _Requirements: 5.2, 5.3, 5.4, 6.1, 6.2_
  - [ ]* 4.2 Write property test for duplicate detection and normalization idempotence
    - **Property 5: Duplicate detection matches on trimmed, case-insensitive text and normalization is idempotent**
    - **Validates: Requirements 6.1, 6.2**
    - Generator for strings and task lists with whitespace/case variation; assert `normalizeTaskText` is idempotent and `hasDuplicateTask` is true iff a matching normalized text exists
  - [ ]* 4.3 Write property test for sorting permutation and ordering
    - **Property 6: Sorting preserves elements and orders by the selected key**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Generator for task lists and keys; assert the result is a permutation of the input (same `id` multiset, no loss/duplication) and correctly ordered per key with a deterministic tie-break

- [ ] 5. Implement URL validation, theme resolution, and list operations pure logic
  - [ ] 5.1 Implement isValidUrl, resolveTheme, addLink, deleteTask
    - Export `isValidUrl(url)` returning true iff `new URL(url)` parses and the scheme is accepted (`http`, `https`, plus recognized schemes such as `mailto`)
    - Export `resolveTheme(stored)` returning `'light'` or `'dark'` when stored, else `'light'` (default)
    - Export `addLink(links, newLink)` returning a new list with `newLink` appended, rejecting additions beyond the 12-entry cap (list unchanged at cap)
    - Export `deleteTask(tasks, id)` returning a new array without the task whose `id` matches (unchanged if absent)
    - _Requirements: 3.4, 4.1, 4.5, 7.4, 7.5_
  - [ ]* 5.2 Write property test for URL validation
    - **Property 7: URL validation accepts parseable accepted-scheme URLs and rejects the rest**
    - **Validates: Requirements 4.5**
    - Generator for malformed, empty, and valid URLs across schemes; assert `isValidUrl` accepts only parseable accepted-scheme URLs
  - [ ]* 5.3 Write property test for theme resolution default and identity
    - **Property 8: Theme resolution defaults to light and round-trips known values**
    - **Validates: Requirements 7.4, 7.5**
    - Generator including `null`, `undefined`, `''`, and arbitrary strings; assert default to `'light'` and identity for `'light'`/`'dark'`
  - [ ]* 5.4 Write property test for quick-link cap invariant
    - **Property 9: Quick-link list never exceeds 12 entries**
    - **Validates: Requirements 4.1**
    - Generator for link lists near and at the 12 limit; assert the result length never exceeds 12 and is unchanged when already at 12
  - [ ]* 5.5 Write property test for task deletion exactly-target removal
    - **Property 10: Deleting a task removes exactly the target and preserves the rest**
    - **Validates: Requirements 3.4**
    - Generator for task lists and ids (present and absent); assert length drops by 1 if present, by 0 if absent, and all other tasks are unchanged

- [ ] 6. Checkpoint - Ensure pure logic and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement the Storage wrapper (I/O layer)
  - [ ] 7.1 Implement the Storage wrapper
    - Implement `Storage.isAvailable()` probing LocalStorage with a `try/catch` `setItem`/`removeItem`, cached after first check
    - Implement `Storage.getJSON(key, fallback)` that `JSON.parse`s a key and returns `fallback` on missing/corrupt data or when unavailable
    - Implement `Storage.setJSON(key, value)` returning `{ ok, error? }`, wrapping `setItem` in `try/catch` and leaving in-memory state intact on quota/unavailable errors
    - Use the namespaced keys `todoDashboard.tasks`, `todoDashboard.links`, `todoDashboard.theme`
    - _Requirements: 3.5, 3.6, 4.3, 4.4, 7.3, 9.1, 9.3, 9.4_
  - [ ]* 7.2 Write property test for storage round-trip
    - **Property 11: Storage round-trip preserves all persisted data**
    - **Validates: Requirements 3.5, 3.6, 4.3, 4.4, 7.3, 9.1, 9.3**
    - Use a `localStorage` mock; generators for tasks, links, and theme; assert `getJSON(setJSON(...))` round-trips equal values and `getJSON` returns its fallback on missing/corrupt/unavailable

- [ ] 8. Build the dashboard HTML structure and CSS theming
  - [ ] 8.1 Create the dashboard HTML markup
    - Add a `#dashboard` root with sections: clock (time + greeting), focus timer (display + Start/Stop/Reset controls), todo (text input + Add button + sort control + task list), quick links (name/URL inputs + Add button + link list), a theme toggle, and a toast container
    - Ensure `index.html` links `css/style.css` and loads `js/app.js` as `type="module"`
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 7.1, 11.4, 11.5_
  - [ ] 8.2 Create CSS with light/dark theme variables and layout
    - Define CSS custom properties for light and dark themes keyed off `[data-theme]` on `<html>`
    - Set a base font size of at least 16px, section headings at least 4px larger than body text, and visible spacing between adjacent sections
    - Style completed tasks distinctly from incomplete tasks; style the timer, links, inputs, and toast
    - _Requirements: 3.3, 7.1, 7.2, 11.1, 11.3, 11.4, 11.5_

- [ ] 9. Implement DOM rendering and the FocusTimer (I/O layer)
  - [ ] 9.1 Implement the DOM render functions and toast
    - Implement `renderTime()`, `renderGreeting()`, `renderTasks()`, `renderLinks()`, `renderTheme()`, `renderTimer()`, each reading from an in-memory `state` object and updating only the DOM nodes it owns (per-interaction updates within the 200 ms target)
    - Implement a non-blocking toast helper for transient messages (duplicate warning, URL error, validation error, persistence failure)
    - _Requirements: 1.1, 1.2, 2.1, 3.3, 4.1, 6.1, 7.1, 7.2, 10.2_
  - [ ] 9.2 Implement the timestamp-based FocusTimer
    - Implement `Timer.start()`, `Timer.stop()`, `Timer.reset()` using `endTime = Date.now() + remainingMs` with `setInterval` ticks so the countdown stays accurate when the tab is backgrounded
    - On reaching zero: stop the countdown, trigger a visual highlight and a short audio beep via the Web Audio API, with the audio call guarded so a failure does not break the page
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 10. Implement the controller layer and initialization
  - [ ] 10.1 Wire controllers and the init/startup sequence
    - Wire add/edit/mark-done/delete task events through `validateTaskText` → `hasDuplicateTask` → `createTask` → `Storage.setJSON('tasks', …)` → `renderTasks`; reject invalid/duplicate input with a toast and leave the input text unchanged
    - Wire the sort control to `sortTasks` → `renderTasks`
    - Wire quick-link add/delete/edit and button click: validate the URL with `isValidUrl`, open valid URLs in a new tab via `window.open(url, '_blank')`, and show an error (no open) for invalid URLs; persist links via `Storage.setJSON('links', …)`
    - Wire the theme toggle through `resolveTheme` → `Storage.setJSON('theme', …)` → `renderTheme` (setting `data-theme` on `<html>`)
    - Implement `init()`: restore tasks, links, and theme from `Storage`, render everything, apply the theme, and start a clock interval that re-renders the time at least once per minute; render restored state to interactive within 2 seconds
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5, 9.3, 10.1, 10.2_

- [ ] 11. Checkpoint - Ensure app wiring works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Write integration and UI tests
  - [ ]* 12.1 Write timer control integration tests
    - With fake timers and mocked audio, assert Start counts down from the current remaining time, Stop pauses and freezes the display, Reset restores 25:00, and reaching zero fires the audio/visual notification
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [ ]* 12.2 Write persistence and init integration tests
    - Against a `localStorage` mock, assert each task mutation calls `setJSON('tasks', …)`, each link mutation calls `setJSON('links', …)`, and each theme toggle calls `setJSON('theme', …)`; assert `init` restores seeded tasks, links, and theme into the DOM; assert a quota-throwing `setItem` makes `setJSON` return `{ ok: false }`, shows an error toast, and retains in-memory state across further interactions
    - _Requirements: 3.5, 3.6, 4.3, 4.4, 7.3, 7.4, 9.3, 9.4_
  - [ ]* 12.3 Write UI flow unit tests
    - Assert add-task grows the list and clears the input; inline edit updates text; mark-done applies a distinct completed class/style; duplicate rejection retains the input text unchanged; a quick-link button opens `url` via mocked `window.open(url, '_blank')`; an invalid URL shows an error and does not call `window.open`; the theme toggle flips `data-theme` on `<html>`
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.5, 6.2, 7.1, 7.2_
  - [ ]* 12.4 Write smoke and structural tests
    - Assert exactly one `css/*.css` linked (in `css/`) and one production `js/*.js` loaded (in `js/`); base font size >= 16px; each section heading >= body font size + 4px; visible spacing between adjacent sections; and no `fetch`/`XMLHttpRequest`/`WebSocket`/`navigator.sendBeacon` present (client-side only)
    - _Requirements: 8.2, 9.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks; they are still part of the dependency graph but may be skipped for a faster MVP.
- Each implementation sub-task references specific requirement clauses for traceability; the 11 property tests map one-to-one to the design's correctness properties.
- The performance SLAs (Req 10.1 initial render within 2 s; Req 10.2 per-interaction within 200 ms) are met by design (no framework/build step, minimal single-node DOM updates in the render functions, timestamp-based timer) and are referenced in tasks 9.1 and 10.1 rather than a dedicated metrics-gathering task, since the workflow restricts performance metrics gathering.
- Cross-browser correctness (Req 8.1) relies on standards-based APIs (`Intl`, `URL`, `localStorage`, `crypto.randomUUID` with a `Math.random` fallback) and is not added as a manual task; automated structural tests (12.4) cover what is machine-verifiable.
- Checkpoints ensure incremental validation; ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "5.5", "7.1"] },
    { "id": 6, "tasks": ["7.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["10.1"] },
    { "id": 10, "tasks": ["12.1", "12.2", "12.3", "12.4"] }
  ]
}
```
