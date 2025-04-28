import React, { useEffect, useState } from 'react';
import { ConfigProvider, Spin, Splitter } from 'antd';
import styled from 'styled-components';

import type { AcademicYear, Course } from '@/types';
import { useThemeConfig } from '@/hooks/useThemeConfig';
import { NSYSUCourseAPI } from '@/api/NSYSUCourseAPI.ts';
import { CourseService } from '@/services/courseService.ts';
import SectionHeader from '#/SectionHeader.tsx';
import EntryNotification from '#/EntryNotification.tsx';
import SelectorPanel from '#/SelectorPanel.tsx';

const StyledSplitter = styled(Splitter)`
  height: calc(100vh - 52px);
`;

const App: React.FC = () => {
  const [themeConfig] = useThemeConfig();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTabKey, setSelectedTabKey] = useState('allCourses');
  const [availableSemesters, setAvailableSemesters] = useState<AcademicYear>({
    latest: '',
    history: {},
  });
  const [selectedSemester, setSelectedSemester] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<Course>>(
    new Set(),
  );
  const [hoveredCourseId, setHoveredCourseId] = useState('');

  useEffect(() => {
    NSYSUCourseAPI.getAvailableSemesters().then((availableSemesters) => {
      setAvailableSemesters(availableSemesters);
      setSelectedSemester(availableSemesters.latest);
    });
  }, []);

  useEffect(() => {
    if (selectedSemester === '') {
      return;
    }
    setIsLoading(true);
    NSYSUCourseAPI.getSemesterUpdates(selectedSemester)
      .then((updates) => {
        NSYSUCourseAPI.getCourses(selectedSemester, updates.latest).then(
          (courses) => {
            setCourses(courses);
            setTimeout(() => {
              setIsLoading(false);
            }, 250);
          },
        );
      })
      .catch((error) => {
        console.error(error);
        setTimeout(() => {
          setIsLoading(false);
        }, 250);
      });
  }, [selectedSemester]);

  useEffect(() => {
    if (courses.length === 0) return;

    setSelectedCourses(CourseService.loadSelectedCourses(courses));
  }, [courses]);

  const onSelectCourse = (course: Course, isSelected: boolean) => {
    const newSelectedCourses = new Set(selectedCourses);
    setSelectedCourses(
      CourseService.selectCourse(newSelectedCourses, course, isSelected),
    );
  };

  const onClearAllSelectedCourses = () => {
    setSelectedCourses(CourseService.clearSelectedCourses());
  };

  const onHoverCourse = (courseId: string) => {
    setHoveredCourseId(courseId);
  };

  return (
    <ConfigProvider theme={themeConfig}>
      {isLoading && <Spin spinning={true} fullscreen />}
      <EntryNotification />
      <SectionHeader
        selectedKey={selectedTabKey}
        setSelectedKey={setSelectedTabKey}
        availableSemesters={availableSemesters}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
      />
      <StyledSplitter>
        <Splitter.Panel collapsible={true}>
          <div>Schedule Table Content</div>
        </Splitter.Panel>
        <Splitter.Panel>
          <SelectorPanel
            selectedTabKey={selectedTabKey}
            courses={courses}
            selectedCourses={selectedCourses}
            onSelectCourse={onSelectCourse}
            onClearAllSelectedCourses={onClearAllSelectedCourses}
            hoveredCourseId={hoveredCourseId}
            onHoverCourse={onHoverCourse}
            availableSemesters={availableSemesters}
          />
        </Splitter.Panel>
      </StyledSplitter>
    </ConfigProvider>
  );
};

export default App;
