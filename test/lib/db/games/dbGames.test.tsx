import { privateApi } from "@/lib/api/axios";
import { baseBowlsApi, baseEventsApi, baseGamesApi, basePlayersApi, baseSquadsApi, baseTmntsApi, baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi, testBaseEventsApi, testBaseGamesApi, testBasePlayersApi, testBaseSquadsApi, testBaseTmntsApi, testBaseUsersApi } from "../../../testApi";
import { getAllGamesForSquad, upsertAllGamesForSquad } from "@/lib/db/games/dbGames";
import { mockBowl, mockGames, mockTmntFullData, mockUser, squadId1, userId } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { maxGames, maxScore } from "@/lib/validation/constants";

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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseGamesApi
  ? testBaseGamesApi
  : baseGamesApi;

const userBaseUrl = process.env.NODE_ENV === "test" && testBaseUsersApi
  ? testBaseUsersApi
  : baseUsersApi;  
const mockUserUrl = userBaseUrl + "/user/";

const tmntBaseUrl = process.env.NODE_ENV === "test" && testBaseTmntsApi
  ? testBaseTmntsApi
  : baseTmntsApi;  
const mockTmntUrl = tmntBaseUrl + "/tmnt/";

const bowlBaseUrl = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;  
const mockBowlUrl = bowlBaseUrl + "/bowl/";

const squadBaseUrl = process.env.NODE_ENV === "test" && testBaseSquadsApi
  ? testBaseSquadsApi
  : baseSquadsApi;

const eventBaseUrl = process.env.NODE_ENV === "test" && testBaseEventsApi
  ? testBaseEventsApi
  : baseEventsApi;

const playersBaseUrl = process.env.NODE_ENV === "test" && testBasePlayersApi
  ? testBasePlayersApi
  : basePlayersApi;

const tmntId = 'tmt_00000000000000000000000000000000';
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundplayerId = "ply_01234567890123456789012345678901";
const squad2Id = 'sqd_1a6c885ee19a49489960389193e8f819'; // from prisma\seed.ts

