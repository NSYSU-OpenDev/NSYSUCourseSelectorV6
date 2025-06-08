import React from 'react';
import { Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

import {
  setActiveCollapseKey,
  setScrollToCourseId,
  setSelectedTabKey,
} from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { useWindowSize } from '@/hooks';
import type { Course } from '@/types';

interface MobileCourseDetailsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedCourse: (Course & { roomForThisSlot?: string }) | null;
}

const MobileCourseDetailsModal: React.FC<MobileCourseDetailsModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedCourse,
}) => {
  const dispatch = useAppDispatch();
  const { width } = useWindowSize();
  const isMobile = width <= 768;

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

  return (
    <Modal
      title='課程詳情'
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key='cancel' onClick={() => setModalVisible(false)}>
          關閉
        </Button>,
        <Button
          key='navigate'
          type='primary'
          icon={<EyeOutlined />}
          onClick={() => {
            if (selectedCourse) {
              handleCourseNavigate(selectedCourse.id);
              setModalVisible(false);
            }
          }}
        >
          查看課程
        </Button>,
      ]}
      centered
    >
      {selectedCourse && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong>課程名稱：</strong>
            {selectedCourse.name}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>授課教師：</strong>
            {selectedCourse.teacher}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>課程代號：</strong>
            {selectedCourse.id}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>學分數：</strong>
            {selectedCourse.credit}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>教室：</strong>
            {selectedCourse.roomForThisSlot || '未知'}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>系所：</strong>
            {selectedCourse.department}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MobileCourseDetailsModal;
