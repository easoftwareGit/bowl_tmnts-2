import reducer, {
  fetchGamesForSquad,
  updateGamesForSquad,
  gamesForSquadState,
  getGamesForSquadRequestedId,
} from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import {
  getAllGamesForSquad,
  upsertGamesForSquad,
} from "@/lib/db/games/dbGames";
import { configureStore } from "@reduxjs/toolkit";
import { mockGames } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { RootState } from "@/redux/store";

jest.mock("@/lib/db/games/dbGames");

const mockedGetAllGamesForSquad = jest.mocked(getAllGamesForSquad);
const mockedUpsertGamesForSquad = jest.mocked(upsertGamesForSquad);

describe("gamesForSquadSlice reducer + thunk", () => {
  const initialState: gamesForSquadState = {
    games: [],
    requestedSquadId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  const squadId = "sqd_123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(
        initialState,
      );
    });

    it("should handle fetchGamesForSquad.pending", () => {
      const state = reducer(initialState, {
        type: fetchGamesForSquad.pending.type,
        meta: {
          arg: squadId,
        },
      });

      expect(state.loadStatus).toBe("loading");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.games).toEqual([]);
      expect(state.requestedSquadId).toBe(squadId);
    });

    it("should handle fetchGamesForSquad.fulfilled", () => {
      const state = reducer(initialState, {
        type: fetchGamesForSquad.fulfilled.type,
        payload: mockGames,
      });

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.games).toEqual(mockGames);
      expect(state.requestedSquadId).toBe("");
    });

    it("should handle fetchGamesForSquad.rejected", () => {
      const errorMessage = "DB error";

      const state = reducer(initialState, {
        type: fetchGamesForSquad.rejected.type,
        error: { message: errorMessage },
      });

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe(errorMessage);
      expect(state.games).toEqual([]);
      expect(state.requestedSquadId).toBe("");
    });

    it("should handle updateGamesForSquad.pending", () => {
      const state = reducer(initialState, {
        type: updateGamesForSquad.pending.type,
      });

      expect(state.saveStatus).toBe("saving");
      expect(state.loadStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.games).toEqual([]);
      expect(state.requestedSquadId).toBe("");
    });

    it("should handle updateGamesForSquad.fulfilled", () => {
      const state = reducer(initialState, {
        type: updateGamesForSquad.fulfilled.type,
        payload: mockGames,
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.loadStatus).toBe("idle");
      expect(state.error).toBe("");
      expect(state.games).toEqual(mockGames);
      expect(state.requestedSquadId).toBe("");
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
      expect(state.requestedSquadId).toBe("");
    });

    it("should update an existing game in state", () => {
      const existingGame = {
        ...mockGames[0],
        score: 100,
      };

      const updatedGame = {
        ...mockGames[0],
        score: 250,
      };

      const stateWithGames: gamesForSquadState = {
        games: [existingGame],
        requestedSquadId: "",
        loadStatus: "idle",
        saveStatus: "idle",
        error: "",
      };

      const state = reducer(stateWithGames, {
        type: updateGamesForSquad.fulfilled.type,
        payload: [updatedGame],
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.games).toHaveLength(1);
      expect(state.games[0].score).toBe(250);
    });

    it("should add a new game to state", () => {
      const existingGame = mockGames[0];
      const newGame = mockGames[1];

      const stateWithGames: gamesForSquadState = {
        games: [existingGame],
        requestedSquadId: "",
        loadStatus: "idle",
        saveStatus: "idle",
        error: "",
      };

      const state = reducer(stateWithGames, {
        type: updateGamesForSquad.fulfilled.type,
        payload: [newGame],
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.games).toHaveLength(2);

      expect(
        state.games.find((g) => g.id === existingGame.id),
      ).toEqual(existingGame);

      expect(
        state.games.find((g) => g.id === newGame.id),
      ).toEqual(newGame);
    });

    it("should update existing games and add new games", () => {
      const existingGame = {
        ...mockGames[0],
        score: 100,
      };

      const updatedGame = {
        ...mockGames[0],
        score: 250,
      };

      const newGame = mockGames[1];

      const stateWithGames: gamesForSquadState = {
        games: [existingGame],
        requestedSquadId: "",
        loadStatus: "idle",
        saveStatus: "idle",
        error: "",
      };

      const state = reducer(stateWithGames, {
        type: updateGamesForSquad.fulfilled.type,
        payload: [updatedGame, newGame],
      });

      expect(state.saveStatus).toBe("succeeded");
      expect(state.games).toHaveLength(2);

      const updated = state.games.find(
        (g) => g.id === updatedGame.id,
      );

      const inserted = state.games.find(
        (g) => g.id === newGame.id,
      );

      expect(updated?.score).toBe(250);
      expect(inserted).toEqual(newGame);
    });

    it("should not create duplicate games when updating an existing game", () => {
      const existingGame = mockGames[0];

      const updatedGame = {
        ...existingGame,
        score: existingGame.score + 10,
      };

      const stateWithGames: gamesForSquadState = {
        games: [existingGame],
        requestedSquadId: "",
        loadStatus: "idle",
        saveStatus: "idle",
        error: "",
      };

      const state = reducer(stateWithGames, {
        type: updateGamesForSquad.fulfilled.type,
        payload: [updatedGame],
      });

      expect(
        state.games.filter((g) => g.id === existingGame.id),
      ).toHaveLength(1);
    });
  });

  describe("selector tests", () => {
    it("should return the requested squad id", () => {
      const state = {
        gamesForSquad: {
          ...initialState,
          requestedSquadId: squadId,
        },
      } as RootState;

      const requestedSquadId = getGamesForSquadRequestedId(state);

      expect(requestedSquadId).toBe(squadId);
    });
  });

  describe("Thunk tests fetchGamesForSquad", () => {
    it("dispatches fulfilled when getAllGamesForSquad resolves", async () => {
      mockedGetAllGamesForSquad.mockResolvedValueOnce(mockGames);

      const store = configureStore({
        reducer: { gamesForSquad: reducer },
      });

      await store.dispatch(fetchGamesForSquad(squadId));

      const state = store.getState().gamesForSquad;

      expect(mockedGetAllGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedGetAllGamesForSquad).toHaveBeenCalledWith(squadId);

      expect(state.loadStatus).toBe("succeeded");
      expect(state.saveStatus).toBe("idle");
      expect(state.games).toEqual(mockGames);
      expect(state.error).toBe("");
      expect(state.requestedSquadId).toBe("sqd_123");
    });

    it("dispatches rejected when getAllGamesForSquad rejects", async () => {
      mockedGetAllGamesForSquad.mockRejectedValueOnce(
        new Error("DB error"),
      );

      const store = configureStore({
        reducer: { gamesForSquad: reducer },
      });

      await store.dispatch(fetchGamesForSquad(squadId));

      const state = store.getState().gamesForSquad;

      expect(mockedGetAllGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedGetAllGamesForSquad).toHaveBeenCalledWith(squadId);

      expect(state.loadStatus).toBe("failed");
      expect(state.saveStatus).toBe("idle");
      expect(state.error).toBe("DB error");
      expect(state.games).toEqual([]);
      expect(state.requestedSquadId).toBe("sqd_123");
    });
  });

  describe("Thunk tests updateGamesForSquad", () => {
    it("dispatches fulfilled when updateGamesForSquad resolves", async () => {
      mockedUpsertGamesForSquad.mockResolvedValueOnce(mockGames);

      const store = configureStore({
        reducer: { gamesForSquad: reducer },
      });

      await store.dispatch(
        updateGamesForSquad({
          squadId,
          games: mockGames,
        }),
      );

      const state = store.getState().gamesForSquad;

      expect(mockedUpsertGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedUpsertGamesForSquad).toHaveBeenCalledWith(
        squadId,
        mockGames,
      );

      expect(state.saveStatus).toBe("succeeded");
      expect(state.loadStatus).toBe("idle");
      expect(state.games).toEqual(mockGames);
      expect(state.error).toBe("");
      expect(state.requestedSquadId).toBe("");
    });

    it("dispatches rejected when updateGamesForSquad rejects", async () => {
      mockedUpsertGamesForSquad.mockRejectedValueOnce(
        new Error("DB error"),
      );

      const store = configureStore({
        reducer: { gamesForSquad: reducer },
      });

      await store.dispatch(
        updateGamesForSquad({
          squadId,
          games: mockGames,
        }),
      );

      const state = store.getState().gamesForSquad;

      expect(mockedUpsertGamesForSquad).toHaveBeenCalledTimes(1);
      expect(mockedUpsertGamesForSquad).toHaveBeenCalledWith(
        squadId,
        mockGames,
      );

      expect(state.saveStatus).toBe("failed");
      expect(state.loadStatus).toBe("idle");
      expect(state.error).toBe("DB error");
      expect(state.games).toEqual([]);
      expect(state.requestedSquadId).toBe("");
    });
  });
});
