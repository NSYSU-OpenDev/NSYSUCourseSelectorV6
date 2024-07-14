import React from 'react';
import { Virtuoso } from 'react-virtuoso';

import type { Course } from '@/types';
import { CourseService } from '@/services/courseService.ts';
import Header from '#/SelectorPanel/AllCourses/CoursesList/Header';
import Item from '#/SelectorPanel/AllCourses/CoursesList/Item';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

type CoursesListProps = {
  scheduleTableCollapsed: boolean;
  courses: Course[];
  displaySelectedOnly: boolean;
  selectedCourses: Set<Course>;
  displayConflictCourses: boolean;
  onSelectCourse: (course: Course, isSelected: boolean) => void;
  onHoverCourse: (courseId: string) => void;
  hoveredCourseId: string;
};

const CoursesList: React.FC<CoursesListProps> = ({
  scheduleTableCollapsed,
  courses,
  displaySelectedOnly,
  selectedCourses,
  displayConflictCourses,
  onSelectCourse,
  onHoverCourse,
  hoveredCourseId,
}) => {
  const { t } = useTranslation();

  const renderItem = (index: number) => {
    if (index === 0) {
      return <Header />;
    }

    // 由於頂部有一個固定項目，所以所有後續項目的索引都要向前移動一位
    const course = courses[index - 1];

    // 如果課程不存在，則不渲染該課程，動態篩選時可能會發生
    if (!course) return null;

    const isSelected = selectedCourses.has(course);
    const isHovered = hoveredCourseId === course.id;
    let isConflict = false;

    // 如果設定為僅顯示已選擇的課程，且當前課程未被選擇，則不渲染該課程
    if (displaySelectedOnly && !isSelected) {
      return null;
    }

    // 如果設定為顯示包含衝堂課程，則計算該課程是否衝堂
    if (displayConflictCourses) {
      isConflict = CourseService.detectTimeConflict(course, selectedCourses);
    }

    // 渲染課程項目
    return (
      <Item
        key={`course-${index}`}
        scheduleTableCollapsed={scheduleTableCollapsed}
        course={course}
        isSelected={isSelected}
        isConflict={isConflict}
        isHovered={isHovered}
        onSelectCourse={onSelectCourse}
        onHoverCourse={onHoverCourse}
      />
    );
  };

  if (courses.length === 0) {
    return (
      <>
        <Header />
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noData')} />
      </>
    );
  }

  const dataWithHeader = [{}, ...courses];

  return (
    <Virtuoso data={dataWithHeader} itemContent={renderItem} topItemCount={1} />
  );
};

export default CoursesList;
