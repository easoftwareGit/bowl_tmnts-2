import reducer, {
  divPfsState,
  fetchDivPfs,
  saveDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import {
  getAllDivPfsForDiv,
  updateAllDivPfsForDiv,
} from "@/lib/db/divPfs/dbDivPfs";
import { mockDivPfs } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { ioDataError } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";

jest.mock("@/lib/db/divPfs/dbDivPfs");

const mockedGetAllDivPfsForDiv = jest.mocked(getAllDivPfsForDiv);
const mockedUpdateAllDivPfsForDiv = jest.mocked(updateAllDivPfsForDiv);

describe("divPfsSlice reducer + thunk", () => {
  const initialState: divPfsState = {
    divPfs: [],
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
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual([]);
    });

    it("should handle fetchDivPfs.fulfilled", () => {
      // const mockDivPfs = cloneDeep(mockDivPfs);

      const state = reducer(initialState, {
        type: fetchDivPfs.fulfilled.type,
        payload: mockDivPfs,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(mockDivPfs);
    });

    it("should handle fetchDivPfs.rejected", () => {
      const errorMessage = "DB error";

      const state = reducer(initialState, {
        type: fetchDivPfs.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
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

  describe("Thunk tests fetchDivPfs", () => {
    it("dispatches fulfilled when getAllDivPfsForDiv resolves", async () => {      

      mockedGetAllDivPfsForDiv.mockResolvedValueOnce(mockDivPfs);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(fetchDivPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().divPfs;

      expect(mockedGetAllDivPfsForDiv).toHaveBeenCalledWith(
        "div_00000000000000000000000000000001",
      );
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(mockDivPfs);
    });

    it("dispatches rejected when getAllDivPfsForDiv rejects", async () => {
      mockedGetAllDivPfsForDiv.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(fetchDivPfs("div_00000000000000000000000000000001") as any);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.divPfs).toEqual([]);
    });

    it("dispatches rejected when getAllDivPfsForDiv resolves undefined", async () => {
      mockedGetAllDivPfsForDiv.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchDivPfs("div_00000000000000000000000000000404") as any,
      );

      expect(fetchDivPfs.rejected.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("Error fetching divPfs for div");
      expect(state.divPfs).toEqual([]);
    });

    it("dispatches fulfilled when getAllDivPfsForDiv resolves an empty array", async () => {
      mockedGetAllDivPfsForDiv.mockResolvedValueOnce([]);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      const action = await store.dispatch(
        fetchDivPfs("div_00000000000000000000000000000001") as any,
      );

      expect(fetchDivPfs.fulfilled.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.divPfs).toEqual([]);
    });
  });

  describe("Thunk tests saveDivPfs", () => {
    it("dispatches fulfilled when updateAllDivPfsForDiv resolves", async () => {

      const updatedDivPfs = cloneDeep(mockDivPfs);
      updatedDivPfs[0].amount = 450;

      mockedUpdateAllDivPfsForDiv.mockResolvedValueOnce(updatedDivPfs);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(saveDivPfs(mockDivPfs) as any);

      const state = store.getState().divPfs;

      expect(mockedUpdateAllDivPfsForDiv).toHaveBeenCalledWith(
        mockDivPfs[0].div_id,
        mockDivPfs,
      );
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.divPfs).toEqual(updatedDivPfs);
    });

    it("dispatches rejected when updateAllDivPfsForDiv resolves undefined", async () => {
      
      mockedUpdateAllDivPfsForDiv.mockResolvedValueOnce(undefined as any);

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      const action = await store.dispatch(saveDivPfs(mockDivPfs) as any);

      expect(saveDivPfs.rejected.match(action)).toBe(true);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Error updating divPfs");
      expect(state.divPfs).toEqual([]);
    });

    it("dispatches rejected when updateAllDivPfsForDiv rejects", async () => {      

      mockedUpdateAllDivPfsForDiv.mockRejectedValueOnce(new Error("Save failed"));

      const store = configureStore({
        reducer: {
          divPfs: reducer,
        },
      });

      await store.dispatch(saveDivPfs(mockDivPfs) as any);

      const state = store.getState().divPfs;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.divPfs).toEqual([]);
    });
  });
});