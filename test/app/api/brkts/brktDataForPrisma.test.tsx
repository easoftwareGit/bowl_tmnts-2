import type { brktType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { brktDataForPrisma } from '@/app/api/brkts/dataForPrisma';

describe('brktDataForPrisma', () => {
  const testBrkt: brktType = cloneDeep(mockTmntFullData.brkts[0]);

  it('should return an brkt data object with the correct properties', () => {
    const result = brktDataForPrisma(testBrkt);
    expect(result).toEqual({
      id: testBrkt.id,
      div_id: testBrkt.div_id,
      squad_id: testBrkt.squad_id,
      fee: testBrkt.fee,
      start: testBrkt.start,
      games: testBrkt.games,
      players: testBrkt.players,
      first: testBrkt.first,
      second: testBrkt.second,
      admin: testBrkt.admin,      
      sort_order: testBrkt.sort_order
    });
  });

  it('should handle null input', () => {
    const result = brktDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = brktDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});