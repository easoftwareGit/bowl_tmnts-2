import axios, { AxiosError } from "axios";
import { baseLanesApi, baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi, testBaseSquadsApi } from "../../../testApi";
import { laneType, squadType } from "@/lib/types/types";
import { initLane, initSquad } from "@/lib/db/initVals";
import { deleteAllTmntLanes } from "@/lib/db/lanes/lanesAxios";
import { mockLanesToPost, mockSquadsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/squadsAxios";

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

const url = testBaseLanesApi.startsWith("undefined")
  ? baseLanesApi
  : testBaseLanesApi;   
const oneLaneUrl = url + "/lane/";  
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";

const urlForSquads = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;
const oneSquadUrl = urlForSquads + "/squad/";

const notFoundId = "lan_01234567890123456789012345678901";
const notfoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const nonLaneId = "usr_01234567890123456789012345678901";

const squad1Id = 'sqd_7116ce5f80164830830a7157eb093396';
const squad2Id = 'sqd_1a6c885ee19a49489960389193e8f819';

const testLane: laneType = {
  id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
  lane_number: 29,
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  in_use: true,
}

const delOneLane = async (id: string) => { 
  try {
    const delResponse = await axios({
      method: "delete",
      withCredentials: true,
      url: oneLaneUrl + id
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

const deletePostedLane = async () => {
  const response = await axios.get(url);
  const lanes = response.data.lanes;
  const toDel = lanes.find((l: laneType) => l.lane_number === 101);
  if (toDel) {
    delOneLane(toDel.id);
  }
}

const resetLane = async () => {
  // make sure test lane is reset in database
  const laneJSON = JSON.stringify(testLane);
  const response = await axios({
    method: "put",
    data: laneJSON,
    withCredentials: true,
    url: oneLaneUrl + testLane.id,
  })  
}

const rePostLane = async (lane: laneType) => {
  try {
    // if lane already in database, then don't re-post
    const getResponse = await axios.get(oneLaneUrl + lane.id);
    const found = getResponse.data.lane;
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
    const laneJSON = JSON.stringify(lane);
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: laneJSON
    });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
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
      await deletePostedLane();
    })

    it('should get all lanes', async () => {
      const response = await axios.get(url);
      expect(response.status).toEqual(200);
      // 57 rows in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(57);
    })    

  })

  describe('GET by ID - API: /api/lanes/lane/:id', () => { 

    it('should get a lane by ID', async () => { 
      const response = await axios.get(oneLaneUrl + testLane.id);
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
        const response = await axios.get(oneLaneUrl + nonLaneId);
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
        const response = await axios.get(oneLaneUrl + notFoundId);
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
      await deletePostedLane();
    })

    it('should get all lanes for a squad', async () => {
      // const values taken from prisma/seed.ts
      const multiLaneSquadId = "sqd_7116ce5f80164830830a7157eb093396";
      const squadLaneId1 = 'lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d';
      const squadLaneId12 = 'lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc';
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + multiLaneSquadId
      })
      expect(response.status).toBe(200);
      // 12 rows for tmnt in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(12);
      const lanes: laneType[] = response.data.lanes;
      // query in /api/lanes/squad GET sorts by sort_order
      expect(lanes[0].id).toBe(squadLaneId1);
      expect(lanes[11].id).toBe(squadLaneId12);      
    }) 
    it('should return code 404 if squad id is invalid', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: squadUrl + 'test123'
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
    it('should return code 200 if squad not found, 0 rows returned', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: squadUrl + notfoundSquadId
      })
      expect(response.status).toBe(200);      
      expect(response.data.lanes).toHaveLength(0);
    })

  })

  describe('GET all lanes for a tmnt API: /api/lanes/tmnt/:tmntId', () => { 

    const tmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'; // 2 events & 2 squads

    beforeAll(async () => {
      await deletePostedLane();
    })

    it('should get all lanes for a tmnt', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId
      })
      expect(response.status).toBe(200);
      // 20 rows for tmnt in prisma/seed.ts
      expect(response.data.lanes).toHaveLength(20);
      const lanes: laneType[] = response.data.lanes;
      // query in /api/lanes/tmnt/:tmntId GET sorts by squadid, then sort_order
      expect(lanes[0].id).toBe('lan_ae24c5cc04f6463d89f24e6e19a12601');
      expect(lanes[19].id).toBe('lan_be24c5cc04f6463d89f24e6e19a12610');
    })
    it('should return empty array if tmnt not found', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId
      })
      expect(response.status).toBe(200);      
      expect(response.data.lanes).toHaveLength(0);
    })
    it('should return code 404 if tmnt id is invalid', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + 'test123'
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
    it('should return code 404 if tmnt id is valid, but not a tmnt id', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + notfoundSquadId
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

    const laneToPost: laneType = {
      ...initLane,      
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      lane_number: 101,
    }
  
    let createdLane = false;

    beforeAll(async () => {
      await deletePostedLane();
    })

    beforeEach(() => {
      createdLane = false;
    })

    afterEach(async () => {
      if (createdLane) {
        await deletePostedLane();
      }
    })

    it('should create a lane', async () => { 
      const laneJSON = JSON.stringify(laneToPost);
      const response = await axios({
        method: "post",
        data: laneJSON,
        withCredentials: true,
        url: url
      })      
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
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when id is blank', async () => { 
      const invalidLane = {
        ...laneToPost,
        id: '',
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when squad_id is blank', async () => { 
      const invalidLane = {
        ...laneToPost,
        squad_id: '',
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when lane number is null', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: null,
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when lane number is not an integer', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: 29.5,
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when lane number is less than 1', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: 0,
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when lane number is greater than 200', async () => {
      const invalidLane = {
        ...laneToPost,
        lane_number: 201,
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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
    it('should NOT create a new lane when lane number + squd_id is not unique', async () => {
      const invalidLane = {
        ...laneToPost,
        lane_number: 29,
      }
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "post",
          data: laneJSON,
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

  })

  describe('POST many lanes API: /api/lanes/many', () => { 
    
    let createdLanes = false;    

    beforeAll(async () => { 
      
      // remove any old test data
      await deleteAllTmntLanes(tmntToDelId); 
      await deleteAllTmntSquads(tmntToDelId);
      // make sure test squads in database
      await postManySquads(mockSquadsToPost); 
    })

    beforeEach(() => {
      createdLanes = false;
    })

    afterEach(async () => {
      if (createdLanes) {
        await deleteAllTmntLanes(tmntToDelId);
      }      
    })

    afterAll(async () => {
      await deleteAllTmntLanes(tmntToDelId);
      await deleteAllTmntSquads(tmntToDelId);
    })

    it('should create many lanes', async () => { 
      const lanesJSON = JSON.stringify(mockLanesToPost);
      const response = await axios({
        method: "post",
        data: lanesJSON,
        withCredentials: true,
        url: manyUrl
      })
      expect(response.status).toBe(201);
      const postedLanes = response.data.lanes;      
      createdLanes = true;
      expect(postedLanes.length).toEqual(mockLanesToPost.length);
      for (let i = 0; i < postedLanes.length; i++) {
        expect(postedLanes[i].id).toEqual(mockLanesToPost[i].id);
        expect(postedLanes[i].squad_id).toEqual(mockLanesToPost[i].squad_id);
        expect(postedLanes[i].lane_number).toEqual(mockLanesToPost[i].lane_number);
      }
    })
    // no need to sanitize data, since there is no strings to sanitize
    it('should not post lanes with invalid data in first lane', async () => {
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
          lane_number: 0,
        },
        {
          ...mockLanesToPost[1],          
        }
      ]
      const lanesJSON = JSON.stringify(invalidLanes);
      try {
        const response = await axios({
          method: "post",
          data: lanesJSON,
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
    it('should not post lanes with invalid data in other lane', async () => {
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
          lane_number: 41,
        },
        {
          ...mockLanesToPost[1],
          lane_number: 0,
        },
        {
          ...mockLanesToPost[0],
          lane_number: 43,
        },
        {
          ...mockLanesToPost[0],
          lane_number: 44,
        },
      ]
      const lanesJSON = JSON.stringify(invalidLanes);
      try {
        const response = await axios({
          method: "post",
          data: lanesJSON,
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
      const putResponse = await axios({
        method: "put",
        data: laneJSON,
        withCredentials: true,
        url: oneLaneUrl + testLane.id,
      })
      const lane = putResponse.data.lane;
      expect(putResponse.status).toBe(200);
      // did not update ssquad_id
      expect(lane.squad_id).toBe(testLane.squad_id);
      // all other fields updated
      expect(lane.lane_number).toBe(putLane.lane_number);
    })
    it('should NOT update a lane by ID when ID is invalid', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + 'test',
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
    it('should NOT update a lane by ID when ID is valid, but not a lane ID', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + nonLaneId,
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
    it('should NOT update a lane by ID when ID is not found', async () => { 
      try {
        const laneJSON = JSON.stringify(putLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + notFoundId,
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
    it('should NOT update a lane by ID when lane_number is null', async () => { 
      try {
        const invalidLane = {
          ...putLane,
          lane_number: null,
        }
        const laneJSON = JSON.stringify(invalidLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(putResponse.status).toBe(422);
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
        const laneJSON = JSON.stringify(invalidLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(putResponse.status).toBe(422);
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
        const laneJSON = JSON.stringify(invalidLane);
        const putResponse = await axios({
          method: "put",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(putResponse.status).toBe(422);
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
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "put",
          data: laneJSON,
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
      const patchResponse = await axios({
        method: "patch",
        data: laneJSON,
        withCredentials: true,
        url: oneLaneUrl + testLane.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedlane = patchResponse.data.lane;
      expect(patchedlane.lane_number).toBe(101);
    })
    it('should NOT patch squad_id for a lane by ID', async () => { 
      const patchLane = {
        ...testLane,
        squad_id: squad2Id,
      }
      const laneJSON = JSON.stringify(patchLane);
      const patchResponse = await axios({
        method: "patch",
        data: laneJSON,
        withCredentials: true,
        url: oneLaneUrl + testLane.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedlane = patchResponse.data.lane;
      // should not have patched squad_id
      expect(patchedlane.squad_id).toBe(testLane.squad_id);
    })    
    it('should NOT patch a lane by ID when ID is invalid', async () => { 
      try {
        const laneJSON = JSON.stringify(testLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + 'test',
        })
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a lane by ID when ID is valid, but not a lane ID', async () => { 
      try {
        const laneJSON = JSON.stringify(testLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + nonLaneId,
        })
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a lane by ID when id is not found', async () => { 
      try {
        const laneJSON = JSON.stringify(testLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + notFoundId,
        })
        expect(patchResponse.status).toBe(404);
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
        const laneJSON = JSON.stringify(invalidLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(patchResponse.status).toBe(422);
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
        const laneJSON = JSON.stringify(invalidLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(patchResponse.status).toBe(422);
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
        const laneJSON = JSON.stringify(invalidLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(patchResponse.status).toBe(422);
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
        const laneJSON = JSON.stringify(invalidLane);
        const patchResponse = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + testLane.id,
        })
        expect(patchResponse.status).toBe(422);
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
      const laneJSON = JSON.stringify(invalidLane);
      try {
        const response = await axios({
          method: "patch",
          data: laneJSON,
          withCredentials: true,
          url: oneLaneUrl + invalidLane.id,
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

  describe('DELETE by ID - API: /api/lanes/lane/:id', () => { 

    const toDelLane = {
      ...initLane,
      id: "lan_255dd3b8755f4dea956445e7a3511d91",
      lane_number: 99,
      squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const divJSON = JSON.stringify(toDelLane);
        const response = await axios({
          method: 'post',
          data: divJSON,
          withCredentials: true,
          url: url
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a lane by ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneLaneUrl + toDelLane.id,
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
    it('should NOT delete a lane by ID when ID is invalid', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneLaneUrl + 'test',
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
    it('should NOT delete a lane by ID when ID is not found', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneLaneUrl + notFoundId,
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
    it('should NOT delete a lane by ID when ID is valid, bit not an lane id', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneLaneUrl + nonLaneId
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
    
    // it('should NOT delete a lane by ID when lane has child rows', async () => { 
    //   try {
    //     const delResponse = await axios({
    //       method: "delete",
    //       withCredentials: true,
    //       url: oneLaneUrl + testLane.id
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

  describe('DELETE all lanes for a squad - API: /api/lanes/squad/:squadId', () => { 

    // squad id is from squad to delete from prisma/seeds.ts    
    const toDelLanes = [
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12601",
        lane_number: 1,
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12602",
        lane_number: 2,
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12603",
        lane_number: 3,
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12604",
        lane_number: 4,
        squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      },
    ]

    let didDel = false

    beforeAll(async () => {
      await rePostLane(toDelLanes[0]);
      await rePostLane(toDelLanes[1]);
      await rePostLane(toDelLanes[2]);
      await rePostLane(toDelLanes[3]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostLane(toDelLanes[0]);
      await rePostLane(toDelLanes[1]);
      await rePostLane(toDelLanes[2]);
      await rePostLane(toDelLanes[3]);
    })

    afterAll(async () => {
      await delOneLane(toDelLanes[0].id);
      await delOneLane(toDelLanes[1].id);
      await delOneLane(toDelLanes[2].id);
      await delOneLane(toDelLanes[3].id);
    })

    it('should delete all lanes for a squad', async () => { 
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + toDelLanes[0].squad_id
      })
      expect(response.status).toBe(200);      
      didDel = true;
      const count = response.data.deleted.count
      expect(count).toBe(toDelLanes.length); 
    })
    it('should return 404 when squad ID is invalid', async () => {
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
    it('should delete 0 lanes for a squad when squad id is not found', async () => { 
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: squadUrl + notfoundSquadId
      })
      expect(response.status).toBe(200);      
      didDel = true;
      const count = response.data.deleted.count
      expect(count).toBe(0); 
    })  
    it('should return 404 when squad ID is valid, but not an event ID', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: squadUrl + nonLaneId
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

  describe('DELETE all lanes for a tmnt - API: /api/lanes/tmnt/:tmntId', () => { 

    const tmntId = 'tmt_467e51d71659d2e412cbc64a0d19ecb4';
    const toDelSquads = [
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

    const toDelLanes = [
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12601",
        lane_number: 1,
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12602",
        lane_number: 2,
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12603",
        lane_number: 3,
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12604",
        lane_number: 4,
        squad_id: "sqd_c2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12605",
        lane_number: 5,
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12606",
        lane_number: 6,
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12607",
        lane_number: 7,
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
      },
      {
        ...initLane,
        id: "lan_ce24c5cc04f6463d89f24e6e19a12608",
        lane_number: 8,
        squad_id: "sqd_d2be0f9d527e4081972ce8877190489d",
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
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didDel = false

    beforeAll(async () => {
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
      await rePostLane(toDelLanes[0]);
      await rePostLane(toDelLanes[1]);
      await rePostLane(toDelLanes[2]);
      await rePostLane(toDelLanes[3]);
      await rePostLane(toDelLanes[4]);
      await rePostLane(toDelLanes[5]);
      await rePostLane(toDelLanes[6]);
      await rePostLane(toDelLanes[7]);
    })

    beforeEach(() => {
      didDel = false
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
      await rePostLane(toDelLanes[0]);
      await rePostLane(toDelLanes[1]);
      await rePostLane(toDelLanes[2]);
      await rePostLane(toDelLanes[3]);
      await rePostLane(toDelLanes[4]);
      await rePostLane(toDelLanes[5]);
      await rePostLane(toDelLanes[6]);
      await rePostLane(toDelLanes[7]);
    })

    afterAll(async () => {      
      await delOneLane(toDelLanes[0].id);
      await delOneLane(toDelLanes[1].id);
      await delOneLane(toDelLanes[2].id);
      await delOneLane(toDelLanes[3].id);
      await delOneLane(toDelLanes[4].id);
      await delOneLane(toDelLanes[5].id);
      await delOneLane(toDelLanes[6].id);
      await delOneLane(toDelLanes[7].id);
      await delOneSquad(toDelSquads[0].id);
      await delOneSquad(toDelSquads[1].id);
    })

    it('should delete all lanes for a tmnt', async () => { 
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: tmntUrl + tmntId
      })
      expect(response.status).toBe(200);
      didDel = true
      const count = response.data.deleted.count;
      expect(count).toBe(toDelLanes.length);
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
          url: tmntUrl + nonLaneId
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