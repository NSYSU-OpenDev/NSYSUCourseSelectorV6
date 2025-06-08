import React, { useState } from 'react';
import { Button, Drawer, Space, Typography, Flex } from 'antd';
import { SortAscendingOutlined, SwapOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSortConfig, setSortConfig } from '@/store';
import {
  CourseSortingService,
  SortConfig,
  SortDirection,
  DEFAULT_SORT_OPTIONS,
} from '@/services/courseSortingService';

const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 16px;
  }
`;

const SortOptionItem = styled.div<{ selected: boolean }>`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.selected ? '#1890ff' : '#d9d9d9')};
  background: ${(props) => (props.selected ? '#f0f8ff' : '#fff')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1890ff;
    background: #f0f8ff;
  }
`;

const DirectionButton = styled(Button)<{ active: boolean }>`
  min-width: 80px;
  background: ${(props) => (props.active ? '#1890ff' : '#fff')};
  color: ${(props) => (props.active ? '#fff' : '#1890ff')};
  border-color: #1890ff;

  &:hover {
    background: ${(props) => (props.active ? '#40a9ff' : '#f0f8ff')};
    color: ${(props) => (props.active ? '#fff' : '#1890ff')};
    border-color: #40a9ff;
  }
`;

interface CourseSortSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const CourseSortSelector: React.FC<CourseSortSelectorProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const currentSortConfig = useAppSelector(selectSortConfig);

  const [tempConfig, setTempConfig] = useState<SortConfig>(currentSortConfig);

  const handleSortOptionChange = (optionKey: string) => {
    setTempConfig({
      ...tempConfig,
      option: optionKey,
    });
  };

  const handleDirectionChange = (direction: SortDirection) => {
    setTempConfig({
      ...tempConfig,
      direction,
    });
  };

  const handleApply = () => {
    dispatch(setSortConfig(tempConfig));
    CourseSortingService.saveSortConfig(tempConfig);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig = { option: 'default', direction: 'asc' as const };
    setTempConfig(defaultConfig);
  };

  const currentOption = DEFAULT_SORT_OPTIONS.find(
    (opt) => opt.key === tempConfig.option,
  );

  return (
    <StyledDrawer
      title='自訂課程排序'
      placement='left'
      open={visible}
      onClose={onClose}
      height='70vh'
      extra={
        <Space>
          <Button size='small' onClick={handleReset}>
            重置
          </Button>
          <Button type='primary' size='small' onClick={handleApply}>
            套用
          </Button>
        </Space>
      }
    >
      <Space direction='vertical' style={{ width: '100%' }} size={16}>
        {/* 排序選項 */}
        <div>
          <Typography.Text strong style={{ marginBottom: 8, display: 'block' }}>
            排序方式
          </Typography.Text>
          <Space direction='vertical' style={{ width: '100%' }} size={8}>
            {DEFAULT_SORT_OPTIONS.map((option) => (
              <SortOptionItem
                key={option.key}
                selected={tempConfig.option === option.key}
                onClick={() => handleSortOptionChange(option.key)}
              >
                <Space direction='vertical' size={2}>
                  <Typography.Text strong>{option.label}</Typography.Text>
                  <Typography.Text
                    type='secondary'
                    style={{ fontSize: '12px' }}
                  >
                    {option.description}
                  </Typography.Text>
                </Space>
              </SortOptionItem>
            ))}
          </Space>
        </div>

        {/* 排序方向 */}
        {tempConfig.option !== 'default' && (
          <div>
            <Typography.Text
              strong
              style={{ marginBottom: 8, display: 'block' }}
            >
              排序方向
            </Typography.Text>
            <Flex gap={8}>
              <DirectionButton
                active={tempConfig.direction === 'asc'}
                onClick={() => handleDirectionChange('asc')}
                icon={<SortAscendingOutlined />}
              >
                升序
              </DirectionButton>
              <DirectionButton
                active={tempConfig.direction === 'desc'}
                onClick={() => handleDirectionChange('desc')}
                icon={<SwapOutlined />}
              >
                降序
              </DirectionButton>
            </Flex>
            {currentOption && (
              <Typography.Text
                type='secondary'
                style={{ fontSize: '12px', marginTop: 8, display: 'block' }}
              >
                {tempConfig.direction === 'asc'
                  ? `${currentOption.label}由小到大`
                  : `${currentOption.label}由大到小`}
              </Typography.Text>
            )}
          </div>
        )}

        {/* 當前設定預覽 */}
        <div
          style={{
            padding: '12px',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <Typography.Text strong style={{ marginBottom: 4, display: 'block' }}>
            當前設定
          </Typography.Text>
          <Typography.Text type='secondary' style={{ fontSize: '12px' }}>
            {currentOption?.label}
            {tempConfig.option !== 'default' &&
              ` (${tempConfig.direction === 'asc' ? '升序' : '降序'})`}
          </Typography.Text>
        </div>
      </Space>
    </StyledDrawer>
  );
};

export default CourseSortSelector;
