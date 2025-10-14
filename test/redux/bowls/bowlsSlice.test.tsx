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


// import { configureStore, Store } from '@reduxjs/toolkit';
// import { bowlsSlice, fetchBowls, saveBowl } from '@/redux/features/bowls/bowlsSlice';
// import { Bowl } from "@prisma/client";
// import { bowlType } from "@/lib/types/types";
// import { initBowl } from "@/lib/db/initVals";

// const initialState = {
//   bowls: [],
//   loadStatus: 'idle',
//   saveStatus: 'idle',
//   error: '',
// };

// const bowlData: Bowl[] = [
//   {
//     id: "bwl_561540bd64974da9abdd97765fdb3659",
//     bowl_name: "Earl Anthony's Dublin Bowl",
//     city: "Dublin",
//     state: "CA",
//     url: "https://www.earlanthonysdublinbowl.com",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
//     bowl_name: "Yosemite Lanes",
//     city: "Modesto",
//     state: "CA",
//     url: "http://yosemitelanes.com",
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   }
// ];    

// describe('bowlsSlice', () => {
//   let store: Store;
  
//   beforeEach(() => {
//     store = configureStore({
//       reducer: {
//         bowls: bowlsSlice.reducer, 
//       },
//     });
//   });

//   it('should handle initial state', async () => {
//     expect(store.getState().bowls).toEqual(initialState);
//   });

//   it('should handle fetchBowls.pending', () => {
//     // Arrange
//     const action = fetchBowls.pending('pending');

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.loadStatus).toBe('loading');
//     expect(state.error).toBe('');
//   });

//   it('should handle fetchBowls.fulfilled', () => {
//     const action = fetchBowls.fulfilled(bowlData, 'succeeded');

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.loadStatus).toBe('succeeded');
//     expect(state.bowls).toEqual(bowlData);
//     expect(state.error).toBe('');
//   });

//   it('should handle fetchBowls.rejected', () => { 
//     // Arrange
//     const error = new Error('Something went wrong');
//     const reason = 'Failed to fetch tournament data';
//     const action = fetchBowls.rejected(error, reason);

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.loadStatus).toBe('failed');
//     expect(state.error).toBe(error.message);
//   })

//   it('should handle saveBowl.pending', () => { 
//     // Arrange
//     const bowlData: bowlType = {
//       ...initBowl,
//       id: "bwl_561540bd64974da9abdd97765fdb3659",
//       bowl_name: "Earl Anthony's Dublin Bowl",
//       city: "Dublin",
//       state: "CA",
//       url: "https://www.earlanthonysdublinbowl.com",
//     }    
//     const action = saveBowl.pending('pending', bowlData, {});

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.saveStatus).toBe('saving');
//     expect(state.error).toBe('');
//   })

//   it('should handle saveBowl.fulfilled', () => {
//     // Arrange
//     const bowlToSave: Bowl = {
//       id: "bwl_561540bd64974da9abdd97765fdb3659",
//       bowl_name: "Earl Anthony's Dublin Bowl",
//       city: "Dublin",
//       state: "CA",
//       url: "https://www.earlanthonysdublinbowl.com",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     }
    
//     const action = saveBowl.fulfilled(bowlData, 'succeeded', bowlToSave);

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.saveStatus).toBe('succeeded');
//     expect(state.error).toBe('');
//   });

//   it('should handle saveBowl.rejected', () => {
//     // Arrange
//     const bowlToSave: Bowl = {
//       id: "bwl_561540bd64974da9abdd97765fdb3659",
//       bowl_name: "Earl Anthony's Dublin Bowl",
//       city: "Dublin",
//       state: "CA",
//       url: "https://www.earlanthonysdublinbowl.com",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     }
//     const error = new Error('Something went wrong');
//     const reason = 'Failed to save data';
//     const action = saveBowl.rejected(error, reason, bowlToSave);

//     // Act
//     store.dispatch(action);

//     // Assert
//     const state = store.getState().bowls;
//     expect(state.saveStatus).toBe('failed');
//     expect(state.error).toBe(error.message);
//   })
// });