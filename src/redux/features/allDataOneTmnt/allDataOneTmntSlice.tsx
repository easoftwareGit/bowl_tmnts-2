import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { allDataOneTmntType, dataOneTmntType, ioDataErrorsType } from "@/lib/types/types";
import { blankTmnt  } from "@/lib/db/initVals";
import { getAllDataForTmnt } from "@/lib/db/tmnts/dbTmnts";
import { saveAllDataOneTmnt } from "@/lib/db/oneTmnt/dbOneTmnt";
import { cloneDeep } from 'lodash';

export interface allDataOneTmntState {
  tmntData: allDataOneTmntType | null;  
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: allDataOneTmntState = {
  tmntData: {
    origData: {
      tmnt: {...blankTmnt},
      events: [],
      divs: [],
      squads: [],
      lanes: [],
      pots: [],
      brkts: [],
      elims: [],
    },
    curData: {
      tmnt: {...blankTmnt},
      events: [],
      divs: [],
      squads: [],
      lanes: [],
      pots: [],
      brkts: [],
      elims: [],
    },
  },
  loadStatus: 'idle',
  saveStatus: 'idle',
  error: '',
};

/**
 * gets all data for one tmnt
 * 
 * @param {string} tmntId - id of tmnt to get data for
 * @returns {dataOneTmntType | null} - all data for tmnt or null
 */
export const fetchOneTmnt = createAsyncThunk(
  "allDataOneTmnt/fetchOneTmnt",
  async (tmntId: string, { getState }) => {    

    const state = getState() as RootState;
    const currentTmnt = state.allDataOneTmnt.tmntData?.origData.tmnt.id;
    if (currentTmnt === tmntId) {
      // Return the current state if the tournament ID matches the one being fetched 
      return state.allDataOneTmnt.tmntData;
    }

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const gotData = await getAllDataForTmnt(tmntId); 
    if (!gotData) {
      return null;
    }
    const td: allDataOneTmntType = {
      origData: cloneDeep(gotData) as dataOneTmntType,
      curData: cloneDeep(gotData) as dataOneTmntType
    }
    return td as allDataOneTmntType    
  }
)

export const saveOneTmnt = createAsyncThunk(
  "allDataOneTmnt/saveOneTmnt",
  async (data: allDataOneTmntType) => {
    const errorCode: ioDataErrorsType = await saveAllDataOneTmnt(data);
    if (errorCode === ioDataErrorsType.None) {
      const td: allDataOneTmntType = {
        origData: cloneDeep(data.curData) as dataOneTmntType,
        curData: data.curData,
      }
      return td
    } else {
      return data;
    }    
  }
)

export const allDataOneTmntSlice = createSlice({
  name: "allDataOneTmnt",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOneTmnt.pending, (state: allDataOneTmntState) => {
      state.loadStatus = 'loading';
      state.error = '';
    });
    builder.addCase(fetchOneTmnt.fulfilled, (state: allDataOneTmntState, action) => {      
      if (!action.payload) {
        state.loadStatus = 'failed';
        state.tmntData = null;
        state.error = 'all tournament data not found'; 
      } else {        
        state.loadStatus = 'succeeded';
        state.tmntData = action.payload;
        state.error = '';        
      }
    });
    builder.addCase(fetchOneTmnt.rejected, (state: allDataOneTmntState, action) => {
      state.loadStatus = 'failed';
      state.error = action.error.message;
    });
    builder.addCase(saveOneTmnt.pending, (state: allDataOneTmntState) => {
      state.saveStatus = 'saving';
      state.error = '';
    });
    builder.addCase(saveOneTmnt.fulfilled, (state: allDataOneTmntState, action) => {
      state.saveStatus = 'succeeded';
      state.tmntData = action.payload;
      state.error = '';
    });
    builder.addCase(saveOneTmnt.rejected, (state: allDataOneTmntState, action) => {
      state.saveStatus = 'failed';
      state.error = action.error.message;
    });
  }
});

export const selectOneTmnt = (state: RootState) => state.allDataOneTmnt.tmntData
export const getOneTmntLoadStatus = (state: RootState) => state.allDataOneTmnt.loadStatus
export const getOneTmntSaveStatus = (state: RootState) => state.allDataOneTmnt.saveStatus
export const getOneTmntError = (state: RootState) => state.allDataOneTmnt.error

export default allDataOneTmntSlice.reducer;