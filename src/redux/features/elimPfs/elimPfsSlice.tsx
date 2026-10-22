import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { getAllElimPfsForTmnt, updateAllElimPfsForTmnt } from "@/lib/db/elimPfs/dbElimPfs";

export interface elimPfsState {
  elimPfs: elimPfType[];
  requestedTmntId: string;
  tmntId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;  
}

// initial state constant
const initialState: elimPfsState = {
  elimPfs: [],
  requestedTmntId: "",
  tmntId: "",
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",  
};

export const fetchElimPfs = createAsyncThunk(
  "elimPfs/fetchElimPfs",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getAllElimPfsForTmnt(tmntId);
  },
);

export const saveElimPfs = createAsyncThunk(
  "elimPfs/saveElimPfs",
  async (toSave: tmntElimPfSaveDataType) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const updated = await updateAllElimPfsForTmnt(toSave);
    if (!updated) {
      throw new Error("Error updating elimPfs");
    }
    return updated;
  },
);

export const elimPfsSlice = createSlice({
  name: "elimPfs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchElimPfs.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedTmntId = action.meta.arg;
        state.error = "";
      })
      .addCase(
        fetchElimPfs.fulfilled, (state, action) => {
          if (action.meta.arg !== state.requestedTmntId) return; // stale response
          state.loadStatus = "succeeded";
          state.tmntId = action.meta.arg;
          state.elimPfs = action.payload;
        }
      )
      .addCase(fetchElimPfs.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale failure
        state.loadStatus = "failed";
        state.error =
          action.error.message ??
          "Unknown error fetching elimPfs for tmnt";
      });
    builder
      .addCase(saveElimPfs.pending, (state) => {
        state.saveStatus = "saving";
        state.error = "";
      })
      .addCase(
        saveElimPfs.fulfilled,
        (state, action: PayloadAction<elimPfType[]>) => {
          state.saveStatus = "succeeded";
          state.elimPfs = action.payload;
        }
      )
      .addCase(saveElimPfs.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message ?? "Unknown error saving elimPfs";
      });
  },
});
  
export const selectElimPfs = (state: RootState) => state.elimPfs.elimPfs;

export const getElimPfsRequestedTmntId = (state: RootState) => state.elimPfs.requestedTmntId;
export const getElimPfsTmntId = (state: RootState) => state.elimPfs.tmntId;
export const getElimPfsLoadStatus = (state: RootState) => state.elimPfs.loadStatus;
export const getElimPfsSaveStatus = (state: RootState) => state.elimPfs.saveStatus;
export const getElimPfsError = (state: RootState) => state.elimPfs.error;

export default elimPfsSlice.reducer;