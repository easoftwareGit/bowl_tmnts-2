import reducer, {
  fetchTmntFullData,
  saveTmntEntriesData,
  saveTmntFullData,
  tmntFullDataState,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";

import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import {
  replaceTmntFullData,
  replaceTmntEntriesData,
} from "@/lib/db/tmnts/dbTmntsReplace";

import type { tmntFullType, fullStageType } from "@/lib/types/types";
import { blankFullStage, blankTmnt } from "@/lib/db/initVals";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { ioDataError } from "@/lib/enums/enums";
import { SquadStage } from "@prisma/client";

jest.mock("@/lib/db/tmnts/dbTmnts");
jest.mock("@/lib/db/tmnts/dbTmntsReplace");

const mockedGetTmntFullData = jest.mocked(getTmntFullData);
const mockedReplaceTmntFullData = jest.mocked(replaceTmntFullData);
const mockedReplaceTmntEntriesData = jest.mocked(replaceTmntEntriesData);

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
      stage: blankFullStage,
    },
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
    ioError: ioDataError.NONE,
  };

  const makeStage = (overrides?: Partial<fullStageType>): fullStageType => ({
    id: "stg_1",
    squad_id: "sqd_1",
    stage: SquadStage.DEFINE,
    stage_set_at: "2026-02-18T00:00:00.000Z",
    scores_started_at: null,
    stage_override_enabled: false,
    stage_override_at: null,
    stage_override_reason: "",
    ...overrides,
  });

  const makeMockTmntFull = (overrides?: Partial<tmntFullType>): tmntFullType => ({
    tmnt: { ...cloneDeep(blankTmnt), id: "tmt_1", tmnt_name: "Test Tournament" },
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
    stage: makeStage(),
    ...overrides,
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchTmntFullData.pending", () => {
      const state = reducer(initialState, { type: fetchTmntFullData.pending.type });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.tmntFullData).toEqual(initialState.tmntFullData);
    });

    it("should handle fetchTmntFullData.fulfilled", () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_2", tmnt_name: "Fetched Tournament" },
      });

      const state = reducer(initialState, {
        type: fetchTmntFullData.fulfilled.type,
        payload: mockData,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.tmntFullData).toEqual(mockData);
    });

    it("should handle fetchTmntFullData.rejected", () => {
      const errorMessage = "DB error";

      const state = reducer(initialState, {
        type: fetchTmntFullData.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe(errorMessage);
      expect(state.tmntFullData).toEqual(initialState.tmntFullData);
    });

    it("should handle saveTmntFullData.pending", () => {
      const state = reducer(initialState, { type: saveTmntFullData.pending.type });
      expect(state.saveStatus).toBe("saving");
      expect(state.loadStatus).toBe("idle");
    });

    it("should handle saveTmntFullData.fulfilled", () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Saved Tournament" },
      });

      const state = reducer(initialState, {
        type: saveTmntFullData.fulfilled.type,
        payload: mockData,
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.tmntFullData).toEqual(mockData);
      expect(state.loadStatus).toBe("idle");
    });

    it("should handle saveTmntFullData.rejected", () => {
      const errorMessage = "Save failed";

      const state = reducer(initialState, {
        type: saveTmntFullData.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe(errorMessage);
      expect(state.loadStatus).toBe("idle");
    });

    it("should handle saveTmntEntriesData.pending", () => {
      const state = reducer(initialState, { type: saveTmntEntriesData.pending.type });
      expect(state.saveStatus).toBe("saving");
      expect(state.loadStatus).toBe("idle");
    });

    it("should handle saveTmntEntriesData.fulfilled", () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_20", tmnt_name: "Entries Tournament" },
      });

      const state = reducer(initialState, {
        type: saveTmntEntriesData.fulfilled.type,
        payload: mockData,
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.tmntFullData).toEqual(mockData);
      expect(state.loadStatus).toBe("idle");
    });

    it("should handle saveTmntEntriesData.rejected", () => {
      const errorMessage = "Entries save failed";

      const state = reducer(initialState, {
        type: saveTmntEntriesData.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe(errorMessage);
      expect(state.loadStatus).toBe("idle");
    });
  });

  describe("Thunk tests (fetch)", () => {
    it("dispatches fulfilled when getTmntFullData resolves", async () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_2", tmnt_name: "Another Tournament" },
      });

      mockedGetTmntFullData.mockResolvedValueOnce(mockData);

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(fetchTmntFullData("tmt_2") as any);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.tmntFullData).toEqual(mockData);
    });

    it("dispatches rejected when getTmntFullData rejects", async () => {
      mockedGetTmntFullData.mockRejectedValueOnce(new Error("DB failed"));

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(fetchTmntFullData("tmt_3") as any);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
    });

    it("dispatches rejected when getTmntFullData resolves undefined (not found)", async () => {
      mockedGetTmntFullData.mockResolvedValueOnce(undefined as any);

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      const action = await store.dispatch(fetchTmntFullData("tmt_404") as any);

      expect(fetchTmntFullData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("Error fetching tournament full data");
    });
  });

  describe("Thunk tests (save/replace full tmnt)", () => {
    it("dispatches fulfilled when replaceTmntFullData resolves", async () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Save Tournament" },
      });

      mockedReplaceTmntFullData.mockResolvedValueOnce(true);

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(saveTmntFullData(mockData) as any);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.tmntFullData).toEqual(mockData);
    });

    it("dispatches rejected when replaceTmntFullData resolves false", async () => {
      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Save Tournament" },
      });

      mockedReplaceTmntFullData.mockResolvedValueOnce(false);

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      const action = await store.dispatch(saveTmntFullData(mockData) as any);

      expect(saveTmntFullData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toMatch(/failed to save tournament full data/i);
    });

    it("dispatches rejected when replaceTmntFullData rejects", async () => {
      mockedReplaceTmntFullData.mockRejectedValueOnce(new Error("Save failed"));

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(saveTmntFullData(initialState.tmntFullData) as any);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
    });
  });

  describe("Thunk tests (save/replace tmnt entries)", () => {
    it("dispatches fulfilled when replaceTmntEntriesData resolves and uses server stage", async () => {
      const clientStage = makeStage({
        stage: SquadStage.ENTRIES,
        stage_set_at: "client-old",
        scores_started_at: null,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "",
      });

      const mockData = makeMockTmntFull({
        tmnt: { ...cloneDeep(blankTmnt), id: "tmt_20", tmnt_name: "Entries Tournament" },
        stage: clientStage,
      });

      const serverStage = makeStage({
        stage: SquadStage.SCORES,
        stage_set_at: "2026-02-18T12:00:00.000Z",
        scores_started_at: "2026-02-18T12:00:00.000Z",
        stage_override_enabled: true,
        stage_override_at: "2026-02-18T12:00:00.000Z",
        stage_override_reason: "director override",
      });

      mockedReplaceTmntEntriesData.mockResolvedValueOnce({
        success: true,
        stage: serverStage,
      });

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(saveTmntEntriesData(mockData) as any);

      const state = store.getState().tmntFullData;

      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");

      // stage comes from server (authoritative)
      expect(state.tmntFullData.stage).toEqual(serverStage);

      // other fields remain what we sent
      expect(state.tmntFullData.tmnt.id).toBe(mockData.tmnt.id);
      expect(state.tmntFullData.players).toEqual(mockData.players);
      expect(state.tmntFullData.divEntries).toEqual(mockData.divEntries);
    });

    it("dispatches rejected when replaceTmntEntriesData rejects", async () => {
      mockedReplaceTmntEntriesData.mockRejectedValueOnce(new Error("Entries save failed"));

      const store = configureStore({ reducer: { tmntFullData: reducer } });

      await store.dispatch(saveTmntEntriesData(initialState.tmntFullData) as any);

      const state = store.getState().tmntFullData;
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Entries save failed");
    });
  });
});

