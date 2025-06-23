import { AliasToken } from 'antd/es/theme/interface';

/**
 * 主題模式類型定義
 */
export type ThemeMode = 'light' | 'dark';

/**
 * 雙色模式主題 token 配置類型
 */
export interface DualModeThemeTokens {
  light: Partial<AliasToken>;
  dark: Partial<AliasToken>;
}

/**
 * Ant Design 常用主題 token 的雙色模式配置
 * 提供亮色和暗色模式的完整 token 定義
 */
export const ANTD_THEME_TOKENS: DualModeThemeTokens = {
  light: {
    // 基礎顏色 - 配合主題色調
    colorPrimary: 'rgb(0, 158, 150)', // 淺綠色主色調
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: 'rgb(0, 158, 150)', // 使用主色調

    // 文字顏色
    colorText: '#000000d9',
    colorTextSecondary: '#00000073',
    colorTextTertiary: '#00000040',
    colorTextQuaternary: '#00000026',

    // 背景顏色
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgSpotlight: '#ffffff',
    colorBgMask: '#00000073',

    // 邊框顏色
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',

    // 分割線顏色
    colorSplit: '#f0f0f0',

    // 填充顏色
    colorFill: '#f5f5f5',
    colorFillSecondary: '#fafafa',
    colorFillTertiary: '#f5f5f5',
    colorFillQuaternary: '#fafafa',

    // 懸停狀態
    controlItemBgHover: '#f5f5f5',
    controlItemBgActive: '#e6f4ff',
    controlItemBgActiveHover: '#bae0ff',

    // 陰影
    boxShadow:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // 基礎顏色 - 配合主題色調
    colorPrimary: 'rgb(0, 180, 170)', // 稍微亮一點的綠色適合暗色模式
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
    colorInfo: 'rgb(0, 180, 170)', // 使用主色調

    // 文字顏色
    colorText: '#ffffffd9',
    colorTextSecondary: '#ffffff73',
    colorTextTertiary: '#ffffff40',
    colorTextQuaternary: '#ffffff26',

    // 背景顏色
    colorBgBase: '#000000',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorBgSpotlight: '#424242',
    colorBgMask: '#00000073',

    // 邊框顏色
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',

    // 分割線顏色
    colorSplit: '#303030',

    // 填充顏色
    colorFill: '#1f1f1f',
    colorFillSecondary: '#262626',
    colorFillTertiary: '#1f1f1f',
    colorFillQuaternary: '#262626',

    // 懸停狀態
    controlItemBgHover: '#1f1f1f',
    controlItemBgActive: '#111a2c',
    controlItemBgActiveHover: '#0f1419',

    // 陰影
    boxShadow:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary:
      '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
};
