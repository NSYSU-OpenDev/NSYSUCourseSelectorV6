import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store/hooks';
import { selectSelectedTabKey } from '@/store';
import AllCourses from '#/SelectorPanel/AllCourses';
import SelectedExport from '#/SelectorPanel/SelectedExport';
import AnnouncementPage from '#/SelectorPanel/AnnouncementPage';

const SelectorPanel: React.FC = () => {
  const { t } = useTranslation();
  const selectedTabKey = useAppSelector(selectSelectedTabKey);
  const mapTabToComponent = (tabKey: string): JSX.Element => {
    switch (tabKey) {
      case 'allCourses':
        return <AllCourses />;
      case 'selectedExport':
        return <SelectedExport />;
      case 'announcements':
        return <AnnouncementPage />;
      default:
        return <h1>{t('panelNotFound')}</h1>;
    }
  };
  return <>{mapTabToComponent(selectedTabKey)}</>;
};

export default SelectorPanel;
