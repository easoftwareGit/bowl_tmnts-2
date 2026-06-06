import reducer, {
  fetchGamesForSquad,
  updateGamesForSquad,
  gamesForSquadState,
} from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import {
  getAllGamesForSquad,
  upsertGamesForSquad,
} from "@/lib/db/games/dbGames";
import { configureStore } from "@reduxjs/toolkit";
import { mockGames } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("@/lib/db/games/dbGames", () => ({
  getAllGamesForSquad: jest.fn(),
  upsertGamesForSquad: jest.fn(),
}));

describe("gamesForSquadSlice reducer + thunk", () => {

  const initialState: gamesForSquadState = {
    games: [],
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  const squadId = "sqd_123";

  //
  // --- Reducer unit tests ---
  //

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
  });

  it("should handle fetchGamesForSquad.pending", () => {

    const state = reducer(initialState, {
      type: fetchGamesForSquad.pending.type,
    });

    expect(state).toEqual({
      games: [],
      loadStatus: "loading",
      saveStatus: "idle",
      error: "",
    });
  });

  it("should handle fetchGamesForSquad.fulfilled", () => {

    const state = reducer(initialState, {
      type: fetchGamesForSquad.fulfilled.type,
      payload: mockGames,
    });

    expect(state).toEqual({
      games: mockGames,
      loadStatus: "succeeded",
      saveStatus: "idle",
      error: "",
    });
  });

  it("should handle fetchGamesForSquad.rejected", () => {

    const errorMessage = "DB error";

    const state = reducer(initialState, {
      type: fetchGamesForSquad.rejected.type,
      error: { message: errorMessage },
    });

    expect(state).toEqual({
      games: [],
      loadStatus: "failed",
      saveStatus: "idle",
      error: errorMessage,
    });
  });

  it("should handle updateGamesForSquad.pending", () => {

    const state = reducer(initialState, {
      type: updateGamesForSquad.pending.type,
    });

    expect(state).toEqual({
      games: [],
      loadStatus: "idle",
      saveStatus: "saving",
      error: "",
    });
  });

  it("should handle updateGamesForSquad.fulfilled", () => {

    const state = reducer(initialState, {
      type: updateGamesForSquad.fulfilled.type,
      payload: mockGames,
    });

    expect(state).toEqual({
      games: mockGames,
      loadStatus: "idle",
      saveStatus: "succeeded",
      error: "",
    });
  });

  it("should handle updateGamesForSquad.rejected", () => {

    const errorMessage = "DB error";

    const state = reducer(initialState, {
      type: updateGamesForSquad.rejected.type,
      error: { message: errorMessage },
    });

    expect(state).toEqual({
      games: [],
      loadStatus: "idle",
      saveStatus: "failed",
      error: errorMessage,
    });
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
      state.games.find((g) => g.id === existingGame.id)
    ).toEqual(existingGame);

    expect(
      state.games.find((g) => g.id === newGame.id)
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
      (g) => g.id === updatedGame.id
    );

    const inserted = state.games.find(
      (g) => g.id === newGame.id
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
      loadStatus: "idle",
      saveStatus: "idle",
      error: "",
    };

    const state = reducer(stateWithGames, {
      type: updateGamesForSquad.fulfilled.type,
      payload: [updatedGame],
    });

    expect(
      state.games.filter(g => g.id === existingGame.id)
    ).toHaveLength(1);
  });

  //
  // --- Thunk tests (fetch) ---
  //

  it("dispatches fulfilled when getAllGamesForSquad resolves", async () => {

    (getAllGamesForSquad as jest.Mock).mockResolvedValueOnce(mockGames);

    const store = configureStore({
      reducer: { gamesForSquad: reducer },
    });

    await store.dispatch(fetchGamesForSquad(squadId) as any);

    const state = store.getState().gamesForSquad;

    expect(getAllGamesForSquad).toHaveBeenCalledWith(squadId);

    expect(state.loadStatus).toBe("succeeded");
    expect(state.saveStatus).toBe("idle");
    expect(state.games).toEqual(mockGames);
    expect(state.error).toBe("");
  });

  it("dispatches rejected when getAllGamesForSquad rejects", async () => {

    (getAllGamesForSquad as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    const store = configureStore({
      reducer: { gamesForSquad: reducer },
    });

    await store.dispatch(fetchGamesForSquad(squadId) as any);

    const state = store.getState().gamesForSquad;

    expect(getAllGamesForSquad).toHaveBeenCalledWith(squadId);

    expect(state.loadStatus).toBe("failed");
    expect(state.saveStatus).toBe("idle");
    expect(state.error).toBe("DB error");
    expect(state.games).toEqual([]);
  });

  //
  // --- Thunk tests (update) ---
  //

  it("dispatches fulfilled when updateGamesForSquad resolves", async () => {

    (upsertGamesForSquad as jest.Mock).mockResolvedValueOnce(mockGames);

    const store = configureStore({
      reducer: { gamesForSquad: reducer },
    });

    await store.dispatch(
      updateGamesForSquad({
        squadId,
        games: mockGames,
      }) as any
    );

    const state = store.getState().gamesForSquad;

    expect(upsertGamesForSquad).toHaveBeenCalledWith(
      squadId,
      mockGames
    );

    expect(state.saveStatus).toBe("succeeded");
    expect(state.loadStatus).toBe("idle");
    expect(state.games).toEqual(mockGames);
    expect(state.error).toBe("");
  });

  it("dispatches rejected when updateGamesForSquad rejects", async () => {

    (upsertGamesForSquad as jest.Mock).mockRejectedValueOnce(
      new Error("DB error")
    );

    const store = configureStore({
      reducer: { gamesForSquad: reducer },
    });

    await store.dispatch(
      updateGamesForSquad({
        squadId,
        games: mockGames,
      }) as any
    );

    const state = store.getState().gamesForSquad;

    expect(upsertGamesForSquad).toHaveBeenCalledWith(
      squadId,
      mockGames
    );

    expect(state.saveStatus).toBe("failed");
    expect(state.loadStatus).toBe("idle");
    expect(state.error).toBe("DB error");
    expect(state.games).toEqual([]);
  });

});