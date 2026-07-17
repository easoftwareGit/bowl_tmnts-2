import { moneyNumber } from "./convert";
import { maxMoney } from "../validation/constants";

/**
 * checks if money string is valid
 * 
 * @param {unknown} moneyStr - money to check
 * @param {number} min - minimum amount
 * @param {number} max - maximum amount
 * @returns {boolean} - true if amount is valid
 */
export const validMoney = (moneyStr: unknown, min: number, max: number): boolean => {  
  try {
    const mNum = moneyNumber(moneyStr)
    if (mNum == null) return false
    return mNum >= min && mNum <= max
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
  }
  if (!mStr) return false;
  return validMoney(mStr, min, max);
};
