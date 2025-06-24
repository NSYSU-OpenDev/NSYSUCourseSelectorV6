import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Modal,
  Input,
  Typography,
  Flex,
  Tag,
  Empty,
} from 'antd';
import {
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import styled from 'styled-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { useTranslation } from '@/hooks';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSelectedCourses,
  selectSelectedCoursesConfig,
  selectHoveredCourseId,
  setCourseConfig,
  importCoursesFromScript,
  selectIsDarkMode,
} from '@/store';
import type { Course, ExportCourseData, SelectedCourseConfig } from '@/types';
import SelectedExportHeader from '#/SelectorPanel/SelectedExport/Header';
import SelectedExportItem from '#/Common/CoursesList/Item';

const { TextArea } = Input;
const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  div.ant-card-head {
    padding: 0;
  }

  div.ant-card-head-title {
    padding: 8px 12px;
  }

  div.ant-card-body {
    padding: 0;
  }
`;

interface CourseDataWithConfig {
  course: Course;
  points: number;
  isExported: boolean;
}

const SelectedExport: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const coursesConfig = useAppSelector(selectSelectedCoursesConfig);
  const hoveredCourseId = useAppSelector(selectHoveredCourseId);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isDark = useAppSelector(selectIsDarkMode);

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [scriptModalVisible, setScriptModalVisible] = useState(false);
  const [importScript, setImportScript] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');

  // 準備課程數據，包含配置信息
  const courseData = useMemo((): CourseDataWithConfig[] => {
    return selectedCourses.map((course) => {
      const config = coursesConfig[course.id] || {
        courseId: course.id,
        points: 0,
        isExported: false,
      };
      return {
        course,
        points: config.points,
        isExported: config.isExported,
      };
    });
  }, [selectedCourses, coursesConfig]);

  // 全選/全不選匯出
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      selectedCourses.forEach((course) => {
        const config = coursesConfig[course.id] || {
          courseId: course.id,
          points: 0,
          isExported: false,
        };
        dispatch(
          setCourseConfig({
            courseId: course.id,
            points: config.points,
            isExported: selected,
          }),
        );
      });
    },
    [selectedCourses, coursesConfig, dispatch],
  );

  // 生成匯出腳本
  const generateExportScript = useCallback(() => {
    const exportData: ExportCourseData[] = courseData
      .filter((item) => item.isExported)
      .map((item) => ({
        id: item.course.id,
        value: item.points,
        isSel: '1', // 1 表示選擇匯出
      }));

    if (exportData.length === 0) {
      void message.warning('請至少選擇一門課程進行匯出');
      return;
    }

    const script = `// 中山大學課程選課小幫手 - 自動填入腳本
// 生成時間: ${new Date().toLocaleString()}
// 匯出課程數量: ${exportData.length}

const frame = document.getElementById('main');
const doc = frame.contentDocument || frame.contentWindow.document;
const exportClass = ${JSON.stringify(exportData, null, 2)};

