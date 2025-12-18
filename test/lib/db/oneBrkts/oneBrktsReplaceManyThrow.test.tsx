import { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";
import { replaceManyOneBrkts } from "@/lib/db/oneBrkts/dbOneBrktsReplaceMany";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const manyOneBrkts: oneBrktType[] = [
  {
    ...initOneBrkt,
    id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
    brkt_id: 'brk_12344698f47e4d64935547923e2bdbfb',
    bindex: 0,
  },
  {
    ...initOneBrkt,
    id: 'obk_b1b2bc5682f042269cf0aaa8c32b25b8',
    brkt_id: 'brk_12344698f47e4d64935547923e2bdbfb',
    bindex: 1,
  },
];

describe("replaceManyOneBrkts - non standard throw cases", () => {
  let replaceManyOneBrkts: typeof import("@/lib/db/oneBrkts/dbOneBrktsReplaceMany").replaceManyOneBrkts;
  let deleteAllOneBrktsForSquadMock: jest.Mock;
  let postManyOneBrktsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/oneBrkts/dbOneBrkts",
      () => ({
        __esModule: true,
        deleteAllOneBrktsForSquad: jest.fn(),
        postManyOneBrkts: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyOneBrkts } = require(
      "@/lib/db/oneBrkts/dbOneBrktsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllOneBrktsForSquad: deleteAllOneBrktsForSquadMock,
      postManyOneBrkts: postManyOneBrktsMock,
    } = require("@/lib/db/oneBrkts/dbOneBrkts"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllOneBrktsForSquad fails", async () => {
    deleteAllOneBrktsForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyOneBrkts(manyOneBrkts, squadId))
      .rejects
      .toThrow("Failed to replace oneBrkts: delete fail");

    expect(deleteAllOneBrktsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyOneBrktsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when replaceManyOneBrkts fails", async () => {
    deleteAllOneBrktsForSquadMock.mockResolvedValue(1);
    postManyOneBrktsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyOneBrkts(manyOneBrkts, squadId))
      .rejects
      .toThrow("Failed to replace oneBrkts: post fail");

    expect(deleteAllOneBrktsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyOneBrktsMock).toHaveBeenCalledTimes(1);
  });
});