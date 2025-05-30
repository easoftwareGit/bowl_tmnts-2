import axios, { AxiosError } from "axios";
import { baseBrktRefundsApi } from "@/lib/db/apiPaths";
import { testBaseBrktRefundsApi } from "../../../testApi";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";
import { mockBrktRefundsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { deleteAllBrktRefundsForTmnt, postManyBrktRefunds } from "@/lib/db/brktRefunds/dbBrktRefunds";
import { maxBrackets } from "@/lib/validation";

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
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 

describe("BrktRefunds - API's: /api/brktRefunds", () => { 

  const testBrktRefund = {
    ...initBrktEntry,
    id: "brf_68c9b8275e944d2fa3c2e8aaca6683d2",
    brkt_entryid: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    num_refunds: 2,
  }

  const tmntIdForBrktRefunds = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const squadIdForBrktRefunds = 'sqd_7116ce5f80164830830a7157eb093396';
  const divIdForBrktRefunds = 'div_f30aea2c534f4cfe87f4315531cef8ef';
  const brktIdForBrktRefunds = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

  const tmntIdFormMockData = 'tmt_56d916ece6b50e6293300248c6792316';
  const divIdForMockData = 'div_1f42042f9ef24029a0a2d48cc276a087';
  const squadIdForMockData = 'sqd_1a6c885ee19a49489960389193e8f819';
  const brktIdForMockData = 'brk_aa3da3a411b346879307831b6fdadd5f';

  const notFoundId = "brf_01234567890123456789012345678901";
  const notFoundBrktId = "brk_01234567890123456789012345678901";
  const notFoundDivId = "div_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const userId = "usr_01234567890123456789012345678901";

  const brkt1Id = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
  const brkt2Id = 'brk_6ede2512c7d4409ca7b055505990a499';

  const deletePostedBrktRefund = async () => {
    const response = await axios.get(url);
    const brktRefunds = response.data.brktRefunds;
    const toDel = brktRefunds.find((b: brktRefundType) => b.num_refunds === 3);
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

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedBrktRefund();
    })

    it('should get all brktRefunds', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 7 rows currently in prisma/seed.ts
      expect(response.data.brktRefunds).toHaveLength(7);
    })      
  })
  
  describe('GET one brktRefund API: /api/brktRefunds/brktRefund/:id', () => { 

    it('should get one brktRefund by ID', async () => {
      try {
        const urlToUse = oneBrktRefundUrl + testBrktRefund.id;
        const response = await axios.get(urlToUse);
        expect(response.status).toBe(200);        
        const brktRefund = response.data.brktRefund;
        expect(brktRefund.id).toEqual(testBrktRefund.id);        
        expect(brktRefund.brkt_id).toEqual(testBrktRefund.brkt_id);
        expect(brktRefund.player_id).toEqual(testBrktRefund.player_id);
        expect(brktRefund.num_refunds).toEqual(testBrktRefund.num_refunds);          
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one brktRefund by ID when id is invalid', async () => {
      try {
        const response = await axios.get(oneBrktRefundUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one brktRefund by ID when id is valid, but not a brktRefund id', async () => {
      try {
        const response = await axios.get(oneBrktRefundUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one brktRefund by ID when id is not found', async () => {
      try {
        const response = await axios.get(oneBrktRefundUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })
  
  describe('GET all brktRefunds for one div API: /api/brktRefunds/div/:divId', () => { 

    beforeAll(async () => {
      await deletePostedBrktRefund();
    })

    it('should get all brktRefunds for one div', async () => { 
      const response = await axios.get(divUrl + divIdForBrktRefunds);
      expect(response.status).toBe(200);        
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(2); // 2 brktRefunds for div in prisma/seeds.ts
      for (let i = 0; i < brktRefunds.length; i++) {        
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();
        expect(brktRefunds[i].num_refunds).toBeGreaterThan(0);
      }      
    })
    it('should not get all brktRefunds for one div when divId is invalid', async () => {
      try {
        const response = await axios.get(divUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one div when divId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(divUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one div when divId is not found', async () => {      
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(0);
    })    
  })

  describe('GET all brktRefunds for one squad API: /api/brktRefunds/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedBrktRefund();
    })

    it('should get all brktRefunds for one squad', async () => { 
      const response = await axios.get(squadUrl + squadIdForBrktRefunds);
      expect(response.status).toBe(200);
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(2); // 2 brktRefunds for squad in prisma/seeds.ts
      for (let i = 0; i < brktRefunds.length; i++) {
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();
        expect(brktRefunds[i].num_refunds).toBeGreaterThan(0);
      }      
    })
    it('should not get all brktRefunds for one squad when squadId is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one squad when squadId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(squadUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one squad when squadId is not found', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(0);
    })    
  })

  describe('GET all brktRefunds for one brkt API: /api/brktRefunds/brkt/:brktId', () => { 

    beforeAll(async () => {
      await deletePostedBrktRefund();
    })

    it('should get all brktRefunds for one brkt', async () => { 
      const response = await axios.get(brktUrl + brktIdForBrktRefunds);
      expect(response.status).toBe(200);        
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(1); // 1 brktRefunds for brkt in prisma/seeds.ts
      for (let i = 0; i < brktRefunds.length; i++) {
        expect(brktRefunds[i].brkt_id).toBe(brktIdForBrktRefunds);
        expect(brktRefunds[i].num_refunds).toBeGreaterThan(0);
      }      
    })
    it('should not get all brktRefunds for one brkt when brktId is invalid', async () => {
      try {
        const response = await axios.get(brktUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one brkt when brktId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(brktUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one brkt when brktId is not found', async () => {
      const response = await axios.get(brktUrl + notFoundBrktId);
      expect(response.status).toBe(200);
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(0);
    })        
  })

  describe('GET all brktRefunds for one tmnt API: /api/brktRefunds/tmnt/:tmntId', () => { 

    beforeAll(async () => {
      await deletePostedBrktRefund();
    })

    it('should get all brktRefunds for one tmnt', async () => { 
      const response = await axios.get(tmntUrl + tmntIdForBrktRefunds);
      expect(response.status).toBe(200);        
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(2); // 2 brktRefunds for tmnt in prisma/seeds.ts
      for (let i = 0; i < brktRefunds.length; i++) {
        expect(brktRefunds[i].brkt_id === brkt1Id || brktRefunds[i].brkt_id === brkt2Id).toBeTruthy();
        expect(brktRefunds[i].num_refunds).toBeGreaterThan(0);
      }      
    })
    it('should not get all brktRefunds for one tmnt when tmntId is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one tmnt when tmntId is valid, but not a div id', async () => {
      try {
        const response = await axios.get(tmntUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get all brktRefunds for one tmnt when tmntId is not found', async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const brktRefunds = response.data.brktRefunds;
      expect(brktRefunds).toHaveLength(0);
    })    
  })

  describe('POST one brktRefund API: /api/brktRefunds', () => { 
    
    const brktRefundToPost: brktRefundType = {
      ...initBrktRefund,  
      id: 'brf_dc6af327b9ae4b40bc54bbb28963e558',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_91c5aa1c14644e03b6735abd1480ee32',
      num_refunds: 3,      
    }

    let createdBrktRefund = false;

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
      const brktRefundJSON = JSON.stringify(brktRefundToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktRefundJSON
      });      
      expect(response.status).toBe(201);
      createdBrktRefund = true;
      const brktRefund = response.data.brktRefund;
      expect(brktRefund.id).toEqual(brktRefundToPost.id);      
      expect(brktRefund.brkt_id).toEqual(brktRefundToPost.brkt_id);
      expect(brktRefund.player_id).toEqual(brktRefundToPost.player_id);
      expect(brktRefund.num_refunds).toEqual(brktRefundToPost.num_refunds);
    })
    it('should NOT post a sanitized brktRefund (saninted num_refunds = "abc")', async () => { 
      const toSanitize = {
        ...brktRefundToPost,
        num_refunds: 'abc' 
      }
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not post one brktRefund when id is blank', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        id: ''
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not post one brktRefund when brkt_id is blank', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        brkt_id: ''
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when player_id is blank', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        player_id: ''
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when num_refunds is null', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        num_refunds: null as any
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })    
    it('should not post one brktRefund when id is invalid', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        id: 'test'
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when id is valid, but not a brktRefund id', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        id: userId
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when brkt_id is invalid', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        brkt_id: 'test'
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when brkt_id is valid, bit not a div id', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        brkt_id: userId
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not post one brktRefund when player_id is invalid', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        player_id: 'test'
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktRefund when player_id is valid, but not a player id', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        player_id: userId
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktRefund when num_refunds is too low', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        num_refunds: -1
      }
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not post one brktRefund when num_refunds is too high', async () => {
      const invalidbrktRefund = {
        ...brktRefundToPost,
        num_refunds: 1234567890
      } 
      const brktRefundJSON = JSON.stringify(invalidbrktRefund);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktRefundJSON
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      } 
    })
  })

  describe('POST many brktRefunds for one tmnt API: /api/brktRefunds/many', () => { 

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

    it('should create many brktRefunds', async () => {
      const brktRefundJSON = JSON.stringify(mockBrktRefundsToPost);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktEntries = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(mockBrktRefundsToPost.length);
      for (let i = 0; i < mockBrktRefundsToPost.length; i++) {
        expect(postedBrktRefunds[i].id).toBe(mockBrktRefundsToPost[i].id);        
        expect(postedBrktRefunds[i].brkt_id).toBe(mockBrktRefundsToPost[i].brkt_id);
        expect(postedBrktRefunds[i].player_id).toBe(mockBrktRefundsToPost[i].player_id);
        expect(postedBrktRefunds[i].num_refunds).toBe(mockBrktRefundsToPost[i].num_refunds);
      }
    })
    it('should NOT create many brktRefunds with sanitzied num_refunds data, num_refunds sanitized to 0', async () => { 
      const toSanitize = cloneDeep(mockBrktRefundsToPost);
      toSanitize[0].num_refunds = 1234567890;
      const brktRefundJSON = JSON.stringify(toSanitize);      
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('shold NOT create many brktRefunds with blank ids', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].id = '';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with blank brkt_id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].brkt_id = '';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with blank player_id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].player_id = '';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with num_refunds set to null', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].num_refunds = null as any;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with invalid id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].id = 'test';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with valid id, but not a brktEntry id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].id = userId;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with invalid brkt_id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].brkt_id = 'test';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with valid brkt_id, but not a div id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].brkt_id = userId;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with invalid player_id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].player_id = 'test';
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds with valid player_id, but not a player id', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].player_id = userId;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds when num_refunds to too low', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);      
      toSanitize[1].num_refunds = 0;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds when num_refunds to too high', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);
      toSanitize[1].num_refunds = 9999999999;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds when num_refunds not a number', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);
      toSanitize[1].num_refunds = 'test' as any;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create many brktRefunds when num_refunds not an integer', async () => {
      const toSanitize = cloneDeep(mockBrktRefundsToPost);
      toSanitize[1].num_refunds = 1.5;
      const brktRefundJSON = JSON.stringify(toSanitize);
      try {
        const response = await axios({
          method: "post",
          data: brktRefundJSON,
          withCredentials: true,
          url: manyUrl,        
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('PUT one brktRefund API: /api/brktRefunds/brktRefund/:id', () => { 

    const resetBrktRefund = async () => {
      // make sure test player is reset in database
      const brktRefundJSON = JSON.stringify(testBrktRefund);
      const putResponse = await axios({
        method: "put",
        data: brktRefundJSON,
        withCredentials: true,
        url: oneBrktRefundUrl + testBrktRefund.id,
      })
    }

    const putBrktRefund = {
      ...testBrktRefund,      
      brkt_id: 'brk_3e6bf51cc1ca4748ad5e8abab88277e0',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
      num_refunds: 5,
    }

    let didPut = false;

    beforeAll(async () => {
      await resetBrktRefund()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetBrktRefund()
      }      
    })

    it('should update a brktRefund by ID', async () => {
      const brktRefundJSON = JSON.stringify(putBrktRefund);
      const response = await axios({
        method: "put",
        data: brktRefundJSON,
        withCredentials: true,
        url: oneBrktRefundUrl + testBrktRefund.id,
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedBrktRefund = response.data.brktRefund;
      // did not update squad_id      
      expect(puttedBrktRefund.brkt_id).toBe(putBrktRefund.brkt_id);
      expect(puttedBrktRefund.player_id).toBe(putBrktRefund.player_id);
      expect(puttedBrktRefund.num_refunds).toBe(putBrktRefund.num_refunds);
    })
    it('should not update a brktRefund by ID when brkt_id is blank', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        brkt_id: ''
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktRefund by ID when player_id is blank', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        player_id: ''
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktRefund by ID when num_refunds is null', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        num_refunds: null as any,
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not update a brktRefund by ID when num_refunds is too low', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        num_refunds: 0
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktRefund by ID when num_refunds is too high', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        num_refunds: 1234567890
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not update a brktRefund by ID when num_refunds is not a number', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        num_refunds: 'not a number' as any
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not update a brktRefund by ID when num_refunds is not an integer', async () => {
      const invalidBrktRefund = {
        ...putBrktRefund,
        num_refunds: 1.2
      }
      const brktRefundJSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "put",
          data: brktRefundJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
  })

  describe('PUT many brktRefunds API: /api/brktRefunds/many', () => {  

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

    const testBrktRefunds: brktRefundType[] = [
      {
        ...initBrktRefund,
        id: 'brf_01ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        num_refunds: 1,
      },
      {
        ...initBrktRefund,
        id: 'brf_02ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_refunds: 1,
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
        num_refunds: 5,
      },
      {
        ...initBrktRefund,
        id: 'brf_06ee0472be3d476ea1caa99dd05953fa',
        player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        num_refunds: 5,
      },
    ];

    it('should update many brktRefunds - just update 1 player 2 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // change number of refunds add eType = 'u'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          num_refunds: 7,
          eType: "u",
        },
        {
          ...testBrktRefunds[1],
          num_refunds: 7,
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should update many brktRefunds - just update 2 player 1 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // change number of refunds add eType = 'u'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          num_refunds: 7,
          eType: "u",
        },
        {
          ...testBrktRefunds[2],
          num_refunds: 7,          
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should update many brktRefunds - just update 2 player 2 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // change number of brackets, add eType = 'u'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          num_refunds: 7,
          eType: "u",
        },
        {
          ...testBrktRefunds[1],
          num_refunds: 7,          
          eType: "u",
        },
        {
          ...testBrktRefunds[2],
          num_refunds: 9,          
          eType: "u",
        },
        {
          ...testBrktRefunds[3],
          num_refunds: 9,          
          eType: "u",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(4);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktRefunds - just insert 1 player 2 bracket entry', async () => {
      createdBrktRefunds = true;
      
      // add eType = 'i'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "i",
        },
        {
          ...testBrktRefunds[1],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktRefunds - just insert 2 player 1 bracket entry', async () => {
      createdBrktRefunds = true;
      
      // add eType = 'i'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "i",
        },
        {
          ...testBrktRefunds[2],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should insert many brktRefunds - just insert 2 player 2 bracket entry', async () => {
      createdBrktRefunds = true;
      
      // add eType = 'i'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "i",
        },
        {
          ...testBrktRefunds[1],
          eType: "i",
        },
        {
          ...testBrktRefunds[2],
          eType: "i",
        },
        {
          ...testBrktRefunds[3],
          eType: "i",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(4);
      expect(updateInfo.deletes).toBe(0);
    });
    it('should delete many brktRefunds - just delete 1 player 2 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // add eType = 'd'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "d",
        },
        {
          ...testBrktRefunds[1],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should delete many brktRefunds - just delete 2 player 1 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // add eType = 'd'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "d",
        },
        {
          ...testBrktRefunds[2],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should delete many brktRefunds - just delete 2 player 2 bracket entry', async () => {
      const brktRefundJSON = JSON.stringify(testBrktRefunds);
      const response = await axios({
        method: "post",
        data: brktRefundJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(testBrktRefunds.length);
      
      // add eType = 'd'
      const brktRefundsToUpdate = [
        {
          ...testBrktRefunds[0],
          eType: "d",
        },
        {
          ...testBrktRefunds[1],
          eType: "d",
        },
        {
          ...testBrktRefunds[2],
          eType: "d",
        },
        {
          ...testBrktRefunds[3],
          eType: "d",
        },
      ]

      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(4);
    });
    it('should update, insert and delete many brktEntries', async () => {
      const multiBrktEntriesTest = [
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
      const potEntryJSON = JSON.stringify(multiBrktEntriesTest);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(multiBrktEntriesTest.length);

      // set edits, set eType
      const brktRefundsToUpdate = [
        {
          ...multiBrktEntriesTest[0],
          num_refunds: 7,          
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[1],
          num_refunds: 7,          
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[2],
          eType: "d",
        },
        {
          ...multiBrktEntriesTest[3],          
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
      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })
      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    });
    it('should NOT update, insert and delete many brktEntries with invalid data', async () => {
      const multiBrktEntriesTest = [
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
      const potEntryJSON = JSON.stringify(multiBrktEntriesTest);
      const response = await axios({
        method: "post",
        data: potEntryJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedBrktRefunds = response.data.brktRefunds;
      expect(response.status).toBe(201);
      createdBrktRefunds = true;
      expect(postedBrktRefunds).not.toBeNull();
      expect(postedBrktRefunds.length).toBe(multiBrktEntriesTest.length);

      // set edits, set eType
      const brktRefundsToUpdate = [
        {
          ...multiBrktEntriesTest[0],
          num_refunds: maxBrackets + 1,          
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[1],
          num_refunds: 7,          
          eType: "u",
        },
        {
          ...multiBrktEntriesTest[2],
          eType: "d",
        },
        {
          ...multiBrktEntriesTest[3],          
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
      const toUpdateJSON = JSON.stringify(brktRefundsToUpdate)
      try {
        const updateResponse = await axios({
          method: "put",
          data: toUpdateJSON,
          withCredentials: true,
          url: manyUrl,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  })  

  describe('PATCH one brktRefund API: /api/brktRefunds/brktRefund/:id', () => { 

    const toPatch = {
      id: testBrktRefund.id,
    }
    
    const doResetBrktRefund = async () => {
      try {
        const playerJSON = JSON.stringify(testBrktRefund);
        const putResponse = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: oneBrktRefundUrl + testBrktRefund.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetBrktRefund
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetBrktRefund();
      }
    })

    it('should patch brkt_id in a brktRefund by ID', async () => { 
      const toPatchedBrktId = 'brk_3e6bf51cc1ca4748ad5e8abab88277e0'
      const patchBrktRefund = {
        ...toPatch,
        brkt_id: toPatchedBrktId,
      }
      const brktRefundSON = JSON.stringify(patchBrktRefund);
      const response = await axios({
        method: "patch",
        data: brktRefundSON,
        withCredentials: true,
        url: oneBrktRefundUrl + toPatch.id,
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktRefund = response.data.brktRefund;
      expect(patchedBrktRefund.id).toBe(toPatch.id);
      expect(patchedBrktRefund.brkt_id).toBe(toPatchedBrktId);      
    })
    it('should patch player_id in a brktRefund by ID', async () => { 
      const toPatchedPlayerId = 'ply_a01758cff1cc4bab9d9133e661bd49b0'
      const patchBrktRefund = {
        ...toPatch,
        player_id: toPatchedPlayerId,
      }
      const brktRefundSON = JSON.stringify(patchBrktRefund);
      const response = await axios({
        method: "patch",
        data: brktRefundSON,
        withCredentials: true,
        url: oneBrktRefundUrl + toPatch.id,
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktRefund = response.data.brktRefund;
      expect(patchedBrktRefund.id).toBe(toPatch.id);
      expect(patchedBrktRefund.player_id).toBe(toPatchedPlayerId);      
    })      
    it('should patch num_refunds in a brktRefund by ID', async () => { 
      const toPatchNumRefunds = 3
      const patchBrktRefund = {
        ...toPatch,
        num_refunds: toPatchNumRefunds,
      }
      const brktRefundSON = JSON.stringify(patchBrktRefund);
      const response = await axios({
        method: "patch",
        data: brktRefundSON,
        withCredentials: true,
        url: oneBrktRefundUrl + toPatch.id,
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedBrktRefund = response.data.brktRefund;
      expect(patchedBrktRefund.id).toBe(toPatch.id);
      expect(patchedBrktRefund.num_refunds).toBe(toPatchNumRefunds);
    })
    it('should not patch a brktRefund by ID when brkt_id is blank', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        brkt_id: ''
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })  
    it('should not patch a brktRefund by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktRefund = {
        ...toPatch,
        brkt_id: userId
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not patch a brktRefund by ID when brkt_id is invalid', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        brkt_id: 'test'
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })
    it('should not patch a brktRefund by ID when brkt_id is valid, but not a div id', async () => { 
      const invalidBrktRefund = {
        ...toPatch,
        brkt_id: userId
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktRefund by ID when player_id is blank', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        player_id: ''
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }       
    })
    it('should not patch a brktRefund by ID when player_id is invalid', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        player_id: 'test'
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }      
    })      
    it('should not patch a brktRefund by ID when player_id is valid, but not a player id', async () => { 
      const invalidBrktRefund = {
        ...toPatch,
        player_id: userId
      }
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })

    it('should not patch a brktRefund by ID when num_refunds is too low', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        num_refunds: 0
      } 
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktRefund by ID when num_refudns is too high', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        num_refunds: 1234567890
      } 
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktRefund by ID when num_refunds is not a number', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        num_refunds: 'abc' as any
      } 
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
    it('should not patch a brktRefund by ID when num_refunds is not an integer', async () => {
      const invalidBrktRefund = {
        ...toPatch,
        num_refunds: 2.3
      } 
      const brktRefundSON = JSON.stringify(invalidBrktRefund);
      try {
        const response = await axios({
          method: "patch",
          data: brktRefundSON,
          withCredentials: true,
          url: oneBrktRefundUrl + toPatch.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }        
      }
    })
  })

  describe('DELETE by ID - API: /api/brktRefunds/brktRefund/:id', () => { 

    // from prisma/seeds.ts
    const toDelBrktRefund = {
      ...initBrktRefund,
      // id: "brf_d08df0c8b5a64972bf9ec9906cd3c32f",
      // brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
      // player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
      // num_refunds: 2,      
      id: "brf_d08df0c8b5a64972bf9ec9906cd3c32f",
      brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      num_refunds: 2,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted brktRefund, add event back
      try {
        const playerJSON = JSON.stringify(toDelBrktRefund);
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: url,
        });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a brktRefund by ID', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktRefundUrl + toDelBrktRefund.id,
        });
        expect(response.status).toBe(200);
        didDel = true;
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it(('should NOT delete a brktRefund by ID when ID is invalid'), async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktRefundUrl + "invalid_id",
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a brktRefund by ID when id is valid, but noy a brktRefund id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktRefundUrl + userId,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a brktRefund by ID when id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktRefundUrl + notFoundId,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('DELETE all brktRefunds for one brkt - API: /api/brktRefunds/brkt/:brktId', () => { 

    let didDel = false

    beforeAll(async () => {
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)      
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktRefunds for one brkt', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + brktIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(2); // 2 brktRefunds deleted from mock data
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one brkt when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one brkt when ID valid, but not a brkt ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 brktRefunds for a brkt when brkt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: brktUrl + notFoundBrktId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all brktRefunds for one div - API: /api/brktRefunds/div/:divId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)      
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktRefunds for one div', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + divIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(mockBrktRefundsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one div when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one div when ID valid, but not a div ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 brktRefunds for a div when div id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + notFoundDivId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

  describe('DELETE all brktRefunds for one squad - API: /api/brktRefunds/squad/:squadId', () => {       

    let didDel = false

    beforeAll(async () => {
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)      
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktRefunds for one squad', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForMockData
        });
        expect(response.status).toBe(200);
        didDel = true
        expect(response.data.deleted.count).toBe(mockBrktRefundsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one squad when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for one squad when ID valid, but not a squad ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 brktRefunds for a squad when squad id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundSquadId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })
  
  describe('DELETE all brktRefunds for one tmnt - API: /api/brktRefunds/tmnt/:tmntId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    beforeEach(() => {      
      didDel = false      
    })

    afterEach(async () => {
      if (!didDel) return;
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)      
      await postManyBrktRefunds(mockBrktRefundsToPost)
    })

    afterAll(async () => {
      await deleteAllBrktRefundsForTmnt(tmntIdFormMockData)
    })

    it('should delete all brktRefunds for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdFormMockData
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(mockBrktRefundsToPost.length);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for a tmnt when tmnt id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + 'test'
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all brktRefunds for a tmnt when tmnt id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + userId
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should delete 0 brktRefunds for a tmnt when tmnt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundTmntId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })
  })

})