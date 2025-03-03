import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getGameResultsForDiv } from "@/lib/db/results/dbResults";
import { cloneDeep } from "lodash";

export interface oneDivGameResultsState {
  games: any[];
  divId: string;
  loadStatus: ioStatusType;
  error: string | undefined;
}

const initialState: oneDivGameResultsState = {
  games: [],
  divId: '',
  loadStatus: "idle",
  error: '',
};

export const fetchOneDivGameResults = createAsyncThunk(
  "oneDivGameResultsState/fetchOneDivGameResults",
  async (divId: string, { getState }) => {

    const state = getState() as RootState;
    const currentDivId = state.oneDivGameResults.divId;
    if (currentDivId === divId) {
      // Return the current state if the div ID matches the one being fetched 
      return state.oneDivGameResults.games;
    }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const gotData = await getGameResultsForDiv(divId); 
    if (!gotData) {
      return null;
    }
    const gameData = cloneDeep(gotData);
    return gameData as any[];
  }
)

export const oneDivGameResultsSlice = createSlice({
  name: "oneDivGameResults",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOneDivGameResults.pending, (state) => {
      state.loadStatus = "loading";
    });
    builder.addCase(fetchOneDivGameResults.fulfilled, (state, action: PayloadAction<any[] | null>) => {
      state.loadStatus = "succeeded";
      state.games = action.payload as any[];
    });
    builder.addCase(fetchOneDivGameResults.rejected, (state, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export const selectOneDivGameResults = (state: RootState) => state.oneDivGameResults.games;
export const getOneDivGameResultsLoadStatus = (state: RootState) => state.oneDivGameResults.loadStatus
export const getOneDivGameResultsError = (state: RootState) => state.oneDivGameResults.error

export default oneDivGameResultsSlice.reducer;