export interface CourseLabel {
  id: string;
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface CourseLabelState {
  labels: CourseLabel[];
  courseLabels: Record<string, string[]>;
}

const STORAGE_KEY = 'NSYSUCourseSelector.courseLabels';

export class CourseLabelService {
  /**
   * 載入標籤資料
   */
  static load(): CourseLabelState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CourseLabelState;
        if (
          parsed &&
          Array.isArray(parsed.labels) &&
          typeof parsed.courseLabels === 'object'
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return { labels: [], courseLabels: {} };
  }

  /**
   * 儲存標籤資料
   */
  static save(state: CourseLabelState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save course labels:', error);
    }
  }
}