describe('dbGames', () => { 

  describe('getAllGamesForSquad', () => { 
    const squadId = "sqd_7116ce5f80164830830a7157eb093396";

    it('should return an array of games', async () => { 
      const games = await getAllGamesForSquad(squadId);
      expect(games).toBeDefined();
      if (!games) return      
      expect(games.length).toBe(18);
      games.forEach((game) => {
        expect(game.squad_id).toBe(squadId);        
      })
    })
    it('should return an empty array if squad has no games', async () => { 
      const noGamesSquadId = 'sqd_42be0f9d527e4081972ce8877190489d';
      const games = await getAllGamesForSquad(noGamesSquadId);
      expect(games).toBeDefined();
      if (!games) return
      expect(games.length).toBe(0);
    })
    it('should return an empty array if squad not found', async () => {       
      const games = await getAllGamesForSquad(notFoundSquadId);
      expect(games).toBeDefined();
      if (!games) return
      expect(games.length).toBe(0);
    })
    it('should throw error if squadId is invalid', async () => { 
      try { 
        await getAllGamesForSquad("invalidId");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should return null if squadId is valid, but not a squad id', async () => { 
      try { 
        await getAllGamesForSquad(tmntId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should return null if squadId is null', async () => { 
      try { 
        await getAllGamesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should return an empty array if squad has no games', async () => {       
      const games = await getAllGamesForSquad(notFoundSquadId);
      expect(games).toBeDefined();
      if (!games) return
      expect(games.length).toBe(0);
    })
  })

  describe('upsertAllGamesForSquad', () => { 

    beforeAll(async () => {
      try {
        // remove any old mock data
        let tmntId = mockTmntFullData.tmnt.id;          
        await privateApi.delete(mockTmntUrl + tmntId);
        
        let bowlId = mockBowl.id;        
        await privateApi.delete(mockBowlUrl + bowlId);

        let userId = mockUser.id;        
        await privateApi.delete(mockUserUrl + userId);

        // add mock data
        const userJSON = JSON.stringify(mockUser);
        let response = await privateApi.post(userBaseUrl, userJSON);

        const bowlJSON = JSON.stringify(mockBowl);        
        response = await privateApi.post(bowlBaseUrl, bowlJSON);

        const tmntJSON = JSON.stringify(mockTmntFullData.tmnt);
        response = await privateApi.post(tmntBaseUrl, tmntJSON);        

        const eventJSON = JSON.stringify(mockTmntFullData.events[0]);
        response = await privateApi.post(eventBaseUrl, eventJSON);        

        const squadJSON = JSON.stringify(mockTmntFullData.squads[0]);
        response = await privateApi.post(squadBaseUrl, squadJSON);      
        
        // upserts many players
        const playersJSON = JSON.stringify(mockTmntFullData.players);
        response = await privateApi.put(playersBaseUrl, playersJSON);
        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    afterEach(async () => {
      try {
        // remove any old mock data
        let tmntId = mockTmntFullData.tmnt.id;          
        let response = await privateApi.delete(mockTmntUrl + tmntId);
        
        let bowlId = mockBowl.id;        
        response = await privateApi.delete(mockBowlUrl + bowlId);

        let userId = mockUser.id;        
        response = await privateApi.delete(mockUserUrl + userId);

      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should upsert all games for a squad', async () => { 
      const games = await upsertAllGamesForSquad(squadId1, mockGames);
      expect(games).toBeDefined();
      if (!games) return
      expect(games).toHaveLength(mockGames.length);
    })

    it('should not upsert all games for a squad when squadId is invalid', async () => { 
      try {
        await upsertAllGamesForSquad('invalid', mockGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Invalid squad id");
      }
    })
    it('should not upsert all games for a squad when squadId is null', async () => {       
      try {
        await upsertAllGamesForSquad(null as any, mockGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Invalid squad id");
      }
    })
    it('should not upsert all games for a squad when squadId is valid, but not a squad id', async () => { 
      try {
        await upsertAllGamesForSquad(userId, mockGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Invalid squad id");
      }
    })
    it('should not upsert all games for a squad when squadId is valid, but does not appear in games', async () => { 
      try {
        await upsertAllGamesForSquad(notFoundSquadId, mockGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })

    it('should not upsert all games for a squad when game data has invalid id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].id = 'invalid';
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has missing id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].id = null as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }      
    })
    it('should not upsert all games for a squad when game data id, but not a valid game id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].id = userId;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has invalid squad_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].squad_id = 'invalid';
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })
    it('should not upsert all games for a squad when game data has missing squad_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].squad_id = null as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })
    it('should not upsert all games for a squad when game data has squad id, but not a valid squad id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].squad_id = userId;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })
    it('should not upsert all games for a squad when game data has valid but not found squad_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].squad_id = notFoundSquadId;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })
    it('should not upsert all games for a squad when game data has more than 1 squad id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].squad_id = squad2Id;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: All games must have passed squad id");
      }
    })
    it('should not upsert all games for a squad when game data has invalid player_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].player_id = 'invalid';
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has missing player_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].player_id = null as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has player id, but not a valid player id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].player_id = userId;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has valid but not found player_id', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].player_id = notFoundplayerId;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 409");
      }
    })
    it('should not upsert all games for a squad when game data has game_num too low', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].game_num = 0;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has game_num too high', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].game_num = maxGames + 1;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has missing game_num', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].game_num = null as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has game_num not a number', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].game_num = 'invalid' as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has game_num not an integer', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].game_num = 1.1;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has score too low', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].score = -1;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has score too high', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].score = maxScore + 1;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has missing score', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].score = null as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has score not a number', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].score = 'invalid' as any;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
    it('should not upsert all games for a squad when game data has score not an integer', async () => { 
      const invalidGames = cloneDeep(mockGames);
      invalidGames[1].score = 1.1;
      try {
        await upsertAllGamesForSquad(squadId1, invalidGames);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("upsertAllGamesForSquad failed: Request failed with status code 404");
      }
    })
  })
})