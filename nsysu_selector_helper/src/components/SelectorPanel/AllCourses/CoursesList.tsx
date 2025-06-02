import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import { CourseService } from '@/services/courseService.ts';
import { useAppSelector } from '@/store/hooks';
import {
  selectCourses,
  selectSelectedCourses,
  selectHoveredCourseId,
} from '@/store';
import Header from '#/SelectorPanel/AllCourses/CoursesList/Header';
import Item from '#/SelectorPanel/AllCourses/CoursesList/Item';

type CoursesListProps = {
  displaySelectedOnly: boolean;
  displayConflictCourses: boolean;
};

const CoursesList: React.FC<CoursesListProps> = ({
  displaySelectedOnly,
  displayConflictCourses,
}) => {
  const { t } = useTranslation();

  // Redux state
  const courses = useAppSelector(selectCourses);
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const hoveredCourseId = useAppSelector(selectHoveredCourseId);

  const renderItem = (index: number) => {
    if (index === 0) {
      return <Header />;
    }

    // 由於頂部有一個固定項目，所以所有後續項目的索引都要向前移動一位
    const course = courses[index - 1];

    // 如果課程不存在，則不渲染該課程，動態篩選時可能會發生
    if (!course) return null;
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    const isHovered = hoveredCourseId === course.id;
    let isConflict = false;

    // 如果設定為僅顯示已選擇的課程，且當前課程未被選擇，則不渲染該課程
    if (displaySelectedOnly && !isSelected) {
      return null;
    }

    // 如果設定為顯示包含衝堂課程，則計算該課程是否衝堂
    if (displayConflictCourses) {
      const selectedCoursesSet = new Set(selectedCourses);
      isConflict = CourseService.detectTimeConflict(course, selectedCoursesSet);
    } // 渲染課程項目
    return (
      <Item
        key={`course-${index}`}
        course={course}
        isSelected={isSelected}
        isConflict={isConflict}
        isHovered={isHovered}
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
    <Virtuoso
      style={{ height: 'calc(100vh - 155px)' }}
      data={dataWithHeader}
      itemContent={renderItem}
      topItemCount={1}
    />
  );
};

export default CoursesList;
