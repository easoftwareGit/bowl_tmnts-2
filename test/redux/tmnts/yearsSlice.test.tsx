import reducer, { fetchTmntYears, tmntYearsSliceState } from "@/redux/features/tmnts/yearsSlice";
import { getTmntYears } from "@/lib/db/tmnts/dbTmnts";
import { YearObj } from "@/lib/types/types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
  getTmntYears: jest.fn(),
}));

describe("tmntYearsSlice reducer + thunk", () => {
  const initialState: tmntYearsSliceState = {
    data: [],
    status: "idle",
    error: "",
  };

  //
  // --- Reducer unit tests ---
  //
  
  it("should return the initial state", () => {
    expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
  });

  it("should handle fetchTmntYears.pending", () => {
    const state = reducer(initialState, { type: fetchTmntYears.pending.type });
    expect(state).toEqual({
      data: [],
      status: "loading",
      error: "",
    });
  });

  it("should handle fetchTmntYears.fulfilled", () => {
    const mockData: YearObj[] = [{ year: '2024' }];
    const state = reducer(initialState, {
      type: fetchTmntYears.fulfilled.type,
      payload: mockData,
    });
    expect(state).toEqual({
      data: mockData,
      status: "succeeded",
      error: "",
    });
  });

  it("should handle fetchTmntYears.rejected", () => {
    const errorMessage = "DB error";
    const state = reducer(initialState, {
      type: fetchTmntYears.rejected.type,
      error: { message: errorMessage },
    });
    expect(state).toEqual({
      data: [],
      status: "failed",
      error: errorMessage,
    });
  });

  //
  // --- Thunk tests ---
  //
  it("dispatches fulfilled when getTmntYears resolves", async () => {
    const mockData: YearObj[] = [{ year: '2022' }];
    (getTmntYears as jest.Mock).mockResolvedValueOnce(mockData);

    const store = configureStore({
      reducer: { tmntYears: reducer },
    });

    await store.dispatch(fetchTmntYears() as any);

    const state = store.getState().tmntYears;
    expect(state.status).toBe("succeeded");
    expect(state.data).toEqual(mockData);
  });

  it("dispatches rejected when getTmntYears rejects", async () => {
    (getTmntYears as jest.Mock).mockRejectedValueOnce(new Error("DB failed"));

    const store = configureStore({
      reducer: { tmntYears: reducer },
    });

    await store.dispatch(fetchTmntYears() as any);

    const state = store.getState().tmntYears;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("DB failed");
  });
});
