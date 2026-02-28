import axios, { AxiosError } from "axios";
import { baseEventsApi } from "@/lib/api/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import type { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import {
  deleteAllEventsForTmnt,
  deleteEvent,
  extractEvents,
  getAllEventsForTmnt,
  postEvent,
  postManyEvents,
  putEvent,
} from "@/lib/db/events/dbEvents";
import {
  mockEventsToPost,
  tmntToDelId,
} from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { cloneDeep } from "lodash";
import { replaceManyEvents } from "@/lib/db/events/dbEventsReplaceMany";

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

  describe('extractEvents()', () => {
    it('should return an empty array of events when given an empty array', () => {
      const result = extractEvents([]);
      expect(result).toEqual([]);
    });
    it('should correctly extract events when given an array of events', () => {
      const rawEvents = [
        {
          ...initEvent,
          id: "evt_123",
          tmnt_id: "tmt_123",
          event_name: "Test Event",
          team_size: 1,
          games: 5,
          entry_fee: "100",
          lineage: "15",
          prize_fund: "78",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "100",
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractEvents(rawEvents);
      
      const expectedEvent: eventType = {
        ...initEvent,
        id: "evt_123",
        tmnt_id: "tmt_123",
        event_name: "Test Event",
        tab_title: "Test Event",
        team_size: 1,
        games: 5,
        entry_fee: "100",
        lineage: "15",
        prize_fund: "78",
        other: "2",
        expenses: "5",
        added_money: "0",
        lpox: "100",
        sort_order: 1,
      };

      expect(result).toEqual([expectedEvent]);
    });
    it('should process multiple events correctly', () => {
      const rawEvents = [
        {
          ...initEvent,
          id: "evt_123",
          tmnt_id: "tmt_123",
          event_name: "Test Event",
          team_size: 1,
          games: 5,
          entry_fee: "100",
          lineage: "15",
          prize_fund: "78",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "100",
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
        {
          ...initEvent,
          id: "evt_124",
          tmnt_id: "tmt_123",
          event_name: "Test Event 2",
          team_size: 2,
          games: 5,
          entry_fee: "200",
          lineage: "30",
          prize_fund: "156",
          other: "4",
          expenses: "10",
          added_money: "0",
          lpox: "200",
          sort_order: 2,
          extraField: "ignore me", // should be ignored
        },
      ];

      const result = extractEvents(rawEvents);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("evt_123");
      expect(result[0].event_name).toBe("Test Event");
      expect(result[0].team_size).toBe(1);
      expect(result[0].entry_fee).toBe("100");
      expect(result[0].lineage).toBe("15");
      expect(result[0].prize_fund).toBe("78");
      expect(result[0].other).toBe("2");
      expect(result[0].expenses).toBe("5");
      expect(result[0].lpox).toBe("100");
      expect(result[0].sort_order).toBe(1);

      expect(result[1].id).toBe("evt_124");
      expect(result[1].event_name).toBe("Test Event 2");
      expect(result[1].team_size).toBe(2);
      expect(result[1].entry_fee).toBe("200");
      expect(result[1].lineage).toBe("30");
      expect(result[1].prize_fund).toBe("156");
      expect(result[1].other).toBe("4");
      expect(result[1].expenses).toBe("10");
      expect(result[1].lpox).toBe("200");
      expect(result[1].sort_order).toBe(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractEvents(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non-array', () => {
      const result = extractEvents('not an array');
      expect(result).toEqual([]);
    });
  })

  describe("getAllEventsForTmnt", () => {
    // from prisma/seeds.ts
    const eventsToGet: eventType[] = [
      {
        ...initEvent,
        id: "evt_cb55703a8a084acb86306e2944320e8d",
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Doubles",
        team_size: 2,
        games: 6,
        entry_fee: "160",
        lineage: "36",
        prize_fund: "110",
        other: "4",
        expenses: "10",
        added_money: "0",
        sort_order: 1,
      },
      {
        ...initEvent,
        id: "evt_adfcff4846474a25ad2936aca121bd37",
        tmnt_id: "tmt_2d494e9bb51f4b9abba428c3f37131c9",
        event_name: "Trios",
        team_size: 3,
        games: 3,
        entry_fee: "160",
        lineage: "36",
        prize_fund: "110",
        other: "4",
        expenses: "10",
        added_money: "0",
        sort_order: 2,
      },
    ];

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
    });
    it("should return 0 events for not found tmnt", async () => {
      const events = await getAllEventsForTmnt(notFoundTmntId);
      expect(events).toHaveLength(0);
    });
    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getAllEventsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllEventsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if passed null", async () => {
      try {
        await getAllEventsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

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
      const toDel = events.find(
        (e: eventType) => e.event_name === "Test Event"
      );
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: eventUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
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
    it("should post a sanitized event", async () => {
      const toSanitize = cloneDeep(eventToPost);
      toSanitize.event_name = "<script>" + toSanitize.event_name + "</script>";
      const postedEvent = await postEvent(toSanitize);
      expect(postedEvent).not.toBeNull();
      if (!postedEvent) return;
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
    it("should throw error when trying to post an event with invalid data", async () => {
      try {
        const invalidEvent = cloneDeep(eventToPost);
        invalidEvent.event_name = "";
        await postEvent(invalidEvent);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postEvent failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postEvent(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data");
      }
    });
  });

  describe("postManyEvents", () => {
    let didPost = false;

    beforeAll(async () => {
      await deleteAllEventsForTmnt(tmntToDelId);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllEventsForTmnt(tmntToDelId);
      }
    });

    it("should post many events", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      didPost = true;
      const postedEvents = await getAllEventsForTmnt(tmntToDelId);
      if (!postedEvents) {
        expect(true).toBe(false);
        return;
      }
      expect(postedEvents.length).toBe(mockEventsToPost.length);
      for (let i = 0; i < postedEvents.length; i++) {
        if (postedEvents[i].id === mockEventsToPost[0].id) {
          expect(postedEvents[i].tmnt_id).toEqual(mockEventsToPost[0].tmnt_id);
          expect(postedEvents[i].event_name).toEqual(
            mockEventsToPost[0].event_name
          );
          expect(postedEvents[i].team_size).toEqual(
            mockEventsToPost[0].team_size
          );
          expect(postedEvents[i].games).toEqual(mockEventsToPost[0].games);
          expect(postedEvents[i].entry_fee).toEqual(
            mockEventsToPost[0].entry_fee
          );
          expect(postedEvents[i].lineage).toEqual(mockEventsToPost[0].lineage);
          expect(postedEvents[i].prize_fund).toEqual(
            mockEventsToPost[0].prize_fund
          );
          expect(postedEvents[i].other).toEqual(mockEventsToPost[0].other);
          expect(postedEvents[i].expenses).toEqual(
            mockEventsToPost[0].expenses
          );
          expect(postedEvents[i].lpox).toEqual(mockEventsToPost[0].lpox);
          expect(postedEvents[i].added_money).toEqual(
            mockEventsToPost[0].added_money
          );
          expect(postedEvents[i].sort_order).toEqual(
            mockEventsToPost[0].sort_order
          );
        } else if (postedEvents[i].id === mockEventsToPost[1].id) {
          expect(postedEvents[i].tmnt_id).toEqual(mockEventsToPost[1].tmnt_id);
          expect(postedEvents[i].event_name).toEqual(
            mockEventsToPost[1].event_name
          );
          expect(postedEvents[i].team_size).toEqual(
            mockEventsToPost[1].team_size
          );
          expect(postedEvents[i].games).toEqual(mockEventsToPost[1].games);
          expect(postedEvents[i].entry_fee).toEqual(
            mockEventsToPost[1].entry_fee
          );
          expect(postedEvents[i].lineage).toEqual(mockEventsToPost[1].lineage);
          expect(postedEvents[i].prize_fund).toEqual(
            mockEventsToPost[1].prize_fund
          );
          expect(postedEvents[i].other).toEqual(mockEventsToPost[1].other);
          expect(postedEvents[i].expenses).toEqual(
            mockEventsToPost[1].expenses
          );
          expect(postedEvents[i].lpox).toEqual(mockEventsToPost[1].lpox);
          expect(postedEvents[i].added_money).toEqual(
            mockEventsToPost[1].added_money
          );
          expect(postedEvents[i].sort_order).toEqual(
            mockEventsToPost[1].sort_order
          );
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 when passend an empty array", async () => {
      const count = await postManyEvents([]);
      expect(count).toBe(0);
    });
    it("should post sanitzied values", async () => {
      const toSanitzie = [
        {
          ...mockEventsToPost[0],
          event_name: "   " + mockEventsToPost[0].event_name + "  **** ",
        },
        {
          ...mockEventsToPost[1],
          event_name: "<script>" + mockEventsToPost[1].event_name + "</script>",
        },
      ];

      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      didPost = true;
      const postedEvents = await getAllEventsForTmnt(
        mockEventsToPost[0].tmnt_id
      );
      if (!postedEvents) {
        expect(true).toBe(false);
        return;
      }
      expect(postedEvents.length).toBe(toSanitzie.length);
      expect(postedEvents.length).toBe(mockEventsToPost.length);
      for (let i = 0; i < postedEvents.length; i++) {
        if (postedEvents[i].id === mockEventsToPost[0].id) {
          expect(postedEvents[i].event_name).toEqual(
            mockEventsToPost[0].event_name
          );
        } else if (postedEvents[i].id === mockEventsToPost[1].id) {
          expect(postedEvents[i].event_name).toEqual(
            mockEventsToPost[1].event_name
          );
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should throw error when posting many events with invalid data", async () => {
      try {
        const invalidEvents = [
          {
            ...mockEventsToPost[0],
            event_name: "",
          },
          {
            ...mockEventsToPost[1],
          },
        ];
        await postManyEvents(invalidEvents);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data at index 0");
      }
    });
    it("should throw error when posting many events when all tmnt_ids are not the same", async () => {
      try {
        const invalidEvents = [
          {
            ...mockEventsToPost[0],
          },
          {
            ...mockEventsToPost[1],
            tmnt_id: "tmt_00000000000000000000000000000000",
          },
        ];
        await postManyEvents(invalidEvents);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data at index 1");
      }
    });
    it("should throw error when posting many events with invalid data at first item", async () => {
      try {
        const invalidEvents = [
          {
            ...mockEventsToPost[0],
            event_name: "",
          },
          {
            ...mockEventsToPost[1],
          },
        ];
        await postManyEvents(invalidEvents);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data at index 0");
      }
    });
    it("should throw error when posting many events with invalid data at second item", async () => {
      try {
        const invalidEvents = [
          {
            ...mockEventsToPost[0],
          },
          {
            ...mockEventsToPost[1],
            team_size: -1,
          },
        ];
        await postManyEvents(invalidEvents);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data at index 1");
      }
    });
    it("should throw error when passed a non array", async () => {
      try {
        await postManyEvents("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data");
      }
    });
    it("should throw error when passed invalid event id in array", async () => {
      try {
        const invalidEvents = [
          {
            ...mockEventsToPost[0],
            id: "test",
          },
          {
            ...mockEventsToPost[1],
          },
        ];
        await postManyEvents(invalidEvents);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data at index 0");
      }
    });
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

    const putUrl = eventUrl + eventToPut.id;

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
    it("should put an event with sanitized data", async () => {
      const toSanitize = cloneDeep(eventToPut);
      toSanitize.event_name = "  ***  Testing  ***  ";
      const puttedEvent = await putEvent(toSanitize);
      expect(puttedEvent).not.toBeNull();
      if (!puttedEvent) return;
      didPut = true;
      expect(puttedEvent?.id).toEqual(eventToPut.id);
      expect(puttedEvent?.tmnt_id).toEqual(eventToPut.tmnt_id);
      expect(puttedEvent?.event_name).toEqual("Testing");
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
    it("should throw error when trying to put an event with invalid data", async () => {
      try {
        const invalidEvent = {
          ...eventToPut,
          event_name: "",
        };
        await putEvent(invalidEvent);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putEvent failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when trying to put an event when passed null", async () => {
      try {
        await putEvent(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event data");
      }
    });
  });

  describe("replaceManyEvents()", () => {
    let createdEvents = false;

    beforeAll(async () => {
      await deleteAllEventsForTmnt(tmntToDelId);
    });

    beforeEach(() => {
      createdEvents = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdEvents) {
        await deleteAllEventsForTmnt(tmntToDelId);
      }
    });

    it("should update, insert, delete many events", async () => {
      const toInsert: eventType[] = [
        {
          ...initEvent,
          id: "evt_3338f0a486cb4e6c92ca3348702b1a63",
          tmnt_id: tmntToDelId,
          event_name: "Test 3",
          tab_title: "Test 3",
          team_size: 3,
          games: 3,
          entry_fee: "80",
          lineage: "18",
          prize_fund: "55",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "80",
          sort_order: 13,
        },
        {
          ...initEvent,
          id: "evt_4448f0a486cb4e6c92ca3348702b1a63",
          tmnt_id: tmntToDelId,
          event_name: "Test 4",
          tab_title: "Test 4",
          team_size: 4,
          games: 4,
          entry_fee: "80",
          lineage: "18",
          prize_fund: "55",
          other: "2",
          expenses: "5",
          added_money: "0",
          lpox: "80",
          sort_order: 13,
        },
      ];

      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const evevnts = await getAllEventsForTmnt(tmntToDelId);
      if (!evevnts) {
        expect(true).toBeFalsy();
        return;
      }
      expect(evevnts.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
          event_name: "Test A",
          tab_title: "Test A",
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyEvents(eventsToUpdate, tmntToDelId);
      expect(replaceCount).toBe(eventsToUpdate.length);
      const replacedEvents = await getAllEventsForTmnt(tmntToDelId);
      if (!replacedEvents) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedEvents.length).toEqual(eventsToUpdate.length);
      for (let i = 0; i < replacedEvents.length; i++) {
        if (replacedEvents[i].id === eventsToUpdate[0].id) {
          expect(replacedEvents[i].event_name).toEqual(
            eventsToUpdate[0].event_name
          );
          expect(replacedEvents[i].tab_title).toEqual(
            eventsToUpdate[0].tab_title
          );
          expect(replacedEvents[i].team_size).toEqual(
            eventsToUpdate[0].team_size
          );
          expect(replacedEvents[i].games).toEqual(eventsToUpdate[0].games);
        } else if (replacedEvents[i].id === eventsToUpdate[1].id) {
          expect(replacedEvents[i].event_name).toEqual(
            eventsToUpdate[1].event_name
          );
          expect(replacedEvents[i].tab_title).toEqual(
            eventsToUpdate[1].tab_title
          );
          expect(replacedEvents[i].team_size).toEqual(
            eventsToUpdate[1].team_size
          );
          expect(replacedEvents[i].games).toEqual(eventsToUpdate[1].games);
        } else if (replacedEvents[i].id === eventsToUpdate[2].id) {
          expect(replacedEvents[i].event_name).toEqual(
            eventsToUpdate[2].event_name
          );
          expect(replacedEvents[i].tab_title).toEqual(
            eventsToUpdate[2].tab_title
          );
          expect(replacedEvents[i].team_size).toEqual(
            eventsToUpdate[2].team_size
          );
          expect(replacedEvents[i].games).toEqual(eventsToUpdate[2].games);
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many events - sanitized event names", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
          event_name: "<script>alert(1)</script>",
        },
        {
          ...mockEventsToPost[1],
        },
      ];

      const replaceCount = await replaceManyEvents(eventsToUpdate, tmntToDelId);
      expect(replaceCount).toBe(eventsToUpdate.length);
      const replacedEvents = await getAllEventsForTmnt(tmntToDelId);
      if (!replacedEvents) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedEvents.length).toEqual(eventsToUpdate.length);
      for (let i = 0; i < replacedEvents.length; i++) {
        if (replacedEvents[i].id === eventsToUpdate[0].id) {
          expect(replacedEvents[i].event_name).toEqual("alert1");
          expect(replacedEvents[i].tab_title).toEqual("alert1");
          expect(replacedEvents[i].team_size).toEqual(
            eventsToUpdate[0].team_size
          );
          expect(replacedEvents[i].games).toEqual(eventsToUpdate[0].games);
        } else if (replacedEvents[i].id === eventsToUpdate[1].id) {
          expect(replacedEvents[i].event_name).toEqual(
            eventsToUpdate[1].event_name
          );
          expect(replacedEvents[i].tab_title).toEqual(
            eventsToUpdate[1].tab_title
          );
          expect(replacedEvents[i].team_size).toEqual(
            eventsToUpdate[1].team_size
          );
          expect(replacedEvents[i].games).toEqual(eventsToUpdate[1].games);
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const replaceCount = await replaceManyEvents([], tmntToDelId);
      expect(replaceCount).toBe(0);
      const replacedEvents = await getAllEventsForTmnt(tmntToDelId);
      if (!replacedEvents) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedEvents.length).toEqual(0);
    });
    it("should throw an error for invalid event ID in first item", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
          id: "",
        },
        {
          ...mockEventsToPost[1],
        },
      ];
      await expect(
        replaceManyEvents(eventsToUpdate, tmntToDelId)
      ).rejects.toThrow("Invalid event data at index 0");
    });
    it("should throw an error for invalid event ID in second item", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
        },
        {
          ...mockEventsToPost[1],
          id: "invalid-id",
        },
      ];
      await expect(
        replaceManyEvents(eventsToUpdate, tmntToDelId)
      ).rejects.toThrow("Invalid event data at index 1");
    });
    it("should throw an error for invalid event data in first item", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
          event_name: "",
        },
        {
          ...mockEventsToPost[1],
        },
      ];
      await expect(
        replaceManyEvents(eventsToUpdate, tmntToDelId)
      ).rejects.toThrow("Invalid event data at index 0");
    });
    it("should throw an error for invalid event data in second item", async () => {
      const count = await postManyEvents(mockEventsToPost);
      expect(count).toBe(mockEventsToPost.length);
      createdEvents = true;
      const events = await getAllEventsForTmnt(tmntToDelId);
      if (!events) {
        expect(true).toBeFalsy();
        return;
      }
      expect(events.length).toEqual(mockEventsToPost.length);

      const eventsToUpdate = [
        {
          ...mockEventsToPost[0],
        },
        {
          ...mockEventsToPost[1],
          team_size: -1,
        },
      ];
      await expect(
        replaceManyEvents(eventsToUpdate, tmntToDelId)
      ).rejects.toThrow("Invalid event data at index 1");
    });
    it("should throw an error if passed null as events", async () => {
      await expect(replaceManyEvents(null as any, tmntToDelId)).rejects.toThrow(
        "Invalid events"
      );
    });
    it("should throw an error if events is not an array", async () => {
      await expect(
        replaceManyEvents("not-an-array" as any, tmntToDelId)
      ).rejects.toThrow("Invalid events");
    });
    it("should throw an error if passed null as tmntId", async () => {
      await expect(
        replaceManyEvents(mockEventsToPost, null as any)
      ).rejects.toThrow("Invalid tmnt id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyEvents(mockEventsToPost, "test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
    it("should throw an error if passed valid id, but not tmnt id", async () => {
      await expect(replaceManyEvents(mockEventsToPost, userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
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
      entry_fee: "80",
      lineage: "18",
      prize_fund: "55",
      other: "2",
      expenses: "5",
      added_money: "0",
      lpox: "80",
      sort_order: 1,
    };
    const nonFoundId = "evt_00000000000000000000000000000000";

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const events = response.data.events;
      const foundToDel = events.find((e: eventType) => e.id === toDel.id);
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
    };

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
    it("should throw error when trying to delete an event when ID is not found", async () => {
      try {
        await deleteEvent(nonFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteEvent failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete an event when ID is invalid", async () => {
      try {
        await deleteEvent("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
    it("should throw error when trying to delete an event when ID is valid, but not an event id", async () => {
      try {
        await deleteEvent(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
    it("should NOT delete an event when ID null", async () => {
      try {
        await deleteEvent(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
  });

  describe("deleteAllEventsForTmnt", () => {
    const multiEvents = [...mockEventsToPost];

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
            if (!postedEvent) return;
            postedEvents.push(postedEvent);
          }
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

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
      await deleteAllEventsForTmnt(tmntToDelId);
    });

    it("should delete all events for a tmnt", async () => {
      const deleted = await deleteAllEventsForTmnt(tmntToDelId);
      expect(deleted).toBe(2);
      didDel = true;
    });
    it("should not delete all events for a tmnt when ID is not found", async () => {
      const deleted = await deleteAllEventsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all events for a tmnt when ID is invalid", async () => {
      try {
        await deleteAllEventsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all events for a tmnt when ID is valid, but not a tmnt id", async () => {
      try {
        await deleteAllEventsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all events for a tmnt when ID is null", async () => {
      try {
        await deleteAllEventsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
