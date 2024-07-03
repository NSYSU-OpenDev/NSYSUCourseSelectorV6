import React, { JSX } from 'react';

import type { AcademicYear, Course } from '@/types';
import { useTranslation } from 'react-i18next';
import AllCourses from '#/SelectorPanel/AllCourses.tsx';

type SelectorPanelProps = {
  scheduleTableCollapsed: boolean;
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
  scheduleTableCollapsed,
  selectedTabKeys,
  courses,
  selectedCourses,
  onSelectCourse,
  onClearAllSelectedCourses,
  hoveredCourseId,
  onHoverCourse,
}) => {
  const { t } = useTranslation();

  const mapTabToComponent = (tabKey: string): JSX.Element => {
    switch (tabKey) {
      case 'allCourses':
        return (
          <AllCourses
            scheduleTableCollapsed={scheduleTableCollapsed}
            courses={courses}
            selectedCourses={selectedCourses}
            onSelectCourse={onSelectCourse}
            onClearAllSelectedCourses={onClearAllSelectedCourses}
            hoveredCourseId={hoveredCourseId}
            onHoverCourse={onHoverCourse}
          />
        );
      case 'semesterCompulsory':
        return <h1>Semester Compulsory</h1>;
      case 'courseDetective':
        return <h1>Course Detective</h1>;
      case 'selectedExport':
        return <h1>Selected Export</h1>;
      case 'announcements':
        return <h1>Announcements</h1>;
      default:
        return <h1>{t('panelNotFound')}</h1>;
    }
  };
  return <>{mapTabToComponent(selectedTabKeys[0])}</>;
};

export default SelectorPanel;
