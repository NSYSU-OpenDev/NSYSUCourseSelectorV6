# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development guide

The day-to-day conventions for this repo live in @AGENTS.md — yarn only, always work inside `nsysu_selector_helper/`, Traditional Chinese code comments, `@`/`#` path aliases, `NSYSUCourseSelector.` localStorage prefix, and the i18n rules. Read those first — including its **Git Workflow** section, which governs when work needs a branch. This file only adds the big-picture context and the commands not covered there.

## Additional commands

All from `nsysu_selector_helper/`:

```powershell
yarn lint                 # eslint, --max-warnings 0 (prettier runs as an eslint rule)
yarn format               # prettier --write .
yarn tsc -b --noEmit      # type check only; `yarn build` runs `tsc -b` then vite build
yarn test courseService   # jest pattern match on the test file path
yarn test:coverage
```

CI ([ci.yaml](.github/workflows/ci.yaml)) gates PRs touching `nsysu_selector_helper/**` with type check → tests (with coverage) → build. Pushes to `main` under the same path auto-deploy to GitHub Pages ([deploy.yaml](.github/workflows/deploy.yaml)).

## Architecture

### There is no backend

[NSYSUCourseAPI.ts](nsysu_selector_helper/src/api/NSYSUCourseAPI.ts) fetches static JSON off GitHub Pages (`https://nsysu-opendev.github.io/NSYSUCourseAPI`) in three hops: `version.json` (academic years) → `{year}/version.json` (update timestamps) → `{year}/{updateTime}/all.json` (every course of that snapshot). The whole semester is then held in memory, so **all** searching, filtering, sorting, conflict detection and export happen client-side over one `Course[]`. That is why the course list is virtualized (react-virtuoso) and why services are written as pure transforms over `Course[]`.

### Layering

`api/` → `services/` → `store/` → `components/`. Services are static-method classes (`CourseService`, `AdvancedFilterService`, `CourseSortingService`, …) holding the business logic, and they are the layer that carries unit tests. Keep filtering/sorting/conflict/export logic out of components and out of reducers — put it in a service and test it in `services/__tests__/`.

### Redux slices

Four slices in [reducers.ts](nsysu_selector_helper/src/store/reducers.ts): `courses` (course data, `selectedCourses`, per-course export config, and the `fetchAvailableSemesters` / `fetchCourses` thunks), `ui` (search query, filter conditions, time-slot filters, sort config, department-panel filters, panel/hover state), `courseLabels` (user-defined labels and the course↔label map), `theme` (dark mode, border radius → antd `ConfigProvider` tokens).

Import actions and selectors from `@/store` — [store/index.ts](nsysu_selector_helper/src/store/index.ts) re-exports everything, and reaching into slice files directly is not the convention here. Note `store.ts` exempts `courses/selectCourse` and `courses.selectedCourses` from the serializable check.

### Persistence is inline, not middleware

Despite the folder listing in AGENTS.md, there is no `store/middlewares/` and no persistence middleware. State is persisted at two different levels, and new state should follow whichever level it already lives in:

- **Service level** — a module-scope `STORAGE_KEY` plus `load`/`save` statics (`courseLabelService`, `courseSortingService`, `customQuickFiltersService`, `filterPersistenceService`, `departmentCourseService`).
- **Reducer level** — `localStorage.setItem` called directly inside reducers (`coursesSlice`, `themeSlice`, `uiSlice`).

Always wrap reads in `try/catch` with a safe default: stored JSON may be stale or malformed from an earlier release.

### Two layouts mounted at once

[App.tsx](nsysu_selector_helper/src/App.tsx) renders a desktop `Splitter` layout *and* a mobile `Collapse` layout simultaneously; only CSS (`@media screen and (max-width: 768px)` in styled-components) decides which is visible. Any change to the schedule or selector panel has to be verified in both, and both are always in the React tree.

### Type-safe i18n

`TranslationKey` is derived structurally from `zh-TW/translation.json` ([i18n.d.ts](nsysu_selector_helper/src/types/i18n.d.ts)), so `t()` only accepts keys that exist in the Traditional Chinese file. A key missing from `zh-TW` is a *compile* error, not a runtime fallback — add it there first. `en/translation.json` is an in-progress translation and is not the type source.

### Theming travels by context, so anything outside the tree loses it

[App.tsx](nsysu_selector_helper/src/App.tsx) wraps everything in antd's `ConfigProvider`, fed by `themeSlice` (dark mode, border radius). Rendering *outside* that tree silently drops the theme, and antd's static `message`/`notification`/`Modal` helpers do exactly that — they mount their own root, so they always render light. AGENTS.md requires their hook forms instead; the failure is invisible in light mode, which is why it keeps getting reintroduced.

Inside components, read tokens with `theme.useToken()` (see `SectionHeader`, `HelpModal`) rather than hardcoding hex. Fixed hex is only correct for values that are *meant* to ignore the theme — the probability-bar status colours in `ScheduleTable`, for instance.

`scheduleExportService` is the deliberate exception: it paints to a canvas with no React tree at all, so it takes `isDark` as an argument and branches on it explicitly.

### GitHub Pages base path

Vite `base` is `/NSYSUCourseSelectorV6/`. Runtime asset paths must go through Vite imports or `import.meta.env.BASE_URL` (see `AnnouncementService.getFullPath`); hardcoded `/`-rooted URLs break in production.

### The release version is duplicated six times

There is no single source of truth for the version. `package.json` holds it without a `v` prefix; `public/announcements.json`, `public/announcements_en.json` and both `translation.json` files hold it with one; [CHANGELOG.md](CHANGELOG.md) carries the developer-facing history. Nothing cross-checks them and nothing fails when they drift — the app just shows a stale release note. AGENTS.md has the checklist that finishing a branch is expected to run through.

The announcement files are what `AnnouncementService` fetches at runtime (`/announcements.json` or `/announcements_en.json` via `getFullPath`), so the newest entry there is what users actually read in the app — CHANGELOG.md is not. `dist/` holds built copies; never hand-edit those.

### Testing notes

Jest + ts-jest + jsdom; `@/` and `#/` aliases are re-declared in [jest.config.ts](nsysu_selector_helper/jest.config.ts). [setupTests.ts](nsysu_selector_helper/src/setupTests.ts) mocks `AnnouncementService` wholesale because it uses `import.meta.env`, which ts-jest cannot transform — any new module reading `import.meta` needs the same treatment or it will break the suite.
