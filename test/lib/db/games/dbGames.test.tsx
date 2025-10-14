import { baseGamesApi } from "@/lib/db/apiPaths";
import { testBaseGamesApi } from "../../../testApi";
import { getAllGamesForSquad } from "@/lib/db/games/dbGames";

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

const url = testBaseGamesApi.startsWith("undefined")
  ? baseGamesApi
  : testBaseGamesApi;   

const tmntId = 'tmt_00000000000000000000000000000000';
const squadNotFoundId = 'sqd_00000000000000000000000000000000';

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
      const games = await getAllGamesForSquad(squadNotFoundId);
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
      const games = await getAllGamesForSquad(squadNotFoundId);
      expect(games).toBeDefined();
      if (!games) return
      expect(games.length).toBe(0);
    })
  })
})