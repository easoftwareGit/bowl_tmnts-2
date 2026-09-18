import reducer, {
  divPfsState,
  fetchDivPfs,
  saveDivPfs,
  selectDivPfs,
  getDivPfRequestedTmntId,
  getDivPfsTmntId,
  getDivPfsLoadStatus,
  getDivPfsSaveStatus,
  getDivPfsError,
  getDivPfsIoError,
} from "@/redux/features/divPfs/divPfsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllDivPfsForTmnt,
  updateAllDivPfsForTmnt,
} from "@/lib/db/divPfs/dbDivPfs";
import { tmntId, mockDivPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";
import { tmntDivPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/divPfs/dbDivPfs");

const mockedGetAllDivPfsForTmnt = jest.mocked(getAllDivPfsForTmnt);
const mockedUpdateAllDivPfsForTmnt = jest.mocked(updateAllDivPfsForTmnt);

describe("divPfsSlice reducer + thunk", () => {
  const initialState: divPfsState = {
    divPfs: [],
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

    it("should handle fetchDivPfs.pending", () => {

      const state = reducer(initialState, {
        type: fetchDivPfs.pending.type,
        meta: {
          arg: tmntId,
        },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual([]);
    });

    it("should handle fetchDivPfs.fulfilled", () => { 
      const loadingState: divPfsState = {
        ...initialState,
        requestedTmntId: tmntId,
        loadStatus: "loading",
      };

      const state = reducer(loadingState, {
        type: fetchDivPfs.fulfilled.type,
        payload: mockDivPfs,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe(tmntId);
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(mockDivPfs);
    });

    it("should handle fetchDivPfs.rejected", () => {
      const errorMessage = "DB error";

      const loadingState: divPfsState = {
        ...initialState,
        requestedTmntId: tmntId,
        loadStatus: "loading",
      };

      const state = reducer(loadingState, {
        type: fetchDivPfs.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.tmntId).toBe("");
      expect(state.error).toBe(errorMessage);
      expect(state.divPfs).toEqual([]);
    });

    it("should handle saveDivPfs.pending", () => {
      const state = reducer(initialState, {
        type: saveDivPfs.pending.type,
      });

      expect(state.saveStatus).toBe("saving");
      expect(state.loadStatus).toBe("idle");
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
  });

  describe("selectors", () => {
    const selectorState = {
      divPfs: {
        divPfs: mockDivPfs,
        requestedTmntId: tmntId,
        tmntId: tmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "succeeded" as ioStatusType,
        error: "test error",
        ioError: ioDataError.NONE,
      },
    } as RootState;

    it("selectDivPfs returns the divPfs array", () => {
      expect(selectDivPfs(selectorState)).toBe(mockDivPfs);
    });

    it("getDivPfRequestedTmntId returns the requested tournament id", () => {
      expect(getDivPfRequestedTmntId(selectorState)).toBe(tmntId);
    });

    it("getDivPfsLoadStatus returns the load status", () => {
      expect(getDivPfsLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getDivPfsSaveStatus returns the save status", () => {
      expect(getDivPfsSaveStatus(selectorState)).toBe("succeeded");
    });

    it("getDivPfsError returns the error", () => {
      expect(getDivPfsError(selectorState)).toBe("test error");
    });

    it("getDivPfsIoError returns the io error", () => {
      expect(getDivPfsIoError(selectorState)).toBe(ioDataError.NONE);
    });
  });

  describe("Thunk tests fetchDivPfs", () => {    

    it("dispatches fulfilled when getAllDivPfsForTmnt resolves", async () => {      
     
      mockedGetAllDivPfsForTmnt.mockResolvedValueOnce(mockDivPfs);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(fetchDivPfs(tmntId) as any);

      const state = store.getState().divPfs;

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

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(fetchDivPfs(tmntId) as any);

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

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      const action = await store.dispatch(fetchDivPfs(tmntId) as any);

      expect(fetchDivPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.requestedTmntId).toBe(tmntId);  
      expect(state.tmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.divPfs).toEqual([]);
    });
  });

  describe("Thunk tests saveDivPfs", () => {

    const validDivIds = [mockDivPfs[0].div_id];
    const toSave: tmntDivPfSaveDataType = {
      divPfData: mockDivPfs,
      divIds: validDivIds,
      tmntId: tmntId
    }       

    it("dispatches fulfilled when updateAllDivPfsForTmnt resolves", async () => {

      const updatedDivPfs = cloneDeep(mockDivPfs);
      updatedDivPfs[0].amount = 450;

      mockedUpdateAllDivPfsForTmnt.mockResolvedValueOnce(updatedDivPfs);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(saveDivPfs(toSave) as any);

      const state = store.getState().divPfs;

      expect(mockedUpdateAllDivPfsForTmnt).toHaveBeenCalledWith(toSave);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(updatedDivPfs);
    });

    it("dispatches rejected when updateAllDivPfsForTmnt resolves undefined", async () => {
      
      mockedUpdateAllDivPfsForTmnt.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

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

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(saveDivPfs(toSave) as any);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.divPfs).toEqual([]);
    });

  });
});