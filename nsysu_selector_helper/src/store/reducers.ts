import { combineReducers } from '@reduxjs/toolkit';
import coursesSlice from './slices/coursesSlice';
import uiSlice from './slices/uiSlice';
import courseLabelsSlice from './slices/courseLabelsSlice';

export const rootReducer = combineReducers({
  courses: coursesSlice.reducer,
  ui: uiSlice.reducer,
  courseLabels: courseLabelsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
