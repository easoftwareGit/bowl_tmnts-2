import { elimType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { elimDataForPrisma } from '@/app/api/elims/dataForPrisma';

describe('elimDataForPrisma', () => {
  const testElim: elimType = cloneDeep(mockTmntFullData.elims[0]);

  it('should return an elim data object with the correct properties', () => {
    const result = elimDataForPrisma(testElim);
    expect(result).toEqual({
      id: testElim.id,
      div_id: testElim.div_id,
      squad_id: testElim.squad_id,
      start: testElim.start,
      games: testElim.games,
      fee: testElim.fee,
      sort_order: testElim.sort_order
    });
  });

  it('should handle null input', () => {
    const result = elimDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = elimDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});