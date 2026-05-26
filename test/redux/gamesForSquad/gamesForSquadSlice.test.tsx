import reducer, {
  fetchGamesForSquad,
  updateGamesForSquad,
  gamesForSquadState,
} from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import {
  getAllGamesForSquad,
  upsertAllGamesForSquad,
} from "@/lib/db/games/dbGames";
import { configureStore } from "@reduxjs/toolkit";
import { mockGames } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("@/lib/db/games/dbGames", () => ({
  getAllGamesForSquad: jest.fn(),
  upsertAllGamesForSquad: jest.fn(),
}));

describe("gamesForSquadSlice reducer + thunk", () => {

  const initialState: gamesForSquadState = {
    games: [],
    status: "idle",
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
      status: "loading",
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
      status: "succeeded",
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
      status: "failed",
      error: errorMessage,
    });
  });

  it("should handle updateGamesForSquad.pending", () => {

    const state = reducer(initialState, {
      type: updateGamesForSquad.pending.type,
    });

    expect(state).toEqual({
      games: [],
      status: "loading",
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
      status: "succeeded",
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
      status: "failed",
      error: errorMessage,
    });
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

    expect(state.status).toBe("succeeded");
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

    expect(state.status).toBe("failed");
    expect(state.error).toBe("DB error");
    expect(state.games).toEqual([]);
  });

  //
  // --- Thunk tests (update) ---
  //

  it("dispatches fulfilled when updateGamesForSquad resolves", async () => {

    (upsertAllGamesForSquad as jest.Mock).mockResolvedValueOnce(mockGames);

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

    expect(upsertAllGamesForSquad).toHaveBeenCalledWith(
      squadId,
      mockGames
    );

    expect(state.status).toBe("succeeded");
    expect(state.games).toEqual(mockGames);
    expect(state.error).toBe("");
  });

  it("dispatches rejected when updateGamesForSquad rejects", async () => {

    (upsertAllGamesForSquad as jest.Mock).mockRejectedValueOnce(
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

    expect(upsertAllGamesForSquad).toHaveBeenCalledWith(
      squadId,
      mockGames
    );

    expect(state.status).toBe("failed");
    expect(state.error).toBe("DB error");
    expect(state.games).toEqual([]);
  });

});