import React, { useState } from 'react';
import { Modal, Button, Typography, Image, Steps, theme, Flex } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { useTranslation } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsDarkMode } from '@/store';

// 導入教學圖片
import ExportCourse1 from '@/assets/ExportCourse/ExportCourse1.png';
import ExportCourse2 from '@/assets/ExportCourse/ExportCourse2.png';
import ExportCourse3 from '@/assets/ExportCourse/ExportCourse3.png';
import ExportCourse4 from '@/assets/ExportCourse/ExportCourse4.png';
import ExportCourse5 from '@/assets/ExportCourse/ExportCourse5.png';
import ExportCourse6 from '@/assets/ExportCourse/ExportCourse6.png';
import ExportCourse7 from '@/assets/ExportCourse/ExportCourse7.png';

const { Text, Title } = Typography;

const StyledModal = styled(Modal)<{ $isDark: boolean }>`
  .ant-modal-content {
    background-color: ${(props) => (props.$isDark ? '#1f1f1f' : '#ffffff')};
  }

  .ant-modal-header {
    background-color: ${(props) => (props.$isDark ? '#1f1f1f' : '#ffffff')};
    border-bottom: 1px solid
      ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
  }

  .ant-modal-footer {
    background-color: ${(props) => (props.$isDark ? '#1f1f1f' : '#ffffff')};
    border-top: 1px solid ${(props) => (props.$isDark ? '#434343' : '#f0f0f0')};
    padding-top: 15px;
  }
`;

const TutorialContainer = styled.div<{ $isDark: boolean }>`
  .tutorial-image {
    border-radius: 8px;
    border: 1px solid ${(props) => (props.$isDark ? '#434343' : '#d9d9d9')};
    box-shadow: ${(props) =>
      props.$isDark
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }

  .warning-box {
    background-color: ${(props) => (props.$isDark ? '#2d1b00' : '#fff7e6')};
    border: 1px solid ${(props) => (props.$isDark ? '#d48806' : '#ffd591')};
    border-radius: 6px;
    margin-top: 16px;
    padding: 16px;
  }
`;

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const isDark = useAppSelector(selectIsDarkMode);
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);
  // 教學步驟數據
  const tutorialSteps = [
    {
      title: t('selectedExport.helpModal.tutorialSteps.step1.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step1.description',
      ),
      image: ExportCourse1,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step2.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step2.description',
      ),
      image: ExportCourse2,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step3.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step3.description',
      ),
      image: ExportCourse3,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step4.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step4.description',
      ),
      image: ExportCourse4,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step5.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step5.description',
      ),
      image: ExportCourse5,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step6.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step6.description',
      ),
      image: ExportCourse6,
    },
    {
      title: t('selectedExport.helpModal.tutorialSteps.step7.title'),
      description: t(
        'selectedExport.helpModal.tutorialSteps.step7.description',
      ),
      image: ExportCourse7,
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === tutorialSteps.length - 1) {
      // 如果是最後一步，則重置並關閉模態框
      resetAndClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <StyledModal
      title={t('selectedExport.helpModal.title')}
      open={open}
      onCancel={resetAndClose}
      width={800}
      $isDark={isDark}
      footer={[
        <Button key='close' onClick={resetAndClose}>
          {t('selectedExport.helpModal.close')}
        </Button>,
        <Button
          key='prev'
          icon={<LeftOutlined />}
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          {t('selectedExport.helpModal.prevStep')}
        </Button>,
        <Button
          key='next'
          type='primary'
          icon={<RightOutlined />}
          onClick={nextStep}
        >
          {currentStep === tutorialSteps.length - 1
            ? t('selectedExport.helpModal.complete')
            : t('selectedExport.helpModal.nextStep')}
        </Button>,
      ]}
    >
      <TutorialContainer $isDark={isDark}>
        {/* 進度指示器 */}
        <Steps
          current={currentStep}
          size='small'
          items={tutorialSteps.map((_, index) => ({
            title: `${t('selectedExport.helpModal.stepTitle')} ${index + 1}`,
          }))}
        />
        {/* 當前步驟內容 */}
        <Flex vertical={true} align={'center'}>
          <Title
            level={4}
            style={{ color: isDark ? token.colorText : undefined }}
          >
            {currentTutorial.title}
          </Title>
          <Image
            src={currentTutorial.image}
            alt={currentTutorial.title}
            className='tutorial-image'
            style={{ maxWidth: '100%', maxHeight: '400px' }}
            preview={{
              mask: t('selectedExport.helpModal.imagePreview'),
            }}
          />

          <Text
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: isDark ? token.colorTextSecondary : undefined,
            }}
          >
            {currentTutorial.description}
          </Text>
        </Flex>
        {/* 注意事項 */}
        {currentStep === tutorialSteps.length - 1 && (
          <div className='warning-box'>
            <Text strong style={{ color: isDark ? '#fa8c16' : '#d48806' }}>
              {t('selectedExport.helpModal.warningTitle')}
            </Text>
            <ul
              style={{
                margin: '8px 0 0 16px',
                color: isDark ? token.colorText : undefined,
              }}
            >
              {t('selectedExport.helpModal.warnings', {
                returnObjects: true,
              }).map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </TutorialContainer>
    </StyledModal>
  );
};

export default HelpModal;
