import { Announcement, AnnouncementConfig } from '@/types/announcement';

/**
 * 公告服務 - 負責管理公告的載入與處理
 */
export class AnnouncementService {
  /**
   * 獲取完整的資源路徑，考慮 Vite 的 base URL
   * @param path 相對路徑
   * @returns string 完整路徑
   */
  static getFullPath(path: string): string {
    if (path.startsWith('http')) {
      return path; // 絕對 URL 直接返回
    }

    const baseUrl = import.meta.env.BASE_URL || '/';
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }
  /**
   * 從 JSON 檔案載入公告配置
   * @param jsonPath JSON 檔案路徑
   * @returns Promise<AnnouncementConfig>
   */
  static async loadAnnouncementsFromJson(
    jsonPath: string = '/announcements.json',
  ): Promise<AnnouncementConfig> {
    try {
      // 使用 getFullPath 來處理 base URL
      const fullPath = this.getFullPath(jsonPath);
      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`載入公告失敗: ${response.status} (路徑: ${fullPath})`);
      }

      const config: AnnouncementConfig = await response.json();

      // 驗證數據格式
      if (!config.announcements || !Array.isArray(config.announcements)) {
        throw new Error('公告數據格式不正確');
      }

      return config;
    } catch (error) {
      console.error('載入公告時發生錯誤:', error);
      throw error;
    }
  }

  /**
   * 取得當前活躍的公告
   * @param config 公告配置
   * @returns Announcement | null
   */
  static getCurrentAnnouncement(
    config: AnnouncementConfig,
  ): Announcement | null {
    if (!config.announcements || config.announcements.length === 0) {
      return null;
    }

    const index = config.currentAnnouncementIndex || 0;
    if (index >= 0 && index < config.announcements.length) {
      return config.announcements[index];
    }

    // 如果索引無效，返回第一個公告
    return config.announcements[0];
  }

  /**
   * 取得所有公告列表
   * @param config 公告配置
   * @returns Announcement[]
   */
  static getAllAnnouncements(config: AnnouncementConfig): Announcement[] {
    return config.announcements || [];
  }

  /**
   * 驗證公告數據是否有效
   * @param announcement 公告數據
   * @returns boolean
   */
  static validateAnnouncement(announcement: Announcement): boolean {
    return !!(
      announcement.version &&
      announcement.date &&
      announcement.title &&
      announcement.description
    );
  }

  /**
   * 格式化公告日期
   * @param dateString 日期字串
   * @returns string
   */
  static formatAnnouncementDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString; // 如果解析失敗，返回原始字串
    }
  }
}
