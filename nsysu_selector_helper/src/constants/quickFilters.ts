import type { FilterCondition } from '@/store/slices/uiSlice.ts';
import type { TranslationKey } from '@/types';

export const QUICK_FILTER: (FilterCondition & {
  labelKey: TranslationKey;
})[] = [
  {
    labelKey: 'systemQuickFilters.compulsory',
    field: 'compulsory',
    value: ['必修'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.elective',
    field: 'compulsory',
    value: ['選修'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.chineseTaught',
    field: 'english',
    value: ['中文授課'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.hasRemaining',
    field: 'remaining',
    value: ['大於0'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.liberalArts',
    field: 'department',
    value: ['博雅'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.physicalEducationRequired',
    field: 'name',
    value: ['運動與健康：初級游泳', '運動與健康：體適能'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.chineseThinkingRequired',
    field: 'department',
    value: ['中文思辨與表達'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.englishIntermediateHigh',
    field: 'department',
    value: ['英文中高級'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.grade1',
    field: 'grade',
    value: ['1'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.grade2',
    field: 'grade',
    value: ['2'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.grade3',
    field: 'grade',
    value: ['3'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.grade4',
    field: 'grade',
    value: ['4'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.gradeAll',
    field: 'grade',
    value: ['0'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.favorite',
    field: 'labels',
    value: ['favorite'],
    type: 'include',
  },
  {
    labelKey: 'systemQuickFilters.candidate',
    field: 'labels',
    value: ['candidate'],
    type: 'include',
  },
];
