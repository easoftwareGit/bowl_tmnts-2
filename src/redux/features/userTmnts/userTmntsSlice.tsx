import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { deleteAllDataForTmnt, getUserTmnts } from "@/lib/db/tmnts/tmntsAxios";
import { ioDataErrorsType, tmntsListType } from "@/lib/types/types";

export interface userTmntSliceState {
  userTmnts: tmntsListType[];
  status: ioStatusType;  
  error: string | undefined;
}

// initial state constant 
const initialState: userTmntSliceState = {
  userTmnts: [],
  status: "idle",  
  error: "",
};

/**
 * gets tmnts with results for a year or all upcoming tmnts
 *
 * @param {string} userId - is of user to get tmnts
 * @return {tmntsListType[]} - array of tmnts from database
 */
export const fetchUserTmnts = createAsyncThunk(
  "userTmnts/fetchUserTmnts",
  async (userId: string) => {

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getUserTmnts(userId);    
  }
)

/**
 * deletes all data for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete data from
 * @returns {string} - id of deleted tmnt or '' if error
 */
export const deleteUserTmnt = createAsyncThunk(
  "userTmnts/deleteUserTmnt",
  async (tmntId: string) => {
    const errCode = await deleteAllDataForTmnt(tmntId);    
    if (errCode === ioDataErrorsType.None) {
      return tmntId;
    } else {
      return '';
    }
  }
)

export const userTmntsSlice = createSlice({
  name: "userTmnts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserTmnts.pending, (state: userTmntSliceState) => {
      state.status = "loading";
      state.error = "";
    });
    builder.addCase(fetchUserTmnts.fulfilled, (state: userTmntSliceState, action) => {
      state.status = "succeeded";
      state.userTmnts = action.payload;
      state.error = "";
    });      
    builder.addCase(fetchUserTmnts.rejected, (state: userTmntSliceState, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
    builder.addCase(deleteUserTmnt.pending, (state: userTmntSliceState) => {
      state.status = "deleting";
      state.error = "";
    });
    builder.addCase(deleteUserTmnt.fulfilled, (state: userTmntSliceState, action) => {
      state.status = "succeeded";
      state.userTmnts = state.userTmnts.filter((tmnt) => tmnt.id !== action.payload);
      state.error = "";
    });
    builder.addCase(deleteUserTmnt.rejected, (state: userTmntSliceState, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });
  },
});

export const selectUserTmnts = (state: RootState) => state.userTmnts.userTmnts;
export const getUserTmntStatus = (state: RootState) => state.userTmnts.status;
export const getUserTmntError = (state: RootState) => state.userTmnts.error;

export default userTmntsSlice.reducer;