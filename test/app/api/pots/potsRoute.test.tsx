import axios, { AxiosError } from "axios";
import { basePotsApi } from "@/lib/api/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import type { potCategoriesTypes, potType } from "@/lib/types/types";
import { initPot} from "@/lib/db/initVals";
import { isValidBtDbId } from "@/lib/validation/validation";

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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePotsApi
  ? testBasePotsApi
  : basePotsApi;  

const onePotUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";

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

const potToPost: potType = {
  ...initPot,      
  id: "pot_1234567890abcdef1234567890abcdef",
  squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
  div_id: 'div_66d39a83d7a84a8c85d28d8d1b2c7a90',
  fee: '13',
  pot_type: "Game",
  sort_order: 13,
}

const deletePostedPot = async (id: string) => { 
  try { 
    const response = await axios.delete(onePotUrl + id, { withCredentials: true });
  } catch (err) { 
    if (err instanceof AxiosError) console.log(err.message);
  }
}

const resetPot = async () => { 
  // make sure test pot is reset in database
  const potJSON = JSON.stringify(testPot);
  await axios.put(onePotUrl + testPot.id, potJSON, { withCredentials: true });  
}

describe('Pots - API: /api/pots', () => { 

  const blankPot = {
    id: testPot.id,
    squad_id: testPot.squad_id,
    div_id: testPot.div_id,
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    });

    it('should get all pots', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 10 rows in prisma/seed.ts
      expect(response.data.pots).toHaveLength(10);
    });
  })

  describe('GET by id - API: /api/pots/pot/:id', () => { 

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    });

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
      await deletePostedPot(potToPost.id);
    })

    it('should get all pots for squad', async () => { 
      // const values taken from prisma/seed.ts
      const multiPotSquadId = "sqd_1a6c885ee19a49489960389193e8f819";

      const multiPotUrl = squadUrl + multiPotSquadId;
      const response = await axios.get(multiPotUrl);

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
    it('should return code 200 if pot is not found, 0 rows returned', async () => {     
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('GET pots for div API: /api/pots/div/:divId', () => { 

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    })

    it('should get all pots for div', async () => { 
      // const values taken from prisma/seed.ts
      const multiPotDivId = "div_1f42042f9ef24029a0a2d48cc276a087";
      const divPotId1 = 'pot_98b3a008619b43e493abf17d9f462a65';
      const divPotId2 = 'pot_ab80213899ea424b938f52a062deacfe';

      const multiPotUrl = divUrl + multiPotDivId;
      const response = await axios.get(multiPotUrl);

      expect(response.status).toBe(200);
      // 2 rows for div in prisma/seed.ts
      expect(response.data.pots).toHaveLength(2);
      const pots: potType[] = response.data.pots;
      // query in /api/pots/div/ GET sorts by sort_order
      expect(pots[0].id).toBe(divPotId1);
      expect(pots[1].id).toBe(divPotId2);
    })
    it('should NOT get all pots for div when ID is invalid', async () => {
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
    it('should return code 200 if pot is not found, 0 rows returned', async () => {     
      const response = await axios.get(divUrl + notFoundDivId);
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('GET pots for tmnt API: /api/pots/tmnt/:tmntId', () => {
    
    const tmntId = "tmt_56d916ece6b50e6293300248c6792316";

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    })    

    it('should get all pots for tmnt', async () => {
      const response = await axios.get(tmntUrl + tmntId);
      // 2 rows for squad for event for tmnt in prisma/seed.ts
      expect(response.data.pots).toHaveLength(2);
      const pots: potType[] = response.data.pots;
      // query in /api/pots/tmnt/ GET sorts by sort_order
      expect(pots[0].id).toBe(squadPotId1);
      expect(pots[1].id).toBe(squadPotId2);
    })
    it('should NOT get all pots for tmnt when ID is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'invalid');
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
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.pots).toHaveLength(0);
    })

  })

  describe('POST', () => { 
  
    let createdPot = false;

    beforeAll(async () => {
      await deletePostedPot(potToPost.id);
    })

    beforeEach(() => {
      createdPot = false;
    })

    afterEach(async () => {
      if (createdPot) {
        await deletePostedPot(potToPost.id);
      }
    })

    it('should create new pot', async () => {
      const potsJSON = JSON.stringify(potToPost);
      const response = await axios.post(url, potsJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;      
      expect(isValidBtDbId(postedPot.id, "pot")).toBe(true);
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
      const response = await axios.post(url, potJSON, { withCredentials: true });
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
      const response = await axios.post(url, potJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.pot_type).toBe('Series');
    })
    it('should create a new pot with sanitzied values', async () => { 
      const toSanitizePot = {
        ...potToPost,
        fee: '5.460',        
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const response = await axios.post(url, potJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedPot = response.data.pot;
      createdPot = true;
      expect(postedPot.fee).toBe('5.46');
    })
    it('should NOT create a new pot when id is blank', async () => {
      const invalidPot = {
        ...potToPost,
        id: "",
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
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
      const response = await axios.put(onePotUrl + putPot.id, potJSON, {
        withCredentials: true
      });
      const pot = response.data.pot;
      expect(response.status).toBe(200);
      expect(pot.squad_id).toBe(putPot.squad_id);
      expect(pot.div_id).toBe(putPot.div_id);
      expect(pot.fee).toBe(putPot.fee);
      expect(pot.pot_type).toBe(putPot.pot_type);
      expect(pot.sort_order).toBe(putPot.sort_order);
    });
    it('should update pot by id with sanitzied values', async () => {
      const toSanitizePot = {
        ...putPot,
        fee: '5.460',
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const response = await axios.put(onePotUrl + toSanitizePot.id, potJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const pot = response.data.pot;
      expect(pot.fee).toBe('5.46');
    });
    it('should NOT update pot by id when ID is invalid', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const response = await axios.put(onePotUrl + 'test', potJSON, {
          withCredentials: true
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
    it('should NOT update pot by id when ID is valid, but not a pot ID', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const response = await axios.put(onePotUrl + nonPotId, potJSON, {
          withCredentials: true
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
    it('should NOT update pot by id when ID is not found', async () => {
      try {
        const potJSON = JSON.stringify(putPot);
        const response = await axios.put(onePotUrl + notFoundId, potJSON, {
          withCredentials: true
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
    it('should NOT update pot when squad_id is blank', async () => {
      const invalidPot = {
        ...putPot,
        squad_id: "",
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when div_id is blank', async () => {
      const invalidPot = {
        ...putPot,
        div_id: "",
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.put(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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

  })

  describe('PATCH by ID - API: /api/pots/:id', () => { 

    beforeAll(async () => {
      // make sure test pot is reset in database
      await resetPot();
    })
      
    afterEach(async () => {
      await resetPot();
    })

    it('should patch fee for a pot by ID', async () => { 
      const patchPot = {
        ...blankPot,
        fee: '13',
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios.patch(onePotUrl + patchPot.id, potJSON, {
        withCredentials: true
      });
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
      const response = await axios.patch(onePotUrl + patchPot.id, potJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.pot_type).toBe(patchPot.pot_type);
    })
    it('should patch sort_order for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        sort_order: 12,
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios.patch(onePotUrl + patchPot.id, potJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.sort_order).toBe(patchPot.sort_order);
    })
    it('should patch sanitized fee for a pot by ID', async () => { 
      const toSanitizePot = {
        ...blankPot,
        fee: '5.460',
      }
      const potJSON = JSON.stringify(toSanitizePot);
      const response = await axios.patch(onePotUrl + toSanitizePot.id, potJSON, {
        withCredentials: true
      });      
      expect(response.status).toBe(200);
      const patchedPot = response.data.pot;
      expect(patchedPot.fee).toBe('5.46');
    })
    it('should NOT patch div_id for a pot by ID', async () => {
      const patchPot = {
        ...blankPot,
        div_id: div2Id,
      }
      const potJSON = JSON.stringify(patchPot);
      const response = await axios.patch(onePotUrl + patchPot.id, potJSON, {
        withCredentials: true
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
      const response = await axios.patch(onePotUrl + patchPot.id, potJSON, {
        withCredentials: true
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
        const response = await axios.patch(onePotUrl + 'test', potJSON, {
          withCredentials: true
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
        const response = await axios.patch(onePotUrl + notFoundId, potJSON, {
          withCredentials: true
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
        const response = await axios.patch(onePotUrl + nonPotId, potJSON, {
          withCredentials: true
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
    it('should NOT patch a pot when fee is blank', async () => {
      const invalidPot = {
        ...blankPot,
        fee: '',
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        pot_type: "",
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        sort_order: null,
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        fee: '0',
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        fee: '123456789',
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        fee: 'abcdef',
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        pot_type: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        sort_order: 0,
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        sort_order: 1234567,
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidPot = {
        ...blankPot,
        sort_order: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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
      const invalidJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios.patch(onePotUrl + invalidPot.id, invalidJSON, {
          withCredentials: true
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

  describe('DELETE by ID - API: /api/pots/:id', () => { 

    // to delete from prisma/seeds.ts
    const toDelPot = {
      ...initPot,
      id: "pot_e3758d99c5494efabb3b0d273cf22e7a",
      squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
      div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
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
        await axios.post(url, potJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a pot by ID', async () => {
      const response = await axios.delete(onePotUrl + toDelPot.id, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should return 0 when delete a pot by ID when ID is not found', async () => { 
      const response = await axios.delete(onePotUrl + notFoundId, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a pot by ID when ID is invalid', async () => { 
      try {
        const response = await axios.delete(onePotUrl + 'test', {
          withCredentials: true
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
    it('should NOT delete a pot by ID when ID is valid, but not an pot id', async () => { 
      try {
        const response = await axios.delete(onePotUrl + nonPotId, {
          withCredentials: true
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