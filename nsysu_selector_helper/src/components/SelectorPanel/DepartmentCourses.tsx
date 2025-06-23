import React, { useMemo, useState } from 'react';
import {
  Card,
  Flex,
  Typography,
  Switch,
  Space,
  Select,
  Button,
  Modal,
  message,
} from 'antd';
import {
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CheckOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { DepartmentCourseService } from '@/services';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  useCourseSorting,
  useDepartmentCoursesFilterPersistence,
} from '@/hooks';
import {
  selectCourses,
  selectSelectedCourses,
  selectDisplaySelectedOnly,
  selectDisplayConflictCourses,
  selectDepartmentCoursesFilters,
  setDisplaySelectedOnly,
  setDisplayConflictCourses,
  setDepartmentCoursesSelectedDepartments,
  setDepartmentCoursesSelectedGrades,
  setDepartmentCoursesSelectedClasses,
  setDepartmentCoursesSelectedCompulsoryTypes,
  selectCourse,
  clearAllSelectedCourses,
} from '@/store';
import CoursesList from '#/Common/CoursesList';
import CreditsStatistics from '#/Common/CreditsStatistics';
import CompactSortButton from '#/SelectorPanel/AllCourses/CompactSortButton';
import CourseSortSelector from '#/SelectorPanel/AllCourses/CourseSortSelector';

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

const FilterContainer = styled.div`
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const FilterRow = styled(Flex)`
  align-items: center;
  gap: 6px;
`;

const FilterLabel = styled(Typography.Text)`
  font-size: 11px;
  font-weight: 500;
  color: #666;
  min-width: 35px;
  white-space: nowrap;
`;

const StyledSelect = styled(Select)`
  flex: 1;
  min-width: 0;

  .ant-select-selector {
    font-size: 11px;
    min-height: 24px;
  }
`;

const ActionButtonsContainer = styled(Flex)`
  padding: 4px 0;
  gap: 4px;
