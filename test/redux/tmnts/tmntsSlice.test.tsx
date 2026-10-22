import reducer, {
  TmntSliceState,
  fetchTmnts,
  clearTmnts,
  selectTmnts,
  getTmntsRequestedYear,
  getTmntsYear,
  getTmntsStatus,
  getTmntsError,
} from "@/redux/features/tmnts/tmntsSlice";
import { RootState } from "@/redux/store";
import { loadStatusType } from "@/redux/statusTypes";
import { getTmnts } from "@/lib/db/tmnts/dbTmnts";
import type { tmntsListType } from "@/lib/types/types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/tmnts/dbTmnts");

const mockedGetTmnts = jest.mocked(getTmnts);

const year2023 = "2023";
const year2022 = "2022";
const upcoming = ""; // "" means upcoming tmnts

const tmnts2023: tmntsListType[] = [
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    start_date_str: "2023-08-19",
    bowl: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
    },
  },
];

const tmnts2022: tmntsListType[] = [
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",
    user_id: "usr_516a113083983234fc316e31fb695b85",
    tmnt_name: "Yosemite 6 Gamer",
    start_date_str: "2022-01-02",
    bowl: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanes.com",
    },
  },
];

const makeStore = () =>
  configureStore({
    reducer: { tmnts: reducer },
  });

