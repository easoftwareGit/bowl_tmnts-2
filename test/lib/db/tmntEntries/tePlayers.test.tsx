import { blankPlayer, initPlayer } from "@/lib/db/initVals";
import { getPlayerRow, playerRowChanged } from "@/lib/db/tmntEntries/players";
import { playerType } from "@/lib/types/types";

describe('tmntEntries.tsx', () => { 

  describe('getPlayerRow', () => {

    it('should map playerEntryData fields to playerType fields with correct values', () => {
      const inputRow = {
        id: '123',
        player_id: 'player123',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 5,
        position: 'Lead',
        lanePos: '5A'
      };
      const squadId = 'squad123';

      const result = getPlayerRow(inputRow, squadId);
      expect(result).toEqual({
        ...initPlayer,
        id: 'player123',
        squad_id: 'squad123', 
        first_name: 'John',
        first_name_err: '',
        last_name: 'Doe',
        last_name_err: '',
        average: 180,
        average_err: '',
        lane: 5,
        lane_err: '',
        position: 'Lead',
        position_err: ''
      });
    });
    it('should preserve numeric values for average and lane without type conversion', () => {
      const inputRow = {
        id: '123',
        player_id: 'player123',
        first_name: 'John',
        last_name: 'Doe',
        average: 200,
        lane: 10,
        position: 'Bowler',
        lanePos: '10B'
      };
      const squadId = 'squad456';

      const result = getPlayerRow(inputRow, squadId);
      expect(result.average).toBe(200);
      expect(result.lane).toBe(10);
    });
    it('should maintain string values for first_name, last_name, and position as-is', () => {
      const inputRow = {
        id: '456',
        player_id: 'player456',
        first_name: 'Alice',
        last_name: 'Smith',
        average: 200,
        lane: 3,
        position: 'Anchor',
        lanePos: '3B'
      };
      const squadId = 'squad456';

      const result = getPlayerRow(inputRow, squadId);
      expect(result.first_name).toBe('Alice');
      expect(result.last_name).toBe('Smith');
      expect(result.position).toBe('Anchor');
    });
  });

  describe('playerRowChanged', () => {
    
    it('should return true when player data is different from original', () => {
      const originalPlayer = {
        ...initPlayer,
        id: '1',
        squad_id: 'squad1',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 1,
        position: 'Lead'
      };

      const modifiedPlayer = {
        ...originalPlayer,
        first_name: 'Jane'
      };

      const players = [originalPlayer];

      const result = playerRowChanged(modifiedPlayer, players);
      expect(result).toBe(true);
    });
    it('should return false when players array is empty', () => {
      const playerRow = {
        ...initPlayer,
        id: '1',
        squad_id: 'squad1',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 1,
        position: 'Lead'
      };

      const result = playerRowChanged(playerRow, []);
      expect(result).toBe(false);
    });
    it('should return false when player data matches original', () => {
      const originalPlayer = {
        ...initPlayer,
        id: '1',
        squad_id: 'squad1',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 1,
        position: 'A'
      };

      const players = [originalPlayer];

      const result = playerRowChanged(originalPlayer, players);
      expect(result).toBe(false);
    });    
    it('should return false when player ID is not found in players array', () => {
      const playerRow = {
        ...blankPlayer,
        id: '2',
        squad_id: 'squad2',
        first_name: 'Jane',
        last_name: 'Smith',
        average: 150,
        lane: 2,
        position: 'A'
      };

      const players = [
        {
          ...blankPlayer,
          id: '1',
          squad_id: 'squad1',
          first_name: 'John',
          last_name: 'Doe',
          average: 180,
          lane: 1,
          position: 'B'
        }
      ];

      const result = playerRowChanged(playerRow, players);
      expect(result).toBe(false);
    });    
    it('should return false when playerRow is undefined', () => {
      const players = [{
        ...blankPlayer,
        id: '1',
        squad_id: 'squad1',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 1,
        position: 'A'
      }];

      const result = playerRowChanged(undefined as unknown as playerType, players);
      expect(result).toBe(false);
    });    
    it('should return false when players array is undefined', () => {
      const playerRow = {
        ...blankPlayer,
        id: '1',
        squad_id: 'squad1',
        first_name: 'John',
        last_name: 'Doe',
        average: 180,
        lane: 1,
        position: 'Lead'
      };

      const result = playerRowChanged(playerRow, undefined as unknown as playerType[]);
      expect(result).toBe(false);
    });
  });
  
});