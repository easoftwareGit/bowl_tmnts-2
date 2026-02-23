import type { elimEntryType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { elimEntryDataForPrisma } from '@/app/api/elimEntries/dataForPrisma';

describe('eventDataForPrisma', () => {
  const testElimEntry: elimEntryType = cloneDeep(mockTmntFullData.elimEntries[0]);

  it('should return an event data object with the correct properties', () => {
    const result = elimEntryDataForPrisma(testElimEntry);
    expect(result).toEqual({
      id: testElimEntry.id,
      elim_id: testElimEntry.elim_id,
      player_id: testElimEntry.player_id,
      fee: testElimEntry.fee
    });
  });

  it('should handle null input', () => {
    const result = elimEntryDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = elimEntryDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});