// import reducer, {
//   fetchTmntFullData,
//   saveTmntEntriesData,
//   saveTmntFullData,
//   tmntFullDataState
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
// import { replaceTmntFullData, replaceTmntEntriesData } from "@/lib/db/tmnts/dbTmntsReplace";
// import type { tmntFullType } from "@/lib/types/types";
// import { blankFullStage, blankTmnt } from "@/lib/db/initVals";
// import { configureStore } from "@reduxjs/toolkit";
// import _, { cloneDeep } from "lodash";
// import { ioDataError } from "@/lib/enums/enums";

// jest.mock("@/lib/db/tmnts/dbTmnts");
// jest.mock("@/lib/db/tmnts/dbTmntsReplace");

// const mockedGetTmntFullData = jest.mocked(getTmntFullData);
// const mockedReplaceTmntFullData = jest.mocked(replaceTmntFullData);
// const mockedReplaceTmntEntriesData = jest.mocked(replaceTmntEntriesData);

// describe("tmntFullDataSlice reducer + thunk", () => {
//   const initialState: tmntFullDataState = {
//     tmntFullData: {
//       tmnt: cloneDeep(blankTmnt),
//       brktEntries: [],
//       brktSeeds: [],
//       brkts: [],
//       divs: [],
//       divEntries: [],
//       elimEntries: [],
//       elims: [],
//       events: [],
//       lanes: [],
//       oneBrkts: [],
//       players: [],
//       potEntries: [],
//       pots: [],
//       squads: [],
//       stage: blankFullStage,
//     },
//     loadStatus: "idle",
//     saveStatus: "idle",
//     error: "",
//     ioError: ioDataError.NONE,
//   };

