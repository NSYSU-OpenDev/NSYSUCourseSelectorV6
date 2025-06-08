// 預設排序選項
import { SortOption } from '@/services';

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    key: 'default',
    label: '預設順序',
    description: '系統原始排序（無升序降序）',
  },
  {
    key: 'probability',
    label: '選上概率',
    description: '升序：一般概率(低到高)；降序：一般概率(高到低)',
  },
  {
    key: 'remaining',
    label: '剩餘名額',
    description:
      '升序：負數(超收)→0→正數(剩餘名額少到多)；降序：正數(剩餘名額多到少)→0→負數(超收)',
  },
  {
    key: 'available',
    label: '可選人數',
    description:
      '升序：負數(超收)→0→正數(可選名額少到多)；降序：正數(可選名額多到少)→0→負數(超收)',
  },
  {
    key: 'credit',
    label: '學分數',
    description: '升序：學分少到多(1→2→3→...)；降序：學分多到少(...→3→2→1)',
  },
  {
    key: 'courseLevel',
    label: '課程等級',
    description:
      '升序：大學部→碩士班→碩士專班→博士班；降序：博士班→碩士專班→碩士班→大學部',
  },
  {
    key: 'compulsory',
    label: '必修優先',
    description: '升序：必修課程→選修課程；降序：選修課程→必修課程',
  },
];
