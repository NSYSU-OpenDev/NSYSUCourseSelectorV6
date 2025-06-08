import React from 'react';
import { Button } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector } from '@/store/hooks';
import { selectSortConfig } from '@/store';
import { DEFAULT_SORT_OPTIONS } from '@/constants';

const SortButton = styled(Button)`
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;

  .ant-btn-icon {
    font-size: 12px;
  }
`;

interface CompactSortButtonProps {
  onClick: () => void;
}

const CompactSortButton: React.FC<CompactSortButtonProps> = ({ onClick }) => {
  const sortConfig = useAppSelector(selectSortConfig);

  // 獲取第一個排序規則作為主要顯示
  const primaryRule = sortConfig.rules?.[0];
  const currentOption = DEFAULT_SORT_OPTIONS.find(
    (opt: { key: string }) => opt.key === primaryRule?.option,
  );

  const isDefaultSort = primaryRule?.option === 'default';
  const sortIcon =
    primaryRule?.direction === 'asc' ? (
      <SortAscendingOutlined />
    ) : (
      <SortDescendingOutlined />
    );

  // 顯示排序規則數量（如果有多個）
  const ruleCount = sortConfig.rules?.length || 0;
  const displayText =
    ruleCount > 1
      ? `${currentOption?.label || '預設'} (+${ruleCount - 1})`
      : currentOption?.label || '預設';

  return (
    <SortButton
      size='small'
      type={isDefaultSort ? 'default' : 'primary'}
      icon={!isDefaultSort ? sortIcon : undefined}
      onClick={onClick}
    >
      {displayText}
    </SortButton>
  );
};

export default CompactSortButton;
