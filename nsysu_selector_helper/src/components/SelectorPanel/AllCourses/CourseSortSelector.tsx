import React, { useState } from 'react';
import {
  Button,
  Drawer,
  Space,
  Typography,
  Card,
  Select,
  Radio,
  Collapse,
  Row,
  Col,
  Empty,
  Divider,
  Popconfirm,
  Tag,
} from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClearOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BulbOutlined,
  AimOutlined,
  BarChartOutlined,
  BookOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSortConfig, setSortConfig } from '@/store';
import {
  CourseSortingService,
  SortConfig,
  SortRule,
  SortDirection,
} from '@/services';
import { DEFAULT_SORT_OPTIONS } from '@/constants';

const { Text, Title } = Typography;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-header {
    padding: 6px 8px;
  }

  .ant-drawer-body {
    padding: 12px;
  }
`;

const StyledCollapse = styled(Collapse)`
  margin-bottom: 8px;

  .ant-collapse-item {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
  }

  .ant-collapse-header {
    padding: 8px 16px !important;
  }

  .ant-collapse-content-box {
    padding: 12px 16px;
  }
`;

interface SortRuleItemProps {
  rule: SortRule;
  index: number;
  onUpdate: (index: number, rule: SortRule) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// 生成排序規則的顯示文字
const getRuleDisplayText = (rule: SortRule): string => {
  const option = DEFAULT_SORT_OPTIONS.find((opt) => opt.key === rule.option);
  const optionLabel = option?.label || rule.option;
  const directionLabel = rule.direction === 'asc' ? '升序' : '降序';

  if (rule.option === 'default') {
    return '預設排序';
  }

  return `${optionLabel} (${directionLabel})`;
};

const SortRuleItem: React.FC<SortRuleItemProps> = ({
  rule,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const currentOption = DEFAULT_SORT_OPTIONS.find(
    (opt) => opt.key === rule.option,
  );

  const handleOptionChange = (option: string) => {
    onUpdate(index, { ...rule, option });
  };

  const handleDirectionChange = (direction: SortDirection) => {
    onUpdate(index, { ...rule, direction });
  };

  const displayText = getRuleDisplayText(rule);

  return (
    <StyledCollapse
      size='small'
      items={[
        {
          key: `rule-${index}`,
          label: (
            <Space>
              <SortAscendingOutlined />
              <Text>{displayText}</Text>
              <Tag color='blue'>第 {index + 1} 優先</Tag>
            </Space>
          ),
          extra: (
            <Space size='small'>
              {!isFirst && (
                <Button
                  type='text'
                  size='small'
                  icon={<ArrowUpOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp?.(index);
                  }}
                  title='提高優先級'
                />
              )}
              {!isLast && (
                <Button
                  type='text'
                  size='small'
                  icon={<ArrowDownOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown?.(index);
                  }}
                  title='降低優先級'
                />
              )}
              <Button
                type='text'
                size='small'
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                danger
                title='刪除此排序'
              />
            </Space>
          ),
          children: (
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Space
                  direction='vertical'
                  style={{ width: '100%' }}
                  size='small'
                >
                  {/* 排序選項 */}
                  <div>
                    <Text
                      style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      排序方式：
                    </Text>
                    <Select
                      style={{ width: '100%' }}
                      value={rule.option}
                      onChange={handleOptionChange}
                      placeholder='選擇排序方式'
                      options={DEFAULT_SORT_OPTIONS.filter(
                        (opt) => opt.key !== 'default',
                      ).map((option) => ({
                        value: option.key,
                        label: option.label,
                      }))}
                    />
                    {currentOption?.description &&
                      currentOption?.description
                        .split('；')
                        .map((desc, idx) => (
                          <Text
                            key={idx}
                            type='secondary'
                            style={{
                              fontSize: '11px',
                              marginTop: '4px',
                              display: 'block',
                            }}
                          >
                            {desc}
                          </Text>
                        ))}
                  </div>

                  {/* 排序方向 */}
                  <div>
                    <Text
                      style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                    >
                      排序方向：
                    </Text>
                    <Radio.Group
                      value={rule.direction}
                      onChange={(e) => handleDirectionChange(e.target.value)}
                      size='small'
                    >
                      <Radio.Button value='asc'>
                        <SortAscendingOutlined /> 升序
                      </Radio.Button>
                      <Radio.Button value='desc'>
                        <SortDescendingOutlined /> 降序
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                </Space>
              </Col>
            </Row>
          ),
        },
      ]}
    />
  );
};

interface CourseSortSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const CourseSortSelector: React.FC<CourseSortSelectorProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const currentSortConfig = useAppSelector(selectSortConfig);
  const [tempConfig, setTempConfig] = useState<SortConfig>(currentSortConfig);

  // 更新本地配置當外部配置變化時
  React.useEffect(() => {
    setTempConfig(currentSortConfig);
  }, [currentSortConfig]);

  // 動態應用排序配置變更
  React.useEffect(() => {
    // 避免在初始化時觸發，只在配置真正變更時觸發
    if (JSON.stringify(tempConfig) !== JSON.stringify(currentSortConfig)) {
      dispatch(setSortConfig(tempConfig));
      CourseSortingService.saveSortConfig(tempConfig);
    }
  }, [tempConfig, currentSortConfig, dispatch]);

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
      };

      // 如果當前是預設排序，則替換為新規則；否則添加到現有規則
      const isDefaultConfig =
        tempConfig.rules.length === 1 &&
        tempConfig.rules[0].option === 'default';
      setTempConfig({
        rules: isDefaultConfig ? [newRule] : [...tempConfig.rules, newRule],
      });
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

      setTempConfig({
        rules: updatedRules,
      });
    }
  };

  const handleUpdateRule = (index: number, rule: SortRule) => {
    const newRules = [...tempConfig.rules];
    newRules[index] = rule;
    setTempConfig({ rules: newRules });
  };

  const handleRemoveRule = (index: number) => {
    const newRules = tempConfig.rules.filter((_, i) => i !== index);
    // 如果刪除所有規則，添加一個預設規則
    if (newRules.length === 0) {
      newRules.push({ option: 'default', direction: 'asc' });
    }
    setTempConfig({ rules: newRules });
  };

  const handleMoveRule = (from: number, to: number) => {
    const newRules = [...tempConfig.rules];
    const [moved] = newRules.splice(from, 1);
    newRules.splice(to, 0, moved);
    setTempConfig({ rules: newRules });
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
          <span>自訂課程排序</span>
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
          title='重置為預設排序'
          description='這將清除所有自訂排序規則'
          onConfirm={handleReset}
          okText='重置'
          cancelText='取消'
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
            重置
          </Button>
        </Popconfirm>
      }
    >
      <Space direction='vertical' style={{ width: '100%' }} size='small'>
        {/* 說明文字 */}
        <Card size='small' style={{ background: '#f0f8ff' }}>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            <BulbOutlined style={{ marginRight: '4px' }} />
            可設定多層排序條件，排序將依照優先級依次執行。變更會即時套用到課程列表中。
          </Text>
        </Card>

        {/* 快速排序預設 */}
        <Card
          size='small'
          title={
            <Space>
              <Tag color='green'>常用排序</Tag>
              <Text type='secondary' style={{ fontSize: '11px' }}>
                點擊添加到當前排序
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
                ])
              }
            >
              <AimOutlined /> 依概率
            </Button>
            <Button
              size='small'
              onClick={() =>
                handleAddCommonSort([
                  { option: 'remaining', direction: 'desc' },
                ])
              }
            >
              <BarChartOutlined /> 依剩餘名額
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
              <BookOutlined /> 必修+課程等級
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
          新增排序條件
          {availableOptions.length > 0 &&
            `(還可新增 ${availableOptions.length} 個)`}
        </Button>

        <Divider style={{ margin: '12px 0' }} />

        {/* 排序規則列表 */}
        {tempConfig.rules.length > 0 &&
        tempConfig.rules[0].option !== 'default' ? (
          <div>
            <Title level={5} style={{ margin: '0 0 12px 0' }}>
              排序規則列表
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
              description='使用預設排序（按課程順序）'
            />
          </Card>
        )}

        {/* 排序預覽 */}
        {tempConfig.rules.length > 0 &&
          tempConfig.rules[0].option !== 'default' && (
            <Card
              size='small'
              title='排序預覽'
              style={{ background: '#f9f9f9' }}
            >
              <Space
                direction='vertical'
                size='small'
                style={{ width: '100%' }}
              >
                {tempConfig.rules.map((rule, index) => (
                  <Text key={index} style={{ fontSize: '12px' }}>
                    {index + 1}. {getRuleDisplayText(rule)}
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
