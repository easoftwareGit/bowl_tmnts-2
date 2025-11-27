import reducer, { fetchBowls, saveBowl, bowlsSliceState } from "@/redux/features/bowls/bowlsSlice";
import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
import { mockBowl } from "../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("../../../src/lib/db/bowls/dbBowls", () => ({
  getBowls: jest.fn(),
  upsertBowl: jest.fn(),
}));

describe('bowlSlice reducer + thunk', () => {
  
  const initialState: bowlsSliceState = {
    bowls: [],
    loadStatus: 'idle',
    saveStatus: 'idle',
    error: '',
  };

  //
  // --- Reducer unit tests ---
  //

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
  });

  it('should handle fetchBowls.pending', () => {
    const state = reducer(initialState, { type: fetchBowls.pending.type });
    expect(state).toEqual({
      bowls: [],
      loadStatus: 'loading',
      saveStatus: 'idle',
      error: '',
    });
  });

  it('should handle fetchBowls.fulfilled', () => {
    
    const state = reducer(initialState, {
      type: fetchBowls.fulfilled.type,
      payload: mockBowl
    });
    expect(state).toEqual({
      bowls: mockBowl,
      loadStatus: 'succeeded',
      saveStatus: 'idle',
      error: '',
    });
  });

  it('should handle fetchBowls.rejected', () => {
    const errormessage = 'DB error'
    const state = reducer(initialState, {
      type: fetchBowls.rejected.type,
      error: { message: errormessage }
    });
    expect(state).toEqual({
      bowls: [],
      loadStatus: 'failed',
      saveStatus: 'idle',
      error: errormessage,
    });
  });

  //
  // --- Thunk tests (fetch) ---
  //

  it('dispatches fulfilled when getBowls resolves', async () => {
    (getBowls as jest.Mock).mockResolvedValueOnce(mockBowl);

    const store = configureStore({
      reducer: { bowls: reducer },
    });

    await store.dispatch(fetchBowls() as any);

    const state = store.getState().bowls;
    expect(state.loadStatus).toBe("succeeded");
    expect(state.bowls).toEqual(mockBowl);
  });


  it('dispatches rejected when getBowls rejects', async () => {
    (getBowls as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const store = configureStore({
      reducer: { bowls: reducer },
    });

    await store.dispatch(fetchBowls() as any);

    const state = store.getState().bowls;
    expect(state.loadStatus).toBe("failed");
    expect(state.error).toBe("DB error");
  });

  //
  // --- Thunk tests (save / update bowl) ---
  //

  it('dispatches fulfilled when saveBowl (upsert) resolves', async () => {
    
    (upsertBowl as jest.Mock).mockResolvedValueOnce(mockBowl);

    const store = configureStore({
      reducer: { bowls: reducer },
    });

    await store.dispatch(saveBowl(mockBowl) as any);

    const state = store.getState().bowls;

    expect(upsertBowl).toHaveBeenCalledWith(mockBowl);
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("succeeded");
    expect(state.error).toBe("");    
    expect(state.bowls).toContainEqual(mockBowl);    
  });

  it('dispatches rejected when saveBowl (upsert) rejects', async () => {

    (upsertBowl as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const store = configureStore({
      reducer: { bowls: reducer },
    });

    await store.dispatch(saveBowl(mockBowl) as any);

    const state = store.getState().bowls;

    expect(upsertBowl).toHaveBeenCalledWith(mockBowl);
    expect(state.loadStatus).toBe("idle");
    expect(state.saveStatus).toBe("failed");
    expect(state.error).toBe("DB error");
    expect(state.bowls).toEqual([]);
  });

});