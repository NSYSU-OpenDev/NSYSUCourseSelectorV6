import { AdvancedFilterService } from '@/services';
import type { Course } from '@/types';
import type { FilterCondition } from '@/store/slices/uiSlice';

// 測試用課程資料
const mockCourses: Course[] = [
  {
    id: 'CS101',
    url: 'http://example.com/cs101',
    multipleCompulsory: false,
    department: '資訊工程學系',
    grade: '1',
    class: '甲',
    name: '計算機概論',
    credit: '3',
    yearSemester: '期',
    compulsory: true,
    restrict: 50,
    select: 30,
    selected: 30,
    remaining: 20,
    teacher: '張三',
    room: 'CS1001',
    classTime: ['', '123', '', '', '67', '', ''],
    description: '基礎計算機課程',
    tags: ['必修', '基礎'],
    english: false,
  },
  {
    id: 'CS102',
    url: 'http://example.com/cs102',
    multipleCompulsory: false,
    department: '資訊工程學系',
    grade: '1',
    class: '乙',
    name: '程式設計',
    credit: '3',
    yearSemester: '期',
    compulsory: true,
    restrict: 45,
    select: 25,
    selected: 25,
    remaining: 20,
    teacher: '李四',
    room: 'CS1002',
    classTime: ['', '45', '', '', '', '', ''],
    description: '程式設計基礎課程',
    tags: ['必修', '程式'],
    english: false,
  },
  {
    id: 'CS201',
    url: 'http://example.com/cs201',
    multipleCompulsory: false,
    department: '資訊工程學系',
    grade: '2',
    class: '甲',
    name: '資料結構',
    credit: '3',
    yearSemester: '期',
    compulsory: false,
    restrict: 40,
    select: 35,
    selected: 35,
    remaining: 5,
    teacher: '王五',
    room: 'CS2001',
    classTime: ['', '123', '', '', '', '', ''],
    description: '資料結構與演算法',
    tags: ['選修', '進階'],
    english: true,
  },
  {
    id: 'MATH101',
    url: 'http://example.com/math101',
    multipleCompulsory: true,
    department: '應用數學系',
    grade: '1',
    class: '',
    name: '微積分',
    credit: '4',
    yearSemester: '年',
    compulsory: true,
    restrict: 120,
    select: 45,
    selected: 45,
    remaining: 75,
    teacher: '趙六',
    room: 'MATH1001',
    classTime: ['12', '', '', '34', '', '', ''],
    description: '基礎微積分課程',
    tags: ['必修', '數學'],
    english: false,
  },
  {
    id: 'ENG101',
    url: 'http://example.com/eng101',
    multipleCompulsory: false,
    department: '外國語文學系',
    grade: '1',
    class: 'A',
    name: 'English Conversation',
    credit: '2',
    yearSemester: '期',
    compulsory: false,
    restrict: 25,
    select: 25,
    selected: 25,
    remaining: 0,
    teacher: 'John Smith',
    room: 'ENG101',
    classTime: ['', '', '34', '', '', '', ''],
    description: 'Basic English conversation course',
    tags: ['選修', '語言'],
    english: true,
  },
];

