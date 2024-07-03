import React from 'react';
import { Card, Flex } from 'antd';

import type { Course } from '@/types';
import { useTranslation } from 'react-i18next';
import CoursesList from '#/SelectorPanel/AllCourses/CoursesList.tsx';

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
    <Card title={CardTitle}>
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
    </Card>
  );
};

export default AllCourses;
