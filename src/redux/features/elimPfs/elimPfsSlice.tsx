import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";
import { getAllElimPfsForTmnt, updateAllElimPfsForTmnt } from "@/lib/db/elimPfs/dbElimPfs";

export interface elimPfsState {
  elimPfs: elimPfType[];
  requestedTmntId: string;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
  ioError: ioDataError | undefined;
}

// initial state constant
const initialState: elimPfsState = {
  elimPfs: [],
  requestedTmntId: "",
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",
  ioError: ioDataError.NONE,
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
        fetchElimPfs.fulfilled,
        (state, action: PayloadAction<elimPfType[]>) => {
          state.loadStatus = "succeeded";
          state.elimPfs = action.payload;
        }
      )
      .addCase(fetchElimPfs.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(saveElimPfs.pending, (state) => {
        state.saveStatus = "saving";
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
        state.error = action.error.message;
      });
  },
});

export const selectElimPfs = (state: RootState) => state.elimPfs;

export const getElimRequestedId = (state: RootState) => state.elimPfs.requestedTmntId;
export const getElimPfsLoadStatus = (state: RootState) => state.elimPfs.loadStatus;
export const getElimPfsSaveStatus = (state: RootState) => state.elimPfs.saveStatus;
export const getElimPfsError = (state: RootState) => state.elimPfs.error;
export const getElimPfsIoError = (state: RootState) => state.elimPfs.ioError;

export default elimPfsSlice.reducer;