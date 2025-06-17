/**
 * 課程資料結構
 * @property {string} id - 課程代碼 e.g., "STP101"
 * @property {string} url - 課程網址
 * @property {string} [change] - 課程變更狀態 e.g., "新增"
 * @property {string} [changeDescription] - 課程變更描述 e.g., "7/15"
 * @property {boolean} multipleCompulsory - 是否為多選必修課程
 * @property {string} department - 開課系所 e.g., "中學學程"
 * @property {string} grade - 年級 e.g., "0"
 * @property {string} [class] - 班別 e.g., "不分班"
 * @property {string} name - 課程名稱 e.g., "教育心理學"
 * @property {string} credit - 學分數 e.g., "2"
 * @property {string} yearSemester - 年期 e.g., "期"
 * @property {boolean} compulsory - 是否為必修課程
 * @property {number} restrict - 限選人數
 * @property {number} select - 已選人數
 * @property {number} selected - 已選人數
 * @property {number} remaining - 剩餘名額 (可能為負數表示超收)
 * @property {string} teacher - 授課教師 e.g., "馮雅群"
 * @property {string} room - 上課教室 e.g., "三5,6(社SS 2001)"
 * @property {string[]} classTime - 上課時間 e.g., ["", "", "56", "", "", "", ""]
 * @property {string} description - 課程描述 e.g., "《講授類》\n本課程為教育學程課程"
 * @property {string[]} tags - 課程學程標籤 e.g., []
 * @property {string[]} [labels] - 自訂標籤 ID
 * @property {boolean} english - 是否為英文授課課程
 */
export type Course = {
  id: string;
  url: string;
  change?: string;
  changeDescription?: string;
  multipleCompulsory: boolean;
  department: string;
  grade: string;
  class?: string;
  name: string;
  credit: string;
  yearSemester: string;
  compulsory: boolean;
  restrict: number;
  select: number;
  selected: number;
  remaining: number;
  teacher: string;
  room: string;
  classTime: string[];
  description: string;
  tags: string[];
  labels?: string[];
  english: boolean;
};

export type AcademicYear = {
  latest: string;
  history: Record<string, string>;
};

export type SemesterUpdate = {
  latest: string;
  history: Record<string, string>;
};

export type Info = {
  page_size: number;
  updated: string;
};

export type NSYSUAPIResponse = {
  academic_year: AcademicYear;
  semester_update: SemesterUpdate;
  info: Info;
  data: Course[];
};

/**
 * 已選課程匯出數據結構
 * @property {string} id - 課程代碼
 * @property {number} value - 點數配置 (0-100)
 * @property {string} isSel - 是否選擇匯出 ("1" 為匯出, "0" 為不匯出)
 */
export type ExportCourseData = {
  id: string;
  value: number;
  isSel: string;
};

/**
 * 已選課程配置數據結構 (內部使用)
 * @property {string} courseId - 課程代碼
 * @property {number} points - 點數配置 (0-100)
 * @property {boolean} isExported - 是否選擇匯出
 */
export type SelectedCourseConfig = {
  courseId: string;
  points: number;
  isExported: boolean;
};
