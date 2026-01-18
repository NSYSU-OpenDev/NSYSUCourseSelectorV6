import React, { ReactNode, useEffect, useState } from 'react';
import { Card, Table, Typography, Tag, Switch, Flex, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';

import type { Course } from '@/types';
import { timeSlot } from '@/constants';
import { useWindowSize } from '@/hooks';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSelectedCourses,
  selectHoveredCourseId,
  selectLabels,
  selectCourseLabelMap,
  selectSelectedTimeSlots,
  selectIsDarkMode,
  setHoveredCourseId,
  setScrollToCourseId,
  setSelectedTabKey,
  setActiveCollapseKey,
  toggleTimeSlotFilter,
  toggleDayTimeSlots,
  clearAllTimeSlotFilters,
} from '@/store';
import { GetProbability } from '@/utils';
import MobileCourseDetailsModal from '#/ScheduleTable/MobileCourseDetailsModal';

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

const StyledCard = styled(Card)<{ $isDark: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px
    ${(props) => (props.$isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)')};
  border: 1px solid ${(props) => (props.$isDark ? '#434343' : '#e8e8e8')};

  .ant-card-head {
    padding: 0;
    border-bottom: none;
    min-height: auto;
    flex-shrink: 0;
  }

  .ant-card-body {
    padding: 0;
    overflow: hidden;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &:hover {
    box-shadow: 0 4px 12px
      ${(props) =>
        props.$isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'};
    transition: box-shadow 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
`;

// Fix StyledTable to preserve generic type parameter
const StyledTable = styled(Table<ScheduleTableRow>)<{ $isDark: boolean }>`
  .ant-table {
    width: 100%;
    border-radius: 0 0 6px 6px;
  }

  .ant-table-container {
    border-left: 1px solid ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
    border-right: 1px solid
      ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
    border-bottom: 1px solid
      ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
  }

  .ant-table-thead > tr > th {
    text-align: center;
    background: ${(props) => (props.$isDark ? '#1f1f1f' : '#f8f9fa')};
    border-bottom: 2px solid
      ${(props) => (props.$isDark ? '#434343' : '#e8e8e8')};
    font-weight: 600;
    color: ${(props) => (props.$isDark ? '#fff' : '#333')};
    padding: 8px 4px;
  }

  .ant-table-tbody > tr > td {
    padding: 2px;
    text-align: center;
    vertical-align: middle;
    border-right: 1px solid
      ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
  }

  .ant-table-tbody > tr:nth-child(even) {
    background: ${(props) => (props.$isDark ? '#262626' : '#fafafa')};
  }

  // 手機版樣式調整
  @media screen and (max-width: 768px) {
    .ant-table-thead > tr > th {
      padding: 6px 2px;
      font-size: 11px;
    }

    .ant-table-tbody > tr > td {
      padding: 1px;
      font-size: 10px;
    }

    .ant-table-cell {
      padding: 1px !important;
      font-size: 10px;
    }
  }
`;

const TableWrapper = styled.div<{ $isDark: boolean }>`
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: auto; /* 同時處理 X 和 Y 滾動 */
  -webkit-overflow-scrolling: touch;

  /* 覆蓋 Ant Design 的 overflow 設定 */
  .ant-table-wrapper,
  .ant-table,
  .ant-table-container,
  .ant-table-content {
    overflow: visible !important;
  }

  /* 表頭 sticky */
  .ant-table-thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* 設定表頭背景色為不透明，並確保堆疊順序正確 */
  .ant-table-thead > tr > th {
    background: ${(props) =>
      props.$isDark ? '#1f1f1f' : '#f8f9fa'} !important;
    position: relative;
    z-index: 10;
  }
`;

const CourseTag = styled(Tag)<{
  $isHovered?: boolean;
  $isActive?: boolean;
  $isDark: boolean;
}>`
  width: 100%;
  margin: 1px 0;
  padding: 4px 6px;
  font-size: 11px;
  line-height: 1.3;
  white-space: pre-wrap;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  font-weight: 500;
  transform: ${(props) =>
    props.$isHovered || props.$isActive ? 'scale(1.02)' : 'none'};
  box-shadow: ${(props) =>
    props.$isHovered || props.$isActive
      ? props.$isDark
        ? '0 2px 8px rgba(24, 144, 255, 0.5)'
        : '0 2px 8px rgba(24, 144, 255, 0.3)'
      : props.$isDark
        ? '0 1px 2px rgba(0, 0, 0, 0.3)'
        : '0 1px 2px rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  position: relative;
  overflow: hidden;

  // 只在非觸摸設備上啟用 hover 效果
  @media (hover: hover) {
    &:hover {
      transform: scale(1.02);
      box-shadow: ${(props) =>
        props.$isDark
          ? '0 2px 8px rgba(24, 144, 255, 0.5)'
          : '0 2px 8px rgba(24, 144, 255, 0.3)'};
      z-index: 10;
    }
  }

  @media screen and (max-width: 768px) {
    font-size: 9px;
    padding: 2px 4px;
    margin: 1px 0;
  }
`;

const ProbabilityIndicator = styled.div<{
  $probability: number;
  $status: 'full' | 'overbooked' | 'normal';
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: ${(props) => Math.min(props.$probability, 100)}%;
  background-color: ${(props) => {
    if (props.$status === 'full') return '#ff4d4f'; // 紅色 - 已滿
    if (props.$status === 'overbooked') return '#722ed1'; // 紫色 - 超額
    if (props.$probability >= 80) return '#52c41a'; // 綠色 - 很容易選上
    if (props.$probability >= 50) return '#faad14'; // 橙色 - 中等機率
    return '#ff7875'; // 淺紅 - 困難
  }};
  transition: width 0.3s ease;
  z-index: 1;
`;

const CourseTagContent = styled.div`
  position: relative;
  z-index: 2;
`;

const ProbabilityText = styled.div<{
  $status: 'full' | 'overbooked' | 'normal';
  $isDark: boolean;
}>`
  font-size: 8px;
  font-weight: bold;
  color: ${(props) => {
    if (props.$status === 'full') return '#ff4d4f';
    if (props.$status === 'overbooked') return '#722ed1';
    return props.$isDark ? '#999' : '#666';
  }};
  line-height: 1;
  margin-top: 1px;

  @media screen and (max-width: 768px) {
    font-size: 7px;
  }
`;

const CardHeader = styled.div<{ $isDark: boolean }>`
  padding: 12px 16px 0;
  border-bottom: 1px solid ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
  background: ${(props) => (props.$isDark ? '#1f1f1f' : '#fafafa')};
  border-radius: 6px 6px 0 0;

  @media screen and (max-width: 768px) {
    padding: 8px 12px;
  }
`;

// 時間段單元格樣式
const TimeSlotCell = styled.div<{
  $isSelected?: boolean;
  $hasContent?: boolean;
  $isDark: boolean;
}>`
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  min-height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background-color: ${(props) => {
    if (props.$isSelected)
      return props.$isDark
        ? 'rgba(24, 144, 255, 0.25)'
        : 'rgba(24, 144, 255, 0.12)';
    return 'transparent';
  }};
  border: ${(props) => {
    if (props.$isSelected) return '2px solid #1890ff';
    return '2px solid transparent';
  }};
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;

  // 只在非觸摸設備上啟用 hover 效果
  @media (hover: hover) {
    &:hover {
      background-color: ${(props) => {
        if (props.$isSelected)
          return props.$isDark
            ? 'rgba(24, 144, 255, 0.35)'
            : 'rgba(24, 144, 255, 0.18)';
        return props.$isDark
          ? 'rgba(24, 144, 255, 0.15)'
          : 'rgba(24, 144, 255, 0.06)';
      }};
      border-color: ${(props) =>
        props.$isSelected ? '#1890ff' : 'rgba(24, 144, 255, 0.4)'};
      transform: scale(1.01);
    }
  }

  &:active {
    transform: scale(0.98);
  }

  // 新增選中狀態的微妙動畫
  ${(props) =>
    props.$isSelected &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background: #1890ff;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(24, 144, 255, 0.6);
    }
  `}
`;

// 星期選擇按鈕樣式
const DayToggleButton = styled(Button)<{
  $isDark: boolean;
  $isSelected: boolean;
}>`
  padding: 2px 4px;
  height: 20px;
  font-size: 10px;
  border-radius: 3px;
  border: 1px solid
    ${(props) =>
      props.$isSelected ? '#1890ff' : props.$isDark ? '#434343' : '#d9d9d9'};
  background: ${(props) =>
    props.$isSelected ? '#1890ff' : props.$isDark ? '#262626' : '#fff'};
  color: ${(props) =>
    props.$isSelected ? '#fff' : props.$isDark ? '#fff' : '#333'};

  &:hover {
    border-color: #1890ff;
    background: ${(props) =>
      props.$isSelected
        ? '#40a9ff'
        : props.$isDark
          ? 'rgba(24, 144, 255, 0.1)'
          : 'rgba(24, 144, 255, 0.05)'};
    color: ${(props) => (props.$isSelected ? '#fff' : '#1890ff')};
  }

  .anticon {
    font-size: 8px;
  }

  @media screen and (max-width: 768px) {
    padding: 1px 2px;
    height: 16px;
    font-size: 8px;
    margin-bottom: 5px;

    .anticon {
      font-size: 6px;
    }
  }
`;

// Define the proper interface for schedule table row data
interface ScheduleTableRow {
  key: string;
  time: string;

  [key: `day${number}`]: ReactNode;
}

const ScheduleTable: React.FC = () => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectIsDarkMode);

  // Redux state
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const hoveredCourseId = useAppSelector(selectHoveredCourseId);
  const selectedTimeSlots = useAppSelector(selectSelectedTimeSlots);
  const labelMap = useAppSelector(selectCourseLabelMap);
  const labels = useAppSelector(selectLabels);

  // Modal state for mobile course details
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<
    (Course & { roomForThisSlot?: string }) | null
  >(null);

  // 檢查時間段是否被選中用於篩選
  const isTimeSlotSelected = (day: number, timeSlot: string): boolean => {
    return selectedTimeSlots.some(
      (slot) => slot.day === day && slot.timeSlot === timeSlot,
    );
  };

  // 處理時間段點擊
  const handleTimeSlotClick = (day: number, timeSlot: string) => {
    dispatch(toggleTimeSlotFilter({ day, timeSlot }));
  };

  // 處理整個星期的選擇/取消選擇
  const handleDayToggle = (day: number) => {
    const allTimeSlots = timeSlot.map((slot) => slot.key);
    dispatch(toggleDayTimeSlots({ day, timeSlots: allTimeSlots }));
  };

  // 檢查某一天是否全部被選中
  const isDayFullySelected = (day: number): boolean => {
    const allTimeSlots = timeSlot.map((slot) => slot.key);
    return allTimeSlots.every((timeSlotKey) =>
      selectedTimeSlots.some(
        (slot) => slot.day === day && slot.timeSlot === timeSlotKey,
      ),
    );
  };

  // 清除所有時間段篩選
  const handleClearTimeSlotFilters = () => {
    dispatch(clearAllTimeSlotFilters());
  };

  // 處理課程標籤點擊 - 導航到課程列表
  const handleCourseNavigate = (courseId: string) => {
    // 觸發滾動到對應課程
    dispatch(setScrollToCourseId(courseId));

    // 切換到課程列表 tab
    dispatch(setSelectedTabKey('allCourses'));

    // 如果是移動端，展開選課面板
    if (isMobile) {
      dispatch(setActiveCollapseKey(['selectorPanel']));
    }
  };

  // 處理手機端課程標籤點擊 - 顯示 Modal
  const handleMobileCourseClick = (course: Course, roomForThisSlot: string) => {
    setSelectedCourse({ ...course, roomForThisSlot });
    setModalVisible(true);
  };

  // 處理課程標籤點擊
  const handleCourseClick = (course: Course, roomForThisSlot?: string) => {
    if (isMobile) {
      // 手機端：顯示 Modal
      handleMobileCourseClick(course, roomForThisSlot || '未知');
    } else {
      // 桌面端：直接導航
      handleCourseNavigate(course.id);
    }
  };

  // 處理手機版長按課程標籤
  const handleCourseLongPress = (course: Course, roomForThisSlot?: string) => {
    if (isMobile) {
      handleMobileCourseClick(course, roomForThisSlot || '未知');
    }
  };

  const isMobile = width <= 768;
  // 儲存時間格子的觸控起始資料
  const timeSlotTouchRef = React.useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
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
              labels: labelMap[course.id] || [],
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
            {courses.map((course) => {
              const departmentColor = getDepartmentColor(
                course.department || '其他',
              );
              const firstLabel = course.labels?.[0];
              const labelStyle = labels.find((l) => l.id === firstLabel);
              const isHovered = hoveredCourseId === course.id;
              return (
                <CourseTag
                  key={`${course.id}-${day}-${slot.key}`}
                  color={labelStyle ? undefined : departmentColor}
                  style={
                    labelStyle
                      ? {
                          backgroundColor: labelStyle.bgColor,
                          borderColor: labelStyle.borderColor,
                          color: labelStyle.textColor,
                        }
                      : undefined
                  }
                  $isHovered={isHovered}
                  $isDark={isDark}
                  onClick={(e) => {
                    if (isMobile) {
                      // 手機版：阻止事件冒泡，但不執行課程點擊
                      e.stopPropagation();
                      return;
                    }
                    e.stopPropagation(); // 防止事件冒泡到時間段單元格
                    handleCourseClick(course, course.roomForThisSlot);
                  }}
                  onTouchStart={(e) => {
                    if (isMobile) {
                      // 手機版：長按觸發課程詳情，短按觸發時間篩選
                      const touchStartTime = Date.now();
                      const targetElement = e.currentTarget; // 保存元素引用
                      let longPressTriggered = false;

                      const timer = setTimeout(() => {
                        longPressTriggered = true;
                        e.stopPropagation();
                        handleCourseLongPress(course, course.roomForThisSlot);
                      }, 500); // 500ms 長按

                      const onTouchEnd = (touchEvent: TouchEvent) => {
                        clearTimeout(timer);
                        if (
                          !longPressTriggered &&
                          Date.now() - touchStartTime < 500
                        ) {
                          // 短按：手動觸發時間格子的點擊事件
                          touchEvent.stopPropagation();
                          touchEvent.preventDefault();
                          handleTimeSlotClick(day, slot.key);
                        }
                        if (targetElement) {
                          targetElement.removeEventListener(
                            'touchend',
                            onTouchEnd,
                          );
                        }
                      };

                      if (targetElement) {
                        targetElement.addEventListener('touchend', onTouchEnd);
                      }
                    }
                  }}
                  onMouseEnter={() => {
                    dispatch(setHoveredCourseId(course.id));
                  }}
                  onMouseLeave={() => {
                    dispatch(setHoveredCourseId(''));
                  }}
                >
                  <ProbabilityIndicator
                    $probability={GetProbability.getSuccessProbability(
                      course.select,
                      course.remaining,
                    )}
                    $status={GetProbability.getProbabilityStatus(
                      course.remaining,
                    )}
                  />
                  <CourseTagContent>
                    {!isMobile
                      ? `${course.name.split('\n')[0]}\n(${course.roomForThisSlot || '未知'})`
                      : course.name.length > 6
                        ? `${course.name.substring(0, 6)}...`
                        : course.name}
                    <ProbabilityText
                      $status={GetProbability.getProbabilityStatus(
                        course.remaining,
                      )}
                      $isDark={isDark}
                    >
                      {GetProbability.getProbabilityText(
                        course.select,
                        course.remaining,
                      )}
                    </ProbabilityText>
                  </CourseTagContent>
                </CourseTag>
              );
            })}
          </>
        ) : null;
    }

    return row;
  });

  // Filter columns based on the showWeekends setting
  const visibleDays = showWeekends ? weekdays : weekdays.slice(0, 5);
  const columns: ColumnsType<ScheduleTableRow> = [
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
      title: (
        <Flex vertical align='center' gap={2}>
          <Text
            style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}
          >
            {day}
          </Text>
          <DayToggleButton
            $isDark={isDark}
            $isSelected={isDayFullySelected(index)}
            size='small'
            icon={
              isDayFullySelected(index) ? <CheckOutlined /> : <PlusOutlined />
            }
            onClick={(e) => {
              e.stopPropagation();
              handleDayToggle(index);
            }}
            title={
              isDayFullySelected(index)
                ? t('scheduleTable.cancelSelectAllDay', { day })
                : t('scheduleTable.selectAllDay', { day })
            }
          >
            {isDayFullySelected(index)
              ? t('scheduleTable.cancel')
              : t('scheduleTable.selectAll')}
          </DayToggleButton>
        </Flex>
      ),
      dataIndex: `day${index}` as keyof ScheduleTableRow,
      key: `day${index}`,
      width: dayColumnWidth,
      render: (content: ReactNode, record: ScheduleTableRow) => {
        const timeSlotKey = record.key;
        const isSelected = isTimeSlotSelected(index, timeSlotKey);
        const hasContent = content !== null;

        return (
          <TimeSlotCell
            $isSelected={isSelected}
            $hasContent={hasContent}
            onClick={() => {
              if (!isMobile) {
                handleTimeSlotClick(index, timeSlotKey);
              }
            }}
            onTouchStart={(e) => {
              if (isMobile) {
                const touch = e.touches[0];
                timeSlotTouchRef.current = {
                  x: touch.clientX,
                  y: touch.clientY,
                  time: Date.now(),
                };
              }
            }}
            onTouchEnd={(e) => {
              if (isMobile && timeSlotTouchRef.current) {
                const touch = e.changedTouches[0];
                const dx = Math.abs(touch.clientX - timeSlotTouchRef.current.x);
                const dy = Math.abs(touch.clientY - timeSlotTouchRef.current.y);
                const dt = Date.now() - timeSlotTouchRef.current.time;
                timeSlotTouchRef.current = null;
                if (dx < 10 && dy < 10 && dt < 300) {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTimeSlotClick(index, timeSlotKey);
                }
              }
            }}
            title={t('scheduleTable.clickToFilter', {
              day,
              timeSlot: timeSlotKey,
            })}
            $isDark={isDark}
          >
            {content}
          </TimeSlotCell>
        );
      },
    })),
  ];

  // 使表格寬度與內容匹配，但不設置最小寬度
  const tableWidth = timeColumnWidth + visibleDays.length * dayColumnWidth;
  // Custom title component with weekend toggle
  const TitleComponent = () => (
    <CardHeader $isDark={isDark}>
      <Flex justify='space-between' align='center' wrap='wrap' gap={8}>
        {/* 左側 - 標題和時間段統計 */}
        <Flex align='center' gap={12}>
          <Text strong style={{ fontSize: isMobile ? '14px' : '16px' }}>
            {t('課程時間表')}
          </Text>
          {selectedTimeSlots.length > 0 && (
            <Tag
              color='blue'
              style={{
                margin: 0,
                padding: isMobile ? '0 6px' : '0 8px',
              }}
              closable={true}
              onClose={handleClearTimeSlotFilters}
            >
              {t('scheduleTable.filteringCount', {
                count: selectedTimeSlots.length,
              })}
            </Tag>
          )}
        </Flex>

        {/* 右側 - 控制項 */}
        <Flex align='center' gap={8}>
          {/* 週末顯示開關 */}
          <Flex align='center' gap={6}>
            <Text
              style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#666',
              }}
            >
              {t('顯示週末')}
            </Text>
            <Switch
              checked={showWeekends}
              onChange={setShowWeekends}
              size={isMobile ? 'small' : 'default'}
            />
          </Flex>
        </Flex>
      </Flex>
    </CardHeader>
  );

  return (
    <>
      <StyledCard title={<TitleComponent />} $isDark={isDark}>
        <TableWrapper $isDark={isDark}>
          <StyledTable
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            size={isMobile ? 'small' : 'middle'}
            scroll={{ x: tableWidth }}
            style={{ width: '100%' }}
            $isDark={isDark}
          />
        </TableWrapper>
      </StyledCard>

      {/* Mobile Course Details Modal */}
      <MobileCourseDetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedCourse={selectedCourse}
      />
    </>
  );
};

export default ScheduleTable;
