import axios, { AxiosError } from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { mockEventsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { postManyEvents } from "@/lib/db/events/eventsAxios";

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
const eventTmntUrl = url + '/tmnt/';
  
describe('Events - PUT, PATCH, DELETE API: /api/events/event/:id', () => { 

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

  const blankEvent = {    
    id: "evt_cb97b73cb538418ab993fc867f860510",
    tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  };

  const notFoundId = "evt_01234567890123456789012345678901";
  const notfoundParentId = "tmt_01234567890123456789012345678901";
  const nonEventId = "usr_01234567890123456789012345678901";

  const event2Id = 'evt_dadfd0e9c11a4aacb87084f1609a0afd';
  const event5Id = 'evt_cb55703a8a084acb86306e2944320e8d'; // doubles
  const tmnt1Id = 'tmt_fd99387c33d9c78aba290286576ddce5';
  const tmnt8Id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1'; //tmnt with singles & doubles

  describe('PUT by ID - API: /api/events/event/:id', () => { 

    const resetUser = async () => {
      // make sure test user is reset in database
      const userJSON = JSON.stringify(testEvent);
      const putResponse = await axios({
        method: "put",
        data: userJSON,
        withCredentials: true,
        url: oneEventUrl + testEvent.id,
      })
    }

    const putEvent = { 
      ...testEvent,
      tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      event_name: "Team",
      team_size: 5,
      games: 3,
      added_money: '0',
      entry_fee: '250',
      lineage: '45',
      prize_fund: '190',
      other: '5',
      expenses: '10',
      lpox: '250',
      sort_order: 4,
    }

    const sampleEvent = {
      ...initEvent,       
      tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      event_name: "All Events",
      team_size: 1,
      games: 1,
      added_money: '0',
      entry_fee: '25',
      lineage: '0',
      prize_fund: '24',
      other: '0',
      expenses: '1',
      lpox: '25',
      sort_order: 5,
    }

    beforeAll(async () => {
      await resetUser()
    })

    afterEach(async () => {
      await resetUser()
    })

    it('should update an event by ID', async () => { 
      const eventJSON = JSON.stringify(putEvent);
      const putResponse = await axios({
        method: "put",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + testEvent.id,
      })
      const puttedEvent = putResponse.data.event;
      // did not update tmnt_id
      expect(puttedEvent.tmnt_id).toEqual(testEvent.tmnt_id);
      // all other fields updated
      expect(puttedEvent.event_name).toEqual(putEvent.event_name);
      expect(puttedEvent.team_size).toEqual(putEvent.team_size);
      expect(puttedEvent.games).toEqual(putEvent.games);
      expect(puttedEvent.entry_fee).toEqual(putEvent.entry_fee);
      expect(puttedEvent.lineage).toEqual(putEvent.lineage);
      expect(puttedEvent.prize_fund).toEqual(putEvent.prize_fund);
      expect(puttedEvent.other).toEqual(putEvent.other);
      expect(puttedEvent.expenses).toEqual(putEvent.expenses);
      expect(puttedEvent.added_money).toEqual(putEvent.added_money);
      expect(puttedEvent.sort_order).toEqual(putEvent.sort_order);
    })
    it('should update an event when by ID with blank added money', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);      
      const putResponse = await axios({
        method: "put",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + testEvent.id,
      });
      expect(putResponse.status).toBe(200);
      const puttedEvent = putResponse.data.event;
      expect(puttedEvent.added_money).toEqual('0');
    })
    it('should update an event when by ID with all money flieds blank', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: '',
        entry_fee: '',
        lineage: '',
        prize_fund: '',
        other: '',
        expenses: '',
        lpox: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);      
      const putResponse = await axios({
        method: "put",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + testEvent.id,
      });
      expect(putResponse.status).toBe(200);
      const puttedEvent = putResponse.data.event;
      expect(puttedEvent.added_money).toEqual('0');
      expect(puttedEvent.entry_fee).toEqual('0');
      expect(puttedEvent.lineage).toEqual('0');
      expect(puttedEvent.prize_fund).toEqual('0');
      expect(puttedEvent.other).toEqual('0');
      expect(puttedEvent.expenses).toEqual('0');
      expect(puttedEvent.lpox).toEqual('0');
    })
    it('should NOT update an event by ID when ID is invalid', async () => {
      const eventJSON = JSON.stringify(putEvent);
      try {
        const putResponse = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + 'test',
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
    it('should NOT update an event by ID when ID is valid, but not an event ID', async () => {
      const eventJSON = JSON.stringify(putEvent);
      try {
        const putResponse = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + nonEventId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(404);
          } else {
            expect(true).toBeFalsy();
          }
        }
      }
    })
    it('should NOT update an event by ID when ID is not found', async () => {
      const eventJSON = JSON.stringify(putEvent);
      try {
        const putResponse = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + notFoundId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err instanceof AxiosError) {
            expect(err.response?.status).toBe(404);
          } else {
            expect(true).toBeFalsy();
          }
        }
      }
    })
    it('should NOT update an event by ID when missing tmnt id', async () => {
      // need to pass a vlaid tmnt id for data validation
      // even though it is not used
      const invalidEvent = {
        ...putEvent,
        tmnt_id: "",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when missing event name', async () => {
      const invalidEvent = {
        ...putEvent,
        event_name: "",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when missing team size', async () => {
      const invalidEvent = {
        ...putEvent,
        team_size: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when missing games', async () => {
      const invalidEvent = {
        ...putEvent,
        games: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing entry fee', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing lineage', async () => {
      const invalidEvent = {
        ...putEvent,
        lineage: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing prize fund', async () => {
      const invalidEvent = {
        ...putEvent,
        prize_fund: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing other', async () => {
      const invalidEvent = {
        ...putEvent,
        other: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing expenses', async () => {
      const invalidEvent = {
        ...putEvent,
        expenses: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing lpox', async () => {
      const invalidEvent = {
        ...putEvent,
        lpox: '',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when by ID missing sort order', async () => {
      const invalidEvent = {
        ...putEvent,
        sort_order: null as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when tmnt id is invalid', async () => {
      // need to pass a vlaid tmnt id for data validation
      // even though it is not used
      const invalidEvent = {
        ...putEvent,
        tmnt_id: "invalid",
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when tmnt_id is valid, but not a tmnt id', async () => {
      // need to pass a vlaid tmnt id for data validation
      // even though it is not used
      const invalidEvent = {
        ...putEvent,
        tmnt_id: nonEventId,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when event name is too long', async () => {
      const invalidEvent = {
        ...putEvent,
        event_name: "a".repeat(256),
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when team size is too small', async () => {
      const invalidEvent = {
        ...putEvent,
        team_size: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when team size is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        team_size: 1000,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when team size is not an integer', async () => {
      const invalidEvent = {
        ...putEvent,
        team_size: 1.5,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when team size is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        team_size: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when games is too small', async () => {
      const invalidEvent = {
        ...putEvent,
        games: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when games is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        games: 1000,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when games is not an integer', async () => {
      const invalidEvent = {
        ...putEvent,
        games: 1.5,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when games is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        games: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when added money is number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: 100 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when added money is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when added money is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when added money is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        added_money: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry fee is a number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: 100 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry fee is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry fee is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry fee is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lineage is a number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        lineage: 20 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lineage is a not number', async () => {
      const invalidEvent = {
        ...putEvent,
        lineage: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lineage is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        lineage: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lineage is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        lineage: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when prize_fund is a number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        prize_fund: 75 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when prize_fund is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        prize_fund: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when prize_fund is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        prize_fund: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when prize_fund is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        prize_fund: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when other is a number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        other: 20 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when other is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        other: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when other is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        other: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when other is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        other: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when expenses is not number not a string', async () => {
      const invalidEvent = {
        ...putEvent,
        expenses: 10 as any,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event when expenses is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        expenses: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when expenses is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        expenses: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when expenses is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        expenses: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lpox is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        lpox: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lpox is negative', async () => {
      const invalidEvent = {
        ...putEvent,
        lpox: '-1',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when lpox is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        lpox: '1234567',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when sort_order is not a number', async () => {
      const invalidEvent = {
        ...putEvent,
        sort_order: 'abc',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when sort_order is too small', async () => {
      const invalidEvent = {
        ...putEvent,
        sort_order: 0,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when sort_order is too large', async () => {
      const invalidEvent = {
        ...putEvent,
        sort_order: 1234567,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry_fee !== lineage + prize_fund + other + expenses', async () => {
      const invalidEvent = {
        ...putEvent,
        entry_fee: '100',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when entry_fee !== lpox', async () => {
      const invalidEvent = {
        ...putEvent,
        lpox: '100',
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
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
    it('should NOT update an event by ID when tmnt_id + event_name are not unique', async () => {
      const dubName = 'Singles';      
      const invalidEvent = {
        ...putEvent,
        tmnt_id: tmnt8Id,   
        event_name: dubName,
        sort_order: 2,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + event5Id,
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
    it('should update an event by ID with sanitized data', async () => {
      const validEvent = {
        ...putEvent,
        event_name: '<script>' + sampleEvent.event_name + '</script>',        
        entry_fee: '80.001',
        lineage: '18.002',
        prize_fund: '55.002',
        other: '2.002',
        expenses: '05.003',
        added_money: '0.003',
        lpox: '80.002',
      }
      const eventJSON = JSON.stringify(validEvent);
      const response = await axios({
        method: "put",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + testEvent.id,
      })
      const puttedEvent = response.data.event;
      expect(response.status).toBe(200);
      expect(puttedEvent.event_name).toEqual(sampleEvent.event_name);
    })      

  })

  describe('PATCH by ID - API: /api/events/event/:id', () => {

    const doResetEvent = async () => {
      try {
        const eventJSON = JSON.stringify(testEvent);
        const putResponse = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + testEvent.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetEvent
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetEvent();
      }
    })

    it('should return 200 when just passing in tmnt_id, no patching done', async () => {
      // last tmnt is seeds, also used for delete test 
      const tmntNoEventsId = 'tmt_e134ac14c5234d708d26037ae812ac33';
      const patchEvent = {
        ...blankEvent,
        tmnt_id: tmntNoEventsId,
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      // for tmnt_id, check vs testEvent, not patchEvent 
      expect(patchedEvent.tmnt_id).toEqual(testEvent.tmnt_id);
    })
    it('should return 200 when just passing in blank tmnt_id, no patching done', async () => {
      // last tmnt is seeds, also used for delete test 
      const tmntNoEventsId = 'tmt_e134ac14c5234d708d26037ae812ac33';
      const patchEvent = {
        ...blankEvent,
        tmnt_id: '',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      // for tmnt_id, check vs testEvent, not patchEvent 
      expect(patchedEvent.tmnt_id).toEqual(testEvent.tmnt_id);
    })
    it('should patch event_name in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        event_name: 'Updated Event Name',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.event_name).toEqual(patchEvent.event_name);
    })
    it('should patch team_size in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        team_size: 2,
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.team_size).toEqual(patchEvent.team_size);
    })
    it('should patch games in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        games: 4,
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.games).toEqual(patchEvent.games);
    })
    it('should patch added_money in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        added_money: '10',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.added_money).toEqual(patchEvent.added_money);
    })
    it('should patch entry fee, lineage and lpox in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        entry_fee: '81',
        lineage: '19',
        lpox: '81',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.entry_fee).toEqual(patchEvent.entry_fee);
      expect(patchedEvent.lineage).toEqual(patchEvent.lineage);
      expect(patchedEvent.lpox).toEqual(patchEvent.lpox);
    })
    it('should patch entry fee, prize fund, lpox in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        entry_fee: '81',
        prize_fund: '56',
        lpox: '81',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.entry_fee).toEqual(patchEvent.entry_fee);
      expect(patchedEvent.prize_fund).toEqual(patchEvent.prize_fund);
      expect(patchedEvent.lpox).toEqual(patchEvent.lpox);
    })
    it('should patch entry fee, other, lpox in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        entry_fee: '81',
        other: '3',
        lpox: '81',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.entry_fee).toEqual(patchEvent.entry_fee);
      expect(patchedEvent.other).toEqual(patchEvent.other);
      expect(patchedEvent.lpox).toEqual(patchEvent.lpox);
    })
    it('should patch entry fee, expenses, lpox in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        entry_fee: '81',
        expenses: '6',
        lpox: '81',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.entry_fee).toEqual(patchEvent.entry_fee);
      expect(patchedEvent.expenses).toEqual(patchEvent.expenses);
      expect(patchedEvent.lpox).toEqual(patchEvent.lpox);
    })
    it('should not patch event name when event name is missing in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          event_name: "",
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch event name when event name is too long in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          event_name: "a".repeat(256),
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch team size when team size is not a nummber an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          team_size: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch team size when team size is too low in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          team_size: 0,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch team size when team size is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          team_size: 1001,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch games when games is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          games: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch games when games is too low in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          games: 0,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch games when games is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          games: 1001,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch added money when added money is a number not a string in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          added_money: 200 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch added money when added money is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          added_money: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch added money when added money is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          added_money: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch added money when added money is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          added_money: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch entry fee when entry fee is a number not a string, in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          entry_fee: 100 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch entry fee when entry fee is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          entry_fee: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch entry fee when entry fee is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          entry_fee: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch entry fee when entry fee is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          entry_fee: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch lineage when lineage is a number not a string,  in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          lineage: 20 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch lineage when lineage is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          lineage: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch lineage when lineage is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          lineage: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch lineage when lineage is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          lineage: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch prize fund when prize fund is a number not a string, in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          prize_fund: 75 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch prize fund when prize fund is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          prize_fund: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch prize fund when prize fund is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          prize_fund: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch prize fund when prize fund is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          prize_fund: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch other when other is not number not a string, in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          other: 2 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch other when other is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          other: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch other when other is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          other: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch other when other is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          other: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch expenses when expenses is a number not a string, in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          expenses: 10 as any,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch expenses when expenses is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          expenses: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch expenses when expenses is negitive in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          expenses: '-1',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch expenses when expenses is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          expenses: '1234567',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch sort_order when sort_order is not a number in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          sort_order: 'abc',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch sort_order when sort_order is too low in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          sort_order: 0,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch sort_order when sort_order is too high in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          sort_order: 1234567,
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch event when entry fee !== lpox in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          lpox: '81',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should not patch event when entry fee !== (lineage + prize fund + other + expenses) in an event by ID', async () => {
      try {
        const eventJSON = JSON.stringify({
          ...blankEvent,
          entry_fee: '81',
        })
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + blankEvent.id,
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
    it('should NOT update an event by ID when tmnt_id + event_name are not unique', async () => {
      const dubName = 'Singles';      
      const invalidEvent = {
        ...blankEvent,
        tmnt_id: tmnt8Id,   
        event_name: dubName,
        sort_order: 2,
      }
      const eventJSON = JSON.stringify(invalidEvent);
      try {
        const response = await axios({
          method: "patch",
          data: eventJSON,
          withCredentials: true,
          url: oneEventUrl + event5Id,
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
    it('should patch sanitized data in an event by ID', async () => {
      const patchEvent = {
        ...blankEvent,
        event_name: '<script>Updated Event Name</script>',        
        entry_fee: '81.001',
        expenses: '6.001',
        lpox: '81.002',
      }
      const eventJSON = JSON.stringify(patchEvent);
      const response = await axios({
        method: "patch",
        data: eventJSON,
        withCredentials: true,
        url: oneEventUrl + blankEvent.id,
      })
      const patchedEvent = response.data.event;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedEvent.event_name).toEqual('Updated Event Name');
    })

  })

  describe('DELETE by ID - API: /api/events/event/:id', () => {

    const toDelEvent = {
      ...initEvent,
      id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
      tmnt_id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
      event_name: "Singles",
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
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const eventJSON = JSON.stringify(toDelEvent);
        const response = await axios({
          method: "post",
          data: eventJSON,
          withCredentials: true,
          url: url,
        });        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete an event by ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + toDelEvent.id,
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
    it('should NOT delete an event by ID when ID is invalid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + 'test',
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
    it('should NOT delete an event by ID when ID is valid, but not an event ID', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + nonEventId,
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
    it('should NOT delete an event by ID when ID is valid, but not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + notFoundId,
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
    it('should NOT delete an event by ID when event has child rows', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: oneEventUrl + testEvent.id
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
    
  })

  describe('DELETE all events for a tmnt - API: /api/events/tmnt/:tmntId', () => { 
    
    const postEvents = async () => {      
      const response = await axios.get(eventTmntUrl + tmntToDelId);
      const tmntEvents = response.data.events;
      if (!tmntEvents || tmntEvents.length === 0) {
        const eventsToPost = [...mockEventsToPost];
        await postManyEvents(eventsToPost);
      }
    }    

    beforeEach(async () => {
      await postEvents();
    })

    afterAll(async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: eventTmntUrl + tmntToDelId,
        });        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }            
    })

    it('should delete all events for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: eventTmntUrl + tmntToDelId,
        });
        expect(response.status).toBe(200);        
      } catch (err) {
        expect(true).toBeFalsy();
      }            
    })
    it('should not delete all events for a tmnt when tmnt id is invalid', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: eventTmntUrl + 'test',
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
    it('should not delete all events for a tmnt when tmnt id is valid, but not a tmnt id', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: eventTmntUrl + nonEventId,
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
    it('should delete 0 events for a tmnt when tmnt id is valid, but no events found for tmnt', async () => { 
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: eventTmntUrl + notfoundParentId,
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0)
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })

  })

})