import '@testing-library/jest-dom';

// Mock AnnouncementService.getFullPath 方法來避免 import.meta 問題
jest.mock('@/services/announcementService', () => ({
  AnnouncementService: {
    getFullPath: jest.fn((path: string) => {
      if (path.startsWith('http')) {
        return path;
      }
      return path; // 在測試環境中直接返回原路徑
    }),
    loadAnnouncementsFromJson: jest.fn(),
    getCurrentAnnouncement: jest.fn(),
    getAllAnnouncements: jest.fn(),
    validateAnnouncement: jest.fn(),
    formatAnnouncementDate: jest.fn(),
  },
}));
