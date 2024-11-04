import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../testApi";
import { tmntSaveSquads, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";
import { mockSquadsToPost, mockSquadsToEdit, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { squadType } from "@/lib/types/types";
import { deleteAllTmntSquads, deleteSquad, postManySquads, postSquad, putSquad } from "@/lib/db/squads/squadsAxios";
import { blankSquad } from "@/lib/db/initVals";
import { compareAsc } from "date-fns";
import 'core-js/actual/structured-clone';

const { tmntPostPutOrDelSquads } = exportedForTesting;

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.

describe('saveTmntDivs test', () => {
  const url = testBaseSquadsApi.startsWith("undefined")
    ? baseSquadsApi
    : testBaseSquadsApi;

  const deleteTestSquads = async () => {
    await deleteAllTmntSquads(tmntToDelId);
  };

  describe('tmntPostPutOrDelSquads(): edited div(s)', () => {   
    const clonedSquad = structuredClone(mockSquadsToEdit[0]);
    const toAddSquad = {
      ...clonedSquad,
      id: 'sqd_3397da1adc014cf58c44e07c19914f04', // added one to last diget
      squad_name: "Squad 4",      
      squad_time: '11:00 PM',
      sort_order: 4,
    }

    // 1 deleted - Squad 3, sort order 3, index[2]
    // 1 edited - Squad 2. sort order 2, index[1]
    // 1 left along - Squad 1, sort order 1 - index[0]
    // 1 created - Suqad 4 sort order 4

    const doResetSquad = async () => {
      await putSquad(mockSquadsToEdit[1]);
    }
    const rePostSquad = async () => {
      const response = await axios.get(url);
      const squads = response.data.squads;
      const found = squads.find(
        (s: squadType) => s.id === mockSquadsToEdit[2].id
      );
      if (!found) {
        await postSquad(mockSquadsToEdit[2]);
      }      
    }
    const removeSquad = async () => {
      await deleteSquad(toAddSquad.id);
    }

    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      await postManySquads(mockSquadsToEdit)
    })

    beforeEach(async () => {
      await doResetSquad();
      await rePostSquad();
      await removeSquad();
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await removeSquad();
      }
      if (didPut) {
        await doResetSquad();
      }
      if (didDel) {
        await rePostSquad();
      }
    });

    afterAll(async () => {
      await deleteTestSquads();
    })

    it('should save edited squads, one squad edited', async () => {
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit[1].squad_name = "Edited Squad";
      squadsToEdit[1].games = 5;
      squadsToEdit[1].lane_count = 16;
      const savedSquads = await tmntPostPutOrDelSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      expect(savedSquads).toHaveLength(3);
      didPut = true;
      const found = savedSquads.find((s) => s.id === squadsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(squadsToEdit[1].id);
      expect(found.squad_name).toBe(squadsToEdit[1].squad_name);
      expect(found.games).toBe(squadsToEdit[1].games);      
      expect(found.lane_count).toBe(squadsToEdit[1].lane_count);
    })
    it('should save edited squads, one squad added', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit.push(toAddSquad);
      const savedSquads = await tmntPostPutOrDelSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedSquads).toHaveLength(4);
      const found = savedSquads.find((s) => s.id === toAddSquad.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(toAddSquad.id);
      expect(found.squad_name).toBe(toAddSquad.squad_name);
      expect(found.games).toBe(toAddSquad.games);      
      expect(found.lane_count).toBe(toAddSquad.lane_count);
      expect(compareAsc(found.squad_date, toAddSquad.squad_date)).toBe(0);
      expect(found.squad_time).toBe(toAddSquad.squad_time);
      expect(found.sort_order).toBe(toAddSquad.sort_order);
    })
    it('should save edited squads, one squad deleted', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit.pop();      
      const savedSquads = await tmntPostPutOrDelSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedSquads).toHaveLength(2);
      const found = savedSquads.find((s) => s.id === mockSquadsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })   
    it('should save edited squads, one squad edited, one added, one deleted', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      // delete squad 3
      squadsToEdit.pop();
      // edit squad 2
      squadsToEdit[1].squad_name = "Edited Div";
      squadsToEdit[1].games = 7;
      squadsToEdit[1].lane_count = 16;
      // add squad 4
      squadsToEdit.push(toAddSquad);
      const savedDivs = await tmntPostPutOrDelSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      expect(savedDivs).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      const found = savedDivs.find((s) => s.id === squadsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(squadsToEdit[1].id);
      expect(found.squad_name).toBe(squadsToEdit[1].squad_name);
      expect(found.games).toBe(squadsToEdit[1].games);      
      expect(found.lane_count).toBe(squadsToEdit[1].lane_count);
    })
  })

  describe('tmntSaveSquads(): new squads(s)', () => { 
    let didCreate = false;

    beforeEach(async () => {
      await deleteTestSquads();
    });

    beforeEach(() => {
      didCreate = false;
    });

    afterEach(async () => {
      if (didCreate) {
        await deleteTestSquads();
      }
    });

    const origClone = structuredClone(blankSquad);
    const origSquads: squadType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new squad when only one squad to save', async () => { 
      const newSquadClone = structuredClone(mockSquadsToPost[0]);
      const newSquads = [
        {
          ...newSquadClone
        }        
      ]
      const result = await tmntSaveSquads(origSquads, newSquads);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedSquad = result[0];
      expect(postedSquad.id).toBe(newSquads[0].id);
      expect(postedSquad.event_id).toBe(newSquads[0].event_id);
      expect(postedSquad.squad_name).toBe(newSquads[0].squad_name);
      expect(compareAsc(postedSquad.squad_date, newSquads[0].squad_date)).toBe(0);
      expect(postedSquad.squad_time).toBe(newSquads[0].squad_time);      
      expect(postedSquad.games).toBe(newSquads[0].games);
      expect(postedSquad.lane_count).toBe(newSquads[0].lane_count);
      expect(postedSquad.starting_lane).toBe(newSquads[0].starting_lane);
      expect(postedSquad.sort_order).toBe(newSquads[0].sort_order);
    })
    it('should create multiple new squads when multiple squads to save', async () => {
      const newSquads = structuredClone(mockSquadsToPost);
      const result = await tmntSaveSquads(origSquads, newSquads);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(mockSquadsToPost.length);
      const postedSquads = result as squadType[];
      let postedSquad
      if (postedSquads[0].id === newSquads[0].id) {
        postedSquad = postedSquads[0]
      } else {
        postedSquad = postedSquads[1]
      }
      expect(postedSquad.id).toBe(newSquads[0].id);
      expect(postedSquad.event_id).toBe(newSquads[0].event_id);
      expect(postedSquad.squad_name).toBe(newSquads[0].squad_name);
      expect(compareAsc(postedSquad.squad_date, newSquads[0].squad_date)).toBe(0);
      expect(postedSquad.squad_time).toBe(newSquads[0].squad_time);      
      expect(postedSquad.games).toBe(newSquads[0].games);
      expect(postedSquad.lane_count).toBe(newSquads[0].lane_count);
      expect(postedSquad.starting_lane).toBe(newSquads[0].starting_lane);
      expect(postedSquad.sort_order).toBe(newSquads[0].sort_order);
      if (postedSquads[1].id === newSquads[1].id) {
        postedSquad = postedSquads[1]
      } else {
        postedSquad = postedSquads[0]
      }
      expect(postedSquad.id).toBe(newSquads[1].id);
      expect(postedSquad.event_id).toBe(newSquads[1].event_id);
      expect(postedSquad.squad_name).toBe(newSquads[1].squad_name);
      expect(compareAsc(postedSquad.squad_date, newSquads[1].squad_date)).toBe(0);
      expect(postedSquad.squad_time).toBe(newSquads[1].squad_time);      
      expect(postedSquad.games).toBe(newSquads[1].games);
      expect(postedSquad.lane_count).toBe(newSquads[1].lane_count);
      expect(postedSquad.starting_lane).toBe(newSquads[1].starting_lane);
      expect(postedSquad.sort_order).toBe(newSquads[1].sort_order);
    })

  })

  describe('tmntSaveSquads(): update squads(s)', () => { 
    const clonedSquad = structuredClone(mockSquadsToEdit[0]);
    const toAddSquad = {
      ...clonedSquad,
      id: 'sqd_3397da1adc014cf58c44e07c19914f04', // added one to last diget
      squad_name: "Squad 4",      
      squad_time: '11:00 PM',
      sort_order: 4,
    }

    // 1 deleted - Squad 3, sort order 3, index[2]
    // 1 edited - Squad 2. sort order 2, index[1]
    // 1 left along - Squad 1, sort order 1 - index[0]
    // 1 created - Suqad 4 sort order 4

    const doResetSquad = async () => {
      await putSquad(mockSquadsToEdit[1]);
    }
    const rePostSquad = async () => {
      const response = await axios.get(url);
      const squads = response.data.squads;
      const found = squads.find(
        (s: squadType) => s.id === mockSquadsToEdit[2].id
      );
      if (!found) {
        await postSquad(mockSquadsToEdit[2]);
      }      
    }
    const removeSquad = async () => {
      await deleteSquad(toAddSquad.id);
    }

    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      await postManySquads(mockSquadsToEdit)
    })

    beforeEach(async () => {
      await doResetSquad();
      await rePostSquad();
      await removeSquad();
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await removeSquad();
      }
      if (didPut) {
        await doResetSquad();
      }
      if (didDel) {
        await rePostSquad();
      }
    });

    afterAll(async () => {
      await deleteTestSquads();
    })

    it('should saved edited squads, one squad edited', async () => {
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit[1].squad_name = "Edited Squad";
      squadsToEdit[1].games = 5;
      squadsToEdit[1].lane_count = 16;
      const savedSquads = await tmntSaveSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      expect(savedSquads).toHaveLength(3);
      didPut = true;
      const found = savedSquads.find((s) => s.id === squadsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(squadsToEdit[1].id);
      expect(found.squad_name).toBe(squadsToEdit[1].squad_name);
      expect(found.games).toBe(squadsToEdit[1].games);      
      expect(found.lane_count).toBe(squadsToEdit[1].lane_count);
    })
    it('should save edited squads, one squad added', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit.push(toAddSquad);
      const savedSquads = await tmntSaveSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedSquads).toHaveLength(4);
      const found = savedSquads.find((s) => s.id === toAddSquad.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(toAddSquad.id);
      expect(found.squad_name).toBe(toAddSquad.squad_name);
      expect(found.games).toBe(toAddSquad.games);      
      expect(found.lane_count).toBe(toAddSquad.lane_count);
      expect(compareAsc(found.squad_date, toAddSquad.squad_date)).toBe(0);
      expect(found.squad_time).toBe(toAddSquad.squad_time);
      expect(found.sort_order).toBe(toAddSquad.sort_order);
    })
    it('should save edited squads, one squad deleted', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      squadsToEdit.pop();      
      const savedSquads = await tmntSaveSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedSquads) {
        expect(savedSquads).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedSquads).toHaveLength(2);
      const found = savedSquads.find((s) => s.id === mockSquadsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })   
    it('should save edited squads, one squad edited, one added, one deleted', async () => { 
      const squadsToEdit = structuredClone(mockSquadsToEdit);
      // delete squad 3
      squadsToEdit.pop();
      // edit squad 2
      squadsToEdit[1].squad_name = "Edited Div";
      squadsToEdit[1].games = 7;
      squadsToEdit[1].lane_count = 16;
      // add squad 4
      squadsToEdit.push(toAddSquad);
      const savedDivs = await tmntSaveSquads(mockSquadsToEdit, squadsToEdit);
      if (!savedDivs) {
        expect(savedDivs).not.toBeNull();
        return;
      }
      expect(savedDivs).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      const found = savedDivs.find((s) => s.id === squadsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toBe(squadsToEdit[1].id);
      expect(found.squad_name).toBe(squadsToEdit[1].squad_name);
      expect(found.games).toBe(squadsToEdit[1].games);      
      expect(found.lane_count).toBe(squadsToEdit[1].lane_count);
    })
  })


})