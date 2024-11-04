import { maxMoney } from "../validation";

/**
 * checks if money string is valid
 * 
 * @param moneyStr - money to check
 * @param min - minimum amount
 * @param max - maximum amount
 * @returns boolean - true if amount is valid
 */
export const validMoney = (moneyStr: string, min: number, max: number): boolean => {  
  if (moneyStr === null || moneyStr === undefined) return false;
  if (typeof moneyStr !== "string") {
    if (typeof moneyStr === "number") {
      moneyStr = (moneyStr as number).toString();
    } else {
      return false;
    }
  }  
  // test comma locations (decimal point ok, leading '-' and/or '$' ok)
  const regexWithCommas = /^-?\$?(\d{1,3})(,\d{3})*(\.\d+)?$/;
  const regexWithoutCommas = /^-?\$?\d+(\.\d+)?$/;
  if (!(regexWithCommas.test(moneyStr) || regexWithoutCommas.test(moneyStr))) return false;

  // remove commas
  moneyStr = moneyStr.replace(/,/g, "");
  // remove $ (ig got here, passed location of $ tests above)
  moneyStr = moneyStr.replace('$', "");  
  if (!moneyStr) return false;
  try {
    const numVal = Number(moneyStr)
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
export const validBtdbMoney = (moneyStr: string, min: number = 0, max: number = maxMoney): boolean => {
  if (moneyStr === null
    || moneyStr === undefined
    || typeof moneyStr !== "string") return false;
  // maxMoney is 999999, so max valid string is $999,999.00 or 11 chars 
  if (moneyStr.length > 11) return false;
  // a blank value for money is OK
  // all 0's is ok
  if (moneyStr === "" || moneyStr.replace(/^0+/, '') === "") {
    moneyStr = "0";
    // return true;
  }
  if (!moneyStr) return false;
  return validMoney(moneyStr, min, max);
};
