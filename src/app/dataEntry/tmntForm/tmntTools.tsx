import {
  initBrkts,
  initDiv,  
  initElims,
  initEvent,
  initPots,
  initSquad,
  initTmnt,
} from "@/lib/db/initVals";
import { getJustStage } from "@/lib/db/stages/dbStages";
import { tmntFullType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";
import { SquadStage } from "@prisma/client";

/**
 * 
 * @returns - a tmntFullType object with all arrays empty, all values blank
 */
export const getBlankTmntFullData = (): tmntFullType => {
  const blankTmntFullData: tmntFullType = {
    tmnt: { ...initTmnt, id: btDbUuid("tmt") },
    brktEntries: [],
    brktSeeds: [],
    brkts: initBrkts,
    divs: [{ ...initDiv, id: btDbUuid("div") }],
    divEntries: [],
    elimEntries: [],
    elims: initElims,
    events: [{ ...initEvent, id: btDbUuid("evt") }],
    lanes: [
      {  
        id: btDbUuid('lan'),    
        lane_number: 1,
        squad_id: "",
        in_use: true,
      },
      {
        id: btDbUuid('lan'),
        lane_number: 2,
        squad_id: "",
        in_use: true,
      }
    ],
    oneBrkts: [],
    players: [],
    potEntries: [],
    pots: initPots,
    squads: [{ ...initSquad, id: btDbUuid("sqd") }],    
  };
  for (let i = 0; i < blankTmntFullData.events.length; i++) {
    blankTmntFullData.events[i].id = btDbUuid("evt");
    blankTmntFullData.events[i].tmnt_id = blankTmntFullData.tmnt.id;
  }
  for (let i = 0; i < blankTmntFullData.divs.length; i++) {
    blankTmntFullData.divs[i].id = btDbUuid("div");
    blankTmntFullData.divs[i].tmnt_id = blankTmntFullData.tmnt.id;
  }
  for (let i = 0; i < blankTmntFullData.squads.length; i++) {
    blankTmntFullData.squads[i].id = btDbUuid("sqd");
    blankTmntFullData.squads[i].event_id = blankTmntFullData.events[0].id;
  }
  for (let i = 0; i < blankTmntFullData.lanes.length; i++) {
    blankTmntFullData.lanes[i].id = btDbUuid("lan");
    blankTmntFullData.lanes[i].squad_id = blankTmntFullData.squads[0].id;
  }
  return blankTmntFullData;
};

/**
 * gets the stage for a squad
 * 
 * @param {string} squadId - squad id for stage
 * @returns {SquadStage} - stage for squad 
 */
export const getSquadStage = async (squadId: string): Promise<SquadStage> => {
  const justStage = await getJustStage(squadId);
  if (!justStage) return SquadStage.ERROR;
  return justStage.stage as SquadStage;
}