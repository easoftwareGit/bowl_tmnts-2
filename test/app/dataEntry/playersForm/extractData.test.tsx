import type { gridTmntEntryDataType } from "@/lib/types/types";
import {
  brkt1NumColName,
  brkt2NumColName,
  mockDataOneTmnt,
  mockPlayerRows,  
} from "../../../mocks/tmnts/playerEntries/mockPlayerEntries";
import {
  brktId1,
  brktId2,
  divId1,
  divId2,
  elimId1,
  elimId2,
  mockByePlayer,
  oneBrktId1,
  oneBrktId2,
  oneBrktId3,
  oneBrktId4,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
  playerId10,
  potId1,
  potId2,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const mockBtDbUuid = jest.fn();

jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn((prefix: string) =>
    `${prefix}_00000000000000000000000000000000`
  ),
}));

import {
  extractDataFromRows,
  extractFullBrktsData
} from "@/app/dataEntry/playersForm/extractData";
import { BracketList } from "@/components/brackets/bracketListClass";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import { cloneDeep } from "lodash";
import { entryFeeColName } from "@/app/dataEntry/playersForm/sfCreatePlayerColumns";

const mockBracketLists: BracketList[] = [];
const mockBracketList1 = new BracketList(brktId1, 2, 3, mockByePlayer);
mockBracketList1.calcTotalBrkts(mockPlayerRows);
const mockBracketList2 = new BracketList(brktId2, 2, 3, mockByePlayer);
mockBracketList2.calcTotalBrkts(mockPlayerRows);
mockBracketLists.push(mockBracketList1, mockBracketList2);

