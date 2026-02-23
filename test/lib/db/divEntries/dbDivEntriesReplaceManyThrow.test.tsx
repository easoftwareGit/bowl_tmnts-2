import type { divEntryType } from "@/lib/types/types";
import { initDivEntry } from "@/lib/db/initVals";

const squadId = "sqd_42be0f9d527e4081972ce8877190489d";
const manyDivEntries: divEntryType[] = [
  {
    ...initDivEntry,
    id: "den_652fc6c5556e407291c4b5666b2dccd7",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "80",
  },
  {
    ...initDivEntry,
    id: "den_ef36111c721147f7a2bf2702056947ce",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "80",
  },
];

describe("replaceManyDivEntries - non standard throw cases", () => {  
  let replaceManyDivEntries: typeof import("@/lib/db/divEntries/dbDivEntriesReplaceMany").replaceManyDivEntries;
  let deleteAllDivEntriesForSquadMock: jest.Mock;
  let postManyDivEntriesMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(      
      "@/lib/db/divEntries/dbDivEntries",
      () => ({
        __esModule: true,
        deleteAllDivEntriesForSquad: jest.fn(),
        postManyDivEntries: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyDivEntries } = require(      
      "@/lib/db/divEntries/dbDivEntriesReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllDivEntriesForSquad: deleteAllDivEntriesForSquadMock,
      postManyDivEntries: postManyDivEntriesMock,    
    } = require("@/lib/db/divEntries/dbDivEntries"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllDivEntriesForSquad fails", async () => {
    deleteAllDivEntriesForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyDivEntries(manyDivEntries, squadId))
      .rejects
      .toThrow("Failed to replace divEntries: delete fail");

    expect(deleteAllDivEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyDivEntriesMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyDivEntries fails", async () => {
    deleteAllDivEntriesForSquadMock.mockResolvedValue(1);
    postManyDivEntriesMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyDivEntries(manyDivEntries, squadId))
      .rejects
      .toThrow("Failed to replace divEntries: post fail");

    expect(deleteAllDivEntriesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyDivEntriesMock).toHaveBeenCalledTimes(1);
  });
});