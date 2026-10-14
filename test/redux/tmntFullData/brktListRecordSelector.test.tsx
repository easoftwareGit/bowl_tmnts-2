import {
  getBrktList,
  getBrktListRecords,
  getBrktListRecordsWithResults,
} from "@/redux/features/tmntFullData/brktListRecordsSelector";
import oneTmntGameResultsReducer, {
  fetchOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import {
  buildBrktListRecords,
  type brktListRecord,
} from "@/components/brackets/buildBrktLists";
import { BracketList } from "@/components/brackets/bracketListClass";
import { store } from "@/redux/store";
import type { RootState } from "@/redux/store";
import {
  brktId1,
  brktId2,
  mockTmntFullData,
  tmntId,
} from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { updateAllBracketMatches } from "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches";
import {
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import { cloneDeep, isEqual } from "lodash";

const notFoundBrktId = "brk_01234567890123456789012345678901";

jest.mock(
  "@/components/brackets/buildBrktLists",
  () => ({
    buildBrktListRecords: jest.fn(),
  }),
);

jest.mock(
  "@/app/results/tmnt/[tmntId]/brackets/updateAllBracketMatches",
  () => ({
    updateAllBracketMatches: jest.fn(),
  }),
);

const mockBuildBrktListRecords =
  buildBrktListRecords as jest.MockedFunction<
    typeof buildBrktListRecords
  >;

const mockUpdateAllBracketMatches =
  updateAllBracketMatches as jest.MockedFunction<
    typeof updateAllBracketMatches
  >;

describe("brktListRecordsSelector", () => {
  let state: RootState;
  let bracketList1: BracketList;
  let bracketList2: BracketList;
  let brktListRecords: brktListRecord;

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

      const updatedRecords: brktListRecord = {
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

  describe("getBrktListRecordsWithResults", () => {
    const OTHER_TMNT_ID = "tmt_differentid00000000000000000000";

    const results = [
      { player_id: "ply_1", div_id: "div_1" },
      { player_id: "ply_2", div_id: "div_1" },
    ] as unknown as tmntGameResult[];

    // The results slice's state, built by the slice's own reducer, so the field
    // names always match what the selectors read. An empty tournament id means
    // no results have been loaded.
    const sliceStateFor = (
      resultsTmntId: string,
      tmntResults: tmntGameResult[],
    ) => {
      const initial = oneTmntGameResultsReducer(undefined, { type: "@@INIT" });
      if (resultsTmntId === "") return initial;

      // the same two actions the thunk dispatches at runtime, in the same order
      const pending = oneTmntGameResultsReducer(
        initial,
        fetchOneTmntGameResults.pending("req-1", resultsTmntId),
      );
      return oneTmntGameResultsReducer(
        pending,
        fetchOneTmntGameResults.fulfilled(tmntResults, "req-1", resultsTmntId),
      );
    };

    // the key the results slice is stored under in the root state: the entry
    // whose value is the slice's initial state
    const resultsKey = (base: RootState): string => {
      const initial = oneTmntGameResultsReducer(undefined, { type: "@@INIT" });
      const key = Object.keys(base).find((k) =>
        isEqual((base as unknown as Record<string, unknown>)[k], initial),
      );
      if (!key) throw new Error("results slice not found in the root state");
      return key;
    };

    // the state with the results slice set to results for the given tournament
    const stateWithResults = (
      base: RootState,
      resultsTmntId: string,
      tmntResults: tmntGameResult[] = results,
    ): RootState =>
      ({
        ...base,
        [resultsKey(store.getState())]: sliceStateFor(resultsTmntId, tmntResults),
      }) as unknown as RootState;

    it("the mock tournament's id is the id the results are matched against", () => {
      expect(state.tmntFullData.tmntFullData.tmnt.id).toBe(tmntId);
    });

    describe("the state shape the tests assume", () => {
      // if these fail, the field names in stateWithResults need to match the slice
      it("reads the results tournament id from the state", () => {
        const withResults = stateWithResults(state, tmntId);

        expect(getOneTmntGameResultsTmntId(withResults)).toBe(tmntId);
      });

      it("reads the results from the state", () => {
        const withResults = stateWithResults(state, tmntId);

        expect(selectOneTmntGameResults(withResults)).toBe(results);
      });
    });

    describe("building the lists", () => {
      it("builds the bracket list records from tmntFullData", () => {
        const withResults = stateWithResults(state, tmntId);

        const result = getBrktListRecordsWithResults(withResults);

        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
        expect(mockBuildBrktListRecords).toHaveBeenCalledWith(
          state.tmntFullData.tmntFullData,
        );
        expect(result).toBe(brktListRecords);
      });

      it("returns the record that buildBrktListRecords built, not a copy", () => {
        const result = getBrktListRecordsWithResults(
          stateWithResults(state, tmntId),
        );

        expect(result).toBe(brktListRecords);
        expect(result[brktId1]).toBe(bracketList1);
        expect(result[brktId2]).toBe(bracketList2);
      });
    });

    describe("applying the results", () => {
      it("applies the results to the lists it built, when they are for this tournament", () => {
        const withResults = stateWithResults(state, tmntId);

        const result = getBrktListRecordsWithResults(withResults);

        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledWith(
          result,
          results,
        );
        expect(mockUpdateAllBracketMatches.mock.calls[0][0]).toBe(
          brktListRecords,
        );
        expect(mockUpdateAllBracketMatches.mock.calls[0][1]).toBe(results);
      });

      it("builds the lists before applying the results to them", () => {
        const order: string[] = [];
        mockBuildBrktListRecords.mockImplementation(() => {
          order.push("build");
          return brktListRecords;
        });
        mockUpdateAllBracketMatches.mockImplementation(() => {
          order.push("update");
        });

        getBrktListRecordsWithResults(stateWithResults(state, tmntId));

        expect(order).toEqual(["build", "update"]);
      });

      it("applies an empty results array too, once it is for this tournament", () => {
        getBrktListRecordsWithResults(stateWithResults(state, tmntId, []));

        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledWith(
          brktListRecords,
          [],
        );
      });

      it("does not apply another tournament's results", () => {
        const result = getBrktListRecordsWithResults(
          stateWithResults(state, OTHER_TMNT_ID),
        );

        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches).not.toHaveBeenCalled();
        expect(result).toBe(brktListRecords);
      });

      it("does not apply results when none have been loaded (empty tournament id)", () => {
        const result = getBrktListRecordsWithResults(
          stateWithResults(state, ""),
        );

        expect(mockUpdateAllBracketMatches).not.toHaveBeenCalled();
        expect(result).toBe(brktListRecords);
      });

      it("does not apply results when the tournament itself has no id", () => {
        const noIdState = {
          ...stateWithResults(state, ""),
          tmntFullData: {
            ...state.tmntFullData,
            tmntFullData: {
              ...state.tmntFullData.tmntFullData,
              tmnt: { ...state.tmntFullData.tmntFullData.tmnt, id: "" },
            },
          },
        } as RootState;

        getBrktListRecordsWithResults(noIdState);

        expect(mockUpdateAllBracketMatches).not.toHaveBeenCalled();
      });

      it("still returns the lists when the results are not applied", () => {
        const result = getBrktListRecordsWithResults(
          stateWithResults(state, OTHER_TMNT_ID),
        );

        expect(Object.keys(result)).toEqual([brktId1, brktId2]);
      });
    });

    describe("not changing the lists of getBrktListRecords", () => {
      it("builds its own lists each time it rebuilds, instead of reusing getBrktListRecords's", () => {
        const first = new BracketList(brktId1, 2, 3);
        const second = new BracketList(brktId1, 2, 3);
        mockBuildBrktListRecords
          .mockReturnValueOnce({ [brktId1]: first })
          .mockReturnValueOnce({ [brktId1]: second });

        const plain = getBrktListRecords(state);
        const withResults = getBrktListRecordsWithResults(
          stateWithResults(state, tmntId),
        );

        // two builds, two separate lists: updating one cannot change the other
        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(2);
        expect(withResults).not.toBe(plain);
        expect(withResults[brktId1]).not.toBe(plain[brktId1]);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches.mock.calls[0][0]).toBe(withResults);
        expect(mockUpdateAllBracketMatches.mock.calls[0][0]).not.toBe(plain);
      });

      it("does not call updateAllBracketMatches when only getBrktListRecords is used", () => {
        getBrktListRecords(state);

        expect(mockUpdateAllBracketMatches).not.toHaveBeenCalled();
      });
    });

    describe("memoization", () => {
      it("returns the same record, without rebuilding or updating again, for the same state", () => {
        const withResults = stateWithResults(state, tmntId);

        const first = getBrktListRecordsWithResults(withResults);
        const second = getBrktListRecordsWithResults(withResults);

        expect(second).toBe(first);
        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
      });

      it("returns the same record for a new state object with the same inputs", () => {
        const first = getBrktListRecordsWithResults(
          stateWithResults(state, tmntId),
        );
        const second = getBrktListRecordsWithResults({
          ...stateWithResults(state, tmntId),
        } as RootState);

        expect(second).toBe(first);
        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(1);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
      });

      it("rebuilds and applies the results again when the results change", () => {
        const first = getBrktListRecordsWithResults(
          stateWithResults(state, tmntId),
        );

        const newRecords: brktListRecord = {
          [brktId1]: new BracketList(brktId1, 2, 3),
        };
        mockBuildBrktListRecords.mockReturnValue(newRecords);
        const newResults = [...results];

        const second = getBrktListRecordsWithResults(
          stateWithResults(state, tmntId, newResults),
        );

        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(2);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(2);
        expect(mockUpdateAllBracketMatches).toHaveBeenLastCalledWith(
          newRecords,
          newResults,
        );
        expect(second).toBe(newRecords);
        expect(second).not.toBe(first);
      });

      it("rebuilds when tmntFullData changes", () => {
        const withResults = stateWithResults(state, tmntId);
        const first = getBrktListRecordsWithResults(withResults);

        const updatedTmntFullData = cloneDeep(state.tmntFullData.tmntFullData);
        updatedTmntFullData.tmnt.tmnt_name = "Updated Tournament";
        const updatedRecords: brktListRecord = {
          [brktId1]: new BracketList(brktId1, 2, 3),
        };
        mockBuildBrktListRecords.mockReturnValue(updatedRecords);

        const updatedState = {
          ...withResults,
          tmntFullData: {
            ...withResults.tmntFullData,
            tmntFullData: updatedTmntFullData,
          },
        } as RootState;
        const second = getBrktListRecordsWithResults(updatedState);

        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(2);
        expect(mockBuildBrktListRecords).toHaveBeenLastCalledWith(
          updatedTmntFullData,
        );
        expect(second).toBe(updatedRecords);
        expect(second).not.toBe(first);
      });

      it("rebuilds without applying results when the results change to another tournament's", () => {
        getBrktListRecordsWithResults(stateWithResults(state, tmntId));
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);

        mockBuildBrktListRecords.mockReturnValue({
          [brktId1]: new BracketList(brktId1, 2, 3),
        });
        getBrktListRecordsWithResults(stateWithResults(state, OTHER_TMNT_ID));

        expect(mockBuildBrktListRecords).toHaveBeenCalledTimes(2);
        expect(mockUpdateAllBracketMatches).toHaveBeenCalledTimes(1);
      });
    });

    describe("errors", () => {
      it("lets an error from buildBrktListRecords propagate, and does not apply results", () => {
        mockBuildBrktListRecords.mockImplementation(() => {
          throw new Error("No div for brkt in buildBrktListRecords");
        });

        expect(() =>
          getBrktListRecordsWithResults(stateWithResults(state, tmntId)),
        ).toThrow("No div for brkt in buildBrktListRecords");
        expect(mockUpdateAllBracketMatches).not.toHaveBeenCalled();
      });

      it("lets an error from updateAllBracketMatches propagate", () => {
        mockUpdateAllBracketMatches.mockImplementation(() => {
          throw new Error("gameScoreMap is null");
        });

        expect(() =>
          getBrktListRecordsWithResults(stateWithResults(state, tmntId)),
        ).toThrow("gameScoreMap is null");
      });
    });
  });  
});