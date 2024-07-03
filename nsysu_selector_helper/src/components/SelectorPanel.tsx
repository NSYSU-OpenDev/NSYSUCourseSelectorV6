import React from 'react';

import type { AcademicYear, Course } from '@/types';

type SelectorPanelProps = {
  selectedTabKeys: string[];
  courses: Course[];
  selectedCourses: Set<Course>;
  onSelectCourse: (course: Course, isSelected: boolean) => void;
  onClearAllSelectedCourses: () => void;
  hoveredCourseId: string;
  onHoverCourse: (courseId: string) => void;
  availableSemesters: AcademicYear;
};

const SelectorPanel: React.FC<SelectorPanelProps> = ({
  selectedTabKeys,
  courses,
}) => {
  return (
    <div>
      <h1>{selectedTabKeys}</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SelectorPanel;
