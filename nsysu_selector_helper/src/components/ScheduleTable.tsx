import React, { ReactNode, useState } from 'react';
import { Card, Table, Typography, Tooltip, Tag, Switch, Space } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import type { Course } from '@/types';
import { timeSlot } from '@/constants';
import { useWindowSize } from '@/hooks';

const { Text } = Typography;

const StyledCard = styled(Card)`
  height: 100%;

  .ant-card-body {
    padding: 0;
    overflow: auto;
  }
`;

// Fix StyledTable to preserve generic type parameter
const StyledTable = styled(Table)`
  .ant-table-tbody > tr > td {
    padding: 4px;
    text-align: center;
    vertical-align: middle;
  }

  .ant-table {
    width: 100%;
  }

  // 手機版樣式調整
  @media screen and (max-width: 768px) {
    .ant-table-thead > tr > th {
      padding: 4px;
      font-size: 12px;
    }

    .ant-table-tbody > tr > td {
      padding: 2px;
      font-size: 11px;
    }
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* 為iOS添加慣性滾動 */
`;

const CourseTag = styled(Tag)<{ $isHovered?: boolean }>`
  width: 100%;
  margin: 2px 0;
  padding: 2px 4px;
  font-size: 12px;
  line-height: 1.2;
  white-space: pre-wrap;
  text-align: center;
  cursor: pointer;
  transform: ${(props) => (props.$isHovered ? 'scale(1.05)' : 'none')};
  box-shadow: ${(props) =>
    props.$isHovered ? '0 0 5px rgba(24, 144, 255, 0.5)' : 'none'};
  transition: all 0.2s;

  @media screen and (max-width: 768px) {
    font-size: 10px;
    padding: 1px 2px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
`;

// Define proper interface for schedule table row data
interface ScheduleTableRow {
  key: string;
  time: string;

  [key: `day${number}`]: ReactNode;
}

interface ScheduleTableProps {
  selectedCourses: Set<Course>;
  hoveredCourseId: string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  selectedCourses,
  hoveredCourseId,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [showWeekends, setShowWeekends] = useState(true);

  // 計算每個欄位的固定寬度 - 為手機優化
  const timeColumnWidth = isMobile ? 36 : 60;
  const dayColumnWidth = isMobile ? 45 : 80; // 減小每天欄位在手機上的寬度

  // 將課程按時間段和星期分組
  const getScheduleData = () => {
    const scheduleMap: Record<string, Record<number, Course[]>> = {};

    // 初始化時間表
    timeSlot.forEach((slot) => {
      scheduleMap[slot.key] = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      };
    });

    // 填充課程資料
    selectedCourses.forEach((course) => {
      course.classTime.forEach((dayTime, dayIndex) => {
        if (!dayTime) return;

        // 解析時間段
        const timeSlots = dayTime.split('');
        timeSlots.forEach((slot) => {
          if (scheduleMap[slot]) {
            scheduleMap[slot][dayIndex].push(course);
          }
        });
      });
    });

    return scheduleMap;
  };

  const scheduleData = getScheduleData();

  // 生成表格資料
  const dataSource: ScheduleTableRow[] = timeSlot.map((slot) => {
    const row: ScheduleTableRow = {
      key: slot.key,
      time: slot.value,
    };

    // 添加每天的課程
    for (let day = 0; day < 7; day++) {
      const courses = scheduleData[slot.key][day];
      row[`day${day}`] =
        courses.length > 0 ? (
          <>
            {courses.map((course) => (
              <Tooltip
                key={`${course.id}-${day}-${slot.key}`}
                title={`${course.name} - ${course.teacher} (${course.room || 'Unknown'})`}
                placement='top'
              >
                <CourseTag
                  color='blue'
                  $isHovered={hoveredCourseId === course.id}
                >
                  {isMobile
                    ? course.name.length > 4
                      ? `${course.name.substring(0, 4)}...`
                      : course.name
                    : course.name}
                </CourseTag>
              </Tooltip>
            ))}
          </>
        ) : null;
    }

    return row;
  });

  // 定義表格列
  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  // Filter columns based on the showWeekends setting
  const visibleDays = showWeekends ? weekdays : weekdays.slice(0, 5);

  const columns = [
    {
      title: '',
      dataIndex: 'time',
      key: 'time',
      width: timeColumnWidth,
      render: (text: string) => (
        <Text
          style={{
            fontSize: isMobile ? '10px' : '12px',
            whiteSpace: 'pre-line',
          }}
        >
          {text}
        </Text>
      ),
    },
    ...visibleDays.map((day, index) => ({
      title: day,
      dataIndex: `day${index}` as keyof ScheduleTableRow,
      key: `day${index}`,
      width: dayColumnWidth,
    })),
  ];

  // 計算表格寬度，但確保它不會導致溢出
  const columnsCount = visibleDays.length + 1; // 時間列 + 天數列
  // 使表格寬度與內容匹配，但不設置最小寬度
  const tableWidth = timeColumnWidth + visibleDays.length * dayColumnWidth;

  // Custom title component with weekend toggle
  const TitleComponent = () => (
    <CardHeader>
      <span>{t('課程時間表')}</span>
      <Space>
        <Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
          {t('顯示週末')}
        </Text>
        <Switch
          checked={showWeekends}
          onChange={setShowWeekends}
          size={isMobile ? 'small' : 'default'}
        />
      </Space>
    </CardHeader>
  );

  return (
    <StyledCard title={<TitleComponent />}>
      <TableWrapper>
        <StyledTable
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size={isMobile ? 'small' : 'middle'}
          scroll={{ x: tableWidth }}
          style={{ width: '100%' }}
        />
      </TableWrapper>
    </StyledCard>
  );
};

export default ScheduleTable;
