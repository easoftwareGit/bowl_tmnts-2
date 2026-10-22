import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { potPfType, tmntPotPfSaveDataType } from "@/lib/types/types";
import { getAllPotPfsForTmnt, updateAllPotPfsForTmnt } from "@/lib/db/potPfs/dbPotPfs";

export interface potPfsState {
  potPfs: potPfType[];
  requestedTmntId: string;
  tmntId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: potPfsState = {
  potPfs: [],
  requestedTmntId: "",
  tmntId: "",
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",
};

export const fetchPotPfs = createAsyncThunk(
  "potPfs/fetchPotPfs",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getAllPotPfsForTmnt(tmntId);
  },
);

export const savePotPfs = createAsyncThunk(
  "potPfs/savePotPfs",
  async (toSave: tmntPotPfSaveDataType) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const updated = await updateAllPotPfsForTmnt(toSave);
    if (!updated) {
      throw new Error("Error updating potPfs");
    }
    return updated;
  },
);

export const potPfsSlice = createSlice({
  name: "potPfs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPotPfs.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedTmntId = action.meta.arg;
        state.error = "";
      })
      .addCase(fetchPotPfs.fulfilled, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale response
        state.loadStatus = "succeeded";
        state.tmntId = action.meta.arg;
        state.potPfs = action.payload;
      })
      .addCase(fetchPotPfs.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedTmntId) return; // stale failure
        state.loadStatus = "failed";
        state.error = action.error.message ?? "Unknown error fetching potPfs";
      });
    builder
      .addCase(savePotPfs.pending, (state) => {
        state.saveStatus = "saving";
        state.error = "";
      })
      .addCase(
        savePotPfs.fulfilled,
        (state, action: PayloadAction<potPfType[]>) => {
          state.saveStatus = "succeeded";
          state.potPfs = action.payload;
        },
      )
      .addCase(savePotPfs.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message ?? "Unknown error saving potPfs";
      });
  },
});

export const selectPotPfs = (state: RootState) => state.potPfs.potPfs;

export const getPotPfsRequestedTmntId = (state: RootState) => state.potPfs.requestedTmntId;
export const getPotPfsTmntId = (state: RootState) => state.potPfs.tmntId;
export const getPotPfsLoadStatus = (state: RootState) => state.potPfs.loadStatus;
export const getPotPfsSaveStatus = (state: RootState) => state.potPfs.saveStatus;
export const getPotPfsError = (state: RootState) => state.potPfs.error;

export default potPfsSlice.reducer;
