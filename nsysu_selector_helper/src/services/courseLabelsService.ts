export interface CourseLabel {
  id: string;
  name: string;
  color: string;
  borderColor?: string;
}

interface StoredState {
  labels: CourseLabel[];
  courseLabels: Record<string, string[]>;
}

const STORAGE_KEY = 'NSYSUCourseSelector.courseLabels';

export class CourseLabelsService {
  static loadState(): StoredState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredState;
        if (
          parsed &&
          Array.isArray(parsed.labels) &&
          typeof parsed.courseLabels === 'object'
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load course labels:', error);
    }
    return { labels: [], courseLabels: {} };
  }

  static saveState(state: StoredState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save course labels:', error);
    }
  }
}
