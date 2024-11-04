import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Bowl } from "@prisma/client";
import { ioStatusType, ioTaskType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getBowls, postBowl, putBowl } from "@/lib/db/bowls/bowlsAxios";
import { bowlType } from "@/lib/types/types";

export interface bowlSliceState {
  bowls: Bowl[];
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: bowlSliceState = {
  bowls: [],
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

export const fetchBowls = createAsyncThunk("bowls/fetchBowls", async () => {

  // Do not use try / catch blocks here. Need the promise to be fulfilled or
  // rejected which will have the appropriate response in the extraReducers.

  return await getBowls();
});

export const saveBowl = createAsyncThunk("bowls/saveBowl",
  async (bowl: bowlType, { getState }) =>
{
  // Do not use try / catch blocks here. Need the promise to be fulfilled or
  // rejected which will have the appropriate response in the extraReducers.    
  const state = getState() as RootState;
  const currentBowls = state.bowls.bowls;
  const found = currentBowls.find((b) => b.id === bowl.id);
  let success = false;
  if (found) {
    const updatedBowl = await putBowl(bowl);
    if (updatedBowl) {
      success = true;
    }
  } else {
    const newBowl = await postBowl(bowl);
    if (newBowl) {
      success = true;
    }
  }
  if (success) {
    return await getBowls();
  } else {
    return currentBowls;
  }  
})

export const bowlsSlice = createSlice({
  name: "bowls",
  initialState,
  reducers: {
    resetSaveStatus: (state) => {
      state.saveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBowls.pending, (state: bowlSliceState) => {
      state.loadStatus = "loading";      
      state.error = "";
    });
    builder.addCase(fetchBowls.fulfilled, (state: bowlSliceState, action) => {
      state.loadStatus = "succeeded";         
      state.bowls = action.payload;
      state.error = "";
    });
    builder.addCase(fetchBowls.rejected, (state: bowlSliceState, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
    });
    builder.addCase(saveBowl.pending, (state: bowlSliceState, action) => {
      state.saveStatus = "saving";      
      state.error = "";
    });
    builder.addCase(saveBowl.fulfilled, (state: bowlSliceState, action) => {
      state.saveStatus = "succeeded";      
      state.bowls = action.payload;
      state.error = "";
    });
    builder.addCase(saveBowl.rejected, (state: bowlSliceState, action) => {
      state.saveStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export const { resetSaveStatus } = bowlsSlice.actions;
export const selectAllBowls = (state: RootState) => state.bowls.bowls;
export const getBowlsLoadStatus = (state: RootState) => state.bowls.loadStatus;
export const getBowlsSaveStatus = (state: RootState) => state.bowls.saveStatus;
export const getBowlsError = (state: RootState) => state.bowls.error;

export default bowlsSlice.reducer;
