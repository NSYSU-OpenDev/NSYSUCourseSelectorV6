import React, { ReactNode, useEffect, useState } from 'react';
import { Card, Table, Typography, Tooltip, Tag, Switch, Space } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import type { Course } from '@/types';
import { timeSlot } from '@/constants';
import { useWindowSize } from '@/hooks';

// Department color mapping - using Ant Design official colors
const getDepartmentColor = (department: string): string => {
  // Create a simple hash function to generate consistent colors for departments
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ant Design official color names
  const colors = [
    'blue',
    'green',
    'orange',
    'magenta',
    'purple',
    'cyan',
    'volcano',
    'geekblue',
    'red',
    'lime',
    'gold',
    'processing',
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

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
  setHoveredCourseId: React.Dispatch<React.SetStateAction<string>>;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  selectedCourses,
  hoveredCourseId,
  setHoveredCourseId,
}) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [showWeekends, setShowWeekends] = useState(
    localStorage.getItem('NSYSUCourseSelector.showWeekends') === 'true' ||
      false,
  );

  // 計算每個欄位的固定寬度 - 為手機優化
  const timeColumnWidth = isMobile ? 36 : 60;
  const dayColumnWidth = isMobile ? 45 : 80; // 減小每天欄位在手機上的寬度

  // 定義表格列
  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  useEffect(() => {
    // 儲存週末顯示狀態到 localStorage
    localStorage.setItem(
      'NSYSUCourseSelector.showWeekends',
      showWeekends.toString(),
    );
  }, [showWeekends]);

  // 解析課程教室信息
  const parseRoomInfo = (roomString: string) => {
    // 解析如 "一2,3,4(理PH 1008) 三2,3,4(理PH 1008) 五2,3,4(理PH 1008)" 的格式
    const roomMap: Record<number, Record<string, string>> = {};

    // 星期對應表
    const dayMap: Record<string, number> = weekdays.reduce(
      (acc, day, index) => {
        acc[day] = index;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 正則表達式匹配每個時間段和教室
    const pattern = /([一二三四五六日])([0-9A-F,]+)\(([^)]+)\)/g;
    let match;

    while ((match = pattern.exec(roomString)) !== null) {
      const day = dayMap[match[1]];
      const timeSlots = match[2].split(',');
      const room = match[3];

      if (day !== undefined) {
        if (!roomMap[day]) {
          roomMap[day] = {};
        }
        timeSlots.forEach((slot) => {
          roomMap[day][slot.trim()] = room;
        });
      }
    }

    return roomMap;
  };

  // 將課程按時間段和星期分組，並包含教室信息
  const getScheduleData = () => {
    const scheduleMap: Record<
      string,
      Record<number, Array<Course & { roomForThisSlot?: string }>>
    > = {};

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
      const roomInfo = parseRoomInfo(course.room);

      course.classTime.forEach((dayTime, dayIndex) => {
        if (!dayTime) return;

        // 解析時間段
        const timeSlots = dayTime.split('');
        timeSlots.forEach((slot) => {
          if (scheduleMap[slot]) {
            // 為這個時間段添加對應的教室信息
            const courseWithRoom = {
              ...course,
              roomForThisSlot: roomInfo[dayIndex]?.[slot] || '未知',
            };
            scheduleMap[slot][dayIndex].push(courseWithRoom);
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
    }; // 添加每天的課程
    for (let day = 0; day < 7; day++) {
      const courses = scheduleData[slot.key][day];
      row[`day${day}`] =
        courses.length > 0 ? (
          <>
            {' '}
            {courses.map((course) => {
              const departmentColor = getDepartmentColor(
                course.department || '其他',
              );
              const isHovered = hoveredCourseId === course.id;

              return (
                <Tooltip
                  key={`${course.id}-${day}-${slot.key}`}
                  title={
                    isMobile
                      ? `${course.name} - ${course.teacher} (${course.roomForThisSlot || 'Unknown'})`
                      : ''
                  }
                  placement='top'
                >
                  <CourseTag
                    color={departmentColor}
                    $isHovered={isHovered}
                    onMouseEnter={() => {
                      setHoveredCourseId(course.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredCourseId('');
                    }}
                  >
                    {isMobile
                      ? course.name.length > 4
                        ? `${course.name.substring(0, 4)}...`
                        : course.name
                      : `${course.name.split('\n')[0]}\n(${course.roomForThisSlot || '未知'})\n`}
                  </CourseTag>
                </Tooltip>
              );
            })}
          </>
        ) : null;
    }

    return row;
  });

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
