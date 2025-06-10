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
      title={mode === 'create' ? '新增標籤' : '編輯標籤'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={mode === 'create' ? '新增' : '更新'}
      cancelText='取消'
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
          label='標籤名稱'
          rules={[{ required: true, message: '請輸入標籤名稱' }]}
        >
          <Input placeholder='請輸入標籤名稱' />
        </Form.Item>

        <Divider orientation='left'>顏色設定</Divider>

        <Form.Item label='常用顏色組合'>
          <Space size={[4, 4]} wrap>
            {DEFAULT_COLOR_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                size='small'
                onClick={() => applyColorPreset(preset)}
                style={{
                  backgroundColor: preset.bgColor,
                  color: preset.textColor,
                  border: `1px solid ${preset.borderColor}`,
                  height: 'auto',
                  padding: '4px 8px',
                }}
                title={`應用${preset.name}配色`}
              >
                {preset.name}
              </Button>
            ))}
          </Space>
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name='bgColor'
              label='背景色'
              rules={[{ required: true, message: '請選擇背景色' }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='borderColor'
              label='邊框色'
              rules={[{ required: true, message: '請選擇邊框色' }]}
            >
              <ColorPicker showText />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='textColor'
              label='文字色'
              rules={[{ required: true, message: '請選擇文字色' }]}
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
