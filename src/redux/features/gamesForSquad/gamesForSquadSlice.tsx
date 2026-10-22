import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getAllGamesForSquad, upsertGamesForSquad } from "@/lib/db/games/dbGames";
import type { gameType } from "@/lib/types/types";

export interface gamesForSquadState {
  games: gameType[];
  requestedSquadId: string;
  squadId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string;
}

const initialState: gamesForSquadState = {
  games: [],
  requestedSquadId: "",
  squadId: "",
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

export type upsertSquadGamesType = {
  squadId: string;
  games: gameType[];
};

export const fetchGamesForSquad = createAsyncThunk(
  "gamesForSquad/fetchGamesForSquad",
  async (squadId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    return getAllGamesForSquad(squadId);
  },
);

export const updateGamesForSquad = createAsyncThunk(
  "gamesForSquad/updateGamesForSquad",
  async ({ squadId, games }: upsertSquadGamesType) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const updatedGames = await upsertGamesForSquad(squadId, games);
    if (!updatedGames) {
      throw new Error("Failed to update games for squad");
    }
    return updatedGames;
  },
);

export const gamesForSquadSlice = createSlice({
  name: "gamesForSquad",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesForSquad.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedSquadId = action.meta.arg;
        state.error = "";
      })
      .addCase(fetchGamesForSquad.fulfilled, (state, action) => {
        if (action.meta.arg !== state.requestedSquadId) return; // stale response
        state.loadStatus = "succeeded";
        state.squadId = action.meta.arg;
        state.games = action.payload;
      })
      .addCase(fetchGamesForSquad.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedSquadId) return; // stale failure
        state.loadStatus = "failed";
        state.error =
          action.error.message ?? "Unknown error fetching games for squad";
      });
    builder
      .addCase(updateGamesForSquad.pending, (state) => {
        state.saveStatus = "saving";
        state.error = "";
      })
      .addCase(updateGamesForSquad.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";

        // the save succeeded, but if a different squad is loaded now,
        // these games don't belong in state.games
        if (action.meta.arg.squadId !== state.squadId) return;

        // update games in state with updated games from payload
        action.payload.forEach((updatedGame) => {
          const index = state.games.findIndex((game) => game.id === updatedGame.id);
          if (index >= 0) {
            // edited existing game
            state.games[index] = updatedGame;
          } else {
            // newly created game
            state.games.push(updatedGame);
          }
        });
      })
      .addCase(updateGamesForSquad.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error =
          action.error.message ?? "Unknown error updating games for squad";
      });
  },
});

export const selectGamesForSquad = (state: RootState) => state.gamesForSquad.games;

export const getGamesForSquadRequestedId = (state: RootState) =>
  state.gamesForSquad.requestedSquadId;
export const getGamesForSquadSquadId = (state: RootState) =>
  state.gamesForSquad.squadId;
export const getGamesForSquadLoadStatus = (state: RootState) =>
  state.gamesForSquad.loadStatus;
export const getGamesForSquadSaveStatus = (state: RootState) =>
  state.gamesForSquad.saveStatus;
export const getGamesForSquadError = (state: RootState) =>
  state.gamesForSquad.error;

export default gamesForSquadSlice.reducer;
