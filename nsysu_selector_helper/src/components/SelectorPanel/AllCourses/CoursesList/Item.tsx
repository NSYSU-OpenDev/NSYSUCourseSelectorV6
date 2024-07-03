import { Course } from '@/types';
import React from 'react';
import styled from 'styled-components';
import { Checkbox, Tag } from 'antd';

const StyledTag = styled(Tag)`
  font-size: 10px;
  padding: 2px 5px;
  white-space: pre-wrap;
  text-align: center;
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
    classTime,
    department,
    compulsory,
    credit,
    english,
    room,
    teacher,
    tags,
  } = course;

  return (
    <CourseRow
      onMouseEnter={() => onHoverCourse(course.id)}
      onMouseLeave={() => onHoverCourse('')}
    >
      <TinyCourseInfo>
        <Checkbox
          name={id}
          checked={isSelected}
          onChange={(e) => onSelectCourse(course, e.target.checked)}
        />
      </TinyCourseInfo>
      <CourseInfo>{name.split('\n')[0]}</CourseInfo>
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
          <Tag color={'red'}>未知</Tag>
        )}
      </SmallCourseInfo>
      <SmallCourseInfo>{department}</SmallCourseInfo>
      <SmallCourseInfo>
        <Tag color={compulsory ? 'red' : 'green'}>
          {compulsory ? '必' : '選'}
        </Tag>
      </SmallCourseInfo>
      <SmallCourseInfo>
        <Tag
          color={
            ['yellow', 'green', 'blue', 'purple'][parseInt(credit) - 1] || 'red'
          }
        >
          {credit}
        </Tag>
      </SmallCourseInfo>
      <SmallCourseInfo>
        <Tag color={english ? 'red' : 'green'}>{english ? '英' : '中'}</Tag>
      </SmallCourseInfo>
      <SmallCourseInfo>
        {room ? room?.split('(')[1]?.split(')')[0] : '未公布'}
      </SmallCourseInfo>
      <SmallCourseInfo>
        {teacher
          ? teacher
              .split(',')
              .filter((t, i, self) => self.indexOf(t) === i)
              .map((t) => (
                <StyledTag color={'purple'} key={t}>
                  {t}
                </StyledTag>
              ))
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
