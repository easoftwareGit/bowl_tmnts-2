import axios, { AxiosError } from "axios";
import { baseBrktRefundsApi } from "@/lib/db/apiPaths";
import { testBaseBrktRefundsApi } from "../../../testApi";
import { brktRefundType } from "@/lib/types/types";
import { initBrktRefund } from "@/lib/db/initVals";
import { mockBrktRefundsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { maxBrackets } from "@/lib/validation";
import { deleteAllBrktRefundsForBrkt, deleteAllBrktRefundsForDiv, deleteAllBrktRefundsForSquad, deleteAllBrktRefundsForTmnt, deleteBrktRefund, getAllBrktRefundsForBrkt, getAllBrktRefundsForDiv, getAllBrktRefundsForSquad, getAllBrktRefundsForTmnt, postBrktRefund, postManyBrktRefunds, putBrktRefund, putManyBrktRefunds } from "@/lib/db/brktRefunds/dbBrktRefunds";

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

const url = testBaseBrktRefundsApi.startsWith("undefined")
  ? baseBrktRefundsApi
  : testBaseBrktRefundsApi; 
const oneBrktRefundUrl = url + "/brktRefund/";
const oneSquadUrl = url + "/squad/";
const brktUrl = url + "/brkt/";

const brktRefundsToGet: brktRefundType[] = [
  {
    ...initBrktRefund,
    id: "brf_68c9b8275e944d2fa3c2e8aaca6683d2",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_refunds: 2,          
  },
  {
    ...initBrktRefund,
    id: "brf_f4ddc98a6a014113a801801680d8ed3c",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_refunds: 2,
  },
]

const tmntIdForBrktRefunds = 'tmt_fd99387c33d9c78aba290286576ddce5';
const squadIdForBrktRefunds = 'sqd_7116ce5f80164830830a7157eb093396';
const divIdForBrktRefunds = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const brktIdForBrktRefunds = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';
const brktIdForMockData = 'brk_aa3da3a411b346879307831b6fdadd5f';

const notFoundId = "ben_01234567890123456789012345678901";
const notFoundBrktId = "brk_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const brkt1Id = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const brkt2Id = 'brk_6ede2512c7d4409ca7b055505990a499';

describe('dbBrktRefunds', () => { 

  const rePostBrktRefund = async (brktRefund: brktRefundType) => {
    try {
      // if brktEntry already in database, then don't re-post
      const getResponse = await axios.get(oneBrktRefundUrl + brktRefund.id);
      const found = getResponse.data.brktRefund;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) { 
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }
    try {
      // if not in database, then re-post
      const brktRefundJSON = JSON.stringify(brktRefund);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktRefundJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  const rePostToDel = async () => {
    const response = await axios.get(url);
    const brktRefunds = response.data.brktRefunds;
    const foundToDel = brktRefunds.find(
      (b: brktRefundType) => b.id === mockBrktRefundsToPost[0].id
    );
    if (!foundToDel) {
      try {
        await postManyBrktRefunds(mockBrktRefundsToPost);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('getAllBrktRefundsForTmnt()', () => {

    it('should get all brktRefunds for tournament', async () => { 
      const brktRefunds = await getAllBrktRefundsForTmnt(tmntIdForBrktRefunds);
      expect(brktRefunds).toHaveLength(brktRefundsToGet.length);
      if (!brktRefunds) return;
      for (let i = 0; i < brktRefunds.length; i++) {
        if (brktRefunds[i].id === brktRefundsToGet[0].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[0].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[1].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[1].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[2].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[2].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[3].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktRefunds[i].num_refunds).toEqual(brktRefundsToGet[i].num_refunds);        
      }
    })
    it('should return 0 brktRefunds for not found tournament', async () => { 
      const brktRefunds = await getAllBrktRefundsForTmnt(notFoundTmntId);
      expect(brktRefunds).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const brktRefunds = await getAllBrktRefundsForTmnt("test");
      expect(brktRefunds).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const brktRefunds = await getAllBrktRefundsForTmnt(notFoundSquadId);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if tmnt id is null', async () => { 
      const brktRefunds = await getAllBrktRefundsForTmnt(null as any);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const brktRefunds = await getAllBrktRefundsForTmnt(undefined as any);
      expect(brktRefunds).toBeNull();
    })
  })

  describe('getAllBrktRefundsForSquad()', () => {

    it('should get all brktRefunds for squad', async () => { 
      const brktRefunds = await getAllBrktRefundsForSquad(squadIdForBrktRefunds);  
      expect(brktRefunds).toHaveLength(brktRefundsToGet.length);
      if (!brktRefunds) return;
      for (let i = 0; i < brktRefunds.length; i++) {
        if (brktRefunds[i].id === brktRefundsToGet[0].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[0].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[1].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[1].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[2].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[2].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[3].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();
        expect(brktRefunds[i].num_refunds).toEqual(brktRefundsToGet[i].num_refunds);        
      }
    })
    it('should return 0 brktRefunds for not found squad', async () => { 
      const brktRefunds = await getAllBrktRefundsForSquad(notFoundSquadId);
      expect(brktRefunds).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const brktRefunds = await getAllBrktRefundsForSquad("test");
      expect(brktRefunds).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const brktRefunds = await getAllBrktRefundsForSquad(notFoundTmntId);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if squad id is null', async () => { 
      const brktRefunds = await getAllBrktRefundsForSquad(null as any);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const brktRefunds = await getAllBrktRefundsForSquad(undefined as any);
      expect(brktRefunds).toBeNull();
    })
  })

  describe('getAllBrktEntriesForDiv()', () => {

    it('should get all brktRefunds for div', async () => { 
      const brktRefunds = await getAllBrktRefundsForDiv(divIdForBrktRefunds);  
      expect(brktRefunds).toHaveLength(brktRefundsToGet.length);
      if (!brktRefunds) return;
      for (let i = 0; i < brktRefunds.length; i++) {
        if (brktRefunds[i].id === brktRefundsToGet[0].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[0].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[1].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[1].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[2].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[2].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[3].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktRefunds[i].num_refunds).toEqual(brktRefundsToGet[i].num_refunds);        
      }
    })
    it('should return 0 brktRefunds for not found div', async () => { 
      const brktRefunds = await getAllBrktRefundsForDiv(notFoundDivId);
      expect(brktRefunds).toHaveLength(0);
    })
    it('should return null if div id is invalid', async () => { 
      const brktRefunds = await getAllBrktRefundsForDiv("test");
      expect(brktRefunds).toBeNull();
    })
    it('should return null if div id is a valid id, but not a div id', async () => {
      const brktRefunds = await getAllBrktRefundsForDiv(userId);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if div id is null', async () => { 
      const brktRefunds = await getAllBrktRefundsForDiv(null as any);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if div id is undefined', async () => { 
      const brktRefunds = await getAllBrktRefundsForDiv(undefined as any);
      expect(brktRefunds).toBeNull();
    })
  })

  describe('getAllBrktRefundsForBrkt()', () => {

    it('should get all brktRefunds for brkt', async () => { 
      const brktRefunds = await getAllBrktRefundsForBrkt(brktIdForBrktRefunds);  
      expect(brktRefunds).toHaveLength(1);
      if (!brktRefunds) return;
      for (let i = 0; i < brktRefunds.length; i++) {
        if (brktRefunds[i].id === brktRefundsToGet[0].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[0].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[1].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[1].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[2].id) { 
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[2].player_id);
        } else if (brktRefunds[i].id === brktRefundsToGet[3].id) {
          expect(brktRefunds[i].player_id).toEqual(brktRefundsToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }        
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();        
        expect(brktRefunds[i].num_refunds).toEqual(brktRefundsToGet[i].num_refunds);        
      }
    })
    it('should return 0 brktRefunds for not found brkt', async () => { 
      const brktRefunds = await getAllBrktRefundsForBrkt(notFoundBrktId);
      expect(brktRefunds).toHaveLength(0);
    })
    it('should return null if brkt id is invalid', async () => { 
      const brktRefunds = await getAllBrktRefundsForBrkt("test");
      expect(brktRefunds).toBeNull();
    })
    it('should return null if brkt id is a valid id, but not a div id', async () => {
      const brktRefunds = await getAllBrktRefundsForBrkt(userId);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if brkt id is null', async () => { 
      const brktRefunds = await getAllBrktRefundsForBrkt(null as any);
      expect(brktRefunds).toBeNull();
    })
    it('should return null if brkt id is undefined', async () => { 
      const brktRefunds = await getAllBrktRefundsForBrkt(undefined as any);
      expect(brktRefunds).toBeNull();
    })
  })

  describe('postBrktRefund()', () => { 

    const brktRefundToPost = {
      ...initBrktRefund,    
      id: 'brf_0123c6c5556e407291c4b5666b2dccd7',      
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_refunds: 9,
    }

    let createdBrktRefund = false;

    const deletePostedBrktRefund = async () => { 
      const response = await axios.get(url);
      const brktRefunds = response.data.brktRefunds;
      const toDel = brktRefunds.find((b: brktRefundType) => b.num_refunds === 9);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneBrktRefundUrl + toDel.id          
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    beforeAll(async () => { 
      await deletePostedBrktRefund();
    })

    beforeEach(() => {
      createdBrktRefund = false;
    })

    afterEach(async () => {
      if (createdBrktRefund) {
        await deletePostedBrktRefund();
      }
    })

    it('should post one brktRefund', async () => { 
      const postedBrktRefund = await postBrktRefund(brktRefundToPost);
      expect(postedBrktRefund).not.toBeNull();
      if (!postedBrktRefund) return;
      createdBrktRefund = true;
      expect(postedBrktRefund.id).toEqual(brktRefundToPost.id);      
      expect(postedBrktRefund.brkt_id).toEqual(brktRefundToPost.brkt_id);
      expect(postedBrktRefund.player_id).toEqual(brktRefundToPost.player_id);
      expect(postedBrktRefund.num_refunds).toEqual(brktRefundToPost.num_refunds);
    })
    it('should not post a brktRefund with sanitized num_refunds (sanitized to 0)', async () => { 
      const toSanitizse = {
        ...brktRefundToPost,
        num_refunds: maxBrackets + 1
      }
      const postedBrktRefund = await postBrktRefund(toSanitizse);
      expect(postedBrktRefund).toBeNull();
    })
    it('should not post a brktRefund if got invalid data', async () => { 
      const invalidBrktRefund = {
        ...brktRefundToPost,
        num_refunds: 0
      }
      const postedBrktRefund = await postBrktRefund(invalidBrktRefund);
      expect(postedBrktRefund).toBeNull();
    })
  })

  describe('postManyBrktRefunds()', () => { 

    let createdBrktEntries = false;    

    beforeAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdBrktEntries = false;
    })

    afterEach(async () => {
      if (createdBrktEntries) {
        await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })

    it('should post many brktEntries', async () => {
      const brktRefunds = await postManyBrktRefunds(mockBrktRefundsToPost);
      expect(brktRefunds).not.toBeNull();
      if (!brktRefunds) return;
      createdBrktEntries = true;
      expect(brktRefunds.length).toEqual(mockBrktRefundsToPost.length);
      for (let i = 0; i < mockBrktRefundsToPost.length; i++) {
        expect(brktRefunds[i].id).toEqual(mockBrktRefundsToPost[i].id);
        expect(brktRefunds[i].brkt_id).toEqual(mockBrktRefundsToPost[i].brkt_id);
        expect(brktRefunds[i].player_id).toEqual(mockBrktRefundsToPost[i].player_id);
        expect(brktRefunds[i].num_refunds).toEqual(mockBrktRefundsToPost[i].num_refunds);
      }
    })
    it('should not post many brktEntries with no data', async () => {
      const puttedBrktRefund = await postManyBrktRefunds([]);
      expect(puttedBrktRefund).not.toBeNull();
      expect(puttedBrktRefund).toHaveLength(0);
    })
    it('should not post many brktEntries with invalid data', async () => {
      const invalidBrktEntries = cloneDeep(mockBrktRefundsToPost);
      invalidBrktEntries[1].num_refunds = 0;
      const postedBrktRefunds = await postManyBrktRefunds(invalidBrktEntries);
      expect(postedBrktRefunds).toBeNull();
    })    
  })    

  describe('putBrktRefund()', () => {

    const brktRefundToPut = {
      ...initBrktRefund,
      id: "brf_68c9b8275e944d2fa3c2e8aaca6683d2",
      brkt_id: 'brk_5109b54c2cc44ff9a3721de42c80c8c1',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_refunds: 7,
    }

    const putUrl = oneBrktRefundUrl + brktRefundToPut.id;

    const resetBrktRefund = {
      ...initBrktRefund,
      id: "brf_68c9b8275e944d2fa3c2e8aaca6683d2",
      brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      num_refunds: 2,
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetBrktRefund);
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: putUrl,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPut = false;

    beforeAll(async () => {
      await doReset();
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
    if (!didPut) return;
      await doReset();
    });

    it('should put a brktRefund', async () => {
      const puttedBrktRefund = await putBrktRefund(brktRefundToPut);
      expect(puttedBrktRefund).not.toBeNull();
      if (!puttedBrktRefund) return;
      didPut = true;      
      expect(puttedBrktRefund.brkt_id).toBe(brktRefundToPut.brkt_id);
      expect(puttedBrktRefund.player_id).toBe(brktRefundToPut.player_id);
      expect(puttedBrktRefund.num_refunds).toBe(brktRefundToPut.num_refunds);
    })
    it('should NOT put a brktRefund with sanitization, num_refunds value sanitized to 0', async () => {
      const toSanitize = cloneDeep(brktRefundToPut)
      toSanitize.num_refunds = maxBrackets + 1
      const puttedBrktRefund = await putBrktRefund(toSanitize);
      expect(puttedBrktRefund).toBeNull();
    })
    it('should NOT put a brktRefund with invalid data', async () => {
      const invalidBrktRefund = {
        ...brktRefundToPut,
        num_refunds: 0,
      }
      const puttedBrktRefund = await putBrktRefund(invalidBrktRefund);
      expect(puttedBrktRefund).toBeNull();
    })
  })

  describe('putManyBrktRefunds()', () => { 

    let createdBrktRefunds = false;    

    beforeAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })

    beforeEach(() => {
      createdBrktRefunds = false;
    })

    afterEach(async () => {
      if (createdBrktRefunds) {
        await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
      }
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })

    const testBrktRefunds: brktRefundType[] = [
      {
        ...initBrktRefund,
        id: 'brf_01ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_refunds: 3,
      },
      {
        ...initBrktRefund,
        id: 'brf_02ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_refunds: 3,
      },
      {
        ...initBrktRefund,
        id: 'brf_03ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_refunds: 3,
      },
      {
        ...initBrktRefund,
        id: 'brf_04ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_refunds: 3,
      },
      {
        ...initBrktRefund,
        id: 'brf_05ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_refunds: 3,
      },
      {
        ...initBrktRefund,
        id: 'brf_06ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_refunds: 3,
      },
    ];

    it('should update, insert and delete many brktRefunds', async () => { 
      const multiBrktRefundsTest = [
        {
          ...testBrktRefunds[0],
        },
        {
          ...testBrktRefunds[1],
        },
        {
          ...testBrktRefunds[2],
        },
        {
          ...testBrktRefunds[3],
        },
      ]
      createdBrktRefunds = true;
      const puttedBrktRefund = await postManyBrktRefunds(multiBrktRefundsTest);
      expect(puttedBrktRefund).not.toBeNull();
      if (!puttedBrktRefund) return;
      expect(puttedBrktRefund.length).toBe(multiBrktRefundsTest.length);
      // set edits, set eType
      const brktRefundsToUpdate = [
        {
          ...multiBrktRefundsTest[0],
          num_refunds: 5,
          eType: "u",
        },
        {
          ...multiBrktRefundsTest[1],
          num_refunds: 5,
          eType: "u",
        },
        {
          ...multiBrktRefundsTest[2],
          eType: "d",
        },
        {
          ...multiBrktRefundsTest[3],          
          eType: "d",
        },
        {
          ...testBrktRefunds[4],
          eType: "i",
        },
        {
          ...testBrktRefunds[5],
          eType: "i",
        },
      ]

      const updateInfo = await putManyBrktRefunds(brktRefundsToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })
    it('should return no updates, inserts or deletes when passed empty brkt refunds', async () => { 
      const multiBrktRefundsTest = [
        {
          ...testBrktRefunds[0],
        },
        {
          ...testBrktRefunds[1],
        },
        {
          ...testBrktRefunds[2],
        },
        {
          ...testBrktRefunds[3],
        },
      ]
      createdBrktRefunds = true;
      const postedBrktRefunds = await postManyBrktRefunds(multiBrktRefundsTest);
      expect(postedBrktRefunds).not.toBeNull();
      if (!postedBrktRefunds) return;
      expect(postedBrktRefunds.length).toBe(multiBrktRefundsTest.length);
      // set empty edits
      const brktRefundsToUpdate: brktRefundType[] = []
      const updateInfo = await putManyBrktRefunds(brktRefundsToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
    })
    it('should update no brkt refunds when error in data', async () => { 
      createdBrktRefunds = true;
      const postedBrktRefunds = await postManyBrktRefunds(testBrktRefunds);
      expect(postedBrktRefunds).not.toBeNull();
      if (!postedBrktRefunds) return;
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      // set edits, set eType
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          num_refunds: maxBrackets + 1,  // invalid num_refunds
          eType: "u",
        },
        {
          ...testBrktRefunds[1],
          num_refunds: 5,
          eType: "u",
        },
        {
          ...testBrktRefunds[2],
          eType: "d",
        },
        {
          ...testBrktRefunds[3],          
          eType: "d",
        },
        {
          ...testBrktRefunds[4],
          eType: "i",
        },
        {
          ...testBrktRefunds[5],
          eType: "i",
        },
      ]

      const updateInfo = await putManyBrktRefunds(brktRefundsToUpdate);
      expect(updateInfo).toBeNull();
    })
  })

  describe('deleteBrktRefund()', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initBrktRefund,
      id: "brf_d08df0c8b5a64972bf9ec9906cd3c32f",
      brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_refunds: 2,
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostBrktRefund(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostBrktRefund(toDel);
      }
    });

    it('should delete a brktRefund', async () => {
      const deleted = await deleteBrktRefund(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a brktRefund when id is not found', async () => {
      const deleted = await deleteBrktRefund(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktRefund when id is invalid', async () => {
      const deleted = await deleteBrktRefund("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktRefund when id is null', async () => {
      const deleted = await deleteBrktRefund(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a brktRefund when id is undefined', async () => {
      const deleted = await deleteBrktRefund(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllBrktRefundsForSquad()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests      
    });

    it('should delete all brktRefunds for a squad', async () => { 
      const deleted = await deleteAllBrktRefundsForSquad(squadIdForMockData);
      expect(deleted).toBe(mockBrktRefundsToPost.length);
      didDel = true;
    })
    it('should not delete all brktRefunds for a squad when squad id is not found', async () => {
      const deleted = await deleteAllBrktRefundsForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktRefunds for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllBrktRefundsForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllBrktRefundsForSquad(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a squad when squad id is null', async () => { 
      const deleted = await deleteAllBrktRefundsForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllBrktRefundsForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktRefundsForDiv()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests      
    });

    it('should delete all brktRefunds for a div', async () => { 
      const deleted = await deleteAllBrktRefundsForDiv(divIdForMockData);
      expect(deleted).toBe(mockBrktRefundsToPost.length);
      didDel = true;
    })
    it('should not delete all brktRefunds for a div when div id is not found', async () => {
      const deleted = await deleteAllBrktRefundsForDiv(notFoundDivId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktRefunds for a div when div id is invalid', async () => { 
      const deleted = await deleteAllBrktRefundsForDiv("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a div when div id is valid, but not a div id', async () => { 
      const deleted = await deleteAllBrktRefundsForDiv(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a div when div id is null', async () => { 
      const deleted = await deleteAllBrktRefundsForDiv(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a div when div id is undefined', async () => { 
      const deleted = await deleteAllBrktRefundsForDiv(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktRefundsForBrkt()', () => { 

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    });

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktRefunds for a brkt', async () => { 
      const deleted = await deleteAllBrktRefundsForBrkt(brktIdForMockData);
      expect(deleted).toBe(2); // only 2 of the 4 mock brktRefunds were deleted
      didDel = true;
    })
    it('should not delete all brktRefunds for a brkt when brkt id is not found', async () => {
      const deleted = await deleteAllBrktRefundsForBrkt(notFoundBrktId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktRefunds for a brkt when brkt id is invalid', async () => { 
      const deleted = await deleteAllBrktRefundsForBrkt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a brkt when brkt id is valid, but not a brkt id', async () => { 
      const deleted = await deleteAllBrktRefundsForBrkt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a brkt when brkt id is null', async () => { 
      const deleted = await deleteAllBrktRefundsForBrkt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a brkt when brkt id is undefined', async () => { 
      const deleted = await deleteAllBrktRefundsForBrkt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

  describe('deleteAllBrktRefundsForTmnt()', () => {     

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    });

    it('should delete all brktRefunds for a tmnt', async () => { 
      const deleted = await deleteAllBrktRefundsForTmnt(tmntIdFormMockData);
      expect(deleted).toBe(mockBrktRefundsToPost.length);
      didDel = true;
    })
    it('should not delete all brktRefunds for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllBrktRefundsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all brktRefunds for a tmnt when tmnt id is invalid', async () => { 
      const deleted = await deleteAllBrktRefundsForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllBrktRefundsForTmnt(userId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a tmnt when tmnt id is null', async () => { 
      const deleted = await deleteAllBrktRefundsForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all brktRefunds for a tmnt when tmnt id is undefined', async () => { 
      const deleted = await deleteAllBrktRefundsForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
  })

})