// test/app/(private)/dataEntry/editTmnt/editTmnt.test.tsx
// Tests for src/app/(private)/dataEntry/editTmnt/[tmntId]/page.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";
import tmntFullDataReducer, {
  fetchTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import EditTmntPage from "@/app/(private)/dataEntry/editTmnt/[tmntId]/page";
import { getSquadStage } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { tmntFormParent } from "@/lib/enums/enums";
import type { tmntFormDataType, tmntFullType } from "@/lib/types/types";
import type { ioStatusType } from "@/redux/statusTypes";
import { mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// ---- mocks ----

const mockUseParams = jest.fn();
jest.mock("next/navigation", () => ({
  useParams: () => mockUseParams(),
}));

// keep the real reducer and selectors; replace the fetch thunk with one
// that does nothing, so each test sets the store state itself
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  fetchTmntFullData: jest.fn(() => () => undefined),
}));
const mockFetch = fetchTmntFullData as unknown as jest.Mock;

// keep the real getBlankTmntFullData; replace getSquadStage (a DB call)
jest.mock("@/app/(private)/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  ...jest.requireActual("@/app/(private)/dataEntry/tmntForm/tmntTools"),
  getSquadStage: jest.fn(),
}));
const mockGetSquadStage = getSquadStage as jest.Mock;

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  __esModule: true,
  useUnsavedChangesGuard: jest.fn(),
}));
const mockGuard = useUnsavedChangesGuard as jest.Mock;

// the form has its own tests; record its props, and give the test a way
// to call markPendingChanges
const mockFormProps: {
  last?: { tmntProps: tmntFormDataType; markPendingChanges: (p: boolean) => void };
} = {};
jest.mock("@/app/(private)/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: (props: {
    tmntProps: tmntFormDataType;
    markPendingChanges: (p: boolean) => void;
  }) => {
    mockFormProps.last = props;
    return (
      <div data-testid="TmntDataFormMock">
        <button type="button" onClick={() => props.markPendingChanges(true)}>
          Mark Pending
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div data-testid="WaitModalMock" data-show={String(!!show)}>
      {message}
    </div>
  ),
}));

// ---- helpers ----

const tmntId = mockTmntFullData.tmnt.id;
const firstSquadId = mockTmntFullData.squads[0].id;

// starts from the slice's real initial state, so new slice fields are present
const makeStore = (
  loadStatus: ioStatusType,
  tmntFullData: tmntFullType = mockTmntFullData,
  error = "",
) => {
  const init = tmntFullDataReducer(undefined, { type: "@@test/init" });
  return configureStore({
    reducer: { tmntFullData: tmntFullDataReducer },
    preloadedState: {
      tmntFullData: { ...init, tmntFullData, loadStatus, error },
    },
  });
};

const renderPage = (store = makeStore("succeeded" as ioStatusType)) =>
  render(
    <Provider store={store}>
      <EditTmntPage />
    </Provider>,
  );

const queryForm = () => screen.queryByTestId("TmntDataFormMock");
const queryHeading = () =>
  screen.queryByRole("heading", { level: 2, name: /^edit tournament$/i });

beforeEach(() => {
  jest.clearAllMocks();
  delete mockFormProps.last;
  mockUseParams.mockReturnValue({ tmntId });
  mockGetSquadStage.mockResolvedValue(SquadStage.DEFINE);
});

// ---- tests ----

