import React, { useEffect } from 'react';
import { ConfigProvider, Spin, Splitter, Layout, Collapse } from 'antd';
import type { CollapseProps } from 'antd';
import styled from 'styled-components';

import { useThemeConfig } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAvailableSemesters,
  fetchCourses,
  setSelectedSemester,
  setSelectedTabKey,
  setActiveCollapseKey,
  selectAvailableSemesters,
  selectSelectedSemester,
  selectCoursesLoading,
  selectSelectedTabKey,
  selectActiveCollapseKey,
} from '@/store';
import SectionHeader from '#/SectionHeader.tsx';
import EntryNotification from '#/EntryNotification.tsx';
import SelectorPanel from '#/SelectorPanel.tsx';
import ScheduleTable from '#/ScheduleTable.tsx';

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
  const dispatch = useAppDispatch();
  // Redux selectors
  const availableSemesters = useAppSelector(selectAvailableSemesters);
  const selectedSemester = useAppSelector(selectSelectedSemester);
  const isLoading = useAppSelector(selectCoursesLoading);
  const selectedTabKey = useAppSelector(selectSelectedTabKey);
  const activeKey = useAppSelector(selectActiveCollapseKey);
  // 處理手機版 Collapse 切換
  const handleCollapseChange = (key: string | string[]) => {
    dispatch(setActiveCollapseKey(key));
  };

  // 定義 Collapse items
  const collapseItems: CollapseProps['items'] = [
    {
      key: 'schedulePanel',
      label: '課程時間表',
      children: (
        <ContentWrapper>
          <ScheduleTable />
        </ContentWrapper>
      ),
    },
  ];

  // 初始化 - 獲取可用學期
  useEffect(() => {
    dispatch(fetchAvailableSemesters());
  }, [dispatch]);

  // 當選擇的學期改變時，獲取課程
  useEffect(() => {
    if (selectedSemester) {
      dispatch(fetchCourses(selectedSemester));
    }
  }, [dispatch, selectedSemester]);

  return (
    <ConfigProvider theme={themeConfig}>
      {isLoading && <Spin spinning={true} fullscreen />}
      <EntryNotification />
      <SectionHeader
        selectedKey={selectedTabKey}
        setSelectedKey={(key: string) => dispatch(setSelectedTabKey(key))}
        availableSemesters={availableSemesters}
        selectedSemester={selectedSemester}
        setSelectedSemester={(semester: string) =>
          dispatch(setSelectedSemester(semester))
        }
      />
      {/* 桌面版 */}
      <StyledSplitter>
        <Splitter.Panel collapsible={true} style={{ width: '100%' }}>
          <ScheduleTable />
        </Splitter.Panel>
        <Splitter.Panel>
          <SelectorPanel />
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
          items={collapseItems}
        />
        <ContentWrapper>
          <SelectorPanel />
        </ContentWrapper>
      </MobileLayout>
    </ConfigProvider>
  );
};

export default App;
