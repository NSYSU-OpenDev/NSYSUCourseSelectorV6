import { useTranslation as useI18nTranslation } from 'react-i18next';

import { TranslationKey } from '@/types';

/**
 * 類型安全的翻譯 hook
 *
 * 提供编译时的类型检查，确保使用的翻译键存在于定义的类型中
 * 例如: t('homepage.title') 将通过类型检查
 * 而 t('不存在的键') 将产生 TypeScript 错误
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  // 返回一个类型安全的 t 函数
  const typeSafeT = (key: TranslationKey, options?: any) => {
    return t(key, options);
  };

  return {
    t: typeSafeT,
    i18n,
  };
};
