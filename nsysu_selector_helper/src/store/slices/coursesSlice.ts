import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AcademicYear, Course, SelectedCourseConfig } from '@/types';
import { NSYSUCourseAPI } from '@/api';

// Helper function to load selected courses from localStorage
const loadSelectedCoursesFromStorage = (courses: Course[]): Course[] => {
  const savedSelectedCoursesIds = localStorage.getItem(
    'NSYSUCourseSelector.selectedCoursesNumbers',
  );

  if (!savedSelectedCoursesIds) return [];

  try {
    const selectedCourseIds = new Set(JSON.parse(savedSelectedCoursesIds));
    return courses.filter((course) => selectedCourseIds.has(course.id));
  } catch {
    return [];
  }
};

// 異步 actions
export const fetchAvailableSemesters = createAsyncThunk(
  'courses/fetchAvailableSemesters',
  async () => {
    return await NSYSUCourseAPI.getAvailableSemesters();
  },
);

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (semester: string) => {
    const updates = await NSYSUCourseAPI.getSemesterUpdates(semester);
    return await NSYSUCourseAPI.getCourses(semester, updates.latest);
  },
);

// State 類型定義
export interface CoursesState {
  courses: Course[];
  selectedCourses: Course[];
  availableSemesters: AcademicYear;
  selectedSemester: string;
  isLoading: boolean;
  error: string | null;
  // 新增已選課程配置狀態
  selectedCoursesConfig: Record<string, SelectedCourseConfig>;
}

// 初始狀態
const initialState: CoursesState = {
  courses: [],
  selectedCourses: [],
  availableSemesters: {
    latest: '',
    history: {},
  },
  selectedSemester: '',
  isLoading: false,
  error: null,
  selectedCoursesConfig: {},
};

// Slice
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    selectCourse: (
      state,
      action: PayloadAction<{ course: Course; isSelected: boolean }>,
    ) => {
      const { course, isSelected } = action.payload;
      if (isSelected) {
        // Add course if not already selected
        const isAlreadySelected = state.selectedCourses.some(
          (c) => c.id === course.id,
        );
        if (!isAlreadySelected) {
          state.selectedCourses.push(course);
        }
      } else {
        // Remove course if selected
        state.selectedCourses = state.selectedCourses.filter(
          (c) => c.id !== course.id,
        );
      }

      // Save to localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.selectedCoursesNumbers',
        JSON.stringify(state.selectedCourses.map((course) => course.id)),
      );
    },
    clearAllSelectedCourses: (state) => {
      state.selectedCourses = [];
      // Clear from localStorage
      localStorage.removeItem('NSYSUCourseSelector.selectedCoursesNumbers');
    },
    loadSelectedCourses: (state) => {
      if (state.courses.length > 0) {
        state.selectedCourses = loadSelectedCoursesFromStorage(state.courses);
      }
    },
    setSelectedSemester: (state, action: PayloadAction<string>) => {
      state.selectedSemester = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // 已選課程配置相關 actions
    setCourseConfig: (
      state,
      action: PayloadAction<{
        courseId: string;
        points: number;
        isExported: boolean;
      }>,
    ) => {
      const { courseId, points, isExported } = action.payload;
      state.selectedCoursesConfig[courseId] = {
        courseId,
        points: Math.max(0, Math.min(100, points)), // 確保點數在 0-100 範圍內
        isExported,
      };
      // 儲存到 localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.selectedCoursesConfig',
        JSON.stringify(state.selectedCoursesConfig),
      );
    },
    removeCourseConfig: (state, action: PayloadAction<string>) => {
      const courseId = action.payload;
      delete state.selectedCoursesConfig[courseId];
      // 儲存到 localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.selectedCoursesConfig',
        JSON.stringify(state.selectedCoursesConfig),
      );
    },
    loadSelectedCoursesConfig: (state) => {
      const savedConfig = localStorage.getItem(
        'NSYSUCourseSelector.selectedCoursesConfig',
      );
      if (savedConfig) {
        try {
          state.selectedCoursesConfig = JSON.parse(savedConfig);
        } catch {
          state.selectedCoursesConfig = {};
        }
      }
    },
    importCoursesFromScript: (
      state,
      action: PayloadAction<{
        courseIds: string[];
        configs: Record<string, SelectedCourseConfig>;
      }>,
    ) => {
      const { courseIds, configs } = action.payload;
      // 根據導入的課程 ID 添加到已選課程列表
      const newSelectedCourses = state.courses.filter(
        (course) =>
          courseIds.includes(course.id) &&
          !state.selectedCourses.some((selected) => selected.id === course.id),
      );
      state.selectedCourses.push(...newSelectedCourses);

      // 更新配置
      state.selectedCoursesConfig = {
        ...state.selectedCoursesConfig,
        ...configs,
      };

      // 儲存到 localStorage
      localStorage.setItem(
        'NSYSUCourseSelector.selectedCoursesNumbers',
        JSON.stringify(state.selectedCourses.map((course) => course.id)),
      );
      localStorage.setItem(
        'NSYSUCourseSelector.selectedCoursesConfig',
        JSON.stringify(state.selectedCoursesConfig),
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAvailableSemesters
      .addCase(fetchAvailableSemesters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSemesters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableSemesters = action.payload;
        state.selectedSemester = action.payload.latest;
      })
      .addCase(fetchAvailableSemesters.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Failed to fetch available semesters';
      })
      // fetchCourses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
        // 自動載入已選課程
        if (action.payload.length > 0) {
          state.selectedCourses = loadSelectedCoursesFromStorage(
            action.payload,
          );
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      });
  },
});

export const {
  selectCourse,
  clearAllSelectedCourses,
  loadSelectedCourses,
  setSelectedSemester,
  clearError,
  setCourseConfig,
  removeCourseConfig,
  loadSelectedCoursesConfig,
  importCoursesFromScript,
} = coursesSlice.actions;

export default coursesSlice;
