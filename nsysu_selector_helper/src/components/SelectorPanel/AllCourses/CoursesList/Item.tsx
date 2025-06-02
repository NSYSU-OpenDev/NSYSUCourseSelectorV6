import React from 'react';
import styled from 'styled-components';
import { Card, Checkbox, Flex, Popover, Progress, Space, Tag } from 'antd';

import type { Course } from '@/types';

const StyledTag = styled(Tag)`
  font-size: 10px;
  padding: 2px 5px;
  white-space: pre-wrap;
  text-align: center;
  margin: 0 auto;
`;

const CourseRow = styled.div<{ $isHovered?: boolean }>`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.$isHovered ? '#f0f0f0' : '#fafafa'};
  gap: 5px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }
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
  onSelectCourse: (course: Course, isSelected: boolean) => void;
  onHoverCourse: (courseId: string) => void;
};

const Item: React.FC<ItemProps> = ({
  course,
  isSelected,
  isHovered,
  onSelectCourse,
  onHoverCourse,
}) => {
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
      onMouseEnter={() => onHoverCourse(course.id)}
      onMouseLeave={() => onHoverCourse('')}
    >
      <TinyCourseInfo>
        <Popover
          content={content}
          title={
            <>
              {name.split('\n')[0]} ({id})
            </>
          }
          trigger={['hover', 'focus']}
          placement={'left'}
        >
          <Checkbox
            name={id}
            checked={isSelected}
            onChange={(e) => onSelectCourse(course, e.target.checked)}
          />
        </Popover>
      </TinyCourseInfo>
      <CourseInfo>
        <StyledLink href={url} target={'_blank'} rel='noreferrer'>
          {name.split('\n')[0]}
        </StyledLink>
      </CourseInfo>
      <MediumCourseInfo>
        <Space direction={'vertical'}>{displayClassTime}</Space>
      </MediumCourseInfo>
      <SmallCourseInfo>{department}</SmallCourseInfo>
      <SmallCourseInfo>
        {compulsory ? <StyledTag color={'red'}>必</StyledTag> : <span>選</span>}
      </SmallCourseInfo>
      <SmallCourseInfo>
        <StyledTag
          color={
            ['yellow', 'green', 'blue', 'purple'][parseInt(credit) - 1] || 'red'
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
    </CourseRow>
  );
};

export default Item;
