import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { deleteTmnt, getUserTmnts } from "@/lib/db/tmnts/dbTmnts";
import type { tmntsListType } from "@/lib/types/types";
import { ioDataError } from "@/lib/enums/enums";

export interface userTmntSliceState {
  userTmnts: tmntsListType[];
  requestedUserId: string;
  userId: string;
  status: ioStatusType;
  deleteStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: userTmntSliceState = {
  userTmnts: [],
  requestedUserId: "",
  userId: "",
  status: "idle",
  deleteStatus: "idle",
  error: "",
};

/**
 * gets all tmnts for a user
 *
 * @param {string} userId - id of user to get tmnts for
 * @return {tmntsListType[]} - array of tmnts from database
 */
export const fetchUserTmnts = createAsyncThunk(
  "userTmnts/fetchUserTmnts",
  async (userId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    return getUserTmnts(userId);
  },
);

/**
 * deletes all data for a tmnt
 *
 * @param {string} tmntId - id of tmnt to delete data from
 * @returns {string} - id of deleted tmnt
 */
export const deleteUserTmnt = createAsyncThunk(
  "userTmnts/deleteUserTmnt",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const errCode = await deleteTmnt(tmntId);
    if (errCode !== ioDataError.NONE) {
      throw new Error("Error deleting tournament");
    }
    return tmntId;
  },
);

export const userTmntsSlice = createSlice({
  name: "userTmnts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTmnts.pending, (state, action) => {
        state.status = "loading";
        state.requestedUserId = action.meta.arg;
        state.error = "";
      })
      .addCase(fetchUserTmnts.fulfilled, (state, action) => {
        if (action.meta.arg !== state.requestedUserId) return; // stale response
        state.status = "succeeded";
        state.userId = action.meta.arg;
        state.userTmnts = action.payload;
        state.error = "";
      })
      .addCase(fetchUserTmnts.rejected, (state, action) => {
        if (action.meta.arg !== state.requestedUserId) return; // stale failure
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error fetching user tmnts";
      });
    builder
      .addCase(deleteUserTmnt.pending, (state) => {
        state.deleteStatus = "deleting";
        state.error = "";
      })
      .addCase(deleteUserTmnt.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.userTmnts = state.userTmnts.filter((tmnt) => tmnt.id !== action.payload);
        state.error = "";
      })
      .addCase(deleteUserTmnt.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.error.message ?? "Unknown error deleting tmnt";
      });
  },
});

export const selectUserTmnts = (state: RootState) => state.userTmnts.userTmnts;
export const getUserTmntsRequestedUserId = (state: RootState) =>
  state.userTmnts.requestedUserId;
export const getUserTmntsUserId = (state: RootState) => state.userTmnts.userId;
export const getUserTmntStatus = (state: RootState) => state.userTmnts.status;
export const getUserTmntDeleteStatus = (state: RootState) =>
  state.userTmnts.deleteStatus;
export const getUserTmntError = (state: RootState) => state.userTmnts.error;

export default userTmntsSlice.reducer;

// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { ioStatusType } from "@/redux/statusTypes";
// import { RootState } from "@/redux/store";
// import { deleteTmnt, getUserTmnts } from "@/lib/db/tmnts/dbTmnts";
// import type { tmntsListType } from "@/lib/types/types";
// import { ioDataError } from "@/lib/enums/enums";

// export interface userTmntSliceState {
//   userTmnts: tmntsListType[];
//   status: ioStatusType;
//   error: string | undefined;
// }

// // initial state constant
// const initialState: userTmntSliceState = {
//   userTmnts: [],
//   status: "idle",
//   error: "",
// };

// /**
//  * gets tmnts with results for a year or all upcoming tmnts
//  *
//  * @param {string} userId - is of user to get tmnts
//  * @return {tmntsListType[]} - array of tmnts from database
//  */
// export const fetchUserTmnts = createAsyncThunk(
//   "userTmnts/fetchUserTmnts",
//   async (userId: string) => {

//     // Do not use try / catch blocks here. Need the promise to be fulfilled or
//     // rejected which will have the appropriate response in the extraReducers.

//     return getUserTmnts(userId);
//   }
// )

// /**
//  * deletes all data for a tmnt
//  *
//  * @param {string} tmntId - id of tmnt to delete data from
//  * @returns {string} - id of deleted tmnt or '' if error
//  */
// export const deleteUserTmnt = createAsyncThunk(
//   "userTmnts/deleteUserTmnt",
//   async (tmntId: string) => {
//     const errCode = await deleteTmnt(tmntId);
//     if (errCode === ioDataError.NONE) {
//       return tmntId;
//     } else {
//       return '';
//     }
//   }
// )

// export const userTmntsSlice = createSlice({
//   name: "userTmnts",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchUserTmnts.pending, (state: userTmntSliceState) => {
//       state.status = "loading";
//       state.error = "";
//     });
//     builder.addCase(fetchUserTmnts.fulfilled, (state: userTmntSliceState, action) => {
//       state.status = "succeeded";
//       state.userTmnts = action.payload;
//       state.error = "";
//     });
//     builder.addCase(fetchUserTmnts.rejected, (state: userTmntSliceState, action) => {
//       state.status = "failed";
//       state.error = action.error.message;
//     });
//     builder.addCase(deleteUserTmnt.pending, (state: userTmntSliceState) => {
//       state.status = "deleting";
//       state.error = "";
//     });
//     builder.addCase(deleteUserTmnt.fulfilled, (state: userTmntSliceState, action) => {
//       state.status = "succeeded";
//       state.userTmnts = state.userTmnts.filter((tmnt) => tmnt.id !== action.payload);
//       state.error = "";
//     });
//     builder.addCase(deleteUserTmnt.rejected, (state: userTmntSliceState, action) => {
//       state.status = "failed";
//       state.error = action.error.message;
//     });
//   },
// });

// export const selectUserTmnts = (state: RootState) => state.userTmnts.userTmnts;
// export const getUserTmntStatus = (state: RootState) => state.userTmnts.status;
// export const getUserTmntError = (state: RootState) => state.userTmnts.error;

// export default userTmntsSlice.reducer;

