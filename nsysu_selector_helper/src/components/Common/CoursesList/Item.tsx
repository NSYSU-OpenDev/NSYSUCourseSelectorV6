import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Modal,
  Popover,
  Progress,
  Space,
  Tag,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';

import type { Course } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import {
  selectCourse,
  setHoveredCourseId,
  selectLabels,
  selectCourseLabelMap,
} from '@/store';
import { LabelEditModal } from '#/Common/Labels';
import { useWindowSize } from '@/hooks';
import { GetProbability } from '@/utils';

const StyledTag = styled(Tag)`
  font-size: 10px;
  padding: 2px 5px;
  white-space: pre-wrap;
  text-align: center;
  margin: 0 auto;
`;

const LabelTag = styled(Tag)`
  font-size: 9px;
  padding: 1px 4px;
  margin: 1px;
  border-radius: 8px;
  line-height: 1.2;
`;

const CourseRow = styled.div<{ $isHovered?: boolean; $isConflict?: boolean }>`
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  padding: 5px;
  border-bottom: 1px solid #eee;
  background-color: ${(props) => {
    if (props.$isConflict) return '#fff2f0';
    return props.$isHovered ? '#f0f0f0' : '#fafafa';
  }};
  border-left: ${(props) => (props.$isConflict ? '4px solid #ff4d4f' : 'none')};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$isConflict ? '#ffebe8' : '#f0f0f0')};
  }
`;

const CourseMainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ProbabilityBar = styled.div`
  width: 100%;
  height: 3px;
  background-color: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProbabilityFill = styled.div<{
  $probability: number;
  $status: 'full' | 'overbooked' | 'normal';
}>`
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${(props) => Math.min(props.$probability, 100)}%;
  background-color: ${(props) => {
    if (props.$status === 'full') return '#ff4d4f'; // 紅色 - 已滿
    if (props.$status === 'overbooked') return '#722ed1'; // 紫色 - 超額
    if (props.$probability >= 80) return '#52c41a'; // 綠色 - 很容易選上
    if (props.$probability >= 50) return '#faad14'; // 橙色 - 中等機率
    return '#ff7875'; // 淺紅 - 困難
  }};
`;

const ProbabilityText = styled.span<{
  $status: 'full' | 'overbooked' | 'normal';
}>`
  font-size: 9px;
  font-weight: bold;
  color: ${(props) => {
    if (props.$status === 'full') return '#ff4d4f';
    if (props.$status === 'overbooked') return '#722ed1';
    return '#666';
  }};
  margin-left: 5px;
`;

const CourseInfo = styled.div`
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: fade;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  &:last-child {
    margin-right: 0;
  }
`;

const MediumCourseInfo = styled(CourseInfo)`
  flex: 0.6;
`;

const SmallCourseInfo = styled(CourseInfo)`
  flex: 0.4;
`;

const TinyCourseInfo = styled(CourseInfo)`
  flex: 0.275;
`;

const StyledLink = styled.a`
  display: inline-block;
  text-decoration: none;
  color: black;

  &:hover {
    text-decoration: underline;
  }
