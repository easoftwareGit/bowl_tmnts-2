import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getTmntYears } from "@/lib/db/tmnts/dbTmnts";
import type { YearObj } from "@/lib/types/types";

export interface tmntYearsSliceState {
  data: YearObj[];
  status: loadStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: tmntYearsSliceState = {
  data: [],
  status: "idle",
  error: "",
};

// get list of years from today and before
export const fetchTmntYears = createAsyncThunk(
  "tmntYears/fetchTmntYears",
  async () => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    return getTmntYears();
  },
);

export const tmntYearsSlice = createSlice({
  name: "tmntYears",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTmntYears.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchTmntYears.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = "";
      })
      .addCase(fetchTmntYears.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error fetching tmnt years";
      });
  },
});

export const selectTmntYears = (state: RootState) => state.tmntYears.data;
export const getTmntYearsStatus = (state: RootState) => state.tmntYears.status;
export const getTmntYearsError = (state: RootState) => state.tmntYears.error;

export default tmntYearsSlice.reducer;
