import React from 'react';
import styled from 'styled-components';

import { useTranslation } from '@/hooks';

const HeaderRow = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 5px;
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

const MediumCourseInfo = styled(CourseInfo)`
  flex: 0.6;
`;

const SmallCourseInfo = styled(CourseInfo)`
  flex: 0.4;
`;

const TinyCourseInfo = styled(CourseInfo)`
  flex: 0.275;
`;

const Header: React.FC = () => {
  const { t } = useTranslation();
  // Use type assertion without strict structure check to resolve the type error
  const courseTranslation = t('course', { returnObjects: true }) as {
    [key: string]: { name: string };
  };

  return (
    <HeaderRow>
      <TinyCourseInfo>{courseTranslation.select.name}</TinyCourseInfo>
      <CourseInfo>{courseTranslation.name?.name}</CourseInfo>
      <MediumCourseInfo>{courseTranslation.classTime?.name}</MediumCourseInfo>
      <SmallCourseInfo>{courseTranslation.department?.name}</SmallCourseInfo>
      <SmallCourseInfo>{courseTranslation.compulsory?.name}</SmallCourseInfo>
      <SmallCourseInfo>{courseTranslation.credit?.name}</SmallCourseInfo>
      <SmallCourseInfo>{courseTranslation.english?.name}</SmallCourseInfo>
      <SmallCourseInfo>{courseTranslation.class?.name}</SmallCourseInfo>
      <SmallCourseInfo>{courseTranslation.teacher?.name}</SmallCourseInfo>
      <CourseInfo>{courseTranslation.tags?.name}</CourseInfo>
    </HeaderRow>
  );
};
export default Header;
