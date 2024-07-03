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
}
