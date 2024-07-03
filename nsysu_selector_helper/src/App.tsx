import { FC, useEffect, useState } from 'react';
import { ConfigProvider, FloatButton, Spin } from 'antd';
import styled from 'styled-components';

import type { AcademicYear, Course } from '@/types';
import { useThemeConfig } from '@/hooks/useThemeConfig';
import { NSYSUCourseAPI } from '@/api/NSYSUCourseAPI.ts';
import SectionHeader from '#/SectionHeader.tsx';
import EntryNotification from '#/EntryNotification.tsx';
import SelectorPanel from '#/SelectorPanel.tsx';
import { CourseService } from '@/services/courseService.ts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  transition: all 0.5s;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const SlideContainer = styled.div<{ collapsed: boolean }>`
  transition: all 0.5s;
  flex: ${({ collapsed }) => (collapsed ? '0 0 0' : '0 0 50%')};
  overflow: hidden;
  height: ${({ collapsed }) => (collapsed ? '0' : 'auto')};

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
  }
`;

const ContentContainer = styled.div`
  transition: all 0.5s;
  flex: 1;
  padding: 16px;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
    flex: none;
  }
`;

const App: FC = () => {
  const [themeConfig] = useThemeConfig();

  const [scheduleTableCollapsed, setScheduleTableCollapsed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTabKeys, setSelectedTabKeys] = useState(['allCourses']);
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
    setSelectedCourses(
      CourseService.selectCourse(selectedCourses, course, isSelected),
    );
  };

  const onClearAllSelectedCourses = () => {
    setSelectedCourses(CourseService.clearSelectedCourses());
  };

  const onHoverCourse = (courseId: string) => {
    setHoveredCourseId(courseId);
  };

  const toggleScheduleTable = () => {
    setScheduleTableCollapsed(!scheduleTableCollapsed);
  };

  return (
    <ConfigProvider theme={themeConfig}>
      {isLoading && <Spin spinning={true} fullscreen />}
      <EntryNotification />
      <SectionHeader
        selectedKeys={selectedTabKeys}
        setSelectedKeys={setSelectedTabKeys}
        availableSemesters={availableSemesters}
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
      />
      <FloatButton onClick={toggleScheduleTable}>
        {scheduleTableCollapsed ? 'Show' : 'Hide'} Schedule Table
      </FloatButton>
      <Container>
        <SlideContainer collapsed={scheduleTableCollapsed}>
          <div>Schedule Table Content</div>
        </SlideContainer>
        <ContentContainer>
          <SelectorPanel
            selectedTabKeys={selectedTabKeys}
            courses={courses}
            selectedCourses={selectedCourses}
            onSelectCourse={onSelectCourse}
            onClearAllSelectedCourses={onClearAllSelectedCourses}
            hoveredCourseId={hoveredCourseId}
            onHoverCourse={onHoverCourse}
            availableSemesters={availableSemesters}
          />
        </ContentContainer>
      </Container>
    </ConfigProvider>
  );
};

export default App;
