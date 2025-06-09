import type { Course } from '@/types';
import type { FilterCondition } from '@/store/slices/uiSlice';
import type { CourseLabel } from './courseLabelService';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FieldOptions {
  field: string;
  label: string;
  options: FilterOption[];
  searchable: boolean; // 是否支援搜尋輸入
}

export class AdvancedFilterService {
  /**
   * 篩選課程
   */
  static filterCourses(
    courses: Course[],
    conditions: FilterCondition[],
  ): Course[] {
    if (conditions.length === 0) return courses;

    return courses.filter((course) => {
      return conditions.every((condition) => {
        // 檢查條件是否有效
        if (
          !condition.value ||
          (Array.isArray(condition.value) && condition.value.length === 0) ||
          (typeof condition.value === 'string' && condition.value.trim() === '')
        ) {
          return true; // 空條件不篩選
        }

        const courseValue = this.getCourseFieldValue(course, condition.field);
        const normalizedCourseValue = (courseValue || '').toLowerCase();

        // 將搜尋值轉為小寫並處理多個值
        const searchValues = Array.isArray(condition.value)
          ? condition.value
          : [condition.value];

        const matches = searchValues.some((searchValue: string) => {
          const normalizedSearchValue = searchValue.toLowerCase();

          // 特殊處理剩餘名額
          if (condition.field === 'remaining') {
            if (searchValue === '大於0') return course.remaining > 0;
            if (searchValue === '等於0') return course.remaining === 0;
            if (searchValue === '大於5') return course.remaining > 5;
            if (searchValue === '大於10') return course.remaining > 10;
            if (searchValue.includes('大於')) {
              const threshold = parseInt(searchValue.replace('大於', ''));
              return !isNaN(threshold) && course.remaining > threshold;
            }
          }

          // 特殊處理限選人數
          if (condition.field === 'restrict') {
            if (searchValue === '大於50') return course.restrict > 50;
            if (searchValue === '大於100') return course.restrict > 100;
            if (searchValue.includes('大於')) {
              const threshold = parseInt(searchValue.replace('大於', ''));
              return !isNaN(threshold) && course.restrict > threshold;
            }
          }

          // 對於其他欄位，直接檢查是否包含搜尋值
          if (condition.field === 'tags') {
            return course.tags.some((tag) =>
              tag.toLowerCase().includes(normalizedSearchValue),
            );
          }

          return normalizedCourseValue.includes(normalizedSearchValue);
        });

        // 如果是包含條件，需要匹配；如果是排除條件，需要不匹配
        return condition.type === 'include' ? matches : !matches;
      });
    });
  }

  /**
   * 獲取課程欄位值
   */
  private static getCourseFieldValue(course: Course, field: string): string {
    switch (field) {
      case 'name':
        return course.name;
      case 'teacher':
        return course.teacher;
      case 'department':
        return course.department;
      case 'grade':
        return course.grade;
      case 'class':
        return course.class || '';
      case 'credit':
        return course.credit;
      case 'yearSemester':
        return course.yearSemester;
      case 'room':
        return course.room;
      case 'id':
        return course.id;
      case 'tags':
        return course.tags.join(', ');
      case 'labels':
        return Array.isArray((course as any).labels)
          ? (course as any).labels.join(', ')
          : '';
      case 'compulsory':
        return course.compulsory ? '必修' : '選修';
      case 'english':
        return course.english ? '英語授課' : '中文授課';
      case 'multipleCompulsory':
        return course.multipleCompulsory ? '多選必修' : '一般課程';
      case 'description':
        return course.description;
      case 'remaining':
        return course.remaining.toString();
      case 'restrict':
        return course.restrict.toString();
      default:
        return '';
    }
  }

