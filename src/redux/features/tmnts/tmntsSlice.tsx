import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getTmnts } from "@/lib/db/tmnts/dbTmnts";
import type { tmntsListType } from "@/lib/types/types";

export interface TmntSliceState {
  tmnts: tmntsListType[];
  // year of the most recent fetch: 'XXXX' for a year, '' for upcoming,
  // null when nothing has been requested (or after clearTmnts)
  requestedYear: string | null;
  // year the loaded tmnts belong to, with the same meaning as requestedYear
  year: string | null;
  status: loadStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: TmntSliceState = {
  tmnts: [],
  requestedYear: null,
  year: null,
  status: "idle",
  error: "",
};

/**
 * gets tmnts with results for a year or all upcoming tmnts
 *
 * @param {year: string} - 'XXXX' get tmnts for year 'XXXX'; '' get tmnts upcoming
 * @return {tmntsListType[]} - array of tmnts from database
 */
export const fetchTmnts = createAsyncThunk(
  "tmnts/fetchTmnts",
  async (year: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getTmnts(year);
  },
);

export const tmntsSlice = createSlice({
  name: "tmnts",
  initialState,
  reducers: {
    clearTmnts: (state) => {
      state.tmnts = [];
      // null, not "", because "" means "upcoming". Any fetch still in
      // flight will no longer match, so its result is ignored.
      state.requestedYear = null;
      state.year = null;
      state.status = "idle";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTmnts.pending, (state, action) => {
        state.status = "loading";
        state.requestedYear = action.meta.arg;
        state.error = "";
      })
      .addCase(fetchTmnts.fulfilled, (state, action) => {
        if (action.meta.arg !== state.requestedYear) return; // stale response
        state.status = "succeeded";
        state.year = action.meta.arg;
        state.tmnts = action.payload;
        state.error = "";
      })
      .addCase(fetchTmnts.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedYear) return; // stale failure
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error fetching tmnts";
      });
  },
});

export const { clearTmnts } = tmntsSlice.actions;

export const selectTmnts = (state: RootState) => state.tmnts.tmnts;
export const getTmntsRequestedYear = (state: RootState) => state.tmnts.requestedYear;
export const getTmntsYear = (state: RootState) => state.tmnts.year;
export const getTmntsStatus = (state: RootState) => state.tmnts.status;
export const getTmntsError = (state: RootState) => state.tmnts.error;

export default tmntsSlice.reducer;
