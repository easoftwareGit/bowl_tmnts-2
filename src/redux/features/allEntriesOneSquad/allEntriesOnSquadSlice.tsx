import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { allEntriesOneSquadType, dataOneSquadEntriesType } from "@/lib/types/types";
import { getAllEntriesForSquad } from "@/lib/db/squads/dbSquads";
import { cloneDeep } from "lodash";

export interface allEntriesOneSquadState {
  entryData: allEntriesOneSquadType | null;  
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

let noIdYet = true;

// initial state constant
const initialState: allEntriesOneSquadState = {
  entryData: {
    origData: {      
      squadId: "",
      players: [],
      divEntries: [],
      potEntries: [],
      // brktEntries: [],
      rawBrktEntries: [],
      elimEntries: [],
    },
    curData: {      
      squadId: "",
      players: [],
      divEntries: [],
      potEntries: [],
      // brktEntries: [],
      rawBrktEntries: [],
      elimEntries: [],
    }
  },
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

export const fetchOneSquadEntries = createAsyncThunk(
  "allEntriesOneSquad/fetchOneSquadEntries",
  async (squadId: string, { getState }) => {

    noIdYet = (squadId === "" || squadId === undefined || squadId === null);
    
    const state = getState() as RootState;
    const currentSquad = state.allEntriesOneSquad.entryData?.origData.squadId;
    if (currentSquad === squadId) {
      // Return the current state if the tournament ID matches the one being fetched 
      return state.allEntriesOneSquad.entryData;
    }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.    
    const gotData = await getAllEntriesForSquad(squadId); 
    if (!gotData) {
      return null;
    }
    const se: allEntriesOneSquadType = {
      origData: cloneDeep(gotData) as dataOneSquadEntriesType,
      curData: cloneDeep(gotData) as dataOneSquadEntriesType
    }
    return se as allEntriesOneSquadType    
  }
)

export const allEntriesOneSquadSlice = createSlice({
  name: "allEntriesOneSquad",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOneSquadEntries.pending, (state) => {      
      state.loadStatus = "loading";
    });
    builder.addCase(fetchOneSquadEntries.fulfilled, (state, action) => {
      if (!action.payload) {
        if (noIdYet) {
          state.loadStatus = "pending";          
          state.error = "";
        } else {
          state.loadStatus = "failed";          
          state.error = "all entry data not found yet";
        }
        state.entryData = null;
      } else {
        state.loadStatus = "succeeded";
        state.entryData = action.payload;
        state.error = "";
      }
    });
    builder.addCase(fetchOneSquadEntries.rejected, (state, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
    });
  },
});
  
export const selectOneSquadEntries = (state: RootState) => state.allEntriesOneSquad.entryData;
export const getOneSquadEntriesLoadStatus = (state: RootState) => state.allEntriesOneSquad.loadStatus;
export const getOneSquadEntriesSaveStatus = (state: RootState) => state.allEntriesOneSquad.saveStatus;
export const getOneSquadEntriesError = (state: RootState) => state.allEntriesOneSquad.error;

export default allEntriesOneSquadSlice.reducer;