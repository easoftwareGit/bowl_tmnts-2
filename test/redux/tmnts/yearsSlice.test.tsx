import reducer, {
  tmntYearsSliceState,
  fetchTmntYears,
  selectTmntYears,
  getTmntYearsStatus,
  getTmntYearsError,
} from "@/redux/features/tmnts/yearsSlice";
import { RootState } from "@/redux/store";
import { loadStatusType } from "@/redux/statusTypes";
import { getTmntYears } from "@/lib/db/tmnts/dbTmnts";
import type { YearObj } from "@/lib/types/types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/tmnts/dbTmnts");

const mockedGetTmntYears = jest.mocked(getTmntYears);

const mockYears: YearObj[] = [{ year: "2024" }, { year: "2023" }, { year: "2022" }];

const makeStore = () =>
  configureStore({
    reducer: { tmntYears: reducer },
  });

describe("tmntYearsSlice reducer + thunk", () => {
  const initialState: tmntYearsSliceState = {
    data: [],
    status: "idle",
    error: "",
  };

  // state after a successful load
  const loadedState: tmntYearsSliceState = {
    ...initialState,
    data: mockYears,
    status: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchTmntYears.pending", () => {
      const state = reducer(initialState, { type: fetchTmntYears.pending.type });

      expect(state).toEqual({
        ...initialState,
        status: "loading",
      });
    });

    it("fetchTmntYears.pending clears a previous error and keeps loaded years", () => {
      const state = reducer(
        { ...loadedState, status: "failed", error: "old error" },
        { type: fetchTmntYears.pending.type },
      );

      expect(state.status).toBe("loading");
      expect(state.error).toBe("");
      expect(state.data).toEqual(mockYears);
    });

    it("should handle fetchTmntYears.fulfilled", () => {
      const state = reducer(initialState, {
        type: fetchTmntYears.fulfilled.type,
        payload: mockYears,
      });

      expect(state).toEqual({
        data: mockYears,
        status: "succeeded",
        error: "",
      });
    });

    it("should handle fetchTmntYears.rejected", () => {
      const errorMessage = "DB error";
      const state = reducer(initialState, {
        type: fetchTmntYears.rejected.type,
        error: { message: errorMessage },
      });

      expect(state).toEqual({
        data: [],
        status: "failed",
        error: errorMessage,
      });
    });

    it("fetchTmntYears.rejected uses a default message when error has none", () => {
      const state = reducer(initialState, {
        type: fetchTmntYears.rejected.type,
        error: {},
      });

      expect(state.error).toBe("Unknown error fetching tmnt years");
    });

    it("fetchTmntYears.rejected keeps previously loaded years", () => {
      const state = reducer(loadedState, {
        type: fetchTmntYears.rejected.type,
        error: { message: "DB error" },
      });

      expect(state.status).toBe("failed");
      expect(state.data).toEqual(mockYears);
    });
  });

  describe("selectors", () => {
    const selectorState = {
      tmntYears: {
        data: mockYears,
        status: "succeeded" as loadStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectTmntYears returns the years array", () => {
      expect(selectTmntYears(selectorState)).toBe(mockYears);
    });

    it("getTmntYearsStatus returns the status", () => {
      expect(getTmntYearsStatus(selectorState)).toBe("succeeded");
    });

    it("getTmntYearsError returns the error", () => {
      expect(getTmntYearsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchTmntYears", () => {
    it("dispatches fulfilled when getTmntYears resolves", async () => {
      mockedGetTmntYears.mockResolvedValueOnce(mockYears);
      const store = makeStore();

      const action = await store.dispatch(fetchTmntYears() as any);

      expect(fetchTmntYears.fulfilled.match(action)).toBe(true);

      const state = store.getState().tmntYears;

      expect(mockedGetTmntYears).toHaveBeenCalledTimes(1);
      expect(state.status).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.data).toEqual(mockYears);
    });

    it("dispatches fulfilled when getTmntYears resolves an empty array", async () => {
      mockedGetTmntYears.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchTmntYears() as any);

      expect(fetchTmntYears.fulfilled.match(action)).toBe(true);
      expect(store.getState().tmntYears.status).toBe("succeeded");
      expect(store.getState().tmntYears.data).toEqual([]);
    });

    it("dispatches rejected when getTmntYears rejects", async () => {
      mockedGetTmntYears.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchTmntYears() as any);

      expect(fetchTmntYears.rejected.match(action)).toBe(true);

      const state = store.getState().tmntYears;

      expect(state.status).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.data).toEqual([]);
    });

    it("a failed reload keeps the years already loaded", async () => {
      mockedGetTmntYears
        .mockResolvedValueOnce(mockYears)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchTmntYears() as any);
      await store.dispatch(fetchTmntYears() as any);

      const state = store.getState().tmntYears;

      expect(mockedGetTmntYears).toHaveBeenCalledTimes(2);
      expect(state.status).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.data).toEqual(mockYears);
    });
  });
});
