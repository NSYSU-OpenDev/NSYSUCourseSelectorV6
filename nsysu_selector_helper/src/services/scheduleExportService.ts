import type { Course } from '@/types';
import { timeSlot } from '@/constants';

/**
 * Time slot mapping for calendar display
 */
const TIME_SLOT_MAP: Record<string, { start: string; end: string }> = {
  A: { start: '07:00', end: '07:50' },
  '1': { start: '08:10', end: '09:00' },
  '2': { start: '09:10', end: '10:00' },
  '3': { start: '10:10', end: '11:00' },
  '4': { start: '11:10', end: '12:00' },
  B: { start: '12:10', end: '13:00' },
  '5': { start: '13:10', end: '14:00' },
  '6': { start: '14:10', end: '15:00' },
  '7': { start: '15:10', end: '16:00' },
  '8': { start: '16:10', end: '17:00' },
  '9': { start: '17:10', end: '18:00' },
  C: { start: '18:20', end: '19:10' },
  D: { start: '19:15', end: '20:05' },
  E: { start: '20:10', end: '21:00' },
  F: { start: '21:05', end: '21:55' },
};

// Define time slot order for determining consecutive slots
const TIME_SLOT_ORDER = [
  'A',
  '1',
  '2',
  '3',
  '4',
  'B',
  '5',
  '6',
  '7',
  '8',
  '9',
  'C',
  'D',
  'E',
  'F',
];

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

// Vibrant color palette for course blocks (with 85% opacity for overlapping visibility)
const COURSE_COLORS = [
  { bg: 'rgba(230, 247, 255, 0.88)', border: '#1890ff', text: '#096dd9' }, // Blue
  { bg: 'rgba(246, 255, 237, 0.88)', border: '#52c41a', text: '#389e0d' }, // Green
  { bg: 'rgba(255, 247, 230, 0.88)', border: '#fa8c16', text: '#d46b08' }, // Orange
  { bg: 'rgba(255, 240, 246, 0.88)', border: '#eb2f96', text: '#c41d7f' }, // Magenta
  { bg: 'rgba(249, 240, 255, 0.88)', border: '#722ed1', text: '#531dab' }, // Purple
  { bg: 'rgba(230, 255, 251, 0.88)', border: '#13c2c2', text: '#08979c' }, // Cyan
  { bg: 'rgba(255, 241, 240, 0.88)', border: '#f5222d', text: '#cf1322' }, // Red
  { bg: 'rgba(252, 255, 230, 0.88)', border: '#a0d911', text: '#7cb305' }, // Lime
];

const COURSE_COLORS_DARK = [
  { bg: 'rgba(17, 29, 44, 0.88)', border: '#1890ff', text: '#69c0ff' }, // Blue
  { bg: 'rgba(22, 35, 18, 0.88)', border: '#52c41a', text: '#95de64' }, // Green
  { bg: 'rgba(43, 29, 17, 0.88)', border: '#fa8c16', text: '#ffc069' }, // Orange
  { bg: 'rgba(41, 19, 33, 0.88)', border: '#eb2f96', text: '#ff85c0' }, // Magenta
  { bg: 'rgba(26, 19, 37, 0.88)', border: '#722ed1', text: '#b37feb' }, // Purple
  { bg: 'rgba(17, 33, 35, 0.88)', border: '#13c2c2', text: '#5cdbd3' }, // Cyan
  { bg: 'rgba(42, 18, 21, 0.88)', border: '#f5222d', text: '#ff7875' }, // Red
  { bg: 'rgba(31, 38, 17, 0.88)', border: '#a0d911', text: '#d3f261' }, // Lime
];

interface ExportOptions {
  isDark?: boolean;
  scale?: number;
  title?: string;
}

interface MergedCourseBlock {
  course: Course;
  day: number;
  startSlotIndex: number;
  endSlotIndex: number;
  roomForThisSlot: string;
}

/**
 * Get color for a course based on its department
 */
const getCourseColor = (
  department: string,
  isDark: boolean,
): { bg: string; border: string; text: string } => {
  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_COLORS.length;
  return isDark ? COURSE_COLORS_DARK[index] : COURSE_COLORS[index];
};

/**
 * Parse room information from course room string
 */
