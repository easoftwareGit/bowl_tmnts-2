import axios, { AxiosError } from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { Event } from "@prisma/client";
import { btDbUuid } from "@/lib/uuid";
import { mockEventsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { deleteAllTmntEvents } from "@/lib/db/events/eventsAxios";

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

const url = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi; 
const oneEventUrl = url + "/event/";
const tmntUrl = url + "/tmnt/"; 
const manyUrl = url + "/many";

describe('Events - GETs and POST API: /api/events', () => { 

  const testEvent: eventType = {
    ...initEvent,
    id: "evt_cb97b73cb538418ab993fc867f860510",
    tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
    event_name: "Singles",
    team_size: 1,
    games: 6,
    added_money: '0',
    entry_fee: '80',
    lineage: '18',
    prize_fund: '55',
    other: '2',
    expenses: '5',
    lpox: '80',
    sort_order: 1,
  };

  const notFoundId = "evt_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const nonEventId = "usr_01234567890123456789012345678901";
  
  const tmnt1Id = 'tmt_fd99387c33d9c78aba290286576ddce5';

  const deletePostedEvent = async () => {
    const response = await axios.get(url);
    const events = response.data.events;
    const toDel = events.find((e: eventType) => e.event_name === 'Test Event');
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + toDel.id
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedEvent();
    })

    it('should get all events', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 8 rows in prisma/seed.ts
      expect(response.data.events).toHaveLength(8);
      const events: eventType[] = response.data.events;
      events.forEach((event: eventType) => {
        expect(event.lpox).not.toBeNull();
        expect(event.lpox).not.toBe('');
      })
    })

  })

  describe('GET by ID - API: API: /api/events/event/:id', () => { 

    it('should get an event by ID', async () => { 
      const response = await axios.get(oneEventUrl + testEvent.id);
      const event = response.data.event;
      expect(event.id).toEqual(testEvent.id);
      expect(event.tmnt_id).toEqual(testEvent.tmnt_id);
      expect(event.event_name).toEqual(testEvent.event_name);
      expect(event.team_size).toEqual(testEvent.team_size);
      expect(event.games).toEqual(testEvent.games);
      expect(event.entry_fee).toEqual(testEvent.entry_fee);
      expect(event.lineage).toEqual(testEvent.lineage);
      expect(event.prize_fund).toEqual(testEvent.prize_fund);
      expect(event.other).toEqual(testEvent.other);
      expect(event.expenses).toEqual(testEvent.expenses);
      expect(event.added_money).toEqual(testEvent.added_money);
      expect(event.lpox).toEqual(testEvent.lpox);
      expect(event.sort_order).toEqual(testEvent.sort_order);
    })
    it('should NOT get an event by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneEventUrl + '/invalid');
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get an event by ID when ID is valid, but not an event ID', async () => {
      try {
        const response = await axios.get(oneEventUrl + nonEventId);
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get an event by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneEventUrl + notFoundId);
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

  describe('GET all events for a tmnt API: /api/events/tmnt/:tmntId', () => {
        
    beforeAll(async () => {
      await deletePostedEvent();
    })

    it('should get all events for a tournament', async () => { 
      // const values taken from prisma/seed.ts
      const miltiEventTmntId = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
      const tmntEvent1Id = 'evt_9a58f0a486cb4e6c92ca3348702b1a62';
      const tmntEvent2Id = 'evt_cb55703a8a084acb86306e2944320e8d';
      const tmntEvent3Id = 'evt_adfcff4846474a25ad2936aca121bd37';
      
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + miltiEventTmntId, 
      })
      expect(response.status).toBe(200);
      // 3 event rows for tmnt in prisma/seed.ts
      expect(response.data.events).toHaveLength(3);
      const events: eventType[] = response.data.events;
      // query in /api/events/tmnt GET sorts by sort_order
      expect(events[0].id).toBe(tmntEvent1Id);
      expect(events[1].id).toBe(tmntEvent2Id);
      expect(events[2].id).toBe(tmntEvent3Id);
      expect(events[0].tmnt_id).toBe(miltiEventTmntId);
      expect(events[1].tmnt_id).toBe(miltiEventTmntId);
      expect(events[2].tmnt_id).toBe(miltiEventTmntId);
      expect(events[0].lpox).not.toBeNull();
      expect(events[1].lpox).not.toBeNull();
      expect(events[2].lpox).not.toBeNull();
      expect(events[0].lpox).not.toBe('');
      expect(events[1].lpox).not.toBe('');
      expect(events[2].lpox).not.toBe('');
    })
    it('should return status 404 when tmntId is invalid', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + "invalid",
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
    it('should return starus 404 when tmntId is valid, but not a tmnt id', async () => { 
      try {
        const response = await axios({
          method: "get",
          withCredentials: true,
          url: tmntUrl + nonEventId,
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
    it('should return status 200 when tmnt id is not found', async () => { 
      const response = await axios({
        method: "get",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId, 
      })
      expect(response.status).toBe(200);      
      expect(response.data.events).toHaveLength(0);
    })

  })

  describe('POST', () => { 

    const eventToPost: eventType = {
      ...initEvent,      
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      event_name: "Test Event",
      team_size: 1,
      games: 6,
      added_money: '0',
      entry_fee: '80',
      lineage: '18',
      prize_fund: '55',
      other: '2',
      expenses: '5',
      lpox: '80',
      sort_order: 2,
    };

    let createdEvent = false;    

    beforeAll(async () => { 
      await deletePostedEvent();
    })

    beforeEach(() => {
      createdEvent = false;
    })

    afterEach(async () => {
      if (createdEvent) {
        await deletePostedEvent();
      }      
    })

    it('should create a new event', async () => { 
      const eventJSON = JSON.stringify(eventToPost);
      const response = await axios({
        method: "post",
        data: eventJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      const postedEvent = response.data.event;
      createdEvent = true;
      expect(postedEvent.id).toEqual(eventToPost.id);
      expect(postedEvent.tmnt_id).toEqual(eventToPost.tmnt_id);
      expect(postedEvent.event_name).toEqual(eventToPost.event_name);
      expect(postedEvent.team_size).toEqual(eventToPost.team_size);
      expect(postedEvent.games).toEqual(eventToPost.games);
      expect(postedEvent.entry_fee).toEqual(eventToPost.entry_fee);
      expect(postedEvent.lineage).toEqual(eventToPost.lineage);
      expect(postedEvent.prize_fund).toEqual(eventToPost.prize_fund);
      expect(postedEvent.other).toEqual(eventToPost.other);
      expect(postedEvent.expenses).toEqual(eventToPost.expenses);
      expect(postedEvent.added_money).toEqual(eventToPost.added_money);
      expect(postedEvent.sort_order).toEqual(eventToPost.sort_order);            
    })
    it('should create a new event when added money is blank', async () => { 
      const validEvent = {
        ...eventToPost,
        added_money: '',
      }
      const eventJSON = JSON.stringify(validEvent);
      const response = await axios({
        method: "post",
        data: eventJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      const postedEvent = response.data.event;
      createdEvent = true;
      expect(postedEvent.added_money).toEqual('0');
    })
    it('should create a new event when all money fields are blank', async () => { 
      const validEvent = {
        ...eventToPost,
        added_money: '',
        entry_fee: '',
        lineage: '',
        other: '',
        prize_fund: '',
        expenses: '',
        lpox: '',
      }
      const eventJSON = JSON.stringify(validEvent);
      const response = await axios({
        method: "post",
        data: eventJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      const postedEvent = response.data.event;
      createdEvent = true;
      expect(postedEvent.entry_fee).toEqual('0');
      expect(postedEvent.lineage).toEqual('0');
      expect(postedEvent.prize_fund).toEqual('0');
      expect(postedEvent.other).toEqual('0');
      expect(postedEvent.expenses).toEqual('0');
      expect(postedEvent.added_money).toEqual('0');
    })
    it('should NOT create a new event when ID is blank', async () => { 
      const invalidEvent = {
        ...eventToPost,
        id: "",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when tmnt id is blank', async () => { 
      const invalidEvent = {
        ...eventToPost,
        tmnt_id: "",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when event name is blank', async () => { 
      const invalidEvent = {
        ...eventToPost,
        event_name: "",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when team size is null', async () => { 
      const invalidEvent = {
        ...eventToPost,
        team_size: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when games is null', async () => { 
      const invalidEvent = {
        ...eventToPost,
        games: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry fee is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        entry_fee: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lineage is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        lineage: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when prize fund is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        prize_fund: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when other is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        other: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when expenses is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        expenses: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lpox is blank (entry_fee !== lpox)', async () => { 
      const invalidEvent = {
        ...eventToPost,
        lpox: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when sort order is null', async () => { 
      const invalidEvent = {
        ...eventToPost,
        sort_order: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when ID is invalid', async () => { 
      const invalidEvent = {
        ...eventToPost,
        id: "test",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when ID is valid, but not an event ID', async () => {
      const invalidEvent = {
        ...eventToPost,
        id: nonEventId,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when tmnt id is invalid', async () => { 
      const invalidEvent = {
        ...eventToPost,
        tmnt_id: "test",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when tmnt_id is valid, but not a tmnt id', async () => { 
      const invalidEvent = {
        ...eventToPost,
        tmnt_id: nonEventId,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when tmnt_id is valid and a tmnt id, but is not found', async () => {
      const invalidEvent = {
        ...eventToPost,
        tmnt_id: notFoundTmntId,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when event name is too long', async () => { 
      const invalidEvent = {
        ...eventToPost,
        event_name: "a".repeat(256),
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when team size is too small', async () => {
      const invalidEvent = {
        ...eventToPost,
        team_size: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when team size is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        team_size: 1000,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when team size is not an integer', async () => {
      const invalidEvent = {
        ...eventToPost,
        team_size: 1.5,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when team size is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        team_size: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when games is too small', async () => {
      const invalidEvent = {
        ...eventToPost,
        games: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when games is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        games: 1000,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when games is not an integer', async () => {
      const invalidEvent = {
        ...eventToPost,
        games: 1.5,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when games is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        games: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when added money is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        added_money: 500 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when added money is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        added_money: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when added money is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        added_money: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when added money is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        added_money: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry fee is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        entry_fee: 100 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry fee is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        entry_fee: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry fee is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        entry_fee: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry fee is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        entry_fee: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lineage is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        lineage: 20 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lineage is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        lineage: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lineage is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        lineage: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lineage is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        lineage: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when prize_fund is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        prize_fund: 75 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when prize_fund is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        prize_fund: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when prize_fund is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        prize_fund: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when prize_fund is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        prize_fund: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when other is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        other: 2 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when other is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        other: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when other is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        other: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when other is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        other: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when expenses is a number not a string', async () => {
      const invalidEvent = {
        ...eventToPost,
        expenses: 10 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when expenses is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        expenses: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when expenses is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        expenses: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when expenses is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        expenses: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lpox is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        lpox: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lpox is negative', async () => {
      const invalidEvent = {
        ...eventToPost,
        lpox: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when lpox is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        lpox: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when sort_order is not a number', async () => {
      const invalidEvent = {
        ...eventToPost,
        sort_order: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when sort_order is too small', async () => {
      const invalidEvent = {
        ...eventToPost,
        sort_order: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when sort_order is too large', async () => {
      const invalidEvent = {
        ...eventToPost,
        sort_order: 1234567,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry_fee !== lineage + prize_fund + other + expenses', async () => {
      const invalidEvent = {
        ...eventToPost,
        entry_fee: '100',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when entry_fee !== lpox', async () => {
      const invalidEvent = {
        ...eventToPost,
        lpox: '100',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new event when tmnt_id + event_name are not unique', async () => { 
      // row with tmntId, eventToPost.event_Name already exists
      const dubName = 'Singles';      
      const invalidEvent = {
        ...eventToPost,
        tmnt_id: tmnt1Id,   
        event_name: dubName,
        sort_order: 2,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should create a new event with sanitized event name', async () => {
      const validEvent = {
        ...eventToPost,
        id: btDbUuid('evt'),
        event_name: '<script>' + eventToPost.event_name + '</script>',
      }
      const eventJSON = JSON.stringify(validEvent);
      const response = await axios({
        method: "post",
        data: eventJSON,
        withCredentials: true,
        url: url,
      })
      const postedEvent = response.data.event;      
      expect(response.status).toBe(201);
      createdEvent = true
      expect(postedEvent.id).toEqual(validEvent.id); // use validEvent.id
      expect(postedEvent.tmnt_id).toEqual(eventToPost.tmnt_id);
      expect(postedEvent.event_name).toEqual(eventToPost.event_name);
      expect(postedEvent.team_size).toEqual(eventToPost.team_size);
      expect(postedEvent.games).toEqual(eventToPost.games);
      expect(postedEvent.entry_fee).toEqual(eventToPost.entry_fee);
      expect(postedEvent.lineage).toEqual(eventToPost.lineage);
      expect(postedEvent.prize_fund).toEqual(eventToPost.prize_fund);
      expect(postedEvent.other).toEqual(eventToPost.other);
      expect(postedEvent.expenses).toEqual(eventToPost.expenses);
      expect(postedEvent.added_money).toEqual(eventToPost.added_money);
      expect(postedEvent.sort_order).toEqual(eventToPost.sort_order);      
    })  
    
  })

  describe('POST many events for one tmnt API: /api/events/many', () => { 

    let createdEvents = false;    

    beforeAll(async () => { 
      await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
    })

    beforeEach(() => {
      createdEvents = false;
    })

    afterEach(async () => {
      if (createdEvents) {
        await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
      }      
    })

    it('should create many events', async () => { 
      const eventsJSON = JSON.stringify(mockEventsToPost);
      const response = await axios({
        method: "post",
        data: eventsJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedEvents = response.data.events;      
      expect(response.status).toBe(201);
      createdEvents = true
      expect(postedEvents.length).toEqual(mockEventsToPost.length);
      for (let i = 0; i < postedEvents.length; i++) {
        expect(postedEvents[i].id).toEqual(mockEventsToPost[i].id);
        expect(postedEvents[i].tmnt_id).toEqual(mockEventsToPost[i].tmnt_id);
        expect(postedEvents[i].event_name).toEqual(mockEventsToPost[i].event_name);
        expect(postedEvents[i].team_size).toEqual(mockEventsToPost[i].team_size);
        expect(postedEvents[i].games).toEqual(mockEventsToPost[i].games);
        expect(postedEvents[i].entry_fee).toEqual(mockEventsToPost[i].entry_fee);
        expect(postedEvents[i].lineage).toEqual(mockEventsToPost[i].lineage);
        expect(postedEvents[i].prize_fund).toEqual(mockEventsToPost[i].prize_fund);
        expect(postedEvents[i].other).toEqual(mockEventsToPost[i].other);
        expect(postedEvents[i].expenses).toEqual(mockEventsToPost[i].expenses);
        expect(postedEvents[i].added_money).toEqual(mockEventsToPost[i].added_money);
        expect(postedEvents[i].lpox).toEqual(mockEventsToPost[i].lpox);
        expect(postedEvents[i].sort_order).toEqual(mockEventsToPost[i].sort_order);        
      } 
    })
    it('should create many events with sanitized data', async () => {
      const toSanitzie = [
        {
          ...mockEventsToPost[0],
          event_name: '   ' + mockEventsToPost[0].event_name + '  **** ',
        },
        {
          ...mockEventsToPost[1],
          event_name: '<script>' + mockEventsToPost[1].event_name + '</script>',
        }
      ]
      const eventsJSON = JSON.stringify(toSanitzie);
      const response = await axios({
        method: "post",
        data: eventsJSON,
        withCredentials: true,
        url: manyUrl,
      })
      const postedEvents = response.data.events;      
      expect(response.status).toBe(201);
      createdEvents = true
      expect(postedEvents.length).toEqual(toSanitzie.length);
      expect(postedEvents[0].event_name).toEqual(mockEventsToPost[0].event_name);
      expect(postedEvents[1].event_name).toEqual(mockEventsToPost[1].event_name);
    })
    it('should not post events with invalid data in first event', async () => {
      const invalidEvents = [
        {
          ...mockEventsToPost[0],
          event_name: '',
        },
        {
          ...mockEventsToPost[1],
          event_name: 'Valid Event',
        }
      ]
      const eventsJSON = JSON.stringify(invalidEvents);
      try {
        const response = await axios({
          method: "post",
          data: eventsJSON,
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
    it('should not post events with invalid data in other event', async () => {
      const invalidEvents = [
        {
          ...mockEventsToPost[0],
          event_name: 'Valid Name',
        },
        {
          ...mockEventsToPost[1],
          games: 0,
        }
      ]
      const eventsJSON = JSON.stringify(invalidEvents);
      try {
        const response = await axios({
          method: "post",
          data: eventsJSON,
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

})