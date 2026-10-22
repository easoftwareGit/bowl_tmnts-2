import reducer, {
  fetchUser,
  getUserError,
  getUserLoadStatus,
  getUserRequestId,
  selectUser,
  type userSliceState,
} from "@/redux/features/user/userSlice";
import { blankUserData } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";
import type { userDataType } from "@/lib/types/types";
import { getUserById } from "@/lib/db/users/dbUsers";
import type { RootState } from "@/redux/store";
import { configureStore } from "@reduxjs/toolkit";

jest.mock("@/lib/db/users/dbUsers");

const mockedGetUserById = jest.mocked(getUserById);

// db functions are mocked, so these ids only need to be distinct
const userId = "usr_00000000000000000000000000000001";
const otherUserId = "usr_00000000000000000000000000000099";

const mockUser: userDataType = {
  ...cloneDeep(blankUserData),
  id: userId,
  first_name: "John",
  last_name: "Smith",
  email: "john.smith@test.com",
  phone: "555-123-4567",
  role: "USER",
};

const otherUser: userDataType = {
  ...cloneDeep(blankUserData),
  id: otherUserId,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane.doe@test.com",
  phone: "555-987-6543",
  role: "ADMIN",
};

// what the slice stores for a fetched user: a blank user plus the copied fields
const storedUser = (user: userDataType): userDataType => ({
  ...cloneDeep(blankUserData),
  id: user.id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const makeStore = () =>
  configureStore({
    reducer: { user: reducer },
  });

describe("userSlice reducer + thunk", () => {
  const initialState: userSliceState = {
    user: cloneDeep(blankUserData),
    requestedUserId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  // state after a successful load of userId
  const loadedState: userSliceState = {
    ...initialState,
    user: storedUser(mockUser),
    requestedUserId: userId,
    loadStatus: "succeeded",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer unit tests", () => {
    it("should return the initial state", () => {
      expect(reducer(undefined, { type: undefined as any })).toEqual(initialState);
    });

    it("should handle fetchUser.pending", () => {
      const state = reducer(
        { ...initialState, error: "Previous error" },
        fetchUser.pending("requestId", userId),
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("");
      expect(state.user).toEqual(initialState.user);
      expect(state.saveStatus).toBe("idle");
    });

    it("fetchUser.pending keeps the previously loaded user", () => {
      const state = reducer(loadedState, fetchUser.pending("requestId", otherUserId));

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.user).toEqual(storedUser(mockUser));
    });

    it("should handle fetchUser.fulfilled", () => {
      const pendingState = reducer(initialState, fetchUser.pending("requestId", userId));

      const state = reducer(
        pendingState,
        fetchUser.fulfilled(mockUser, "requestId", userId),
      );

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("");
      expect(state.user).toEqual(storedUser(mockUser));
    });

    it("fetchUser.fulfilled does not carry fields over from the previous user", () => {
      // give the loaded user a field fetchUser doesn't copy
      const prevState: userSliceState = {
        ...loadedState,
        requestedUserId: otherUserId,
        loadStatus: "loading",
        user: { ...storedUser(mockUser), password: "old-user-secret" } as userDataType,
      };

      const state = reducer(
        prevState,
        fetchUser.fulfilled(otherUser, "requestId", otherUserId),
      );

      expect(state.user).toEqual(storedUser(otherUser));
    });

    it("should handle fetchUser.rejected", () => {
      const pendingState = reducer(initialState, fetchUser.pending("requestId", userId));

      const state = reducer(
        pendingState,
        fetchUser.rejected(new Error("Unable to load user"), "requestId", userId),
      );

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("Unable to load user");
      expect(state.user).toEqual(initialState.user);
    });

    it("fetchUser.rejected keeps the previously loaded user", () => {
      const state = reducer(
        { ...loadedState, requestedUserId: otherUserId, loadStatus: "loading" },
        fetchUser.rejected(new Error("Unable to load user"), "requestId", otherUserId),
      );

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.user).toEqual(storedUser(mockUser));
    });

    it("ignores a stale fetchUser.fulfilled for an older request", () => {
      const state = reducer(
        { ...loadedState, requestedUserId: otherUserId, loadStatus: "loading" },
        fetchUser.fulfilled(storedUser(mockUser), "requestId", userId),
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.user).toEqual(storedUser(mockUser));
    });

    it("ignores a stale fetchUser.rejected for an older request", () => {
      const state = reducer(
        { ...loadedState, requestedUserId: otherUserId, loadStatus: "loading" },
        fetchUser.rejected(new Error("Unable to load user"), "requestId", userId),
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.error).toBe("");
    });
  });

  describe("selectors", () => {
    const userState: userSliceState = {
      user: storedUser(mockUser),
      requestedUserId: otherUserId,
      loadStatus: "succeeded",
      saveStatus: "idle",
      error: "test error",
    };

    const rootState = { user: userState } as RootState;

    it("selectUser returns the user slice", () => {
      expect(selectUser(rootState)).toBe(userState);
    });

    it("getUserRequestId returns the requested user id", () => {
      expect(getUserRequestId(rootState)).toBe(otherUserId);
    });

    it("getUserLoadStatus returns the load status", () => {
      expect(getUserLoadStatus(rootState)).toBe("succeeded");
    });

    it("getUserError returns the error", () => {
      expect(getUserError(rootState)).toBe("test error");
    });
  });

  describe("Thunk tests fetchUser", () => {
    it("dispatches fulfilled when getUserById resolves", async () => {
      mockedGetUserById.mockResolvedValueOnce(mockUser);
      const store = makeStore();

      const action = await store.dispatch(fetchUser(userId) as any);

      expect(fetchUser.fulfilled.match(action)).toBe(true);

      const state = store.getState().user;

      expect(mockedGetUserById).toHaveBeenCalledTimes(1);
      expect(mockedGetUserById).toHaveBeenCalledWith(userId);
      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("");
      expect(state.user).toEqual(storedUser(mockUser));
    });

    it("dispatches rejected when getUserById resolves null", async () => {
      mockedGetUserById.mockResolvedValueOnce(null as any);
      const store = makeStore();

      const action = await store.dispatch(fetchUser(userId) as any);

      expect(fetchUser.rejected.match(action)).toBe(true);

      const state = store.getState().user;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("User not found");
      expect(state.user).toEqual(initialState.user);
    });

    it("a user that isn't found does not leave the previous user looking loaded", async () => {
      mockedGetUserById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null as any);
      const store = makeStore();

      await store.dispatch(fetchUser(userId) as any);
      await store.dispatch(fetchUser(otherUserId) as any);

      const state = store.getState().user;

      expect(state.loadStatus).toBe("failed");
      expect(state.error).toBe("User not found");
      expect(state.requestedUserId).toBe(otherUserId);
    });

    it("dispatches rejected when getUserById rejects", async () => {
      mockedGetUserById.mockRejectedValueOnce(new Error("Database error"));
      const store = makeStore();

      const action = await store.dispatch(fetchUser(userId) as any);

      expect(fetchUser.rejected.match(action)).toBe(true);

      const state = store.getState().user;

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("Database error");
      expect(state.user).toEqual(initialState.user);
    });

    it("loading a second user replaces the first", async () => {
      mockedGetUserById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(otherUser);
      const store = makeStore();

      await store.dispatch(fetchUser(userId) as any);
      await store.dispatch(fetchUser(otherUserId) as any);

      const state = store.getState().user;

      expect(mockedGetUserById).toHaveBeenNthCalledWith(1, userId);
      expect(mockedGetUserById).toHaveBeenNthCalledWith(2, otherUserId);
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.user).toEqual(storedUser(otherUser));
    });

    it("ignores an out-of-order response from an older request", async () => {
      let resolveFirst!: (value: userDataType) => void;
      const firstResponse = new Promise<userDataType>((resolve) => {
        resolveFirst = resolve;
      });

      mockedGetUserById
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce(otherUser);
      const store = makeStore();

      // start userId, then otherUserId; otherUserId finishes first
      const firstDispatch = store.dispatch(fetchUser(userId) as any);
      await store.dispatch(fetchUser(otherUserId) as any);

      // now the older userId response arrives late
      resolveFirst(mockUser);
      await firstDispatch;

      const state = store.getState().user;

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedUserId).toBe(otherUserId);
      expect(state.user).toEqual(storedUser(otherUser));
    });
  });
});
