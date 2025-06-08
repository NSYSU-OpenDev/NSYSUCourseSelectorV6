import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store/hooks';
import { selectSelectedTabKey } from '@/store';
import AllCourses from '#/SelectorPanel/AllCourses';

const SelectorPanel: React.FC = () => {
  const { t } = useTranslation();
  const selectedTabKey = useAppSelector(selectSelectedTabKey);

  const mapTabToComponent = (tabKey: string): JSX.Element => {
    switch (tabKey) {
      case 'allCourses':
        return <AllCourses />;
      case 'selectedExport':
        return <h1>Selected Export</h1>;
      case 'announcements':
        return <h1>Announcements</h1>;
      default:
        return <h1>{t('panelNotFound')}</h1>;
    }
  };
  return <>{mapTabToComponent(selectedTabKey)}</>;
};

export default SelectorPanel;
