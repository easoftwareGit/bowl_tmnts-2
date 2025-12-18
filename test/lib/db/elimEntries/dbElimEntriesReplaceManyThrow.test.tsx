import { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const manyElimEntries: elimEntryType[] = [
  {
    ...initElimEntry,
    id: 'een_01de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
  {
    ...initElimEntry,
    id: 'een_02de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
];

describe("replaceManyElimEntries - non standard throw cases", () => {
  let replaceManyElimEntries: typeof import("@/lib/db/elimEntries/dbElimEntriesReplaceMany").replaceManyElimEntries;
  let deleteAllElimEntriesForSquadMock: jest.Mock;
  let postManyElimEntriesMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/elimEntries/dbElimEntries",
      () => ({
        __esModule: true,
        deleteAllElimEntriesForSquad: jest.fn(),
        postManyElimEntries: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyElimEntries } = require(
      "@/lib/db/elimEntries/dbElimEntriesReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllElimEntriesForSquad: deleteAllElimEntriesForSquadMock,
      postManyElimEntries: postManyElimEntriesMock,
    } = require("@/lib/db/elimEntries/dbElimEntries"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllElimEntriesForSquad fails", async () => {
    deleteAllElimEntriesForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyElimEntries(manyElimEntries, squadId))
      .rejects
      .toThrow("Failed to replace elimEntries: delete fail");

    expect(deleteAllElimEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyElimEntriesMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyElimEntries fails", async () => {
    deleteAllElimEntriesForSquadMock.mockResolvedValue(1);
    postManyElimEntriesMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyElimEntries(manyElimEntries, squadId))
      .rejects
      .toThrow("Failed to replace elimEntries: post fail");

    expect(deleteAllElimEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyElimEntriesMock).toHaveBeenCalledTimes(1);
  });
});