import React from 'react';
import type { CourseLabel } from '@/services';
import type { Color } from 'antd/es/color-picker';
import {
  Button,
  Col,
  ColorPicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
} from 'antd';
import { DEFAULT_COLOR_PRESETS } from '@/constants';
import { useTranslation } from '@/hooks';
import type { TranslationKey } from '@/types';

const LabelEditModal: React.FC<{
  open: boolean;
  label?: CourseLabel;
  onCancel: () => void;
  onSubmit: (
    labelData: Partial<
      CourseLabel & {
        bgColor: Color | string;
        borderColor: Color | string;
        textColor: Color | string;
      }
    >,
  ) => void;
  mode: 'create' | 'edit';
}> = ({ open, label, onCancel, onSubmit, mode }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表單驗證失敗:', error);
    }
  };
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 應用預設顏色組合
  const applyColorPreset = (preset: (typeof DEFAULT_COLOR_PRESETS)[0]) => {
    form.setFieldsValue({
      bgColor: preset.bgColor,
      borderColor: preset.borderColor,
      textColor: preset.textColor,
    });
  };

  return (
    <Modal
      title={mode === 'create' ? t('labels.newLabel') : t('labels.edit')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={
        mode === 'create' ? t('labels.createLabel') : t('labels.updateLabel')
      }
      cancelText={t('simpleFilter.cancel')}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={
          label || {
            bgColor: DEFAULT_COLOR_PRESETS[0].bgColor,
            borderColor: DEFAULT_COLOR_PRESETS[0].borderColor,
            textColor: DEFAULT_COLOR_PRESETS[0].textColor,
          }
        }
        preserve={false}
      >
        <Form.Item
          name='name'
          label={t('labels.name')}
          rules={[{ required: true, message: t('labels.nameRequired') }]}
        >
          <Input placeholder={t('labels.namePlaceholder')} />
        </Form.Item>

        <Divider orientation='left'>{t('labels.colorSettings')}</Divider>

        <Form.Item label={t('labels.colorPresets')}>
          <Space size={[4, 4]} wrap>
            {DEFAULT_COLOR_PRESETS.map((preset) => {
              const colorKey =
                `labels.colors.${preset.nameKey}` as TranslationKey;
              const displayName = t(colorKey);
              return (
                <Button
                  key={preset.nameKey}
                  size='small'
                  onClick={() => applyColorPreset(preset)}
                  style={{
                    backgroundColor: preset.bgColor,
                    color: preset.textColor,
                    border: `1px solid ${preset.borderColor}`,
                    height: 'auto',
                    padding: '4px 8px',
                  }}
                  title={t('labels.applyColorPreset', { name: displayName })}
                >
                  {displayName}
                </Button>
              );
            })}
          </Space>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name='bgColor'
              label={t('labels.bgColor')}
              rules={[{ required: true, message: t('labels.bgColorRequired') }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='borderColor'
              label={t('labels.borderColor')}
              rules={[
                { required: true, message: t('labels.borderColorRequired') },
              ]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='textColor'
              label={t('labels.textColor')}
              rules={[
                { required: true, message: t('labels.textColorRequired') },
              ]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default LabelEditModal;
