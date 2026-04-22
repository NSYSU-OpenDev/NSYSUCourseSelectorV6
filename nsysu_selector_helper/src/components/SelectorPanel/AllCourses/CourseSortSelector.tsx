import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Space,
  Typography,
  Card,
  Empty,
  Divider,
  Popconfirm,
  Tag,
} from 'antd';
import {
  SortAscendingOutlined,
  PlusOutlined,
  ClearOutlined,
  BulbOutlined,
  AimOutlined,
  BarChartOutlined,
  BookOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSortConfig, setSortConfig, selectIsDarkMode } from '@/store';
import { CourseSortingService, SortConfig, SortRule } from '@/services';
import { DEFAULT_SORT_OPTIONS } from '@/constants';
import SortRuleItem from './SortRuleItem';
import { getSortRuleDisplayText } from '@/utils';
import { useTranslation } from '@/hooks';

const { Text, Title } = Typography;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 6px 8px;
  }

  .ant-drawer-body {
    padding: 12px;
  }
`;

interface CourseSortSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const CourseSortSelector: React.FC<CourseSortSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentSortConfig = useAppSelector(selectSortConfig);
  const isDarkMode = useAppSelector(selectIsDarkMode);
  const [tempConfig, setTempConfig] = useState<SortConfig>(currentSortConfig);

  // 更新本地配置當外部配置變化時（僅在 Drawer 打開時同步）
  React.useEffect(() => {
    if (visible) {
      setTempConfig(currentSortConfig);
    }
  }, [currentSortConfig, visible]);

  // 手動應用排序配置變更
  const applySortConfig = React.useCallback(
    (config: SortConfig) => {
      dispatch(setSortConfig(config));
      CourseSortingService.saveSortConfig(config);
    },
    [dispatch],
  );

  const handleAddRule = () => {
    // 找到尚未使用的排序選項，排除 default 選項
    const usedOptions = tempConfig.rules
      .filter((rule) => rule.option !== 'default')
      .map((rule) => rule.option);
    const availableOptions = DEFAULT_SORT_OPTIONS.filter(
      (opt) => opt.key !== 'default' && !usedOptions.includes(opt.key),
    );

    if (availableOptions.length > 0) {
      const newRule: SortRule = {
        option: availableOptions[0].key,
        direction: 'asc',
      }; // 如果當前是預設排序，則替換為新規則；否則添加到現有規則
      const isDefaultConfig =
        tempConfig.rules.length === 1 &&
        tempConfig.rules[0].option === 'default';
      const newConfig = {
        rules: isDefaultConfig ? [newRule] : [...tempConfig.rules, newRule],
      };
      setTempConfig(newConfig);
      applySortConfig(newConfig);
    }
  };

  // 添加常用排序規則的處理函數
  const handleAddCommonSort = (rules: SortRule[]) => {
    // 過濾掉已經存在的排序選項
    const existingOptions = tempConfig.rules
      .filter((rule) => rule.option !== 'default')
      .map((rule) => rule.option);

    const newRules = rules.filter(
      (rule) => !existingOptions.includes(rule.option),
    );

    if (newRules.length > 0) {
      // 如果當前是預設排序，則替換為新規則；否則添加到現有規則
      const isDefaultConfig =
        tempConfig.rules.length === 1 &&
        tempConfig.rules[0].option === 'default';
      const updatedRules = isDefaultConfig
        ? newRules
        : [
            ...tempConfig.rules.filter((rule) => rule.option !== 'default'),
            ...newRules,
          ];
      const newConfig = {
        rules: updatedRules,
      };
      setTempConfig(newConfig);
      applySortConfig(newConfig);
    }
  };
  const handleUpdateRule = (index: number, rule: SortRule) => {
    const newRules = [...tempConfig.rules];
    newRules[index] = rule;
    const newConfig = { rules: newRules };
    setTempConfig(newConfig);
    applySortConfig(newConfig);
  };
  const handleRemoveRule = (index: number) => {
    const newRules = tempConfig.rules.filter((_, i) => i !== index);
    // 如果刪除所有規則，添加一個預設規則
    if (newRules.length === 0) {
      newRules.push({ option: 'default', direction: 'asc' });
    }
    const newConfig = { rules: newRules };
    setTempConfig(newConfig);
    applySortConfig(newConfig);
  };

  const handleMoveRule = (from: number, to: number) => {
    const newRules = [...tempConfig.rules];
    const [moved] = newRules.splice(from, 1);
    newRules.splice(to, 0, moved);
    const newConfig = { rules: newRules };
    setTempConfig(newConfig);
    applySortConfig(newConfig);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      handleMoveRule(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < tempConfig.rules.length - 1) {
      handleMoveRule(index, index + 1);
    }
  };

  const handleReset = () => {
    const defaultConfig: SortConfig = {
      rules: [{ option: 'default', direction: 'asc' }],
    };
    setTempConfig(defaultConfig);
    // 立即應用重置配置
    dispatch(setSortConfig(defaultConfig));
    CourseSortingService.saveSortConfig(defaultConfig);
  };

  // 檢查是否還能添加更多規則，修復邏輯
  const usedOptionsForCheck = tempConfig.rules
    .filter((rule) => rule.option !== 'default')
    .map((rule) => rule.option);
  const availableOptions = DEFAULT_SORT_OPTIONS.filter(
    (opt) => opt.key !== 'default' && !usedOptionsForCheck.includes(opt.key),
  );
  const canAddMore = availableOptions.length > 0;

  return (
    <StyledDrawer
      title={
        <Space>
          <SortAscendingOutlined />
          <span>{t('sort.customSortTitle')}</span>
        </Space>
      }
      placement='left'
      mask={false}
      maskClosable={false}
      open={visible}
      onClose={onClose}
      width={400}
      extra={
        <Popconfirm
          title={t('sort.resetToDefault')}
          description={t('sort.resetWarning')}
          onConfirm={handleReset}
          okText={t('sort.resetButton')}
          cancelText={t('simpleFilter.cancel')}
        >
          <Button
            type='text'
            icon={<ClearOutlined />}
            disabled={
              tempConfig.rules.length === 1 &&
              tempConfig.rules[0].option === 'default'
            }
            size='small'
          >
            {t('sort.resetButton')}
          </Button>
        </Popconfirm>
      }
    >
      <Space direction='vertical' style={{ width: '100%' }} size='small'>
        {/* 說明文字 */}
        <Card
          size='small'
          style={{
            background: isDarkMode ? '#1a2332' : '#f0f8ff',
          }}
        >
          <Text type='secondary' style={{ fontSize: '12px' }}>
            <BulbOutlined style={{ marginRight: '4px' }} />
            {t('sort.multiSortHint')}
          </Text>
        </Card>
        {/* 快速排序預設 */}
        <Card
          size='small'
          title={
            <Space>
              <Tag color='green'>{t('sort.commonSortTag')}</Tag>
              <Text type='secondary' style={{ fontSize: '11px' }}>
                {t('sort.commonSortHint')}
              </Text>
            </Space>
          }
        >
          <Space size={[4, 4]} wrap>
            <Button
              size='small'
              onClick={() =>
                handleAddCommonSort([
                  { option: 'probability', direction: 'desc' },
                  { option: 'available', direction: 'desc' },
                ])
              }
            >
              <AimOutlined /> {t('sort.commonSort.byProbability')}
            </Button>
            <Button
              size='small'
              onClick={() =>
                handleAddCommonSort([
                  { option: 'available', direction: 'desc' },
                  { option: 'probability', direction: 'desc' },
                ])
              }
            >
              <BarChartOutlined /> {t('sort.commonSort.byAvailable')}
            </Button>
            <Button
              size='small'
              onClick={() =>
                handleAddCommonSort([
                  { option: 'compulsory', direction: 'asc' },
                  { option: 'courseLevel', direction: 'asc' },
                ])
              }
            >
              <BookOutlined /> {t('sort.commonSort.byCompulsoryAndLevel')}
            </Button>
          </Space>
        </Card>
        {/* 新增排序規則按鈕 */}
        <Button
          type='dashed'
          icon={<PlusOutlined />}
          onClick={handleAddRule}
          block
          disabled={!canAddMore}
        >
          {t('sort.addCondition')}
          {availableOptions.length > 0 &&
            ` ${t('sort.canAddMore', { count: availableOptions.length })}`}
        </Button>
        <Divider style={{ margin: '12px 0' }} />
        {/* 排序規則列表 */}
        {tempConfig.rules.length > 0 &&
        tempConfig.rules[0].option !== 'default' ? (
          <div>
            <Title level={5} style={{ margin: '0 0 12px 0' }}>
              {t('sort.rulesList')}
            </Title>
            {tempConfig.rules.map((rule, index) => (
              <SortRuleItem
                key={`sort-rule-${index}`}
                rule={rule}
                index={index}
                onUpdate={handleUpdateRule}
                onRemove={handleRemoveRule}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={index === 0}
                isLast={index === tempConfig.rules.length - 1}
              />
            ))}
          </div>
        ) : (
          <Card size='small'>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('sort.defaultSortDescription')}
            />
          </Card>
        )}
        {/* 排序預覽 */}
        {tempConfig.rules.length > 0 &&
          tempConfig.rules[0].option !== 'default' && (
            <Card
              size='small'
              title={t('sort.preview')}
              style={{
                background: isDarkMode ? '#1a1a1a' : '#f9f9f9',
              }}
            >
              <Space
                direction='vertical'
                size='small'
                style={{ width: '100%' }}
              >
                {tempConfig.rules.map((rule, index) => (
                  <Text key={index} style={{ fontSize: '12px' }}>
                    {index + 1}. {getSortRuleDisplayText(rule, t)}
                  </Text>
                ))}
              </Space>
            </Card>
          )}
      </Space>
    </StyledDrawer>
  );
};

export default CourseSortSelector;
