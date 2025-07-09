import axios, { AxiosError } from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import { playerType, tmntEntryPlayerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { mockPlayersToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteAllPlayersForSquad, deleteAllPlayersForTmnt, deletePlayer, getAllPlayersForSquad, getAllPlayersForTmnt, postManyPlayers, postPlayer, putManyPlayers, putPlayer } from "@/lib/db/players/dbPlayers";
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

const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const notFoundId = "ply_00000000000000000000000000000000";
const notFoundTmntId = 'tmt_00000000000000000000000000000000';
const notFoundSquadId = 'sqd_00000000000000000000000000000000';

const playersToGet: playerType[] = [
  {
    ...initPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_be57bef21fc64d199c2f6de4408bd136",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 1,
    position: "B",
  },
  {
    ...initPlayer,
    id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Olivia",
    last_name: "Morgan",
    average: 210,
    lane: 1,
    position: "C",
  },
  {
    ...initPlayer,
    id: "ply_89be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Joan",
    last_name: "Doe",
    average: 200,
    lane: 1,
    position: "D",
  },
  {
    ...initPlayer,
    id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "William",
    last_name: "Harris",
    average: 211,
    lane: 2,
    position: "E",
  },
  {
    ...initPlayer,
    id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Dope",
    average: 219,
    lane: 2,
    position: "F",
  },
  {
    ...initPlayer,
    id: "ply_bb1fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Jane",
    last_name: "Dope",
    average: 201,
    lane: 2,
    position: "G",
  },
  {
    ...initPlayer,
    id: "ply_bb2fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Bob",
    last_name: "Smith",
    average: 222,
    lane: 2,
    position: "H",
  },
]

describe('dbPlayers', () => { 

  const rePostPlayer = async (player: playerType) => {
    try {
      // if player already in database, then don't re-post
      const getResponse = await axios.get(onePlayerUrl + player.id);
      const found = getResponse.data.player;
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
      const playerJSON = JSON.stringify(player);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: playerJSON
      });    
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('getAllPlayersForTmnt()', () => { 

    it('should get all players for tmnt', async () => { 
      const players = await getAllPlayersForTmnt(tmntId);
      expect(players).toHaveLength(playersToGet.length);
      if (!players) return;
      for (let i = 0; i < players.length; i++) {
        if (players[i].id === playersToGet[0].id) {
          expect(players[i].id).toEqual(playersToGet[0].id);
          expect(players[i].squad_id).toEqual(playersToGet[0].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[0].first_name);
          expect(players[i].last_name).toEqual(playersToGet[0].last_name);
          expect(players[i].average).toEqual(playersToGet[0].average);
          expect(players[i].lane).toEqual(playersToGet[0].lane);
          expect(players[i].position).toEqual(playersToGet[0].position);
        } else if (players[i].id === playersToGet[1].id) {
          expect(players[i].id).toEqual(playersToGet[1].id);
          expect(players[i].squad_id).toEqual(playersToGet[1].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[1].first_name);
          expect(players[i].last_name).toEqual(playersToGet[1].last_name);
          expect(players[i].average).toEqual(playersToGet[1].average);
          expect(players[i].lane).toEqual(playersToGet[1].lane);
          expect(players[i].position).toEqual(playersToGet[1].position);
        } else if (players[i].id === playersToGet[2].id) {
          expect(players[i].id).toEqual(playersToGet[2].id);
          expect(players[i].squad_id).toEqual(playersToGet[2].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[2].first_name);
          expect(players[i].last_name).toEqual(playersToGet[2].last_name);
          expect(players[i].average).toEqual(playersToGet[2].average);
          expect(players[i].lane).toEqual(playersToGet[2].lane);
          expect(players[i].position).toEqual(playersToGet[2].position);
        } else if (players[i].id === playersToGet[3].id) {
          expect(players[i].id).toEqual(playersToGet[3].id);
          expect(players[i].squad_id).toEqual(playersToGet[3].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[3].first_name);
          expect(players[i].last_name).toEqual(playersToGet[3].last_name);
          expect(players[i].average).toEqual(playersToGet[3].average);
          expect(players[i].lane).toEqual(playersToGet[3].lane);
          expect(players[i].position).toEqual(playersToGet[3].position);
        } else if (players[i].id === playersToGet[4].id) {
          expect(players[i].id).toEqual(playersToGet[4].id);
          expect(players[i].squad_id).toEqual(playersToGet[4].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[4].first_name);
          expect(players[i].last_name).toEqual(playersToGet[4].last_name);
          expect(players[i].average).toEqual(playersToGet[4].average);
          expect(players[i].lane).toEqual(playersToGet[4].lane);
          expect(players[i].position).toEqual(playersToGet[4].position);
        } else if (players[i].id === playersToGet[5].id) {
          expect(players[i].id).toEqual(playersToGet[5].id);
          expect(players[i].squad_id).toEqual(playersToGet[5].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[5].first_name);
          expect(players[i].last_name).toEqual(playersToGet[5].last_name);
          expect(players[i].average).toEqual(playersToGet[5].average);
          expect(players[i].lane).toEqual(playersToGet[5].lane);
          expect(players[i].position).toEqual(playersToGet[5].position);
        } else if (players[i].id === playersToGet[6].id) {
          expect(players[i].id).toEqual(playersToGet[6].id);
          expect(players[i].squad_id).toEqual(playersToGet[6].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[6].first_name);
          expect(players[i].last_name).toEqual(playersToGet[6].last_name);
          expect(players[i].average).toEqual(playersToGet[6].average);
          expect(players[i].lane).toEqual(playersToGet[6].lane);
          expect(players[i].position).toEqual(playersToGet[6].position);
        } else if (players[i].id === playersToGet[7].id) {
          expect(players[i].id).toEqual(playersToGet[7].id);
          expect(players[i].squad_id).toEqual(playersToGet[7].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[7].first_name);
          expect(players[i].last_name).toEqual(playersToGet[7].last_name);
          expect(players[i].average).toEqual(playersToGet[7].average);
          expect(players[i].lane).toEqual(playersToGet[7].lane);
          expect(players[i].position).toEqual(playersToGet[7].position);
        } else {expect(false).toBe(true)}
      }
    })
    it('should return 0 players for not found tmnt', async () => { 
      const players = await getAllPlayersForTmnt(notFoundTmntId);
      expect(players).toHaveLength(0);
    })
    it('should return null if tmmt id is invalid', async () => { 
      const players = await getAllPlayersForTmnt("test");
      expect(players).toBeNull();
    })
    it('should return null if tmnt id is a valid id, but not a tmnt id', async () => {
      const players = await getAllPlayersForTmnt(notFoundSquadId);
      expect(players).toBeNull();
    }
    )
    it('should return null if tmnt id is null', async () => { 
      const players = await getAllPlayersForTmnt(null as any);
      expect(players).toBeNull();
    })
    it('should return null if tmnt id is undefined', async () => { 
      const players = await getAllPlayersForTmnt(undefined as any);
      expect(players).toBeNull();
    })
  })  

  describe('getAllPlayersForSquad()', () => {

    it('should get all players for squad', async () => { 
      const players = await getAllPlayersForSquad(squadId);
      expect(players).toHaveLength(playersToGet.length);
      if (!players) return;
      for (let i = 0; i < players.length; i++) {
        expect(players[i].id).toEqual(playersToGet[i].id);
        expect(players[i].squad_id).toEqual(playersToGet[i].squad_id);
        expect(players[i].first_name).toEqual(playersToGet[i].first_name);
        expect(players[i].last_name).toEqual(playersToGet[i].last_name);
        expect(players[i].average).toEqual(playersToGet[i].average);
        expect(players[i].lane).toEqual(playersToGet[i].lane);
        expect(players[i].position).toEqual(playersToGet[i].position);
      }
    })
    it('should return 0 players for not found squad', async () => { 
      const players = await getAllPlayersForSquad(notFoundSquadId);
      expect(players).toHaveLength(0);
    })
    it('should return null if squad id is invalid', async () => { 
      const players = await getAllPlayersForSquad("test");
      expect(players).toBeNull();
    })
    it('should return null if squad id is a valid id, but not a squad id', async () => {
      const players = await getAllPlayersForSquad(notFoundTmntId);
      expect(players).toBeNull();
    }
    )
    it('should return null if squad id is null', async () => { 
      const players = await getAllPlayersForSquad(null as any);
      expect(players).toBeNull();
    })
    it('should return null if squad id is undefined', async () => { 
      const players = await getAllPlayersForSquad(undefined as any);
      expect(players).toBeNull();
    })

  })

  describe('postPlayer()', () => { 

    const playerToPost = {
      ...initPlayer,    
      id: "ply_000fd8bbd9e34d34a7fa90b4111c6e40",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "Jim", 
      last_name: "Green",
      average: 201,
      lane: 3,
      position: 'Z',
  }

    let createdPlayer = false;

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
      const postedPlayer = await postPlayer(playerToPost);
      expect(postedPlayer).not.toBeNull();
      if (!postedPlayer) return;
      createdPlayer = true;
      expect(postedPlayer.id).toEqual(playerToPost.id);
      expect(postedPlayer.squad_id).toEqual(playerToPost.squad_id);
      expect(postedPlayer.first_name).toEqual(playerToPost.first_name);
      expect(postedPlayer.last_name).toEqual(playerToPost.last_name);
      expect(postedPlayer.average).toEqual(playerToPost.average);
      expect(postedPlayer.lane).toEqual(playerToPost.lane);
      expect(postedPlayer.position).toEqual(playerToPost.position);      
    })
    it('should post a sanitzed player', async () => { 
      const toSanitizse = {
        ...playerToPost,
        first_name: '<script>alert("xss")</script>',
        last_name: '    abcdef***',
        average: 100,
        lane: 2,
        position: ' Z*'
      }
      const postedPlayer = await postPlayer(toSanitizse);
      expect(postedPlayer).not.toBeNull();
      if (!postedPlayer) return;
      createdPlayer = true;
      expect(postedPlayer.id).toEqual(toSanitizse.id);
      expect(postedPlayer.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedPlayer.first_name).toEqual('alertxss');
      expect(postedPlayer.last_name).toEqual('abcdef');
      expect(postedPlayer.average).toEqual(toSanitizse.average);
      expect(postedPlayer.lane).toEqual(toSanitizse.lane);
      expect(postedPlayer.position).toEqual('Z');
    })
    it('should not post a player if got invalid data', async () => { 
      const invalidPlayer = {
        ...playerToPost,
        lane: -1
      }
      const postedPlayer = await postPlayer(invalidPlayer);
      expect(postedPlayer).toBeNull();
    })
  })

  describe('postManyPlayers()', () => { 

    let createdPlayers = false;
    const squadId = 'sqd_42be0f9d527e4081972ce8877190489d'

    beforeAll(async () => {
      await deleteAllPlayersForSquad(squadId);
    })

    beforeEach(() => {
      createdPlayers = false;
    })

    afterEach(async () => {
      if (createdPlayers) {
        await deleteAllPlayersForSquad(squadId);
      }
    })

    afterAll(async () => {
      await deleteAllPlayersForSquad(squadId);
    })

    it('should post many players', async () => {
      const players = await postManyPlayers(mockPlayersToPost);
      expect(players).not.toBeNull();
      if (!players) return;
      createdPlayers = true;
      expect(players.length).toEqual(mockPlayersToPost.length);
      for (let i = 0; i < mockPlayersToPost.length; i++) {
        expect(players[i].id).toEqual(mockPlayersToPost[i].id);
        expect(players[i].squad_id).toEqual(mockPlayersToPost[i].squad_id);
        expect(players[i].first_name).toEqual(mockPlayersToPost[i].first_name);
        expect(players[i].last_name).toEqual(mockPlayersToPost[i].last_name);
        expect(players[i].average).toEqual(mockPlayersToPost[i].average);
        expect(players[i].lane).toEqual(mockPlayersToPost[i].lane);
        expect(players[i].position).toEqual(mockPlayersToPost[i].position);
      }
    })
    it('should post many players with sanitization', async () => {
      const toSanitize = cloneDeep(mockPlayersToPost)
      toSanitize[0].first_name = '  ' + toSanitize[0].first_name + '  '
      toSanitize[0].last_name = '***' + toSanitize[0].last_name + '***'
      toSanitize[0].position = ' A*'
      const players = await postManyPlayers(toSanitize);
      expect(players).not.toBeNull();
      if (!players) return;
      createdPlayers = true;
      expect(players.length).toEqual(toSanitize.length);
      for (let i = 0; i < toSanitize.length; i++) {
        expect(players[i].first_name).toEqual(mockPlayersToPost[i].first_name);
        expect(players[i].last_name).toEqual(mockPlayersToPost[i].last_name);
        expect(players[i].position).toEqual(mockPlayersToPost[i].position);
      }
    })
    it('should not post many players with no data', async () => {
      const postedPlayers = await postManyPlayers([]);
      expect(postedPlayers).not.toBeNull();
      expect(postedPlayers).toHaveLength(0);
    })
    it('should not post many players with invalid data', async () => {
      const invalidPlayers = cloneDeep(mockPlayersToPost);
      invalidPlayers[0].lane = -1;
      const postedPlayers = await postManyPlayers(invalidPlayers);
      expect(postedPlayers).toBeNull();
    })
    
  })    

  describe('putPlayer()', () => {

    const playerToPut = {
      ...initPlayer,
      id: "ply_88be0472be3d476ea1caa99dd05953fa",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "Steve",
      last_name: "Smith",
      average: 176,
      lane: 5,
      position: 'C',
    }

    const putUrl = onePlayerUrl + playerToPut.id;

    const resetPlayer = {
      ...initPlayer,
      id: "ply_88be0472be3d476ea1caa99dd05953fa",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "John",
      last_name: "Doe",
      average: 220,
      lane: 1,
      position: 'A',
    }

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetPlayer);
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: putUrl,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

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

    it('should put a player', async () => {
      const puttedPlayer = await putPlayer(playerToPut);
      expect(puttedPlayer).not.toBeNull();
      if (!puttedPlayer) return;
      didPut = true;
      expect(puttedPlayer.first_name).toBe(playerToPut.first_name);
      expect(puttedPlayer.last_name).toBe(playerToPut.last_name);
      expect(puttedPlayer.average).toBe(playerToPut.average);
      expect(puttedPlayer.lane).toBe(playerToPut.lane);
      expect(puttedPlayer.position).toBe(playerToPut.position);
    })
    it('shouyld NOT put a player with invalid data', async () => {
      const invalidPlayer = {
        ...playerToPut,
        lane: -1,
      }
      const puttedPlayer = await putPlayer(invalidPlayer);
      expect(puttedPlayer).toBeNull();
    })
    
  })

  describe('putManyPlayers()', () => { 
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
      createdPlayers = true;
      const postedPlayers = await postManyPlayers(mockPlayersToPost);
      expect(postedPlayers).not.toBeNull();
      if (!postedPlayers) return;
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
      const updateInfo = await putManyPlayers(allToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(2);
      expect(updateInfo.inserts).toBe(2);
      expect(updateInfo.deletes).toBe(2);
    })
    it('should update many players - sanitized first and last names', async () => {      

      createdPlayers = true;
      const postedPlayers = await postManyPlayers(mockPlayersToPost);
      expect(postedPlayers).not.toBeNull();
      if (!postedPlayers) return;
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
      
      const allToUpdate = [...playersToUpdate];
      const updateInfo = await putManyPlayers(allToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
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
    it('should return no updates, inserts or delete if no changes', async () => {      
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
      createdPlayers = true;
      const postedPlayers = await postManyPlayers(mockPlayersToPost);
      expect(postedPlayers).not.toBeNull();
      if (!postedPlayers) return;
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);
      
      const playersToUpdate: tmntEntryPlayerType[] = [];      
      const updateInfo = await putManyPlayers(playersToUpdate);
      expect(updateInfo).not.toBeNull();
      if (!updateInfo) return;
      expect(updateInfo.updates).toBe(0);
      expect(updateInfo.inserts).toBe(0);
      expect(updateInfo.deletes).toBe(0);
    })
    it('should update no players when error in data', async () => {      
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
      createdPlayers = true;
      const postedPlayers = await postManyPlayers(mockPlayersToPost);
      expect(postedPlayers).not.toBeNull();
      if (!postedPlayers) return;
      expect(postedPlayers.length).toBe(mockPlayersToPost.length);

      // change average, add eType = 'u'
      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: 333,    // invalid average
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
      const updateInfo = await putManyPlayers(allToUpdate);
      expect(updateInfo).toBeNull();
    })
    
  })

  describe('deletePlayer()', () => { 

    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initPlayer,
      id: "ply_91c5aa1c14644e03b6735abd1480ee32",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      first_name: "Mia",
      last_name: "Clark",
      average: 190,
      lane: 1,
      position: "Y"
    }

    let didDel = false;

    beforeAll(async () => {     
      await rePostPlayer(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPlayer(toDel);
      }
    });

    it('should delete a player', async () => {
      const deleted = await deletePlayer(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    })
    it('should not delete a player when id is not found', async () => {
      const deleted = await deletePlayer(notFoundId);
      expect(deleted).toBe(-1);
    })
    it('should not delete a player when id is invalid', async () => {
      const deleted = await deletePlayer("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete a player when id is null', async () => {
      const deleted = await deletePlayer(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete a player when id is undefined', async () => {
      const deleted = await deletePlayer(undefined as any);
      expect(deleted).toBe(-1);   
    })    
  })

  describe('deleteAllTmntPlayers()', () => { 

    const delPlayerTmntId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const players = response.data.players;
      const foundToDel = players.find(
        (p: playerType) => p.id === mockPlayersToPost[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPlayers(mockPlayersToPost);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests
    });

    it('should delete all players for a tmnt', async () => {
      const deleted = await deleteAllPlayersForTmnt(delPlayerTmntId);
      expect(deleted).toBe(mockPlayersToPost.length);
      didDel = true;
    })
    it('should not delete all players for a tmnt when tmnt id is not found', async () => {
      const deleted = await deleteAllPlayersForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should not delete all players for a tmnt when tmnt id is invalid', async () => {
      const deleted = await deleteAllPlayersForTmnt("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a tmnt when tmnt id is valid, but not a tmnt id', async () => {
      const deleted = await deleteAllPlayersForTmnt(notFoundSquadId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a tmnt when tmnt id is null', async () => {
      const deleted = await deleteAllPlayersForTmnt(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a tmnt when tmnt id is undefined', async () => {
      const deleted = await deleteAllPlayersForTmnt(undefined as any);
      expect(deleted).toBe(-1);
    })
    
  })

  describe('deleteAllSquadPlayers()', () => { 

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const players = response.data.players;
      const foundToDel = players.find(
        (p: playerType) => p.id === mockPlayersToPost[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPlayers(mockPlayersToPost);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    })
    
    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests      
    });

    it('should delete all players for a squad', async () => { 
      const deleted = await deleteAllPlayersForSquad(mockPlayersToPost[0].squad_id);
      expect(deleted).toBe(mockPlayersToPost.length);
      didDel = true;
    })
    it('should not delete all players for a squad when squad id is not found', async () => {
      const deleted = await deleteAllPlayersForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    })  
    it('should not delete all players for a squad when squad id is invalid', async () => { 
      const deleted = await deleteAllPlayersForSquad("test");
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a squad when squad id is valid, but not a squad id', async () => { 
      const deleted = await deleteAllPlayersForSquad(notFoundTmntId);
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a squad when squad id is null', async () => { 
      const deleted = await deleteAllPlayersForSquad(null as any);
      expect(deleted).toBe(-1);
    })
    it('should not delete all players for a squad when squad id is undefined', async () => { 
      const deleted = await deleteAllPlayersForSquad(undefined as any);
      expect(deleted).toBe(-1);
    })

  })

})