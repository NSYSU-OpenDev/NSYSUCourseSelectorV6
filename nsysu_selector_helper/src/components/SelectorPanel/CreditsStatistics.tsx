import React, { useMemo } from 'react';
import { Statistic, Row, Col } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { CourseService } from '@/services/courseService';
import { useAppSelector } from '@/store/hooks';
import {
  selectSelectedCourses,
  selectCourses,
  selectSearchQuery,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
} from '@/store';

const StatisticsContainer = styled.div`
  padding: 6px 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 4px;
  margin: 4px 8px;
  border: 1px solid #e1f5fe;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const StyledStatistic = styled(Statistic)`
  .ant-statistic-title {
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 1px;
    line-height: 1.2;

    @media screen and (max-width: 768px) {
      font-size: 9px;
    }
  }

  .ant-statistic-content {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;

    @media screen and (max-width: 768px) {
      font-size: 11px;
    }
  }
`;

const CreditsStatistics: React.FC = () => {
  const { t } = useTranslation();
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const courses = useAppSelector(selectCourses);
  const searchQuery = useAppSelector(selectSearchQuery);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);

  // Calculate total credits and hours using the existing service
  const { totalCredits, totalHours } = useMemo(() => {
    const selectedCoursesSet = new Set(selectedCourses);
    return CourseService.calculateTotalCredits(selectedCoursesSet);
  }, [selectedCourses]);

  // 計算實際顯示的課程數量
  const displayedCoursesCount = useMemo(() => {
    // 根據搜尋條件篩選課程
    const filteredCourses = CourseService.searchCourses(courses, searchQuery);

    return filteredCourses.filter((course) => {
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
  }, [
    courses,
    searchQuery,
    selectedCourses,
    displaySelectedOnly,
    displayConflictCourses,
  ]);
  return (
    <StatisticsContainer>
      <Row gutter={[4, 0]} align='middle'>
        <Col xs={6} sm={6} md={6}>
          <StyledStatistic
            title={
              <span>
                <UnorderedListOutlined
                  style={{ marginRight: 2, fontSize: '10px' }}
                />
                篩選課程
              </span>
            }
            value={displayedCoursesCount}
            suffix='門'
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
        <Col xs={6} sm={6} md={6}>
          <StyledStatistic
            title={
              <span>
                <CheckCircleOutlined
                  style={{ marginRight: 2, fontSize: '10px' }}
                />
                已選課程
              </span>
            }
            value={selectedCourses.length}
            suffix='門'
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col xs={6} sm={6} md={6}>
          <StyledStatistic
            title={
              <span>
                <BookOutlined style={{ marginRight: 2, fontSize: '10px' }} />
                {t('creditsOverlay.totalCredits')}
              </span>
            }
            value={totalCredits}
            precision={1}
            suffix={t('creditsOverlay.credits')}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={6} sm={6} md={6}>
          <StyledStatistic
            title={
              <span>
                <ClockCircleOutlined
                  style={{ marginRight: 2, fontSize: '10px' }}
                />
                {t('creditsOverlay.totalHours')}
              </span>
            }
            value={totalHours}
            suffix={t('creditsOverlay.hours')}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
      </Row>
    </StatisticsContainer>
  );
};

export default CreditsStatistics;
