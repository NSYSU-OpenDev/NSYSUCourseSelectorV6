import { DepartmentCourseService } from '../departmentCourseService';
import type { Course } from '@/types';

// Mock localStorage
interface MockStorage extends Storage {
  store: Record<string, string>;
}

const localStorageMock: MockStorage = {
  store: {} as Record<string, string>,
  length: 0,
  key: jest.fn(),
  getItem: jest.fn(function (this: MockStorage, key: string): string | null {
    return this.store[key] || null;
  }),
  setItem: jest.fn(function (
    this: MockStorage,
    key: string,
    value: string,
  ): void {
    this.store[key] = value;
  }),
  removeItem: jest.fn(function (this: MockStorage, key: string): void {
    delete this.store[key];
  }),
  clear: jest.fn(function (this: MockStorage): void {
    this.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock 課程資料
const mockCourses: Course[] = [
  {
    id: 'CS101',
    url: 'https://example.com',
    multipleCompulsory: false,
    department: '資訊工程學系',
    grade: '1',
    class: 'A',
    name: '程式設計',
    credit: '3',
    yearSemester: '期',
    compulsory: true,
    restrict: 50,
    select: 30,
    selected: 30,
    remaining: 20,
    teacher: '王老師',
    room: '工學院101',
    classTime: ['', '', '12', '', '', '', ''],
    description: '程式設計基礎課程',
    tags: [],
    english: false,
  },
  {
    id: 'MATH201',
    url: 'https://example.com',
    multipleCompulsory: true,
    department: '應用數學系',
    grade: '2',
    class: 'B',
    name: '微積分',
    credit: '4',
    yearSemester: '期',
    compulsory: false,
    restrict: 40,
    select: 35,
    selected: 35,
    remaining: 5,
    teacher: '李老師',
    room: '理學院202',
    classTime: ['', '34', '', '', '', '', ''],
    description: '微積分進階課程',
    tags: [],
    english: false,
  },
  {
    id: 'ENG301',
    url: 'https://example.com',
    multipleCompulsory: false,
    department: '外國語文學系',
    grade: '0',
    name: '英文寫作',
    credit: '2',
    yearSemester: '期',
    compulsory: false,
    restrict: 30,
    select: 25,
    selected: 25,
    remaining: 5,
    teacher: 'Smith老師',
    room: '文學院301',
    classTime: ['', '', '', '56', '', '', ''],
    description: '英文寫作技巧',
    tags: [],
    english: true,
  },
];

describe('DepartmentCourseService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('extractDepartments', () => {
    it('應該提取所有唯一的系所並排序', () => {
      const departments =
        DepartmentCourseService.extractDepartments(mockCourses);
      expect(departments).toEqual([
        '外國語文學系',
        '應用數學系',
        '資訊工程學系',
      ]);
    });

    it('應該過濾空的系所名稱', () => {
      const coursesWithEmptyDept: Course[] = [
        ...mockCourses,
        {
          ...mockCourses[0],
          id: 'EMPTY001',
          department: '',
        },
      ];
      const departments =
        DepartmentCourseService.extractDepartments(coursesWithEmptyDept);
      expect(departments).toEqual([
        '外國語文學系',
        '應用數學系',
        '資訊工程學系',
      ]);
    });
  });

  describe('extractGrades', () => {
    it('應該提取所有唯一的年級並排序', () => {
      const grades = DepartmentCourseService.extractGrades(mockCourses);
      expect(grades).toEqual(['0', '1', '2']);
    });
  });

  describe('extractClasses', () => {
    it('應該提取所有唯一的班別並排序', () => {
      const classes = DepartmentCourseService.extractClasses(mockCourses);
      expect(classes).toEqual(['A', 'B']);
    });
  });

  describe('getCompulsoryTypeOptions', () => {
    it('應該返回正確的必修/選修選項', () => {
      const options = DepartmentCourseService.getCompulsoryTypeOptions();
      expect(options).toEqual([
        { label: '必修課程', value: 'compulsory' },
        { label: '選修課程', value: 'elective' },
        { label: '多選必修', value: 'multipleCompulsory' },
      ]);
    });
  });

  describe('filterCourses', () => {
    it('應該根據系所篩選課程', () => {
      const filters = {
        selectedDepartments: ['資訊工程學系'],
        selectedGrades: [],
        selectedClasses: [],
        selectedCompulsoryTypes: [],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('CS101');
    });

    it('應該根據年級篩選課程', () => {
      const filters = {
        selectedDepartments: [],
        selectedGrades: ['1', '2'],
        selectedClasses: [],
        selectedCompulsoryTypes: [],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['CS101', 'MATH201']);
    });

    it('應該根據班別篩選課程', () => {
      const filters = {
        selectedDepartments: [],
        selectedGrades: [],
        selectedClasses: ['A'],
        selectedCompulsoryTypes: [],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('CS101');
    });

    it('應該根據必修/選修類型篩選課程', () => {
      const filters = {
        selectedDepartments: [],
        selectedGrades: [],
        selectedClasses: [],
        selectedCompulsoryTypes: ['compulsory'],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('CS101');
    });

    it('應該根據多選必修類型篩選課程', () => {
      const filters = {
        selectedDepartments: [],
        selectedGrades: [],
        selectedClasses: [],
        selectedCompulsoryTypes: ['multipleCompulsory'],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('MATH201');
    });

    it('應該組合多個篩選條件', () => {
      const filters = {
        selectedDepartments: ['資訊工程學系', '應用數學系'],
        selectedGrades: ['1', '2'],
        selectedClasses: [],
        selectedCompulsoryTypes: [],
      };
      const filtered = DepartmentCourseService.filterCourses(
        mockCourses,
        filters,
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['CS101', 'MATH201']);
    });
  });

  describe('localStorage operations', () => {
    it('應該能夠儲存篩選條件到 localStorage', () => {
      const filters = {
        selectedDepartments: ['資訊工程學系'],
        selectedGrades: ['1'],
        selectedClasses: ['A'],
        selectedCompulsoryTypes: ['compulsory'],
      };

      DepartmentCourseService.saveFiltersToStorage(filters);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'NSYSUCourseSelector.departmentCoursesFilters',
        JSON.stringify(filters),
      );
    });

    it('應該能夠從 localStorage 載入篩選條件', () => {
      const filters = {
        selectedDepartments: ['資訊工程學系'],
        selectedGrades: ['1'],
        selectedClasses: ['A'],
        selectedCompulsoryTypes: ['compulsory'],
      };

      localStorageMock.store['NSYSUCourseSelector.departmentCoursesFilters'] =
        JSON.stringify(filters);

      const loaded = DepartmentCourseService.loadFiltersFromStorage();
      expect(loaded).toEqual(filters);
    });

    it('應該在 localStorage 為空時返回預設值', () => {
      const loaded = DepartmentCourseService.loadFiltersFromStorage();
      expect(loaded).toEqual({
        selectedDepartments: [],
        selectedGrades: [],
        selectedClasses: [],
        selectedCompulsoryTypes: [],
      });
    });

    it('應該在 localStorage 資料損壞時返回預設值', () => {
      localStorageMock.store['NSYSUCourseSelector.departmentCoursesFilters'] =
        'invalid json';

      const loaded = DepartmentCourseService.loadFiltersFromStorage();
      expect(loaded).toEqual({
        selectedDepartments: [],
        selectedGrades: [],
        selectedClasses: [],
        selectedCompulsoryTypes: [],
      });
    });
  });
});
