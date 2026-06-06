import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getAllGamesForSquad, upsertGamesForSquad } from "@/lib/db/games/dbGames";
import type { gameType } from "@/lib/types/types";

export interface gamesForSquadState {
  games: gameType[];
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string;
}

const initialState: gamesForSquadState = {
  games: [],
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

export type upsertSquadGamesType = {
  squadId: string;
  games: gameType[];
}

export const fetchGamesForSquad = createAsyncThunk(
  "gamesForSquad/fetchGamesForSquad",
  async (squadId: string) => {
    const games = await getAllGamesForSquad(squadId);
    if (!games) throw new Error("Failed to fetch games for squad");
    return games;
  }
)

export const updateGamesForSquad = createAsyncThunk(
  "gamesForSquad/updateGamesForSquad",
  async ({ squadId, games }: upsertSquadGamesType) => {
    const updatedGames = await upsertGamesForSquad(squadId, games);
    if (!updatedGames) throw new Error("Failed to update games for squad");
    return updatedGames;
  }
)

export const gamesForSquadSlice = createSlice({
  name: "gamesForSquad",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGamesForSquad.pending, (state: gamesForSquadState) => {
        state.loadStatus = "loading";
      })
      .addCase(fetchGamesForSquad.fulfilled, (state: gamesForSquadState, action: PayloadAction<gameType[]>) => {
        state.loadStatus = "succeeded";
        state.games = action.payload;
      })
      .addCase(fetchGamesForSquad.rejected, (state: gamesForSquadState, action) => {
        state.loadStatus = "failed";        
        state.error =
          (action.payload as string) ||
           action.error.message ||
          "Unknown error fetching games for squad";
      })
      .addCase(updateGamesForSquad.pending, (state: gamesForSquadState) => {
        state.saveStatus = "saving";
      })
      .addCase(updateGamesForSquad.fulfilled, (state: gamesForSquadState, action: PayloadAction<gameType[]>) => {
        const updatedGames = action.payload;

        // update games in state with updated games from payload
        updatedGames.forEach((updatedGame) => {
          const index = state.games.findIndex(
            (game) => game.id === updatedGame.id,
          );

          if (index >= 0) {
            // edited existing game
            state.games[index] = updatedGame;
          } else {
            // newly created game
            state.games.push(updatedGame);
          }
        });

        state.saveStatus = "succeeded";        
      })
      .addCase(updateGamesForSquad.rejected, (state: gamesForSquadState, action) => {
        state.saveStatus = "failed";        
        state.error =
          (action.payload as string) ||
           action.error.message ||
          "Unknown error updating games for squad";
      });
  },
});

export const selectGamesForSquad = (state: RootState) => state.gamesForSquad;

export const getGamesForSquadLoadStatus = (state: RootState) =>
  state.gamesForSquad.loadStatus;
export const getGamesForSquadSaveStatus = (state: RootState) =>
  state.gamesForSquad.saveStatus;
export const getGamesForSquadError = (state: RootState) =>
  state.gamesForSquad.error;
export default gamesForSquadSlice.reducer;