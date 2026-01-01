import { brktEntryType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { brktEntryDataForPrisma } from '@/app/api/brktEntries/dataForPrisma';

describe('eventDataForPrisma', () => {
  const testBrktEntry: brktEntryType = cloneDeep(mockTmntFullData.brktEntries[0]);

  it('should return an event data object with the correct properties', () => {
    const result = brktEntryDataForPrisma(testBrktEntry);
    expect(result).toEqual({
      id: testBrktEntry.id,
      brkt_id: testBrktEntry.brkt_id,
      player_id: testBrktEntry.player_id,
      num_brackets: testBrktEntry.num_brackets,
      num_refunds: testBrktEntry.num_refunds,
      time_stamp: new Date(testBrktEntry.time_stamp),
    });
  });

  it('should handle null input', () => {
    const result = brktEntryDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = brktEntryDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});