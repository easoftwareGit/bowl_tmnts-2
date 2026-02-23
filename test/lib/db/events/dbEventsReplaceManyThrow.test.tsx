import type { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";

const tmntId = 'tmt_e134ac14c5234d708d26037ae812ac33'

const manyEvents: eventType[] = [
  {
    ...initEvent,
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a63", // changed last digit to make unique
    tmnt_id: 'tmt_e134ac14c5234d708d26037ae812ac33',
    event_name: "Test 1",
    tab_title: "Test 1",
    team_size: 1,
    games: 6,
    entry_fee: '80',
    lineage: '18',
    prize_fund: '55',
    other: '2',
    expenses: '5',
    added_money: '0',    
    lpox: '80',
    sort_order: 11,
  },
  { 
    ...initEvent,
    id: "evt_cb55703a8a084acb86306e2944320e8e", // changed last digit to make unique
    tmnt_id: 'tmt_e134ac14c5234d708d26037ae812ac33',
    event_name: "Test 2",
    tab_title: "Test 2",
    team_size: 2,
    games: 6,
    entry_fee: '160',
    lineage: '36',
    prize_fund: '110',
    other: '4',
    expenses: '10',
    added_money: '0',
    lpox: '160',
    sort_order: 12,      
  } 
]
describe("replaceManyEvents - non standard throw cases", () => {
  let replaceManyEvents: typeof import("@/lib/db/events/dbEventsReplaceMany").replaceManyEvents;
  let deleteAllEventsForTmntMock: jest.Mock;
  let postManyEventsMock: jest.Mock;

  beforeEach(() => {
    // Reset the module registry so our new mocks will take effect
    jest.resetModules();

    // Mock only the two database functions we want to control
    jest.doMock(
      "@/lib/db/events/dbEvents",
      () => ({
        __esModule: true,
        deleteAllEventsForTmnt: jest.fn(),
        postManyEvents: jest.fn(),
      })
    );

    // Import the function under test *after* mocks are in place
    ({ replaceManyEvents } = require(
      "@/lib/db/events/dbEventsReplaceMany"
    ));

    // Import our mocked functions for direct access in tests
    ({
      deleteAllEventsForTmnt: deleteAllEventsForTmntMock,
      postManyEvents: postManyEventsMock,
    } = require("@/lib/db/events/dbEvents"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should throw an error when deleteAllEventsForTmnt fails", async () => {
    deleteAllEventsForTmntMock.mockRejectedValue(new Error("delete fail"));

    await expect(replaceManyEvents(manyEvents, tmntId))
      .rejects
      .toThrow("Failed to replace events: delete fail");

    expect(deleteAllEventsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManyEventsMock).not.toHaveBeenCalled();
  });

  it("should throw an error when postManyEvents fails", async () => {
    deleteAllEventsForTmntMock.mockResolvedValue(1);
    postManyEventsMock.mockRejectedValue(new Error("post fail"));

    await expect(replaceManyEvents(manyEvents, tmntId))
      .rejects
      .toThrow("Failed to replace events: post fail");

    expect(deleteAllEventsForTmntMock).toHaveBeenCalledTimes(1);
    expect(postManyEventsMock).toHaveBeenCalledTimes(1);
  });
});