import { createByePlayer } from "@/components/brackets/byePlayer";
import { initPlayer } from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";
import { squadId1, byeId } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// Mock the uuid generator so we can assert deterministic output
jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn(),
}));

describe("createByePlayer", () => {  

  beforeEach(() => {
    jest.clearAllMocks();
    (btDbUuid as jest.Mock).mockReturnValue(byeId);
  });

  it("returns a playerType object based on initPlayer", () => {
    
    const result = createByePlayer(squadId1);

    // Ensure base object spread occurred
    expect(result).toEqual({
      ...initPlayer,
      id: byeId,
      squad_id: squadId1,
      first_name: "Bye",
      last_name: null,
      average: 0,
      lane: null,
      position: null,
    });
  });

  it("calls btDbUuid with the correct argument", () => {
    createByePlayer("sqd_abc");

    expect(btDbUuid).toHaveBeenCalledTimes(1);
    expect(btDbUuid).toHaveBeenCalledWith("bye");
  });

  it("sets squad_id to the provided squadId", () => {
    const squadId = "sqd_999";

    const result = createByePlayer(squadId);

    expect(result.squad_id).toBe(squadId);
  });

  it("always sets first_name to 'Bye'", () => {
    const result = createByePlayer("any_squad");

    expect(result.first_name).toBe("Bye");
  });

  it("sets numeric and nullable fields correctly", () => {
    const result = createByePlayer("sqd_123");

    expect(result.average).toBe(0);
    expect(result.last_name).toBeNull();
    expect(result.lane).toBeNull();
    expect(result.position).toBeNull();
  });
});
