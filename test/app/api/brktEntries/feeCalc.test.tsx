import { brktEntriesWithFee } from "@/app/api/brktEntries/feeCalc";
import { brktEntriesFromPrisa } from "@/lib/types/types";

describe('brktEntriesWithFee', () => { 

  it('should calculate the fee for each brktEntry', () => { 
    const input: brktEntriesFromPrisa[] = [
      {
        id: '1',
        brkt_id: 'brkt_1',
        player_id: 'player_1',
        num_brackets: 8,
        time_stamp: new Date(),
        brkt: {
          fee: 5
        }
      }      
    ]

    const result = brktEntriesWithFee(input);
    expect(result[0].fee).toBe(40);
  })
  it('shoudd return empty array when input array is empty', () => { 
    const input: brktEntriesFromPrisa[] = [];
    const result = brktEntriesWithFee(input);
    expect(result).toEqual([]);
  })
  it('should return 0 fee when num_brackets is 0', () => { 
    const input: brktEntriesFromPrisa[] = [
      {
        id: '1',
        brkt_id: 'brkt_1',
        player_id: 'player_1',
        num_brackets: 0,
        time_stamp: new Date(),
        brkt: {
          fee: 5
        }
      }      
    ]

    const result = brktEntriesWithFee(input);
    expect(result[0].fee).toBe(0);
  })
  it('should return 0 fee when num_brackets is null', () => { 
    const input: brktEntriesFromPrisa[] = [
      {
        id: '1',
        brkt_id: 'brkt_1',
        player_id: 'player_1',
        num_brackets: null as any,
        time_stamp: new Date(),
        brkt: {
          fee: 5
        }
      }      
    ]

    const result = brktEntriesWithFee(input);
    expect(result[0].fee).toBe(0);
  })
  it('should return 0 fee when brkt.fee is null', () => { 
    const input: brktEntriesFromPrisa[] = [
      {
        id: '1',
        brkt_id: 'brkt_1',
        player_id: 'player_1',
        num_brackets: 8,
        time_stamp: new Date(),
        brkt: {
          fee: null as any
        }
      }      
    ]

    const result = brktEntriesWithFee(input);
    expect(result[0].fee).toBe(0);
  })

})