import React, { useState } from 'react';
import {
  Drawer,
  Space,
  Button,
  Typography,
  Tag,
  Card,
  Empty,
  Tooltip,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectLabels, selectCourseLabels } from '@/store/selectors';
import {
  addLabel,
  updateLabel,
  removeLabel,
  assignLabel,
  removeCourseLabel,
} from '@/store/slices/courseLabelsSlice';
import type { CourseLabel } from '@/services/courseLabelService';
import { DEFAULT_LABELS } from '@/constants';
import LabelEditModal from '#/Common/Labels/LabelEditModal';
import { useTranslation } from '@/hooks';

const { Text } = Typography;

interface LabelEditDrawerProps {
  open: boolean;
  onClose: () => void;
  courseId?: string;
}

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 6px 8px;
  }

  .ant-drawer-body {
    padding: 12px;
  }
`;

// Helper function to convert Color to hex string
const getColorString = (color: Color | string): string => {
  if (typeof color === 'string') {
    return color;
  }
  return color.toHexString();
};

const LabelEditDrawer: React.FC<LabelEditDrawerProps> = ({
  open,
  onClose,
  courseId,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectLabels);
  const currentCourseLabels = useAppSelector((state) =>
    selectCourseLabels(state, courseId || ''),
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<CourseLabel | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // 處理標籤應用到課程
  const handleApplyLabel = (labelId: string) => {
    if (courseId) {
      dispatch(assignLabel({ courseId, labelId }));
    }
  };

  // 處理新增標籤
  const handleCreateLabel = () => {
    setCurrentLabel(undefined);
    setModalMode('create');
    setEditModalOpen(true);
  };

  // 處理編輯標籤
  const handleEditLabel = (label: CourseLabel) => {
    setCurrentLabel(label);
    setModalMode('edit');
    setEditModalOpen(true);
  };
  // 處理刪除標籤
  const handleDeleteLabel = (id: string) => {
    dispatch(removeLabel(id));
  };
  // 處理從課程移除標籤
  const handleRemoveCourseLabel = (labelId: string) => {
    if (courseId) {
      dispatch(removeCourseLabel({ courseId, labelId }));
    }
  };

  // 取得標籤操作下拉選單
  const getDropdownMenuItems = (label: CourseLabel): MenuProps['items'] => [
    {
      key: 'edit',
      label: t('quickFilter.edit'),
      icon: <EditOutlined />,
      onClick: () => handleEditLabel(label),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: t('labels.delete'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteLabel(label.id),
      disabled: DEFAULT_LABELS.some(
        (defaultLabel) => defaultLabel.id === label.id,
      ), // 禁用系統預設標籤刪除
    },
  ]; // 處理表單提交
  const handleFormSubmit = (
    labelData: Partial<
      CourseLabel & {
        bgColor: Color | string;
        borderColor: Color | string;
        textColor: Color | string;
      }
    >,
  ) => {
    if (modalMode === 'create') {
      const newLabel: CourseLabel = {
        id: uuidv4(), // 使用 UUID 自動生成 ID
        name: labelData.name!,
        bgColor: getColorString(labelData.bgColor!),
        borderColor: getColorString(labelData.borderColor!),
        textColor: getColorString(labelData.textColor!),
      };
      dispatch(addLabel(newLabel));
    } else {
      const updates = {
        name: labelData.name!,
        bgColor: getColorString(labelData.bgColor!),
        borderColor: getColorString(labelData.borderColor!),
        textColor: getColorString(labelData.textColor!),
      };
      dispatch(updateLabel({ id: currentLabel!.id, updates }));
    }
    setEditModalOpen(false);
  };

  return (
    <>
      <StyledDrawer
        title={
          <Space>
            <TagOutlined />
            <span>{t('labels.manage')}</span>
          </Space>
        }
        placement='left'
        open={open}
        onClose={onClose}
        width={400}
      >
        <Space direction='vertical' style={{ width: '100%' }} size='small'>
          {/* 標籤應用區域 - 輕鬆應用 */}
          <Card
            size='small'
            title={
              <Space>
                <TagOutlined />
                <span>{t('labels.apply')}</span>
                <Tooltip
                  title={
                    courseId
                      ? t('labels.applyToCurrentCourseHint')
                      : t('labels.selectCourseFirstLong')
                  }
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            extra={
              <Tooltip title={t('labels.newLabel')}>
                <Button
                  type='text'
                  size='small'
                  icon={<PlusOutlined />}
                  onClick={handleCreateLabel}
                />
              </Tooltip>
            }
          >
            {labels.length > 0 ? (
              <Space size={[4, 4]} wrap>
                {labels.map((label) => {
                  const isApplied = currentCourseLabels.some(
                    (l) => l.id === label.id,
                  );
                  return (
                    <Tooltip
                      key={label.id}
                      title={
                        !courseId
                          ? t('labels.selectCourseFirst')
                          : isApplied
                            ? t('labels.alreadyApplied', { name: label.name })
                            : t('labels.applyLabelToCourse', {
                                name: label.name,
                              })
                      }
                      placement='top'
                    >
                      <Tag
                        style={{
                          cursor:
                            courseId && !isApplied ? 'pointer' : 'default',
                          userSelect: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          margin: 0,
                          backgroundColor: !isApplied
                            ? label.bgColor
                            : '#f0f0f0',
                          color: !isApplied ? label.textColor : '#000',
                          border: `1px solid ${!isApplied ? label.borderColor : '#d9d9d9'}`,
                          opacity: !courseId || isApplied ? 0.5 : 1,
                        }}
                        onClick={() => {
                          if (courseId && !isApplied) {
                            handleApplyLabel(label.id);
                          }
                        }}
                      >
                        <span
                          style={{
                            maxWidth: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {label.name}
                        </span>
                        <Dropdown
                          menu={{ items: getDropdownMenuItems(label) }}
                          trigger={['click']}
                          placement='bottomRight'
                        >
                          <Button
                            type='text'
                            size='small'
                            icon={<MoreOutlined />}
                            style={{
                              border: 'none',
                              padding: 0,
                              minWidth: 'auto',
                              height: 'auto',
                              lineHeight: 1,
                              color: label.textColor,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </Tag>
                    </Tooltip>
                  );
                })}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('labels.noLabelsCreated')}
              >
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={handleCreateLabel}
                >
                  {t('labels.createFirstLabel')}
                </Button>
              </Empty>
            )}
          </Card>
          {/* 當前課程標籤顯示區域 */}
          {courseId && (
            <Card
              size='small'
              title={
                <Space>
                  <TagOutlined />
                  <span>{t('labels.currentCourseLabels')}</span>
                  <Text type='secondary' style={{ fontSize: '12px' }}>
                    {t('labels.labelCount', {
                      count: currentCourseLabels.length,
                    })}
                  </Text>
                </Space>
              }
            >
              {currentCourseLabels.length > 0 ? (
                <Space size={[4, 4]} wrap>
                  {currentCourseLabels.map((label) => (
                    <Tag
                      key={label.id}
                      closable
                      onClose={() => handleRemoveCourseLabel(label.id)}
                      style={{
                        backgroundColor: label.bgColor,
                        color: label.textColor,
                        border: `1px solid ${label.borderColor}`,
                        margin: 0,
                      }}
                      closeIcon={
                        <CloseOutlined style={{ color: label.textColor }} />
                      }
                    >
                      {label.name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('labels.noCourseLabelsSet')}
                />
              )}
            </Card>
          )}
        </Space>
      </StyledDrawer>

      {/* 標籤編輯 Modal */}
      <LabelEditModal
        open={editModalOpen}
        label={currentLabel}
        mode={modalMode}
        onCancel={() => setEditModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default LabelEditDrawer;
