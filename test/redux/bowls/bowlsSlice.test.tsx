import reducer, {
  bowlsSliceState,
  fetchBowls,
  saveBowl,
  resetSaveStatus,
  selectAllBowls,
  getBowlsLoadStatus,
  getBowlsSaveStatus,
  getBowlsError,
} from "@/redux/features/bowls/bowlsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
import { mockBowl } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import type { bowlType } from "@/lib/types/types";

jest.mock("@/lib/db/bowls/dbBowls");

const mockedGetBowls = jest.mocked(getBowls);
const mockedUpsertBowl = jest.mocked(upsertBowl);

// db functions are mocked, so ids and names only need to be distinct
const makeBowl = (id: string, bowl_name: string): bowlType => ({
  ...mockBowl,
  id,
  bowl_name,
});

const bowlA = makeBowl("bwl_00000000000000000000000000000001", "Alpha Lanes");
const bowlM = makeBowl("bwl_00000000000000000000000000000002", "Middle Bowl");
const bowlZ = makeBowl("bwl_00000000000000000000000000000003", "Zebra Bowl");
const mockBowls: bowlType[] = [bowlA, bowlM, bowlZ];

const makeStore = (preloaded?: bowlsSliceState) =>
  configureStore({
    reducer: { bowls: reducer },
    preloadedState: preloaded ? { bowls: preloaded } : undefined,
  });

