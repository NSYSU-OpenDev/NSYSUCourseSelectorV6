import React, { useMemo, useState } from 'react';
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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectAdvancedFilterDrawerOpen,
  selectFilterConditions,
  selectCourses,
  setAdvancedFilterDrawerOpen,
  addFilterCondition,
  removeFilterCondition,
  updateFilterCondition,
  clearAllFilterConditions,
} from '@/store';
import {
  AdvancedFilterService,
  type FieldOptions,
} from '@/services/advancedFilterService';
import type { FilterCondition } from '@/store/slices/uiSlice';

const { Text, Title } = Typography;

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

const StatsContainer = styled.div`
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
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
  const value = condition.value || '(未設定)';

  return `${fieldLabel} ${typeLabel} ${value}`;
};

const FilterConditionItem: React.FC<FilterConditionItemProps> = ({
  condition,
  index,
  fieldOptions,
  onUpdate,
  onRemove,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const currentFieldOption = fieldOptions.find(
    (f) => f.field === condition.field,
  );

  const handleFieldChange = (field: string) => {
    onUpdate(index, { ...condition, field, value: '' });
  };

  const handleTypeChange = (type: 'include' | 'exclude') => {
    onUpdate(index, { ...condition, type });
  };

  const handleValueChange = (value: string) => {
    onUpdate(index, { ...condition, value });
  };

  // 篩選選項（用於搜尋）
  const filteredOptions = useMemo(() => {
    if (!currentFieldOption || currentFieldOption.searchable) return [];

    return currentFieldOption.options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [currentFieldOption, searchValue]);

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
                      optionFilterProp='children'
                    >
                      {fieldOptions.map((field) => (
                        <Select.Option key={field.field} value={field.field}>
                          {field.label}
                        </Select.Option>
                      ))}
                    </Select>
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
                    {currentFieldOption?.searchable ? (
                      <Input
                        placeholder={`輸入${currentFieldOption.label}...`}
                        value={condition.value}
                        onChange={(e) => handleValueChange(e.target.value)}
                        allowClear
                      />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        value={condition.value}
                        onChange={handleValueChange}
                        placeholder={`選擇${currentFieldOption?.label || '篩選值'}...`}
                        showSearch
                        optionFilterProp='children'
                        onSearch={setSearchValue}
                        allowClear
                        notFoundContent={
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description='無匹配選項'
                          />
                        }
                      >
                        {filteredOptions.map((option) => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            <Space>
                              <span>{option.label}</span>
                              {option.count && (
                                <Tag color='blue'>{option.count}</Tag>
                              )}
                            </Space>
                          </Select.Option>
                        ))}
                      </Select>
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

  // 動態計算篩選選項
  const fieldOptions = useMemo(() => {
    return AdvancedFilterService.getFilterOptions(courses);
  }, [courses]);

  // 計算篩選後的課程數量
  const filteredCoursesCount = useMemo(() => {
    return AdvancedFilterService.filterCourses(courses, filterConditions)
      .length;
  }, [courses, filterConditions]);

  const handleClose = () => {
    dispatch(setAdvancedFilterDrawerOpen(false));
  };

  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      field: fieldOptions[0]?.field || 'name',
      type: 'include',
      value: '',
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

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          <span>課程精確篩選</span>
        </Space>
      }
      placement='right'
      width={400}
      open={open}
      onClose={handleClose}
      extra={
        <Space>
          <Tooltip title='清除所有篩選條件'>
            <Button
              type='text'
              icon={<ClearOutlined />}
              onClick={handleClearAll}
              disabled={filterConditions.length === 0}
            />
          </Tooltip>
        </Space>
      }
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {/* 統計資訊 */}
        <StatsContainer>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1890ff',
                  }}
                >
                  {filteredCoursesCount}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  篩選後課程
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#52c41a',
                  }}
                >
                  {filterConditions.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>篩選條件</div>
              </div>
            </Col>
          </Row>
        </StatsContainer>

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
    </Drawer>
  );
};

export default AdvancedFilterDrawer;