`;

const DepartmentCourses: React.FC = () => {
  useDepartmentCoursesFilterPersistence();
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);
  const departmentFilters = useAppSelector(selectDepartmentCoursesFilters);

  // 排序相關狀態
  const [sortSelectorVisible, setSortSelectorVisible] = useState(false);

  // 從課程數據中提取選項
  const departmentOptions = useMemo(() => {
    return DepartmentCourseService.extractDepartments(courses).map((dept) => ({
      label: dept,
      value: dept,
    }));
  }, [courses]);

  const gradeOptions = useMemo(() => {
    return DepartmentCourseService.extractGrades(courses).map((grade) => ({
      label: grade === '0' ? '不分年級' : `${grade}年級`,
      value: grade,
    }));
  }, [courses]);

  const classOptions = useMemo(() => {
    return DepartmentCourseService.extractClasses(courses).map((cls) => ({
      label: cls || '不分班',
      value: cls || '',
    }));
  }, [courses]);
  const compulsoryTypeOptions =
    DepartmentCourseService.getCompulsoryTypeOptions();

  // 根據篩選條件過濾課程
  const filteredCourses = useMemo(() => {
    return DepartmentCourseService.filterCourses(courses, departmentFilters);
  }, [courses, departmentFilters]);

  const isEmptyFilter = useMemo(() => {
    return (
      departmentFilters.selectedDepartments.length === 0 &&
      departmentFilters.selectedGrades.length === 0 &&
      departmentFilters.selectedClasses.length === 0 &&
      departmentFilters.selectedCompulsoryTypes.length === 0
    );
  }, [departmentFilters]);

  // 使用排序 hook
  const { sortedCourses } = useCourseSorting(filteredCourses);

  // 處理全選功能
  const handleSelectAll = () => {
    const unselectedCourses = sortedCourses.filter(
      (course) =>
        !selectedCourses.some((selected) => selected.id === course.id),
    );

    if (unselectedCourses.length === 0) {
      void message.info('當前篩選結果中的課程都已被選擇');
      return;
    }

    if (unselectedCourses.length > 50) {
      Modal.error({
        title: '批量選課限制',
        content: `為防止載入過多課程造成瀏覽器崩潰，單次選擇課程數量不能超過 50 門。請縮小篩選條件或手動選擇課程。`,
        okText: '確定',
      });
    }

    if (unselectedCourses.length > 20) {
      Modal.confirm({
        title: '批量選課確認',
        content: `您即將選擇 ${unselectedCourses.length} 門課程，這可能會造成大量時間衝突。確定要繼續嗎？`,
        onOk: () => {
          unselectedCourses.forEach((course) => {
            dispatch(selectCourse({ course, isSelected: true }));
          });
          void message.success(`已選擇 ${unselectedCourses.length} 門課程`);
        },
        okText: '確定',
        cancelText: '取消',
      });
      return;
    }

    unselectedCourses.forEach((course) => {
      dispatch(selectCourse({ course, isSelected: true }));
    });
    void message.success(`已選擇 ${unselectedCourses.length} 門課程`);
  };

  // 處理清空所有已選課程
  const handleClearSelectedCourses = () => {
    if (selectedCourses.length === 0) {
      void message.info('目前沒有已選課程');
      return;
    }

    Modal.confirm({
      title: '清空已選課程',
      content: `確定要清空所有 ${selectedCourses.length} 門已選課程嗎？`,
      onOk: () => {
        dispatch(clearAllSelectedCourses());
        void message.success('已清空所有已選課程');
      },
      okText: '確定',
      cancelText: '取消',
    });
  };

  const handleOpenSortSelector = () => {
    setSortSelectorVisible(true);
  };

  const handleCloseSortSelector = () => {
    setSortSelectorVisible(false);
  };

  const CardTitle = (
    <div>
      <Flex
        align={'center'}
        justify='space-between'
        wrap={true}
        style={{ width: '100%' }}
      >
        <Typography.Title level={5} style={{ margin: 0, marginBottom: 6 }}>
          <ApartmentOutlined style={{ marginRight: 8 }} />
          系所必/選修
        </Typography.Title>
        {/* 操作按鈕 */}
        <ActionButtonsContainer gap={6} justify='space-between' align='center'>
          <Button
            type='primary'
            icon={<CheckOutlined />}
            size='small'
            onClick={handleSelectAll}
            disabled={sortedCourses.length === 0 || isEmptyFilter}
          >
            {isEmptyFilter ? '請先篩選條件' : `全選 (${sortedCourses.length})`}
          </Button>
          <Button
            danger
            icon={<MinusCircleOutlined />}
            size='small'
            onClick={handleClearSelectedCourses}
            disabled={selectedCourses.length === 0}
          >
            清除已選 ({selectedCourses.length})
          </Button>
        </ActionButtonsContainer>
      </Flex>
      {/* 篩選條件 */}
      <FilterContainer>
        <FilterGrid>
          <FilterRow>
            <FilterLabel>
              <ApartmentOutlined />
              系所：
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder='選擇系所'
              options={departmentOptions}
              value={departmentFilters.selectedDepartments}
              onChange={(value) =>
                dispatch(
                  setDepartmentCoursesSelectedDepartments(value as string[]),
                )
              }
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </FilterRow>

          <FilterRow>
            <FilterLabel>
              <UserOutlined />
              年級：
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder='選擇年級'
              options={gradeOptions}
              value={departmentFilters.selectedGrades}
              onChange={(value) =>
                dispatch(setDepartmentCoursesSelectedGrades(value as string[]))
              }
              allowClear
            />
          </FilterRow>

          <FilterRow>
            <FilterLabel>
              <TeamOutlined />
              班別：
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder='選擇班別'
              options={classOptions}
              value={departmentFilters.selectedClasses}
              onChange={(value) =>
                dispatch(setDepartmentCoursesSelectedClasses(value as string[]))
              }
              allowClear
            />
          </FilterRow>

          <FilterRow>
            <FilterLabel>
              <BookOutlined />
              類型：
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder='選擇課程類型'
              options={compulsoryTypeOptions}
              value={departmentFilters.selectedCompulsoryTypes}
              onChange={(value) =>
                dispatch(
                  setDepartmentCoursesSelectedCompulsoryTypes(
                    value as string[],
                  ),
                )
              }
              allowClear
            />
          </FilterRow>
        </FilterGrid>
      </FilterContainer>
      {/* 控制選項 */}
      <Flex justify='space-between' align='center' style={{ paddingTop: 6 }}>
        <CompactSortButton onClick={handleOpenSortSelector} />
        <Space>
          <Space size={2}>
            <Typography.Text style={{ fontSize: '11px' }}>
              僅顯示已選：
            </Typography.Text>
            <Switch
              checked={displaySelectedOnly}
              onChange={(checked) => dispatch(setDisplaySelectedOnly(checked))}
              size='small'
            />
          </Space>
          <Space size={2}>
            <Typography.Text style={{ fontSize: '11px' }}>
              顯示衝突：
            </Typography.Text>
            <Switch
              checked={displayConflictCourses}
              onChange={(checked) =>
                dispatch(setDisplayConflictCourses(checked))
              }
              size='small'
            />
          </Space>
        </Space>
      </Flex>
    </div>
  );

  return (
    <>
      <StyledCard title={CardTitle}>
        <CreditsStatistics />
        <CoursesList
          filteredCourses={sortedCourses}
          displayConflictCourses={displayConflictCourses}
          displaySelectedOnly={displaySelectedOnly}
          height={'calc(100vh - 265px)'}
        />
      </StyledCard>
      <CourseSortSelector
        visible={sortSelectorVisible}
        onClose={handleCloseSortSelector}
      />
    </>
  );
};

export default DepartmentCourses;
