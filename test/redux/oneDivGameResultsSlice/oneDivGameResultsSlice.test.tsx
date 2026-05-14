import { configureStore, Store } from '@reduxjs/toolkit';
import {
  fetchOneDivGameResults,
  selectOneDivGameResults, 
  getOneDivGameResultsLoadStatus, 
  getOneDivGameResultsError, 
  oneDivGameResultsState,
  oneDivGameResultsSlice
} from '@/redux/features/oneDivGameResults/oneDivGameResultsSlice';
import type { TmntGameResult } from "@/lib/types/resultsTypes";

// Mock the dependencies
jest.mock('@/lib/db/results/dbResults', () => ({  
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
      const games: TmntGameResult[] = [
        {
          player_id: "ply_123",
          div_id: "div_123",
          div_name: "Scratch",
          sort_order: 1,
          tmnt_name: "Test Tournament",
          start_date: "2026-04-30T00:00:00.000Z",

          full_name: "John Doe",
          average: 200,
          hdcp: 10,
          total: 600,
          "total + Hdcp": 630,

          "Game 1": 200,
          "Game 1 + Hdcp": 210,
          "Game 2": 190,
          "Game 2 + Hdcp": 200,
          "Game 3": 210,
          "Game 3 + Hdcp": 220,
        },
      ];

      const action = fetchOneDivGameResults.fulfilled(games, 'succeeded', divId);

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
      const divId = '123';
      const games: TmntGameResult[] = [
        {
          player_id: "ply_123",
          div_id: divId,
          div_name: "Scratch",
          sort_order: 1,
          tmnt_name: "Test Tournament",
          start_date: "2026-04-30T00:00:00.000Z",
          full_name: "John Doe",
          average: 200,
          hdcp: 10,
          total: 600,
          "total + Hdcp": 630,
          "Game 1": 200,
          "Game 1 + Hdcp": 210,
          "Game 2": 190,
          "Game 2 + Hdcp": 200,
          "Game 3": 210,
          "Game 3 + Hdcp": 220,
        },
      ];

      store.dispatch(fetchOneDivGameResults.fulfilled(games, "succeeded", divId));
      const state = store.getState();
      expect(selectOneDivGameResults(state)).toEqual(games);
      expect(state.oneDivGameResults.divId).toBe(divId);
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
