import type { Course } from '@/types';

export class CourseService {
  /**
   * 檢查兩門課程是否有時間衝突
   * @param course1 第一門課程
   * @param course2 第二門課程
   * @return 如果有時間衝突，返回 true；否則返回 false
   */ private static hasTimeConflict(
    course1: Course,
    course2: Course,
  ): boolean {
    for (let i = 0; i < 7; i++) {
      const time1 = course1.classTime[i];
      const time2 = course2.classTime[i];

      // 檢查兩個時間都存在且不為空字符串
      if (time1 && time2 && time1.trim() !== '' && time2.trim() !== '') {
        // 清理並只保留數字及 A-F 字符，避免刪除特殊時段代碼
        const cleanTime1 = time1.trim().replace(/[^0-9A-F]/gi, '');
        const cleanTime2 = time2.trim().replace(/[^0-9A-F]/gi, '');

        if (cleanTime1 && cleanTime2) {
          const timeSlots1 = cleanTime1.split('');
          const timeSlots2 = cleanTime2.split('');

          // 檢查是否有相同的時間段
          for (const slot1 of timeSlots1) {
            if (timeSlots2.includes(slot1)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  /**
   * 計算當前選課的總學分和總時數
   * @param selectedCourses 選擇的課程集合
   * @return 返回一個對象，包含總學分和總時數
   */
  static calculateTotalCredits(selectedCourses: Set<Course>): {
    totalCredits: number;
    totalHours: number;
  } {
    let totalCredits = 0;
    let totalHours = 0;

    selectedCourses.forEach((course) => {
      totalCredits += parseFloat(course.credit ?? '0.0');

      // 計算總時數：遍歷每天的時間，累加非空字符串的長度
      course.classTime.forEach((timeSlot) => {
        if (timeSlot && timeSlot.trim() !== '') {
          totalHours += timeSlot.length;
        }
      });
    });

    return { totalCredits, totalHours };
  }

  /**
   * 檢測新選擇的課程是否與已選課程有時間衝突
   * @param course 新選擇的課程
   * @param selectedCourses 已選課程集合
   * @return 如果有時間衝突，返回 true；否則返回 false
   */
  static detectTimeConflict(
    course: Course,
    selectedCourses: Set<Course>,
  ): boolean {
    for (const selectedCourse of selectedCourses) {
      if (this.hasTimeConflict(course, selectedCourse)) {
        return true;
      }
    }
    return false;
  } /**
   * 搜尋課程：支援完整布林檢索功能
   * @param courses 課程陣列
   * @param query 搜尋關鍵字（支援多種布林操作符）
   * @return 匹配的課程陣列
   *
   * 支援的操作符：
   * - 空格 / AND / & -> AND 操作：'資工 必修' 或 '資工 AND 必修'
   * - OR / | -> OR 操作：'資工 OR 電機'
   * - NOT / - / ! -> NOT 操作：'資工 NOT 選修' 或 '資工 -選修'
   * - 雙引號 -> 精確匹配：'"計算機概論"'
   * - 括號 -> 分組：'(資工 OR 電機) AND 必修'
   * - + -> 必須包含：'+資工 電機'
   *
   * 使用範例：
   * - "資工 必修" -> 同時包含 "資工" 和 "必修"
   * - "資工 OR 電機" -> 包含 "資工" 或 "電機"
   * - "資工 -選修" -> 包含 "資工" 但不包含 "選修"
   * - '"計算機概論"' -> 精確匹配 "計算機概論"
   * - "+資工 電機" -> 必須包含 "資工"，可能包含 "電機"
   */
  static searchCourses(courses: Course[], query: string): Course[] {
    if (!query || query.trim() === '') {
      return courses;
    }

    return courses.filter((course) => {
      // 建立課程的所有可搜尋文字內容
      const searchableContent = [
        course.name.toLowerCase(),
        course.id.toLowerCase(),
        course.teacher.toLowerCase(),
        course.department.toLowerCase(),
        ...course.tags.map((tag) => tag.toLowerCase()),
      ].join(' ');

      return this.evaluateBooleanQuery(
        query.toLowerCase().trim(),
        searchableContent,
      );
    });
  }

  /**
   * 解析並評估布林查詢表達式
   * @param query 查詢字串
   * @param content 要搜尋的內容
   * @return 是否匹配
   */
  private static evaluateBooleanQuery(query: string, content: string): boolean {
    try {
      // 處理引號包圍的精確匹配
      const processedQuery = this.processQuotedTerms(query, content);

      // 處理括號分組
      return this.evaluateExpression(processedQuery, content);
    } catch (error) {
      // 如果解析失敗，回退到簡單的 AND 搜尋
      console.warn(
        'Boolean query parsing failed, falling back to simple search:',
        error,
      );
      return this.simpleAndSearch(query, content);
    }
  }
  /**
   * 處理引號包圍的精確匹配
   */
  private static processQuotedTerms(query: string, content: string): string {
    return query.replace(/"([^"]+)"/g, (_, quoted) => {
      const isMatch = content.includes(quoted.toLowerCase());
      return isMatch ? 'TRUE' : 'FALSE';
    });
  }

  /**
   * 評估表達式（支援括號分組）
   */
  private static evaluateExpression(
    expression: string,
    content: string,
  ): boolean {
    // 先檢查左右括號數量是否平衡
    const leftCount = (expression.match(/\(/g) || []).length;
    const rightCount = (expression.match(/\)/g) || []).length;
    if (leftCount !== rightCount) {
      throw new Error(`Mismatched parentheses: ${expression}`);
    }

    // 處理最內層括號
    let prev: string;
    while (expression.includes('(')) {
      prev = expression;
      expression = expression.replace(/\([^()]+\)/g, (match) => {
        const innerExpr = match.slice(1, -1);
        const result = this.evaluateSimpleExpression(innerExpr, content);
        return result ? 'TRUE' : 'FALSE';
      });
      // 如果一次 replace 後，字串毫無改變，但還是包含 '('，表示有不匹配或空括號
      if (expression === prev) {
        throw new Error(`Cannot reduce parentheses further: ${expression}`);
      }
    }

    return this.evaluateSimpleExpression(expression, content);
  }

  /**
   * 評估簡單表達式（不含括號）
   */
  private static evaluateSimpleExpression(
    expression: string,
    content: string,
  ): boolean {
    // 將 expression 以小寫處理
    const expr = expression.trim();
    // 處理 OR
    if (/(\bOR\b|\|)/.test(expr)) {
      const orParts = expr
        .split(/\s*(?:OR|\|)\s*/) // 不保留分隔符
        .filter((part) => part.trim() !== '');
      return orParts.some((part) =>
        this.evaluateAndExpression(part.trim(), content),
      );
    }
    return this.evaluateAndExpression(expr, content);
  }

  /**
   * 評估 AND 表達式
   */
  private static evaluateAndExpression(
    expression: string,
    content: string,
  ): boolean {
    // 處理 AND（空格、AND、&）
    const andParts = expression
      .split(/\s*(?:AND|&|\s+)\s*/)
      .filter((part) => part.trim() !== '');

    return andParts.every((term) => this.evaluateTerm(term.trim(), content));
  }

  /**
   * 評估單個詞項
   */
  private static evaluateTerm(term: string, content: string): boolean {
    if (term === 'TRUE') return true;
    if (term === 'FALSE') return false;

    // 處理多重 NOT
    if (/^(?:NOT\s+|!|-)+/i.test(term)) {
      // 移除所有前綴
      const stripped = term.replace(/^(?:NOT\s+|!|-)+/i, '').trim();
      return !content.includes(stripped);
    }

    // 處理 + 必須包含
    if (term.startsWith('+')) {
      const requiredTerm = term.substring(1).trim();
      return content.includes(requiredTerm);
    }

    // 普通子字串匹配
    return content.includes(term);
  }

  /**
   * 簡單的 AND 搜尋（回退機制）
   */
  private static simpleAndSearch(query: string, content: string): boolean {
    const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

    return searchTerms.every((term) => content.includes(term));
  }
}
