export class GetProbability {
  static getSuccessProbability = (
    select: number,
    remaining: number,
  ): number => {
    if (remaining <= 0) return 0; // 已滿或超額
    if (select <= 0) return 100; // 沒人搶，100%選上

    // 簡化計算：remaining / select * 100，但限制在0-100之間
    const probability = Math.min((remaining / select) * 100, 100);
    return Math.max(probability, 0);
  };

  static getProbabilityStatus = (
    remaining: number,
  ): 'full' | 'overbooked' | 'normal' => {
    if (remaining === 0) return 'full'; // 剛好滿額
    if (remaining < 0) return 'overbooked'; // 超額（加簽等）
    return 'normal'; // 正常
  };

  static getProbabilityText = (select: number, remaining: number): string => {
    if (remaining <= 0) {
      return remaining === 0 ? '已滿' : `超額${Math.abs(remaining)}`;
    }
    const probability = this.getSuccessProbability(select, remaining);
    return `${Math.round(probability)}%`;
  };
}
