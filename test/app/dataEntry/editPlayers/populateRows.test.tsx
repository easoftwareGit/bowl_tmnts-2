import { populateRows } from "@/app/dataEntry/editPlayers/[tmntId]/page";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import {
  divEntryHdcpColName,
  entryFeeColName,
  entryNumBrktsColName,
  timeStampColName,
} from "@/app/dataEntry/playersForm/createColumns";
import { blankDivEntry, blankPotEntry } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

describe("populateRows", () => {
  it("should create columns", () => {
    const rows = populateRows(mockTmntFullData);
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
    expect(
      rows[0][entryFeeColName(mockTmntFullData.divEntries[0].div_id)]
    ).toBeDefined();
    expect(
      rows[0][divEntryHdcpColName(mockTmntFullData.divEntries[0].div_id)]
    ).toBeDefined();
    expect(
      rows[0][entryFeeColName(mockTmntFullData.divEntries[1].div_id)]
    ).toBeDefined();
    expect(
      rows[0][divEntryHdcpColName(mockTmntFullData.divEntries[1].div_id)]
    ).toBeDefined();
    // potEntry column
    expect(
      rows[0][entryFeeColName(mockTmntFullData.potEntries[0].pot_id)]
    ).toBeDefined();
    // brktEntry columns
    expect(
      rows[0][entryNumBrktsColName(mockTmntFullData.brktEntries[0].brkt_id)]
    ).toBeDefined();
    expect(
      rows[0][entryFeeColName(mockTmntFullData.brktEntries[0].brkt_id)]
    ).toBeDefined();
    expect(
      rows[0][timeStampColName(mockTmntFullData.brktEntries[0].brkt_id)]
    ).toBeDefined();
    expect(
      rows[0][entryNumBrktsColName(mockTmntFullData.brktEntries[1].brkt_id)]
    ).toBeDefined();
    expect(
      rows[0][entryFeeColName(mockTmntFullData.brktEntries[1].brkt_id)]
    ).toBeDefined();
    expect(
      rows[0][timeStampColName(mockTmntFullData.brktEntries[1].brkt_id)]
    ).toBeDefined();
    // elimEntry columns
    expect(
      rows[0][entryFeeColName(mockTmntFullData.elimEntries[0].elim_id)]
    ).toBeDefined();
    expect(
      rows[0][entryFeeColName(mockTmntFullData.elimEntries[1].elim_id)]
    ).toBeDefined();
    // total column
    expect(rows[0].feeTotal).toBeDefined();
  });
  it("should create rows", () => {
    const rows = populateRows(mockTmntFullData);
    expect(rows).toHaveLength(mockTmntFullData.players.length);
  });
  it("should populate rows with player data", () => {
    const rows = populateRows(mockTmntFullData);
    expect(rows).toHaveLength(mockTmntFullData.players.length);

    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].id).toBe(mockTmntFullData.players[i].id);
      expect(rows[i].player_id).toBe(mockTmntFullData.players[i].id);
      expect(rows[i].first_name).toBe(mockTmntFullData.players[i].first_name);
      expect(rows[i].last_name).toBe(mockTmntFullData.players[i].last_name);
      expect(rows[i].average).toBe(mockTmntFullData.players[i].average);
      expect(rows[i].lane).toBe(mockTmntFullData.players[i].lane);
      expect(rows[i].position).toBe(mockTmntFullData.players[i].position);
    }
  });
  it("should populate rows with div entry data", () => {
    const deMock = cloneDeep(mockTmntFullData);
    // add div entries into div 2
    deMock.divEntries.push({
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947ce",
      squad_id: deMock.squads[0].id,
      div_id: deMock.divs[1].id,
      player_id: deMock.players[0].id,
      fee: "85",
    });
    deMock.divEntries.push({
      ...blankDivEntry,
      id: "den_0123111c721147f7a2bf2702056947ce",
      squad_id: deMock.squads[0].id,
      div_id: deMock.divs[1].id,
      player_id: deMock.players[2].id,
      fee: "85",
    });
    const rows = populateRows(deMock);
    expect(rows).toHaveLength(deMock.players.length);

    const div1FeeColName = entryFeeColName(deMock.divs[0].id);
    const div1HdcpColName = divEntryHdcpColName(deMock.divs[0].id);
    const div2FeeColName = entryFeeColName(deMock.divs[1].id);
    const div2HdcpColName = divEntryHdcpColName(deMock.divs[1].id);

    expect(rows[0][div1FeeColName]).toBe(deMock.divEntries[0].fee);
    expect(rows[0][div1HdcpColName]).toBe(deMock.divEntries[0].hdcp);
    expect(rows[0][div2FeeColName]).toBe(deMock.divEntries[4].fee);
    expect(rows[0][div2HdcpColName]).toBe(deMock.divEntries[4].hdcp);

    expect(rows[1][div1FeeColName]).toBe(deMock.divEntries[1].fee);
    expect(rows[1][div1HdcpColName]).toBe(deMock.divEntries[1].hdcp);
    expect(rows[1][div2FeeColName]).toBe(undefined);
    expect(rows[1][div2HdcpColName]).toBe(undefined);

    expect(rows[2][div1FeeColName]).toBe(deMock.divEntries[2].fee);
    expect(rows[2][div1HdcpColName]).toBe(deMock.divEntries[2].hdcp);
    expect(rows[2][div2FeeColName]).toBe(deMock.divEntries[5].fee);
    expect(rows[2][div2HdcpColName]).toBe(deMock.divEntries[5].hdcp);

    expect(rows[3][div1FeeColName]).toBe(deMock.divEntries[3].fee);
    expect(rows[3][div1HdcpColName]).toBe(deMock.divEntries[3].hdcp);
    expect(rows[3][div2FeeColName]).toBe(undefined);
    expect(rows[3][div2HdcpColName]).toBe(undefined);
  });
  it("should populate rows with pot entry data", () => {
    const peMock = cloneDeep(mockTmntFullData);
    // add pot entries into div 2
    peMock.potEntries.push({
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947ce",
      pot_id: peMock.pots[1].id,
      player_id: peMock.players[0].id,
      fee: "20",
    });
    peMock.potEntries.push({
      ...blankPotEntry,
      id: "pen_0123111c721147f7a2bf2702056947cf",
      pot_id: peMock.pots[1].id,
      player_id: peMock.players[2].id,
      fee: "20",
    });

    const rows = populateRows(peMock);
    expect(rows).toHaveLength(peMock.players.length);

    const pot1FeeColName = entryFeeColName(peMock.pots[0].id);
    const pot2FeeColName = entryFeeColName(peMock.pots[1].id);

    expect(rows[0][pot1FeeColName]).toBe(peMock.potEntries[0].fee);
    expect(rows[0][pot2FeeColName]).toBe(peMock.potEntries[4].fee);

    expect(rows[1][pot1FeeColName]).toBe(peMock.potEntries[1].fee);
    expect(rows[1][pot2FeeColName]).toBe(undefined);

    expect(rows[2][pot1FeeColName]).toBe(peMock.potEntries[2].fee);
    expect(rows[2][pot2FeeColName]).toBe(peMock.potEntries[5].fee);

    expect(rows[3][pot1FeeColName]).toBe(peMock.potEntries[3].fee);
    expect(rows[3][pot2FeeColName]).toBe(undefined);
  });
  it("should populate rows with raw brkt entry data", () => {
    const rows = populateRows(mockTmntFullData);
    expect(rows).toHaveLength(mockTmntFullData.players.length);

    const brkt1NumColName = entryNumBrktsColName(
      mockTmntFullData.brktEntries[0].brkt_id
    );
    const brkt1FeeColName = entryFeeColName(
      mockTmntFullData.brktEntries[0].brkt_id
    );
    const brkt1timeStampColName = timeStampColName(
      mockTmntFullData.brktEntries[0].brkt_id
    );

    const brkt2NumColName = entryNumBrktsColName(
      mockTmntFullData.brktEntries[1].brkt_id
    );
    const brkt2FeeColName = entryFeeColName(
      mockTmntFullData.brktEntries[1].brkt_id
    );
    const brkt2timeStampColName = timeStampColName(
      mockTmntFullData.brktEntries[1].brkt_id
    );

    expect(rows[0][brkt1NumColName]).toBe(
      mockTmntFullData.brktEntries[0].num_brackets
    );
    expect(rows[0][brkt1FeeColName]).toBe(mockTmntFullData.brktEntries[0].fee);
    expect(rows[0][brkt1timeStampColName]).toBe(
      mockTmntFullData.brktEntries[0].time_stamp
    );
    expect(rows[0][brkt2NumColName]).toBe(
      mockTmntFullData.brktEntries[2].num_brackets
    );
    expect(rows[0][brkt2FeeColName]).toBe(mockTmntFullData.brktEntries[2].fee);
    expect(rows[0][brkt2timeStampColName]).toBe(
      mockTmntFullData.brktEntries[2].time_stamp
    );

    expect(rows[1][brkt1NumColName]).toBe(
      mockTmntFullData.brktEntries[1].num_brackets
    );
    expect(rows[1][brkt1FeeColName]).toBe(mockTmntFullData.brktEntries[1].fee);
    expect(rows[1][brkt1timeStampColName]).toBe(
      mockTmntFullData.brktEntries[1].time_stamp
    );
    expect(rows[1][brkt2NumColName]).toBe(
      mockTmntFullData.brktEntries[3].num_brackets
    );
    expect(rows[1][brkt2FeeColName]).toBe(mockTmntFullData.brktEntries[3].fee);
    expect(rows[1][brkt2timeStampColName]).toBe(
      mockTmntFullData.brktEntries[3].time_stamp
    );

    expect(rows[2][brkt1NumColName]).toBe(undefined);
    expect(rows[2][brkt1FeeColName]).toBe(undefined);
    expect(rows[2][brkt2NumColName]).toBe(undefined);
    expect(rows[2][brkt2FeeColName]).toBe(undefined);

    expect(rows[3][brkt1NumColName]).toBe(undefined);
    expect(rows[3][brkt1FeeColName]).toBe(undefined);
    expect(rows[3][brkt2NumColName]).toBe(undefined);
    expect(rows[3][brkt2FeeColName]).toBe(undefined);
  });
  it("should populate rows with elim entry data", () => {
    const rows = populateRows(mockTmntFullData);
    expect(rows).toHaveLength(mockTmntFullData.players.length);

    const elim1FeeColName = entryFeeColName(
      mockTmntFullData.elimEntries[0].elim_id
    );
    const elim2FeeColName = entryFeeColName(
      mockTmntFullData.elimEntries[1].elim_id
    );

    expect(rows[0][elim1FeeColName]).toBe(mockTmntFullData.elimEntries[0].fee);
    expect(rows[0][elim2FeeColName]).toBe(mockTmntFullData.elimEntries[1].fee);

    expect(rows[1][elim1FeeColName]).toBe(mockTmntFullData.elimEntries[0].fee);
    expect(rows[1][elim2FeeColName]).toBe(mockTmntFullData.elimEntries[1].fee);

    expect(rows[2][elim1FeeColName]).toBe(undefined);
    expect(rows[2][elim2FeeColName]).toBe(undefined);

    expect(rows[3][elim1FeeColName]).toBe(undefined);
    expect(rows[3][elim2FeeColName]).toBe(undefined);
  });
});