describe("EditTmntPage", () => {
  describe("fetching", () => {
    it("fetches the tournament from the URL id on mount", () => {
      renderPage();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(tmntId);
    });

    it("does not fetch when the URL has no tournament id", () => {
      mockUseParams.mockReturnValue({});
      renderPage();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("while loading", () => {
    it("shows the wait modal and no form", () => {
      renderPage(makeStore("loading" as ioStatusType));

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "true");
      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Loading...");
      expect(queryForm()).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
    });
  });

  describe("when loading fails", () => {
    it("shows the error and no form", () => {
      renderPage(
        makeStore("failed" as ioStatusType, mockTmntFullData, "Tournament not found"),
      );

      expect(screen.getByRole("alert")).toHaveTextContent("Tournament not found");
      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "false");
      expect(queryForm()).not.toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
    });
  });

  describe("when loaded", () => {
    it("reads the stage of the first squad", async () => {
      renderPage();

      await screen.findByTestId("TmntDataFormMock");
      expect(mockGetSquadStage).toHaveBeenCalledWith(firstSquadId);
    });

    it("waits for the stage before showing the form", async () => {
      let finishStage: (s: SquadStage) => void = () => {};
      mockGetSquadStage.mockReturnValue(
        new Promise((res) => {
          finishStage = res;
        }),
      );
      renderPage();

      expect(queryForm()).not.toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();

      finishStage(SquadStage.ENTRIES);

      expect(await screen.findByTestId("TmntDataFormMock")).toBeInTheDocument();
    });

    it("shows the heading and passes the tournament, stage and EDIT to the form", async () => {
      mockGetSquadStage.mockResolvedValue(SquadStage.ENTRIES);
      renderPage();

      await screen.findByTestId("TmntDataFormMock");
      expect(queryHeading()).toBeInTheDocument();
      expect(mockFormProps.last?.tmntProps).toEqual({
        tmntFullData: mockTmntFullData,
        stage: SquadStage.ENTRIES,
        parentForm: tmntFormParent.EDIT,
      });
      expect(screen.queryByText(/stage error/i)).not.toBeInTheDocument();
    });

    it("shows a stage error and passes stage ERROR when the stage can't be read", async () => {
      mockGetSquadStage.mockRejectedValue(new Error("db down"));
      renderPage();

      expect(await screen.findByText("Stage error: db down")).toBeInTheDocument();
      expect(mockFormProps.last?.tmntProps.stage).toBe(SquadStage.ERROR);
    });

    it("uses a generic stage error when the failure is not an Error", async () => {
      mockGetSquadStage.mockRejectedValue("nope");
      renderPage();

      expect(
        await screen.findByText("Stage error: Failed to load squad stage"),
      ).toBeInTheDocument();
    });

    // the effect's `cancelled` flag: a stage read that finishes late must not
    // overwrite the stage of the tournament data that replaced it
    it("ignores a stage read that finishes after the tournament data changed", async () => {
      let finishFirst: (s: SquadStage) => void = () => {};
      mockGetSquadStage
        .mockReturnValueOnce(
          new Promise((res) => {
            finishFirst = res;
          }),
        )
        .mockResolvedValueOnce(SquadStage.ENTRIES);

      const { rerender } = renderPage();
      expect(mockGetSquadStage).toHaveBeenCalledTimes(1);

      // the same tournament, reloaded (e.g. after a save): new data object
      const reloaded = cloneDeep(mockTmntFullData);
      rerender(
        <Provider store={makeStore("succeeded" as ioStatusType, reloaded)}>
          <EditTmntPage />
        </Provider>,
      );
      await screen.findByTestId("TmntDataFormMock");
      expect(mockFormProps.last?.tmntProps.stage).toBe(SquadStage.ENTRIES);

      // the first, stale read finishes last
      finishFirst(SquadStage.DEFINE);
      await new Promise((r) => setTimeout(r, 0));

      expect(mockFormProps.last?.tmntProps.stage).toBe(SquadStage.ENTRIES);
    });

    it("shows 'Tournament has no squad' without reading a stage", async () => {
      const noSquads = cloneDeep(mockTmntFullData);
      noSquads.squads = [];
      renderPage(makeStore("succeeded" as ioStatusType, noSquads));

      expect(
        await screen.findByText("Stage error: Tournament has no squad"),
      ).toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
      expect(mockFormProps.last?.tmntProps.stage).toBe(SquadStage.ERROR);
    });
  });

  // the store keeps the last tournament loaded; opening a different one
  // must not show the old one while the new one loads
  describe("when the store holds a different tournament", () => {
    it("shows no form and reads no stage", async () => {
      const otherTmnt = cloneDeep(mockTmntFullData);
      otherTmnt.tmnt.id = "tmt_00000000000000000000000000000000";
      renderPage(makeStore("succeeded" as ioStatusType, otherTmnt));

      // give the stage effect a chance to run
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(tmntId));
      expect(queryForm()).not.toBeInTheDocument();
      expect(queryHeading()).not.toBeInTheDocument();
      expect(mockGetSquadStage).not.toHaveBeenCalled();
    });
  });

  describe("unsaved changes guard", () => {
    it("starts with no pending changes", async () => {
      renderPage();

      await screen.findByTestId("TmntDataFormMock");
      expect(mockGuard).toHaveBeenLastCalledWith(false);
    });

    it("turns on when the form reports pending changes", async () => {
      const user = userEvent.setup();
      renderPage();

      await screen.findByTestId("TmntDataFormMock");
      await user.click(screen.getByRole("button", { name: "Mark Pending" }));

      expect(mockGuard).toHaveBeenLastCalledWith(true);
    });
  });
});
