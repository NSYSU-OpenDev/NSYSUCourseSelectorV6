import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Button, Tag, Flex, Space } from 'antd';
import {
  InfoCircleOutlined,
  BugOutlined,
  FileTextOutlined,
  GithubOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
  DiscordOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { AnnouncementService } from '@/services';
import type { Announcement } from '@/types';
import { useWindowSize } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsDarkMode } from '@/store';

const { Title, Text } = Typography;

// 使用與其他頁面相同的緊湊風格
const StyledCard = styled(Card)`
  div.ant-card-head {
    padding: 0;
  }

  div.ant-card-head-title {
    padding: 8px 12px;

    @media screen and (max-width: 768px) {
      padding: 6px 8px;
    }
  }

  div.ant-card-body {
    padding: 0;
  }
`;

const ContentContainer = styled.div`
  padding: 12px;

  @media screen and (max-width: 768px) {
    padding: 8px;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const VersionInfo = styled(Flex)<{ $isDark: boolean }>`
  margin-bottom: 16px;
  padding: 12px;
  background: ${(props) => (props.$isDark ? '#262626' : '#f5f5f5')};
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$isDark ? '#434343' : '#e8e8e8')};

  @media screen and (max-width: 768px) {
    margin-bottom: 12px;
    padding: 8px;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start !important;
  }
`;

const QuickActionContainer = styled(Space)`
  @media screen and (max-width: 768px) {
    width: 100%;

    .ant-space-item {
      flex: 1;

      .ant-btn {
        width: 100%;
        font-size: 12px;
        height: 28px;
        padding: 0 8px;
      }
    }
  }
`;

const MarkdownContent = styled.div<{ $isDark: boolean }>`
  p {
    margin: 6px 0;
    line-height: 1.6;

    @media screen and (max-width: 768px) {
      margin: 4px 0;
      line-height: 1.5;
      font-size: 14px;
    }
  }

  ul {
    margin: 8px 0;
    padding-left: 20px;

    @media screen and (max-width: 768px) {
      padding-left: 16px;
      margin: 6px 0;
    }
  }

  li {
    margin-bottom: 4px;
    line-height: 1.5;

    @media screen and (max-width: 768px) {
      margin-bottom: 3px;
      line-height: 1.4;
      font-size: 14px;
    }
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
    padding: 8px 12px;
    border-left: 4px solid ${(props) => (props.$isDark ? '#69b7ff' : '#1976d2')};
    background: ${(props) => (props.$isDark ? '#262626' : '#f8f9fa')};

    @media screen and (max-width: 768px) {
      margin: 6px 0;
      padding: 6px 8px;
    }
  }
`;

const SectionTitle = styled(Title)<{ $isDark: boolean }>`
  &.ant-typography {
    margin: 0 0 8px 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: ${(props) => (props.$isDark ? '#fff' : '#1f1f1f')} !important;

    @media screen and (max-width: 768px) {
      font-size: 13px !important;
      margin: 0 0 6px 0 !important;
    }
  }
`;

const FooterContainer = styled.div<{ $isDark: boolean }>`
  padding-top: 12px;
  border-top: 1px solid ${(props) => (props.$isDark ? '#434343' : '#e8e8e8')};
  font-size: 12px;
  color: ${(props) => (props.$isDark ? '#999' : '#666')};

  @media screen and (max-width: 768px) {
    padding-top: 8px;
    font-size: 11px;

    .footer-flex {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start !important;
    }
  }
