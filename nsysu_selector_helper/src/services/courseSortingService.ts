import type { Course } from '@/types';
import { GetProbability } from '@/utils/getProbability';

// 排序選項類型
export interface SortOption {
  key: string;
  label: string;
  description: string;
}

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 排序配置
export interface SortConfig {
  option: string;
  direction: SortDirection;
}

// 預設排序選項
export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    key: 'default',
    label: '預設順序',
    description: '系統原始排序',
  },
  {
    key: 'probability',
    label: '選上概率',
    description: '根據剩餘名額計算選上機率',
  },
  {
    key: 'credit',
    label: '學分數',
    description: '課程學分由低到高或高到低',
  },
  {
    key: 'remaining',
    label: '剩餘名額',
    description: '課程剩餘名額數量',
  },
  {
    key: 'department',
    label: '開課系所',
    description: '按系所名稱排序',
  },
  {
    key: 'teacher',
    label: '授課教師',
    description: '按教師姓名排序',
  },
  {
    key: 'courseName',
    label: '課程名稱',
    description: '按課程名稱排序',
  },
  {
    key: 'courseId',
    label: '課程代碼',
    description: '按課程代碼排序',
  },
];

// 儲存鍵名
const STORAGE_KEY = 'NSYSUCourseSelector.sortConfig';

export class CourseSortingService {
  // 載入排序配置
  static loadSortConfig(): SortConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as SortConfig;
        // 驗證配置有效性
        if (this.isValidSortConfig(config)) {
          return config;
        }
      }
    } catch (error) {
      console.warn('Failed to load sort config:', error);
    }
    return { option: 'default', direction: 'asc' };
  }

  // 儲存排序配置
  static saveSortConfig(config: SortConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save sort config:', error);
    }
  }

  // 驗證排序配置，我們關掉 ESLint 的 no-explicit-any 規則，因為這裡函數本是用來測試用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isValidSortConfig(config: any): config is SortConfig {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.option === 'string' &&
      (config.direction === 'asc' || config.direction === 'desc') &&
      DEFAULT_SORT_OPTIONS.some((opt) => opt.key === config.option)
    );
  }

  // 排序課程
  static sortCourses(courses: Course[], config: SortConfig): Course[] {
    if (config.option === 'default') {
      return [...courses];
    }

    return [...courses].sort((a, b) => {
      let comparison = 0;

      switch (config.option) {
        case 'probability':
          comparison = this.compareProbability(a, b);
          break;
        case 'credit':
          comparison = this.compareCredit(a, b);
          break;
        case 'remaining':
          comparison = this.compareRemaining(a, b);
          break;
        case 'department':
          comparison = this.compareDepartment(a, b);
          break;
        case 'teacher':
          comparison = this.compareTeacher(a, b);
          break;
        case 'courseName':
          comparison = this.compareCourseName(a, b);
          break;
        case 'courseId':
          comparison = this.compareCourseId(a, b);
          break;
        default:
          return 0;
      }

      return config.direction === 'desc' ? -comparison : comparison;
    });
  }

  // 比較選上概率
  private static compareProbability(a: Course, b: Course): number {
    const probA = GetProbability.getSuccessProbability(a.selected, a.remaining);
    const probB = GetProbability.getSuccessProbability(b.selected, b.remaining);
    return probB - probA; // 預設高概率在前
  }

  // 比較學分數
  private static compareCredit(a: Course, b: Course): number {
    return parseInt(a.credit) - parseInt(b.credit);
  } // 比較剩餘名額
  private static compareRemaining(a: Course, b: Course): number {
    return a.remaining - b.remaining; // 升序：剩餘名額少的在前
  }

  // 比較系所
  private static compareDepartment(a: Course, b: Course): number {
    return a.department.localeCompare(b.department, 'zh-TW');
  }

  // 比較教師
  private static compareTeacher(a: Course, b: Course): number {
    return a.teacher.localeCompare(b.teacher, 'zh-TW');
  }

  // 比較課程名稱
  private static compareCourseName(a: Course, b: Course): number {
    return a.name.localeCompare(b.name, 'zh-TW');
  }

  // 比較課程代碼
  private static compareCourseId(a: Course, b: Course): number {
    return a.id.localeCompare(b.id);
  }

  // 取得排序選項的詳細資訊
  static getSortOption(key: string): SortOption | undefined {
    return DEFAULT_SORT_OPTIONS.find((option) => option.key === key);
  }

  // 切換排序方向
  static toggleDirection(direction: SortDirection): SortDirection {
    return direction === 'asc' ? 'desc' : 'asc';
  }
}