//   describe('reducer unit tests', () => { 
//     it("should return the initial state", () => {
//       expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
//     });

//     it("should handle fetchTmntFullData.pending", () => {
//       const state = reducer(initialState, { type: fetchTmntFullData.pending.type });
//       expect(state).toEqual({
//         tmntFullData: {
//           tmnt: cloneDeep(blankTmnt),
//           brktEntries: [],
//           brktSeeds: [],
//           brkts: [],
//           divs: [],
//           divEntries: [],
//           elimEntries: [],
//           elims: [],
//           events: [],
//           lanes: [],
//           oneBrkts: [],
//           players: [],
//           potEntries: [],
//           pots: [],
//           squads: [],
//           stage: blankFullStage,
//         },
//         loadStatus: "loading",
//         saveStatus: "idle",
//         error: "",
//         ioError: 0,
//       });
//     });

//     it("should handle fetchTmntFullData.fulfilled", () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "1", tmnt_name: "Test Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };
//       const state = reducer(initialState, {
//         type: fetchTmntFullData.fulfilled.type,
//         payload: mockData,
//       });
//       expect(state).toEqual({
//         tmntFullData: mockData,
//         loadStatus: "succeeded",
//         saveStatus: "idle",
//         error: "",
//         ioError: 0,
//       });
//     });

//     it("should handle fetchTmntFullData.rejected", () => {
//       const errorMessage = "DB error";
//       const state = reducer(initialState, {
//         type: fetchTmntFullData.rejected.type,
//         error: { message: errorMessage },
//       });
//       expect(state).toEqual({
//         tmntFullData: {
//           tmnt: cloneDeep(blankTmnt),
//           brktEntries: [],
//           brktSeeds: [],
//           brkts: [],
//           divs: [],
//           divEntries: [],
//           elimEntries: [],
//           elims: [],
//           events: [],
//           lanes: [],
//           oneBrkts: [],
//           players: [],
//           potEntries: [],
//           pots: [],
//           squads: [],
//           stage: blankFullStage,
//         },
//         loadStatus: "failed",
//         saveStatus: "idle",
//         error: errorMessage,
//         ioError: 0,
//       });
//     });

//     it("should handle saveTmntFullData.pending", () => {
//       const state = reducer(initialState, { type: saveTmntFullData.pending.type });
//       expect(state.saveStatus).toBe("saving");
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });

//     it("should handle saveTmntFullData.fulfilled", () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "10", tmnt_name: "Save Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };

//       const state = reducer(initialState, {
//         type: saveTmntFullData.fulfilled.type,
//         payload: mockData,
//       });

//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });

//     it("should handle saveTmntFullData.rejected", () => {
//       const errorMessage = "Save failed";
//       const state = reducer(initialState, {
//         type: saveTmntFullData.rejected.type,
//         error: { message: errorMessage },
//       });

//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe(errorMessage);
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });

//     it("should handle saveTmntEntriesData.pending", () => {
//       const state = reducer(initialState, { type: saveTmntEntriesData.pending.type });
//       expect(state.saveStatus).toBe("saving");
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });

//     it("should handle saveTmntEntriesData.fulfilled", () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "20", tmnt_name: "Entries Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };

