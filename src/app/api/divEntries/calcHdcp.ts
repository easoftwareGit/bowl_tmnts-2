import type { divEntryRawType, divEntryRawWithHdcpType } from "@/lib/types/types";
import { validAverage } from "../../../lib/validation/players/validate";
import { validHdcpFor, validHdcpFrom, validHdcpPer, validIntHdcp } from "../../../lib/validation/divs/validate";
import { validGames } from "../../../lib/validation/squads/validate";

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
    // calc hdcp and round to 1 decimal
    // if (intHdcp) {
    //   hdcp = Math.floor(((hdcpFrom - average) * hdcpPer));
    // } else {
      // hdcp = Math.round(((hdcpFrom - average) * hdcpPer) * 10) / 10;
    // }   
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
 * calculate HDCP for each div entry
 *
 * @param {divEntryRawType[]} divEntriesNoHdcp - array div entries without hdcp
 * @returns {divEntryRawWithHdcpType[]} - array of div entries with hdcp
 */
export const divEntriesWithHdcp = (
  divEntriesNoHdcp: divEntryRawType[]
): divEntryRawWithHdcpType[] => {
  return divEntriesNoHdcp.map((divEntry) => ({
    ...divEntry,
    hdcp: calcHandicap(
      divEntry.player.average,
      divEntry.div.hdcp_from,
      divEntry.div.hdcp_per,
      divEntry.div.int_hdcp,
    ),
    // hdcp:
    //   divEntry.player.average < divEntry.div.hdcp_from
    //     ? divEntry.div.int_hdcp
    //       ? Math.floor(
    //           (divEntry.div.hdcp_from - divEntry.player.average) *
    //             divEntry.div.hdcp_per
    //         )
    //       : (divEntry.div.hdcp_from - divEntry.player.average) *
    //         divEntry.div.hdcp_per
    //     : 0,
  }));
};
