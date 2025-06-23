import React, { JSX } from 'react';

import { useTranslation } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectSelectedTabKey } from '@/store';
import AllCourses from '#/SelectorPanel/AllCourses';
import SelectedExport from '#/SelectorPanel/SelectedExport';
import AnnouncementPage from '#/SelectorPanel/AnnouncementPage';
import DepartmentCourses from '#/SelectorPanel/DepartmentCourses';
import Settings from '#/SelectorPanel/Settings';

const SelectorPanel: React.FC = () => {
  const { t } = useTranslation();
  const selectedTabKey = useAppSelector(selectSelectedTabKey);
  const mapTabToComponent = (tabKey: string): JSX.Element => {
    switch (tabKey) {
      case 'allCourses':
        return <AllCourses />;
      case 'departmentCourses':
        return <DepartmentCourses />;
      case 'selectedExport':
        return <SelectedExport />;
      case 'announcements':
        return <AnnouncementPage />;
      case 'settings':
        return <Settings />;
      default:
        return <h1>{t('panelNotFound')}</h1>;
    }
  };
  return <>{mapTabToComponent(selectedTabKey)}</>;
};

export default SelectorPanel;
