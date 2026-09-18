import reducer, {
  elimPfsState,
  fetchElimPfs,
  saveElimPfs,
  selectElimPfs,
  getElimRequestedId,
  getElimPfsLoadStatus,
  getElimPfsSaveStatus,
  getElimPfsError,
  getElimPfsIoError,
} from "@/redux/features/elimPfs/elimPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
} from "@/lib/db/elimPfs/dbElimPfs";
import { tmntId, mockElimPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";
import { tmntElimPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/elimPfs/dbElimPfs");

const mockedGetAllElimPfsForTmnt = jest.mocked(getAllElimPfsForTmnt);
const mockedUpdateAllElimPfsForTmnt = jest.mocked(updateAllElimPfsForTmnt);

describe("elimPfsSlice reducer + thunk", () => {
  const initialState: elimPfsState = {
    elimPfs: [],
    requestedTmntId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
    ioError: ioDataError.NONE,
  };

  // const testElimId = "elm_00000000000000000000000000000001"

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchElimPfs.pending", () => {

      const state = reducer(initialState, {
        type: fetchElimPfs.pending.type,
        meta: {
          arg: tmntId,
        },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual([]);
    });

    it("should handle fetchElimPfs.fulfilled", () => {

      const state = reducer(initialState, {
        type: fetchElimPfs.fulfilled.type,
        payload: mockElimPfs,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(mockElimPfs);
    });

    it("should handle fetchElimPfs.rejected", () => {
      const errorMessage = "DB error";

      const state = reducer(initialState, {
        type: fetchElimPfs.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe(errorMessage);
      expect(state.elimPfs).toEqual([]);
    });

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
  });

  describe("selectors", () => {
    const selectorState = {
      elimPfs: {
        elimPfs: mockElimPfs,
        requestedTmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "succeeded" as ioStatusType,
        error: "test error",
        ioError: ioDataError.NONE,
      },
    } as RootState;

    it("selectElimPfs returns the elimPfs array", () => {
      expect(selectElimPfs(selectorState)).toBe(mockElimPfs);
    });

    it("getElimRequestedId returns the requested tournament id", () => {
      expect(getElimRequestedId(selectorState)).toBe(tmntId);
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

    it("getElimPfsIoError returns the io error", () => {
      expect(getElimPfsIoError(selectorState)).toBe(ioDataError.NONE);
    });
  });

  describe("Thunk tests fetchElimPfs", () => {    

    it("dispatches fulfilled when getAllElimPfsForTmnt resolves", async () => {      
     
      mockedGetAllElimPfsForTmnt.mockResolvedValueOnce(mockElimPfs);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(fetchElimPfs(tmntId) as any);

      const state = store.getState().elimPfs;

      expect(mockedGetAllElimPfsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(mockElimPfs);
    });

    it("dispatches rejected when getAllElimPfsForTmnt rejects", async () => {
      mockedGetAllElimPfsForTmnt.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(fetchElimPfs(tmntId) as any);

      const state = store.getState().elimPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllElimPfsForTmnt resolves an empty array", async () => {
      mockedGetAllElimPfsForTmnt.mockResolvedValueOnce([]);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(fetchElimPfs(tmntId) as any);

      expect(fetchElimPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.requestedTmntId).toBe(tmntId);      
      expect(state.loadStatus).toBe("succeeded");
      expect(state.elimPfs).toEqual([]);
    });
  });

  describe("Thunk tests saveElimPfs", () => {

    const validDivIds = [mockElimPfs[0].elim_id, mockElimPfs[2].elim_id]; // yes, 0 and 2
    const toSave: tmntElimPfSaveDataType = {
      elimPfData: mockElimPfs,
      elimIds: validDivIds,
      tmntId: tmntId
    }  

    it("dispatches fulfilled when updateAllElimPfsForTmnt resolves", async () => {

      const updatedElimPfs = cloneDeep(mockElimPfs);
      updatedElimPfs[0].amount = 450;

      mockedUpdateAllElimPfsForTmnt.mockResolvedValueOnce(updatedElimPfs);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(saveElimPfs(toSave) as any);

      const state = store.getState().elimPfs;

      expect(mockedUpdateAllElimPfsForTmnt).toHaveBeenCalledWith(
        toSave,
      );
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(updatedElimPfs);
    });

    it("dispatches rejected when updateAllElimPfsForTmnt resolves undefined", async () => {
      
      mockedUpdateAllElimPfsForTmnt.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

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

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(saveElimPfs(toSave) as any);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.elimPfs).toEqual([]);
    });

  });
});
