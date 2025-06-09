import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CourseLabelsService, CourseLabel } from '@/services/courseLabelsService';

export interface CourseLabelsState {
  labels: CourseLabel[];
  courseLabels: Record<string, string[]>; // courseId -> label ids
}

const defaultLabels: CourseLabel[] = [
  { id: 'candidate', name: '候選中課程', color: '#ffe58f' },
  { id: 'favorite', name: '我的最愛', color: '#ffadd2' },
];

const persisted = CourseLabelsService.loadState();

const initialState: CourseLabelsState = {
  labels: persisted.labels.length > 0 ? persisted.labels : defaultLabels,
  courseLabels: persisted.courseLabels,
};

const courseLabelsSlice = createSlice({
  name: 'courseLabels',
  initialState,
  reducers: {
    addLabel: (state, action: PayloadAction<CourseLabel>) => {
      state.labels.push(action.payload);
      CourseLabelsService.saveState(state);
    },
    updateLabel: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CourseLabel> }>,
    ) => {
      const { id, updates } = action.payload;
      const index = state.labels.findIndex((l) => l.id === id);
      if (index !== -1) {
        state.labels[index] = { ...state.labels[index], ...updates };
        CourseLabelsService.saveState(state);
      }
    },
    removeLabel: (state, action: PayloadAction<string>) => {
      state.labels = state.labels.filter((l) => l.id !== action.payload);
      Object.keys(state.courseLabels).forEach((courseId) => {
        state.courseLabels[courseId] = state.courseLabels[courseId].filter(
          (id) => id !== action.payload,
        );
      });
      CourseLabelsService.saveState(state);
    },
    assignLabel: (
      state,
      action: PayloadAction<{ courseId: string; labelId: string }>,
    ) => {
      const { courseId, labelId } = action.payload;
      const labels = state.courseLabels[courseId] || [];
      if (!labels.includes(labelId)) {
        state.courseLabels[courseId] = [...labels, labelId];
        CourseLabelsService.saveState(state);
      }
    },
    removeCourseLabel: (
      state,
      action: PayloadAction<{ courseId: string; labelId: string }>,
    ) => {
      const { courseId, labelId } = action.payload;
      const labels = state.courseLabels[courseId] || [];
      state.courseLabels[courseId] = labels.filter((id) => id !== labelId);
      CourseLabelsService.saveState(state);
    },
  },
});

export const {
  addLabel,
  updateLabel,
  removeLabel,
  assignLabel,
  removeCourseLabel,
} = courseLabelsSlice.actions;

export default courseLabelsSlice;
