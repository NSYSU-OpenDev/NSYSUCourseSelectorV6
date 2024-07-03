import { Course } from '@/types';
import React from 'react';
import styled from 'styled-components';

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

const Tag = styled.div`
  background-color: #eef;
  border: 1px solid #ddf;
  border-radius: 4px;
  padding: 2px 5px;
  margin: 2px;
  font-size: 10px;
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

const Item: React.FC<ItemProps> = ({ course, onHoverCourse }) => {
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
      <TinyCourseInfo>v</TinyCourseInfo>
      <CourseInfo>{name.split('\n')[0]}</CourseInfo>
      <SmallCourseInfo>
        {classTime.map(
          (time, index) =>
            time !== '' && (
              <Tag key={`${id}-${index}`}>
                {'一二三四五六日'[index]} {time}
              </Tag>
            ),
        )}
      </SmallCourseInfo>
      <SmallCourseInfo>{department}</SmallCourseInfo>
      <SmallCourseInfo>{compulsory ? 'Y' : 'N'}</SmallCourseInfo>
      <SmallCourseInfo>{credit}</SmallCourseInfo>
      <SmallCourseInfo>{english ? 'Y' : 'N'}</SmallCourseInfo>
      <SmallCourseInfo>
        {room ? room?.split('(')[1]?.split(')')[0] : '未公布'}
      </SmallCourseInfo>
      <SmallCourseInfo>
        {teacher ? teacher.split(',').map((t) => <Tag key={t}>{t}</Tag>) : ''}
      </SmallCourseInfo>
      <CourseInfo>
        {tags ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : ''}
      </CourseInfo>
    </CourseRow>
  );
};

export default Item;
