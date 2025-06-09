import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCourseLabels } from '@/store/selectors';
import { addLabel, updateLabel, removeLabel } from '@/store/slices/courseLabelsSlice';

interface CourseLabelManagerProps {
  open: boolean;
  onClose: () => void;
}

type FormLabel = {
  id?: string;
  name: string;
  color: string;
  borderColor?: string;
};

const CourseLabelManager: React.FC<CourseLabelManagerProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const labelDefs = useAppSelector(selectCourseLabels);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ labels: labelDefs });
    }
  }, [open, labelDefs, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const labels = values.labels as FormLabel[];

    // Remove deleted labels
    labelDefs.forEach((orig) => {
      if (!labels.find((l) => l.id === orig.id)) {
        dispatch(removeLabel(orig.id));
      }
    });

    labels.forEach((label) => {
      const id = label.id || `label-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (!label.id) {
        dispatch(addLabel({ id, name: label.name, color: label.color, borderColor: label.borderColor }));
      } else {
        dispatch(updateLabel({ id, updates: { name: label.name, color: label.color, borderColor: label.borderColor } }));
      }
    });

    onClose();
  };

  return (
    <Modal
      title='管理自訂標籤'
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      destroyOnClose
      width={480}
    >
      <Form form={form} name='course-labels'>
        <Form.List name='labels'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Space key={key} align='baseline' style={{ marginBottom: 8 }}>
                  <Form.Item name={[name, 'id']} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={[name, 'name']}
                    rules={[{ required: true, message: '請輸入名稱' }]}
                    style={{ marginRight: 8 }}
                  >
                    <Input placeholder='標籤名稱' />
                  </Form.Item>
                  <Form.Item name={[name, 'color']} style={{ marginRight: 8 }}>
                    <Input type='color' />
                  </Form.Item>
                  <Form.Item name={[name, 'borderColor']} style={{ marginRight: 8 }}>
                    <Input type='color' />
                  </Form.Item>
                  <Button type='text' danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type='dashed' onClick={() => add({ name: '', color: '#ffffff' })} block icon={<PlusOutlined />}>
                  新增標籤
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default CourseLabelManager;
