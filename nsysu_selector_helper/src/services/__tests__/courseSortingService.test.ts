import { describe, it, expect, beforeEach } from '@jest/globals';
import { CourseSortingService, SortConfig } from '@/services';
import type { Course } from '@/types';

// Mock課程資料
const mockCourses: Course[] = [
  {
    id: 'CS101',
    name: '計算機概論',
    teacher: '張三',
    department: '資工系',
    credit: '3',
    remaining: 10,
    restrict: 30,
    selected: 20,
    select: 20,
    grade: '1',
    yearSemester: '上',
    compulsory: true,
    multipleCompulsory: false,
    url: '',
    room: '',
    classTime: ['', '', '12', '', '', '', ''],
    description: '',
    tags: [],
    english: false,
  },
  {
    id: 'MATH201',
    name: '微積分',
    teacher: '李四',
    department: '數學系',
    credit: '4',
    remaining: 5,
    restrict: 25,
    selected: 20,
    select: 20,
    grade: '2',
    yearSemester: '上',
    compulsory: true,
    multipleCompulsory: false,
    url: '',
    room: '',
    classTime: ['', '34', '', '', '', '', ''],
    description: '',
    tags: [],
    english: false,
  },
  {
    id: 'ENG102',
    name: '英文',
    teacher: '王五',
    department: '外文系',
    credit: '2',
    remaining: 0,
    restrict: 20,
    selected: 20,
    select: 20,
    grade: '1',
    yearSemester: '上',
    compulsory: true,
    multipleCompulsory: false,
    url: '',
    room: '',
    classTime: ['', '', '', '56', '', '', ''],
    description: '',
    tags: [],
    english: true,
  },
  {
    id: 'PHY301',
    name: '物理學',
    teacher: '劉六',
    department: '物理系碩士班',
    credit: '3',
    remaining: 15,
    restrict: 20,
    selected: 5,
    select: 5,
    grade: '3',
    yearSemester: '上',
    compulsory: false,
    multipleCompulsory: false,
    url: '',
    room: '',
    classTime: ['', '', '', '', '78', '', ''],
    description: '',
    tags: [],
    english: false,
  },
];

