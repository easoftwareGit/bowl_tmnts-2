import reducer, {
  fetchTmntFullData,
  saveTmntEntriesData,
  saveTmntFullData,
  tmntFullDataState
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import { replaceTmntFullData, replaceTmntEntriesData } from "@/lib/db/tmnts/dbTmntsReplace";
import { tmntFullType } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
  getTmntFullData: jest.fn(),
}));

jest.mock("@/lib/db/tmnts/dbTmntsReplace", () => ({
  replaceTmntFullData: jest.fn(),
  replaceTmntEntriesData: jest.fn(),
}));

describe("tmntFullDataSlice reducer + thunk", () => {
  const initialState: tmntFullDataState = {
    tmntFullData: {
      tmnt: cloneDeep(blankTmnt),
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [],
    },
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
    ioError: 0,
  };

  //
  // --- Reducer unit tests ---
  //

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
  });

  it("should handle fetchTmntFullData.pending", () => {
    const state = reducer(initialState, { type: fetchTmntFullData.pending.type });
    expect(state).toEqual({
      tmntFullData: {
        tmnt: cloneDeep(blankTmnt),
        brktEntries: [],
        brktSeeds: [],
        brkts: [],
        divs: [],
        divEntries: [],
        elimEntries: [],
        elims: [],
        events: [],
        lanes: [],
        oneBrkts: [],
        players: [],
        potEntries: [],
        pots: [],
        squads: [],
      },
      loadStatus: "loading",
      saveStatus: "idle",
      error: "",
      ioError: 0,
    });
  });

  it("should handle fetchTmntFullData.fulfilled", () => {
    const mockData: tmntFullType = {
      tmnt: { ...cloneDeep(blankTmnt), id: "1", tmnt_name: "Test Tournament" },
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [],
    };
    const state = reducer(initialState, {
      type: fetchTmntFullData.fulfilled.type,
      payload: mockData,
    });
    expect(state).toEqual({
      tmntFullData: mockData,
      loadStatus: "succeeded",
      saveStatus: "idle",
      error: "",
      ioError: 0,
    });
  });

  it("should handle fetchTmntFullData.rejected", () => {
    const errorMessage = "DB error";
    const state = reducer(initialState, {
      type: fetchTmntFullData.rejected.type,
      error: { message: errorMessage },
    });
    expect(state).toEqual({
      tmntFullData: {
        tmnt: cloneDeep(blankTmnt),
        brktEntries: [],
        brktSeeds: [],
        brkts: [],
        divs: [],
        divEntries: [],
        elimEntries: [],
        elims: [],
        events: [],
        lanes: [],
        oneBrkts: [],
        players: [],
        potEntries: [],
        pots: [],
        squads: [],
      },
      loadStatus: "failed",
      saveStatus: "idle",
      error: errorMessage,
      ioError: 0,
    });
  });

  //
  // --- Thunk tests (fetch) ---
  //

  it("dispatches fulfilled when getTmntFullData resolves", async () => {
    const mockData: tmntFullType = {
      tmnt: { ...cloneDeep(blankTmnt), id: "2", tmnt_name: "Another Tournament" },
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [],
    };
    (getTmntFullData as jest.Mock).mockResolvedValueOnce(mockData);

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(fetchTmntFullData("2") as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("succeeded");
    expect(state.saveStatus).toBe("idle");
    expect(state.error).toBe("");
    expect(state.tmntFullData).toEqual(mockData);
  });

  it("dispatches rejected when getTmntFullData rejects", async () => {
    (getTmntFullData as jest.Mock).mockRejectedValueOnce(new Error("DB failed"));

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(fetchTmntFullData("3") as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("failed");
    expect(state.saveStatus).toBe("idle");
    expect(state.error).toBe("DB failed");
  });

  //
  // --- Thunk tests (save/replace full tmnt) ---
  //
  it("dispatches fulfilled when replaceTmntFullData resolves", async () => {
    const mockData: tmntFullType = {
      tmnt: { ...cloneDeep(blankTmnt), id: "10", tmnt_name: "Save Tournament" },
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [],
    };
    (replaceTmntFullData as jest.Mock).mockResolvedValueOnce(1);

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(saveTmntFullData(mockData) as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("succeeded");
    expect(state.tmntFullData).toEqual(mockData);
  });

  it("dispatches rejected when replaceTmntFullData rejects", async () => {
    (replaceTmntFullData as jest.Mock).mockRejectedValueOnce(
      new Error("Save failed")
    );

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(saveTmntFullData(initialState.tmntFullData) as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("failed");
    expect(state.error).toBe("Save failed");
  });
  
  //
  // --- Thunk tests (save/replace tmnt entries) ---
  //
  it("dispatches fulfilled when replaceTmntEntriesData resolves", async () => {
    const mockData: tmntFullType = {
      tmnt: { ...cloneDeep(blankTmnt), id: "20", tmnt_name: "Entries Tournament" },
      brktEntries: [],
      brktSeeds: [],
      brkts: [],
      divs: [],
      divEntries: [],
      elimEntries: [],
      elims: [],
      events: [],
      lanes: [],
      oneBrkts: [],
      players: [],
      potEntries: [],
      pots: [],
      squads: [],
    };
    (replaceTmntEntriesData as jest.Mock).mockResolvedValueOnce(1);

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(saveTmntEntriesData(mockData) as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("succeeded");
    expect(state.ioError).toBe(0);
    expect(state.error).toBe("");
    expect(state.tmntFullData).toEqual(mockData);
  });

  it("dispatches rejected when replaceTmntEntriesData rejects", async () => {
    (replaceTmntEntriesData as jest.Mock).mockRejectedValueOnce(
      new Error("Entries save failed")
    );

    const store = configureStore({
      reducer: { tmntFullData: reducer },
    });

    await store.dispatch(saveTmntEntriesData(initialState.tmntFullData) as any);

    const state = store.getState().tmntFullData;
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("failed");
    expect(state.error).toBe("Entries save failed");
  });

});