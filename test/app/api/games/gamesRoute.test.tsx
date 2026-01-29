import axios, { AxiosError } from "axios";
import { baseGamesApi  } from "@/lib/db/apiPaths";
import { testBaseGamesApi } from "../../../testApi";
import { gameType } from "@/lib/types/types";
import { initGame } from "@/lib/db/initVals";
import { isValidBtDbId, maxGames, maxScore } from "@/lib/validation/validation";

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
const oneGameUrl = url + "/game/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";

const notFoundId = "gam_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

const divId = 'div_578834e04e5e4885bbae79229d8b96e8';
const divIdhdcp = 'div_24b1cd5dee0542038a1244fc2978e862'

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

const delOneGame = async (id: string) => { 
  try {
    const delResponse = await axios({
      method: "delete",
      withCredentials: true,
      url: oneGameUrl + id
    });
  } catch (err) {
    if (err instanceof AxiosError) { 
      if (err.status !== 404) {
        console.log(err.message);
        return;
      }
    }
  }
}

const deletePostedGame = async () => { 
  const response = await axios.get(url);
  const games = response.data.games;
  const toDel = games.find((g: gameType) => g.score === 292);
  if (toDel) {
    await delOneGame(toDel.id);
  }
}

const resetGame = async () => { 
  // make sure test game is reset in database
  const gameJSON = JSON.stringify(testGame);
  const response = await axios({
    method: "put",
    data: gameJSON,
    withCredentials: true,
    url: oneGameUrl + testGame.id,
  })
}

