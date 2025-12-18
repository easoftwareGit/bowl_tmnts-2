import { divType } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";

const tmntId = "tmt_e134ac14c5234d708d26037ae812ac33";

const manyDivs: divType[] = [
  {
    ...initDiv,
    id: "div_1f42042f9ef24029a0a2d48cc276a088", // changed last digit to make unique
    tmnt_id: tmntId,
    div_name: "Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true,
    hdcp_for: "Game",
    sort_order: 11,
  },
  {
    ...initDiv,
    id: "div_29b9225d8dd44a4eae276f8bde855728", // changed last digit to make unique
    tmnt_id: tmntId,
    div_name: "50+ Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true,
    hdcp_for: "Game",
    sort_order: 12,
  },
];

describe("replaceManyDivs - non standard throw cases", () => {
  let replaceManyDivs: typeof import("@/lib/db/divs/dbDivsReplaceMany").replaceManyDivs;
  let deleteAllDivsForTmntMock: jest.Mock;
  let postManyDivsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/divs/dbDivs",
      () => ({
        __esModule: true,
        deleteAllDivsForTmnt: jest.fn(),
        postManyDivs: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyDivs } = require(
      "@/lib/db/divs/dbDivsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllDivsForTmnt: deleteAllDivsForTmntMock,
      postManyDivs: postManyDivsMock,
    } = require("@/lib/db/divs/dbDivs"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllDivsForTmnt fails", async () => {
    deleteAllDivsForTmntMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyDivs(manyDivs, tmntId))
      .rejects
      .toThrow("Failed to replace divs: delete fail");

    expect(deleteAllDivsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManyDivsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyPlayers fails", async () => {
    deleteAllDivsForTmntMock.mockResolvedValue(1);
    postManyDivsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyDivs(manyDivs, tmntId))
      .rejects
      .toThrow("Failed to replace divs: post fail");

    expect(deleteAllDivsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManyDivsMock).toHaveBeenCalledTimes(1);
  });
});  