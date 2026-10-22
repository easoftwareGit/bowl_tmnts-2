import reducer, {
  tmntFullDataState,
  fetchTmntFullData,
  saveTmntFullData,
  saveTmntEntriesData,
  selectTmntFullData,
  getTmntFullDataRequestedTmntId,
  getTmntFullDataLoadStatus,
  getTmntDataSaveStatus,
  getTmntFullDataError,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getTmntFullData,
  replaceTmntFullData,
  replaceTmntEntriesData,
} from "@/lib/db/tmnts/dbTmnts";
import type { tmntFullType, fullStageType } from "@/lib/types/types";
import { blankFullStage, blankTmnt } from "@/lib/db/initVals";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
import { SquadStage } from "@prisma/client";

jest.mock("@/lib/db/tmnts/dbTmnts");

const mockedGetTmntFullData = jest.mocked(getTmntFullData);
const mockedReplaceTmntFullData = jest.mocked(replaceTmntFullData);
const mockedReplaceTmntEntriesData = jest.mocked(replaceTmntEntriesData);

// db functions are mocked, so these ids only need to be distinct
const tmntId = "tmt_00000000000000000000000000000001";
const otherTmntId = "tmt_00000000000000000000000000000099";

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

const makeMockTmntFull = (
  id: string,
  tmnt_name: string,
  overrides?: Partial<tmntFullType>,
): tmntFullType => ({
  tmnt: { ...cloneDeep(blankTmnt), id, tmnt_name },
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
  moneys: [],
  ...overrides,
});

const mockTmntFull = makeMockTmntFull(tmntId, "Test Tournament");
const otherTmntFull = makeMockTmntFull(otherTmntId, "Other Tournament");

