import type { CourseLabel } from '@/services';

export const DEFAULT_LABELS: CourseLabel[] = [
  {
    id: 'candidate',
    name: '候選中課程',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f',
    textColor: '#d48806',
  },
  {
    id: 'favorite',
    name: '我的最愛',
    bgColor: '#f0f5ff',
    borderColor: '#adc6ff',
    textColor: '#1890ff',
  },
];
