import axios, { AxiosError } from "axios";
import { baseSquadsApi, baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi, testBaseEventsApi } from "../../../testApi";
import { eventType, squadType } from "@/lib/types/types";
import { initEvent, initSquad } from "@/lib/db/initVals";
import { deleteAllEventSquads, deleteAllTmntSquads, deleteSquad, getAllSquadsForTmnt, postManySquads, postSquad, putSquad } from "@/lib/db/squads/squadsAxios";
import { compareAsc } from "date-fns";
import { startOfDayFromString } from "@/lib/dateTools";
import { mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteEvent } from "@/lib/db/events/eventsAxios";

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
const oneSquadUrl = url + "/squad/"
const urlForEvents = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;   
const oneEventUrl = urlForEvents + "/event/"  

const notFoundTmntId = 'tmt_00000000000000000000000000000000';

describe('squadsAxios', () => { 

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

  describe('getAllSquadsForTmnt', () => { 

    // from prisma/seed.ts
    const tmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';
    const squadsToGet: squadType[] = [
      {
        ...initSquad,
        id: "sqd_42be0f9d527e4081972ce8877190489d",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "A Squad",
        squad_date: startOfDayFromString('2022-08-21') as Date, 
        squad_time: '10:00 AM',
        games: 6,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_796c768572574019a6fa79b3b1c8fa57",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "B Squad",
        squad_date: startOfDayFromString('2022-08-21') as Date, 
        squad_time: '02:00 PM',
        games: 6,
        lane_count: 24, 
        starting_lane: 1,
        sort_order: 2,
      }
    ]

    it('gets all squads for tmnt', async () => { 
      const squads = await getAllSquadsForTmnt(tmntId);      
      expect(squads).toHaveLength(squadsToGet.length);
      if (!squads) return;
      for (let i = 0; i < squads.length; i++) {
        expect(squads[i].id).toBe(squadsToGet[i].id);
        expect(squads[i].event_id).toBe(squadsToGet[i].event_id);
        expect(squads[i].squad_name).toBe(squadsToGet[i].squad_name);
        expect(compareAsc(squads[i].squad_date, squadsToGet[i].squad_date)).toBe(0);        
        expect(squads[i].squad_time).toBe(squadsToGet[i].squad_time);
        expect(squads[i].games).toBe(squadsToGet[i].games);
        expect(squads[i].starting_lane).toBe(squadsToGet[i].starting_lane);
        expect(squads[i].lane_count).toBe(squadsToGet[i].lane_count);
        expect(squads[i].sort_order).toBe(squadsToGet[i].sort_order);
      }
    })
    it("should return 0 squads for not found tmnt", async () => { 
      const squads = await getAllSquadsForTmnt(notFoundTmntId);
      expect(squads).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const squads = await getAllSquadsForTmnt('test');
      expect(squads).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const squads = await getAllSquadsForTmnt(squadsToGet[0].id);
      expect(squads).toBeNull();
    })
  })

  describe('postSquad', () => { 

    const squadToPost = {
      ...initSquad,    
      squad_name: 'Test Squad',
      event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",    
      squad_date: startOfDayFromString('2022-08-21') as Date, 
      squad_time: '02:00 PM',
      games: 6,
      lane_count: 24, 
      starting_lane: 1,
      sort_order: 1,
    }

    let createdSquad = false;

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

    it('should post a squad', async () => { 
      const postedSquad = await postSquad(squadToPost);
      expect(postedSquad).not.toBeNull();
      if(!postedSquad) return;
      createdSquad = true;
      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      const squadDate = new Date(postedSquad.squad_date);
      expect(compareAsc(squadDate, squadToPost.squad_date)).toBe(0);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);    
    })
    it('should NOT post a squad with invalid data', async () => { 
      const invalidSquad = {
        ...squadToPost,
        squad_name: '',      
      }
      const postedSquad = await postSquad(invalidSquad);
      expect(postedSquad).toBeNull();
    })

  })  

  describe('postManeySquads', () => { 

    const tmntId = 'tmt_467e51d71659d2e412cbc64a0d19ecb4';

    let didPost = false;

    beforeAll(async () => {
      await deleteAllTmntSquads(tmntId);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllTmntSquads(tmntId);
      }
    });

    it('should post many squads', async () => { 
      const postedEvents = await postManySquads(mockSquadsToPost);
      expect(postedEvents).not.toBeNull();
      if (!postedEvents) return;
      didPost = true;
      expect(postedEvents.length).toBe(mockSquadsToPost.length);
      for (let i = 0; i < postedEvents.length; i++) {
        expect(postedEvents[i].id).toEqual(mockSquadsToPost[i].id);
        expect(postedEvents[i].event_id).toEqual(mockSquadsToPost[i].event_id);
        expect(postedEvents[i].squad_name).toEqual(mockSquadsToPost[i].squad_name);
        expect(compareAsc(postedEvents[i].squad_date, mockSquadsToPost[i].squad_date)).toBe(0);        
        expect(postedEvents[i].squad_time).toEqual(mockSquadsToPost[i].squad_time);
        expect(postedEvents[i].games).toEqual(mockSquadsToPost[i].games);
        expect(postedEvents[i].lane_count).toEqual(mockSquadsToPost[i].lane_count);
        expect(postedEvents[i].starting_lane).toEqual(mockSquadsToPost[i].starting_lane);
        expect(postedEvents[i].sort_order).toEqual(mockSquadsToPost[i].sort_order);
      }
    })
    it('should post sanitzied values', async () => {
      const toSanitzie = [
        {
          ...mockSquadsToPost[0],
          squad_name: '    ' + mockSquadsToPost[0].squad_name + '  ****  ',
        },
        {
          ...mockSquadsToPost[1],
          event_name: '<script>' + mockSquadsToPost[1].squad_name + '</script>',
        }
      ]
      const postedSquads = await postManySquads(toSanitzie);
      expect(postedSquads).not.toBeNull();
      if (!postedSquads) return;
      didPost = true;
      expect(postedSquads.length).toBe(toSanitzie.length);
      expect(postedSquads[0].squad_name).toEqual(mockSquadsToPost[0].squad_name);
      expect(postedSquads[1].squad_name).toEqual(mockSquadsToPost[1].squad_name);
    })
    it("should NOT post many squads with no data", async () => {
      const postedSquads = await postManySquads([]);
      expect(postedSquads).toBeNull();
    })
    it("should NOT post many squads with invalid data", async () => {
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],
          squad_name: "",
        },
        {
          ...mockSquadsToPost[1],          
        },
      ]
      const postedEvents = await postManySquads(invalidSquads);
      expect(postedEvents).toBeNull();            
    })    

  })

  describe('putSquad', () => {

    const squadToPut = {
      ...initSquad,
      id: "sqd_7116ce5f80164830830a7157eb093396",
      event_id: "evt_cb97b73cb538418ab993fc867f860510",
      squad_name: "Test Squad",
      squad_date: startOfDayFromString('2022-11-23') as Date,
      squad_time: '02:00 PM',
      games: 5,
      lane_count: 14,
      starting_lane: 29,
      sort_order: 1,
    }

    const putUrl = oneSquadUrl + squadToPut.id;

    const resetSquad = {
      ...initSquad,
      id: "sqd_7116ce5f80164830830a7157eb093396",
      event_id: "evt_cb97b73cb538418ab993fc867f860510",
      squad_name: "Squad 1",
      squad_date: startOfDayFromString('2022-10-23') as Date,
      squad_time: null,
      games: 6,
      lane_count: 12,
      starting_lane: 29,
      sort_order: 1,
    }

    const doReset = async () => {
      try {
        const squadJSON = JSON.stringify(resetSquad);
        const response = await axios({
          method: "put",
          data: squadJSON,
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

    it('should put a squad', async () => {
      const puttedSquad = await putSquad(squadToPut);
      expect(puttedSquad).not.toBeNull();
      if (!puttedSquad) return;
      didPut = true;
      expect(puttedSquad.id).toEqual(squadToPut.id);
      expect(puttedSquad.event_id).toEqual(squadToPut.event_id);
      expect(puttedSquad.squad_name).toEqual(squadToPut.squad_name);      
      const squadDate = new Date(puttedSquad.squad_date);
      expect(compareAsc(squadDate, squadToPut.squad_date)).toBe(0);
      expect(puttedSquad.squad_time).toEqual(squadToPut.squad_time);
      expect(puttedSquad.games).toEqual(squadToPut.games);
      expect(puttedSquad.lane_count).toEqual(squadToPut.lane_count);
      expect(puttedSquad.starting_lane).toEqual(squadToPut.starting_lane);
      expect(puttedSquad.sort_order).toEqual(squadToPut.sort_order);    
    })  
    it('should NOT put a squad with invalid data', async () => {
      const invalidSquad = {
        ...squadToPut,
        squad_name: '',
      }      
      const puttedSquad = await putSquad(invalidSquad);
      expect(puttedSquad).toBeNull();
    })

  })
  
  describe('deleteSquad', () => {

    // toDel is data from prisma/seeds.ts
    const toDel = {
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
    const nonFoundId = "sqd_00000000000000000000000000000000";
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostSquad(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostSquad(toDel);
      }
    });

    it("should delete a squad", async () => {
      const deleted = await deleteSquad(toDel.id);      
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete a squad when ID is not found", async () => {
      const deleted = await deleteSquad(nonFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a squad when ID is invalid", async () => {
      const deleted = await deleteSquad('test');
      expect(deleted).toBe(-1);
    });
    it('should NOT delete a squad when ID is valid, but not a squad ID', async () => { 
      const deleted = await deleteSquad(mockSquadsToPost[0].event_id);
      expect(deleted).toBe(-1);
    })
    it('should not delete a squad when ID is blank', async () => {
      const deleted = await deleteSquad('');
      expect(deleted).toBe(-1);
    })
    it('should not delete a squad when ID is null', async () => {
      const deleted = await deleteSquad(null as any);
      expect(deleted).toBe(-1);
    })

  })

  describe('deleteAllEventSquads', () => { 

    const multiSquads = [...mockSquadsToPost]

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const squads = response.data.squads;
      const foundToDel = squads.find(
        (s: squadType) => s.id === multiSquads[0].id
      );
      if (!foundToDel) {
        try {
          await postManySquads(multiSquads);
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
      await deleteAllEventSquads(multiSquads[0].event_id);
    });

    it('should delete all squads for an event', async () => {
      const deleted = await deleteAllEventSquads(multiSquads[0].event_id);
      expect(deleted).toBe(2);
      didDel = true;
    })
    it('should NOT delete all squads for an event when ID is invalid', async () => {
      const deleted = await deleteAllEventSquads('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all squads for an event when ID is not found', async () => {
      const deleted = await deleteAllEventSquads('evt_00000000000000000000000000000000');
      expect(deleted).toBe(0);
    })
    it('should NOT delete all squads for an event when ID is valid, but not an event ID', async () => {
      const deleted = await deleteAllEventSquads(mockSquadsToPost[0].id);
      expect(deleted).toBe(-1);
    })
    
  })

  describe('deleteAllTmntSquads', () => { 

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
      await deleteSquad(toDelSquads[0].id);
      await deleteSquad(toDelSquads[1].id);
      await deleteSquad(toDelSquads[2].id);
      await deleteEvent(toDelEvents[0].id);
      await deleteEvent(toDelEvents[1].id);
    })

    it('should delete all squads for a tmnt', async () => {
      const deleted = await deleteAllTmntSquads(toDelEvents[0].tmnt_id);
      didDel = true;
      expect(deleted).toBe(3);
    })
    it('should NOT delete all squads for a tmnt when ID is invalid', async () => {
      const deleted = await deleteAllTmntSquads('test');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete all squads for a tmnt when tmnt ID is not found', async () => {
      const deleted = await deleteAllTmntSquads(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all squads for a tmnt when tmnt ID is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllTmntSquads(toDelEvents[0].id);
      expect(deleted).toBe(-1);
    })
    
  })

})