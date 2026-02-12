import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  Drawer,
  Space,
  Button,
  Select,
  Switch,
  Typography,
  Popconfirm,
  Flex,
  Tooltip,
} from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectAdvancedFilterDrawerOpen,
  selectFilterConditions,
  selectCourses,
  selectLabels,
  selectSimpleFilterMode,
} from '@/store/selectors';
import {
  setAdvancedFilterDrawerOpen,
  setFilterConditions,
  clearAllFilterConditions,
  setSimpleFilterMode,
} from '@/store/slices/uiSlice';
import {
  AdvancedFilterService,
  type FieldOptions,
} from '@/services/advancedFilterService';
import type { FilterCondition } from '@/store/slices/uiSlice';
import { useTranslation } from '@/hooks';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 6px 8px;
  }

  .ant-drawer-body {
    padding: 8px;
  }
`;

const FilterRow = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: ${(props) =>
    props.$enabled ? 'var(--ant-color-primary-bg)' : 'transparent'};
  border: 1px solid
    ${(props) =>
      props.$enabled
        ? 'var(--ant-color-primary-border)'
        : 'var(--ant-color-border)'};
  transition: all 0.2s ease;
  margin-bottom: 6px;

  &:hover {
    border-color: var(--ant-color-primary-border-hover);
  }
`;

const FieldLabel = styled(Text)`
  min-width: 42px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  color: var(--ant-color-primary);
`;

// 簡易篩選的欄位配置
// 'tags' = Select with mode='tags' (autocomplete + free text)
// 'select' = Select with mode='multiple' (strict options only)
// labelKey maps to i18n key: simpleFilter.fields.<labelKey>
const SIMPLE_FILTER_FIELDS = [
  { field: 'name', labelKey: 'name', inputType: 'tags' as const },
  { field: 'teacher', labelKey: 'teacher', inputType: 'tags' as const },
  { field: 'tags', labelKey: 'tags', inputType: 'tags' as const },
  { field: 'department', labelKey: 'department', inputType: 'select' as const },
  { field: 'grade', labelKey: 'grade', inputType: 'select' as const },
  { field: 'class', labelKey: 'class', inputType: 'select' as const },
  { field: 'credit', labelKey: 'credit', inputType: 'select' as const },
  { field: 'compulsory', labelKey: 'compulsory', inputType: 'select' as const },
  { field: 'english', labelKey: 'english', inputType: 'select' as const },
];

// 管理每一列的本地狀態
interface SimpleFilterRowState {
  field: string;
  type: 'include' | 'exclude';
  value: string | string[];
  enabled: boolean;
}

