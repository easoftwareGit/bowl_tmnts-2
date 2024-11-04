import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loadStatusType } from '@/redux/statusTypes';
import { getTmntYears } from '@/lib/db/tmnts/tmntsAxios';
import { YearObj } from '@/lib/types/types';

export interface TmntYearsSliceState {
  data: YearObj[];  
  status: loadStatusType;  
  error: string | undefined;
}

// initial state constant
const initialState: TmntYearsSliceState = {
  data: [],  
  status: 'idle',    
  error: ''
} 

// get list of years from today and before
export const fetchTmntYears = createAsyncThunk('tmnts/fetchTmntsYears', async () => {  

  // Do not use try / catch blocks here. Need the promise to be fulfilled or
  // rejected which will have the appropriate response in the extraReducers.

  return await getTmntYears();
})

export const tmntYearsSlice = createSlice({
  name: 'tmntYears',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTmntYears.pending, (state: TmntYearsSliceState) => {      
      state.status = 'loading';      
      state.error = '';
    })
    builder.addCase(fetchTmntYears.fulfilled, (state: TmntYearsSliceState, action) => {
      state.status = 'succeeded';      
      state.data = action.payload;
      state.error = '';
    })
    builder.addCase(fetchTmntYears.rejected, (state: TmntYearsSliceState, action) => {
      state.status = 'failed';      
      state.error = action.error.message
    })
  }
});

export default tmntYearsSlice.reducer;