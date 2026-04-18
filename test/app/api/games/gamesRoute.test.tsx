import axios, { AxiosError } from "axios";
import { baseGamesApi  } from "@/lib/api/apiPaths";
import { testBaseGamesApi } from "../../../testApi";
import type { gameType } from "@/lib/types/types";
import { initGame } from "@/lib/db/initVals";
import { isValidBtDbId } from "@/lib/validation/validation";
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

const oneGameUrl = url + "/game/";
const squadUrl = url + "/squad/";

const notFoundId = "gam_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const squad2Id = 'sqd_1a6c885ee19a49489960389193e8f819';
const player2Id = 'ply_aa6c885ee19a49489960389193e8f819';

const testGame: gameType = {
  ...initGame,
  id: 'gam_99ea810b452843018f3f1db5139ffa72',
  squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
  player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
  game_num: 1,
  score: 201,
}

const gameToPost: gameType = {
  ...initGame,
  id: "gam_1234567890abcdef1234567890abcdef",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
  game_num: 11,
  score: 292,
}


const deletePostedGame = async (id: string) => { 
  try {
    await axios.delete(oneGameUrl + id, { withCredentials: true });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);    
  }
}

const resetGame = async () => { 
  // make sure test game is reset in database
  const gameJSON = JSON.stringify(testGame);
  await axios.put(oneGameUrl + testGame.id, gameJSON, { withCredentials: true });
}

