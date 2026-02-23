import type { brktType } from "@/lib/types/types";
import type { playerEntryRow } from "@/app/dataEntry/playersForm/populateRows";
import { buildBrktList } from "@/app/dataEntry/playersForm/buildBrktList";
import { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";

// ---- Mocks -------------------------------------------------------------
jest.mock("@/lib/db/initVals", () => ({
  __esModule: true,
  defaultPlayersPerMatch: 2,
  defaultBrktGames: 3,
}));

type MockBracketListInstance = {
  calcTotalBrkts: jest.Mock<void, [playerEntryRow[]]>;
  brackets: any[];
};

const mockInstances: MockBracketListInstance[] = [];
const byePlayerMock = {
  id: "bye_1",
  squad_id: "sqd_1",
  first_name: "Bye",
  last_name: null,
  average: 0,
  lane: null,
  position: null,
};

// mock createByePlayer so it returns byePlayerMock
jest.mock("@/components/brackets/byePlayer", () => ({
  __esModule: true,
  createByePlayer: jest.fn(() => byePlayerMock),
}));

jest.mock("@/components/brackets/bracketListClass", () => {
  return {
    __esModule: true,
    BracketList: jest.fn().mockImplementation(() => {
      const inst: MockBracketListInstance = {
        calcTotalBrkts: jest.fn(),
        brackets: [],
      };
      // track instances created in tests
      (mockInstances as MockBracketListInstance[]).push(inst);
      return inst;
    }),
  };
});

describe("buildBrktList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInstances.length = 0;
  });

  const makeBrkt = (id: string): brktType =>
    ({
      id,
      // other brktType fields are irrelevant for buildBrktList
    } as unknown as brktType);

  const makeRow = (id: string): playerEntryRow =>
    ({
      id,
      player_id: id,
      first_name: "A",
      last_name: "B",
      feeTotal: 0,
    } as unknown as playerEntryRow);

  it("returns an object keyed by bracket id, with a BracketList instance for each bracket", () => {
    const brkts: brktType[] = [makeBrkt("brk_1"), makeBrkt("brk_2")];
    const rows: playerEntryRow[] = [makeRow("ply_1")];

    const result = buildBrktList("sqd_1", brkts, rows);

    // keys are bracket ids
    expect(Object.keys(result)).toEqual(["brk_1", "brk_2"]);

    // values are instances returned by mocked constructor
    expect(result["brk_1"]).toBe(mockInstances[0]);
    expect(result["brk_2"]).toBe(mockInstances[1]);

    // constructor called once per bracket
    expect(BracketList).toHaveBeenCalledTimes(2);
  });

  it("constructs each BracketList with (brkt.id, defaultPlayersPerMatch, defaultBrktGames, prev?.brackets)", () => {
    const brkts: brktType[] = [makeBrkt("brk_A"), makeBrkt("brk_B")];
    const rows: playerEntryRow[] = [makeRow("ply_1")];

    const prevA = { brackets: [{ m: "prevA" }] };
    const prevMap = {
      brk_A: prevA as any,
      // brk_B intentionally missing
    } as Record<string, any>;

    buildBrktList("sqd_1", brkts, rows, prevMap);

    expect(BracketList).toHaveBeenNthCalledWith(    
      1,
      "brk_A",
      defaultPlayersPerMatch,
      defaultBrktGames,
      byePlayerMock,
      prevA.brackets
    );

    expect(BracketList).toHaveBeenNthCalledWith(
      2,
      "brk_B",
      defaultPlayersPerMatch,
      defaultBrktGames,
      byePlayerMock,
      []
    );
  });

  it("calls calcTotalBrkts(rows) for each created BracketList (using provided rows)", () => {
    const brkts: brktType[] = [makeBrkt("brk_1"), makeBrkt("brk_2")];
    const rows: playerEntryRow[] = [makeRow("ply_1"), makeRow("ply_2")];

    buildBrktList("sqd_1", brkts, rows);

    expect(mockInstances).toHaveLength(2);
    expect(mockInstances[0].calcTotalBrkts).toHaveBeenCalledTimes(1);
    expect(mockInstances[0].calcTotalBrkts).toHaveBeenCalledWith(rows);

    expect(mockInstances[1].calcTotalBrkts).toHaveBeenCalledTimes(1);
    expect(mockInstances[1].calcTotalBrkts).toHaveBeenCalledWith(rows);
  });

  it("defaults rows to [] when not provided, and still calls calcTotalBrkts([])", () => {
    const brkts: brktType[] = [makeBrkt("brk_1")];

    buildBrktList("sqd_1", brkts);

    expect(mockInstances).toHaveLength(1);
    expect(mockInstances[0].calcTotalBrkts).toHaveBeenCalledWith([]);
  });

  it("returns an empty object when brkts is empty", () => {
    const result = buildBrktList("sqd_1", [], [makeRow("ply_1")]);

    expect(result).toEqual({});
    expect(BracketList).not.toHaveBeenCalled();
  });
});
