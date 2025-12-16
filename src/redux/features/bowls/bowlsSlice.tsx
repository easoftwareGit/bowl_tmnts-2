import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ioStatusType } from "@/redux/statusTypes";
import { RootState } from "@/redux/store";
import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
import { bowlType } from "@/lib/types/types";

export interface bowlsSliceState {
  bowls: bowlType[];
  loadStatus: ioStatusType;
  saveStatus: ioStatusType;
  error: string | undefined;
}

// initial state constant
const initialState: bowlsSliceState = {
  bowls: [],
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

export const fetchBowls = createAsyncThunk("bowls/fetchBowls", async () => {
  
  // Do not use try / catch blocks here. Need the promise to be fulfilled or
  // rejected which will have the appropriate response in the extraReducers.
  const bowls = await getBowls();
  if (!bowls) {
    throw new Error("Error fetching bowls");
  }
  return bowls;
})

export const saveBowl = createAsyncThunk(
  "bowls/saveBowl",
  async (bowl: bowlType) => {
    const upserted = await upsertBowl(bowl);
    return upserted;
  }
)

export const bowlsSlice = createSlice({
  name: "bowls",
  initialState,
  reducers: {
    resetSaveStatus: (state) => {
      state.saveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBowls.pending, (state: bowlsSliceState) => {
      state.loadStatus = "loading";
      state.error = "";
    });
    builder.addCase(fetchBowls.fulfilled, (state: bowlsSliceState, action: PayloadAction<bowlType[]>) => {
      state.loadStatus = "succeeded";
      state.bowls = action.payload;
      state.error = "";
    });
    builder.addCase(fetchBowls.rejected, (state: bowlsSliceState, action) => {
      state.loadStatus = "failed";
      // state.error = action.error.message;
      state.error =
        (action.payload as string) ||
        action.error.message ||
        "Unknown error fetching bowls";
    });
    builder.addCase(saveBowl.pending, (state: bowlsSliceState, action) => {
      state.saveStatus = "saving";
      state.error = "";
    });
    builder.addCase(saveBowl.fulfilled, (state: bowlsSliceState, action) => {
      state.saveStatus = "succeeded";
      state.error = "";
      const updatedBowl = action.payload;
      // ok to use updatedBowl! because guaranteed to exist since fulfilled
      const index = state.bowls.findIndex((b) => b.id === updatedBowl!.id);
      if (index !== -1) {
        state.bowls[index] = updatedBowl!;
      } else {
        state.bowls.push(updatedBowl!);
      }
      // resort bowls by bowl_name
      state.bowls.sort((a, b) =>
        a.bowl_name.localeCompare(b.bowl_name, undefined, {
          sensitivity: "base",
        })
      );
    });
    builder.addCase(saveBowl.rejected, (state: bowlsSliceState, action) => {
      state.saveStatus = "failed";
      state.error = action.error.message;
    });
  },
});

export const { resetSaveStatus } = bowlsSlice.actions;
export const selectAllBowls = (state: RootState) => state.bowls.bowls;
export const getBowlsLoadStatus = (state: RootState) => state.bowls.loadStatus;
export const getBowlsSaveStatus = (state: RootState) => state.bowls.saveStatus;
export const getBowlsError = (state: RootState) => state.bowls.error;

export default bowlsSlice.reducer;