describe("bowlsSlice reducer + thunk", () => {
  const initialState: bowlsSliceState = {
    bowls: [],
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load
  const loadedState: bowlsSliceState = {
    ...initialState,
    bowls: mockBowls,
    loadStatus: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    describe("fetchBowls", () => {
      it("should handle fetchBowls.pending", () => {
        const state = reducer(initialState, { type: fetchBowls.pending.type });

        expect(state).toEqual({
          ...initialState,
          loadStatus: "loading",
        });
      });

      it("fetchBowls.pending clears a previous error and keeps loaded bowls", () => {
        const state = reducer(
          { ...loadedState, loadStatus: "failed", error: "old error" },
          { type: fetchBowls.pending.type },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
        expect(state.bowls).toEqual(mockBowls);
      });

      it("should handle fetchBowls.fulfilled", () => {
        const state = reducer(initialState, {
          type: fetchBowls.fulfilled.type,
          payload: mockBowls,
        });

        expect(state).toEqual({
          ...initialState,
          bowls: mockBowls,
          loadStatus: "succeeded",
        });
      });

      it("should handle fetchBowls.rejected", () => {
        const errorMessage = "DB error";
        const state = reducer(initialState, {
          type: fetchBowls.rejected.type,
          error: { message: errorMessage },
        });

        expect(state).toEqual({
          ...initialState,
          loadStatus: "failed",
          error: errorMessage,
        });
      });

      it("fetchBowls.rejected uses a default message when error has none", () => {
        const state = reducer(initialState, {
          type: fetchBowls.rejected.type,
          error: {},
        });

        expect(state.error).toBe("Unknown error fetching bowls");
      });

      it("fetchBowls.rejected keeps previously loaded bowls", () => {
        const state = reducer(loadedState, {
          type: fetchBowls.rejected.type,
          error: { message: "DB error" },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.bowls).toEqual(mockBowls);
      });
    });

    describe("saveBowl", () => {
      it("should handle saveBowl.pending", () => {
        const state = reducer(
          { ...initialState, error: "old error" },
          { type: saveBowl.pending.type },
        );

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("saveBowl.fulfilled replaces an existing bowl", () => {
        // new name still sorts between Alpha and Zebra, so it stays at index 1
        const updatedM = { ...bowlM, bowl_name: "Middle Bowl Updated" };

        const state = reducer(loadedState, {
          type: saveBowl.fulfilled.type,
          payload: updatedM,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.bowls).toHaveLength(3);
        expect(state.bowls[1]).toEqual(updatedM);
      });

      it("saveBowl.fulfilled adds a new bowl in bowl_name order", () => {
        const newBowl = makeBowl("bwl_00000000000000000000000000000004", "Lucky Strike");

        const state = reducer(loadedState, {
          type: saveBowl.fulfilled.type,
          payload: newBowl,
        });

        expect(state.bowls.map((b) => b.bowl_name)).toEqual([
          "Alpha Lanes",
          "Lucky Strike",
          "Middle Bowl",
          "Zebra Bowl",
        ]);
      });

      it("saveBowl.fulfilled re-sorts when a bowl is renamed", () => {
        const renamedA = { ...bowlA, bowl_name: "Omega Lanes" };

        const state = reducer(loadedState, {
          type: saveBowl.fulfilled.type,
          payload: renamedA,
        });

        expect(state.bowls.map((b) => b.id)).toEqual([bowlM.id, renamedA.id, bowlZ.id]);
      });

      it("saveBowl.fulfilled sorts case-insensitively", () => {
        const lowerBowl = makeBowl("bwl_00000000000000000000000000000005", "beta bowl");

        const state = reducer(loadedState, {
          type: saveBowl.fulfilled.type,
          payload: lowerBowl,
        });

        expect(state.bowls.map((b) => b.bowl_name)).toEqual([
          "Alpha Lanes",
          "beta bowl",
          "Middle Bowl",
          "Zebra Bowl",
        ]);
      });

      it("saveBowl.fulfilled does not change loadStatus", () => {
        const state = reducer(loadedState, {
          type: saveBowl.fulfilled.type,
          payload: bowlA,
        });

        expect(state.loadStatus).toBe("succeeded");
      });

      it("should handle saveBowl.rejected", () => {
        const errorMessage = "Save failed";
        const state = reducer(initialState, {
          type: saveBowl.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.bowls).toEqual([]);
      });

      it("saveBowl.rejected uses a default message when error has none", () => {
        const state = reducer(initialState, {
          type: saveBowl.rejected.type,
          error: {},
        });

        expect(state.error).toBe("Unknown error saving bowl");
      });

      it("saveBowl.rejected keeps the loaded bowls", () => {
        const state = reducer(loadedState, {
          type: saveBowl.rejected.type,
          error: { message: "Save failed" },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.bowls).toEqual(mockBowls);
      });
    });

    describe("resetSaveStatus", () => {
      it("sets saveStatus back to idle", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "succeeded" },
          resetSaveStatus(),
        );

        expect(state.saveStatus).toBe("idle");
      });

      it("does not change other state", () => {
        const before: bowlsSliceState = {
          ...loadedState,
          saveStatus: "failed",
          error: "Save failed",
        };

        const state = reducer(before, resetSaveStatus());

        expect(state).toEqual({ ...before, saveStatus: "idle" });
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      bowls: {
        bowls: mockBowls,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectAllBowls returns the bowls array", () => {
      expect(selectAllBowls(selectorState)).toBe(mockBowls);
    });

    it("getBowlsLoadStatus returns the load status", () => {
      expect(getBowlsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getBowlsSaveStatus returns the save status", () => {
      expect(getBowlsSaveStatus(selectorState)).toBe("failed");
    });

    it("getBowlsError returns the error", () => {
      expect(getBowlsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchBowls", () => {
    it("dispatches fulfilled when getBowls resolves", async () => {
      mockedGetBowls.mockResolvedValueOnce(mockBowls);
      const store = makeStore();

      const action = await store.dispatch(fetchBowls() as any);

      expect(fetchBowls.fulfilled.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(mockedGetBowls).toHaveBeenCalledTimes(1);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.bowls).toEqual(mockBowls);
    });

    it("dispatches fulfilled when getBowls resolves an empty array", async () => {
      mockedGetBowls.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchBowls() as any);

      expect(fetchBowls.fulfilled.match(action)).toBe(true);
      expect(store.getState().bowls.loadStatus).toBe("succeeded");
      expect(store.getState().bowls.bowls).toEqual([]);
    });

    it("dispatches rejected when getBowls resolves null", async () => {
      mockedGetBowls.mockResolvedValueOnce(null as any);
      const store = makeStore();

      const action = await store.dispatch(fetchBowls() as any);

      expect(fetchBowls.rejected.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Error fetching bowls");
      expect(state.bowls).toEqual([]);
    });

    it("dispatches rejected when getBowls rejects", async () => {
      mockedGetBowls.mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      const action = await store.dispatch(fetchBowls() as any);

      expect(fetchBowls.rejected.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB error");
      expect(state.bowls).toEqual([]);
    });
  });

  describe("Thunk tests saveBowl", () => {
    it("dispatches fulfilled when upsertBowl resolves", async () => {
      mockedUpsertBowl.mockResolvedValueOnce(mockBowl);
      const store = makeStore();

      const action = await store.dispatch(saveBowl(mockBowl) as any);

      expect(saveBowl.fulfilled.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(mockedUpsertBowl).toHaveBeenCalledTimes(1);
      expect(mockedUpsertBowl).toHaveBeenCalledWith(mockBowl);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.bowls).toEqual([mockBowl]);
    });

    it("updates an existing bowl in a loaded store", async () => {
      // renamed to sort before "Alpha Lanes", so it moves from last to first
      const updatedZ = { ...bowlZ, bowl_name: "Aardvark Lanes" };
      mockedUpsertBowl.mockResolvedValueOnce(updatedZ);
      const store = makeStore(loadedState);

      await store.dispatch(saveBowl(updatedZ) as any);

      const state = store.getState().bowls;

      expect(state.saveStatus).toBe("succeeded");
      expect(state.bowls).toHaveLength(3);
      expect(state.bowls.map((b) => b.id)).toEqual([updatedZ.id, bowlA.id, bowlM.id]);
    });

    it("dispatches rejected when upsertBowl resolves null", async () => {
      mockedUpsertBowl.mockResolvedValueOnce(null as any);
      const store = makeStore(loadedState);

      const action = await store.dispatch(saveBowl(bowlA) as any);

      expect(saveBowl.rejected.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error saving bowl");
      expect(state.bowls).toEqual(mockBowls);
    });

    it("dispatches rejected when upsertBowl rejects", async () => {
      mockedUpsertBowl.mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      const action = await store.dispatch(saveBowl(mockBowl) as any);

      expect(saveBowl.rejected.match(action)).toBe(true);

      const state = store.getState().bowls;

      expect(mockedUpsertBowl).toHaveBeenCalledWith(mockBowl);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("DB error");
      expect(state.bowls).toEqual([]);
    });
  });
});

// import reducer, { fetchBowls, saveBowl, bowlsSliceState } from "@/redux/features/bowls/bowlsSlice";
// import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
// import { mockBowl } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { configureStore } from "@reduxjs/toolkit";

// jest.mock("@/lib/db/bowls/dbBowls", () => ({
//   getBowls: jest.fn(),
//   upsertBowl: jest.fn(),
// }));

// describe('bowlSlice reducer + thunk', () => {
  
//   const initialState: bowlsSliceState = {
//     bowls: [],
//     loadStatus: 'idle',
//     saveStatus: 'idle',
//     error: '',
//   };

//   //
//   // --- Reducer unit tests ---
//   //

//   it("should return the initial state", () => {
//     expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
//   });

//   it('should handle fetchBowls.pending', () => {
//     const state = reducer(initialState, { type: fetchBowls.pending.type });
//     expect(state).toEqual({
//       bowls: [],
//       loadStatus: 'loading',
//       saveStatus: 'idle',
//       error: '',
//     });
//   });

//   it('should handle fetchBowls.fulfilled', () => {
    
//     const state = reducer(initialState, {
//       type: fetchBowls.fulfilled.type,
//       payload: mockBowl
//     });
//     expect(state).toEqual({
//       bowls: mockBowl,
//       loadStatus: 'succeeded',
//       saveStatus: 'idle',
//       error: '',
//     });
//   });

//   it('should handle fetchBowls.rejected', () => {
//     const errormessage = 'DB error'
//     const state = reducer(initialState, {
//       type: fetchBowls.rejected.type,
//       error: { message: errormessage }
//     });
//     expect(state).toEqual({
//       bowls: [],
//       loadStatus: 'failed',
//       saveStatus: 'idle',
//       error: errormessage,
//     });
//   });

//   //
//   // --- Thunk tests (fetch) ---
//   //

//   it('dispatches fulfilled when getBowls resolves', async () => {
//     (getBowls as jest.Mock).mockResolvedValueOnce(mockBowl);

//     const store = configureStore({
//       reducer: { bowls: reducer },
//     });

//     await store.dispatch(fetchBowls() as any);

//     const state = store.getState().bowls;
//     expect(state.loadStatus).toBe("succeeded");
//     expect(state.bowls).toEqual(mockBowl);
//   });


//   it('dispatches rejected when getBowls rejects', async () => {
//     (getBowls as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

//     const store = configureStore({
//       reducer: { bowls: reducer },
//     });

//     await store.dispatch(fetchBowls() as any);

//     const state = store.getState().bowls;
//     expect(state.loadStatus).toBe("failed");
//     expect(state.error).toBe("DB error");
//   });

//   //
//   // --- Thunk tests (save / update bowl) ---
//   //

//   it('dispatches fulfilled when saveBowl (upsert) resolves', async () => {
    
//     (upsertBowl as jest.Mock).mockResolvedValueOnce(mockBowl);

//     const store = configureStore({
//       reducer: { bowls: reducer },
//     });

//     await store.dispatch(saveBowl(mockBowl) as any);

//     const state = store.getState().bowls;

//     expect(upsertBowl).toHaveBeenCalledWith(mockBowl);
//     expect(state.loadStatus).toBe("idle");
//     expect(state.saveStatus).toBe("succeeded");
//     expect(state.error).toBe("");
//     expect(state.bowls).toContainEqual(mockBowl);
//   });

//   it('dispatches rejected when saveBowl (upsert) rejects', async () => {

//     (upsertBowl as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

//     const store = configureStore({
//       reducer: { bowls: reducer },
//     });

//     await store.dispatch(saveBowl(mockBowl) as any);

//     const state = store.getState().bowls;

//     expect(upsertBowl).toHaveBeenCalledWith(mockBowl);
//     expect(state.loadStatus).toBe("idle");
//     expect(state.saveStatus).toBe("failed");
//     expect(state.error).toBe("DB error");
//     expect(state.bowls).toEqual([]);
//   });

// });

