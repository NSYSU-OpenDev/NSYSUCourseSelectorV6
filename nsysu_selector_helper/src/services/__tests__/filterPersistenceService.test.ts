import { FilterPersistenceService } from '@/services';
import type { FilterCondition, TimeSlotFilter } from '@/store/slices/uiSlice';

// Mock localStorage
const storage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((k: string) => storage[k] || null),
    setItem: jest.fn((k: string, v: string) => {
      storage[k] = v;
    }),
    removeItem: jest.fn((k: string) => {
      delete storage[k];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    }),
  },
  writable: true,
});

describe('FilterPersistenceService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads empty arrays when no data stored', () => {
    const { conditions, timeSlots } = FilterPersistenceService.loadFilters();
    expect(conditions).toEqual([]);
    expect(timeSlots).toEqual([]);
  });

  it('saves and loads filters correctly', () => {
    const conditions: FilterCondition[] = [
      { field: 'teacher', type: 'include', value: '張三' },
    ];
    const slots: TimeSlotFilter[] = [{ day: 1, timeSlot: '3' }];

    FilterPersistenceService.saveFilters(conditions, slots);

    const loaded = FilterPersistenceService.loadFilters();
    expect(loaded.conditions).toEqual(conditions);
    expect(loaded.timeSlots).toEqual(slots);
  });
});

