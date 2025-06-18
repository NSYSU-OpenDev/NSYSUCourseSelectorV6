// 公告相關的類型定義
export interface Announcement {
  // 基本資訊
  version: string;
  date: string;
  title: string;

  // 外部連結
  feedbackFormUrl?: string;
  dcForumUrl?: string;
  githubUrl?: string;
  contactEmail?: string;

  // 內容區塊（使用 Markdown 格式）
  description: string;
  updates: string[];
  features: string[];
  knownIssues: string[];
  termsOfUse: string;

  // 版權資訊
  copyright: string[];
}

export interface AnnouncementConfig {
  announcements: Announcement[];
  currentAnnouncementIndex: number;
}
