import {
  createScoreColumns,
  gameScoreColName,
  gameScoreColHeaderName,
  scoreEntryIdColName,
  scoreEntryFirstNameColName,
  scoreEntryLastNameColName,
  scoreEntryLanePosColName,
  scoreEntryTotalColName,
  scoreEntryPlusMinusColName,
} from "@/app/dataEntry/scoresForm/sfCreateScoreColumns";

import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

import { maxScore } from "@/lib/validation/constants";

const mockCreateOptionalIntegerEdit = jest.fn();
const mockIsOptionalIntegerValid = jest.fn();

jest.mock(
  "@/lib/mobileDevices/mobileDevices",
  () => ({
    isTouchDevice: jest.fn(() => false),
  }),
);

jest.mock(
  "@/lib/syncfusionTools",
  () => ({
    createOptionalIntegerEdit: (...args: unknown[]) =>
      mockCreateOptionalIntegerEdit(...args),
    isOptionalIntegerValid: (...args: unknown[]) =>
      mockIsOptionalIntegerValid(...args),
  }),
);

describe("createScoreColumns", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("score column constants", () => {

    it("exports expected column names", () => {
      expect(scoreEntryIdColName).toBe("id");
      expect(scoreEntryFirstNameColName).toBe("first_name");
      expect(scoreEntryLastNameColName).toBe("last_name");
      expect(scoreEntryLanePosColName).toBe("lanePos");
      expect(scoreEntryTotalColName).toBe("total");
      expect(scoreEntryPlusMinusColName).toBe("plus_minus");
    });

  });

  describe("column helper functions", () => {

    it("creates game field names", () => {
      expect(gameScoreColName(1)).toBe("game_1");
      expect(gameScoreColName(6)).toBe("game_6");
    });

    it("creates game header names", () => {
      expect(gameScoreColHeaderName(1)).toBe("Gm 1");
      expect(gameScoreColHeaderName(6)).toBe("Gm 6");
    });

  });

  describe("createScoreColumns invalid data", () => {

    it("returns empty array when fullTmntData is undefined", () => {
      const cols = createScoreColumns(
        undefined as never,
      );

      expect(cols).toEqual([]);
    });

    it("returns empty array when divs are missing", () => {
      const data = {
        ...mockTmntFullData,
        divs: [],
      };

      const cols = createScoreColumns(data);

      expect(cols).toEqual([]);
    });

    it("returns empty array when squads are missing", () => {
      const data = {
        ...mockTmntFullData,
        squads: [],
      };

      const cols = createScoreColumns(data);

      expect(cols).toEqual([]);
    });

  });

  describe("createScoreColumns", () => {

    beforeEach(() => {
      jest.clearAllMocks();

      mockCreateOptionalIntegerEdit.mockReturnValue(
        {},
      );
    });

    it("creates expected number of columns", () => {
      const cols = createScoreColumns(
        mockTmntFullData,
      );

      expect(cols).toHaveLength(12);
    });

    it("creates six game columns", () => {
      const cols = createScoreColumns(
        mockTmntFullData,
      );

      expect(
        cols.some(
          c => c.field === "game_1",
        ),
      ).toBe(true);

      expect(
        cols.some(
          c => c.field === "game_6",
        ),
      ).toBe(true);
    });

    it("creates total column", () => {
      const cols = createScoreColumns(
        mockTmntFullData,
      );

      expect(
        cols.some(
          c => c.field === "total",
        ),
      ).toBe(true);
    });

    it("creates plus minus column", () => {
      const cols = createScoreColumns(
        mockTmntFullData,
      );

      expect(
        cols.some(
          c => c.field === "plus_minus",
        ),
      ).toBe(true);
    });

  });

  it("creates numeric editors for each game column", () => {
    createScoreColumns(
      mockTmntFullData,
    );

    expect(
      mockCreateOptionalIntegerEdit,
    ).toHaveBeenCalledTimes(6);

    expect(
      mockCreateOptionalIntegerEdit,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: "Gm 1",
        min: 0,
        max: maxScore,
      }),
    );
  });

  it("validation passes when validateNow is false", () => {
    const cols = createScoreColumns(
      mockTmntFullData,
    );

    const game1 = cols.find(
      c => c.field === "game_1",
    );

    const scoreRangeRule =
      game1?.validationRules?.scoreRangeRule as [
        (args: any) => boolean,
        string,
      ];

    const validator = scoreRangeRule[0];

    const result = validator?.({
      value: 999,
      element: {
        dataset: {},
      },
    });

    expect(result).toBe(true);
  });

  it("validation calls isOptionalIntegerValid when validateNow is true", () => {
    mockIsOptionalIntegerValid.mockReturnValue(
      true,
    );

    const cols = createScoreColumns(
      mockTmntFullData,
    );

    const game1 = cols.find(
      c => c.field === "game_1",
    );

    const scoreRangeRule =
      game1?.validationRules?.scoreRangeRule as [
        (args: any) => boolean,
        string,
      ];

    const validator = scoreRangeRule[0];

    validator?.({
      value: 220,
      element: {
        dataset: {
          validateNow: "true",
        },
      },
    });

    expect(
      mockIsOptionalIntegerValid,
    ).toHaveBeenCalledWith(
      220,
      0,
      maxScore,
    );
  });

});  