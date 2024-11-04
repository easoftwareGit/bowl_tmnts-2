import axios from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import { tmntSaveElims, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";
import { deleteAllTmntElims, deleteElim, postElim, postManyElims, putElim } from "@/lib/db/elims/elimsAxios";
import { mockElimsToPost, mockSquadsToPost, mockDivs, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { elimType } from "@/lib/types/types";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/divsAxios";
import { blankElim } from "@/lib/db/initVals";
import 'core-js/actual/structured-clone';
const { tmntPostPutOrDelElims } = exportedForTesting;


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
  const url = testBaseElimsApi.startsWith("undefined")
    ? baseElimsApi
    : testBaseElimsApi;
  
  const mockElimsToEdit: elimType[] = [
    {
      ...mockElimsToPost[0],
    },
    {
      ...mockElimsToPost[1],
    },
    {
      ...mockElimsToPost[2],
    },
  ]

  const doResetElim = async () => {
    await putElim(mockElimsToEdit[1]);
  }
  const rePostElim = async () => {
    const response = await axios.get(url);
    const elims = response.data.elims;
    const found = elims.find((e: elimType) => e.id === mockElimsToEdit[2].id);
    if (!found) {
      await postElim(mockElimsToEdit[2]);
    }
  }

  describe('tmntPostPutOrDelElims(): edited elim(s)', () => { 
    
    const toAddElim = {    
      ...mockElimsToPost[3],      
      id: "elm_24758d99c5494efabb3b0d273cf22e7a", // changed first digit to 2 from 1
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
      await deleteAllTmntElims(tmntToDelId);      
      await deleteAllTmntSquads(tmntToDelId);      
      await deleteAllTmntDivs(tmntToDelId);      
      // setup for current tests
      await postManyDivs(mockDivs)            
      await postManySquads(mockSquadsToPost)      
      await postManyElims(mockElimsToEdit)
    })

    beforeEach(async () => {
      await doResetElim();
      await rePostElim();
      await deleteElim(toAddElim.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteElim(toAddElim.id);
      }
      if (didPut) {
        await doResetElim();
      }
      if (didDel) {
        await rePostElim();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntElims(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited elims, one elim edited', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit[1].start = 2;
      const savedElims = await tmntPostPutOrDelElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      expect(savedElims).toHaveLength(3);
      didPut = true;
      expect(savedElims[1].id).toEqual(elimsToEdit[1].id);
      expect(savedElims[1].div_id).toEqual(elimsToEdit[1].div_id);
      expect(savedElims[1].squad_id).toEqual(elimsToEdit[1].squad_id);
      expect(savedElims[1].start).toEqual(elimsToEdit[1].start);
      expect(savedElims[1].games).toEqual(elimsToEdit[1].games);      
      expect(savedElims[1].fee).toEqual(elimsToEdit[1].fee);
      expect(savedElims[1].sort_order).toEqual(elimsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited elims, one elim added', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit.push(toAddElim);
      const savedElims = await tmntPostPutOrDelElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      expect(savedElims).toHaveLength(4);
      didPost = true;
      const found = savedElims.find((b) => b.id === toAddElim.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddElim.id);
      expect(found.div_id).toEqual(toAddElim.div_id);
      expect(found.squad_id).toEqual(toAddElim.squad_id);
      expect(found.start).toEqual(toAddElim.start);
      expect(found.games).toEqual(toAddElim.games);      
      expect(found.fee).toEqual(toAddElim.fee);
      expect(found.sort_order).toEqual(toAddElim.sort_order);      
    })
    it('should save edited elims, one elim deleted', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit.pop();
      const savedElims = await tmntPostPutOrDelElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedElims).toHaveLength(2);
      const found = savedElims.find((p) => p.id === mockElimsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited elims, one elim edited, one added, one deleted', async () => {
      const elimsToEdit = structuredClone(mockElimsToEdit);
      const deletedId = mockElimsToEdit[2].id;
      // delete elim
      elimsToEdit.pop();
      // edit elim
      elimsToEdit[1].start = 2;
      // add elim
      elimsToEdit.push(toAddElim);
      const savedElims = await tmntPostPutOrDelElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedElims).toHaveLength(3);
      const foundEdited = savedElims.find((e) => e.id === elimsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(elimsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(elimsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(elimsToEdit[1].squad_id);
      expect(foundEdited.start).toEqual(elimsToEdit[1].start);
      expect(foundEdited.games).toEqual(elimsToEdit[1].games);      
      expect(foundEdited.fee).toEqual(elimsToEdit[1].fee);
      expect(foundEdited.sort_order).toEqual(elimsToEdit[1].sort_order); 
      const foundDeleted = savedElims.find((e) => e.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedElims.find((e) => e.id === toAddElim.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddElim.id);
      expect(foundAdded.div_id).toEqual(toAddElim.div_id);
      expect(foundAdded.squad_id).toEqual(toAddElim.squad_id);
      expect(foundAdded.start).toEqual(toAddElim.start);
      expect(foundAdded.games).toEqual(toAddElim.games);           
      expect(foundAdded.fee).toEqual(toAddElim.fee);
      expect(foundAdded.sort_order).toEqual(toAddElim.sort_order);
    })

  })

  describe('tmntSaveElims(): new elim(s)', () => { 

    let didCreate = false;

    beforeAll(async () => {
      // cleanup if test left over from previous test
      await deleteAllTmntElims(tmntToDelId);      
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);

      // create temp squads for elims
      await postManyDivs(mockDivs);
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      didCreate = false;
    });

    afterEach(async () => {
      if (didCreate) {
        await deleteAllTmntElims(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllTmntElims(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    const origClone = structuredClone(blankElim);
    const origElims: elimType[] = [
      {
        ...origClone,
      }
    ]

    it('should create one new elim when only one elim to save', async () => { 
      const newElimClone = structuredClone(mockElimsToPost[0]);
      const newElims = [
        {
          ...newElimClone,
        }
      ]
      const result = await tmntSaveElims(origElims, newElims);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedElim = result[0];
      expect(postedElim.id).toBe(newElims[0].id);
      expect(postedElim.div_id).toBe(newElims[0].div_id);
      expect(postedElim.squad_id).toBe(newElims[0].squad_id);
      expect(postedElim.start).toBe(newElims[0].start);
      expect(postedElim.games).toBe(newElims[0].games);      
      expect(postedElim.fee).toBe(newElims[0].fee);
      expect(postedElim.sort_order).toBe(newElims[0].sort_order);      
    })
    it('should create multiple new elims when multiple elims to save', async () => { 
      const newLanes = structuredClone(mockElimsToPost);
      const result = await tmntSaveElims(origElims, newLanes);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(mockElimsToPost.length);
      const postedElims = result as elimType[];
      for (let i = 0; i < postedElims.length; i++) {  
        const postedElim = postedElims[i];
        const foundElim = newLanes.find((b) => b.id === postedElim.id);
        if (!foundElim) {
          expect(foundElim).not.toBeUndefined();
          return;
        }
        expect(postedElim.id).toBe(foundElim.id);        
        expect(postedElim.div_id).toBe(foundElim.div_id);
        expect(postedElim.squad_id).toBe(foundElim.squad_id);
        expect(postedElim.start).toBe(foundElim.start);
        expect(postedElim.games).toBe(foundElim.games);        
        expect(postedElim.fee).toBe(foundElim.fee);
        expect(postedElim.sort_order).toBe(foundElim.sort_order);        
      }
    })
    it('should NOT create new elims when no elims to save, and return empty array', async () => { 
      const noElims: elimType[] = []
      const result = await tmntSaveElims(origElims, noElims);
      expect(result).not.toBeNull();
      didCreate = true;
      if (!result) return;
      expect(result.length).toBe(0);
    })
  
  })

  describe('tmntSaveElims(): edited elim(s)', () => { 
    
    const toAddElim = {    
      ...mockElimsToPost[3],      
      id: "elm_24758d99c5494efabb3b0d273cf22e7a", // changed first digit to 2 from 1
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
      await deleteAllTmntElims(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      // setup for current tests
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
      await postManyElims(mockElimsToEdit)
    })

    beforeEach(async () => {
      await doResetElim();
      await rePostElim();
      await deleteElim(toAddElim.id);
    });

    beforeEach(() => {
      didPost = false;
      didPut = false;
      didDel = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteElim(toAddElim.id);
      }
      if (didPut) {
        await doResetElim();
      }
      if (didDel) {
        await rePostElim();
      }
    });

    afterAll(async () => {      
      await deleteAllTmntElims(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
    })

    it('should save edited elims, one elim edited', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit[1].start = 2;
      const savedElims = await tmntSaveElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      expect(savedElims).toHaveLength(3);
      didPut = true;
      expect(savedElims[1].id).toEqual(elimsToEdit[1].id);
      expect(savedElims[1].div_id).toEqual(elimsToEdit[1].div_id);
      expect(savedElims[1].squad_id).toEqual(elimsToEdit[1].squad_id);
      expect(savedElims[1].start).toEqual(elimsToEdit[1].start);
      expect(savedElims[1].games).toEqual(elimsToEdit[1].games);          
      expect(savedElims[1].fee).toEqual(elimsToEdit[1].fee);
      expect(savedElims[1].sort_order).toEqual(elimsToEdit[1].sort_order); 
      didPut = true;
    })
    it('should save edited elims, one elim added', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit.push(toAddElim);
      const savedElims = await tmntSaveElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      expect(savedElims).toHaveLength(4);
      didPost = true;
      const found = savedElims.find((p) => p.id === toAddElim.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.id).toEqual(toAddElim.id);
      expect(found.div_id).toEqual(toAddElim.div_id);
      expect(found.squad_id).toEqual(toAddElim.squad_id);
      expect(found.start).toEqual(toAddElim.start);
      expect(found.games).toEqual(toAddElim.games);          
      expect(found.fee).toEqual(toAddElim.fee);
      expect(found.sort_order).toEqual(toAddElim.sort_order);      
    })
    it('should save edited elims, one elim deleted', async () => { 
      const elimsToEdit = structuredClone(mockElimsToEdit);
      elimsToEdit.pop();
      const savedElims = await tmntSaveElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedElims).toHaveLength(2);
      const found = savedElims.find((b) => b.id === mockElimsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited elims, one elim edited, one added, one deleted', async () => {
      const elimsToEdit = structuredClone(mockElimsToEdit);
      const deletedId = mockElimsToEdit[2].id;
      // delete 
      elimsToEdit.pop();
      // edit 
      elimsToEdit[1].start = 2;
      // add 
      elimsToEdit.push(toAddElim);
      const savedElims = await tmntSaveElims(mockElimsToEdit, elimsToEdit);
      if (!savedElims) {
        expect(savedElims).not.toBeNull();
        return;
      }
      didPut = true;
      didPost = true;
      didDel = true;
      expect(savedElims).toHaveLength(3);
      const foundEdited = savedElims.find((b) => b.id === elimsToEdit[1].id);
      if (!foundEdited) {
        expect(foundEdited).not.toBeUndefined();
        return;
      }
      expect(foundEdited.id).toEqual(elimsToEdit[1].id);
      expect(foundEdited.div_id).toEqual(elimsToEdit[1].div_id);
      expect(foundEdited.squad_id).toEqual(elimsToEdit[1].squad_id);
      expect(foundEdited.start).toEqual(elimsToEdit[1].start);
      expect(foundEdited.games).toEqual(elimsToEdit[1].games);      
      expect(foundEdited.fee).toEqual(elimsToEdit[1].fee);
      expect(foundEdited.sort_order).toEqual(elimsToEdit[1].sort_order); 
      const foundDeleted = savedElims.find((b) => b.id === deletedId);
      if (foundDeleted) {
        expect(foundDeleted).toBeUndefined();
        return;
      }
      expect(foundDeleted).toBeUndefined();
      const foundAdded = savedElims.find((b) => b.id === toAddElim.id);
      if (!foundAdded) {
        expect(foundAdded).not.toBeUndefined();
        return;
      }
      expect(foundAdded.id).toEqual(toAddElim.id);
      expect(foundAdded.div_id).toEqual(toAddElim.div_id);
      expect(foundAdded.squad_id).toEqual(toAddElim.squad_id);
      expect(foundAdded.start).toEqual(toAddElim.start);
      expect(foundAdded.games).toEqual(toAddElim.games);           
      expect(foundAdded.fee).toEqual(toAddElim.fee);
      expect(foundAdded.sort_order).toEqual(toAddElim.sort_order);
    })

  })

})