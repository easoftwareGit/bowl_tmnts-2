import { playerType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFulldata/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { playerDataForPrisma } from '@/app/api/players/dataForPrisma';

describe('playerDataForPrisma', () => {
  const testPlayer: playerType = cloneDeep(mockTmntFullData.players[0]);

  it('should return an player data object with the correct properties', () => {
    const result = playerDataForPrisma(testPlayer);
    expect(result).toEqual({
      id: testPlayer.id,
      squad_id: testPlayer.squad_id,
      first_name: testPlayer.first_name,
      last_name: testPlayer.last_name,
      average: testPlayer.average,
      lane: testPlayer.lane,
      position: testPlayer.position,
    });
  });

  it('should handle null input', () => {
    const result = playerDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = playerDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});