import { AcademicYear, Course, SemesterUpdate } from '@/types';

const BASE_URL = 'https://whats2000.github.io/NSYSUCourseAPI';

export class NSYSUCourseAPI {
  /**
   * 取得所有可用學期列表
   */
  static async getAvailableSemesters(): Promise<AcademicYear> {
    const response = await fetch(`${BASE_URL}/version.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch available semesters');
    }
    return response.json();
  }

  /**
   * 取得指定學年度的學期更新資訊
   * @param academicYear - 學年度
   */
  static async getSemesterUpdates(academicYear: string): Promise<SemesterUpdate> {
    const response = await fetch(`${BASE_URL}/${academicYear}/version.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch semester updates');
    }
    return response.json();
  }

  /**
   * 取得指定學年度、更新時間的所有課程
   * @param academicYear - 學年度
   * @param updateTime - 更新時間
   */
  static async getCourses(academicYear: string, updateTime: string): Promise<Course[]> {
    const response = await fetch(`${BASE_URL}/${academicYear}/${updateTime}/all.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json().then((courses: Course[]) => {
      return Array.from(new Set(courses.map(course => course.id)))
        .map(id => courses.find(course => course.id === id)!);
    });
  }

  /**
   * 取得最新學期的所有課程
   */
  static async getLatestCourses(): Promise<Course[]> {
    const semesters = await NSYSUCourseAPI.getAvailableSemesters();
    const latestAcademicYear = semesters.latest;
    const updates = await NSYSUCourseAPI.getSemesterUpdates(latestAcademicYear);
    const latestUpdateTime = updates.latest;
    return NSYSUCourseAPI.getCourses(latestAcademicYear, latestUpdateTime);
  }
}
