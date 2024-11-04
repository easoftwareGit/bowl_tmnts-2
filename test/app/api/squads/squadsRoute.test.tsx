import axios, { AxiosError } from "axios";
import { baseSquadsApi, baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi, testBaseEventsApi } from "../../../testApi";
import { eventType, squadType } from "@/lib/types/types";
import { initEvent, initSquad } from "@/lib/db/initVals";
import { compareAsc } from "date-fns";
import { startOfDayFromString } from "@/lib/dateTools";
import { deleteAllTmntSquads } from "@/lib/db/squads/squadsAxios";
import { mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

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
const oneSquadUrl = url + "/squad/";
const eventUrl = url + '/event/';
const tmntUrl = url + '/tmnt/';
const manyUrl = url + "/many";

const urlForEvents = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;   
const oneEventUrl = urlForEvents + "/event/"  

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
  squad_date: startOfDayFromString('2022-09-23') as Date,
  squad_time: null,
  games: 6,
  lane_count: 12,
  starting_lane: 29,
  sort_order: 1,
}  

const blankSquad = {
  id: testSquad.id,
  event_id: testSquad.event_id,
}

const deletePostedSquad = async () => {
  const response = await axios.get(url);
  const squads = response.data.squads;
  const toDel = squads.find((s: squadType) => s.squad_name === 'Test Squad');
  if (toDel) {
    try {
      const delResponse = await axios({
        method: "delete",
        withCredentials: true,
        url: oneSquadUrl + toDel.id
      });        
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }
}

const resetSquad = async () => { 
  // make sure test user is reset in database
  try {
    const squadJSON = JSON.stringify(testSquad);
    const response = await axios({
      method: "put",
      data: squadJSON,
      withCredentials: true,
      url: oneSquadUrl + testSquad.id,
    })
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
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: squadJSON
    });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('Squads - API: /api/squads', () => { 

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedSquad();
    })

    it('should get all squads', async () => { 
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 8 rows in prisma/seed.ts
      expect(response.data.squads).toHaveLength(8);
    })

  })

  describe('GET all squads for an event API: /api/squads/event/:eventId', () => { 

    beforeAll(async () => {  
      await deletePostedSquad();
    })

    it('should get all squads for an event', async () => { 
      // const values taken from prisma/seed.ts
      const multiSquadEventId = "evt_06055deb80674bd592a357a4716d8ef2";
      const eventSquadId1 = 'sqd_42be0f9d527e4081972ce8877190489d';
      const eventSquadId2 = 'sqd_796c768572574019a6fa79b3b1c8fa57';
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: eventUrl + multiSquadEventId,
      })
      expect(response.status).toBe(200);
      // 2 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(2);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(eventSquadId1);
      expect(squads[1].id).toBe(eventSquadId2);      
    })
    it('should return 404 status code for an invalid event id', async () => { 
      try {        
        const putResponse = await axios({
          method: "get",          
          withCredentials: true,
          url: eventUrl + 'test',
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
    it('should return 0 squads for an non existing event', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: eventUrl + notfoundEventId,
      })
      expect(response.status).toBe(200);      
      expect(response.data.squads).toHaveLength(0);
    })
    it('should return 404 for when id is valid, but not an event id', async () => { 
      try {        
        const putResponse = await axios({
          method: "get",          
          withCredentials: true,
          url: eventUrl + squad4Id,
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
  })

  describe('GET all squads for a tmnt API: /api/squads/tmnt/:tmntId', () => {

    beforeAll(async () => {  
      await deletePostedSquad();
    })

    it('should get all squads for a tournament, 1 event, 2 squads', async () => {
      const tmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea'; // 1 event & 2 squads
      const tmntSquadId1 = 'sqd_42be0f9d527e4081972ce8877190489d';
      const tmntSquadId2 = 'sqd_796c768572574019a6fa79b3b1c8fa57';

      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId,
      })
      expect(response.status).toBe(200);
      // 2 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(2);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(tmntSquadId1);
      expect(squads[1].id).toBe(tmntSquadId2);      
    })
    it('should get all squads for a tournament, 3 events, 2 squads', async () => {
      const tmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
      const tmntSquadId1 = 'sqd_3397da1adc014cf58c44e07c19914f71';
      const tmntSquadId2 = 'sqd_20c24199328447f8bbe95c05e1b84644';
      const tmntSquadId3 = 'sqd_3397da1adc014cf58c44e07c19914f72';
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + tmntId,
      })
      expect(response.status).toBe(200);
      // 3 rows for tmnt in prisma/seed.ts
      expect(response.data.squads).toHaveLength(3);
      const squads: squadType[] = response.data.squads;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(squads[0].id).toBe(tmntSquadId1);
      expect(squads[1].id).toBe(tmntSquadId2);   
      expect(squads[2].id).toBe(tmntSquadId3);   
    })
    it('should return code 404 for an invalid tmnt id', async () => { 
      try {        
        const putResponse = await axios({
          method: "get",          
          withCredentials: true,
          url: tmntUrl + 'test',
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
    it('should return 0 squads for an non existing tmnt', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notfoundTmntId,
      })
      expect(response.status).toBe(200);      
      expect(response.data.squads).toHaveLength(0);
    })
    it('should return code 404 for when id is valid, but not an tmnt id', async () => { 
      try {        
        const putResponse = await axios({
          method: "get",          
          withCredentials: true,
          url: tmntUrl + squad4Id,
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
  })

  describe('GET by ID - API: /api/squads/squad/[id]', () => { 

    it('should get squad by ID', async () => { 
      const response = await axios.get(oneSquadUrl + testSquad.id);
      const squad = response.data.squad;
      expect(response.status).toBe(200);
      expect(squad.id).toBe(testSquad.id);
      expect(squad.event_id).toBe(testSquad.event_id);
      expect(squad.squad_name).toBe(testSquad.squad_name);
      const squadDate = new Date(testSquad.squad_date);
      expect(compareAsc(squadDate, testSquad.squad_date)).toBe(0);      
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

  describe('POST', () => {

    const squadToPost: squadType = {
      ...initSquad,      
      event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
      squad_name: "Test Squad",
      squad_date: startOfDayFromString('2023-02-02') as Date,
      squad_time: '09:00 AM',
      games: 8,
      lane_count: 20,
      starting_lane: 3,
      sort_order: 1,
    }

    let createdSquad = false;

    beforeAll(async () => {
      await deletePostedSquad();
    })

    beforeEach(() => {
      createdSquad = false;
    })

    afterEach(async () => {
      if (createdSquad) {
        await deletePostedSquad();
      }
    })

    it('should create a new squad', async () => { 
      const squadJSON = JSON.stringify(squadToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: squadJSON
      });
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
      expect(postedSquad.games).toBe(squadToPost.games);
      const squadDate = new Date(postedSquad.squad_date);
      expect(compareAsc(squadDate, squadToPost.squad_date)).toBe(0);
      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    })      
    it('should create a new squad without a squad time', async () => { 
      const noTimeSuqd = {
        ...squadToPost,
        squad_time: '',
      }
      const squadJSON = JSON.stringify(noTimeSuqd);
      const response = await axios({
        method: "post",
        data: squadJSON,
        withCredentials: true,
        url: url
      })
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.squad_time).toBe('');
    })
    it('should NOT create a new squad when id is blank', async () => { 
      const invalidSquad = {
        ...squadToPost,
        id: '',        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when event_id is blank', async () => { 
      const invalidSquad = {
        ...squadToPost,
        event_id: '',        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when squad_name is blank', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_name: '',        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when squad_date is blank', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_date: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when games is null', async () => { 
      const invalidSquad = {
        ...squadToPost,
        games: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when lane_count is null', async () => {
      const invalidSquad = {
        ...squadToPost,
        lane_count: null as any,                
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when starting_lane is null', async () => { 
      const invalidSquad = {
        ...squadToPost,
        starting_lane: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when sort_order is null', async () => { 
      const invalidSquad = {
        ...squadToPost,
        sort_order: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when id is invalid', async () => { 
      const invalidSquad = {
        ...squadToPost,
        id: 'invalid',
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when id is valid, but not a squad id', async () => { 
      const invalidSquad = {
        ...squadToPost,
        id: nonSquadId,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when event_id is invalid', async () => { 
      const invalidSquad = {
        ...squadToPost,
        event_id: 'invalid',        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when event_id is valid, but not an event id', async () => { 
      const invalidSquad = {
        ...squadToPost,
        event_id: nonSquadId,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when event_id does not exist', async () => { 
      const invalidSquad = {
        ...squadToPost,
        event_id: notfoundEventId,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new squad when squad_name is too long', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_name: 'a'.repeat(51),        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when squad_date it too far in the past', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_date: startOfDayFromString('1800-11-01') as Date,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when squad_date is too far in the future', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_date: startOfDayFromString('2300-11-01') as Date,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when squad_time is invalid', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_time: '13:00 PM',   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when games is too small', async () => { 
      const invalidSquad = {
        ...squadToPost,
        games: 0,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when games is too large', async () => { 
      const invalidSquad = {
        ...squadToPost,
        games: 100,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when games is not an integer', async () => { 
      const invalidSquad = {
        ...squadToPost,
        games: 5.5,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when starting_lane is too small', async () => { 
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 0,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when starting_lane is too large', async () => { 
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 201,   
      } 
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when starting_lane is even', async () => { 
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 2,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when starting_lane is not an integer', async () => { 
      const invalidSquad = {
        ...squadToPost,
        starting_lane: 1.4,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when lane_count is too small', async () => { 
      const invalidSquad = {
        ...squadToPost,
        lane_count: 0,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when lane_count is too large', async () => { 
      const invalidSquad = {
        ...squadToPost,
        lane_count: 202,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when lane_count is odd', async () => { 
      const invalidSquad = {
        ...squadToPost,
        lane_count: 3,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when lane_count is not an integer', async () => { 
      const invalidSquad = {
        ...squadToPost,
        lane_count: 3.3,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when sort_order is too small', async () => { 
      const invalidSquad = {
        ...squadToPost,
        sort_order: 0,   
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should NOT create a new squad when sort_order is too large', async () => {
      const invalidSquad = {
        ...squadToPost,
        sort_order: 1234567,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should not create a new squad when event_id + squad_name is not unique', async () => { 
      const invalidSquad = {
        ...squadToPost,
        event_id: event2Id,
        squad_name: "Squad 1",
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "post",
          data: squadJSON,
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
    it('should create a new squad with sanitized data', async () => { 
      const toSanitizeSquad = {
        ...squadToPost,
        squad_name: "    <script>" + squadToPost.squad_name + "</script>   ",
      }
      const squadJSON = JSON.stringify(toSanitizeSquad);      
      const response = await axios({
        method: "post",
        data: squadJSON,
        withCredentials: true,
        url: url
      })
      expect(response.status).toBe(201);
      const postedSquad = response.data.squad;
      createdSquad = true;
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
    })

  })

  describe('POST many squads API: /api/squads/many', () => { 

    const tmntId = 'tmt_467e51d71659d2e412cbc64a0d19ecb4'

    let createdSquads = false;    

    beforeAll(async () => { 
      await deleteAllTmntSquads(tmntId);
    })

    beforeEach(() => {
      createdSquads = false;
    })

    afterEach(async () => {
      if (createdSquads) {
        await deleteAllTmntSquads(tmntId);
      }      
    })

    it('should create many squads', async () => { 
      const squadJSON = JSON.stringify(mockSquadsToPost);
      const response = await axios({
        method: "post",
        data: squadJSON,
        withCredentials: true,
        url: manyUrl
      })
      const postedSquads = response.data.squads;
      expect(response.status).toBe(201);
      createdSquads = true;
      expect(postedSquads.length).toEqual(mockSquadsToPost.length);
      for (let i = 0; i < postedSquads.length; i++) {
        expect(postedSquads[i].id).toEqual(mockSquadsToPost[i].id);
        expect(postedSquads[i].event_id).toEqual(mockSquadsToPost[i].event_id);
        expect(postedSquads[i].squad_name).toEqual(mockSquadsToPost[i].squad_name);
        expect(postedSquads[i].games).toEqual(mockSquadsToPost[i].games);
        expect(postedSquads[i].lane_count).toEqual(mockSquadsToPost[i].lane_count);
        expect(postedSquads[i].starting_lane).toEqual(mockSquadsToPost[i].starting_lane);
        expect(compareAsc(postedSquads[i].squad_date, mockSquadsToPost[i].squad_date)).toBe(0);
        expect(postedSquads[i].squad_time).toEqual(mockSquadsToPost[i].squad_time);
        expect(postedSquads[i].sort_order).toEqual(mockSquadsToPost[i].sort_order);
      }
    })
    it('should create many squads with sanitized data', async () => {
      const toSanitzie = [
        {
          ...mockSquadsToPost[0],
          squad_name: '   ' + mockSquadsToPost[0].squad_name + '  **** ',
        },
        {
          ...mockSquadsToPost[1],
          squad_name: '<script>' + mockSquadsToPost[1].squad_name + '</script>',
        }
      ]
      const squadsJSON = JSON.stringify(toSanitzie);
      const response = await axios({
        method: "post",
        data: squadsJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedSquads = response.data.squads;      
      expect(response.status).toBe(201);
      createdSquads = true
      expect(postedSquads.length).toEqual(toSanitzie.length);
      expect(postedSquads[0].squad_name).toEqual(mockSquadsToPost[0].squad_name);
      expect(postedSquads[1].squad_name).toEqual(mockSquadsToPost[1].squad_name);
    })
    it('should not post squads with invalid data in first squad', async () => {
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],
          squad_name: '',
        },
        {
          ...mockSquadsToPost[1],
          squad_name: 'Valid Squad',
        }
      ]
      const squadsJSON = JSON.stringify(invalidSquads);
      try {
        const response = await axios({
          method: "post",
          data: squadsJSON,
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
    it('should not post squads with invalid data in other squad', async () => {
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],
          squad_name: 'Valid Name',
        },
        {
          ...mockSquadsToPost[1],
          games: 0,
        }
      ]
      const squadsJSON = JSON.stringify(invalidSquads);
      try {
        const response = await axios({
          method: "post",
          data: squadsJSON,
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

  describe('PUT by ID - API: /api/squads/squad/[id]', () => { 

    const putSquad = {
      ...testSquad,      
      event_id: "evt_06055deb80674bd592a357a4716d8ef2",
      squad_name: "Test Squad",
      squad_date: startOfDayFromString('2022-07-07') as Date,
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
      squad_date: startOfDayFromString('2022-06-06') as Date,
      squad_time: '09:00 AM',
      games: 8,
      lane_count: 16,
      starting_lane: 5,
      sort_order: 8,
    }

    beforeAll(async () => {
      await resetSquad();
    })

    afterEach(async () => {
      await resetSquad();
    })

    it('should update a squad by ID', async () => {
      const squadJSON = JSON.stringify(putSquad);
      const putResponse = await axios({
        method: "put",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + testSquad.id,
      })
      expect(putResponse.status).toBe(200);
      const squad = putResponse.data.squad;
      // did not update tmnt_id
      expect(squad.event_id).toBe(testSquad.event_id);
      // all other fields updated
      expect(squad.squad_name).toBe(putSquad.squad_name);
      expect(compareAsc(squad.squad_date, putSquad.squad_date)).toBe(0);      
      expect(squad.squad_time).toBe(putSquad.squad_time);
      expect(squad.games).toBe(putSquad.games);
      expect(squad.lane_count).toBe(putSquad.lane_count);
      expect(squad.starting_lane).toBe(putSquad.starting_lane);
      expect(squad.sort_order).toBe(putSquad.sort_order);
    })
    it('should update a squad by ID when just squad_time is empty', async () => { 
      const noTimeSquad = {
        ...putSquad,
        squad_time: '',
      }
      const squadJSON = JSON.stringify(noTimeSquad);
      const putResponse = await axios({
        method: "put",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + testSquad.id,
      })
      expect(putResponse.status).toBe(200);
      const squad = putResponse.data.squad;
      expect(squad.squad_time).toBe(noTimeSquad.squad_time);
    })
    it('should NOT update a squad by ID when ID is invalid', async () => {
      try {
        const squadJSON = JSON.stringify(putSquad);
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + 'test',
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
    it('should NOT update a squad by ID when ID is valid, but not a squad ID', async () => { 
      try {
        const squadJSON = JSON.stringify(putSquad);
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + nonSquadId,
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
    it('should NOT update a squad by ID when ID is not found.', async () => { 
      try {
        const squadJSON = JSON.stringify(putSquad);
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + notFoundId,
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
    it('should NOT update a squad by ID when squad_name is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_name: '',
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when squad_date is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_date: null as any,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when games is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        games: null as any,
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when starting_lane is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        starting_lane: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when lane_count is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        lane_count: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when sort_order is missing', async () => { 
      const invalidSquad = {
        ...putSquad,
        sort_order: null as any,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when squad_name is too long', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_name: 'a'.repeat(51),        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when squad_date to too far in the past', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_date: new Date(Date.UTC(1800, 10, 1)),        
      } 
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when squad_date to too far in the future', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_date: new Date(Date.UTC(2300, 10, 1)),        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when squad_time is invalid', async () => { 
      const invalidSquad = {
        ...putSquad,
        squad_time: '24:01',        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when games is too small', async () => { 
      const invalidSquad = {
        ...putSquad,
        games: 0,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when games is too large', async () => { 
      const invalidSquad = {
        ...putSquad,
        games: 101,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when lane_count is too small', async () => { 
      const invalidSquad = {
        ...putSquad,
        lane_count: 0,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when lane_count is too large', async () => { 
      const invalidSquad = {
        ...putSquad,
        lane_count: 202,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when lane_count is odd', async () => { 
      const invalidSquad = {
        ...putSquad,
        lane_count: 5,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when lane_count is not an integer', async () => { 
      const invalidSquad = {
        ...putSquad,
        lane_count: 5.5,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when starting_lane is too small', async () => { 
      const invalidSquad = {
        ...putSquad,
        starting_lane: 0,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when starting_lane is too large', async () => { 
      const invalidSquad = {
        ...putSquad,
        starting_lane: 201,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when starting_lane is even', async () => {
      const invalidSquad = {
        ...putSquad,
        starting_lane: 4,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when starting_lane is not an integer', async () => { 
      const invalidSquad = {
        ...putSquad,
        starting_lane: 4.4,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when sort_order is too small', async () => { 
      const invalidSquad = {
        ...putSquad,
        sort_order: 0,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when sort_order is too large', async () => { 
      const invalidSquad = {
        ...putSquad,
        sort_order: 1234567,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a squad by ID when sort_order is not an integer', async () => { 
      const invalidSquad = {
        ...putSquad,
        sort_order: 4.4,        
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const putResponse = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + testSquad.id,
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
    it('should NOT update a new squad when event_id + squad_name is not unique', async () => { 
      const invalidSquad = {
        ...initSquad,
        id: squad4Id,
        event_id: event3Id,
        squad_name: "A Squad",
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "put",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + invalidSquad.id,
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
    it('should update a squad by ID with sanitized data', async () => { 
      const toSanitizeSquad = {
        ...putSquad,
        squad_name: "    <script>" + sampleSquad.squad_name + "</script>   ",
      }
      const squadJSON = JSON.stringify(toSanitizeSquad);
      const putResponse = await axios({
        method: "put",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + testSquad.id,
      })
      expect(putResponse.status).toBe(200);
      expect(putResponse.data.squad.squad_name).toBe(sampleSquad.squad_name);
    })

  })

  describe('PATCH by ID - API: /api/squads/squad//:id', () => { 

    beforeAll(async () => {
      await resetSquad();
    })
      
    afterEach(async () => {
      await resetSquad();
    })

    it('should patch squad_name in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        squad_name: 'Patched Squad'
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.squad_name).toBe(patchSquad.squad_name);
    })
    it('should patch squad_date in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        squad_date: startOfDayFromString('2022-08-22') as Date,
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(compareAsc(patchedSquad.squad_date, patchSquad.squad_date)).toBe(0);
    })
    it('should patch squad_time in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        squad_time: '12:30'
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.squad_time).toBe(patchSquad.squad_time);
    })
    it('should patch games in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        games: 5
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.games).toBe(patchSquad.games);
    })
    it('should patch lane_count in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        lane_count: 10
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.lane_count).toBe(patchSquad.lane_count);
    })
    it('should patch starting_lane in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        starting_lane: 1
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.starting_lane).toBe(patchSquad.starting_lane);
    })
    it('should patch sort_order in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        sort_order: 10
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.sort_order).toBe(patchSquad.sort_order);
    })
    it('should NOT patch event_id in a squad by ID', async () => {
      const patchSquad = {
        ...blankSquad,
        event_id: event2Id
      }
      const squadJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: squadJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      // test vs blankSquad, not patchSquad
      expect(patchedSquad.event_id).toBe(blankSquad.event_id);
    })
    it('should NOT patch a squad when ID is invalid', async () => {
      try {
        const patchTmnt = {
          ...blankSquad,
          squad_name: 'Patched Squad',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const patchResponse = await axios({
          method: "patch",
          data: tmntJSON,
          withCredentials: true,
          url: oneSquadUrl + 'test',
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
    it('should NOT patch a squad when ID is not found', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_name: 'Patched Squad',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + notFoundId,
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
    it('should NOT patch a squad when ID is valid, but not a squad ID', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_name: 'Patched Squad',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + nonSquadId,
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
    it('should NOT patch a squad when event_id is blank', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          event_id: '',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad_name is blank', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_name: '',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad_date is null', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_date: null,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when games is null', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          games: null,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when lane_count is null', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          lane_count: null,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when starting_lane is null', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          starting_lane: null,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when sort_order is null', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          sort_order: null,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad_name is too long', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_name: 'a'.repeat(256),
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad date is in too far in the past', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_date: startOfDayFromString('1800-03-02') as Date, 
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad date is in too far in the future', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_date: startOfDayFromString('2300-03-02') as Date,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when squad_time is invalid', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          squad_time: '13:00 PM',
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when games is too low', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          games: 0,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when games is too high', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          games: 100,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when games is not an integer', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          games: 5.5,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when lane_count is too low', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          lane_count: 0,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when lane_count is too high', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          lane_count: 202,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when lane_count is odd', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          lane_count: 13,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when lane_count is not an integer', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          lane_count: 13.5,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when starting_lane is too low', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          starting_lane: 0,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when starting_lane is too high', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          starting_lane: 202,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when starting_lane is even', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          starting_lane: 12,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when starting_lane is not an integer', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          starting_lane: 12.5,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when sort_order is too low', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          sort_order: 0,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when sort_order is too high', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          sort_order: 1234567,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a squad when sort_order is not an integer', async () => {
      try {
        const patchSquad = {
          ...blankSquad,
          sort_order: 5.5,
        }
        const squadJSON = JSON.stringify(patchSquad);
        const patchResponse = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + blankSquad.id,
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
    it('should NOT patch a new squad when event_id + squad_name is not unique', async () => { 
      const invalidSquad = {
        ...blankSquad,
        id: squad4Id,
        event_id: event3Id,
        squad_name: "A Squad",
      }
      const squadJSON = JSON.stringify(invalidSquad);
      try {
        const response = await axios({
          method: "patch",
          data: squadJSON,
          withCredentials: true,
          url: oneSquadUrl + invalidSquad.id,
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
    it('should patch a squad with a sanitzed squad name', async () => { 
      const patchSquad = {
        ...blankSquad,
        squad_name: "    <script>Patched Squad</script>   ",
      }
      const tmntJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.squad_name).toBe("Patched Squad");
    })
    it('should patch a squad with a blank squad_time', async () => { 
      const patchSquad = {
        ...blankSquad,
        squad_time: "",
      }
      const tmntJSON = JSON.stringify(patchSquad);
      const patchResponse = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: oneSquadUrl + blankSquad.id,
      })
      expect(patchResponse.status).toBe(200);
      const patchedSquad = patchResponse.data.squad;
      expect(patchedSquad.squad_time).toBe("");
    })

  })

  describe('DELETE by ID - API: /api/squads/squad/:id', () => { 

    const toDelSquad = {
      ...initSquad,
      id: "sqd_3397da1adc014cf58c44e07c19914f72",
      event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      squad_name: "Squad 3",
      squad_date: startOfDayFromString('2023-09-16') as Date, 
      squad_time: '02:00 PM',
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
        const response = await axios({
          method: 'post',
          data: squadJSON,
          withCredentials: true,
          url: url
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a squad', async () => { 
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: oneSquadUrl + toDelSquad.id
      })
      expect(response.status).toBe(200);
      didDel = true;
      expect(response.data.deleted.id).toBe(toDelSquad.id)
    })
    it('should return 404 when ID is invalid', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneSquadUrl + "invalid"
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
    it('should NOT delete a squad by ID when ID is not found', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneSquadUrl + notFoundId
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
    it('should NOT delete a squad by ID when ID is valid, but not a squad ID', async () => { 
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneSquadUrl + nonSquadId
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
    it('should NOT delete a squad by ID when squad has child rows', async () => { 
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneSquadUrl + testSquad.id
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

  describe('DELETE all squads for an event - API: /api/squads/event/:eventId', () => { 

    // user id of event to delete in prisma/seeds.ts
    const toDelSquads = [
      {
        ...initSquad,
        id: "sqd_aabe0f9d527e4081972ce8877190489d",
        event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
        squad_name: "X Squad",
        squad_date: startOfDayFromString('2022-08-21') as Date, 
        squad_time: '10:00 AM',
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_bb6c768572574019a6fa79b3b1c8fa57",
        event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
        squad_name: "Y Squad",
        squad_date: startOfDayFromString('2022-08-21') as Date, 
        squad_time: '02:00 PM',
        games: 6,
        lane_count: 24, 
        starting_lane: 1,
        sort_order: 2,
      }
    ]

    let didDel = false

    beforeAll(async () => {
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
    })

    afterAll(async () => {
      for (let i = 0; i < toDelSquads.length; i++) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneSquadUrl + toDelSquads[i].id
          });        
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }            
      }
    })

    it('should delete all squads for an event', async () => { 
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: eventUrl + toDelSquads[0].event_id
      })
      expect(response.status).toBe(200);      
      didDel = true;
      const count = response.data.deleted.count
      expect(count).toBe(toDelSquads.length); 
    })
    it('should return 404 when event ID is invalid', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: eventUrl + "test"
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
    it('should delete 0 squads for an event when event id is not found', async () => { 
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: eventUrl + notfoundEventId
      })
      expect(response.status).toBe(200);      
      didDel = true;
      const count = response.data.deleted.count
      expect(count).toBe(0); 
    })  
    it('should return 404 when event ID is valid, but not an event ID', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: eventUrl + nonSquadId
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

  describe('DELETE all squads for a tmnt - API: /api/squads/tmnt/:tmntId', () => { 
    
    const toDelEvents = [
      {
        ...initEvent,
        id: "evt_ad63777a6aee43be8372e4d008c1d6d0",
        tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
        event_name: "Event X",
        team_size: 1,
        games: 6,
        entry_fee: '80',
        lineage: '18',
        prize_fund: '55',
        other: '2',
        expenses: '5',
        added_money: '0',
        lpox: '80',
        sort_order: 1,
      },
      {
        ...initEvent,
        id: "evt_cd63777a6aee43be8372e4d008c1d6d0",
        tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
        event_name: "Event Y",
        team_size: 1,
        games: 6,
        entry_fee: '80',
        lineage: '18',
        prize_fund: '55',
        other: '2',
        expenses: '5',
        added_money: '0',
        lpox: '80',
        sort_order: 2,
      }
    ]
    const toDelSquads = [
      {
        ...initSquad,
        id: "sqd_5397da1adc014cf58c44e07c19914f72",
        event_id: "evt_ad63777a6aee43be8372e4d008c1d6d0",
        squad_name: "Squad X",
        squad_date: startOfDayFromString('2023-09-16') as Date, 
        squad_time: '10:00 AM',
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_6397da1adc014cf58c44e07c19914f72",
        event_id: "evt_ad63777a6aee43be8372e4d008c1d6d0",
        squad_name: "Squad Y",
        squad_date: startOfDayFromString('2023-09-16') as Date, 
        squad_time: '02:00 PM',
        games: 6,
        lane_count: 20,
        starting_lane: 11,
        sort_order: 2,
      },
      {
        ...initSquad,
        id: "sqd_7397da1adc014cf58c44e07c19914f72",
        event_id: "evt_cd63777a6aee43be8372e4d008c1d6d0",
        squad_name: "Squad Z",
        squad_date: startOfDayFromString('2023-09-16') as Date, 
        squad_time: '06:00 PM',
        games: 6,
        lane_count: 16,
        starting_lane: 3,
        sort_order: 3,
      }
    ]  

    const rePostEvent = async (event: eventType) => {
      try {
        // if event already in database, then don't re-post
        const getResponse = await axios.get(oneEventUrl + event.id);
        const found = getResponse.data.event;
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
        const eventJSON = JSON.stringify(event);
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: urlForEvents,
          data: eventJSON
        });    
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

    const delOneEvent = async (id: string) => {
      try { 
        const getResponse = await axios.get(oneEventUrl + id);  
        const found = getResponse.data.event;
        if (!found) return;
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: oneEventUrl + id
        })      
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);        
      }
    }

    let didDel = false

    beforeAll(async () => {
      await rePostEvent(toDelEvents[0]);
      await rePostEvent(toDelEvents[1]);
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
      await rePostSquad(toDelSquads[2]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostEvent(toDelEvents[0]);
      await rePostEvent(toDelEvents[1]);
      await rePostSquad(toDelSquads[0]);
      await rePostSquad(toDelSquads[1]);
      await rePostSquad(toDelSquads[2]);
    })

    afterAll(async () => { 
      await delOneSquad(toDelSquads[0].id);
      await delOneSquad(toDelSquads[1].id);
      await delOneSquad(toDelSquads[2].id);
      await delOneEvent(toDelEvents[0].id);
      await delOneEvent(toDelEvents[1].id);
    })

    it('should delete all squads for an event', async () => { 
      const response = await axios({
        method: 'delete',
        withCredentials: true,
        url: tmntUrl + toDelEvents[0].tmnt_id
      })
      expect(response.status).toBe(200);      
      didDel = true;
      const count = response.data.deleted.count
      expect(count).toBe(toDelSquads.length); 
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
    it('should return code 404 when tmnt id is not found', async () => {       
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: tmntUrl + notfoundEventId
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
    it('should return 404 when tmnt ID is valid, but not an tmnt ID', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: tmntUrl + nonSquadId
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