import reducer, {
  userTmntSliceState,
  fetchUserTmnts,
  deleteUserTmnt,
  selectUserTmnts,
  getUserTmntsRequestedUserId,
  getUserTmntsUserId,
  getUserTmntStatus,
  getUserTmntDeleteStatus,
  getUserTmntError,
} from "@/redux/features/userTmnts/userTmntsSlice";
import { RootState } from "@/redux/store";
import { ioStatusType } from "@/redux/statusTypes";
import { deleteTmnt, getUserTmnts } from "@/lib/db/tmnts/dbTmnts";
import { ioDataError } from "@/lib/enums/enums";
import type { tmntsListType } from "@/lib/types/types";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/tmnts/dbTmnts");

const mockedGetUserTmnts = jest.mocked(getUserTmnts);
const mockedDeleteTmnt = jest.mocked(deleteTmnt);

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
// db functions are mocked, so this id only needs to differ from userId
const otherUserId = "usr_00000000000000000000000000000099";

const tmntData: tmntsListType[] = [
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: userId,
    tmnt_name: "Gold Pin",
    start_date_str: "2023-08-19",
    bowl: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
    },
  },
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",
    user_id: userId,
    tmnt_name: "Yosemite 6 Gamer",
    start_date_str: "2022-01-02",
    bowl: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanes.com",
    },
  },
];

const otherUserTmnts: tmntsListType[] = [
  {
    ...tmntData[0],
    id: "tmt_00000000000000000000000000000003",
    user_id: otherUserId,
    tmnt_name: "Other User Tournament",
  },
];

const tmntToDelete = tmntData[0].id;

const makeStore = (preloaded?: userTmntSliceState) =>
  configureStore({
    reducer: { userTmnts: reducer },
    preloadedState: preloaded ? { userTmnts: preloaded } : undefined,
  });

