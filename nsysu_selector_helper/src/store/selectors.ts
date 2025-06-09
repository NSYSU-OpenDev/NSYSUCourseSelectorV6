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

// Time slot filter selectors
export const selectSelectedTimeSlots = (state: RootState) =>
  state.ui.selectedTimeSlots;

// Custom quick filters selectors
export const selectCustomQuickFilters = (state: RootState) =>
  state.ui.customQuickFilters;
export const selectShowCustomFilterModal = (state: RootState) =>
  state.ui.showCustomFilterModal;
export const selectEditingCustomFilter = (state: RootState) =>
  state.ui.editingCustomFilter;

// Course sorting selectors
export const selectSortConfig = (state: RootState) => state.ui.sortConfig;

// Course labels selectors
export const selectLabels = (state: RootState) => state.courseLabels.labels;
export const selectCourseLabelMap = (state: RootState) =>
  state.courseLabels.courseLabels;

// 取得特定課程的標籤
export const selectCourseLabels = (courseId: string) => (state: RootState) => {
  const labelIds = state.courseLabels.courseLabels[courseId] || [];
  const allLabels = state.courseLabels.labels;
  return labelIds
    .map((id) => allLabels.find((label) => label.id === id))
    .filter((label): label is NonNullable<typeof label> => label !== undefined);
};
