/**
 * shuffle an array using Fisher-Yates algorithm
 * 
 * @param {any[]} arr - array to shuffle. WILL BE MUTATED
 * @returns {void} 
 */
export const shuffleArray = <T>(arr: T[]): void => {

  if (!arr || !Array.isArray(arr) || arr.length < 2) return;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index
    // swap
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};