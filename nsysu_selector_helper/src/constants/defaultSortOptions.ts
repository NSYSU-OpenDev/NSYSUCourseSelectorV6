// 預設排序選項
// `label` / `description` fields intentionally hold the sort key; consumers
// resolve them through `getSortOptionLabel` / `getSortOptionDescription`.
import { SortOption } from '@/services';

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { key: 'default', label: 'default', description: 'default' },
  { key: 'probability', label: 'probability', description: 'probability' },
  { key: 'remaining', label: 'remaining', description: 'remaining' },
  { key: 'available', label: 'available', description: 'available' },
  { key: 'credit', label: 'credit', description: 'credit' },
  { key: 'courseLevel', label: 'courseLevel', description: 'courseLevel' },
  { key: 'compulsory', label: 'compulsory', description: 'compulsory' },
];
