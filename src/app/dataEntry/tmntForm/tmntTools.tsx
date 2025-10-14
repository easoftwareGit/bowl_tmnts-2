import { initBrkts, initDivs, initElims, initEvents, initLanes, initPots, initSquads, initTmnt } from "@/lib/db/initVals";
import { dataOneTmntType, tmntFullType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

export const getBlankFullTmnt = (): dataOneTmntType => { 
  const blankFullTmnt: dataOneTmntType = {
    tmnt: {
      ...initTmnt,
      id: btDbUuid('tmt'),
    },
    events: initEvents,
    divs: initDivs,
    squads: initSquads,
    lanes: initLanes,
    pots: initPots,
    brkts: initBrkts,
    elims: initElims,
  };
  for (let i = 0; i < blankFullTmnt.events.length; i++) {    
    blankFullTmnt.events[i].id = btDbUuid('evt');
    blankFullTmnt.events[i].tmnt_id = blankFullTmnt.tmnt.id;
  }
  for (let i = 0; i < blankFullTmnt.divs.length; i++) {    
    blankFullTmnt.divs[i].id = btDbUuid('div');
    blankFullTmnt.divs[i].tmnt_id = blankFullTmnt.tmnt.id;
  }
  for (let i = 0; i < blankFullTmnt.squads.length; i++) {
    blankFullTmnt.squads[i].id = btDbUuid('sqd');
    blankFullTmnt.squads[i].event_id = blankFullTmnt.events[0].id;
  }
  for (let i = 0; i < blankFullTmnt.lanes.length; i++) {
    blankFullTmnt.lanes[i].id = btDbUuid('lan');
    blankFullTmnt.lanes[i].squad_id = blankFullTmnt.squads[0].id;
  }
  
  return blankFullTmnt;
}

export const getBlankTmntFullData = (): tmntFullType => {
  const blankTmntFullData: tmntFullType = {
    tmnt: {...initTmnt, id: btDbUuid('tmt') },
    brktEntries: [],    
    brktSeeds: [],
    brkts: initBrkts,
    divs: initDivs,
    divEntries: [],
    elimEntries: [],
    elims: initElims,
    events: initEvents,
    lanes: initLanes,
    oneBrkts: [],
    players: [],
    potEntries: [],
    pots: initPots,
    squads: initSquads,
  };  
  for (let i = 0; i < blankTmntFullData.events.length; i++) {    
    blankTmntFullData.events[i].id = btDbUuid('evt');
    blankTmntFullData.events[i].tmnt_id = blankTmntFullData.tmnt.id;
  }
  for (let i = 0; i < blankTmntFullData.divs.length; i++) {    
    blankTmntFullData.divs[i].id = btDbUuid('div');
    blankTmntFullData.divs[i].tmnt_id = blankTmntFullData.tmnt.id;
  }
  for (let i = 0; i < blankTmntFullData.squads.length; i++) {
    blankTmntFullData.squads[i].id = btDbUuid('sqd');
    blankTmntFullData.squads[i].event_id = blankTmntFullData.events[0].id;
  }
  for (let i = 0; i < blankTmntFullData.lanes.length; i++) {
    blankTmntFullData.lanes[i].id = btDbUuid('lan');
    blankTmntFullData.lanes[i].squad_id = blankTmntFullData.squads[0].id;
  }
  return blankTmntFullData;
}