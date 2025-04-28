import React from 'react';
import { Card, Flex, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { Course } from '@/types';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList';

const StyledCard = styled(Card)`
  div.ant-card-body {
    padding: 0;
  }
`;

type AllCoursesProps = {
  courses: Course[];
  selectedCourses: Set<Course>;
  onSelectCourse: (course: Course, isSelected: boolean) => void;
  onClearAllSelectedCourses: () => void;
  hoveredCourseId: string;
  onHoverCourse: (courseId: string) => void;
};

const AllCourses: React.FC<AllCoursesProps> = ({
  courses,
  selectedCourses,
  onSelectCourse,
  hoveredCourseId,
  onHoverCourse,
}) => {
  const { t } = useTranslation();

  const CardTitle = (
    <Flex
      justify={'center'}
      vertical={true}
      align={'center'}
      gap={2}
      style={{ padding: 5 }}
    >
      <Typography.Title level={3}>{t('allCourses')}</Typography.Title>
      <Typography.Text type='secondary'>
        {t('allCourse.totalSelectedCourses')
          .replace('{totalCourses}', courses.length.toString())
          .replace('{totalSelectedCourses}', selectedCourses.size.toString())}
      </Typography.Text>
    </Flex>
  );

  return (
    <StyledCard title={CardTitle}>
      <CoursesList
        courses={courses}
        displaySelectedOnly={false}
        selectedCourses={selectedCourses}
        displayConflictCourses={false}
        onSelectCourse={onSelectCourse}
        onHoverCourse={onHoverCourse}
        hoveredCourseId={hoveredCourseId}
      />
    </StyledCard>
  );
};

export default AllCourses;
