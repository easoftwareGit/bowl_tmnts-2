import { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";

const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
const manySquads: squadType[] = [
  {
    ...initSquad,
    id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    squad_name: 'Test 1',
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: '2022-08-01',
    squad_time: '10:00 AM',
    games: 6,
    lane_count: 10,
    starting_lane: 11,
    finalized: true,
    sort_order: 1,
  },
  {
    ...initSquad,
    id: 'sqd_20c24199328447f8bbe95c05e1b84646',
    squad_name: 'Test 2',
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: '2022-08-01',
    squad_time: '03:00 PM',
    games: 6,
    lane_count: 12,
    starting_lane: 1,
    finalized: false,
    sort_order: 2,
  },
];

describe("replaceManySquads - non standard throw cases", () => {
  let replaceManySquads: typeof import("@/lib/db/squads/dbSquadsReplaceMany").replaceManySquads;
  let deleteAllSquadsForTmntMock: jest.Mock;
  let postManySquadsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/squads/dbSquads",
      () => ({
        __esModule: true,
        deleteAllSquadsForTmnt: jest.fn(),
        postManySquads: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManySquads } = require(
      "@/lib/db/squads/dbSquadsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllSquadsForTmnt: deleteAllSquadsForTmntMock,
      postManySquads: postManySquadsMock,
    } = require("@/lib/db/squads/dbSquads"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllSquadsForTmnt fails", async () => {
    deleteAllSquadsForTmntMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManySquads(manySquads, tmntId))
      .rejects
      .toThrow("Failed to replace squads: delete fail");

    expect(deleteAllSquadsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManySquadsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManySquads fails", async () => {
    deleteAllSquadsForTmntMock.mockResolvedValue(1);
    postManySquadsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManySquads(manySquads, tmntId))
      .rejects
      .toThrow("Failed to replace squads: post fail");

    expect(deleteAllSquadsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManySquadsMock).toHaveBeenCalledTimes(1);
  });
});