import reducer, { TmntSliceState, fetchTmnts } from "@/redux/features/tmnts/tmntsSlice";
import { getTmnts } from "@/lib/db/tmnts/dbTmnts";
import type { tmntsListType } from "@/lib/types/types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
  getTmnts: jest.fn(),
}));

describe("tmntsSlice reducer + thunk", () => { 
  const initialState: TmntSliceState = {
    tmnts: [],
    status: "idle",  
    error: "",
  }

  const mockData: tmntsListType[] = [
    {
      id: "tmt_fd99387c33d9c78aba290286576ddce5",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      start_date_str: '2023-08-19',
      bowls: {
        bowl_name: "Earl Anthony's Dublin Bowl",
        city: "Dublin",
        state: "CA",
        url: "https://www.earlanthonysdublinbowl.com",  
      }    
    },
    {
      id: "tmt_56d916ece6b50e6293300248c6792316",
      user_id: "usr_516a113083983234fc316e31fb695b85",
      tmnt_name: "Yosemite 6 Gamer",
      start_date_str: '2022-01-02',
      bowls: {
        bowl_name: "Yosemite Lanes",
        city: "Modesto",
        state: "CA",
        url: "http://yosemitelanes.com",
      }
    }
  ];

  //
  // --- Reducer unit tests ---
  //
  
  it("should return the initial state", () => {
    expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
  });

  it("should handle fetchTmnts.pending", () => {
    const state = reducer(initialState, { type: fetchTmnts.pending.type });
    expect(state).toEqual({
      tmnts: [],
      status: "loading",
      error: "",
    });
  });

  it('should handle fetchTmnts.fulfilled', () => {
    const state = reducer(initialState, {
      type: fetchTmnts.fulfilled.type,
      payload: mockData,
    });
    expect(state).toEqual({
      tmnts: mockData,
      status: "succeeded",
      error: "",
    });
  });

  it('should handle fetchTmnts.rejected', () => {
    const errorMessage = "DB error";
    const state = reducer(initialState, {
      type: fetchTmnts.rejected.type,
      error: { message: errorMessage },
    });
    expect(state).toEqual({
      tmnts: [],
      status: "failed",
      error: errorMessage,
    });
  });

  //
  // --- Thunk tests ---
  //

  it("dispatches fulfilled when getTmnts resolves", async () => {
    (getTmnts as jest.Mock).mockResolvedValueOnce(mockData);

    const store = configureStore({
      reducer: { tmnts: reducer },
    });

    await store.dispatch(fetchTmnts('2023') as any);

    const state = store.getState().tmnts;
    expect(state.status).toBe("succeeded");
    expect(state.tmnts).toEqual(mockData);
  });

  it("dispatches rejected when getTmnts rejects", async () => {
    (getTmnts as jest.Mock).mockRejectedValueOnce(new Error("DB failed"));

    const store = configureStore({
      reducer: { tmnts: reducer },
    });

    await store.dispatch(fetchTmnts('2023') as any);

    const state = store.getState().tmnts;
    expect(state.status).toBe("failed");
    expect(state.error).toBe("DB failed");
  });

})