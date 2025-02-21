import { configureStore, Store } from '@reduxjs/toolkit';
import { tmntsSlice, fetchTmnts } from '@/redux/features/tmnts/tmntsSlice';
import { tmntsListType } from "@/lib/types/types";

const initialState = {
  tmnts: [],
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
    user_id: "usr_516a113083983234fc316e31fb695b85",
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

describe("tmntsSlice", () => {
  let store: Store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tmnts: tmntsSlice.reducer,
      },
    });
  });

  it("should handle initial state", () => {
    expect(store.getState().tmnts).toEqual(initialState);
  });

  it('should handle fetchTmnts.pending', () => {
    // Arrange
    const yearStr = '2023';
    const action = fetchTmnts.pending( yearStr, 'pending');

    // Act
    store.dispatch(action);    

    // Assert   
    const state = store.getState().tmnts;
    expect(state.status).toBe('loading');
    expect(state.error).toBe('');
  });

  it('should handle fetchTmnts.fulfilled', () => {
    // Arrange
    const yearStr = '2023';
    const action = fetchTmnts.fulfilled(tmntData, yearStr, 'succeeded');
    
    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().tmnts;
    expect(state.status).toBe('succeeded');
    expect(state.error).toBe('');
    expect(state.tmnts).toEqual(tmntData);
  });

  it('should handle fetchTmnts.rejected', () => {
    // Arrange
    const error = new Error('Something went wrong');
    const reason = 'Failed to fetch tournament data';
    const action = fetchTmnts.rejected(error, reason, 'some error message');

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().tmnts;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(error.message);
  });

})