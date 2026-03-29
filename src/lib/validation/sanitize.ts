import { maxUrlLength } from "./constants";

const nameRegex = /[^\p{L}\p{M}\p{Zs}'\-]/gu;

/**
 * sanitize name fields (first name, last name)
 * 
 * @param {unknown} str - string to sanitize
 * @returns {string} sanitized string 
 */
export function sanitizeName(str: unknown): string {
  if (typeof str !== "string") return "";

  return str
    .replace(nameRegex, "")
    .trim();
}

const cityRegex = /[^\p{L}\p{M}\p{Zs}.\-]/gu;

/**
 * sanitize city
 * 
 * @param {unknown} str - string to sanitize
 * @returns {string} sanitized string 
 */
export function sanitizeCity(str: unknown): string {
  if (typeof str !== "string") return "";

  return str
    .replace(cityRegex, "")
    .trim();
}

const tournamentRegex = /[^\p{L}\p{M}\p{N}\p{Zs}'.,&()\-]/gu;

/**
 * sanitize tournament name
 * 
 * @param {unknown} str - string to sanitize
 * @returns {string} sanitized string 
 */
export function sanitizeTournamentName(str: unknown): string {
  if (typeof str !== "string") return "";

  return str
    .replace(tournamentRegex, "")
    .trim();
}

const notesRegex = /[^\p{L}\p{M}\p{N}\p{P}\p{Sm}\p{Zs}\n\r]/gu;

/**
 * sanitize notes
 *
 * @param {unknown} str - string to sanitize
 * @returns {string} sanitized string
 */
export function sanitizeNotes(str: unknown): string {
  if (typeof str !== "string") return "";

  return str
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/<\/?[^>]+>/g, "")
    .replace(notesRegex, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/ *\r */g, "\r")
    .replace(/ *\n */g, "\n")
    .trim();
}

// allow letters, marks, numbers, and spaces
const edsRegex = /[^\p{L}\p{M}\p{N}\p{Zs}'\-]/gu;

/**
 * sanitize names for Events, Divisions, Squads (EDS)
 * 
 * @param {unknown} str - string to sanitize
 * @returns {string} sanitized string 
 */
export function sanitizeEDS(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(edsRegex, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeUrl(url: unknown): string {
  try {
    if (!url || typeof url !== "string") {
      // throw new Error("Invalid URL");
      return '';
    }
    // maxUrlLength is 2048
    if (url.length > maxUrlLength) {
      // throw new Error("URL exceeds maximum length");
      return '';
    }
    let parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      // throw new Error("Invalid protocol");
      return '';
    }
    let sanitizedUrl = parsedUrl.protocol + "//" + parsedUrl.hostname;
    if (parsedUrl.port) {
      sanitizedUrl += ":" + parsedUrl.port;
    }
    sanitizedUrl += parsedUrl.pathname;
    if (parsedUrl.search) {
      sanitizedUrl += parsedUrl.search;
    }
    if (parsedUrl.hash) {
      sanitizedUrl += parsedUrl.hash;
    }
    if (sanitizedUrl.endsWith("/")) {
      sanitizedUrl = sanitizedUrl.slice(0, -1);
    }
    return sanitizedUrl;
  } catch (error) {    
    return "";
  }
}

/**
 * checks if string is all '0's
 *
 * @param {string} str - string to check
 * @return {*}  {boolean} - true: str is all '0's
 */
export function isAllZeros(str: string): boolean {
  if (!str) return false;
  // Use a regular expression to test if the string is all '0's
  return /^0+$/.test(str);
}

/**
 * sanitizes currency string to remove commas, leading '$' and leading zeros
 * a string with non-numeric characters will return an empty string
 * 
 * @param {string} currency - currency to sanitize
 * @returns - sanitized currency
 */
export function sanitizeCurrency(currency: string): string {
  if (!currency) return "";
  if (typeof currency !== "string") {
    if (typeof currency === "number") {
      currency = (currency as number).toString();
    } else {
      return "";
    }
  }
  // remove commas
  currency = currency.replace(/,/g, "");
  // remove leading '$"
  currency = currency.replace(/^\$/, "");  
  if (isAllZeros(currency)) {
    return "0";    
  }
  // remove leading '0's  
  currency = currency.replace(/^0+/, "");  
  
  // Regular expression to match a number with 0, 1, or 2 digits after an optional decimal point
  const regex = /^\d+(\.\d{1,2})?$/;

  // If the currency matches the regex, it is already valid
  if (regex.test(currency) &&
      !(currency.endsWith(".00") || currency.endsWith(".0"))) {
    return currency;
  }

  // Further validation to ensure no invalid characters are present
  if (!/^[-\d.]+$/.test(currency) || (currency.match(/\./g) || []).length > 1 || (currency.match(/-/g) || []).length > 1 || (currency.indexOf('-') > 0)) {
    return "";
  }

  // Try to parse the currency as a float
  const parsedNumber = parseFloat(currency);

  // If the parsed number is NaN, return an empty string 
  if (isNaN(parsedNumber)) {
    return "";
  }

  // Convert the number to string
  let numberStr = parsedNumber.toString();

  // Check for decimal point
  const decimalIndex = numberStr.indexOf(".");
  if (decimalIndex !== -1) {
    // If there are more than 2 digits after the decimal point, trim the excess
    if (numberStr.length - decimalIndex - 1 > 2) {
      numberStr = numberStr.substring(0, decimalIndex + 3);
    }
  }

  if (numberStr.endsWith(".00") || numberStr.endsWith(".0")) {
    numberStr = numberStr.substring(0, decimalIndex);
  }

  return numberStr;
}