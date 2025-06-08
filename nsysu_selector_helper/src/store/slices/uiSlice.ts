import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 精確篩選條件類型
export interface FilterCondition {
  field: string;
  type: 'include' | 'exclude';
  value: string | string[];
}

// 時間段篩選類型
export interface TimeSlotFilter {
  day: number; // 0-6 代表週一到週日
  timeSlot: string; // timeSlot key，如 '1', '2', 'A' 等
}

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
  // 精確篩選相關
  advancedFilterDrawerOpen: boolean;
  filterConditions: FilterCondition[];
  // 時間段篩選相關
  selectedTimeSlots: TimeSlotFilter[]; // 選中的時間段
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
  // 精確篩選相關
  advancedFilterDrawerOpen: false,
  filterConditions: [],
  // 時間段篩選相關
  selectedTimeSlots: [],
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
    // 精確篩選相關
    setAdvancedFilterDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.advancedFilterDrawerOpen = action.payload;
    },
    addFilterCondition: (state, action: PayloadAction<FilterCondition>) => {
      state.filterConditions.push(action.payload);
    },
    removeFilterCondition: (state, action: PayloadAction<number>) => {
      state.filterConditions.splice(action.payload, 1);
    },
    updateFilterCondition: (
      state,
      action: PayloadAction<{ index: number; condition: FilterCondition }>,
    ) => {
      const { index, condition } = action.payload;
      if (index >= 0 && index < state.filterConditions.length) {
        state.filterConditions[index] = condition;
      }
    },
    clearAllFilterConditions: (state) => {
      state.filterConditions = [];
    },
    // 時間段篩選相關
    addTimeSlotFilter: (state, action: PayloadAction<TimeSlotFilter>) => {
      // 檢查是否已經存在相同的時間段篩選
      const exists = state.selectedTimeSlots.some(
        (slot) =>
          slot.day === action.payload.day &&
          slot.timeSlot === action.payload.timeSlot,
      );
      if (!exists) {
        state.selectedTimeSlots.push(action.payload);
      }
    },
    removeTimeSlotFilter: (state, action: PayloadAction<TimeSlotFilter>) => {
      state.selectedTimeSlots = state.selectedTimeSlots.filter(
        (slot) =>
          !(
            slot.day === action.payload.day &&
            slot.timeSlot === action.payload.timeSlot
          ),
      );
    },
    toggleTimeSlotFilter: (state, action: PayloadAction<TimeSlotFilter>) => {
      const exists = state.selectedTimeSlots.some(
        (slot) =>
          slot.day === action.payload.day &&
          slot.timeSlot === action.payload.timeSlot,
      );
      if (exists) {
        state.selectedTimeSlots = state.selectedTimeSlots.filter(
          (slot) =>
            !(
              slot.day === action.payload.day &&
              slot.timeSlot === action.payload.timeSlot
            ),
        );
      } else {
        state.selectedTimeSlots.push(action.payload);
      }
    },
    clearAllTimeSlotFilters: (state) => {
      state.selectedTimeSlots = [];
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
} = uiSlice.actions;

export default uiSlice;
