import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 Set 對象的序列化檢查，因為我們會在 selectedCourses 中使用 Set
        ignoredActions: ['courses/selectCourse', 'courses/loadSelectedCourses'],
        ignoredPaths: ['courses.selectedCourses'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
