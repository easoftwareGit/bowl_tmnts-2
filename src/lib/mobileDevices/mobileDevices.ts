export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false; // assume desktop on server
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}