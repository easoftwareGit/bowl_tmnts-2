import axios from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import { mockEventsToPost, mockEventsToEdit } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { tmntSaveEvents, exportedForTesting } from "@/lib/db/oneTmnt/oneTmnt";

import 'core-js/actual/structured-clone';
import { deleteAllTmntEvents, deleteEvent, postEvent, putEvent } from "@/lib/db/events/eventsAxios";
import { eventType } from "@/lib/types/types";
import { blankEvent } from "@/lib/db/initVals";

const { tmntPostPutOrDelEvents } = exportedForTesting;

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

describe("saveTmntEvents tests", () => {
  const url = testBaseEventsApi.startsWith("undefined")
    ? baseEventsApi
    : testBaseEventsApi;
  
  describe("tmntPostPutOrDelEvents(): edited events ", () => {
    const clonedEvent = structuredClone(mockEventsToEdit[0]);
    const toAddEvent = {
      ...clonedEvent,
      id: 'evt_9a58f0a486cb4e6c92ca3348702b1a63', // added one to last diget
      event_name: "Team",
      team_size: 4,
      games: 3,
      entry_fee: '200',
      lineage: '36',
      prize_fund: '150',
      other: '4',
      expenses: '10',
      added_money: '0',
      lpox: '200',
      sort_order: 4,
    }
    // 1 deleted - trios [2]
    // 1 edited - doubles [1]
    // 1 left alone - singles [0]
    // 1 created - team    
     
    const doResetEvent = async () => {
      await putEvent(mockEventsToEdit[1]);
    }
    const rePostEvent = async () => {
      const response = await axios.get(url);
      const events = response.data.events;
      const found = events.find(
        (e: eventType) => e.id === mockEventsToEdit[2].id
      );
      if (!found) {
        await postEvent(mockEventsToEdit[2]);
      }
    }
    const removeEvent = async () => {
      await deleteEvent(toAddEvent.id);
    }
  
    let didPost = false;
    let didPut = false;
    let didDel = false;
  
    beforeEach(async () => {
      await doResetEvent();
      await rePostEvent();
      await removeEvent();
    });
  
    beforeEach = () => {
      didPost = false;
      didPut = false;
      didDel = false;
    };
  
    afterEach(async () => {
      if (didPost) {
        await removeEvent();
      }
      if (didPut) {
        await doResetEvent();
      }
      if (didDel) {
        await rePostEvent();
      }
    });

    it('should save edited events, one event edited', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit[1].event_name = "Edited Doubles";
      eventsToEdit[1].games = 4;
      eventsToEdit[1].added_money = '300';
      const savedEvents = await tmntPostPutOrDelEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      expect(savedEvents).toHaveLength(3);
      didPut = true;
      const found = savedEvents.find((e) => e.id === eventsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.event_name).toBe(eventsToEdit[1].event_name);
      expect(found.games).toBe(eventsToEdit[1].games);
      expect(found.added_money).toBe(eventsToEdit[1].added_money);
    })
    it('should save edited events, one event added', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit.push(toAddEvent);  
      const savedEvents = await tmntPostPutOrDelEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedEvents).toHaveLength(4);
      const found = savedEvents.find((e) => e.id === toAddEvent.id);
      if (!found) {
        expect(found).not.tbBeUndefined();
        return;
      }            
      expect(found.id).toBe(toAddEvent.id);
      expect(found.tmnt_id).toBe(toAddEvent.tmnt_id);
      expect(found.event_name).toBe(toAddEvent.event_name);
      expect(found.team_size).toBe(toAddEvent.team_size);
      expect(found.games).toBe(toAddEvent.games);
      expect(found.added_money).toBe(toAddEvent.added_money);
      expect(found.entry_fee).toBe(toAddEvent.entry_fee);
      expect(found.lineage).toBe(toAddEvent.lineage);
      expect(found.prize_fund).toBe(toAddEvent.prize_fund);
      expect(found.other).toBe(toAddEvent.other);
      expect(found.expenses).toBe(toAddEvent.expenses);
      expect(found.lpox).toBe(toAddEvent.lpox);
      expect(found.sort_order).toBe(toAddEvent.sort_order);      
    })
    it('should save edited events, one event deleted', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit.pop();      
      const savedEvents = await tmntPostPutOrDelEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedEvents).toHaveLength(2);
      const found = savedEvents.find((e) => e.id === mockEventsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited events, one event edited, one added, one deleted', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      // delete trios
      eventsToEdit.pop(); 
      // edit doubles
      eventsToEdit[1].event_name = "Edited Doubles";
      eventsToEdit[1].games = 4;
      eventsToEdit[1].added_money = '300';
      // add team
      eventsToEdit.push(toAddEvent);
      
      const savedEvents = await tmntPostPutOrDelEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      expect(savedEvents).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      let found = savedEvents.find((e) => e.id === eventsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.event_name).toBe(eventsToEdit[1].event_name);
      expect(found.games).toBe(eventsToEdit[1].games);
      expect(found.added_money).toBe(eventsToEdit[1].added_money);
      found = savedEvents.find((e) => e.id === toAddEvent.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }
      expect(found.id).toBe(toAddEvent.id);
      expect(found.tmnt_id).toBe(toAddEvent.tmnt_id);
      expect(found.event_name).toBe(toAddEvent.event_name);
      expect(found.team_size).toBe(toAddEvent.team_size);
      expect(found.games).toBe(toAddEvent.games);
      expect(found.added_money).toBe(toAddEvent.added_money);
      expect(found.entry_fee).toBe(toAddEvent.entry_fee);
      expect(found.lineage).toBe(toAddEvent.lineage);
      expect(found.prize_fund).toBe(toAddEvent.prize_fund);
      expect(found.other).toBe(toAddEvent.other);
      expect(found.expenses).toBe(toAddEvent.expenses);
      expect(found.lpox).toBe(toAddEvent.lpox);
      expect(found.sort_order).toBe(toAddEvent.sort_order);
      found = savedEvents.find((e) => e.id === mockEventsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
  })
  
  describe("tmntSaveEvents(): new event(s)", () => {
    let createdEvent = false;

    beforeAll(async () => {
      await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
    });

    beforeEach(() => {
      createdEvent = false;
    });

    afterEach(async () => {
      if (createdEvent) {
        await deleteAllTmntEvents(mockEventsToPost[0].tmnt_id);
      }
    });

    const origClone = structuredClone(blankEvent);
    const origEvents: eventType[] = [
      {
        ...origClone,
      }
    ]

    it("should save one new event when only one event to save", async () => {
      const newEventClone = structuredClone(mockEventsToPost[0]);
      const newEvents = [
        {
          ...newEventClone,
        },
      ];
      const result = await tmntSaveEvents(origEvents, newEvents);
      expect(result).not.toBeNull();
      createdEvent = true;
      if (!result) return;
      expect(result.length).toBe(1);
      const postedEvent = result[0];
      expect(postedEvent.id).toBe(newEvents[0].id);
      expect(postedEvent.tmnt_id).toBe(newEvents[0].tmnt_id);
      expect(postedEvent.event_name).toBe(newEvents[0].event_name);
      expect(postedEvent.team_size).toBe(newEvents[0].team_size);
      expect(postedEvent.games).toBe(newEvents[0].games);
      expect(postedEvent.entry_fee).toBe(newEvents[0].entry_fee);
      expect(postedEvent.lineage).toBe(newEvents[0].lineage);
      expect(postedEvent.prize_fund).toBe(newEvents[0].prize_fund);
      expect(postedEvent.other).toBe(newEvents[0].other);
      expect(postedEvent.expenses).toBe(newEvents[0].expenses);
      expect(postedEvent.added_money).toBe(newEvents[0].added_money);
      expect(postedEvent.lpox).toBe(newEvents[0].lpox);
      expect(postedEvent.sort_order).toBe(newEvents[0].sort_order);
    });
    it("should save multiple events when more one event to save", async () => {      
      const newEvents = structuredClone(mockEventsToPost);      
      const result = await tmntSaveEvents(origEvents, newEvents);
      expect(result).not.toBeNull();
      createdEvent = true;
      if (!result) return;
      expect(result.length).toBe(2);
      const postedEvents = result as eventType[];
      let postedEvent
      if (postedEvents[0].id === newEvents[0].id) {
        postedEvent = postedEvents[0]
      } else {
        postedEvent = postedEvents[1]
      }      
      expect(postedEvent.id).toBe(newEvents[0].id);
      expect(postedEvent.tmnt_id).toBe(newEvents[0].tmnt_id);
      expect(postedEvent.event_name).toBe(newEvents[0].event_name);
      expect(postedEvent.team_size).toBe(newEvents[0].team_size);
      expect(postedEvent.games).toBe(newEvents[0].games);
      expect(postedEvent.entry_fee).toBe(newEvents[0].entry_fee);
      expect(postedEvent.lineage).toBe(newEvents[0].lineage);
      expect(postedEvent.prize_fund).toBe(newEvents[0].prize_fund);
      expect(postedEvent.other).toBe(newEvents[0].other);
      expect(postedEvent.expenses).toBe(newEvents[0].expenses);
      expect(postedEvent.added_money).toBe(newEvents[0].added_money);
      expect(postedEvent.lpox).toBe(newEvents[0].lpox);
      expect(postedEvent.sort_order).toBe(newEvents[0].sort_order);

      if (postedEvents[1].id === newEvents[1].id) {
        postedEvent = postedEvents[1]
      } else {
        postedEvent = postedEvents[0]
      }      
      expect(postedEvent.id).toBe(newEvents[1].id);
      expect(postedEvent.tmnt_id).toBe(newEvents[1].tmnt_id);
      expect(postedEvent.event_name).toBe(newEvents[1].event_name);
      expect(postedEvent.team_size).toBe(newEvents[1].team_size);
      expect(postedEvent.games).toBe(newEvents[1].games);
      expect(postedEvent.entry_fee).toBe(newEvents[1].entry_fee);
      expect(postedEvent.lineage).toBe(newEvents[1].lineage);
      expect(postedEvent.prize_fund).toBe(newEvents[1].prize_fund);
      expect(postedEvent.other).toBe(newEvents[1].other);
      expect(postedEvent.expenses).toBe(newEvents[1].expenses);
      expect(postedEvent.added_money).toBe(newEvents[1].added_money);
      expect(postedEvent.lpox).toBe(newEvents[1].lpox);
      expect(postedEvent.sort_order).toBe(newEvents[1].sort_order);
    });
  });

  describe("tmntSaveEvents(): edited events ", () => {
    const clonedEvent = structuredClone(mockEventsToEdit[0]);
    const toAddEvent = {
      ...clonedEvent,
      id: 'evt_9a58f0a486cb4e6c92ca3348702b1a63', // added one to last diget
      event_name: "Team",
      team_size: 4,
      games: 3,
      entry_fee: '200',
      lineage: '36',
      prize_fund: '150',
      other: '4',
      expenses: '10',
      added_money: '0',    
      lpox: '200',
      sort_order: 4,
    }    
    // 1 deleted - trios [2]
    // 1 edited - doubles [1]
    // 1 left alone - singles [0]
    // 1 created - team    
   
    const doResetEvent = async () => {
      await putEvent(mockEventsToEdit[1]);
    }    
    const rePostEvent = async () => {
      const response = await axios.get(url);
      const events = response.data.events;
      const found = events.find(
        (e: eventType) => e.id === mockEventsToEdit[2].id
      );
      if (!found) {
        await postEvent(mockEventsToEdit[2]);
      }      
    }
    const removeEvent = async () => {
      await deleteEvent(toAddEvent.id);
    }

    let didPost = false;
    let didPut = false;
    let didDel = false;

    beforeEach(async () => {
      await doResetEvent();
      await rePostEvent();
      await removeEvent();
    });

    beforeEach = () => {
      didPost = false;
      didPut = false;
      didDel = false;
    };

    afterEach(async () => {
      if (didPost) {
        await removeEvent();
      }
      if (didPut) {
        await doResetEvent();
      }
      if (didDel) {
        await rePostEvent();
      }
    });

    it('should save edited events, one event edited', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit[1].event_name = "Edited Doubles";
      eventsToEdit[1].games = 4;
      eventsToEdit[1].added_money = '300';
      const savedEvents = await tmntSaveEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      expect(savedEvents).toHaveLength(3);
      didPut = true;
      const found = savedEvents.find((e) => e.id === eventsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.event_name).toBe(eventsToEdit[1].event_name);
      expect(found.games).toBe(eventsToEdit[1].games);
      expect(found.added_money).toBe(eventsToEdit[1].added_money);
    })
    it('should save edited events, one event added', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit.push(toAddEvent);  
      const savedEvents = await tmntSaveEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      didPost = true;
      expect(savedEvents).toHaveLength(4);
      const found = savedEvents.find((e) => e.id === toAddEvent.id);
      if (!found) {
        expect(found).not.tbBeUndefined();
        return;
      }            
      expect(found.id).toBe(toAddEvent.id);
      expect(found.tmnt_id).toBe(toAddEvent.tmnt_id);
      expect(found.event_name).toBe(toAddEvent.event_name);
      expect(found.team_size).toBe(toAddEvent.team_size);
      expect(found.games).toBe(toAddEvent.games);
      expect(found.added_money).toBe(toAddEvent.added_money);
      expect(found.entry_fee).toBe(toAddEvent.entry_fee);
      expect(found.lineage).toBe(toAddEvent.lineage);
      expect(found.prize_fund).toBe(toAddEvent.prize_fund);
      expect(found.other).toBe(toAddEvent.other);
      expect(found.expenses).toBe(toAddEvent.expenses);
      expect(found.lpox).toBe(toAddEvent.lpox);
      expect(found.sort_order).toBe(toAddEvent.sort_order);      
    })
    it('should save edited events, one event deleted', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      eventsToEdit.pop();      
      const savedEvents = await tmntSaveEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      didDel = true;
      expect(savedEvents).toHaveLength(2);
      const found = savedEvents.find((e) => e.id === mockEventsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
    it('should save edited events, one event edited, one added, one deleted', async () => { 
      const eventsToEdit = structuredClone(mockEventsToEdit);
      // delete trios
      eventsToEdit.pop(); 
      // edit doubles
      eventsToEdit[1].event_name = "Edited Doubles";
      eventsToEdit[1].games = 4;
      eventsToEdit[1].added_money = '300';
      // add team
      eventsToEdit.push(toAddEvent);
      
      const savedEvents = await tmntSaveEvents(mockEventsToEdit, eventsToEdit);
      if (!savedEvents) {
        expect(savedEvents).not.toBeNull();
        return;
      }
      expect(savedEvents).toHaveLength(3);
      didPut = true;
      didPost = true;
      didDel = true;
      let found = savedEvents.find((e) => e.id === eventsToEdit[1].id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }                  
      expect(found.event_name).toBe(eventsToEdit[1].event_name);
      expect(found.games).toBe(eventsToEdit[1].games);
      expect(found.added_money).toBe(eventsToEdit[1].added_money);
      found = savedEvents.find((e) => e.id === toAddEvent.id);
      if (!found) {
        expect(found).not.toBeUndefined();
        return;
      }
      expect(found.id).toBe(toAddEvent.id);
      expect(found.tmnt_id).toBe(toAddEvent.tmnt_id);
      expect(found.event_name).toBe(toAddEvent.event_name);
      expect(found.team_size).toBe(toAddEvent.team_size);
      expect(found.games).toBe(toAddEvent.games);
      expect(found.added_money).toBe(toAddEvent.added_money);
      expect(found.entry_fee).toBe(toAddEvent.entry_fee);
      expect(found.lineage).toBe(toAddEvent.lineage);
      expect(found.prize_fund).toBe(toAddEvent.prize_fund);
      expect(found.other).toBe(toAddEvent.other);
      expect(found.expenses).toBe(toAddEvent.expenses);
      expect(found.lpox).toBe(toAddEvent.lpox);
      expect(found.sort_order).toBe(toAddEvent.sort_order);
      found = savedEvents.find((e) => e.id === mockEventsToEdit[2].id);
      if (found) {
        expect(found).toBeUndefined();
        return;
      }
      expect(found).toBeUndefined();
    })
  });

})