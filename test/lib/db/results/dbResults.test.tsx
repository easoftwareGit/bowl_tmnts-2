import { baseResultsApi } from "@/lib/db/apiPaths";
import { testBaseResultsApi } from "../../../testApi";
import { getGameResultsForDiv, getGameResultsForTmnt } from "@/lib/db/results/dbResults";

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

const url = testBaseResultsApi.startsWith("undefined")
  ? baseResultsApi
  : testBaseResultsApi; 

// const divUrl = url + "/games/div/";  
// const tmntUrl = url + "/games/tmnt/";  

const notFoundDivId = "div_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe("dbResults", () => {

  describe('getGameResultsForDiv', () => { 

    const divIdNoHdcp = 'div_578834e04e5e4885bbae79229d8b96e8';
    const divIdHdcp = 'div_fe72ab97edf8407186c8e6df7f7fb741'   

    it('should return game results for div - scratch', async () => { 
      const results = await getGameResultsForDiv(divIdNoHdcp);
      expect(results).toBeDefined();
      if (!results) return
      const games = results as any[];

      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBe(3); // 3 players
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('full_name');
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');

      expect(games[0].hdcp).toBe(0);
      expect(games[0]['Game 1']).toBe(games[0]['Game 1 + Hdcp']);
      expect(games[0].total).toBe(games[0]['total + Hdcp']);      
    })
    it('should return game results for div - hdcp', async () => { 
      const results = await getGameResultsForDiv(divIdHdcp);
      expect(results).toBeDefined();
      if (!results) return
      const games = results as any[];
      
      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBe(3); // 3 players
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('full_name');
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');

      expect(games[0].hdcp).toBeGreaterThan(0);
      expect(Number.isInteger(games[0].hdcp)).toBe(true);
      expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
      expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
    })
    it('should return empty game results for div with no games', async () => { 
      const divIdNoGames = 'div_18997d3fd7ef4eb7ad2b53a9e93f9ce5'
      const games = await getGameResultsForDiv(divIdNoGames);
      expect(games).toBeDefined();
      if (!games) return      
      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBe(0);
    })
    it('should return empty game results for div with not in database', async () => {       
      const games = await getGameResultsForDiv(notFoundDivId);
      expect(games).toBeDefined();
      if (!games) return      
      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBe(0);
    })
    it('should throw error if div id is invalid', async () => { 
      try {
        await getGameResultsForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error if div id is valid, but not a div id', async () => { 
      try {
        await getGameResultsForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should return null if div id is null', async () => { 
      try {
        await getGameResultsForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
  })

  describe('getGameResultsForTmnt', () => {

    const tmntIdMultiDivs = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
    const tmntIdOneDiv = 'tmt_fd99387c33d9c78aba290286576ddce5';

    it('should return game results for div', async () => {
      const results = await getGameResultsForTmnt(tmntIdMultiDivs);
      expect(results).toBeDefined();
      if (!results) return
      const games = results as any[];

      expect(games.length).toBe(6); // 3 players, 2 divs
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('div_id');
      expect(games[0]).toHaveProperty('div_name');
      expect(games[0]).toHaveProperty('sort_order');
      expect(games[0]).toHaveProperty('full_name');
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');
      
      expect(Number.isInteger(games[0].hdcp)).toBe(true);
      expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
      expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
    })
    it('should return game results for div', async () => {
      const results = await getGameResultsForTmnt(tmntIdOneDiv);
      expect(results).toBeDefined();
      if (!results) return
      const games = results as any[];

      expect(games.length).toBe(3); // 3 players, 1 div
      expect(games[0]).toHaveProperty('player_id');
      expect(games[0]).toHaveProperty('div_id');
      expect(games[0]).toHaveProperty('div_name');
      expect(games[0]).toHaveProperty('sort_order');
      expect(games[0]).toHaveProperty('full_name');
      expect(games[0]).toHaveProperty('average');
      expect(games[0]).toHaveProperty('hdcp');
      expect(games[0]).toHaveProperty('Game 1');
      expect(games[0]).toHaveProperty('Game 1 + Hdcp');
      expect(games[0]).toHaveProperty('Game 2');
      expect(games[0]).toHaveProperty('Game 2 + Hdcp');
      expect(games[0]).toHaveProperty('Game 3');
      expect(games[0]).toHaveProperty('Game 3 + Hdcp');
      expect(games[0]).toHaveProperty('Game 4');
      expect(games[0]).toHaveProperty('Game 4 + Hdcp');
      expect(games[0]).toHaveProperty('Game 5');
      expect(games[0]).toHaveProperty('Game 5 + Hdcp');
      expect(games[0]).toHaveProperty('Game 6');
      expect(games[0]).toHaveProperty('Game 6 + Hdcp');
      expect(games[0]).toHaveProperty('total');
      expect(games[0]).toHaveProperty('total + Hdcp');
      
      expect(games[0].hdcp).toBe(0);
      expect(Number.isInteger(games[0].hdcp)).toBe(true);
      expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
      expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
    })
    it('should return empty game results for tmnt with not in database', async () => { 
      const noGamesSquadId = 'tmt_01234567890123456789012345678901';
      const games = await getGameResultsForTmnt(noGamesSquadId);
      expect(games).toBeDefined();
      if (!games) return      
      expect(games).toBeInstanceOf(Array);
      expect(games.length).toBe(0);
    })
    it('should throw error if tmnt id is invalid', async () => { 
      try {
        await getGameResultsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if tmnt id is valid, but not a tmnt id', async () => { 
      try {
        await getGameResultsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error if tmnt id is null', async () => { 
      try {
        await getGameResultsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })

  })

});