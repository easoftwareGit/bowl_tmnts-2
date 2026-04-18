import axios, { AxiosError } from "axios";
import { baseLanesApi, baseSquadsApi } from "@/lib/api/apiPaths";
import { testBaseLanesApi, testBaseSquadsApi } from "../../../testApi";
import type { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";

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
const url = process.env.NODE_ENV === "test" && testBaseLanesApi
  ? testBaseLanesApi
  : baseLanesApi;

const oneLaneUrl = url + "/lane/";  
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

const notFoundId = "lan_01234567890123456789012345678901";
const notfoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const squad1Id = 'sqd_7116ce5f80164830830a7157eb093396';
const squad2Id = 'sqd_1a6c885ee19a49489960389193e8f819';

const testLane: laneType = {
  id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
  lane_number: 29,
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  in_use: true,
}

const laneToPost: laneType = {
  ...initLane,      
  id: "lan_1234567890abcdef1234567890abcdef",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  lane_number: 101,
}

const deletePostedLane = async (id: string) => { 
  try {
    await axios.delete(oneLaneUrl + id, { withCredentials: true });
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

const resetLane = async () => {
  // make sure test lane is reset in database
  const laneJSON = JSON.stringify(testLane);
  await axios.put(oneLaneUrl + testLane.id, laneJSON, { withCredentials: true });
}

describe('Lanes - API: /api/lanes', () => { 

  const testLane: laneType = {
    ...initLane,
    id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    lane_number: 29,
  }

  const blankLane = {
    id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    })

    it('should get all lanes', async () => {
      const response = await axios.get(url, { withCredentials: true });
      expect(response.status).toEqual(200);
      // 87 rows in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(87);
    })    

  })

  describe('GET by ID - API: /api/lanes/lane/:id', () => { 

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    })

    it('should get a lane by ID', async () => { 
      const response = await axios.get(oneLaneUrl + testLane.id, { withCredentials: true });
      const lane = response.data.lane;
      expect(response.status).toBe(200);
      expect(lane.id).toBe(testLane.id);
      expect(lane.squad_id).toBe(testLane.squad_id);
      expect(lane.lane_number).toBe(testLane.lane_number);
    })
    it('should NOT get a lane by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneLaneUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a lane by ID when ID is valid, but not a lane ID', async () => {
      try {
        const response = await axios.get(oneLaneUrl + userId, { withCredentials: true });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a lane by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneLaneUrl + notFoundId, { withCredentials: true });
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

  describe('GET all lanes for a squad API: /api/lanes/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    })

    it('should get all lanes for a squad', async () => {
      // const values taken from prisma/seed.ts
      const multiLaneSquadId = "sqd_7116ce5f80164830830a7157eb093396";
      const squadLaneId1 = 'lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d';
      const squadLaneId12 = 'lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc';
      
      const response = await axios.get(squadUrl + multiLaneSquadId, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      // 12 rows for tmnt in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(12);
      const lanes: laneType[] = response.data.lanes;
      // query in /api/lanes/squad GET sorts by sort_order
      expect(lanes[0].id).toBe(squadLaneId1);
      expect(lanes[11].id).toBe(squadLaneId12);      
    }) 
    it('should return code 200 if squad not found, 0 rows returned', async () => { 
      const response = await axios.get(squadUrl + notfoundSquadId, { withCredentials: true });        
      expect(response.status).toBe(200);      
      expect(response.data.lanes).toHaveLength(0);
    })
    it('should return code 404 if squad id is invalid', async () => { 
      try {
        const response = await axios.get(squadUrl + 'test123', { withCredentials: true });        
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 404 if squad id is valid, but not a squad_id', async () => { 
      try {
        const response = await axios.get(squadUrl + userId, { withCredentials: true });        
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

  describe('GET all lanes for a tmnt API: /api/lanes/tmnt/:tmntId', () => { 

    const tmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'; // 2 events & 2 squads

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    })

    it('should get all lanes for a tmnt', async () => { 
      const response = await axios.get(tmntUrl + tmntId, { withCredentials: true });
      expect(response.status).toBe(200);
      // 20 rows for tmnt in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(20);
      const lanes: laneType[] = response.data.lanes;
      // query in /api/lanes/tmnt/:tmntId GET sorts by squadid, then sort_order
      expect(lanes[0].id).toBe('lan_ae24c5cc04f6463d89f24e6e19a12601');
      expect(lanes[19].id).toBe('lan_be24c5cc04f6463d89f24e6e19a12610');
    })
    it('should return empty array if tmnt not found', async () => { 
      const response = await axios.get(tmntUrl + notFoundTmntId, { withCredentials: true });
      expect(response.status).toBe(200);      
      expect(response.data.lanes).toHaveLength(0);
    })
    it('should return code 404 if tmnt id is invalid', async () => {       
      try {
        const response = await axios.get(tmntUrl + 'test123', { withCredentials: true });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 404 if tmnt id is valid, but not a tmnt id', async () => { 
      try {
        const response = await axios.get(tmntUrl + userId, { withCredentials: true });
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
  
    let createdLane = false;

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    })

    beforeEach(() => {
      createdLane = false;
    })

    afterEach(async () => {
      if (createdLane) {
        await deletePostedLane(laneToPost.id);
      }
    })

    it('should create a lane', async () => { 
      const laneJSON = JSON.stringify(laneToPost);
      const response = await axios.post(url, laneJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      const postedLane = response.data.lane;
      createdLane = true;
      expect(postedLane.id).toBe(laneToPost.id);
      expect(postedLane.squad_id).toBe(laneToPost.squad_id);
      expect(postedLane.lane_number).toBe(laneToPost.lane_number);      
    })
    it('should NOT create a new lane when squad id does not exist', async () => { 
      const invalidLane = {
        ...laneToPost,
        squad_id: notfoundSquadId,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when id is blank', async () => { 
      const invalidLane = {
        ...laneToPost,
        id: '',
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when squad_id is blank', async () => { 
      const invalidLane = {
        ...laneToPost,
        squad_id: '',
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when lane number is null', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: null,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when lane number is not an integer', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: 29.5,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when lane number is less than 1', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: 0,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when lane number is greater than 200', async () => {
      const invalidLane = {
        ...laneToPost,
        lane_number: 201,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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
    it('should NOT create a new lane when lane number + squd_id is not unique', async () => {
      const invalidLane = {
        ...laneToPost,
        lane_number: 29,
      }
      const invalidJSON = JSON.stringify(invalidLane);
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

  describe('PUT by ID - API: /api/lanes/lane/lane/:id', () => { 

    const putLane = {
      ...testLane,
      squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
      lane_number: 101,
    }

    beforeAll(async () => {
      await resetLane();
    })

    afterEach(async () => {
      await resetLane();
    })

    it('should update a lane by ID', async () => { 
      const laneJSON = JSON.stringify(putLane);   
      const response = await axios.put(oneLaneUrl + testLane.id, laneJSON, {
        withCredentials: true
      });
      const lane = response.data.lane;
      expect(response.status).toBe(200);
      // did not update ssquad_id
      expect(lane.squad_id).toBe(testLane.squad_id);
      // all other fields updated
      expect(lane.lane_number).toBe(putLane.lane_number);
    })
    it('should NOT update a lane by ID when ID is invalid', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const response = await axios.put(oneLaneUrl + 'test', laneJSON, {
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
    it('should NOT update a lane by ID when ID is valid, but not a lane ID', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const response = await axios.put(oneLaneUrl + userId, laneJSON, {
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
    it('should NOT update a lane by ID when ID is not found', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const response = await axios.put(oneLaneUrl + notFoundId, laneJSON, {
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
    it('should NOT update a lane by ID when lane_number is null', async () => { 
      try {
        const invalidLane = {
          ...putLane,
          lane_number: null,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.put(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a lane by ID when lane_number is less than 1', async () => { 
      try {
        const invalidLane = {
          ...putLane,
          lane_number: 0,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.put(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a lane by ID when lane_number is more than 200', async () => { 
      try {
        const invalidLane = {
          ...putLane,
          lane_number: 201,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.put(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a lane when lane number + squd_id is not unique', async () => {
      const invalidLane = {
        ...putLane,
        squad_id: squad1Id,
        lane_number: 30,
      }
      const invalidJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "put",
          data: invalidJSON,
          withCredentials: true,
          url: oneLaneUrl + invalidLane.id,
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

  describe('PATCH by ID - API: /api/lanes/lane/:id', () => { 

    beforeAll(async () => {
      await resetLane();
    })
      
    afterEach(async () => {
      await resetLane();
    })

    it('should patch a lane by ID', async () => { 
      const patchLane = {
        ...testLane,
        lane_number: 101,
      }
      const laneJSON = JSON.stringify(patchLane);
      const response = await axios.patch(oneLaneUrl + patchLane.id, laneJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      const patchedlane = response.data.lane;
      expect(patchedlane.lane_number).toBe(101);
    })
    it('should NOT patch squad_id for a lane by ID', async () => { 
      const patchLane = {
        ...testLane,
        squad_id: squad2Id,
      }
      const laneJSON = JSON.stringify(patchLane);
      const response = await axios.patch(oneLaneUrl + patchLane.id, laneJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(200);
      const patchedlane = response.data.lane;
      // should not have patched squad_id
      expect(patchedlane.squad_id).toBe(testLane.squad_id);
    })    
    it('should NOT patch a lane by ID when ID is invalid', async () => { 
      const patchLane = {
        ...testLane,
        lane_number: 10,
      }
      try {
        const laneJSON = JSON.stringify(patchLane);
        const response = await axios.patch(oneLaneUrl + 'test', laneJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when ID is valid, but not a lane ID', async () => { 
      const patchLane = {
        ...testLane,
        lane_number: 10,
      }
      try {
        const laneJSON = JSON.stringify(patchLane);
        const response = await axios.patch(oneLaneUrl + userId, laneJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when id is not found', async () => { 
      const patchLane = {
        ...testLane,
        lane_number: 10,
      }
      try {
        const laneJSON = JSON.stringify(patchLane);
        const response = await axios.patch(oneLaneUrl + notFoundId, laneJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when lane_number is null', async () => { 
      try {
        const invalidLane = {
          ...testLane,
          lane_number: null,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.patch(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when lane_number is less than 1', async () => { 
      try {
        const invalidLane = {
          ...testLane,
          lane_number: 0,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.patch(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when lane_number is more than 200', async () => { 
      try {
        const invalidLane = {
          ...testLane,
          lane_number: 201,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.patch(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane by ID when lane_number is not an integer', async () => { 
      try {
        const invalidLane = {
          ...testLane,
          lane_number: 1.5,
        }
        const invalidJSON = JSON.stringify(invalidLane);
        const response = await axios.patch(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true,
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
    it('should NOT patch a lane when lane number + squd_id is not unique', async () => {
      const invalidLane = {
        ...testLane,
        squad_id: squad1Id,
        lane_number: 30,
      }
      const invalidJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios.patch(oneLaneUrl + invalidLane.id, invalidJSON, {
          withCredentials: true,
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

  describe('DELETE by ID - API: /api/lanes/lane/:id', () => { 

    const toDelLane = {
      ...initLane,
      id: "lan_255dd3b8755f4dea956445e7a3511d91",
      lane_number: 99,
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const divJSON = JSON.stringify(toDelLane);
        await axios.post(url, divJSON, { withCredentials: true });        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a lane by ID', async () => {
      const response = await axios.delete(oneLaneUrl + toDelLane.id, {
        withCredentials: true,
      })      
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should NOT delete a lane by ID when ID is not found', async () => {
      const response = await axios.delete(oneLaneUrl + notFoundId, {
        withCredentials: true,
      })      
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a lane by ID when ID is invalid', async () => {
      try {
        const response = await axios.delete(oneLaneUrl + 'test', {
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
    it('should NOT delete a lane by ID when ID is valid, bit not an lane id', async () => {
      try {
        const response = await axios.delete(oneLaneUrl + userId, {
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