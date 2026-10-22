import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { divPfType, tmntDivPfSaveDataType } from "@/lib/types/types";
import { getAllDivPfsForTmnt, updateAllDivPfsForTmnt } from "@/lib/db/divPfs/dbDivPfs";

export interface divPfsState {
  divPfs: divPfType[];
  requestedTmntId: string;
  tmntId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;  
}

// initial state constant
const initialState: divPfsState = {
  divPfs: [],
  requestedTmntId: "",
  tmntId: "",
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",  
};

export const fetchDivPfs = createAsyncThunk(
  "divPfs/fetchDivPfs",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getAllDivPfsForTmnt(tmntId);
  },
);

export const saveDivPfs = createAsyncThunk(
  "divPfs/saveDivPfs",
  async (toSave: tmntDivPfSaveDataType) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const updated = await updateAllDivPfsForTmnt(toSave);
    if (!updated) {
      throw new Error("Error updating divPfs");
    }
    return updated;
  },
);

export const divPfsSlice = createSlice({
  name: "divPfs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDivPfs.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedTmntId = action.meta.arg;
        state.error = "";
      })
      .addCase(
        fetchDivPfs.fulfilled, (state, action) => {
          if (action.meta.arg !== state.requestedTmntId) return; // stale response
          state.loadStatus = "succeeded";
          state.tmntId = action.meta.arg;
          state.divPfs = action.payload;
        }
      )
      .addCase(fetchDivPfs.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale failure
        state.loadStatus = "failed";
        state.error =
          action.error.message ??
          "Unknown error fetching divPfs for tmnt";
      });
    builder
      .addCase(saveDivPfs.pending, (state) => {
        state.saveStatus = "saving";
        state.error = "";
      })
      .addCase(
        saveDivPfs.fulfilled,
        (state, action: PayloadAction<divPfType[]>) => {
          state.saveStatus = "succeeded";
          state.divPfs = action.payload;
        }
      )
      .addCase(saveDivPfs.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message ?? "Unknown error saving divPfs";
      });
  },
});
  
export const selectDivPfs = (state: RootState) => state.divPfs.divPfs;

export const getDivPfsRequestedTmntId = (state: RootState) => state.divPfs.requestedTmntId;
export const getDivPfsTmntId = (state: RootState) => state.divPfs.tmntId;
export const getDivPfsLoadStatus = (state: RootState) => state.divPfs.loadStatus;
export const getDivPfsSaveStatus = (state: RootState) => state.divPfs.saveStatus;
export const getDivPfsError = (state: RootState) => state.divPfs.error;

export default divPfsSlice.reducer;