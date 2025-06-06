import React, { useMemo } from 'react';
import { Card, Flex, Typography, Switch, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { CourseService } from '@/services/courseService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCourses,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectSearchQuery,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setSearchQuery,
} from '@/store';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList';
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
  // 根據搜尋條件篩選課程
  const filteredCourses = useMemo(() => {
    return CourseService.searchCourses(courses, searchQuery);
  }, [courses, searchQuery]);
  const CardTitle = (
    <div>
      {/* 搜尋框 */}
      <Input
        placeholder='搜尋課程名稱、教師、課程代碼、系所...'
        prefix={<SearchOutlined />}
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        allowClear
        style={{ marginBottom: 8 }}
      />
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
    <StyledCard title={CardTitle}>
      <CreditsStatistics />
      <CoursesList filteredCourses={filteredCourses} />
    </StyledCard>
  );
};

export default AllCourses;
