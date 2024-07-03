import React from 'react';
import styled from 'styled-components';

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 2px solid #ddd;
  background-color: #f5f5f5;
  font-weight: bold;
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

const Header: React.FC = () => {
  return (
    <>
      <HeaderRow>
        <TinyCourseInfo>選</TinyCourseInfo>
        <CourseInfo>名稱</CourseInfo>
        <SmallCourseInfo>時間</SmallCourseInfo>
        <SmallCourseInfo>系所</SmallCourseInfo>
        <SmallCourseInfo>必選</SmallCourseInfo>
        <SmallCourseInfo>學分</SmallCourseInfo>
        <SmallCourseInfo>英課</SmallCourseInfo>
        <SmallCourseInfo>班級</SmallCourseInfo>
        <SmallCourseInfo>教師</SmallCourseInfo>
        <CourseInfo>學程</CourseInfo>
      </HeaderRow>
    </>
  );
};
export default Header;
