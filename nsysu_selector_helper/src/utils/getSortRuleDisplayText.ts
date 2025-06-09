import { type SortRule } from '@/services';
import { DEFAULT_SORT_OPTIONS } from '@/constants';

export const getSortRuleDisplayText = (rule: SortRule): string => {
  const option = DEFAULT_SORT_OPTIONS.find((opt) => opt.key === rule.option);
  const optionLabel = option?.label || rule.option;
  const directionLabel = rule.direction === 'asc' ? '升序' : '降序';

  if (rule.option === 'default') {
    return '預設排序';
  }

  return `${optionLabel} (${directionLabel})`;
};