describe('AdvancedFilterService', () => {
  describe('filterCourses', () => {
    it('應該在沒有條件時返回所有課程', () => {
      const conditions: FilterCondition[] = [];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(5);
      expect(result).toEqual(mockCourses);
    });

    it('應該根據系所篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'department',
          type: 'include',
          value: '資訊工程學系',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102', 'CS201']);
    });

    it('應該根據教師篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'teacher',
          type: 'include',
          value: '張三',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CS101');
    });

    it('應該根據必修/選修篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'compulsory',
          type: 'include',
          value: '必修',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102', 'MATH101']);
    });

    it('應該根據英語授課篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'english',
          type: 'include',
          value: '英語授課',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['CS201', 'ENG101']);
    });

    it('應該根據多選必修篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'multipleCompulsory',
          type: 'include',
          value: '多選必修',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('MATH101');
    });

    it('應該根據學程標籤篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'tags',
          type: 'include',
          value: '進階',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CS201');
    });

    it('應該根據剩餘名額篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'remaining',
          type: 'include',
          value: '大於10',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102', 'MATH101']);
    });

    it('應該篩選沒有剩餘名額的課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'remaining',
          type: 'include',
          value: '等於0',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ENG101');
    });

    it('應該根據限選人數篩選課程', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'restrict',
          type: 'include',
          value: '大於50',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('MATH101');
    });

    it('應該支援排除條件', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'department',
          type: 'exclude',
          value: '資訊工程學系',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['MATH101', 'ENG101']);
    });

    it('應該支援多個條件的 AND 邏輯', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'department',
          type: 'include',
          value: '資訊工程學系',
        },
        {
          field: 'compulsory',
          type: 'include',
          value: '必修',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102']);
    });

    it('應該支援多個值的條件', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'teacher',
          type: 'include',
          value: ['張三', '李四'],
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102']);
    });

    it('應該忽略空條件', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'department',
          type: 'include',
          value: '',
        },
        {
          field: 'teacher',
          type: 'include',
          value: [],
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(5);
      expect(result).toEqual(mockCourses);
    });

    it('應該處理課程名稱搜尋', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'name',
          type: 'include',
          value: '程式',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('CS102');
    });

    it('應該處理課程代碼搜尋', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'id',
          type: 'include',
          value: 'CS',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102', 'CS201']);
    });

    it('應該處理上課教室搜尋', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'room',
          type: 'include',
          value: 'CS1',
        },
      ];
      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102']);
    });
  });

  describe('getFilterOptions', () => {
    it('應該返回所有可用的篩選選項', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);

      expect(options.length).toBeGreaterThan(0);

      // 檢查重要的篩選欄位
      const fieldNames = options.map((opt) => opt.field);
      expect(fieldNames).toContain('department');
      expect(fieldNames).toContain('teacher');
      expect(fieldNames).toContain('compulsory');
      expect(fieldNames).toContain('english');
      expect(fieldNames).toContain('tags');
    });

    it('應該正確計算系所選項和數量', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const departmentOptions = options.find(
        (opt) => opt.field === 'department',
      );

      expect(departmentOptions).toBeDefined();
      expect(departmentOptions!.options).toHaveLength(3);

      const csOption = departmentOptions!.options.find(
        (opt) => opt.value === '資訊工程學系',
      );
      expect(csOption).toBeDefined();
      expect(csOption!.count).toBe(3);
    });

    it('應該正確計算必修/選修選項和數量', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const compulsoryOptions = options.find(
        (opt) => opt.field === 'compulsory',
      );

      expect(compulsoryOptions).toBeDefined();
      expect(compulsoryOptions!.options).toHaveLength(2);

      const requiredOption = compulsoryOptions!.options.find(
        (opt) => opt.value === '必修',
      );
      const electiveOption = compulsoryOptions!.options.find(
        (opt) => opt.value === '選修',
      );

      expect(requiredOption!.count).toBe(3);
      expect(electiveOption!.count).toBe(2);
    });

    it('應該正確計算英語授課選項和數量', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const englishOptions = options.find((opt) => opt.field === 'english');

      expect(englishOptions).toBeDefined();
      expect(englishOptions!.options).toHaveLength(2);

      const englishOption = englishOptions!.options.find(
        (opt) => opt.value === '英語授課',
      );
      const chineseOption = englishOptions!.options.find(
        (opt) => opt.value === '中文授課',
      );

      expect(englishOption!.count).toBe(2);
      expect(chineseOption!.count).toBe(3);
    });

    it('應該正確計算多選必修選項和數量', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const multipleCompulsoryOptions = options.find(
        (opt) => opt.field === 'multipleCompulsory',
      );

      expect(multipleCompulsoryOptions).toBeDefined();
      expect(multipleCompulsoryOptions!.options).toHaveLength(2);

      const multipleOption = multipleCompulsoryOptions!.options.find(
        (opt) => opt.value === '多選必修',
      );
      const normalOption = multipleCompulsoryOptions!.options.find(
        (opt) => opt.value === '一般課程',
      );

      expect(multipleOption!.count).toBe(1);
      expect(normalOption!.count).toBe(4);
    });

    it('應該正確計算學程標籤選項和數量', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const tagOptions = options.find((opt) => opt.field === 'tags');

      expect(tagOptions).toBeDefined();
      expect(tagOptions!.options.length).toBeGreaterThan(0);

      const requiredTagOption = tagOptions!.options.find(
        (opt) => opt.value === '必修',
      );
      expect(requiredTagOption).toBeDefined();
      expect(requiredTagOption!.count).toBe(3);
    });

    it('應該按數量降序排列選項', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);
      const departmentOptions = options.find(
        (opt) => opt.field === 'department',
      );

      expect(departmentOptions).toBeDefined();

      // 檢查選項是否按 count 降序排列
      for (let i = 0; i < departmentOptions!.options.length - 1; i++) {
        expect(departmentOptions!.options[i].count!).toBeGreaterThanOrEqual(
          departmentOptions!.options[i + 1].count!,
        );
      }
    });

    it('應該標記可搜尋的欄位', () => {
      const options = AdvancedFilterService.getFilterOptions(mockCourses);

      const searchableFields = options.filter((opt) => opt.searchable);
      const nonSearchableFields = options.filter((opt) => !opt.searchable);

      expect(searchableFields.length).toBeGreaterThan(0);
      expect(nonSearchableFields.length).toBeGreaterThan(0);

      // 檢查特定欄位的可搜尋性
      const nameField = options.find((opt) => opt.field === 'name');
      const compulsoryField = options.find((opt) => opt.field === 'compulsory');

      expect(nameField!.searchable).toBe(true);
      expect(compulsoryField!.searchable).toBe(false);
    });
  });

  describe('getAvailableFields', () => {
    it('應該返回所有可用的篩選欄位', () => {
      const fields = AdvancedFilterService.getAvailableFields();

      expect(fields.length).toBeGreaterThan(0);

      // 檢查重要欄位
      const fieldValues = fields.map((f) => f.value);
      expect(fieldValues).toContain('name');
      expect(fieldValues).toContain('teacher');
      expect(fieldValues).toContain('department');
      expect(fieldValues).toContain('compulsory');
      expect(fieldValues).toContain('english');
      expect(fieldValues).toContain('tags');
    });

    it('應該為每個欄位提供正確的標籤', () => {
      const fields = AdvancedFilterService.getAvailableFields();

      const nameField = fields.find((f) => f.value === 'name');
      const teacherField = fields.find((f) => f.value === 'teacher');

      expect(nameField!.label).toBe('課程名稱');
      expect(teacherField!.label).toBe('授課教師');
    });
  });

  describe('edge cases', () => {
    it('應該處理空的課程陣列', () => {
      const emptyCourses: Course[] = [];
      const conditions: FilterCondition[] = [
        {
          field: 'department',
          type: 'include',
          value: '資訊工程學系',
        },
      ];

      const result = AdvancedFilterService.filterCourses(
        emptyCourses,
        conditions,
      );
      expect(result).toHaveLength(0);
    });

    it('應該處理空的課程陣列的篩選選項', () => {
      const emptyCourses: Course[] = [];
      const options = AdvancedFilterService.getFilterOptions(emptyCourses);

      // 應該仍然返回可搜尋的欄位，但選項為空
      expect(options.length).toBeGreaterThan(0);

      const searchableOptions = options.filter((opt) => opt.searchable);
      expect(searchableOptions.length).toBeGreaterThan(0);
    });

    it('應該處理包含空值的課程資料', () => {
      const courseWithNullValues: Course = {
        ...mockCourses[0],
        class: undefined,
        room: '',
        description: '',
        tags: [],
      };

      const coursesWithNulls = [courseWithNullValues];
      const options = AdvancedFilterService.getFilterOptions(coursesWithNulls);

      // 應該能正常處理而不出錯
      expect(options.length).toBeGreaterThan(0);
    });

    it('應該正確處理數字範圍條件', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'remaining',
          type: 'include',
          value: '大於100',
        },
      ];

      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );
      expect(result).toHaveLength(0); // 沒有課程剩餘名額大於 100
    });

    it('應該處理自定義數字閾值', () => {
      const conditions: FilterCondition[] = [
        {
          field: 'remaining',
          type: 'include',
          value: '大於15',
        },
      ];

      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
      );
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102', 'MATH101']);
    });

    it('應該正確篩選標籤', () => {
      const courseLabelMap = {
        CS101: ['favorite', 'candidate'],
        CS102: ['favorite'],
        MATH101: ['candidate'],
        ENG101: [],
        PHYS101: ['archived'],
      };

      const conditions: FilterCondition[] = [
        {
          field: 'labels',
          type: 'include',
          value: ['favorite'],
        },
      ];

      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
        courseLabelMap,
      );
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['CS101', 'CS102']);
    });
    it('應該正確排除標籤', () => {
      const courseLabelMap = {
        CS101: ['favorite', 'candidate'],
        CS102: ['favorite'],
        MATH101: ['candidate'],
        ENG101: [],
        // CS201 is not in the map, so it should have no labels
      };

      const conditions: FilterCondition[] = [
        {
          field: 'labels',
          type: 'exclude',
          value: ['favorite'],
        },
      ];

      const result = AdvancedFilterService.filterCourses(
        mockCourses,
        conditions,
        courseLabelMap,
      );
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual(['CS201', 'MATH101', 'ENG101']);
    });
  });
});
