import { CourseSortingService, type SortConfig } from '@/services';
import type { Course } from '@/types';

// Mock localStorage
const mockStorage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key: string) => mockStorage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
  },
  writable: true,
});

// Mock console methods
const mockConsoleWarn = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// 測試用的課程資料
const createMockCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'TEST001',
  url: 'http://example.com',
  multipleCompulsory: false,
  department: '資訊工程學系',
  grade: '1',
  class: 'A',
  name: '程式設計',
  credit: '3',
  yearSemester: '上',
  compulsory: true,
  restrict: 50,
  select: 30,
  selected: 30,
  remaining: 20,
  teacher: '張教授',
  room: '工學院123',
  classTime: ['', '12', '', '', '', '', ''],
  description: '程式設計基礎課程',
  tags: [],
  english: false,
  ...overrides,
});

describe('CourseSortingService', () => {
  beforeEach(() => {
    // 清空 localStorage mock
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('loadSortConfig', () => {
    it('should return default config when localStorage is empty', () => {
      const config = CourseSortingService.loadSortConfig();
      expect(config).toEqual({
        rules: [{ option: 'default', direction: 'asc' }],
      });
    });

    it('should load valid config from localStorage', () => {
      const validConfig: SortConfig = {
        rules: [
          { option: 'probability', direction: 'desc' },
          { option: 'credit', direction: 'asc' },
        ],
      };
      mockStorage['NSYSUCourseSelector.sortConfig'] =
        JSON.stringify(validConfig);

      const config = CourseSortingService.loadSortConfig();
      expect(config).toEqual(validConfig);
    });

    it('should return default config when localStorage contains invalid data', () => {
      mockStorage['NSYSUCourseSelector.sortConfig'] = 'invalid json';

      const config = CourseSortingService.loadSortConfig();
      expect(config).toEqual({
        rules: [{ option: 'default', direction: 'asc' }],
      });
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to load sort config:',
        expect.any(Error),
      );
    });

    it('should return default config when config structure is invalid', () => {
      const invalidConfig = {
        rules: [{ option: 'invalid', direction: 'asc' }],
      };
      mockStorage['NSYSUCourseSelector.sortConfig'] =
        JSON.stringify(invalidConfig);

      const config = CourseSortingService.loadSortConfig();
      expect(config).toEqual({
        rules: [{ option: 'default', direction: 'asc' }],
      });
    });
  });

  describe('saveSortConfig', () => {
    it('should save config to localStorage', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'desc' }],
      };

      CourseSortingService.saveSortConfig(config);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'NSYSUCourseSelector.sortConfig',
        JSON.stringify(config),
      );
    });

    it('should handle save errors gracefully', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'desc' }],
      };

      // Mock setItem to throw error
      (localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      expect(() => CourseSortingService.saveSortConfig(config)).not.toThrow();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to save sort config:',
        expect.any(Error),
      );
    });
  });

  describe('isValidSortConfig', () => {
    it('should validate correct config', () => {
      const validConfig: SortConfig = {
        rules: [
          { option: 'probability', direction: 'desc' },
          { option: 'credit', direction: 'asc' },
        ],
      };
      expect(CourseSortingService.isValidSortConfig(validConfig)).toBe(true);
    });

    it('should reject null/undefined', () => {
      expect(CourseSortingService.isValidSortConfig(null)).toBe(false);
      expect(CourseSortingService.isValidSortConfig(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(CourseSortingService.isValidSortConfig('string')).toBe(false);
      expect(CourseSortingService.isValidSortConfig(123)).toBe(false);
      expect(CourseSortingService.isValidSortConfig([])).toBe(false);
    });

    it('should reject config without rules array', () => {
      expect(CourseSortingService.isValidSortConfig({})).toBe(false);
      expect(
        CourseSortingService.isValidSortConfig({ rules: 'not array' }),
      ).toBe(false);
    });

    it('should reject config with empty rules array', () => {
      expect(CourseSortingService.isValidSortConfig({ rules: [] })).toBe(false);
    });

    it('should reject invalid rule structure', () => {
      const invalidConfigs = [
        { rules: [{ option: 'invalid', direction: 'asc' }] },
        { rules: [{ option: 'probability', direction: 'invalid' }] },
        { rules: [{ option: 'probability' }] },
        { rules: [{ direction: 'asc' }] },
        { rules: ['not object'] },
      ];

      invalidConfigs.forEach((config) => {
        expect(CourseSortingService.isValidSortConfig(config)).toBe(false);
      });
    });
  });

  describe('sortCourses', () => {
    let mockCourses: Course[];

    beforeEach(() => {
      mockCourses = [
        createMockCourse({
          id: 'COURSE1',
          name: '程式設計',
          credit: '3',
          remaining: 10,
          select: 5,
          compulsory: true,
          department: '資訊工程學系', // 大學部
        }),
        createMockCourse({
          id: 'COURSE2',
          name: '資料結構',
          credit: '2',
          remaining: -2,
          select: 25,
          compulsory: false,
          department: '資訊工程學系碩士班', // 碩士班
        }),
        createMockCourse({
          id: 'COURSE3',
          name: '演算法',
          credit: '4',
          remaining: 0,
          select: 20,
          compulsory: true,
          department: '資訊工程學系博士班', // 博士班
        }),
        createMockCourse({
          id: 'COURSE4',
          name: '軟體工程',
          credit: '2',
          remaining: 15,
          select: 10,
          compulsory: false,
          department: '資訊工程學系碩專班', // 碩專班
        }),
      ];
    });

    it('should return original order for default sort', () => {
      const config: SortConfig = {
        rules: [{ option: 'default', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE1',
        'COURSE2',
        'COURSE3',
        'COURSE4',
      ]);
      expect(sorted).not.toBe(mockCourses); // Should return new array
    });
    it('should sort by probability (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 預期順序：0% (COURSE2, COURSE3) -> 100% (COURSE1, COURSE4)
      // COURSE2: remaining=-2, probability=0
      // COURSE3: remaining=0, probability=0
      // COURSE4: remaining=15, select=10, probability=100 (limited by Math.min)
      // COURSE1: remaining=10, select=5, probability=100 (limited by Math.min)
      // 由於 COURSE1 和 COURSE4 概率相同，順序會保持穩定
      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE2',
        'COURSE3',
        'COURSE1',
        'COURSE4',
      ]);
    });
    it('should sort by probability (descending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'desc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 降序：100% -> 100% -> 0% -> 0%
      // 相同概率的課程會保持原始順序
      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE1',
        'COURSE4',
        'COURSE2',
        'COURSE3',
      ]);
    });

    it('should sort by credit (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 學分升序：2學分 -> 3學分 -> 4學分
      const sortedCredits = sorted.map((c) => parseInt(c.credit));
      expect(sortedCredits).toEqual([2, 2, 3, 4]);
    });

    it('should sort by credit (descending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'desc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 學分降序：4學分 -> 3學分 -> 2學分
      const sortedCredits = sorted.map((c) => parseInt(c.credit));
      expect(sortedCredits).toEqual([4, 3, 2, 2]);
    });

    it('should sort by remaining (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'remaining', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 剩餘名額升序：-2 -> 0 -> 10 -> 15
      const sortedRemaining = sorted.map((c) => c.remaining);
      expect(sortedRemaining).toEqual([-2, 0, 10, 15]);
    });

    it('should sort by available (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'available', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 可選名額 = remaining - select
      // COURSE2: -2 - 25 = -27
      // COURSE3: 0 - 20 = -20
      // COURSE1: 10 - 5 = 5
      // COURSE4: 15 - 10 = 5
      const availables = sorted.map((c) => c.remaining - c.select);
      expect(availables).toEqual([-27, -20, 5, 5]);
    });

    it('should sort by course level (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'courseLevel', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 課程等級升序：大學部 -> 碩士班 -> 碩專班 -> 博士班
      const departments = sorted.map((c) => c.department);
      expect(departments).toEqual([
        '資訊工程學系', // 大學部
        '資訊工程學系碩士班', // 碩士班
        '資訊工程學系碩專班', // 碩專班
        '資訊工程學系博士班', // 博士班
      ]);
    });

    it('should sort by compulsory (ascending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'compulsory', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);
      // 必修優先升序：必修課程在前
      const compulsoryCount = sorted.filter((c) => c.compulsory).length;

      // 檢查前面都是必修，後面都是選修
      expect(sorted.slice(0, compulsoryCount).every((c) => c.compulsory)).toBe(
        true,
      );
      expect(sorted.slice(compulsoryCount).every((c) => !c.compulsory)).toBe(
        true,
      );
    });

    it('should sort by compulsory (descending)', () => {
      const config: SortConfig = {
        rules: [{ option: 'compulsory', direction: 'desc' }],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 必修優先降序：選修課程在前
      const electiveCount = sorted.filter((c) => !c.compulsory).length;

      // 檢查前面都是選修，後面都是必修
      expect(sorted.slice(0, electiveCount).every((c) => !c.compulsory)).toBe(
        true,
      );
      expect(sorted.slice(electiveCount).every((c) => c.compulsory)).toBe(true);
    });

    it('should handle multiple sort rules', () => {
      // 先按學分升序，再按剩餘名額降序
      const config: SortConfig = {
        rules: [
          { option: 'credit', direction: 'asc' },
          { option: 'remaining', direction: 'desc' },
        ],
      };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      // 先按學分分組，同學分內按剩餘名額降序
      // 2學分組：COURSE4(15) -> COURSE2(-2)
      // 3學分組：COURSE1(10)
      // 4學分組：COURSE3(0)
      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE4',
        'COURSE2',
        'COURSE1',
        'COURSE3',
      ]);
    });

    it('should handle empty rules array', () => {
      const config: SortConfig = { rules: [] };
      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE1',
        'COURSE2',
        'COURSE3',
        'COURSE4',
      ]);
    });

    it('should not mutate original array', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'desc' }],
      };
      const originalOrder = mockCourses.map((c) => c.id);

      const sorted = CourseSortingService.sortCourses(mockCourses, config);

      expect(mockCourses.map((c) => c.id)).toEqual(originalOrder);
      expect(sorted).not.toBe(mockCourses);
    });

    it('should handle unknown sort option gracefully', () => {
      // 使用類型斷言來測試未知的排序選項
      const config = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rules: [{ option: 'unknown' as any, direction: 'asc' as const }],
      };

      const sorted = CourseSortingService.sortCourses(mockCourses, config);
      expect(sorted.map((c) => c.id)).toEqual([
        'COURSE1',
        'COURSE2',
        'COURSE3',
        'COURSE4',
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty course array', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses([], config);

      expect(sorted).toEqual([]);
    });

    it('should handle single course', () => {
      const singleCourse = [createMockCourse()];
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(singleCourse, config);

      expect(sorted).toHaveLength(1);
      expect(sorted[0]).toEqual(singleCourse[0]);
    });

    it('should handle courses with identical sort values', () => {
      const identicalCourses = [
        createMockCourse({ id: 'SAME1', credit: '3', remaining: 10 }),
        createMockCourse({ id: 'SAME2', credit: '3', remaining: 10 }),
        createMockCourse({ id: 'SAME3', credit: '3', remaining: 10 }),
      ];

      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'asc' }],
      };
      const sorted = CourseSortingService.sortCourses(identicalCourses, config);

      expect(sorted).toHaveLength(3);
      // 順序應該保持穩定
      expect(sorted.map((c) => c.id)).toEqual(['SAME1', 'SAME2', 'SAME3']);
    });
  });
});
