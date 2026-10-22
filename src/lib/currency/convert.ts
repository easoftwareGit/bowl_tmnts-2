/**
 * converts a money string to a number
 * 
 * @param {unknown} moneyStr - money to check
 * @returns {number | null} - the money number if can convert, else null
 */
export const moneyNumber = (moneyStr: unknown): number | null => {  
  if (moneyStr == null) return null;
  let mStr: string = "";
  if (typeof moneyStr === "string") {
    mStr = moneyStr;
  }
  else {
    if (typeof moneyStr === "number" && Number.isFinite(moneyStr)) {
      mStr = (moneyStr as number).toString();
    } else {
      return null;
    }    
  }    
  // test comma locations (decimal point ok, leading '-' and/or '$' ok)
  const regexWithCommas = /^-?\$?(\d{1,3})(,\d{3})*(\.\d+)?$/;
  const regexWithoutCommas = /^-?\$?\d+(\.\d+)?$/;
  if (!(regexWithCommas.test(mStr) || regexWithoutCommas.test(mStr))) return null;

  // remove commas
  mStr = mStr.replace(/,/g, "");
  // remove $ (if got here, passed location of $ tests above)
  mStr = mStr.replace('$', "");  
  if (!mStr) return null;
  try {
    const numVal = Number(mStr)
    if (isNaN(numVal)) {
      return null
    }
    return numVal
  } catch (error) {
    return null
  }  
}

/**
 * truncates a value to two decimal places
 * 
 * @param {number} value - value to round
 * @returns {number} - rounded value to two decimal places, or zero  
 */
export const truncateToTwoDecimals = (value: number): number => {  
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  /*
  * toFixed(6) removes floating-point error before truncating
  * (0.29 * 100 = 28.999999999999996 would otherwise become 0.28).
  */
  return Math.trunc(Number((value * 100).toFixed(6))) / 100;
}