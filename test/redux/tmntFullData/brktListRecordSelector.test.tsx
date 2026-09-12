import {
  getBrktList,
  getBrktListRecords,
} from "@/redux/features/tmntFullData/brktListRecordsSelector";
import {
  buildBrktListRecords,
  type BrktListRecord,
} from "@/components/brackets/buildBrktLists";
import { BracketList } from "@/components/brackets/bracketListClass";
import { store } from "@/redux/store";
import type { RootState } from "@/redux/store";
import {
  brktId1,
  brktId2,
  mockTmntFullData,
} from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

const notFoundBrktId = "brk_01234567890123456789012345678901";

jest.mock(
  "@/components/brackets/buildBrktLists",
  () => ({
    buildBrktListRecords: jest.fn(),
  }),
);

const mockBuildBrktListRecords =
  buildBrktListRecords as jest.MockedFunction<
    typeof buildBrktListRecords
  >;

describe("brktListRecordsSelector", () => {
  let state: RootState;
  let bracketList1: BracketList;
  let bracketList2: BracketList;
  let brktListRecords: BrktListRecord;

  beforeEach(() => {
    jest.clearAllMocks();

    const tmntFullData = cloneDeep(mockTmntFullData);

    state = {
      ...store.getState(),
      tmntFullData: {
        ...store.getState().tmntFullData,
        tmntFullData,
      },
    };

    bracketList1 = new BracketList(
      brktId1,
      2,
      3,
    );

    bracketList2 = new BracketList(
      brktId2,
      2,
      3,
    );

    brktListRecords = {
      [brktId1]: bracketList1,
      [brktId2]: bracketList2,
    };

    mockBuildBrktListRecords.mockReturnValue(brktListRecords);
  });

  describe("getBrktListRecords", () => {
    it("builds bracket list records from tmntFullData", () => {
      const result = getBrktListRecords(state);

      expect(mockBuildBrktListRecords).toHaveBeenCalledWith(
        state.tmntFullData.tmntFullData,
      );
      expect(result).toBe(brktListRecords);
    });

    it("calls buildBrktListRecords only once when tmntFullData has not changed", () => {
      const firstResult = getBrktListRecords(state);
      const secondResult = getBrktListRecords(state);

      expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
      expect(secondResult).toBe(firstResult);
    });

    it("rebuilds bracket list records when tmntFullData changes", () => {
      const firstResult = getBrktListRecords(state);

      const updatedTmntFullData = cloneDeep(
        state.tmntFullData.tmntFullData,
      );

      updatedTmntFullData.tmnt.tmnt_name = "Updated Tournament";

      const updatedBracketList1 =
        new BracketList(
          brktId1,
          2,
          3,
        );

      const updatedRecords: BrktListRecord = {
        [brktId1]: updatedBracketList1,
      };

      mockBuildBrktListRecords.mockReturnValue(updatedRecords);

      const updatedState: RootState = {
        ...state,
        tmntFullData: {
          ...state.tmntFullData,
          tmntFullData:
            updatedTmntFullData,
        },
      };

      const secondResult = getBrktListRecords(updatedState);

      expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(2);
      expect(mockBuildBrktListRecords).toHaveBeenLastCalledWith(
        updatedTmntFullData,
      );
      expect(secondResult).toBe(updatedRecords);
      expect(secondResult).not.toBe(firstResult);
    });
  });

  describe("getBrktList", () => {
    it("returns the BracketList for the requested bracket id", () => {
      const result = getBrktList(state, brktId1);

      expect(result).toBe(bracketList1);
    });

    it("returns the correct BracketList for different bracket ids", () => {
      const result1 = getBrktList(state, brktId1);
      const result2 = getBrktList(state, brktId2);

      expect(result1).toBe(bracketList1);
      expect(result2).toBe(bracketList2);
    });

    it("returns undefined when the bracket id is not found", () => {
      const result = getBrktList(state, notFoundBrktId);

      expect(result).toBeUndefined();
    });

    it("returns the same BracketList reference for repeated calls with the same inputs", () => {
      const firstResult = getBrktList(state, brktId1);
      const secondResult = getBrktList(state, brktId1);

      expect(secondResult).toBe(firstResult);
    });

    it("does not rebuild the BrktListRecord when selecting different bracket ids", () => {
      getBrktList(state, brktId1);
      getBrktList(state, brktId2);

      expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
    });
  });
});