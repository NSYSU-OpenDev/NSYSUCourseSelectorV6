export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export actions
export {
  selectCourse,
  clearAllSelectedCourses,
  loadSelectedCourses,
  setSelectedSemester,
  clearError,
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
  clearAllFilterConditions,
  // 時間段篩選相關
  addTimeSlotFilter,
  removeTimeSlotFilter,
  toggleTimeSlotFilter,
  clearAllTimeSlotFilters,
} from './slices/uiSlice';

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
  selectFilterConditions,
  // 時間段篩選相關
  selectSelectedTimeSlots,
} from './selectors';
