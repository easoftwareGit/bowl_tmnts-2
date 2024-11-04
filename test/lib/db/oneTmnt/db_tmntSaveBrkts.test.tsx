import axios from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import { tmntSaveBrkts, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";
import { mockBrktsToPost, mockSquadsToPost, mockDivs, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { brktType } from "@/lib/types/types";
import { deleteAllTmntBrkts, deleteBrkt, postManyBrkts, postBrkt, putBrkt } from "@/lib/db/brkts/brktsAxios";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/divsAxios";
import { blankBrkt } from "@/lib/db/initVals";
import 'core-js/actual/structured-clone';
const { tmntPostPutOrDelBrkts } = exportedForTesting;

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
  const url = testBaseBrktsApi.startsWith("undefined")
    ? baseBrktsApi
    : testBaseBrktsApi;
  
  const mockBrktsToEdit: brktType[] = [
    {
      ...mockBrktsToPost[0],
    },
    {
      ...mockBrktsToPost[1],
    },
    {
      ...mockBrktsToPost[2],
    },
  ]

  const doResetBrkt = async () => {
    await putBrkt(mockBrktsToEdit[1]);
  }
  const rePostBrkt = async () => {
    const response = await axios.get(url);
    const brkts = response.data.brkts;
    const found = brkts.find((b: brktType) => b.id === mockBrktsToEdit[2].id);
    if (!found) {
      await postBrkt(mockBrktsToEdit[2]);
    }
  }

  describe('tmntPostPutOrDelBrkts(): edited brkt(s)', () => { 
    
    const toAddBrkt = {    
      ...mockBrktsToPost[3],      
      id: "brk_14758d99c5494efabb3b0d273cf22e7a", // changed first digit to 1 from 0
      start: 2,
      sort_order: 99
    }

    // 1 deleted - sort order 3, index[2]
    // 1 edited - sort order 2, index[1]
    // 1 left along - sort order 1 - index[0]
    // 1 created - sort order 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for current tests
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
      await postManyBrkts(mockBrktsToEdit)
    })

    beforeEach(async () => {
      await doResetBrkt();
      await rePostBrkt();
      await deleteBrkt(toAddBrkt.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteBrkt(toAddBrkt.id);
      }
      if (didPut) {
        await doResetBrkt();
      }
      if (didDel) {
        await rePostBrkt();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited brkts, one brkt edited', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit[1].start = 2;
      const savedBrkts = await tmntPostPutOrDelBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      expect(savedBrkts).toHaveLength(3);
      didPut = true;
      expect(savedBrkts[1].id).toEqual(brktsToEdit[1].id);
      expect(savedBrkts[1].div_id).toEqual(brktsToEdit[1].div_id);
      expect(savedBrkts[1].squad_id).toEqual(brktsToEdit[1].squad_id);
      expect(savedBrkts[1].start).toEqual(brktsToEdit[1].start);
      expect(savedBrkts[1].games).toEqual(brktsToEdit[1].games);
      expect(savedBrkts[1].players).toEqual(brktsToEdit[1].players);
      expect(savedBrkts[1].fee).toEqual(brktsToEdit[1].fee);
      expect(savedBrkts[1].first).toEqual(brktsToEdit[1].first);
      expect(savedBrkts[1].second).toEqual(brktsToEdit[1].second);
      expect(savedBrkts[1].admin).toEqual(brktsToEdit[1].admin);
      expect(savedBrkts[1].fsa).toEqual(brktsToEdit[1].fsa);
      expect(savedBrkts[1].sort_order).toEqual(brktsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited brkts, one brkt added', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit.push(toAddBrkt);
      const savedBrkts = await tmntPostPutOrDelBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      expect(savedBrkts).toHaveLength(4);
      didPost = true;
      const found = savedBrkts.find((b) => b.id === toAddBrkt.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddBrkt.id);
      expect(found.div_id).toEqual(toAddBrkt.div_id);
      expect(found.squad_id).toEqual(toAddBrkt.squad_id);
      expect(found.start).toEqual(toAddBrkt.start);
      expect(found.games).toEqual(toAddBrkt.games);
      expect(found.players).toEqual(toAddBrkt.players);
      expect(found.fee).toEqual(toAddBrkt.fee);
      expect(found.first).toEqual(toAddBrkt.first);
      expect(found.second).toEqual(toAddBrkt.second);
      expect(found.admin).toEqual(toAddBrkt.admin);
      expect(found.fsa).toEqual(toAddBrkt.fsa);
      expect(found.sort_order).toEqual(toAddBrkt.sort_order);      
    })
    it('should save edited brkts, one brkt deleted', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit.pop();
      const savedBrkts = await tmntPostPutOrDelBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedBrkts).toHaveLength(2);
      const found = savedBrkts.find((p) => p.id === mockBrktsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited brkts, one brkt edited, one added, one deleted', async () => {
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      const deletedId = mockBrktsToEdit[2].id;
      // delete brkt
      brktsToEdit.pop();
      // edit brkt
      brktsToEdit[1].start = 2;
      // add brkt
      brktsToEdit.push(toAddBrkt);
      const savedBrkts = await tmntPostPutOrDelBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedBrkts).toHaveLength(3);
      const foundEdited = savedBrkts.find((b) => b.id === brktsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(brktsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(brktsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(brktsToEdit[1].squad_id);
      expect(foundEdited.start).toEqual(brktsToEdit[1].start);
      expect(foundEdited.games).toEqual(brktsToEdit[1].games);
      expect(foundEdited.players).toEqual(brktsToEdit[1].players);
      expect(foundEdited.fee).toEqual(brktsToEdit[1].fee);
      expect(foundEdited.first).toEqual(brktsToEdit[1].first);
      expect(foundEdited.second).toEqual(brktsToEdit[1].second);
      expect(foundEdited.admin).toEqual(brktsToEdit[1].admin);
      expect(foundEdited.fsa).toEqual(brktsToEdit[1].fsa);
      expect(foundEdited.sort_order).toEqual(brktsToEdit[1].sort_order); 
      const foundDeleted = savedBrkts.find((b) => b.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedBrkts.find((b) => b.id === toAddBrkt.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddBrkt.id);
      expect(foundAdded.div_id).toEqual(toAddBrkt.div_id);
      expect(foundAdded.squad_id).toEqual(toAddBrkt.squad_id);
      expect(foundAdded.start).toEqual(toAddBrkt.start);
      expect(foundAdded.games).toEqual(toAddBrkt.games);
      expect(foundAdded.players).toEqual(toAddBrkt.players);      
      expect(foundAdded.fee).toEqual(toAddBrkt.fee);
      expect(foundAdded.first).toEqual(toAddBrkt.first);
      expect(foundAdded.second).toEqual(toAddBrkt.second);
      expect(foundAdded.admin).toEqual(toAddBrkt.admin);
      expect(foundAdded.fsa).toEqual(toAddBrkt.fsa);
      expect(foundAdded.sort_order).toEqual(toAddBrkt.sort_order);
    })

  })

  describe('tmntSaveBrkts(): new brkts(s)', () => { 

    let didCreate = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntBrkts(tmntToDelId);      
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // create temp squads for brkts
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      didCreate = false;
    });

    afterEach(async () => {
      if (didCreate) {
        await deleteAllTmntBrkts(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    const origClone = structuredClone(blankBrkt);
    const origBrkts: brktType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new brkt when only one brkt to save', async () => { 
      const newBrktClone = structuredClone(mockBrktsToPost[0]);
      const newBrkts = [
        {
          ...newBrktClone,
        }
      ]
      const result = await tmntSaveBrkts(origBrkts, newBrkts);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedBrkt = result[0];
      expect(postedBrkt.id).toBe(newBrkts[0].id);
      expect(postedBrkt.div_id).toBe(newBrkts[0].div_id);
      expect(postedBrkt.squad_id).toBe(newBrkts[0].squad_id);
      expect(postedBrkt.start).toBe(newBrkts[0].start);
      expect(postedBrkt.games).toBe(newBrkts[0].games);
      expect(postedBrkt.players).toBe(newBrkts[0].players);
      expect(postedBrkt.fee).toBe(newBrkts[0].fee);
      expect(postedBrkt.first).toBe(newBrkts[0].first);
      expect(postedBrkt.second).toBe(newBrkts[0].second);
      expect(postedBrkt.admin).toBe(newBrkts[0].admin);
      expect(postedBrkt.fsa).toBe(newBrkts[0].fsa);
      expect(postedBrkt.sort_order).toBe(newBrkts[0].sort_order);      
    })
    it('should create multiple new brkts when multiple brkts to save', async () => { 
      const newLanes = structuredClone(mockBrktsToPost);
      const result = await tmntSaveBrkts(origBrkts, newLanes);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(mockBrktsToPost.length);
      const postedBrkts = result as brktType[];
      for (let i = 0; i < postedBrkts.length; i++) {  
        const postedBrkt = postedBrkts[i];
        const foundBrkt = newLanes.find((b) => b.id === postedBrkt.id);
        if (!foundBrkt) {
          expect(foundBrkt).not.toBeUndefined();
          return;
        }
        expect(postedBrkt.id).toBe(foundBrkt.id);        
        expect(postedBrkt.div_id).toBe(foundBrkt.div_id);
        expect(postedBrkt.squad_id).toBe(foundBrkt.squad_id);
        expect(postedBrkt.start).toBe(foundBrkt.start);
        expect(postedBrkt.games).toBe(foundBrkt.games);
        expect(postedBrkt.players).toBe(foundBrkt.players);
        expect(postedBrkt.fee).toBe(foundBrkt.fee);
        expect(postedBrkt.first).toBe(foundBrkt.first);
        expect(postedBrkt.second).toBe(foundBrkt.second);
        expect(postedBrkt.admin).toBe(foundBrkt.admin);
        expect(postedBrkt.fsa).toBe(foundBrkt.fsa);
        expect(postedBrkt.sort_order).toBe(foundBrkt.sort_order);        
      }
    })
    it('should not create any new brkts when no brkts to save, and return empty array', async () => { 
      const noBrkts: brktType[] = [];
      const result = await tmntSaveBrkts(origBrkts, noBrkts);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(0);
    })

  })

  describe('tmntSaveBrkts(): edited brkt(s)', () => { 
    
    const toAddBrkt = {    
      ...mockBrktsToPost[3],      
      id: "brk_14758d99c5494efabb3b0d273cf22e7a", // changed first digit to 1 from 0
      start: 2,
      sort_order: 99
    }

    // 1 deleted - sort order 3, index[2]
    // 1 edited - sort order 2, index[1]
    // 1 left along - sort order 1 - index[0]
    // 1 created - sort order 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for current tests
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
      await postManyBrkts(mockBrktsToEdit)
    })

    beforeEach(async () => {
      await doResetBrkt();
      await rePostBrkt();
      await deleteBrkt(toAddBrkt.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteBrkt(toAddBrkt.id);
      }
      if (didPut) {
        await doResetBrkt();
      }
      if (didDel) {
        await rePostBrkt();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited brkts, one brkt edited', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit[1].start = 2;
      const savedBrkts = await tmntSaveBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      expect(savedBrkts).toHaveLength(3);
      didPut = true;
      expect(savedBrkts[1].id).toEqual(brktsToEdit[1].id);
      expect(savedBrkts[1].div_id).toEqual(brktsToEdit[1].div_id);
      expect(savedBrkts[1].squad_id).toEqual(brktsToEdit[1].squad_id);
      expect(savedBrkts[1].start).toEqual(brktsToEdit[1].start);
      expect(savedBrkts[1].games).toEqual(brktsToEdit[1].games);
      expect(savedBrkts[1].players).toEqual(brktsToEdit[1].players);      
      expect(savedBrkts[1].fee).toEqual(brktsToEdit[1].fee);
      expect(savedBrkts[1].first).toEqual(brktsToEdit[1].first);
      expect(savedBrkts[1].second).toEqual(brktsToEdit[1].second);
      expect(savedBrkts[1].admin).toEqual(brktsToEdit[1].admin);
      expect(savedBrkts[1].fsa).toEqual(brktsToEdit[1].fsa);
      expect(savedBrkts[1].sort_order).toEqual(brktsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited brkts, one brkt added', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit.push(toAddBrkt);
      const savedBrkts = await tmntSaveBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      expect(savedBrkts).toHaveLength(4);
      didPost = true;
      const found = savedBrkts.find((p) => p.id === toAddBrkt.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddBrkt.id);
      expect(found.div_id).toEqual(toAddBrkt.div_id);
      expect(found.squad_id).toEqual(toAddBrkt.squad_id);
      expect(found.start).toEqual(toAddBrkt.start);
      expect(found.games).toEqual(toAddBrkt.games);
      expect(found.players).toEqual(toAddBrkt.players);      
      expect(found.fee).toEqual(toAddBrkt.fee);
      expect(found.first).toEqual(toAddBrkt.first);
      expect(found.second).toEqual(toAddBrkt.second);
      expect(found.admin).toEqual(toAddBrkt.admin);
      expect(found.fsa).toEqual(toAddBrkt.fsa);
      expect(found.sort_order).toEqual(toAddBrkt.sort_order);      
    })
    it('should save edited brkts, one brkt deleted', async () => { 
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      brktsToEdit.pop();
      const savedBrkts = await tmntSaveBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedBrkts).toHaveLength(2);
      const found = savedBrkts.find((b) => b.id === mockBrktsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited brkts, one brkt edited, one added, one deleted', async () => {
      const brktsToEdit = structuredClone(mockBrktsToEdit);
      const deletedId = mockBrktsToEdit[2].id;
      // delete 
      brktsToEdit.pop();
      // edit 
      brktsToEdit[1].start = 2;
      // add 
      brktsToEdit.push(toAddBrkt);
      const savedBrkts = await tmntSaveBrkts(mockBrktsToEdit, brktsToEdit);
      if (!savedBrkts) {
        expect(savedBrkts).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedBrkts).toHaveLength(3);
      const foundEdited = savedBrkts.find((b) => b.id === brktsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(brktsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(brktsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(brktsToEdit[1].squad_id);
      expect(foundEdited.start).toEqual(brktsToEdit[1].start);
      expect(foundEdited.games).toEqual(brktsToEdit[1].games);
      expect(foundEdited.players).toEqual(brktsToEdit[1].players);
      expect(foundEdited.fee).toEqual(brktsToEdit[1].fee);
      expect(foundEdited.first).toEqual(brktsToEdit[1].first);
      expect(foundEdited.second).toEqual(brktsToEdit[1].second);
      expect(foundEdited.admin).toEqual(brktsToEdit[1].admin);
      expect(foundEdited.fsa).toEqual(brktsToEdit[1].fsa);
      expect(foundEdited.sort_order).toEqual(brktsToEdit[1].sort_order); 
      const foundDeleted = savedBrkts.find((b) => b.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedBrkts.find((b) => b.id === toAddBrkt.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddBrkt.id);
      expect(foundAdded.div_id).toEqual(toAddBrkt.div_id);
      expect(foundAdded.squad_id).toEqual(toAddBrkt.squad_id);
      expect(foundAdded.start).toEqual(toAddBrkt.start);
      expect(foundAdded.games).toEqual(toAddBrkt.games);
      expect(foundAdded.players).toEqual(toAddBrkt.players);      
      expect(foundAdded.fee).toEqual(toAddBrkt.fee);
      expect(foundAdded.first).toEqual(toAddBrkt.first);
      expect(foundAdded.second).toEqual(toAddBrkt.second);
      expect(foundAdded.admin).toEqual(toAddBrkt.admin);
      expect(foundAdded.fsa).toEqual(toAddBrkt.fsa);
      expect(foundAdded.sort_order).toEqual(toAddBrkt.sort_order);
    })

  })

})