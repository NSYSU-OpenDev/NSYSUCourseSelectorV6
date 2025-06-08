import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Space,
  Typography,
  message,
  Divider,
} from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShowCustomFilterModal,
  selectEditingCustomFilter,
  selectFilterConditions,
} from '@/store/selectors';
import {
  setShowCustomFilterModal,
  setEditingCustomFilter,
  addCustomQuickFilter,
  updateCustomQuickFilter,
} from '@/store/slices/uiSlice';
import { CustomQuickFiltersService } from '@/services/customQuickFiltersService';
import type { FilterCondition } from '@/store/slices/uiSlice';
import type { FieldOptions } from '@/services/advancedFilterService';

const { Text } = Typography;

interface CustomFilterModalProps {
  fieldOptions: FieldOptions[];
}

const CustomFilterModal: React.FC<CustomFilterModalProps> = ({
  fieldOptions,
}) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectShowCustomFilterModal);
  const editingFilter = useAppSelector(selectEditingCustomFilter);
  const currentFilterConditions = useAppSelector(selectFilterConditions);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 初始化表單
  useEffect(() => {
    if (open) {
      if (editingFilter) {
        // 編輯模式
        form.setFieldsValue({
          label: editingFilter.label,
          field: editingFilter.condition.field,
          type: editingFilter.condition.type,
          value: editingFilter.condition.value,
        });
      } else {
        // 新增模式 - 如果有當前篩選條件，使用第一個作為預設
        if (currentFilterConditions.length > 0) {
          const firstCondition = currentFilterConditions[0];
          const suggestedLabel =
            CustomQuickFiltersService.generateSuggestedLabel(
              firstCondition,
              fieldOptions,
            );
          form.setFieldsValue({
            label: suggestedLabel,
            field: firstCondition.field,
            type: firstCondition.type,
            value: firstCondition.value,
          });
        } else {
          form.resetFields();
        }
      }
    }
  }, [open, editingFilter, currentFilterConditions, fieldOptions, form]);

  const handleCancel = () => {
    form.resetFields();
    dispatch(setShowCustomFilterModal(false));
    dispatch(setEditingCustomFilter(null));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const condition: FilterCondition = {
        field: values.field,
        type: values.type,
        value: values.value,
      };

      if (editingFilter) {
        // 更新現有篩選器
        CustomQuickFiltersService.updateCustomFilter(editingFilter.id, {
          label: values.label.trim(),
          condition,
        });
        dispatch(
          updateCustomQuickFilter({
            id: editingFilter.id,
            updates: { label: values.label.trim(), condition },
          }),
        );
        message.success('快速篩選器更新成功！');
      } else {
        // 檢查是否已存在相同條件
        if (CustomQuickFiltersService.isFilterExists(condition)) {
          message.warning('相同的篩選條件已存在！');
          return;
        }

        // 新增篩選器
        const newFilter = CustomQuickFiltersService.addCustomFilter(
          values.label.trim(),
          condition,
        );
        dispatch(addCustomQuickFilter(newFilter));
        message.success('快速篩選器保存成功！');
      }

      handleCancel();
    } catch (error) {
      console.error('Save custom filter error:', error);
      message.error('保存失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const watchedField = Form.useWatch('field', form);
  const currentFieldOption = fieldOptions.find((f) => f.field === watchedField);

  return (
    <Modal
      title={editingFilter ? '編輯快速篩選器' : '新增快速篩選器'}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key='cancel' onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
        >
          {editingFilter ? '更新' : '保存'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          type: 'include',
        }}
      >
        <Form.Item
          name='label'
          label='篩選器名稱'
          rules={[
            { required: true, message: '請輸入篩選器名稱' },
            { max: 50, message: '名稱不能超過50個字符' },
          ]}
        >
          <Input placeholder='為這個篩選器取個名字' />
        </Form.Item>

        <Divider />

        <Form.Item
          name='field'
          label='篩選欄位'
          rules={[{ required: true, message: '請選擇篩選欄位' }]}
        >
          <Select
            placeholder='選擇要篩選的欄位'
            showSearch
            optionFilterProp='label'
            options={fieldOptions.map((field) => ({
              value: field.field,
              label: field.label,
            }))}
          />
        </Form.Item>

        <Form.Item
          name='type'
          label='篩選類型'
          rules={[{ required: true, message: '請選擇篩選類型' }]}
        >
          <Radio.Group>
            <Radio value='include'>包含</Radio>
            <Radio value='exclude'>排除</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name='value'
          label='篩選值'
          rules={[{ required: true, message: '請設定篩選值' }]}
        >
          {currentFieldOption?.searchable ? (
            <Select
              mode='tags'
              placeholder='輸入篩選值，支援多個值'
              options={currentFieldOption.options.map((option) => ({
                value: option.value,
                label: `${option.label}${option.count ? ` (${option.count})` : ''}`,
              }))}
              showSearch
              optionFilterProp='label'
            />
          ) : currentFieldOption?.options ? (
            <Select
              mode='multiple'
              placeholder='選擇篩選值'
              options={currentFieldOption.options.map((option) => ({
                value: option.value,
                label: `${option.label}${option.count ? ` (${option.count})` : ''}`,
              }))}
              showSearch
              optionFilterProp='label'
            />
          ) : (
            <Input placeholder='輸入篩選值' />
          )}
        </Form.Item>

        {!editingFilter && currentFilterConditions.length > 0 && (
          <>
            <Divider />
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              <Text type='secondary' style={{ fontSize: '12px' }}>
                💡 提示：表單已根據您當前的篩選條件預填
              </Text>
            </Space>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CustomFilterModal;
