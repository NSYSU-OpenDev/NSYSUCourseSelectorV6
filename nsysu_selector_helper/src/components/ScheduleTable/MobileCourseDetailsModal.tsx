import React from 'react';
import { Button, Modal, notification } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';

import {
  selectCourse,
  setActiveCollapseKey,
  setScrollToCourseId,
  setSelectedTabKey,
} from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { useTranslation, useWindowSize } from '@/hooks';
import { getLocalizedCourseName } from '@/utils';
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
  const { t, i18n } = useTranslation();
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

  const handleRemoveCourse = () => {
    if (!selectedCourse) return;

    const courseName = getLocalizedCourseName(
      selectedCourse.name,
      i18n.language,
    );
    const notificationKey = `remove-course-${selectedCourse.id}`;

    dispatch(selectCourse({ course: selectedCourse, isSelected: false }));
    setModalVisible(false);

    notification.open({
      key: notificationKey,
      message: t('scheduleTable.mobileDetails.removedCourse', {
        courseName,
      }),
      btn: (
        <Button
          type='link'
          size='small'
          onClick={() => {
            dispatch(
              selectCourse({ course: selectedCourse, isSelected: true }),
            );
            notification.destroy(notificationKey);
          }}
        >
          {t('scheduleTable.mobileDetails.undo')}
        </Button>
      ),
      placement: 'bottomRight',
    });
  };

  return (
    <Modal
      title={t('scheduleTable.mobileDetails.title')}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key='cancel' onClick={() => setModalVisible(false)}>
          {t('scheduleTable.mobileDetails.close')}
        </Button>,
        <Button
          key='remove'
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedCourse}
          onClick={handleRemoveCourse}
        >
          {t('scheduleTable.mobileDetails.removeCourse')}
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
          {t('scheduleTable.mobileDetails.viewCourse')}
        </Button>,
      ]}
      centered
    >
      {selectedCourse && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.name')}：</strong>
            {getLocalizedCourseName(selectedCourse.name, i18n.language)}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.teacher')}：</strong>
            {selectedCourse.teacher}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.courseId')}：</strong>
            {selectedCourse.id}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.credit')}：</strong>
            {selectedCourse.credit}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.room')}：</strong>
            {selectedCourse.roomForThisSlot || t('scheduleTable.unknownRoom')}
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>{t('scheduleTable.mobileDetails.department')}：</strong>
            {selectedCourse.department}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MobileCourseDetailsModal;
