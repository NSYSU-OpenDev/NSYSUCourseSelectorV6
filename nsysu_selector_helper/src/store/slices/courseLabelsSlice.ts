import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CourseLabel,
  CourseLabelState,
} from '@/services/courseLabelService';
import { CourseLabelService } from '@/services/courseLabelService';
import { DEFAULT_LABELS } from '@/constants';

const loaded = CourseLabelService.load();

const initialState: CourseLabelState = {
  labels: loaded.labels.length > 0 ? loaded.labels : DEFAULT_LABELS,
  courseLabels: loaded.courseLabels,
};

const courseLabelsSlice = createSlice({
  name: 'courseLabels',
  initialState,
  reducers: {
    addLabel: (state, action: PayloadAction<CourseLabel>) => {
      state.labels.push(action.payload);
      CourseLabelService.save(state);
    },
    updateLabel: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<CourseLabel> }>,
    ) => {
      const { id, updates } = action.payload;
      const index = state.labels.findIndex((l) => l.id === id);
      if (index !== -1) {
        state.labels[index] = { ...state.labels[index], ...updates };
        CourseLabelService.save(state);
      }
    },
    removeLabel: (state, action: PayloadAction<string>) => {
      state.labels = state.labels.filter((l) => l.id !== action.payload);
      Object.keys(state.courseLabels).forEach((courseId) => {
        state.courseLabels[courseId] = state.courseLabels[courseId].filter(
          (id) => id !== action.payload,
        );
      });
      CourseLabelService.save(state);
    },
    assignLabel: (
      state,
      action: PayloadAction<{ courseId: string; labelId: string }>,
    ) => {
      const { courseId, labelId } = action.payload;
      const labels = state.courseLabels[courseId] || [];
      if (!labels.includes(labelId)) {
        state.courseLabels[courseId] = [...labels, labelId];
        CourseLabelService.save(state);
      }
    },
    removeCourseLabel: (
      state,
      action: PayloadAction<{ courseId: string; labelId: string }>,
    ) => {
      const { courseId, labelId } = action.payload;
      if (state.courseLabels[courseId]) {
        state.courseLabels[courseId] = state.courseLabels[courseId].filter(
          (id) => id !== labelId,
        );
        CourseLabelService.save(state);
      }
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
