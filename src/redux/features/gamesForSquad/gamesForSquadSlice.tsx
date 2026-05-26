import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getAllGamesForSquad, upsertAllGamesForSquad } from "@/lib/db/games/dbGames";
import type { gameType } from "@/lib/types/types";

export interface gamesForSquadState {
  games: gameType[];
  status: ioStatusType;
  error: string;
}

const initialState: gamesForSquadState = {
  games: [],
  status: "idle",
  error: "",
};

export type upsetSquadGamesType = {
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
  async ({ squadId, games }: upsetSquadGamesType) => {
    const updatedGames = await upsertAllGamesForSquad(squadId, games);
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
        state.status = "loading";
      })
      .addCase(fetchGamesForSquad.fulfilled, (state: gamesForSquadState, action: PayloadAction<gameType[]>) => {
        state.status = "succeeded";
        state.games = action.payload;
      })
      .addCase(fetchGamesForSquad.rejected, (state: gamesForSquadState, action) => {
        state.status = "failed";        
        state.error =
          (action.payload as string) ||
           action.error.message ||
          "Unknown error fetching games for squad";
      })
      .addCase(updateGamesForSquad.pending, (state: gamesForSquadState) => {
        state.status = "loading";
      })
      .addCase(updateGamesForSquad.fulfilled, (state: gamesForSquadState, action: PayloadAction<gameType[]>) => {
        state.status = "succeeded";
        state.games = action.payload;
      })
      .addCase(updateGamesForSquad.rejected, (state: gamesForSquadState, action) => {
        state.status = "failed";        
        state.error =
          (action.payload as string) ||
           action.error.message ||
          "Unknown error updating games for squad";
      });
  },
});

export const selectGamesForSquad = (state: RootState) => state.gamesForSquad;

export const getGamesForSquadStatus = (state: RootState) =>
  state.gamesForSquad.status;
export const getGamesForSquadError = (state: RootState) =>
  state.gamesForSquad.error;
export default gamesForSquadSlice.reducer;