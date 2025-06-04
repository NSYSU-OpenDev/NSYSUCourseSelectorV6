import React, { useMemo } from 'react';
import { Card, Flex, Typography, Switch, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { CourseService } from '@/services/courseService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCourses,
  selectSelectedCourses,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
} from '@/store';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList';
import CreditsStatistics from '#/SelectorPanel/CreditsStatistics';

const StyledCard = styled(Card)`
  div.ant-card-body {
    padding: 0;
  }
`;

const AllCourses: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);

  // 計算實際顯示的課程數量
  const displayedCoursesCount = useMemo(() => {
    return courses.filter((course) => {
      const isSelected = selectedCourses.some((c) => c.id === course.id);

      // 如果設定為僅顯示已選擇的課程，且當前課程未被選擇，則不顯示
      if (displaySelectedOnly && !isSelected) {
        return false;
      }

      // 只對未選課程檢測時間衝突
      if (!isSelected) {
        const selectedCoursesSet = new Set(selectedCourses);
        const isConflict = CourseService.detectTimeConflict(
          course,
          selectedCoursesSet,
        );

        // 如果設定為不顯示衝突課程，且當前課程有衝突，則不顯示
        if (!displayConflictCourses && isConflict) {
          return false;
        }
      }

      return true;
    }).length;
  }, [courses, selectedCourses, displaySelectedOnly, displayConflictCourses]);

  const CardTitle = (
    <Flex
      justify={'center'}
      vertical={true}
      align={'center'}
      gap={10}
      style={{ padding: 5 }}
    >
      <Typography.Text type='secondary'>
        {t('allCourse.totalSelectedCourses')
          .replace('{totalCourses}', displayedCoursesCount.toString())
          .replace('{totalSelectedCourses}', selectedCourses.length.toString())}
      </Typography.Text>
      {/* 顯示控制選項 */}
      <Space size='small'>
        <Space>
          <Typography.Text>僅顯示已選課程：</Typography.Text>
          <Switch
            checked={displaySelectedOnly}
            onChange={(checked) => dispatch(setDisplaySelectedOnly(checked))}
            size='small'
          />
        </Space>
        <Space>
          <Typography.Text>顯示衝突課程：</Typography.Text>
          <Switch
            checked={displayConflictCourses}
            onChange={(checked) => dispatch(setDisplayConflictCourses(checked))}
            size='small'
          />
        </Space>
      </Space>
    </Flex>
  );
  return (
    <StyledCard title={CardTitle}>
      <CreditsStatistics />
      <CoursesList />
    </StyledCard>
  );
};

export default AllCourses;