//       const state = reducer(initialState, {
//         type: saveTmntEntriesData.fulfilled.type,
//         payload: mockData,
//       });

//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });

//     it("should handle saveTmntEntriesData.rejected", () => {
//       const errorMessage = "Entries save failed";
//       const state = reducer(initialState, {
//         type: saveTmntEntriesData.rejected.type,
//         error: { message: errorMessage },
//       });

//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe(errorMessage);
//       expect(state.loadStatus).toBe("idle"); // unchanged
//     });
    
//   })

//   describe('Thunk tests (fetch)', () => { 
//     it("dispatches fulfilled when getTmntFullData resolves", async () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "2", tmnt_name: "Another Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };    
//       mockedGetTmntFullData.mockResolvedValueOnce(mockData);

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(fetchTmntFullData("2") as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("succeeded");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("dispatches rejected when getTmntFullData rejects", async () => {    
//       mockedGetTmntFullData.mockRejectedValueOnce(new Error("DB failed"));

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(fetchTmntFullData("3") as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("failed");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("DB failed");
//     });

//     it("dispatches rejected when getTmntFullData resolves undefined (not found)", async () => {
//       mockedGetTmntFullData.mockResolvedValueOnce(undefined as any);

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       const action = await store.dispatch(fetchTmntFullData("404") as any);

//       expect(fetchTmntFullData.rejected.match(action)).toBe(true);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("failed");
//       expect(state.error).toBe("Error fetching tournament full data");
//     });
//   })

//   describe('Thunk tests (save/replace full tmnt)', () => { 
//     it("dispatches fulfilled when replaceTmntFullData resolves", async () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "10", tmnt_name: "Save Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };    
//       mockedReplaceTmntFullData.mockResolvedValueOnce(true);

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(saveTmntFullData(mockData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("dispatches rejected when replaceTmntFullData resolves false", async () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "10", tmnt_name: "Save Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };

//       mockedReplaceTmntFullData.mockResolvedValueOnce(false);

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       const action = await store.dispatch(saveTmntFullData(mockData) as any);

//       expect(saveTmntFullData.rejected.match(action)).toBe(true);

//       const state = store.getState().tmntFullData;
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toMatch(/failed to save tournament full data/i);
//     });
    
//     it("dispatches rejected when replaceTmntFullData rejects", async () => {
//       mockedReplaceTmntFullData.mockRejectedValueOnce(
//         new Error("Save failed")
//       );

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(saveTmntFullData(initialState.tmntFullData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe("Save failed");
//     });
//   })
  
//   describe('Thunk tests (save/replace tmnt entries)', () => { 
//     it("dispatches fulfilled when replaceTmntEntriesData resolves", async () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "20", tmnt_name: "Entries Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };    
//       mockedReplaceTmntEntriesData.mockResolvedValueOnce(true);

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(saveTmntEntriesData(mockData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.ioError).toBe(0);
//       expect(state.error).toBe("");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("dispatches rejected when replaceTmntEntriesData resolves false", async () => {
//       const mockData: tmntFullType = {
//         tmnt: { ...cloneDeep(blankTmnt), id: "20", tmnt_name: "Entries Tournament" },
//         brktEntries: [],
//         brktSeeds: [],
//         brkts: [],
//         divs: [],
//         divEntries: [],
//         elimEntries: [],
//         elims: [],
//         events: [],
//         lanes: [],
//         oneBrkts: [],
//         players: [],
//         potEntries: [],
//         pots: [],
//         squads: [],
//         stage: blankFullStage,
//       };

//       mockedReplaceTmntEntriesData.mockResolvedValueOnce(false);
      
//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       const action = await store.dispatch(saveTmntEntriesData(mockData) as any);

//       expect(saveTmntEntriesData.rejected.match(action)).toBe(true);

//       const state = store.getState().tmntFullData;
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toMatch(/failed to save tournament entries data/i);
//     });

//     it("dispatches rejected when replaceTmntEntriesData rejects", async () => {
//       mockedReplaceTmntEntriesData.mockRejectedValueOnce(
//         new Error("Entries save failed")
//       );

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(saveTmntEntriesData(initialState.tmntFullData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe("Entries save failed");
//     });
//   })

// });