describe('CourseSortingService', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
  });

  describe('sortCourses', () => {
    it('should return original order for default sorting', () => {
      const config: SortConfig = {
        rules: [{ option: 'default', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result).toEqual(mockCourses);
      expect(result).not.toBe(mockCourses); // 應該是新陣列
    });
    it('should sort by credit ascending', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('ENG102'); // 2學分
      // CS101和PHY301都是3學分，穩定排序保持原有順序
      expect(result[1].id).toBe('CS101'); // 3學分
      expect(result[2].id).toBe('PHY301'); // 3學分
      expect(result[3].id).toBe('MATH201'); // 4學分
    });

    it('should sort by credit descending', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'desc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('MATH201'); // 4學分
      // CS101和PHY301都是3學分，穩定排序保持原有順序
      expect(result[1].id).toBe('CS101'); // 3學分
      expect(result[2].id).toBe('PHY301'); // 3學分
      expect(result[3].id).toBe('ENG102'); // 2學分
    });
    it('should sort by remaining seats descending', () => {
      const config: SortConfig = {
        rules: [{ option: 'remaining', direction: 'desc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('PHY301'); // 15個剩餘名額
      expect(result[1].id).toBe('CS101'); // 10個剩餘名額
      expect(result[2].id).toBe('MATH201'); // 5個剩餘名額
      expect(result[3].id).toBe('ENG102'); // 0個剩餘名額
    });
    it('should sort by department name', () => {
      const config: SortConfig = {
        rules: [{ option: 'department', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);
      expect(result[0].department).toBe('外文系');
      expect(result[1].department).toBe('物理系碩士班');
      expect(result[2].department).toBe('資工系');
      expect(result[3].department).toBe('數學系');
    });
    it('should sort by probability (ascending: 超收→一般概率(低到高)→100%概率)', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // CS101: select=20, remaining=10, 概率 = 50% (分類2)
      // MATH201: select=20, remaining=5, 概率 = 25% (分類2)
      // ENG102: select=20, remaining=0, 概率 = 0% (分類1-超收)
      // PHY301: select=5, remaining=15, 概率 = 100% (分類3)
      // 升序：分類1(ENG102) -> 分類2(MATH201,CS101) -> 分類3(PHY301)
      // 分類2內按概率升序：MATH201(25%) -> CS101(50%)
      expect(result[0].id).toBe('ENG102'); // 0% 超收最前
      expect(result[1].id).toBe('MATH201'); // 25% 一般概率低的
      expect(result[2].id).toBe('CS101'); // 50% 一般概率高的
      expect(result[3].id).toBe('PHY301'); // 100% 最後
    });

    it('should sort by probability (descending: 100%概率→一般概率(高到低)→超收)', () => {
      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'desc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // 降序：分類3(PHY301) -> 分類2(CS101,MATH201) -> 分類1(ENG102)
      // 分類2內按概率降序：CS101(50%) -> MATH201(25%)
      expect(result[0].id).toBe('PHY301'); // 100% 最前
      expect(result[1].id).toBe('CS101'); // 50% 一般概率高的
      expect(result[2].id).toBe('MATH201'); // 25% 一般概率低的
      expect(result[3].id).toBe('ENG102'); // 0% 超收最後
    });
    it('should handle multi-level sorting', () => {
      const config: SortConfig = {
        rules: [
          { option: 'compulsory', direction: 'asc' }, // 必修優先
          { option: 'credit', direction: 'desc' }, // 學分高到低
        ],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // 先按必修排序：必修(CS101,MATH201,ENG102) -> 選修(PHY301)
      // 必修內按學分降序：MATH201(4) -> CS101(3) -> ENG102(2)
      expect(result[0].id).toBe('MATH201'); // 必修 4學分
      expect(result[1].id).toBe('CS101'); // 必修 3學分
      expect(result[2].id).toBe('ENG102'); // 必修 2學分
      expect(result[3].id).toBe('PHY301'); // 選修 3學分
    });
    it('should sort by course level', () => {
      const config: SortConfig = {
        rules: [{ option: 'courseLevel', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // 升序：大學部→碩士班→碩專→博士班
      // CS101(資工系), MATH201(數學系), ENG102(外文系) - 大學部(優先級1)
      // PHY301(物理系碩士班) - 碩士班(優先級2)
      const undergradCourses = result.filter(
        (course) => !course.department.includes('碩'),
      );
      const gradCourses = result.filter((course) =>
        course.department.includes('碩'),
      );

      expect(undergradCourses.length).toBe(3);
      expect(gradCourses.length).toBe(1);
      expect(gradCourses[0].id).toBe('PHY301');

      // 驗證大學部課程排在碩士班課程前面
      const phy301Index = result.findIndex((course) => course.id === 'PHY301');
      expect(phy301Index).toBe(3); // 應該是最後一個
    });

    it('should sort by compulsory status', () => {
      const config: SortConfig = {
        rules: [{ option: 'compulsory', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // 必修在前，選修在後
      expect(result[0].compulsory).toBe(true);
      expect(result[1].compulsory).toBe(true);
      expect(result[2].compulsory).toBe(true);
      expect(result[3].compulsory).toBe(false);
    });
    it('should sort by enrollment status', () => {
      const config: SortConfig = {
        rules: [{ option: 'enrollmentStatus', direction: 'asc' }],
      };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // 升序：有名額→候補→已滿→超收
      // CS101: remaining=10 > 0 (有名額，優先級1)
      // PHY301: remaining=15 > 0 (有名額，優先級1)
      // MATH201: remaining=5 > 0 (有名額，優先級1)
      // ENG102: remaining=0 (已滿，優先級3)
      // 有名額的課程會排在前面，已滿的在後面
      const hasSlots = result.filter((course) => course.remaining > 0);
      const fullCourses = result.filter((course) => course.remaining === 0);
      expect(hasSlots.length).toBe(3);
      expect(fullCourses.length).toBe(1);
      expect(fullCourses[0].id).toBe('ENG102');
    });

    it('should handle courses with 100% probability correctly', () => {
      // 添加一個100%選上的課程測試
      const coursesWithHighProb: Course[] = [
        ...mockCourses,
        {
          id: 'ART100',
          name: '藝術概論',
          teacher: '陳七',
          department: '藝術系',
          credit: '2',
          remaining: 50,
          restrict: 60,
          selected: 10,
          select: 5, // 很少人選，100%選上
          grade: '1',
          yearSemester: '上',
          compulsory: false,
          multipleCompulsory: false,
          url: '',
          room: '',
          classTime: ['', '', '', '', '', '12', ''],
          description: '',
          tags: [],
          english: false,
        },
      ];

      const config: SortConfig = {
        rules: [{ option: 'probability', direction: 'desc' }],
      };
      const result = CourseSortingService.sortCourses(
        coursesWithHighProb,
        config,
      );

      // ART100應該在最前面（100%概率）
      expect(result[0].id).toBe('ART100');
    });
  });

  describe('localStorage integration', () => {
    it('should save sort config to localStorage', () => {
      const config: SortConfig = {
        rules: [{ option: 'credit', direction: 'desc' }],
      };
      CourseSortingService.saveSortConfig(config);

      const saved = localStorage.getItem('NSYSUCourseSelector.sortConfig');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(config);
    });

    it('should load sort config from localStorage', () => {
      const config: SortConfig = {
        rules: [{ option: 'remaining', direction: 'asc' }],
      };
      localStorage.setItem(
        'NSYSUCourseSelector.sortConfig',
        JSON.stringify(config),
      );

      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual(config);
    });

    it('should return default config if localStorage is empty', () => {
      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual({
        rules: [{ option: 'default', direction: 'asc' }],
      });
    });

    it('should return default config if localStorage contains invalid data', () => {
      localStorage.setItem('NSYSUCourseSelector.sortConfig', 'invalid json');

      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual({
        rules: [{ option: 'default', direction: 'asc' }],
      });
    });
  });

  describe('utility methods', () => {
    it('should get sort option by key', () => {
      const option = CourseSortingService.getSortOption('credit');
      expect(option).toBeTruthy();
      expect(option?.label).toBe('學分數');
    });

    it('should return undefined for invalid sort option key', () => {
      const option = CourseSortingService.getSortOption('invalid');
      expect(option).toBeUndefined();
    });

    it('should toggle sort direction', () => {
      expect(CourseSortingService.toggleDirection('asc')).toBe('desc');
      expect(CourseSortingService.toggleDirection('desc')).toBe('asc');
    });

    it('should validate sort config', () => {
      expect(
        CourseSortingService.isValidSortConfig({
          rules: [{ option: 'credit', direction: 'asc' }],
        }),
      ).toBe(true);

      expect(
        CourseSortingService.isValidSortConfig({
          rules: [{ option: 'invalid', direction: 'asc' }],
        }),
      ).toBe(false);

      expect(
        CourseSortingService.isValidSortConfig({
          rules: [{ option: 'credit', direction: 'invalid' as any }],
        }),
      ).toBe(false);
    });
  });
});