`;

/**
 * 公告頁面組件
 * 顯示應用程式的公告、更新和相關資訊
 */
const AnnouncementPage: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const isDark = useAppSelector(selectIsDarkMode);

  /**
   * 載入公告資料
   */
  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        setLoading(true);
        const config = await AnnouncementService.loadAnnouncementsFromJson(
          '/announcements.json',
        );
        const data = AnnouncementService.getCurrentAnnouncement(config);
        setAnnouncement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入公告失敗');
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncement();
  }, []);

  if (loading) {
    return (
      <StyledCard title='系統公告' loading={true}>
        <div style={{ height: 200 }} />
      </StyledCard>
    );
  }

  if (error || !announcement) {
    return (
      <StyledCard title='系統公告'>
        <Alert
          message='載入失敗'
          description={error || '無法載入公告資料'}
          type='error'
          showIcon
        />
      </StyledCard>
    );
  }
  const CardTitle = (
    <Flex justify='space-between' align='center'>
      <span>系統公告</span>
      <Tag color='blue'>{announcement.version}</Tag>
    </Flex>
  );

  return (
    <StyledCard title={CardTitle}>
      <ContentContainer>
        {/* 版本資訊和快速連結 */}
        <VersionInfo
          justify='space-between'
          align='center'
          wrap='wrap'
          $isDark={isDark}
        >
          <Text strong style={{ fontSize: isMobile ? '14px' : '15px' }}>
            當前版本：{announcement.version}
          </Text>
          <QuickActionContainer size={isMobile ? 'small' : 'middle'} wrap>
            {announcement.feedbackFormUrl && (
              <Button
                size={isMobile ? 'small' : 'middle'}
                icon={<FileTextOutlined />}
                href={announcement.feedbackFormUrl}
                target='_blank'
              >
                {isMobile ? '回饋' : '意見回饋'}
              </Button>
            )}
            {announcement.dcForumUrl && (
              <Button
                size={isMobile ? 'small' : 'middle'}
                icon={<DiscordOutlined />}
                href={announcement.dcForumUrl}
                target='_blank'
              >
                Discord
              </Button>
            )}
            {announcement.githubUrl && (
              <Button
                size={isMobile ? 'small' : 'middle'}
                icon={<GithubOutlined />}
                href={announcement.githubUrl}
                target='_blank'
              >
                GitHub
              </Button>
            )}
          </QuickActionContainer>
        </VersionInfo>

        {/* 重要說明 */}
        <SectionContainer>
          <Alert
            message={
              <Flex align='center' gap={4}>
                <ExclamationCircleOutlined />
                <span
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 600,
                  }}
                >
                  重要說明
                </span>
              </Flex>
            }
            description={
              <MarkdownContent $isDark={isDark}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {announcement.description}
                </ReactMarkdown>
              </MarkdownContent>
            }
            type='info'
            showIcon={false}
          />
        </SectionContainer>

        {/* 更新內容 */}
        {announcement.updates && announcement.updates.length > 0 && (
          <SectionContainer>
            <SectionTitle level={5} $isDark={isDark}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              最新更新
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

        {/* 功能特色 */}
        {announcement.features && announcement.features.length > 0 && (
          <SectionContainer>
            <SectionTitle level={5} $isDark={isDark}>
              <InfoCircleOutlined style={{ marginRight: 6 }} />
              功能特色
            </SectionTitle>
            <Alert
              type='success'
              showIcon={false}
              description={
                <MarkdownContent $isDark={isDark}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {announcement.features
                      .map((feature) => `- ${feature}`)
                      .join('\n')}
                  </ReactMarkdown>
                </MarkdownContent>
              }
            />
          </SectionContainer>
        )}

        {/* 已知問題 */}
        {announcement.knownIssues && announcement.knownIssues.length > 0 && (
          <SectionContainer>
            <SectionTitle level={5} $isDark={isDark}>
              <BugOutlined style={{ marginRight: 6 }} />
              已知問題
            </SectionTitle>
            <Alert
              type='warning'
              showIcon={false}
              description={
                <MarkdownContent $isDark={isDark}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {announcement.knownIssues
                      .map((issue) => `- ${issue}`)
                      .join('\n')}
                  </ReactMarkdown>
                </MarkdownContent>
              }
            />
          </SectionContainer>
        )}

        {/* 使用條款 */}
        {announcement.termsOfUse && (
          <SectionContainer>
            <SectionTitle level={5} $isDark={isDark}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              使用條款
            </SectionTitle>
            <MarkdownContent $isDark={isDark}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {announcement.termsOfUse}
              </ReactMarkdown>
            </MarkdownContent>
          </SectionContainer>
        )}

        {/* 聯絡資訊和版權 */}
        <FooterContainer $isDark={isDark}>
          <Flex
            className='footer-flex'
            justify='space-between'
            align='center'
            wrap='wrap'
          >
            <Space size='small'>
              {announcement.contactEmail && (
                <a href={`mailto:${announcement.contactEmail}`}>
                  <MailOutlined style={{ marginRight: 4 }} /> 聯絡我們
                </a>
              )}
            </Space>
            <div>
              {announcement.copyright && (
                <MarkdownContent $isDark={isDark}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {Array.isArray(announcement.copyright)
                      ? announcement.copyright.join('\n')
                      : announcement.copyright}
                  </ReactMarkdown>
                </MarkdownContent>
              )}
            </div>
          </Flex>
        </FooterContainer>
      </ContentContainer>
    </StyledCard>
  );
};

export default AnnouncementPage;
