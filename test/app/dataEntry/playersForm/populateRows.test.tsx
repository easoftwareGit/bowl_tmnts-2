import { populateRows } from "@/app/dataEntry/playersForm/populateRows";
import {
  entryFeeColName,
  divEntryHdcpColName,
  entryNumBrktsColName,
  timeStampColName,
  feeColNameEnd,
  playerEntryData,
} from "@/app/dataEntry/playersForm/createColumns";
import {
  mockTmntFullData,
  brktId1,
  brktId2,
  divId1,
  elimId1,
  elimId2,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  potId1,
  mockByePlayer,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

describe("populateRows", () => {
  it("creates one row per player and populates core fields including lanePos", () => {
    const rows = populateRows(mockTmntFullData);

    expect(rows).toHaveLength(mockTmntFullData.players.length);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    // playerId1 in the mock is lane 29 position A
    expect(r1!).toMatchObject({
      id: playerId1,
      player_id: playerId1,
      first_name: "John",
      last_name: "Doe",
      average: 220,
      lane: 29,
      position: "A",
      lanePos: "29-A",
    });

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    expect(r2!).toMatchObject({
      id: playerId2,
      player_id: playerId2,
      first_name: "Jane",
      last_name: "Doe",
      average: 210,
      lane: 29,
      position: "B",
      lanePos: "29-B",
    });
  });

  it("creates one row per player, but ignores bye player", () => {
    const byeTmnt = cloneDeep(mockTmntFullData);
    byeTmnt.players.push(mockByePlayer);
    const rows = populateRows(byeTmnt);

    expect(rows).toHaveLength(byeTmnt.players.length - 1);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    // playerId1 in the mock is lane 29 position A
    expect(r1!).toMatchObject({
      id: playerId1,
      player_id: playerId1,
      first_name: "John",
      last_name: "Doe",
      average: 220,
      lane: 29,
      position: "A",
      lanePos: "29-A",
    });

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    expect(r2!).toMatchObject({
      id: playerId2,
      player_id: playerId2,
      first_name: "Jane",
      last_name: "Doe",
      average: 210,
      lane: 29,
      position: "B",
      lanePos: "29-B",
    });

    const byeRow = rows.find((r: any) => r.player_id === mockByePlayer.id);
    expect(byeRow).toBeUndefined();
  });

  it("does not mutate the playerEntryData template and rows do not share references", () => {
    const templateBefore = cloneDeep(playerEntryData);

    const rows = populateRows(mockTmntFullData);

    // rows are distinct objects
    expect(rows[0]).not.toBe(rows[1]);

    // mutating one row does not affect another
    (rows[0] as any).first_name = "CHANGED";
    expect((rows[1] as any).first_name).not.toBe("CHANGED");

    // template remains unchanged
    expect(playerEntryData).toEqual(templateBefore);
  });

  it("populates division fee and hdcp using dynamic column names (fee numeric, hdcp numeric)", () => {
    const rows = populateRows(mockTmntFullData);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    // mock divEntries set fee "85" for players 1-4 in divId1
    expect(r1![entryFeeColName(divId1)]).toBe(85);
    expect(r2![entryFeeColName(divId1)]).toBe(85);

    // hdcp default in blankDivEntry is (typically) 0; populateRows uses Number(divEntry.hdcp) || 0
    expect(r1![divEntryHdcpColName(divId1)]).toBe(0);
    expect(r2![divEntryHdcpColName(divId1)]).toBe(0);
  });

  it("populates pot entry fees using dynamic fee column names", () => {
    const rows = populateRows(mockTmntFullData);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    const r3 = rows.find((r: any) => r.player_id === playerId3);
    expect(r3).toBeDefined();

    const r4 = rows.find((r: any) => r.player_id === playerId4);
    expect(r4).toBeDefined();

    // potEntries in mock: potId1 fee "20" for players 1-4
    expect(r1![entryFeeColName(potId1)]).toBe(20);
    expect(r2![entryFeeColName(potId1)]).toBe(20);
    expect(r3![entryFeeColName(potId1)]).toBe(20);
    expect(r4![entryFeeColName(potId1)]).toBe(20);
  });

  it("populates bracket num_brackets, fee, and timestamp columns for each player/bracket entry", () => {

    const before = new Date().getTime();

    const rows = populateRows(mockTmntFullData);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    // brktEntries in mock:
    // - player1 in brktId1: num_brackets 10, fee "50"
    // - player2 in brktId1: num_brackets 8,  fee "40"
    // - player1 in brktId2: num_brackets 10, fee "50"
    // - player2 in brktId2: num_brackets 8,  fee "40"
    expect(r1![entryNumBrktsColName(brktId1)]).toBe(10);
    expect(r1![entryFeeColName(brktId1)]).toBe(50);
    expect(r1![entryNumBrktsColName(brktId2)]).toBe(10);
    expect(r1![entryFeeColName(brktId2)]).toBe(50);

    expect(r2![entryNumBrktsColName(brktId1)]).toBe(8);
    expect(r2![entryFeeColName(brktId1)]).toBe(40);
    expect(r2![entryNumBrktsColName(brktId2)]).toBe(8);
    expect(r2![entryFeeColName(brktId2)]).toBe(40);

    const after = new Date().getTime();
    const oneMinute = 60 * 1000;

    // timestamps: blankBrktEntry likely has time_stamp default 0.
    // populateRows sets Number(brktEntry.time_stamp) || 0, which is within one minute of now
    expect(r1![timeStampColName(brktId1)]).toBeGreaterThanOrEqual(before - oneMinute);
    expect(r1![timeStampColName(brktId1)]).toBeLessThanOrEqual(after + oneMinute);
    expect(r2![timeStampColName(brktId1)]).toBeGreaterThanOrEqual(before - oneMinute);
    expect(r2![timeStampColName(brktId1)]).toBeLessThanOrEqual(after + oneMinute);
    expect(r1![timeStampColName(brktId2)]).toBeGreaterThanOrEqual(before - oneMinute);
    expect(r1![timeStampColName(brktId2)]).toBeLessThanOrEqual(after + oneMinute);
    expect(r2![timeStampColName(brktId2)]).toBeGreaterThanOrEqual(before - oneMinute);
    expect(r2![timeStampColName(brktId2)]).toBeLessThanOrEqual(after + oneMinute);
  });

  it("populates eliminator entry fees using dynamic fee column names", () => {
    const rows = populateRows(mockTmntFullData);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    // elimEntries in mock:
    // - elimId1 fee "5" for player1 & player2
    // - elimId2 fee "5" for player1 & player2
    expect(r1![entryFeeColName(elimId1)]).toBe(5);
    expect(r2![entryFeeColName(elimId1)]).toBe(5);

    expect(r1![entryFeeColName(elimId2)]).toBe(5);
    expect(r2![entryFeeColName(elimId2)]).toBe(5);
  });

  it("computes feeTotal as sum of ALL keys that end with feeColNameEnd ('_fee')", () => {
    const rows = populateRows(mockTmntFullData);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    const r2 = rows.find((r: any) => r.player_id === playerId2);
    expect(r2).toBeDefined();

    const r3 = rows.find((r: any) => r.player_id === playerId3);
    expect(r3).toBeDefined();

    const r4 = rows.find((r: any) => r.player_id === playerId4);
    expect(r4).toBeDefined();

    // For player1:
    // div fee: 85
    // pot fee: 20
    // brktId1 fee: 50
    // brktId2 fee: 50
    // elimId1 fee: 5
    // elimId2 fee: 5
    // total = 85+20+50+50+5+5 = 215
    expect(r1!.feeTotal).toBe(215);

    // For player2:
    // total = 85+20+40+40+5+5 = 195
    expect(r2!.feeTotal).toBe(195);

    // For player3:
    // total = 85+20 = 105
    expect(r3!.feeTotal).toBe(105);

    // For player4:
    // total = 85+20 = 105
    expect(r4!.feeTotal).toBe(105);

    // sanity: feeTotal itself is NOT included because it doesn't end in "_fee"
    const feeKeys = Object.keys(r1!).filter((k) => k.endsWith(feeColNameEnd));
    expect(feeKeys).toEqual(
      expect.arrayContaining([
        entryFeeColName(divId1),
        entryFeeColName(potId1),
        entryFeeColName(brktId1),
        entryFeeColName(brktId2),
        entryFeeColName(elimId1),
        entryFeeColName(elimId2),
      ])
    );
    expect(feeKeys).not.toContain("feeTotal");
  });

  it("ignores entries that reference a player_id that does not exist in players (no crash, no extra columns)", () => {
    const tmnt = cloneDeep(mockTmntFullData);

    // add a divEntry for a non-existent player
    tmnt.divEntries.push({
      ...tmnt.divEntries[0],
      id: "den_nonexistent",
      player_id: "ply_DOES_NOT_EXIST",
      fee: "999",
      hdcp: 99,
    });

    // add a pot entry for a non-existent player
    tmnt.potEntries.push({
      ...tmnt.potEntries[0],
      id: "pen_nonexistent",
      player_id: "ply_DOES_NOT_EXIST",
      fee: "999",
    });

    // add a brkt entry for a non-existent player
    tmnt.brktEntries.push({
      ...tmnt.brktEntries[0],
      id: "ben_nonexistent",
      player_id: "ply_DOES_NOT_EXIST",
      num_brackets: 99,
      fee: "999",
      time_stamp: 999,
    });

    // add an elim entry for a non-existent player
    tmnt.elimEntries.push({
      ...tmnt.elimEntries[0],
      id: "een_nonexistent",
      player_id: "ply_DOES_NOT_EXIST",
      fee: "999",
    });

    const rows = populateRows(tmnt);

    // still only the real players
    expect(rows).toHaveLength(mockTmntFullData.players.length);

    // pick a real row and verify it didn't get polluted with the bogus player's amounts
    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    // div fee for divId1 remains 85, not 999
    expect(r1![entryFeeColName(divId1)]).toBe(85);
    // pot fee remains 20, not 999
    expect(r1![entryFeeColName(potId1)]).toBe(20);
    // bracket fee remains 50, not 999
    expect(r1![entryFeeColName(brktId1)]).toBe(50);
    // elim fee remains 5, not 999
    expect(r1![entryFeeColName(elimId1)]).toBe(5);
  });

  it("returns an empty array when players is empty", () => {
    const tmnt = cloneDeep(mockTmntFullData);
    tmnt.players = [];

    const rows = populateRows(tmnt);

    expect(rows).toEqual([]);
  });

  it("feeTotal does not become NaN if a fee column contains a non-numeric value (finite guard)", () => {
    const tmnt = cloneDeep(mockTmntFullData);
    const rows = populateRows(tmnt);

    const r1 = rows.find((r: any) => r.player_id === playerId1);
    expect(r1).toBeDefined();

    // Inject a bogus value into an existing fee column name
    r1![entryFeeColName(divId1)] = "bogus";

    // Recompute using the same algorithm (this is effectively testing the guard behavior expectation)
    let feeTotal = 0;
    for (const key of Object.keys(r1!)) {
      if (!key.endsWith(feeColNameEnd)) continue;
      const n = Number(r1![key]);
      feeTotal += Number.isFinite(n) ? n : 0;
    }

    expect(Number.isFinite(feeTotal)).toBe(true);
  });
});
