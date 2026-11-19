import {
  blankDiv,
  blankEvent,
  blankFullStage,
  blankSquad,
  blankTmnt,
  initDiv,
  initEvent,
  initSquad,
  initTmnt,
} from "@/lib/db/initVals";
import { getJustStage } from "@/lib/db/stages/dbStages";
import type { tmntFullType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";
import { SquadStage } from "@prisma/client";

/**
 * Returns a tmntFullType object with all arrays empty, all values blank except id's
 *
 * @param {boolean} initialize - true: initialize with id's, sets today's date, links id's
 * @returns {tmntFullType} - tmntFullType object with all arrays empty (except lanes), all values blank
 */
export const getBlankTmntFullData = (
  initialize: boolean = true,
): tmntFullType => {
  if (!initialize) {
    const allBlankTmntFullData: tmntFullType = {
      tmnt: { ...blankTmnt },
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [{ ...blankDiv }],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [{ ...blankEvent }],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [{ ...blankSquad }],
      stage: { ...blankFullStage },
      moneys: [],
    };
    return allBlankTmntFullData;
  }
  const tmntId = btDbUuid("tmt");
  const divId = btDbUuid("div");
  const eventId = btDbUuid("evt");
  const squadId = btDbUuid("sqd");
  const stageId = btDbUuid("stg");
  const blankTmntFullData: tmntFullType = {
    tmnt: { ...initTmnt, id: tmntId },
    brktEntries: [],
    brktSeeds: [],
    brkts: [],
    divs: [
      {
        ...initDiv,
        id: divId,
        tmnt_id: tmntId,
      },
    ],
    divEntries: [],
    elimEntries: [],
    elims: [],
    events: [
      {
        ...initEvent,
        id: eventId,
        tmnt_id: tmntId,
      },
    ],
    lanes: [
      {
        id: btDbUuid("lan"),
        lane_number: 1,
        squad_id: squadId,
        in_use: true,
      },
      {
        id: btDbUuid("lan"),
        lane_number: 2,
        squad_id: squadId,
        in_use: true,
      },
    ],
    oneBrkts: [],
    players: [],
    potEntries: [],
    pots: [],
    squads: [
      {
        ...initSquad,
        id: squadId,
        event_id: eventId,
      },
    ],
    stage: {
      ...blankFullStage,
      id: stageId,
      squad_id: squadId,
    },
    moneys: [],
  };
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
};
