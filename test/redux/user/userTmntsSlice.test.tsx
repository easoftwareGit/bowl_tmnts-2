import { configureStore, Store } from '@reduxjs/toolkit';
import { userTmntsSlice, fetchUserTmnts, deleteUserTmnt} from '@/redux/features/userTmnts/userTmntsSlice';
import { tmntsListType } from '@/lib/types/types';

const initialState = {
  userTmnts: [],
  status: "idle",  
  error: "",
};

const tmntData: tmntsListType[] = [
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    start_date_str: '2023-08-19',
    bowls: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",  
    }    
  },
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Yosemite 6 Gamer",
    start_date_str: '2022-01-02',
    bowls: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanes.com",
    }
  }
]


describe("userTmntsSlice", () => {
  let store: Store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        userTmnts: userTmntsSlice.reducer,
      },
    });
  });

  it("should handle initial state", () => {
    expect(store.getState().userTmnts).toEqual(initialState);
  });

  it('should handle fetchUserTmnts.pending', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const action = fetchUserTmnts.pending(userId, 'pending');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchUserTmnts.fulfilled', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const action = fetchUserTmnts.fulfilled(tmntData, userId, 'fulfilled');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('succeeded');
    expect(state.userTmnts).toEqual(tmntData);
    expect(state.error).toBe('');
  });

  it('should handle fetchUserTmnts.rejected', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const error = new Error('Something went wrong');  
    const action = fetchUserTmnts.rejected(error, userId, 'rejected');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(error.message);
  });

  it('should handle deleteUserTmnt.pending', () => {
    // Arrange
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
    const action = deleteUserTmnt.pending(tmntId, 'pending');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('deleting');
    expect(state.error).toBe('');
  });

  it('should handle deleteUserTmnt.fulfilled', () => {
    // Arrange
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
    const action = deleteUserTmnt.fulfilled(tmntId, tmntId, 'fulfilled');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBe('');
  });

  it('should handle deleteUserTmnt.rejected', () => {
    // Arrange
    const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
    const error = new Error('Something went wrong');  
    const action = deleteUserTmnt.rejected(error, tmntId, 'rejected');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().userTmnts;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(error.message);
  });
});