import { divEntryRawType, divEntryRawWithHdcpType } from "@/lib/types/types";

/**
 * calculate HDCP for each div entry
 * 
 * @param {divEntryRawType[]} divEntriesNoHdcp - array div entries without hdcp
 * @returns {divEntryRawWithHdcpType[]} - array of div entries with hdcp
 */
export const divEntriesWithHdcp = (divEntriesNoHdcp: divEntryRawType[]): divEntryRawWithHdcpType[] => {
  return divEntriesNoHdcp.map(divEntry => ({
    ...divEntry,
    hdcp: divEntry.player.average < divEntry.div.hdcp_from
      ? (divEntry.div.int_hdcp 
        ? Math.floor((divEntry.div.hdcp_from - divEntry.player.average) * divEntry.div.hdcp_per) 
        : ((divEntry.div.hdcp_from - divEntry.player.average) * divEntry.div.hdcp_per))
      : 0,    
  }));
}