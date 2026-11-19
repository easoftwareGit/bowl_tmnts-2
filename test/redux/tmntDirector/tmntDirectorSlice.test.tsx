// test/redux/tmntDirector/tmntDirectorSlice.test.tsx
// tests src/redux/features/director/directorSlice.tsx
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import tmntDirectorReducer, {
  fetchTmntDirector,
  getTmntDirectorError,
  getTmntDirectorLoadStatus,
  getTmntDirectorRequestId,
  selectTmntDirector,
  type tmntDirectorSliceState,
} from "@/redux/features/director/directorSlice";
import { getTmntDirector } from "@/lib/db/tmnts/dbTmnts";
import { blankTmntDirector } from "@/lib/db/initVals";
import type { publicTmntDirectorType } from "@/lib/types/types";
import type { RootState } from "@/redux/store";

// mock the whole db module so no axios / network code runs
jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
  getTmntDirector: jest.fn(),
}));

const mockGetTmntDirector = getTmntDirector as jest.MockedFunction<
  typeof getTmntDirector
>;

const tmntIdA = "tmt_fd99387c33d9c78aba290286576ddce5";
const tmntIdB = "tmt_56d916ece6b50e6293300248c6792316";

const directorA: publicTmntDirectorType = {
  ...cloneDeep(blankTmntDirector),
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+18005551212",
};

const directorB: publicTmntDirectorType = {
  ...cloneDeep(blankTmntDirector),
  first_name: "Jane",
  last_name: "Roe",
  email: "jane.roe@example.com",
  phone: "+18005553434",
};

const makeStore = () =>
  configureStore({
    reducer: { tmntDirector: tmntDirectorReducer },
  });

// selectors only read state.tmntDirector, so a partial RootState is enough
const asRootState = (sliceState: tmntDirectorSliceState) =>
  ({ tmntDirector: sliceState }) as unknown as RootState;

const getInitialState = (): tmntDirectorSliceState =>
  tmntDirectorReducer(undefined, { type: "unknown" });

