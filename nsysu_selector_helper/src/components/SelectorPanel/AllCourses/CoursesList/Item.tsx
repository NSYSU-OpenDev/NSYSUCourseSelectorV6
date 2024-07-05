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

const CourseRow = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: #fafafa;

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

const SmallCourseInfo = styled(CourseInfo)`
  flex: 0.4;
`;

const TinyCourseInfo = styled(CourseInfo)`
  flex: 0.25;
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
  scheduleTableCollapsed: boolean;
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
        return <Tag color={'red'}>全英</Tag>;
      case '甲班':
        return <Tag color={'blue'}>甲班</Tag>;
      case '乙班':
        return <Tag color={'yellow'}>乙班</Tag>;
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

  return (
    <CourseRow
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
      <SmallCourseInfo>
        {!classTime.every((time) => time === '') ? (
          classTime.map(
            (time, index) =>
              time !== '' && (
                <StyledTag color={'purple'} key={`${id}-${index}`}>
                  {`${'一二三四五六日'[index]} ${time}`
                    .split('')
                    .reduce(
                      (acc, curr, i) =>
                        i % 5 === 0 && i !== 0
                          ? `${acc}\n${curr}`
                          : `${acc}${curr}`,
                      '',
                    )}
                </StyledTag>
              ),
          )
        ) : (
          <StyledTag color={'red'}>未知</StyledTag>
        )}
      </SmallCourseInfo>
      <SmallCourseInfo>{department}</SmallCourseInfo>
      <SmallCourseInfo>
        {compulsory ? <StyledTag color={'red'}>必</StyledTag> : '選'}
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
        {english ? <StyledTag color={'red'}>英語</StyledTag> : '中'}
      </SmallCourseInfo>
      <SmallCourseInfo>{getClassCodeColor(classCode)}</SmallCourseInfo>
      <SmallCourseInfo>
        {teacher
          ? teacher
              .split(',')
              .filter((t, i, self) => self.indexOf(t) === i)
              .map((t) => {
                const teacherName = t.trim().replace("'", '');
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`中山大學 ${teacherName} DCard | PTT`)}`;

                return (
                  <StyledTag color={'purple'} key={t}>
                    <StyledLink
                      href={searchUrl}
                      target={'_blank'}
                      rel='noreferrer'
                    >
                      {teacherName}
                    </StyledLink>
                  </StyledTag>
                );
              })
          : ''}
      </SmallCourseInfo>
      <CourseInfo>
        {tags
          ? tags
              .filter((tag, i, self) => self.indexOf(tag) === i)
              .map((tag) => (
                <StyledTag color={'purple'} key={tag}>
                  {tag}
                </StyledTag>
              ))
          : ''}
      </CourseInfo>
    </CourseRow>
  );
};

export default Item;