describe('Games - API: /api/games', () => { 

  const blankGame = {
    id: testGame.id,
    squad_id: testGame.squad_id,
    player_id: testGame.player_id,
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedGame(gameToPost.id);
    })

    it('should get all games', async () => {
      const response = await axios.get(url);
      const games = response.data.games;
      // 61 rows in prisma/seed.ts
      expect(games.length).toBe(61);
    })
  })

  describe('GET by id - API: /api/games/game/:id', () => {

    beforeAll(async () => {
      await deletePostedGame(gameToPost.id);
    })

    it('should get game by id', async () => { 
      const response = await axios.get(oneGameUrl + testGame.id);
      expect(response.status).toBe(200);
      const game = response.data.game;
      expect(game.id).toBe(testGame.id);
      expect(game.squad_id).toBe(testGame.squad_id);
      expect(game.player_id).toBe(testGame.player_id);      
      expect(game.game_num).toBe(testGame.game_num);
      expect(game.score).toBe(testGame.score);
    })
    it('should NOT get game by id when ID is invalid', async () => { 
      try {
        const response = await axios.get(oneGameUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get game by id when ID is not found', async () => { 
      try {
        const response = await axios.get(oneGameUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })  
    it('should NOT get game by id when ID is valid, but not a game ID', async () => { 
      try {
        const response = await axios.get(oneGameUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  })

  describe('GET all games for squad API: /api/games/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedGame(gameToPost.id);
    })

    const squadId = 'sqd_7116ce5f80164830830a7157eb093396'

    it('should get all games for squad', async () => { 
      const response = await axios.get(squadUrl + squadId);
      const games = response.data.games;
      expect(games.length).toBe(18);
      for (let i = 0; i < games.length; i++) {
        expect(games[i].squad_id).toBe(squadId)        
      }
    })
    it('should NOT get all games for a squad when ID is invalid', async () => { 
      try {
        const response = await axios.get(squadUrl + 'invalid');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all games for a squad when ID is valid, but not a squad id', async () => { 
      try {
        const response = await axios.get(squadUrl + userId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return empty array when squad is not found', async () => { 
      const response = await axios.get(squadUrl + notFoundSquadId);
      const games = response.data.games;
      expect(games.length).toBe(0); 
    })
  })

  // describe('GET all games for div API: /api/games/div/:divId', () => { 
  //   beforeAll(async () => {
  //     await deletePostedGame();
  //   })

  //   it('should get all games for div - NO HDCP', async () => { 
  //     const response = await axios.get(divUrl + divId);
  //     const games = response.data.games;
  //     expect(games.length).toBe(3); // 3 players
  //     expect(games[0]).toHaveProperty('player_id');
  //     expect(games[0]).toHaveProperty('full_name');
  //     expect(games[0]).toHaveProperty('average');
  //     expect(games[0]).toHaveProperty('hdcp');
  //     expect(games[0]).toHaveProperty('Game 1');
  //     expect(games[0]).toHaveProperty('Game 1 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 2');
  //     expect(games[0]).toHaveProperty('Game 2 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 3');
  //     expect(games[0]).toHaveProperty('Game 3 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 4');
  //     expect(games[0]).toHaveProperty('Game 4 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 5');
  //     expect(games[0]).toHaveProperty('Game 5 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 6');
  //     expect(games[0]).toHaveProperty('Game 6 + Hdcp');
  //     expect(games[0]).toHaveProperty('total');
  //     expect(games[0]).toHaveProperty('total + Hdcp');

  //     expect(games[0].hdcp).toBe(0);
  //     expect(games[0]['Game 1']).toBe(games[0]['Game 1 + Hdcp']);
  //     expect(games[0].total).toBe(games[0]['total + Hdcp']);
  //   })
  //   it('should get all games for div - WITH HDCP', async () => { 
  //     const response = await axios.get(divUrl + divIdhdcp);
  //     const games = response.data.games;
  //     expect(games.length).toBe(3); // 3 players
  //     expect(games[0]).toHaveProperty('player_id');
  //     expect(games[0]).toHaveProperty('full_name');
  //     expect(games[0]).toHaveProperty('average');
  //     expect(games[0]).toHaveProperty('hdcp');
  //     expect(games[0]).toHaveProperty('Game 1');
  //     expect(games[0]).toHaveProperty('Game 1 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 2');
  //     expect(games[0]).toHaveProperty('Game 2 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 3');
  //     expect(games[0]).toHaveProperty('Game 3 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 4');
  //     expect(games[0]).toHaveProperty('Game 4 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 5');
  //     expect(games[0]).toHaveProperty('Game 5 + Hdcp');
  //     expect(games[0]).toHaveProperty('Game 6');
  //     expect(games[0]).toHaveProperty('Game 6 + Hdcp');
  //     expect(games[0]).toHaveProperty('total');
  //     expect(games[0]).toHaveProperty('total + Hdcp');

  //     expect(games[0].hdcp).toBeGreaterThan(0);
  //     expect(Number.isInteger(games[0].hdcp)).toBe(true);
  //     expect(games[0]['Game 1 + Hdcp']).toBe(games[0]['Game 1'] + games[0].hdcp); 
  //     expect(games[0]['total + Hdcp']).toBe(games[0].total + (games[0].hdcp * 6));
  //   })
  //   it('should NOT get all games for a div when ID is invalid', async () => { 
  //     try {
  //       const response = await axios.get(divUrl + 'invalid');
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should return empty array when div is not found', async () => { 
  //     const response = await axios.get(divUrl + notFoundDivId);
  //     const games = response.data.games;
  //     expect(games.length).toBe(0); 
  //   })
  // })

  describe('POST', () => { 
      
    let createdGame = false;

    beforeAll(async () => {
      await deletePostedGame(gameToPost.id);
    })

    beforeEach(() => {
      createdGame = false;
    })

    afterEach(async () => {
      if (createdGame) {
        await deletePostedGame(gameToPost.id);
      }
    })

    it('should create new game', async () => {
      const gamesJSON = JSON.stringify(gameToPost);
      const response = await axios.post(url, gamesJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(201);
      const postedGame = response.data.game;
      createdGame = true;
      expect(isValidBtDbId(postedGame.id, "gam")).toBe(true);
      expect(postedGame.squad_id).toBe(gameToPost.squad_id);
      expect(postedGame.player_id).toBe(gameToPost.player_id);
      expect(postedGame.game_num).toBe(gameToPost.game_num);
      expect(postedGame.score).toBe(gameToPost.score);
    })
    it('should NOT create a new game when id is blank', async () => {
      const invalidGame = {
        ...gameToPost,
        id: "",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when squad_id is blank', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when player_id is blank', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        id: null as any,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when squad_id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: null as any,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when player_id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: null as any,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when game_num is null', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: null as any,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when score is null', async () => {
      const invalidGame = {
        ...gameToPost,
        score: null as any,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        id: "test",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when id is sanitized but not a game id', async () => {
      const invalidGame = {
        ...gameToPost,
        id: "<script>alert(1)</script>",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when id is valid, but not a game id', async () => {
      const invalidGame = {
        ...gameToPost,
        id: userId,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when squad_id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when squad_id is valid, but not a squad id', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when squad_id is sanitized but not a squad id', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "<script>alert(1)</script>",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when player_id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when player_id is valid, but not a player id', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when player_id is sanitized but not a player id', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "<script>alert(1)</script>",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when game_num is too low', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 0,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when game_num is too high', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: maxGames + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when game_num is not an integer', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when game_num is not a number', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 'test',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when score is too low', async () => {
      const invalidGame = {
        ...gameToPost,
        score: -1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when score is too high', async () => {
      const invalidGame = {
        ...gameToPost,
        score: maxScore + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when score is not an integer', async () => {
      const invalidGame = {
        ...gameToPost,
        score: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new game when score is not a number', async () => {
      const invalidGame = {
        ...gameToPost,
        score: 'test',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });        
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('PUT by ID - API: /api/games/game/:id', () => { 

    const putGame = {
      ...testGame,
      squad_id: 'sqd_1a6c885ee19a49489960389193e8f819',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',      
      game_num: 13,
      score: 291
    }

    beforeAll(async () => {
      await resetGame();
    })

    afterEach(async () => {
      await resetGame();
    })

    it('should update game by id', async () => {
      const gameJSON = JSON.stringify(putGame);
      const response = await axios.put(oneGameUrl + testGame.id, gameJSON, {
        withCredentials: true
      });
      const game = response.data.game;
      expect(response.status).toBe(200);      
      expect(game.squad_id).toBe(putGame.squad_id);
      expect(game.player_id).toBe(putGame.player_id);      
      expect(game.game_num).toBe(putGame.game_num);      
      expect(game.score).toBe(putGame.score);
    })
    it('should NOT update game by id when ID is invalid', async () => {
      try {
        const gameJSON = JSON.stringify(putGame);
        const response = await axios.put(oneGameUrl + 'test', gameJSON, {
          withCredentials: true
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
    it('should NOT update game by id when ID is valid, but not a game ID', async () => {
      try {
        const gameJSON = JSON.stringify(putGame);
        const response = await axios.put(oneGameUrl + userId, gameJSON, {
          withCredentials: true
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
    it('should NOT update game by id when ID is not found', async () => {
      try {
        const gameJSON = JSON.stringify(putGame);
        const response = await axios.put(oneGameUrl + notFoundId, gameJSON, {
          withCredentials: true
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
    it('should NOT update game when squad_id is blank', async () => {
      const invalidGame = {
        ...putGame,
        squad_id: "",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update game when player_id is blank', async () => {
      const invalidGame = {
        ...putGame,
        player_id: "",
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when game_num is null', async () => {
      const invalidGame = {
        ...putGame,
        game_num: null,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update game when score is null', async () => {
      const invalidGame = {
        ...putGame,
        score: null,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when game_num is too low', async () => {
      const invalidGame = {
        ...putGame,
        game_num: 0,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when game_num is too high', async () => {
      const invalidGame = {
        ...putGame,
        game_num: maxGames + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when game_num is not an integer', async () => {
      const invalidGame = {
        ...putGame,
        game_num: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when game_num is not a number', async () => {
      const invalidGame = {
        ...putGame,
        game_num: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when score is too low', async () => {
      const invalidGame = {
        ...putGame,
        score: -1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when score is too high', async () => {
      const invalidGame = {
        ...putGame,
        score: maxScore + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when score is not an integer', async () => {
      const invalidGame = {
        ...putGame,
        score: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update pot when score is not a number', async () => {
      const invalidGame = {
        ...putGame,
        score: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.put(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
  })

  describe('PATCH by ID - API: /api/pots/:id', () => { 

    beforeAll(async () => {
      try {
        const gameJSON = JSON.stringify(testGame);
        await axios.put(oneGameUrl + testGame.id, gameJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    })
      
    afterEach(async () => {
      try {
        const gameJSON = JSON.stringify(testGame);
        await axios.put(oneGameUrl + testGame.id, gameJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    })

    it('should patch game_num for a game by ID', async () => { 
      const patchGame = {
        ...blankGame,
        game_num: 12
      }
      const gameJSON = JSON.stringify(patchGame);
      const response = await axios.patch(oneGameUrl + patchGame.id, gameJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedGame = response.data.game;
      expect(patchedGame.game_num).toBe(patchGame.game_num);
    })
    it('should patch score for a game by ID', async () => {
      const patchGame = {
        ...blankGame,
        score: 282,
      }
      const gameJSON = JSON.stringify(patchGame);
      const response = await axios.patch(oneGameUrl + patchGame.id, gameJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedGame = response.data.game;
      expect(patchedGame.score).toBe(patchGame.score);
    })
    it('should NOT patch squad_id for a game by ID', async () => {
      const invalidGame = {
        ...blankGame,
        squad_id: squad2Id,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedGame = response.data.game;
      // for squad_id, compare to blankGame.squad_id
      expect(patchedGame.squad_id).toBe(blankGame.squad_id);
    })
    it('should NOT patch player_id for a game by ID', async () => {
      const patchGame = {
        ...blankGame,
        player_id: player2Id,
      }
      const gameJSON = JSON.stringify(patchGame);
      // no error, but player_id is not updated
      const response = await axios.patch(oneGameUrl + patchGame.id, gameJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedGame = response.data.game;
      // for player_id, compare to blankGame.div_id
      expect(patchedGame.player_id).toBe(blankGame.player_id);
    })
    it('should NOT patch a game when ID is invalid', async () => {
      const patchGame = {
        ...blankGame,
        game_num: 13,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios.patch(oneGameUrl + 'test', gameJSON, {
          withCredentials: true
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
    it('should NOT patch a game when ID is not found', async () => {
      const patchGame = {
        ...blankGame,
        game_num: 13,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios.patch(oneGameUrl + notFoundId, gameJSON, {
          withCredentials: true
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
    it('should NOT patch a game when ID is valid, but not a game ID', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: 13,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + userId, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a game when game_num is too low', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: -1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when game_num is too high', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: maxGames + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when game_num is not an integer', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: 1.3,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when game_num is not a number', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: 'test',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when game_num is null', async () => {
      const invalidGame = {
        ...blankGame,
        game_num: null,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when score is too low', async () => {
      const invalidGame = {
        ...blankGame,
        score: -1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when score is too high', async () => {
      const invalidGame = {
        ...blankGame,
        score: maxScore + 1,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when score is not an integer', async () => {
      const invalidGame = {
        ...blankGame,
        score: 1.3,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when score is not a number', async () => {
      const invalidGame = {
        ...blankGame,
        score: 'test',
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a game when score is null', async () => {
      const invalidGame = {
        ...blankGame,
        score: null,
      }
      const invalidJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios.patch(oneGameUrl + invalidGame.id, invalidJSON, {
          withCredentials: true
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
  })

  describe('DELETE by ID - API: /api/games/:id', () => { 

    const toDelGame = {
      ...initGame,
      id: 'gam_c1dfffcefd344ef0a9a2aaacda98635a',
      squad_id: 'sqd_1a6c885ee19a49489960389193e8f819',
      player_id: 'ply_bb0fd8bbd9e34d34a7fa90b4111c6e40',
      game_num: 1,
      score: 222,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const gameJSON = JSON.stringify(toDelGame);
        await axios.post(url, gameJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })
    it('should delete a game by ID', async () => {
      const response = await axios.delete(oneGameUrl + toDelGame.id, {
        withCredentials: true,
      });
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should NOT delete a game by ID when ID is not found', async () => { 
      const response = await axios.delete(oneGameUrl + notFoundId, {
        withCredentials: true,
      });
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a game by ID when ID is invalid', async () => { 
      try {
        const response = await axios.delete(oneGameUrl + 'test', {
          withCredentials: true,
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
    it('should NOT delete a game by ID when ID is valid, but not an game id', async () => { 
      try {
        const response = await axios.delete(oneGameUrl + userId, {
          withCredentials: true,
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
  })

})
