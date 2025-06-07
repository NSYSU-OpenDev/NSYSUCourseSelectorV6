import React, { useMemo } from 'react';
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
import {
  selectCourses,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectSearchQuery,
  selectFilterConditions,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setSearchQuery,
  setAdvancedFilterDrawerOpen,
} from '@/store';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList';
import AdvancedFilterDrawer from '#/SelectorPanel/AllCourses/AdvancedFilterDrawer';
import CreditsStatistics from '#/SelectorPanel/CreditsStatistics';

const StyledCard = styled(Card)`
  div.ant-card-head {
    padding: 8px 12px;
  }

  div.ant-card-body {
    padding: 0;
  }
`;

const AllCourses: React.FC = () => {
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);
  const searchQuery = useAppSelector(selectSearchQuery);
  const filterConditions = useAppSelector(selectFilterConditions);

  // 根據搜尋條件和精確篩選條件篩選課程
  const filteredCourses = useMemo(() => {
    // 先進行基本搜尋
    let result = CourseService.searchCourses(courses, searchQuery);

    // 再進行精確篩選
    if (filterConditions.length > 0) {
      result = AdvancedFilterService.filterCourses(result, filterConditions);
    }

    return result;
  }, [courses, searchQuery, filterConditions]);

  const handleOpenAdvancedFilter = () => {
    dispatch(setAdvancedFilterDrawerOpen(true));
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
        <Badge count={filterConditions.length} size='small'>
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
      <Flex justify='flex-end' align='center' wrap='wrap' gap={8}>
        <Space size='small'>
          <Space size={4}>
            <Typography.Text style={{ fontSize: '12px' }}>
              僅顯示已選課程：
            </Typography.Text>
            <Switch
              checked={displaySelectedOnly}
              onChange={(checked) => dispatch(setDisplaySelectedOnly(checked))}
              size='small'
            />
          </Space>
          <Space size={4}>
            <Typography.Text style={{ fontSize: '12px' }}>
              顯示衝突課程：
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
        <CoursesList filteredCourses={filteredCourses} />
      </StyledCard>
      <AdvancedFilterDrawer />
    </>
  );
};

export default AllCourses;
