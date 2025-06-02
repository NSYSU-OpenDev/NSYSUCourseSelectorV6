import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State 類型定義
export interface UIState {
  selectedTabKey: string;
  hoveredCourseId: string;
  activeCollapseKey: string | string[];
}

// 初始狀態
const initialState: UIState = {
  selectedTabKey: 'allCourses',
  hoveredCourseId: '',
  activeCollapseKey: ['schedulePanel'],
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
    setActiveCollapseKey: (state, action: PayloadAction<string | string[]>) => {
      state.activeCollapseKey = action.payload;
    },
  },
});

export const { setSelectedTabKey, setHoveredCourseId, setActiveCollapseKey } =
  uiSlice.actions;

export default uiSlice;
