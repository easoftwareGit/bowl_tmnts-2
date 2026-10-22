import reducer, {
  oneTmntGameResultsState,
  fetchOneTmntGameResults,
  selectOneTmntGameResults,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsError,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/results/dbResults");

const mockedGetGameResultsForTmnt = jest.mocked(getGameResultsForTmnt);

// db functions are mocked, so these ids only need to be distinct
const tmntId = "tmt_00000000000000000000000000000001";
const otherTmntId = "tmt_00000000000000000000000000000099";

// minimal stand-in rows; the slice never looks inside a result
const mockResults = [
  { id: "gam_00000000000000000000000000000001" },
  { id: "gam_00000000000000000000000000000002" },
] as unknown as tmntGameResult[];
const otherResults = [
  { id: "gam_00000000000000000000000000000003" },
] as unknown as tmntGameResult[];

const makeStore = () =>
  configureStore({
    reducer: { oneTmntGameResults: reducer },
  });

describe("oneTmntGameResultsSlice reducer + thunk", () => {
  const initialState: oneTmntGameResultsState = {
    games: [],
    requestedTmntId: "",
    tmntId: "",
    loadStatus: "idle",
    error: "",
  };

  // state after a successful load of tmntId
  const loadedState: oneTmntGameResultsState = {
    ...initialState,
    games: mockResults,
    requestedTmntId: tmntId,
    tmntId: tmntId,
    loadStatus: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchOneTmntGameResults.pending", () => {
      const state = reducer(initialState, {
        type: fetchOneTmntGameResults.pending.type,
        meta: { arg: tmntId },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe("");
      expect(state.games).toEqual([]);
    });

    it("fetchOneTmntGameResults.pending does not change tmntId or games from a previous load", () => {
      const state = reducer(loadedState, {
        type: fetchOneTmntGameResults.pending.type,
        meta: { arg: otherTmntId },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.games).toEqual(mockResults);
    });

    it("fetchOneTmntGameResults.pending clears a previous error", () => {
      const state = reducer(
        { ...initialState, loadStatus: "failed", error: "old error" },
        { type: fetchOneTmntGameResults.pending.type, meta: { arg: tmntId } },
      );

      expect(state.error).toBe("");
    });

    it("should handle fetchOneTmntGameResults.fulfilled", () => {
      const pendingState = reducer(initialState, {
        type: fetchOneTmntGameResults.pending.type,
        meta: { arg: tmntId },
      });

      const state = reducer(pendingState, {
        type: fetchOneTmntGameResults.fulfilled.type,
        payload: mockResults,
        meta: { arg: tmntId },
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.error).toBe("");
      expect(state.games).toEqual(mockResults);
    });

    it("fetchOneTmntGameResults.fulfilled sets tmntId for the current request", () => {
      const state = reducer(
        { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
        {
          type: fetchOneTmntGameResults.fulfilled.type,
          payload: otherResults,
          meta: { arg: otherTmntId },
        },
      );

      expect(state.tmntId).toBe(otherTmntId);
      expect(state.games).toEqual(otherResults);
    });

    it("should handle fetchOneTmntGameResults.rejected", () => {
      const errorMessage = "DB error";

      const pendingState = reducer(initialState, {
        type: fetchOneTmntGameResults.pending.type,
        meta: { arg: tmntId },
      });

      const state = reducer(pendingState, {
        type: fetchOneTmntGameResults.rejected.type,
        error: { message: errorMessage },
        meta: { arg: tmntId },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe(errorMessage);
      expect(state.games).toEqual([]);
    });

    it("fetchOneTmntGameResults.rejected keeps tmntId and games from a previous load", () => {
      const state = reducer(
        { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
        {
          type: fetchOneTmntGameResults.rejected.type,
          error: { message: "DB error" },
          meta: { arg: otherTmntId },
        },
      );

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB error");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.games).toEqual(mockResults);
    });

    it("ignores a stale fetchOneTmntGameResults.fulfilled for an older request", () => {
      const state = reducer(
        { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
        {
          type: fetchOneTmntGameResults.fulfilled.type,
          payload: otherResults,
          meta: { arg: tmntId },
        },
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.tmntId).toBe(tmntId);
      expect(state.games).toEqual(mockResults);
    });

    it("ignores a stale fetchOneTmntGameResults.rejected for an older request", () => {
      const state = reducer(
        { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
        {
          type: fetchOneTmntGameResults.rejected.type,
          error: { message: "DB error" },
          meta: { arg: tmntId },
        },
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.error).toBe("");
    });
  });

  describe("selectors", () => {
    const selectorState = {
      oneTmntGameResults: {
        games: mockResults,
        requestedTmntId: otherTmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectOneTmntGameResults returns the games array", () => {
      expect(selectOneTmntGameResults(selectorState)).toBe(mockResults);
    });

    it("getOneTmntGameResultsRequestedTmntId returns the requested tournament id", () => {
      expect(getOneTmntGameResultsRequestedTmntId(selectorState)).toBe(otherTmntId);
    });

    it("getOneTmntGameResultsTmntId returns the loaded tournament id", () => {
      expect(getOneTmntGameResultsTmntId(selectorState)).toBe(tmntId);
    });

    it("getOneTmntGameResultsLoadStatus returns the load status", () => {
      expect(getOneTmntGameResultsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getOneTmntGameResultsError returns the error", () => {
      expect(getOneTmntGameResultsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchOneTmntGameResults", () => {
    it("dispatches fulfilled when getGameResultsForTmnt resolves", async () => {
      mockedGetGameResultsForTmnt.mockResolvedValueOnce(mockResults);
      const store = makeStore();

      const action = await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      expect(fetchOneTmntGameResults.fulfilled.match(action)).toBe(true);

      const state = store.getState().oneTmntGameResults;

      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.games).toEqual(mockResults);
    });

    it("dispatches fulfilled when getGameResultsForTmnt resolves an empty array", async () => {
      mockedGetGameResultsForTmnt.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      expect(fetchOneTmntGameResults.fulfilled.match(action)).toBe(true);

      const state = store.getState().oneTmntGameResults;

      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.games).toEqual([]);
    });

    it("dispatches rejected when getGameResultsForTmnt resolves null", async () => {
      mockedGetGameResultsForTmnt.mockResolvedValueOnce(null);
      const store = makeStore();

      const action = await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      expect(fetchOneTmntGameResults.rejected.match(action)).toBe(true);

      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Error fetching game results for tournament");
      expect(state.tmntId).toBe("");
      expect(state.games).toEqual([]);
    });

    it("dispatches rejected when getGameResultsForTmnt rejects", async () => {
      mockedGetGameResultsForTmnt.mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      const action = await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      expect(fetchOneTmntGameResults.rejected.match(action)).toBe(true);

      const state = store.getState().oneTmntGameResults;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB error");
      expect(state.games).toEqual([]);
    });

    it("loading a second tournament updates tmntId", async () => {
      mockedGetGameResultsForTmnt
        .mockResolvedValueOnce(mockResults)
        .mockResolvedValueOnce(otherResults);
      const store = makeStore();

      await store.dispatch(fetchOneTmntGameResults(tmntId) as any);
      await store.dispatch(fetchOneTmntGameResults(otherTmntId) as any);

      const state = store.getState().oneTmntGameResults;

      expect(mockedGetGameResultsForTmnt).toHaveBeenNthCalledWith(1, tmntId);
      expect(mockedGetGameResultsForTmnt).toHaveBeenNthCalledWith(2, otherTmntId);
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.games).toEqual(otherResults);
    });

    it("a failed second load keeps the first tournament's tmntId and games", async () => {
      mockedGetGameResultsForTmnt
        .mockResolvedValueOnce(mockResults)
        .mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      await store.dispatch(fetchOneTmntGameResults(tmntId) as any);
      await store.dispatch(fetchOneTmntGameResults(otherTmntId) as any);

      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB error");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.games).toEqual(mockResults);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: tmntGameResult[]) => void;
      const firstResponse = new Promise<tmntGameResult[]>((resolve) => {
        resolveFirst = resolve;
      });

      mockedGetGameResultsForTmnt
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(otherResults);
      const store = makeStore();

      // start tmntId, then otherTmntId; otherTmntId finishes first
      const firstDispatch = store.dispatch(fetchOneTmntGameResults(tmntId) as any);
      await store.dispatch(fetchOneTmntGameResults(otherTmntId) as any);

      // now the older tmntId response arrives late
      resolveFirst(mockResults);
      await firstDispatch;

      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.games).toEqual(otherResults);
    });
  });
});
