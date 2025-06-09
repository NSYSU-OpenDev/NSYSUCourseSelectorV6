import React, { useState } from 'react';
import {
  Drawer,
  Space,
  Button,
  Typography,
  Tag,
  Input,
  ColorPicker,
  Form,
  Modal,
  Row,
  Col,
  Card,
  Divider,
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
} from '@ant-design/icons';
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
import type { Color } from 'antd/es/color-picker';

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

// 常用顏色組合
const colorPresets = [
  {
    name: '藍色',
    bgColor: '#f0f5ff',
    borderColor: '#adc6ff',
    textColor: '#1890ff',
  },
  {
    name: '綠色',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    textColor: '#52c41a',
  },
  {
    name: '橙色',
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
    textColor: '#fa8c16',
  },
  {
    name: '紅色',
    bgColor: '#fff1f0',
    borderColor: '#ffccc7',
    textColor: '#f5222d',
  },
  {
    name: '紫色',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7',
    textColor: '#722ed1',
  },
  {
    name: '青色',
    bgColor: '#e6fffb',
    borderColor: '#87e8de',
    textColor: '#13c2c2',
  },
  {
    name: '黃色',
    bgColor: '#fffbe6',
    borderColor: '#ffe58f',
    textColor: '#d48806',
  },
  {
    name: '粉色',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2',
    textColor: '#eb2f96',
  },
];

// 標籤編輯表單 Modal
const LabelEditModal: React.FC<{
  open: boolean;
  label?: CourseLabel;
  onCancel: () => void;
  onSubmit: (
    labelData: Partial<
      CourseLabel & {
        bgColor: Color | string;
        borderColor: Color | string;
        textColor: Color | string;
      }
    >,
  ) => void;
  mode: 'create' | 'edit';
}> = ({ open, label, onCancel, onSubmit, mode }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表單驗證失敗:', error);
    }
  };
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 應用預設顏色組合
  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    form.setFieldsValue({
      bgColor: preset.bgColor,
      borderColor: preset.borderColor,
      textColor: preset.textColor,
    });
  };

  return (
    <Modal
      title={mode === 'create' ? '新增標籤' : '編輯標籤'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={mode === 'create' ? '新增' : '更新'}
      cancelText='取消'
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={
          label || {
            bgColor: colorPresets[0].bgColor,
            borderColor: colorPresets[0].borderColor,
            textColor: colorPresets[0].textColor,
          }
        }
        preserve={false}
      >
        <Form.Item
          name='name'
          label='標籤名稱'
          rules={[{ required: true, message: '請輸入標籤名稱' }]}
        >
          <Input placeholder='請輸入標籤名稱' />
        </Form.Item>

        <Divider orientation='left'>顏色設定</Divider>

        <Form.Item label='常用顏色組合'>
          <Space size={[4, 4]} wrap>
            {colorPresets.map((preset) => (
              <Button
                key={preset.name}
                size='small'
                onClick={() => applyColorPreset(preset)}
                style={{
                  backgroundColor: preset.bgColor,
                  color: preset.textColor,
                  border: `1px solid ${preset.borderColor}`,
                  height: 'auto',
                  padding: '4px 8px',
                }}
                title={`應用${preset.name}配色`}
              >
                {preset.name}
              </Button>
            ))}
          </Space>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name='bgColor'
              label='背景色'
              rules={[{ required: true, message: '請選擇背景色' }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='borderColor'
              label='邊框色'
              rules={[{ required: true, message: '請選擇邊框色' }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='textColor'
              label='文字色'
              rules={[{ required: true, message: '請選擇文字色' }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

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
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectLabels);
  const currentCourseLabels = useAppSelector(
    selectCourseLabels(courseId || ''),
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
      label: '編輯',
      icon: <EditOutlined />,
      onClick: () => handleEditLabel(label),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '刪除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteLabel(label.id),
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
            <span>標籤管理</span>
          </Space>
        }
        placement='right'
        mask={false}
        maskClosable={false}
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
                <span>標籤應用</span>
                <Tooltip
                  title={
                    courseId
                      ? '點擊標籤即可快速應用到當前課程'
                      : '請先從課程列表開啟標籤管理'
                  }
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            extra={
              <Tooltip title='新增標籤'>
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
                          ? '請先選擇課程'
                          : isApplied
                            ? `已應用標籤「${label.name}」`
                            : `應用標籤「${label.name}」到課程`
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
                description='尚未建立任何標籤'
              >
                <Button
                  type='primary'
                  icon={<PlusOutlined />}
                  onClick={handleCreateLabel}
                >
                  建立第一個標籤
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
                  <span>當前課程標籤</span>
                  <Text type='secondary' style={{ fontSize: '12px' }}>
                    ({currentCourseLabels.length} 個標籤)
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
                    >
                      {label.name}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description='此課程尚未設定標籤'
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
