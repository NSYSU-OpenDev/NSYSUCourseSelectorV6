import type { Course } from '@/types';
import { DEFAULT_SORT_OPTIONS } from '@/constants';
import { GetProbability } from '@/utils';

// 可用的排序選項
export type AvailableSortOptions =
  | 'default'
  | 'probability'
  | 'remaining'
  | 'available'
  | 'credit'
  | 'courseLevel'
  | 'compulsory';

// 排序選項類型
export interface SortOption {
  key: AvailableSortOptions;
  label: string;
  description: string;
}

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 單一排序配置
export interface SortRule {
  option: AvailableSortOptions;
  direction: SortDirection;
}

// 多重排序配置
export interface SortConfig {
  rules: SortRule[];
}

// 儲存鍵名
const STORAGE_KEY = 'NSYSUCourseSelector.sortConfig';

export class CourseSortingService {
  /**
   * 載入排序配置
   */
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
    return { rules: [{ option: 'default', direction: 'asc' }] };
  }

  /**
   * 儲存排序配置
   */
  static saveSortConfig(config: SortConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save sort config:', error);
    }
  }

  /**
   * 驗證排序配置
   */
  static isValidSortConfig(config: unknown): config is SortConfig {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const configObj = config as Record<string, unknown>;

    if (!Array.isArray(configObj.rules) || configObj.rules.length === 0) {
      return false;
    }

    return configObj.rules.every((rule: unknown) => {
      if (!rule || typeof rule !== 'object') {
        return false;
      }

      const ruleObj = rule as Record<string, unknown>;

      return (
        typeof ruleObj.option === 'string' &&
        (ruleObj.direction === 'asc' || ruleObj.direction === 'desc') &&
        DEFAULT_SORT_OPTIONS.some((opt) => opt.key === ruleObj.option)
      );
    });
  }

  /**
   * 排序課程 - 支援多重排序
   */
  static sortCourses(courses: Course[], config: SortConfig): Course[] {
    if (!config.rules.length || config.rules[0].option === 'default') {
      return [...courses];
    }

    return [...courses].sort((a, b) => {
      // 依次應用每個排序規則
      for (const rule of config.rules) {
        let comparison = 0;

        switch (rule.option) {
          case 'probability':
            comparison = this.compareProbability(a, b);
            break;
          case 'remaining':
            comparison = this.compareRemaining(a, b);
            break;
          case 'available':
            comparison = this.compareAvailable(a, b);
            break;
          case 'credit':
            comparison = this.compareCredit(a, b);
            break;
          case 'courseLevel':
            comparison = this.compareCourseLevel(a, b);
            break;
          case 'compulsory':
            comparison = this.compareCompulsory(a, b);
            break;
          default:
            continue;
        }

        // 如果當前規則有明確結果，則應用方向並返回
        if (comparison !== 0) {
          return rule.direction === 'desc' ? -comparison : comparison;
        }
        // 如果相等，則繼續下一個排序規則
      }

      return 0; // 所有規則都相等
    });
  }

  /**
   * 比較選上概率升序：一般概率(低到高)，降序：一般概率(高到低)
   */
  private static compareProbability(a: Course, b: Course): number {
    const probA = GetProbability.getSuccessProbability(a.select, a.remaining);
    const probB = GetProbability.getSuccessProbability(b.select, b.remaining);

    return probA - probB; // 升序：小到大
  }

  /**
   * 比較學分數：升序：學分少到多，降序：學分多到少
   */
  private static compareCredit(a: Course, b: Course): number {
    return parseInt(a.credit) - parseInt(b.credit); // 標準升序：小到大
  }

  /**
   * 比較剩餘名額：升序：負數(超收)→0→正數(少到多)，降序：正數(多到少)→0→負數(超收)
   */
  private static compareRemaining(a: Course, b: Course): number {
    return a.remaining - b.remaining; // 標準升序：小到大
  }

  /**
   * 可選名額是 (剩餘名額 - 當前勾選人數)：升序：負數(超收)→0→正數(少到多)，降序：正數(多到少)→0→負數(超收)
   */
  private static compareAvailable(a: Course, b: Course): number {
    const availableA = a.remaining - a.select;
    const availableB = b.remaining - b.select;
    return availableA - availableB; // 標準升序：小到大
  }

  /**
   * 比較課程等級：升序：大學部→碩士班→碩專→博士班，降序：博士班→碩專→碩士班→大學部
   */
  private static compareCourseLevel(a: Course, b: Course): number {
    const getLevelPriority = (course: Course): number => {
      const department = course.department.toLowerCase();
      if (department.includes('博')) return 4; // 博士班
      if (department.includes('碩專')) return 3; // 碩士專班
      if (department.includes('碩')) return 2; // 碩士班
      return 1; // 大學部（預設）
    };

    const levelA = getLevelPriority(a);
    const levelB = getLevelPriority(b);
    return levelA - levelB; // 標準升序：小到大
  }

  /**
   * 比較必修優先：升序：必修→選修，降序：選修→必修
   */
  private static compareCompulsory(a: Course, b: Course): number {
    // 升序邏輯：必修課程(true)應該在選修課程(false)前面
    if (a.compulsory && !b.compulsory) return -1; // 必修在前
    if (!a.compulsory && b.compulsory) return 1; // 選修在後
    return 0; // 相同
  }
}