describe("userTmntsSlice reducer + thunk", () => {
  const initialState: userTmntSliceState = {
    userTmnts: [],
    requestedUserId: "",
    userId: "",
    status: "idle",
    deleteStatus: "idle",
    error: "",
  };

  // state after a successful load of userId
  const loadedState: userTmntSliceState = {
    ...initialState,
    userTmnts: tmntData,
    requestedUserId: userId,
    userId: userId,
    status: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    describe("fetchUserTmnts", () => {
      // action creators take (requestId, arg) for pending and rejected,
      // and (payload, requestId, arg) for fulfilled
      it("should handle fetchUserTmnts.pending", () => {
        const state = reducer(
          { ...initialState, error: "old error" },
          fetchUserTmnts.pending("requestId", userId),
        );

        expect(state.status).toBe("loading");
        expect(state.requestedUserId).toBe(userId);
        expect(state.userId).toBe("");
        expect(state.error).toBe("");
        expect(state.userTmnts).toEqual([]);
      });

      it("fetchUserTmnts.pending keeps the previously loaded tmnts", () => {
        const state = reducer(loadedState, fetchUserTmnts.pending("requestId", otherUserId));

        expect(state.status).toBe("loading");
        expect(state.requestedUserId).toBe(otherUserId);
        expect(state.userId).toBe(userId);
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("should handle fetchUserTmnts.fulfilled", () => {
        const pendingState = reducer(initialState, fetchUserTmnts.pending("requestId", userId));

        const state = reducer(
          pendingState,
          fetchUserTmnts.fulfilled(tmntData, "requestId", userId),
        );

        expect(state.status).toBe("succeeded");
        expect(state.requestedUserId).toBe(userId);
        expect(state.userId).toBe(userId);
        expect(state.error).toBe("");
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("should handle fetchUserTmnts.rejected", () => {
        const pendingState = reducer(initialState, fetchUserTmnts.pending("requestId", userId));

        const state = reducer(
          pendingState,
          fetchUserTmnts.rejected(new Error("Something went wrong"), "requestId", userId),
        );

        expect(state.status).toBe("failed");
        expect(state.requestedUserId).toBe(userId);
        expect(state.userId).toBe("");
        expect(state.error).toBe("Something went wrong");
        expect(state.userTmnts).toEqual([]);
      });

      it("fetchUserTmnts.rejected keeps the previously loaded tmnts", () => {
        const state = reducer(
          { ...loadedState, requestedUserId: otherUserId, status: "loading" },
          fetchUserTmnts.rejected(new Error("Something went wrong"), "requestId", otherUserId),
        );

        expect(state.status).toBe("failed");
        expect(state.userId).toBe(userId);
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("ignores a stale fetchUserTmnts.fulfilled for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedUserId: otherUserId, status: "loading" },
          fetchUserTmnts.fulfilled([], "requestId", userId),
        );

        expect(state.status).toBe("loading");
        expect(state.userId).toBe(userId);
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("ignores a stale fetchUserTmnts.rejected for an older request", () => {
        const state = reducer(
          { ...loadedState, requestedUserId: otherUserId, status: "loading" },
          fetchUserTmnts.rejected(new Error("Something went wrong"), "requestId", userId),
        );

        expect(state.status).toBe("loading");
        expect(state.error).toBe("");
      });
    });

    describe("deleteUserTmnt", () => {
      it("should handle deleteUserTmnt.pending", () => {
        const state = reducer(
          { ...loadedState, error: "old error" },
          deleteUserTmnt.pending("requestId", tmntToDelete),
        );

        expect(state.deleteStatus).toBe("deleting");
        expect(state.status).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("should handle deleteUserTmnt.fulfilled", () => {
        const state = reducer(
          loadedState,
          deleteUserTmnt.fulfilled(tmntToDelete, "requestId", tmntToDelete),
        );

        expect(state.deleteStatus).toBe("succeeded");
        expect(state.status).toBe("succeeded");
        expect(state.error).toBe("");
        expect(state.userTmnts).toEqual([tmntData[1]]);
      });

      it("deleteUserTmnt.fulfilled for a tmnt not in the list changes nothing else", () => {
        const state = reducer(
          loadedState,
          deleteUserTmnt.fulfilled("tmt_notInList", "requestId", "tmt_notInList"),
        );

        expect(state.deleteStatus).toBe("succeeded");
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("should handle deleteUserTmnt.rejected", () => {
        const state = reducer(
          loadedState,
          deleteUserTmnt.rejected(new Error("Something went wrong"), "requestId", tmntToDelete),
        );

        expect(state.deleteStatus).toBe("failed");
        expect(state.error).toBe("Something went wrong");
        expect(state.userTmnts).toEqual(tmntData);
      });

      it("a failed delete does not change the load status", () => {
        const state = reducer(
          loadedState,
          deleteUserTmnt.rejected(new Error("Something went wrong"), "requestId", tmntToDelete),
        );

        expect(state.status).toBe("succeeded");
      });
    });
  });

  describe("selectors", () => {
    const selectorState = {
      userTmnts: {
        userTmnts: tmntData,
        requestedUserId: otherUserId,
        userId: userId,
        status: "succeeded" as ioStatusType,
        deleteStatus: "failed" as ioStatusType,
        error: "test error",
      },
    } as RootState;

    it("selectUserTmnts returns the tmnts array", () => {
      expect(selectUserTmnts(selectorState)).toBe(tmntData);
    });

    it("getUserTmntsRequestedUserId returns the requested user id", () => {
      expect(getUserTmntsRequestedUserId(selectorState)).toBe(otherUserId);
    });

    it("getUserTmntsUserId returns the loaded user id", () => {
      expect(getUserTmntsUserId(selectorState)).toBe(userId);
    });

    it("getUserTmntStatus returns the load status", () => {
      expect(getUserTmntStatus(selectorState)).toBe("succeeded");
    });

    it("getUserTmntDeleteStatus returns the delete status", () => {
      expect(getUserTmntDeleteStatus(selectorState)).toBe("failed");
    });

    it("getUserTmntError returns the error", () => {
      expect(getUserTmntError(selectorState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchUserTmnts", () => {
    it("dispatches fulfilled when getUserTmnts resolves", async () => {
      mockedGetUserTmnts.mockResolvedValueOnce(tmntData);
      const store = makeStore();

      const action = await store.dispatch(fetchUserTmnts(userId) as any);

      expect(fetchUserTmnts.fulfilled.match(action)).toBe(true);

      const state = store.getState().userTmnts;

      expect(mockedGetUserTmnts).toHaveBeenCalledTimes(1);
      expect(mockedGetUserTmnts).toHaveBeenCalledWith(userId);
      expect(state.status).toBe("succeeded");
      expect(state.userId).toBe(userId);
      expect(state.error).toBe("");
      expect(state.userTmnts).toEqual(tmntData);
    });

    it("dispatches fulfilled when getUserTmnts resolves an empty array", async () => {
      mockedGetUserTmnts.mockResolvedValueOnce([]);
      const store = makeStore();

      const action = await store.dispatch(fetchUserTmnts(userId) as any);

      expect(fetchUserTmnts.fulfilled.match(action)).toBe(true);
      expect(store.getState().userTmnts.status).toBe("succeeded");
      expect(store.getState().userTmnts.userTmnts).toEqual([]);
    });

    it("dispatches rejected when getUserTmnts rejects", async () => {
      mockedGetUserTmnts.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore();

      const action = await store.dispatch(fetchUserTmnts(userId) as any);

      expect(fetchUserTmnts.rejected.match(action)).toBe(true);

      const state = store.getState().userTmnts;

      expect(state.status).toBe("failed");
      expect(state.requestedUserId).toBe(userId);
      expect(state.userId).toBe("");
      expect(state.error).toBe("DB failed");
      expect(state.userTmnts).toEqual([]);
    });

    it("loading a second user replaces the first", async () => {
      mockedGetUserTmnts
        .mockResolvedValueOnce(tmntData)
        .mockResolvedValueOnce(otherUserTmnts);
      const store = makeStore();

      await store.dispatch(fetchUserTmnts(userId) as any);
      await store.dispatch(fetchUserTmnts(otherUserId) as any);

      const state = store.getState().userTmnts;

      expect(mockedGetUserTmnts).toHaveBeenNthCalledWith(1, userId);
      expect(mockedGetUserTmnts).toHaveBeenNthCalledWith(2, otherUserId);
      expect(state.userId).toBe(otherUserId);
      expect(state.userTmnts).toEqual(otherUserTmnts);
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: tmntsListType[]) => void;
      const firstResponse = new Promise<tmntsListType[]>((resolve) => {
        resolveFirst = resolve;
      });

      mockedGetUserTmnts
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(otherUserTmnts);
      const store = makeStore();

      // start userId, then otherUserId; otherUserId finishes first
      const firstDispatch = store.dispatch(fetchUserTmnts(userId) as any);
      await store.dispatch(fetchUserTmnts(otherUserId) as any);

      // now the older userId response arrives late
      resolveFirst(tmntData);
      await firstDispatch;

      const state = store.getState().userTmnts;

      expect(state.status).toBe("succeeded");
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.userId).toBe(otherUserId);
      expect(state.userTmnts).toEqual(otherUserTmnts);
    });
  });

  describe("Thunk tests deleteUserTmnt", () => {
    it("dispatches fulfilled and removes the tmnt when deleteTmnt succeeds", async () => {
      mockedDeleteTmnt.mockResolvedValueOnce(ioDataError.NONE);
      const store = makeStore(loadedState);

      const action = await store.dispatch(deleteUserTmnt(tmntToDelete) as any);

      expect(deleteUserTmnt.fulfilled.match(action)).toBe(true);

      const state = store.getState().userTmnts;

      expect(mockedDeleteTmnt).toHaveBeenCalledTimes(1);
      expect(mockedDeleteTmnt).toHaveBeenCalledWith(tmntToDelete);
      expect(state.deleteStatus).toBe("succeeded");
      expect(state.status).toBe("succeeded");
      expect(state.error).toBe("");
      expect(state.userTmnts).toEqual([tmntData[1]]);
    });

    it("dispatches rejected and keeps the tmnt when deleteTmnt returns an error code", async () => {
      mockedDeleteTmnt.mockResolvedValueOnce(ioDataError.TMNT);
      const store = makeStore(loadedState);

      const action = await store.dispatch(deleteUserTmnt(tmntToDelete) as any);

      expect(deleteUserTmnt.rejected.match(action)).toBe(true);

      const state = store.getState().userTmnts;

      expect(state.deleteStatus).toBe("failed");
      expect(state.status).toBe("succeeded");
      expect(state.error).toBe("Error deleting tournament");
      expect(state.userTmnts).toEqual(tmntData);
    });

    it("dispatches rejected and keeps the tmnt when deleteTmnt rejects", async () => {
      mockedDeleteTmnt.mockRejectedValueOnce(new Error("DB failed"));
      const store = makeStore(loadedState);

      const action = await store.dispatch(deleteUserTmnt(tmntToDelete) as any);

      expect(deleteUserTmnt.rejected.match(action)).toBe(true);

      const state = store.getState().userTmnts;

      expect(state.deleteStatus).toBe("failed");
      expect(state.status).toBe("succeeded");
      expect(state.error).toBe("DB failed");
      expect(state.userTmnts).toEqual(tmntData);
    });
  });
});


// import { configureStore, Store } from '@reduxjs/toolkit';
// import { userTmntsSlice, fetchUserTmnts, deleteUserTmnt } from '@/redux/features/userTmnts/userTmntsSlice';
// import type { tmntsListType } from '@/lib/types/types';

// const initialState = {
//   userTmnts: [],
//   status: "idle",  
//   error: "",
// };

// const tmntData: tmntsListType[] = [
//   {
//     id: "tmt_fd99387c33d9c78aba290286576ddce5",
//     user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
//     tmnt_name: "Gold Pin",
//     start_date_str: '2023-08-19',
//     bowl: {
//       bowl_name: "Earl Anthony's Dublin Bowl",
//       city: "Dublin",
//       state: "CA",
//       url: "https://www.earlanthonysdublinbowl.com",  
//     }    
//   },
//   {
//     id: "tmt_56d916ece6b50e6293300248c6792316",
//     user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
//     tmnt_name: "Yosemite 6 Gamer",
//     start_date_str: '2022-01-02',
//     bowl: {
//       bowl_name: "Yosemite Lanes",
//       city: "Modesto",
//       state: "CA",
//       url: "http://yosemitelanes.com",
//     }
//   }
// ]

// describe("userTmntsSlice", () => {
//   let store: Store;

//   beforeEach(() => {
//     store = configureStore({
//       reducer: {
//         userTmnts: userTmntsSlice.reducer,
//       },
//     });
//   });

//   it("should handle initial state", () => {
//     expect(store.getState().userTmnts).toEqual(initialState);
//   });

//   it('should handle fetchUserTmnts.pending', () => {
//     // Arrange
//     const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
//     const action = fetchUserTmnts.pending(userId, 'pending');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('loading');
//     expect(state.error).toBe('');
//   });

//   it('should handle fetchUserTmnts.fulfilled', () => {
//     // Arrange
//     const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
//     const action = fetchUserTmnts.fulfilled(tmntData, userId, 'fulfilled');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('succeeded');
//     expect(state.userTmnts).toEqual(tmntData);
//     expect(state.error).toBe('');
//   });

//   it('should handle fetchUserTmnts.rejected', () => {
//     // Arrange
//     const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde'
//     const error = new Error('Something went wrong');  
//     const action = fetchUserTmnts.rejected(error, userId, 'rejected');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('failed');
//     expect(state.error).toBe(error.message);
//   });

//   it('should handle deleteUserTmnt.pending', () => {
//     // Arrange
//     const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
//     const action = deleteUserTmnt.pending(tmntId, 'pending');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('deleting');
//     expect(state.error).toBe('');
//   });

//   it('should handle deleteUserTmnt.fulfilled', () => {
//     // Arrange
//     const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
//     const action = deleteUserTmnt.fulfilled(tmntId, tmntId, 'fulfilled');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('succeeded');
//     expect(state.error).toBe('');
//   });

//   it('should handle deleteUserTmnt.rejected', () => {
//     // Arrange
//     const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5'
//     const error = new Error('Something went wrong');  
//     const action = deleteUserTmnt.rejected(error, tmntId, 'rejected');

//     // Act
//     store.dispatch(action);    

//     // Assert   
//     const state = store.getState().userTmnts;
//     expect(state.status).toBe('failed');
//     expect(state.error).toBe(error.message);
//   });
// });