const SimpleFilterDrawer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectAdvancedFilterDrawerOpen);
  const filterConditions = useAppSelector(selectFilterConditions);
  const courses = useAppSelector(selectCourses);
  const labels = useAppSelector(selectLabels);
  const simpleFilterMode = useAppSelector(selectSimpleFilterMode);

  // 動態計算篩選選項
  const fieldOptions = useMemo(() => {
    return AdvancedFilterService.getFilterOptions(courses, labels);
  }, [courses, labels]);

  // 初始化與同步本地狀態 —— 從 Redux filterConditions 反推出每一列的狀態
  const [rowStates, setRowStates] = useState<SimpleFilterRowState[]>(() =>
    initRowStatesFromConditions(filterConditions),
  );

  // 只在 drawer 打開時同步一次
  useEffect(() => {
    if (open && simpleFilterMode) {
      setRowStates(initRowStatesFromConditions(filterConditions));
    }
  }, [open, simpleFilterMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // 從 filterConditions 反推出每一列的初始值
  function initRowStatesFromConditions(
    conditions: FilterCondition[],
  ): SimpleFilterRowState[] {
    return SIMPLE_FILTER_FIELDS.map((fieldDef) => {
      // 找到已有的 condition（如果有的話）
      const existingCondition = conditions.find(
        (c) => c.field === fieldDef.field,
      );
      if (existingCondition) {
        return {
          field: fieldDef.field,
          type: existingCondition.type,
          value: existingCondition.value,
          enabled: true,
        };
      }
      return {
        field: fieldDef.field,
        type: 'include' as const,
        value: [],
        enabled: false,
      };
    });
  }

  // 把本地的 rowStates 同步回 Redux
  const syncToRedux = useCallback(
    (states: SimpleFilterRowState[]) => {
      // 只保留 enabled 且有值的篩選條件
      const conditions: FilterCondition[] = states
        .filter((row) => {
          if (!row.enabled) return false;
          if (Array.isArray(row.value)) return row.value.length > 0;
          return typeof row.value === 'string' && row.value.trim() !== '';
        })
        .map((row) => ({
          field: row.field,
          type: row.type,
          value: row.value,
        }));

      // 保留不屬於 simple mode 管理的 conditions（例如手動在 advanced mode 加的其他 field）
      const simpleFields = new Set(SIMPLE_FILTER_FIELDS.map((f) => f.field));
      const otherConditions = filterConditions.filter(
        (c) => !simpleFields.has(c.field),
      );

      dispatch(setFilterConditions([...otherConditions, ...conditions]));
    },
    [dispatch, filterConditions],
  );

  const handleRowUpdate = useCallback(
    (index: number, updates: Partial<SimpleFilterRowState>) => {
      setRowStates((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        // 立即同步到 Redux
        syncToRedux(next);
        return next;
      });
    },
    [syncToRedux],
  );

  const handleToggleType = useCallback(
    (index: number) => {
      setRowStates((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          type: next[index].type === 'include' ? 'exclude' : 'include',
        };
        syncToRedux(next);
        return next;
      });
    },
    [syncToRedux],
  );

  const handleToggleEnabled = useCallback(
    (index: number, enabled: boolean) => {
      setRowStates((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], enabled };
        syncToRedux(next);
        return next;
      });
    },
    [syncToRedux],
  );

  const handleClearAll = () => {
    dispatch(clearAllFilterConditions());
    setRowStates(initRowStatesFromConditions([]));
  };

  const handleClose = () => {
    dispatch(setAdvancedFilterDrawerOpen(false));
  };

  const handleSwitchToAdvanced = () => {
    dispatch(setSimpleFilterMode(false));
  };

  const getFieldOptionsByField = (field: string): FieldOptions | undefined => {
    return fieldOptions.find((f) => f.field === field);
  };

  if (!simpleFilterMode) return null;

  return (
    <StyledDrawer
      title={
        <Space>
          <FilterOutlined />
          <span>{t('simpleFilter.title')}</span>
        </Space>
      }
      placement='left'
      mask={false}
      maskClosable={false}
      open={open}
      onClose={handleClose}
      width={360}
      extra={
        <Space>
          <Space size={4}>
            <Typography.Text style={{ fontSize: '12px' }}>
              {t('simpleFilter.simpleMode')}
            </Typography.Text>
            <Switch
              size='small'
              checked={true}
              onChange={(checked) => {
                if (!checked) handleSwitchToAdvanced();
              }}
            />
          </Space>
          <Popconfirm
            title={t('simpleFilter.clearAll')}
            onConfirm={handleClearAll}
            okText={t('simpleFilter.clear')}
            cancelText={t('simpleFilter.cancel')}
          >
            <Button
              type='text'
              icon={<ClearOutlined />}
              disabled={filterConditions.length === 0}
              danger={filterConditions.length > 0}
              size='small'
            />
          </Popconfirm>
        </Space>
      }
    >
      <Flex vertical gap={2}>
        <Text
          type='secondary'
          style={{ fontSize: '11px', marginBottom: '4px', lineHeight: 1.4 }}
        >
          {t('simpleFilter.description')}
        </Text>

        {SIMPLE_FILTER_FIELDS.map((fieldDef, index) => {
          const rowState = rowStates[index];
          if (!rowState) return null;
          const fieldOpts = getFieldOptionsByField(fieldDef.field);
          const fieldLabel = t(
            `simpleFilter.fields.${fieldDef.labelKey}` as any,
          );

          return (
            <FilterRow key={fieldDef.field} $enabled={rowState.enabled}>
              {/* Field Label */}
              <FieldLabel>{fieldLabel}</FieldLabel>

              {/* Include/Exclude Toggle */}
              <Tooltip
                title={
                  rowState.type === 'include'
                    ? t('simpleFilter.include')
                    : t('simpleFilter.exclude')
                }
              >
                <Button
                  size='small'
                  type={rowState.type === 'exclude' ? 'primary' : 'default'}
                  danger={rowState.type === 'exclude'}
                  onClick={() => handleToggleType(index)}
                  style={{
                    fontSize: '11px',
                    padding: '0 6px',
                    minWidth: '36px',
                    height: '24px',
                  }}
                >
                  {rowState.type === 'include'
                    ? t('simpleFilter.include')
                    : t('simpleFilter.exclude')}
                </Button>
              </Tooltip>

              {/* Value Input */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Select
                  size='small'
                  mode={fieldDef.inputType === 'tags' ? 'tags' : 'multiple'}
                  placeholder={
                    fieldDef.inputType === 'tags'
                      ? t('simpleFilter.searchPlaceholder', {
                          label: fieldLabel,
                        })
                      : t('simpleFilter.disabledPlaceholder', {
                          count: fieldOpts?.options.length || 0,
                        })
                  }
                  value={Array.isArray(rowState.value) ? rowState.value : []}
                  onChange={(values: string[]) =>
                    handleRowUpdate(index, { value: values })
                  }
                  options={fieldOpts?.options.map((opt) => ({
                    key: opt.label,
                    label: opt.label,
                    value: opt.value,
                  }))}
                  showSearch
                  optionFilterProp='label'
                  allowClear
                  maxTagCount={1}
                  maxTagPlaceholder={(omitted) => `+${omitted.length}`}
                  style={{ width: '100%' }}
                  notFoundContent={
                    fieldDef.inputType === 'tags'
                      ? null
                      : t('simpleFilter.noMatch')
                  }
                />
              </div>

              {/* Enable/Disable Switch */}
              <Switch
                size='small'
                checked={rowState.enabled}
                onChange={(checked) => handleToggleEnabled(index, checked)}
              />
            </FilterRow>
          );
        })}
      </Flex>
    </StyledDrawer>
  );
};

export default SimpleFilterDrawer;
