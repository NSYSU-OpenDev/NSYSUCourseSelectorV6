import { CourseLabelService } from '@/services';

describe('CourseLabelService', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('應該保存並載入標籤資料', () => {
    const state = {
      labels: [
        { id: 'test', name: '測試', bgColor: '#fff', borderColor: '#000' },
      ],
      courseLabels: { CS101: ['test'] },
    };
    CourseLabelService.save(state);
    const loaded = CourseLabelService.load();
    expect(loaded).toEqual(state);
  });

  it('沒有資料時應回傳預設結構', () => {
    const loaded = CourseLabelService.load();
    expect(loaded).toEqual({ labels: [], courseLabels: {} });
  });
});
