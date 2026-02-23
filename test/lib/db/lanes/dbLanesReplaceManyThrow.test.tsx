import type { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";

const squadId = 'sqd_20c24199328447f8bbe95c05e1b84645';
const manyLanes: laneType[] = [
  {
    ...initLane,
    id: 'lan_20c24199328447f8bbe95c05e1b84601',
    lane_number: 1,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
  {
    ...initLane,
    id: 'lan_20c24199328447f8bbe95c05e1b84602',
    lane_number: 2,
    squad_id: 'sqd_20c24199328447f8bbe95c05e1b84645',
    in_use: true,
  },
];

describe("replaceManyLanes - non standard throw cases", () => {
  let replaceManyLanes: typeof import("@/lib/db/lanes/dbLanesReplaceMany").replaceManyLanes;
  let deleteAllLanesForSquadMock: jest.Mock;
  let postManyLanesMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/lanes/dbLanes",
      () => ({
        __esModule: true,
        deleteAllLanesForSquad: jest.fn(),
        postManyLanes: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyLanes } = require(
      "@/lib/db/lanes/dbLanesReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllLanesForSquad: deleteAllLanesForSquadMock,
      postManyLanes: postManyLanesMock,
    } = require("@/lib/db/lanes/dbLanes"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllLanesForSquad fails", async () => {
    deleteAllLanesForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyLanes(manyLanes, squadId))
      .rejects
      .toThrow("Failed to replace lanes: delete fail");

    expect(deleteAllLanesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyLanesMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyLanes fails", async () => {
    deleteAllLanesForSquadMock.mockResolvedValue(1);
    postManyLanesMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyLanes(manyLanes, squadId))
      .rejects
      .toThrow("Failed to replace lanes: post fail");

    expect(deleteAllLanesForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyLanesMock).toHaveBeenCalledTimes(1);
  });
});