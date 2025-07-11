import { FC, useState } from 'react';
import {
  Flex,
  Menu,
  MenuProps,
  Drawer,
  Button,
  theme,
  Select,
  SelectProps,
} from 'antd';
import {
  BookOutlined,
  FileDoneOutlined,
  NotificationOutlined,
  MenuOutlined,
  ApartmentOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

import { type AcademicYear } from '@/types';
import { useTranslation } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsDarkMode } from '@/store';
import banner from '@/assets/banner.svg';

const HeaderContainer = styled(Flex)<{
  $primaryColor: string;
  $textColor: string;
}>`
  padding: 0 20px;
  background-color: ${(props) => props.$primaryColor};
  color: ${(props) => props.$textColor};
  min-height: 52px;
`;

const StyledSelect = styled(Select)`
  @media (max-width: 890px) {
    display: none;
  }
`;

const StyledMenu = styled(Menu)<{
  $textColor: string;
}>`
  padding-bottom: 5px;
  background: transparent;
  width: 100%;
  justify-content: flex-end;

  @media (max-width: 890px) {
    display: none;
  }

  li.ant-menu-item,
  div.ant-menu-submenu-title {
    background-color: transparent;
    color: ${(props) => props.$textColor} !important;
  }

  li.ant-menu-item-selected::after {
    border-bottom-color: ${(props) => props.$textColor} !important;
  }

  li.ant-menu-item-active::after {
    border-bottom-color: ${(props) => props.$textColor} !important;
  }
`;

const Brand = styled.img`
  height: 36px;
  margin-right: 20px;
  padding: 8px;

  @media (max-width: 290px) {
    display: none;
  }
`;

const MobileMenu = styled(Flex)`
  display: none;

  @media (max-width: 890px) {
    display: flex;
  }
`;

type HeaderProps = {
  selectedKey: string;
  setSelectedKey: (keys: string) => void;
  availableSemesters: AcademicYear;
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
};

const SectionHeader: FC<HeaderProps> = ({
  selectedKey,
  setSelectedKey,
  availableSemesters,
  selectedSemester,
  setSelectedSemester,
}) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(selectIsDarkMode);
  const { token } = theme.useToken();
  const primaryColor = isDarkMode ? token.colorBgContainer : token.colorPrimary;
  const textColor = isDarkMode ? token.colorText : '#ffffff';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const navTabs: MenuProps['items'] = [
    {
      key: 'allCourses',
      label: t('allCourses'),
      icon: <BookOutlined />,
    },
    {
      key: 'departmentCourses',
      label: '系所課程',
      icon: <ApartmentOutlined />,
    },
    {
      key: 'selectedExport',
      label: t('selectedExportTab'),
      icon: <FileDoneOutlined />,
    },
    {
      key: 'announcements',
      label: t('announcements'),
      icon: <NotificationOutlined />,
    },
    {
      key: 'settings',
      label: t('settings.title'),
      icon: <SettingOutlined />,
    },
  ];

  const semesterCodeMap = {
    1: '上',
    2: '下',
    3: '暑',
  };

  const semesterOptions: SelectProps['options'] = Object.keys(
    availableSemesters.history,
  )
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      key: year,
      label: `${year.slice(0, -1)} ${semesterCodeMap[parseInt(year.slice(-1)) as 1 | 2 | 3]}`,
      value: year,
    }));

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    setDrawerOpen(false);
  };

  return (
    <>
      <HeaderContainer
        $primaryColor={primaryColor}
        $textColor={textColor}
        justify={'space-between'}
      >
        <Flex align={'center'} justify={'center'}>
          <Brand src={banner as string} alt='NSYSU Selector Helper' />
        </Flex>
        <Flex align={'center'} justify={'center'}>
          <StyledSelect
            value={selectedSemester === '' ? t('loading') : selectedSemester}
            onChange={(value) => setSelectedSemester(value as string)}
            options={semesterOptions}
            loading={!semesterOptions.length}
            style={{ width: 120 }}
          />
        </Flex>
        <StyledMenu
          $textColor={textColor}
          mode='horizontal'
          items={navTabs}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
        />
        <MobileMenu align={'center'} justify={'center'}>
          <Button
            ghost={!isDarkMode}
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        </MobileMenu>
      </HeaderContainer>
      <Drawer
        title={t('selectorHelper')}
        placement='left'
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Flex vertical={true} gap={20}>
          <Select
            value={selectedSemester === '' ? t('loading') : selectedSemester}
            onChange={(value) => setSelectedSemester(value)}
            options={semesterOptions}
            loading={!semesterOptions.length}
            style={{ width: '100%' }}
          />
          <Menu
            mode='vertical'
            items={navTabs}
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
          />
        </Flex>
      </Drawer>
    </>
  );
};

export default SectionHeader;
