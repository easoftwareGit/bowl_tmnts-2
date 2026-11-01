import { validAverage } from "@/lib/validation/players/validate";
import {
  validHdcpFor, validHdcpFrom, validHdcpPer, validIntHdcp
} from "@/lib/validation/divs/validate";
import { validGames } from "@/lib/validation/squads/validate";
import { eventType, validTypeStrings } from "../types/types";
import { formatValue2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";

/**
 * convert error to string
 * 
 * @param {unknown} err - error object or string
 * @returns {string} - error message 
 */
export const toErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

/**
 * calculate handicap
 *
 * @param {number} average - player average
 * @param {number} hdcpFrom - handicap calcualted from averages below this number
 * @param {number} hdcpPer - handicap percentage
 * @param {boolean} intHdcp - integer handicap true/false
 * @param {string} hdcpFor - "series", else handicap per game - default "Game"
 * @param {number} games - number of games in series - default 1
 * @returns - calculated handicap
 */
export const calcHandicap = (
  average: number,
  hdcpFrom: number,
  hdcpPer: number,
  intHdcp: boolean,
  hdcpFor: string = "Game",
  games: number = 1
): number => {
  if (!validAverage(average)
    || !validHdcpFrom(hdcpFrom)
    || !validHdcpPer(hdcpPer)
    || !validIntHdcp(intHdcp)
    || !validHdcpFor(hdcpFor)
    || !validGames(games)
  ) return 0;
  let hdcp = 0;
  if (hdcpPer > 0 && average < hdcpFrom) {
    hdcp = (hdcpFrom - average) * hdcpPer
    if (hdcpFor.toLocaleLowerCase() === "series" && games > 1) {
      hdcp = hdcp * games;
    }
  }
  if (intHdcp) {    
    hdcp = Math.floor(hdcp);            // round down
  } else { 
    hdcp = Math.round(hdcp * 10) / 10;  // round to 1 decimal
  }
  return hdcp;
};

/**
 * Calculates LPOX
 *
 * @param {eventType} event - event with lineage, prize_fund, other, and expenses
 * @returns {string} - lpox linage + prize_fund + other + expenses, "" on error
 */
export const calcLpox = (event: eventType): string => {
  if (
    !event ||
    event.lineage == null ||
    event.prize_fund == null ||
    event.other == null ||
    event.expenses == null 
  )
    return "";
    
  try {
    const lpoxNum =
      Number(event.lineage || 0) +
      Number(event.prize_fund || 0) +
      Number(event.other || 0) +
      Number(event.expenses || 0);
    const lpoxStr = lpoxNum.toString();
    if (lpoxStr === "NaN") {
      return "";
    }
    return formatValue2Dec(lpoxNum.toString(), localConfig);
  } catch (err) {
    return "";
  }
};

/**
 * Checks if LPOX is valid
 * 
 * @param {eventType} event - event 
 * @returns {string} - "is-valid" or "is-invalid", "" on error 
 */
export const calcLpoxValid = (event: eventType): validTypeStrings => {
  if (!event || event.entry_fee == null || event.lpox == null) return "";
  try { 
    return Number(event.entry_fee) === Number(event.lpox)
      ? "is-valid"
      : "is-invalid";
  } catch (err) {
    return "";
  }  
};