import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AcademicYear, Course } from '@/types';
import { NSYSUCourseAPI } from '@/api';
import { CourseService } from '@/services';

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
  selectedCourses: Set<Course>;
  availableSemesters: AcademicYear;
  selectedSemester: string;
  isLoading: boolean;
  error: string | null;
}

// 初始狀態
const initialState: CoursesState = {
  courses: [],
  selectedCourses: new Set(),
  availableSemesters: {
    latest: '',
    history: {},
  },
  selectedSemester: '',
  isLoading: false,
  error: null,
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
      const newSelectedCourses = new Set(state.selectedCourses);
      state.selectedCourses = CourseService.selectCourse(
        newSelectedCourses,
        course,
        isSelected,
      );
    },
    clearAllSelectedCourses: (state) => {
      state.selectedCourses = CourseService.clearSelectedCourses();
    },
    loadSelectedCourses: (state) => {
      if (state.courses.length > 0) {
        state.selectedCourses = CourseService.loadSelectedCourses(
          state.courses,
        );
      }
    },
    setSelectedSemester: (state, action: PayloadAction<string>) => {
      state.selectedSemester = action.payload;
    },
    clearError: (state) => {
      state.error = null;
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
          state.selectedCourses = CourseService.loadSelectedCourses(
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
} = coursesSlice.actions;

export default coursesSlice;
