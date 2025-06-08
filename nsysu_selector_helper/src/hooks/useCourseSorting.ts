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
    // 比較新舊配置結構是否不同
    const currentRules = sortConfig.rules || [];
    const savedRules = savedConfig.rules || [];

    const isDifferent =
      currentRules.length !== savedRules.length ||
      currentRules.some(
        (rule, index) =>
          rule.option !== savedRules[index]?.option ||
          rule.direction !== savedRules[index]?.direction,
      );

    if (isDifferent) {
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
