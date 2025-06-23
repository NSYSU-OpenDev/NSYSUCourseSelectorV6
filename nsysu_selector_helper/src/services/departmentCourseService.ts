import type { Course } from '@/types';

/**
 * 系所課程篩選服務
 * 專門處理系所、年級、班別、必修/選修等篩選邏輯
 */
export class DepartmentCourseService {
  /**
   * 從課程列表中提取所有唯一的系所
   * @param courses 課程列表
   * @returns 系所選項列表
   */
  static extractDepartments(courses: Course[]): string[] {
    const departments = new Set<string>();
    courses.forEach((course) => {
      if (course.department?.trim()) {
        departments.add(course.department.trim());
      }
    });
    return Array.from(departments).sort();
  }

  /**
   * 從課程列表中提取所有唯一的年級
   * @param courses 課程列表
   * @returns 年級選項列表
   */
  static extractGrades(courses: Course[]): string[] {
    const grades = new Set<string>();
    courses.forEach((course) => {
      if (course.grade?.trim()) {
        grades.add(course.grade.trim());
      }
    });
    return Array.from(grades).sort();
  }

  /**
   * 從課程列表中提取所有唯一的班別
   * @param courses 課程列表
   * @returns 班別選項列表
   */
  static extractClasses(courses: Course[]): string[] {
    const classes = new Set<string>();
    courses.forEach((course) => {
      if (course.class?.trim()) {
        classes.add(course.class.trim());
      }
    });
    return Array.from(classes).sort();
  }

  /**
   * 取得必修/選修類型選項
   * @returns 必修/選修類型選項列表
   */
  static getCompulsoryTypeOptions(): Array<{
    label: string;
    value: string;
  }> {
    return [
      { label: '必修課程', value: 'compulsory' },
      { label: '選修課程', value: 'elective' },
      { label: '多選必修', value: 'multipleCompulsory' },
    ];
  }

  /**
   * 根據篩選條件過濾課程
   * @param courses 原始課程列表
   * @param filters 篩選條件
   * @returns 篩選後的課程列表
   */
  static filterCourses(
    courses: Course[],
    filters: {
      selectedDepartments: string[];
      selectedGrades: string[];
      selectedClasses: string[];
      selectedCompulsoryTypes: string[];
    },
  ): Course[] {
    return courses.filter((course) => {
      // 系所篩選
      if (
        filters.selectedDepartments.length > 0 &&
        !filters.selectedDepartments.includes(course.department)
      ) {
        return false;
      }

      // 年級篩選
      if (
        filters.selectedGrades.length > 0 &&
        !filters.selectedGrades.includes(course.grade)
      ) {
        return false;
      }

      // 班別篩選
      if (filters.selectedClasses.length > 0) {
        // 處理沒有班別資訊的課程
        const courseClass = course.class || '';
        if (!filters.selectedClasses.includes(courseClass)) {
          return false;
        }
      }

      // 必修/選修類型篩選
      if (filters.selectedCompulsoryTypes.length > 0) {
        const courseTypes: string[] = [];

        if (course.compulsory) {
          courseTypes.push('compulsory');
        } else {
          courseTypes.push('elective');
        }

        if (course.multipleCompulsory) {
          courseTypes.push('multipleCompulsory');
        }

        // 檢查是否有任何一個類型匹配
        const hasMatch = courseTypes.some((type) =>
          filters.selectedCompulsoryTypes.includes(type),
        );

        if (!hasMatch) {
          return false;
        }
      }

      return true;
    });
  }
  /**
   * 從 localStorage 載入篩選條件
   * @returns 儲存的篩選條件或預設值
   */
  static loadFiltersFromStorage(): {
    selectedDepartments: string[];
    selectedGrades: string[];
    selectedClasses: string[];
    selectedCompulsoryTypes: string[];
  } {
    try {
      const stored = localStorage.getItem(
        'NSYSUCourseSelector.departmentCoursesFilters',
      );
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          selectedDepartments: parsed.selectedDepartments || [],
          selectedGrades: parsed.selectedGrades || [],
          selectedClasses: parsed.selectedClasses || [],
          selectedCompulsoryTypes: parsed.selectedCompulsoryTypes || [],
        };
      }
    } catch (error) {
      console.warn('無法載入系所課程篩選條件:', error);
    }

    return {
      selectedDepartments: [],
      selectedGrades: [],
      selectedClasses: [],
      selectedCompulsoryTypes: [],
    };
  }
  /**
   * 將篩選條件儲存到 localStorage
   * @param filters 要儲存的篩選條件
   */
  static saveFiltersToStorage(filters: {
    selectedDepartments: string[];
    selectedGrades: string[];
    selectedClasses: string[];
    selectedCompulsoryTypes: string[];
  }): void {
    try {
      localStorage.setItem(
        'NSYSUCourseSelector.departmentCoursesFilters',
        JSON.stringify(filters),
      );
    } catch (error) {
      console.warn('無法儲存系所課程篩選條件:', error);
    }
  }
}
