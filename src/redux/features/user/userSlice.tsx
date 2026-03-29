import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { getUserById } from "@/lib/db/users/dbUsers";
import type { userDataType } from "@/lib/types/types";
import { blankUserData } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

export interface userSliceState {
  user: userDataType;
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: userSliceState = {
  user: cloneDeep(blankUserData),
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

/**
 * gets a user by id
 *
 * @param {string} userId - id of user to get
 * @returns {userDataType | null} - user from database
 */
export const fetchUser = createAsyncThunk<userDataType | null, string>(
  "user/fetchUser",
  async (userId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.

    return getUserById(userId);
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loadStatus = "loading";
        state.error = "";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loadStatus = "succeeded";
        state.error = "";

        if (action.payload) {
          state.user = {
            ...state.user,
            id: action.payload.id,
            first_name: action.payload.first_name,
            last_name: action.payload.last_name,
            email: action.payload.email,
            phone: action.payload.phone,
            role: action.payload.role,
          };
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loadStatus = "failed";
        state.error = action.error.message;
      });
  },
});
