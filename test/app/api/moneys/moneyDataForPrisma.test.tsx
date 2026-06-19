import type { tmntMoneyType } from '@/lib/types/types';
import { mockTmntFullData } from '../../../mocks/tmnts/tmntFullData/mockTmntFullData';
import { cloneDeep } from 'lodash';
import { tmntMoneyDataForPrisma } from '@/app/api/moneys/moneyDataForPrisma';

describe('tmntMoneyDataForPrisma', () => {
  const testMoney: tmntMoneyType = cloneDeep(mockTmntFullData.moneys[0]);

  it('should return a money data object with the correct properties', () => {
    const result = tmntMoneyDataForPrisma(testMoney);

    expect(result).toEqual({
      id: testMoney.id,
      event_id: testMoney.event_id,
      squad_id: testMoney.squad_id,
      div_id: testMoney.div_id,
      descrip: testMoney.descrip,
      flow: testMoney.flow,
      amount: testMoney.amount || 0,
      pot_id: testMoney.pot_id,
      brkt_id: testMoney.brkt_id,
      elim_id: testMoney.elim_id,
      sort_order: testMoney.sort_order,
    });
  });

  it('should convert null amount to 0', () => {
    const moneyWithNullAmount: tmntMoneyType = {
      ...testMoney,
      amount: null,
    };

    const result = tmntMoneyDataForPrisma(moneyWithNullAmount);

    expect(result?.amount).toBe(0);
  });

  it('should handle null input', () => {
    const result = tmntMoneyDataForPrisma(null as any);

    expect(result).toBeNull();
  });

  it('should return null if passed non object', () => {
    const result = tmntMoneyDataForPrisma('test' as any);

    expect(result).toBeNull();
  });
});