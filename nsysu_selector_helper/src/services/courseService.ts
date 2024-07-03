import type { Course } from '@/types';

export class CourseService {
  static loadSelectedCourses(courses: Course[]): Set<Course> {
    const savedSelectedCoursesIds = localStorage.getItem(
      'selectedCoursesNumbers',
    );

    if (!savedSelectedCoursesIds) return new Set();

    const selectedCourseIds = new Set(JSON.parse(savedSelectedCoursesIds));

    return new Set(
      courses.filter((course) => selectedCourseIds.has(course.id)),
    );
  }

  static selectCourse(
    selectedCourses: Set<Course>,
    course: Course,
    isSelected: boolean,
  ): Set<Course> {
    if (isSelected) {
      selectedCourses.add(course);
    } else {
      selectedCourses.delete(course);
    }

    localStorage.setItem(
      'selectedCoursesNumbers',
      JSON.stringify(Array.from(selectedCourses).map((course) => course.id)),
    );

    return selectedCourses;
  }

  static clearSelectedCourses(): Set<Course> {
    localStorage.removeItem('selectedCoursesNumbers');

    return new Set();
  }

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
}
