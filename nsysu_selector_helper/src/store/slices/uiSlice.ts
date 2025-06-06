import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State 類型定義
export interface UIState {
  selectedTabKey: string;
  hoveredCourseId: string;
  activeCourseId: string; // 手機端用於跟蹤活動課程
  activeCollapseKey: string | string[];
  displaySelectedOnly: boolean;
  displayConflictCourses: boolean;
  scrollToCourseId: string;
  searchQuery: string; // 搜尋關鍵字
}

// 初始狀態
const initialState: UIState = {
  selectedTabKey: 'allCourses',
  hoveredCourseId: '',
  activeCourseId: '',
  activeCollapseKey: ['schedulePanel'],
  displaySelectedOnly: false,
  displayConflictCourses: true,
  scrollToCourseId: '',
  searchQuery: '',
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedTabKey: (state, action: PayloadAction<string>) => {
      state.selectedTabKey = action.payload;
    },
    setHoveredCourseId: (state, action: PayloadAction<string>) => {
      state.hoveredCourseId = action.payload;
    },
    setActiveCourseId: (state, action: PayloadAction<string>) => {
      state.activeCourseId = action.payload;
    },
    setActiveCollapseKey: (state, action: PayloadAction<string | string[]>) => {
      state.activeCollapseKey = action.payload;
    },
    setDisplaySelectedOnly: (state, action: PayloadAction<boolean>) => {
      state.displaySelectedOnly = action.payload;
    },
    setDisplayConflictCourses: (state, action: PayloadAction<boolean>) => {
      state.displayConflictCourses = action.payload;
    },
    setScrollToCourseId: (state, action: PayloadAction<string>) => {
      state.scrollToCourseId = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setSelectedTabKey,
  setHoveredCourseId,
  setActiveCourseId,
  setActiveCollapseKey,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setScrollToCourseId,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice;
