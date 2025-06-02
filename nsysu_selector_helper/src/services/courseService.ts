import type { Course } from '@/types';

export class CourseService {
  /**
   * 檢查兩門課程是否有時間衝突
   * @param course1 第一門課程
   * @param course2 第二門課程
   * @return 如果有時間衝突，返回 true；否則返回 false
   */
  private static hasTimeConflict(course1: Course, course2: Course): boolean {
    for (let i = 0; i < 7; i++) {
      const time1 = course1.classTime[i];
      const time2 = course2.classTime[i];

      if (time1 && time2) {
        const timeSlots1 = time1.split('');
        const timeSlots2 = time2.split('');

        for (const slot1 of timeSlots1) {
          if (timeSlots2.includes(slot1)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 計算當前選課的總學分和總時數
   * @param selectedCourses 選擇的課程集合
   * @return 返回一個對象，包含總學分和總時數
   */
  static calculateTotalCredits(selectedCourses: Set<Course>): {
    totalCredits: number;
    totalHours: number;
  } {
    let totalCredits = 0;
    let totalHours = 0;

    selectedCourses.forEach((course) => {
      totalCredits += parseFloat(course.credit ?? '0.0');
      totalHours += course.classTime.flat().length;
    });

    return { totalCredits, totalHours };
  }

  /**
   * 檢測新選擇的課程是否與已選課程有時間衝突
   * @param course 新選擇的課程
   * @param selectedCourses 已選課程集合
   * @return 如果有時間衝突，返回 true；否則返回 false
   */
  static detectTimeConflict(
    course: Course,
    selectedCourses: Set<Course>,
  ): boolean {
    for (const selectedCourse of selectedCourses) {
      if (this.hasTimeConflict(course, selectedCourse)) {
        return true;
      }
    }
    return false;
  }
}
