import { potEntryType } from "@/lib/types/types";
import { initPotEntry } from "@/lib/db/initVals";
import { replaceManyPotEntries } from "../../../../src/lib/db/potEntries/dbPotEntriesReplaceMany";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const manyPotEntries: potEntryType[] = [
  {
    ...initPotEntry,
    id: 'pen_01be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_a9fd8f787de942a1a92aaa2df3e7c185',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '20'
  },
  {
    ...initPotEntry,
    id: 'pen_02be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_a9fd8f787de942a1a92aaa2df3e7c185',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '20'
  },
];

describe("replaceManyPotEntries - non standard throw cases", () => {
  let replaceManyPotEntries: typeof import("../../../../src/lib/db/potEntries/dbPotEntriesReplaceMany").replaceManyPotEntries;
  let deleteAllPotEntriesForSquadMock: jest.Mock;
  let postManyPotEntriesMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "../../../../src/lib/db/potEntries/dbPotEntries",
      () => ({
        __esModule: true,
        deleteAllPotEntriesForSquad: jest.fn(),
        postManyPotEntries: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyPotEntries } = require(
      "../../../../src/lib/db/potEntries/dbPotEntriesReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllPotEntriesForSquad: deleteAllPotEntriesForSquadMock,
      postManyPotEntries: postManyPotEntriesMock,
    } = require("../../../../src/lib/db/potEntries/dbPotEntries"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllPotEntriesForSquad fails", async () => {
    deleteAllPotEntriesForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyPotEntries(manyPotEntries, squadId))
      .rejects
      .toThrow("Failed to replace potEntries: delete fail");

    expect(deleteAllPotEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPotEntriesMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyPotEntries fails", async () => {
    deleteAllPotEntriesForSquadMock.mockResolvedValue(1);
    postManyPotEntriesMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyPotEntries(manyPotEntries, squadId))
      .rejects
      .toThrow("Failed to replace potEntries: post fail");

    expect(deleteAllPotEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPotEntriesMock).toHaveBeenCalledTimes(1);
  });
});