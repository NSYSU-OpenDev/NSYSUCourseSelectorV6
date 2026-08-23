# NSYSU Course Selector V6 - Development Guide

## Key Information

Frontend code is located in `nsysu_selector_helper/` directory. **Must use yarn**.

### Development Commands
```powershell
cd NSYSUCourseSelectorV6/nsysu_selector_helper
yarn
yarn dev
yarn build
yarn test
```

## Tech Stack

React 18.3.1 + TypeScript 5.8.3 + Redux Toolkit + Ant Design 5 + Vite

## Project Structure Overview

```
nsysu_selector_helper/src/
├── components/          # UI components
│   ├── Common/         # Shared components
│   ├── ScheduleTable/  # Schedule-related components
│   └── SelectorPanel/  # Course selector components
├── store/              # Redux state management
│   ├── slices/         # Redux slices (courses, ui)
│   └── middlewares/    # Custom middlewares
├── services/           # Business logic services
│   └── __tests__/      # Service unit tests
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── api/                # API interfaces
└── i18n/               # Internationalization
```

## Git Workflow

### Branch Policy

| Change | Where |
| --- | --- |
| **Feature or bug fix** — anything under `nsysu_selector_helper/src/` | **Feature branch + pull request.** Never commit directly to `main`. |
| Dependency bumps, build/CI config | Feature branch + pull request |
| Docs only — `README.md`, `CHANGELOG.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` | May be committed directly to `main` |

CI (`.github/workflows/ci.yaml`) only runs on pull requests touching `nsysu_selector_helper/**`. Committing a feature or fix straight to `main` therefore skips the type check, tests and build entirely — and `main` auto-deploys to GitHub Pages, so a broken direct commit ships to users. That is the reason for the rule, not ceremony.

### Branch Naming

`<type>/<kebab-summary>`, reusing the same type vocabulary as commit subjects:

```powershell
git switch -c feat/course-review-panel
git switch -c fix/drag-selection-trigger
git switch -c i18n/filter-options
git switch -c ui-ux/improve-button-interaction
```

### Commit Messages

Conventional Commits **with a scope** — `<type>(<scope>): <description>`:

```
feat(schedule): add drag selection for time slots
fix(filter): correct the time slot toggle condition
i18n(sort-panel): translate sort rule labels
perf(course-list): reduce per-row work on scroll
docs(agents): document the branch policy
build(deps): bump ws
```

- **Types**: `feat`, `fix`, `docs`, `i18n`, `perf`, `style`, `refactor`, `test`, `build`, `ci`
- **Scopes**: the affected area — `schedule`, `selector`, `filter`, `sort`, `labels`, `export`, `theme`, `store`, `services`, `api`, `deps`, `ci`. Drop the scope only when a change genuinely spans the whole app.

### Finishing a Branch: Version and Changelog

Anything user-facing — a feature, a fix someone would notice, a visible
behaviour change — bumps the version and gets a changelog entry **before the
pull request goes up**. `main` auto-deploys, so a merge without this ships a
build whose in-app announcement still describes the previous release.

The version lives in six places and they must agree. Missing one is the usual
failure, because nothing validates them against each other:

| File | Form |
| --- | --- |
| `nsysu_selector_helper/package.json` | `"version": "6.3.0"` |
| `nsysu_selector_helper/public/announcements.json` | new `v6.3.0` entry, newest first |
| `nsysu_selector_helper/public/announcements_en.json` | same entry, translated |
| `nsysu_selector_helper/src/i18n/locales/zh-TW/translation.json` | `"version": "v6.3.0"` |
| `nsysu_selector_helper/src/i18n/locales/en/translation.json` | `"version": "v6.3.0"` |
| `CHANGELOG.md` | new section at the top, newest first |

Note the two shapes: `package.json` has no `v` prefix, everything else does.

Pick the bump from the commits on the branch — any `feat:` makes it a minor,
otherwise a patch. Write the announcement for students, not for developers:
say what changed on screen, not which component was refactored. Keep the
`updates` prefixes already in use (`新增:` / `優化:` / `修正:`).

`nsysu_selector_helper/dist/` also contains announcement files. That is build
output — never edit it by hand.

### Before Opening a Pull Request

Run the same gates CI will, from `nsysu_selector_helper/`:

```powershell
yarn lint; yarn tsc -b --noEmit; yarn test; yarn build
```

## Development Standards

### State Management
- Redux Toolkit: `courses`, `ui`, `courseLabels` slices
- Use `useAppDispatch`, `useAppSelector`
- Selectors in `store/selectors.ts`

### Path Aliases
```typescript
// tsconfig.app.json configuration
"paths": {
  "#": ["./src/components"],    // Components
  "#/*": ["./src/components/*"],
  "@": ["./src"],              // Root directory
  "@/*": ["./src/*"]
}
```

