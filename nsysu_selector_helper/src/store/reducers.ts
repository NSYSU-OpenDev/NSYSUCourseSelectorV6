import { combineReducers } from '@reduxjs/toolkit';
import coursesSlice from './slices/coursesSlice';
import uiSlice from './slices/uiSlice';
import courseLabelsSlice from './slices/courseLabelsSlice';
import themeSlice from './slices/themeSlice';

export const rootReducer = combineReducers({
  courses: coursesSlice.reducer,
  ui: uiSlice.reducer,
  courseLabels: courseLabelsSlice.reducer,
  theme: themeSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
