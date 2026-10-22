import reducer, {
  potPfsState,
  fetchPotPfs,
  savePotPfs,
  selectPotPfs,
  getPotPfsRequestedTmntId,
  getPotPfsTmntId,
  getPotPfsLoadStatus,
  getPotPfsSaveStatus,
  getPotPfsError,
} from "@/redux/features/potPfs/potPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllPotPfsForTmnt,
  updateAllPotPfsForTmnt,
} from "@/lib/db/potPfs/dbPotPfs";
import { tmntId, mockPotPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { tmntPotPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/potPfs/dbPotPfs");

const mockedGetAllPotPfsForTmnt = jest.mocked(getAllPotPfsForTmnt);
const mockedUpdateAllPotPfsForTmnt = jest.mocked(updateAllPotPfsForTmnt);

// db functions are mocked, so this id only needs to differ from tmntId
const otherTmntId = "tmt_00000000000000000000000000000099";

const makeStore = () =>
  configureStore({
    reducer: {
      potPfs: reducer,
    },
  });

describe("potPfsSlice reducer + thunk", () => {
  const initialState: potPfsState = {
    potPfs: [],
    requestedTmntId: "",
    tmntId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load of tmntId
  const loadedState: potPfsState = {
    ...initialState,
    potPfs: mockPotPfs,
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

    describe("fetchPotPfs", () => {
      it("should handle fetchPotPfs.pending", () => {
        const state = reducer(initialState, {
          type: fetchPotPfs.pending.type,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe("");
        expect(state.potPfs).toEqual([]);
      });

      it("fetchPotPfs.pending does not change tmntId or potPfs from a previous load", () => {
        const state = reducer(loadedState, {
          type: fetchPotPfs.pending.type,
          meta: { arg: otherTmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.potPfs).toEqual(mockPotPfs);
      });

      it("fetchPotPfs.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, loadStatus: "failed", error: "old error" },
          { type: fetchPotPfs.pending.type, meta: { arg: tmntId } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchPotPfs.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchPotPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchPotPfs.fulfilled.type,
          payload: mockPotPfs,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("succeeded");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.error).toBe("");
        expect(state.potPfs).toEqual(mockPotPfs);
      });

      it("fetchPotPfs.fulfilled sets tmntId for the current request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchPotPfs.fulfilled.type,
            payload: [],
            meta: { arg: otherTmntId },
          },
        );

        expect(state.tmntId).toBe(otherTmntId);
        expect(state.potPfs).toEqual([]);
      });

      it("should handle fetchPotPfs.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchPotPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchPotPfs.rejected.type,
          error: { message: errorMessage },
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe(errorMessage);
        expect(state.potPfs).toEqual([]);
      });

      it("fetchPotPfs.rejected keeps tmntId and potPfs from a previous load", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchPotPfs.rejected.type,
            error: { message: "DB error" },
            meta: { arg: otherTmntId },
          },
        );

        expect(state.loadStatus).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.potPfs).toEqual(mockPotPfs);
      });

      it("ignores a stale fetchPotPfs.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchPotPfs.fulfilled.type, payload: [], meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.tmntId).toBe(tmntId);
        expect(state.potPfs).toEqual(mockPotPfs);
      });

      it("ignores a stale fetchPotPfs.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchPotPfs.rejected.type, error: { message: "DB error" }, meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
      });
    });

    describe("savePotPfs", () => {
      it("should handle savePotPfs.pending", () => {
        const state = reducer(initialState, {
          type: savePotPfs.pending.type,
        });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("savePotPfs.pending clears a previous error", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "failed", error: "old error" },
          { type: savePotPfs.pending.type },
        );

        expect(state.saveStatus).toBe("saving");
        expect(state.error).toBe("");
      });

      it("should handle savePotPfs.fulfilled", () => {
        const state = reducer(initialState, {
          type: savePotPfs.fulfilled.type,
          payload: mockPotPfs,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
        expect(state.potPfs).toEqual(mockPotPfs);
      });

      it("savePotPfs.fulfilled does not change tmntId or requestedTmntId", () => {
        const updatedPotPfs = cloneDeep(mockPotPfs);
        updatedPotPfs[0].amount = 450;

        const state = reducer(loadedState, {
          type: savePotPfs.fulfilled.type,
          payload: updatedPotPfs,
        });

        expect(state.tmntId).toBe(tmntId);
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.loadStatus).toBe("succeeded");
        expect(state.potPfs).toEqual(updatedPotPfs);
      });

      it("should handle savePotPfs.rejected", () => {
        const errorMessage = "Save failed";

        const state = reducer(initialState, {
          type: savePotPfs.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.potPfs).toEqual([]);
      });

      it("savePotPfs.rejected keeps the loaded potPfs and tmntId", () => {
        const state = reducer(loadedState, {
          type: savePotPfs.rejected.type,
          error: { message: "Save failed" },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.tmntId).toBe(tmntId);
        expect(state.potPfs).toEqual(mockPotPfs);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      potPfs: {
        potPfs: mockPotPfs,
        requestedTmntId: otherTmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectPotPfs returns the potPfs array", () => {
      expect(selectPotPfs(selectorState)).toBe(mockPotPfs);
    });

    it("getPotPfsRequestedTmntId returns the requested tournament id", () => {
      expect(getPotPfsRequestedTmntId(selectorState)).toBe(otherTmntId);
    });

    it("getPotPfsTmntId returns the loaded tournament id", () => {
      expect(getPotPfsTmntId(selectorState)).toBe(tmntId);
    });

    it("getPotPfsLoadStatus returns the load status", () => {
      expect(getPotPfsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getPotPfsSaveStatus returns the save status", () => {
      expect(getPotPfsSaveStatus(selectorState)).toBe("failed");
    });

    it("getPotPfsError returns the error", () => {
      expect(getPotPfsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchPotPfs", () => {
    it("dispatches fulfilled when getAllPotPfsForTmnt resolves", async () => {
      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce(mockPotPfs);
      const store = makeStore();

      const action = await store.dispatch(fetchPotPfs(tmntId) as any);

      expect(fetchPotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(mockedGetAllPotPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetAllPotPfsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("dispatches rejected when getAllPotPfsForTmnt rejects", async () => {
      mockedGetAllPotPfsForTmnt.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchPotPfs(tmntId) as any);

      expect(fetchPotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllPotPfsForTmnt resolves an empty array", async () => {
      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchPotPfs(tmntId) as any);

      expect(fetchPotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.potPfs).toEqual([]);
    });

    it("loading a second tournament updates tmntId", async () => {
      mockedGetAllPotPfsForTmnt
        .mockResolvedValueOnce(mockPotPfs)
        .mockResolvedValueOnce([]);
      const store = makeStore();

      await store.dispatch(fetchPotPfs(tmntId) as any);
      await store.dispatch(fetchPotPfs(otherTmntId) as any);

      const state = store.getState().potPfs;

      expect(mockedGetAllPotPfsForTmnt).toHaveBeenNthCalledWith(1, tmntId);
      expect(mockedGetAllPotPfsForTmnt).toHaveBeenNthCalledWith(2, otherTmntId);
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.potPfs).toEqual([]);
    });

    it("a failed second load keeps the first tournament's tmntId and potPfs", async () => {
      mockedGetAllPotPfsForTmnt
        .mockResolvedValueOnce(mockPotPfs)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchPotPfs(tmntId) as any);
      await store.dispatch(fetchPotPfs(otherTmntId) as any);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: typeof mockPotPfs) => void;
      const firstResponse = new Promise<typeof mockPotPfs>((resolve) => {
        resolveFirst = resolve;
      });
      const secondPotPfs = cloneDeep(mockPotPfs);
      secondPotPfs[0].amount = 999;

      mockedGetAllPotPfsForTmnt
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(secondPotPfs);
      const store = makeStore();

      // start tmntId, then otherTmntId; otherTmntId finishes first
      const firstDispatch = store.dispatch(fetchPotPfs(tmntId) as any);
      await store.dispatch(fetchPotPfs(otherTmntId) as any);

      // now the older tmntId response arrives late
      resolveFirst(mockPotPfs);
      await firstDispatch;

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.potPfs).toEqual(secondPotPfs);
    });
  });

  describe("Thunk tests savePotPfs", () => {
    const validPotIds = mockPotPfs.map((pf) => pf.pot_id);
    const toSave: tmntPotPfSaveDataType = {
      potPfData: mockPotPfs,
      potIds: validPotIds,
      tmntId: tmntId,
    };

    it("dispatches fulfilled when updateAllPotPfsForTmnt resolves", async () => {
      const updatedPotPfs = cloneDeep(mockPotPfs);
      updatedPotPfs[0].amount = 450;

      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(updatedPotPfs);
      const store = makeStore();

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(mockedUpdateAllPotPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedUpdateAllPotPfsForTmnt).toHaveBeenCalledWith(toSave);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(updatedPotPfs);
    });

    it("save after load keeps tmntId and replaces potPfs", async () => {
      const updatedPotPfs = cloneDeep(mockPotPfs);
      updatedPotPfs[0].amount = 450;

      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce(mockPotPfs);
      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(updatedPotPfs);
      const store = makeStore();

      await store.dispatch(fetchPotPfs(tmntId) as any);
      await store.dispatch(savePotPfs(toSave) as any);

      const state = store.getState().potPfs;

      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.potPfs).toEqual(updatedPotPfs);
    });

    it("dispatches rejected when updateAllPotPfsForTmnt resolves undefined", async () => {
      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(undefined as any);
      const store = makeStore();

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating potPfs");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllPotPfsForTmnt rejects", async () => {
      mockedUpdateAllPotPfsForTmnt.mockRejectedValueOnce(new Error("Save failed"));
      const store = makeStore();

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.potPfs).toEqual([]);
    });
  });
});
