import type { FilterCondition } from '@/store/slices/uiSlice.ts';

export const QUICK_FILTER: (FilterCondition & {
  label: string;
})[] = [
  { label: '必修', field: 'compulsory', value: ['必修'], type: 'include' },
  { label: '選修', field: 'compulsory', value: ['選修'], type: 'include' },
  { label: '中文授課', field: 'english', value: ['中文授課'], type: 'include' },
  {
    label: '有剩餘名額',
    field: 'remaining',
    value: ['大於0'],
    type: 'include',
  },
  { label: '博雅課', field: 'department', value: ['博雅'], type: 'include' },
  {
    label: '體育(必修)',
    field: 'name',
    value: ['運動與健康：初級游泳', '運動與健康：體適能'],
    type: 'include',
  },
  {
    label: '中文思辯與表達(必修)',
    field: 'department',
    value: ['中文思辨與表達'],
    type: 'include',
  },
  {
    label: '英文中高級',
    field: 'department',
    value: ['英文中高級'],
    type: 'include',
  },
  { label: '年級一', field: 'grade', value: ['1'], type: 'include' },
  { label: '年級二', field: 'grade', value: ['2'], type: 'include' },
  { label: '年級三', field: 'grade', value: ['3'], type: 'include' },
  { label: '年級四', field: 'grade', value: ['4'], type: 'include' },
  { label: '不分年級', field: 'grade', value: ['0'], type: 'include' },
  { label: '我的最愛', field: 'labels', value: ['favorite'], type: 'include' },
  {
    label: '候選中課程',
    field: 'labels',
    value: ['candidate'],
    type: 'include',
  },
];
