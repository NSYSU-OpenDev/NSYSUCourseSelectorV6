import React from 'react';
import { Space, Button, Tag, Tooltip, Dropdown, message, Card } from 'antd';
import type { MenuProps } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCustomQuickFilters,
  selectFilterConditions,
} from '@/store/selectors';
import {
  addFilterCondition,
  removeCustomQuickFilter,
  setShowCustomFilterModal,
  setEditingCustomFilter,
} from '@/store/slices/uiSlice';
import {
  CustomQuickFiltersService,
  type CustomQuickFilter,
} from '@/services/customQuickFiltersService';
import type { FieldOptions } from '@/services/advancedFilterService';

interface CustomQuickFiltersProps {
  fieldOptions: FieldOptions[];
}

const CustomQuickFilters: React.FC<CustomQuickFiltersProps> = ({
  fieldOptions,
}) => {
  const dispatch = useAppDispatch();
  const customFilters = useAppSelector(selectCustomQuickFilters);
  const currentFilterConditions = useAppSelector(selectFilterConditions);

  const [messageApi, contextHolder] = message.useMessage();

  const handleApplyFilter = (filter: CustomQuickFilter) => {
    dispatch(addFilterCondition(filter.condition));
    void messageApi.success(`已套用篩選器：${filter.label}`);
  };

  const handleEditFilter = (filter: CustomQuickFilter) => {
    dispatch(setEditingCustomFilter(filter));
    dispatch(setShowCustomFilterModal(true));
  };

  const handleDeleteFilter = (filter: CustomQuickFilter) => {
    CustomQuickFiltersService.removeCustomFilter(filter.id);
    dispatch(removeCustomQuickFilter(filter.id));
    void messageApi.success('篩選器已刪除');
  };

  const handleAddNew = () => {
    dispatch(setEditingCustomFilter(null));
    dispatch(setShowCustomFilterModal(true));
  };

  const getFilterDisplayText = (filter: CustomQuickFilter): string => {
    const fieldOption = fieldOptions.find(
      (f) => f.field === filter.condition.field,
    );
    const fieldLabel = fieldOption?.label || filter.condition.field;
    const typeLabel = filter.condition.type === 'include' ? '包含' : '排除';

    let valueText = '(未設定)';
    if (filter.condition.value) {
      if (Array.isArray(filter.condition.value)) {
        if (filter.condition.value.length > 0) {
          const displayValues = filter.condition.value.map((val) => {
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
          (opt) => opt.value === filter.condition.value,
        );
        valueText = option?.label || filter.condition.value || '(未設定)';
      }
    }

    return `${fieldLabel} ${typeLabel} ${valueText}`;
  };

  const getDropdownMenuItems = (
    filter: CustomQuickFilter,
  ): MenuProps['items'] => [
    {
      key: 'edit',
      label: '編輯',
      icon: <EditOutlined />,
      onClick: () => handleEditFilter(filter),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '刪除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteFilter(filter),
    },
  ];
  if (customFilters.length === 0) {
    return (
      <Card
        size='small'
        title={
          <Space>
            <HeartOutlined style={{ color: '#8c8c8c' }} />
            <span>我的快速篩選器</span>
          </Space>
        }
        extra={
          <Tooltip title='新增篩選器'>
            <Button
              type='text'
              size='small'
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              disabled={fieldOptions.length === 0}
            />
          </Tooltip>
        }
      >
        <Button
          type='dashed'
          size='small'
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          disabled={fieldOptions.length === 0}
          style={{ width: '100%' }}
        >
          新增自定義篩選器
        </Button>
      </Card>
    );
  }

  return (
    <Card
      size='small'
      title={
        <Space>
          <HeartFilled style={{ color: '#ff4d4f' }} />
          <span>我的快速篩選器 ({customFilters.length})</span>
        </Space>
      }
      extra={
        <Space size='small'>
          <Tooltip title='新增篩選器'>
            <Button
              type='text'
              size='small'
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              disabled={fieldOptions.length === 0}
            />
          </Tooltip>
        </Space>
      }
    >
      {contextHolder}
      <Space direction='vertical' style={{ width: '100%' }} size='small'>
        <Space size={[8, 8]} wrap style={{ width: '100%' }}>
          {customFilters.map((filter) => (
            <Tooltip
              key={filter.id}
              title={getFilterDisplayText(filter)}
              placement='top'
            >
              <Tag
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  margin: 0,
                }}
                onClick={() => handleApplyFilter(filter)}
              >
                <span
                  style={{
                    maxWidth: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {filter.label}
                </span>
                <Dropdown
                  menu={{ items: getDropdownMenuItems(filter) }}
                  trigger={['click']}
                  placement='bottomRight'
                >
                  <Button
                    type='text'
                    size='small'
                    icon={<MoreOutlined />}
                    style={{
                      border: 'none',
                      padding: 0,
                      minWidth: 'auto',
                      height: 'auto',
                      lineHeight: 1,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </Tag>
            </Tooltip>
          ))}
        </Space>

        {currentFilterConditions.length > 0 && (
          <Button
            type='dashed'
            size='small'
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            style={{ width: '100%' }}
          >
            保存目前篩選條件
          </Button>
        )}
      </Space>
    </Card>
  );
};

export default CustomQuickFilters;
