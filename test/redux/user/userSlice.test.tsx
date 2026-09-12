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

jest.mock("@/lib/db/users/dbUsers", () => ({
  getUserById: jest.fn(),
}));

const mockGetUserById = getUserById as jest.MockedFunction<
  typeof getUserById
>;

describe("userSlice", () => {
  const userId = "usr_123";

  const mockUser: userDataType = {
    ...cloneDeep(blankUserData),
    id: userId,
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@test.com",
    phone: "555-123-4567",
    role: "USER",
  };

  const initialState: userSliceState = {
    user: cloneDeep(blankUserData),
    requestedUserId: "",
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer", () => {
    it("returns the initial state", () => {
      const state = reducer(undefined, {
        type: "unknown",
      });

      expect(state).toEqual(initialState);
    });

    it("sets loadStatus, requestedUserId, and clears error when fetchUser is pending", () => {
      const previousState: userSliceState = {
        ...initialState,
        loadStatus: "idle",
        error: "Previous error",
      };

      const state = reducer(
        previousState,
        fetchUser.pending("requestId", userId),
      );

      expect(state.loadStatus).toBe("loading");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("");
      expect(state.user).toEqual(previousState.user);
      expect(state.saveStatus).toBe(previousState.saveStatus);
    });

    it("sets user and loadStatus when fetchUser is fulfilled", () => {
      const previousState: userSliceState = {
        ...initialState,
        requestedUserId: userId,
        loadStatus: "loading",
      };

      const state = reducer(
        previousState,
        fetchUser.fulfilled(
          mockUser,
          "requestId",
          userId,
        ),
      );

      expect(state.loadStatus).toBe("succeeded");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("");

      expect(state.user).toEqual({
        ...previousState.user,
        id: mockUser.id,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        email: mockUser.email,
        phone: mockUser.phone,
        role: mockUser.role,
      });
    });

    it("sets loadStatus and error when fetchUser is rejected", () => {
      const previousState: userSliceState = {
        ...initialState,
        requestedUserId: userId,
        loadStatus: "loading",
      };

      const error = new Error("Unable to load user");

      const state = reducer(
        previousState,
        fetchUser.rejected(
          error,
          "requestId",
          userId,
        ),
      );

      expect(state.loadStatus).toBe("failed");
      expect(state.requestedUserId).toBe(userId);
      expect(state.error).toBe("Unable to load user");
      expect(state.user).toEqual(previousState.user);
    });
  });

  describe("fetchUser", () => {
    it("calls getUserById with the user id", async () => {
      mockGetUserById.mockResolvedValue(mockUser);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await fetchUser(userId)(
        dispatch,
        getState,
        undefined,
      );

      expect(mockGetUserById).toHaveBeenCalledTimes(1);
      expect(mockGetUserById).toHaveBeenCalledWith(userId);
    });

    it("returns the user when getUserById succeeds", async () => {
      mockGetUserById.mockResolvedValue(mockUser);

      const dispatch = jest.fn();
      const getState = jest.fn();

      const result = await fetchUser(userId)(
        dispatch,
        getState,
        undefined,
      );

      expect(result.type).toBe("user/fetchUser/fulfilled");

      if (fetchUser.fulfilled.match(result)) {
        expect(result.payload).toEqual(mockUser);
      }
    });

    it("returns a rejected action when getUserById throws an error", async () => {
      mockGetUserById.mockRejectedValue(
        new Error("Database error"),
      );

      const dispatch = jest.fn();
      const getState = jest.fn();

      const result = await fetchUser(userId)(
        dispatch,
        getState,
        undefined,
      );

      expect(result.type).toBe("user/fetchUser/rejected");

      if (fetchUser.rejected.match(result)) {
        expect(result.error.message).toBe(
          "Database error",
        );
      }
    });
  });

  describe("selectors", () => {
    const userState: userSliceState = {
      user: cloneDeep(mockUser),
      requestedUserId: mockUser.id,
      loadStatus: "succeeded",
      saveStatus: "idle",
      error: "",
    };

    const rootState = {
      user: userState,
    } as RootState;

    it("selectUser returns the user slice", () => {
      expect(selectUser(rootState)).toEqual(userState);
    });

    it("getUserRequestId returns the requested user id", () => {
      expect(getUserRequestId(rootState)).toBe(
        mockUser.id,
      );
    });

    it("getUserLoadStatus returns the load status", () => {
      expect(getUserLoadStatus(rootState)).toBe(
        "succeeded",
      );
    });

    it("getUserError returns the error", () => {
      const stateWithError = {
        user: {
          ...userState,
          error: "Test error",
        },
      } as RootState;

      expect(getUserError(stateWithError)).toBe(
        "Test error",
      );
    });
  });
});
