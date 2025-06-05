import React, { useMemo } from 'react';
import { Statistic, Row, Col } from 'antd';
import { BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { CourseService } from '@/services/courseService';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedCourses } from '@/store';

const StatisticsContainer = styled.div`
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 6px;
  margin: 8px;
  border: 1px solid #e1f5fe;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledStatistic = styled(Statistic)`
  .ant-statistic-title {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;

    @media screen and (max-width: 768px) {
      font-size: 10px;
    }
  }

  .ant-statistic-content {
    font-size: 14px;
    font-weight: 600;

    @media screen and (max-width: 768px) {
      font-size: 12px;
    }
  }
`;

const CreditsStatistics: React.FC = () => {
  const { t } = useTranslation();
  const selectedCourses = useAppSelector(selectSelectedCourses);

  // Calculate total credits and hours using the existing service
  const { totalCredits, totalHours } = useMemo(() => {
    const selectedCoursesSet = new Set(selectedCourses);
    return CourseService.calculateTotalCredits(selectedCoursesSet);
  }, [selectedCourses]);

  return (
    <StatisticsContainer>
      <Row gutter={[8, 4]} align='middle'>
        <Col xs={8} sm={8} md={8}>
          <StyledStatistic
            title={
              <span>
                <BookOutlined style={{ marginRight: 4 }} />
                {t('creditsOverlay.totalCredits')}
              </span>
            }
            value={totalCredits}
            precision={1}
            suffix={t('creditsOverlay.credits')}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={8} sm={8} md={8}>
          <StyledStatistic
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {t('creditsOverlay.totalHours')}
              </span>
            }
            value={totalHours}
            suffix={t('creditsOverlay.hours')}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={8} sm={8} md={8}>
          <div style={{ textAlign: 'center' }}>
            <StyledStatistic
              title={
                <span style={{ fontSize: '11px', fontWeight: 500 }}>
                  {t('creditsOverlay.coursesSelected')}
                </span>
              }
              value={selectedCourses.length}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: '11px', fontWeight: 500 }}>
                  {t('creditsOverlay.courses')}
                </span>
              }
              style={{ marginBottom: 0 }}
            />
          </div>
        </Col>
      </Row>
    </StatisticsContainer>
  );
};

export default CreditsStatistics;
