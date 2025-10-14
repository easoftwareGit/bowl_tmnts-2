import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { ioDataError, tmntFullType } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";
import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import { replaceTmntFullData, replaceTmntEntriesData } from "@/lib/db/tmnts/dbTmntsReplaceFull";

export interface tmntFullDataState {
  tmntFullData: tmntFullType;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
  ioError: ioDataError | undefined;
}

// initial state constant
const initialState: tmntFullDataState = {
  tmntFullData: {
    tmnt: cloneDeep(blankTmnt),
    brktEntries: [],
    brktSeeds: [],
    brkts: [],
    divs: [],
    divEntries: [],
    elimEntries: [],
    elims: [],
    events: [],
    lanes: [],
    oneBrkts: [],
    players: [],
    potEntries: [],
    pots: [],
    squads: [],
  },
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
  ioError: ioDataError.None,
};

export const fetchTmntFullData = createAsyncThunk(
  "tmntFullData/fetchTmntFullData",
  async (tmntId: string) => {
    // DO NOT return the current state if the tournament ID matches the one being fetched
    // child data might have changed, and there is too much complexity in checking all that
    // const state = getState() as RootState;
    // const currentTmnt = state.tmntFulldata.tmntFullData?.tmnt.id;
    // if (currentTmnt === tmntId) {
    //   // Return the current state if the tournament ID matches the one being fetched
    //   return state.tmntFullData.tmntData;
    // }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const tmntFullData = await getTmntFullData(tmntId);
    if (!tmntFullData) {
      throw new Error("Error fetching tournament full data");
    }
    return tmntFullData;
  }
);

export const saveTmntFullData = createAsyncThunk(
  "tmntFullData/saveTmntFullData",
  async (tmntFullData: tmntFullType) => {
    const result = await replaceTmntFullData(tmntFullData);
    if (result !== 1) {
      throw new Error("Failed to save tournament full data");
    }
    return tmntFullData;
  }
);

export const saveTmntEntriesData = createAsyncThunk(
  "tmntFullData/saveTmntFullEntriesData",
  async (tmntFullData: tmntFullType) => {
    const result = await replaceTmntEntriesData(tmntFullData);
    if (result !== 1) {
      throw new Error("Failed to save tournament entries data");
    }
    return tmntFullData;
  }
)

export const tmntFullDataSlice = createSlice({
  name: "tmntFullData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTmntFullData.pending, (state) => {
        state.loadStatus = "loading";
      })
      .addCase(
        fetchTmntFullData.fulfilled,
        (state, action: PayloadAction<tmntFullType>) => {
          state.loadStatus = "succeeded";
          state.tmntFullData = action.payload;
        }
      )
      .addCase(fetchTmntFullData.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(saveTmntFullData.pending, (state) => {
        state.saveStatus = "saving";
      })
      .addCase(
        saveTmntFullData.fulfilled,
        (state, action: PayloadAction<tmntFullType>) => {
          state.saveStatus = "succeeded";
          state.tmntFullData = action.payload;
        }
      )
      .addCase(saveTmntFullData.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message;
      });
    builder
      .addCase(saveTmntEntriesData.pending, (state) => {
        state.saveStatus = "saving";
      })
      .addCase(
        saveTmntEntriesData.fulfilled,
        (state, action: PayloadAction<tmntFullType>) => {
          state.saveStatus = "succeeded";
          state.tmntFullData = action.payload;
        }
      )
      .addCase(saveTmntEntriesData.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectTmntFullData = (state: RootState) => state.tmntFullData;
export const getTmntFullDataLoadStatus = (state: RootState) =>
  state.tmntFullData.loadStatus;
export const getTmntDataSaveStatus = (state: RootState) =>
  state.tmntFullData.saveStatus;
export const getTmntFullDataError = (state: RootState) =>
  state.tmntFullData.error;
export const getTmntFullDataIoError = (state: RootState) =>
  state.tmntFullData.ioError;
export default tmntFullDataSlice.reducer;
