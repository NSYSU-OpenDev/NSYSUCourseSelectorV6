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
  useTranslation,
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const courses = useAppSelector(selectCourses);
  const selectedCourses = useAppSelector(selectSelectedCourses);
  const displaySelectedOnly = useAppSelector(selectDisplaySelectedOnly);
  const displayConflictCourses = useAppSelector(selectDisplayConflictCourses);
  const departmentFilters = useAppSelector(selectDepartmentCoursesFilters);

  // 排序相關狀態
  const [sortSelectorVisible, setSortSelectorVisible] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();

  // 從課程數據中提取選項
  const departmentOptions = useMemo(() => {
    return DepartmentCourseService.extractDepartments(courses).map((dept) => ({
      label: dept,
      value: dept,
    }));
  }, [courses]);

  const gradeOptions = useMemo(() => {
    return DepartmentCourseService.extractGrades(courses).map((grade) => ({
      label:
        grade === '0' ? t('department.allGrades') : t('department.gradeLabel', { grade }),
      value: grade,
    }));
  }, [courses, t]);

  const classOptions = useMemo(() => {
    return DepartmentCourseService.extractClasses(courses).map((cls) => ({
      label: cls || t('department.allClasses'),
      value: cls || '',
    }));
  }, [courses, t]);
  // 必修類型的翻譯對照（value 固定，label 依語系切換）
  const COMPULSORY_TYPE_LABELS: Record<string, string> = {
    compulsory: t('department.typeCompulsory'),
    elective: t('department.typeElective'),
    multipleCompulsory: t('department.typeMultipleCompulsory'),
  };
  const compulsoryTypeOptions = DepartmentCourseService
    .getCompulsoryTypeOptions()
    .map((opt) => ({
      ...opt,
      label: COMPULSORY_TYPE_LABELS[opt.value] ?? opt.label,
    }));

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

  // 計算當前篩選結果中的已選課程數量
  const selectedCoursesInFilterCount = useMemo(() => {
    return sortedCourses.filter((course) =>
      selectedCourses.some((selected) => selected.id === course.id),
    ).length;
  }, [sortedCourses, selectedCourses]);

  // 處理全選功能
  const handleSelectAll = () => {
    const unselectedCourses = sortedCourses.filter(
      (course) =>
        !selectedCourses.some((selected) => selected.id === course.id),
    );

    if (unselectedCourses.length === 0) {
      void messageApi.info(t('department.allCoursesAlreadySelected'));
      return;
    }

    if (unselectedCourses.length > 50) {
      modalApi.error({
        title: t('department.batchSelectLimit'),
        content: t('department.batchSelectLimitExceeded'),
        okText: t('department.confirm'),
      });
      return;
    }

    if (unselectedCourses.length > 20) {
      modalApi.confirm({
        title: t('department.confirmBatchSelect'),
        content: t('department.batchSelectWarning', {
          count: unselectedCourses.length,
        }),
        onOk: () => {
          unselectedCourses.forEach((course) => {
            dispatch(selectCourse({ course, isSelected: true }));
          });
          void messageApi.success(
            t('department.coursesSelected', {
              count: unselectedCourses.length,
            }),
          );
        },
        okText: t('department.confirm'),
        cancelText: t('simpleFilter.cancel'),
      });
      return;
    }

    unselectedCourses.forEach((course) => {
      dispatch(selectCourse({ course, isSelected: true }));
    });
    void messageApi.success(
      t('department.coursesSelected', { count: unselectedCourses.length }),
    );
  };
  // 處理清空當前篩選結果中的已選課程
  const handleClearSelectedCourses = () => {
    // 找出當前篩選結果中的已選課程
    const selectedCoursesInFilter = sortedCourses.filter((course) =>
      selectedCourses.some((selected) => selected.id === course.id),
    );

    if (selectedCoursesInFilter.length === 0) {
      void messageApi.info(t('department.noSelectedCoursesInFilter'));
      return;
    }

    modalApi.confirm({
      title: t('department.clearSelectedCourses'),
      content: t('department.clearSelectedWarning', {
        count: selectedCoursesInFilter.length,
      }),
      onOk: () => {
        selectedCoursesInFilter.forEach((course) => {
          dispatch(selectCourse({ course, isSelected: false }));
        });
        void messageApi.success(
          t('department.coursesCleared', {
            count: selectedCoursesInFilter.length,
          }),
        );
      },
      okText: t('department.confirm'),
      cancelText: t('simpleFilter.cancel'),
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
          {t('department.title')}
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
            {isEmptyFilter
              ? t('department.selectFilterFirst')
              : t('department.selectAll', { count: sortedCourses.length })}
          </Button>
          <Button
            danger
            icon={<MinusCircleOutlined />}
            size='small'
            onClick={handleClearSelectedCourses}
            disabled={selectedCoursesInFilterCount === 0}
          >
            {t('department.clearSelected', {
              count: selectedCoursesInFilterCount,
            })}
          </Button>
        </ActionButtonsContainer>
      </Flex>
      {/* 篩選條件 */}
      <FilterContainer>
        <FilterGrid>
          <FilterRow>
            <FilterLabel>
              <ApartmentOutlined />
              {t('department.department')}
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder={t('department.selectDepartment')}
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
              {t('department.grade')}
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder={t('department.selectGrade')}
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
              {t('department.class')}
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder={t('department.selectClass')}
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
              {t('department.type')}
            </FilterLabel>
            <StyledSelect
              mode='multiple'
              placeholder={t('department.selectType')}
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
              {t('allCourse.showSelectedOnly')}
            </Typography.Text>
            <Switch
              checked={displaySelectedOnly}
              onChange={(checked) => dispatch(setDisplaySelectedOnly(checked))}
              size='small'
            />
          </Space>
          <Space size={2}>
            <Typography.Text style={{ fontSize: '11px' }}>
              {t('allCourse.showConflicts')}
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
      {contextHolder}
      {modalContextHolder}
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
