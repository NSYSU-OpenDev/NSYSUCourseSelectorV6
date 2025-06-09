import React, { useState } from 'react';
import { Modal, Button, Space, Input } from 'antd';
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
  const [bgColor, setBgColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#d9d9d9');

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
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} title='編輯標籤'>
      <Space direction='vertical' style={{ width: '100%' }} size='small'>
        {labels.map((label) => (
          <Button
            key={label.id}
            type={current.includes(label.id) ? 'primary' : 'default'}
            style={{
              background: label.bgColor,
              borderColor: label.borderColor,
            }}
            onClick={() => handleToggle(label.id)}
          >
            {label.name}
          </Button>
        ))}
        <Input
          placeholder='標籤名稱'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Input
          type='color'
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        />
        <Input
          type='color'
          value={borderColor}
          onChange={(e) => setBorderColor(e.target.value)}
        />
        <Button onClick={handleAddLabel}>新增標籤</Button>
      </Space>
    </Modal>
  );
};

export default LabelEditModal;
