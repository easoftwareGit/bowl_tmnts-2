import { configureStore, Store } from '@reduxjs/toolkit';
import {
  fetchOneDivGameResults,
  selectOneDivGameResults, 
  getOneDivGameResultsLoadStatus, 
  getOneDivGameResultsError, 
  oneDivGameResultsState,
  oneDivGameResultsSlice
} from '@/redux/features/oneDivGameResults/oneDivGameResultsSlice';

// Mock the dependencies
jest.mock('../../../src/lib/db/results/dbResults', () => ({  
  getGameResultsForDiv: jest.fn(),
}));

describe('oneDivGameResultsSlice', () => {

  let store: Store;

  const initialState: oneDivGameResultsState = {
    games: [],
    divId: '',
    loadStatus: "idle",
    error: ''
  };

  describe('initial state', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneDivGameResults: oneDivGameResultsSlice.reducer,
        },
      });
    });    

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should handle initial state', () => {
      expect(store.getState().oneDivGameResults).toEqual(initialState);
    }); 

  })

  describe('fetchOneDivGameResults', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneDivGameResults: oneDivGameResultsSlice.reducer,
        },
      });
    });    

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should handle fetchOneDivGameResults pending', async () => { 
      // Arrange
      const divId = '123';
      const action = fetchOneDivGameResults.pending(divId, 'pending');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneDivGameResults;
      expect(state.loadStatus).toBe('loading');
      expect(state.error).toBe('');
    })

    it('should handle fetchOneDivGameResults fulfilled', async () => { 
      // Arrange
      const divId = '123';
      const games = [{ id: 1, name: 'Game 1' }];
      const action = fetchOneDivGameResults.fulfilled(games, divId, 'succeeded');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneDivGameResults;
      expect(state.loadStatus).toBe('succeeded');
      expect(state.games).toEqual(games);
    })

    it('should handle fetchOneDivGameResults rejected', async () => { 
      // Arrange
      const error = new Error('Something went wrong');
      const reason = 'Failed to fetch squad entries';
      const action = fetchOneDivGameResults.rejected(error, reason, 'failed');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneDivGameResults;
      expect(state.loadStatus).toBe('failed');
      expect(state.error).toBe(error.message);
    })
  })

  describe('selectors', () => {

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneDivGameResults: oneDivGameResultsSlice.reducer,
        },
        preloadedState: {
          oneDivGameResults: initialState
        }
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('selectOneDivGameResults should return games from state', () => {
      const state = store.getState();
      expect(selectOneDivGameResults(state)).toEqual([]);
    });
  
    it('getOneDivGameResultsLoadStatus should return load status from state', () => {
      const state = store.getState();
      expect(getOneDivGameResultsLoadStatus(state)).toBe('idle');
    });
  
    it('getOneDivGameResultsError should return error from state', () => {
      const state = store.getState();
      expect(getOneDivGameResultsError(state)).toBe('');
    });
  
    it('selectOneDivGameResults should return the updated games from state', () => {
      store.dispatch({
        type: 'oneDivGameResultsState/fetchOneDivGameResults/fulfilled',
        payload: [{ id: 1, name: 'Game 1' }]
      });
      const state = store.getState();
      expect(selectOneDivGameResults(state)).toEqual([{ id: 1, name: 'Game 1' }]);
    });  
    it('getOneDivGameResultsLoadStatus should return updated load status from state', () => {
      store.dispatch({
        type: 'oneDivGameResultsState/fetchOneDivGameResults/pending'
      });
      const state = store.getState();
      expect(getOneDivGameResultsLoadStatus(state)).toBe('loading');
    });  
    it('getOneDivGameResultsError should return the updated error from state', () => {
      store.dispatch({
        type: 'oneDivGameResultsState/fetchOneDivGameResults/rejected',
        error: { message: 'Failed to fetch' }
      });
      const state = store.getState();
      expect(getOneDivGameResultsError(state)).toBe('Failed to fetch');
    });  
  });
});
