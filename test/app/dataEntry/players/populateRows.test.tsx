import { exportedForTesting } from "@/app/dataEntry/editPlayers/[tmntId]/page";
import { mockOrigData } from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import { divEntryHdcpColName, entryFeeColName, entryNumBrktsColName, timeStampColName } from "@/app/dataEntry/playersForm/createColumns";

const { populateRows } = exportedForTesting

describe('populateRows', () => { 

  it('should create columns', () => { 

    const rows = populateRows(mockOrigData);
    const columnNames = Object.keys(rows[0]);
    // 8 player, 2 divEntry, 1 potEntry, 8 brktEntry, 2 elimEntry, 1 total
    // 8 + 2 + 1 + 6 + 2 + 1 = 20
    expect(columnNames).toHaveLength(20); 
    // player columns
    expect(rows[0].id).toBeDefined();
    expect(rows[0].player_id).toBeDefined();
    expect(rows[0].first_name).toBeDefined();
    expect(rows[0].last_name).toBeDefined();
    expect(rows[0].average).toBeDefined();
    expect(rows[0].lane).toBeDefined();
    expect(rows[0].position).toBeDefined();
    expect(rows[0].lanePos).toBeDefined();
    // divEntry columns    
    expect(rows[0][entryFeeColName(mockOrigData.divEntries[0].div_id)]).toBeDefined();    
    expect(rows[0][divEntryHdcpColName(mockOrigData.divEntries[0].div_id)]).toBeDefined();
    // potEntry column
    expect(rows[0][entryFeeColName(mockOrigData.potEntries[0].pot_id)]).toBeDefined();
    // brktEntry columns
    expect(rows[0][entryNumBrktsColName(mockOrigData.brktEntries[0].brkt_id)]).toBeDefined();
    expect(rows[0][entryFeeColName(mockOrigData.brktEntries[0].brkt_id)]).toBeDefined();
    expect(rows[0][timeStampColName(mockOrigData.brktEntries[0].brkt_id)]).toBeDefined();
    expect(rows[0][entryNumBrktsColName(mockOrigData.brktEntries[1].brkt_id)]).toBeDefined();
    expect(rows[0][entryFeeColName(mockOrigData.brktEntries[1].brkt_id)]).toBeDefined();    
    expect(rows[0][timeStampColName(mockOrigData.brktEntries[1].brkt_id)]).toBeDefined();    
    // elimEntry columns
    expect(rows[0][entryFeeColName(mockOrigData.elimEntries[0].elim_id)]).toBeDefined();
    expect(rows[0][entryFeeColName(mockOrigData.elimEntries[1].elim_id)]).toBeDefined();
    // total column
    expect(rows[0].feeTotal).toBeDefined();
  })
  it('should create rows', () => { 

    const rows = populateRows(mockOrigData);
    expect(rows).toHaveLength(6);  // 6 players
  })
  it('should populate rows with player data', () => { 

    const rows = populateRows(mockOrigData);    
    expect(rows).toHaveLength(6);  // 6 players

    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].id).toBe(mockOrigData.players[i].id);
      expect(rows[i].player_id).toBe(mockOrigData.players[i].id);
      expect(rows[i].first_name).toBe(mockOrigData.players[i].first_name);
      expect(rows[i].last_name).toBe(mockOrigData.players[i].last_name);
      expect(rows[i].average).toBe(mockOrigData.players[i].average);
      expect(rows[i].lane).toBe(mockOrigData.players[i].lane);
      expect(rows[i].position).toBe(mockOrigData.players[i].position);
    }
  })
  it('should populate rows with div entry data', () => { 

    const rows = populateRows(mockOrigData);
    expect(rows).toHaveLength(6);  // 6 players

    const divFeeColName = entryFeeColName(mockOrigData.divEntries[0].div_id);
    const divHdcpColName = divEntryHdcpColName(mockOrigData.divEntries[0].div_id);

    expect(rows[0][divFeeColName]).toBe(mockOrigData.divEntries[0].fee);
    expect(rows[0][divHdcpColName]).toBe(mockOrigData.divEntries[0].hdcp);

    expect(rows[1][divFeeColName]).toBe(undefined);
    expect(rows[1][divHdcpColName]).toBe(undefined);
    
    expect(rows[2][divFeeColName]).toBe(mockOrigData.divEntries[1].fee);
    expect(rows[2][divHdcpColName]).toBe(mockOrigData.divEntries[1].hdcp);
    expect(rows[3][divFeeColName]).toBe(mockOrigData.divEntries[2].fee);
    expect(rows[3][divHdcpColName]).toBe(mockOrigData.divEntries[2].hdcp);
    expect(rows[4][divFeeColName]).toBe(mockOrigData.divEntries[3].fee);
    expect(rows[4][divHdcpColName]).toBe(mockOrigData.divEntries[3].hdcp);
    expect(rows[5][divFeeColName]).toBe(mockOrigData.divEntries[4].fee);
    expect(rows[5][divHdcpColName]).toBe(mockOrigData.divEntries[4].hdcp);
  })
  it('should populate rows with pot entry data', () => { 

    const rows = populateRows(mockOrigData);
    expect(rows).toHaveLength(6);  // 6 players

    const potFeeColName = entryFeeColName(mockOrigData.potEntries[0].pot_id)

    expect(rows[0][potFeeColName]).toBe(mockOrigData.potEntries[0].fee);
    expect(rows[1][potFeeColName]).toBe(undefined);
    expect(rows[2][potFeeColName]).toBe(mockOrigData.potEntries[1].fee);
    expect(rows[3][potFeeColName]).toBe(mockOrigData.potEntries[2].fee);
    expect(rows[4][potFeeColName]).toBe(undefined);
    expect(rows[5][potFeeColName]).toBe(undefined);

  })
  it('should populate rows with raw brkt entry data', () => { 

    const rows = populateRows(mockOrigData);
    expect(rows).toHaveLength(6);  // 6 players

    const brkt1NumColName = entryNumBrktsColName(mockOrigData.brktEntries[0].brkt_id);
    const brkt1FeeColName = entryFeeColName(mockOrigData.brktEntries[0].brkt_id);
    const brkt1timeStampColName = timeStampColName(mockOrigData.brktEntries[0].brkt_id);    

    const brkt2NumColName = entryNumBrktsColName(mockOrigData.brktEntries[1].brkt_id);
    const brkt2FeeColName = entryFeeColName(mockOrigData.brktEntries[1].brkt_id);
    const brkt2timeStampColName = timeStampColName(mockOrigData.brktEntries[1].brkt_id);    

    expect(rows[0][brkt1NumColName]).toBe(mockOrigData.brktEntries[0].num_brackets);
    expect(rows[0][brkt1FeeColName]).toBe(mockOrigData.brktEntries[0].fee);
    expect(rows[0][brkt1timeStampColName]).toBe(mockOrigData.brktEntries[0].time_stamp);
    expect(rows[0][brkt2NumColName]).toBe(mockOrigData.brktEntries[1].num_brackets);
    expect(rows[0][brkt2FeeColName]).toBe(mockOrigData.brktEntries[1].fee);
    expect(rows[0][brkt2timeStampColName]).toBe(mockOrigData.brktEntries[1].time_stamp);

    expect(rows[1][brkt1NumColName]).toBe(undefined);
    expect(rows[1][brkt1FeeColName]).toBe(undefined);
    expect(rows[1][brkt2NumColName]).toBe(undefined);
    expect(rows[1][brkt2FeeColName]).toBe(undefined);

    expect(rows[2][brkt1NumColName]).toBe(undefined);
    expect(rows[2][brkt1FeeColName]).toBe(undefined);
    expect(rows[2][brkt2NumColName]).toBe(undefined);
    expect(rows[2][brkt2FeeColName]).toBe(undefined);

    expect(rows[3][brkt1NumColName]).toBe(undefined);
    expect(rows[3][brkt1FeeColName]).toBe(undefined);
    expect(rows[3][brkt2NumColName]).toBe(undefined);
    expect(rows[3][brkt2FeeColName]).toBe(undefined);

    expect(rows[4][brkt1NumColName]).toBe(mockOrigData.brktEntries[2].num_brackets);
    expect(rows[4][brkt1FeeColName]).toBe(mockOrigData.brktEntries[2].fee);
    expect(rows[4][brkt1timeStampColName]).toBe(mockOrigData.brktEntries[2].time_stamp);
    expect(rows[4][brkt2NumColName]).toBe(mockOrigData.brktEntries[3].num_brackets);
    expect(rows[4][brkt2FeeColName]).toBe(mockOrigData.brktEntries[3].fee);
    expect(rows[4][brkt1timeStampColName]).toBe(mockOrigData.brktEntries[3].time_stamp);

    expect(rows[5][brkt1NumColName]).toBe(undefined);
    expect(rows[5][brkt1FeeColName]).toBe(undefined);
    expect(rows[5][brkt2NumColName]).toBe(undefined);
    expect(rows[5][brkt2FeeColName]).toBe(undefined);

  })
  it('should populate rows with elim entry data', () => { 

    const rows = populateRows(mockOrigData);
    expect(rows).toHaveLength(6);  // 6 players

    const elim1FeeColName = entryFeeColName(mockOrigData.elimEntries[0].elim_id)
    const elim2FeeColName = entryFeeColName(mockOrigData.elimEntries[1].elim_id)

    expect(rows[0][elim1FeeColName]).toBe(mockOrigData.elimEntries[0].fee);
    expect(rows[0][elim2FeeColName]).toBe(mockOrigData.elimEntries[1].fee);
    expect(rows[1][elim1FeeColName]).toBe(undefined);
    expect(rows[1][elim2FeeColName]).toBe(undefined);
    expect(rows[2][elim1FeeColName]).toBe(undefined);
    expect(rows[2][elim2FeeColName]).toBe(undefined);
    expect(rows[3][elim1FeeColName]).toBe(undefined);
    expect(rows[3][elim2FeeColName]).toBe(undefined);
    expect(rows[4][elim1FeeColName]).toBe(undefined);
    expect(rows[4][elim2FeeColName]).toBe(undefined);
    expect(rows[5][elim1FeeColName]).toBe(mockOrigData.elimEntries[2].fee);
    expect(rows[5][elim1FeeColName]).toBe(mockOrigData.elimEntries[3].fee);

  })

})