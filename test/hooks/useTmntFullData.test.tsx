import { act, renderHook, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import tmntFullDataReducer, {
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
});