try {
    exportClass.forEach((ec, i) => {
        const inputs = doc.querySelectorAll('input');
        inputs[2*i].value = ec['id'];
        inputs[2*i+1].value = ec['value'];
        doc.querySelectorAll('select')[i].value = ec['isSel'];
    });
    console.log('自動填寫: 完成');
} catch (e) {
    console.error('自動填寫: 失敗: ' + e);
}`;

    setGeneratedScript(script);
    setScriptModalVisible(true);
    void message.success(t('selectedExport.exportScriptGenerated'));
  }, [courseData, t]);

  // 複製腳本到剪貼簿
  const copyScriptToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      message.success(t('selectedExport.copySuccess'));
    } catch {
      message.error('複製失敗，請手動複製');
    }
  }, [generatedScript, t]);

  // 匯入腳本
  const handleImportScript = useCallback(() => {
    try {
      // 嘗試從腳本中提取 exportClass 數據
      const match = importScript.match(/const exportClass = (\[[\s\S]*?]);/);
      if (!match) {
        void message.error(t('selectedExport.importError'));
        return;
      }

      const exportData: ExportCourseData[] = JSON.parse(match[1]);
      const courseIds = exportData.map((item) => item.id);
      const configs: Record<string, SelectedCourseConfig> = {};

      exportData.forEach((item) => {
        configs[item.id] = {
          courseId: item.id,
          points: item.value,
          isExported: item.isSel === '1',
        };
      });

      dispatch(importCoursesFromScript({ courseIds, configs }));
      void message.success(t('selectedExport.importSuccess'));
      setImportModalVisible(false);
      setImportScript('');
    } catch {
      void message.error(t('selectedExport.importError'));
    }
  }, [importScript, dispatch, t]);

  // 統計已選匯出的課程數量
  const exportedCount = useMemo(() => {
    return courseData.filter((item) => item.isExported).length;
  }, [courseData]);
  // 虛擬列表渲染項目
  const renderItem = (index: number) => {
    if (index === 0) {
      return <SelectedExportHeader />;
    }

    const item = courseData[index - 1];
    if (!item) return null;

    const isHovered = hoveredCourseId === item.course.id;

    return (
      <SelectedExportItem
        key={item.course.id}
        course={item.course}
        isHovered={isHovered}
        isSelected={false}
        isConflict={false}
        displayMode={'selected'}
      />
    );
  };

  const CardTitle = (
    <Flex justify='space-between' align='center'>
      <Title level={5} style={{ margin: 0 }}>
        {t('selectedExport.title')}
      </Title>
      <Space>
        <Button
          icon={<ImportOutlined />}
          onClick={() => setImportModalVisible(true)}
          size='small'
        >
          {t('selectedExport.importButton')}
        </Button>
        <Button
          type='primary'
          icon={<ExportOutlined />}
          onClick={generateExportScript}
          disabled={selectedCourses.length === 0}
          size='small'
        >
          {t('selectedExport.exportButton')}
        </Button>
      </Space>
    </Flex>
  );
  if (selectedCourses.length === 0) {
    return (
      <>
        <StyledCard title={CardTitle}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('selectedExport.noSelectedCourses')}
            />
          </div>
        </StyledCard>

        {/* 匯入腳本對話框 */}
        <Modal
          title={t('selectedExport.importButton')}
          open={importModalVisible}
          onOk={handleImportScript}
          onCancel={() => {
            setImportModalVisible(false);
            setImportScript('');
          }}
          width={600}
        >
          <TextArea
            value={importScript}
            onChange={(e) => setImportScript(e.target.value)}
            placeholder={t('selectedExport.importPlaceholder')}
            rows={10}
            style={{ fontFamily: 'monospace' }}
          />
        </Modal>
      </>
    );
  }

  const dataWithHeader = [null, ...courseData];

  return (
    <>
      <StyledCard title={CardTitle}>
        {/* 操作區域 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
          <Space direction='vertical' style={{ width: '100%' }} size='small'>
            <Text type='secondary' style={{ fontSize: '14px' }}>
              {t('selectedExport.exportDescription')}
            </Text>

            <Flex justify='space-between' align='center'>
              <Space>
                <Button size='small' onClick={() => handleSelectAll(true)}>
                  {t('selectedExport.selectAll')}
                </Button>
                <Button size='small' onClick={() => handleSelectAll(false)}>
                  {t('selectedExport.selectNone')}
                </Button>
              </Space>

              <Tag color='blue'>
                {t('selectedExport.totalExported', { count: exportedCount })}
              </Tag>
            </Flex>
          </Space>
        </div>

        {/* 課程列表 */}
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: 'calc(100vh - 210px)' }}
          data={dataWithHeader}
          itemContent={renderItem}
          topItemCount={1}
        />
      </StyledCard>

      {/* 匯入腳本對話框 */}
      <Modal
        title={t('selectedExport.importButton')}
        open={importModalVisible}
        onOk={handleImportScript}
        onCancel={() => {
          setImportModalVisible(false);
          setImportScript('');
        }}
        width={600}
      >
        <TextArea
          value={importScript}
          onChange={(e) => setImportScript(e.target.value)}
          placeholder={t('selectedExport.importPlaceholder')}
          rows={10}
          style={{ fontFamily: 'monospace' }}
        />
      </Modal>

      {/* 匯出腳本對話框 */}
      <Modal
        title={t('selectedExport.exportButton')}
        open={scriptModalVisible}
        onCancel={() => setScriptModalVisible(false)}
        width={800}
        footer={[
          <Button key='close' onClick={() => setScriptModalVisible(false)}>
            關閉
          </Button>,
          <Button
            key='copy'
            type='primary'
            icon={<CopyOutlined />}
            onClick={copyScriptToClipboard}
          >
            {t('selectedExport.copyScript')}
          </Button>,
        ]}
      >
        <SyntaxHighlighter
          language='javascript'
          style={isDark ? atomOneDark : atomOneLight}
        >
          {generatedScript}
        </SyntaxHighlighter>
      </Modal>
    </>
  );
};

export default SelectedExport;
