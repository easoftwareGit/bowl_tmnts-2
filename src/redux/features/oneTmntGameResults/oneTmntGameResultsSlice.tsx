import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";
import { cloneDeep } from "lodash";

export interface oneTmntGameResultsState {
  games: any[];
  tmntId: string;
  loadStatus: ioStatusType;
  error: string | undefined;
}

const initialState: oneTmntGameResultsState = {
  games: [],
  tmntId: '',
  loadStatus: "idle",
  error: '',
};

export const fetchOneTmntGameResults = createAsyncThunk(
  "oneTmntGameResults/fetchOneTmntGameResults",
  async (tmntId: string, { getState }) => {

    const state = getState() as RootState;
    const currentTmntId = state.oneTmntGameResults.tmntId;
    if (currentTmntId === tmntId) {
      // Return the current state if the tournament ID matches the one being fetched 
      return state.oneTmntGameResults.games;
    }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const gotData = await getGameResultsForTmnt(tmntId); 
    if (!gotData) {
      return null;
    }
    const gameData = cloneDeep(gotData);
    return gameData as any[];
  }
)

export const oneTmntGameResultsSlice = createSlice({
  name: "oneTmntGameResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOneTmntGameResults.pending, (state) => {
      state.loadStatus = "loading";
    });
    builder.addCase(fetchOneTmntGameResults.fulfilled, (state, action: PayloadAction<any[] | null>) => {
      state.loadStatus = "succeeded";
      state.games = action.payload as any[];
    });
    builder.addCase(fetchOneTmntGameResults.rejected, (state, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export const selectOneTmntGameResults = (state: RootState) => state.oneTmntGameResults.games;
export const getOneTmntGameResultsLoadStatus = (state: RootState) => state.oneTmntGameResults.loadStatus
export const getOneTmntGameResultsError = (state: RootState) => state.oneTmntGameResults.error

export default oneTmntGameResultsSlice.reducer;