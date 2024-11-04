import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadStatusType } from "@/redux/statusTypes";
import { getTmnts } from "@/lib/db/tmnts/tmntsAxios";
import { tmntsListType } from "@/lib/types/types";

export interface TmntSliceState {
  tmnts: tmntsListType[];
  status: loadStatusType;  
  error: string | undefined;
}

// initial state constant 
const initialState: TmntSliceState = {
  tmnts: [],
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
  }
);

export const tmntsSlice = createSlice({
  name: "tmnts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTmnts.pending, (state: TmntSliceState) => {
      state.status = "loading";      
      state.error = "";
    });
    builder.addCase(fetchTmnts.fulfilled, (state: TmntSliceState, action) => {
      state.status = "succeeded";      
      state.tmnts = action.payload;
      state.error = "";
    });
    builder.addCase(fetchTmnts.rejected, (state: TmntSliceState, action) => {
      state.status = "failed";      
      state.error = action.error.message;
    });
  },
});

export default tmntsSlice.reducer;
