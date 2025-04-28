import React, { useEffect, useState } from 'react';
import { ConfigProvider, Spin, Splitter, Layout, Collapse } from 'antd';
import styled from 'styled-components';

import type { AcademicYear, Course } from '@/types';
import { useThemeConfig } from '@/hooks';
import { NSYSUCourseAPI } from '@/api';
import { CourseService } from '@/services';
import SectionHeader from '#/SectionHeader.tsx';
import EntryNotification from '#/EntryNotification.tsx';
import SelectorPanel from '#/SelectorPanel.tsx';
import ScheduleTable from '#/ScheduleTable.tsx';

const { Panel } = Collapse;

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

// 自定義 Collapse 樣式
const StyledCollapse = styled(Collapse)`
  .ant-collapse-item {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-collapse-content-box {
    padding: 8px !important;
  }

  .ant-collapse-header {
    background: #fafafa;
    padding: 12px 16px !important;
  }
`;

// 內容容器，確保可以滾動
const ContentWrapper = styled.div`
  height: 100%;
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
  const [activeKey, setActiveKey] = useState<string | string[]>([
    'schedulePanel',
  ]);

  // 處理手機版 Collapse 切換
  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(key);
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

      {/* 手機版垂直布局 - 使用 antd Collapse */}
      <MobileLayout>
        <StyledCollapse
          activeKey={activeKey}
          onChange={handleCollapseChange}
          expandIconPosition='end'
          style={{ borderRadius: 0 }}
          bordered={false}
        >
          <Panel key='schedulePanel' header='課程時間表'>
            <ContentWrapper>
              <ScheduleTable
                selectedCourses={selectedCourses}
                hoveredCourseId={hoveredCourseId}
              />
            </ContentWrapper>
          </Panel>
          <Panel key='selectorPanel' header='課程控制面板'>
            <ContentWrapper>
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
            </ContentWrapper>
          </Panel>
        </StyledCollapse>
      </MobileLayout>
    </ConfigProvider>
  );
};

export default App;
