import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { testDate } from "@prisma/client";
import { loadStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getTestDates } from "@/lib/db/testdate/testdateAxios";

export interface testDateSliceState {
  testDates: testDate[];
  status: loadStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: testDateSliceState = {
  testDates: [],
  status: "idle",
  error: "",
};

export const fetchTestDates = createAsyncThunk(
  "testdates/fetchTestDates",
  async () => {

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getTestDates();
  }
);

export const testDatesSlice = createSlice({
  name: "testdates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTestDates.pending, (state: testDateSliceState) => {
      state.status = "loading";
      state.error = "";
    });
    builder.addCase(fetchTestDates.fulfilled, (state: testDateSliceState, action) => {
      state.status = "succeeded";
      state.testDates = action.payload;
      state.error = "";
    });
    builder.addCase(fetchTestDates.rejected, (state: testDateSliceState, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
  },  
});

export const selectAllTestDates = (state: RootState) => state.testdates.testDates;
export const getTestDatesStatus = (state: RootState) => state.testdates.status;
export const getTestDatesError = (state: RootState) => state.testdates.error;

export default testDatesSlice.reducer;