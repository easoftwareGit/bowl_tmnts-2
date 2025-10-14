import { configureStore, Store } from '@reduxjs/toolkit';
import {  
  fetchOneSquadEntries2,
  SaveOneSquadEntries,
  allEntriesOneSquadSlice,  
  allEntriesOneSquadState,
  updatePlayers,
  updateDivEntries,
  updatePotEntries,
  updateBrktEntries,
  updateElimEntries,
  selectOneSquadEntries,
  getOneSquadEntriesLoadStatus,
  getOneSquadEntriesSaveStatus,
  getOneSquadEntriesError,
  getOneSquadEntriesUpdatedInfo,  
} from '@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice';
import { playerEntryData } from '@/app/dataEntry/playersForm/createColumns';
import { allEntriesNoUpdates, initBrkt, initDiv, initElim, initEvent, initLane, initLanes, initPot, initSquad, initTmnt } from '@/lib/db/initVals';
import { allEntriesOneSquadType, dataOneTmntType, putManyEntriesReturnType } from '@/lib/types/types';
import { cloneDeep } from 'lodash';
import { mockOrigData } from '../../mocks/tmnts/playerEntries/mockPlayerEntries';

// Mock the dependencies
jest.mock('../../../src/lib/db/squads/dbSquads', () => ({
  getAllEntriesForSquad: jest.fn(),
}));

jest.mock('../../../src/lib/db/tmntEntries/dbTmntEntries', () => ({
  saveEntriesData: jest.fn(),
}));

