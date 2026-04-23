/**
 * Course `name` fields from the NSYSU API are shaped as `"中文名稱\nEnglish Name"`.
 * Pick the part that matches the active language, falling back to the Chinese
 * half when no English translation is provided.
 */
export const getLocalizedCourseName = (
  name: string,
  language: string,
): string => {
  const [zh, en] = name.split('\n');
  if (language.toLowerCase().startsWith('en') && en && en.trim() !== '') {
    return toReadableEnglishCourseName(en);
  }
  return zh;
};

/**
 * The source data often has the English course name in ALL CAPS, which is
 * harder to read. When the string contains no lowercase letter, convert to
 * Title Case (first letter of each word capitalized). Strings that already
 * have any lowercase letter are assumed to be intentionally cased and are
 * returned untouched.
 */
export const toReadableEnglishCourseName = (en: string): string => {
  if (/[a-z]/.test(en)) return en;
  return en
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
};
