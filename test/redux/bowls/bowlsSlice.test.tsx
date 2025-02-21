import { configureStore, Store } from '@reduxjs/toolkit';
import { bowlsSlice, fetchBowls, saveBowl } from '@/redux/features/bowls/bowlsSlice';
import { Bowl } from "@prisma/client";
import { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";

const initialState = {
  bowls: [],
  loadStatus: 'idle',
  saveStatus: 'idle',
  error: '',
};

const bowlData: Bowl[] = [
  {
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl_name: "Yosemite Lanes",
    city: "Modesto",
    state: "CA",
    url: "http://yosemitelanes.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];    

describe('bowlsSlice', () => {
  let store: Store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        bowls: bowlsSlice.reducer, 
      },
    });
  });

  it('should handle initial state', async () => {
    expect(store.getState().bowls).toEqual(initialState);
  });

  it('should handle fetchBowls.pending', () => {
    // Arrange
    const action = fetchBowls.pending('pending');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.loadStatus).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchBowls.fulfilled', () => {
    const action = fetchBowls.fulfilled(bowlData, 'succeeded');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.loadStatus).toBe('succeeded');
    expect(state.bowls).toEqual(bowlData);
    expect(state.error).toBe('');
  });

  it('should handle fetchBowls.rejected', () => { 
    // Arrange
    const error = new Error('Something went wrong');
    const reason = 'Failed to fetch tournament data';
    const action = fetchBowls.rejected(error, reason);

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.loadStatus).toBe('failed');
    expect(state.error).toBe(error.message);
  })

  it('should handle saveBowl.pending', () => { 
    // Arrange
    const bowlData: bowlType = {
      ...initBowl,
      id: "bwl_561540bd64974da9abdd97765fdb3659",
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
    }    
    const action = saveBowl.pending('pending', bowlData, {});

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.saveStatus).toBe('saving');
    expect(state.error).toBe('');
  })

  it('should handle saveBowl.fulfilled', () => {
    // Arrange
    const bowlToSave: Bowl = {
      id: "bwl_561540bd64974da9abdd97765fdb3659",
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const action = saveBowl.fulfilled(bowlData, 'succeeded', bowlToSave);

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.saveStatus).toBe('succeeded');
    expect(state.error).toBe('');
  });

  it('should handle saveBowl.rejected', () => {
    // Arrange
    const bowlToSave: Bowl = {
      id: "bwl_561540bd64974da9abdd97765fdb3659",
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const error = new Error('Something went wrong');
    const reason = 'Failed to save data';
    const action = saveBowl.rejected(error, reason, bowlToSave);

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().bowls;
    expect(state.saveStatus).toBe('failed');
    expect(state.error).toBe(error.message);
  })
});