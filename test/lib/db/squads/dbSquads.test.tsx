import axios, { AxiosError } from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../testApi";
import { oneBrktsAndSeedsType, squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import {
  deleteAllSquadsForEvent,
  deleteAllSquadsForTmnt,
  deleteSquad,
  // getAllEntriesForSquad,
  getAllEntriesForSquad2,
  getAllSquadsForTmnt,
  postManySquads,
  postSquad,
  putSquad,
  exportedForTesting,
  getAllOneBrktsAndSeedsForSquad,
  extractSquads,
} from "@/lib/db/squads/dbSquads";
import { startOfDayFromString } from "@/lib/dateTools";
import { mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  mockCurData,
  mockSquadEntries,
} from "../../../mocks/tmnts/playerEntries/mockOneSquadEntries";
import { replaceManySquads } from "@/lib/db/squads/dbSquadsReplaceMany";
import { cloneDeep } from "lodash";

const {
  getAllPlayersForSquad2,
  getAllDivEntriesForSquad2,
  getAllPotEntriesForSquad2, 
  getAllBrktEntriesForSquad2,
  getAllElimEntriesForSquad2,
  getBracketListForSquad,  
  testingGetAllEntriesForSquad2,
} = exportedForTesting;

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
const squadUrl = url + "/squad/";

const notFoundEventId = "evt_00000000000000000000000000000000"
const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const obsSquadId = 'sqd_7116ce5f80164830830a7157eb093396';
const goldPinBrktId1 = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const goldPinBrktId2 = 'brk_6ede2512c7d4409ca7b055505990a499';
const goldPinOneBrktId1 = 'obk_557f12f3875f42baa29fdbd22ee7f2f4';
const goldPinOneBrktId2 = 'obk_5423c16d58a948748f32c7c72c632297';
const goldPinOneBrktId3 = 'obk_8d500123a07d46f9bb23db61e74ffc1b';
const goldPinOneBrktId4 = 'obk_4ba9e037c86e494eb272efcd989dc9d0';

const tmntId = "tmt_467e51d71659d2e412cbc64a0d19ecb4";
const userId = "usr_01234567890123456789012345678901";

describe("dbSquads", () => {
  const rePostSquad = async (squad: squadType) => {
    try {
      // if squad already in database, then don't re-post
      const getResponse = await axios.get(squadUrl + squad.id);
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
        data: squadJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe('extractSquads()', () => { 
    it('should return an empty array when given an empty array', () => {
      const squads = extractSquads([]);
      expect(squads).toEqual([]);
    });
    it('should correctly extract squads when given array of squads', () => {
      const rawSquads = [
        {
          id: "sqd_123",
          event_id: "evt_123",
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        }
      ];

      const result = extractSquads(rawSquads);

      const expectedSquad: squadType = {
        ...initSquad,
        id: "sqd_123",
        event_id: "evt_123",
        squad_name: "A Squad",
        tab_title: "A Squad",
        squad_date_str: "2022-08-21",
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      };

      expect(result).toEqual([expectedSquad]);
    });
    it('should process multiple squads correctly', () => {
      const rawSquads = [
        {
          id: "sqd_123",
          event_id: "evt_123",
          squad_name: "A Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "10:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 1,
          extraField: "ignore me", // should be ignored
        },
        {
          id: "sqd_456",
          event_id: "evt_123",
          squad_name: "B Squad",
          squad_date: "2022-08-21T07:00:00.000Z",
          squad_time: "11:00 AM",
          games: 6,
          lane_count: 10,
          starting_lane: 1,
          sort_order: 2,
          extraField: "ignore me", // should be ignored
        }
      ];

      const result = extractSquads(rawSquads);

      expect(result.length).toEqual(2);
      expect(result[0].id).toBe("sqd_123");
      expect(result[0].squad_name).toBe("A Squad");
      expect(result[0].squad_time).toBe("10:00 AM");
      expect(result[0].sort_order).toBe(1);
      expect(result[1].id).toBe("sqd_456");
      expect(result[1].squad_name).toBe("B Squad");
      expect(result[1].squad_time).toBe("11:00 AM");
      expect(result[1].sort_order).toBe(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractSquads(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non-array', () => {
      const result = extractSquads('not an array');
      expect(result).toEqual([]);
    });
  })

  describe("getAllSquadsForTmnt", () => {
    // from prisma/seed.ts
    const tmntId = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";
    const squadsToGet: squadType[] = [
      {
        ...initSquad,
        id: "sqd_42be0f9d527e4081972ce8877190489d",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "A Squad",
        squad_date_str: "2022-08-21",
        squad_time: "10:00 AM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 1,
      },
      {
        ...initSquad,
        id: "sqd_796c768572574019a6fa79b3b1c8fa57",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "B Squad",
        squad_date_str: "2022-08-21",
        squad_time: "02:00 PM",
        games: 6,
        lane_count: 10,
        starting_lane: 1,
        sort_order: 2,
      },
      {
        ...initSquad,
        id: "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6",
        event_id: "evt_06055deb80674bd592a357a4716d8ef2",
        squad_name: "C Squad",
        squad_date_str: "2022-08-21",
        squad_time: "04:30 PM",
        games: 3,
        lane_count: 24,
        starting_lane: 1,
        sort_order: 3,
      },
    ];

    it("gets all squads for tmnt", async () => {
      const squads = await getAllSquadsForTmnt(tmntId);
      expect(squads).toHaveLength(squadsToGet.length);
      if (!squads) return;
      for (let i = 0; i < squads.length; i++) {
        expect(squads[i].id).toBe(squadsToGet[i].id);
        expect(squads[i].event_id).toBe(squadsToGet[i].event_id);
        expect(squads[i].squad_name).toBe(squadsToGet[i].squad_name);
        expect(squads[i].squad_date_str).toBe(squadsToGet[i].squad_date_str);
        expect(squads[i].squad_time).toBe(squadsToGet[i].squad_time);
        expect(squads[i].games).toBe(squadsToGet[i].games);
        expect(squads[i].starting_lane).toBe(squadsToGet[i].starting_lane);
        expect(squads[i].lane_count).toBe(squadsToGet[i].lane_count);
        expect(squads[i].sort_order).toBe(squadsToGet[i].sort_order);
      }
    });
    it("should return 0 squads for not found tmnt", async () => {
      const squads = await getAllSquadsForTmnt(notFoundTmntId);
      expect(squads).toHaveLength(0);
    });
    it("should throw error if tmnt id is invalid", async () => {
      try {
        await getAllSquadsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllSquadsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getAllSquadsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe('getAllOneBrktsAndSeedsForSquad', () => {
    it('should get all brackets and seeds for a squad', async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(mockCurData.squads[0].id);
      expect(oneBrktsAndSeeds).not.toBeNull();
      if (!oneBrktsAndSeeds) return;
      expect(oneBrktsAndSeeds).toHaveLength(3);
    });
    it('should get all brackets and seeds for a squad (2 seperate brackets)', async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(obsSquadId);
      expect(oneBrktsAndSeeds).not.toBeNull();
      if (!oneBrktsAndSeeds) return;
      // 32 rows in prisma/seed.ts
      expect(oneBrktsAndSeeds).toHaveLength(32)
      // 8 brktSeeds for each of the 4 oneBrkts
      // sorts goldPinOneBrktId4, 2, 1, 3
      expect(oneBrktsAndSeeds[0].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[0].seed).toBe(0);
      expect(oneBrktsAndSeeds[1].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[1].seed).toBe(1);
      expect(oneBrktsAndSeeds[6].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[6].seed).toBe(6);
      expect(oneBrktsAndSeeds[7].one_brkt_id).toBe(goldPinOneBrktId1);
      expect(oneBrktsAndSeeds[7].seed).toBe(7);

      expect(oneBrktsAndSeeds[8].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[8].seed).toBe(0);
      expect(oneBrktsAndSeeds[9].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[9].seed).toBe(1);
      expect(oneBrktsAndSeeds[14].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[14].seed).toBe(6);
      expect(oneBrktsAndSeeds[15].one_brkt_id).toBe(goldPinOneBrktId2);
      expect(oneBrktsAndSeeds[15].seed).toBe(7);

      expect(oneBrktsAndSeeds[16].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[16].seed).toBe(0);
      expect(oneBrktsAndSeeds[17].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[17].seed).toBe(1);
      expect(oneBrktsAndSeeds[22].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[22].seed).toBe(6);
      expect(oneBrktsAndSeeds[23].one_brkt_id).toBe(goldPinOneBrktId3);
      expect(oneBrktsAndSeeds[23].seed).toBe(7);

      expect(oneBrktsAndSeeds[24].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[24].seed).toBe(0);
      expect(oneBrktsAndSeeds[25].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[25].seed).toBe(1);
      expect(oneBrktsAndSeeds[30].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[30].seed).toBe(6);
      expect(oneBrktsAndSeeds[31].one_brkt_id).toBe(goldPinOneBrktId4);
      expect(oneBrktsAndSeeds[31].seed).toBe(7);
    });
    it('should return empty array if no brackets or seeds for squad', async () => {
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(notFoundSquadId);
      expect(oneBrktsAndSeeds).not.toBeNull();
      if (!oneBrktsAndSeeds) return;
      expect(oneBrktsAndSeeds).toHaveLength(0);
    });
    it('should throw error when squad id is invalid', async () => {
      try {
        await getAllOneBrktsAndSeedsForSquad('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it('should throw error when squad id is valid, noy not a squad id', async () => {
      try {
        await getAllOneBrktsAndSeedsForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it('should throw error when squad id is null', async () => {
      try {
        await getAllOneBrktsAndSeedsForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllEntriesForSquad2", () => {
    it("gets all entries for a squad", async () => {
      const allEntries = await getAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.squadId).toBe(mockSquadEntries.squadId);
      expect(allEntries.players.length).toBe(mockSquadEntries.players.length);
      for (let i = 0; i < allEntries.players.length; i++) {
        expect(allEntries.players[i].id).toBe(mockSquadEntries.players[i].id);
        expect(allEntries.players[i].squad_id).toBe(mockSquadEntries.squadId);
        expect(allEntries.players[i].first_name).toBe(
          mockSquadEntries.players[i].first_name
        );
        expect(allEntries.players[i].last_name).toBe(
          mockSquadEntries.players[i].last_name
        );
        expect(allEntries.players[i].average).toBe(
          mockSquadEntries.players[i].average
        );
        expect(allEntries.players[i].lane).toBe(
          mockSquadEntries.players[i].lane
        );
        expect(allEntries.players[i].position).toBe(
          mockSquadEntries.players[i].position
        );        
      }

      expect(allEntries.divEntries.length).toBe(
        mockSquadEntries.divEntries.length
      );
      for (let i = 0; i < allEntries.divEntries.length; i++) {        
        expect(allEntries.divEntries[i].squad_id).toBe(
          mockSquadEntries.squadId
        );
        expect(allEntries.divEntries[i].div_id).toBe(
          mockSquadEntries.divEntries[i].div_id
        );
        expect(allEntries.divEntries[i].player_id).toBe(
          mockSquadEntries.divEntries[i].player_id
        );
        expect(allEntries.divEntries[i].fee).toBe(
          mockSquadEntries.divEntries[i].fee
        );
      }

      expect(allEntries.potEntries.length).toBe(
        mockSquadEntries.potEntries.length
      );
      for (let i = 0; i < allEntries.potEntries.length; i++) {        
        expect(allEntries.potEntries[i].pot_id).toBe(
          mockSquadEntries.potEntries[i].pot_id
        );
        expect(allEntries.potEntries[i].player_id).toBe(
          mockSquadEntries.potEntries[i].player_id
        );
        expect(allEntries.potEntries[i].fee).toBe(
          mockSquadEntries.potEntries[i].fee
        );
      }

      expect(allEntries.brktEntries.length).toBe(
        mockSquadEntries.brktEntries.length
      );
      for (let i = 0; i < allEntries.brktEntries.length; i++) {
        expect(allEntries.brktEntries[i].brkt_id).toBe(
          mockSquadEntries.brktEntries[i].brkt_id
        );
        expect(allEntries.brktEntries[i].player_id).toBe(
          mockSquadEntries.brktEntries[i].player_id
        );
        expect(allEntries.brktEntries[i].num_brackets).toBe(
          mockSquadEntries.brktEntries[i].num_brackets
        );
      }

      // see getAllOneBrktsAndSeedsForSquad and getBracketListForSquad 
      // describes in this file for full testing of brktLists
      expect(allEntries.brktLists.length).toBe(1);

      expect(allEntries.elimEntries.length).toBe(
        mockSquadEntries.elimEntries.length
      );
      for (let i = 0; i < allEntries.elimEntries.length; i++) {      
        expect(allEntries.elimEntries[i].elim_id).toBe(
          mockSquadEntries.elimEntries[i].elim_id
        );
        expect(allEntries.elimEntries[i].player_id).toBe(
          mockSquadEntries.elimEntries[i].player_id
        );
        expect(allEntries.elimEntries[i].fee).toBe(
          mockSquadEntries.elimEntries[i].fee
        );
      }
    });
    it("should not get all entries for not found squad", async () => {
      const notFound = cloneDeep(mockCurData);
      const notFoundSquadId = "sqd_01234567890123456789012345678901";
      notFound.squads[0].id = notFoundSquadId;
      const allEntries = await getAllEntriesForSquad2(notFound);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.squadId).toBe(notFoundSquadId);
      expect(allEntries.players.length).toBe(0);
      expect(allEntries.divEntries.length).toBe(0);
      expect(allEntries.potEntries.length).toBe(0);
      expect(allEntries.brktEntries.length).toBe(0);
      expect(allEntries.brktLists.length).toBe(0);
      expect(allEntries.elimEntries.length).toBe(0);
    });
    it("should throw error if passed null", async () => {
      try { 
        await getAllEntriesForSquad2(null as any);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid curData data");
      }
    });
    it("should throw error if squads is null in current data", async () => {
      try {  
        const noSquads = cloneDeep(mockCurData);
        noSquads.squads = null as any;
        await getAllEntriesForSquad2(noSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");        
      }      
    });
    it("should throw error if no squads in current data", async () => {
      try {  
        const noSquads = cloneDeep(mockCurData);
        noSquads.squads = [];
        await getAllEntriesForSquad2(noSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");        
      }      
    });
    it("should throw error if invalid squad id in current data", async () => {
      try {  
        const noSquads = cloneDeep(mockCurData);
        noSquads.squads[0].id = "testing";
        await getAllEntriesForSquad2(noSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");        
      }      
    });
    it("should throw error if valid id in squad, but not a squad id, in current data", async () => {
      try {  
        const noSquads = cloneDeep(mockCurData);
        noSquads.squads[0].id = userId;
        await getAllEntriesForSquad2(noSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");        
      }      
    });
    it("should throw error if valid id in squad, but not a squad id, in current data", async () => {
      try {  
        const noSquads = cloneDeep(mockCurData);
        noSquads.squads[0].id = null as any;
        await getAllEntriesForSquad2(noSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");        
      }      
    });
    it("should throw error if divs is null in current data", async () => {
      try {  
        const noDivs = cloneDeep(mockCurData);
        noDivs.divs = null as any;
        await getAllEntriesForSquad2(noDivs);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");        
      }      
    });
    it("should throw error if no divs in current data", async () => {
      try {  
        const noDivs = cloneDeep(mockCurData);
        noDivs.divs = [];
        await getAllEntriesForSquad2(noDivs);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");        
      }      
    });
    it("should throw error if pots is null in current data", async () => {
      try {  
        const noPots = cloneDeep(mockCurData);
        noPots.pots = null as any;
        await getAllEntriesForSquad2(noPots);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid pot data");        
      }      
    });
    it("should throw error if brkts is null in current data", async () => {
      try {  
        const noBrkts = cloneDeep(mockCurData);
        noBrkts.brkts = null as any;
        await getAllEntriesForSquad2(noBrkts);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid brkt data");        
      }      
    });
    it("should throw error if elims is null in current data", async () => {
      try {  
        const noElims = cloneDeep(mockCurData);
        noElims.elims = null as any;
        await getAllEntriesForSquad2(noElims);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid elim data");        
      }      
    });
  });

  describe('testingGetAllEntriesForSquad2', () => { 

    it('should get all entry data for a squad, Divs, Pots, Brkts, and Elims', async () => {
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      expect(Object.keys(allEntries[0])).toEqual([
        "player_id",
        "first_name",
        "last_name",
        "average",
        "lane",
        "position",
        "div_578834e04e5e4885bbae79229d8b96e8_fee",
        "div_578834e04e5e4885bbae79229d8b96e8_hdcp",
        "div_fe72ab97edf8407186c8e6df7f7fb741_fee",
        "div_fe72ab97edf8407186c8e6df7f7fb741_hdcp",
        "pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee",
        "pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee",
        "pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee",
        "pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee",
        "brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets",
        "brk_d017ea07dbc6453a8a705f4bb7599ed4_fee",
        "brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets",
        "brk_d027ea07dbc6453a8a705f4bb7599ed4_fee",
        "brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets",
        "brk_d037ea07dbc6453a8a705f4bb7599ed4_fee",
        "brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets",
        "brk_d047ea07dbc6453a8a705f4bb7599ed4_fee",
        "elm_c01077494c2d4d9da166d697c08c28d2_fee",
        "elm_c02077494c2d4d9da166d697c08c28d2_fee",
        "elm_c03077494c2d4d9da166d697c08c28d2_fee",
        "elm_c04077494c2d4d9da166d697c08c28d2_fee",
      ]);
    });

  })

  describe('getAllPlayersForSquad2', () => { 
    
    it("gets all players entries for a squad", async () => {
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      const players = getAllPlayersForSquad2(allEntries, mockSquadEntries.squadId);
      expect(players).not.toBeNull();
      if (!players) return;
      expect(players).toHaveLength(6);
      for (let i = 0; i < players.length; i++) {
        expect(players[i].id).toBe(mockSquadEntries.players[i].id);
        expect(players[i].squad_id).toBe(mockSquadEntries.squadId);
        expect(players[i].first_name).toBe(mockSquadEntries.players[i].first_name);
        expect(players[i].last_name).toBe(mockSquadEntries.players[i].last_name);
        expect(players[i].average).toBe(mockSquadEntries.players[i].average);
        expect(players[i].lane).toBe(mockSquadEntries.players[i].lane);
        expect(players[i].position).toBe(mockSquadEntries.players[i].position);
      }
    });
    it('should return empty array if no squad entries', async () => {
      const players = getAllPlayersForSquad2([], mockSquadEntries.squadId);
      expect(players).not.toBeNull();
      if (!players) return;
      expect(players).toHaveLength(0);
    })
    it('should return empty array when passed null for squad entries', async () => {
      const players = getAllPlayersForSquad2([], mockSquadEntries.squadId);
      expect(players).not.toBeNull();
      if (!players) return;
      expect(players).toHaveLength(0);
    })
  })

  describe('getAllDivEntriesForSquad2', () => { 
    it('should get all div entries for a squad', async () => {
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      const divs = getAllDivEntriesForSquad2(allEntries, mockCurData);
      expect(divs).not.toBeNull();
      if (!divs) return;
      expect(divs).toHaveLength(8);
      expect(Object.keys(divs[0])).toEqual([
        "id",
        "squad_id",
        "squad_id_err",
        "div_id",
        "div_id_err",
        "player_id",
        "player_id_err",
        "fee",
        "fee_err",
        "hdcp",
      ]);
      for (let i = 0; i < divs.length; i++) {
        expect(divs[i].squad_id_err).toBe("");
        expect(divs[i].div_id_err).toBe("");
        expect(divs[i].player_id_err).toBe("");
        expect(divs[i].fee_err).toBe("");
        expect(divs[i].id.startsWith('den')).toBeTruthy();
        expect(divs[i].squad_id).toBe(mockSquadEntries.divEntries[0].squad_id);
        expect(divs[i].player_id.startsWith('ply')).toBeTruthy();
        if (divs[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          divs[i].div_id === 'div_578834e04e5e4885bbae79229d8b96e8') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(0);
        } else if (divs[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          divs[i].div_id === 'div_fe72ab97edf8407186c8e6df7f7fb741') {
          expect(divs[i].fee).toBe('60');
          expect(divs[i].hdcp).toBe(15);
        } else if (divs[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          divs[i].div_id === 'div_578834e04e5e4885bbae79229d8b96e8') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(0);
        } else if (divs[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          divs[i].div_id === 'div_fe72ab97edf8407186c8e6df7f7fb741') {
          expect(divs[i].fee).toBe('60');
          expect(divs[i].hdcp).toBe(22);
        } else if (divs[i].player_id === 'ply_b830099ed18a4e9da06e345ec2320848' &&
          divs[i].div_id === 'div_578834e04e5e4885bbae79229d8b96e8') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(0);
        } else if (divs[i].player_id === 'ply_92670d50aa7f44a487a172412bef8af5' &&
          divs[i].div_id === 'div_fe72ab97edf8407186c8e6df7f7fb741') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(27);
        } else if (divs[i].player_id === 'ply_f57669391b4c4405a4a4e0f40284712f' &&
          divs[i].div_id === 'div_fe72ab97edf8407186c8e6df7f7fb741') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(31);
        } else if (divs[i].player_id === 'ply_9fff21de787b4637beb65a1936967071' &&
          divs[i].div_id === 'div_578834e04e5e4885bbae79229d8b96e8') {
          expect(divs[i].fee).toBe('80');
          expect(divs[i].hdcp).toBe(0);
        } else { 
          expect(true).toBeFalsy(); // should not get here
        }        
      }
    })
    it('should return empty array if no squad entries', async () => {
      const divs = getAllDivEntriesForSquad2([], mockCurData);
      expect(divs).not.toBeNull();
      if (!divs) return;
      expect(divs).toHaveLength(0);
    })
    it('should return empty array when passed null for squad entries', async () => {
      const divs = getAllDivEntriesForSquad2([], mockCurData);
      expect(divs).not.toBeNull();
      if (!divs) return;
      expect(divs).toHaveLength(0);
    })
  })

  describe('getAllPotEntriesForSquad2', () => { 
    it('should get all pot entries for a squad', async () => {
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      const pots = getAllPotEntriesForSquad2(allEntries, mockCurData);
      expect(pots).not.toBeNull();
      if (!pots) return;
      expect(pots).toHaveLength(8);
      expect(Object.keys(pots[0])).toEqual([
        "id",
        "pot_id",
        "pot_id_err",
        "player_id",
        "player_id_err",
        "fee",
        "fee_err",
      ]);
      for (let i = 0; i < pots.length; i++) {
        expect(pots[i].id.startsWith('pen')).toBeTruthy();
        expect(pots[i].pot_id_err).toBe("");
        expect(pots[i].player_id_err).toBe(""); 
        expect(pots[i].fee_err).toBe("");
        if (pots[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          pots[i].pot_id === 'pot_791fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('20');          
        } else if (pots[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          pots[i].pot_id === 'pot_781fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('10');          
        } else if (pots[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          pots[i].pot_id === 'pot_771fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('20');          
        } else if (pots[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          pots[i].pot_id === 'pot_761fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('10');          
        } else if (pots[i].player_id === 'ply_b830099ed18a4e9da06e345ec2320848' &&
          pots[i].pot_id === 'pot_791fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('20');          
        } else if (pots[i].player_id === 'ply_b830099ed18a4e9da06e345ec2320848' &&
          pots[i].pot_id === 'pot_781fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('10');          
        } else if (pots[i].player_id === 'ply_b830099ed18a4e9da06e345ec2320848' &&
          pots[i].pot_id === 'pot_771fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('20');          
        } else if (pots[i].player_id === 'ply_b830099ed18a4e9da06e345ec2320848' &&
          pots[i].pot_id === 'pot_761fb6d8a9a04cb4b3372e212da2a3b0') {
          expect(pots[i].fee).toBe('10');          
        } 
      }
    })
    it('should return empty array if no squad entries', async () => {
      const pots = getAllPotEntriesForSquad2([], mockCurData);
      expect(pots).not.toBeNull();
      if (!pots) return;
      expect(pots).toHaveLength(0);
    })
    it('should return empty array when passed null for squad entries', async () => {
      const pots = getAllPotEntriesForSquad2([], mockCurData);
      expect(pots).not.toBeNull();
      if (!pots) return;
      expect(pots).toHaveLength(0);
    })
  })

  describe('getAllBrktEntriesForSquad2', () => { 
    it('should get all bracket entries for a squad', async () => { 
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      const brkts = getAllBrktEntriesForSquad2(allEntries, mockCurData);
      expect(brkts).not.toBeNull();
      if (!brkts) return;
      expect(brkts).toHaveLength(8);
      expect(Object.keys(brkts[0])).toEqual([
        "id",
        "brkt_id",
        "player_id",
        "num_brackets",
        "num_refunds",
        "fee",
        "time_stamp",
      ]);
      for (let i = 0; i < brkts.length; i++) {
        expect(brkts[i].id.startsWith('ben')).toBeTruthy();
        expect(brkts[i].num_refunds).toBe(0);
        expect(brkts[i].time_stamp).toBeDefined();
        if (brkts[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          brkts[i].brkt_id === 'brk_d017ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(10);
          expect(brkts[i].fee).toBe('50');          
        } else if (brkts[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          brkts[i].brkt_id === 'brk_d027ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(10);
          expect(brkts[i].fee).toBe('50');          
        } else if (brkts[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          brkts[i].brkt_id === 'brk_d037ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(10);
          expect(brkts[i].fee).toBe('50');          
        } else if (brkts[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          brkts[i].brkt_id === 'brk_d047ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(10);
          expect(brkts[i].fee).toBe('50');          
        } else if (brkts[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          brkts[i].brkt_id === 'brk_d017ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(8);
          expect(brkts[i].fee).toBe('40');          
        } else if (brkts[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          brkts[i].brkt_id === 'brk_d027ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(8);
          expect(brkts[i].fee).toBe('40');          
        } else if (brkts[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          brkts[i].brkt_id === 'brk_d037ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(8);
          expect(brkts[i].fee).toBe('40');          
        } else if (brkts[i].player_id === 'ply_8ffe9406fcc046508aa4b214ef16f647' &&
          brkts[i].brkt_id === 'brk_d047ea07dbc6453a8a705f4bb7599ed4') {
          expect(brkts[i].num_brackets).toBe(8);
          expect(brkts[i].fee).toBe('40');          
        }
      }
    })
    it('should return empty array if no squad entries', async () => {
      const brkts = getAllBrktEntriesForSquad2([], mockCurData);
      expect(brkts).not.toBeNull();
      if (!brkts) return;
      expect(brkts).toHaveLength(0);
    })
    it('should return empty array when passed null for squad entries', async () => {
      const brkts = getAllBrktEntriesForSquad2([], mockCurData);
      expect(brkts).not.toBeNull();
      if (!brkts) return;
      expect(brkts).toHaveLength(0);
    })
  })

  describe('getAllElimEntriesForSquad2', () => { 
    it('should get all elimination entries for a squad', async () => { 
      const allEntries = await testingGetAllEntriesForSquad2(mockCurData);
      expect(allEntries).not.toBeNull();
      if (!allEntries) return;
      expect(allEntries.length).toBe(6);
      const elims = getAllElimEntriesForSquad2(allEntries, mockCurData);
      expect(elims).not.toBeNull();
      if (!elims) return;
      expect(elims).toHaveLength(8);
      expect(Object.keys(elims[0])).toEqual([
        "id",
        "elim_id",
        "elim_id_err",
        "player_id",
        "player_id_err",
        "fee",
        "fee_err",
      ]);
      for (let i = 0; i < elims.length; i++) {
        expect(elims[i].id.startsWith('een')).toBeTruthy();
        expect(elims[i].elim_id_err).toBe("");
        expect(elims[i].player_id_err).toBe("");
        expect(elims[i].fee_err).toBe("");
        expect(elims[i].fee).toBe("5");
        if (elims[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          elims[i].elim_id === 'elm_c01077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          elims[i].elim_id === 'elm_c02077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          elims[i].elim_id === 'elm_c03077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_da674926088d4f739c69c2c72a465ccd' &&
          elims[i].elim_id === 'elm_c04077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_9fff21de787b4637beb65a1936967071' &&
          elims[i].elim_id === 'elm_c01077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_9fff21de787b4637beb65a1936967071' &&
          elims[i].elim_id === 'elm_c02077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_f57669391b4c4405a4a4e0f40284712f' &&
          elims[i].elim_id === 'elm_c03077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else if (elims[i].player_id === 'ply_f57669391b4c4405a4a4e0f40284712f' &&
          elims[i].elim_id === 'elm_c04077494c2d4d9da166d697c08c28d2') {
          // nothing to check here
        } else { 
          expect(true).toBeFalsy(); // should not get here
        }
      }
    })
    it('should return empty array if no squad entries', async () => {
      const elims = getAllElimEntriesForSquad2([], mockCurData);
      expect(elims).not.toBeNull();
      if (!elims) return;
      expect(elims).toHaveLength(0);
    })
    it('should return empty array when passed null for squad entries', async () => {
      const elims = getAllElimEntriesForSquad2([], mockCurData);
      expect(elims).not.toBeNull();
      if (!elims) return;
      expect(elims).toHaveLength(0);
    })
  })

  describe('getBracketListForSquad', () => { 
    it('should get all bracket lists for a squad', async () => { 
      const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(mockCurData.squads[0].id);
      expect(oneBrktsAndSeeds).not.toBeNull();
      if (!oneBrktsAndSeeds) return;
      expect(oneBrktsAndSeeds).toHaveLength(3);
      const brktLists = getBracketListForSquad(oneBrktsAndSeeds);
      expect(brktLists).not.toBeNull();
      if (!brktLists) return;
      expect(brktLists).toHaveLength(1);
      expect(brktLists[0].brktId).toEqual('brk_d017ea07dbc6453a8a705f4bb7599ed4');              
    })
    it('should return empty array if passed null for squad entries', async () => {
      const brktLists = getBracketListForSquad(null as any);
      expect(brktLists).not.toBeNull();
      if (!brktLists) return;
      expect(brktLists).toHaveLength(0);
    })
    it('should return empty array if passed empty array for squad entries', async () => {
      const brktLists = getBracketListForSquad([] as oneBrktsAndSeedsType[]);
      expect(brktLists).not.toBeNull();
      if (!brktLists) return;
      expect(brktLists).toHaveLength(0);
    })
  })

  describe("postSquad", () => {
    const squadToPost = {
      ...initSquad,      
      squad_name: "Test Squad",
      event_id: "evt_c0b2bb31d647414a9bea003bd835f3a0",
      squad_date: startOfDayFromString("2022-08-21") as Date,
      squad_time: "02:00 PM",
      games: 6,
      lane_count: 24,
      starting_lane: 99,
      sort_order: 1,
    };

    let createdSquad = false;

    const deletePostedSquad = async () => {
      const response = await axios.get(url);
      const squads = response.data.squads;
      const toDel = squads.find(
        (s: squadType) => s.starting_lane === 99
      );
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: squadUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedSquad();
    });

    beforeEach(() => {
      createdSquad = false;
    });

    afterEach(async () => {
      if (createdSquad) {
        await deletePostedSquad();
      }
    });

    it("should post a squad", async () => {
      const postedSquad = await postSquad(squadToPost);
      expect(postedSquad).not.toBeNull();
      if (!postedSquad) return;
      createdSquad = true;
      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.squad_name).toBe(squadToPost.squad_name);
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_date_str).toBe(squadToPost.squad_date_str);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    });
    it("should post a sanitzed squad", async () => { 
      const toSanitize = cloneDeep(squadToPost);
      toSanitize.squad_name = '<script>' + 'Sanitized' + '</script>';
      const postedSquad = await postSquad(toSanitize);
      expect(postedSquad).not.toBeNull();
      if (!postedSquad) return;
      createdSquad = true;
      expect(postedSquad.id).toBe(squadToPost.id);
      expect(postedSquad.squad_name).toBe('Sanitized');
      expect(postedSquad.event_id).toBe(squadToPost.event_id);
      expect(postedSquad.squad_date_str).toBe(squadToPost.squad_date_str);
      expect(postedSquad.squad_time).toBe(squadToPost.squad_time);
      expect(postedSquad.games).toBe(squadToPost.games);
      expect(postedSquad.lane_count).toBe(squadToPost.lane_count);
      expect(postedSquad.starting_lane).toBe(squadToPost.starting_lane);
      expect(postedSquad.sort_order).toBe(squadToPost.sort_order);
    })
    it("should throw error and not post a squad with invalid data", async () => {
      try {
        const invalidSquad = cloneDeep(squadToPost);
        invalidSquad.squad_name = ""      
        await postSquad(invalidSquad);        
      } catch (err) {
          expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postSquad failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error and not post a squad with null", async () => {
      try {
        await postSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");
      }
    })
    it("should throw error and not post a squad with not an object", async () => {
      try {
        await postSquad("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");
      }
    })
  });

  describe("postManeySquads", () => {    
    let didPost = false;

    beforeAll(async () => {
      await deleteAllSquadsForTmnt(tmntId);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllSquadsForTmnt(tmntId);
      }
    });

    it("should post many squads", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      didPost = true;
      const postedSquads = await getAllSquadsForTmnt(tmntId);
      if (!postedSquads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedSquads.length).toBe(mockSquadsToPost.length);
      for (let i = 0; i < postedSquads.length; i++) {
        expect(postedSquads[i].id).toEqual(mockSquadsToPost[i].id);
        expect(postedSquads[i].event_id).toEqual(mockSquadsToPost[i].event_id);
        expect(postedSquads[i].squad_name).toEqual(
          mockSquadsToPost[i].squad_name
        );
        expect(postedSquads[i].squad_date_str).toEqual(
          mockSquadsToPost[i].squad_date_str
        );
        expect(postedSquads[i].squad_time).toEqual(
          mockSquadsToPost[i].squad_time
        );
        expect(postedSquads[i].games).toEqual(mockSquadsToPost[i].games);
        expect(postedSquads[i].lane_count).toEqual(
          mockSquadsToPost[i].lane_count
        );
        expect(postedSquads[i].starting_lane).toEqual(
          mockSquadsToPost[i].starting_lane
        );
        expect(postedSquads[i].sort_order).toEqual(
          mockSquadsToPost[i].sort_order
        );
      }
    });
    it("should post sanitzied values", async () => {
      const toSanitzie = [
        {
          ...mockSquadsToPost[0],
          squad_name: "    " + mockSquadsToPost[0].squad_name + "  ****  ",
        },
        {
          ...mockSquadsToPost[1],
          event_name: "<script>" + mockSquadsToPost[1].squad_name + "</script>",
        },
      ];
      const count = await postManySquads(toSanitzie);
      expect(count).toBe(toSanitzie.length);
      didPost = true;
      const postedSquads = await getAllSquadsForTmnt(tmntId);
      if (!postedSquads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedSquads.length).toBe(toSanitzie.length);
      if (postedSquads[0].id === toSanitzie[0].id) {
        expect(postedSquads[0].squad_name).toEqual(
          mockSquadsToPost[0].squad_name
        );
        expect(postedSquads[1].squad_name).toEqual(
          mockSquadsToPost[1].squad_name
        );
      } else {
        expect(postedSquads[0].squad_name).toEqual(
          mockSquadsToPost[1].squad_name
        );
        expect(postedSquads[1].squad_name).toEqual(
          mockSquadsToPost[0].squad_name
        );
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManySquads([]);
      expect(count).toBe(0);
    });
    it("should throw error when invalid squad id in first item", async () => {
      try {
        const invalidSquads = cloneDeep(mockSquadsToPost);
        invalidSquads[0].id = "test";
        await postManySquads(invalidSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data at index 0");
      }
    });
    it("should throw error when invalid squad id in second item", async () => {
      try {
        const invalidSquads = cloneDeep(mockSquadsToPost);
        invalidSquads[1].id = "test";
        await postManySquads(invalidSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data at index 1");
      }
    });
    it("should throw error when invalid squad data in first item", async () => {
      try {
        const invalidSquads = cloneDeep(mockSquadsToPost);
        invalidSquads[0].games = -1;
        await postManySquads(invalidSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data at index 0");
      }
    });
    it("should throw error when invalid squad id in second item", async () => {
      try {
        const invalidSquads = cloneDeep(mockSquadsToPost);
        invalidSquads[1].lane_count = -1;
        await postManySquads(invalidSquads);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data at index 1");
      }
    });
    it("should throw error when passed an non array", async () => {
      try {
        await postManySquads("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squads data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManySquads(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squads data");
      }
    });
  });

  describe("putSquad", () => {
    const squadToPut = {
      ...initSquad,
      id: "sqd_7116ce5f80164830830a7157eb093396",
      event_id: "evt_cb97b73cb538418ab993fc867f860510",
      squad_name: "Test Squad",
      squad_date: startOfDayFromString("2022-11-23") as Date,
      squad_time: "02:00 PM",
      games: 5,
      lane_count: 14,
      starting_lane: 29,
      sort_order: 1,
    };

    const putUrl = squadUrl + squadToPut.id;

    const resetSquad = {
      ...initSquad,
      id: "sqd_7116ce5f80164830830a7157eb093396",
      event_id: "evt_cb97b73cb538418ab993fc867f860510",
      squad_name: "Squad 1",
      squad_date: startOfDayFromString("2022-10-23") as Date,
      squad_time: null,
      games: 6,
      lane_count: 12,
      starting_lane: 29,
      sort_order: 1,
    };

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

    it("should put a squad", async () => {
      const puttedSquad = await putSquad(squadToPut);
      expect(puttedSquad).not.toBeNull();
      if (!puttedSquad) return;
      didPut = true;
      expect(puttedSquad.id).toEqual(squadToPut.id);
      expect(puttedSquad.event_id).toEqual(squadToPut.event_id);
      expect(puttedSquad.squad_name).toEqual(squadToPut.squad_name);
      expect(puttedSquad.squad_date_str).toEqual(squadToPut.squad_date_str);
      expect(puttedSquad.squad_time).toEqual(squadToPut.squad_time);
      expect(puttedSquad.games).toEqual(squadToPut.games);
      expect(puttedSquad.lane_count).toEqual(squadToPut.lane_count);
      expect(puttedSquad.starting_lane).toEqual(squadToPut.starting_lane);
      expect(puttedSquad.sort_order).toEqual(squadToPut.sort_order);
    });
    it("should put a sanitizedsquad", async () => {
      const toSanitize = cloneDeep(squadToPut);
      toSanitize.squad_name = "  ***  Testing  ***  ";
      const puttedSquad = await putSquad(toSanitize);
      expect(puttedSquad).not.toBeNull();
      if (!puttedSquad) return;
      didPut = true;
      expect(puttedSquad.id).toEqual(toSanitize.id);
      expect(puttedSquad.event_id).toEqual(toSanitize.event_id);
      expect(puttedSquad.squad_name).toEqual('Testing');
      expect(puttedSquad.squad_date_str).toEqual(toSanitize.squad_date_str);
      expect(puttedSquad.squad_time).toEqual(toSanitize.squad_time);
      expect(puttedSquad.games).toEqual(toSanitize.games);
      expect(puttedSquad.lane_count).toEqual(toSanitize.lane_count);
      expect(puttedSquad.starting_lane).toEqual(toSanitize.starting_lane);
      expect(puttedSquad.sort_order).toEqual(toSanitize.sort_order);
    });
    it("should thorw error when trying to put a squad with invalid squad id", async () => {
      try {
        const invalidSquad = cloneDeep(squadToPut);
        invalidSquad.id = "test";
        await putSquad(invalidSquad);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");
      }
    });
    it("should thorw error when trying to put a squad with invalid data", async () => {
      try {
        const invalidSquad = cloneDeep(squadToPut);
        invalidSquad.lane_count = 1234567890;
        await putSquad(invalidSquad);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putSquad failed: Request failed with status code 422"
        );
      }
    });
    it("should thorw error when trying to put a squad when passed null", async () => {
      try {        
        await putSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");
      }
    });
    it("should thorw error when trying to put a squad when passed non object", async () => {
      try {
        await putSquad("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad data");
      }
    });
  });

  describe("replaceManySquads()", () => {    
    let createdSquads = false;

    const rmTmntId = "tmt_467e51d71659d2e412cbc64a0d19ecb4";

    beforeAll(async () => {
      await deleteAllSquadsForTmnt(rmTmntId);
    });

    beforeEach(() => {
      createdSquads = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdSquads) {
        await deleteAllSquadsForTmnt(rmTmntId);
      }
    });

    it("should update, insert, delete many squads", async () => {
      const toInsert: squadType[] = [
        {
          ...initSquad,    
          id: 'sqd_00124199328447f8bbe95c05e1b84645', 
          squad_name: 'Afternoon',
          event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",    
          squad_date_str: '2022-08-01',
          squad_time: '01:00 PM',
          games: 6,
          lane_count: 14, 
          starting_lane: 11,
          sort_order: 3,
        },
        {
          ...initSquad,    
          id: 'sqd_00224199328447f8bbe95c05e1b84646', 
          squad_name: 'Evening',
          event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
          squad_date_str: '2022-08-01',
          squad_time: '06:00 PM',
          games: 6,
          lane_count: 16, 
          starting_lane: 1,
          sort_order: 4,
        },
      ];

      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],
          squad_time: '08:00 AM',
          squad_name: 'Morning',
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManySquads(squadsToUpdate, rmTmntId);
      expect(replaceCount).toBe(squadsToUpdate.length);
      const replacedSquads = await getAllSquadsForTmnt(rmTmntId);
      if (!replacedSquads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedSquads.length).toEqual(squadsToUpdate.length);
      for (let i = 0; i < replacedSquads.length; i++) {
        expect(replacedSquads[i].event_id).toEqual(squadsToUpdate[i].event_id);
        expect(replacedSquads[i].squad_date_str).toEqual(
          squadsToUpdate[i].squad_date_str
        );
        expect(replacedSquads[i].games).toEqual(squadsToUpdate[i].games);
        if (replacedSquads[i].id === squadsToUpdate[0].id) {
          expect(replacedSquads[i].squad_name).toEqual(
            squadsToUpdate[0].squad_name
          );
          expect(replacedSquads[i].squad_time).toEqual(
            squadsToUpdate[0].squad_time
          );
          expect(replacedSquads[i].lane_count).toEqual(
            squadsToUpdate[0].lane_count
          );
          expect(replacedSquads[i].starting_lane).toEqual(
            squadsToUpdate[0].starting_lane
          );
          expect(replacedSquads[i].sort_order).toEqual(
            squadsToUpdate[0].sort_order
          );
        } else if (replacedSquads[i].id === squadsToUpdate[1].id) {
          expect(replacedSquads[i].squad_name).toEqual(
            squadsToUpdate[1].squad_name
          )
          expect(replacedSquads[i].squad_time).toEqual(
            squadsToUpdate[1].squad_time
          )
          expect(replacedSquads[i].lane_count).toEqual(
            squadsToUpdate[1].lane_count
          )
          expect(replacedSquads[i].starting_lane).toEqual(
            squadsToUpdate[1].starting_lane
          )
          expect(replacedSquads[i].sort_order).toEqual(
            squadsToUpdate[1].sort_order
          )
        } else if (replacedSquads[i].id === squadsToUpdate[2].id) {
          expect(replacedSquads[i].squad_name).toEqual(
            squadsToUpdate[2].squad_name
          )
          expect(replacedSquads[i].squad_time).toEqual(
            squadsToUpdate[2].squad_time
          )
          expect(replacedSquads[i].lane_count).toEqual(
            squadsToUpdate[2].lane_count
          )
          expect(replacedSquads[i].starting_lane).toEqual(
            squadsToUpdate[2].starting_lane
          )
          expect(replacedSquads[i].sort_order).toEqual(
            squadsToUpdate[2].sort_order
          )
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many squads - sanitized squad names", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],
          squad_name: "<script>alert(1)</script>",
          last_name: "    abcdef***",
        },
        {
          ...mockSquadsToPost[1],
        },
      ];

      const replaceCount = await replaceManySquads(squadsToUpdate, rmTmntId);
      expect(replaceCount).toBe(squadsToUpdate.length);
      const replacedSquads = await getAllSquadsForTmnt(rmTmntId);
      if (!replacedSquads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedSquads.length).toEqual(squadsToUpdate.length);
      for (let i = 0; i < replacedSquads.length; i++) {
        expect(replacedSquads[i].event_id).toEqual(squadsToUpdate[i].event_id);
        expect(replacedSquads[i].squad_date_str).toEqual(
          squadsToUpdate[i].squad_date_str
        );
        expect(replacedSquads[i].games).toEqual(squadsToUpdate[i].games);
        if (replacedSquads[i].id === squadsToUpdate[0].id) {
          expect(replacedSquads[i].squad_name).toEqual('alert1');
          expect(replacedSquads[i].squad_time).toEqual(
            squadsToUpdate[0].squad_time
          );
          expect(replacedSquads[i].lane_count).toEqual(
            squadsToUpdate[0].lane_count
          );
          expect(replacedSquads[i].starting_lane).toEqual(
            squadsToUpdate[0].starting_lane
          );
          expect(replacedSquads[i].sort_order).toEqual(
            squadsToUpdate[0].sort_order
          );
        } else if (replacedSquads[i].id === squadsToUpdate[1].id) {
          expect(replacedSquads[i].squad_name).toEqual(
            squadsToUpdate[1].squad_name
          )
          expect(replacedSquads[i].squad_time).toEqual(
            squadsToUpdate[1].squad_time
          )
          expect(replacedSquads[i].lane_count).toEqual(
            squadsToUpdate[1].lane_count
          )
          expect(replacedSquads[i].starting_lane).toEqual(
            squadsToUpdate[1].starting_lane
          )
          expect(replacedSquads[i].sort_order).toEqual(
            squadsToUpdate[1].sort_order
          )
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const replaceCount = await replaceManySquads([], rmTmntId);
      expect(replaceCount).toBe(0);
      const replacedSquads = await getAllSquadsForTmnt(rmTmntId);
      if (!replacedSquads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedSquads.length).toEqual(0);
    });
    it("should throw an error for invalid squad ID in first item", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],
          id: "",
        },
        {
          ...mockSquadsToPost[1],
        },
      ];
      await expect(
        replaceManySquads(squadsToUpdate, rmTmntId)
      ).rejects.toThrow("Invalid squad data at index 0");
    });
    it("should throw an error for invalid squad ID in second item", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],          
        },
        {
          ...mockSquadsToPost[1],
          id: "",
        },
      ];
      await expect(
        replaceManySquads(squadsToUpdate, rmTmntId)
      ).rejects.toThrow("Invalid squad data at index 1");
    });
    it("should throw an error for invalid squad data in first item", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],
          games: -1,
        },
        {
          ...mockSquadsToPost[1],
        },
      ];
      await expect(
        replaceManySquads(squadsToUpdate, rmTmntId)
      ).rejects.toThrow("Invalid squad data at index 0");
    });
    it("should throw an error for invalid squad data in second item", async () => {
      const count = await postManySquads(mockSquadsToPost);
      expect(count).toBe(mockSquadsToPost.length);
      createdSquads = true;
      const squads = await getAllSquadsForTmnt(rmTmntId);
      if (!squads) {
        expect(true).toBeFalsy();
        return;
      }
      expect(squads.length).toEqual(mockSquadsToPost.length);

      const squadsToUpdate = [
        {
          ...mockSquadsToPost[0],          
        },
        {
          ...mockSquadsToPost[1],
          starting_lane: -1,
        },
      ];
      await expect(
        replaceManySquads(squadsToUpdate, rmTmntId)
      ).rejects.toThrow("Invalid squad data at index 1");
    });
    it("should throw an error if passed null as squads", async () => {
      await expect(replaceManySquads(null as any, rmTmntId)).rejects.toThrow(
        "Invalid squads"
      );
    });
    it("should throw an error if squads is not an array", async () => {
      await expect(
        replaceManySquads("not-an-array" as any, rmTmntId)
      ).rejects.toThrow("Invalid squads");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManySquads(mockSquadsToPost, null as any)
      ).rejects.toThrow("Invalid tmnt id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManySquads(mockSquadsToPost, "test")
      ).rejects.toThrow("Invalid tmnt id");
    });
    it("should throw an error if passed valid id, but not tmnt id", async () => {
      await expect(
        replaceManySquads(mockSquadsToPost, userId)
      ).rejects.toThrow("Invalid tmnt id");
    });
  });

  describe("deleteSquad", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initSquad,
      id: "sqd_3397da1adc014cf58c44e07c19914f72",
      event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      squad_name: "Squad 3",
      squad_date: startOfDayFromString("2023-09-16") as Date,
      squad_time: "02:00 PM",
      games: 6,
      lane_count: 24,
      starting_lane: 1,
      sort_order: 3,
    };
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
    it("should throw error when trying to delete a squad when ID is not found", async () => {
      try {
        await deleteSquad(nonFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteSquad failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete a squad when id is invalid", async () => {
      try {
        await deleteSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when trying to delete a squad when id is valid, but not a squad id", async () => {
      try {
        await deleteSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when trying to delete a squad when id is null", async () => {
      try {
        await deleteSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllSquadsForEvent", () => {
    const multiSquads = [...mockSquadsToPost];

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
      await deleteAllSquadsForEvent(multiSquads[0].event_id);
    });

    it("should delete all squads for an event", async () => {
      const deleted = await deleteAllSquadsForEvent(multiSquads[0].event_id);
      expect(deleted).toBe(2);
      didDel = true;
    });
    it("should NOT delete all squads for an event when ID is not found", async () => {
      const deleted = await deleteAllSquadsForEvent(notFoundEventId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all squads for an event when event id is invalid", async () => {
      try {
        await deleteAllSquadsForEvent("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
    it("should throw error when trying to delete all squads for an event when event id is valid, but not an event id", async () => {
      try {
        await deleteAllSquadsForEvent(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
    it("should throw error when trying to delete all squads for an event when event id is null", async () => {
      try {
        await deleteAllSquadsForEvent(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid event id");
      }
    });
  });

  describe("deleteAllSquadsForTmnt", () => {

    let didDel = false;

    beforeAll(async () => {
      await postManySquads(mockSquadsToPost);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      await postManySquads(mockSquadsToPost);
    });

    afterAll(async () => {
      await deleteAllSquadsForEvent(mockSquadsToPost[0].event_id);
    });

    it("should delete all squads for a tmnt", async () => {
      const deleted = await deleteAllSquadsForTmnt(tmntId);
      didDel = true;
      expect(deleted).toBe(mockSquadsToPost.length);
    });
    it("should throw an error when tmnt id is invalid", async () => {
      try {
        await deleteAllSquadsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllSquadsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is null", async () => {
      try {
        await deleteAllSquadsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
