import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store"; 
import { allEntriesOneSquadType, brktEntryType, dataOneSquadEntriesType, dataOneTmntType, divEntryType, elimEntryType, ioDataError, playerType, potEntryType, putManyEntriesReturnType, tmntEntryPlayerType, updatedEntriesCountsType } from "@/lib/types/types";
import { getAllEntriesForSquad2 } from "@/lib/db/squads/dbSquads";
import { cloneDeep } from "lodash";
import { saveEntriesData } from "@/lib/db/tmntEntries/dbTmntEntries";
import { playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { allEntriesAllErrors, allEntriesNoUpdates } from "@/lib/db/initVals";
import { BracketList } from "@/components/brackets/bracketListClass";

export interface allEntriesOneSquadState {
  entryData: allEntriesOneSquadType | null;  
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;  
  updatedInfo: putManyEntriesReturnType | null;  
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
      brktEntries: [],
      brktLists: [],
      elimEntries: [],      
    },
    curData: {      
      squadId: "",
      players: [],
      divEntries: [],
      potEntries: [],
      brktEntries: [],      
      brktLists: [],
      elimEntries: [],
    }
  },
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",  
  updatedInfo: cloneDeep(allEntriesNoUpdates),  
};

export const fetchOneSquadEntries2 = createAsyncThunk(
  "allEntriesOneSquad/fetchOneSquadEntries2",
  async (curData: dataOneTmntType, { getState }) => {

    // noIdYet = (squadId === "" || squadId === undefined || squadId === null);
    noIdYet = (!curData
      || curData.squads.length === 0
      || curData.squads[0].id === ""
      || curData.squads[0].id === undefined
      || curData.squads[0].id === null);
    let squadId = '';
    if (!noIdYet) {
      squadId = curData.squads[0].id;
    }
    
    const state = getState() as RootState;
    const currentSquad = state.allEntriesOneSquad?.entryData?.origData?.squadId;

    if (currentSquad === squadId && !state.allEntriesOneSquad === undefined && state.allEntriesOneSquad.entryData) {
      // Return the current state if the tournament ID matches the one being fetched 
      return state.allEntriesOneSquad.entryData;
    }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.    
    const gotData = await getAllEntriesForSquad2(curData); 
    if (!gotData) {
      return null;
    }

    const allEnts: allEntriesOneSquadType = {
      origData: cloneDeep(gotData) as dataOneSquadEntriesType,
      curData: cloneDeep(gotData) as dataOneSquadEntriesType
    }

    return allEnts as allEntriesOneSquadType    
  }
)

export const SaveOneSquadEntries = createAsyncThunk(
  "allEntriesOneSquad/saveOneSquadEntries",    
  async ({ rows, data }: { rows: (typeof playerEntryData)[], data: allEntriesOneSquadType }, { rejectWithValue }) => {      
    const updatedInfo = await saveEntriesData(rows, data);    
    return { data, updatedInfo };
  }
)

export const allEntriesOneSquadSlice = createSlice({
  name: "allEntriesOneSquad",
  initialState,
  reducers: {
    updatePlayers: (state, action: PayloadAction<playerType[]>) => {
      if (state.entryData) {
        state.entryData.curData.players = action.payload;
        state.entryData.origData.players = action.payload;
      } 
    },
    updateDivEntries: (state, action: PayloadAction<divEntryType[]>) => {
      if (state.entryData) {
        state.entryData.curData.divEntries = action.payload;
        state.entryData.origData.divEntries = action.payload;
      }
    },
    updatePotEntries: (state, action: PayloadAction<potEntryType[]>) => {
      if (state.entryData) {
        state.entryData.curData.potEntries = action.payload;
        state.entryData.origData.potEntries = action.payload;
      }
    }, 
    updateBrktEntries: (state, action: PayloadAction<brktEntryType[]>) => {
      if (state.entryData) {
        state.entryData.curData.brktEntries = action.payload;
        state.entryData.origData.brktEntries = action.payload;
      }
    }, 
    updateBrktLists: (state, action: PayloadAction<BracketList[]>) => {
      if (state.entryData) {
        state.entryData.curData.brktLists = action.payload;
        state.entryData.origData.brktLists = action.payload;
      }
    },
    updateElimEntries: (state, action: PayloadAction<elimEntryType[]>) => {
      if (state.entryData) {
        state.entryData.curData.elimEntries = action.payload;
        state.entryData.origData.elimEntries = action.payload;
      } 
    }    
  },
  extraReducers: (builder) => {
    builder.addCase(fetchOneSquadEntries2.pending, (state) => {      
      state.loadStatus = "loading";
    });
    builder.addCase(fetchOneSquadEntries2.fulfilled, (state, action) => {
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
    builder.addCase(fetchOneSquadEntries2.rejected, (state, action) => {
      state.loadStatus = "failed";
      state.error = action.error.message;
    });
    // SaveOneSquadEntries
    builder.addCase(SaveOneSquadEntries.pending, (state) => {
      state.saveStatus = 'saving';
      state.error = '';      
      state.updatedInfo = cloneDeep(allEntriesNoUpdates)
    });
    builder.addCase(SaveOneSquadEntries.fulfilled, (state, action: PayloadAction<{ data: allEntriesOneSquadType; updatedInfo: putManyEntriesReturnType }>) => { 
      state.saveStatus = 'succeeded';
      state.entryData = action.payload.data;
      state.updatedInfo = action.payload.updatedInfo;      
      state.error = '';
    });    
    builder.addCase(SaveOneSquadEntries.rejected, (state, action) => {
      state.saveStatus = 'failed';
      state.error = action.error.message;
      if (action.payload && (action.payload as { updatedInfo: putManyEntriesReturnType }).updatedInfo) {
        state.updatedInfo = (action.payload as { updatedInfo: putManyEntriesReturnType }).updatedInfo;
      } else {
        state.updatedInfo = cloneDeep(allEntriesAllErrors);
      }
    })
  },
});
  
export const { updatePlayers, updateDivEntries, updatePotEntries, updateBrktEntries, updateElimEntries } = allEntriesOneSquadSlice.actions;

export const selectOneSquadEntries = (state: RootState) => state.allEntriesOneSquad.entryData;
export const getOneSquadEntriesLoadStatus = (state: RootState) => state.allEntriesOneSquad.loadStatus;
export const getOneSquadEntriesSaveStatus = (state: RootState) => state.allEntriesOneSquad.saveStatus;
export const getOneSquadEntriesError = (state: RootState) => state.allEntriesOneSquad.error;
export const getOneSquadEntriesUpdatedInfo = (state: RootState) => state.allEntriesOneSquad.updatedInfo;

export default allEntriesOneSquadSlice.reducer;