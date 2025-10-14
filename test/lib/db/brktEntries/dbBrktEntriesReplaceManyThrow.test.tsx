import { brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const manyBrktEntries: brktEntryType[] = [
  {
    ...initBrktEntry,
    id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
    brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    num_refunds: 2,
    fee: "40",
    time_stamp: 1739259269537,
  },
  {
    ...initBrktEntry,
    id: "ben_8f039ee00dfa445c9e3aee0ca9a6391b",
    brkt_id: "brk_6ede2512c7d4409ca7b055505990a499",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    num_brackets: 8,
    num_refunds: 2,
    fee: "40",
    time_stamp: 1739259269537,
  },
];

describe("replaceManyBrktEntries - non standard throw cases", () => {
  let replaceManyBrktEntries: typeof import("../../../../src/lib/db/brktEntries/dbBrktEntriesReplaceMany").replaceManyBrktEntries;
  let deleteAllBrktEntriesForSquadMock: jest.Mock;
  let postManyBrktEntriesMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "../../../../src/lib/db/brktEntries/dbBrktEntries",
      () => ({
        __esModule: true,
        deleteAllBrktEntriesForSquad: jest.fn(),
        postManyBrktEntries: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyBrktEntries } = require(
      "../../../../src/lib/db/brktEntries/bdBrktEntriesReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllBrktEntriesForSquad: deleteAllBrktEntriesForSquadMock,
      postManyBrktEntries: postManyBrktEntriesMock,
    } = require("../../../../src/lib/db/brktEntries/dbBrktEntries"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllBrktEntriesForSquad fails", async () => {
    deleteAllBrktEntriesForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyBrktEntries(manyBrktEntries, squadId))
      .rejects
      .toThrow("Failed to save brktEntries: delete fail");

    expect(deleteAllBrktEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktEntriesMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyBrktEntries fails", async () => {
    deleteAllBrktEntriesForSquadMock.mockResolvedValue(1);
    postManyBrktEntriesMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyBrktEntries(manyBrktEntries, squadId))
      .rejects
      .toThrow("Failed to save brktEntries: post fail");

    expect(deleteAllBrktEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktEntriesMock).toHaveBeenCalledTimes(1);
  });
});