import { combineReducers } from '@reduxjs/toolkit';
import coursesSlice from './slices/coursesSlice';
import uiSlice from './slices/uiSlice';

export const rootReducer = combineReducers({
  courses: coursesSlice.reducer,
  ui: uiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
