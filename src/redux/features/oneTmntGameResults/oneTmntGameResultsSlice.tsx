import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";
import { tmntGameResult } from "@/lib/types/resultsTypes";

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
  async (tmntId: string): Promise<tmntGameResult[] | null> => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getGameResultsForTmnt(tmntId);
  },
);

export const oneTmntGameResultsSlice = createSlice({
  name: "oneTmntGameResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOneTmntGameResults.pending, (state, action) => {
      state.loadStatus = "loading";
      state.requestedTmntId = action.meta.arg;
      state.error = "";
    });
    builder.addCase(
      fetchOneTmntGameResults.fulfilled,
      (state, action: PayloadAction<any[] | null>) => {
        state.loadStatus = "succeeded";
        state.tmntId = state.requestedTmntId;
        state.games = action.payload as any[];
      },
    );
    builder.addCase(fetchOneTmntGameResults.rejected, (state, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
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