describe("tmntDirectorSlice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have a blank director, no requested id, idle status and no error", () => {
      const state = getInitialState();
      expect(state.tmntDirector).toEqual(blankTmntDirector);
      expect(state.requestedTmntId).toBe("");
      expect(state.currentRequestId).toBe("");
      expect(state.loadStatus).toBe("idle");
      expect(state.error).toBe("");
    });

    it("should not share a reference with blankTmntDirector", () => {
      const state = getInitialState();
      expect(state.tmntDirector).not.toBe(blankTmntDirector);
    });
  });

  describe("fetchTmntDirector - with store", () => {
    it("should load the director on success", async () => {
      mockGetTmntDirector.mockResolvedValueOnce(directorA);
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));

      const state = store.getState().tmntDirector;
      expect(mockGetTmntDirector).toHaveBeenCalledTimes(1);
      expect(mockGetTmntDirector).toHaveBeenCalledWith(tmntIdA);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(tmntIdA);
      expect(state.error).toBe("");
      expect(state.tmntDirector).toEqual(directorA);
    });

    it("should set loading while the request is pending", async () => {
      let resolveFn: (value: publicTmntDirectorType) => void = () => {};
      mockGetTmntDirector.mockReturnValueOnce(
        new Promise<publicTmntDirectorType>((resolve) => {
          resolveFn = resolve;
        }),
      );
      const store = makeStore();

      const promise = store.dispatch(fetchTmntDirector(tmntIdA));
      expect(store.getState().tmntDirector.loadStatus).toBe("loading");
      expect(store.getState().tmntDirector.requestedTmntId).toBe(tmntIdA);

      resolveFn(directorA);
      await promise;
      expect(store.getState().tmntDirector.loadStatus).toBe("succeeded");
    });

    it("should set failed and the error message when getTmntDirector throws", async () => {
      mockGetTmntDirector.mockRejectedValueOnce(
        new Error("getTmntDirector failed: Network Error"),
      );
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));

      const state = store.getState().tmntDirector;
      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("getTmntDirector failed: Network Error");
      expect(state.tmntDirector).toEqual(blankTmntDirector);
    });

    it("should fail with 'Tournament director not found' when getTmntDirector returns null", async () => {
      mockGetTmntDirector.mockResolvedValueOnce(
        null as unknown as publicTmntDirectorType,
      );
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));

      const state = store.getState().tmntDirector;
      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Tournament director not found");
    });

    it("should use the default error message when the thrown error has no message", async () => {
      // a thrown non-Error object serializes with no message
      mockGetTmntDirector.mockRejectedValueOnce({});
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));

      const state = store.getState().tmntDirector;
      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Unknown error fetching tournament director");
    });

    it("should replace the director when a different tmnt is loaded", async () => {
      mockGetTmntDirector
        .mockResolvedValueOnce(directorA)
        .mockResolvedValueOnce(directorB);
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));
      await store.dispatch(fetchTmntDirector(tmntIdB));

      const state = store.getState().tmntDirector;
      expect(state.requestedTmntId).toBe(tmntIdB);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.tmntDirector).toEqual(directorB);
    });

    it("should reset the director to blank when a later load fails", async () => {
      mockGetTmntDirector
        .mockResolvedValueOnce(directorA)
        .mockRejectedValueOnce(new Error("Tournament director not found"));
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));
      expect(store.getState().tmntDirector.tmntDirector).toEqual(directorA);

      await store.dispatch(fetchTmntDirector(tmntIdB));

      const state = store.getState().tmntDirector;
      expect(state.loadStatus).toBe("failed");
      expect(state.requestedTmntId).toBe(tmntIdB);
      expect(state.tmntDirector).toEqual(blankTmntDirector);
    });

    it("should skip a second request for the same tmnt while the first is loading", async () => {
      let resolveFn: (value: publicTmntDirectorType) => void = () => {};
      mockGetTmntDirector.mockReturnValueOnce(
        new Promise<publicTmntDirectorType>((resolve) => {
          resolveFn = resolve;
        }),
      );
      const store = makeStore();

      // like React Strict Mode running the useEffect twice
      const promise1 = store.dispatch(fetchTmntDirector(tmntIdA));
      const promise2 = store.dispatch(fetchTmntDirector(tmntIdA));
      resolveFn(directorA);
      await Promise.all([promise1, promise2]);

      expect(mockGetTmntDirector).toHaveBeenCalledTimes(1);
      const state = store.getState().tmntDirector;
      expect(state.loadStatus).toBe("succeeded");
      expect(state.tmntDirector).toEqual(directorA);
    });

    it("should fetch the same tmnt again once the first load has finished", async () => {
      mockGetTmntDirector
        .mockResolvedValueOnce(directorA)
        .mockResolvedValueOnce(directorA);
      const store = makeStore();

      await store.dispatch(fetchTmntDirector(tmntIdA));
      await store.dispatch(fetchTmntDirector(tmntIdA));

      expect(mockGetTmntDirector).toHaveBeenCalledTimes(2);
      expect(store.getState().tmntDirector.loadStatus).toBe("succeeded");
    });

    it("should keep the newest director when an older request finishes last", async () => {
      let resolveA: (value: publicTmntDirectorType) => void = () => {};
      mockGetTmntDirector
        .mockReturnValueOnce(
          new Promise<publicTmntDirectorType>((resolve) => {
            resolveA = resolve;
          }),
        )
        .mockResolvedValueOnce(directorB);
      const store = makeStore();

      const promiseA = store.dispatch(fetchTmntDirector(tmntIdA));
      await store.dispatch(fetchTmntDirector(tmntIdB));
      resolveA(directorA); // A's response arrives after B's
      await promiseA;

      const state = store.getState().tmntDirector;
      expect(state.requestedTmntId).toBe(tmntIdB);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.tmntDirector).toEqual(directorB);
    });
  });

  describe("reducer cases", () => {
    it("pending should set loading, requestedTmntId and currentRequestId, and clear the error", () => {
      const prev: tmntDirectorSliceState = {
        ...getInitialState(),
        error: "old error",
        loadStatus: "failed",
      };
      const state = tmntDirectorReducer(
        prev,
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      expect(state.loadStatus).toBe("loading");
      expect(state.requestedTmntId).toBe(tmntIdA);
      expect(state.currentRequestId).toBe("req1");
      expect(state.error).toBe("");
    });

    it("fulfilled should copy only the 4 public fields", () => {
      // payload with extra, private fields that must never reach the state
      const payloadWithExtras = {
        ...directorA,
        id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
        password_hash: "secret-hash",
        role: "DIRECTOR",
      } as unknown as publicTmntDirectorType;

      let state = tmntDirectorReducer(
        getInitialState(),
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.fulfilled(payloadWithExtras, "req1", tmntIdA),
      );

      expect(state.tmntDirector).toEqual(directorA);
      expect(state.tmntDirector).not.toHaveProperty("id");
      expect(state.tmntDirector).not.toHaveProperty("password_hash");
      expect(state.tmntDirector).not.toHaveProperty("role");
    });

    it("fulfilled should not carry over fields from a previous director", () => {
      const prev: tmntDirectorSliceState = {
        ...getInitialState(),
        tmntDirector: { ...directorA },
        requestedTmntId: tmntIdB,
        currentRequestId: "req2",
        loadStatus: "loading",
      };
      // tmnt B's director has no phone
      const directorBNoPhone: publicTmntDirectorType = {
        ...directorB,
        phone: "",
      };

      const state = tmntDirectorReducer(
        prev,
        fetchTmntDirector.fulfilled(directorBNoPhone, "req2", tmntIdB),
      );
      expect(state.tmntDirector).toEqual(directorBNoPhone);
      expect(state.tmntDirector.phone).toBe("");
    });

    it("fulfilled should ignore a stale response", () => {
      let state = tmntDirectorReducer(
        getInitialState(),
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      // user switched to tmnt B before tmnt A's response came back
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.pending("req2", tmntIdB),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.fulfilled(directorA, "req1", tmntIdA),
      );

      expect(state.requestedTmntId).toBe(tmntIdB);
      expect(state.loadStatus).toBe("loading");
      expect(state.tmntDirector).toEqual(blankTmntDirector);
    });

    it("fulfilled should ignore a stale response for the same tmnt", () => {
      // two requests for the same tmnt: only the latest one counts
      let state = tmntDirectorReducer(
        getInitialState(),
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.pending("req2", tmntIdA),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.fulfilled(directorA, "req1", tmntIdA),
      );

      expect(state.currentRequestId).toBe("req2");
      expect(state.loadStatus).toBe("loading");
      expect(state.tmntDirector).toEqual(blankTmntDirector);
    });

    it("rejected should set failed, the error message and a blank director", () => {
      let state = tmntDirectorReducer(
        { ...getInitialState(), tmntDirector: { ...directorA } },
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.rejected(
          new Error("Tournament director not found"),
          "req1",
          tmntIdA,
        ),
      );

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Tournament director not found");
      expect(state.tmntDirector).toEqual(blankTmntDirector);
    });

    it("rejected should ignore a stale failure", () => {
      let state = tmntDirectorReducer(
        getInitialState(),
        fetchTmntDirector.pending("req1", tmntIdA),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.pending("req2", tmntIdB),
      );
      state = tmntDirectorReducer(
        state,
        fetchTmntDirector.rejected(new Error("stale"), "req1", tmntIdA),
      );

      expect(state.requestedTmntId).toBe(tmntIdB);
      expect(state.loadStatus).toBe("loading");
      expect(state.error).toBe("");
    });
  });

  describe("selectors", () => {
    const sliceState: tmntDirectorSliceState = {
      tmntDirector: { ...directorA },
      requestedTmntId: tmntIdA,
      currentRequestId: "req1",
      loadStatus: "failed",
      error: "some error",
    };
    const rootState = asRootState(sliceState);

    it("selectTmntDirector should return the director", () => {
      expect(selectTmntDirector(rootState)).toEqual(directorA);
    });

    it("getTmntDirectorRequestId should return the requested tmnt id", () => {
      expect(getTmntDirectorRequestId(rootState)).toBe(tmntIdA);
    });

    it("getTmntDirectorLoadStatus should return the load status", () => {
      expect(getTmntDirectorLoadStatus(rootState)).toBe("failed");
    });

    it("getTmntDirectorError should return the error", () => {
      expect(getTmntDirectorError(rootState)).toBe("some error");
    });
  });

  it("should not mutate blankTmntDirector", async () => {
    const before = cloneDeep(blankTmntDirector);
    mockGetTmntDirector.mockResolvedValueOnce(directorA);
    const store = makeStore();

    await store.dispatch(fetchTmntDirector(tmntIdA));

    expect(blankTmntDirector).toEqual(before);
  });
});