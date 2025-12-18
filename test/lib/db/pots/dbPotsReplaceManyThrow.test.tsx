import { potCategoriesTypes, potType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const manyPots: potType[] = [
  {
    ...initPot,
    id: "pot_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: 'sqd_853edbcc963745b091829e3eadfcf064',
    div_id: 'div_621bfee84e774d5a9dc2e9b6bdc5d31c',
    sort_order: 1,
    fee: '20',
    pot_type: "Game" as potCategoriesTypes,
  },
  {
    ...initPot,
    id: "pot_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: 'sqd_853edbcc963745b091829e3eadfcf064',
    div_id: 'div_621bfee84e774d5a9dc2e9b6bdc5d31c',
    sort_order: 2,
    fee: '10',
    pot_type: "Last Game" as potCategoriesTypes,
  },
];

describe("replaceManyPots - non standard throw cases", () => {
  let replaceManyPots: typeof import("@/lib/db/pots/dbPotsReplaceMany").replaceManyPots;
  let deleteAllPotsForSquadMock: jest.Mock;
  let postManyPotsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/pots/dbPots",
      () => ({
        __esModule: true,
        deleteAllPotsForSquad: jest.fn(),
        postManyPots: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyPots } = require(
      "@/lib/db/pots/dbPotsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllPotsForSquad: deleteAllPotsForSquadMock,
      postManyPots: postManyPotsMock,
    } = require("@/lib/db/pots/dbPots"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllPotsForSquad fails", async () => {
    deleteAllPotsForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyPots(manyPots, squadId))
      .rejects
      .toThrow("Failed to replace pots: delete fail");

    expect(deleteAllPotsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPotsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyPots fails", async () => {
    deleteAllPotsForSquadMock.mockResolvedValue(1);
    postManyPotsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyPots(manyPots, squadId))
      .rejects
      .toThrow("Failed to replace pots: post fail");

    expect(deleteAllPotsForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPotsMock).toHaveBeenCalledTimes(1);
  });
});