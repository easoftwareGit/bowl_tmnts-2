import { potEntryType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFulldata/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { potEntryDataForPrisma } from '@/app/api/potEntries/dataForPrisma';

describe('eventDataForPrisma', () => {
  const testPotEntry: potEntryType = cloneDeep(mockTmntFullData.potEntries[0]);

  it('should return an poyEntry data object with the correct properties', () => {
    const result = potEntryDataForPrisma(testPotEntry);
    expect(result).toEqual({
      id: testPotEntry.id,
      pot_id: testPotEntry.pot_id,
      player_id: testPotEntry.player_id,
      fee: testPotEntry.fee
    });
  });

  it('should handle null input', () => {
    const result = potEntryDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = potEntryDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});