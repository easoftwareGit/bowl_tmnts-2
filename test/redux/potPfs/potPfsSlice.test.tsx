import reducer, {
  potPfsState,
  fetchPotPfs,
  savePotPfs,
  selectPotPfs,
  getPotPfsRequestedTmntId,
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
import { mockPotPfs, tmntId } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";
import { tmntPotPfSaveDataType } from "@/lib/types/types";

jest.mock("@/lib/db/potPfs/dbPotPfs");

const mockedGetAllPotPfsForTmnt = jest.mocked(getAllPotPfsForTmnt);
const mockedUpdateAllPotPfsForTmnt = jest.mocked(updateAllPotPfsForTmnt);

describe("potPfsSlice reducer + thunk", () => {
  const initialState: potPfsState = {
    potPfs: [],
    requestedTmntId: "",
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
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual([]);
    });

    it("should handle fetchPotPfs.fulfilled", () => {      

      const state = reducer(initialState, {
        type: fetchPotPfs.fulfilled.type,
        payload: mockPotPfs,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("should handle fetchPotPfs.rejected", () => {
      const errorMessage = "DB error";

      const state = reducer(initialState, {
        type: fetchPotPfs.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
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
  });

  describe("selectors", () => {
    const selectorState = {
      potPfs: {
        potPfs: mockPotPfs,
        requestedTmntId: tmntId,
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

    it("dispatches fulfilled when getAllPotPfsForPot resolves", async () => {      
     
      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce(mockPotPfs);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(fetchPotPfs(tmntId) as any);

      const state = store.getState().potPfs;

      expect(mockedGetAllPotPfsForTmnt).toHaveBeenCalledWith(tmntId);
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("dispatches rejected when getAllPotPfsForPot rejects", async () => {
      mockedGetAllPotPfsForTmnt.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(fetchPotPfs(tmntId) as any);

      const state = store.getState().potPfs;

      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllPotPfsForPot resolves an empty array", async () => {
      mockedGetAllPotPfsForTmnt.mockResolvedValueOnce([]);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(fetchPotPfs(tmntId) as any);

      expect(fetchPotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.requestedTmntId).toBe(tmntId);      
      expect(state.loadStatus).toBe("succeeded");
      expect(state.potPfs).toEqual([]);
    });
  });

  describe("Thunk tests savePotPfs", () => {

    const validPotIds = [mockPotPfs[0].pot_id];
    const toSave: tmntPotPfSaveDataType = {
      potPfData: mockPotPfs,
      potIds: validPotIds,
      tmntId: tmntId
    }           

    it("dispatches fulfilled when updateAllPotPfsForPot resolves", async () => {

      const updatedPotPfs = cloneDeep(mockPotPfs);
      updatedPotPfs[0].amount = 450;

      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(updatedPotPfs);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(savePotPfs(toSave) as any);

      const state = store.getState().potPfs;

      expect(mockedUpdateAllPotPfsForTmnt).toHaveBeenCalledWith(toSave);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(updatedPotPfs);
    });

    it("dispatches rejected when updateAllPotPfsForPot resolves undefined", async () => {
      
      mockedUpdateAllPotPfsForTmnt.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(savePotPfs(toSave) as any);

      expect(savePotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating potPfs");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllPotPfsForPot rejects", async () => {      

      mockedUpdateAllPotPfsForTmnt.mockRejectedValueOnce(new Error("Save failed"));

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(savePotPfs(toSave) as any);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.potPfs).toEqual([]);
    });

  });
});
