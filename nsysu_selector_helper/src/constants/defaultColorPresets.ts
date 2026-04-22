// `nameKey` identifies the preset; display name is resolved via
// `labels.colors.<nameKey>` at render time.
export type ColorPresetKey =
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'cyan'
  | 'yellow'
  | 'pink';

export interface ColorPreset {
  nameKey: ColorPresetKey;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  {
    nameKey: 'blue',
    bgColor: '#f0f5ff',
    borderColor: '#adc6ff',
    textColor: '#1890ff',
  },
  {
    nameKey: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    textColor: '#52c41a',
  },
  {
    nameKey: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
    textColor: '#fa8c16',
  },
  {
    nameKey: 'red',
    bgColor: '#fff1f0',
    borderColor: '#ffccc7',
    textColor: '#f5222d',
  },
  {
    nameKey: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7',
    textColor: '#722ed1',
  },
  {
    nameKey: 'cyan',
    bgColor: '#e6fffb',
    borderColor: '#87e8de',
    textColor: '#13c2c2',
  },
  {
    nameKey: 'yellow',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f',
    textColor: '#d48806',
  },
  {
    nameKey: 'pink',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2',
    textColor: '#eb2f96',
  },
];
