import type { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const divId = 'div_1112042f9ef24029a0a2d48cc276a088';

export const manyBrkts: brktType[] = [
  {
    ...initBrkt,
    id: "brk_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: squadId,
    div_id: divId,
    sort_order: 1,
    start: 1,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
  },
  {
    ...initBrkt,
    id: "brk_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: squadId,
    div_id: divId,
    sort_order: 1,
    start: 4,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
  },
];

describe("replaceManyBrktss - non standard throw cases", () => {  
  let replaceManyBrkts: typeof import("@/lib/db/brkts/dbBrktsReplaceMany").replaceManyBrkts;
  let deleteAllBrktsForSquadMock: jest.Mock;
  let postManyBrktsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(      
      "@/lib/db/brkts/dbBrkts",
      () => ({
        __esModule: true,
        deleteAllBrktsForSquad: jest.fn(),
        postManyBrkts: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyBrkts } = require(      
      "@/lib/db/brkts/dbBrktsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllBrktsForSquad: deleteAllBrktsForSquadMock,
      postManyBrkts: postManyBrktsMock,    
    } = require("@/lib/db/brkts/dbBrkts"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllBrktsForSquad fails", async () => {
    deleteAllBrktsForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyBrkts(manyBrkts, squadId))
      .rejects
      .toThrow("Failed to replace brkts: delete fail");

    expect(deleteAllBrktsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyBrkts fails", async () => {
    deleteAllBrktsForSquadMock.mockResolvedValue(1);
    postManyBrktsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyBrkts(manyBrkts, squadId))
      .rejects
      .toThrow("Failed to replace brkts: post fail");

    expect(deleteAllBrktsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktsMock).toHaveBeenCalledTimes(1);
  });
});