const parseRoomInfo = (
  roomString: string,
): Record<number, Record<string, string>> => {
  const roomMap: Record<number, Record<string, string>> = {};
  const dayMap: Record<string, number> = {};
  WEEKDAYS.forEach((day, index) => {
    dayMap[day] = index;
  });

  const pattern = /([一二三四五六日])([0-9A-F,]+)\(([^)]+)\)/g;
  let match;

  while ((match = pattern.exec(roomString)) !== null) {
    const day = dayMap[match[1]];
    const timeSlots = match[2].split(',');
    const room = match[3];

    if (day !== undefined) {
      if (!roomMap[day]) {
        roomMap[day] = {};
      }
      timeSlots.forEach((slot) => {
        roomMap[day][slot.trim()] = room;
      });
    }
  }

  return roomMap;
};

/**
 * Check if any course has weekend classes
 */
const hasWeekendCourses = (courses: Course[]): boolean => {
  return courses.some((course) => {
    return (
      (course.classTime[5] && course.classTime[5].length > 0) ||
      (course.classTime[6] && course.classTime[6].length > 0)
    );
  });
};

/**
 * Build merged course blocks - combines consecutive time slots for same course
 */
const buildMergedCourseBlocks = (courses: Course[]): MergedCourseBlock[] => {
  const blocks: MergedCourseBlock[] = [];

  // For each course, find all time slots and merge consecutive ones
  courses.forEach((course) => {
    const roomInfo = parseRoomInfo(course.room);

    // For each day
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayTime = course.classTime[dayIndex];
      if (!dayTime) continue;

      // Get all slots for this day, sorted by order
      const slots = dayTime.split('').filter((s) => TIME_SLOT_MAP[s]);
      if (slots.length === 0) continue;

      // Sort slots by their order in the day
      slots.sort(
        (a, b) => TIME_SLOT_ORDER.indexOf(a) - TIME_SLOT_ORDER.indexOf(b),
      );

      // Merge consecutive slots
      let startSlot = slots[0];
      let endSlot = slots[0];

      for (let i = 1; i <= slots.length; i++) {
        const currentSlot = slots[i];
        const prevSlot = slots[i - 1];

        // Check if current slot is consecutive to previous
        const prevIndex = TIME_SLOT_ORDER.indexOf(prevSlot);
        const currIndex = currentSlot
          ? TIME_SLOT_ORDER.indexOf(currentSlot)
          : -1;

        if (currIndex === prevIndex + 1) {
          // Consecutive - extend the block
          endSlot = currentSlot;
        } else {
          // Not consecutive or end of list - save current block and start new
          blocks.push({
            course,
            day: dayIndex,
            startSlotIndex: TIME_SLOT_ORDER.indexOf(startSlot),
            endSlotIndex: TIME_SLOT_ORDER.indexOf(endSlot),
            roomForThisSlot: roomInfo[dayIndex]?.[startSlot] || '',
          });

          if (currentSlot) {
            startSlot = currentSlot;
            endSlot = currentSlot;
          }
        }
      }
    }
  });

  return blocks;
};

/**
 * Wrap text to fit within a specified width
 */
const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const lines: string[] = [];
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
};

/**
 * Export schedule as PNG image using Canvas API
 */
