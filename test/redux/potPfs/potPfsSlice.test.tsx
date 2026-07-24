import reducer, {
  potPfsState,
  fetchPotPfs,
  savePotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
import {
  getAllPotPfsForPot,
  updateAllPotPfsForPot,
} from "@/lib/db/potPfs/dbPotPfs";
import { mockPotPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";

jest.mock("@/lib/db/potPfs/dbPotPfs");

const mockedGetAllPotPfsForPot = jest.mocked(getAllPotPfsForPot);
const mockedUpdateAllPotPfsForPot = jest.mocked(updateAllPotPfsForPot);

describe("potPfsSlice reducer + thunk", () => {
  const initialState: potPfsState = {
    potPfs: [],
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
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
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

  describe("Thunk tests fetchPotPfs", () => {
    it("dispatches fulfilled when getAllPotPfsForPot resolves", async () => {      

      mockedGetAllPotPfsForPot.mockResolvedValueOnce(mockPotPfs);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(fetchPotPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().potPfs;

      expect(mockedGetAllPotPfsForPot).toHaveBeenCalledWith(
        "div_00000000000000000000000000000001",
      );
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(mockPotPfs);
    });

    it("dispatches rejected when getAllPotPfsForPot rejects", async () => {
      mockedGetAllPotPfsForPot.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(fetchPotPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when getAllPotPfsForPot resolves undefined", async () => {
      mockedGetAllPotPfsForPot.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchPotPfs("div_00000000000000000000000000000404") as any,
      );

      expect(fetchPotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("Error fetching potPfs for pot");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllPotPfsForPot resolves an empty array", async () => {
      mockedGetAllPotPfsForPot.mockResolvedValueOnce([]);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchPotPfs("div_00000000000000000000000000000001") as any,
      );

      expect(fetchPotPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.potPfs).toEqual([]);
    });
  });

  describe("Thunk tests savePotPfs", () => {
    it("dispatches fulfilled when updateAllPotPfsForPot resolves", async () => {

      const updatedPotPfs = cloneDeep(mockPotPfs);
      updatedPotPfs[0].amount = 450;

      mockedUpdateAllPotPfsForPot.mockResolvedValueOnce(updatedPotPfs);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(savePotPfs(mockPotPfs) as any);

      const state = store.getState().potPfs;

      expect(mockedUpdateAllPotPfsForPot).toHaveBeenCalledWith(
        mockPotPfs[0].pot_id,
        mockPotPfs,
      );
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.potPfs).toEqual(updatedPotPfs);
    });

    it("dispatches rejected when updateAllPotPfsForPot resolves undefined", async () => {
      
      mockedUpdateAllPotPfsForPot.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(savePotPfs(mockPotPfs) as any);

      expect(savePotPfs.rejected.match(action)).toBe(true);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating potPfs");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllPotPfsForPot rejects", async () => {      

      mockedUpdateAllPotPfsForPot.mockRejectedValueOnce(new Error("Save failed"));

      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      await store.dispatch(savePotPfs(mockPotPfs) as any);

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when savePotPfs is called with an empty array", async () => {
      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(
        savePotPfs([]) as any,
      );

      expect(savePotPfs.rejected.match(action)).toBe(true);
      expect(mockedUpdateAllPotPfsForPot).not.toHaveBeenCalled();

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Invalid potPfs array");
      expect(state.potPfs).toEqual([]);
    });

    it("dispatches rejected when savePotPfs is called with a non-array value", async () => {
      const store = configureStore({
        reducer: {
          potPfs: reducer,
        },
      });

      const action = await store.dispatch(
        savePotPfs(undefined as any),
      );

      expect(savePotPfs.rejected.match(action)).toBe(true);
      expect(mockedUpdateAllPotPfsForPot).not.toHaveBeenCalled();

      const state = store.getState().potPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Invalid potPfs array");
      expect(state.potPfs).toEqual([]);
    });    
    
  });

});