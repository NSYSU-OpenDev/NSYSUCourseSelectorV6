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
  //
  // options 這裡必須是 any，不能收斂成 i18next 的 TOptions：
  // TranslationKey 由 Paths<> 推導，含 'course'、'sort' 這類「父層」鍵，
  // 而 i18next 具型別的 t() 只在 returnObjects: true 時才接受父層鍵。
  // 收斂型別會同時讓參數不相容，並把回傳值窄化成 string，
  // 導致 CoursesList/Header、SelectedExport/Header、HelpModal
  // 三處 returnObjects: true 的呼叫端編譯失敗。
  // 待 typeSafeT 改為多載（依 returnObjects 決定回傳型別）後即可移除。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeSafeT = (key: TranslationKey, options?: any) => {
    return t(key, options);
  };

  return {
    t: typeSafeT,
    i18n,
  };
};