describe("extractData", () => {

  beforeEach(() => {
    let counter = 0;

    mockBtDbUuid.mockImplementation((prefix: string) => {
      counter++;
      return `${prefix}_${counter.toString().padStart(32, "0")}`;
    });
  });

  describe("extractDataFromRows() validation", () => {

    const expectEmptyResult = (result: gridTmntEntryDataType) => {
      expect(result).toEqual({
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
        moneys: [],
      });
    };

    it("returns empty result when rows is empty", () => {
      const result = extractDataFromRows(
        [],
        mockDataOneTmnt,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when rows is not an array", () => {
      const result = extractDataFromRows(
        null as any,
        mockDataOneTmnt,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when oneTmntData is invalid", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        {} as any,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when brktLists is not an array", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        null as any,
      );

      expectEmptyResult(result);
    });

    it("returns empty result when there are 0 events", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.events = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when there are 0 squads", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.squads = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when there are 0 divisions", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.divs = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

    it("passes validation with 1 division", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.divs = [oneTmntData.divs[0]];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 2 divisions", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 0 pots", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.pots = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 1 pot", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.pots = [oneTmntData.pots[0]];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 2 pots", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 0 brackets", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.brkts = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 1 bracket", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.brkts = [oneTmntData.brkts[0]];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        mockBracketLists,
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 2 brackets", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        mockBracketLists,
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 0 eliminators", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.elims = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 1 eliminator", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.elims = [oneTmntData.elims[0]];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 2 eliminators", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("passes validation with 2 pots, 2 brackets, and 2 eliminators", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
    });

    it("returns empty result when event id is invalid", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.events[0].id = "bad_event_id";

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when squad id is invalid", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.squads[0].id = "bad_squad_id";

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

    it("returns empty result when division id is invalid", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.divs[0].id = "bad_div_id";

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expectEmptyResult(result);
    });

  });  

  describe("player extraction", () => {
    it("creates one player for every row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(result.players).toHaveLength(
        mockPlayerRows.length,
      );
    });

    it("copies player fields correctly", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      const player = result.players.find(
        (p) => p.id === playerId1,
      );

      expect(player).toMatchObject({
        id: playerId1,
        squad_id: squadId1,
        first_name: "Amy",
        last_name: "Davis",
        average: 212,
        lane: 29,
        position: "X",
      });
    });
    
  });

  describe("division entries", () => {

    const getPrizeFundOutRow = (result: gridTmntEntryDataType) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          !m.pot_id &&
          !m.brkt_id &&
          !m.elim_id,
      );

    const getLineageOutRow = (result: gridTmntEntryDataType) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.LINEAGE &&
          m.flow === MoneyFlow.OUT,
      );

    it("creates division entries", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(result.divEntries.length).toBeGreaterThan(0);
    });

    it("creates no division entry when player has no division fee columns with data", () => {
      const rows = [mockPlayerRows[1]]; // Betty

      const result = extractDataFromRows(
        rows,
        mockDataOneTmnt,
        [],
      );

      expect(result.divEntries).toHaveLength(0);
    });

    it("creates one division entry when player enters one division", () => {
      const rows = [mockPlayerRows[0]]; // Amy

      const result = extractDataFromRows(
        rows,
        mockDataOneTmnt,
        [],
      );

      expect(result.divEntries).toHaveLength(1);

      expect(result.divEntries[0]).toMatchObject({
        player_id: playerId1,
        div_id: divId1,
        fee: "85",
        hdcp: 0,
      });
    });
        
    it("creates division entry when only second division has data", () => {
      const row = cloneDeep(mockPlayerRows[2]);

      row[`${divId1}_fee`] = "";
      row[`${divId2}_fee`] = 85;

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      expect(result.divEntries).toHaveLength(1);

      expect(result.divEntries[0].div_id).toBe(divId2);
    });

    it("creates two division entries when both division fees are entered", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]],
        mockDataOneTmnt,
        [],
      );

      expect(result.divEntries).toHaveLength(2);

      expect(
        result.divEntries.filter(
          (d) => d.player_id === playerId3,
        ),
      ).toHaveLength(2);
    });
        
    it("stores handicap value for handicap division", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      const hdcpEntry = result.divEntries.find(
        (d) =>
          d.player_id === playerId3 &&
          d.div_id === divId2,
      );

      expect(hdcpEntry?.hdcp).toBe(18);
    });

    it("does not create division money out amounts when no division fees exist", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[1]],
        mockDataOneTmnt,
        [],
      );

      const lineageRow = getLineageOutRow(result);

      expect(lineageRow?.amount).toBe(0);
    });

    it("allocates lineage, other, expenses and prize fund from one division entry", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      const prizeFundRow = getPrizeFundOutRow(result);

      expect(prizeFundRow?.amount).toBe(57);
    });
        
    it("calculates prize fund for two equal division fees by deducting expenses only once", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]],
        mockDataOneTmnt,
        [],
      );

      const prizeFundRow = getPrizeFundOutRow(result);

      expect(prizeFundRow?.amount).toBe(142);
    });

    it("only deducts expenses from the first matching highest division fee", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]], // Carol has div1 = 85 and div2 = 85
        mockDataOneTmnt,
        [],
      );

      const prizeFundOutRow = result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          m.pot_id === null &&
          m.brkt_id === null &&
          m.elim_id === null,
      );

      // Div 1: 85 - lineage 21 - other 2 - expenses 5 = 57
      // Div 2: 85 full amount to prize fund
      // Total: 57 + 85 = 142
      expect(prizeFundOutRow?.amount).toBe(142);
    });
        
    it("only charges lineage, other, and expenses once when player enters two divisions", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]],
        mockDataOneTmnt,
        [],
      );

      const lineageRow = result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.LINEAGE &&
          m.flow === MoneyFlow.OUT,
      );

      const otherRow = result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.OTHER &&
          m.flow === MoneyFlow.OUT,
      );

      const expensesRow = result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.EXPENSES &&
          m.flow === MoneyFlow.OUT &&
          m.pot_id === null &&
          m.brkt_id === null &&
          m.elim_id === null,
      );

      expect(lineageRow?.amount).toBe(21);
      expect(otherRow?.amount).toBe(2);
      expect(expensesRow?.amount).toBe(5);
    });    

  });

  describe("pot entries", () => {

    const getPotPrizeFundRow = (
      result: gridTmntEntryDataType,
      potId: string,
    ) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          m.pot_id === potId,
      );

    it("creates pot entries", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries.length).toBeGreaterThan(0);
    });

    it("creates pot entry for Amy", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(
        result.potEntries.some(
          (p) =>
            p.player_id === playerId1 &&
            p.pot_id === potId1,
        ),
      ).toBe(true);
    });

    it("creates no pot entries when tournament has 0 pots", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.pots = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.potEntries).toHaveLength(0);
    });
        
    it("creates no pot entries when player has no pot fee columns with data", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[1]],
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries).toHaveLength(0);
    });

    it("creates one pot entry when player enters one pot", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries).toHaveLength(1);

      expect(result.potEntries[0]).toMatchObject({
        player_id: playerId1,
        pot_id: potId1,
        fee: "20",
      });
    });    
        
    it("creates one pot entry when second pot is blank", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries).toHaveLength(1);

      expect(
        result.potEntries.some(
          (p) =>
            p.player_id === playerId1 &&
            p.pot_id === potId1,
        ),
      ).toBe(true);
    });

    it("creates one pot entry when only second pot has data", () => {
      const row = cloneDeep(mockPlayerRows[2]);

      const pot1FeeColName = entryFeeColName(potId1);
      const pot2FeeColName = entryFeeColName(potId2);
      row[pot1FeeColName] = "";
      row[pot2FeeColName] = 20;

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries).toHaveLength(1);

      expect(result.potEntries[0].pot_id).toBe(potId2);
    });

    it("creates two pot entries when both pot fees are entered", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]],
        mockDataOneTmnt,
        [],
      );

      expect(result.potEntries).toHaveLength(2);

      expect(
        result.potEntries.filter(
          (p) => p.player_id === playerId3,
        ),
      ).toHaveLength(2);
    });
        
    it("updates pot prize fund amount", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      const potPrizeFundRow =
        getPotPrizeFundRow(result, potId1);

      expect(potPrizeFundRow?.amount).toBe(20);
    });

    it("updates each pot prize fund independently", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[2]],
        mockDataOneTmnt,
        [],
      );

      const pot1Row =
        getPotPrizeFundRow(result, potId1);

      const pot2Row =
        getPotPrizeFundRow(result, potId2);

      expect(pot1Row?.amount).toBe(20);
      expect(pot2Row?.amount).toBe(20);
    });
        
    it("accumulates pot prize fund totals across players", () => {
      const result = extractDataFromRows(
        [
          mockPlayerRows[0],
          mockPlayerRows[2],
          mockPlayerRows[3],
        ],
        mockDataOneTmnt,
        [],
      );

      const potPrizeFundRow =
        getPotPrizeFundRow(result, potId1);

      expect(potPrizeFundRow?.amount).toBe(60);
    });    
    
  });  

  describe("bracket refunds", () => {

    const getBracketPrizeFundRow = (
      result: gridTmntEntryDataType,
      brktId: string,
    ) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          m.brkt_id === brktId,
      );

    const getBracketExpensesRow = (
      result: gridTmntEntryDataType,
      brktId: string,
    ) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.EXPENSES &&
          m.flow === MoneyFlow.OUT &&
          m.brkt_id === brktId,
      );

    const getBracketRefundsRow = (
      result: gridTmntEntryDataType,
      brktId: string,
    ) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.REFUNDS &&
          m.flow === MoneyFlow.OUT &&
          m.brkt_id === brktId,
      );

    it("creates no bracket entries when tournament has 0 brackets", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.brkts = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.brktEntries).toHaveLength(0);
    });
        
    it("creates no bracket entries when player has no bracket data", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[1]],
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(result.brktEntries).toHaveLength(0);
    });

    it("creates one bracket entry when player enters one bracket", () => {
      const row = cloneDeep(mockPlayerRows[0]);
      row[brkt2NumColName] = "";

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(result.brktEntries).toHaveLength(1);

      expect(result.brktEntries[0]).toMatchObject({
        player_id: playerId1,
        brkt_id: brktId1,
      });
    });    

    it("creates one bracket entry when only second bracket has data", () => {
      const row = cloneDeep(mockPlayerRows[2]);

      row[brkt1NumColName] = "";
      row[brkt2NumColName] = 2;

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(result.brktEntries).toHaveLength(1);

      expect(result.brktEntries[0].brkt_id).toBe(brktId2);
    });

    it("creates two bracket entries when both bracket columns have data", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(result.brktEntries).toHaveLength(2);
    });

    it("calculates bracket refunds", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const entry = result.brktEntries.find(
        (b) =>
          b.player_id === playerId10 &&
          b.brkt_id === brktId1,
      );

      expect(entry?.num_refunds).toBeGreaterThan(0);
    });

    it("updates refund money row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const refundsRow =
        getBracketRefundsRow(result, brktId1);

      expect(refundsRow?.amount).toBeGreaterThan(0);
    });

    it("updates bracket prize fund money row", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        mockBracketLists,
      );

      const prizeFundRow =
        getBracketPrizeFundRow(result, brktId1);

      expect(prizeFundRow?.amount).toBeGreaterThan(0);
    });

    it("updates bracket expenses money row", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        mockBracketLists,
      );

      const expensesRow =
        getBracketExpensesRow(result, brktId1);

      expect(expensesRow?.amount).toBeGreaterThan(0);
    });
        
    it("ignores bracket columns that do not exist in tournament data", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.brkts = [];

      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        oneTmntData,
        [],
      );

      expect(result.brktEntries).toHaveLength(0);

      expect(
        result.moneys.filter(
          (m) => m.brkt_id !== null,
        ),
      ).toHaveLength(0);
    });    
    
  });

  describe("eliminator entries", () => {
    const getElimPrizeFundRow = (
      result: gridTmntEntryDataType,
      elimId: string,
    ) =>
      result.moneys.find(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          m.elim_id === elimId,
      );

    const elim1FeeColName = entryFeeColName(elimId1);
    const elim2FeeColName = entryFeeColName(elimId2);
    
    it("creates eliminator entries", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries.length).toBeGreaterThan(0);
    });

    it("creates no eliminator entries when tournament has 0 eliminators", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.elims = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.elimEntries).toHaveLength(0);
    });
        
    it("creates no eliminator entries when player has no eliminator fee columns with data", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[1]],
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries).toHaveLength(0);
    });

    it("creates one eliminator entry when player enters one eliminator", () => {
      const row = cloneDeep(mockPlayerRows[0]);
      row[elim2FeeColName] = "";

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries).toHaveLength(1);

      expect(result.elimEntries[0]).toMatchObject({
        player_id: playerId1,
        elim_id: elimId1,
      });
    });

    it("creates one eliminator entry when second eliminator is blank", () => {
      const row = cloneDeep(mockPlayerRows[0]);
      row[elim2FeeColName] = "";

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries).toHaveLength(1);

      expect(
        result.elimEntries.some(
          (e) =>
            e.player_id === playerId1 &&
            e.elim_id === elimId1,
        ),
      ).toBe(true);
    });

    it("creates one eliminator entry when only second eliminator has data", () => {
      const row = cloneDeep(mockPlayerRows[0]);

      row[elim1FeeColName] = "";
      row[elim2FeeColName] = 20;

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries).toHaveLength(1);

      expect(result.elimEntries[0].elim_id).toBe(elimId2);
    });
        
    it("creates two eliminator entries when both eliminator columns have data", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      expect(result.elimEntries).toHaveLength(2);
    });
        
    it("updates eliminator prize fund amount", () => {
      const row = cloneDeep(mockPlayerRows[0]);
      row[elim2FeeColName] = "";

      const result = extractDataFromRows(
        [row],
        mockDataOneTmnt,
        [],
      );

      const prizeFundRow =
        getElimPrizeFundRow(result, elimId1);

      expect(prizeFundRow?.amount).toBe(5);
    });

    it("updates each eliminator prize fund independently", () => {
      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        mockDataOneTmnt,
        [],
      );

      const elim1Row =
        getElimPrizeFundRow(result, elimId1);

      const elim2Row =
        getElimPrizeFundRow(result, elimId2);

      expect(elim1Row?.amount).toBeGreaterThan(0);
      expect(elim2Row?.amount).toBeGreaterThan(0);
    });

    it("accumulates eliminator prize fund totals across players", () => {
      const result = extractDataFromRows(
        [
          mockPlayerRows[0],
          mockPlayerRows[3],
          mockPlayerRows[4],
        ],
        mockDataOneTmnt,
        [],
      );

      const elim1Row =
        getElimPrizeFundRow(result, elimId1);

      expect(elim1Row?.amount).toBe(10);
    });
        
    it("ignores eliminator columns that do not exist in tournament data", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.elims = [];

      const result = extractDataFromRows(
        [mockPlayerRows[0]],
        oneTmntData,
        [],
      );

      expect(result.elimEntries).toHaveLength(0);

      expect(
        result.moneys.filter(
          (m) => m.elim_id !== null,
        ),
      ).toHaveLength(0);
    });    
    
  }); 
  
  describe("money rows", () => {
    it("creates money rows", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(result.moneys.length).toBeGreaterThan(0);
    });

    it("creates one ADDED money row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      const addedRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ADDED &&
          m.flow === MoneyFlow.IN,
      );

      expect(addedRows).toHaveLength(1);
    });

    it("creates lineage out row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(
        result.moneys.some(
          (m) =>
            m.descrip === MoneyDescrip.LINEAGE &&
            m.flow === MoneyFlow.OUT,
        ),
      ).toBe(true);
    });

    it("assigns sequential sort order values", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      result.moneys.forEach((money, index) => {
        expect(money.sort_order).toBe(index + 1);
      });
    });

    it("creates only division money rows when no pots brackets or eliminators exist", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      oneTmntData.pots = [];
      oneTmntData.brkts = [];
      oneTmntData.elims = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(
        result.moneys.some((m) => m.pot_id !== null),
      ).toBe(false);

      expect(
        result.moneys.some((m) => m.brkt_id !== null),
      ).toBe(false);

      expect(
        result.moneys.some((m) => m.elim_id !== null),
      ).toBe(false);
    });

    it("creates pot money rows when tournament has pots", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(
        result.moneys.some((m) => m.pot_id === potId1),
      ).toBe(true);
    });

    it("creates bracket money rows when tournament has brackets", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(
        result.moneys.some((m) => m.brkt_id === brktId1),
      ).toBe(true);
    });

    it("creates eliminator money rows when tournament has eliminators", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        [],
      );

      expect(
        result.moneys.some((m) => m.elim_id === elimId1),
      ).toBe(true);
    });

    it("creates money rows for divisions pots brackets and eliminators together", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      expect(
        result.moneys.some((m) => m.pot_id === potId1),
      ).toBe(true);

      expect(
        result.moneys.some((m) => m.brkt_id === brktId1),
      ).toBe(true);

      expect(
        result.moneys.some((m) => m.elim_id === elimId1),
      ).toBe(true);
    });

    it("creates exactly one ADDED money row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const addedRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ADDED &&
          m.flow === MoneyFlow.IN,
      );

      expect(addedRows).toHaveLength(1);
    });
    
    it("creates exactly one lineage out row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const lineageRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.LINEAGE &&
          m.flow === MoneyFlow.OUT,
      );

      expect(lineageRows).toHaveLength(1);
    });

    it("creates exactly one other out row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const otherRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.OTHER &&
          m.flow === MoneyFlow.OUT,
      );

      expect(otherRows).toHaveLength(1);
    });

    it("creates exactly one event expenses out row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const eventExpensesRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.EXPENSES &&
          m.flow === MoneyFlow.OUT &&
          m.pot_id === null &&
          m.brkt_id === null &&
          m.elim_id === null,
      );

      expect(eventExpensesRows).toHaveLength(1);
    });

    it("creates exactly one event prize fund out row", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const eventPrizeFundRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.PRIZEFUND &&
          m.flow === MoneyFlow.OUT &&
          m.pot_id === null &&
          m.brkt_id === null &&
          m.elim_id === null,
      );

      expect(eventPrizeFundRows).toHaveLength(1);
    });

    it("creates one entries in row per configured division fee column", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const divEntryMoneyRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ENTRIES &&
          m.flow === MoneyFlow.IN &&
          m.pot_id === null &&
          m.brkt_id === null &&
          m.elim_id === null,
      );

      expect(divEntryMoneyRows).toHaveLength(2);
    });

    it("creates one pot entries in row per configured pot fee column", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const potEntryMoneyRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ENTRIES &&
          m.flow === MoneyFlow.IN &&
          m.pot_id !== null,
      );

      expect(potEntryMoneyRows).toHaveLength(2);
    });

    it("creates one bracket entries in row per configured bracket fee column", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const brktEntryMoneyRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ENTRIES &&
          m.flow === MoneyFlow.IN &&
          m.brkt_id !== null,
      );

      expect(brktEntryMoneyRows).toHaveLength(2);
    });

    it("creates one eliminator entries in row per configured eliminator fee column", () => {
      const result = extractDataFromRows(
        mockPlayerRows,
        mockDataOneTmnt,
        mockBracketLists,
      );

      const elimEntryMoneyRows = result.moneys.filter(
        (m) =>
          m.descrip === MoneyDescrip.ENTRIES &&
          m.flow === MoneyFlow.IN &&
          m.elim_id !== null,
      );

      expect(elimEntryMoneyRows).toHaveLength(2);
    });

  });  

  describe("integration", () => {

    it("extracts all data structures when divisions pots brackets and eliminators are configured", () => {
      const result: gridTmntEntryDataType =
        extractDataFromRows(
          mockPlayerRows,
          mockDataOneTmnt,
          mockBracketLists,
        );

      expect(result.players).toHaveLength(11);

      expect(result.divEntries.length).toBeGreaterThan(0);
      expect(result.potEntries.length).toBeGreaterThan(0);
      expect(result.brktEntries.length).toBeGreaterThan(0);
      expect(result.elimEntries.length).toBeGreaterThan(0);
      expect(result.moneys.length).toBeGreaterThan(0);

      expect(
        result.moneys.some((m) => m.pot_id !== null),
      ).toBe(true);

      expect(
        result.moneys.some((m) => m.brkt_id !== null),
      ).toBe(true);

      expect(
        result.moneys.some((m) => m.elim_id !== null),
      ).toBe(true);

      result.moneys.forEach((money, index) => {
        expect(money.sort_order).toBe(index + 1);
      });
    });

    it("extracts correctly with only one division configured", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);
      oneTmntData.divs = [oneTmntData.divs[0]];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        mockBracketLists,
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
      expect(result.divEntries.length).toBeGreaterThan(0);

      expect(
        result.divEntries.every((entry) => entry.div_id === divId1),
      ).toBe(true);

      expect(result.moneys.length).toBeGreaterThan(0);

      result.moneys.forEach((money, index) => {
        expect(money.sort_order).toBe(index + 1);
      });
    });

    it("extracts correctly with no pots brackets or eliminators configured", () => {
      const oneTmntData = cloneDeep(mockDataOneTmnt);

      oneTmntData.pots = [];
      oneTmntData.brkts = [];
      oneTmntData.elims = [];

      const result = extractDataFromRows(
        mockPlayerRows,
        oneTmntData,
        [],
      );

      expect(result.players).toHaveLength(mockPlayerRows.length);
      expect(result.divEntries.length).toBeGreaterThan(0);

      expect(result.potEntries).toHaveLength(0);
      expect(result.brktEntries).toHaveLength(0);
      expect(result.elimEntries).toHaveLength(0);

      expect(
        result.moneys.some((m) => m.pot_id !== null),
      ).toBe(false);

      expect(
        result.moneys.some((m) => m.brkt_id !== null),
      ).toBe(false);

      expect(
        result.moneys.some((m) => m.elim_id !== null),
      ).toBe(false);

      result.moneys.forEach((money, index) => {
        expect(money.sort_order).toBe(index + 1);
      });
    });


  });  

});

