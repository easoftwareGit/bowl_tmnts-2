import { startOfDayFromString } from "@/lib/dateTools"
import { brktDataType, brktEntryDataType, divDataType, divEntryDataType, elimDataType, elimEntryDataType, eventDataType, playerDataType, potDataType, potEntryDataType, squadDataType, tmntDataType, tmntFullDataForPrismaType, tmntFullType, tmntType } from "@/lib/types/types"
import { eventDataForPrisma } from "../events/dataForPrisma";
import { divDataForPrisma } from "../divs/dataForPrisma";
import { squadDataForPrisma } from "../squads/dataForPrisma";
import { potDataForPrisma } from "../pots/dataForPrisma";
import { brktDataForPrisma } from "../brkts/dataForPrisma";
import { elimDataForPrisma } from "../elims/dataForPrisma";
import { playerDataForPrisma } from "../players/dataForPrisma";
import { divEntryDataForPrisma } from "../divEntries/dataForPrisma";
import { potEntryDataForPrisma } from "../potEntries/dataForPrisma";
import { brktEntryDataForPrisma } from "../brktEntries/dataForPrisma";
import { elimEntryDataForPrisma } from "../elimEntries/dataForPrisma";

/**
 * Converts tournament data for prisma 
 * 
 * @param {tmntType} tmnt - tournament data to convert
 * @returns {tmntDataType | null} - tournament data for prisma or null
 */
export const tmntDataForPrisma = (tmnt: tmntType): tmntDataType | null => {

  if (tmnt == null) return null
  try {
    const startDate = startOfDayFromString(tmnt.start_date_str) as Date
    const endDate = startOfDayFromString(tmnt.end_date_str) as Date
    if (!startDate || !endDate) return null
    return {
      id: tmnt.id,
      tmnt_name: tmnt.tmnt_name,
      start_date: startDate,
      end_date: endDate,
      user_id: tmnt.user_id,
      bowl_id: tmnt.bowl_id
    }    
  } catch (error) {
    return null
  }
};

/**
 * Converts full tournament data for prisma
 * 
 * @param {tmntFullType} tmntFullData - full tmnt data to convert
 * @returns {tmntFullDataForPrismaType | null} - full tmnt data for prisma or null
 */
export const tmntFullDataForPrisma = (tmntFullData: tmntFullType): tmntFullDataForPrismaType | null => {
  if (tmntFullData == null || typeof tmntFullData !== "object") return null
  try {
    const tmntData = tmntDataForPrisma(tmntFullData.tmnt);
    if (!tmntData) return null
    const eventsData: eventDataType[] = tmntFullData.events
      .map(event => eventDataForPrisma(event))
      .filter((data): data is eventDataType => data !== null);
    const divsData: divDataType[] = tmntFullData.divs
      .map(div => divDataForPrisma(div))
      .filter((data): data is divDataType => data !== null);
    const squadsData: squadDataType[] = tmntFullData.squads
      .map(squad => squadDataForPrisma(squad))
      .filter((data): data is squadDataType => data !== null);      
    // tmntFullData.lanes does not need to be converted
    const potsData: potDataType[] = tmntFullData.pots
      .map(pot => potDataForPrisma(pot))
      .filter((data): data is potDataType => data !== null);   
    const brktsData: brktDataType[] = tmntFullData.brkts
      .map(brkt => brktDataForPrisma(brkt))
      .filter((data): data is brktDataType => data !== null);
    const elimsData: elimDataType[] = tmntFullData.elims
      .map(elim => elimDataForPrisma(elim))
      .filter((data): data is elimDataType => data !== null);
    const playersData: playerDataType[] = tmntFullData.players
      .map(player => playerDataForPrisma(player))
      .filter((data): data is playerDataType => data !== null);
    const divEntriesData: divEntryDataType[] = tmntFullData.divEntries
      .map(divEntry => divEntryDataForPrisma(divEntry))
      .filter((data): data is divEntryDataType => data !== null);
    const potEntriesData: potEntryDataType[] = tmntFullData.potEntries
      .map(potEntry => potEntryDataForPrisma(potEntry))
      .filter((data): data is potEntryDataType => data !== null);
    const brktEntriesData: brktEntryDataType[] = tmntFullData.brktEntries
      .map(brktEntry => brktEntryDataForPrisma(brktEntry))
      .filter((data): data is brktEntryDataType => data !== null);
    // tmntFullData.oneBrkts does not need to be converted
    // tmntFullData.brktSeeds does not need to be converted
    const elimEntriesData: elimEntryDataType[] = tmntFullData.elimEntries
      .map(elimEntry => elimEntryDataForPrisma(elimEntry))
      .filter((data): data is elimEntryDataType => data !== null);

    const forPrisma: tmntFullDataForPrismaType = {
      tmntData,
      eventsData,
      divsData,
      squadsData,
      lanesData: tmntFullData.lanes,      
      divEntriesData,
      brktEntriesData,
      brktSeedsData: tmntFullData.brktSeeds,
      brktsData,
      oneBrktsData: tmntFullData.oneBrkts,
      potEntriesData,
      potsData,
      playersData,
      elimEntriesData,
      elimsData,
    }
    return forPrisma
  } catch (error) {
    return null
  }
};