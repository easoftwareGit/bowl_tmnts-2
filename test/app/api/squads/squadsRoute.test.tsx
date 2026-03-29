import axios, { AxiosError } from "axios";
import { baseSquadsApi, baseEventsApi } from "@/lib/api/apiPaths";
import { testBaseSquadsApi, testBaseEventsApi } from "../../../testApi";
import type { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";
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

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;   
const eventUrl = url + '/event/';
const oneBrktsUrl = url + "/oneBrkts/";
const oneSquadUrl = url + "/squad/";
const tmntUrl = url + '/tmnt/';

const notFoundId = "sqd_01234567890123456789012345678901";
const notfoundEventId = "evt_01234567890123456789012345678901";
const notfoundTmntId = "tmt_01234567890123456789012345678901";
const nonSquadId = "usr_01234567890123456789012345678901";  
const squad4Id = 'sqd_796c768572574019a6fa79b3b1c8fa57';
const event2Id = 'evt_dadfd0e9c11a4aacb87084f1609a0afd';
const event3Id = 'evt_06055deb80674bd592a357a4716d8ef2';

const testSquad: squadType = {
  ...initSquad,
  id: "sqd_7116ce5f80164830830a7157eb093396",
  event_id: "evt_cb97b73cb538418ab993fc867f860510",
  squad_name: "Squad 1",
  squad_date_str: '2022-10-23',
  squad_time: null,
  games: 6,
  lane_count: 12,
  starting_lane: 29,
  sort_order: 1,     
}  

const squadToPost: squadType = {
  ...initSquad,
  id: "sqd_1234567890abcdef1234567890abcdef",
  event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
  squad_name: "Test Squad",
  squad_date_str: '2023-02-02',
  squad_time: '09:00 AM',
  games: 8,
  lane_count: 20,
  starting_lane: 3,
  sort_order: 1,
}

const testPatchSquad = {
  id: testSquad.id,
  event_id: testSquad.event_id,
}

const deletePostedSquad = async (squadId: string) => {
  try {
      const response = await axios.delete(oneSquadUrl + squadId, { withCredentials: true });
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

const resetSquad = async (squad: squadType) => { 
  // make sure test squad is reset in database
  try {
    const squadJSON = JSON.stringify(squad);
    await axios.put(oneSquadUrl + squad.id, squadJSON, {
      withCredentials: true
    });
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

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
    await axios.post(url, squadJSON, {
      withCredentials: true
    })    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('Squads - API: /api/squads', () => {

  describe('GET all squads API: /api/squads', () => {

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    it('should get all squads', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 12 rows in prisma/seed.ts
      expect(response.data.squads).toHaveLength(12);
    })

  })

  describe('GET all squads for an event API: /api/squads/event/:eventId', () => {

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    it('should get all squads for an event', async () => {
      // const values taken from prisma/seed.ts
      const multiSquadEventId = "evt_06055deb80674bd592a357a4716d8ef2";
      const eventSquadId1 = 'sqd_42be0f9d527e4081972ce8877190489d';
      const eventSquadId2 = 'sqd_796c768572574019a6fa79b3b1c8fa57';
      const eventSquadId3 = 'sqd_1234ec18b3d44c0189c83f6ac5fd4ad6';
      
      const response = await axios.get(eventUrl + multiSquadEventId);
      expect(response.status).toBe(200);
      // 3 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(3);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(eventSquadId1);
      expect(squads[1].id).toBe(eventSquadId2);
      expect(squads[2].id).toBe(eventSquadId3);
    })
    it('should return 404 status code for an invalid event id', async () => {
      try {
        const response = await axios.get(eventUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 squads for an non existing event', async () => {
      const response = await axios.get(eventUrl + notfoundEventId);
      expect(response.status).toBe(200);
      expect(response.data.squads).toHaveLength(0);
    })
    it('should return 404 for when id is valid, but not an event id', async () => {
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: eventUrl + squad4Id,
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

  describe('GET all squads for a tmnt API: /api/squads/tmnt/:tmntId', () => {

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    it('should get all squads for a tournament, 1 event, 2 squads', async () => {
      const tmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'; // 1 event & 2 squads
      const tmntSquadId1 = 'sqd_42be0f9d527e4081972ce8877190489d';
      const tmntSquadId2 = 'sqd_796c768572574019a6fa79b3b1c8fa57';
      const tmntSquadId3 = 'sqd_1234ec18b3d44c0189c83f6ac5fd4ad6';

      const response = await axios.get(tmntUrl + tmntId);
      expect(response.status).toBe(200);
      // 3 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(3);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(tmntSquadId1);
      expect(squads[1].id).toBe(tmntSquadId2);
      expect(squads[2].id).toBe(tmntSquadId3);
    })
    it('should get all squads for a tournament, 2 events, 2 squads', async () => {
      const tmntId = 'tmt_2d494e9bb51f4b9abba428c3f37131c9';
      const tmntSquadId1 = 'sqd_853edbcc963745b091829e3eadfcf064';
      const tmntSquadId2 = 'sqd_a8daec18b3d44c0189c83f6ac5fd4ad6';
      const response = await axios.get(tmntUrl + tmntId);
      expect(response.status).toBe(200);
      // 2 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(2);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(tmntSquadId1);
      expect(squads[1].id).toBe(tmntSquadId2);
    })
    it('should return code 404 for an invalid tmnt id', async () => {
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
    it('should return 0 squads for an non existing tmnt', async () => {
      const response = await axios.get(tmntUrl + notfoundTmntId);
      expect(response.status).toBe(200);
      expect(response.data.squads).toHaveLength(0);
    })
    it('should return code 404 for when id is valid, but not an tmnt id', async () => {
      try {
        const response = await axios.get(tmntUrl + squad4Id);
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

  describe('GET by ID - API: /api/squads/squad/:id', () => {

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    it('should get squad by ID', async () => {
      const response = await axios.get(oneSquadUrl + testSquad.id);
      const squad = response.data.squad;
      expect(response.status).toBe(200);
      expect(squad.id).toBe(testSquad.id);
      expect(squad.event_id).toBe(testSquad.event_id);
      expect(squad.squad_name).toBe(testSquad.squad_name);
      expect(removeTimeFromISODateStr(squad.squad_date)).toBe(testSquad.squad_date_str);
      expect(squad.squad_time).toBe(null);
      expect(squad.games).toBe(testSquad.games);
      expect(squad.lane_count).toBe(testSquad.lane_count);
      expect(squad.starting_lane).toBe(testSquad.starting_lane);
      expect(squad.sort_order).toBe(testSquad.sort_order);
    })
    it('should NOT get a squad by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneSquadUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a squad by ID when ID is valid, but not a squad ID', async () => {
      try {
        const response = await axios.get(oneSquadUrl + nonSquadId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a squad by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneSquadUrl + notFoundId);
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

  // // make sure to comment out these tests
  // describe('GET all entries for one squad API: /api/squads/entries/squad/:id', () => { 
    
  //   it('should get all entries for one squad', async () => {
  //     const squadID = mockCurData.squads[0].id;
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: entriesUrl + squadID,        
  //       params: { curData: JSON.stringify(mockCurData) }
  //     });
  //     expect(response.status).toBe(200);
  //     const squadEntries = response.data.squadEntries;
  //     expect(squadEntries).toHaveLength(6);
  //   })
  //   it('should return code 404 for when id does not match squad id in curData', async () => {      
  //     const squadID = 'sqd_3397da1adc014cf58c44e07c19914f70'; // changed last digit to not match
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         withCredentials: true,
  //         url: entriesUrl + squadID,          
  //         params: { curData: JSON.stringify(mockCurData) }
  //       });
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should return code 404 for when squads is null in curData', async () => {      
  //     const squadID = mockCurData.squads[0].id;
  //     const invalidData = cloneDeep(mockCurData)
  //     invalidData.squads = null as any;
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         withCredentials: true,
  //         url: entriesUrl + squadID,          
  //         params: { curData: JSON.stringify(invalidData) }
  //       });
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should return code 404 for with empty squads in curData', async () => {      
  //     const squadID = mockCurData.squads[0].id;
  //     const invalidData = cloneDeep(mockCurData)
  //     invalidData.squads = [];
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         withCredentials: true,
  //         url: entriesUrl + squadID,          
  //         params: { curData: JSON.stringify(invalidData) }
  //       });
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should return code 400 for when no curData', async () => {      
  //     const squadID = 'sqd_3397da1adc014cf58c44e07c19914f70'; // changed last digit to not match
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         withCredentials: true,
  //         url: entriesUrl + squadID,          
  //         params: { curData: JSON.stringify({}) }
  //       });
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })    
  // })

  describe("GET squad's one brkts and seeds API: /api/squads/oneBrkts/squad/:id", () => {
    
    // from prisma/seeds.ts
    const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
    const brktId = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    it('should get squad one brkts and seeds', async () => {
      const response = await axios.get(oneBrktsUrl + squadId);
      expect(response.status).toBe(200);
      const oneBrktsAndSeeds = response.data.oneBrktsAndSeeds;
      expect(oneBrktsAndSeeds).toHaveLength(32);
      for (let i = 0; i < oneBrktsAndSeeds.length; i++) {
        const oneBrktAndSeed = oneBrktsAndSeeds[i];
        expect(isValidBtDbId(oneBrktAndSeed.one_brkt_id, "obk")).toBe(true);
        expect(isValidBtDbId(oneBrktAndSeed.brkt_id, "brk")).toBe(true);
        if (i <= 7 || (i >= 16 && i <= 23)) expect(oneBrktAndSeed.bindex).toBe(0)
        else expect(oneBrktAndSeed.bindex).toBe(1);
        expect(oneBrktAndSeed.seed).toBe(i % 8)
      }
    })
    it('should return code 404 when passed invalid squad id', async () => {
      const invalidSquadId = 'test';
      try {
        const response = await axios.get(oneBrktsUrl + invalidSquadId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 404 when passed valid id, but not a squad id', async () => {
      try {
        const response = await axios.get(oneBrktsUrl + brktId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return code 404 when passed empty string', async () => {
      try {
        const response = await axios.get(oneBrktsUrl);
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

  describe('POST API: /api/squads', () => {

    let createdSquad = false;

    beforeAll(async () => {
      await deletePostedSquad(squadToPost.id);
    })

    beforeEach(() => {
      createdSquad = false;
    })

    afterEach(async () => {
      if (createdSquad) {
        await deletePostedSquad(squadToPost.id);
      }
    })

    it('should create a new squad', async () => {
      const squadJSON = JSON.stringify(squadToPost);
      const response = await axios.post(url, squadJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(removeTimeFromISODateStr(postedSquad.squad_date)).toBe(squadToPost.squad_date_str);
      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    })
    it('should create a new squad without a squad time', async () => {
      const noTimeSuqd = {
        ...squadToPost,
        squad_time: '',
      }
      const squadJSON = JSON.stringify(noTimeSuqd);
      const response = await axios.post(url, squadJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.squad_time).toBe('');
    })
    it('should create a new squad when squad_date_str is a valid date in DD/MM/YYY format', async () => {
      const dateSquad = {
        ...squadToPost,
        squad_date_str: '10/20/2024',
      }
      const squadJSON = JSON.stringify(dateSquad);
      const response = await axios.post(url, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(removeTimeFromISODateStr(postedSquad.squad_date)).toBe('2024-10-20');
    })
    it('should create a new squad with sanitized data', async () => {
      const toSanitizeSquad = {
        ...squadToPost,
        squad_name: "<script>N</script>",
      }
      const squadJSON = JSON.stringify(toSanitizeSquad);
      const response = await axios.post(url, squadJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.squad_name).toBe('scriptNscript');
    });
    it('should NOT create a new squad when id is blank', async () => {
      const invalidSquad = {
        ...squadToPost,
        id: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when event_id is blank', async () => {
      const invalidSquad = {
        ...squadToPost,
        event_id: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_name is blank', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_name: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_date_str is blank', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_date_str: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when games is null', async () => {
      const invalidSquad = {
        ...squadToPost,
        games: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when lane_count is null', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when starting_lane is null', async () => {
      const invalidSquad = {
        ...squadToPost,
        starting_lane: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when sort_order is null', async () => {
      const invalidSquad = {
        ...squadToPost,
        sort_order: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when id is invalid', async () => {
      const invalidSquad = {
        ...squadToPost,
        id: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when id is valid, but not a squad id', async () => {
      const invalidSquad = {
        ...squadToPost,
        id: nonSquadId,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when event_id is invalid', async () => {
      const invalidSquad = {
        ...squadToPost,
        event_id: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when event_id is valid, but not an event id', async () => {
      const invalidSquad = {
        ...squadToPost,
        event_id: nonSquadId,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when event_id does not exist', async () => {
      const invalidSquad = {
        ...squadToPost,
        event_id: notfoundEventId,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_name_str is too long', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_name: 'a'.repeat(51),
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_date_str is too far in the past', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_date_str: '1800-11-01'
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_date_str is too far in the future', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_date_str: '2300-11-01',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_date_str is not a valid day', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_date_str: '20/20/2024',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_date is invalid date', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_date_str: 'testing',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when squad_time is invalid', async () => {
      const invalidSquad = {
        ...squadToPost,
        squad_time: '13:00 PM',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when games is too small', async () => {
      const invalidSquad = {
        ...squadToPost,
        games: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when games is too large', async () => {
      const invalidSquad = {
        ...squadToPost,
        games: 100,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when games is not an integer', async () => {
      const invalidSquad = {
        ...squadToPost,
        games: 5.5,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when starting_lane is too small', async () => {
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when starting_lane is too large', async () => {
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 201,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when starting_lane is even', async () => {
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 2,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when starting_lane is not an integer', async () => {
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 1.4,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when lane_count is too small', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when lane_count is too large', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: 202,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when lane_count is odd', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: 3,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when lane_count is not an integer', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: 3.3,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when sort_order is too small', async () => {
      const invalidSquad = {
        ...squadToPost,
        sort_order: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should NOT create a new squad when sort_order is too large', async () => {
      const invalidSquad = {
        ...squadToPost,
        sort_order: 1234567,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
    it('should not create a new squad when event_id + squad_name is not unique', async () => {
      const invalidSquad = {
        ...squadToPost,
        event_id: event2Id,
        squad_name: "Squad 1",
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.post(url, invalidJSON, {
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
  });

  describe('PUT by ID - API: /api/squads/squad/:id', () => {

    const putSquad = {
      ...testSquad,
      event_id: "evt_06055deb80674bd592a357a4716d8ef2",
      squad_name: "Test Squad",
      squad_date_str: '2022-07-07',
      squad_time: '11:00 AM',
      games: 5,
      lane_count: 20,
      starting_lane: 1,
      sort_order: 4,
    }

    const sampleSquad = {
      ...initSquad,
      event_id: "evt_06055deb80674bd592a357a4716d8ef2",
      squad_name: "Test Squad",
      squad_date: '2022-06-06',
      squad_time: '09:00 AM',
      games: 8,
      lane_count: 16,
      starting_lane: 5,
      sort_order: 8,
    }

    beforeAll(async () => {
      await resetSquad(testSquad);
    })

    afterEach(async () => {
      await resetSquad(testSquad);
    })

    it('should update a squad by ID', async () => {
      const squadJSON = JSON.stringify(putSquad);
      const response = await axios.put(oneSquadUrl + testSquad.id, squadJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      const squad = response.data.squad;
      // did not update tmnt_id
      expect(squad.event_id).toBe(testSquad.event_id);
      // all other fields updated
      expect(squad.squad_name).toBe(putSquad.squad_name);
      expect(removeTimeFromISODateStr(squad.squad_date)).toBe(putSquad.squad_date_str);
      expect(squad.squad_time).toBe(putSquad.squad_time);
      expect(squad.games).toBe(putSquad.games);
      expect(squad.lane_count).toBe(putSquad.lane_count);
      expect(squad.starting_lane).toBe(putSquad.starting_lane);
      expect(squad.sort_order).toBe(putSquad.sort_order);
    })
    it('should update a squad by ID when squad_date_str is valid MM/DD/YYYY', async () => {
      const noTimeSquad = {
        ...putSquad,
        squad_date_str: '10/20/2022',
      }
      const squadJSON = JSON.stringify(noTimeSquad);
      const response = await axios.put(oneSquadUrl + noTimeSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const squad = response.data.squad;
      expect(squad.squad_time).toBe(noTimeSquad.squad_time);
    })
    it('should update a squad by ID when just squad_time is empty', async () => {
      const noTimeSquad = {
        ...putSquad,
        squad_time: '',
      }
      const squadJSON = JSON.stringify(noTimeSquad);
      const response = await axios.put(oneSquadUrl + noTimeSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const squad = response.data.squad;
      expect(squad.squad_time).toBe(noTimeSquad.squad_time);
    })
    it('should NOT update a squad by ID when ID is invalid', async () => {
      try {
        const squadJSON = JSON.stringify(putSquad);
        const response = await axios.put(oneSquadUrl + 'test', squadJSON, {
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
    it('should NOT update a squad by ID when ID is valid, but not a squad ID', async () => {
      try {
        const squadJSON = JSON.stringify(putSquad);
        const response = await axios.put(oneSquadUrl + nonSquadId, squadJSON, {
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
    it('should NOT update a squad by ID when ID is not found.', async () => {
      try {
        const squadJSON = JSON.stringify(putSquad);
        const response = await axios.put(oneSquadUrl + notFoundId, squadJSON, {
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
    it('should NOT update a squad by ID when squad_name is missing', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_name: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_date_str is blank', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_date_str: '',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when games is missing', async () => {
      const invalidSquad = {
        ...putSquad,
        games: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when starting_lane is missing', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when lane_count is missing', async () => {
      const invalidSquad = {
        ...putSquad,
        lane_count: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when sort_order is missing', async () => {
      const invalidSquad = {
        ...putSquad,
        sort_order: null as any,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_name is too long', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_name: 'a'.repeat(51),
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_date_str to too far in the past', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_date_str: '1800-01-01',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_date_str to too far in the future', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_date_str: '2300-01-01',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_date_str is invalid', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_date_str: 'testing',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when squad_time is invalid', async () => {
      const invalidSquad = {
        ...putSquad,
        squad_time: '24:01',
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when games is too small', async () => {
      const invalidSquad = {
        ...putSquad,
        games: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when games is too large', async () => {
      const invalidSquad = {
        ...putSquad,
        games: 101,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when lane_count is too small', async () => {
      const invalidSquad = {
        ...putSquad,
        lane_count: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when lane_count is too large', async () => {
      const invalidSquad = {
        ...putSquad,
        lane_count: 202,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when lane_count is odd', async () => {
      const invalidSquad = {
        ...putSquad,
        lane_count: 5,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when lane_count is not an integer', async () => {
      const invalidSquad = {
        ...putSquad,
        lane_count: 5.5,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when starting_lane is too small', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when starting_lane is too large', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: 201,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when starting_lane is even', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: 4,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when starting_lane is not an integer', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: 4.4,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when sort_order is too small', async () => {
      const invalidSquad = {
        ...putSquad,
        sort_order: 0,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when sort_order is too large', async () => {
      const invalidSquad = {
        ...putSquad,
        sort_order: 1234567,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a squad by ID when sort_order is not an integer', async () => {
      const invalidSquad = {
        ...putSquad,
        sort_order: 4.4,
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT update a new squad when event_id + squad_name is not unique', async () => {
      const invalidSquad = {
        ...initSquad,
        id: squad4Id,
        event_id: event3Id,
        squad_name: "A Squad",
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.put(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should update a squad by ID with sanitized data', async () => {
      const toSanitizeSquad = {
        ...putSquad,
        squad_name: "<script>N</script>   ",
      }
      const squadJSON = JSON.stringify(toSanitizeSquad);
      const response = await axios({
        method: "put",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + testSquad.id,
      })
      expect(response.status).toBe(200);
      expect(response.data.squad.squad_name).toBe('scriptNscript');
    })

  })

  describe('PATCH by ID - API: /api/squads/squad/:id', () => {

    beforeAll(async () => {
      await resetSquad(testSquad);
    })
      
    afterEach(async () => {
      await resetSquad(testSquad);
    })

    it('should patch squad_name in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        squad_name: 'Patched Squad'
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.squad_name).toBe(patchSquad.squad_name);
    })
    it('should patch squad_date in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        squad_date_str: '2022-08-22',
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(removeTimeFromISODateStr(patchedSquad.squad_date)).toBe('2022-08-22')
    })
    it('should patch squad_time in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        squad_time: '12:30'
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.squad_time).toBe(patchSquad.squad_time);
    })
    it('should patch games in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        games: 5
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.games).toBe(patchSquad.games);
    })
    it('should patch lane_count in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        lane_count: 10
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.lane_count).toBe(patchSquad.lane_count);
    })
    it('should patch starting_lane in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        starting_lane: 1
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.starting_lane).toBe(patchSquad.starting_lane);
    })
    it('should patch sort_order in a squad by ID', async () => {
      const patchSquad = {
        ...testPatchSquad,
        sort_order: 10
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.sort_order).toBe(patchSquad.sort_order);
    })
    it('should patch a squad with a sanitzed squad name', async () => {
      const patchSquad = {
        ...testPatchSquad,
        squad_name: "    <script>P</script>   ",
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.squad_name).toBe("scriptPscript");
    })
    it('should patch a squad with a blank squad_time', async () => {
      const patchSquad = {
        ...testPatchSquad,
        squad_time: "",
      }
      const squadJSON = JSON.stringify(patchSquad);
      const response = await axios.patch(oneSquadUrl + patchSquad.id, squadJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      expect(patchedSquad.squad_time).toBe("");
    })

    it('should NOT patch event_id in a squad by ID', async () => {
      const invalidSquad = {
        ...testPatchSquad,
        event_id: event2Id
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedSquad = response.data.squad;
      // test vs blankSquad, not patchSquad
      expect(patchedSquad.event_id).toBe(testPatchSquad.event_id);
    })
    it('should NOT patch a squad when ID is invalid', async () => {
      try {
        const patchSquad = {
          ...testPatchSquad,
          squad_name: 'Patched Squad',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const response = await axios.patch(oneSquadUrl + 'test', squadJSON, {
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
    it('should NOT patch a squad when ID is not found', async () => {
      try {
        const patchSquad = {
          ...testPatchSquad,
          squad_name: 'Patched Squad',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const response = await axios.patch(oneSquadUrl + notFoundId, squadJSON, {
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
    it('should NOT patch a squad when ID is valid, but not a squad ID', async () => {
      try {
        const patchSquad = {
          ...testPatchSquad,
          squad_name: 'Patched Squad',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const response = await axios.patch(oneSquadUrl + nonSquadId, squadJSON, {
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
    it('should NOT patch a squad when event_id is blank', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          event_id: '',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad_name is blank', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_name: '',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad_date_str is blank', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_date_str: '',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when games is null', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          games: null,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when lane_count is null', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          lane_count: null,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when starting_lane is null', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          starting_lane: null,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when sort_order is null', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          sort_order: null,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad_name is too long', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_name: 'a'.repeat(256),
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad date is in too far in the past', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_date_str: '1800-01-01',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad date is in too far in the future', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_date_str: '2300-03-02',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when squad_time is invalid', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          squad_time: '13:00 PM',
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when games is too low', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          games: 0,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when games is too high', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          games: 100,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when games is not an integer', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          games: 5.5,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when lane_count is too low', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          lane_count: 0,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when lane_count is too high', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          lane_count: 202,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when lane_count is odd', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          lane_count: 13,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when lane_count is not an integer', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          lane_count: 13.5,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when starting_lane is too low', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          starting_lane: 0,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when starting_lane is too high', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          starting_lane: 202,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when starting_lane is even', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          starting_lane: 12,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when starting_lane is not an integer', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          starting_lane: 12.5,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when sort_order is too low', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          sort_order: 0,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when sort_order is too high', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          sort_order: 1234567,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a squad when sort_order is not an integer', async () => {
      try {
        const invalidSquad = {
          ...testPatchSquad,
          sort_order: 5.5,
        }
        const invalidJSON = JSON.stringify(invalidSquad);
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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
    it('should NOT patch a new squad when event_id + squad_name is not unique', async () => {
      const invalidSquad = {
        ...testPatchSquad,
        id: squad4Id,
        event_id: event3Id,
        squad_name: "A Squad",
      }
      const invalidJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios.patch(oneSquadUrl + invalidSquad.id, invalidJSON, {
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

  describe('DELETE by ID - API: /api/squads/:id', () => {

    // to delete from prisma/seeds.ts
    const toDelSquad = {
      ...initSquad,
      id: "sqd_3397da1adc014cf58c44e07c19914f72",
      event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
      squad_name: "Squad X",
      squad_date: startOfDayFromString("2023-09-16") as Date,
      squad_time: "02:00 PM",
      games: 6,
      lane_count: 24,
      starting_lane: 1,
      sort_order: 3,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const squadJSON = JSON.stringify(toDelSquad);
        await axios.post(url, squadJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a squad by ID', async () => {
      const response = await axios.delete(oneSquadUrl + toDelSquad.id, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should return 0 when delete a squad by ID when ID is not found', async () => {
      const response = await axios.delete(oneSquadUrl + notFoundId, {
        withCredentials: true
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a squad by ID when ID is invalid', async () => {
      try {
        const response = await axios.delete(oneSquadUrl + 'test', {
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
    it('should NOT delete a squad by ID when ID is valid, but not an squad id', async () => {
      try {
        const response = await axios.delete(oneSquadUrl + nonSquadId, {
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