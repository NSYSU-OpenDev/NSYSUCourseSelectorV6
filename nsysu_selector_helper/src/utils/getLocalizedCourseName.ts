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
    return en;
  }
  return zh;
};