Import conventions:
- Components: `import Component from '#/Component'`
- Others: `import { hook } from '@/hooks'`
- Unified from index: `import { serviceA, serviceB } from '@/services'`

### Index Exports
Each directory should have `index.ts` for unified exports:
```typescript
// hooks/index.ts
export * from './useWindowSize';

// services/index.ts
export * from './courseService';
export * from './filterService';
```

### LocalStorage Naming Convention
All localStorage keys must use the `NSYSUCourseSelector.` prefix to avoid conflicts on GitHub Pages:

```typescript
// Correct naming convention
const STORAGE_KEY = 'NSYSUCourseSelector.customQuickFilters';
localStorage.setItem('NSYSUCourseSelector.selectedCourses', JSON.stringify(courses));
```

### Internationalization (i18n)
Uses type-safe translation system with Traditional Chinese (zh-TW) as default verification language.

```typescript
// Usage in components
import { useTranslation } from '@/hooks';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('common.title')}</h1>;
};
```

**Important**: Always add new translation keys to `zh-TW.json` first for type safety.

### Ant Design Feedback APIs (message / notification / Modal)

**Never call the static helpers** — `message.success()`, `notification.open()`,
`Modal.confirm()`. They mount their own React root *outside* `ConfigProvider`,
so they cannot read the theme context and always paint with default light
tokens. In dark mode they come out wrong.

Use the hook form and render the returned `contextHolder`:

```tsx
const [messageApi, contextHolder] = message.useMessage();
const [notificationApi, notificationContextHolder] =
  notification.useNotification();
const [modalApi, modalContextHolder] = Modal.useModal();

return (
  <>
    {contextHolder}
    {notificationContextHolder}
    {modalContextHolder}
    {/* ... */}
  </>
);
```

Two traps:

- **Forgetting `contextHolder` fails silently.** The api call still resolves and
  nothing appears — no warning, no error.
- **Never put a holder in a list row.** `CoursesList/Item` is a react-virtuoso
  `itemContent`, so a holder there would instantiate one message system per
  visible row. Hoist the api up to the list component and pass it down.

Existing examples to copy: `CustomFilterModal`, `CustomQuickFilters`,
`DepartmentCourses` (message + modal), `SelectedExport`, `Settings`.

### Code Comments
- **All code comments must be in Traditional Chinese (繁體中文)**
- Function documentation, inline comments, and TODO comments should use Traditional Chinese
- Example:
```typescript
/**
 * 取得課程的機率值
 * @param course 課程資料
 * @returns 機率值 (0-1)
 */
const getProbability = (course: Course): number => {
  // 計算基礎機率
  const baseProbability = course.enrolled / course.capacity;
  
  // 考慮特殊情況調整
  if (course.isRequired) {
    return Math.min(baseProbability * 1.2, 1); // 必修課程提高機率
  }
  
  return baseProbability;
};
```

### Testing
- Test files located in `services/__tests__/`
- Run tests: `yarn test`
- Services layer must have unit tests

## Common Issues

### Wrong Approach
```powershell
# Running npm in root directory (incorrect)
cd NSYSUCourseSelectorV6
npm install    # Error
npm start      # Error
```

### Correct Approach
```powershell
# Enter subdirectory and use yarn
cd NSYSUCourseSelectorV6/nsysu_selector_helper
yarn           # Correct
yarn dev       # Correct
```

### Development Environment Check
```powershell
# Check if in correct directory
pwd
# Should show: ...\NSYSUCourseSelectorV6\nsysu_selector_helper

# Check if package.json exists
ls package.json

# Check yarn version
yarn --version
```

**PowerShell Note**: When running multiple commands, use `;` instead of `&&`:
```powershell
# Correct for PowerShell
cd NSYSUCourseSelectorV6/nsysu_selector_helper; yarn; yarn dev

# Incorrect (bash syntax)
cd NSYSUCourseSelectorV6/nsysu_selector_helper && yarn && yarn dev
```

## Testing Guide

### Run Tests
```powershell
# In nsysu_selector_helper/ directory
yarn test                   # Run all tests
yarn test --watch           # Watch mode
yarn test courseService     # Run specific test
```

### Test Structure
- Test files: `src/services/__tests__/*.test.ts`
- Main tests: Business logic services layer
- Test tools: Jest + Testing Library

## Quick Start Checklist

- [ ] Confirm in `nsysu_selector_helper/` directory
- [ ] Use `yarn` not `npm`
- [ ] Run `yarn dev` to start dev server
- [ ] Browser opens `http://localhost:5173`
- [ ] Redux DevTools works properly

---

**Remember: Always use yarn, always work in nsysu_selector_helper/ directory**
