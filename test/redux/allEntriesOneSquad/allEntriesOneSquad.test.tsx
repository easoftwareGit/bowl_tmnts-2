import { configureStore, Store } from '@reduxjs/toolkit';
import {
  fetchOneSquadEntries,
  SaveOneSquadEntries,
  allEntriesOneSquadSlice,  
  allEntriesOneSquadState,
} from '@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice';
import { playerEntryData } from '@/app/dataEntry/playersForm/createColumns';
import { allEntriesNoUpdates } from '@/lib/db/initVals';
import { allEntriesOneSquadType, putManyEntriesReturnType } from '@/lib/types/types';
import { cloneDeep, update } from 'lodash';

// Mock the dependencies
jest.mock('../../../src/lib/db/squads/dbSquads', () => ({
  getAllEntriesForSquad: jest.fn(),
}));

jest.mock('../../../src/lib/db/tmntEntries/dbTmntEntries', () => ({
  saveEntriesData: jest.fn(),
}));

describe('allEntriesOneSquadSlice', () => {
  let store: Store;

  const initialState: allEntriesOneSquadState = {
    entryData: {
      origData: {      
        squadId: "",
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],      
        elimEntries: [],
      },
      curData: {      
        squadId: "",
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],      
        elimEntries: [],
      }
    },
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",  
    updatedInfo: cloneDeep(allEntriesNoUpdates)
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        allEntriesOneSquad: allEntriesOneSquadSlice.reducer,
      },
    });
  });    

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle initial state', () => {
    expect(store.getState().allEntriesOneSquad).toEqual(initialState);
  }); 

  it('should handle fetchOneSquadEntries pending', async () => {
    // Arrange
    const squadId = '123';
    const action = fetchOneSquadEntries.pending(squadId, 'pending');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.loadStatus).toEqual('loading');
    expect(state.error).toEqual('');
  });

  it('should handle fetchOneSquadEntries fulfilled', async () => {
    // Arrange
    const squadId = '123';
    const data = {
      origData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
      curData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
    };
    const action = fetchOneSquadEntries.fulfilled(data, squadId, 'succeeded');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.loadStatus).toEqual('succeeded');
    expect(state.entryData).toEqual(data);
  });

  it('should handle fetchOneSquadEntries rejected', async () => {
    // Arrange
    const error = new Error('Something went wrong');
    const reason = 'Failed to fetch squad entries';
    const action = fetchOneSquadEntries.rejected(error, reason, 'some error message');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.loadStatus).toEqual('failed');
    expect(state.error).toEqual(error.message);
  });

  it('should handle SaveOneSquadEntries pending', async () => {
    // Arrange
    const rows: (typeof playerEntryData)[] = [];
    const data = {
      origData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
      curData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
    };    
    const action = SaveOneSquadEntries.pending('pending', { rows, data } , {})
    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.saveStatus).toEqual('saving');
    expect(state.error).toEqual('');
    expect(state.updatedInfo).toEqual(allEntriesNoUpdates);
  });

  it('should handle SaveOneSquadEntries fulfilled', async () => { 
    // Arrange
    const rows: (typeof playerEntryData)[] = [];
    const data = {
      origData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
      curData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
    };    
    const updatedInfo: putManyEntriesReturnType = cloneDeep(allEntriesNoUpdates);   
    updatedInfo.players.inserts = 1;
    const action = SaveOneSquadEntries.fulfilled({ data, updatedInfo }, 'succeeded', { rows, data })

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.saveStatus).toEqual('succeeded');
    expect(state.error).toEqual('');
    expect(state.updatedInfo).toEqual(updatedInfo);
  })

  it('should handle SaveOneSquadEntries rejected', async () => { 
    // Arrange
    const rows: (typeof playerEntryData)[] = [];
    const data = {
      origData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
      curData: {
        squadId: '123',
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],
        elimEntries: [],
      },
    };    
    const error = new Error('Something went wrong');
    const reason = 'Failed to save data';
    const action = SaveOneSquadEntries.rejected(error, reason, { rows, data }, 'some error message')
    
    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().allEntriesOneSquad;
    expect(state.saveStatus).toEqual('failed');
    expect(state.error).toEqual(error.message);
  })
});