const makeStore = (preloaded?: tmntFullDataState) =>
  configureStore({
    reducer: { tmntFullData: reducer },
    preloadedState: preloaded ? { tmntFullData: preloaded } : undefined,
  });

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
      stage: cloneDeep(blankFullStage),
      moneys: [],
    },
    requestedTmntId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load of tmntId
  const loadedState: tmntFullDataState = {
    ...initialState,
    tmntFullData: mockTmntFull,
    requestedTmntId: tmntId,
    loadStatus: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    describe("fetchTmntFullData", () => {
      it("should handle fetchTmntFullData.pending", () => {
        const state = reducer(initialState, {
          type: fetchTmntFullData.pending.type,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.error).toBe("");
        expect(state.tmntFullData).toEqual(initialState.tmntFullData);
      });

      it("fetchTmntFullData.pending keeps the previously loaded tournament", () => {
        const state = reducer(loadedState, {
          type: fetchTmntFullData.pending.type,
          meta: { arg: otherTmntId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("fetchTmntFullData.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, loadStatus: "failed", error: "old error" },
          { type: fetchTmntFullData.pending.type, meta: { arg: tmntId } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchTmntFullData.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchTmntFullData.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchTmntFullData.fulfilled.type,
          payload: mockTmntFull,
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("succeeded");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.error).toBe("");
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("should handle fetchTmntFullData.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchTmntFullData.pending.type,
          meta: { arg: tmntId },
        });

        const state = reducer(pendingState, {
          type: fetchTmntFullData.rejected.type,
          error: { message: errorMessage },
          meta: { arg: tmntId },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.saveStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.tmntFullData).toEqual(initialState.tmntFullData);
      });

      it("fetchTmntFullData.rejected keeps the previously loaded tournament", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchTmntFullData.rejected.type,
            error: { message: "DB error" },
            meta: { arg: otherTmntId },
          },
        );

        expect(state.loadStatus).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.requestedTmntId).toBe(otherTmntId);
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("ignores a stale fetchTmntFullData.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchTmntFullData.fulfilled.type,
            payload: makeMockTmntFull(tmntId, "Stale Tournament"),
            meta: { arg: tmntId },
          },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("ignores a stale fetchTmntFullData.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedTmntId: otherTmntId, loadStatus: "loading" },
          {
            type: fetchTmntFullData.rejected.type,
            error: { message: "DB error" },
            meta: { arg: tmntId },
          },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
      });
    });

    describe("saveTmntFullData", () => {
      it("should handle saveTmntFullData.pending", () => {
        const state = reducer(initialState, { type: saveTmntFullData.pending.type });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("saveTmntFullData.pending clears a previous error", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "failed", error: "old error" },
          { type: saveTmntFullData.pending.type },
        );

        expect(state.error).toBe("");
      });

      it("should handle saveTmntFullData.fulfilled", () => {
        const state = reducer(loadedState, {
          type: saveTmntFullData.fulfilled.type,
          payload: mockTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.loadStatus).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("saveTmntFullData.fulfilled for a different tournament keeps the requested one", () => {
        const state = reducer(loadedState, {
          type: saveTmntFullData.fulfilled.type,
          payload: otherTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.requestedTmntId).toBe(tmntId);
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("saveTmntFullData.fulfilled fills state when nothing has been requested", () => {
        const state = reducer(initialState, {
          type: saveTmntFullData.fulfilled.type,
          payload: otherTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.tmntFullData).toEqual(otherTmntFull);
      });

      it("should handle saveTmntFullData.rejected", () => {
        const errorMessage = "Save failed";

        const state = reducer(loadedState, {
          type: saveTmntFullData.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("succeeded");
        expect(state.error).toBe(errorMessage);
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });
    });

    describe("saveTmntEntriesData", () => {
      it("should handle saveTmntEntriesData.pending", () => {
        const state = reducer(initialState, { type: saveTmntEntriesData.pending.type });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
      });

      it("saveTmntEntriesData.pending clears a previous error", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "failed", error: "old error" },
          { type: saveTmntEntriesData.pending.type },
        );

        expect(state.error).toBe("");
      });

      it("should handle saveTmntEntriesData.fulfilled", () => {
        const state = reducer(loadedState, {
          type: saveTmntEntriesData.fulfilled.type,
          payload: mockTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.loadStatus).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("saveTmntEntriesData.fulfilled for a different tournament keeps the requested one", () => {
        const state = reducer(loadedState, {
          type: saveTmntEntriesData.fulfilled.type,
          payload: otherTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });

      it("saveTmntEntriesData.fulfilled fills state when nothing has been requested", () => {
        const state = reducer(initialState, {
          type: saveTmntEntriesData.fulfilled.type,
          payload: otherTmntFull,
        });

        expect(state.saveStatus).toBe("succeeded");
        expect(state.tmntFullData).toEqual(otherTmntFull);
      });

      it("should handle saveTmntEntriesData.rejected", () => {
        const errorMessage = "Entries save failed";

        const state = reducer(loadedState, {
          type: saveTmntEntriesData.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("succeeded");
        expect(state.error).toBe(errorMessage);
        expect(state.tmntFullData).toEqual(mockTmntFull);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      tmntFullData: {
        tmntFullData: mockTmntFull,
        requestedTmntId: otherTmntId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectTmntFullData returns the tournament full data", () => {
      expect(selectTmntFullData(selectorState)).toBe(mockTmntFull);
    });

    it("getTmntFullDataRequestedTmntId returns the requested tournament id", () => {
      expect(getTmntFullDataRequestedTmntId(selectorState)).toBe(otherTmntId);
    });

    it("getTmntFullDataLoadStatus returns the load status", () => {
      expect(getTmntFullDataLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getTmntDataSaveStatus returns the save status", () => {
      expect(getTmntDataSaveStatus(selectorState)).toBe("failed");
    });

    it("getTmntFullDataError returns the error", () => {
      expect(getTmntFullDataError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchTmntFullData", () => {
    it("dispatches fulfilled when getTmntFullData resolves", async () => {
      mockedGetTmntFullData.mockResolvedValueOnce(mockTmntFull);
      const store = makeStore();

      const action = await store.dispatch(fetchTmntFullData(tmntId) as any);

      expect(fetchTmntFullData.fulfilled.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });

    it("dispatches rejected when getTmntFullData rejects", async () => {
      mockedGetTmntFullData.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchTmntFullData(tmntId) as any);

      expect(fetchTmntFullData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
      expect(state.loadStatus).toBe("failed");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB failed");
      expect(state.tmntFullData).toEqual(initialState.tmntFullData);
    });

    it("loading a second tournament replaces the first", async () => {
      mockedGetTmntFullData
        .mockResolvedValueOnce(mockTmntFull)
        .mockResolvedValueOnce(otherTmntFull);
      const store = makeStore();

      await store.dispatch(fetchTmntFullData(tmntId) as any);
      await store.dispatch(fetchTmntFullData(otherTmntId) as any);

      const state = store.getState().tmntFullData;

      expect(mockedGetTmntFullData).toHaveBeenNthCalledWith(1, tmntId);
      expect(mockedGetTmntFullData).toHaveBeenNthCalledWith(2, otherTmntId);
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntFullData).toEqual(otherTmntFull);
    });

    it("a failed second load keeps the first tournament", async () => {
      mockedGetTmntFullData
        .mockResolvedValueOnce(mockTmntFull)
        .mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      await store.dispatch(fetchTmntFullData(tmntId) as any);
      await store.dispatch(fetchTmntFullData(otherTmntId) as any);

      const state = store.getState().tmntFullData;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB failed");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: tmntFullType) => void;
      const firstResponse = new Promise<tmntFullType>((resolve) => {
        resolveFirst = resolve;
      });

      mockedGetTmntFullData
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(otherTmntFull);
      const store = makeStore();

      // start tmntId, then otherTmntId; otherTmntId finishes first
      const firstDispatch = store.dispatch(fetchTmntFullData(tmntId) as any);
      await store.dispatch(fetchTmntFullData(otherTmntId) as any);

      // now the older tmntId response arrives late
      resolveFirst(mockTmntFull);
      await firstDispatch;

      const state = store.getState().tmntFullData;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntFullData).toEqual(otherTmntFull);
    });
  });

  describe("Thunk tests saveTmntFullData", () => {
    it("dispatches fulfilled when replaceTmntFullData resolves", async () => {
      mockedReplaceTmntFullData.mockResolvedValueOnce(true);
      const store = makeStore();

      const action = await store.dispatch(saveTmntFullData(mockTmntFull) as any);

      expect(saveTmntFullData.fulfilled.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(mockedReplaceTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockedReplaceTmntFullData).toHaveBeenCalledWith(mockTmntFull);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });

    it("a save that finishes after opening another tournament does not overwrite it", async () => {
      let resolveSave!: (value: boolean) => void;
      const saveResponse = new Promise<boolean>((resolve) => {
        resolveSave = resolve;
      });

      mockedReplaceTmntFullData.mockReturnValueOnce(saveResponse);
      mockedGetTmntFullData.mockResolvedValueOnce(otherTmntFull);
      const store = makeStore(loadedState);

      // start saving tmntId, then open otherTmntId before the save returns
      const saveDispatch = store.dispatch(saveTmntFullData(mockTmntFull) as any);
      await store.dispatch(fetchTmntFullData(otherTmntId) as any);

      resolveSave(true);
      await saveDispatch;

      const state = store.getState().tmntFullData;

      expect(state.saveStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntFullData).toEqual(otherTmntFull);
    });

    it("dispatches rejected when replaceTmntFullData resolves false", async () => {
      mockedReplaceTmntFullData.mockResolvedValueOnce(false);
      const store = makeStore(loadedState);

      const action = await store.dispatch(saveTmntFullData(otherTmntFull) as any);

      expect(saveTmntFullData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Failed to save tournament full data");
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });

    it("dispatches rejected when replaceTmntFullData rejects", async () => {
      mockedReplaceTmntFullData.mockRejectedValueOnce(new Error("Save failed"));
      const store = makeStore(loadedState);

      const action = await store.dispatch(saveTmntFullData(mockTmntFull) as any);

      expect(saveTmntFullData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Save failed");
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });
  });

  describe("Thunk tests saveTmntEntriesData", () => {
    const clientStage = makeStage({
      stage: SquadStage.ENTRIES,
      stage_set_at: "client-old",
    });

    const serverStage = makeStage({
      stage: SquadStage.SCORES,
      stage_set_at: "2026-02-18T12:00:00.000Z",
      scores_started_at: "2026-02-18T12:00:00.000Z",
      stage_override_enabled: true,
      stage_override_at: "2026-02-18T12:00:00.000Z",
      stage_override_reason: "director override",
    });

    const entriesData = makeMockTmntFull(tmntId, "Entries Tournament", {
      stage: clientStage,
    });

    it("dispatches fulfilled and uses the server stage", async () => {
      mockedReplaceTmntEntriesData.mockResolvedValueOnce({
        success: true,
        stage: serverStage,
      });
      const store = makeStore();

      const action = await store.dispatch(saveTmntEntriesData(entriesData) as any);

      expect(saveTmntEntriesData.fulfilled.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(mockedReplaceTmntEntriesData).toHaveBeenCalledTimes(1);
      expect(mockedReplaceTmntEntriesData).toHaveBeenCalledWith(entriesData);
      expect(state.loadStatus).toBe("idle");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.error).toBe("");

      // stage comes from the server (authoritative)
      expect(state.tmntFullData.stage).toEqual(serverStage);

      // everything else is what we sent
      expect(state.tmntFullData).toEqual({ ...entriesData, stage: serverStage });
    });

    it("does not mutate the data that was passed in", async () => {
      mockedReplaceTmntEntriesData.mockResolvedValueOnce({
        success: true,
        stage: serverStage,
      });
      const store = makeStore();

      await store.dispatch(saveTmntEntriesData(entriesData) as any);

      expect(entriesData.stage).toEqual(clientStage);
    });

    it("an entries save that finishes after opening another tournament does not overwrite it", async () => {
      let resolveSave!: (value: { success: boolean; stage: fullStageType }) => void;
      const saveResponse = new Promise<{ success: boolean; stage: fullStageType }>(
        (resolve) => {
          resolveSave = resolve;
        },
      );

      mockedReplaceTmntEntriesData.mockReturnValueOnce(saveResponse as any);
      mockedGetTmntFullData.mockResolvedValueOnce(otherTmntFull);
      const store = makeStore(loadedState);

      // start saving entries for tmntId, then open otherTmntId before the save returns
      const saveDispatch = store.dispatch(saveTmntEntriesData(entriesData) as any);
      await store.dispatch(fetchTmntFullData(otherTmntId) as any);

      resolveSave({ success: true, stage: serverStage });
      await saveDispatch;

      const state = store.getState().tmntFullData;

      expect(state.saveStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(otherTmntId);
      expect(state.tmntFullData).toEqual(otherTmntFull);
    });

    it("dispatches rejected when replaceTmntEntriesData resolves without a stage", async () => {
      mockedReplaceTmntEntriesData.mockResolvedValueOnce({
        success: true,
        stage: undefined,
      } as any);
      const store = makeStore(loadedState);

      const action = await store.dispatch(saveTmntEntriesData(entriesData) as any);

      expect(saveTmntEntriesData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Failed to save tournament entries data");
      expect(state.tmntFullData.stage).toEqual(mockTmntFull.stage);
    });

    it("dispatches rejected when replaceTmntEntriesData rejects", async () => {
      mockedReplaceTmntEntriesData.mockRejectedValueOnce(new Error("Entries save failed"));
      const store = makeStore(loadedState);

      const action = await store.dispatch(saveTmntEntriesData(entriesData) as any);

      expect(saveTmntEntriesData.rejected.match(action)).toBe(true);

      const state = store.getState().tmntFullData;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Entries save failed");
      expect(state.tmntFullData).toEqual(mockTmntFull);
    });
  });
});

// import reducer, {
//   fetchTmntFullData,
//   saveTmntEntriesData,
//   saveTmntFullData,
//   tmntFullDataState,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";

// import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
// import {
//   replaceTmntFullData,
//   replaceTmntEntriesData,
// } from "@/lib/db/tmnts/dbTmnts";

// import type { tmntFullType, fullStageType } from "@/lib/types/types";
// import { blankFullStage, blankTmnt } from "@/lib/db/initVals";
// import { configureStore } from "@reduxjs/toolkit";
// import { cloneDeep } from "lodash";
// import { ioDataError } from "@/lib/enums/enums";
// import { SquadStage } from "@prisma/client";

// jest.mock("@/lib/db/tmnts/dbTmnts");

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
//       moneys: [],
//     },
//     requestedTmntId: "",
//     loadStatus: "idle",
//     saveStatus: "idle",
//     error: "",
//     ioError: ioDataError.NONE,
//   };

//   const makeStage = (overrides?: Partial<fullStageType>): fullStageType => ({
//     id: "stg_1",
//     squad_id: "sqd_1",
//     stage: SquadStage.DEFINE,
//     stage_set_at: "2026-02-18T00:00:00.000Z",
//     scores_started_at: null,
//     stage_override_enabled: false,
//     stage_override_at: null,
//     stage_override_reason: "",
//     ...overrides,
//   });

//   const makeMockTmntFull = (overrides?: Partial<tmntFullType>): tmntFullType => ({
//     tmnt: { ...cloneDeep(blankTmnt), id: "tmt_1", tmnt_name: "Test Tournament" },
//     brktEntries: [],
//     brktSeeds: [],
//     brkts: [],
//     divs: [],
//     divEntries: [],
//     elimEntries: [],
//     elims: [],
//     events: [],
//     lanes: [],
//     oneBrkts: [],
//     players: [],
//     potEntries: [],
//     pots: [],
//     squads: [],
//     stage: makeStage(),
//     moneys: [],
//     ...overrides,
//   });

//   describe("reducer unit tests", () => {
//     it("should return the initial state", () => {
//       expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
//     });

//     it("should handle fetchTmntFullData.pending", () => {
//       const state = reducer(initialState, {
//         type: fetchTmntFullData.pending.type,
//         meta: {
//           arg: "tmt_2",
//         },
//       });

//       expect(state.loadStatus).toBe("loading");
//       expect(state.requestedTmntId).toBe("tmt_2");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("");
//       expect(state.tmntFullData).toEqual(initialState.tmntFullData);
//     });

//     it("should handle fetchTmntFullData.fulfilled", () => {
//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_2", tmnt_name: "Fetched Tournament" },
//       });

//       const state = reducer(initialState, {
//         type: fetchTmntFullData.fulfilled.type,
//         payload: mockData,
//       });

//       expect(state.loadStatus).toBe("succeeded");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("should handle fetchTmntFullData.rejected", () => {
//       const errorMessage = "DB error";

//       const state = reducer(initialState, {
//         type: fetchTmntFullData.rejected.type,
//         error: { message: errorMessage },
//       });

//       expect(state.loadStatus).toBe("failed");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe(errorMessage);
//       expect(state.tmntFullData).toEqual(initialState.tmntFullData);
//     });

//     it("should handle saveTmntFullData.pending", () => {
//       const state = reducer(initialState, { type: saveTmntFullData.pending.type });
//       expect(state.saveStatus).toBe("saving");
//       expect(state.loadStatus).toBe("idle");
//     });

//     it("should handle saveTmntFullData.fulfilled", () => {
//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Saved Tournament" },
//       });

//       const state = reducer(initialState, {
//         type: saveTmntFullData.fulfilled.type,
//         payload: mockData,
//       });

//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//       expect(state.loadStatus).toBe("idle");
//     });

//     it("should handle saveTmntFullData.rejected", () => {
//       const errorMessage = "Save failed";

//       const state = reducer(initialState, {
//         type: saveTmntFullData.rejected.type,
//         error: { message: errorMessage },
//       });

//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe(errorMessage);
//       expect(state.loadStatus).toBe("idle");
//     });

//     it("should handle saveTmntEntriesData.pending", () => {
//       const state = reducer(initialState, { type: saveTmntEntriesData.pending.type });
//       expect(state.saveStatus).toBe("saving");
//       expect(state.loadStatus).toBe("idle");
//     });

//     it("should handle saveTmntEntriesData.fulfilled", () => {
//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_20", tmnt_name: "Entries Tournament" },
//       });

//       const state = reducer(initialState, {
//         type: saveTmntEntriesData.fulfilled.type,
//         payload: mockData,
//       });

//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//       expect(state.loadStatus).toBe("idle");
//     });

//     it("should handle saveTmntEntriesData.rejected", () => {
//       const errorMessage = "Entries save failed";

//       const state = reducer(initialState, {
//         type: saveTmntEntriesData.rejected.type,
//         error: { message: errorMessage },
//       });

//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe(errorMessage);
//       expect(state.loadStatus).toBe("idle");
//     });
//   });

//   describe("Thunk tests (fetch)", () => {

//     it("dispatches fulfilled when getTmntFullData resolves", async () => {
//       const mockData = makeMockTmntFull({
//         tmnt: {
//           ...cloneDeep(blankTmnt),
//           id: "tmt_2",
//           tmnt_name: "Another Tournament",
//         },
//       });

//       mockedGetTmntFullData.mockResolvedValueOnce(mockData);

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(fetchTmntFullData("tmt_2") as any);

//       const state = store.getState().tmntFullData;

//       expect(mockedGetTmntFullData).toHaveBeenCalledWith("tmt_2");
//       expect(state.loadStatus).toBe("succeeded");
//       expect(state.requestedTmntId).toBe("tmt_2");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("dispatches rejected when getTmntFullData rejects", async () => {
//       mockedGetTmntFullData.mockRejectedValueOnce(
//         new Error("DB failed"),
//       );

//       const store = configureStore({
//         reducer: { tmntFullData: reducer },
//       });

//       await store.dispatch(fetchTmntFullData("tmt_3") as any);

//       const state = store.getState().tmntFullData;

//       expect(mockedGetTmntFullData).toHaveBeenCalledWith("tmt_3");
//       expect(state.loadStatus).toBe("failed");
//       expect(state.requestedTmntId).toBe("tmt_3");
//       expect(state.saveStatus).toBe("idle");
//       expect(state.error).toBe("DB failed");
//     });

//   });

//   describe("Thunk tests (save/replace full tmnt)", () => {
//     it("dispatches fulfilled when replaceTmntFullData resolves", async () => {
//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Save Tournament" },
//       });

//       mockedReplaceTmntFullData.mockResolvedValueOnce(true);

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       await store.dispatch(saveTmntFullData(mockData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.tmntFullData).toEqual(mockData);
//     });

//     it("dispatches rejected when replaceTmntFullData resolves false", async () => {
//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_10", tmnt_name: "Save Tournament" },
//       });

//       mockedReplaceTmntFullData.mockResolvedValueOnce(false);

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       const action = await store.dispatch(saveTmntFullData(mockData) as any);

//       expect(saveTmntFullData.rejected.match(action)).toBe(true);

//       const state = store.getState().tmntFullData;
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toMatch(/failed to save tournament full data/i);
//     });

//     it("dispatches rejected when replaceTmntFullData rejects", async () => {
//       mockedReplaceTmntFullData.mockRejectedValueOnce(new Error("Save failed"));

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       await store.dispatch(saveTmntFullData(initialState.tmntFullData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe("Save failed");
//     });
//   });

//   describe("Thunk tests (save/replace tmnt entries)", () => {
//     it("dispatches fulfilled when replaceTmntEntriesData resolves and uses server stage", async () => {
//       const clientStage = makeStage({
//         stage: SquadStage.ENTRIES,
//         stage_set_at: "client-old",
//         scores_started_at: null,
//         stage_override_enabled: false,
//         stage_override_at: null,
//         stage_override_reason: "",
//       });

//       const mockData = makeMockTmntFull({
//         tmnt: { ...cloneDeep(blankTmnt), id: "tmt_20", tmnt_name: "Entries Tournament" },
//         stage: clientStage,
//       });

//       const serverStage = makeStage({
//         stage: SquadStage.SCORES,
//         stage_set_at: "2026-02-18T12:00:00.000Z",
//         scores_started_at: "2026-02-18T12:00:00.000Z",
//         stage_override_enabled: true,
//         stage_override_at: "2026-02-18T12:00:00.000Z",
//         stage_override_reason: "director override",
//       });

//       mockedReplaceTmntEntriesData.mockResolvedValueOnce({
//         success: true,
//         stage: serverStage,
//       });

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       await store.dispatch(saveTmntEntriesData(mockData) as any);

//       const state = store.getState().tmntFullData;

//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("succeeded");
//       expect(state.error).toBe("");

//       // stage comes from server (authoritative)
//       expect(state.tmntFullData.stage).toEqual(serverStage);

//       // other fields remain what we sent
//       expect(state.tmntFullData.tmnt.id).toBe(mockData.tmnt.id);
//       expect(state.tmntFullData.players).toEqual(mockData.players);
//       expect(state.tmntFullData.divEntries).toEqual(mockData.divEntries);
//     });

//     it("dispatches rejected when replaceTmntEntriesData rejects", async () => {
//       mockedReplaceTmntEntriesData.mockRejectedValueOnce(new Error("Entries save failed"));

//       const store = configureStore({ reducer: { tmntFullData: reducer } });

//       await store.dispatch(saveTmntEntriesData(initialState.tmntFullData) as any);

//       const state = store.getState().tmntFullData;
//       expect(state.loadStatus).toBe("idle");
//       expect(state.saveStatus).toBe("failed");
//       expect(state.error).toBe("Entries save failed");
//     });
//   });
// });

