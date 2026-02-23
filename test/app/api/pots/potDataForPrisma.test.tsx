import type { potType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { potDataForPrisma } from '@/app/api/pots/dataForPrisma';

describe('potDataForPrisma', () => {
  const testPot: potType = cloneDeep(mockTmntFullData.pots[0]);

  it('should return a pot data object with the correct properties', () => {
    const result = potDataForPrisma(testPot);
    expect(result).toEqual({
      id: testPot.id,
      squad_id: testPot.squad_id,
      div_id: testPot.div_id,
      fee: testPot.fee,
      pot_type: testPot.pot_type,
      sort_order: testPot.sort_order,
    });
  });

  it('should handle null input', () => {
    const result = potDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = potDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});