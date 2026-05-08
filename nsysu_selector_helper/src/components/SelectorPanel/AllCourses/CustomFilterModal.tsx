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
import { BulbOutlined } from '@ant-design/icons';
import { useTranslation } from '@/hooks';

const { Text } = Typography;

interface CustomFilterModalProps {
  fieldOptions: FieldOptions[];
}

const CustomFilterModal: React.FC<CustomFilterModalProps> = ({
  fieldOptions,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectShowCustomFilterModal);
  const editingFilter = useAppSelector(selectEditingCustomFilter);
  const currentFilterConditions = useAppSelector(selectFilterConditions);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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
              {
                include: t('suggestedLabel.include'),
                exclude: t('suggestedLabel.exclude'),
                notSet: t('suggestedLabel.notSet'),
                andMore: (count: number) =>
                  t('suggestedLabel.andMore', { count }),
              },
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
  }, [open, editingFilter, currentFilterConditions, fieldOptions, form, t]);

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
        messageApi.success(t('customFilter.updateSuccess'));
      } else {
        // 檢查是否已存在相同條件
        if (CustomQuickFiltersService.isFilterExists(condition)) {
          messageApi.warning(t('customFilter.alreadyExists'));
          return;
        }

        // 新增篩選器
        const newFilter = CustomQuickFiltersService.addCustomFilter(
          values.label.trim(),
          condition,
        );
        dispatch(addCustomQuickFilter(newFilter));
        messageApi.success(t('customFilter.saveSuccess'));
      }

      handleCancel();
    } catch (error) {
      console.error('Save custom filter error:', error);
      messageApi.error(t('customFilter.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const watchedField = Form.useWatch('field', form);
  const currentFieldOption = fieldOptions.find((f) => f.field === watchedField);

  return (
    <Modal
      title={
        editingFilter
          ? t('customFilter.editTitle')
          : t('customFilter.createTitle')
      }
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key='cancel' onClick={handleCancel}>
          {t('simpleFilter.cancel')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
        >
          {editingFilter ? t('customFilter.update') : t('customFilter.save')}
        </Button>,
      ]}
      destroyOnHidden
    >
      {contextHolder}
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          type: 'include',
        }}
      >
        <Form.Item
          name='label'
          label={t('customFilter.nameLabel')}
          rules={[
            { required: true, message: t('customFilter.nameRequired') },
            { max: 50, message: t('customFilter.nameMaxLength') },
          ]}
        >
          <Input placeholder={t('customFilter.namePlaceholder')} />
        </Form.Item>

        <Divider />

        <Form.Item
          name='field'
          label={t('customFilter.fieldLabel')}
          rules={[
            { required: true, message: t('customFilter.fieldRequired') },
          ]}
        >
          <Select
            placeholder={t('customFilter.fieldPlaceholder')}
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
          label={t('customFilter.typeLabel')}
          rules={[{ required: true, message: t('customFilter.typeRequired') }]}
        >
          <Radio.Group>
            <Radio value='include'>{t('simpleFilter.include')}</Radio>
            <Radio value='exclude'>{t('simpleFilter.exclude')}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name='value'
          label={t('customFilter.valueLabel')}
          rules={[
            { required: true, message: t('customFilter.valueRequired') },
          ]}
        >
          {currentFieldOption?.searchable ? (
            <Select
              mode='tags'
              placeholder={t('customFilter.valuePlaceholderTags')}
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
              placeholder={t('customFilter.valuePlaceholderSelect')}
              options={currentFieldOption.options.map((option) => ({
                value: option.value,
                label: `${option.label}${option.count ? ` (${option.count})` : ''}`,
              }))}
              showSearch
              optionFilterProp='label'
            />
          ) : (
            <Input placeholder={t('customFilter.valuePlaceholder')} />
          )}
        </Form.Item>

        {!editingFilter && currentFilterConditions.length > 0 && (
          <>
            <Divider />
            <Space direction='vertical' size='small' style={{ width: '100%' }}>
              <Text type='secondary' style={{ fontSize: '12px' }}>
                <BulbOutlined /> {t('customFilter.prefilledHint')}
              </Text>
            </Space>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CustomFilterModal;
