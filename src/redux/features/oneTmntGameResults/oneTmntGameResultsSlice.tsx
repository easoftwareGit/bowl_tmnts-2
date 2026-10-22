import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";
import type { tmntGameResult } from "@/lib/types/resultsTypes";

export interface oneTmntGameResultsState {
  games: tmntGameResult[];
  requestedTmntId: string;
  tmntId: string;
  loadStatus: ioStatusType;
  error: string | undefined;
}

const initialState: oneTmntGameResultsState = {
  games: [],
  requestedTmntId: "",
  tmntId: "",
  loadStatus: "idle",
  error: "",
};

export const fetchOneTmntGameResults = createAsyncThunk(
  "oneTmntGameResults/fetchOneTmntGameResults",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const games = await getGameResultsForTmnt(tmntId);
    if (!games) {
      throw new Error("Error fetching game results for tournament");
    }
    return games;
  },
);

export const oneTmntGameResultsSlice = createSlice({
  name: "oneTmntGameResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOneTmntGameResults.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedTmntId = action.meta.arg;
        state.error = "";
      })
      .addCase(fetchOneTmntGameResults.fulfilled, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale response
        state.loadStatus = "succeeded";
        state.tmntId = action.meta.arg;
        state.games = action.payload;
      })
      .addCase(fetchOneTmntGameResults.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale failure
        state.loadStatus = "failed";
        state.error = action.error.message ?? "Unknown error fetching games";
      });
  },
});

export const selectOneTmntGameResults = (state: RootState) =>
  state.oneTmntGameResults.games;
export const getOneTmntGameResultsRequestedTmntId = (state: RootState) =>
  state.oneTmntGameResults.requestedTmntId;
export const getOneTmntGameResultsTmntId = (state: RootState) =>
  state.oneTmntGameResults.tmntId;
export const getOneTmntGameResultsLoadStatus = (state: RootState) =>
  state.oneTmntGameResults.loadStatus;
export const getOneTmntGameResultsError = (state: RootState) =>
  state.oneTmntGameResults.error;

export default oneTmntGameResultsSlice.reducer;
