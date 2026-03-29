import { configureStore, Store } from "@reduxjs/toolkit";
import { userSlice, fetchUser } from "@/redux/features/user/userSlice";
import { blankUserData } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";
import type { userDataType } from "@/lib/types/types";

const initialState = {
  user: cloneDeep(blankUserData),
  loadStatus: "idle",
  saveStatus: "idle",
  error: "",
};

describe("userSlice", () => {
  let store: Store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice.reducer,
      },
    });
  });

  it("should handle initial state", async () => {
    expect(store.getState().user).toEqual(initialState);
  });

  it("should handle fetchUser.pending", () => {
    // Arrange
    const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
    const action = fetchUser.pending(userId, "pending");

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe("loading");
    expect(state.error).toBe("");
  });

  it("should handle fetchUser.fulfilled", () => {
    // Arrange
    const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
    const userData: userDataType = {
      ...cloneDeep(blankUserData),
      id: userId,
      first_name: "Eric",
      last_name: "Adolphson",
      email: "eric@example.com",
      phone: "925-555-1212",
      role: "USER",
    };
    const action = fetchUser.fulfilled(userData, userId, "succeeded");

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe("succeeded");
    expect(state.user).toEqual(userData);
    expect(state.error).toBe("");
  });

  it("should handle fetchUser.fulfilled with null payload", () => {
    // Arrange
    const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
    const action = fetchUser.fulfilled(null, userId, "succeeded");

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe("succeeded");
    expect(state.user).toEqual(initialState.user);
    expect(state.error).toBe("");
  });

  it("should handle fetchUser.rejected", () => {
    // Arrange
    const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
    const error = new Error("Something went wrong");
    const reason = "Failed to fetch user data";
    const action = fetchUser.rejected(error, reason, userId);

    // Act
    store.dispatch(action);

    // Assert
    const state = store.getState().user;
    expect(state.loadStatus).toBe("failed");
    expect(state.error).toBe(error.message);
  });
});
