import { configureStore, Store } from '@reduxjs/toolkit';
import { userSlice, fetchUser } from '@/redux/features/user/userSlice';
import { blankUser } from "@/lib/db/initVals";
import { cloneDeep } from 'lodash';
import { User } from '@prisma/client';

const initialState = {
  user: cloneDeep(blankUser),
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

describe('userSlice', () => {
  let store: Store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice.reducer,
      },
    });
  });

  it('should handle initial state', async () => {
    expect(store.getState().user).toEqual(initialState);
  });

  it('should handle fetchUser.pending', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const action = fetchUser.pending(userId, 'pending');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchUser.fulfilled', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const userData = cloneDeep(blankUser);    
    const action = fetchUser.fulfilled(userData as any as User, userId, 'succeeded');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe('succeeded');
    expect(state.user).toEqual(userData);
    expect(state.error).toBe('');
  });

  it('should handle fetchUser.rejected', () => {
    // Arrange
    const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
    const error = new Error('Something went wrong');
    const reason = 'Failed to fetch user data';
    const action = fetchUser.rejected(error, reason, userId);

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe('failed');
    expect(state.error).toBe(error.message);
  });

});