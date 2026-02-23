import { initElim } from "@/lib/db/initVals";
import type { elimType } from "@/lib/types/types";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const manyElims: elimType[] = [
  {
    ...initElim,
    id: "elm_01758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    sort_order: 1,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_02758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
    sort_order: 2,
    start: 4,
    games: 3,
    fee: '5',
  },
];

describe("replaceManyElims - non standard throw cases", () => {
  let replaceManyElims: typeof import("@/lib/db/elims/dbElimsReplaceMany").replaceManyElims;
  let deleteAllElimsForSquadMock: jest.Mock;
  let postManyElimsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/elims/dbElims",
      () => ({
        __esModule: true,
        deleteAllElimsForSquad: jest.fn(),
        postManyElims: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyElims } = require(
      "@/lib/db/elims/dbElimsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllElimsForSquad: deleteAllElimsForSquadMock,
      postManyElims: postManyElimsMock,
    } = require("@/lib/db/elims/dbElims"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllElimsForSquad fails", async () => {
    deleteAllElimsForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyElims(manyElims, squadId))
      .rejects
      .toThrow("Failed to replace elims: delete fail");

    expect(deleteAllElimsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyElimsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyElims fails", async () => {
    deleteAllElimsForSquadMock.mockResolvedValue(1);
    postManyElimsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyElims(manyElims, squadId))
      .rejects
      .toThrow("Failed to replace elims: post fail");

    expect(deleteAllElimsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyElimsMock).toHaveBeenCalledTimes(1);
  });
});