const rePostGame = async (game: gameType) => {
  try {
    // if game already in database, then don't re-post
    const getResponse = await axios.get(oneGameUrl + game.id);
    const found = getResponse.data.game;
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
    const gameJSON = JSON.stringify(game);
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: gameJSON
    });    
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('Games - API: /api/games', () => { 

  const blankGame = {
    id: testGame.id,
    squad_id: testGame.squad_id,
    player_id: testGame.player_id,
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedGame();
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
      await deletePostedGame();
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
      await deletePostedGame();
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
      
    const gameToPost: gameType = {
      ...initGame,
      id: "gam_b2a7b02d761b4f5ab5438be84f642c3b",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      game_num: 11,
      score: 292,
    }

    let createdGame = false;

    beforeAll(async () => {
      await deletePostedGame();
    })

    beforeEach(() => {
      createdGame = false;
    })

    afterEach(async () => {
      if (createdGame) {
        await deletePostedGame();
      }
    })

    it('should create new game', async () => {
      const gamesJSON = JSON.stringify(gameToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: gamesJSON
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
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when squad_id is blank', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when player_id is blank', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        id: null as any,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when squad_id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: null as any,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when player_id is null', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: null as any,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when game_num is null', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: null as any,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when score is null', async () => {
      const invalidGame = {
        ...gameToPost,
        score: null as any,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        id: "test",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when id is sanitized but not a game id', async () => {
      const invalidGame = {
        ...gameToPost,
        id: "<script>alert(1)</script>",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when id is valid, but not a game id', async () => {
      const invalidGame = {
        ...gameToPost,
        id: userId,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when squad_id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "test",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when squad_id is valid, but not a squad id', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: userId,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when squad_id is sanitized but not a squad id', async () => {
      const invalidGame = {
        ...gameToPost,
        squad_id: "<script>alert(1)</script>",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when player_id is invalid', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "test",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when player_id is valid, but not a player id', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: userId,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when player_id is sanitized but not a player id', async () => {
      const invalidGame = {
        ...gameToPost,
        player_id: "<script>alert(1)</script>",
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when game_num is too low', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 0,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when game_num is too high', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: maxGames + 1,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when game_num is not an integer', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 1.5,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when game_num is not a number', async () => {
      const invalidGame = {
        ...gameToPost,
        game_num: 'test',
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when score is too low', async () => {
      const invalidGame = {
        ...gameToPost,
        score: -1,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when score is too high', async () => {
      const invalidGame = {
        ...gameToPost,
        score: maxScore + 1,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when score is not an integer', async () => {
      const invalidGame = {
        ...gameToPost,
        score: 1.5,
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
    it('should NOT create a new game when score is not a number', async () => {
      const invalidGame = {
        ...gameToPost,
        score: 'test',
      }
      const gameJSON = JSON.stringify(invalidGame);
      try {
        const response = await axios({
          method: "post",
          data: gameJSON,
          withCredentials: true,
          url: url
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
      const putResponse = await axios({
        method: "put",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + testGame.id,
      })
      const game = putResponse.data.game;
      expect(putResponse.status).toBe(200);      
      expect(game.squad_id).toBe(putGame.squad_id);
      expect(game.player_id).toBe(putGame.player_id);      
      expect(game.game_num).toBe(putGame.game_num);      
      expect(game.score).toBe(putGame.score);
    })
    it('should NOT update game by id when ID is invalid', async () => {
      try {
        const gameJSON = JSON.stringify(putGame);
        const putResponse = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + 'test',
        })
        expect(putResponse.status).toBe(404);
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
        const putResponse = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + userId,
        })
        expect(putResponse.status).toBe(404);
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
        const putResponse = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + notFoundId,
        })
        expect(putResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update game when squad_id is blank', async () => {
      const invalidPot = {
        ...putGame,
        squad_id: "",
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update game when player_id is blank', async () => {
      const invalidPot = {
        ...putGame,
        player_id: "",
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when game_num is null', async () => {
      const invalidPot = {
        ...putGame,
        game_num: null,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update game when score is null', async () => {
      const invalidPot = {
        ...putGame,
        score: null,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when game_num is too low', async () => {
      const invalidPot = {
        ...putGame,
        game_num: 0,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when game_num is too high', async () => {
      const invalidPot = {
        ...putGame,
        game_num: maxGames + 1,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when game_num is not an integer', async () => {
      const invalidPot = {
        ...putGame,
        game_num: 1.5,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when game_num is not a number', async () => {
      const invalidPot = {
        ...putGame,
        game_num: 'invalid',
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when score is too low', async () => {
      const invalidPot = {
        ...putGame,
        score: -1,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when score is too high', async () => {
      const invalidPot = {
        ...putGame,
        score: maxScore + 1,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when score is not an integer', async () => {
      const invalidPot = {
        ...putGame,
        score: 1.5,
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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
    it('should NOT update pot when score is not a number', async () => {
      const invalidPot = {
        ...putGame,
        score: 'invalid',
      }
      const gameJSON = JSON.stringify(invalidPot);
      try {
        const response = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
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

  describe('PATCH by ID - API: /api/pots/:id', () => { 

    beforeAll(async () => {
      // make sure test pot is reset in database
      const gameJSON = JSON.stringify(testGame);
      const putResponse = await axios({
        method: "put",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + testGame.id,
      })
    })
      
    afterEach(async () => {
      try {
        const gameJSON = JSON.stringify(testGame);
        const putResponse = await axios({
          method: "put",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + testGame.id,
        })
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
      const response = await axios({
        method: "patch",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + blankGame.id,
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
      const response = await axios({
        method: "patch",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + blankGame.id,
      })
      expect(response.status).toBe(200);
      const patchedGame = response.data.game;
      expect(patchGame.score).toBe(patchGame.score);
    })
    it('should NOT patch squad_id for a game by ID', async () => {
      const patchGame = {
        ...blankGame,
        squad_id: squad2Id,
      }
      const gameJSON = JSON.stringify(patchGame);
      const response = await axios({
        method: "patch",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + blankGame.id,
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
      const response = await axios({
        method: "patch",
        data: gameJSON,
        withCredentials: true,
        url: oneGameUrl + blankGame.id,
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
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + 'test',
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
    it('should NOT patch a game when ID is not found', async () => {
      const patchGame = {
        ...blankGame,
        game_num: 13,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + notFoundId,
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
    it('should NOT patch a game when ID is valid, but not a game ID', async () => {
      const patchGame = {
        ...blankGame,
        game_num: 13,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + userId,
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
      const patchGame = {
        ...blankGame,
        game_num: -1,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        game_num: maxGames + 1,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        game_num: 1.3,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        game_num: 'test',
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        game_num: null,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        score: -1,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        score: maxScore + 1,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        score: 1.3,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        score: 'test',
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
      const patchGame = {
        ...blankGame,
        score: null,
      }
      const gameJSON = JSON.stringify(patchGame);
      try {
        const response = await axios({
          method: "patch",
          data: gameJSON,
          withCredentials: true,
          url: oneGameUrl + blankGame.id,
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
        const response = await axios({
          method: 'post',
          data: gameJSON,
          withCredentials: true,
          url: url
        })        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })
    it('should delete a game by ID', async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneGameUrl + toDelGame.id,
        })  
        didDel = true;
        expect(delResponse.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a game by ID when ID is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneGameUrl + 'test',
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a game by ID when ID is not found', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneGameUrl + notFoundId,
        })  
        expect(delResponse.status).toBe(200);
        expect(delResponse.data.count).toBe(0);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a game by ID when ID is valid, but not an game id', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneGameUrl + userId
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('DELETE all games for a squad - API: /api/games/squad/:squadId', () => { 
    const toDelGames = [
      {
        ...initGame,
        id: 'gam_1b0324b96f5146e682b689c3c427dbb9',
        squad_id: 'sqd_bb2de887bf274242af5d867476b029b8',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        game_num: 1,
        score: 211,
      },
      {
        ...initGame,
        id: 'gam_1c0324b96f5146e682b689c3c427dbb9',
        squad_id: 'sqd_bb2de887bf274242af5d867476b029b8',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        game_num: 2,
        score: 222,
      },
      {
        ...initGame,
        id: 'gam_1d0324b96f5146e682b689c3c427dbb9',
        squad_id: 'sqd_bb2de887bf274242af5d867476b029b8',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        game_num: 3,
        score: 233,
      },
    ]
    let didDel = false

    beforeAll(async () => {
      await rePostGame(toDelGames[0]);
      await rePostGame(toDelGames[1]);
      await rePostGame(toDelGames[2]);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await rePostGame(toDelGames[0]);
      await rePostGame(toDelGames[1]);
      await rePostGame(toDelGames[2]);
    })

    afterAll(async () => {
      await delOneGame(toDelGames[0].id);
      await delOneGame(toDelGames[1].id);
      await delOneGame(toDelGames[2].id);
    })

    it('should delete all games for a squad', async () => { 
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + toDelGames[0].squad_id,
      })
      expect(response.status).toBe(200);
      didDel = true
      const count = response.data.count;
      expect(count).toBe(toDelGames.length);
    })
    it('should return 404 when a squad ID is invalid', async () => { 
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: squadUrl + "test"
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
    it('should NOT delete games pots for a squad when squad ID is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + notFoundSquadId
      })
      expect(response.status).toBe(200);      
      const count = response.data.count;
      expect(count).toBe(0);
    })
    it('should return 404 when a squad id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: 'delete',
          withCredentials: true,
          url: squadUrl + userId
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
  })

})
