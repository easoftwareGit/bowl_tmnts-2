import reducer, {
  divPfsState,
  fetchDivPfs,
  saveDivPfs,
  selectDivPfs,
  getDivPfsRequestedTmntId,
  getDivPfsTmntId,
  getDivPfsLoadStatus,
  getDivPfsSaveStatus,
  getDivPfsError,
} from "@/redux/features/divPfs/divPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllDivPfsForTmnt,
  updateAllDivPfsForTmnt,
} from "@/lib/db/divPfs/dbDivPfs";
import { tmntId, mockDivPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { tmntDivPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/divPfs/dbDivPfs");

const mockedGetAllDivPfsForTmnt = jest.mocked(getAllDivPfsForTmnt);
const mockedUpdateAllDivPfsForTmnt = jest.mocked(updateAllDivPfsForTmnt);

// db functions are mocked, so this id only needs to differ from tmntId
const otherTmntId = "tmt_00000000000000000000000000000099";

const makeStore = () =>
  configureStore({
    reducer: {
      divPfs: reducer,
    },
  });

describe("divPfsSlice reducer + thunk", () => {
  const initialState: divPfsState = {
    divPfs: [],
    requestedTmntId: "",
    tmntId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load of tmntId
  const loadedState: divPfsState = {
    ...initialState,
    divPfs: mockDivPfs,
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

    describe("fetchDivPfs", () => {
      it("should handle fetchDivPfs.pending", () => {
        const state = reducer(initialState, {
          type: fetchDivPfs.pending.type,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe("");
        expect(state.divPfs).toEqual([]);
      });

      it("fetchDivPfs.pending does not change tmntId or divPfs from a previous load", () => {
        const state = reducer(loadedState, {
          type: fetchDivPfs.pending.type,
          meta: { arg: otherTmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.divPfs).toEqual(mockDivPfs);
      });

      it("fetchDivPfs.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, loadStatus: "failed", error: "old error" },
          { type: fetchDivPfs.pending.type, meta: { arg: tmntId } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchDivPfs.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchDivPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchDivPfs.fulfilled.type,
          payload: mockDivPfs,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("succeeded");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.error).toBe("");
        expect(state.divPfs).toEqual(mockDivPfs);
      });

      it("fetchDivPfs.fulfilled sets tmntId for the current request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchDivPfs.fulfilled.type,
            payload: [],
            meta: { arg: otherTmntId },
          },
        );

        expect(state.tmntId).toBe(otherTmntId);
        expect(state.divPfs).toEqual([]);
      });

      it("should handle fetchDivPfs.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchDivPfs.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchDivPfs.rejected.type,
          error: { message: errorMessage },
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntId).toBe("");
        expect(state.error).toBe(errorMessage);
        expect(state.divPfs).toEqual([]);
      });

      it("fetchDivPfs.rejected keeps tmntId and divPfs from a previous load", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchDivPfs.rejected.type,
            error: { message: "DB error" },
            meta: { arg: otherTmntId },
          },
        );

        expect(state.loadStatus).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntId).toBe(tmntId);
        expect(state.divPfs).toEqual(mockDivPfs);
      });

      it("ignores a stale fetchDivPfs.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchDivPfs.fulfilled.type, payload: [], meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.tmntId).toBe(tmntId);
        expect(state.divPfs).toEqual(mockDivPfs);
      });

      it("ignores a stale fetchDivPfs.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          { type: fetchDivPfs.rejected.type, error: { message: "DB error" }, meta: { arg: tmntId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
      });
    });

    describe("saveDivPfs", () => {
      it("should handle saveDivPfs.pending", () => {
        const state = reducer(initialState, {
          type: saveDivPfs.pending.type,
        });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("saveDivPfs.pending clears a previous error", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "failed", error: "old error" },
          { type: saveDivPfs.pending.type },
        );

        expect(state.saveStatus).toBe("saving");
        expect(state.error).toBe("");
      });

      it("should handle saveDivPfs.fulfilled", () => {
        const state = reducer(initialState, {
          type: saveDivPfs.fulfilled.type,
          payload: mockDivPfs,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
        expect(state.divPfs).toEqual(mockDivPfs);
      });

      it("saveDivPfs.fulfilled does not change tmntId or requestedTmntId", () => {
        const updatedDivPfs = cloneDeep(mockDivPfs);
        updatedDivPfs[0].amount = 450;

        const state = reducer(loadedState, {
          type: saveDivPfs.fulfilled.type,
          payload: updatedDivPfs,
        });

        expect(state.tmntId).toBe(tmntId);
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.loadStatus).toBe("succeeded");
        expect(state.divPfs).toEqual(updatedDivPfs);
      });

      it("should handle saveDivPfs.rejected", () => {
        const errorMessage = "Save failed";

        const state = reducer(initialState, {
          type: saveDivPfs.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.divPfs).toEqual([]);
      });

      it("saveDivPfs.rejected keeps the loaded divPfs and tmntId", () => {
        const state = reducer(loadedState, {
          type: saveDivPfs.rejected.type,
          error: { message: "Save failed" },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.tmntId).toBe(tmntId);
        expect(state.divPfs).toEqual(mockDivPfs);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      divPfs: {
        divPfs: mockDivPfs,
        requestedTmntId: otherTmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectDivPfs returns the divPfs array", () => {
      expect(selectDivPfs(selectorState)).toBe(mockDivPfs);
    });

    it("getDivPfsRequestedTmntId returns the requested tournament id", () => {
      expect(getDivPfsRequestedTmntId(selectorState)).toBe(otherTmntId);
    });

    it("getDivPfsTmntId returns the loaded tournament id", () => {
      expect(getDivPfsTmntId(selectorState)).toBe(tmntId);
    });

    it("getDivPfsLoadStatus returns the load status", () => {
      expect(getDivPfsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getDivPfsSaveStatus returns the save status", () => {
      expect(getDivPfsSaveStatus(selectorState)).toBe("failed");
    });

    it("getDivPfsError returns the error", () => {
      expect(getDivPfsError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchDivPfs", () => {
    it("dispatches fulfilled when getAllDivPfsForTmnt resolves", async () => {
      mockedGetAllDivPfsForTmnt.mockResolvedValueOnce(mockDivPfs);
      const store = makeStore();

      const action = await store.dispatch(fetchDivPfs(tmntId) as any);

      expect(fetchDivPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(mockedGetAllDivPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetAllDivPfsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(mockDivPfs);
    });

    it("dispatches rejected when getAllDivPfsForTmnt rejects", async () => {
      mockedGetAllDivPfsForTmnt.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchDivPfs(tmntId) as any);

      expect(fetchDivPfs.rejected.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.divPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllDivPfsForTmnt resolves an empty array", async () => {
      mockedGetAllDivPfsForTmnt.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchDivPfs(tmntId) as any);

      expect(fetchDivPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.divPfs).toEqual([]);
    });

    it("loading a second tournament updates tmntId", async () => {
      mockedGetAllDivPfsForTmnt
        .mockResolvedValueOnce(mockDivPfs)
        .mockResolvedValueOnce([]);
      const store = makeStore();

      await store.dispatch(fetchDivPfs(tmntId) as any);
      await store.dispatch(fetchDivPfs(otherTmntId) as any);

      const state = store.getState().divPfs;

      expect(mockedGetAllDivPfsForTmnt).toHaveBeenNthCalledWith(1, tmntId);
      expect(mockedGetAllDivPfsForTmnt).toHaveBeenNthCalledWith(2, otherTmntId);
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.divPfs).toEqual([]);
    });

    it("a failed second load keeps the first tournament's tmntId and divPfs", async () => {
      mockedGetAllDivPfsForTmnt
        .mockResolvedValueOnce(mockDivPfs)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchDivPfs(tmntId) as any);
      await store.dispatch(fetchDivPfs(otherTmntId) as any);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.divPfs).toEqual(mockDivPfs);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: typeof mockDivPfs) => void;
      const firstResponse = new Promise<typeof mockDivPfs>((resolve) => {
        resolveFirst = resolve;
      });
      const secondDivPfs = cloneDeep(mockDivPfs);
      secondDivPfs[0].amount = 999;

      mockedGetAllDivPfsForTmnt
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(secondDivPfs);
      const store = makeStore();

      // start tmntId, then otherTmntId; otherTmntId finishes first
      const firstDispatch = store.dispatch(fetchDivPfs(tmntId) as any);
      await store.dispatch(fetchDivPfs(otherTmntId) as any);

      // now the older tmntId response arrives late
      resolveFirst(mockDivPfs);
      await firstDispatch;

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntId).toBe(otherTmntId);
      expect(state.divPfs).toEqual(secondDivPfs);
    });
  });

  describe("Thunk tests saveDivPfs", () => {
    const validDivIds = mockDivPfs.map((pf) => pf.div_id);
    const toSave: tmntDivPfSaveDataType = {
      divPfData: mockDivPfs,
      divIds: validDivIds,
      tmntId: tmntId,
    };

    it("dispatches fulfilled when updateAllDivPfsForTmnt resolves", async () => {
      const updatedDivPfs = cloneDeep(mockDivPfs);
      updatedDivPfs[0].amount = 450;

      mockedUpdateAllDivPfsForTmnt.mockResolvedValueOnce(updatedDivPfs);
      const store = makeStore();

      const action = await store.dispatch(saveDivPfs(toSave) as any);

      expect(saveDivPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(mockedUpdateAllDivPfsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedUpdateAllDivPfsForTmnt).toHaveBeenCalledWith(toSave);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(updatedDivPfs);
    });

    it("save after load keeps tmntId and replaces divPfs", async () => {
      const updatedDivPfs = cloneDeep(mockDivPfs);
      updatedDivPfs[0].amount = 450;

      mockedGetAllDivPfsForTmnt.mockResolvedValueOnce(mockDivPfs);
      mockedUpdateAllDivPfsForTmnt.mockResolvedValueOnce(updatedDivPfs);
      const store = makeStore();

      await store.dispatch(fetchDivPfs(tmntId) as any);
      await store.dispatch(saveDivPfs(toSave) as any);

      const state = store.getState().divPfs;

      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.divPfs).toEqual(updatedDivPfs);
    });

    it("dispatches rejected when updateAllDivPfsForTmnt resolves undefined", async () => {
      mockedUpdateAllDivPfsForTmnt.mockResolvedValueOnce(undefined as any);
      const store = makeStore();

      const action = await store.dispatch(saveDivPfs(toSave) as any);

      expect(saveDivPfs.rejected.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating divPfs");
      expect(state.divPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllDivPfsForTmnt rejects", async () => {
      mockedUpdateAllDivPfsForTmnt.mockRejectedValueOnce(new Error("Save failed"));
      const store = makeStore();

      const action = await store.dispatch(saveDivPfs(toSave) as any);

      expect(saveDivPfs.rejected.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.divPfs).toEqual([]);
    });
  });
});