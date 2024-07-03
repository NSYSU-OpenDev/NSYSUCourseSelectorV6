import { useEffect, useState } from 'react';
import { theme, ThemeConfig } from 'antd';

type AlgorithmType = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';

export const useThemeConfig = (): [ThemeConfig, (config: Partial<ThemeConfig & { algorithm: AlgorithmType }>) => void] => {
  const [primaryColor, setPrimaryColor] = useState('rgb(0, 158, 150)');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('defaultAlgorithm');
  const [borderRadius, setBorderRadius] = useState(4);

  useEffect(() => {
    const fetchSettings = () => {
      const storedPrimaryColor = localStorage.getItem('primaryColor');
      const storedAlgorithm = localStorage.getItem('algorithm');
      const storedBorderRadius = localStorage.getItem('borderRadius');

      if (storedPrimaryColor) setPrimaryColor(storedPrimaryColor);
      if (storedAlgorithm) setAlgorithm(storedAlgorithm as AlgorithmType);
      if (storedBorderRadius) setBorderRadius(parseInt(storedBorderRadius, 10));
    };
    fetchSettings();
  }, []);

  const saveSettings = (config: Partial<ThemeConfig & { algorithm: AlgorithmType }>) => {
    if (config.token?.colorPrimary) {
      localStorage.setItem('primaryColor', config.token.colorPrimary);
      setPrimaryColor(config.token.colorPrimary);
    }
    if (config.algorithm) {
      localStorage.setItem('algorithm', config.algorithm);
      setAlgorithm(config.algorithm);
    }
    if (config.token?.borderRadius) {
      localStorage.setItem('borderRadius', config.token.borderRadius.toString());
      setBorderRadius(config.token.borderRadius);
    }
  };

  const themeConfig: ThemeConfig = {
    algorithm: theme[algorithm],
    token: {
      colorPrimary: primaryColor,
      borderRadius: borderRadius,
    },
  };

  return [themeConfig, saveSettings];
};
