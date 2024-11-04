import axios, { AxiosError } from "axios";
import { baseLanesApi, baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi, testBaseSquadsApi } from "../../../testApi";
import { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import { deleteAllSquadLanes, deleteAllTmntLanes, deleteLane, getAllLanesForTmnt, postLane, postManyLanes, putLane } from "@/lib/db/lanes/lanesAxios";
import { mockLanesToPost, mockSquadsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllTmntSquads, deleteSquad, postManySquads, postSquad } from "@/lib/db/squads/squadsAxios";

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
const urlForSquads = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi; 

const notFoundTmntId = 'tmt_00000000000000000000000000000000';

describe('lanesAxios', () => {

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

  describe('getAllLanesForTmnt', () => { 

    // from prisma/seed.ts
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
    const lanesToGet: laneType[] = [
      {
        ...initLane,    
        id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 29,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,    
        id: "lan_8590d9693f8e45558b789a6595b1675b",
        lane_number: 30,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,    
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 31,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,    
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6123",
        lane_number: 32,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      }, 
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6234",
        lane_number: 33,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6345",
        lane_number: 34,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6456",
        lane_number: 35,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      }, 
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6567",
        lane_number: 36,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6678",
        lane_number: 37,          
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6789",
        lane_number: 38,          
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6890",
        lane_number: 39,          
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc",
        lane_number: 40,          
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
    ]

    it('should get all lanes for a tmnt', async () => { 
      const lanes = await getAllLanesForTmnt(tmntId);
      expect(lanes).toHaveLength(lanesToGet.length);
      if (!lanes) return;
      for (let i = 0; i < lanesToGet.length; i++) {
        expect(lanes[i].id).toEqual(lanesToGet[i].id);
        expect(lanes[i].lane_number).toEqual(lanesToGet[i].lane_number);
        expect(lanes[i].squad_id).toEqual(lanesToGet[i].squad_id);
        expect(lanes[i].in_use).toEqual(lanesToGet[i].in_use);
      }
    })
    it("should return 0 lanes for not found tmnt", async () => { 
      const lanes = await getAllLanesForTmnt(notFoundTmntId);
      expect(lanes).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const lanes = await getAllLanesForTmnt('test');
      expect(lanes).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const lanes = await getAllLanesForTmnt(lanesToGet[0].id);
      expect(lanes).toBeNull();
    })
  })

  describe('postLane', () => { 

    const deletePostedLane = async () => {
      const response = await axios.get(url);
      const lanes = response.data.lanes;
      const toDel = lanes.find((l: laneType) => l.lane_number === 101);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneLaneUrl + toDel.id
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    const laneToPost = {
      ...initLane,    
      squad_id: 'sqd_3397da1adc014cf58c44e07c19914f72',
      lane_number: 101
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

    it('should post a lane', async () => {
      const postedLane = await postLane(laneToPost);
      expect(postedLane).not.toBeNull();
      if (!postedLane) return;
      createdLane = true;
      expect(postedLane.id).toBe(laneToPost.id);
      expect(postedLane.squad_id).toBe(laneToPost.squad_id);
      expect(postedLane.lane_number).toBe(laneToPost.lane_number);    
    })
    it('should NOT post a lane with invalid data', async () => { 
      const invalidLane = {
        ...laneToPost,
        lane_number: 0
      }
      const postedLane = await postLane(invalidLane);
      expect(postedLane).toBeNull();
    })

  })  

  describe('postManyLanes', () => {     

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

    it('should post many lanes', async () => { 
      const postedLanes = await postManyLanes(mockLanesToPost);
      expect(postedLanes).not.toBeNull();
      if (!postedLanes) return;
      createdLanes = true;
      expect(postedLanes.length).toBe(mockLanesToPost.length);
      for (let i = 0; i < postedLanes.length; i++) {
        expect(postedLanes[i].id).toEqual(mockLanesToPost[i].id);
        expect(postedLanes[i].squad_id).toEqual(mockLanesToPost[i].squad_id);
        expect(postedLanes[i].lane_number).toEqual(mockLanesToPost[i].lane_number);    
      }
    })
    // no test for sanitized data, since there is no strings to sanitize
    it('should not post many lanes with no data', async () => { 
      const postedLanes = await postManyLanes([]);
      expect(postedLanes).toBeNull();
    })
    it('should not post many lanes with invalid data', async () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
          lane_number: 0
        },
        {
          ...mockLanesToPost[1],          
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const postedLanes = await postManyLanes(invalidLanes);
      expect(postedLanes).toBeNull();
    })
  })

  describe('putLane', () => { 

    const laneToPut = {
      ...initLane,
      id: 'lan_ae24c5cc04f6463d89f24e6e19a12601',
      lane_number: 101,
      squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    }

    const putUrl = oneLaneUrl + laneToPut.id;

    const resetLane = {
      ...initLane,
      id: "lan_ae24c5cc04f6463d89f24e6e19a12601",
      lane_number: 1,
      squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    }

    const doReset = async () => {
      try {
        const laneJSON = JSON.stringify(resetLane);
        const response = await axios({
          method: "put",
          data: laneJSON,
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

    it('should put a lane', async () => {
      const puttedLane = await putLane(laneToPut);
      expect(puttedLane).not.toBeNull();
      if (!puttedLane) return;
      didPut = true;
      expect(puttedLane.id).toEqual(laneToPut.id);
      expect(puttedLane.squad_id).toEqual(laneToPut.squad_id);
      expect(puttedLane.lane_number).toEqual(laneToPut.lane_number);
    });
    it('should not put a lane with invalid data', async () => { 
      const invalidLane = {
        ...laneToPut,
        lane_number: 0
      }
      const puttedLane = await putLane(invalidLane);
      expect(puttedLane).toBeNull();
    })

  })

  describe('deleteLane', () => {
  
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initLane,
      id: "lan_255dd3b8755f4dea956445e7a3511d91",
      lane_number: 99,
      squad_id: "sqd_20c24199328447f8bbe95c05e1b84644",
    }

    const nonFoundId = "lan_00000000000000000000000000000000";
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostLane(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostLane(toDel);
      }
    });

    it("should delete a lane", async () => {
      const deleted = await deleteLane(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete a lane when ID is not found", async () => {
      const deleted = await deleteLane(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a lane when ID is invalid", async () => {
      const deleted = await deleteLane('test');
      expect(deleted).toBe(-1);
    });
    it('should NOT delete a lane when ID is valid, but not a lane ID', async () => { 
      const deleted = await deleteLane(mockLanesToPost[0].squad_id);
      expect(deleted).toBe(-1);
    })
    it('should not delete a lane when ID is blank', async () => {
      const deleted = await deleteLane('');
      expect(deleted).toBe(-1);
    })
    it('should not delete a lane when ID is null', async () => {
      const deleted = await deleteLane(null as any);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllSquadLanes', () => {

    const multiLanes = [
      {
        ...mockLanesToPost[0],
      },
      {
        ...mockLanesToPost[1],
      },
      {
        ...mockLanesToPost[2],
      },
      {
        ...mockLanesToPost[3],
      },
    ]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const lanes = response.data.lanes;
      // find first test lane
      const foundToDel = lanes.find(
        (l: laneType) => l.id === multiLanes[0].id
      );
      if (!foundToDel) {
        try {
          await postManyLanes(multiLanes);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      await postSquad(mockSquadsToPost[0])
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      await deleteAllSquadLanes(multiLanes[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
    });

    it('should delete all lanes for a squad', async () => {
      const deleted = await deleteAllSquadLanes(multiLanes[0].squad_id);
      expect(deleted).toBe(multiLanes.length);
      didDel = true;
    })
    it('should NOT delete all lanes for a squad when ID is invalid', async () => {
      const deleted = await deleteAllSquadLanes('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all lanes for a squad when ID is not found', async () => {
      const deleted = await deleteAllSquadLanes('sqd_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all lanes for a squad when ID is valid, but not a squad ID', async () => {
      const deleted = await deleteAllSquadLanes(mockLanesToPost[0].id);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllTmntLanes', () => { 

    const toDelSquads = [...mockSquadsToPost];
    const toDelLanes = [...mockLanesToPost];

    let didDel = false

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllSquadLanes(toDelSquads[0].id);
      await deleteAllSquadLanes(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
      // setup for tests
      await postManySquads(toDelSquads);
      await postManyLanes(toDelLanes);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;      
      await postManyLanes(toDelLanes);
    })

    afterAll(async () => {
      await deleteAllSquadLanes(toDelSquads[0].id);
      await deleteAllSquadLanes(toDelSquads[1].id);
      await deleteAllTmntSquads(tmntToDelId);
    })

    it('should delete all lanes for a tmnt', async () => {
      const deleted = await deleteAllTmntLanes(tmntToDelId);
      didDel = true;
      expect(deleted).toBe(toDelLanes.length);
    })
    it('should NOT delete all lanes for a tmnt when ID is invalid', async () => {
      const deleted = await deleteAllTmntLanes('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all lanes for a tmnt when tmnt ID is not found', async () => {
      const deleted = await deleteAllTmntLanes(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all lanes for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllTmntLanes(toDelLanes[0].id);
      expect(deleted).toBe(-1);
    })

  })

})


