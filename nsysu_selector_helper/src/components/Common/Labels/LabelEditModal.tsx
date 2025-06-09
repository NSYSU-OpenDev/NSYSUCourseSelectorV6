import React, { useState } from 'react';
import { Modal, Button, Space, Input, Flex, Divider, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectLabels,
  selectCourseLabelMap,
  addLabel,
  assignLabel,
  removeCourseLabel,
} from '@/store';
import type { CourseLabel } from '@/services';
import { v4 as uuidv4 } from 'uuid';

const { Text } = Typography;

interface Props {
  courseId: string;
  open: boolean;
  onClose: () => void;
}

const LabelEditModal: React.FC<Props> = ({ courseId, open, onClose }) => {
  const dispatch = useAppDispatch();
  const labels = useAppSelector(selectLabels);
  const map = useAppSelector(selectCourseLabelMap);
  const current = map[courseId] || [];
  const [newName, setNewName] = useState('');
  const [bgColor, setBgColor] = useState('#1890ff');
  const [borderColor, setBorderColor] = useState('#1890ff');
  const [isCreating, setIsCreating] = useState(false);

  const handleToggle = (labelId: string) => {
    if (current.includes(labelId)) {
      dispatch(removeCourseLabel({ courseId, labelId }));
    } else {
      dispatch(assignLabel({ courseId, labelId }));
    }
  };

  const handleAddLabel = () => {
    if (!newName.trim()) return;
    const newLabel: CourseLabel = {
      id: uuidv4(),
      name: newName.trim(),
      bgColor,
      borderColor,
    };
    dispatch(addLabel(newLabel));
    dispatch(assignLabel({ courseId, labelId: newLabel.id }));
    setNewName('');
    setIsCreating(false);
  };

  const resetCreateForm = () => {
    setNewName('');
    setBgColor('#1890ff');
    setBorderColor('#1890ff');
    setIsCreating(false);
  };

  const handleCancel = () => {
    resetCreateForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleCancel}
      title='編輯課程標籤'
      width={420}
      centered
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {/* 現有標籤選擇區 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            選擇標籤
          </Text>
          <Flex wrap='wrap' gap={8}>
            {labels.length > 0 ? (
              labels.map((label) => (
                <Button
                  key={label.id}
                  type={current.includes(label.id) ? 'primary' : 'default'}
                  size='small'
                  style={{
                    backgroundColor: current.includes(label.id)
                      ? label.bgColor
                      : undefined,
                    borderColor: label.borderColor,
                    color: current.includes(label.id) ? '#fff' : undefined,
                  }}
                  onClick={() => handleToggle(label.id)}
                >
                  {label.name}
                </Button>
              ))
            ) : (
              <Text type='secondary'>尚未建立任何標籤</Text>
            )}
          </Flex>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 新增標籤區 */}
        <div>
          {!isCreating ? (
            <Button
              icon={<PlusOutlined />}
              type='dashed'
              onClick={() => setIsCreating(true)}
              block
            >
              新增標籤
            </Button>
          ) : (
            <Space direction='vertical' style={{ width: '100%' }} size='small'>
              <Text strong>新增標籤</Text>
              <Input
                placeholder='標籤名稱'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onPressEnter={handleAddLabel}
                autoFocus
              />
              <Flex gap={8} align='center'>
                <Text>背景顏色:</Text>
                <Input
                  type='color'
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 60, padding: 4 }}
                />
                <Text>邊框顏色:</Text>
                <Input
                  type='color'
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  style={{ width: 60, padding: 4 }}
                />
              </Flex>
              <Flex gap={8}>
                <Button
                  type='primary'
                  onClick={handleAddLabel}
                  disabled={!newName.trim()}
                >
                  確認新增
                </Button>
                <Button onClick={resetCreateForm}>取消</Button>
              </Flex>
            </Space>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default LabelEditModal;
