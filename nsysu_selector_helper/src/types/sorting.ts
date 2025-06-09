export type AvailableSortOptions =
  | 'default'
  | 'probability'
  | 'remaining'
  | 'available'
  | 'credit'
  | 'courseLevel'
  | 'compulsory';

export interface SortOption {
  key: AvailableSortOptions;
  label: string;
  description: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortRule {
  option: AvailableSortOptions;
  direction: SortDirection;
}

export interface SortConfig {
  rules: SortRule[];
}
