import reducer, {
  elimPfsState,
  fetchElimPfs,
  saveElimPfs,
  selectElimPfs,
  getElimPfsRequestedTmntId,
  getElimPfsTmntId,
  getElimPfsLoadStatus,
  getElimPfsSaveStatus,
  getElimPfsError,  
} from "@/redux/features/elimPfs/elimPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
} from "@/lib/db/elimPfs/dbElimPfs";
import { tmntId, mockElimPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { tmntElimPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/elimPfs/dbElimPfs");

const mockedGetAllElimPfsForTmnt = jest.mocked(getAllElimPfsForTmnt);
const mockedUpdateAllElimPfsForTmnt = jest.mocked(updateAllElimPfsForTmnt);

// db functions are mocked, so this id only needs to differ from tmntId
const otherTmntId = "tmt_00000000000000000000000000000099";

const makeStore = () =>
  configureStore({
    reducer: {
      elimPfs: reducer,
    },
  });

describe("elimPfsSlice reducer + thunk", () => {
  const initialState: elimPfsState = {
    elimPfs: [],
    requestedTmntId: "",
    tmntId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",    
  };

  // state after a successful load of tmntId
  const loadedState: elimPfsState = {
    ...initialState,
    elimPfs: mockElimPfs,
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

    describe("fetchElimPfs", () => {
      it("should handle fetchElimPfs.pending", () => {
        const state = reducer(initialState, {
          type: fetchElimPfs.pending.type,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe("");
        expect(state.elimPfs).toEqual([]);
      });

      it("fetchElimPfs.pending does not change tmntId or elimPfs from a previous load", () => {
        const state = reducer(loadedState, {
          type: fetchElimPfs.pending.type,
          meta: { arg: otherTmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.elimPfs).toEqual(mockElimPfs);
      });

      it("fetchElimPfs.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, loadStatus: "failed", error: "old error" },
          { type: fetchElimPfs.pending.type, meta: { arg: tmntId } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchElimPfs.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchElimPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchElimPfs.fulfilled.type,
          payload: mockElimPfs,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("succeeded");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.error).toBe("");
        expect(state.elimPfs).toEqual(mockElimPfs);
      });

      it("fetchElimPfs.fulfilled copies requestedTmntId into tmntId", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchElimPfs.fulfilled.type,
            payload: [],
            meta: { arg: otherTmntId },
          },
        );

        expect(state.tmntId).toBe(otherTmntId);
        expect(state.elimPfs).toEqual([]);
      });

      it("should handle fetchElimPfs.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchElimPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchElimPfs.rejected.type,
          error: { message: errorMessage },
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe(errorMessage);
        expect(state.elimPfs).toEqual([]);
      });

      it("fetchElimPfs.rejected keeps tmntId and elimPfs from a previous load", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchElimPfs.rejected.type,
            error: { message: "DB error" },
            meta: { arg: otherTmntId },
          },
        );

        expect(state.loadStatus).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.elimPfs).toEqual(mockElimPfs);
      });

      it("ignores a stale fetchElimPfs.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchElimPfs.fulfilled.type, payload: [], meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.tmntId).toBe(tmntId);
        expect(state.elimPfs).toEqual(mockElimPfs);
      });

      it("ignores a stale fetchElimPfs.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchElimPfs.rejected.type, error: { message: "DB error" }, meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
      });

    });

    describe("saveElimPfs", () => {
      it("should handle saveElimPfs.pending", () => {
        const state = reducer(initialState, {
          type: saveElimPfs.pending.type,
        });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("should handle saveElimPfs.fulfilled", () => {
        const state = reducer(initialState, {
          type: saveElimPfs.fulfilled.type,
          payload: mockElimPfs,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
        expect(state.elimPfs).toEqual(mockElimPfs);
      });

      it("saveElimPfs.fulfilled does not change tmntId or requestedTmntId", () => {
        const updatedElimPfs = cloneDeep(mockElimPfs);
        updatedElimPfs[0].amount = 450;

        const state = reducer(loadedState, {
          type: saveElimPfs.fulfilled.type,
          payload: updatedElimPfs,
        });

        expect(state.tmntId).toBe(tmntId);
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.loadStatus).toBe("succeeded");
        expect(state.elimPfs).toEqual(updatedElimPfs);
      });

      it("should handle saveElimPfs.rejected", () => {
        const errorMessage = "Save failed";

        const state = reducer(initialState, {
          type: saveElimPfs.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.elimPfs).toEqual([]);
      });

      it("saveElimPfs.rejected keeps the loaded elimPfs and tmntId", () => {
        const state = reducer(loadedState, {
          type: saveElimPfs.rejected.type,
          error: { message: "Save failed" },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.tmntId).toBe(tmntId);
        expect(state.elimPfs).toEqual(mockElimPfs);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      elimPfs: {
        elimPfs: mockElimPfs,
        requestedTmntId: otherTmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "succeeded" as ioStatusType,
        error: "test error",        
      },
    } as RootState;

    it("selectElimPfs returns the elimPfs array", () => {
      expect(selectElimPfs(selectorState)).toBe(mockElimPfs);
    });

    it("getElimRequestedId returns the requested tournament id", () => {
      expect(getElimPfsRequestedTmntId(selectorState)).toBe(otherTmntId);
    });

    it("getElimPfsTmntId returns the loaded tournament id", () => {
      expect(getElimPfsTmntId(selectorState)).toBe(tmntId);
    });

    it("getElimPfsLoadStatus returns the load status", () => {
      expect(getElimPfsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getElimPfsSaveStatus returns the save status", () => {
      expect(getElimPfsSaveStatus(selectorState)).toBe("succeeded");
    });

    it("getElimPfsError returns the error", () => {
      expect(getElimPfsError(selectorState)).toBe("test error");
    });

  });

  describe("Thunk tests fetchElimPfs", () => {
    it("dispatches fulfilled when getAllElimPfsForTmnt resolves", async () => {
      mockedGetAllElimPfsForTmnt.mockResolvedValueOnce(mockElimPfs);
      const store = makeStore();

      const action = await store.dispatch(fetchElimPfs(tmntId) as any);

      expect(fetchElimPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(mockedGetAllElimPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetAllElimPfsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(mockElimPfs);
    });

    it("dispatches rejected when getAllElimPfsForTmnt rejects", async () => {
      mockedGetAllElimPfsForTmnt.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchElimPfs(tmntId) as any);

      expect(fetchElimPfs.rejected.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllElimPfsForTmnt resolves an empty array", async () => {
      mockedGetAllElimPfsForTmnt.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchElimPfs(tmntId) as any);

      expect(fetchElimPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.elimPfs).toEqual([]);
    });

    it("loading a second tournament updates tmntId", async () => {
      mockedGetAllElimPfsForTmnt
        .mockResolvedValueOnce(mockElimPfs)
        .mockResolvedValueOnce([]);
      const store = makeStore();

      await store.dispatch(fetchElimPfs(tmntId) as any);
      await store.dispatch(fetchElimPfs(otherTmntId) as any);

      const state = store.getState().elimPfs;

      expect(mockedGetAllElimPfsForTmnt).toHaveBeenNthCalledWith(1, tmntId);
      expect(mockedGetAllElimPfsForTmnt).toHaveBeenNthCalledWith(2, otherTmntId);
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.elimPfs).toEqual([]);
    });

    it("a failed second load keeps the first tournament's tmntId and elimPfs", async () => {
      mockedGetAllElimPfsForTmnt
        .mockResolvedValueOnce(mockElimPfs)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchElimPfs(tmntId) as any);
      await store.dispatch(fetchElimPfs(otherTmntId) as any);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.elimPfs).toEqual(mockElimPfs);
    });
  });

  describe("Thunk tests saveElimPfs", () => {
    const validElimIds = [mockElimPfs[0].elim_id, mockElimPfs[2].elim_id]; // yes, 0 and 2
    const toSave: tmntElimPfSaveDataType = {
      elimPfData: mockElimPfs,
      elimIds: validElimIds,
      tmntId: tmntId,
    };

    it("dispatches fulfilled when updateAllElimPfsForTmnt resolves", async () => {
      const updatedElimPfs = cloneDeep(mockElimPfs);
      updatedElimPfs[0].amount = 450;

      mockedUpdateAllElimPfsForTmnt.mockResolvedValueOnce(updatedElimPfs);
      const store = makeStore();

      const action = await store.dispatch(saveElimPfs(toSave) as any);

      expect(saveElimPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(mockedUpdateAllElimPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedUpdateAllElimPfsForTmnt).toHaveBeenCalledWith(toSave);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(updatedElimPfs);
    });

    it("save after load keeps tmntId and replaces elimPfs", async () => {
      const updatedElimPfs = cloneDeep(mockElimPfs);
      updatedElimPfs[0].amount = 450;

      mockedGetAllElimPfsForTmnt.mockResolvedValueOnce(mockElimPfs);
      mockedUpdateAllElimPfsForTmnt.mockResolvedValueOnce(updatedElimPfs);
      const store = makeStore();

      await store.dispatch(fetchElimPfs(tmntId) as any);
      await store.dispatch(saveElimPfs(toSave) as any);

      const state = store.getState().elimPfs;

      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.elimPfs).toEqual(updatedElimPfs);
    });

    it("dispatches rejected when updateAllElimPfsForTmnt resolves undefined", async () => {
      mockedUpdateAllElimPfsForTmnt.mockResolvedValueOnce(undefined as any);
      const store = makeStore();

      const action = await store.dispatch(saveElimPfs(toSave) as any);

      expect(saveElimPfs.rejected.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating elimPfs");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllElimPfsForTmnt rejects", async () => {
      mockedUpdateAllElimPfsForTmnt.mockRejectedValueOnce(new Error("Save failed"));
      const store = makeStore();

      const action = await store.dispatch(saveElimPfs(toSave) as any);

      expect(saveElimPfs.rejected.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.elimPfs).toEqual([]);
    });
  });
});
