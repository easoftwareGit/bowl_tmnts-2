import { Bracket } from "@/components/brackets/bracketClass"
import {
  BracketList,
  initBrktCountsType,
} from "@/components/brackets/bracketListClass"
import { createByePlayer } from "../../../../src/components/brackets/byePlayer";
import {
  squadId1,
  playerId8,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe('BracketList constructor', () => {

  describe('constructor ', () => {
           
    const addPlayersToBracket = (bracket: Bracket, players: string[]): void => {
      if (players.length > 0 && ((players.length & 2) === 0)) {
        for (let i = 0; i < players.length; i += 2) {
          bracket.addMatch([players[i], players[i + 1]]);
        }
      }
    };

    describe('no different games, no byePlayer, no copyFrom', () => {

      const testBracketList = new BracketList("test", 2, 3);

      it('should initialize with an empty brackets array when constructed', () => {
        expect(testBracketList.brackets).toHaveLength(0);
      });
      it('brktCounts should return empty values when constructed', () => {
        const result: initBrktCountsType = testBracketList.brktCounts;
        expect(result.forFullValues).toHaveLength(0);
        expect(result.forOneByeValues).toHaveLength(0);
      })
      it('should return the correct # of games', () => {
        const result = testBracketList.games;
        expect(result).toBe(3);
      });
      it('should return the correct # of players per match', () => {
        const result = testBracketList.playersPerMatch;
        expect(result).toBe(2);
      })
      it('should return the correct # of players per bracket', () => {
        const result = testBracketList.playersPerBrkt;
        expect(result).toBe(8);
      })

    });

    describe('passed different games, nobyePlayer, no copyFrom', () => {

      it('should return the bracketList with different gameNumbers', () => {
        const gameNumbers = [4,5,6]        
        const games456Brkt = new BracketList("test", 2, 3, gameNumbers);
        expect(games456Brkt.gameNumbers).toEqual(gameNumbers);
      })
    })

    describe('passed byePlayer, no different gameNumbers, no copyFrom', () => {

      it('should return the bracketList with byePlayer', () => {
        const byePlayer = createByePlayer(squadId1);
        // using undefined for for gameNumbers will use the default value
        const byePlayerBrkt = new BracketList("test", 2, 3, undefined, byePlayer);
        expect(byePlayerBrkt.byePlayer.id).toBe(byePlayer.id);
        expect(byePlayerBrkt.byePlayer.squad_id).toBe(squadId1);
      })
    })

    describe('passed different gameNumbers, byePlayer, passed copyFrom', () => {
      
      it('should return the bracketList with byePlayer and a filled list of brackets', () => {
        let mockBrkts: Bracket[] = [];
        for (let b = 0; b < 8; b++) { // 8 brackets in brktSeeds
          const players: string[] = [];
          for (let s = 0; s < 8; s++) { // 8 players in each bracket in brktSeeds
            players.push(mockTmntFullData.brktSeeds[s].player_id);
          }
          const bracket = new Bracket();
          addPlayersToBracket(bracket, players);          
          mockBrkts.push(bracket);
        }
        const byePlayer = createByePlayer(squadId1);
        const brktList = new BracketList("test", 2, 3, [4,5,6], byePlayer, mockBrkts);
        expect(brktList.byePlayer.id).toBe(byePlayer.id);
        expect(brktList.byePlayer.squad_id).toBe(squadId1);
        expect(brktList.brackets).toHaveLength(8);
        expect(brktList.fullCount).toBe(8);
        expect(brktList.oneByeCount).toBe(0);
        expect(brktList.playersWithRefunds).toBe(false);
        expect(brktList.totalBrackets).toBe(8);
        expect(brktList.totalEntries).toBe((8 * 8) - brktList.oneByeCount); // 8 brackets, 8 players per bracket
      })

      it('should return the bracketList with byePlayer, 4 byePlayer entries and a filled list of brackets', () => {
        let mockBrkts: Bracket[] = [];
        const byePlayer = createByePlayer(squadId1);
        for (let b = 0; b < 8; b++) { // 8 brackets in brktSeeds
          const players: string[] = [];
          for (let s = 0; s < 8; s++) { // 8 players in each bracket in brktSeeds            
            if (b > 4 && mockTmntFullData.brktSeeds[s].player_id === playerId8) {
              players.push(byePlayer.id);
            } else {
              players.push(mockTmntFullData.brktSeeds[s].player_id);
            }
          }
          const bracket = new Bracket();
          addPlayersToBracket(bracket, players);          
          mockBrkts.push(bracket);
        }
        const brktList = new BracketList("test", 2, 3, [4,5,6], byePlayer, mockBrkts);
        expect(brktList.byePlayer.id).toBe(byePlayer.id);
        expect(brktList.byePlayer.squad_id).toBe(squadId1);
        expect(brktList.brackets).toHaveLength(8);
        expect(brktList.fullCount).toBe(5);
        expect(brktList.oneByeCount).toBe(3);
        expect(brktList.playersWithRefunds).toBe(false);
        expect(brktList.totalBrackets).toBe(8);
        expect(brktList.totalEntries).toBe((8 * 8) - brktList.oneByeCount); // 8 brackets, 8 players per bracket
      })

    })
  })
  
});