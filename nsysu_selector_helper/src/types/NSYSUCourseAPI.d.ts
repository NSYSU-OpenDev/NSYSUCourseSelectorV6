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