describe("extractFullBrktsData()", () => {

  const mockOneBrktId = "obk_00000000000000000000000000000000";

  beforeEach(() => {
    jest.clearAllMocks();

    mockBtDbUuid
      .mockReturnValueOnce(oneBrktId1)
      .mockReturnValueOnce(oneBrktId2)
      .mockReturnValueOnce(oneBrktId3)
      .mockReturnValueOnce(oneBrktId4);
  });

  describe("validation", () => {

    it("returns empty arrays for undefined", () => {
      const result = extractFullBrktsData(
        undefined as unknown as BracketList[],
      );

      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });

    it("returns empty arrays for null", () => {
      const result = extractFullBrktsData(
        null as unknown as BracketList[],
      );

      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });

    it("returns empty arrays for empty array", () => {
      const result = extractFullBrktsData([]);

      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });

    it("returns empty arrays for non-array input", () => {
      const result = extractFullBrktsData(
        {} as unknown as BracketList[],
      );

      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });

  });

  describe("one bracket list", () => {

    it("creates oneBrkt row and seed rows for a single bracket", () => {

      const brktLists = [
        {
          brktId: brktId1,
          brackets: [
            {
              players: [
                playerId1,
                playerId2,
                playerId3,
                playerId4,
              ],
            },
          ],
        },
      ] as unknown as BracketList[];

      const result = extractFullBrktsData(brktLists);

      expect(result.oneBrkts).toEqual([
        {
          id: mockOneBrktId,
          brkt_id: brktId1,
          bindex: 0,
        },
      ]);

      expect(result.brktSeeds).toEqual([
        {
          one_brkt_id: mockOneBrktId,
          seed: 0,
          player_id: playerId1,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 1,
          player_id: playerId2,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 2,
          player_id: playerId3,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 3,
          player_id: playerId4,
        },
      ]);
    });

  });

  describe("multiple bracket lists", () => {

    it("creates oneBrkts for multiple bracket lists", () => {

      const brktLists = [
        {
          brktId: brktId1,
          brackets: [
            { players: [playerId1, playerId2] },
            { players: [playerId3, playerId4] },
          ],
        },
        {
          brktId: brktId2,
          brackets: [
            { players: [playerId5, playerId6] },
            { players: [playerId7, playerId8] },
          ],
        },
      ] as unknown as BracketList[];

      const result = extractFullBrktsData(brktLists);

      expect(result.oneBrkts).toHaveLength(4);

      expect(result.oneBrkts).toEqual([
        {
          id: mockOneBrktId,
          brkt_id: brktId1,
          bindex: 0,
        },
        {
          id: mockOneBrktId,
          brkt_id: brktId1,
          bindex: 1,
        },
        {
          id: mockOneBrktId,
          brkt_id: brktId2,
          bindex: 0,
        },
        {
          id: mockOneBrktId,
          brkt_id: brktId2,
          bindex: 1,
        },
      ]);
    });

  });

  describe("seed generation", () => {

    it("creates seeds in correct order", () => {

      const brktLists = [
        {
          brktId: brktId1,
          brackets: [
            {
              players: [
                playerId8,
                playerId4,
                playerId2,
                playerId6,
              ],
            },
          ],
        },
      ] as unknown as BracketList[];

      const result = extractFullBrktsData(brktLists);

      expect(result.brktSeeds).toEqual([
        {
          one_brkt_id: mockOneBrktId,
          seed: 0,
          player_id: playerId8,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 1,
          player_id: playerId4,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 2,
          player_id: playerId2,
        },
        {
          one_brkt_id: mockOneBrktId,
          seed: 3,
          player_id: playerId6,
        },
      ]);
    });

  });

  describe("error handling", () => {

    it("returns empty arrays when exception is thrown", () => {

      const brktLists = [
        {
          brktId: brktId1,
          brackets: null,
        },
      ] as unknown as BracketList[];

      const result = extractFullBrktsData(brktLists);

      expect(result).toEqual({
        oneBrkts: [],
        brktSeeds: [],
      });
    });

  });

});