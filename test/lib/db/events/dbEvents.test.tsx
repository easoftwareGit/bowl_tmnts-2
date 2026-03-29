import { publicApi, privateApi } from "@/lib/api/axios";
import { baseEventsApi } from "@/lib/api/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import type { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import {
  deleteEvent,
  extractEvents,
  getAllEventsForTmnt,
  postEvent,
  putEvent,
} from "@/lib/db/events/dbEvents";
import { cloneDeep } from "lodash";

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
const eventUrl = url + "/event/";

const notFoundTmntId = "tmt_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

describe("dbEvents", () => {

  // describe("extractEvents()", () => {
  //   it("should return an empty array of events when given an empty array", () => {
  //     const result = extractEvents([]);
  //     expect(result).toEqual([]);
  //   });

  //   it("should correctly extract events when given an array of events", () => {
  //     const rawEvents = [
  //       {
  //         ...initEvent,
  //         id: "evt_123",
  //         tmnt_id: "tmt_123",
  //         event_name: "Test Event",
  //         team_size: 1,
  //         games: 5,
  //         entry_fee: "100",
  //         lineage: "15",
  //         prize_fund: "78",
  //         other: "2",
  //         expenses: "5",
  //         added_money: "0",
  //         lpox: "100",
  //         sort_order: 1,
  //         extraField: "ignore me",
  //       },
  //     ];

  //     const result = extractEvents(rawEvents);

  //     const expectedEvent: eventType = {
  //       ...initEvent,
  //       id: "evt_123",
  //       tmnt_id: "tmt_123",
  //       event_name: "Test Event",
  //       tab_title: "Test Event",
  //       team_size: 1,
  //       games: 5,
  //       entry_fee: "100",
  //       lineage: "15",
  //       prize_fund: "78",
  //       other: "2",
  //       expenses: "5",
  //       added_money: "0",
  //       lpox: "100",
  //       sort_order: 1,
  //     };

  //     expect(result).toEqual([expectedEvent]);
  //   });

  //   it("should process multiple events correctly", () => {
  //     const rawEvents = [
  //       {
  //         ...initEvent,
  //         id: "evt_123",
  //         tmnt_id: "tmt_123",
  //         event_name: "Test Event",
  //         team_size: 1,
  //         games: 5,
  //         entry_fee: "100",
  //         lineage: "15",
  //         prize_fund: "78",
  //         other: "2",
  //         expenses: "5",
  //         added_money: "0",
  //         lpox: "100",
  //         sort_order: 1,
  //         extraField: "ignore me",
  //       },
  //       {
  //         ...initEvent,
  //         id: "evt_124",
  //         tmnt_id: "tmt_123",
  //         event_name: "Test Event 2",
  //         team_size: 2,
  //         games: 5,
  //         entry_fee: "200",
  //         lineage: "30",
  //         prize_fund: "156",
  //         other: "4",
  //         expenses: "10",
  //         added_money: "0",
  //         lpox: "200",
  //         sort_order: 2,
  //         extraField: "ignore me",
  //       },
  //     ];

  //     const result = extractEvents(rawEvents);

  //     expect(result).toHaveLength(2);

  //     expect(result[0].id).toBe("evt_123");
  //     expect(result[0].event_name).toBe("Test Event");
  //     expect(result[0].team_size).toBe(1);
  //     expect(result[0].entry_fee).toBe("100");
  //     expect(result[0].lineage).toBe("15");
  //     expect(result[0].prize_fund).toBe("78");
  //     expect(result[0].other).toBe("2");
  //     expect(result[0].expenses).toBe("5");
  //     expect(result[0].lpox).toBe("100");
  //     expect(result[0].sort_order).toBe(1);

  //     expect(result[1].id).toBe("evt_124");
  //     expect(result[1].event_name).toBe("Test Event 2");
  //     expect(result[1].team_size).toBe(2);
  //     expect(result[1].entry_fee).toBe("200");
  //     expect(result[1].lineage).toBe("30");
  //     expect(result[1].prize_fund).toBe("156");
  //     expect(result[1].other).toBe("4");
  //     expect(result[1].expenses).toBe("10");
  //     expect(result[1].lpox).toBe("200");
  //     expect(result[1].sort_order).toBe(2);
  //   });

  //   it("should return an empty array when given null", () => {
  //     const result = extractEvents(null);
  //     expect(result).toEqual([]);
  //   });

  //   it("should return an empty array when given a non-array", () => {
  //     const result = extractEvents("not an array");
  //     expect(result).toEqual([]);
  //   });
  // });

  // describe("getAllEventsForTmnt", () => {
  //   const eventsToGet: eventType[] = [
  //     {
  //       ...initEvent,
  //       id: "evt_cb55703a8a084acb86306e2944320e8d",
  //       tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
  //       event_name: "Doubles",
  //       team_size: 2,
  //       games: 6,
  //       entry_fee: "160",
  //       lineage: "36",
  //       prize_fund: "110",
  //       other: "4",
  //       expenses: "10",
  //       added_money: "0",
  //       sort_order: 1,
  //     },
  //     {
  //       ...initEvent,
  //       id: "evt_adfcff4846474a25ad2936aca121bd37",
  //       tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
  //       event_name: "Trios",
  //       team_size: 3,
  //       games: 3,
  //       entry_fee: "160",
  //       lineage: "36",
  //       prize_fund: "110",
  //       other: "4",
  //       expenses: "10",
  //       added_money: "0",
  //       sort_order: 2,
  //     },
  //   ];

  //   it("should get events for tmnt", async () => {
  //     const events = await getAllEventsForTmnt(eventsToGet[0].tmnt_id);

  //     expect(events).toHaveLength(eventsToGet.length);

  //     for (let i = 0; i < events.length; i++) {
  //       expect(events[i].id).toEqual(eventsToGet[i].id);
  //       expect(events[i].tmnt_id).toEqual(eventsToGet[i].tmnt_id);
  //       expect(events[i].event_name).toEqual(eventsToGet[i].event_name);
  //       expect(events[i].team_size).toEqual(eventsToGet[i].team_size);
  //       expect(events[i].games).toEqual(eventsToGet[i].games);
  //       expect(events[i].entry_fee).toEqual(eventsToGet[i].entry_fee);
  //       expect(events[i].lineage).toEqual(eventsToGet[i].lineage);
  //       expect(events[i].prize_fund).toEqual(eventsToGet[i].prize_fund);
  //       expect(events[i].other).toEqual(eventsToGet[i].other);
  //       expect(events[i].expenses).toEqual(eventsToGet[i].expenses);
  //       expect(events[i].added_money).toEqual(eventsToGet[i].added_money);
  //       expect(events[i].sort_order).toEqual(eventsToGet[i].sort_order);
  //     }
  //   });

  //   it("should return 0 events for not found tmnt", async () => {
  //     const events = await getAllEventsForTmnt(notFoundTmntId);
  //     expect(events).toHaveLength(0);
  //   });

  //   it("should throw error if tmmt id is invalid", async () => {
  //     await expect(getAllEventsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
  //   });

  //   it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
  //     await expect(getAllEventsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
  //   });

  //   it("should throw error if passed null", async () => {
  //     await expect(getAllEventsForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
  //   });
  // });

  describe("postEvent", () => {
    const eventToPost: eventType = {
      ...initEvent,
      id: "evt_11111111111111111111111111111111",
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
      try {
        const response = await publicApi.get(url);
        const events = response.data?.events ?? [];
        const toDel = events.find((e: eventType) => e.id === eventToPost.id);

        if (toDel) {
          await privateApi.delete(eventUrl + toDel.id);
        }
      } catch (err) {
        console.log(
          err instanceof Error ? err.message : `Unknown error: ${String(err)}`
        );
      }
    };

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

      createdEvent = true;

      expect(postedEvent).not.toBeNull();
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

    // it("should post a sanitized event", async () => {
    //   const toSanitize = cloneDeep(eventToPost);
    //   toSanitize.event_name = "<script>Name</script>";

    //   const postedEvent = await postEvent(toSanitize);

    //   createdEvent = true;

    //   expect(postedEvent).not.toBeNull();
    //   expect(postedEvent.id).toEqual(eventToPost.id);
    //   expect(postedEvent.tmnt_id).toEqual(eventToPost.tmnt_id);
    //   expect(postedEvent.event_name).toEqual('scriptNamescript');
    //   expect(postedEvent.team_size).toEqual(eventToPost.team_size);
    //   expect(postedEvent.games).toEqual(eventToPost.games);
    //   expect(postedEvent.entry_fee).toEqual(eventToPost.entry_fee);
    //   expect(postedEvent.lineage).toEqual(eventToPost.lineage);
    //   expect(postedEvent.prize_fund).toEqual(eventToPost.prize_fund);
    //   expect(postedEvent.other).toEqual(eventToPost.other);
    //   expect(postedEvent.expenses).toEqual(eventToPost.expenses);
    //   expect(postedEvent.added_money).toEqual(eventToPost.added_money);
    //   expect(postedEvent.sort_order).toEqual(eventToPost.sort_order);
    // });

    // it("should throw error when trying to post an event with invalid data", async () => {
    //   const invalidEvent = cloneDeep(eventToPost);
    //   invalidEvent.event_name = "";

    //   await expect(postEvent(invalidEvent)).rejects.toThrow(
    //     "postEvent failed: Request failed with status code 422"
    //   );
    // });

    // it("should throw error when passed null", async () => {
    //   await expect(postEvent(null as any)).rejects.toThrow("Invalid event data");
    // });
  });

  // describe("putEvent", () => {
  //   const eventToPut: eventType = {
  //     ...initEvent,
  //     id: "evt_cb97b73cb538418ab993fc867f860510",
  //     tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  //     event_name: "Test Event",
  //     team_size: 1,
  //     games: 5,
  //     added_money: "0",
  //     entry_fee: "75",
  //     lineage: "10",
  //     prize_fund: "60",
  //     other: "1",
  //     expenses: "4",
  //     lpox: "75",
  //     sort_order: 1,
  //   };

  //   const putUrl = eventUrl + eventToPut.id;

  //   const resetEvent: eventType = {
  //     ...initEvent,
  //     id: "evt_cb97b73cb538418ab993fc867f860510",
  //     tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  //     event_name: "Singles",
  //     team_size: 1,
  //     games: 6,
  //     entry_fee: "80",
  //     lineage: "18",
  //     prize_fund: "55",
  //     other: "2",
  //     expenses: "5",
  //     added_money: "0",
  //     lpox: "80",
  //     sort_order: 1,
  //   };

  //   const doReset = async () => {
  //     try {
  //       const eventJSON = JSON.stringify(resetEvent);
  //       await privateApi.put(putUrl, eventJSON);
  //     } catch (err) {
  //       console.log(
  //         err instanceof Error ? err.message : `Unknown error: ${String(err)}`
  //       );
  //     }
  //   };

  //   let didPut = false;

  //   beforeAll(async () => {
  //     await doReset();
  //   });

  //   beforeEach(() => {
  //     didPut = false;
  //   });

  //   afterEach(async () => {
  //     if (didPut) {
  //       await doReset();
  //     }
  //   });

  //   it("should put an event", async () => {
  //     const puttedEvent = await putEvent(eventToPut);

  //     didPut = true;

  //     expect(puttedEvent).not.toBeNull();
  //     expect(puttedEvent.id).toEqual(eventToPut.id);
  //     expect(puttedEvent.tmnt_id).toEqual(eventToPut.tmnt_id);
  //     expect(puttedEvent.event_name).toEqual(eventToPut.event_name);
  //     expect(puttedEvent.team_size).toEqual(eventToPut.team_size);
  //     expect(puttedEvent.games).toEqual(eventToPut.games);
  //     expect(puttedEvent.entry_fee).toEqual(eventToPut.entry_fee);
  //     expect(puttedEvent.lineage).toEqual(eventToPut.lineage);
  //     expect(puttedEvent.prize_fund).toEqual(eventToPut.prize_fund);
  //     expect(puttedEvent.other).toEqual(eventToPut.other);
  //     expect(puttedEvent.expenses).toEqual(eventToPut.expenses);
  //     expect(puttedEvent.added_money).toEqual(eventToPut.added_money);
  //     expect(puttedEvent.sort_order).toEqual(eventToPut.sort_order);
  //   });

  //   it("should put an event with sanitized data", async () => {
  //     const toSanitize = cloneDeep(eventToPut);
  //     toSanitize.event_name = "  ***  Testing  ***  ";

  //     const puttedEvent = await putEvent(toSanitize);

  //     didPut = true;

  //     expect(puttedEvent).not.toBeNull();
  //     expect(puttedEvent.id).toEqual(eventToPut.id);
  //     expect(puttedEvent.tmnt_id).toEqual(eventToPut.tmnt_id);
  //     expect(puttedEvent.event_name).toEqual("Testing");
  //     expect(puttedEvent.team_size).toEqual(eventToPut.team_size);
  //     expect(puttedEvent.games).toEqual(eventToPut.games);
  //     expect(puttedEvent.entry_fee).toEqual(eventToPut.entry_fee);
  //     expect(puttedEvent.lineage).toEqual(eventToPut.lineage);
  //     expect(puttedEvent.prize_fund).toEqual(eventToPut.prize_fund);
  //     expect(puttedEvent.other).toEqual(eventToPut.other);
  //     expect(puttedEvent.expenses).toEqual(eventToPut.expenses);
  //     expect(puttedEvent.added_money).toEqual(eventToPut.added_money);
  //     expect(puttedEvent.sort_order).toEqual(eventToPut.sort_order);
  //   });

  //   it("should throw error when trying to put an event with invalid data", async () => {
  //     const invalidEvent = {
  //       ...eventToPut,
  //       event_name: "",
  //     };

  //     await expect(putEvent(invalidEvent)).rejects.toThrow(
  //       "putEvent failed: Request failed with status code 422"
  //     );
  //   });

  //   it("should throw error when trying to put an event when passed null", async () => {
  //     await expect(putEvent(null as any)).rejects.toThrow("Invalid event data");
  //   });
  // });

  // describe("deleteEvent", () => {
  //   const toDel: eventType = {
  //     ...initEvent,
  //     id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
  //     tmnt_id: "tmt_467e51d71659d2e412cbc64a0d19ecb4",
  //     event_name: "Singles",
  //     team_size: 1,
  //     games: 6,
  //     entry_fee: "80",
  //     lineage: "18",
  //     prize_fund: "55",
  //     other: "2",
  //     expenses: "5",
  //     added_money: "0",
  //     lpox: "80",
  //     sort_order: 1,
  //   };

  //   const nonFoundId = "evt_00000000000000000000000000000000";

  //   const rePostToDel = async () => {
  //     try {
  //       const response = await publicApi.get(url);
  //       const events = response.data?.events ?? [];
  //       const foundToDel = events.find((e: eventType) => e.id === toDel.id);

  //       if (!foundToDel) {
  //         const eventJSON = JSON.stringify(toDel);
  //         await privateApi.post(url, eventJSON);
  //       }
  //     } catch (err) {
  //       console.log(
  //         err instanceof Error ? err.message : `Unknown error: ${String(err)}`
  //       );
  //     }
  //   };

  //   let didDel = false;

  //   beforeAll(async () => {
  //     await rePostToDel();
  //   });

  //   beforeEach(() => {
  //     didDel = false;
  //   });

  //   afterEach(async () => {
  //     if (!didDel) {
  //       await rePostToDel();
  //     }
  //   });

  //   it("should delete an event", async () => {
  //     const deleted = await deleteEvent(toDel.id);
  //     expect(deleted).toBe(1);
  //     didDel = true;
  //   });

  //   it("should return 0 when trying to delete an event when ID is not found", async () => {
  //     const deleted = await deleteEvent(nonFoundId);
  //     expect(deleted).toBe(0);
  //     didDel = true;
  //   });

  //   it("should throw error when trying to delete an event when ID is invalid", async () => {
  //     await expect(deleteEvent("test")).rejects.toThrow("Invalid event id");
  //   });

  //   it("should throw error when trying to delete an event when ID is valid, but not an event id", async () => {
  //     await expect(deleteEvent(userId)).rejects.toThrow("Invalid event id");
  //   });

  //   it("should NOT delete an event when ID null", async () => {
  //     await expect(deleteEvent(null as any)).rejects.toThrow("Invalid event id");
  //   });
  // });
});
