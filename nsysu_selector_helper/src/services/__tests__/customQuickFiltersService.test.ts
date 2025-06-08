import { CustomQuickFiltersService } from '@/services';
import type { FilterCondition } from '@/store/slices/uiSlice';

describe('CustomQuickFiltersService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('應該新增並載入自定義篩選器', () => {
    const condition: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    const filter = CustomQuickFiltersService.addCustomFilter('教師張三', condition);
    const loaded = CustomQuickFiltersService.loadCustomFilters();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(filter);
  });

  it('應該移除自定義篩選器', () => {
    const cond1: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    const cond2: FilterCondition = { field: 'department', type: 'include', value: '資訊工程學系' };
    const f1 = CustomQuickFiltersService.addCustomFilter('教師張三', cond1);
    const f2 = CustomQuickFiltersService.addCustomFilter('資工系', cond2);

    CustomQuickFiltersService.removeCustomFilter(f1.id);
    const loaded = CustomQuickFiltersService.loadCustomFilters();

    expect(loaded).toHaveLength(1);
    expect(loaded[0]).toEqual(f2);
  });

  it('應該更新自定義篩選器', () => {
    const cond: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    const filter = CustomQuickFiltersService.addCustomFilter('教師張三', cond);

    CustomQuickFiltersService.updateCustomFilter(filter.id, {
      label: '教授張三',
      condition: { field: 'teacher', type: 'include', value: '李四' },
    });

    const loaded = CustomQuickFiltersService.loadCustomFilters();
    expect(loaded[0].label).toBe('教授張三');
    expect(loaded[0].condition.value).toBe('李四');
  });

  it('應該重置所有自定義篩選器', () => {
    const cond: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    CustomQuickFiltersService.addCustomFilter('教師張三', cond);

    CustomQuickFiltersService.resetCustomFilters();
    const loaded = CustomQuickFiltersService.loadCustomFilters();

    expect(loaded).toHaveLength(0);
  });

  it('應該檢查篩選條件是否存在', () => {
    const cond: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    CustomQuickFiltersService.addCustomFilter('教師張三', cond);

    expect(CustomQuickFiltersService.isFilterExists(cond)).toBe(true);
    expect(
      CustomQuickFiltersService.isFilterExists({
        field: 'teacher',
        type: 'include',
        value: '李四',
      }),
    ).toBe(false);
  });

  it('應該生成建議的篩選器標籤', () => {
    const cond: FilterCondition = { field: 'department', type: 'include', value: 'CS' };
    const options = [
      {
        field: 'department',
        label: '系所',
        options: [
          { value: 'CS', label: '資訊工程學系' },
          { value: 'EE', label: '電機工程學系' },
        ],
      },
    ];

    const label = CustomQuickFiltersService.generateSuggestedLabel(cond, options);
    expect(label).toBe('系所包含資訊工程學系');
  });

  it('應該取得儲存統計資訊', () => {
    const cond: FilterCondition = { field: 'teacher', type: 'include', value: '張三' };
    CustomQuickFiltersService.addCustomFilter('F1', cond);
    CustomQuickFiltersService.addCustomFilter('F2', { field: 'department', type: 'include', value: '資工' });

    const stats = CustomQuickFiltersService.getStorageStats();
    expect(stats.count).toBe(2);
    expect(stats.sizeKB).toBeGreaterThan(0);
  });
});
