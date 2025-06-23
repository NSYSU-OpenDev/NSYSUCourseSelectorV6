import { FC, useState } from 'react';
import {
  Card,
  Space,
  Typography,
  Switch,
  Slider,
  Button,
  Modal,
  message,
  Row,
  Col,
  Flex,
  Select,
} from 'antd';
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectIsDarkMode,
  selectBorderRadius,
  setDarkMode,
  setBorderRadius,
  resetTheme,
} from '@/store';

const { Text } = Typography;

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

const SettingsContainer = styled.div`
  padding: 12px;
  max-width: 800px;
  margin: 0 auto;
`;

const SettingCard = styled(Card)`
  margin-bottom: 12px;

  .ant-card-head {
    padding: 8px 16px;
  }

  .ant-card-body {
    padding: 16px;
  }
`;

const SettingItem = styled.div`
  padding: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.div`
  margin-bottom: 6px;
`;

const SettingDescription = styled(Text)`
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 12px;
`;

const Settings: FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isDarkModeFromStore = useAppSelector(selectIsDarkMode);
  const currentBorderRadiusFromStore = useAppSelector(selectBorderRadius);
  const [messageApi, contextHolder] = message.useMessage();

  // 本地狀態
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isDarkMode, setIsDarkModeLocal] = useState(isDarkModeFromStore);
  const [currentBorderRadius, setCurrentBorderRadius] = useState(
    currentBorderRadiusFromStore,
  ); // 語言選項
  const languageOptions = [
    {
      value: 'zh-TW',
      label: t('settings.language.options.zh-TW'),
    },
    // 可以在未來添加更多語言
    // {
    //   value: 'en',
    //   label: t('settings.language.options.en'),
    // },
  ];

  // 處理語言變更
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    void i18n.changeLanguage(language);
    void messageApi.success('語言設定已更新');
  };

  // 處理暗色模式切換
  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkModeLocal(checked);
    dispatch(setDarkMode(checked));
    void messageApi.success(checked ? '已切換到暗色模式' : '已切換到亮色模式');
  };

  // 處理圓角大小變更 - 只更新本地狀態
  const handleBorderRadiusChange = (value: number) => {
    setCurrentBorderRadius(value);
  };

  // 處理圓角大小變更完成 - 更新 Redux 狀態
  const handleBorderRadiusChangeComplete = (value: number) => {
    dispatch(setBorderRadius(value));
    void messageApi.success('圓角設定已更新');
  };
  // 重置所有設定
  const handleResetSettings = () => {
    Modal.confirm({
      title: t('settings.reset.confirm'),
      onOk: () => {
        // 重置語言
        void i18n.changeLanguage('zh-TW');
        setCurrentLanguage('zh-TW');

        // 重置主題設定
        const defaultBorderRadius = 4;
        setIsDarkModeLocal(false);
        setCurrentBorderRadius(defaultBorderRadius);

        dispatch(resetTheme());

        // 清除相關的 localStorage
        localStorage.removeItem('i18nextLng');

        void messageApi.success(t('settings.reset.success'));
      },
    });
  };
  const CardTitle = (
    <Flex justify='space-between' align='center'>
      <span>{t('settings.title')}</span>
    </Flex>
  );

  return (
    <StyledCard title={CardTitle}>
      <SettingsContainer>
        {contextHolder}
        {/* 設定 */}
        <SettingCard
          title={
            <Space>
              <SettingOutlined />
              {t('settings.general.title')}
            </Space>
          }
        >
          <SettingItem>
            <Row gutter={24}>
              <Col span={12}>
                <SettingLabel>
                  <Text strong>{t('settings.language.title')}</Text>
                </SettingLabel>
                <SettingDescription>
                  {t('settings.language.description')}
                </SettingDescription>
                <Select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  options={languageOptions}
                  style={{ width: '100%' }}
                  size='small'
                />
              </Col>
              <Col span={12}>
                <SettingLabel>
                  <Text strong>{t('settings.theme.mode.title')}</Text>
                </SettingLabel>
                <SettingDescription>
                  {t('settings.theme.description')}
                </SettingDescription>
                <Switch
                  checked={isDarkMode}
                  onChange={handleDarkModeChange}
                  checkedChildren='暗色'
                  unCheckedChildren='亮色'
                />
              </Col>
            </Row>
          </SettingItem>
          <SettingItem>
            <SettingLabel>
              <Text strong>{t('settings.theme.borderRadius.title')}</Text>
            </SettingLabel>
            <SettingDescription>
              {t('settings.theme.borderRadius.description')}
            </SettingDescription>
            <Row>
              <Col span={14}>
                <Slider
                  min={0}
                  max={16}
                  value={currentBorderRadius}
                  onChange={handleBorderRadiusChange}
                  onChangeComplete={handleBorderRadiusChangeComplete}
                />
              </Col>
              <Col span={4} offset={1}>
                <Text style={{ fontSize: '12px' }}>
                  {currentBorderRadius}px
                </Text>
              </Col>
            </Row>
          </SettingItem>
        </SettingCard>
        {/* 重置設定 */}
        <SettingCard
          title={
            <Space>
              <SettingOutlined />
              {t('settings.reset.title')}
            </Space>
          }
        >
          <SettingItem>
            <SettingLabel>
              <Text strong>{t('settings.reset.title')}</Text>
            </SettingLabel>
            <SettingDescription>
              {t('settings.reset.description')}
            </SettingDescription>
            <Button
              type='default'
              danger
              icon={<ReloadOutlined />}
              onClick={handleResetSettings}
              size='small'
            >
              {t('settings.reset.button')}
            </Button>
          </SettingItem>
        </SettingCard>
      </SettingsContainer>
    </StyledCard>
  );
};

export default Settings;
