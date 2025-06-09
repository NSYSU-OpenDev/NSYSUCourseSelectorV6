import React, { useRef, useEffect, useMemo } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Empty, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';

import { CourseService } from '@/services/courseService.ts';
import { useAppSelector, useAppDispatch } from '@/store/hooks.ts';
import {
  selectSelectedCourses,
  selectHoveredCourseId,
  selectScrollToCourseId,
  setScrollToCourseId,
} from '@/store';
import { Course } from '@/types';
import Header from '#/Common/CoursesList/Header';
import Item from '#/Common/CoursesList/Item';

const ScrollSeekPlaceholder: React.FC<{ height: number }> = ({ height }) => (
  <div style={{ height, padding: '8px', boxSizing: 'border-box' }}>
    <Skeleton active title={false} paragraph={{ rows: 1 }} />
  </div>
);

interface CoursesListProps {
  filteredCourses: Course[];
  displaySelectedOnly: boolean;
  displayConflictCourses: boolean;
}

const CoursesList: React.FC<CoursesListProps> = ({
  filteredCourses,
  displaySelectedOnly,
  displayConflictCourses,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  // Redux state
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const hoveredCourseId = useAppSelector(selectHoveredCourseId);
  const scrollToCourseId = useAppSelector(selectScrollToCourseId);

  // 根據顯示設定過濾課程，避免在虛擬列表渲染階段返回 null
  const displayCourses = useMemo(() => {
    const selectedIds = new Set(selectedCourses.map((c) => c.id));
    const selectedCoursesSet = new Set(selectedCourses);
    return filteredCourses.filter((course) => {
      const isSelected = selectedIds.has(course.id);
      if (displaySelectedOnly && !isSelected) {
        return false;
      }

      if (!isSelected && !displayConflictCourses) {
        return !CourseService.detectTimeConflict(course, selectedCoursesSet);
      }

      return true;
    });
  }, [
    filteredCourses,
    selectedCourses,
    displaySelectedOnly,
    displayConflictCourses,
  ]);

  // 處理滾動到特定課程
  useEffect(() => {
    if (scrollToCourseId && virtuosoRef.current) {
      const courseIndex = displayCourses.findIndex(
        (c) => c.id === scrollToCourseId,
      );
      if (courseIndex !== -1) {
        // Add 1 to account for the header
        virtuosoRef.current.scrollToIndex({
          index: courseIndex + 1,
          align: 'center',
        });
        // 清除滾動狀態，避免重複滾動
        dispatch(setScrollToCourseId(''));
      }
    }
  }, [scrollToCourseId, displayCourses, dispatch]);

  const renderItem = (index: number) => {
    if (index === 0) {
      return <Header />;
    }

    // 由於頂部有一個固定項目，所以所有後續項目的索引都要向前移動一位
    const course = displayCourses[index - 1];

    // 如果課程不存在，則不渲染該課程，動態篩選時可能會發生
    if (!course) return null;
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    const isHovered = hoveredCourseId === course.id;
    let isConflict = false;

    // 只對未選課程檢測時間衝突
    if (!isSelected) {
      const selectedCoursesSet = new Set(selectedCourses);
      isConflict = CourseService.detectTimeConflict(course, selectedCoursesSet);
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

  if (displayCourses.length === 0) {
    return (
      <>
        <Header />
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noData')} />
      </>
    );
  }

  const dataWithHeader = [{}, ...displayCourses];
  return (
    <Virtuoso
      ref={virtuosoRef}
      style={{ height: 'calc(100vh - 205px)' }}
      data={dataWithHeader}
      itemContent={renderItem}
      topItemCount={1}
      components={{ ScrollSeekPlaceholder }}
      scrollSeekConfiguration={{
        enter: (velocity) => Math.abs(velocity) > 100,
        exit: (velocity) => Math.abs(velocity) < 30,
      }}
    />
  );
};

export default CoursesList;
