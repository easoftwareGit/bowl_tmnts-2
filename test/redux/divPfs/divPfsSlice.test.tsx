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
  getPotPfsIoError,
} from "@/redux/features/potPfs/potPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllPotPfsForTmnt,
  updateAllPotPfsForTmnt,
} from "@/lib/db/potPfs/dbPotPfs";
import { tmntId, mockPotPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";
import { tmntPotPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/potPfs/dbPotPfs");

const mockedGetAllPotPfsForTmnt = jest.mocked(getAllPotPfsForTmnt);
const mockedUpdateAllPotPfsForTmnt = jest.mocked(updateAllPotPfsForTmnt);

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
    ioError: ioDataError.NONE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchPotPfs.pending", () => {
      const state = reducer(initialState, {
        type: fetchPotPfs.pending.type,
        meta: {
          arg: tmntId,
        },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual([]);
    });

    it("should clear a previous error on fetchPotPfs.pending", () => {
      const errorState: potPfsState = {
        ...initialState,
        loadStatus: "failed",
        error: "previous error",
      };

      const state = reducer(errorState, {
        type: fetchPotPfs.pending.type,
        meta: {
          arg: tmntId,
        },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.error).toBe("");
    });

    it("should handle fetchPotPfs.fulfilled", () => {
      const loadingState: potPfsState = {
        ...initialState,
        requestedTmntId: tmntId,
        loadStatus: "loading",
      };

      const state = reducer(loadingState, {
        type: fetchPotPfs.fulfilled.type,
        payload: mockPotPfs,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("should replace existing potPfs on fetchPotPfs.fulfilled", () => {
      const loadedState: potPfsState = {
        ...initialState,
        potPfs: mockPotPfs,
        requestedTmntId: tmntId,
        tmntId: tmntId,
        loadStatus: "loading",
      };

      const state = reducer(loadedState, {
        type: fetchPotPfs.fulfilled.type,
        payload: [],
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.potPfs).toEqual([]);
    });

    it("should handle fetchPotPfs.rejected", () => {
      const errorMessage = "DB error";

      const loadingState: potPfsState = {
        ...initialState,
        requestedTmntId: tmntId,
        loadStatus: "loading",
      };

      const state = reducer(loadingState, {
        type: fetchPotPfs.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe(errorMessage);
      expect(state.potPfs).toEqual([]);
    });

    it("should handle savePotPfs.pending", () => {
      const state = reducer(initialState, {
        type: savePotPfs.pending.type,
      });

      expect(state.saveStatus).toBe("saving");
      expect(state.loadStatus).toBe("idle");
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

    it("should not change tmntId or requestedTmntId on savePotPfs.fulfilled", () => {
      const loadedState: potPfsState = {
        ...initialState,
        potPfs: mockPotPfs,
        requestedTmntId: tmntId,
        tmntId: tmntId,
        loadStatus: "succeeded",
      };

      const state = reducer(loadedState, {
        type: savePotPfs.fulfilled.type,
        payload: [],
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.potPfs).toEqual([]);
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

    it("should keep existing potPfs on savePotPfs.rejected", () => {
      const loadedState: potPfsState = {
        ...initialState,
        potPfs: mockPotPfs,
        saveStatus: "saving",
      };

      const state = reducer(loadedState, {
        type: savePotPfs.rejected.type,
        error: { message: "Save failed" },
      });

      expect(state.saveStatus).toBe("failed");
      expect(state.potPfs).toEqual(mockPotPfs);
    });
  });

  describe("selectors", () => {
    const selectorState = {
      potPfs: {
        potPfs: mockPotPfs,
        requestedTmntId: tmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "succeeded" as ioStatusType,
        error: "test error",
        ioError: ioDataError.NONE,
      },
    } as RootState;

    it("selectPotPfs returns the potPfs array", () => {
      expect(selectPotPfs(selectorState)).toBe(mockPotPfs);
    });

    it("getPotPfsRequestedTmntId returns the requested tournament id", () => {
      expect(getPotPfsRequestedTmntId(selectorState)).toBe(tmntId);
    });

    it("getPotPfsTmntId returns the loaded tournament id", () => {
      expect(getPotPfsTmntId(selectorState)).toBe(tmntId);
    });

    it("getPotPfsLoadStatus returns the load status", () => {
      expect(getPotPfsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getPotPfsSaveStatus returns the save status", () => {
      expect(getPotPfsSaveStatus(selectorState)).toBe("succeeded");
    });

    it("getPotPfsError returns the error", () => {
      expect(getPotPfsError(selectorState)).toBe("test error");
    });

    it("getPotPfsIoError returns the io error", () => {
      expect(getPotPfsIoError(selectorState)).toBe(ioDataError.NONE);
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

    it("clears a previous fetch error after a successful retry", async () => {
      mockedGetAllPotPfsForTmnt
        .mockRejectedValueOnce(new Error("DB failed"))
        .mockResolvedValueOnce(mockPotPfs);

      const store = makeStore();

      await store.dispatch(fetchPotPfs(tmntId) as any);
      expect(store.getState().potPfs.error).toBe("DB failed");

      await store.dispatch(fetchPotPfs(tmntId) as any);

      const state = store.getState().potPfs;

      expect(mockedGetAllPotPfsForTmnt).toHaveBeenCalledTimes(2);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.tmntId).toBe(tmntId);
      expect(state.potPfs).toEqual(mockPotPfs);
    });
  });

  describe("Thunk tests savePotPfs", () => {
    const validPotIds = [mockPotPfs[0].pot_id];
    const toSave: tmntPotPfSaveDataType = {
      potPfData: mockPotPfs,
      potIds: validPotIds,
      tmntId: tmntId,
    };

    it("dispatches fulfilled when updateAllPotPfsForTmnt resolves", async () => {
      // returned data differs from what was sent, so we know state uses the
      // payload from the db call
      const updatedPotPfs = cloneDeep(mockPotPfs).slice(0, 1);

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

    it("dispatches fulfilled when updateAllPotPfsForTmnt resolves an empty array", async () => {
      // an empty array is truthy, so it should NOT trigger the error branch
      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce([]);

      const store = makeStore();

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.saveStatus).toBe("succeeded");
      expect(state.potPfs).toEqual([]);
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

    it("dispatches rejected when updateAllPotPfsForTmnt resolves null", async () => {
      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(null as any);

      const store = makeStore();

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating potPfs");
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

    it("keeps previously loaded potPfs when the save fails", async () => {
      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce(mockPotPfs);
      mockedUpdateAllPotPfsForTmnt.mockRejectedValueOnce(new Error("Save failed"));

      const store = makeStore();

      await store.dispatch(fetchPotPfs(tmntId) as any);
      await store.dispatch(savePotPfs(toSave) as any);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("failed");
      expect(state.tmntId).toBe(tmntId);
      expect(state.error).toBe("Save failed");
      expect(state.potPfs).toEqual(mockPotPfs);
    });
  });
});
