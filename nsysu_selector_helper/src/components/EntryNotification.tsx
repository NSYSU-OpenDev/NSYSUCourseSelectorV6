import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox } from 'antd';
import {
  NotificationOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const TextWithIcon = styled.h3`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;

  svg {
    margin: 0 8px 0 0;
  }
`;

const EntryNotification: React.FC = () => {
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const announcementSeen = localStorage.getItem('entryNotificationSeen');
    const versionSeen = localStorage.getItem('entryNotificationVersion');

    if (announcementSeen !== 'true' || versionSeen !== t('version')) {
      setIsModalOpen(true);
    }
  }, [t]);

  const renderList = (items: string[]) => {
    return items.map((item, index) => <li key={index}>{item}</li>);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDontShowAgain = (event: CheckboxChangeEvent) => {
    const { checked } = event.target;
    localStorage.setItem('entryNotificationSeen', checked ? 'true' : 'false');
    localStorage.setItem('entryNotificationVersion', t('version'));
    setDontShowAgain(checked);
  };

  const announcementContent = t('announcementContent', {
    returnObjects: true,
  }) as {
    description: string;
    updates: string;
    updatesDetails: string[];
    features: string[];
    knownIssues: string[];
    contactEmail: string;
    copyright: string[];
  };

  return (
    <Modal
      title={
        <TextWithIcon>
          <NotificationOutlined /> {t('announcements')}
        </TextWithIcon>
      }
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Checkbox
          key='dontShowAgain'
          checked={dontShowAgain}
          onChange={handleDontShowAgain}
        >
          {t('announcementContent.dontShowAgain')}
        </Checkbox>,
        <Button key='cancel' onClick={handleCancel}>
          {t('announcementContent.close')}
        </Button>,
        <Button key='submit' type={'primary'}>
          <a href={t('feedbackFormUrl')} target='_blank' rel='noreferrer'>
            {t('announcementContent.fillFeedbackForm')}
          </a>
        </Button>,
      ]}
    >
      <p>{announcementContent.description}</p>
      <TextWithIcon>
        <ArrowUpOutlined /> {t('announcementContent.updates')}:
      </TextWithIcon>
      <ul>{renderList(announcementContent.updatesDetails)}</ul>
      <TextWithIcon>
        <FileTextOutlined /> {t('announcementContent.feedbackForm')}:
      </TextWithIcon>
      <ul>
        <li>
          <a href={t('feedbackFormUrl')} target='_blank' rel='noreferrer'>
            {t('feedbackFormUrl')}
          </a>
        </li>
      </ul>
    </Modal>
  );
};

export default EntryNotification;
