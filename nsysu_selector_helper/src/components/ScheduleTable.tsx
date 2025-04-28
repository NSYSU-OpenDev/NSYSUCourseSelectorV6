import React, { ReactNode } from 'react';
import { Card, Table, Typography, Tooltip, Tag } from 'antd';
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
    height: 100%;
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
  const columns = [
    {
      title: '',
      dataIndex: 'time',
      key: 'time',
      width: isMobile ? 40 : 60,
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
    ...['一', '二', '三', '四', '五', '六', '日'].map((day, index) => ({
      title: day,
      dataIndex: `day${index}` as keyof ScheduleTableRow,
      key: `day${index}`,
      width: isMobile ? 'auto' : 120,
    })),
  ];

  return (
    <StyledCard title={t('課程時間表')}>
      <StyledTable
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size={isMobile ? 'small' : 'middle'}
        scroll={{ x: 'max-content' }}
      />
    </StyledCard>
  );
};

export default ScheduleTable;
