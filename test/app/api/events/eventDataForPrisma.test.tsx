import { eventType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { eventDataForPrisma } from '@/app/api/events/dataForPrisma';

describe('eventDataForPrisma', () => {
  const testEvent: eventType = cloneDeep(mockTmntFullData.events[0]);

  it('should return an event data object with the correct properties', () => {
    const result = eventDataForPrisma(testEvent);
    expect(result).toEqual({
      id: testEvent.id,
      tmnt_id: testEvent.tmnt_id,
      event_name: testEvent.event_name,
      team_size: testEvent.team_size,
      games: testEvent.games,
      entry_fee: testEvent.entry_fee,
      lineage: testEvent.lineage,
      prize_fund: testEvent.prize_fund,
      other: testEvent.other,
      expenses: testEvent.expenses,
      added_money: testEvent.added_money,
      sort_order: testEvent.sort_order,
    });
  });

  it('should handle null input', () => {
    const result = eventDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if passed non object', () => { 
    const result = eventDataForPrisma('test' as any);
    expect(result).toBeNull();
  })  
});