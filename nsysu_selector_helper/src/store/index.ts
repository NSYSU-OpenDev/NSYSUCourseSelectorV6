export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export actions
export {
  selectCourse,
  clearAllSelectedCourses,
  loadSelectedCourses,
  setSelectedSemester,
  clearError,
  setCourseConfig,
  removeCourseConfig,
  loadSelectedCoursesConfig,
  importCoursesFromScript,
  fetchAvailableSemesters,
  fetchCourses,
} from './slices/coursesSlice';

export {
  setSelectedTabKey,
  setHoveredCourseId,
  setActiveCourseId,
  setActiveCollapseKey,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setScrollToCourseId,
  setSearchQuery,
  setAdvancedFilterDrawerOpen,
  addFilterCondition,
  removeFilterCondition,
  updateFilterCondition,
  setFilterConditions,
  clearAllFilterConditions, // 時間段篩選相關
  addTimeSlotFilter,
  removeTimeSlotFilter,
  toggleTimeSlotFilter,
  clearAllTimeSlotFilters,
  setSelectedTimeSlots,
  // 課程排序相關
  setSortConfig,
  // 系所課程面板篩選相關
  setDepartmentCoursesSelectedDepartments,
  setDepartmentCoursesSelectedGrades,
  setDepartmentCoursesSelectedClasses,
  setDepartmentCoursesSelectedCompulsoryTypes,
  resetDepartmentCoursesFilters,
  setDepartmentCourses,
} from './slices/uiSlice';

export {
  addLabel,
  updateLabel,
  removeLabel,
  assignLabel,
  removeCourseLabel,
} from './slices/courseLabelsSlice';

// Export selectors
export {
  selectCourses,
  selectSelectedCourses,
  selectAvailableSemesters,
  selectSelectedSemester,
  selectCoursesLoading,
  selectCoursesError,
  selectSelectedTabKey,
  selectHoveredCourseId,
  selectActiveCourseId,
  selectActiveCollapseKey,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectScrollToCourseId,
  selectSearchQuery,
  selectAdvancedFilterDrawerOpen,
  selectFilterConditions, // 時間段篩選相關
  selectSelectedTimeSlots,
  // 課程排序相關
  selectSortConfig,
  // 系所課程面板篩選相關
  selectDepartmentCoursesSelectedDepartments,
  selectDepartmentCoursesSelectedGrades,
  selectDepartmentCoursesSelectedClasses,
  selectDepartmentCoursesSelectedCompulsoryTypes,
  selectDepartmentCoursesFilters,
  selectLabels,
  selectCourseLabelMap,
  // 已選課程配置相關
  selectSelectedCoursesConfig,
  selectCourseConfig,
  selectExportedCoursesConfig,
} from './selectors';