  /**
   * 動態計算所有篩選選項
   */
  static getFilterOptions(
    courses: Course[],
    labels: CourseLabel[] = [],
  ): FieldOptions[] {
    const fields: FieldOptions[] = [
      {
        field: 'department',
        label: '開課系所',
        options: this.getUniqueOptions(courses, 'department'),
        searchable: true,
      },
      {
        field: 'teacher',
        label: '授課教師',
        options: this.getUniqueOptions(courses, 'teacher'),
        searchable: true,
      },
      {
        field: 'grade',
        label: '年級',
        options: this.getUniqueOptions(courses, 'grade'),
        searchable: true,
      },
      {
        field: 'credit',
        label: '學分數',
        options: this.getUniqueOptions(courses, 'credit'),
        searchable: false,
      },
      {
        field: 'yearSemester',
        label: '年期',
        options: this.getUniqueOptions(courses, 'yearSemester'),
        searchable: false,
      },
      {
        field: 'compulsory',
        label: '必修/選修',
        options: [
          {
            value: '必修',
            label: '必修',
            count: courses.filter((c) => c.compulsory).length,
          },
          {
            value: '選修',
            label: '選修',
            count: courses.filter((c) => !c.compulsory).length,
          },
        ],
        searchable: false,
      },
      {
        field: 'english',
        label: '授課語言',
        options: [
          {
            value: '英語授課',
            label: '英語授課',
            count: courses.filter((c) => c.english).length,
          },
          {
            value: '中文授課',
            label: '中文授課',
            count: courses.filter((c) => !c.english).length,
          },
        ],
        searchable: false,
      },
      {
        field: 'multipleCompulsory',
        label: '多選必修',
        options: [
          {
            value: '多選必修',
            label: '多選必修',
            count: courses.filter((c) => c.multipleCompulsory).length,
          },
          {
            value: '一般課程',
            label: '一般課程',
            count: courses.filter((c) => !c.multipleCompulsory).length,
          },
        ],
        searchable: false,
      },
      {
        field: 'tags',
        label: '學程標籤',
        options: this.getTagOptions(courses),
        searchable: true,
      },
      {
        field: 'labels',
        label: '自訂標籤',
        options: labels.map((l) => ({ value: l.id, label: l.name })),
        searchable: false,
      },
      {
        field: 'name',
        label: '課程名稱',
        options: this.getUniqueOptions(courses, 'name'),
        searchable: true,
      },
      {
        field: 'id',
        label: '課程代碼',
        options: this.getUniqueOptions(courses, 'id'),
        searchable: true,
      },
      {
        field: 'class',
        label: '班別',
        options: this.getUniqueOptions(courses, 'class'),
        searchable: true,
      },
      {
        field: 'room',
        label: '上課教室',
        options: this.getUniqueOptions(courses, 'room'),
        searchable: true,
      },
      {
        field: 'remaining',
        label: '剩餘名額',
        options: [
          {
            value: '大於0',
            label: '有剩餘名額',
            count: courses.filter((c) => c.remaining > 0).length,
          },
          {
            value: '等於0',
            label: '已額滿',
            count: courses.filter((c) => c.remaining === 0).length,
          },
          {
            value: '大於5',
            label: '剩餘5人以上',
            count: courses.filter((c) => c.remaining > 5).length,
          },
          {
            value: '大於10',
            label: '剩餘10人以上',
            count: courses.filter((c) => c.remaining > 10).length,
          },
          ...this.getUniqueOptions(courses, 'remaining'),
        ],
        searchable: true,
      },
      {
        field: 'restrict',
        label: '限選人數',
        options: [
          {
            value: '大於50',
            label: '50人以上',
            count: courses.filter((c) => c.restrict > 50).length,
          },
          {
            value: '大於100',
            label: '100人以上',
            count: courses.filter((c) => c.restrict > 100).length,
          },
          ...this.getUniqueOptions(courses, 'restrict'),
        ],
        searchable: true,
      },
      {
        field: 'description',
        label: '課程描述',
        options: [],
        searchable: true,
      },
    ];

    // 只返回有選項或可搜尋的欄位
    return fields.filter(
      (field) => field.searchable || field.options.length > 0,
    );
  }

  /**
   * 獲取唯一選項並計算數量
   */
  private static getUniqueOptions(
    courses: Course[],
    field: keyof Course,
  ): FilterOption[] {
    const valueCount = new Map<string, number>();

    courses.forEach((course) => {
      const value = this.getCourseFieldValue(course, field);
      if (value && value.trim()) {
        valueCount.set(value, (valueCount.get(value) || 0) + 1);
      }
    });

    return Array.from(valueCount.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count); // 按數量排序
  }

  /**
   * 獲取學程標籤選項
   */
  private static getTagOptions(courses: Course[]): FilterOption[] {
    const tagCount = new Map<string, number>();

    courses.forEach((course) => {
      course.tags.forEach((tag) => {
        if (tag && tag.trim()) {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        }
      });
    });

    return Array.from(tagCount.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 獲取可用的篩選欄位（簡化版本，用於快速選擇）
   */
  static getAvailableFields(): Array<{ value: string; label: string }> {
    return [
      { value: 'name', label: '課程名稱' },
      { value: 'teacher', label: '授課教師' },
      { value: 'department', label: '開課系所' },
      { value: 'grade', label: '年級' },
      { value: 'credit', label: '學分數' },
      { value: 'yearSemester', label: '年期' },
      { value: 'compulsory', label: '必修/選修' },
      { value: 'english', label: '授課語言' },
      { value: 'multipleCompulsory', label: '多選必修' },
      { value: 'tags', label: '學程標籤' },
      { value: 'labels', label: '自訂標籤' },
      { value: 'room', label: '上課教室' },
      { value: 'id', label: '課程代碼' },
    ];
  }
}
