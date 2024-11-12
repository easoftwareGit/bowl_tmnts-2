/**
 * calculates first + second + admin 
 * 
 * @param {any} first - bracket first place
 * @param {any} second - bracket second place
 * @param {any} admin - bracket admin
 * @returns {number} - first + second + admin
 */
export const calcFSA = (first: any, second: any, admin: any): number => { 
  if (!first || !second || !admin) return 0
  const fNum = Number(first);
  const sNum = Number(second);
  const aNum = Number(admin);
  if (isNaN(fNum) || isNaN(sNum) || isNaN(aNum)) return 0
  return Math.round((fNum + sNum + aNum) * 100) / 100
}
