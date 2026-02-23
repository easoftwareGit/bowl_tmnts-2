import { calcHandicap, divEntriesWithHdcp } from "@/app/api/divEntries/calcHdcp";
import type { divEntryRawType } from "@/lib/types/types";

describe('calcHandicap', () => {

  it('should calculate integer HDCP when int_hdcp is true and player average is less than div HDCP from', () => {
    const result = calcHandicap(179, 200, 0.8, true);
    expect(result).toBe(16);
  });
  it('should calculate non-integer HDCP when int_hdcp is false and player average is less than div HDCP from', () => {    
    const result = calcHandicap(183, 200, 0.8, false);
    expect(result).toBe(13.6);
  });
  it('should return 0 when player average equals div HDCP from value', () => {
    const result = calcHandicap(200, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when player average is greater than div HDCP from value', () => {
    const result = calcHandicap(220, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcp_per is 0', () => {
    const result = calcHandicap(180, 200, 0, false);
    expect(result).toBe(0);
  });

  it('should return 0 when average is null', () => {
    const result = calcHandicap(null as any, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when average is undefined', () => {
    const result = calcHandicap(undefined as any, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when avarege is NaN', () => {
    const result = calcHandicap(NaN, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when average is Infinity', () => {
    const result = calcHandicap(Infinity, 200, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when average is negative', () => {
    const result = calcHandicap(-1, 200, 0.8, false);
    expect(result).toBe(0);
  });

  it('should return 0 when hdcpFrom is null', () => {
    const result = calcHandicap(180, null as any, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpFrom is undefined', () => {
    const result = calcHandicap(180, undefined as any, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpFrom is NaN', () => {
    const result = calcHandicap(180, NaN, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpFrom is Infinity', () => {
    const result = calcHandicap(180, Infinity, 0.8, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpFrom is negative', () => {
    const result = calcHandicap(180, -1, 0.8, false);
    expect(result).toBe(0);
  });
  
  it('should return 0 when hdcpPer is null', () => {
    const result = calcHandicap(180, 200, null as any, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpPer is undefined', () => {
    const result = calcHandicap(180, 200, undefined as any, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpPer is NaN', () => {
    const result = calcHandicap(180, 200, NaN, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpPer is Infinity', () => {
    const result = calcHandicap(180, 200, Infinity, false);
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpPer is negative', () => {
    const result = calcHandicap(180, 200, -1, false);
    expect(result).toBe(0);
  });

  it('should return 0 when intHdcp is null', () => {
    const result = calcHandicap(180, 200, 0.8, null as any);
    expect(result).toBe(0);
  });
  it('should return 0 when intHdcp is undefined', () => {
    const result = calcHandicap(180, 200, 0.8, undefined as any);
    expect(result).toBe(0);
  });
  it('should return 0 when intHdcp is mot a boolean', () => {
    const result = calcHandicap(180, 200, NaN, 'false' as any);
    expect(result).toBe(0);
  });

  it('should return 0 when hdcpFor is null', () => {
    const result = calcHandicap(180, 200, 0.8, false, null as any);
    expect(result).toBe(0);
  });
  it('should return 13.6 when hdcpFor is undefined', () => {
    const result = calcHandicap(183, 200, 0.8, false, undefined as any);
    expect(result).toBe(13.6);
  });
  it('should return 0 when hdcpFor is invalid type', () => {
    const result = calcHandicap(180, 200, 0.8, false, 'something');
    expect(result).toBe(0);
  });
  it('should return 0 when hdcpFor is not a string', () => {
    const result = calcHandicap(180, 200, 0.8, false, 123 as any);
    expect(result).toBe(0);
  });

  it('should return 0 when games is null', () => {
    const result = calcHandicap(180, 200, 0.8, false, 'Game', null as any);
    expect(result).toBe(0);
  });
  it('should return 13.6 when games is undefined', () => {
    const result = calcHandicap(183, 200, 0.8, false, 'Game', undefined as any);
    expect(result).toBe(13.6);
  });
  it('should return 0 when games is NaN', () => {
    const result = calcHandicap(180, 200, 0.8, false, 'Game', NaN);
    expect(result).toBe(0);
  });
  it('should return 0 when games is Infinity', () => {
    const result = calcHandicap(180, 200, 0.8, false, 'Game', Infinity);
    expect(result).toBe(0);
  });
  it('should return 0 when games is zero', () => {
    const result = calcHandicap(180, 200, 0.8, false, 'Game', 0);
    expect(result).toBe(0);
  });
})

describe('divEntriesWithHdcp', () => {

  it('should calculate HDCP when player average is less than div HDCP from value', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1', 
      player_id: 'player1',
      fee: 50,
      player: {
        average: 180
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 0.8,
        int_hdcp: true
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(16);
  });
  it('should return empty array when input array is empty', () => {
    const input: divEntryRawType[] = [];

    const result = divEntriesWithHdcp(input);

    expect(result).toEqual([]);
  });
  it('should return 0 HDCP when player average equals div HDCP from value', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1', 
      player_id: 'player1',
      fee: 50,
      player: {
        average: 200
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 0.8,
        int_hdcp: true
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(0);
  });
  it('should calculate integer HDCP when div.int_hdcp is true and player average is less than div HDCP from', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1',
      player_id: 'player1',
      fee: 50,
      player: {
        average: 180
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 0.8,
        int_hdcp: true
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(16);
  });
  it('should calculate decimal HDCP when div.int_hdcp is false and player average is less than div HDCP from', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1',
      player_id: 'player1',
      fee: 50,
      player: {
        average: 180
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 0.8,
        int_hdcp: false
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(16);
  });
  it('should return hdcp of 0 when div.hdcp_per is 0', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1',
      player_id: 'player1',
      fee: 50,
      player: {
        average: 180
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 0,
        int_hdcp: true
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(0);
  });
  it('should calculate HDCP correctly when div.hdcp_per is 1', () => {
    const input = [{
      id: '1',
      squad_id: 'squad1',
      div_id: 'div1',
      player_id: 'player1',
      fee: 50,
      player: {
        average: 180
      },
      div: {
        hdcp_from: 200,
        hdcp_per: 1,
        int_hdcp: true
      }
    }];

    const result = divEntriesWithHdcp(input);

    expect(result[0].hdcp).toBe(20);
  });
});
