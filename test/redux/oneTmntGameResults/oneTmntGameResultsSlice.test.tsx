import { configureStore, Store } from "@reduxjs/toolkit";
import {
  fetchOneTmntGameResults,
  selectOneTmntGameResults,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsError,
  oneTmntGameResultsState,
  oneTmntGameResultsSlice,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";

// Mock the dependencies
jest.mock("@/lib/db/results/dbResults", () => ({
  getGameResultsForTmnt: jest.fn(),
}));

const mockedGetGameResultsForTmnt = jest.mocked(getGameResultsForTmnt);

describe("oneTmntGameResultsSlice", () => {
  let store: Store;

  const initialState: oneTmntGameResultsState = {
    games: [],
    requestedTmntId: "",
    loadStatus: "idle",
    error: "",
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        oneTmntGameResults: oneTmntGameResultsSlice.reducer,
      },
    });

    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should handle initial state", () => {
      expect(store.getState().oneTmntGameResults).toEqual(initialState);
    });
  });

  describe("reducer", () => {
    it("should handle fetchOneTmntGameResults pending", () => {
      // Arrange
      const tmntId = "tmt_123";

      const action = fetchOneTmntGameResults.pending(
        "request-id",
        tmntId,
      );

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.error).toBe("");
      expect(state.games).toEqual([]);
    });

    it("should handle fetchOneTmntGameResults fulfilled", () => {
      // Arrange
      const tmntId = "tmt_123";

      const games = [
        {
          id: "game-1",
          name: "Game 1",
        },
      ] as any[];

      const action = fetchOneTmntGameResults.fulfilled(
        games,
        "request-id",
        tmntId,
      );

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.games).toEqual(games);
      expect(state.error).toBe("");
    });

    it("should handle fetchOneTmntGameResults rejected", () => {
      // Arrange
      const tmntId = "tmt_123";
      const error = new Error("Something went wrong");

      const action = fetchOneTmntGameResults.rejected(
        error,
        "request-id",
        tmntId,
      );

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe(error.message);
      expect(state.games).toEqual([]);
    });
  });

  describe("fetchOneTmntGameResults thunk", () => {
    it("should fetch tournament game results successfully", async () => {
      // Arrange
      const tmntId = "tmt_123";

      const games = [
        {
          id: "game-1",
          name: "Game 1",
        },
      ] as any[];

      mockedGetGameResultsForTmnt.mockResolvedValue(games);

      // Act
      await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      // Assert
      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledWith(tmntId);

      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.games).toEqual(games);
      expect(state.error).toBe("");
    });

    it("should handle an error fetching tournament game results", async () => {
      // Arrange
      const tmntId = "tmt_123";
      const errorMessage = "Error fetching tournament game results";

      mockedGetGameResultsForTmnt.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act
      await store.dispatch(fetchOneTmntGameResults(tmntId) as any);

      // Assert
      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledTimes(1);
      expect(mockedGetGameResultsForTmnt).toHaveBeenCalledWith(tmntId);

      const state = store.getState().oneTmntGameResults;

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedTmntId).toBe(tmntId);
      expect(state.games).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe("selectors", () => {
    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneTmntGameResults: oneTmntGameResultsSlice.reducer,
        },
        preloadedState: {
          oneTmntGameResults: initialState,
        },
      });
    });

    it("selectOneTmntGameResults should return games from state", () => {
      const state = store.getState();

      expect(selectOneTmntGameResults(state)).toEqual([]);
    });

    it("getOneTmntGameResultsRequestedTmntId should return requested tournament id from state", () => {
      const state = store.getState();

      expect(getOneTmntGameResultsRequestedTmntId(state)).toBe("");
    });

    it("getOneTmntGameResultsLoadStatus should return load status from state", () => {
      const state = store.getState();

      expect(getOneTmntGameResultsLoadStatus(state)).toBe("idle");
    });

    it("getOneTmntGameResultsError should return error from state", () => {
      const state = store.getState();

      expect(getOneTmntGameResultsError(state)).toBe("");
    });

    it("selectOneTmntGameResults should return updated games from state", () => {
      // Arrange
      const games = [
        {
          id: "game-1",
          name: "Game 1",
        },
      ] as any[];

      // Act
      store.dispatch({
        type: fetchOneTmntGameResults.fulfilled.type,
        payload: games,
      });

      // Assert
      const state = store.getState();

      expect(selectOneTmntGameResults(state)).toEqual(games);
    });

    it("getOneTmntGameResultsRequestedTmntId should return updated requested tournament id", () => {
      // Arrange
      const tmntId = "tmt_123";

      // Act
      store.dispatch({
        type: fetchOneTmntGameResults.pending.type,
        meta: {
          arg: tmntId,
        },
      });

      // Assert
      const state = store.getState();

      expect(getOneTmntGameResultsRequestedTmntId(state)).toBe(
        tmntId,
      );
    });

    it("getOneTmntGameResultsLoadStatus should return updated load status from state", () => {
      // Act
      store.dispatch({
        type: fetchOneTmntGameResults.pending.type,
        meta: {
          arg: "tmt_123",
        },
      });

      // Assert
      const state = store.getState();

      expect(getOneTmntGameResultsLoadStatus(state)).toBe("loading");
    });

    it("getOneTmntGameResultsError should return updated error from state", () => {
      // Act
      store.dispatch({
        type: fetchOneTmntGameResults.rejected.type,
        error: {
          message: "Failed to fetch",
        },
      });

      // Assert
      const state = store.getState();

      expect(getOneTmntGameResultsError(state)).toBe(
        "Failed to fetch",
      );
    });
  });
});

