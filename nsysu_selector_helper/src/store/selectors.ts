import { createSelector } from '@reduxjs/toolkit';
import { theme } from 'antd';
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

// Selected courses config selectors
export const selectSelectedCoursesConfig = (state: RootState) =>
  state.courses.selectedCoursesConfig;

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

// Department courses panel selectors
export const selectDepartmentCoursesSelectedDepartments = (state: RootState) =>
  state.ui.departmentCourses.selectedDepartments;
export const selectDepartmentCoursesSelectedGrades = (state: RootState) =>
  state.ui.departmentCourses.selectedGrades;
export const selectDepartmentCoursesSelectedClasses = (state: RootState) =>
  state.ui.departmentCourses.selectedClasses;
export const selectDepartmentCoursesSelectedCompulsoryTypes = (
  state: RootState,
) => state.ui.departmentCourses.selectedCompulsoryTypes;
export const selectDepartmentCoursesFilters = (state: RootState) =>
  state.ui.departmentCourses;

// Course labels selectors
export const selectLabels = (state: RootState) => state.courseLabels.labels;
export const selectCourseLabelMap = (state: RootState) =>
  state.courseLabels.courseLabels;

// 取得特定課程的標籤 (使用 createSelector 進行記憶化)
export const selectCourseLabels = createSelector(
  [
    (state: RootState) => state.courseLabels.courseLabels,
    (state: RootState) => state.courseLabels.labels,
    (_state: RootState, courseId: string) => courseId,
  ],
  (courseLabelMap, allLabels, courseId) => {
    const labelIds = courseLabelMap[courseId] || [];
    return labelIds
      .map((id) => allLabels.find((label) => label.id === id))
      .filter(
        (label): label is NonNullable<typeof label> => label !== undefined,
      );
  },
);

// 取得特定課程的配置
export const selectCourseConfig = (courseId: string) =>
  createSelector(
    [selectSelectedCoursesConfig],
    (configs) =>
      configs[courseId] || { courseId, points: 0, isExported: false },
  );

// 取得所有已匯出的課程配置
export const selectExportedCoursesConfig = createSelector(
  [selectSelectedCoursesConfig],
  (configs) => Object.values(configs).filter((config) => config.isExported),
);

// Theme selectors
export const selectTheme = (state: RootState) => state.theme;
export const selectPrimaryColor = (state: RootState) =>
  state.theme.primaryColor;
export const selectAlgorithms = (state: RootState) => state.theme.algorithms;
export const selectBorderRadius = (state: RootState) =>
  state.theme.borderRadius;

// Theme config selector (computed)
export const selectThemeConfig = createSelector([selectTheme], (themeState) => {
  const { primaryColor, algorithms, borderRadius } = themeState;

  if (algorithms.length === 1 && algorithms[0] === 'defaultAlgorithm') {
    return {
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: primaryColor,
        borderRadius: borderRadius,
      },
    };
  }

  const algorithmFunctions = algorithms
    .filter((algo) => algo !== 'defaultAlgorithm')
    .map((algo) => theme[algo]);

  return {
    algorithm:
      algorithmFunctions.length > 0
        ? algorithmFunctions
        : theme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      borderRadius: borderRadius,
    },
  };
});
