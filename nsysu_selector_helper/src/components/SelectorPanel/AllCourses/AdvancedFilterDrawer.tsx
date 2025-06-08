import React, { useMemo } from 'react';
import {
  Drawer,
  Space,
  Button,
  Collapse,
  Row,
  Col,
  Select,
  Input,
  Radio,
  Tag,
  Typography,
  Divider,
  Empty,
  Card,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
  ClearOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectAdvancedFilterDrawerOpen,
  selectFilterConditions,
  selectCourses,
} from '@/store/selectors';
import {
  setAdvancedFilterDrawerOpen,
  addFilterCondition,
  removeFilterCondition,
  updateFilterCondition,
  clearAllFilterConditions,
} from '@/store/slices/uiSlice';
import {
  AdvancedFilterService,
  type FieldOptions,
} from '@/services/advancedFilterService';
import type { FilterCondition } from '@/store/slices/uiSlice';
import { QUICK_FILTER } from '@/constants';
import { useCustomQuickFilters } from '@/hooks';
import CustomQuickFilters from './CustomQuickFilters';
import CustomFilterModal from './CustomFilterModal';

const { Text, Title } = Typography;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 6px 8px;
  }

  .ant-drawer-body {
    padding: 12px;
  }
`;

const StyledCollapse = styled(Collapse)`
  margin-bottom: 8px;

  .ant-collapse-item {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .ant-collapse-header {
    padding: 8px 16px !important;
  }

  .ant-collapse-content-box {
    padding: 12px 16px;
  }
`;

interface FilterConditionItemProps {
  condition: FilterCondition;
  index: number;
  fieldOptions: FieldOptions[];
  onUpdate: (index: number, condition: FilterCondition) => void;
  onRemove: (index: number) => void;
}

// 生成篩選條件的顯示文字
const getConditionDisplayText = (
  condition: FilterCondition,
  fieldOptions: FieldOptions[],
): string => {
  const fieldOption = fieldOptions.find((f) => f.field === condition.field);
  const fieldLabel = fieldOption?.label || condition.field;
  const typeLabel = condition.type === 'include' ? '包含' : '排除';

  let valueText = '(未設定)';
  if (condition.value) {
    if (Array.isArray(condition.value)) {
      if (condition.value.length > 0) {
        // 多個值的情況
        const displayValues = condition.value.map((val) => {
          const option = fieldOption?.options.find((opt) => opt.value === val);
          return option?.label || val;
        });

        valueText =
          displayValues.length === 1
            ? displayValues[0]
            : `${displayValues[0]} 等${displayValues.length}項`;
      } else {
        valueText = '(未設定)';
      }
    } else {
      // 單一值的情況
      const option = fieldOption?.options.find(
        (opt) => opt.value === condition.value,
      );
      valueText = option?.label || condition.value || '(未設定)';
    }
  }

  return `${fieldLabel} ${typeLabel} ${valueText}`;
};

const FilterConditionItem: React.FC<FilterConditionItemProps> = ({
  condition,
  index,
  fieldOptions,
  onUpdate,
  onRemove,
}) => {
  const currentFieldOption = fieldOptions.find(
    (f) => f.field === condition.field,
  );
  const handleFieldChange = (field: string) => {
    onUpdate(index, { ...condition, field, value: [] });
  };

  const handleTypeChange = (type: 'include' | 'exclude') => {
    onUpdate(index, { ...condition, type });
  };

  const handleValueChange = (value: string | string[]) => {
    onUpdate(index, { ...condition, value });
  };

  const displayText = getConditionDisplayText(condition, fieldOptions);

  return (
    <StyledCollapse
      size='small'
      items={[
        {
          key: `condition-${index}`,
          label: (
            <Space>
              <FilterOutlined />
              <Text>{displayText}</Text>
            </Space>
          ),
          extra: (
            <Button
              type='text'
              size='small'
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              danger
            />
          ),
          children: (
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Space
                  direction='vertical'
                  style={{ width: '100%' }}
                  size='small'
                >
                  {/* 篩選欄位選擇 */}
                  <div>
                    <Text
                      style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      篩選欄位：
                    </Text>
                    <Select
                      style={{ width: '100%' }}
                      value={condition.field}
                      onChange={handleFieldChange}
                      placeholder='選擇篩選欄位'
                      showSearch
                      optionFilterProp='label'
                      options={fieldOptions.map((field) => ({
                        key: field.field,
                        value: field.field,
                        label: field.label,
                      }))}
                    />
                  </div>
                  {/* 包含/排除選擇 */}
                  <div>
                    <Text
                      style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      篩選類型：
                    </Text>
                    <Radio.Group
                      value={condition.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      size='small'
                    >
                      <Radio.Button value='include'>包含</Radio.Button>
                      <Radio.Button value='exclude'>排除</Radio.Button>
                    </Radio.Group>
                  </div>
                  {/* 篩選值輸入 */}
                  <div>
                    <Text
                      style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      篩選值：
                    </Text>
                    {currentFieldOption?.searchable &&
                    currentFieldOption.options.length === 0 ? (
                      // 純文本輸入字段
                      <Input
                        placeholder={`輸入${currentFieldOption.label}...`}
                        value={
                          typeof condition.value === 'string'
                            ? condition.value
                            : ''
                        }
                        onChange={(e) => handleValueChange(e.target.value)}
                        allowClear
                      />
                    ) : (
                      // 下拉選擇字段
                      <Select
                        mode='multiple'
                        style={{ width: '100%' }}
                        value={
                          Array.isArray(condition.value)
                            ? condition.value
                            : condition.value
                              ? [condition.value]
                              : []
                        }
                        onChange={(values) => handleValueChange(values)}
                        placeholder={`選擇${currentFieldOption?.label || '篩選值'}...`}
                        showSearch
                        allowClear
                        notFoundContent={
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description='無匹配選項'
                          />
                        }
                        maxTagCount={2}
                        maxTagPlaceholder={(omittedValues) =>
                          `+${omittedValues.length}...`
                        }
                        optionFilterProp='key'
                        options={currentFieldOption?.options.map((option) => ({
                          key: option.label,
                          label: (
                            <Space>
                              <span>{option.label}</span>
                              {option.count && (
                                <Tag color='blue'>{option.count}</Tag>
                              )}
                            </Space>
                          ),
                          value: option.value,
                        }))}
                      />
                    )}
                  </div>
                </Space>
              </Col>
            </Row>
          ),
        },
      ]}
    />
  );
};

const AdvancedFilterDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectAdvancedFilterDrawerOpen);
  const filterConditions = useAppSelector(selectFilterConditions);
  const courses = useAppSelector(selectCourses);

  // 使用自定義快速篩選器 hook
  useCustomQuickFilters();

  // 動態計算篩選選項
  const fieldOptions = useMemo(() => {
    return AdvancedFilterService.getFilterOptions(courses);
  }, [courses]);

  const handleClose = () => {
    dispatch(setAdvancedFilterDrawerOpen(false));
  };
  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      field: fieldOptions[0]?.field || 'name',
      type: 'include',
      value: [],
    };
    dispatch(addFilterCondition(newCondition));
  };

  const handleUpdateCondition = (index: number, condition: FilterCondition) => {
    dispatch(updateFilterCondition({ index, condition }));
  };

  const handleRemoveCondition = (index: number) => {
    dispatch(removeFilterCondition(index));
  };
  const handleClearAll = () => {
    dispatch(clearAllFilterConditions());
  };

  const handleQuickFilter = (filter: (typeof QUICK_FILTER)[0]) => {
    const newCondition: FilterCondition = {
      field: filter.field,
      type: 'include',
      value: [filter.value],
    };
    dispatch(addFilterCondition(newCondition));
  };

  return (
    <StyledDrawer
      title={
        <Space>
          <FilterOutlined />
          <span>課程精確篩選</span>
        </Space>
      }
      placement='left'
      mask={false}
      maskClosable={false}
      open={open}
      onClose={handleClose}
      extra={
        <Space>
          <Popconfirm
            title='清除所有篩選條件'
            onConfirm={handleClearAll}
            okText={'清除'}
            cancelText='取消'
          >
            <Button
              type='text'
              icon={<ClearOutlined />}
              disabled={filterConditions.length === 0}
              danger={filterConditions.length > 0}
            />
          </Popconfirm>
        </Space>
      }
    >
      <Space direction='vertical' style={{ width: '100%' }} size='small'>
        {/* 自定義快速篩選器 */}
        <CustomQuickFilters fieldOptions={fieldOptions} />

        <Divider style={{ margin: '8px 0' }} />

        {/* 系統預設快速篩選 */}
        <Card
          size='small'
          title={
            <Space>
              <ThunderboltOutlined />
              <span>系統快速篩選</span>
            </Space>
          }
        >
          <Space size={[8, 8]} wrap>
            {QUICK_FILTER.map((filter, index) => (
              <Button
                key={index}
                size='small'
                onClick={() => handleQuickFilter(filter)}
                disabled={filterConditions.some(
                  (condition) =>
                    condition.field === filter.field &&
                    Array.isArray(condition.value) &&
                    condition.value.includes(filter.value),
                )}
              >
                {filter.label}
              </Button>
            ))}
          </Space>
        </Card>
        {/* 新增篩選條件按鈕 */}
        <Button
          type='dashed'
          icon={<PlusOutlined />}
          onClick={handleAddCondition}
          block
          disabled={fieldOptions.length === 0}
        >
          新增篩選條件
        </Button>
        <Divider style={{ margin: '12px 0' }} />
        {/* 篩選條件列表 */}
        {filterConditions.length > 0 ? (
          <div>
            <Title level={5} style={{ margin: '0 0 12px 0' }}>
              篩選條件列表
            </Title>
            {filterConditions.map((condition, index) => (
              <FilterConditionItem
                key={`filter-${index}`}
                condition={condition}
                index={index}
                fieldOptions={fieldOptions}
                onUpdate={handleUpdateCondition}
                onRemove={handleRemoveCondition}
              />
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='尚未設定篩選條件'
          />
        )}
      </Space>
      <CustomFilterModal fieldOptions={fieldOptions} />
    </StyledDrawer>
  );
};

export default AdvancedFilterDrawer;
