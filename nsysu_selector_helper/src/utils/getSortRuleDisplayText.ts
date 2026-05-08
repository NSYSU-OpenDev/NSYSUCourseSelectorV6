import { type SortRule } from '@/services';
import type { TranslationKey } from '@/types';
import { getSortOptionLabel } from './getSortOptionLabel';

type TFn = (key: TranslationKey, options?: Record<string, unknown>) => string;

export const getSortRuleDisplayText = (rule: SortRule, t: TFn): string => {
  if (rule.option === 'default') {
    return t('sort.defaultSort');
  }

  const optionLabel = getSortOptionLabel(rule.option, t);
  const directionLabel =
    rule.direction === 'asc' ? t('sort.ascending') : t('sort.descending');

  return `${optionLabel} (${directionLabel})`;
};
