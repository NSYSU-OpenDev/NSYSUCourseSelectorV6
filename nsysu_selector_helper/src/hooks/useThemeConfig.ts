import { useMemo } from 'react';
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectTheme } from '@/store/selectors';
import {
  setPrimaryColor,
  setAlgorithms,
  setBorderRadius,
  type AlgorithmType,
} from '@/store/slices/themeSlice';

type FrontendTheme = {
  primaryColor?: string;
  algorithm?: AlgorithmType | AlgorithmType[];
  borderRadius?: number;
};

export const useThemeConfig = (): [
  ThemeConfig,
  (newTheme: FrontendTheme) => void,
] => {
  const dispatch = useAppDispatch();
  const themeState = useAppSelector(selectTheme);

  const setTheme = (newTheme: FrontendTheme) => {
    if (newTheme.primaryColor) {
      dispatch(setPrimaryColor(newTheme.primaryColor));
    }
    if (newTheme.algorithm !== undefined) {
      const algorithmArray = Array.isArray(newTheme.algorithm)
        ? newTheme.algorithm
        : [newTheme.algorithm];
      dispatch(setAlgorithms(algorithmArray));
    }
    if (newTheme.borderRadius !== undefined) {
      dispatch(setBorderRadius(newTheme.borderRadius));
    }
  };

  const themeConfig: ThemeConfig = useMemo(() => {
    const { primaryColor, algorithms, borderRadius } = themeState;

    if (algorithms.length === 1 && algorithms[0] === 'defaultAlgorithm') {
      return {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          borderRadius: borderRadius,
        },
      };
    }

    const algorithmFunctions = algorithms
      .filter((algo) => algo !== 'defaultAlgorithm')
      .map((algo) => theme[algo]);

    return {
      algorithm:
        algorithmFunctions.length > 0
          ? algorithmFunctions
          : theme.defaultAlgorithm,
      token: {
        colorPrimary: primaryColor,
        borderRadius: borderRadius,
      },
    };
  }, [themeState]);

  return [themeConfig, setTheme];
};
