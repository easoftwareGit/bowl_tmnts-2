import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const manyPlayers: playerType[] = [
  {
    ...initPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_be57bef21fc64d199c2f6de4408bd136",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 1,
    position: "B",
  },
];

describe("replaceManyPlayers - non standard throw cases", () => {
  let replaceManyPlayers: typeof import("@/lib/db/players/dbPlayersReplaceMany").replaceManyPlayers;
  let deleteAllPlayersForSquadMock: jest.Mock;
  let postManyPlayersMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/players/dbPlayers",
      () => ({
        __esModule: true,
        deleteAllPlayersForSquad: jest.fn(),
        postManyPlayers: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyPlayers } = require(
      "@/lib/db/players/dbPlayersReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllPlayersForSquad: deleteAllPlayersForSquadMock,
      postManyPlayers: postManyPlayersMock,
    } = require("@/lib/db/players/dbPlayers"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllPlayersForSquad fails", async () => {
    deleteAllPlayersForSquadMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyPlayers(manyPlayers, squadId))
      .rejects
      .toThrow("Failed to replace players: delete fail");

    expect(deleteAllPlayersForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPlayersMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyPlayers fails", async () => {
    deleteAllPlayersForSquadMock.mockResolvedValue(1);
    postManyPlayersMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyPlayers(manyPlayers, squadId))
      .rejects
      .toThrow("Failed to replace players: post fail");

    expect(deleteAllPlayersForSquadMock).toHaveBeenCalledTimes(1);
    expect(postManyPlayersMock).toHaveBeenCalledTimes(1);
  });
});