import type { brktSeedType } from "@/lib/types/types";
import { initBrktSeed } from "@/lib/db/initVals";

const squadId = 'sqd_42be0f9d527e4081972ce8877190489d';
const manyBrktSeeds: brktSeedType[] = [
  {
    ...initBrktSeed,
    one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
    seed: 0,
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
  }, 
  {
    ...initBrktSeed,
    one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
    seed: 1,
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
  }
]

describe("replaceManyBrktSeeds - non standard throw cases", () => {  
  let replaceManyBrktSeeds: typeof import("@/lib/db/brktSeeds/dbBrktSeedsReplaceMany").replaceManyBrktSeeds;
  let deleteAllBrktSeedsForSquadMock: jest.Mock;
  let postManyBrktSeedsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(      
      "@/lib/db/brktSeeds/dbBrktSeeds",
      () => ({
        __esModule: true,
        deleteAllBrktSeedsForSquad: jest.fn(),
        postManyBrktSeeds: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyBrktSeeds } = require(      
      "@/lib/db/brktSeeds/dbBrktSeedsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllBrktSeedsForSquad: deleteAllBrktSeedsForSquadMock,
      postManyBrktSeeds: postManyBrktSeedsMock,    
    } = require("@/lib/db/brktSeeds/dbBrktSeeds"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllBrktSeedsForSquad fails", async () => {
    deleteAllBrktSeedsForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyBrktSeeds(manyBrktSeeds, squadId))
      .rejects
      .toThrow("Failed to replace brktSeeds: delete fail");

    expect(deleteAllBrktSeedsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktSeedsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyBrktSeeds fails", async () => {
    deleteAllBrktSeedsForSquadMock.mockResolvedValue(1);
    postManyBrktSeedsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyBrktSeeds(manyBrktSeeds, squadId))
      .rejects
      .toThrow("Failed to replace brktSeeds: post fail");

    expect(deleteAllBrktSeedsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyBrktSeedsMock).toHaveBeenCalledTimes(1);
  });
});