describe('allEntriesOneSquadSlice', () => {

  const mockAllEntrisOneSquad: allEntriesOneSquadType = {
    origData: cloneDeep(mockOrigData),
    curData: cloneDeep(mockOrigData),
  }  

  const initialState: allEntriesOneSquadState = {
    entryData: {
      origData: {      
        squadId: "",
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [], 
        brktLists: [],
        elimEntries: [],
      },
      curData: {      
        squadId: "",
        players: [],
        divEntries: [],
        potEntries: [],
        brktEntries: [],      
        brktLists: [],
        elimEntries: [],
      }
    },
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",  
    updatedInfo: cloneDeep(allEntriesNoUpdates)
  };

  let store: Store;

  describe('initial state', () => { 

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

  })

  // describe('fetchOneSquadEntries', () => { 

  //   beforeEach(() => {
  //     store = configureStore({
  //       reducer: {
  //         allEntriesOneSquad: allEntriesOneSquadSlice.reducer,
  //       },
  //     });
  //   });    

  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   });

  //   it('should handle fetchOneSquadEntries pending', async () => {
  //     // Arrange
  //     const squadId = '123';
  //     const action = fetchOneSquadEntries.pending(squadId, 'pending');

  //     // Act
  //     store.dispatch(action);

  //     // Assert
  //     const state = store.getState().allEntriesOneSquad;
  //     expect(state.loadStatus).toEqual('loading');
  //     expect(state.error).toEqual('');
  //   });

  //   it('should handle fetchOneSquadEntries fulfilled', async () => {
  //     // Arrange
  //     const squadId = '123';
  //     const data = {
  //       origData: {
  //         squadId: '123',
  //         players: [],
  //         divEntries: [],
  //         potEntries: [],
  //         brktEntries: [],
  //         elimEntries: [],
  //       },
  //       curData: {
  //         squadId: '123',
  //         players: [],
  //         divEntries: [],
  //         potEntries: [],
  //         brktEntries: [],
  //         elimEntries: [],
  //       },
  //     };
  //     const action = fetchOneSquadEntries.fulfilled(data, squadId, 'succeeded');

  //     // Act
  //     store.dispatch(action);

  //     // Assert
  //     const state = store.getState().allEntriesOneSquad;
  //     expect(state.loadStatus).toEqual('succeeded');
  //     expect(state.entryData).toEqual(data);
  //   });

  //   it('should handle fetchOneSquadEntries rejected', async () => {
  //     // Arrange
  //     const error = new Error('Something went wrong');
  //     const reason = 'Failed to fetch squad entries';
  //     const action = fetchOneSquadEntries.rejected(error, reason, 'some error message');

  //     // Act
  //     store.dispatch(action);

  //     // Assert
  //     const state = store.getState().allEntriesOneSquad;
  //     expect(state.loadStatus).toEqual('failed');
  //     expect(state.error).toEqual(error.message);
  //   });
  // })

  describe('fetchOneSquadEntries2', () => { 

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

    const tmntData: dataOneTmntType = {
      tmnt: {...initTmnt, id: 'abc'},
      events: [{...initEvent, id: '234', tmnt_id: 'abc'}],
      divs: [{...initDiv, id: '345', tmnt_id: 'abc'}],
      squads: [{...initSquad, id: '123', event_id: '234'}],
      lanes: [{...initLane, id: '456', squad_id: '123'}, {...initLane, id: '457', squad_id: '123'}],
      pots: [{...initPot, id: '567', squad_id: '123', div_id: '345'}],
      brkts: [{...initBrkt, id: '678', squad_id: '123', div_id: '345'}],
      elims: [{...initElim, id: '789', squad_id: '123', div_id: '345'}],
    }

    it('should handle fetchOneSquadEntries2 pending', async () => {
      // Arrange
      const squadId = '123';
      // const action = fetchOneSquadEntries2.pending(squadId, 'pending');
      const action = fetchOneSquadEntries2.pending(squadId, tmntData, 'pending');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().allEntriesOneSquad;
      expect(state.loadStatus).toEqual('loading');
      expect(state.error).toEqual('');
    });

    it('should handle fetchOneSquadEntries2 fulfilled', async () => {
      // Arrange
      const squadId = '123';
      const data = {
        origData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
          elimEntries: [],
        },
        curData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
          elimEntries: [],
        },
      };
      const action = fetchOneSquadEntries2.fulfilled(data, squadId, tmntData, 'succeeded');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().allEntriesOneSquad;
      expect(state.loadStatus).toEqual('succeeded');
      expect(state.entryData).toEqual(data);
    });

    it('should handle fetchOneSquadEntries2 rejected', async () => {
      // Arrange
      const error = new Error('Something went wrong');
      const reason = 'Failed to fetch squad entries';
      const action = fetchOneSquadEntries2.rejected(error, reason, tmntData, 'some error message');

      // Act
      store.dispatch(action);

      // Assert
      const state = store.getState().allEntriesOneSquad;
      expect(state.loadStatus).toEqual('failed');
      expect(state.error).toEqual(error.message);
    });
  })

  describe('SaveOneSquadEntries', () => { 

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
          brktLists: [],
          elimEntries: [],
        },
        curData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
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
          brktLists: [],
          elimEntries: [],
        },
        curData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
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
          brktLists: [],
          elimEntries: [],
        },
        curData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
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

  })

  describe('reducers', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          allEntriesOneSquad: allEntriesOneSquadSlice.reducer,
        },        
      });
    });    

    it("should handle updatePlayers", () => {
      const editedPlayers = cloneDeep(mockOrigData.players)
      editedPlayers[0].first_name = 'Anna';
      store.dispatch(updatePlayers(editedPlayers));
      const state = store.getState().allEntriesOneSquad.entryData;
      expect(state).toBeDefined();
      if (!state) return; 
      expect(state.curData.players).toEqual(editedPlayers);
      expect(state.origData.players).toEqual(editedPlayers);
    });

    it("should handle updateDivEntries", () => {
      const editedDivEntries = cloneDeep(mockOrigData.divEntries)
      editedDivEntries[0].fee = '81';
      store.dispatch(updateDivEntries(editedDivEntries));
      const state = store.getState().allEntriesOneSquad.entryData;
      expect(state).toBeDefined();
      if (!state) return; 
      expect(state.curData.divEntries).toEqual(editedDivEntries);
      expect(state.origData.divEntries).toEqual(editedDivEntries);
    });

    it('should handle updatePotEntries', () => { 
      const editedPotEntries = cloneDeep(mockOrigData.potEntries)
      editedPotEntries[0].fee = '21';
      store.dispatch(updatePotEntries(editedPotEntries));
      const state = store.getState().allEntriesOneSquad.entryData;
      expect(state).toBeDefined();
      if (!state) return; 
      expect(state.curData.potEntries).toEqual(editedPotEntries);
      expect(state.origData.potEntries).toEqual(editedPotEntries);
    })

    it('should handle updateBrktEntries', () => { 
      const editedBrktEntries = cloneDeep(mockOrigData.brktEntries)
      editedBrktEntries[0].num_brackets = 1;
      editedBrktEntries[0].fee = '5';
      store.dispatch(updateBrktEntries(editedBrktEntries));
      const state = store.getState().allEntriesOneSquad.entryData;
      expect(state).toBeDefined();
      if (!state) return; 
      expect(state.curData.brktEntries).toEqual(editedBrktEntries);
      expect(state.origData.brktEntries).toEqual(editedBrktEntries);
    })

    it('should handle updateElimEntries', () => { 
      const editedElimEntries = cloneDeep(mockOrigData.elimEntries)
      editedElimEntries[0].fee = '6';
      store.dispatch(updateElimEntries(editedElimEntries));
      const state = store.getState().allEntriesOneSquad.entryData;
      expect(state).toBeDefined();
      if (!state) return; 
      expect(state.curData.elimEntries).toEqual(editedElimEntries);
      expect(state.origData.elimEntries).toEqual(editedElimEntries);
    })
  })

  describe('selectors', () => { 

    beforeEach(() => {
      store = configureStore({
        reducer: {
          allEntriesOneSquad: allEntriesOneSquadSlice.reducer,
        },
        preloadedState: {
          allEntriesOneSquad: initialState
        }
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    
    it('selectOneSquadEntries should return games from state', () => {
      const state = store.getState();
      expect(selectOneSquadEntries(state)).toEqual(initialState.entryData);
    });
    it('getOneSquadEntriesLoadStatus should return load status from state', () => {
      const state = store.getState();
      expect(getOneSquadEntriesLoadStatus(state)).toBe('idle');
    });
    it('getOneSquadEntriesSaveStatus should return save status from state', () => {
      const state = store.getState();
      expect(getOneSquadEntriesSaveStatus(state)).toBe('idle');
    });  
    it('getOneSquadEntriesError should return error from state', () => {
      const state = store.getState();
      expect(getOneSquadEntriesError(state)).toBe('');
    });
    it('getOneSquadEntriesUpdatedInfo should return UpdatedInfo from state', () => {
      const state = store.getState();
      expect(getOneSquadEntriesUpdatedInfo(state)).toStrictEqual(allEntriesNoUpdates);
    });

    it('selectOneSquadEntries should return the loaded entries from state', () => {
      const mockPayload = cloneDeep(mockOrigData);
      store.dispatch({
        type: 'allEntriesOneSquad/fetchOneSquadEntries/fulfilled',
        payload: mockPayload
      });
      const state = store.getState();
      expect(selectOneSquadEntries(state)).toStrictEqual(mockPayload);
      expect(getOneSquadEntriesLoadStatus(state)).toBe('succeeded');
    });
    it('selectOneSquadEntries should return updated load status from state', () => {
      store.dispatch({
        type: 'allEntriesOneSquad/fetchOneSquadEntries/pending'
      });
      const state = store.getState(); 
      expect(getOneSquadEntriesLoadStatus(state)).toBe('loading');
    });
    it('selectOneSquadEntries should return the updated loading error from state', () => {
      store.dispatch({
        type: 'allEntriesOneSquad/fetchOneSquadEntries/rejected',
        error: { message: 'Failed to fetch' }
      });
      const state = store.getState(); 
      expect(getOneSquadEntriesLoadStatus(state)).toBe('failed');
      expect(state.allEntriesOneSquad.error).toBe('Failed to fetch');
    });    

    it('selectOneSquadEntries should return the loaded entries from state', () => {
      const mockPayload = cloneDeep(mockOrigData);
      store.dispatch({
        type: 'allEntriesOneSquad/saveOneSquadEntries/fulfilled',
        payload: { rows: [], data: mockPayload }
      });
      const state = store.getState();      
      expect(getOneSquadEntriesSaveStatus(state)).toBe('succeeded');        
    });

    it('selectOneSquadEntries should return updated save status from state', () => {
      store.dispatch({
        type: 'allEntriesOneSquad/saveOneSquadEntries/pending'
      });
      const state = store.getState(); 
      expect(getOneSquadEntriesSaveStatus(state)).toBe('saving');      
    });
    it('selectOneSquadEntries should return the updated save error from state', () => {
      store.dispatch({
        type: 'allEntriesOneSquad/saveOneSquadEntries/rejected',
        error: { message: 'Failed to save' }
      });
      const state = store.getState(); 
      expect(getOneSquadEntriesSaveStatus(state)).toBe('failed');
      expect(state.allEntriesOneSquad.error).toBe('Failed to save');
    });    

    it('should get the updated info from state', () => { 
      // Arrange
      const rows: (typeof playerEntryData)[] = [];
      const data = {
        origData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
          elimEntries: [],
        },
        curData: {
          squadId: '123',
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          brktLists: [],
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
      
      const fullState = store.getState();
      expect(getOneSquadEntriesUpdatedInfo(fullState)).toEqual(updatedInfo);
    })

  })
});