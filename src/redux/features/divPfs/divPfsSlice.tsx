import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { divPfType, tmntDivPfSaveDataType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";
import { getAllDivPfsForTmnt, updateAllDivPfsForTmnt } from "@/lib/db/divPfs/dbDivPfs";

export interface divPfsState {
  divPfs: divPfType[];
  requestedTmntId: string;
  tmntId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
  ioError: ioDataError | undefined;
}

// initial state constant
const initialState: divPfsState = {
  divPfs: [],
  requestedTmntId: "",
  tmntId: "",
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",
  ioError: ioDataError.NONE,
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
        fetchDivPfs.fulfilled,
        (state, action: PayloadAction<divPfType[]>) => {
          state.loadStatus = "succeeded";
          state.tmntId = state.requestedTmntId;
          state.divPfs = action.payload;
        }
      )
      .addCase(fetchDivPfs.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(saveDivPfs.pending, (state) => {
        state.saveStatus = "saving";
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
        state.error = action.error.message;
      });
  },
});
  
export const selectDivPfs = (state: RootState) => state.divPfs.divPfs;

export const getDivPfRequestedTmntId = (state: RootState) => state.divPfs.requestedTmntId;
export const getDivPfsTmntId = (state: RootState) => state.divPfs.tmntId;
export const getDivPfsLoadStatus = (state: RootState) => state.divPfs.loadStatus;
export const getDivPfsSaveStatus = (state: RootState) => state.divPfs.saveStatus;
export const getDivPfsError = (state: RootState) => state.divPfs.error;
export const getDivPfsIoError = (state: RootState) => state.divPfs.ioError;

export default divPfsSlice.reducer;