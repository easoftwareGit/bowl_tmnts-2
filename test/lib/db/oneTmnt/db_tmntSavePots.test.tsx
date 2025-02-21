import axios from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import { tmntSavePots, exportedForTesting } from "@/lib/db/oneTmnt/dbOneTmnt";
import { mockPotsToPost, mockSquadsToPost, mockDivs, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { potCategoriesTypes, potType } from "@/lib/types/types";
import { deleteAllTmntPots, deletePot, postManyPots, postPot, putPot } from "@/lib/db/pots/dbPots";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/dbSquads";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/dbDivs";
import { blankPot } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";
const { tmntPostPutOrDelPots } = exportedForTesting;

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
  const url = testBasePotsApi.startsWith("undefined")
    ? basePotsApi
    : testBasePotsApi;
  
  const mockPotsToEdit: potType[] = [
    {
      ...mockPotsToPost[0],
    },
    {
      ...mockPotsToPost[1],
    },
    {
      ...mockPotsToPost[2],
    },
  ]

  const doResetPot = async () => {
    await putPot(mockPotsToEdit[1]);
  }
  const rePostPot = async () => {
    const response = await axios.get(url);
    const pots = response.data.pots;
    const found = pots.find((p: potType) => p.id === mockPotsToEdit[2].id);
    if (!found) {
      await postPot(mockPotsToEdit[2]);
    }
  }

  describe('tmntPostPutOrDelPots(): edited pots(s)', () => { 
    
    const toAddPot = {    
      ...mockPotsToPost[3],      
      id: 'pot_10758d99c5494efabb3b0d273cf22e7a', // changed first digit to 1 from 0
      fee: '100',
      pot_type: 'Last Game' as potCategoriesTypes,
      sort_order: 99,
    }

    // 1 deleted - Series, sort order 3, index[2]
    // 1 edited - Last Game. sort order 2, index[1]
    // 1 left along - Game, sort order 1 - index[0]
    // 1 created - Last Game $100, sort order 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for current tests
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
      await postManyPots(mockPotsToEdit)
    })

    beforeEach(async () => {
      await doResetPot();
      await rePostPot();
      await deletePot(toAddPot.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deletePot(toAddPot.id);
      }
      if (didPut) {
        await doResetPot();
      }
      if (didDel) {
        await rePostPot();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited pots, one pot edited', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit[1].fee = '13';
      const savedPots = await tmntPostPutOrDelPots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      expect(savedPots).toHaveLength(3);
      didPut = true;
      expect(savedPots[1].id).toEqual(potsToEdit[1].id);
      expect(savedPots[1].div_id).toEqual(potsToEdit[1].div_id);
      expect(savedPots[1].squad_id).toEqual(potsToEdit[1].squad_id);
      expect(savedPots[1].pot_type).toEqual(potsToEdit[1].pot_type);
      expect(savedPots[1].fee).toEqual(potsToEdit[1].fee);
      expect(savedPots[1].sort_order).toEqual(potsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited pots, one pot added', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit.push(toAddPot);
      const savedPots = await tmntPostPutOrDelPots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      expect(savedPots).toHaveLength(4);
      didPost = true;
      const found = savedPots.find((p) => p.id === toAddPot.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddPot.id);
      expect(found.div_id).toEqual(toAddPot.div_id);
      expect(found.squad_id).toEqual(toAddPot.squad_id);
      expect(found.pot_type).toEqual(toAddPot.pot_type);
      expect(found.fee).toEqual(toAddPot.fee);
      expect(found.sort_order).toEqual(toAddPot.sort_order);      
    })
    it('should save edited pots, one pot deleted', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit.pop();
      const savedPots = await tmntPostPutOrDelPots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedPots).toHaveLength(2);
      const found = savedPots.find((p) => p.id === mockPotsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited pots, one pot edited, one added, one deleted', async () => {
      const potsToEdit = cloneDeep(mockPotsToEdit);
      const deletedId = mockPotsToEdit[2].id;
      // delete Series Pot
      potsToEdit.pop();
      // edit Last Game Pot
      potsToEdit[1].fee = '13';
      // add series pot
      potsToEdit.push(toAddPot);
      const savedPots = await tmntPostPutOrDelPots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedPots).toHaveLength(3);
      const foundEdited = savedPots.find((l) => l.id === potsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(potsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(potsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(potsToEdit[1].squad_id);
      expect(foundEdited.pot_type).toEqual(potsToEdit[1].pot_type);
      expect(foundEdited.fee).toEqual(potsToEdit[1].fee);
      expect(foundEdited.sort_order).toEqual(potsToEdit[1].sort_order); 
      const foundDeleted = savedPots.find((l) => l.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedPots.find((l) => l.id === toAddPot.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddPot.id);
      expect(foundAdded.div_id).toEqual(toAddPot.div_id);
      expect(foundAdded.squad_id).toEqual(toAddPot.squad_id);
      expect(foundAdded.pot_type).toEqual(toAddPot.pot_type);
      expect(foundAdded.fee).toEqual(toAddPot.fee);
    })

  })

  describe('tmntSavePots(): new pot(s)', () => { 

    let didCreate = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntPots(tmntToDelId);      
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // create temp squads for pots
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      didCreate = false;
    });

    afterEach(async () => {
      if (didCreate) {
        await deleteAllTmntPots(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    const origClone = cloneDeep(blankPot);
    const origPots: potType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new pot when only one pot to save', async () => { 
      const newPotClone = cloneDeep(mockPotsToPost[0]);
      const newPots = [
        {
          ...newPotClone,
        }
      ]
      const result = await tmntSavePots(origPots, newPots);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedPot = result[0];
      expect(postedPot.id).toBe(newPots[0].id);
      expect(postedPot.div_id).toBe(newPots[0].div_id);
      expect(postedPot.squad_id).toBe(newPots[0].squad_id);
      expect(postedPot.pot_type).toBe(newPots[0].pot_type);
      expect(postedPot.fee).toBe(newPots[0].fee);
      expect(postedPot.sort_order).toBe(newPots[0].sort_order);      
    })
    it('should create multiple new pots when multiple pots to save', async () => { 
      const newPots = cloneDeep(mockPotsToPost);
      const result = await tmntSavePots(origPots, newPots);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(mockPotsToPost.length);
      const postedPots = result as potType[];
      for (let i = 0; i < postedPots.length; i++) {  
        const postedPot = postedPots[i];
        const foundPot = newPots.find((p) => p.id === postedPot.id);
        if (!foundPot) {
          expect(foundPot).not.toBeUndefined();
          return;
        }
        expect(postedPot.id).toBe(foundPot.id);        
        expect(postedPot.div_id).toBe(foundPot.div_id);
        expect(postedPot.squad_id).toBe(foundPot.squad_id);
        expect(postedPot.pot_type).toBe(foundPot.pot_type);
        expect(postedPot.fee).toBe(foundPot.fee);
        expect(postedPot.sort_order).toBe(foundPot.sort_order);        
      }
    })
    it('should create no new pots when no new pots to save, and return empty array', async () => {
      const noPots: potType[] = []
      const result = await tmntSavePots(origPots, noPots);
      expect(result).not.toBeNull();
      if (!result) return;
      expect(result.length).toBe(0);
    })
  })

  describe('tmntSavePots(): edited pots(s)', () => { 
    
    const toAddPot = {    
      ...mockPotsToPost[3],      
      id: 'pot_10758d99c5494efabb3b0d273cf22e7a', // changed first digit to 1 from 0
      fee: '100',
      pot_type: 'Last Game' as potCategoriesTypes,
      sort_order: 99,
    }

    // 1 deleted - Series, sort order 2, index[2]
    // 1 edited - Last Game. sort order 2, index[1]
    // 1 left along - Game, sort order 1 - index[0]
    // 1 created - Last Game $100, sort order 99 - index[4]
    
    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for current tests
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
      await postManyPots(mockPotsToEdit)
    })

    beforeEach(async () => {
      await doResetPot();
      await rePostPot();
      await deletePot(toAddPot.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deletePot(toAddPot.id);
      }
      if (didPut) {
        await doResetPot();
      }
      if (didDel) {
        await rePostPot();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited pots, one pot edited', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit[1].fee = '13';
      const savedPots = await tmntSavePots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      expect(savedPots).toHaveLength(3);
      didPut = true;
      expect(savedPots[1].id).toEqual(potsToEdit[1].id);
      expect(savedPots[1].div_id).toEqual(potsToEdit[1].div_id);
      expect(savedPots[1].squad_id).toEqual(potsToEdit[1].squad_id);
      expect(savedPots[1].pot_type).toEqual(potsToEdit[1].pot_type);
      expect(savedPots[1].fee).toEqual(potsToEdit[1].fee);
      expect(savedPots[1].sort_order).toEqual(potsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited pots, one pot added', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit.push(toAddPot);
      const savedPots = await tmntSavePots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      expect(savedPots).toHaveLength(4);
      didPost = true;
      const found = savedPots.find((p) => p.id === toAddPot.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddPot.id);
      expect(found.div_id).toEqual(toAddPot.div_id);
      expect(found.squad_id).toEqual(toAddPot.squad_id);
      expect(found.pot_type).toEqual(toAddPot.pot_type);
      expect(found.fee).toEqual(toAddPot.fee);
      expect(found.sort_order).toEqual(toAddPot.sort_order);      
    })
    it('should save edited pots, one pot deleted', async () => { 
      const potsToEdit = cloneDeep(mockPotsToEdit);
      potsToEdit.pop();
      const savedPots = await tmntSavePots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedPots).toHaveLength(2);
      const found = savedPots.find((p) => p.id === mockPotsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited pots, one pot edited, one added, one deleted', async () => {
      const potsToEdit = cloneDeep(mockPotsToEdit);
      const deletedId = mockPotsToEdit[2].id;
      // delete Series Pot
      potsToEdit.pop();
      // edit Last Game Pot
      potsToEdit[1].fee = '13';
      // add series pot
      potsToEdit.push(toAddPot);
      const savedPots = await tmntSavePots(mockPotsToEdit, potsToEdit);
      if (!savedPots) {
        expect(savedPots).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedPots).toHaveLength(3);
      const foundEdited = savedPots.find((p) => p.id === potsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(potsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(potsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(potsToEdit[1].squad_id);
      expect(foundEdited.pot_type).toEqual(potsToEdit[1].pot_type);
      expect(foundEdited.fee).toEqual(potsToEdit[1].fee);
      expect(foundEdited.sort_order).toEqual(potsToEdit[1].sort_order); 
      const foundDeleted = savedPots.find((l) => l.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedPots.find((l) => l.id === toAddPot.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddPot.id);
      expect(foundAdded.div_id).toEqual(toAddPot.div_id);
      expect(foundAdded.squad_id).toEqual(toAddPot.squad_id);
      expect(foundAdded.pot_type).toEqual(toAddPot.pot_type);
      expect(foundAdded.fee).toEqual(toAddPot.fee);
    })

  })

})