`;

type ItemProps = {
  course: Course;
  isSelected: boolean;
  isConflict: boolean;
  isHovered: boolean;
};

const Item: React.FC<ItemProps> = ({
  course,
  isSelected,
  isConflict,
  isHovered,
}) => {
  const dispatch = useAppDispatch();
  const { width } = useWindowSize();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const isMobile = width < 768;

  const handleSelectCourse = (isSelected: boolean) => {
    dispatch(selectCourse({ course, isSelected }));
  };

  const handleHoverCourse = () => {
    dispatch(setHoveredCourseId(course.id));
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openLabelModal = () => setLabelModalOpen(true);
  const closeLabelModal = () => setLabelModalOpen(false);

  const {
    id,
    name,
    url,
    classTime,
    department,
    compulsory,
    credit,
    english,
    class: classCode,
    grade,
    teacher,
    tags,
    restrict,
    select,
    selected,
    remaining,
    description,
  } = course;

  const getClassCodeColor = (classCode: string | undefined) => {
    switch (classCode) {
      case '不分班':
        return '不分班';
      case '全英班':
        return <StyledTag color={'red'}>全英</StyledTag>;
      case '甲班':
        return <StyledTag color={'blue'}>甲班</StyledTag>;
      case '乙班':
        return <StyledTag color={'yellow'}>乙班</StyledTag>;
      default:
        return classCode;
    }
  };
  const content = (
    <Space style={{ maxWidth: 300 }} direction={'vertical'}>
      <Card>{description}</Card>
      <Card>
        <Flex justify={'space-between'} gap={5}>
          <Flex vertical={true} align={'center'}>
            <span>
              點選 {select}/{remaining} 剩餘
            </span>
            <Progress
              type='circle'
              percent={Math.round((select / remaining) * 100)}
              size='small'
              status={select >= remaining ? 'exception' : 'normal'}
            />
          </Flex>
          <Flex vertical={true} align={'center'}>
            <span>
              選上 {selected}/{restrict} 限制
            </span>
            <Progress
              type='circle'
              percent={Math.round((selected / restrict) * 100)}
              size='small'
              status={selected >= restrict ? 'exception' : 'normal'}
            />
          </Flex>
        </Flex>
      </Card>
    </Space>
  );

  const displayClassTime = !classTime.every((time) => time === '') ? (
    classTime.map(
      (time, index) =>
        time !== '' && (
          <StyledTag color={'purple'} key={`${id}-${index}`}>
            {`${'一二三四五六日'[index]}\n${time}`
              .split('')
              .reduce(
                (acc, curr, i) =>
                  (i + 1) % 3 === 0 && i !== 2
                    ? `${acc}\n${curr}`
                    : `${acc}${curr}`,
                '',
              )}
          </StyledTag>
        ),
    )
  ) : (
    <StyledTag color={'red'}>未知</StyledTag>
  );

  const displayTeachers = teacher
    ? teacher
        .split(',')
        .filter((t, i, self) => self.indexOf(t) === i)
        .map((t) => {
          const teacherName = t.trim().replace("'", '');
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`中山大學 ${teacherName} DCard | PTT`)}`;

          return (
            <StyledTag color={'purple'} key={t}>
              <StyledLink href={searchUrl} target={'_blank'} rel='noreferrer'>
                {teacherName}
              </StyledLink>
            </StyledTag>
          );
        })
    : '';

  const labels = useAppSelector(selectLabels);
  const labelMap = useAppSelector(selectCourseLabelMap);
  const courseLabels = labelMap[id] || [];
  const labelTags = courseLabels
    .map((lid) => labels.find((l) => l.id === lid))
    .filter(Boolean)
    .map((label) => (
      <LabelTag
        key={label!.id}
        style={{
          background: label!.bgColor,
          borderColor: label!.borderColor,
          color: '#fff',
        }}
      >
        {label!.name}
      </LabelTag>
    ));

  const displayTags = tags
    ? tags
        .filter((tag, i, self) => self.indexOf(tag) === i)
        .map((tag) => (
          <StyledTag color={'purple'} key={tag}>
            {tag}
          </StyledTag>
        ))
    : '';
  return (
    <CourseRow
      $isHovered={isHovered}
      $isConflict={isConflict}
      onMouseEnter={handleHoverCourse}
      onMouseLeave={() => dispatch(setHoveredCourseId(''))}
    >
      <CourseMainRow>
        <TinyCourseInfo>
          <Checkbox
            name={id}
            checked={isSelected}
            onChange={(e) => handleSelectCourse(e.target.checked)}
          />
        </TinyCourseInfo>
        <CourseInfo>
          {isMobile ? (
            <>
              <StyledLink
                href='#'
                onClick={(e) => {
                  e.preventDefault();
                  showModal();
                }}
              >
                {name.split('\n')[0]}
              </StyledLink>
              <Modal
                title={`${name.split('\n')[0]} (${id})`}
                open={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width='90%'
                style={{ maxWidth: 400 }}
              >
                <Space style={{ width: '100%' }} direction='vertical'>
                  <Card size='small'>
                    <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                      {description}
                    </div>
                  </Card>
                  <Card size='small'>
                    <Flex justify='space-between' gap={10}>
                      <Flex vertical align='center'>
                        <span style={{ fontSize: '12px', marginBottom: 8 }}>
                          點選 {select}/{remaining} 剩餘
                        </span>
                        <Progress
                          type='circle'
                          percent={Math.round((select / remaining) * 100)}
                          size={60}
                          status={select >= remaining ? 'exception' : 'normal'}
                        />
                      </Flex>
                      <Flex vertical align='center'>
                        <span style={{ fontSize: '12px', marginBottom: 8 }}>
                          選上 {selected}/{restrict} 限制
                        </span>
                        <Progress
                          type='circle'
                          percent={Math.round((selected / restrict) * 100)}
                          size={60}
                          status={selected >= restrict ? 'exception' : 'normal'}
                        />
                      </Flex>
                    </Flex>
                  </Card>
                  <Card size='small'>
                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                      <StyledLink href={url} target='_blank' rel='noreferrer'>
                        查看課程詳細資訊
                      </StyledLink>
                    </div>
                  </Card>
                </Space>
              </Modal>
            </>
          ) : (
            <Popover
              content={content}
              title={
                <>
                  {name.split('\n')[0]} ({id})
                </>
              }
              trigger={['hover', 'focus']}
              placement={'right'}
            >
              <StyledLink href={url} target={'_blank'} rel='noreferrer'>
                {name.split('\n')[0]}
              </StyledLink>
            </Popover>
          )}
        </CourseInfo>
        <MediumCourseInfo>
          <Space direction={'vertical'}>{displayClassTime}</Space>
        </MediumCourseInfo>
        <SmallCourseInfo>{department}</SmallCourseInfo>
        <SmallCourseInfo>
          {compulsory ? (
            <StyledTag color={'red'}>必</StyledTag>
          ) : (
            <span>選</span>
          )}
        </SmallCourseInfo>
        <SmallCourseInfo>
          <StyledTag
            color={
              ['yellow', 'green', 'blue', 'purple'][parseInt(credit) - 1] ||
              'red'
            }
          >
            {credit}
          </StyledTag>
        </SmallCourseInfo>
        <SmallCourseInfo>
          {english ? <StyledTag color={'red'}>英</StyledTag> : '中'}
        </SmallCourseInfo>
        <SmallCourseInfo>
          <Flex align={'center'} justify={'center'} vertical={true}>
            {getClassCodeColor(classCode)}
            <span>{'⓪①②③④'[parseInt(grade)]}</span>
          </Flex>
        </SmallCourseInfo>
        <SmallCourseInfo>
          <Flex align={'center'} justify={'center'} vertical={true} gap={5}>
            {displayTeachers}
          </Flex>
        </SmallCourseInfo>
        <CourseInfo>
          <Flex align={'center'} justify={'center'} vertical={true} gap={5}>
            {displayTags}
          </Flex>
        </CourseInfo>
      </CourseMainRow>
      {/* 機率條上方區域 - 整合資訊與標籤 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '18px',
        }}
      >
        {/* 左側：統計資訊 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ProbabilityText
            $status={GetProbability.getProbabilityStatus(remaining)}
          >
            選上機率: {GetProbability.getProbabilityText(select, remaining)}
          </ProbabilityText>
          <span style={{ fontSize: '9px', color: '#666', fontWeight: '500' }}>
            點選: {select} | 剩餘: {remaining}
          </span>
        </div>

        {/* 右側：標籤與編輯按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {labelTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {labelTags}
            </div>
          )}
          <Button
            icon={<EditOutlined />}
            type='text'
            size='small'
            onClick={openLabelModal}
            style={{
              padding: '2px 4px',
              height: 'auto',
              minWidth: 'auto',
              opacity: 0.6,
              color: '#666',
            }}
            title='編輯標籤'
          />
        </div>
      </div>
      <ProbabilityBar>
        <ProbabilityFill
          $probability={GetProbability.getSuccessProbability(select, remaining)}
          $status={GetProbability.getProbabilityStatus(remaining)}
        />
      </ProbabilityBar>
      <LabelEditModal
        courseId={id}
        open={labelModalOpen}
        onClose={closeLabelModal}
      />
    </CourseRow>
  );
};

export default Item;
