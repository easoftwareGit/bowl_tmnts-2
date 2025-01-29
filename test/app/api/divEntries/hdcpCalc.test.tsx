import { divEntriesWithHdcp } from "@/app/api/divEntries/hdcpCalc";
import { divEntryRawType } from "@/lib/types/types";

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
