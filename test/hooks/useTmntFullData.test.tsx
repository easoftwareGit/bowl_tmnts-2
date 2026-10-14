import { act, renderHook, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import tmntFullDataReducer, {
  fetchTmntFullData,
  saveTmntFullData,
  type tmntFullDataState,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import {
  mockTmntFullData,
  tmntId,
} from "../mocks/tmnts/tmntFullData/mockTmntFullData";

jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
  getTmntFullData: jest.fn(),
}));

const mockedGetTmntFullData = jest.mocked(getTmntFullData);

function renderTmntHook(
  id: string,
  stateOverrides: Partial<tmntFullDataState> = {},
) {
  const initialState = tmntFullDataReducer(undefined, { type: "@@INIT" });
  const store = configureStore({
    reducer: { tmntFullData: tmntFullDataReducer },
    preloadedState: {
      tmntFullData: { ...initialState, ...stateOverrides },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return { ...renderHook(() => useTmntFullData(id), { wrapper }), store };
}

// same store setup as renderTmntHook, but lets the test change the id after mount
function renderTmntHookChangingId(initialId: string) {
  const initialState = tmntFullDataReducer(undefined, { type: "@@INIT" });
  const store = configureStore({
    reducer: { tmntFullData: tmntFullDataReducer },
    preloadedState: { tmntFullData: initialState },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    ...renderHook(({ id }: { id: string }) => useTmntFullData(id), {
      wrapper,
      initialProps: { id: initialId },
    }),
    store,
  };
}

describe("useTmntFullData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetTmntFullData.mockResolvedValue(mockTmntFullData);
  });

  it("fetches the tournament when it has not been loaded", async () => {
    const { result, store } = renderTmntHook(tmntId);

    await waitFor(() => expect(result.current.hasData).toBe(true));

    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
    expect(result.current.data).toEqual(mockTmntFullData);
    expect(result.current.failed).toBe(false);
    expect(store.getState().tmntFullData.loadStatus).toBe("succeeded");
  });

  it("uses the loaded tournament without fetching it again", () => {
    const { result } = renderTmntHook(tmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "succeeded",
    });

    expect(result.current.data).toEqual(mockTmntFullData);
    expect(result.current.hasData).toBe(true);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("does not start another fetch while a fetch is loading", () => {
    const { result } = renderTmntHook(tmntId, {
      requestedTmntId: tmntId,
      loadStatus: "loading",
    });

    expect(result.current.hasData).toBe(false);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("reports a failure for this tournament without automatically retrying", () => {
    const error = "Unable to load tournament";
    const { result, rerender } = renderTmntHook(tmntId, {
      requestedTmntId: tmntId,
      loadStatus: "failed",
      error,
    });

    expect(result.current.hasData).toBe(false);
    expect(result.current.failed).toBe(true);
    expect(result.current.error).toBe(error);

    rerender();
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("reports a rejected fetch and does not start a fetch loop", async () => {
    mockedGetTmntFullData.mockRejectedValue(new Error("Database unavailable"));
    const { result, rerender } = renderTmntHook(tmntId);

    await waitFor(() => expect(result.current.failed).toBe(true));

    expect(result.current.hasData).toBe(false);
    expect(result.current.error).toBe("Database unavailable");
    rerender();
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
  });

  it("retries a failed request when retry is called", async () => {
    const { result } = renderTmntHook(tmntId, {
      requestedTmntId: tmntId,
      loadStatus: "failed",
      error: "Unable to load tournament",
    });

    expect(mockedGetTmntFullData).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(result.current.failed).toBe(false);
    expect(result.current.error).toBe("");
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
  });

  it("fetches a different tournament when another tournament is loaded", async () => {
    const otherTmntId = "tmt_another_tournament";
    const otherTmntData = {
      ...mockTmntFullData,
      tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
    };
    mockedGetTmntFullData.mockResolvedValue(otherTmntData);

    const { result } = renderTmntHook(otherTmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "succeeded",
    });

    await waitFor(() => expect(result.current.hasData).toBe(true));

    expect(result.current.data).toEqual(otherTmntData);
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockedGetTmntFullData).toHaveBeenCalledWith(otherTmntId);
  });

  it("fetches when a previous failure belongs to another tournament", async () => {
    const { result } = renderTmntHook(tmntId, {
      requestedTmntId: "tmt_previous_tournament",
      loadStatus: "failed",
      error: "Previous request failed",
    });

    await waitFor(() => expect(result.current.hasData).toBe(true));

    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
  });

  it("returns a blank tournament object, not undefined, before anything is loaded", () => {
    mockedGetTmntFullData.mockReturnValue(new Promise<never>(() => {}));
    const { result } = renderTmntHook(tmntId);

    expect(result.current.data).toBeDefined();
    expect(result.current.data.tmnt.id).toBe("");
    expect(result.current.hasData).toBe(false);
  });

  it("sets the load status to loading and fetches once while the request is pending", () => {
    mockedGetTmntFullData.mockReturnValue(new Promise<never>(() => {}));
    const { result, store, rerender } = renderTmntHook(tmntId);

    expect(store.getState().tmntFullData.loadStatus).toBe("loading");
    expect(store.getState().tmntFullData.requestedTmntId).toBe(tmntId);
    expect(result.current.hasData).toBe(false);
    expect(result.current.failed).toBe(false);

    rerender();
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
  });

  it("does not fetch again after the tournament has loaded and the hook re-renders", async () => {
    const { result, rerender } = renderTmntHook(tmntId);
    await waitFor(() => expect(result.current.hasData).toBe(true));

    rerender();
    rerender();

    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
  });

  it("fetches the new tournament when the tmntId changes after a tournament has loaded", async () => {
    const otherTmntId = "tmt_another_tournament";
    const otherTmntData = {
      ...mockTmntFullData,
      tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
    };
    mockedGetTmntFullData
      .mockResolvedValueOnce(mockTmntFullData)
      .mockResolvedValueOnce(otherTmntData);

    const { result, rerender } = renderTmntHookChangingId(tmntId);
    await waitFor(() => expect(result.current.hasData).toBe(true));

    rerender({ id: otherTmntId });

    // the loaded tournament is not the one asked for, so hasData drops right away
    expect(result.current.hasData).toBe(false);

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(result.current.data).toEqual(otherTmntData);
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(2);
    expect(mockedGetTmntFullData).toHaveBeenLastCalledWith(otherTmntId);
  });

  it("treats the tournament as loaded when a later request failed for the same id", () => {
    const { result } = renderTmntHook(tmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "failed",
      error: "Refresh failed",
    });

    expect(result.current.hasData).toBe(true);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("keeps failed true and shows the new error when a retry fails again", async () => {
    mockedGetTmntFullData.mockRejectedValue(new Error("Still down"));
    const { result } = renderTmntHook(tmntId, {
      requestedTmntId: tmntId,
      loadStatus: "failed",
      error: "First failure",
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.error).toBe("Still down"));
    expect(result.current.failed).toBe(true);
    expect(result.current.hasData).toBe(false);
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
  });

  it("does not start a fetch while a request for another tournament is loading", () => {
    // documents current behavior: the hook waits for the in-flight request to finish
    const { result } = renderTmntHook(tmntId, {
      requestedTmntId: "tmt_previous_tournament",
      loadStatus: "loading",
    });

    expect(result.current.hasData).toBe(false);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("does not fetch or report data when the tmntId is empty", () => {
    const { result } = renderTmntHook("");

    expect(result.current.hasData).toBe(false);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("keeps the same retry function between renders", () => {
    const { result, rerender } = renderTmntHook(tmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "succeeded",
    });

    const firstRetry = result.current.retry;
    rerender();

    expect(result.current.retry).toBe(firstRetry);
  });

  it("fetches its own tournament once a request for another tournament finishes", async () => {
    const previousId = "tmt_previous_tournament";
    const previousData = {
      ...mockTmntFullData,
      tmnt: { ...mockTmntFullData.tmnt, id: previousId },
    };
    const { result, store } = renderTmntHook(tmntId, {
      requestedTmntId: previousId,
      loadStatus: "loading",
    });
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();

    // the other tournament's request finishes
    act(() => {
      store.dispatch(
        fetchTmntFullData.fulfilled(previousData, "req-previous", previousId)
      );
    });

    await waitFor(() => expect(result.current.hasData).toBe(true));
    expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
    expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
    expect(result.current.data.tmnt.id).toBe(tmntId);
  });

  it("reflects saved tournament data without fetching again", () => {
    const { result, store } = renderTmntHook(tmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "succeeded",
    });
    const saved = {
      ...mockTmntFullData,
      tmnt: { ...mockTmntFullData.tmnt, tmnt_name: "Renamed Tournament" },
    };

    act(() => {
      store.dispatch(saveTmntFullData.fulfilled(saved, "req-save", saved));
    });

    expect(result.current.data.tmnt.tmnt_name).toBe("Renamed Tournament");
    expect(result.current.hasData).toBe(true);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });

  it("ignores a failed save when the tournament is loaded", () => {
    // the save thunks write to the same error field as the load thunk
    const { result } = renderTmntHook(tmntId, {
      tmntFullData: mockTmntFullData,
      requestedTmntId: tmntId,
      loadStatus: "succeeded",
      saveStatus: "failed",
      error: "Failed to save tournament full data",
    });

    expect(result.current.hasData).toBe(true);
    expect(result.current.failed).toBe(false);
    expect(mockedGetTmntFullData).not.toHaveBeenCalled();
  });
});

// import { act, renderHook, waitFor } from "@testing-library/react";
// import { configureStore } from "@reduxjs/toolkit";
// import { Provider } from "react-redux";
// import type { ReactNode } from "react";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import tmntFullDataReducer, {
//   type tmntFullDataState,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
// import {
//   mockTmntFullData,
//   tmntId,
// } from "../mocks/tmnts/tmntFullData/mockTmntFullData";

// jest.mock("@/lib/db/tmnts/dbTmnts", () => ({
//   getTmntFullData: jest.fn(),
// }));

// const mockedGetTmntFullData = jest.mocked(getTmntFullData);

// function renderTmntHook(
//   id: string,
//   stateOverrides: Partial<tmntFullDataState> = {},
// ) {
//   const initialState = tmntFullDataReducer(undefined, { type: "@@INIT" });
//   const store = configureStore({
//     reducer: { tmntFullData: tmntFullDataReducer },
//     preloadedState: {
//       tmntFullData: { ...initialState, ...stateOverrides },
//     },
//   });

//   const wrapper = ({ children }: { children: ReactNode }) => (
//     <Provider store={store}>{children}</Provider>
//   );

//   return { ...renderHook(() => useTmntFullData(id), { wrapper }), store };
// }

// // same store setup as renderTmntHook, but lets the test change the id after mount
// function renderTmntHookChangingId(initialId: string) {
//   const initialState = tmntFullDataReducer(undefined, { type: "@@INIT" });
//   const store = configureStore({
//     reducer: { tmntFullData: tmntFullDataReducer },
//     preloadedState: { tmntFullData: initialState },
//   });

//   const wrapper = ({ children }: { children: ReactNode }) => (
//     <Provider store={store}>{children}</Provider>
//   );

//   return {
//     ...renderHook(({ id }: { id: string }) => useTmntFullData(id), {
//       wrapper,
//       initialProps: { id: initialId },
//     }),
//     store,
//   };
// }

// describe("useTmntFullData", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockedGetTmntFullData.mockResolvedValue(mockTmntFullData);
//   });

//   it("fetches the tournament when it has not been loaded", async () => {
//     const { result, store } = renderTmntHook(tmntId);

//     await waitFor(() => expect(result.current.hasData).toBe(true));

//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//     expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
//     expect(result.current.data).toEqual(mockTmntFullData);
//     expect(result.current.failed).toBe(false);
//     expect(store.getState().tmntFullData.loadStatus).toBe("succeeded");
//   });

//   it("uses the loaded tournament without fetching it again", () => {
//     const { result } = renderTmntHook(tmntId, {
//       tmntFullData: mockTmntFullData,
//       requestedTmntId: tmntId,
//       loadStatus: "succeeded",
//     });

//     expect(result.current.data).toEqual(mockTmntFullData);
//     expect(result.current.hasData).toBe(true);
//     expect(result.current.failed).toBe(false);
//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();
//   });

//   it("does not start another fetch while a fetch is loading", () => {
//     const { result } = renderTmntHook(tmntId, {
//       requestedTmntId: tmntId,
//       loadStatus: "loading",
//     });

//     expect(result.current.hasData).toBe(false);
//     expect(result.current.failed).toBe(false);
//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();
//   });

//   it("reports a failure for this tournament without automatically retrying", () => {
//     const error = "Unable to load tournament";
//     const { result, rerender } = renderTmntHook(tmntId, {
//       requestedTmntId: tmntId,
//       loadStatus: "failed",
//       error,
//     });

//     expect(result.current.hasData).toBe(false);
//     expect(result.current.failed).toBe(true);
//     expect(result.current.error).toBe(error);

//     rerender();
//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();
//   });

//   it("reports a rejected fetch and does not start a fetch loop", async () => {
//     mockedGetTmntFullData.mockRejectedValue(new Error("Database unavailable"));
//     const { result, rerender } = renderTmntHook(tmntId);

//     await waitFor(() => expect(result.current.failed).toBe(true));

//     expect(result.current.hasData).toBe(false);
//     expect(result.current.error).toBe("Database unavailable");
//     rerender();
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//   });

//   it("retries a failed request when retry is called", async () => {
//     const { result } = renderTmntHook(tmntId, {
//       requestedTmntId: tmntId,
//       loadStatus: "failed",
//       error: "Unable to load tournament",
//     });

//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();

//     await act(async () => {
//       await result.current.retry();
//     });

//     await waitFor(() => expect(result.current.hasData).toBe(true));
//     expect(result.current.failed).toBe(false);
//     expect(result.current.error).toBe("");
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//     expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
//   });

//   it("fetches a different tournament when another tournament is loaded", async () => {
//     const otherTmntId = "tmt_another_tournament";
//     const otherTmntData = {
//       ...mockTmntFullData,
//       tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
//     };
//     mockedGetTmntFullData.mockResolvedValue(otherTmntData);

//     const { result } = renderTmntHook(otherTmntId, {
//       tmntFullData: mockTmntFullData,
//       requestedTmntId: tmntId,
//       loadStatus: "succeeded",
//     });

//     await waitFor(() => expect(result.current.hasData).toBe(true));

//     expect(result.current.data).toEqual(otherTmntData);
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//     expect(mockedGetTmntFullData).toHaveBeenCalledWith(otherTmntId);
//   });

//   it("fetches when a previous failure belongs to another tournament", async () => {
//     const { result } = renderTmntHook(tmntId, {
//       requestedTmntId: "tmt_previous_tournament",
//       loadStatus: "failed",
//       error: "Previous request failed",
//     });

//     await waitFor(() => expect(result.current.hasData).toBe(true));

//     expect(result.current.failed).toBe(false);
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//     expect(mockedGetTmntFullData).toHaveBeenCalledWith(tmntId);
//   });

//   it("returns a blank tournament object, not undefined, before anything is loaded", () => {
//     mockedGetTmntFullData.mockReturnValue(new Promise<never>(() => {}));
//     const { result } = renderTmntHook(tmntId);

//     expect(result.current.data).toBeDefined();
//     expect(result.current.data.tmnt.id).toBe("");
//     expect(result.current.hasData).toBe(false);
//   });

//   it("sets the load status to loading and fetches once while the request is pending", () => {
//     mockedGetTmntFullData.mockReturnValue(new Promise<never>(() => {}));
//     const { result, store, rerender } = renderTmntHook(tmntId);

//     expect(store.getState().tmntFullData.loadStatus).toBe("loading");
//     expect(store.getState().tmntFullData.requestedTmntId).toBe(tmntId);
//     expect(result.current.hasData).toBe(false);
//     expect(result.current.failed).toBe(false);

//     rerender();
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//   });

//   it("does not fetch again after the tournament has loaded and the hook re-renders", async () => {
//     const { result, rerender } = renderTmntHook(tmntId);
//     await waitFor(() => expect(result.current.hasData).toBe(true));

//     rerender();
//     rerender();

//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//   });

//   it("fetches the new tournament when the tmntId changes after a tournament has loaded", async () => {
//     const otherTmntId = "tmt_another_tournament";
//     const otherTmntData = {
//       ...mockTmntFullData,
//       tmnt: { ...mockTmntFullData.tmnt, id: otherTmntId },
//     };
//     mockedGetTmntFullData
//       .mockResolvedValueOnce(mockTmntFullData)
//       .mockResolvedValueOnce(otherTmntData);

//     const { result, rerender } = renderTmntHookChangingId(tmntId);
//     await waitFor(() => expect(result.current.hasData).toBe(true));

//     rerender({ id: otherTmntId });

//     // the loaded tournament is not the one asked for, so hasData drops right away
//     expect(result.current.hasData).toBe(false);

//     await waitFor(() => expect(result.current.hasData).toBe(true));
//     expect(result.current.data).toEqual(otherTmntData);
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(2);
//     expect(mockedGetTmntFullData).toHaveBeenLastCalledWith(otherTmntId);
//   });

//   it("treats the tournament as loaded when a later request failed for the same id", () => {
//     const { result } = renderTmntHook(tmntId, {
//       tmntFullData: mockTmntFullData,
//       requestedTmntId: tmntId,
//       loadStatus: "failed",
//       error: "Refresh failed",
//     });

//     expect(result.current.hasData).toBe(true);
//     expect(result.current.failed).toBe(false);
//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();
//   });

//   it("keeps failed true and shows the new error when a retry fails again", async () => {
//     mockedGetTmntFullData.mockRejectedValue(new Error("Still down"));
//     const { result } = renderTmntHook(tmntId, {
//       requestedTmntId: tmntId,
//       loadStatus: "failed",
//       error: "First failure",
//     });

//     await act(async () => {
//       await result.current.retry();
//     });

//     await waitFor(() => expect(result.current.error).toBe("Still down"));
//     expect(result.current.failed).toBe(true);
//     expect(result.current.hasData).toBe(false);
//     expect(mockedGetTmntFullData).toHaveBeenCalledTimes(1);
//   });

//   it("does not start a fetch while a request for another tournament is loading", () => {
//     // documents current behavior: the hook waits for the in-flight request to finish
//     const { result } = renderTmntHook(tmntId, {
//       requestedTmntId: "tmt_previous_tournament",
//       loadStatus: "loading",
//     });

//     expect(result.current.hasData).toBe(false);
//     expect(result.current.failed).toBe(false);
//     expect(mockedGetTmntFullData).not.toHaveBeenCalled();
//   });

// });
