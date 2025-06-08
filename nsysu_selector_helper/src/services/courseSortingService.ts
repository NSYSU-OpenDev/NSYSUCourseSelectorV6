import type { Course } from '@/types';
import { DEFAULT_SORT_OPTIONS } from '@/constants';

// 排序選項類型
export interface SortOption {
  key: string;
  label: string;
  description: string;
}

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 單一排序配置
export interface SortRule {
  option: string;
  direction: SortDirection;
}

// 多重排序配置
export interface SortConfig {
  rules: SortRule[];
}

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
    return { rules: [{ option: 'default', direction: 'asc' }] };
  }

  // 儲存排序配置
  static saveSortConfig(config: SortConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save sort config:', error);
    }
  }

  // 驗證排序配置
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

  // 排序課程 - 支援多重排序
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
          case 'credit':
            comparison = this.compareCredit(a, b);
            break;
          case 'courseLevel':
            comparison = this.compareCourseLevel(a, b);
            break;
          case 'compulsory':
            comparison = this.compareCompulsory(a, b);
            break;
          case 'department':
            comparison = this.compareDepartment(a, b);
            break;
          case 'courseName':
            comparison = this.compareCourseName(a, b);
            break;
          case 'courseId':
            comparison = this.compareCourseId(a, b);
            break;
          case 'enrollmentStatus':
            comparison = this.compareEnrollmentStatus(a, b);
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

  // 比較選上概率 - 升序：超收(剩餘越少越前)→一般概率(低到高)→100%概率(餘額比例低到高)
  // 降序：100%概率(餘額比例高到低)→一般概率(高到低)→超收(剩餘越多越前)
  private static compareProbability(a: Course, b: Course): number {
    // 直接計算概率，不使用 GetProbability.getSuccessProbability
    const calculateProbability = (
      select: number,
      remaining: number,
    ): number => {
      if (remaining <= 0) return 0; // 已滿或超額
      if (select <= 0) return 100; // 沒人搶，100%選上
      const probability = Math.min((remaining / select) * 100, 100);
      return Math.max(probability, 0);
    };

    const probA = calculateProbability(a.select, a.remaining);
    const probB = calculateProbability(b.select, b.remaining);

    // 首先按概率分類排序：0%(超收) -> 一般概率(低到高) -> 100%
    const getCategory = (prob: number): number => {
      if (prob === 0) return 1; // 0%概率(超收)最低優先級
      if (prob < 100) return 2; // 一般概率
      return 3; // 100%概率最高優先級
    };

    const categoryA = getCategory(probA);
    const categoryB = getCategory(probB);

    if (categoryA !== categoryB) {
      return categoryA - categoryB; // 按分類升序排序
    }

    // 同分類內的細分排序
    if (categoryA === 3) {
      // 100%概率
      const remainingSelectedDeltaA = a.remaining - a.select;
      const remainingSelectedDeltaB = b.remaining - b.select;
      // 剩餘名額減去選課人數，剩餘越多越前
      return remainingSelectedDeltaA - remainingSelectedDeltaB;
    } else if (categoryA === 2) {
      // 一般概率：低到高（升序）
      return probA - probB;
    } else {
      // 0%概率(超收)：超收越多越前（升序：remaining小的在前）
      return a.remaining - b.remaining;
    }
  }

  // 比較學分數：升序：學分少到多，降序：學分多到少
  private static compareCredit(a: Course, b: Course): number {
    return parseInt(a.credit) - parseInt(b.credit); // 標準升序：小到大
  }

  // 比較剩餘名額：升序：負數(超收)→0→正數(少到多)，降序：正數(多到少)→0→負數(超收)
  private static compareRemaining(a: Course, b: Course): number {
    return a.remaining - b.remaining; // 標準升序：小到大
  }

  // 比較課程等級：升序：大學部→碩士班→碩專→博士班，降序：博士班→碩專→碩士班→大學部
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

  // 比較必修優先：升序：必修→選修，降序：選修→必修
  private static compareCompulsory(a: Course, b: Course): number {
    // 升序邏輯：必修課程(true)應該在選修課程(false)前面
    if (a.compulsory && !b.compulsory) return -1; // 必修在前
    if (!a.compulsory && b.compulsory) return 1; // 選修在後
    return 0; // 相同
  }
  // 比較選課狀況：升序：有名額→候補→已滿→超收，降序：超收→已滿→候補→有名額
  private static compareEnrollmentStatus(a: Course, b: Course): number {
    const getStatusPriority = (course: Course): number => {
      if (course.remaining > 0) return 1; // 有名額
      if (course.remaining === 0 && course.select < course.restrict) return 2; // 候補
      if (course.remaining === 0) return 3; // 已滿
      return 4; // 超收（負數剩餘名額）
    };

    const statusA = getStatusPriority(a);
    const statusB = getStatusPriority(b);
    return statusA - statusB; // 標準升序：小到大
  }

  // 比較系所：升序：A到Z，降序：Z到A
  private static compareDepartment(a: Course, b: Course): number {
    return a.department.localeCompare(b.department, 'zh-TW'); // 標準字典序升序
  }

  // 比較課程名稱：升序：A到Z，降序：Z到A
  private static compareCourseName(a: Course, b: Course): number {
    return a.name.localeCompare(b.name, 'zh-TW'); // 標準字典序升序
  }

  // 比較課程代碼：升序：A到Z，降序：Z到A
  private static compareCourseId(a: Course, b: Course): number {
    return a.id.localeCompare(b.id); // 標準字典序升序
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
