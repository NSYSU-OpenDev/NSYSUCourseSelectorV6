import React, { useRef, useEffect } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import { CourseService } from '@/services/courseService.ts';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSelectedCourses,
  selectHoveredCourseId,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectScrollToCourseId,
  setScrollToCourseId,
} from '@/store';
import { Course } from '@/types';
import Header from '#/SelectorPanel/AllCourses/CoursesList/Header';
import Item from '#/SelectorPanel/AllCourses/CoursesList/Item';

interface CoursesListProps {
  filteredCourses: Course[];
}

const CoursesList: React.FC<CoursesListProps> = ({ filteredCourses }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  // Redux state
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const hoveredCourseId = useAppSelector(selectHoveredCourseId);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);
  const scrollToCourseId = useAppSelector(selectScrollToCourseId);

  // 處理滾動到特定課程
  useEffect(() => {
    if (scrollToCourseId && virtuosoRef.current) {
      const courseIndex = filteredCourses.findIndex(
        (c) => c.id === scrollToCourseId,
      );
      if (courseIndex !== -1) {
        // Add 1 to account for the header
        virtuosoRef.current.scrollToIndex({
          index: courseIndex + 1,
          align: 'center',
          behavior: 'smooth',
        });
        // 清除滾動狀態，避免重複滾動
        dispatch(setScrollToCourseId(''));
      }
    }
  }, [scrollToCourseId, filteredCourses, dispatch]);

  const renderItem = (index: number) => {
    if (index === 0) {
      return <Header />;
    } // 由於頂部有一個固定項目，所以所有後續項目的索引都要向前移動一位
    const course = filteredCourses[index - 1];

    // 如果課程不存在，則不渲染該課程，動態篩選時可能會發生
    if (!course) return null;
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    const isHovered = hoveredCourseId === course.id;
    let isConflict = false;

    // 如果設定為僅顯示已選擇的課程，且當前課程未被選擇，則不渲染該課程
    if (displaySelectedOnly && !isSelected) {
      return null;
    }

    // 只對未選課程檢測時間衝突
    if (!isSelected) {
      const selectedCoursesSet = new Set(selectedCourses);
      isConflict = CourseService.detectTimeConflict(course, selectedCoursesSet);

      // 如果設定為不顯示衝突課程，且當前課程有衝突，則不渲染該課程
      // 但已選課程永遠不被隱藏
      if (!displayConflictCourses && isConflict) {
        return null;
      }
    }

    // 渲染課程項目
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

  if (filteredCourses.length === 0) {
    return (
      <>
        <Header />
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noData')} />
      </>
    );
  }

  const dataWithHeader = [{}, ...filteredCourses];
  return (
    <Virtuoso
      ref={virtuosoRef}
      style={{ height: 'calc(100vh - 205px)' }}
      data={dataWithHeader}
      itemContent={renderItem}
      topItemCount={1}
    />
  );
};

export default CoursesList;
