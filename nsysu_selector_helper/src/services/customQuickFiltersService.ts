import type { FilterCondition } from '@/store/slices/uiSlice';

// 自定義快速篩選器介面
export interface CustomQuickFilter {
  id: string;
  label: string;
  condition: FilterCondition;
  createdAt: number;
}

// 儲存鍵名
const STORAGE_KEY = 'NSYSUCourseSelector.customQuickFilters';

export class CustomQuickFiltersService {
  /**
   * 載入自定義快速篩選器
   */
  static loadCustomFilters(): CustomQuickFilter[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const filters = JSON.parse(stored) as CustomQuickFilter[];
        // 驗證資料格式
        return filters.filter(this.isValidCustomFilter);
      }
    } catch (error) {
      console.warn('Failed to load custom quick filters:', error);
    }
    return [];
  }

  /**
   * 儲存自定義快速篩選器
   */
  static saveCustomFilters(filters: CustomQuickFilter[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Failed to save custom quick filters:', error);
    }
  }

  /**
   * 新增自定義快速篩選器
   */
  static addCustomFilter(
    label: string,
    condition: FilterCondition,
  ): CustomQuickFilter {
    const newFilter: CustomQuickFilter = {
      id: this.generateId(),
      label: label.trim(),
      condition,
      createdAt: Date.now(),
    };

    const existingFilters = this.loadCustomFilters();
    const updatedFilters = [...existingFilters, newFilter];
    this.saveCustomFilters(updatedFilters);

    return newFilter;
  }

  /**
   * 移除自定義快速篩選器
   */
  static removeCustomFilter(id: string): void {
    const existingFilters = this.loadCustomFilters();
    const updatedFilters = existingFilters.filter((filter) => filter.id !== id);
    this.saveCustomFilters(updatedFilters);
  }

  /**
   * 更新自定義快速篩選器
   */
  static updateCustomFilter(
    id: string,
    updates: Partial<Pick<CustomQuickFilter, 'label' | 'condition'>>,
  ): void {
    const existingFilters = this.loadCustomFilters();
    const updatedFilters = existingFilters.map((filter) =>
      filter.id === id ? { ...filter, ...updates } : filter,
    );
    this.saveCustomFilters(updatedFilters);
  }

  /**
   * 重置所有自定義快速篩選器
   */
  static resetCustomFilters(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset custom quick filters:', error);
    }
  }

  /**
   * 檢查自定義篩選器是否已存在
   */
  static isFilterExists(condition: FilterCondition): boolean {
    const existingFilters = this.loadCustomFilters();
    return existingFilters.some((filter) =>
      this.areConditionsEqual(filter.condition, condition),
    );
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 驗證自定義篩選器格式
   */
  private static isValidCustomFilter(
    filter: unknown,
  ): filter is CustomQuickFilter {
    if (!filter || typeof filter !== 'object') {
      return false;
    }

    const filterObj = filter as Record<string, unknown>;

    if (
      typeof filterObj.id !== 'string' ||
      typeof filterObj.label !== 'string' ||
      typeof filterObj.createdAt !== 'number' ||
      !filterObj.condition ||
      typeof filterObj.condition !== 'object'
    ) {
      return false;
    }

    const condition = filterObj.condition as Record<string, unknown>;

    return (
      typeof condition.field === 'string' &&
      (condition.type === 'include' || condition.type === 'exclude') &&
      (typeof condition.value === 'string' || Array.isArray(condition.value))
    );
  }

  /**
   * 比較兩個篩選條件是否相等
   */
  private static areConditionsEqual(
    condition1: FilterCondition,
    condition2: FilterCondition,
  ): boolean {
    if (
      condition1.field !== condition2.field ||
      condition1.type !== condition2.type
    ) {
      return false;
    }

    // 比較值
    const value1 = Array.isArray(condition1.value)
      ? condition1.value
      : [condition1.value];
    const value2 = Array.isArray(condition2.value)
      ? condition2.value
      : [condition2.value];

    if (value1.length !== value2.length) {
      return false;
    }

    return (
      value1.every((v) => value2.includes(v)) &&
      value2.every((v) => value1.includes(v))
    );
  }

  /**
   * 從現有篩選條件生成建議的標籤名稱
   */
  static generateSuggestedLabel(
    condition: FilterCondition,
    fieldOptions: Array<{
      field: string;
      label: string;
      options: Array<{ value: string; label: string }>;
    }>,
  ): string {
    const fieldOption = fieldOptions.find((f) => f.field === condition.field);
    const fieldLabel = fieldOption?.label || condition.field;
    const typeLabel = condition.type === 'include' ? '包含' : '排除';

    let valueText = '未設定';
    if (condition.value) {
      if (Array.isArray(condition.value)) {
        if (condition.value.length > 0) {
          const displayValues = condition.value.map((val) => {
            const option = fieldOption?.options.find(
              (opt) => opt.value === val,
            );
            return option?.label || val;
          });
          valueText =
            displayValues.length === 1
              ? displayValues[0]
              : `${displayValues[0]} 等${displayValues.length}項`;
        }
      } else {
        const option = fieldOption?.options.find(
          (opt) => opt.value === condition.value,
        );
        valueText = option?.label || condition.value || '未設定';
      }
    }

    return `${fieldLabel}${typeLabel}${valueText}`;
  }

  /**
   * 取得儲存使用情況統計
   */
  static getStorageStats(): { count: number; sizeKB: number } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const count = stored ? JSON.parse(stored).length : 0;
      const sizeKB = stored ? new Blob([stored]).size / 1024 : 0;
      return { count, sizeKB: Math.round(sizeKB * 100) / 100 };
    } catch {
      return { count: 0, sizeKB: 0 };
    }
  }
}
