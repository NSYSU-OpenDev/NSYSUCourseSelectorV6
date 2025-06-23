import React, { useEffect } from 'react';
import { ConfigProvider, Spin, Splitter, Layout, Collapse, theme } from 'antd';
import type { CollapseProps } from 'antd';
import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAvailableSemesters,
  fetchCourses,
  setSelectedSemester,
  setSelectedTabKey,
  setActiveCollapseKey,
  loadSelectedCoursesConfig,
  loadThemeFromStorage,
  selectAvailableSemesters,
  selectSelectedSemester,
  selectCoursesLoading,
  selectSelectedTabKey,
  selectActiveCollapseKey,
  selectThemeConfig,
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
  .ant-collapse-content-box {
    padding: 8px !important;
  }

  .ant-collapse-header {
    padding: 12px 16px !important;
  }
`;

// 內容容器，確保可以滾動
const ContentWrapper = styled.div`
  height: 100%;
`;

const App: React.FC = () => {
  const themeConfig = useAppSelector(selectThemeConfig);
  const dispatch = useAppDispatch();

  // 初始化 - 獲取可用學期和載入已選課程配置
  useEffect(() => {
    dispatch(fetchAvailableSemesters());
    dispatch(loadSelectedCoursesConfig());
    dispatch(loadThemeFromStorage());
  }, [dispatch]);

  return (
    <ConfigProvider theme={themeConfig}>
      <AppContent />
    </ConfigProvider>
  );
};

// 內部組件，可以使用 theme token
const AppContent: React.FC = () => {
  const themeConfig = useAppSelector(selectThemeConfig);
  const { token } = theme.useToken();
  const dispatch = useAppDispatch();
  // 設置全局背景色和 scroll bar 樣式
  useEffect(() => {
    document.body.style.backgroundColor = token.colorBgContainer;

    // 設置 scroll bar 深色模式樣式
    const isDark = themeConfig.algorithm === theme.darkAlgorithm;

    // 移除舊的樣式
    const existingStyle = document.getElementById('scrollbar-theme');
    if (existingStyle) {
      existingStyle.remove();
    }

    // 添加新的 scroll bar 樣式
    const style = document.createElement('style');
    style.id = 'scrollbar-theme';
    style.textContent = `
      /* Webkit 瀏覽器的 scroll bar 樣式 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: ${isDark ? '#1f1f1f' : '#f1f1f1'};
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: ${isDark ? '#555' : '#888'};
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? '#777' : '#555'};
      }
      
      /* Firefox 的 scroll bar 樣式 */
      * {
        scrollbar-width: thin;
        scrollbar-color: ${isDark ? '#555 #1f1f1f' : '#888 #f1f1f1'};
      }
    `;

    document.head.appendChild(style);

    return () => {
      // 清理函數
      document.body.style.backgroundColor = '';
      const styleToRemove = document.getElementById('scrollbar-theme');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [token.colorBgContainer, themeConfig.algorithm]);

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
  ]; // 初始化 - 獲取可用學期和載入已選課程配置
  useEffect(() => {
    dispatch(fetchAvailableSemesters());
    dispatch(loadSelectedCoursesConfig());
    dispatch(loadThemeFromStorage());
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
