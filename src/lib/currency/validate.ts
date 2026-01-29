import { maxMoney } from "../validation/validation";

/**
 * checks if money string is valid
 * 
 * @param moneyStr {unknown} - money to check
 * @param min {number} - minimum amount
 * @param max {number} - maximum amount
 * @returns boolean - true if amount is valid
 */
export const validMoney = (moneyStr: unknown, min: number, max: number): boolean => {  
  if (moneyStr == null) return false;
  let mStr: string = "";
  if (typeof moneyStr === "string") {
    mStr = moneyStr;
  }
  else {
    if (typeof moneyStr === "number" && Number.isFinite(moneyStr)) {
      mStr = (moneyStr as number).toString();
    } else {
      return false;
    }    
  }    
  // test comma locations (decimal point ok, leading '-' and/or '$' ok)
  const regexWithCommas = /^-?\$?(\d{1,3})(,\d{3})*(\.\d+)?$/;
  const regexWithoutCommas = /^-?\$?\d+(\.\d+)?$/;
  if (!(regexWithCommas.test(mStr) || regexWithoutCommas.test(mStr))) return false;

  // remove commas
  mStr = mStr.replace(/,/g, "");
  // remove $ (ig got here, passed location of $ tests above)
  mStr = mStr.replace('$', "");  
  if (!mStr) return false;
  try {
    const numVal = Number(mStr)
    if (isNaN(numVal) || numVal < min || numVal > max) {
      return false
    }
    return true
  } catch (error) {
    return false
  }  
}

/**
 * checks if the string is a valid btdb money min: 0, max: 999999
 * 
 * @param {string} moneyStr - money string to check
 * @param {number} min - minimum amount
 * @param {number} max - maximum amount
 * @returns {boolean} - true if money string is valid
 */
export const validBtdbMoney = (moneyStr: unknown , min: number = 0, max: number = maxMoney): boolean => {
  if (moneyStr == null) return false;  
  let mStr: string = "";
  if (typeof moneyStr === "string") {
    mStr = moneyStr;
  }
  else {
    if (typeof moneyStr === "number" && Number.isFinite(moneyStr)) {
      mStr = (moneyStr as number).toString();
    } else {
      return false;
    }
  }
  // maxMoney is 999999, so max valid string is $999,999.00 or 11 chars 
  if (mStr.length > 11) return false;
  // a blank value for money is OK
  // all 0's is ok
  if (mStr === "" || mStr.replace(/^0+/, '') === "") {
    mStr = "0";
    // return true;
  }
  if (!mStr) return false;
  return validMoney(mStr, min, max);
};
