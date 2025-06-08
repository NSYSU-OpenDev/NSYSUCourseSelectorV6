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
];

describe('CourseSortingService', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
  });

  describe('sortCourses', () => {
    it('should return original order for default sorting', () => {
      const config: SortConfig = { option: 'default', direction: 'asc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result).toEqual(mockCourses);
      expect(result).not.toBe(mockCourses); // 應該是新陣列
    });

    it('should sort by credit ascending', () => {
      const config: SortConfig = { option: 'credit', direction: 'asc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('ENG102'); // 2學分
      expect(result[1].id).toBe('CS101'); // 3學分
      expect(result[2].id).toBe('MATH201'); // 4學分
    });

    it('should sort by credit descending', () => {
      const config: SortConfig = { option: 'credit', direction: 'desc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('MATH201'); // 4學分
      expect(result[1].id).toBe('CS101'); // 3學分
      expect(result[2].id).toBe('ENG102'); // 2學分
    });

    it('should sort by remaining seats descending', () => {
      const config: SortConfig = { option: 'remaining', direction: 'desc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      expect(result[0].id).toBe('CS101'); // 10個剩餘名額
      expect(result[1].id).toBe('MATH201'); // 5個剩餘名額
      expect(result[2].id).toBe('ENG102'); // 0個剩餘名額
    });

    it('should sort by department name', () => {
      const config: SortConfig = { option: 'department', direction: 'asc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);
      expect(result[0].department).toBe('外文系');
      expect(result[1].department).toBe('資工系');
      expect(result[2].department).toBe('數學系');
    });

    it('should sort by probability (high to low by default)', () => {
      const config: SortConfig = { option: 'probability', direction: 'asc' };
      const result = CourseSortingService.sortCourses(mockCourses, config);

      // CS101: 10/20 = 50%
      // MATH201: 5/20 = 25%
      // ENG102: 0/20 = 0%
      // 預設高概率在前，所以 asc 實際上會是高到低
      expect(result[0].id).toBe('CS101');
      expect(result[1].id).toBe('MATH201');
      expect(result[2].id).toBe('ENG102');
    });
  });

  describe('localStorage integration', () => {
    it('should save sort config to localStorage', () => {
      const config: SortConfig = { option: 'credit', direction: 'desc' };
      CourseSortingService.saveSortConfig(config);

      const saved = localStorage.getItem('NSYSUCourseSelector.sortConfig');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(config);
    });

    it('should load sort config from localStorage', () => {
      const config: SortConfig = { option: 'remaining', direction: 'asc' };
      localStorage.setItem(
        'NSYSUCourseSelector.sortConfig',
        JSON.stringify(config),
      );

      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual(config);
    });

    it('should return default config if localStorage is empty', () => {
      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual({ option: 'default', direction: 'asc' });
    });

    it('should return default config if localStorage contains invalid data', () => {
      localStorage.setItem('NSYSUCourseSelector.sortConfig', 'invalid json');

      const loaded = CourseSortingService.loadSortConfig();
      expect(loaded).toEqual({ option: 'default', direction: 'asc' });
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
          option: 'credit',
          direction: 'asc',
        }),
      ).toBe(true);

      expect(
        CourseSortingService.isValidSortConfig({
          option: 'invalid',
          direction: 'asc',
        }),
      ).toBe(false);

      expect(
        CourseSortingService.isValidSortConfig({
          option: 'credit',
          direction: 'invalid',
        }),
      ).toBe(false);
    });
  });
});
