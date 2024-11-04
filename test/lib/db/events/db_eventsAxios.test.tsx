import axios, { AxiosError } from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { deleteAllTmntEvents, deleteEvent, getAllEventsForTmnt, postEvent, postManyEvents, putEvent } from "@/lib/db/events/eventsAxios";
import { mockEventsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";

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

const notFoundTmntId = "tmt_00000000000000000000000000000000";

describe("eventsAxios", () => {

  describe('getAllEventsForTmnt', () => { 

    // from prisma/seeds.ts
    const eventsToGet: eventType[] = [
      {
        ...initEvent,
        id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Singles",
        team_size: 1,
        games: 6,
        entry_fee: '80',
        lineage: '18',
        prize_fund: '55',
        other: '2',
        expenses: '5',
        added_money: '0',
        sort_order: 1,
      },
      {
        ...initEvent,
        id: "evt_cb55703a8a084acb86306e2944320e8d",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
        entry_fee: '160',
        lineage: '36',
        prize_fund: '110',
        other: '4',
        expenses: '10',
        added_money: '0',
        sort_order: 2,
      },
      {
        ...initEvent,
        id: "evt_adfcff4846474a25ad2936aca121bd37",
        tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: '160',
        lineage: '36',
        prize_fund: '110',
        other: '4',
        expenses: '10',
        added_money: '0',
        sort_order: 3,
      }
    ]

    it("should get events for tmnt", async () => {
      const events = await getAllEventsForTmnt(eventsToGet[0].tmnt_id);
      expect(events).toHaveLength(eventsToGet.length); 
      if (!events) return;           
      for (let i = 0; i < events.length; i++) {
        expect(events[i].id).toEqual(eventsToGet[i].id);
        expect(events[i].tmnt_id).toEqual(eventsToGet[i].tmnt_id);
        expect(events[i].event_name).toEqual(eventsToGet[i].event_name);
        expect(events[i].team_size).toEqual(eventsToGet[i].team_size);
        expect(events[i].games).toEqual(eventsToGet[i].games);
        expect(events[i].entry_fee).toEqual(eventsToGet[i].entry_fee);
        expect(events[i].lineage).toEqual(eventsToGet[i].lineage);
        expect(events[i].prize_fund).toEqual(eventsToGet[i].prize_fund);
        expect(events[i].other).toEqual(eventsToGet[i].other);
        expect(events[i].expenses).toEqual(eventsToGet[i].expenses);
        expect(events[i].added_money).toEqual(eventsToGet[i].added_money);
        expect(events[i].sort_order).toEqual(eventsToGet[i].sort_order);
      }
    })
    it("should return 0 events for not found tmnt", async () => { 
      const events = await getAllEventsForTmnt(notFoundTmntId);
      expect(events).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const events = await getAllEventsForTmnt('test');
      expect(events).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const events = await getAllEventsForTmnt(eventsToGet[0].id);
      expect(events).toBeNull();
    })
  })

  describe("postEvent", () => {
    const eventToPost = {
      ...initEvent,      
      tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
      event_name: "Test Event",
      team_size: 1,
      games: 5,
      added_money: "0",
      entry_fee: "75",
      lineage: "15",
      prize_fund: "55",
      other: "0",
      expenses: "5",
      lpox: "75",
      sort_order: 10,
    };

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

    let createdEvent = false;

    beforeAll(async () => {
      await deletePostedEvent();
    });

    beforeEach(() => {
      createdEvent = false;
    });

    afterEach(async () => {
      if (createdEvent) {
        await deletePostedEvent();
      }
    });

    it("should post an event", async () => {
      const postedEvent = await postEvent(eventToPost);
      expect(postedEvent).not.toBeNull();
      if (!postedEvent) return;
      expect(postedEvent).not.toBeNull();
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
    });
    it("should NOT post an event with invalid data", async () => {
      const invalidEvent = {
        ...eventToPost,
        event_name: "",
      };
      const postedEvent = await postEvent(invalidEvent);
      expect(postedEvent).toBeNull();
    });
  });

  describe("postManyEvents", () => { 

    let didPost = false;
    
    beforeAll(async () => {
      await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
      }
    });

    it("should post many events", async () => { 
      const postedEvents = await postManyEvents(mockEventsToPost);
      expect(postedEvents).not.toBeNull();
      if (!postedEvents) return;
      didPost = true;
      expect(postedEvents.length).toBe(mockEventsToPost.length);
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
        expect(postedEvents[i].lpox).toEqual(mockEventsToPost[i].lpox);
        expect(postedEvents[i].added_money).toEqual(mockEventsToPost[i].added_money);
        expect(postedEvents[i].sort_order).toEqual(mockEventsToPost[i].sort_order);
      }
    })
    it('should post sanitzied values', async () => {
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
      const postedEvents = await postManyEvents(toSanitzie);
      expect(postedEvents).not.toBeNull();
      if (!postedEvents) return;
      didPost = true;
      expect(postedEvents.length).toBe(toSanitzie.length);
      expect(postedEvents[0].event_name).toEqual(mockEventsToPost[0].event_name);
      expect(postedEvents[1].event_name).toEqual(mockEventsToPost[1].event_name);
    })
    it("should NOT post many events with no data", async () => {
      const postedEvents = await postManyEvents([]);
      expect(postedEvents).toBeNull();
    })
    it("should NOT post many events with invalid data", async () => {
      const invalidEvents = [
        {
          ...mockEventsToPost[0],
          event_name: "",
        },
        {
          ...mockEventsToPost[1],          
        },
      ]
      const postedEvents = await postManyEvents(invalidEvents);
      expect(postedEvents).toBeNull();            
    })    
    it("should NOT post many events when all tmnt_ids are not the same", async () => {
      const invalidEvents = [
        {
          ...mockEventsToPost[0],          
        },
        {
          ...mockEventsToPost[1],               
          tmnt_id: 'tmt_00000000000000000000000000000000',
        },
      ]
      const postedEvents = await postManyEvents(invalidEvents);
      expect(postedEvents).toBeNull();            
    })    
  });

  describe("putEvent", () => {
    const eventToPut = {
      ...initEvent,
      id: "evt_cb97b73cb538418ab993fc867f860510",
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      event_name: "Test Event",
      team_size: 1,
      games: 5,
      added_money: "0",
      entry_fee: "75",
      lineage: "10",
      prize_fund: "60",
      other: "1",
      expenses: "4",
      lpox: "75",
      sort_order: 1,
    };

    const putUrl = oneEventUrl + eventToPut.id;

    const resetEvent = {
      ...initEvent,
      id: "evt_cb97b73cb538418ab993fc867f860510",
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      event_name: "Singles",
      team_size: 1,
      games: 6,
      entry_fee: "80",
      lineage: "18",
      prize_fund: "55",
      other: "2",
      expenses: "5",
      added_money: "0",
      lpox: "80",
      sort_order: 1,
    };

    const doReset = async () => {
      try {
        const eventJSON = JSON.stringify(resetEvent);
        const response = await axios({
          method: "put",
          data: eventJSON,
          withCredentials: true,
          url: putUrl,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

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

    it("should put an event", async () => {
      const puttedEvent = await putEvent(eventToPut); 
      expect(puttedEvent).not.toBeNull();
      if (!puttedEvent) return;
      didPut = true;
      expect(puttedEvent?.id).toEqual(eventToPut.id);
      expect(puttedEvent?.tmnt_id).toEqual(eventToPut.tmnt_id);
      expect(puttedEvent?.event_name).toEqual(eventToPut.event_name);
      expect(puttedEvent?.team_size).toEqual(eventToPut.team_size);
      expect(puttedEvent?.games).toEqual(eventToPut.games);
      expect(puttedEvent?.entry_fee).toEqual(eventToPut.entry_fee);
      expect(puttedEvent?.lineage).toEqual(eventToPut.lineage);
      expect(puttedEvent?.prize_fund).toEqual(eventToPut.prize_fund);
      expect(puttedEvent?.other).toEqual(eventToPut.other);
      expect(puttedEvent?.expenses).toEqual(eventToPut.expenses);
      expect(puttedEvent?.added_money).toEqual(eventToPut.added_money);
      expect(puttedEvent?.sort_order).toEqual(eventToPut.sort_order);      
    });
    it("should NOT put an event with invalid data", async () => {
      const invalidEvent = {
        ...eventToPut,
        event_name: "",
      };
      const puttedEvent = await putEvent(invalidEvent);
      expect(puttedEvent).toBeNull();
    });

  });

  describe("deleteEvent", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
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
    };
    const nonFoundId = "evt_00000000000000000000000000000000";

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const events = response.data.events;
      const foundToDel = events.find(
        (e: eventType) => e.id === toDel.id
      );
      if (!foundToDel) {
        try {
          const eventJSON = JSON.stringify(toDel);
          const rePostedResponse = await axios({
            method: "post",
            data: eventJSON,
            withCredentials: true,
            url: url,
          });          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostToDel();
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostToDel();
      }
    });

    it("should delete an event", async () => {
      const deleted = await deleteEvent(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete an event when ID is not found", async () => {
      const deleted = await deleteEvent(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete an event when ID is invalid", async () => {
      const deleted = await deleteEvent('test');
      expect(deleted).toBe(-1);
    });
    it("should NOT delete an event when ID is valid, but not an event id", async () => {
      const deleted = await deleteEvent(mockEventsToPost[0].tmnt_id);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete an event when ID blank", async () => {
      const deleted = await deleteEvent("");
      expect(deleted).toBe(-1);
    });
    it("should NOT delete an event when ID null", async () => {
      const deleted = await deleteEvent(null as any);
      expect(deleted).toBe(-1);
    })
  });

  describe("deleteAllTmntEvents", () => { 

    const multiEvents = [...mockEventsToPost]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const events = response.data.events;
      const foundToDel = events.find(
        (e: eventType) => e.id === multiEvents[0].id
      );
      if (!foundToDel) {
        try {
          const postedEvents: eventType[] = [];
          for await (const event of multiEvents) {
            const postedEvent = await postEvent(event);
            if (!postedEvent) return 
            postedEvents.push(postedEvent); 
          }          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
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
      await deleteAllTmntEvents(multiEvents[0].tmnt_id);
    });

    it("should delete all events for a tmnt", async () => {
      const deleted = await deleteAllTmntEvents(multiEvents[0].tmnt_id);
      expect(deleted).toBe(2);
      didDel = true;
    });
    it("should NOT delete all events for a tmnt when ID is invalid", async () => {
      const deleted = await deleteAllTmntEvents("test");
      expect(deleted).toBe(-1);
    })
    it("should NOT delete all events for a tmnt when ID is not found", async () => {
      const deleted = await deleteAllTmntEvents(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all events for a tmnt when ID is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllTmntEvents(multiEvents[0].id); // event it
      expect(deleted).toBe(-1);
    })
  })

});
