import axios from "axios";
import { baseLanesApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi } from "../../../testApi";
import { tmntSaveLanes, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";
import { mockLanesToPost, mockLanesToEdit, mockSquadsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { laneType } from "@/lib/types/types";
import { deleteAllTmntLanes, deleteLane, postLane, postManyLanes, putLane } from "@/lib/db/lanes/lanesAxios";
import { deleteAllEventSquads, postManySquads } from "@/lib/db/squads/squadsAxios";
import { blankLane } from "@/lib/db/initVals";
import 'core-js/actual/structured-clone';
const { tmntPostPutOrDelLanes } = exportedForTesting;

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
  const url = testBaseLanesApi.startsWith("undefined")
    ? baseLanesApi
    : testBaseLanesApi;
  
  const doResetLane = async () => {
    await putLane(mockLanesToEdit[1]);
  }
  const rePostLane = async () => {
    const response = await axios.get(url);
    const lanes = response.data.lanes;
    const found = lanes.find((l: laneType) => l.id === mockLanesToEdit[3].id);
    if (!found) {
      await postLane(mockLanesToEdit[3]);
    }
  }

  describe('tmntPostPutOrDelLanes(): edited lane(s)', () => {
    const clonedLane = structuredClone(mockLanesToEdit[0]);
    const toAddLane = {
      ...clonedLane,
      id: 'lan_20c24199328447f8bbe95c05e1b84611', // added one to 2nd last diget
      lane_number: 99,      
    }

    // 1 deleted - Lane 4, sort order 3, index[3]
    // 1 edited - Lane 2. sort order 2, index[1]
    // 1 left along - Lane 1, sort order 1 - index[0]
    // 1 created - Lane 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);
      // setup for current tests
      await postManySquads(mockSquadsToPost)
      await postManyLanes(mockLanesToEdit)
    })

    beforeEach(async () => {
      await doResetLane();
      await rePostLane();
      await deleteLane(toAddLane.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteLane(toAddLane.id);
      }
      if (didPut) {
        await doResetLane();
      }
      if (didDel) {
        await rePostLane();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);
    })

    it('should save edited lanes, one lane edited', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit[1].lane_number = 22;
      const savedLanes = await tmntPostPutOrDelLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      expect(savedLanes).toHaveLength(4);
      didPut = true;
      expect(savedLanes[1].id).toEqual(lanesToEdit[1].id);
      expect(savedLanes[1].squad_id).toEqual(lanesToEdit[1].squad_id);
      expect(savedLanes[1].lane_number).toEqual(lanesToEdit[1].lane_number);
      didPut = true;
    })
    it('should save edited lanes, one lane added', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit.push(toAddLane);
      const savedLanes = await tmntPostPutOrDelLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      expect(savedLanes).toHaveLength(5);
      didPost = true;
      const found = savedLanes.find((l) => l.id === toAddLane.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddLane.id);
      expect(found.squad_id).toEqual(toAddLane.squad_id);
      expect(found.lane_number).toEqual(toAddLane.lane_number);
    })
    it('should save edited lanes, one lane deleted', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit.pop();
      const savedLanes = await tmntPostPutOrDelLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedLanes).toHaveLength(3);
      const found = savedLanes.find((l) => l.id === mockLanesToEdit[3].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited lanes, one lane edited, one added, one deleted', async () => {
      const lanesToEdit = structuredClone(mockLanesToEdit);
      const deletedId = mockLanesToEdit[3].id;
      // delete lane 3
      lanesToEdit.pop();
      // edit lane 2
      lanesToEdit[1].lane_number = 22;
      // add lane 99
      lanesToEdit.push(toAddLane);
      const savedLanes = await tmntPostPutOrDelLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedLanes).toHaveLength(4);
      const foundEdited = savedLanes.find((l) => l.id === lanesToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(lanesToEdit[1].id);
      expect(foundEdited.squad_id).toEqual(lanesToEdit[1].squad_id);
      expect(foundEdited.lane_number).toEqual(lanesToEdit[1].lane_number);
      const foundDeleted = savedLanes.find((l) => l.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedLanes.find((l) => l.id === toAddLane.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddLane.id);
      expect(foundAdded.squad_id).toEqual(toAddLane.squad_id);
      expect(foundAdded.lane_number).toEqual(toAddLane.lane_number);
    })
  })

  describe('tmntSaveLanes(): new lane(s)', () => { 
    let didCreate = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);

      // create temp squads for lanes
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      didCreate = false;
    });

    afterEach(async () => {
      if (didCreate) {
        await deleteAllTmntLanes(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);
    })

    const origClone = structuredClone(blankLane);
    const origLanes: laneType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new lane when only one lane to save', async () => { 
      // NOTE: there will NEVER be just one lane to save
      //       lanes are created in pairs, this is just a test
      const newLaneClone = structuredClone(mockLanesToPost[0]);
      const newLanes = [
        {
          ...newLaneClone,
        }
      ]
      const result = await tmntSaveLanes(origLanes, newLanes);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedLane = result[0];
      expect(postedLane.id).toBe(newLanes[0].id);
      expect(postedLane.squad_id).toBe(newLanes[0].squad_id);
      expect(postedLane.lane_number).toBe(newLanes[0].lane_number);
    })
    it('should create multiple new lanes when multiple lanes to save', async () => { 
      const newLanes = structuredClone(mockLanesToPost);
      const result = await tmntSaveLanes(origLanes, newLanes);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(mockLanesToPost.length);
      const postedLanes = result as laneType[];
      for (let i = 0; i < postedLanes.length; i++) {  
        const postedLane = postedLanes[i];
        const foundLane = newLanes.find((l) => l.id === postedLane.id);
        if (!foundLane) {
          expect(foundLane).not.toBeUndefined();
          return;
        }
        expect(postedLane.id).toBe(foundLane.id);        
        expect(postedLane.squad_id).toBe(foundLane.squad_id);
        expect(postedLane.lane_number).toBe(foundLane.lane_number);
      }
    })
      
  })

  describe('tmntSaveLanes(): edited lane(s)', () => {
    const clonedLane = structuredClone(mockLanesToEdit[0]);
    const toAddLane = {
      ...clonedLane,
      id: 'lan_20c24199328447f8bbe95c05e1b84611', // added one to 2nd last diget
      lane_number: 99,      
    }

    // 1 deleted - Lane 4, sort order 3, index[3]
    // 1 edited - Lane 2. sort order 2, index[1]
    // 1 left along - Lane 1, sort order 1 - index[0]
    // 1 created - Lane 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);
      // setup for current tests
      await postManySquads(mockSquadsToPost)
      await postManyLanes(mockLanesToEdit)
    })

    beforeEach(async () => {
      await doResetLane();
      await rePostLane();
      await deleteLane(toAddLane.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteLane(toAddLane.id);
      }
      if (didPut) {
        await doResetLane();
      }
      if (didDel) {
        await rePostLane();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllEventSquads(mockSquadsToPost[0].event_id);
    })

    it('should save edited lanes, one lane edited', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit[1].lane_number = 22;
      const savedLanes = await tmntSaveLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      expect(savedLanes).toHaveLength(4);
      didPut = true;
      expect(savedLanes[1].id).toEqual(lanesToEdit[1].id);
      expect(savedLanes[1].squad_id).toEqual(lanesToEdit[1].squad_id);
      expect(savedLanes[1].lane_number).toEqual(lanesToEdit[1].lane_number);
      didPut = true;
    })
    it('should save edited lanes, one lane added', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit.push(toAddLane);
      const savedLanes = await tmntSaveLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      expect(savedLanes).toHaveLength(5);
      didPost = true;
      const found = savedLanes.find((l) => l.id === toAddLane.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddLane.id);
      expect(found.squad_id).toEqual(toAddLane.squad_id);
      expect(found.lane_number).toEqual(toAddLane.lane_number);
    })
    it('should save edited lanes, one lane deleted', async () => { 
      const lanesToEdit = structuredClone(mockLanesToEdit);
      lanesToEdit.pop();
      const savedLanes = await tmntSaveLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedLanes).toHaveLength(3);
      const found = savedLanes.find((l) => l.id === mockLanesToEdit[3].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited lanes, one lane edited, one added, one deleted', async () => {
      const lanesToEdit = structuredClone(mockLanesToEdit);
      const deletedId = mockLanesToEdit[3].id;
      // delete lane 3
      lanesToEdit.pop();
      // edit lane 2
      lanesToEdit[1].lane_number = 22;
      // add lane 99
      lanesToEdit.push(toAddLane);
      const savedLanes = await tmntSaveLanes(mockLanesToEdit, lanesToEdit);
      if (!savedLanes) {
        expect(savedLanes).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedLanes).toHaveLength(4);
      const foundEdited = savedLanes.find((l) => l.id === lanesToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(lanesToEdit[1].id);
      expect(foundEdited.squad_id).toEqual(lanesToEdit[1].squad_id);
      expect(foundEdited.lane_number).toEqual(lanesToEdit[1].lane_number);
      const foundDeleted = savedLanes.find((l) => l.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedLanes.find((l) => l.id === toAddLane.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddLane.id);
      expect(foundAdded.squad_id).toEqual(toAddLane.squad_id);
      expect(foundAdded.lane_number).toEqual(toAddLane.lane_number);
    })
  })  

})