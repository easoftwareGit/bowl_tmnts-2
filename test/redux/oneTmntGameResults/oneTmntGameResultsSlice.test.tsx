import { configureStore, Store } from '@reduxjs/toolkit';
import {
  fetchOneTmntGameResults,
  selectOneTmntGameResults, 
  getOneTmntGameResultsLoadStatus, 
  getOneTmntGameResultsError, 
  oneTmntGameResultsState,
  oneTmntGameResultsSlice
} from '@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice';

// Mock the dependencies
jest.mock('../../../src/lib/db/results/dbResults', () => ({
  getGameResultsForTmnt: jest.fn(),
}));

describe('oneTmntGameResultsSlice', () => {

  let store: Store;

  const initialState: oneTmntGameResultsState = {
    games: [],
    tmntId: '',
    loadStatus: "idle",
    error: ''
  };

  describe('initial state', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneTmntGameResults: oneTmntGameResultsSlice.reducer,
        },
      });
    });    

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should handle initial state', () => {
      expect(store.getState().oneTmntGameResults).toEqual(initialState);
    }); 

  })

  describe('fetchOneTmntGameResults', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneTmntGameResults: oneTmntGameResultsSlice.reducer,
        },
      });
    });    

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should handle fetchOneTmntGameResults pending', async () => { 
      // Arrange
      const tmntId = '123';
      const action = fetchOneTmntGameResults.pending(tmntId, 'pending');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;
      expect(state.loadStatus).toBe('loading');
      expect(state.error).toBe('');
    })

    it('should handle fetchOneTmntGameResults fulfilled', async () => { 
      // Arrange
      const tmntId = '123';
      const games = [{ id: 1, name: 'Game 1' }];
      const action = fetchOneTmntGameResults.fulfilled(games, tmntId, 'succeeded');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;
      expect(state.loadStatus).toBe('succeeded');
      expect(state.games).toEqual(games);
    })

    it('should handle fetchOneTmntGameResults rejected', async () => { 
      // Arrange
      const error = new Error('Something went wrong');
      const reason = 'Failed to fetch squad entries';
      const action = fetchOneTmntGameResults.rejected(error, reason, 'failed');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().oneTmntGameResults;
      expect(state.loadStatus).toBe('failed');
      expect(state.error).toBe(error.message);
    })
  })

  describe('selectors', () => {

    beforeEach(() => {
      store = configureStore({
        reducer: {
          oneTmntGameResults: oneTmntGameResultsSlice.reducer,
        },
        preloadedState: {
          oneTmntGameResults: initialState
        }
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('selectOneTmntGameResults should return games from state', () => {
      const state = store.getState();
      expect(selectOneTmntGameResults(state)).toEqual([]);
    });
  
    it('getOneTmntGameResultsLoadStatus should return load status from state', () => {
      const state = store.getState();
      expect(getOneTmntGameResultsLoadStatus(state)).toBe('idle');
    });
  
    it('getOneTmntGameResultsError should return error from state', () => {
      const state = store.getState();
      expect(getOneTmntGameResultsError(state)).toBe('');
    });
  
    it('selectOneTmntGameResults should return the updated games from state', () => {
      store.dispatch({
        type: 'oneTmntGameResults/fetchOneTmntGameResults/fulfilled',
        payload: [{ id: 1, name: 'Game 1' }]
      });
      const state = store.getState();
      expect(selectOneTmntGameResults(state)).toEqual([{ id: 1, name: 'Game 1' }]);
    });  
    it('getOneTmntGameResultsLoadStatus should return updated load status from state', () => {
      store.dispatch({
        type: 'oneTmntGameResults/fetchOneTmntGameResults/pending'
      });
      const state = store.getState();
      expect(getOneTmntGameResultsLoadStatus(state)).toBe('loading');
    });  
    it('getOneTmntGameResultsError should return the updated error from state', () => {
      store.dispatch({
        type: 'oneTmntGameResults/fetchOneTmntGameResults/rejected',
        error: { message: 'Failed to fetch' }
      });
      const state = store.getState();
      expect(getOneTmntGameResultsError(state)).toBe('Failed to fetch');
    });  
  });
});
