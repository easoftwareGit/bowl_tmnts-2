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
