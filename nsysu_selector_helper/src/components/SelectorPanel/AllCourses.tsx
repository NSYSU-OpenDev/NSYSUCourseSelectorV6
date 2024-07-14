import React from 'react';
import { Card, Flex } from 'antd';
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
  scheduleTableCollapsed: boolean;
  courses: Course[];
  selectedCourses: Set<Course>;
  onSelectCourse: (course: Course, isSelected: boolean) => void;
  onClearAllSelectedCourses: () => void;
  hoveredCourseId: string;
  onHoverCourse: (courseId: string) => void;
};

const AllCourses: React.FC<AllCoursesProps> = ({
  scheduleTableCollapsed,
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
      <h3 style={{ margin: 0 }}>{t('allCourses')}</h3>
      <span>
        {t('allCourse.totalSelectedCourses')
          .replace('{totalCourses}', courses.length.toString())
          .replace('{totalSelectedCourses}', selectedCourses.size.toString())}
      </span>
    </Flex>
  );

  return (
    <StyledCard title={CardTitle}>
      <div style={{ height: '100vh' }}>
        <CoursesList
          scheduleTableCollapsed={scheduleTableCollapsed}
          courses={courses}
          displaySelectedOnly={false}
          selectedCourses={selectedCourses}
          displayConflictCourses={false}
          onSelectCourse={onSelectCourse}
          onHoverCourse={onHoverCourse}
          hoveredCourseId={hoveredCourseId}
        />
      </div>
    </StyledCard>
  );
};

export default AllCourses;
