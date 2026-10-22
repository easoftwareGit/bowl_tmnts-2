import reducer, {
  gamesForSquadState,
  fetchGamesForSquad,
  updateGamesForSquad,
  selectGamesForSquad,
  getGamesForSquadRequestedId,
  getGamesForSquadSquadId,
  getGamesForSquadLoadStatus,
  getGamesForSquadSaveStatus,
  getGamesForSquadError,
} from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import {
  getAllGamesForSquad,
  upsertGamesForSquad,
} from "@/lib/db/games/dbGames";
import { mockGames } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

jest.mock("@/lib/db/games/dbGames");

const mockedGetAllGamesForSquad = jest.mocked(getAllGamesForSquad);
const mockedUpsertGamesForSquad = jest.mocked(upsertGamesForSquad);

// db functions are mocked, so these ids only need to be distinct
const squadId = "sqd_00000000000000000000000000000001";
const otherSquadId = "sqd_00000000000000000000000000000099";

const makeStore = (preloaded?: gamesForSquadState) =>
  configureStore({
    reducer: { gamesForSquad: reducer },
    preloadedState: preloaded ? { gamesForSquad: preloaded } : undefined,
  });

describe("gamesForSquadSlice reducer + thunk", () => {
  const initialState: gamesForSquadState = {
    games: [],
    requestedSquadId: "",
    squadId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load of squadId, holding only the first game
  const loadedState: gamesForSquadState = {
    ...initialState,
    games: [mockGames[0]],
    requestedSquadId: squadId,
    squadId: squadId,
    loadStatus: "succeeded",
  };

  // fulfilled actions need meta.arg, the same as real thunk actions
  const updateFulfilled = (payload: typeof mockGames, forSquadId = squadId) => ({
    type: updateGamesForSquad.fulfilled.type,
    payload,
    meta: { arg: { squadId: forSquadId, games: payload } },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    describe("fetchGamesForSquad", () => {
      it("should handle fetchGamesForSquad.pending", () => {
        const state = reducer(initialState, {
          type: fetchGamesForSquad.pending.type,
          meta: { arg: squadId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedSquadId).toBe(squadId);
        expect(state.squadId).toBe("");
        expect(state.error).toBe("");
        expect(state.games).toEqual([]);
      });

      it("fetchGamesForSquad.pending does not change squadId or games from a previous load", () => {
        const state = reducer(loadedState, {
          type: fetchGamesForSquad.pending.type,
          meta: { arg: otherSquadId },
        });

        expect(state.loadStatus).toBe("loading");
        expect(state.requestedSquadId).toBe(otherSquadId);
        expect(state.squadId).toBe(squadId);
        expect(state.games).toEqual([mockGames[0]]);
      });

      it("fetchGamesForSquad.pending clears a previous error", () => {
        const state = reducer(
          { ...initialState, loadStatus: "failed", error: "old error" },
          { type: fetchGamesForSquad.pending.type, meta: { arg: squadId } },
        );

        expect(state.error).toBe("");
      });

      it("should handle fetchGamesForSquad.fulfilled", () => {
        const pendingState = reducer(initialState, {
          type: fetchGamesForSquad.pending.type,
          meta: { arg: squadId },
        });

        const state = reducer(pendingState, {
          type: fetchGamesForSquad.fulfilled.type,
          payload: mockGames,
          meta: { arg: squadId },
        });

        expect(state.loadStatus).toBe("succeeded");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedSquadId).toBe(squadId);
        expect(state.squadId).toBe(squadId);
        expect(state.error).toBe("");
        expect(state.games).toEqual(mockGames);
      });

      it("fetchGamesForSquad.fulfilled sets squadId for the current request", () => {
        const state = reducer(
          { ...loadedState, requestedSquadId: otherSquadId, loadStatus: "loading" },
          {
            type: fetchGamesForSquad.fulfilled.type,
            payload: [],
            meta: { arg: otherSquadId },
          },
        );

        expect(state.squadId).toBe(otherSquadId);
        expect(state.games).toEqual([]);
      });

      it("should handle fetchGamesForSquad.rejected", () => {
        const errorMessage = "DB error";

        const pendingState = reducer(initialState, {
          type: fetchGamesForSquad.pending.type,
          meta: { arg: squadId },
        });

        const state = reducer(pendingState, {
          type: fetchGamesForSquad.rejected.type,
          error: { message: errorMessage },
          meta: { arg: squadId },
        });

        expect(state.loadStatus).toBe("failed");
        expect(state.saveStatus).toBe("idle");
        expect(state.requestedSquadId).toBe(squadId);
        expect(state.squadId).toBe("");
        expect(state.error).toBe(errorMessage);
        expect(state.games).toEqual([]);
      });

      it("fetchGamesForSquad.rejected uses a default message when error has none", () => {
        const state = reducer(
          { ...initialState, requestedSquadId: squadId, loadStatus: "loading" },
          { type: fetchGamesForSquad.rejected.type, error: {}, meta: { arg: squadId } },
        );

        expect(state.error).toBe("Unknown error fetching games for squad");
      });

      it("fetchGamesForSquad.rejected keeps squadId and games from a previous load", () => {
        const state = reducer(
          { ...loadedState, requestedSquadId: otherSquadId, loadStatus: "loading" },
          {
            type: fetchGamesForSquad.rejected.type,
            error: { message: "DB error" },
            meta: { arg: otherSquadId },
          },
        );

        expect(state.loadStatus).toBe("failed");
        expect(state.error).toBe("DB error");
        expect(state.requestedSquadId).toBe(otherSquadId);
        expect(state.squadId).toBe(squadId);
        expect(state.games).toEqual([mockGames[0]]);
      });

      it("ignores a stale fetchGamesForSquad.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedSquadId: otherSquadId, loadStatus: "loading" },
          { type: fetchGamesForSquad.fulfilled.type, payload: [], meta: { arg: squadId } },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.squadId).toBe(squadId);
        expect(state.games).toEqual([mockGames[0]]);
      });

      it("ignores a stale fetchGamesForSquad.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedSquadId: otherSquadId, loadStatus: "loading" },
          {
            type: fetchGamesForSquad.rejected.type,
            error: { message: "DB error" },
            meta: { arg: squadId },
          },
        );

        expect(state.loadStatus).toBe("loading");
        expect(state.error).toBe("");
      });
    });

    describe("updateGamesForSquad", () => {
      it("should handle updateGamesForSquad.pending", () => {
        const state = reducer(initialState, {
          type: updateGamesForSquad.pending.type,
        });

        expect(state.saveStatus).toBe("saving");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe("");
        expect(state.games).toEqual([]);
      });

      it("updateGamesForSquad.pending clears a previous error", () => {
        const state = reducer(
          { ...loadedState, saveStatus: "failed", error: "old error" },
          { type: updateGamesForSquad.pending.type },
        );

        expect(state.saveStatus).toBe("saving");
        expect(state.error).toBe("");
      });

      it("updateGamesForSquad.fulfilled updates an existing game", () => {
        const updatedGame = { ...mockGames[0], score: mockGames[0].score + 10 };

        const state = reducer(loadedState, updateFulfilled([updatedGame]));

        expect(state.saveStatus).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.games).toHaveLength(1);
        expect(state.games[0]).toEqual(updatedGame);
      });

      it("updateGamesForSquad.fulfilled adds a new game", () => {
        const state = reducer(loadedState, updateFulfilled([mockGames[1]]));

        expect(state.saveStatus).toBe("succeeded");
        expect(state.games).toHaveLength(2);
        expect(state.games.find((g) => g.id === mockGames[0].id)).toEqual(mockGames[0]);
        expect(state.games.find((g) => g.id === mockGames[1].id)).toEqual(mockGames[1]);
      });

      it("updateGamesForSquad.fulfilled updates existing games and adds new games", () => {
        const updatedGame = { ...mockGames[0], score: mockGames[0].score + 10 };

        const state = reducer(loadedState, updateFulfilled([updatedGame, mockGames[1]]));

        expect(state.saveStatus).toBe("succeeded");
        expect(state.games).toHaveLength(2);
        expect(state.games.find((g) => g.id === updatedGame.id)).toEqual(updatedGame);
        expect(state.games.find((g) => g.id === mockGames[1].id)).toEqual(mockGames[1]);
      });

      it("updateGamesForSquad.fulfilled does not create duplicate games", () => {
        const updatedGame = { ...mockGames[0], score: mockGames[0].score + 10 };

        const state = reducer(loadedState, updateFulfilled([updatedGame]));

        expect(state.games.filter((g) => g.id === mockGames[0].id)).toHaveLength(1);
      });

      it("updateGamesForSquad.fulfilled does not change squadId or loadStatus", () => {
        const state = reducer(loadedState, updateFulfilled([mockGames[1]]));

        expect(state.squadId).toBe(squadId);
        expect(state.requestedSquadId).toBe(squadId);
        expect(state.loadStatus).toBe("succeeded");
      });

      it("updateGamesForSquad.fulfilled for a squad that is not loaded leaves games alone", () => {
        const state = reducer(loadedState, updateFulfilled([mockGames[1]], otherSquadId));

        expect(state.saveStatus).toBe("succeeded");
        expect(state.squadId).toBe(squadId);
        expect(state.games).toEqual([mockGames[0]]);
      });

      it("updateGamesForSquad.fulfilled with nothing loaded leaves games empty", () => {
        const state = reducer(initialState, updateFulfilled(mockGames));

        expect(state.saveStatus).toBe("succeeded");
        expect(state.games).toEqual([]);
      });

      it("should handle updateGamesForSquad.rejected", () => {
        const errorMessage = "DB error";

        const state = reducer(initialState, {
          type: updateGamesForSquad.rejected.type,
          error: { message: errorMessage },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.loadStatus).toBe("idle");
        expect(state.error).toBe(errorMessage);
        expect(state.games).toEqual([]);
      });

      it("updateGamesForSquad.rejected uses a default message when error has none", () => {
        const state = reducer(initialState, {
          type: updateGamesForSquad.rejected.type,
          error: {},
        });

        expect(state.error).toBe("Unknown error updating games for squad");
      });

      it("updateGamesForSquad.rejected keeps the loaded games and squadId", () => {
        const state = reducer(loadedState, {
          type: updateGamesForSquad.rejected.type,
          error: { message: "DB error" },
        });

        expect(state.saveStatus).toBe("failed");
        expect(state.squadId).toBe(squadId);
        expect(state.games).toEqual([mockGames[0]]);
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      gamesForSquad: {
        games: mockGames,
        requestedSquadId: otherSquadId,
        squadId: squadId,
        loadStatus: "succeeded" as ioStatusType,
        saveStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectGamesForSquad returns the games array", () => {
      expect(selectGamesForSquad(selectorState)).toBe(mockGames);
    });

    it("getGamesForSquadRequestedId returns the requested squad id", () => {
      expect(getGamesForSquadRequestedId(selectorState)).toBe(otherSquadId);
    });

    it("getGamesForSquadSquadId returns the loaded squad id", () => {
      expect(getGamesForSquadSquadId(selectorState)).toBe(squadId);
    });

    it("getGamesForSquadLoadStatus returns the load status", () => {
      expect(getGamesForSquadLoadStatus(selectorState)).toBe("succeeded");
    });

    it("getGamesForSquadSaveStatus returns the save status", () => {
      expect(getGamesForSquadSaveStatus(selectorState)).toBe("failed");
    });

    it("getGamesForSquadError returns the error", () => {
      expect(getGamesForSquadError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchGamesForSquad", () => {
    it("dispatches fulfilled when getAllGamesForSquad resolves", async () => {
      mockedGetAllGamesForSquad.mockResolvedValueOnce(mockGames);
      const store = makeStore();

      const action = await store.dispatch(fetchGamesForSquad(squadId) as any);

      expect(fetchGamesForSquad.fulfilled.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(mockedGetAllGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedGetAllGamesForSquad).toHaveBeenCalledWith(squadId);
      expect(state.requestedSquadId).toBe(squadId);
      expect(state.squadId).toBe(squadId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.games).toEqual(mockGames);
    });

    it("dispatches rejected when getAllGamesForSquad rejects", async () => {
      mockedGetAllGamesForSquad.mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      const action = await store.dispatch(fetchGamesForSquad(squadId) as any);

      expect(fetchGamesForSquad.rejected.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(state.requestedSquadId).toBe(squadId);
      expect(state.squadId).toBe("");
      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB error");
      expect(state.games).toEqual([]);
    });

    it("dispatches fulfilled when getAllGamesForSquad resolves an empty array", async () => {
      mockedGetAllGamesForSquad.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchGamesForSquad(squadId) as any);

      expect(fetchGamesForSquad.fulfilled.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(state.squadId).toBe(squadId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.games).toEqual([]);
    });

    it("loading a second squad updates squadId", async () => {
      mockedGetAllGamesForSquad
        .mockResolvedValueOnce(mockGames)
        .mockResolvedValueOnce([]);
      const store = makeStore();

      await store.dispatch(fetchGamesForSquad(squadId) as any);
      await store.dispatch(fetchGamesForSquad(otherSquadId) as any);

      const state = store.getState().gamesForSquad;

      expect(mockedGetAllGamesForSquad).toHaveBeenNthCalledWith(1, squadId);
      expect(mockedGetAllGamesForSquad).toHaveBeenNthCalledWith(2, otherSquadId);
      expect(state.requestedSquadId).toBe(otherSquadId);
      expect(state.squadId).toBe(otherSquadId);
      expect(state.games).toEqual([]);
    });

    it("a failed second load keeps the first squad's squadId and games", async () => {
      mockedGetAllGamesForSquad
        .mockResolvedValueOnce(mockGames)
        .mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore();

      await store.dispatch(fetchGamesForSquad(squadId) as any);
      await store.dispatch(fetchGamesForSquad(otherSquadId) as any);

      const state = store.getState().gamesForSquad;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("DB error");
      expect(state.requestedSquadId).toBe(otherSquadId);
      expect(state.squadId).toBe(squadId);
      expect(state.games).toEqual(mockGames);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: typeof mockGames) => void;
      const firstResponse = new Promise<typeof mockGames>((resolve) => {
        resolveFirst = resolve;
      });
      const secondGames = cloneDeep(mockGames);
      secondGames[0].score = secondGames[0].score + 10;

      mockedGetAllGamesForSquad
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(secondGames);
      const store = makeStore();

      // start squadId, then otherSquadId; otherSquadId finishes first
      const firstDispatch = store.dispatch(fetchGamesForSquad(squadId) as any);
      await store.dispatch(fetchGamesForSquad(otherSquadId) as any);

      // now the older squadId response arrives late
      resolveFirst(mockGames);
      await firstDispatch;

      const state = store.getState().gamesForSquad;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedSquadId).toBe(otherSquadId);
      expect(state.squadId).toBe(otherSquadId);
      expect(state.games).toEqual(secondGames);
    });
  });

  describe("Thunk tests updateGamesForSquad", () => {
    it("dispatches fulfilled when upsertGamesForSquad resolves", async () => {
      const updatedGame = { ...mockGames[0], score: mockGames[0].score + 10 };
      const toSave = [updatedGame, mockGames[1]];

      mockedUpsertGamesForSquad.mockResolvedValueOnce(toSave);
      const store = makeStore(loadedState);

      const action = await store.dispatch(
        updateGamesForSquad({ squadId, games: toSave }) as any,
      );

      expect(updateGamesForSquad.fulfilled.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(mockedUpsertGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedUpsertGamesForSquad).toHaveBeenCalledWith(squadId, toSave);
      expect(state.saveStatus).toBe("succeeded");
      expect(state.loadStatus).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.games).toHaveLength(2);
      expect(state.games.find((g) => g.id === updatedGame.id)).toEqual(updatedGame);
      expect(state.games.find((g) => g.id === mockGames[1].id)).toEqual(mockGames[1]);
    });

    it("save after load keeps squadId and merges games", async () => {
      const updatedGame = { ...mockGames[0], score: mockGames[0].score + 10 };

      mockedGetAllGamesForSquad.mockResolvedValueOnce(mockGames);
      mockedUpsertGamesForSquad.mockResolvedValueOnce([updatedGame]);
      const store = makeStore();

      await store.dispatch(fetchGamesForSquad(squadId) as any);
      await store.dispatch(updateGamesForSquad({ squadId, games: [updatedGame] }) as any);

      const state = store.getState().gamesForSquad;

      expect(state.squadId).toBe(squadId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("succeeded");
      expect(state.games).toHaveLength(mockGames.length);
      expect(state.games.find((g) => g.id === updatedGame.id)).toEqual(updatedGame);
    });

    it("a save that finishes after switching squads does not touch the new squad's games", async () => {
      let resolveSave!: (value: typeof mockGames) => void;
      const saveResponse = new Promise<typeof mockGames>((resolve) => {
        resolveSave = resolve;
      });
      const otherSquadGames = [mockGames[1]];

      mockedUpsertGamesForSquad.mockReturnValueOnce(saveResponse);
      mockedGetAllGamesForSquad.mockResolvedValueOnce(otherSquadGames);
      const store = makeStore(loadedState);

      // start saving squadId, then switch to otherSquadId before the save returns
      const saveDispatch = store.dispatch(
        updateGamesForSquad({ squadId, games: [mockGames[0]] }) as any,
      );
      await store.dispatch(fetchGamesForSquad(otherSquadId) as any);

      resolveSave([mockGames[0]]);
      await saveDispatch;

      const state = store.getState().gamesForSquad;

      expect(state.saveStatus).toBe("succeeded");
      expect(state.squadId).toBe(otherSquadId);
      expect(state.games).toEqual(otherSquadGames);
    });

    it("dispatches rejected when upsertGamesForSquad resolves undefined", async () => {
      mockedUpsertGamesForSquad.mockResolvedValueOnce(undefined as any);
      const store = makeStore(loadedState);

      const action = await store.dispatch(
        updateGamesForSquad({ squadId, games: mockGames }) as any,
      );

      expect(updateGamesForSquad.rejected.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(state.saveStatus).toBe("failed");
      expect(state.error).toBe("Failed to update games for squad");
      expect(state.games).toEqual([mockGames[0]]);
    });

    it("dispatches rejected when upsertGamesForSquad rejects", async () => {
      mockedUpsertGamesForSquad.mockRejectedValueOnce(new Error("DB error"));
      const store = makeStore(loadedState);

      const action = await store.dispatch(
        updateGamesForSquad({ squadId, games: mockGames }) as any,
      );

      expect(updateGamesForSquad.rejected.match(action)).toBe(true);

      const state = store.getState().gamesForSquad;

      expect(mockedUpsertGamesForSquad).toHaveBeenCalledWith(squadId, mockGames);
      expect(state.saveStatus).toBe("failed");
      expect(state.loadStatus).toBe("succeeded");
      expect(state.error).toBe("DB error");
      expect(state.games).toEqual([mockGames[0]]);
    });
  });
});
