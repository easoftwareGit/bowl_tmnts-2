import reducer, {
  elimPfsState,
  fetchElimPfs,
  saveElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import {
  getAllElimPfsForElim,
  updateAllElimPfsForElim,
} from "@/lib/db/elimPfs/dbElimPfs";
import { mockElimPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";

jest.mock("@/lib/db/elimPfs/dbElimPfs");

const mockedGetAllElimPfsForElim = jest.mocked(getAllElimPfsForElim);
const mockedUpdateAllElimPfsForElim = jest.mocked(updateAllElimPfsForElim);

describe("elimPfsSlice reducer + thunk", () => {
  const initialState: elimPfsState = {
    elimPfs: [],
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

    it("should handle fetchElimPfs.pending", () => {
      const state = reducer(initialState, {
        type: fetchElimPfs.pending.type,
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
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

  describe("Thunk tests fetchElimPfs", () => {
    it("dispatches fulfilled when getAllElimPfsForElim resolves", async () => {      

      mockedGetAllElimPfsForElim.mockResolvedValueOnce(mockElimPfs);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(fetchElimPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().elimPfs;

      expect(mockedGetAllElimPfsForElim).toHaveBeenCalledWith(
        "div_00000000000000000000000000000001",
      );
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(mockElimPfs);
    });

    it("dispatches rejected when getAllElimPfsForElim rejects", async () => {
      mockedGetAllElimPfsForElim.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(fetchElimPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches rejected when getAllElimPfsForElim resolves undefined", async () => {
      mockedGetAllElimPfsForElim.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchElimPfs("div_00000000000000000000000000000404") as any,
      );

      expect(fetchElimPfs.rejected.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("Error fetching elimPfs for elim");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllElimPfsForElim resolves an empty array", async () => {
      mockedGetAllElimPfsForElim.mockResolvedValueOnce([]);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchElimPfs("div_00000000000000000000000000000001") as any,
      );

      expect(fetchElimPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.elimPfs).toEqual([]);
    });
  });

  describe("Thunk tests saveElimPfs", () => {
    it("dispatches fulfilled when updateAllElimPfsForElim resolves", async () => {

      const updatedElimPfs = cloneDeep(mockElimPfs);
      updatedElimPfs[0].amount = 450;

      mockedUpdateAllElimPfsForElim.mockResolvedValueOnce(updatedElimPfs);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(saveElimPfs(mockElimPfs) as any);

      const state = store.getState().elimPfs;

      expect(mockedUpdateAllElimPfsForElim).toHaveBeenCalledWith(
        mockElimPfs[0].elim_id,
        mockElimPfs,
      );
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.elimPfs).toEqual(updatedElimPfs);
    });

    it("dispatches rejected when updateAllElimPfsForElim resolves undefined", async () => {
      
      mockedUpdateAllElimPfsForElim.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(saveElimPfs(mockElimPfs) as any);

      expect(saveElimPfs.rejected.match(action)).toBe(true);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating elimPfs");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllElimPfsForElim rejects", async () => {      

      mockedUpdateAllElimPfsForElim.mockRejectedValueOnce(new Error("Save failed"));

      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      await store.dispatch(saveElimPfs(mockElimPfs) as any);

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches rejected when saveElimPfs is called with an empty array", async () => {
      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(
        saveElimPfs([]) as any,
      );

      expect(saveElimPfs.rejected.match(action)).toBe(true);
      expect(mockedUpdateAllElimPfsForElim).not.toHaveBeenCalled();

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Invalid elimPfs array");
      expect(state.elimPfs).toEqual([]);
    });

    it("dispatches rejected when saveElimPfs is called with a non-array value", async () => {
      const store = configureStore({
        reducer: {
          elimPfs: reducer,
        },
      });

      const action = await store.dispatch(
        saveElimPfs(undefined as any),
      );

      expect(saveElimPfs.rejected.match(action)).toBe(true);
      expect(mockedUpdateAllElimPfsForElim).not.toHaveBeenCalled();

      const state = store.getState().elimPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Invalid elimPfs array");
      expect(state.elimPfs).toEqual([]);
    });    
    
  });

});