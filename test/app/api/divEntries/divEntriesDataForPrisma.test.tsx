import { divEntryType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFulldata/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { divEntryDataForPrisma } from '@/app/api/divEntries/dataForPrisma';

describe('eventDataForPrisma', () => {
  const testDivEntry: divEntryType = cloneDeep(mockTmntFullData.divEntries[0]);

  it('should return an event data object with the correct properties', () => {
    const result = divEntryDataForPrisma(testDivEntry);
    expect(result).toEqual({
      id: testDivEntry.id,
      squad_id: testDivEntry.squad_id,
      div_id: testDivEntry.div_id,
      player_id: testDivEntry.player_id,
      fee: testDivEntry.fee
    });
  });

  it('should handle null input', () => {
    const result = divEntryDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = divEntryDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});