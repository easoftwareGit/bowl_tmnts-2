export const convertToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  return String(value);
};