describe("tmntsSlice reducer + thunk", () => {
  const initialState: TmntSliceState = {
    tmnts: [],
    requestedYear: null,
    year: null,
    status: "idle",
    error: "",
  };

  // state after a successful load of 2023
  const loadedState: TmntSliceState = {
    ...initialState,
    tmnts: tmnts2023,
    requestedYear: year2023,
    year: year2023,
    status: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    describe("fetchTmnts", () => {
      it("should handle fetchTmnts.pending", () => {
        const state = reducer(initialState, {
          type: fetchTmnts.pending.type,
          meta: { arg: year2023 },
        });

        expect(state).toEqual({
          ...initialState,
          requestedYear: year2023,
          status: "loading",
        });
      });

      it("fetchTmnts.pending records '' for upcoming tmnts", () => {
        const state = reducer(initialState, {
          type: fetchTmnts.pending.type,
          meta: { arg: upcoming },
        });

        expect(state.requestedYear).toBe(upcoming);
      });

      it("fetchTmnts.pending keeps the previously loaded tmnts", () => {
        const state = reducer(loadedState, {
          type: fetchTmnts.pending.type,
          meta: { arg: year2022 },
        });

        expect(state.status).toBe("loading");
        expect(state.requestedYear).toBe(year2022);
        expect(state.year).toBe(year2023);
        expect(state.tmnts).toEqual(tmnts2023);
      });

      it("fetchTmnts.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, status: "failed", error: "old error" },
          { type: fetchTmnts.pending.type, meta: { arg: year2023 } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchTmnts.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchTmnts.pending.type,
          meta: { arg: year2023 },
        });

        const state = reducer(pendingState, {
          type: fetchTmnts.fulfilled.type,
          payload: tmnts2023,
          meta: { arg: year2023 },
        });

        expect(state).toEqual({
          tmnts: tmnts2023,
          requestedYear: year2023,
          year: year2023,
          status: "succeeded",
          error: "",
        });
      });

      it("fetchTmnts.fulfilled sets year to '' for upcoming tmnts", () => {
        const state = reducer(
          { ...loadedState, requestedYear: upcoming, status: "loading" },
          {
            type: fetchTmnts.fulfilled.type,
            payload: tmnts2022,
            meta: { arg: upcoming },
          },
        );

        expect(state.year).toBe(upcoming);
        expect(state.tmnts).toEqual(tmnts2022);
      });

      it("should handle fetchTmnts.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchTmnts.pending.type,
          meta: { arg: year2023 },
        });

        const state = reducer(pendingState, {
          type: fetchTmnts.rejected.type,
          error: { message: errorMessage },
          meta: { arg: year2023 },
        });

        expect(state).toEqual({
          tmnts: [],
          requestedYear: year2023,
          year: null,
          status: "failed",
          error: errorMessage,
        });
      });

      it("fetchTmnts.rejected uses a default message when error has none", () => {
        const state = reducer(
          { ...initialState, requestedYear: year2023, status: "loading" },
          { type: fetchTmnts.rejected.type, error: {}, meta: { arg: year2023 } },
        );

        expect(state.error).toBe("Unknown error fetching tmnts");
      });

      it("fetchTmnts.rejected keeps the previously loaded tmnts", () => {
        const state = reducer(
          { ...loadedState, requestedYear: year2022, status: "loading" },
          {
            type: fetchTmnts.rejected.type,
            error: { message: "DB error" },
            meta: { arg: year2022 },
          },
        );

        expect(state.status).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.year).toBe(year2023);
        expect(state.tmnts).toEqual(tmnts2023);
      });

      it("ignores a stale fetchTmnts.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedYear: year2022, status: "loading" },
          { type: fetchTmnts.fulfilled.type, payload: [], meta: { arg: year2023 } },
        );

        expect(state.status).toBe("loading");
        expect(state.year).toBe(year2023);
        expect(state.tmnts).toEqual(tmnts2023);
      });

      it("ignores a stale fetchTmnts.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedYear: year2022, status: "loading" },
          {
            type: fetchTmnts.rejected.type,
            error: { message: "DB error" },
            meta: { arg: year2023 },
          },
        );

        expect(state.status).toBe("loading");
        expect(state.error).toBe("");
      });

      it("treats upcoming ('') and a year as different requests", () => {
        const state = reducer(
          { ...loadedState, requestedYear: upcoming, status: "loading" },
          { type: fetchTmnts.fulfilled.type, payload: tmnts2022, meta: { arg: year2022 } },
        );

        expect(state.status).toBe("loading");
        expect(state.tmnts).toEqual(tmnts2023);
      });
    });

    describe("clearTmnts", () => {
      it("resets to the initial state", () => {
        const state = reducer(
          { ...loadedState, status: "failed", error: "DB error" },
          clearTmnts(),
        );

        expect(state).toEqual(initialState);
      });

      it("a fetch that finishes after clearTmnts is ignored", () => {
        const pendingState = reducer(initialState, {
          type: fetchTmnts.pending.type,
          meta: { arg: upcoming },
        });
        const clearedState = reducer(pendingState, clearTmnts());

        const state = reducer(clearedState, {
          type: fetchTmnts.fulfilled.type,
          payload: tmnts2023,
          meta: { arg: upcoming },
        });

        expect(state).toEqual(initialState);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      tmnts: {
        tmnts: tmnts2023,
        requestedYear: year2022,
        year: year2023,
        status: "succeeded" as loadStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectTmnts returns the tmnts array", () => {
      expect(selectTmnts(selectorState)).toBe(tmnts2023);
    });

    it("getTmntsRequestedYear returns the requested year", () => {
      expect(getTmntsRequestedYear(selectorState)).toBe(year2022);
    });

    it("getTmntsYear returns the loaded year", () => {
      expect(getTmntsYear(selectorState)).toBe(year2023);
    });

    it("getTmntsStatus returns the status", () => {
      expect(getTmntsStatus(selectorState)).toBe("succeeded");
    });

    it("getTmntsError returns the error", () => {
      expect(getTmntsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchTmnts", () => {
    it("dispatches fulfilled when getTmnts resolves", async () => {
      mockedGetTmnts.mockResolvedValueOnce(tmnts2023);
      const store = makeStore();

      const action = await store.dispatch(fetchTmnts(year2023) as any);

      expect(fetchTmnts.fulfilled.match(action)).toBe(true);

      const state = store.getState().tmnts;

      expect(mockedGetTmnts).toHaveBeenCalledTimes(1);
      expect(mockedGetTmnts).toHaveBeenCalledWith(year2023);
      expect(state.status).toBe("succeeded");
      expect(state.requestedYear).toBe(year2023);
      expect(state.year).toBe(year2023);
      expect(state.error).toBe("");
      expect(state.tmnts).toEqual(tmnts2023);
    });

    it("dispatches fulfilled for upcoming tmnts", async () => {
      mockedGetTmnts.mockResolvedValueOnce(tmnts2022);
      const store = makeStore();

      const action = await store.dispatch(fetchTmnts(upcoming) as any);

      expect(fetchTmnts.fulfilled.match(action)).toBe(true);
      expect(mockedGetTmnts).toHaveBeenCalledWith(upcoming);
      expect(store.getState().tmnts.year).toBe(upcoming);
      expect(store.getState().tmnts.tmnts).toEqual(tmnts2022);
    });

    it("dispatches fulfilled when getTmnts resolves an empty array", async () => {
      mockedGetTmnts.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchTmnts(year2023) as any);

      expect(fetchTmnts.fulfilled.match(action)).toBe(true);
      expect(store.getState().tmnts.status).toBe("succeeded");
      expect(store.getState().tmnts.tmnts).toEqual([]);
    });

    it("dispatches rejected when getTmnts rejects", async () => {
      mockedGetTmnts.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchTmnts(year2023) as any);

      expect(fetchTmnts.rejected.match(action)).toBe(true);

      const state = store.getState().tmnts;

      expect(state.status).toBe("failed");
      expect(state.requestedYear).toBe(year2023);
      expect(state.year).toBeNull();
      expect(state.error).toBe("DB failed");
      expect(state.tmnts).toEqual([]);
    });

    it("loading a second year replaces the first", async () => {
      mockedGetTmnts
        .mockResolvedValueOnce(tmnts2023)
        .mockResolvedValueOnce(tmnts2022);
      const store = makeStore();

      await store.dispatch(fetchTmnts(year2023) as any);
      await store.dispatch(fetchTmnts(year2022) as any);

      const state = store.getState().tmnts;

      expect(mockedGetTmnts).toHaveBeenNthCalledWith(1, year2023);
      expect(mockedGetTmnts).toHaveBeenNthCalledWith(2, year2022);
      expect(state.year).toBe(year2022);
      expect(state.tmnts).toEqual(tmnts2022);
    });

    it("a failed second load keeps the first year's tmnts", async () => {
      mockedGetTmnts
        .mockResolvedValueOnce(tmnts2023)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchTmnts(year2023) as any);
      await store.dispatch(fetchTmnts(year2022) as any);

      const state = store.getState().tmnts;

      expect(state.status).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.requestedYear).toBe(year2022);
      expect(state.year).toBe(year2023);
      expect(state.tmnts).toEqual(tmnts2023);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: tmntsListType[]) => void;
      const firstResponse = new Promise<tmntsListType[]>((resolve) => {
        resolveFirst = resolve;
      });

      mockedGetTmnts
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(tmnts2022);
      const store = makeStore();

      // start 2023, then 2022; 2022 finishes first
      const firstDispatch = store.dispatch(fetchTmnts(year2023) as any);
      await store.dispatch(fetchTmnts(year2022) as any);

      // now the older 2023 response arrives late
      resolveFirst(tmnts2023);
      await firstDispatch;

      const state = store.getState().tmnts;

      expect(state.status).toBe("succeeded");
      expect(state.requestedYear).toBe(year2022);
      expect(state.year).toBe(year2022);
      expect(state.tmnts).toEqual(tmnts2022);
    });

    it("a fetch that finishes after clearTmnts does not refill the list", async () => {
      let resolveFetch!: (value: tmntsListType[]) => void;
      const fetchResponse = new Promise<tmntsListType[]>((resolve) => {
        resolveFetch = resolve;
      });

      mockedGetTmnts.mockReturnValueOnce(fetchResponse);
      const store = makeStore();

      const fetchDispatch = store.dispatch(fetchTmnts(year2023) as any);
      store.dispatch(clearTmnts());

      resolveFetch(tmnts2023);
      await fetchDispatch;

      expect(store.getState().tmnts).toEqual(initialState);
    });
  });
});
