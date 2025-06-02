import React from 'react';
import { Card, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useAppSelector } from '@/store/hooks';
import { selectCourses, selectSelectedCourses } from '@/store';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList';

const StyledCard = styled(Card)`
  div.ant-card-body {
    padding: 0;
  }
`;

const AllCourses: React.FC = () => {
  const { t } = useTranslation();
  const courses = useAppSelector(selectCourses);
  const selectedCourses = useAppSelector(selectSelectedCourses);

  const CardTitle = (
    <Flex
      justify={'center'}
      vertical={true}
      align={'center'}
      gap={2}
      style={{ padding: 5 }}
    >
      <Typography.Title level={3}>{t('allCourses')}</Typography.Title>{' '}
      <Typography.Text type='secondary'>
        {t('allCourse.totalSelectedCourses')
          .replace('{totalCourses}', courses.length.toString())
          .replace('{totalSelectedCourses}', selectedCourses.length.toString())}
      </Typography.Text>
    </Flex>
  );
  return (
    <StyledCard title={CardTitle}>
      <CoursesList displaySelectedOnly={false} displayConflictCourses={false} />
    </StyledCard>
  );
};

export default AllCourses;
