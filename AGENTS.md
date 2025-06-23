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
export * from './useThemeConfig';
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
