import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox, Alert, Tag, Flex, Space } from 'antd';
import {
  NotificationOutlined,
  InfoCircleOutlined,
  DiscordOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useTranslation } from '@/hooks';
import { AnnouncementService } from '@/services';
import type { Announcement } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { selectIsDarkMode } from '@/store';

const TextWithIcon = styled.h3`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;

  svg {
    margin: 0 8px 0 0;
  }
`;

const VersionTag = styled(Tag)`
  margin: 18px 0 0 0 !important;
`;

const VersionInfo = styled(Flex)<{ $isDark: boolean }>`
  margin-bottom: 16px;
  padding: 12px;
  background: ${(props) => (props.$isDark ? '#262626' : '#f5f5f5')};
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$isDark ? '#434343' : '#e8e8e8')};
  flex-direction: column;
  gap: 12px;
  align-items: flex-start !important;
`;

const MarkdownContent = styled.div<{ $isDark: boolean }>`
  p {
    margin: 6px 0;
    line-height: 1.6;
    font-size: 14px;
  }

  ul {
    margin: 8px 0;
    padding-left: 16px;
  }

  li {
    margin-bottom: 4px;
    line-height: 1.5;
    font-size: 14px;
  }

  strong {
    color: ${(props) => (props.$isDark ? '#ff7875' : '#d32f2f')};
    font-weight: 600;
  }

  a {
    color: ${(props) => (props.$isDark ? '#69b7ff' : '#1976d2')};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    margin: 8px 0;
    padding: 6px 8px;
    border-left: 4px solid ${(props) => (props.$isDark ? '#69b7ff' : '#1976d2')};
    background: ${(props) => (props.$isDark ? '#262626' : '#f8f9fa')};
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4<{ $isDark: boolean }>`
  margin: 0 0 8px 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: ${(props) => (props.$isDark ? '#fff' : '#1f1f1f')} !important;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EntryNotification: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isDark = useAppSelector(selectIsDarkMode);

  /**
   * 載入公告資料並檢查是否需要顯示通知
   */
  useEffect(() => {
    const loadAnnouncementAndCheckVisibility = async () => {
      try {
        setLoading(true);
        const config = await AnnouncementService.loadAnnouncementsFromJson(
          i18n.language,
        );
        const data = AnnouncementService.getCurrentAnnouncement(config);
        setAnnouncement(data);

        if (data) {
          // 檢查是否需要顯示通知
          const announcementSeen = localStorage.getItem(
            'NSYSUCourseSelector.entryNotificationSeen',
          );
          const versionSeen = localStorage.getItem(
            'NSYSUCourseSelector.entryNotificationVersion',
          );

          if (announcementSeen !== 'true' || versionSeen !== data.version) {
            setIsModalOpen(true);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('entryNotification.loadAnnouncementFailed'),
        );
        console.error('Failed to load announcement:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncementAndCheckVisibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDontShowAgain = (event: CheckboxChangeEvent) => {
    const { checked } = event.target;
    localStorage.setItem(
      'NSYSUCourseSelector.entryNotificationSeen',
      checked ? 'true' : 'false',
    );
    if (announcement) {
      localStorage.setItem(
        'NSYSUCourseSelector.entryNotificationVersion',
        announcement.version,
      );
    }
    setDontShowAgain(checked);
  };

  // 如果正在載入或發生錯誤，不顯示 Modal
  if (loading || error || !announcement) {
    return null;
  }

  const modalTitle = (
    <Flex justify='space-between' align='center'>
      <TextWithIcon>
        <NotificationOutlined /> {t('entryNotification.systemAnnouncement')}
      </TextWithIcon>
      <VersionTag color='blue'>{announcement.version}</VersionTag>
    </Flex>
  );

  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      centered={true}
      width={600}
      footer={
        <Flex wrap={true} justify={'flex-end'} align={'center'} gap={8}>
          <Checkbox
            name={'dontShowAgain'}
            key='dontShowAgain'
            checked={dontShowAgain}
            onChange={handleDontShowAgain}
          >
            {t('entryNotification.dontShowVersionAgain')}
          </Checkbox>
          <Space>
            <Button key='cancel' onClick={handleCancel}>
              {t('entryNotification.close')}
            </Button>
            {announcement.dcForumUrl && (
              <Button
                key='discord'
                icon={<DiscordOutlined />}
                href={announcement.dcForumUrl}
                target='_blank'
              >
                Discord
              </Button>
            )}
            {announcement.feedbackFormUrl && (
              <Button key='feedback' type='primary'>
                <a
                  href={announcement.feedbackFormUrl}
                  target='_blank'
                  rel='noreferrer'
                >
                  {t('entryNotification.feedback')}
                </a>
              </Button>
            )}
          </Space>
        </Flex>
      }
    >
      {/* 版本資訊 */}
      <VersionInfo justify='center' align='center' $isDark={isDark}>
        <div style={{ fontSize: '15px', fontWeight: 'bold' }}>
          {t('entryNotification.currentVersion')}：{announcement.version}
        </div>
      </VersionInfo>

      {/* 最新更新 */}
      {announcement.updates && announcement.updates.length > 0 && (
        <SectionContainer>
          <SectionTitle $isDark={isDark}>
            <InfoCircleOutlined />
            {t('entryNotification.latestUpdates')}
          </SectionTitle>
          <Alert
            type='success'
            showIcon={false}
            description={
              <MarkdownContent $isDark={isDark}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {announcement.updates
                    .map((update) => `- ${update}`)
                    .join('\n')}
                </ReactMarkdown>
              </MarkdownContent>
            }
          />
        </SectionContainer>
      )}
    </Modal>
  );
};

export default EntryNotification;
