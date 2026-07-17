import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import type { potPfType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";
import { getAllPotPfsForPot, updateAllPotPfsForPot } from "@/lib/db/potPfs/dbPotPfs";

export interface potPfsState {
  potPfs: potPfType[];
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
  ioError: ioDataError | undefined;
}

// initial state constant
const initialState: potPfsState = {
  potPfs: [],
  loadStatus: "idle" as ioStatusType,
  saveStatus: "idle" as ioStatusType,
  error: "",
  ioError: ioDataError.NONE,
};

export const fetchPotPfs = createAsyncThunk(
  "potPfs/fetchPotPfs",
  async (potId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const potPfs = await getAllPotPfsForPot(potId);
    if (!potPfs) {
      throw new Error("Error fetching potPfs for pot");
    }
    return potPfs;
  },
);

export const savePotPfs = createAsyncThunk(
  "potPfs/savePotPfs",
  async (potPfs: potPfType[]) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const updated = await updateAllPotPfsForPot(potPfs[0].pot_id, potPfs);
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
      .addCase(fetchPotPfs.pending, (state) => {
        state.loadStatus = "loading";
      })
      .addCase(
        fetchPotPfs.fulfilled,
        (state, action: PayloadAction<potPfType[]>) => {
          state.loadStatus = "succeeded";
          state.potPfs = action.payload;
        }
      )
      .addCase(fetchPotPfs.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(savePotPfs.pending, (state) => {
        state.saveStatus = "saving";
      })
      .addCase(
        savePotPfs.fulfilled,
        (state, action: PayloadAction<potPfType[]>) => {
          state.saveStatus = "succeeded";
          state.potPfs = action.payload;
        }
      )
      .addCase(savePotPfs.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectPotPfs = (state: RootState) => state.potPfs;

export const getPotPfsLoadStatus = (state: RootState) => state.potPfs.loadStatus;
export const getPotPfsSaveStatus = (state: RootState) => state.potPfs.saveStatus;
export const getPotPfsError = (state: RootState) => state.potPfs.error;
export const getPotPfsIoError = (state: RootState) => state.potPfs.ioError;

export default potPfsSlice.reducer;