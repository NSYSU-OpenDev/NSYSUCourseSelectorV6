import { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSortConfig, setSortConfig } from '@/store';
import { CourseSortingService } from '@/services/courseSortingService';
import type { Course } from '@/types';

export const useCourseSorting = (courses: Course[]) => {
  const dispatch = useAppDispatch();
  const sortConfig = useAppSelector(selectSortConfig);

  // 在組件載入時從 localStorage 載入排序設定
  useEffect(() => {
    const savedConfig = CourseSortingService.loadSortConfig();
    if (
      savedConfig.option !== sortConfig.option ||
      savedConfig.direction !== sortConfig.direction
    ) {
      dispatch(setSortConfig(savedConfig));
    }
  }, [dispatch, sortConfig]);

  // 排序課程
  const sortedCourses = useMemo(() => {
    return CourseSortingService.sortCourses(courses, sortConfig);
  }, [courses, sortConfig]);

  return {
    sortedCourses,
    sortConfig,
  };
};
