import { configureStore, Store } from '@reduxjs/toolkit';
import { tmntYearsSlice, fetchTmntYears } from '@/redux/features/tmnts/yearsSlice';
import { YearObj } from '@/lib/types/types';

const initialState = {
  data: [],  
  status: 'idle',    
  error: ''
} 

describe("tmntYearsSlice", () => {
  let store: Store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tmntYears: tmntYearsSlice.reducer,
      },
    });
  });

  it("should handle initial state", () => {
    expect(store.getState().tmntYears).toEqual(initialState);
  });

  it('should handle fetchTmntYears.pending', () => {
    // Arrange
    const action = fetchTmntYears.pending('pending');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().tmntYears;
    expect(state.status).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchTmntYears.fulfilled', () => {
    // Arrange
    const data: YearObj[] = [{year:'2023'}, {year: '2022'}, {year:'2021'}];
    const action = fetchTmntYears.fulfilled(data, 'succeeded');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().tmntYears;
    expect(state.status).toBe('succeeded');
    expect(state.data).toEqual(data);
    expect(state.error).toBe('');
  });

  it('should handle fetchTmntYears.rejected', () => {
    // Arrange
    const error = new Error('Something went wrong');  
    const action = fetchTmntYears.rejected(error, 'rejected');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().tmntYears;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(error.message);
  });

})