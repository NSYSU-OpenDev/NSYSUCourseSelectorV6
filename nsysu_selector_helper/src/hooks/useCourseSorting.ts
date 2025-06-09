import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectSortConfig } from '@/store';
import { CourseSortingService } from '@/services/courseSortingService';
import type { Course } from '@/types';

export const useCourseSorting = (courses: Course[]) => {
  const sortConfig = useAppSelector(selectSortConfig);

  // 排序課程
  const sortedCourses = useMemo(() => {
    return CourseSortingService.sortCourses(courses, sortConfig);
  }, [courses, sortConfig]);

  return {
    sortedCourses,
    sortConfig,
  };
};
