import React, { useMemo, useState } from 'react';
import {
  Card,
  Flex,
  Typography,
  Switch,
  Space,
  Input,
  Button,
  Badge,
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { CourseService } from '@/services/courseService';
import { AdvancedFilterService } from '@/services/advancedFilterService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useCourseSorting, useFilterPersistence, useSortPersistence } from '@/hooks';
import {
  selectCourses,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectSearchQuery,
  selectFilterConditions,
  selectSelectedTimeSlots,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setSearchQuery,
  setAdvancedFilterDrawerOpen,
} from '@/store';
import CoursesList from '#/Common/CoursesList';
import AdvancedFilterDrawer from '#/SelectorPanel/AllCourses/AdvancedFilterDrawer';
import CreditsStatistics from '#/SelectorPanel/AllCourses/CreditsStatistics';
import CompactSortButton from '#/SelectorPanel/AllCourses/CompactSortButton';
import CourseSortSelector from '#/SelectorPanel/AllCourses/CourseSortSelector';

const StyledCard = styled(Card)`
  div.ant-card-head {
    padding: 0;
  }

  div.ant-card-head-title {
    padding: 8px 12px;
  }

  div.ant-card-body {
    padding: 0;
  }
`;

const AllCourses: React.FC = () => {
  useFilterPersistence();
  useSortPersistence();
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);
  const searchQuery = useAppSelector(selectSearchQuery);
  const filterConditions = useAppSelector(selectFilterConditions);
  const selectedTimeSlots = useAppSelector(selectSelectedTimeSlots);

  // 排序相關狀態
  const [sortSelectorVisible, setSortSelectorVisible] = useState(false);

  // 根據搜尋條件、精確篩選條件和時間段篩選條件篩選課程
  const filteredCourses = useMemo(() => {
    // 先進行基本搜尋
    let result = CourseService.searchCourses(courses, searchQuery);

    // 再進行精確篩選
    if (filterConditions.length > 0) {
      result = AdvancedFilterService.filterCourses(result, filterConditions);
    }

    // 最後進行時間段篩選
    if (selectedTimeSlots.length > 0) {
      result = CourseService.filterCoursesByTimeSlots(
        result,
        selectedTimeSlots,
      );
    }

    return result;
  }, [courses, searchQuery, filterConditions, selectedTimeSlots]);

  // 使用排序 hook
  const { sortedCourses } = useCourseSorting(filteredCourses);

  const handleOpenAdvancedFilter = () => {
    dispatch(setAdvancedFilterDrawerOpen(true));
  };

  const handleOpenSortSelector = () => {
    setSortSelectorVisible(true);
  };

  const handleCloseSortSelector = () => {
    setSortSelectorVisible(false);
  };

  const CardTitle = (
    <div>
      {/* 搜尋框和篩選按鈕 */}
      <Flex gap={8} style={{ marginBottom: 8 }}>
        <Input
          placeholder='搜尋課程名稱、教師、課程代碼、系所...'
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          allowClear
          style={{ flex: 1 }}
        />
        <Badge
          count={filterConditions.length}
          size='small'
          style={{ zIndex: 100 }}
        >
          {/* 篩選按鈕 */}
          <Button
            icon={<FilterOutlined />}
            onClick={handleOpenAdvancedFilter}
            type={filterConditions.length > 0 ? 'primary' : 'default'}
          >
            精確篩選
          </Button>
        </Badge>
      </Flex>
      {/* 控制選項 */}
      <Flex justify='space-between' align='center' wrap='wrap' gap={8}>
        {/* 左側：排序按鈕 */}
        <CompactSortButton onClick={handleOpenSortSelector} />

        {/* 右側：開關選項 */}
        <Space size='small'>
          <Space size={4}>
            <Typography.Text style={{ fontSize: '12px' }}>
              僅顯示已選：
            </Typography.Text>
            <Switch
              checked={displaySelectedOnly}
              onChange={(checked) => dispatch(setDisplaySelectedOnly(checked))}
              size='small'
            />
          </Space>
          <Space size={4}>
            <Typography.Text style={{ fontSize: '12px' }}>
              顯示衝突：
            </Typography.Text>
            <Switch
              checked={displayConflictCourses}
              onChange={(checked) =>
                dispatch(setDisplayConflictCourses(checked))
              }
              size='small'
            />
          </Space>
        </Space>
      </Flex>
    </div>
  );
  return (
    <>
      <StyledCard title={CardTitle}>
        <CreditsStatistics />
        <CoursesList
          filteredCourses={sortedCourses}
          displayConflictCourses={displayConflictCourses}
          displaySelectedOnly={displaySelectedOnly}
        />
      </StyledCard>
      <AdvancedFilterDrawer />
      <CourseSortSelector
        visible={sortSelectorVisible}
        onClose={handleCloseSortSelector}
      />
    </>
  );
};

export default AllCourses;
