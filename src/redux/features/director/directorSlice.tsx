import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import type { RootState } from "@/redux/store";
import { getTmntDirector } from "@/lib/db/tmnts/dbTmnts";
import type { publicTmntDirectorType } from "@/lib/types/types";
import { blankTmntDirector } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

export interface tmntDirectorSliceState {
  tmntDirector: publicTmntDirectorType;
  requestedTmntId: string;
  currentRequestId: string; // id of the latest request; only its response is used
  loadStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: tmntDirectorSliceState = {
  tmntDirector: cloneDeep(blankTmntDirector),
  requestedTmntId: "",
  currentRequestId: "",
  loadStatus: "idle",
  error: "",
};

/**
 * gets a tmnt director by id
 *
 * @param {string} tmntId - id of tmnt to get
 * @returns {publicTmntDirectorType} - tmnt director from database
 * @throws {Error} - if id is invalid or API call fails
 */
export const fetchTmntDirector = createAsyncThunk(
  "tmntDirector/fetchTmntDirector",
  async (tmntId: string) => {
    // Do not use try / catch blocks here. Need the promise to be fulfilled or
    // rejected which will have the appropriate response in the extraReducers.
    const tmntDirector = await getTmntDirector(tmntId);
    if (!tmntDirector) {
      throw new Error("Tournament director not found");
    }
    return tmntDirector;
  },
  {
    // skip the request if this tmnt's director is already loading
    // (stops the duplicate request from React Strict Mode's double useEffect)
    condition: (tmntId, { getState }) => {
      const { tmntDirector } = getState() as RootState;
      return !(
        tmntDirector.loadStatus === "loading" &&
        tmntDirector.requestedTmntId === tmntId
      );
    },
  },
);

export const tmntDirectorSlice = createSlice({
  name: "tmntDirector",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTmntDirector.pending, (state, action) => {
        state.loadStatus = "loading";
        state.requestedTmntId = action.meta.arg;
        state.currentRequestId = action.meta.requestId;
        state.error = "";
      })
      .addCase(fetchTmntDirector.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale response
        state.loadStatus = "succeeded";
        state.error = "";
        // start from a blank tmnt director, not the previous one, so no fields from a
        // previously loaded tmnt director carry over. Only these fields are copied.
        state.tmntDirector = {
          ...cloneDeep(blankTmntDirector),
          first_name: action.payload.first_name,
          last_name: action.payload.last_name,
          email: action.payload.email,
          phone: action.payload.phone,
        };
      })
      .addCase(fetchTmntDirector.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return; // stale failure
        state.loadStatus = "failed";
        state.tmntDirector = cloneDeep(blankTmntDirector);
        state.error =
          action.error.message ?? "Unknown error fetching tournament director";
      });
  },
});

export const getTmntDirectorRequestId = (state: RootState) =>
  state.tmntDirector.requestedTmntId;
export const selectTmntDirector = (state: RootState) =>
  state.tmntDirector.tmntDirector;
export const getTmntDirectorLoadStatus = (state: RootState) =>
  state.tmntDirector.loadStatus;
export const getTmntDirectorError = (state: RootState) =>
  state.tmntDirector.error;

export default tmntDirectorSlice.reducer;
