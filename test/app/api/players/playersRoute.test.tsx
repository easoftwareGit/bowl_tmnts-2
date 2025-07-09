import axios, { AxiosError } from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import { initPlayer } from "@/lib/db/initVals";
import { playerType, tmntEntryPlayerType } from "@/lib/types/types";
import { deleteAllPlayersForSquad, deleteAllPlayersForTmnt, getAllPlayersForSquad, postManyPlayers } from "@/lib/db/players/dbPlayers";
import { mockPlayersToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
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

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi; 
const onePlayerUrl = url + "/player/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/"; 
const manyUrl = url + "/many";

describe("Players - API's: /api/players", () => {

  const testPlayer = {
    ...initPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: 'A',
  }

  const notFoundId = "ply_01234567890123456789012345678901";
  const notFoundSquadId = "sqd_01234567890123456789012345678901";
  const notFoundTmntId = "tmt_01234567890123456789012345678901";
  const nonPlayerId = "usr_01234567890123456789012345678901";

  const squadId = "sqd_7116ce5f80164830830a7157eb093396";  

  const deletePostedPlayer = async () => {
    const response = await axios.get(url);
    const players = response.data.players;
    const toDel = players.find((p: playerType) => p.position === 'Z');
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: onePlayerUrl + toDel.id
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedPlayer();
    })

    it('should get all players', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 51 rows in prisma/seed.ts
      expect(response.data.players).toHaveLength(51);
    })

  })

  describe('GET player by ID - API: /api/players/player/:id', () => { 

    it('should get player by ID', async () => {
      try {
        const urlToUse = onePlayerUrl + testPlayer.id;
        const response = await axios.get(urlToUse);
        const player = response.data.player;
        expect(response.status).toBe(200);
        expect(player.id).toEqual(testPlayer.id);
        expect(player.squad_id).toEqual(testPlayer.squad_id);
        expect(player.first_name).toEqual(testPlayer.first_name);
        expect(player.last_name).toEqual(testPlayer.last_name);
        expect(player.average).toEqual(testPlayer.average);
        expect(player.lane).toEqual(testPlayer.lane);
        expect(player.position).toEqual(testPlayer.position);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a player by id when id is invalid', async () => {
      try {
        const response = await axios.get(onePlayerUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a player by id when id is valid, but not a player id', async () => {
      try {
        const response = await axios.get(onePlayerUrl + nonPlayerId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a player by id when id is not found', async () => {
      try {
        const response = await axios.get(onePlayerUrl + notFoundId);
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

  describe('GET all players for a squad API: /api/players/squad/:squadId', () => {    

    beforeAll(async () => {
      await deletePostedPlayer();
    })

    it('should get all players for a squad', async () => {
      const response = await axios.get(squadUrl + squadId);
      expect(response.status).toBe(200);
      const players = response.data.players;
      expect(players.length).toBe(8); // 8 players in prisma/seeds
      for (let i = 0; i < players.length; i++) {
        expect(players[i].squad_id).toEqual(squadId);
      }

      expect(players[0].lane).toEqual(1);
      expect(players[1].lane).toEqual(1);
      expect(players[2].lane).toEqual(1);
      expect(players[3].lane).toEqual(1);
      expect(players[4].lane).toEqual(2);
      expect(players[5].lane).toEqual(2);
      expect(players[6].lane).toEqual(2);
      expect(players[7].lane).toEqual(2);


      expect(players[0].position).toEqual('A');
      expect(players[1].position).toEqual('B');
      expect(players[2].position).toEqual('C');
      expect(players[3].position).toEqual('D');
      expect(players[4].position).toEqual('E');
      expect(players[5].position).toEqual('F');
      expect(players[6].position).toEqual('G');
      expect(players[7].position).toEqual('H');
    })
    it('should NOT get all players for a squad when squad id is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all players for a squad when squad id is valid, but not a squad id', async () => {
      try {
        const response = await axios.get(squadUrl + notFoundTmntId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 players for a squad when squad id is not found', async () => {
      const response = await axios.get(squadUrl + notFoundSquadId);
      expect(response.status).toBe(200);
      const players = response.data.players;
      expect(players.length).toBe(0);
    })
    
  })

  describe('GET all players for a tournament API: /api/players/tmnt/:tmntId', () => { 

    beforeAll(async () => {
      await deletePostedPlayer();
    })

    it('should get all players for a tournament', async () => {
      // 36 players for whole tmnt in prisma/seeds.ts
      const wholeTmntId = 'tmt_d237a388a8fc4641a2e37233f1d6bebd';
      const wholeTmntSquadId = "sqd_8e4266e1174642c7a1bcec47a50f275f";
      const response = await axios.get(tmntUrl + wholeTmntId);
      expect(response.status).toBe(200);
      const players = response.data.players;
      expect(players.length).toBe(36); 
      for (let i = 0; i < players.length; i++) {
        expect(players[i].squad_id).toEqual(wholeTmntSquadId);
      }
    })
    it('should NOT get all players for a tournament when tmnt id is invalid', async () => {
      try {
        const response = await axios.get(tmntUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get all players for a tournament when tmnt id is valid, but not a tmnt id', async () => {
      try {
        const response = await axios.get(tmntUrl + squadId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should return 0 players for a tournament when tmnt id is not found', async () => {
      const response = await axios.get(tmntUrl + notFoundTmntId);
      expect(response.status).toBe(200);
      const players = response.data.players;
      expect(players.length).toBe(0);
    })
    
  })

  describe('POST one player API: /api/players', () => { 

    const playerToPost: playerType = {
      ...initPlayer,
      squad_id: squadId,
      first_name: 'Test',
      last_name: 'Player',
      average: 200,
      lane: 1,
      position: 'Z'
    }

    let createdPlayer = false;

    beforeAll(async () => {
      await deletePostedPlayer();
    })

    beforeEach(() => {
      createdPlayer = false;
    })

    afterEach(async () => {
      if (createdPlayer) {
        await deletePostedPlayer();
      }      
    })

    it('should post one player', async () => {
      const playerJson = JSON.stringify(playerToPost);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: playerJson
      });
      expect(response.status).toBe(201);
      createdPlayer = true;
      const player = response.data.player;
      expect(player.id).toEqual(playerToPost.id);
      expect(player.squad_id).toEqual(playerToPost.squad_id);
      expect(player.first_name).toEqual(playerToPost.first_name);
      expect(player.last_name).toEqual(playerToPost.last_name);
      expect(player.average).toEqual(playerToPost.average);
      expect(player.lane).toEqual(playerToPost.lane);
      expect(player.position).toEqual(playerToPost.position);      
    })
    it('should post a sanitized player', async () => { 
      const sanitizedPlayer = {
        ...playerToPost,
        first_name: '<script>alert("xss")</script>',
        last_name: '    abcdef***',
        average: 100,
        lane: 2,
        position: ' Z*'
      }
      const playerJson = JSON.stringify(sanitizedPlayer);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: playerJson
      });
      expect(response.status).toBe(201);
      createdPlayer = true;
      const player = response.data.player;
      expect(player.id).toEqual(playerToPost.id);
      expect(player.squad_id).toEqual(playerToPost.squad_id);
      expect(player.first_name).toEqual('alertxss');
      expect(player.last_name).toEqual('abcdef');
      expect(player.average).toEqual(100);
      expect(player.lane).toEqual(2);
      expect(player.position).toEqual('Z');      
    })
    it('should NOT post a player when id is blank', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        id: ''
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when squad id is blank', async () => {
      const invalidPlayer = {
        ...playerToPost,
        squad_id: ''
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when first name is blank', async () => {
      const invalidPlayer = {
        ...playerToPost,
        first_name: ''
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when last name is blank', async () => {
      const invalidPlayer = {
        ...playerToPost,
        last_name: ''
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when first name is invalid', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        first_name: 'abcdefghijklmnopqrstuvwxyz' // too long
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when last name is invalid', async () => {
      const invalidPlayer = {
        ...playerToPost,
        last_name: 'abcdefghijklmnopqrstuvwxyz' // too long
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when average is missing', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        average: null
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when lane is missing', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        lane: null
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when position is blank', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        position: ''
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when id is invalid', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        id: 'test'
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when id is valid, but not a player id', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        id: nonPlayerId
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when squad id is invalid', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        squad_id: 'test'
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when squad id is valid, but not a squad id', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        squad_id: nonPlayerId
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when average is invalid', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        average: 301
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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
    it('should NOT post a player when lane is invalid', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        lane: 'test'
      }
      const playerJson = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "post",
          withCredentials: true,
          url: url,
          data: playerJson
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

  describe('POST many players API: /api/players/many', () => { 

    let createdPlayers = false;    
    
    const playersToDelTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

    beforeAll(async () => { 
      await deleteAllPlayersForTmnt(playersToDelTmntId);
    })

    beforeEach(() => {
      createdPlayers = false;
    })

    afterEach(async () => {
      if (createdPlayers) {
        await deleteAllPlayersForTmnt(playersToDelTmntId);
      }      
    })

    it('should create many players', async () => {
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);
      for (let i = 0; i < mockPlayersToPost.length; i++) {
        expect(postedPlayers[i].first_name).toBe(mockPlayersToPost[i].first_name);
        expect(postedPlayers[i].last_name).toBe(mockPlayersToPost[i].last_name);
        expect(postedPlayers[i].average).toBe(mockPlayersToPost[i].average);
        expect(postedPlayers[i].lane).toBe(mockPlayersToPost[i].lane);
        expect(postedPlayers[i].position).toBe(mockPlayersToPost[i].position);
      }
    })
    it('should create many players with sanitized data', async () => { 
      const toSanitize = cloneDeep(mockPlayersToPost);
      toSanitize[0].first_name = '<script>' + toSanitize[0].first_name + '</script>';
      toSanitize[0].last_name = '    ' + toSanitize[0].last_name + '****';
      toSanitize[0].position = '  ' + toSanitize[0].position + '*';

      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);
      for (let i = 0; i < mockPlayersToPost.length; i++) {
        expect(postedPlayers[i].first_name).toBe(mockPlayersToPost[i].first_name);
        expect(postedPlayers[i].last_name).toBe(mockPlayersToPost[i].last_name);
        expect(postedPlayers[i].average).toBe(mockPlayersToPost[i].average);
        expect(postedPlayers[i].lane).toBe(mockPlayersToPost[i].lane);
        expect(postedPlayers[i].position).toBe(mockPlayersToPost[i].position);
      }
    })
    it('should NOT create many players with blank id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].id = '';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with blank squad_id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);      
      invalidData[1].squad_id = '';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with blank first_name', async () => {
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].first_name = '';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with blank last_name', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);      
      invalidData[1].last_name = '';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with missing average', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);      
      invalidData[1].average = null as any;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with missing lane', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);      
      invalidData[1].lane = null as any;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with missing position', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);      
      invalidData[1].position = null as any;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].id = 'test';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with valid id, but not a player id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].id = nonPlayerId;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid squad_id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].squad_id = 'test';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with valid squad_id, but not a squad id', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].squad_id = nonPlayerId;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid first name', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].first_name = 'abcdefghijklmnopqrstuvwxyz';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid last name', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].last_name = 'abcdefghijklmnopqrstuvwxyz';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid average', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].average = 301;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid lane', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].lane = -1;
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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
    it('should NOT create many players with invalid position', async () => { 
      const invalidData = cloneDeep(mockPlayersToPost);
      invalidData[1].position = 'abcdefghijklmnopqrstuvwxyz';
      const playerJSON = JSON.stringify(invalidData);
      try {
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: manyUrl,        
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

  describe('PUT many players - API: /api/players/many', () => { 

    let createdPlayers = false;    
    
    const playersToDelTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

    beforeAll(async () => { 
      await deleteAllPlayersForTmnt(playersToDelTmntId);
    })

    beforeEach(() => {
      createdPlayers = false;
    })

    afterEach(async () => {
      if (createdPlayers) {
        await deleteAllPlayersForTmnt(playersToDelTmntId);
      }      
    })

    it('should update many players - just update', async () => {      
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: 200,
          eType: "u",
        },
        {
          ...mockPlayersToPost[1],
          average: 201,
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(playersToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    })
    it('should insert many players - just insert', async () => {      
      createdPlayers = true;

      // set eType = 'i'
      const playersToInsert = [
        {
          ...mockPlayersToPost[0],          
          eType: "i",
        },
        {
          ...mockPlayersToPost[1],          
          eType: "i",
        },
      ]
      const toUpdateJSON = JSON.stringify(playersToInsert) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    })
    it('should delete many players - just delete', async () => {      
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'd'
      const playersToDelete = [
        {
          ...mockPlayersToPost[0],
          eType: "d",
        },
        {
          ...mockPlayersToPost[1],
          eType: "d",
        },
      ]
      const toUpdateJSON = JSON.stringify(playersToDelete) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.deletes).toBe(2);
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
    })
    it('should update, insert, delete many players', async () => {      
      const toInsert: playerType[] = [              
        {
          ...initPlayer,
          id: "ply_05be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          first_name: "Art",
          last_name: "Smith",
          average: 222,
          lane: 3,
          position: 'C',
        },
        {
          ...initPlayer,
          id: "ply_06be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          first_name: "Bob",
          last_name: "Rees",
          average: 223,
          lane: 4,
          position: 'C',
        }
      ];
    
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: 200,
          eType: "u",
        },
        {
          ...mockPlayersToPost[1],
          average: 201,
          eType: "u",
        },
      ]

      // add eType = 'i'
      const playersToInsert = [
        {
          ...toInsert[0],
          eType: "i",
        },
        {
          ...toInsert[1],
          eType: "i",
        },
      ]

      // add eType = 'd'
      const playersToDelete = [
        {
          ...mockPlayersToPost[2],
          eType: "d",
        },
        {
          ...mockPlayersToPost[3],
          eType: "d",
        },
      ]
      const allToUpdate = [...playersToUpdate, ...playersToInsert, ...playersToDelete];
      const toUpdateJSON = JSON.stringify(allToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    })
    it('should update many players - sanitized first and last names', async () => {      
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          first_name: "<script>alert(1)</script>",
          last_name: "    abcdef***",
          eType: "u",
        },
      ]
      const toUpdateJSON = JSON.stringify(playersToUpdate) 
      const updateResponse = await axios({
        method: "put",
        data: toUpdateJSON,
        withCredentials: true,
        url: manyUrl,
      })

      expect(updateResponse.status).toBe(200);
      const updateInfo = updateResponse.data.updateInfo;
      expect(updateInfo).not.toBeNull();
      expect(updateInfo.updates).toBe(1);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);

      const squadPlayers = await getAllPlayersForSquad(mockPlayersToPost[0].squad_id);
      expect(squadPlayers).not.toBeNull();
      if (!squadPlayers) return
      const updatedPlayer = squadPlayers.find(p => p.id === mockPlayersToPost[0].id);
      expect(updatedPlayer).not.toBeNull();
      if (!updatedPlayer) return
      expect(updatedPlayer.first_name).toBe("alert1");
      expect(updatedPlayer.last_name).toBe("abcdef");
    })
    it('should not update any players if any data is invalid - invalid average', async () => {      
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: -1,    // invalid average
          eType: "u",
        },
        {
          ...mockPlayersToPost[1],
          average: 201,
          eType: "u",
        },
      ]      
      const toUpdateJSON = JSON.stringify(playersToUpdate) 
      try {
        const updateResponse = await axios({
          method: "put",
          data: toUpdateJSON,
          withCredentials: true,
          url: manyUrl,
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
    it('should not update if no data is provided', async () => {      
      const playerJSON = JSON.stringify(mockPlayersToPost);
      const response = await axios({
        method: "post",
        data: playerJSON,
        withCredentials: true,
        url: manyUrl,        
      })
      const postedPlayers = response.data.players;
      expect(response.status).toBe(201);
      createdPlayers = true;
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate: tmntEntryPlayerType[] = [];
      const toUpdateJSON = JSON.stringify(playersToUpdate) 
      try {
        const updateResponse = await axios({
          method: "put",
          data: toUpdateJSON,
          withCredentials: true,
          url: manyUrl,
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

  describe('PUT by ID - API: /api/players/player/:id', () => {
    
    const resetPlayer = async () => {
      // make sure test player is reset in database
      const playerJSON = JSON.stringify(testPlayer);
      const putResponse = await axios({
        method: "put",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + testPlayer.id,
      })
    }

    const putPlayer = {
      ...testPlayer,
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      first_name: "Mike",
      last_name: "Green",
      average: 175,
      lane: 42,
      position: 'X',   
    }

    let didPut = false;

    beforeAll(async () => {
      await resetPlayer()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetPlayer()
      }      
    })

    it('should update a player by ID', async () => {
      const playerJSON = JSON.stringify(putPlayer);
      const response = await axios({
        method: "put",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + testPlayer.id,
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedPlayer = response.data.player;
      // did not update squad_id
      expect(puttedPlayer.first_name).toBe(putPlayer.first_name);
      expect(puttedPlayer.last_name).toBe(putPlayer.last_name);
      expect(puttedPlayer.average).toBe(putPlayer.average);
      expect(puttedPlayer.lane).toBe(putPlayer.lane);
      expect(puttedPlayer.position).toBe(putPlayer.position);
    })
    it('should update a sanitized player by ID', async () => {
      const toSanitizse = {
        ...putPlayer,
        first_name: '<script>alert("XSS")</script>',
        last_name: '   Test Last****',
        position: '  Z  ',
      }
      const playerJSON = JSON.stringify(toSanitizse);
      const response = await axios({
        method: "put",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + testPlayer.id,
      });
      expect(response.status).toBe(200);
      didPut = true;
      const puttedPlayer = response.data.player;
      expect(puttedPlayer.first_name).toBe('alertXSS');
      expect(puttedPlayer.last_name).toBe('Test Last');
      expect(puttedPlayer.average).toBe(toSanitizse.average);
      expect(puttedPlayer.lane).toBe(toSanitizse.lane);
      expect(puttedPlayer.position).toBe('Z');
    })
    it('should NOT update a player when ID is invalid', async () => {
      const playerJSON = JSON.stringify(putPlayer);  
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + 'test',
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
    it('should NOT update a player when ID is valid, but not a player id', async () => {
      const playerJSON = JSON.stringify(putPlayer);  
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + nonPlayerId,
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
    it('should NOT update a player when ID is not found', async () => { 
      const playerJSON = JSON.stringify(putPlayer);  
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + notFoundId,
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
    it('should not update a player when squad_id is blank', async () => {
      // need to pass a valid squad id for data validation
      // even though it is not used
      const invalidPlayer = {
        ...putPlayer,
        squad_id: "",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when first_name is blank', async () => {
      const invalidPlayer = {
        ...putPlayer,
        first_name: "",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when last_name is blank', async () => {
      const invalidPlayer = {
        ...putPlayer,
        last_name: "",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when average is not a number', async () => {
      const invalidPlayer = {
        ...putPlayer,
        average: "test",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when lane is not a number', async () => {
      const invalidPlayer = {
        ...putPlayer,
        lane: "test",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when position is blank', async () => {
      const invalidPlayer = {
        ...putPlayer,
        position: "",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when squad_id is not valid', async () => { 
      const invalidPlayer = {
        ...putPlayer,
        squad_id: "test",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when squad_id is valid, but not a squad id', async () => { 
      const invalidPlayer = {
        ...putPlayer,
        squad_id: nonPlayerId,
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when first_name is not valid', async () => { 
      const invalidPlayer = {
        ...putPlayer,
        first_name: "abcdefghijklmnopqrstuvwxyz",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when last_name is not valid', async () => { 
      const invalidPlayer = {
        ...putPlayer,
        last_name: "abcdefghijklmnopqrstuvwxyz",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when average is invalid', async () => { 
      const invalidPlayer = {
        ...putPlayer,
        average: 301,
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when lane is invalid', async () => {
      const invalidPlayer = {
        ...putPlayer,
        lane: 0,
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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
    it('should not update a player when position is invalid', async () => {
      const invalidPlayer = {
        ...putPlayer,
        position: "ABC",
      }
      const playerJSON = JSON.stringify(invalidPlayer);
      try {
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
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

  describe('PATCH by ID - API: /api/players/player/:id', () => { 

    const toPatch = {      
      id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    }
    const notPatchedSquadId = 'sqd_7116ce5f80164830830a7157eb093396';

    const doResetPlayer = async () => {
      try {
        const playerJSON = JSON.stringify(testPlayer);
        const putResponse = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + testPlayer.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetPlayer
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetPlayer();
      }
    })

    it('should return 200 when just passing squad_id, no patching done', async () => {
      // last player in /prisma/seed.ts, also used for delete test
      const noPatchSquadId = 'sqd_1a6c885ee19a49489960389193e8f819';
      const patchPlayer = {
        ...toPatch,
        squad_id: noPatchSquadId,
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.squad_id).toBe(notPatchedSquadId);
    })
    it('should patch first_name in a player by ID', async () => {
      const patchPlayer = {
        ...toPatch,
        first_name: "Patch",
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.first_name).toBe("Patch");
    })
    it('should patch last_name in a player by ID', async () => {
      const patchPlayer = {
        ...toPatch,
        last_name: "Patch",
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.last_name).toBe("Patch");
    })
    it('should patch average in a player by ID', async () => {
      const patchPlayer = {
        ...toPatch,
        average: 123,
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.average).toBe(123);
    })
    it('should patch lane in a player by ID', async () => {
      const patchPlayer = {
        ...toPatch,
        lane: 99,
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.lane).toBe(99);
    })
    it('should patch position in a player by ID', async () => {
      const patchPlayer = {
        ...toPatch,
        position: "W",
      }
      const playerJSON = JSON.stringify(patchPlayer);
      const response = await axios({
        method: "patch",
        data: playerJSON,
        withCredentials: true,
        url: onePlayerUrl + toPatch.id,
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedPlayer = response.data.player;
      expect(patchedPlayer.id).toBe(toPatch.id);
      expect(patchedPlayer.position).toBe("W");
    })
    it('should NOT patch when player id is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          position: "W",
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + "invalid_id",
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
    it('should NOT patch when player id is valid, but no a player id', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          position: "W",
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + nonPlayerId,
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
    it('should NOT patch when player id is valid but not found', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          position: "W",
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + notFoundId,
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
    it('should NOT patch when squaid id is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          squad_id: "invalid_id",
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should NOT patch when squaid id is valid, but no a squad id', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          squad_id: nonPlayerId,
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should not patch when first_name is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          first_name: "a".repeat(256)
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should not patch when last_name is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          last_name: "a".repeat(256)
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should not patch when average is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          average: 301
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should not patch when lane is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          lane: 0
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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
    it('should not patch when position is invalid', async () => {
      try {
        const patchPlayer = {
          ...toPatch,
          position: "XYZ"
        }
        const playerJSON = JSON.stringify(patchPlayer);
        const response = await axios({
          method: "patch",
          data: playerJSON,
          withCredentials: true,
          url: onePlayerUrl + toPatch.id,
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

  describe('DELETE by ID - API: /api/players/player/:id', () => { 

    const toDelPlayer = {
      ...initPlayer,
      id: "ply_91c5aa1c14644e03b6735abd1480ee32",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      first_name: "Mia",
      last_name: "Clark",
      average: 190,
      lane: 1,
      position: "Y"
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const playerJSON = JSON.stringify(toDelPlayer);
        const response = await axios({
          method: "post",
          data: playerJSON,
          withCredentials: true,
          url: url,
        });
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a player by id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: onePlayerUrl + toDelPlayer.id
        });
        expect(response.status).toBe(200);
        didDel = true;
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a player by id when id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: onePlayerUrl + 'test'
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
    it('should NOT delete a player by id when id is valid, but not a player id', async () => {      
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: onePlayerUrl + nonPlayerId
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
    it('should NOT delete a player by id when id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: onePlayerUrl + notFoundId
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

  describe('DELETE all players for a squad - API: /api/players/player/squad/:squad_id', () => { 
          
    const squadIdForPlayers = mockPlayersToPost[0].squad_id

    beforeAll(async () => {
      await postManyPlayers(mockPlayersToPost);
    })

    afterAll(async () => {
      await deleteAllPlayersForSquad(squadIdForPlayers)
    })

    it('should delete all players for a squad', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + squadIdForPlayers
        });
        expect(response.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all players for a squad when squad id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + 'test'
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
    it('should NOT delete all players for a squad when squad id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundTmntId
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
    it('should delete 0 players for a squad when squad id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + notFoundSquadId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })

  })

  describe('DELETE all players for a tmnt - API: /api/players/player/tmnt/:tmnt_id', () => { 

    const tmntIdForPlayers = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';    

    beforeAll(async () => {
      await postManyPlayers(mockPlayersToPost);
    })

    afterAll(async () => {
      await deleteAllPlayersForTmnt(tmntIdForPlayers)
    })

    it('should delete all players for a tmnt', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + tmntIdForPlayers
        });
        expect(response.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all players for a tmnt when tmnt id is not valid', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + 'test'
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
    it('should NOT delete all players for a tmnt when tmnt id is valid, but not a squad id', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundSquadId
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
    it('should delete 0 players for a tmnt when tmnt id is not found', async () => {
      try {
        const response = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + notFoundTmntId
        });
        expect(response.status).toBe(200);
        expect(response.data.deleted.count).toBe(0);
      } catch (err) {
        expect(true).toBeFalsy();
      }
    })

  })
  
})