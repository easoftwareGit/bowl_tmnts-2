import { populatePotPfRows } from "@/app/dataEntry/prizeFunds/oldPotPfGrid/potPfRows";
import type { potPfType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

jest.mock("@/lib/uuid", () => ({
  btDbUuid: jest.fn(),
}));

const mockBtDbUuid = jest.mocked(btDbUuid);

describe("populatePotPfRows", () => {
  const potId = "pot_12345678901234567890123456789012";

  beforeEach(() => {
    jest.clearAllMocks();

    let uuidCount = 2;
    mockBtDbUuid.mockImplementation((prefix: string) => {
      const suffix = String(uuidCount).padStart(32, "0");
      uuidCount += 1;
      return `${prefix}_${suffix}`;
    });
  });

  it("returns an empty array when potPrizeFund is 0", () => {
    const divPfs: potPfType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePotPfRows(divPfs, potId, 0, 1);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("returns an empty array when positions is 0", () => {
    const result = populatePotPfRows([], potId, 100, 0);

    expect(result).toEqual([]);
    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("populates rows from existing divPfs", () => {
    const divPfs: potPfType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
      },
      {
        id: "ppf_00000000000000000000000000000002",
        pot_id: potId,
        position: 2,
        amount: 50,
      },
    ];

    const result = populatePotPfRows(divPfs, potId, 200, 2);

    expect(result).toEqual([
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "ppf_00000000000000000000000000000002",
        pot_id: potId,
        position: 2,
        amount: 50,
        percentage: 0.25,
      },
    ]);

    expect(mockBtDbUuid).not.toHaveBeenCalled();
  });

  it("creates missing rows with generated ids", () => {
    const potPfs: potPfType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
      },
    ];

    const result = populatePotPfRows(potPfs, potId, 200, 3);

    expect(result).toEqual([
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
        percentage: 0.5,
      },
      {
        id: "ppf_00000000000000000000000000000002",
        pot_id: potId,
        position: 2,
        amount: 0,
        percentage: 0,
      },
      {
        id: "ppf_00000000000000000000000000000003",
        pot_id: potId,
        position: 3,
        amount: 0,
        percentage: 0,
      },
    ]);

    expect(mockBtDbUuid).toHaveBeenCalledTimes(2);
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(1, "ppf");
    expect(mockBtDbUuid).toHaveBeenNthCalledWith(2, "ppf");
  });

  it("only returns rows up to the requested number of positions", () => {
    const potPfs: potPfType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: 100,
      },
      {
        id: "ppf_00000000000000000000000000000002",
        pot_id: potId,
        position: 2,
        amount: 75,
      },
      {
        id: "ppf_00000000000000000000000000000003",
        pot_id: potId,
        position: 3,
        amount: 50,
      },
    ];

    const result = populatePotPfRows(potPfs, potId, 300, 2);

    expect(result).toHaveLength(2);
    expect(result.map((row) => row.position)).toEqual([1, 2]);
  });

  it("treats an existing null amount as 0 for percentage calculation", () => {
    const potPfs: potPfType[] = [
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: null,
      },
    ];

    const result = populatePotPfRows(potPfs, potId, 200, 1);

    expect(result).toEqual([
      {
        id: "ppf_00000000000000000000000000000001",
        pot_id: potId,
        position: 1,
        amount: null,
        percentage: 0,
      },
    ]);
  });
});