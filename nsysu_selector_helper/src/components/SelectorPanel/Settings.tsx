import { FC, useState } from 'react';
import {
  Card,
  Space,
  Typography,
  Select,
  ColorPicker,
  Slider,
  Button,
  Modal,
  message,
  Divider,
  Row,
  Col,
  Flex,
} from 'antd';
import {
  ReloadOutlined,
  BgColorsOutlined,
  TranslationOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPrimaryColor,
  selectAlgorithms,
  selectBorderRadius,
  setPrimaryColor,
  setAlgorithms,
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

type AlgorithmType = 'defaultAlgorithm' | 'darkAlgorithm' | 'compactAlgorithm';

const Settings: FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentPrimaryColorFromStore = useAppSelector(selectPrimaryColor);
  const currentAlgorithmsFromStore = useAppSelector(selectAlgorithms);
  const currentBorderRadiusFromStore = useAppSelector(selectBorderRadius);
  const [messageApi, contextHolder] = message.useMessage(); // 從當前主題配置中提取設定值
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [currentPrimaryColor, setCurrentPrimaryColor] = useState(
    currentPrimaryColorFromStore,
  );
  const [currentBorderRadius, setCurrentBorderRadius] = useState(
    currentBorderRadiusFromStore,
  );

  // 獲取當前選中的算法
  const getCurrentAlgorithms = (): string[] => {
    return currentAlgorithmsFromStore.filter(
      (algo) => algo !== 'defaultAlgorithm',
    );
  };

  const [currentAlgorithms, setCurrentAlgorithms] = useState<string[]>(
    getCurrentAlgorithms(),
  );
  // 語言選項
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

  // 算法選項
  const algorithmOptions = [
    {
      value: 'darkAlgorithm',
      label: t('settings.theme.mode.options.dark'),
    },
    {
      value: 'compactAlgorithm',
      label: t('settings.theme.mode.options.compact'),
    },
  ];

  // 處理語言變更
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    void i18n.changeLanguage(language);
    void messageApi.success('語言設定已更新');
  };

  // 處理算法變更
  const handleAlgorithmChange = (algorithms: string[]) => {
    setCurrentAlgorithms(algorithms);

    // 轉換為完整的算法陣列
    const fullAlgorithms: AlgorithmType[] =
      algorithms.length === 0
        ? ['defaultAlgorithm']
        : algorithms.map((algo) => algo as AlgorithmType);

    dispatch(setAlgorithms(fullAlgorithms));
    void messageApi.success('主題算法已更新');
  };
  // 處理主色調變更 - 只更新本地狀態
  const handlePrimaryColorChange = (
    value: { toHexString: () => string } | string,
  ) => {
    const colorString = typeof value === 'string' ? value : value.toHexString();
    setCurrentPrimaryColor(colorString);
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

  // 處理主色調變更完成 - 更新 Redux 狀態
  const handlePrimaryColorChangeComplete = (
    value: { toHexString: () => string } | string,
  ) => {
    const colorString = typeof value === 'string' ? value : value.toHexString();
    setCurrentPrimaryColor(colorString);
    dispatch(setPrimaryColor(colorString));
    void messageApi.success('主色調已更新');
  };

  // 重置所有設定
  const handleResetSettings = () => {
    Modal.confirm({
      title: t('settings.reset.confirm'),
      onOk: () => {
        // 重置語言
        void i18n.changeLanguage('zh-TW');
        setCurrentLanguage('zh-TW'); // 重置主題設定
        const defaultPrimaryColor = 'rgb(0, 158, 150)';
        const defaultBorderRadius = 4;

        setCurrentAlgorithms([]);
        setCurrentPrimaryColor(defaultPrimaryColor);
        setCurrentBorderRadius(defaultBorderRadius);

        dispatch(resetTheme());

        // 清除相關的 localStorage
        localStorage.removeItem('NSYSUCourseSelector.algorithms');
        localStorage.removeItem('NSYSUCourseSelector.algorithm');
        localStorage.removeItem('NSYSUCourseSelector.primaryColor');
        localStorage.removeItem('NSYSUCourseSelector.borderRadius');
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
        {/* 語言設定 */}
        <SettingCard
          title={
            <Space>
              <TranslationOutlined />
              {t('settings.language.title')}
            </Space>
          }
        >
          <SettingItem>
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
              style={{ width: 150 }}
              size='small'
            />
          </SettingItem>
        </SettingCard>
        {/* 主題設定 */}
        <SettingCard
          title={
            <Space>
              <BgColorsOutlined />
              {t('settings.theme.title')}
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <SettingItem>
                <SettingLabel>
                  <Text strong>{t('settings.theme.mode.title')}</Text>
                </SettingLabel>
                <SettingDescription>
                  {t('settings.theme.description')}
                </SettingDescription>
                <Select
                  mode='multiple'
                  value={currentAlgorithms}
                  onChange={handleAlgorithmChange}
                  options={algorithmOptions}
                  style={{ width: '100%' }}
                  size='small'
                  placeholder='選擇主題算法'
                />
              </SettingItem>
            </Col>
            <Col span={12}>
              <SettingItem>
                <SettingLabel>
                  <Text strong>{t('settings.theme.primaryColor.title')}</Text>
                </SettingLabel>
                <SettingDescription>
                  {t('settings.theme.primaryColor.description')}
                </SettingDescription>
                <ColorPicker
                  value={currentPrimaryColor}
                  onChange={handlePrimaryColorChange}
                  onChangeComplete={handlePrimaryColorChangeComplete}
                  showText
                  format='hex'
                  size='small'
                  presets={[
                    {
                      label: '預設色彩',
                      colors: [
                        'rgb(0, 158, 150)',
                        '#1890ff',
                        '#722ed1',
                        '#13c2c2',
                        '#52c41a',
                        '#faad14',
                        '#f5222d',
                      ],
                    },
                  ]}
                />
              </SettingItem>
            </Col>
          </Row>
          <Divider size={'small'} />
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
