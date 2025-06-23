import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AlgorithmType =
  | 'defaultAlgorithm'
  | 'darkAlgorithm'
  | 'compactAlgorithm';

export interface ThemeState {
  primaryColor: string;
  algorithms: AlgorithmType[];
  borderRadius: number;
}

const initialState: ThemeState = {
  primaryColor: 'rgb(0, 158, 150)',
  algorithms: ['defaultAlgorithm'],
  borderRadius: 4,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
      localStorage.setItem('NSYSUCourseSelector.primaryColor', action.payload);
    },
    setAlgorithms: (state, action: PayloadAction<AlgorithmType[]>) => {
      state.algorithms = action.payload;
      localStorage.setItem(
        'NSYSUCourseSelector.algorithms',
        JSON.stringify(action.payload),
      );
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload;
      localStorage.setItem(
        'NSYSUCourseSelector.borderRadius',
        action.payload.toString(),
      );
    },
    setFullTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      if (action.payload.primaryColor !== undefined) {
        state.primaryColor = action.payload.primaryColor;
        localStorage.setItem(
          'NSYSUCourseSelector.primaryColor',
          action.payload.primaryColor,
        );
      }
      if (action.payload.algorithms !== undefined) {
        state.algorithms = action.payload.algorithms;
        localStorage.setItem(
          'NSYSUCourseSelector.algorithms',
          JSON.stringify(action.payload.algorithms),
        );
      }
      if (action.payload.borderRadius !== undefined) {
        state.borderRadius = action.payload.borderRadius;
        localStorage.setItem(
          'NSYSUCourseSelector.borderRadius',
          action.payload.borderRadius.toString(),
        );
      }
    },
    loadThemeFromStorage: (state) => {
      try {
        const storedPrimaryColor = localStorage.getItem(
          'NSYSUCourseSelector.primaryColor',
        );
        if (storedPrimaryColor) {
          state.primaryColor = storedPrimaryColor;
        }

        const storedAlgorithms = localStorage.getItem(
          'NSYSUCourseSelector.algorithms',
        );
        if (storedAlgorithms) {
          try {
            const parsedAlgorithms = JSON.parse(
              storedAlgorithms,
            ) as AlgorithmType[];
            state.algorithms = parsedAlgorithms;
          } catch {
            // 兼容舊的單一算法格式
            const storedAlgorithm = localStorage.getItem(
              'NSYSUCourseSelector.algorithm',
            );
            if (storedAlgorithm) {
              state.algorithms = [storedAlgorithm as AlgorithmType];
            }
          }
        }

        const storedBorderRadius = localStorage.getItem(
          'NSYSUCourseSelector.borderRadius',
        );
        if (storedBorderRadius) {
          state.borderRadius = parseInt(storedBorderRadius, 10);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    },
    resetTheme: (state) => {
      state.primaryColor = initialState.primaryColor;
      state.algorithms = initialState.algorithms;
      state.borderRadius = initialState.borderRadius;

      // 清除 localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.primaryColor',
        initialState.primaryColor,
      );
      localStorage.setItem(
        'NSYSUCourseSelector.algorithms',
        JSON.stringify(initialState.algorithms),
      );
      localStorage.setItem(
        'NSYSUCourseSelector.borderRadius',
        initialState.borderRadius.toString(),
      );
    },
  },
});

export const {
  setPrimaryColor,
  setAlgorithms,
  setBorderRadius,
  setFullTheme,
  loadThemeFromStorage,
  resetTheme,
} = themeSlice.actions;

export default themeSlice.reducer;
