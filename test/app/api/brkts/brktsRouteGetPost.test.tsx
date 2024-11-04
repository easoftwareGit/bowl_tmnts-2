import axios, { AxiosError } from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";
import { mockBrktsToPost, tmntToDelId, mockDivs, mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/divsAxios";
import { deleteAllTmntBrkts } from "@/lib/db/brkts/brktsAxios";

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

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi; 
const oneBrktUrl = url + "/brkt/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";

const notFoundId = "brk_01234567890123456789012345678901";
const nonBrktId = "usr_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const tmntBrktId1 = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const tmntBrktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';

describe('Brkts - GET and POST API: /api/brkts', () => { 

  const testBrkt: brktType = {
    ...initBrkt,
    id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    start: 1,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
    sort_order: 1,
  }

  const deletePostedBrkt = async () => { 
    const response = await axios.get(url);
    const brkts = response.data.brkts;
    const toDel = brkts.find((b: brktType) => b.fee === '3');
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBrktUrl + toDel.id          
        });        
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedBrkt();
    })

    it('should get all brkts', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 5 rows in prisma/seed.ts
      expect(response.data.brkts).toHaveLength(5);
    })

  })

  describe('GET by ID - API: /api/brkts/brkt/:id', () => { 

    it('should get brkt by ID', async () => { 
      const response = await axios.get(oneBrktUrl + testBrkt.id);
      expect(response.status).toBe(200);
      const brkt = response.data.brkt;
      expect(brkt.id).toBe(testBrkt.id);
      expect(brkt.squad_id).toBe(testBrkt.squad_id);
      expect(brkt.div_id).toBe(testBrkt.div_id);
      expect(brkt.start).toBe(testBrkt.start);
      expect(brkt.games).toBe(testBrkt.games);
      expect(brkt.players).toBe(testBrkt.players);
      expect(brkt.fee).toBe(testBrkt.fee);
      expect(brkt.first).toBe(testBrkt.first);
      expect(brkt.second).toBe(testBrkt.second);
      expect(brkt.admin).toBe(testBrkt.admin);
      expect(brkt.fsa).toBe('40');
      expect(brkt.sort_order).toBe(testBrkt.sort_order);
    })
    it('should NOT get brkt by id when ID is invalid', async () => {
      try {
        const response = await axios.get(oneBrktUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get brkt by id when ID is not found', async () => { 
      try {
        const response = await axios.get(oneBrktUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get brkt by id when ID id valid, but not a brkt ID', async () => { 
      try {
        const response = await axios.get(oneBrktUrl + nonBrktId);
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

  describe('GET brkts for squad API: /api/brkts/squad/:id', () => { 

    beforeAll(async () => {
      await deletePostedBrkt();
    })

    it('should get all brkts for squad', async () => { 
      const multiBrktSquadId = "sqd_7116ce5f80164830830a7157eb093396";
      const squadBrktId1 = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
      const squadBrktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';
  
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + multiBrktSquadId
      })

      expect(response.status).toBe(200);
      // 2 rows for squad in prisma/seed.ts
      expect(response.data.brkts).toHaveLength(2);
      const brkts: brktType[] = response.data.brkts;
      // query in /api/brkts/squad/ GET sorts by sort_order
      expect(brkts[0].id).toBe(squadBrktId1);
      expect(brkts[1].id).toBe(squadBrktId2);   
      expect(brkts[0].start).toBe(1);
      expect(brkts[1].start).toBe(4);
      expect(brkts[0].fee).toBe('5');
      expect(brkts[1].fee).toBe('5');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].fsa).toBe('40');
      expect(brkts[0].fsa).toBe('40');      
    })
    it('should NOT get all brkts for squad when squad ID is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 200 if no brkts for squad found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + notFoundSquadId
      })
      expect(response.status).toBe(200);
      expect(response.data.brkts).toHaveLength(0);
    })
    it('should NOT get all brkts for squad when squad ID id valid, but not a brkt ID', async () => { 
      try {
        const response = await axios.get(squadUrl + nonBrktId);
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

  describe('GET brkts for div API: /api/brkts/div/:id', () => { 

    beforeAll(async () => {
      await deletePostedBrkt();
    })

    it('should get all brkts for div', async () => { 
      const multiBrktDivId = "div_f30aea2c534f4cfe87f4315531cef8ef";
      const divBrktId1 = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
      const divBrktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: divUrl + multiBrktDivId
      })

      expect(response.status).toBe(200);
      // 2 rows for div in prisma/seed.ts
      expect(response.data.brkts).toHaveLength(2);
      const brkts: brktType[] = response.data.brkts;
      // query in /api/brkts/squad/ GET sorts by sort_order
      expect(brkts[0].id).toBe(divBrktId1);
      expect(brkts[1].id).toBe(divBrktId2);      
      expect(brkts[0].start).toBe(1);
      expect(brkts[1].start).toBe(4);
      expect(brkts[0].fee).toBe('5');
      expect(brkts[1].fee).toBe('5');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].fsa).toBe('40');
      expect(brkts[0].fsa).toBe('40');
    })
    it('should NOT get all brkts for div when div ID is invalid', async () => {
      try {
        const response = await axios.get(divUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 200 if no brkts for div found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: divUrl + notFoundDivId
      })
      expect(response.status).toBe(200);
      expect(response.data.brkts).toHaveLength(0);
    })
    it('should NOT get all brkts for div when div ID id valid, but not a brkt ID', async () => { 
      try {
        const response = await axios.get(divUrl + nonBrktId);
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

  describe('GET brkts for tmnt API: /api/brkts/tmnt/:tmntId', () => { 

    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';

    beforeAll(async () => {
      await deletePostedBrkt();
    })

    it('should get all brkts for tmnt', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId
      })
      // 2 rows for squad for event for tmnt in prisma/seed.ts
      expect(response.data.brkts).toHaveLength(2);
      const brkts: brktType[] = response.data.brkts;
      // query in /api/brkts/tmnt/ GET sorts by sort_order
      expect(brkts[0].id).toBe(tmntBrktId1);
      expect(brkts[1].id).toBe(tmntBrktId2);
      expect(brkts[0].start).toBe(1);
      expect(brkts[1].start).toBe(4);
      expect(brkts[0].fee).toBe('5');
      expect(brkts[1].fee).toBe('5');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].first).toBe('25');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].second).toBe('10');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].admin).toBe('5');
      expect(brkts[0].fsa).toBe('40');
      expect(brkts[0].fsa).toBe('40');
    })
    it('should NOT get all brkts for tmnt when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + 'test'
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 200 if no brkts for tmnt found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId
      })
      expect(response.status).toBe(200);
      expect(response.data.brkts).toHaveLength(0);
    })
    it('should NOT get all brkts for tmnt when ID is valid id, not a valid tmnt id', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + nonBrktId
        })
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

  describe('POST', () => {

    const brktToPost: brktType = {
      ...initBrkt,      
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: 'div_66d39a83d7a84a8c85d28d8d1b2c7a90',
      start: 1,
      games: 3,
      players: 8,
      fee: '3',
      first: '15',
      second: '6',
      admin: '3',
      fsa: '24',
      sort_order: 1,
    }

    let createdBrkt = false;

    beforeAll(async () => {
      await deletePostedBrkt();
    })

    beforeEach(() => {
      createdBrkt = false;
    })

    afterEach(async () => {
      if (createdBrkt) {
        await deletePostedBrkt();
      }
    })

    it('should create a new brkt', async () => {
      const brktJSON = JSON.stringify(brktToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktJSON
      })
      expect(response.status).toBe(201);
      const postedBrkt = response.data.brkt;
      createdBrkt = true;
      expect(postedBrkt.id).toBe(brktToPost.id);
      expect(postedBrkt.squad_id).toBe(brktToPost.squad_id);
      expect(postedBrkt.div_id).toBe(brktToPost.div_id);
      expect(postedBrkt.fee).toBe(brktToPost.fee);
      expect(postedBrkt.first).toBe(brktToPost.first);
      expect(postedBrkt.second).toBe(brktToPost.second);
      expect(postedBrkt.admin).toBe(brktToPost.admin);
      expect(postedBrkt.sort_order).toBe(brktToPost.sort_order);      
    })
    it('should NOT create a new brkt when squad id is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        id: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when squad id is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        squad_id: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when div id is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        div_id: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when start is null', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        start: null as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when games is null', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        games: null as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when players is null', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        players: null as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when fee is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when first is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        first: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when second is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        second: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when admin is blank', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        admin: "",
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when sort_order is null', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        sort_order: null as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when squad_id is not a valid squad ID', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        squad_id: notFoundId, // use valid brkt ID, not a squad ID
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when div_id is not a valid div ID', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        div_id: notFoundId, // use valid brkt ID, not a squad ID
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when start is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        start: 0,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when start is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        start: 100,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when start is not an integer', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        start: 1.5,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when start is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        start: 'abc' as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when games is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        games: 0,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when games is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        games: 100,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when games is not an integer', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        games: 1.5,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when games is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        games: 'abc' as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when players is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        players: 0,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when players is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        players: 100,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when players is not an integer', async () => { 
      const invalidBrkt: brktType = {  
        ...initBrkt,
        players: 1.5,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when players is not a number', async () => { 
      const invalidBrkt: brktType = {  
        ...initBrkt,
        players: 'abc' as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when fee is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: '0',
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when fee is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: '1234567'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when fee is not a number', async () => {
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: 'invalid'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when first is too low', async () => {
      const invalidBrkt: brktType = {  
        ...initBrkt,
        first: '0'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when first is too high', async () => {
      const invalidBrkt: brktType = {  
        ...initBrkt,
        first: '1234567'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when first is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        first: 'invalid'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when second is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        second: '0'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when second is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        second: '1234567'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when second is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        second: 'invalid'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when admin is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        admin: '0'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when admin is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        admin: '1234567'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when admin is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        admin: 'invalid'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when fsa is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fsa: '0'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when fsa is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fsa: '1234567'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when fsa is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fsa: 'invalid'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when sort_order is too low', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        sort_order: 0,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when sort_order is too high', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        sort_order: 1234567,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when sort_order is not an integer', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        sort_order: 1.5,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create a new brkt when sort_order is not a number', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        sort_order: 'abc' as any,
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when (fee * players) !== fsa', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: '3',
        fsa: '25'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('it should NOT create a new brkt when (fee * players) !== first + second + admin', async () => { 
      const invalidBrkt: brktType = {
        ...initBrkt,
        fee: '3',
        first: '15',
        second: '6',
        admin: '4'
      }
      const brktJSON = JSON.stringify(invalidBrkt);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: brktJSON
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
    it('should NOT create new brkt when div_id + start is not unique', async () => {
      const invalidPot = {
        ...brktToPost,
        squad_id: testBrkt.squad_id,
        div_id: testBrkt.div_id,
        start: 1,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
        })
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should create a new brkt with sanitzed data', async () => { 
      const toSanitizeBrkt: brktType = {
        ...brktToPost,
        id: btDbUuid('brk'),
        fee: '3.001',
        first: '15.002',
        second: '6.003',
        admin: '3.004',
        fsa: '24.001',
      }
      const brktJSON = JSON.stringify(toSanitizeBrkt);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: brktJSON
      })
      expect(response.status).toBe(201);
      const postedBrkt = response.data.brkt;
      createdBrkt = true;
      expect(postedBrkt.id).toBe(toSanitizeBrkt.id); // use toSanitizedbrkt.id
      expect(postedBrkt.squad_id).toBe(brktToPost.squad_id);
      expect(postedBrkt.div_id).toBe(brktToPost.div_id);
      expect(postedBrkt.fee).toBe(brktToPost.fee);
      expect(postedBrkt.first).toBe(brktToPost.first);
      expect(postedBrkt.second).toBe(brktToPost.second);
      expect(postedBrkt.admin).toBe(brktToPost.admin);
      expect(postedBrkt.sort_order).toBe(brktToPost.sort_order);      
    })

  })

  describe('POST many brkts API: /api/brkts/many', () => { 

    let createdBrkts = false;    

    beforeAll(async () => { 
      // remove any old test data      
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);      
      await deleteAllTmntDivs(tmntToDelId);

      // make sure test data in database
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      createdBrkts = false;
    })

    afterEach(async () => {
      if (createdBrkts) {
        await deleteAllTmntBrkts(tmntToDelId);
      }
    })

    afterAll(async () => {
      await deleteAllTmntBrkts(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
    })

    it('should create many brkts', async () => {
      const brktsJSON = JSON.stringify(mockBrktsToPost);
      const response = await axios({
        method: "post",
        data: brktsJSON,
        withCredentials: true,
        url: manyUrl
      })
      expect(response.status).toBe(201);
      const postedBrkts = response.data.brkts;
      createdBrkts = true;
      expect(postedBrkts.length).toBe(mockBrktsToPost.length);
      for (let i = 0; i < postedBrkts.length; i++) {
        expect(postedBrkts[i].id).toBe(mockBrktsToPost[i].id);
        expect(postedBrkts[i].squad_id).toBe(mockBrktsToPost[i].squad_id);
        expect(postedBrkts[i].div_id).toBe(mockBrktsToPost[i].div_id);
        expect(postedBrkts[i].start).toBe(mockBrktsToPost[i].start);
        expect(postedBrkts[i].games).toBe(mockBrktsToPost[i].games);
        expect(postedBrkts[i].players).toBe(mockBrktsToPost[i].players);
        expect(postedBrkts[i].fee).toBe(mockBrktsToPost[i].fee);
        expect(postedBrkts[i].first).toBe(mockBrktsToPost[i].first);
        expect(postedBrkts[i].second).toBe(mockBrktsToPost[i].second);
        expect(postedBrkts[i].admin).toBe(mockBrktsToPost[i].admin);
        expect(postedBrkts[i].fsa).toBe(mockBrktsToPost[i].fsa);
        expect(postedBrkts[i].sort_order).toBe(mockBrktsToPost[i].sort_order);
      }
    })
    // no text values to sanitize
    it('should not post brkts with invalid data', async () => {
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],
          fee: '0',          
        },
        {
          ...mockBrktsToPost[1],
        },
      ]
      const brktsJSON = JSON.stringify(invalidBrkts);
      try {
        const response = await axios({
          method: "post",
          data: brktsJSON,
          withCredentials: true,
          url: manyUrl
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
    it('should not post brkts with invalid data in other than 1st element', async () => {
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],
        },
        {
          ...mockBrktsToPost[1],
          start: 0,
        },
      ]
      const brktsJSON = JSON.stringify(invalidBrkts);
      try {
        const response = await axios({
          method: "post",
          data: brktsJSON,
          withCredentials: true,
          url: manyUrl
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

})