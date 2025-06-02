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
export const selectActiveCollapseKey = (state: RootState) =>
  state.ui.activeCollapseKey;
