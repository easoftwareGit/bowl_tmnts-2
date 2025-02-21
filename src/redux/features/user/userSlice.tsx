import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { findUserById } from "@/lib/db/users/users";
import { userType } from "@/lib/types/types";
import { blankUser } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

export interface userSliceState {
  user: userType;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: userSliceState = {
  user: cloneDeep(blankUser),
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

/**
 * gets a user by id
 * 
 * @param {string} userId - id of user to get
 * @returns {userType} - user from database
 */
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (userId: string) => {

    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return findUserById(userId);    
  }
)

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state: userSliceState) => {
        state.loadStatus = "loading";
        state.error = "";
      })
      .addCase(fetchUser.fulfilled, (state: userSliceState, action) => {
        state.loadStatus = "succeeded";
        // need to get set values indidividually
        // don't set password
        // skip setting password hash
        
        // state.user = action.payload;
        state.error = "";
      })
      .addCase(fetchUser.rejected, (state: userSliceState, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
  },
});