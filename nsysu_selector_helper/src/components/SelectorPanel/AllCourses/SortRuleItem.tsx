import { AvailableSortOptions, SortDirection, SortRule } from '@/services';
import { DEFAULT_SORT_OPTIONS } from '@/constants';
import React from 'react';
import {
  Button,
  Col,
  Collapse,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { getSortRuleDisplayText } from '@/utils';

const { Text } = Typography;

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

  const handleOptionChange = (option: AvailableSortOptions) => {
    onUpdate(index, { ...rule, option });
  };

  const handleDirectionChange = (direction: SortDirection) => {
    onUpdate(index, { ...rule, direction });
  };

  const displayText = getSortRuleDisplayText(rule);

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

export default SortRuleItem;
