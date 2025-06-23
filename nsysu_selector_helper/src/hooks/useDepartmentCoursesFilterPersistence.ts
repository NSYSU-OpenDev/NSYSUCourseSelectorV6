import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDepartmentCoursesFilters, setDepartmentCourses } from '@/store';
import { DepartmentCourseService } from '@/services';

/**
 * 系所課程篩選持久化 Hook
 * 自動載入和儲存篩選條件到 localStorage
 */
export const useDepartmentCoursesFilterPersistence = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectDepartmentCoursesFilters);

  // 初始化時載入儲存的篩選條件
  useEffect(() => {
    const savedFilters = DepartmentCourseService.loadFiltersFromStorage();
    if (
      savedFilters.selectedDepartments.length > 0 ||
      savedFilters.selectedGrades.length > 0 ||
      savedFilters.selectedClasses.length > 0 ||
      savedFilters.selectedCompulsoryTypes.length > 0
    ) {
      dispatch(setDepartmentCourses(savedFilters));
    }
  }, [dispatch]);

  // 篩選條件變更時儲存到 localStorage
  useEffect(() => {
    if (filters) {
      DepartmentCourseService.saveFiltersToStorage(filters);
    }
  }, [filters]);
};
