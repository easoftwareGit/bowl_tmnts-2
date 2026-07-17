import { populatePfRows } from "@/app/dataEntry/prizeFunds/prizeFundGrid/prizeFundRows";
import type { prizeFundType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn(),
}));

const mockBtDbUuid = jest.mocked(btDbUuid);

describe("populatePfRows", () => {
  const divId = "div_12345678901234567890123456789012";
  const potId = "pot_12345678901234567890123456789012";
  const elimId = "elm_12345678901234567890123456789012";

  beforeEach(() => {
    jest.clearAllMocks();

    let uuidCount = 2;
    mockBtDbUuid.mockImplementation((prefix: string) => {
      const suffix = String(uuidCount).padStart(32, "0");
      uuidCount += 1;
      return `${prefix}_${suffix}`;
    });
  });

  it("returns an empty array when PrizeFund is 0", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePfRows(testPrizeFunds, divId, 0, 1);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("returns an empty array when positions is 0", () => {
    const result = populatePfRows([], divId, 100, 0);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("populates rows from existing prizeFunds", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        parent_id: divId,
        position: 2,
        amount: 50,
      },
    ];

    const result = populatePfRows(testPrizeFunds, divId, 200, 2);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        parent_id: divId,
        position: 2,
        amount: 50,
        percentage: 0.25,
      },
    ]);

    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("creates missing rows with generated ids - division prize Fund", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePfRows(testPrizeFunds, divId, 200, 3);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        parent_id: divId,
        position: 2,
        amount: 0,
        percentage: 0,
      },
      {
        id: "dpf_00000000000000000000000000000003",
        parent_id: divId,
        position: 3,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(1, "dpf");
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(2, "dpf");
  });

  it("creates missing rows with generated ids - pot prize Fund", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        parent_id: potId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePfRows(testPrizeFunds, potId, 200, 3);

    expect(result).toEqual([
      {
        id: "ppf_00000000000000000000000000000001",
        parent_id: potId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "ppf_00000000000000000000000000000002",
        parent_id: potId,
        position: 2,
        amount: 0,
        percentage: 0,
      },
      {
        id: "ppf_00000000000000000000000000000003",
        parent_id: potId,
        position: 3,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(1, "ppf");
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(2, "ppf");
  });

  it("creates missing rows with generated ids - eliminator prize Fund", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "epf_00000000000000000000000000000001",
        parent_id: elimId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePfRows(testPrizeFunds, elimId, 200, 3);

    expect(result).toEqual([
      {
        id: "epf_00000000000000000000000000000001",
        parent_id: elimId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "epf_00000000000000000000000000000002",
        parent_id: elimId,
        position: 2,
        amount: 0,
        percentage: 0,
      },
      {
        id: "epf_00000000000000000000000000000003",
        parent_id: elimId,
        position: 3,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(1, "epf");
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(2, "epf");
  });

  it("only returns rows up to the requested number of positions", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 100,
      },
      {
        id: "dpf_00000000000000000000000000000002",
        parent_id: divId,
        position: 2,
        amount: 75,
      },
      {
        id: "dpf_00000000000000000000000000000003",
        parent_id: divId,
        position: 3,
        amount: 50,
      },
    ];

    const result = populatePfRows(testPrizeFunds, divId, 300, 2);

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.position)).toEqual([1, 2]);
  });

  it("converts an existing null amount to 0", () => {
    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: null,
      },
    ];

    const result = populatePfRows(testPrizeFunds, divId, 200, 1);

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: divId,
        position: 1,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });  

  it("returns an empty array when the parent id type is invalid", () => {
    const result = populatePfRows(
      [],
      "brk_12345678901234567890123456789012",
      200,
      3,
    );

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });  

  it("only uses existing prize funds for the requested parent", () => {
    const otherDivId = "div_99999999999999999999999999999999";

    const testPrizeFunds: prizeFundType[] = [
      {
        id: "dpf_00000000000000000000000000000001",
        parent_id: otherDivId,
        position: 1,
        amount: 150,
      },
    ];

    const result = populatePfRows(
      testPrizeFunds,
      divId,
      200,
      1,
    );

    expect(result).toEqual([
      {
        id: "dpf_00000000000000000000000000000002",
        parent_id: divId,
        position: 1,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
    expect(mockBtDbUuid).toHaveBeenCalledWith("dpf");
  });  
});