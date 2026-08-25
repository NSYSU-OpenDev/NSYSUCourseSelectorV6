import type { AvailableSortOptions } from '@/services';
import type { TranslationKey } from '@/types';

type TFn = (key: TranslationKey, options?: Record<string, unknown>) => string;

const LABEL_KEYS: Record<AvailableSortOptions, TranslationKey> = {
  default: 'sort.options.default.label',
  probability: 'sort.options.probability.label',
  remaining: 'sort.options.remaining.label',
  available: 'sort.options.available.label',
  credit: 'sort.options.credit.label',
  courseLevel: 'sort.options.courseLevel.label',
  compulsory: 'sort.options.compulsory.label',
};

const DESCRIPTION_KEYS: Record<AvailableSortOptions, TranslationKey> = {
  default: 'sort.options.default.description',
  probability: 'sort.options.probability.description',
  remaining: 'sort.options.remaining.description',
  available: 'sort.options.available.description',
  credit: 'sort.options.credit.description',
  courseLevel: 'sort.options.courseLevel.description',
  compulsory: 'sort.options.compulsory.description',
};

export const getSortOptionLabel = (key: AvailableSortOptions, t: TFn): string =>
  t(LABEL_KEYS[key]);

export const getSortOptionDescription = (
  key: AvailableSortOptions,
  t: TFn,
): string => t(DESCRIPTION_KEYS[key]);
