import React, { useEffect, useState } from 'react';
import { ConfigProvider, Spin, Splitter, Layout, Flex } from 'antd';
import styled from 'styled-components';

import type { AcademicYear, Course } from '@/types';
import { useThemeConfig } from '@/hooks';
import { NSYSUCourseAPI } from '@/api';
import { CourseService } from '@/services';
import SectionHeader from '#/SectionHeader.tsx';
import EntryNotification from '#/EntryNotification.tsx';
import SelectorPanel from '#/SelectorPanel.tsx';
import ScheduleTable from '#/ScheduleTable.tsx';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Content } = Layout;

const StyledSplitter = styled(Splitter)`
  height: calc(100vh - 52px);
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

// 手機版垂直布局容器
const MobileLayout = styled(Layout)`
  display: none;
  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
`;

// 手機版可摺疊容器
const CollapsibleSection = styled(Flex)<{
  $isVisible: boolean;
  $height: string;
}>`
  height: ${(props) => (props.$isVisible ? props.$height : '48px')};
  overflow: hidden;
  transition: height 0.3s ease-in-out;
  background: #fff;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
`;

const MobileToggleHeader = styled(Flex)`
  height: 48px;
  padding: 0 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  z-index: 2;
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
  const [mobileScheduleExpanded, setMobileScheduleExpanded] = useState(true);
  const [mobileSelectorExpanded, setMobileSelectorExpanded] = useState(
    !mobileScheduleExpanded,
  );

  // 在手機模式下點擊切換顯示區塊
  const toggleMobileSchedule = () => {
    setMobileScheduleExpanded(!mobileScheduleExpanded);
    if (mobileSelectorExpanded && !mobileScheduleExpanded) {
      setMobileSelectorExpanded(false);
    }
  };

  const toggleMobileSelector = () => {
    setMobileSelectorExpanded(!mobileSelectorExpanded);
    if (mobileScheduleExpanded && !mobileSelectorExpanded) {
      setMobileScheduleExpanded(false);
    }
  };

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

      {/* 桌面版 */}
      <StyledSplitter>
        <Splitter.Panel collapsible={true} style={{ width: '100%' }}>
          <ScheduleTable
            selectedCourses={selectedCourses}
            hoveredCourseId={hoveredCourseId}
          />
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

      {/* 手機版垂直布局 */}
      <MobileLayout>
        {/* 課表區塊 */}
        <CollapsibleSection
          $isVisible={mobileScheduleExpanded}
          $height={mobileScheduleExpanded ? '100%' : '48px'}
          vertical
        >
          <MobileToggleHeader
            justify='space-between'
            align='center'
            onClick={toggleMobileSchedule}
          >
            <span>課程時間表</span>
            {mobileScheduleExpanded ? <UpOutlined /> : <DownOutlined />}
          </MobileToggleHeader>
          <Content
            style={{
              padding: '0 8px',
              overflow: 'auto',
              height: 'calc(100% - 48px)',
            }}
          >
            <ScheduleTable
              selectedCourses={selectedCourses}
              hoveredCourseId={hoveredCourseId}
            />
          </Content>
        </CollapsibleSection>

        {/* 控制面板區塊 */}
        <CollapsibleSection
          $isVisible={mobileSelectorExpanded}
          $height={mobileSelectorExpanded ? '100%' : '48px'}
          vertical
          style={{ flex: 1 }}
        >
          <MobileToggleHeader
            justify='space-between'
            align='center'
            onClick={toggleMobileSelector}
          >
            <span>課程控制面板</span>
            {mobileSelectorExpanded ? <UpOutlined /> : <DownOutlined />}
          </MobileToggleHeader>
          <Content
            style={{
              padding: '0 8px',
              overflow: 'auto',
              height: 'calc(100% - 48px)',
            }}
          >
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
          </Content>
        </CollapsibleSection>
      </MobileLayout>
    </ConfigProvider>
  );
};

export default App;
