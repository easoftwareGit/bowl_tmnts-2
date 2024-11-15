import axios, { AxiosError } from "axios";
import { basePotsApi, baseSquadsApi, baseDivsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi, testBaseSquadsApi, testBaseDivsApi } from "../../../testApi";
import { divType, potCategoriesTypes, potType, squadType } from "@/lib/types/types";
import { initDiv, initPot, initSquad } from "@/lib/db/initVals";
import { mockSquadsToPost, mockPotsToPost, mockDivs, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/squadsAxios";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/divsAxios";
import { deleteAllTmntPots } from "@/lib/db/pots/potsAxios";

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

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;  
const onePotUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";

const urlForSquads = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;
const oneSquadUrl = urlForSquads + "/squad/";

const urlForDivs = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;
const oneDivUrl = urlForSquads + "/div/";

const notFoundId = "pot_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const nonPotId = "usr_01234567890123456789012345678901";

const squadPotId1 = 'pot_98b3a008619b43e493abf17d9f462a65';
const squadPotId2 = 'pot_ab80213899ea424b938f52a062deacfe';

const pot3Id = 'pot_ab80213899ea424b938f52a062deacfe'

const div2Id = 'div_1f42042f9ef24029a0a2d48cc276a087';
const squad2Id = 'sqd_1a6c885ee19a49489960389193e8f819';

const testPot: potType = {
  ...initPot,
  id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  sort_order: 1,
  fee: '20',
  pot_type: "Game",
}

const delOnePot = async (id: string) => { 
  try {
    const delResponse = await axios({
      method: "delete",
      withCredentials: true,
      url: onePotUrl + id
    });
  } catch (err) {
    if (err instanceof AxiosError) { 
      if (err.status !== 404) {
        console.log(err.message);
        return;
      }
    }
  }
}

const deletePostedPot = async () => { 
  const response = await axios.get(url);
  const pots = response.data.pots;
  const toDel = pots.find((p: potType) => p.sort_order === 13);
  if (toDel) {
    await delOnePot(toDel.id);
  }
}

const resetPot = async () => { 
  // make sure test pot is reset in database
  const potJSON = JSON.stringify(testPot);
  const response = await axios({
    method: "put",
    data: potJSON,
    withCredentials: true,
    url: onePotUrl + testPot.id,
  })
}

const rePostPot = async (pot: potType) => {
  try {
    // if pot already in database, then don't re-post
    const getResponse = await axios.get(onePotUrl + pot.id);
    const found = getResponse.data.pot;
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
    const potJSON = JSON.stringify(pot);
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: potJSON
    });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('Pots - API: /api/pots', () => { 

  const blankPot = {
    id: testPot.id,
    squad_id: testPot.squad_id,
    div_id: testPot.div_id,
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedPot();
    })

    it('should get all pots', async () => { 
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 5 rows in prisma/seed.ts
      expect(response.data.pots).toHaveLength(5);
    })

  })

  describe('GET by id - API: /api/pots/pot/:id', () => { 

    it('should get pot by id', async () => { 
      const response = await axios.get(onePotUrl + testPot.id);
      expect(response.status).toBe(200);
      const pot = response.data.pot;
      expect(pot.id).toBe(testPot.id);
      expect(pot.squad_id).toBe(testPot.squad_id);
      expect(pot.div_id).toBe(testPot.div_id);
      expect(pot.fee).toBe(testPot.fee);
      expect(pot.pot_type).toBe(testPot.pot_type);
      expect(pot.sort_order).toBe(testPot.sort_order);
    })
    it('should NOT get pot by id when ID is invalid', async () => { 
      try {
        const response = await axios.get(onePotUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get pot by id when ID is not found', async () => { 
      try {
        const response = await axios.get(onePotUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })  
    it('should NOT get pot by id when ID is valid, but not a pot ID', async () => { 
      try {
        const response = await axios.get(onePotUrl + nonPotId);
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

  describe('GET all pots for squad API: /api/pots/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedPot();
    })

    it('should get all pots for squad', async () => { 
      // const values taken from prisma/seed.ts
      const multiPotSquadId = "sqd_1a6c885ee19a49489960389193e8f819";

      const multiPotUrl = squadUrl + multiPotSquadId;
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: multiPotUrl
      })

      expect(response.status).toBe(200);
      // 2 rows for squad in prisma/seed.ts
      expect(response.data.pots).toHaveLength(2);
      const pots: potType[] = response.data.pots;
      // query in /api/pots/squad/ GET sorts by sort_order
      expect(pots[0].id).toBe(squadPotId1);
      expect(pots[1].id).toBe(squadPotId2);
    })
    it('should NOT get all pots for squad when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: squadUrl + 'test'
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
    it('should return code 200 if pot is not found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + notFoundSquadId
      })
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('GET pots for div API: /api/pots/div/:divId', () => { 

    beforeAll(async () => {
      await deletePostedPot();
    })

    it('should get all pots for div', async () => { 
      // const values taken from prisma/seed.ts
      const multiPotDivId = "div_1f42042f9ef24029a0a2d48cc276a087";
      const divPotId1 = 'pot_98b3a008619b43e493abf17d9f462a65';
      const divPotId2 = 'pot_ab80213899ea424b938f52a062deacfe';

      const multiPotUrl = divUrl + multiPotDivId;
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: multiPotUrl
      })

      expect(response.status).toBe(200);
      // 2 rows for squad in prisma/seed.ts
      expect(response.data.pots).toHaveLength(2);
      const pots: potType[] = response.data.pots;
      // query in /api/pots/div/ GET sorts by sort_order
      expect(pots[0].id).toBe(divPotId1);
      expect(pots[1].id).toBe(divPotId2);
    })
    it('should NOT get all pots for div when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: divUrl + 'test'
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
    it('should return code 200 if pot is not found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: divUrl + notFoundDivId
      })
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('GET pots for tmnt API: /api/pots/tmnt/:tmntId', () => {
    
    const tmntId = "tmt_56d916ece6b50e6293300248c6792316";
    
    it('should get all pots for tmnt', async () => {
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId
      })
      // 2 rows for squad for event for tmnt in prisma/seed.ts
      expect(response.data.pots).toHaveLength(2);
      const pots: potType[] = response.data.pots;
      // query in /api/pots/tmnt/ GET sorts by sort_order
      expect(pots[0].id).toBe(squadPotId1);
      expect(pots[1].id).toBe(squadPotId2);
    })
    it('should NOT get all pots for tmnt when ID is invalid', async () => {
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
    it('should return code 200 if pot is not found, 0 rows returned', async () => {     
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId
      })
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('POST', () => { 

    const potToPost: potType = {
      ...initPot,      
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: 'div_66d39a83d7a84a8c85d28d8d1b2c7a90',
      fee: '13',
      pot_type: "Game",
      sort_order: 13,
    }
  
    let createdPot = false;

    beforeAll(async () => {
      await deletePostedPot();
    })

    beforeEach(() => {
      createdPot = false;
    })

    afterEach(async () => {
      if (createdPot) {
        await deletePostedPot();
      }
    })

    it('should create new pot', async () => {
      const potsJSON = JSON.stringify(potToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potsJSON
      })
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.id).toBe(potToPost.id);
      expect(postedPot.div_id).toBe(potToPost.div_id);
      expect(postedPot.squad_id).toBe(potToPost.squad_id);
      expect(postedPot.fee).toBe(potToPost.fee);
      expect(postedPot.pot_type).toBe(potToPost.pot_type);
      expect(postedPot.sort_order).toBe(potToPost.sort_order);      
    })
    it('should create a new pot with a pot_type of "Last Game"', async () => {
      const lgPot = {
        ...potToPost,
        pot_type: "Last Game" as potCategoriesTypes,
      }
      const potJSON = JSON.stringify(lgPot);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potJSON
      })
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.pot_type).toBe('Last Game');
    })
    it('should create a new pot with a pot_type of "Series"', async () => {
      const seriesPot = {
        ...potToPost,
        pot_type: "Series",
      }
      const potJSON = JSON.stringify(seriesPot);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potJSON
      })
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.pot_type).toBe('Series');
    })
    it('should NOT create a new pot when id is blank', async () => {
      const invalidPot = {
        ...potToPost,
        id: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when squad_id is blank', async () => {
      const invalidPot = {
        ...potToPost,
        squad_id: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when div_id is blank', async () => {
      const invalidPot = {
        ...potToPost,
        div_id: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when fee is blank', async () => {
      const invalidPot = {
        ...potToPost,
        fee: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when pot_type is blank', async () => {
      const invalidPot = {
        ...potToPost,
        pot_type: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when sort_order is null', async () => {
      const invalidPot = {
        ...potToPost,
        sort_order: null,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when squad_id is not a valid squad id', async () => { 
      const invalidPot = {
        ...potToPost,
        squad_id: notFoundId, // a valid pot id, not a squad id
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when div_id is not a valid div id', async () => { 
      const invalidPot = {
        ...potToPost,
        div_id: notFoundId, // a valid pot id, not a div id
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when fee to too low', async () => {
      const invalidPot = {
        ...potToPost,
        fee: '0',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when fee to too high', async () => {
      const invalidPot = {
        ...potToPost,
        fee: '1234567',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new pot when fee is not a number', async () => {
      const invalidPot = {
        ...potToPost,
        fee: 'invalid',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot with an invalid pot_type', async () => {
      const invalidPot = {
        ...potToPost,
        pot_type: "invalid",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot when sort_order is too low', async () => {
      const invalidPot = {
        ...potToPost,
        sort_order: 0,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot when sort_order is too high', async () => {
      const invalidPot = {
        ...potToPost,
        sort_order: 1234567,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot when sort_order is not an integer', async () => {
      const invalidPot = {
        ...potToPost,
        sort_order: 1.5,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot when sort_order is not a number', async () => {
      const invalidPot = {
        ...potToPost,
        sort_order: 'abc',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "post",
          data: potJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create new pot when div_id + pot_type is not unique', async () => {
      const invalidPot = {
        ...potToPost,
        squad_id: testPot.squad_id,
        div_id: testPot.div_id,
        pot_type: 'Game',
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
    it('should create a new pot with sanitzied values', async () => { 
      const toSanitizePot = {
        ...potToPost,
        fee: '5.460',        
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: potJSON
      })
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.fee).toBe('5.46');
    })

  })

  describe('POST many pots for one tmnt API: /api/pots/many', () => { 

    let createdPots = false;    

    beforeAll(async () => { 
      // remove any old test data      
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);      
      await deleteAllTmntDivs(tmntToDelId);      

      // make sure test data in database
      await postManyDivs(mockDivs)
      await postManySquads(mockSquadsToPost)
    })

    beforeEach(() => {
      createdPots = false;
    })

    afterEach(async () => {
      if (createdPots) {
        await deleteAllTmntPots(tmntToDelId);
      }
    })

    afterAll(async () => {
      await deleteAllTmntPots(tmntToDelId);
      await deleteAllTmntDivs(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
    })

    it('should create many pots', async () => {
      const potsJSON = JSON.stringify(mockPotsToPost);
      const response = await axios({
        method: "post",
        data: potsJSON,
        withCredentials: true,
        url: manyUrl
      })
      expect(response.status).toBe(201);
      const postedPots = response.data.pots;
      createdPots = true;
      expect(postedPots.length).toBe(mockPotsToPost.length);
      for (let i = 0; i < postedPots.length; i++) {
        expect(postedPots[i].id).toEqual(mockPotsToPost[i].id);
        expect(postedPots[i].div_id).toEqual(mockPotsToPost[i].div_id);
        expect(postedPots[i].squad_id).toEqual(mockPotsToPost[i].squad_id);
        expect(postedPots[i].fee).toEqual(mockPotsToPost[i].fee);
        expect(postedPots[i].pot_type).toEqual(mockPotsToPost[i].pot_type);
        expect(postedPots[i].sort_order).toEqual(mockPotsToPost[i].sort_order);
      }
    })
    it('should post many pots with sanitized pot type', async () => { 
      const manyPots = [
        {
          ...mockPotsToPost[0],
          pot_type: '<script>Game</script>',
        },
        {
          ...mockPotsToPost[1],
          pot_type: '   Last Game  **** ',
        },
        {
          ...mockPotsToPost[2],
          pot_type: '{} Series ক😀',
        },
      ]
      const potsJSON = JSON.stringify(manyPots);
      const response = await axios({
        method: "post",
        data: potsJSON,
        withCredentials: true,
        url: manyUrl
      })
      expect(response.status).toBe(201);
      const postedPots = response.data.pots;
      createdPots = true;
      expect(postedPots.length).toBe(manyPots.length);
      for (let i = 0; i < postedPots.length; i++) {
        expect(postedPots[i].id).toEqual(mockPotsToPost[i].id);
        expect(postedPots[i].pot_type).toEqual(mockPotsToPost[i].pot_type);
      }
    })
    it('should not post pots with invalid data', async () => { 
      const invalidPots = [
        {
          ...mockPotsToPost[0],
          fee: '0',
        },
        {
          ...mockPotsToPost[1],          
        },
      ]
      const potsJSON = JSON.stringify(invalidPots);
      try {
        const response = await axios({
          method: "post",
          data: potsJSON,
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
    it('should not post pots with invalid data in other than 1st element', async () => { 
      const invalidPots = [
        {
          ...mockPotsToPost[0],          
        },
        {
          ...mockPotsToPost[1],
          sort_order: 0,
        },
        {
          ...mockPotsToPost[2],          
        },
      ]
      const potsJSON = JSON.stringify(invalidPots);
      try {
        const response = await axios({
          method: "post",
          data: potsJSON,
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

  describe('PUT by ID - API: /api/pots/pot/:id', () => { 

    const putPot = {
      ...testPot,
      squad_id: 'sqd_3397da1adc014cf58c44e07c19914f72',
      div_id: 'div_29b9225d8dd44a4eae276f8bde855729',
      fee: '13',
      pot_type: "Series",
      sort_order: 10,
    }

    beforeAll(async () => {
      await resetPot();
    })

    afterEach(async () => {
      await resetPot();
    })

    it('should update pot by id', async () => {
      const potJSON = JSON.stringify(putPot);
      const putResponse = await axios({
        method: "put",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + testPot.id,
      })
      const pot = putResponse.data.pot;
      expect(putResponse.status).toBe(200);      
      expect(pot.squad_id).toBe(putPot.squad_id);
      expect(pot.div_id).toBe(putPot.div_id);      
      expect(pot.fee).toBe(putPot.fee);
      expect(pot.pot_type).toBe(putPot.pot_type);
      expect(pot.sort_order).toBe(putPot.sort_order);
    })
    it('should NOT update pot by id when ID is invalid', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const putResponse = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + 'test',
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update pot by id when ID is valid, but not a pot ID', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const putResponse = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + nonPotId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update pot by id when ID is not found', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const putResponse = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + notFoundId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update pot when squad_id is blank', async () => {
      const invalidPot = {
        ...putPot,
        squad_id: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when div_id is blank', async () => {
      const invalidPot = {
        ...putPot,
        div_id: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when fee is blank', async () => {
      const invalidPot = {
        ...putPot,
        fee: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when pot_type is blank', async () => {
      const invalidPot = {
        ...putPot,
        pot_type: "",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when sort_order is null', async () => {
      const invalidPot = {
        ...putPot,
        sort_order: null,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when fee is too low', async () => {
      const invalidPot = {
        ...putPot,
        fee: '0',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when fee is too high', async () => {
      const invalidPot = {
        ...putPot,
        fee: '123456789',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when fee is not a number', async () => {
      const invalidPot = {
        ...putPot,
        fee: 'invalid',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when pot_type is not "Game", "Last Game" or "Series"', async () => {
      const invalidPot = {
        ...putPot,
        pot_type: 'invalid',
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when sort_order is too low', async () => {
      const invalidPot = {
        ...putPot,
        sort_order: 0,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when sort_order is too high', async () => {
      const invalidPot = {
        ...putPot,
        sort_order: 1234567,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update pot when sort_order is not an integer', async () => {
      const invalidPot = {
        ...putPot,
        sort_order: 1.5,
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
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
    it('should NOT update a pot when div_id + pot_type is not unique', async () => {
      const invalidPot = {
        ...initPot,
        id: pot3Id,
        squad_id: squad2Id,
        div_id: div2Id,
        sort_order: 2,
        fee: '10',
        pot_type: "Game",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + invalidPot.id,
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
    it('should update pot by id with sanitzied values', async () => {
      const toSanitizePot = {
        ...putPot,
        fee: '5.460',        
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const putResponse = await axios({
        method: "put",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + testPot.id,
      })
      expect(putResponse.status).toBe(200);
      const pot = putResponse.data.pot;      
      expect(pot.fee).toBe('5.46');
    })

  })

  describe('PATCH by ID - API: /api/pots/:id', () => { 

    beforeAll(async () => {
      // make sure test pot is reset in database
      const potJSON = JSON.stringify(testPot);
      const putResponse = await axios({
        method: "put",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + testPot.id,
      })
    })
      
    afterEach(async () => {
      try {
        const potJSON = JSON.stringify(testPot);
        const putResponse = await axios({
          method: "put",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + testPot.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    })

    it('should patch fee for a pot by ID', async () => { 
      const patchPot = {
        ...blankPot,
        fee: '13',
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.fee).toBe(patchPot.fee);
    })
    it('should patch pot_type for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        pot_type: 'Series',
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.Pot;
      expect(patchPot.pot_type).toBe(patchPot.pot_type);
    })
    it('should patch sort_order for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: 12,
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.sort_order).toBe(patchPot.sort_order);
    })
    it('should NOT patch div_id for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        div_id: div2Id,
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      // for div_id, compare to blankPot.div_id
      expect(patchedPot.div_id).toBe(blankPot.div_id);
    })
    it('should NOT patch squad_id for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        squad_id: squad2Id,
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      // for squad_id, compare to blankPot.squad_id
      expect(patchedPot.squad_id).toBe(blankPot.squad_id);
    })
    it('should NOT patch a pot when ID is invalid', async () => {
      const patchPot = {
        ...blankPot,
        fee: '13',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + 'test',
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
    it('should NOT patch a pot when ID is not found', async () => {
      const patchPot = {
        ...blankPot,
        fee: '13',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + notFoundId,
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
    it('should NOT patch a pot when ID is valid, but not a pot ID', async () => {
      const patchPot = {
        ...blankPot,
        fee: '13',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + nonPotId,
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
    it('should NOT patch a pot when fee is blank', async () => {
      const patchPot = {
        ...blankPot,
        fee: '',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when pot_type is blank', async () => {
      const patchPot = {
        ...blankPot,
        pot_type: "",
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when sort_order is null', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: null,
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when fee is too low', async () => {
      const patchPot = {
        ...blankPot,
        fee: '0',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when fee is too high', async () => {
      const patchPot = {
        ...blankPot,
        fee: '123456789',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when fee is not a number', async () => {
      const patchPot = {
        ...blankPot,
        fee: 'abcdef',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when pot_type is not "Game", "Last Game" or "Series"', async () => {
      const patchPot = {
        ...blankPot,
        pot_type: 'invalid',
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when sort_order is too low', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: 0,
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when sort_order is too high', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: 1234567,
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when sort_order is not an integer', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: 1.5,
      }
      const potJSON = JSON.stringify(patchPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + blankPot.id,
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
    it('should NOT patch a pot when div_id + pot_type is not unique', async () => {      
      const invalidPot = {
        ...initPot,
        id: pot3Id,
        squad_id: squad2Id,
        div_id: div2Id,
        pot_type: "Game",
      }
      const potJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "patch",
          data: potJSON,
          withCredentials: true,
          url: onePotUrl + invalidPot.id,
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
    it('should patch fee for a pot by ID', async () => { 
      const toSanitizePot = {
        ...blankPot,
        fee: '5.460',
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const response = await axios({
        method: "patch",
        data: potJSON,
        withCredentials: true,
        url: onePotUrl + blankPot.id,
      })
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.fee).toBe('5.46');
    })

  })

  describe('DELETE by ID - API: /api/pots/:id', () => { 

    const toDelPot = {
      ...initPot,
      id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
      squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
      div_id: "div_29b9225d8dd44a4eae276f8bde855729",
      sort_order: 1,
      fee: '20',
      pot_type: "Game",
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const potJSON = JSON.stringify(toDelPot);
        const response = await axios({
          method: 'post',
          data: potJSON,
          withCredentials: true,
          url: url
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a pot by ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: onePotUrl + toDelPot.id,
        })  
        didDel = true;
        expect(delResponse.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a pot by ID when ID is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: onePotUrl + 'test',
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a pot by ID when ID is not found', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: onePotUrl + notFoundId,
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a pot by ID when ID is valid, but not an pot id', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: onePotUrl + nonPotId
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    // it('should NOT delete a pot by ID when pot has child rows', async () => { 
    //   try {
    //     const delResponse = await axios({
    //       method: "delete",
    //       withCredentials: true,
    //       url: onePotUrl + testPot.id
    //     })  
    //     expect(delResponse.status).toBe(409);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(409);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }
    //   }
    // })

  })  

  describe('DELETE all pots for a squad API: /api/pots/squad/:squadId', () => { 

    // squad id and div id are from squad to delete from prisma/seeds.ts        
    const toDelPots = [
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12601",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 1,
        fee: '20',
        pot_type: "Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12602",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 2,
        fee: '10',
        pot_type: "Last Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12603",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 3,
        fee: '10',
        pot_type: "Series" as potCategoriesTypes,
      },
    ]

    let didDel = false

    beforeAll(async () => {
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[1]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[1]);
    })

    afterAll(async () => {
      await delOnePot(toDelPots[0].id);
      await delOnePot(toDelPots[1].id);
      await delOnePot(toDelPots[2].id);      
    })

    it('should delete all pots for a squad', async () => {       
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + toDelPots[0].squad_id
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(toDelPots.length);
    })
    it('should return 404 when a squad ID is invalid', async () => { 
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: squadUrl + "test"
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
    it('should NOT delete all pots for a squad when squad ID is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + notFoundSquadId
      })
      expect(response.status).toBe(200);      
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })
    it('should return 404 when a squad id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: squadUrl + notFoundDivId
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

  describe('DELETE all pots for a div API: /api/pots/div/:divId', () => { 

    // squad id and div id are from squad to delete from prisma/seeds.ts        
    const toDelPots = [
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12601",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 1,
        fee: '20',
        pot_type: "Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12602",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 2,
        fee: '10',
        pot_type: "Last Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12603",
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
        sort_order: 3,
        fee: '10',
        pot_type: "Series" as potCategoriesTypes,
      },
    ]

    let didDel = false

    beforeAll(async () => {
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[1]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[1]);
    })

    afterAll(async () => {
      await delOnePot(toDelPots[0].id);
      await delOnePot(toDelPots[1].id);
      await delOnePot(toDelPots[2].id);
    })

    it('should delete all pots for a div', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: divUrl + toDelPots[0].div_id
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(toDelPots.length);
    })
    it('should return 404 when a div when ID is invalid', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: divUrl + "test"
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
    it('should NOT delete all pots for a div when ID is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: divUrl + notFoundDivId
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })
    it('should return 404 when a div id is valid, but not a div id', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: divUrl + notFoundSquadId
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

  describe('DELETE all pots for a tmnt API: /api/pots/tmnt/:tmntId', () => { 
    
    // div ids and tmnt id from squad to delete from prisma/seeds.ts        
    const tmntId = 'tmt_467e51d71659d2e412cbc64a0d19ecb4';

    const tempDivs = [
      {
        ...initDiv,
        id: "div_66d39a83d7a84a8c85d28d8d1b2c7a91",
        tmnt_id: tmntId,
        div_name: "Del Div A",
        hdcp_per: 0,        
        sort_order: 1,
      },
      {
        ...initDiv,
        id: "div_66d39a83d7a84a8c85d28d8d1b2c7a92",
        tmnt_id: tmntId,
        div_name: "Del Div B",
        hdcp_per: 1,        
        sort_order: 2,
      }
    ]

    const tempSquads = [
      {
        ...initSquad,
        id: "sqd_c2be0f9d527e4081972ce8877190489d",
        event_id: 'evt_bd63777a6aee43be8372e4d008c1d6d0',
        squad_name: "Del Squad A",      
        squad_time: '10:00 AM',
        lane_count: 4,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_d2be0f9d527e4081972ce8877190489d",
        event_id: 'evt_bd63777a6aee43be8372e4d008c1d6d0',
        squad_name: "Del Squad B",      
        squad_time: '03:00 PM',
        lane_count: 4,
        starting_lane: 1,
        sort_order: 1,
      }  
    ]

    const toDelPots = [
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12601",
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a91",
        sort_order: 1,
        fee: '20',
        pot_type: "Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12602",
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a91",
        sort_order: 2,
        fee: '10',
        pot_type: "Last Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12603",
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a91",
        sort_order: 3,
        fee: '10',
        pot_type: "Series" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12604",
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a92",
        sort_order: 4,
        fee: '20',
        pot_type: "Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12605",
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a92",
        sort_order: 5,
        fee: '10',
        pot_type: "Last Game" as potCategoriesTypes,
      },
      {
        ...initPot,
        id: "pot_ce24c5cc04f6463d89f24e6e19a12606",
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
        div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a92",
        sort_order: 6,
        fee: '10',
        pot_type: "Series" as potCategoriesTypes,
      },
    ]

    const rePostSquad = async (squad: squadType) => {
      try {
        // if squad already in database, then don't re-post
        const getResponse = await axios.get(oneSquadUrl + squad.id);
        const found = getResponse.data.squad;
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
        const squadJSON = JSON.stringify(squad);
        const response = await axios({
          method: "post",
          withCredentials: true,
          data: squadJSON,
          url: urlForSquads
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    const rePostDiv = async (div: divType) => {
      try {
        // if squad already in database, then don't re-post
        const getResponse = await axios.get(oneDivUrl + div.id);
        const found = getResponse.data.div;
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
        const divJSON = JSON.stringify(div);
        const response = await axios({
          method: "post",
          withCredentials: true,
          data: divJSON,
          url: urlForDivs
        })
      } catch (err) {
        if (err instanceof AxiosError) { 
          if (err.status !== 404) {
            console.log(err.message);
            return;
          }
        }
      }
    }

    const delOneSquad = async (id: string) => {
      try {
        const getResponse = await axios.get(oneSquadUrl + id);
        const found = getResponse.data.squad;
        if (!found) return;
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneSquadUrl + id
        })
      } catch (err) {
        if (err instanceof AxiosError) { 
          if (err.status !== 404) {
            console.log(err.message);
            return;
          }
        }
      }
    }

    const delOneDiv = async (id: string) => {
      try {
        const getResponse = await axios.get(oneDivUrl + id);
        const found = getResponse.data.div;
        if (!found) return;
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneDivUrl + id
        })
      } catch (err) {
        if (err instanceof AxiosError) { 
          if (err.status !== 404) {
            console.log(err.message);
            return;
          }
        }
      }
    }

    let didDel = false

    beforeAll(async () => {      
      await rePostSquad(tempSquads[0]);
      await rePostSquad(tempSquads[1]);
      await rePostDiv(tempDivs[0]);
      await rePostDiv(tempDivs[1]);      
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[1]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[3]);
      await rePostPot(toDelPots[4]);
      await rePostPot(toDelPots[5]);
    })

    beforeEach(() => {
      didDel = false
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostSquad(tempSquads[0]);
      await rePostSquad(tempSquads[1]);
      await rePostDiv(tempDivs[0]);
      await rePostDiv(tempDivs[1]);      
      await rePostPot(toDelPots[0]);
      await rePostPot(toDelPots[1]);
      await rePostPot(toDelPots[2]);
      await rePostPot(toDelPots[3]);
      await rePostPot(toDelPots[4]);
      await rePostPot(toDelPots[5]);
    })

    afterAll(async () => {      
      await delOnePot(toDelPots[0].id);
      await delOnePot(toDelPots[1].id);
      await delOnePot(toDelPots[2].id);
      await delOnePot(toDelPots[3].id);
      await delOnePot(toDelPots[4].id);
      await delOnePot(toDelPots[5].id);
      await deleteAllTmntDivs(tmntToDelId)
      await deleteAllTmntSquads(tmntToDelId)
    })

    it('should delete all pots for a tmnt', async () => { 
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: tmntUrl + tmntId
      })
      expect(response.status).toBe(200);
      didDel = true
      const count = response.data.deleted.count;
      expect(count).toBe(toDelPots.length);
    })
    it('should return 404 when tmnt ID is invalid', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: tmntUrl + "test"
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
    it('should return code 200 when tmnt id is not found, but 0 rows deleted', async () => {       
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId
      })
      expect(response.status).toBe(200);
      didDel = true
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })  
    it('should return 404 when tmnt ID is valid, but not an tmnt ID', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: tmntUrl + nonPotId
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

})