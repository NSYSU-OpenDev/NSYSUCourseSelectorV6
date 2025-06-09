import type { FilterCondition, TimeSlotFilter } from '@/store/slices/uiSlice';

const FILTER_CONDITIONS_KEY = 'NSYSUCourseSelector.filterConditions';
const TIME_SLOT_FILTERS_KEY = 'NSYSUCourseSelector.timeSlotFilters';

export class FilterPersistenceService {
  static loadFilters(): {
    conditions: FilterCondition[];
    timeSlots: TimeSlotFilter[];
  } {
    return {
      conditions: this.loadFilterConditions(),
      timeSlots: this.loadTimeSlotFilters(),
    };
  }

  static saveFilters(
    conditions: FilterCondition[],
    timeSlots: TimeSlotFilter[],
  ): void {
    this.saveFilterConditions(conditions);
    this.saveTimeSlotFilters(timeSlots);
  }

  static loadFilterConditions(): FilterCondition[] {
    try {
      const stored = localStorage.getItem(FILTER_CONDITIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(this.isValidFilterCondition);
        }
      }
    } catch (error) {
      console.warn('Failed to load filter conditions:', error);
    }
    return [];
  }

  static saveFilterConditions(conditions: FilterCondition[]): void {
    try {
      localStorage.setItem(FILTER_CONDITIONS_KEY, JSON.stringify(conditions));
    } catch (error) {
      console.error('Failed to save filter conditions:', error);
    }
  }

  static loadTimeSlotFilters(): TimeSlotFilter[] {
    try {
      const stored = localStorage.getItem(TIME_SLOT_FILTERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(this.isValidTimeSlotFilter);
        }
      }
    } catch (error) {
      console.warn('Failed to load time slot filters:', error);
    }
    return [];
  }

  static saveTimeSlotFilters(filters: TimeSlotFilter[]): void {
    try {
      localStorage.setItem(TIME_SLOT_FILTERS_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save time slot filters:', error);
    }
  }

  private static isValidFilterCondition(
    condition: unknown,
  ): condition is FilterCondition {
    if (!condition || typeof condition !== 'object') return false;
    const obj = condition as Record<string, unknown>;
    return (
      typeof obj.field === 'string' &&
      (obj.type === 'include' || obj.type === 'exclude') &&
      (typeof obj.value === 'string' || Array.isArray(obj.value))
    );
  }

  private static isValidTimeSlotFilter(
    filter: unknown,
  ): filter is TimeSlotFilter {
    if (!filter || typeof filter !== 'object') return false;
    const obj = filter as Record<string, unknown>;
    return typeof obj.day === 'number' && typeof obj.timeSlot === 'string';
  }
}
