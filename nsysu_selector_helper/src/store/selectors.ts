import type { RootState } from './store';

// Courses selectors
export const selectCourses = (state: RootState) => state.courses.courses;
export const selectSelectedCourses = (state: RootState) =>
  state.courses.selectedCourses;
export const selectAvailableSemesters = (state: RootState) =>
  state.courses.availableSemesters;
export const selectSelectedSemester = (state: RootState) =>
  state.courses.selectedSemester;
export const selectCoursesLoading = (state: RootState) =>
  state.courses.isLoading;
export const selectCoursesError = (state: RootState) => state.courses.error;

// UI selectors
export const selectSelectedTabKey = (state: RootState) =>
  state.ui.selectedTabKey;
export const selectHoveredCourseId = (state: RootState) =>
  state.ui.hoveredCourseId;
export const selectActiveCourseId = (state: RootState) =>
  state.ui.activeCourseId;
export const selectActiveCollapseKey = (state: RootState) =>
  state.ui.activeCollapseKey;
export const selectDisplaySelectedOnly = (state: RootState) =>
  state.ui.displaySelectedOnly;
export const selectDisplayConflictCourses = (state: RootState) =>
  state.ui.displayConflictCourses;
export const selectScrollToCourseId = (state: RootState) =>
  state.ui.scrollToCourseId;
export const selectSearchQuery = (state: RootState) => state.ui.searchQuery;

// Advanced filter selectors
export const selectAdvancedFilterDrawerOpen = (state: RootState) =>
  state.ui.advancedFilterDrawerOpen;
export const selectFilterConditions = (state: RootState) =>
  state.ui.filterConditions;
