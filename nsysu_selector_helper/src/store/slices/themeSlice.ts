import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ThemeState {
  isDarkMode: boolean;
  borderRadius: number;
}

const initialState: ThemeState = {
  isDarkMode: false,
  borderRadius: 4,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      localStorage.setItem(
        'NSYSUCourseSelector.isDarkMode',
        action.payload.toString(),
      );
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload;
      localStorage.setItem(
        'NSYSUCourseSelector.borderRadius',
        action.payload.toString(),
      );
    },
    loadThemeFromStorage: (state) => {
      try {
        const storedDarkMode = localStorage.getItem(
          'NSYSUCourseSelector.isDarkMode',
        );
        if (storedDarkMode) {
          state.isDarkMode = storedDarkMode === 'true';
        }

        const storedBorderRadius = localStorage.getItem(
          'NSYSUCourseSelector.borderRadius',
        );
        if (storedBorderRadius) {
          state.borderRadius = parseInt(storedBorderRadius, 10);
        }

        // 向後兼容：從舊的 algorithms 設定中載入暗色模式
        const storedAlgorithms = localStorage.getItem(
          'NSYSUCourseSelector.algorithms',
        );
        if (storedAlgorithms && !storedDarkMode) {
          try {
            const parsedAlgorithms = JSON.parse(storedAlgorithms);
            if (Array.isArray(parsedAlgorithms)) {
              state.isDarkMode = parsedAlgorithms.includes('darkAlgorithm');
            }
          } catch {
            // 忽略解析錯誤
          }
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    },
    resetTheme: (state) => {
      state.isDarkMode = initialState.isDarkMode;
      state.borderRadius = initialState.borderRadius;

      // 清除 localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.isDarkMode',
        initialState.isDarkMode.toString(),
      );
      localStorage.setItem(
        'NSYSUCourseSelector.borderRadius',
        initialState.borderRadius.toString(),
      );

      // 清除舊的設定
      localStorage.removeItem('NSYSUCourseSelector.primaryColor');
      localStorage.removeItem('NSYSUCourseSelector.algorithms');
      localStorage.removeItem('NSYSUCourseSelector.algorithm');
    },
  },
});

export const {
  setDarkMode,
  setBorderRadius,
  loadThemeFromStorage,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