// import { configureStore, Store } from '@reduxjs/toolkit';
// import {
//   fetchOneTmntGameResults,
//   selectOneTmntGameResults, 
//   getOneTmntGameResultsLoadStatus, 
//   getOneTmntGameResultsError, 
//   oneTmntGameResultsState,
//   oneTmntGameResultsSlice
// } from '@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice';

// // Mock the dependencies
// jest.mock('@/lib/db/results/dbResults', () => ({
//   getGameResultsForTmnt: jest.fn(),
// }));

// describe('oneTmntGameResultsSlice', () => {

//   let store: Store;

//   const initialState: oneTmntGameResultsState = {
//     games: [],
//     tmntId: '',
//     loadStatus: "idle",
//     error: ''
//   };

//   describe('initial state', () => { 

//     beforeEach(() => {
//       store = configureStore({
//         reducer: {
//           oneTmntGameResults: oneTmntGameResultsSlice.reducer,
//         },
//       });
//     });    

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it('should handle initial state', () => {
//       expect(store.getState().oneTmntGameResults).toEqual(initialState);
//     }); 

//   })

//   describe('fetchOneTmntGameResults', () => { 

//     beforeEach(() => {
//       store = configureStore({
//         reducer: {
//           oneTmntGameResults: oneTmntGameResultsSlice.reducer,
//         },
//       });
//     });    

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it('should handle fetchOneTmntGameResults pending', async () => { 
//       // Arrange
//       const tmntId = '123';
//       const action = fetchOneTmntGameResults.pending(tmntId, 'pending');

//       // Act
//       store.dispatch(action);

//       // Assert
//       const state = store.getState().oneTmntGameResults;
//       expect(state.loadStatus).toBe('loading');
//       expect(state.error).toBe('');
//     })

//     it('should handle fetchOneTmntGameResults fulfilled', async () => { 
//       // Arrange
//       const tmntId = '123';
//       const games = [{ id: 1, name: 'Game 1' }];
//       const action = fetchOneTmntGameResults.fulfilled(games, tmntId, 'succeeded');

//       // Act
//       store.dispatch(action);

//       // Assert
//       const state = store.getState().oneTmntGameResults;
//       expect(state.loadStatus).toBe('succeeded');
//       expect(state.games).toEqual(games);
//     })

//     it('should handle fetchOneTmntGameResults rejected', async () => { 
//       // Arrange
//       const error = new Error('Something went wrong');
//       const reason = 'Failed to fetch squad entries';
//       const action = fetchOneTmntGameResults.rejected(error, reason, 'failed');

//       // Act
//       store.dispatch(action);

//       // Assert
//       const state = store.getState().oneTmntGameResults;
//       expect(state.loadStatus).toBe('failed');
//       expect(state.error).toBe(error.message);
//     })
//   })

//   describe('selectors', () => {

//     beforeEach(() => {
//       store = configureStore({
//         reducer: {
//           oneTmntGameResults: oneTmntGameResultsSlice.reducer,
//         },
//         preloadedState: {
//           oneTmntGameResults: initialState
//         }
//       });
//     });

//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it('selectOneTmntGameResults should return games from state', () => {
//       const state = store.getState();
//       expect(selectOneTmntGameResults(state)).toEqual([]);
//     });
  
//     it('getOneTmntGameResultsLoadStatus should return load status from state', () => {
//       const state = store.getState();
//       expect(getOneTmntGameResultsLoadStatus(state)).toBe('idle');
//     });
  
//     it('getOneTmntGameResultsError should return error from state', () => {
//       const state = store.getState();
//       expect(getOneTmntGameResultsError(state)).toBe('');
//     });
  
//     it('selectOneTmntGameResults should return the updated games from state', () => {
//       store.dispatch({
//         type: 'oneTmntGameResults/fetchOneTmntGameResults/fulfilled',
//         payload: [{ id: 1, name: 'Game 1' }]
//       });
//       const state = store.getState();
//       expect(selectOneTmntGameResults(state)).toEqual([{ id: 1, name: 'Game 1' }]);
//     });  
//     it('getOneTmntGameResultsLoadStatus should return updated load status from state', () => {
//       store.dispatch({
//         type: 'oneTmntGameResults/fetchOneTmntGameResults/pending'
//       });
//       const state = store.getState();
//       expect(getOneTmntGameResultsLoadStatus(state)).toBe('loading');
//     });  
//     it('getOneTmntGameResultsError should return the updated error from state', () => {
//       store.dispatch({
//         type: 'oneTmntGameResults/fetchOneTmntGameResults/rejected',
//         error: { message: 'Failed to fetch' }
//       });
//       const state = store.getState();
//       expect(getOneTmntGameResultsError(state)).toBe('Failed to fetch');
//     });  
//   });
// });
