import { populateDivPfRows } from "@/app/dataEntry/prizeFunds/oldDivPfGrid/divPfRows";
import type { divPfType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn(),
}));

const mockBtDbUuid = jest.mocked(btDbUuid);

describe("populateDivPfRows", () => {
  const divId = "div_12345678901234567890123456789012";

  beforeEach(() => {
    jest.clearAllMocks();

    let uuidCount = 2;
    mockBtDbUuid.mockImplementation((prefix: string) => {
      const suffix = String(uuidCount).padStart(32, "0");
      uuidCount += 1;
      return `${prefix}_${suffix}`;
    });
  });

  it("returns an empty array when divPrizeFund is 0", () => {
    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populateDivPfRows(divPfs, divId, 0, 1);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("returns an empty array when positions is 0", () => {
    const result = populateDivPfRows([], divId, 100, 0);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("populates rows from existing divPfs", () => {
    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: divId,
        position: 2,
        amount: 50,
      },
    ];

    const result = populateDivPfRows(divPfs, divId, 200, 2);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: divId,
        position: 2,
        amount: 50,
        percentage: 0.25,
      },
    ]);

    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("creates missing rows with generated ids", () => {
    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populateDivPfRows(divPfs, divId, 200, 3);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: divId,
        position: 2,
        amount: 0,
        percentage: 0,
      },
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 3,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(1, "dpf");
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(2, "dpf");
  });

  it("only returns rows up to the requested number of positions", () => {
    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        div_id: divId,
        position: 2,
        amount: 75,
      },
      {
        id: "dpf_00000000000000000000000000000003",
        div_id: divId,
        position: 3,
        amount: 50,
      },
    ];

    const result = populateDivPfRows(divPfs, divId, 300, 2);

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.position)).toEqual([1, 2]);
  });

  it("treats an existing null amount as 0 for percentage calculation", () => {
    const divPfs: divPfType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: null,
      },
    ];

    const result = populateDivPfRows(divPfs, divId, 200, 1);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        div_id: divId,
        position: 1,
        amount: null,
        percentage: 0,
      },
    ]);
  });
});