export const exportScheduleAsImage = async (
  courses: Course[],
  options: ExportOptions = {},
): Promise<Blob> => {
  const { isDark = false, scale = 2, title = '課程時間表' } = options;

  // Determine if we need weekend columns
  const includeWeekends = hasWeekendCourses(courses);
  const visibleDays = includeWeekends ? WEEKDAYS : WEEKDAYS.slice(0, 5);
  const numDays = visibleDays.length;

  // Canvas dimensions
  const padding = 24 * scale;
  const headerHeight = 50 * scale;
  const titleHeight = 50 * scale;
  const timeColWidth = 70 * scale;
  const dayColWidth = 160 * scale;
  const rowHeight = 60 * scale; // Slightly smaller since we merge cells
  const numSlots = timeSlot.length;

  const canvasWidth = padding * 2 + timeColWidth + dayColWidth * numDays;
  const canvasHeight =
    padding * 2 + titleHeight + headerHeight + rowHeight * numSlots;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Colors based on theme
  const colors = isDark
    ? {
        bg: '#141414',
        headerBg: '#1f1f1f',
        cellBg: '#1f1f1f',
        cellAltBg: '#262626',
        border: '#434343',
        text: '#ffffff',
        subText: '#aaaaaa',
        titleText: '#ffffff',
      }
    : {
        bg: '#ffffff',
        headerBg: '#f8f9fa',
        cellBg: '#ffffff',
        cellAltBg: '#fafafa',
        border: '#d9d9d9',
        text: '#333333',
        subText: '#666666',
        titleText: '#333333',
      };

  // Fill background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw title with date
  ctx.fillStyle = colors.titleText;
  ctx.font = `bold ${22 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft JhengHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const dateStr = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(
    `${title}`,
    canvasWidth / 2,
    padding + titleHeight / 2 - 8 * scale,
  );
  ctx.font = `${12 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = colors.subText;
  ctx.fillText(
    `匯出日期: ${dateStr}`,
    canvasWidth / 2,
    padding + titleHeight / 2 + 12 * scale,
  );

  const tableTop = padding + titleHeight;
  const tableLeft = padding;

  // Draw header row
  ctx.fillStyle = colors.headerBg;
  ctx.fillRect(tableLeft, tableTop, canvasWidth - padding * 2, headerHeight);

  // Draw header border
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(tableLeft, tableTop, canvasWidth - padding * 2, headerHeight);

  // Draw time column header
  ctx.strokeRect(tableLeft, tableTop, timeColWidth, headerHeight);
  ctx.fillStyle = colors.text;
  ctx.font = `bold ${12 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    '節次',
    tableLeft + timeColWidth / 2,
    tableTop + headerHeight / 2,
  );

  // Draw day headers
  ctx.font = `bold ${16 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  visibleDays.forEach((day, index) => {
    const x = tableLeft + timeColWidth + dayColWidth * index;
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(x, tableTop, dayColWidth, headerHeight);
    ctx.fillStyle = colors.text;
    ctx.fillText(
      `星期${day}`,
      x + dayColWidth / 2,
      tableTop + headerHeight / 2,
    );
  });

  // Draw grid cells (background only)
  timeSlot.forEach((slot, slotIndex) => {
    const y = tableTop + headerHeight + rowHeight * slotIndex;
    const isAlt = slotIndex % 2 === 1;

    // Draw row background
    ctx.fillStyle = isAlt ? colors.cellAltBg : colors.cellBg;
    ctx.fillRect(tableLeft, y, canvasWidth - padding * 2, rowHeight);

    // Draw time cell
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(tableLeft, y, timeColWidth, rowHeight);

    const timeInfo = TIME_SLOT_MAP[slot.key];
    if (timeInfo) {
      // Draw slot key
      ctx.fillStyle = colors.text;
      ctx.font = `bold ${14 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        slot.key,
        tableLeft + timeColWidth / 2,
        y + rowHeight / 2 - 10 * scale,
      );

      // Draw time range
      ctx.fillStyle = colors.subText;
      ctx.font = `${9 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(
        `${timeInfo.start}~${timeInfo.end}`,
        tableLeft + timeColWidth / 2,
        y + rowHeight / 2 + 8 * scale,
      );
    }

    // Draw day cell borders
    for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
      const x = tableLeft + timeColWidth + dayColWidth * dayIndex;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(x, y, dayColWidth, rowHeight);
    }
  });

  // Build merged course blocks
  const mergedBlocks = buildMergedCourseBlocks(courses);

  // Sort blocks so that later-starting courses are drawn last (on top)
  // This makes overlapping courses more readable since the shorter one (starting later) shows on top
  mergedBlocks.sort((a, b) => {
    // First sort by day
    if (a.day !== b.day) return a.day - b.day;
    // Then sort by start slot - earlier starts draw first (bottom layer)
    return a.startSlotIndex - b.startSlotIndex;
  });

  // Draw merged course blocks
  mergedBlocks.forEach((block) => {
    // Only draw for visible days
    if (block.day >= numDays) return;

    const color = getCourseColor(block.course.department || '其他', isDark);
    const cellPadding = 4 * scale;

    // Calculate block position and size
    const x = tableLeft + timeColWidth + dayColWidth * block.day;
    const startY = tableTop + headerHeight + rowHeight * block.startSlotIndex;
    const numSlotSpan = block.endSlotIndex - block.startSlotIndex + 1;
    const blockHeight = rowHeight * numSlotSpan;

    const blockX = x + cellPadding;
    const blockY = startY + cellPadding;
    const blockWidth = dayColWidth - cellPadding * 2;
    const blockInnerHeight = blockHeight - cellPadding * 2;

    // Draw course block with rounded corners
    ctx.fillStyle = color.bg;
    ctx.beginPath();
    const radius = 8 * scale;
    ctx.moveTo(blockX + radius, blockY);
    ctx.lineTo(blockX + blockWidth - radius, blockY);
    ctx.quadraticCurveTo(
      blockX + blockWidth,
      blockY,
      blockX + blockWidth,
      blockY + radius,
    );
    ctx.lineTo(blockX + blockWidth, blockY + blockInnerHeight - radius);
    ctx.quadraticCurveTo(
      blockX + blockWidth,
      blockY + blockInnerHeight,
      blockX + blockWidth - radius,
      blockY + blockInnerHeight,
    );
    ctx.lineTo(blockX + radius, blockY + blockInnerHeight);
    ctx.quadraticCurveTo(
      blockX,
      blockY + blockInnerHeight,
      blockX,
      blockY + blockInnerHeight - radius,
    );
    ctx.lineTo(blockX, blockY + radius);
    ctx.quadraticCurveTo(blockX, blockY, blockX + radius, blockY);
    ctx.closePath();
    ctx.fill();

    // Draw border
    ctx.strokeStyle = color.border;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Content area
    const contentPadding = 8 * scale;
    const contentWidth = blockWidth - contentPadding * 2;
    const contentX = blockX + contentPadding;
    let contentY = blockY + contentPadding;

    // Draw course name (FULL name, wrapped if needed)
    ctx.fillStyle = color.text;
    ctx.font = `bold ${12 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft JhengHei", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const courseName = block.course.name.split('\n')[0];
    const nameLines = wrapText(ctx, courseName, contentWidth);

    // Show more lines for taller blocks
    const maxNameLines = Math.min(
      nameLines.length,
      Math.floor(numSlotSpan * 1.5) + 1,
    );
    const displayNameLines = nameLines.slice(0, maxNameLines);
    displayNameLines.forEach((line, lineIndex) => {
      ctx.fillText(line, contentX, contentY + lineIndex * 15 * scale);
    });
    contentY += displayNameLines.length * 15 * scale + 6 * scale;

    // Draw teacher name
    if (block.course.teacher && blockInnerHeight > 50 * scale) {
      ctx.fillStyle = isDark ? '#b0b0b0' : '#555555';
      ctx.font = `${10 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const teacherText = `👨‍🏫 ${block.course.teacher}`;
      ctx.fillText(teacherText, contentX, contentY);
      contentY += 14 * scale;
    }

    // Draw classroom
    if (block.roomForThisSlot && blockInnerHeight > 70 * scale) {
      ctx.fillStyle = isDark ? '#b0b0b0' : '#555555';
      ctx.font = `${10 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const roomText = `📍 ${block.roomForThisSlot}`;
      ctx.fillText(roomText, contentX, contentY);
      contentY += 14 * scale;
    }

    // Draw time range for merged blocks
    if (numSlotSpan > 1 && blockInnerHeight > 90 * scale) {
      const startTime =
        TIME_SLOT_MAP[TIME_SLOT_ORDER[block.startSlotIndex]]?.start;
      const endTime = TIME_SLOT_MAP[TIME_SLOT_ORDER[block.endSlotIndex]]?.end;
      if (startTime && endTime) {
        ctx.fillStyle = isDark ? '#888888' : '#888888';
        ctx.font = `${9 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(`🕐 ${startTime} ~ ${endTime}`, contentX, contentY);
      }
    }
  });

  // Draw footer with total courses and credits
  const totalCredits = courses.reduce(
    (sum, c) => sum + parseInt(c.credit || '0', 10),
    0,
  );
  ctx.fillStyle = colors.subText;
  ctx.font = `${11 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    `共 ${courses.length} 門課程，${totalCredits} 學分`,
    canvasWidth - padding,
    canvasHeight - padding / 2,
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      'image/png',
      1.0,
    );
  });
};

/**
 * Download the schedule as a PNG image
 */
export const downloadScheduleImage = async (
  courses: Course[],
  options: ExportOptions = {},
): Promise<void> => {
  const blob = await exportScheduleAsImage(courses, options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `課程表_${new Date().toLocaleDateString('zh-TW').replace(/\//g, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
