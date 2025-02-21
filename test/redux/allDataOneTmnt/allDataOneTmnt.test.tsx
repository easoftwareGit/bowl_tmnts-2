import { configureStore, Store } from '@reduxjs/toolkit';
import { allDataOneTmntSlice, fetchOneTmnt, saveOneTmnt } from '@/redux/features/allDataOneTmnt/allDataOneTmntSlice';
import { allDataOneTmntType, ioDataError } from "@/lib/types/types";
import { blankTmnt } from "@/lib/db/initVals";
import { cloneDeep } from 'lodash';

const blankTmntData: allDataOneTmntType = {
  origData: {
    tmnt: cloneDeep(blankTmnt),
    events: [],
    divs: [],
    squads: [],
    lanes: [],
    pots: [],
    brkts: [],
    elims: [],
  },
  curData: {
    tmnt: cloneDeep(blankTmnt),
    events: [],
    divs: [],
    squads: [],
    lanes: [],
    pots: [],
    brkts: [],
    elims: [],
  },
};

const initialState = {
  tmntData: cloneDeep(blankTmntData),
  loadStatus: 'idle',
  saveStatus: 'idle',
  error: '',
  ioError: ioDataError.None,
};

describe('allDataOneTmntSlice', () => {
  let store: Store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        allDataOneTmnt: allDataOneTmntSlice.reducer,
      },
    });
  });

  it('should handle initial state', () => {
    expect(store.getState().allDataOneTmnt).toEqual(initialState);
  });

  it('should handle fetchOneTmnt.pending', () => {
    // Arrange
    const tmntId = '123';
    const action = fetchOneTmnt.pending(tmntId, 'pending');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allDataOneTmnt;
    expect(state.loadStatus).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchOneTmnt.fulfilled', () => {
    // Arrange
    const tmntId = '123';
    const data = cloneDeep(blankTmntData);
    const action = fetchOneTmnt.fulfilled(data, tmntId, 'succeeded');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allDataOneTmnt;
    expect(state.loadStatus).toBe('succeeded');
    expect(state.tmntData).toEqual(data);
    expect(state.error).toBe('');
  });

  it('should handle fetchOneTmnt.rejected', () => {
    // Arrange
    const error = new Error('Something went wrong');    
    const reason = 'Failed to fetch tournament data';
    const action = fetchOneTmnt.rejected(error, reason, 'some error message');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allDataOneTmnt;    
    expect(state.loadStatus).toBe('failed');
    expect(state.error).toBe(error.message);
  });

  it('should handle saveOneTmnt.pending', () => {
    // Arrange
    const data = cloneDeep(blankTmntData);
    data.origData.tmnt.id = '123';
    data.curData.tmnt.id = '123';
    const action = saveOneTmnt.pending('pending', data, {});

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allDataOneTmnt;
    expect(state.saveStatus).toBe('saving');
    expect(state.error).toBe('');
  });

  it('should handle saveOneTmnt.fulfilled', () => {
    // Arrange
    const data = cloneDeep(blankTmntData);
    data.origData.tmnt.id = '123';
    data.curData.tmnt.id = '123';
    const ioError = ioDataError.None;
    const action = saveOneTmnt.fulfilled({ data, ioError }, 'succeeded', data);

    // Act    
    store.dispatch(action);    

    // Assert
    const state = store.getState().allDataOneTmnt;
    expect(state.saveStatus).toBe('succeeded');
    expect(state.tmntData).toEqual(data);
    expect(state.ioError).toBe(ioDataError.None);
    expect(state.error).toBe('');
  });

  it('should handle saveOneTmnt.rejected', () => {
    // Arrange
    const data = cloneDeep(blankTmntData);
    const error = new Error('Something went wrong');
    const reason = 'Failed to save data';
    const ioError = ioDataError.OtherError;    
    const action = saveOneTmnt.rejected(error, reason, data, 'some error message');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allDataOneTmnt;
    expect(state.saveStatus).toBe('failed');
    expect(state.error).toEqual(error.message);
    expect(state.ioError).toBe(ioDataError.OtherError);
  });
});
