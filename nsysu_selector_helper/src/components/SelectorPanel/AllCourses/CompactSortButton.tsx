import React from 'react';
import { Button } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector } from '@/store/hooks';
import { selectSortConfig } from '@/store';
import { DEFAULT_SORT_OPTIONS } from '@/services/courseSortingService';

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

  const currentOption = DEFAULT_SORT_OPTIONS.find(
    (opt) => opt.key === sortConfig.option,
  );

  const isDefaultSort = sortConfig.option === 'default';
  const sortIcon =
    sortConfig.direction === 'asc' ? (
      <SortAscendingOutlined />
    ) : (
      <SortDescendingOutlined />
    );

  return (
    <SortButton
      size='small'
      type={isDefaultSort ? 'default' : 'primary'}
      icon={!isDefaultSort ? sortIcon : undefined}
      onClick={onClick}
    >
      {currentOption?.label || '預設'}
    </SortButton>
  );
};

export default CompactSortButton;
