// test/app/dataEntry/runTmnt/runTmnt.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------- Mocks ----------

jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
}));

jest.mock("react-redux", () => ({
  __esModule: true,
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Simple Link mock so we can inspect href
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === "string" ? href : href.pathname} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="wait-modal">{message}</div> : null,
}));

// TmntDataForm mock – we want to inspect tmntProps
jest.mock("@/app/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="tmnt-form-mock" />),
}));

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  fetchTmntFullData: jest.fn(),
  getTmntFullDataLoadStatus: jest.fn(),
  getTmntFullDataError: jest.fn(),
}));

jest.mock("@/app/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  getBlankTmntFullData: jest.fn(() => ({ squads: [] })),
  getSquadStage: jest.fn(),
}));

// ---------- Imports that use the mocks above ----------

import RunTmntPage from "@/app/dataEntry/runTmnt/[tmntId]/page";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
import { getSquadStage } from "@/app/dataEntry/tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";

// ---------- Typed shortcuts to mocks ----------

const mockedUseParams = useParams as jest.Mock;
const mockedUseDispatch = useDispatch as unknown as jest.Mock;
const mockedUseSelector = useSelector as unknown as jest.Mock;

const mockedFetchTmntFullData = fetchTmntFullData as unknown as jest.Mock;
const mockedGetLoadStatus = getTmntFullDataLoadStatus as unknown as jest.Mock;
const mockedGetError = getTmntFullDataError as unknown as jest.Mock;

const mockedTmntDataForm = TmntDataForm as unknown as jest.Mock;
const mockedGetSquadStage = getSquadStage as unknown as jest.Mock;

// ---------- Shared mutable state used by selectors ----------

let mockLoadStatus: string;
let mockError: string | null;
let mockTmntFullData: any;
let mockState: any;
let mockDispatch: jest.Mock;

describe("RunTmntPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default params
    mockedUseParams.mockReturnValue({ tmntId: "tmt_123" });

    mockDispatch = jest.fn();
    mockedUseDispatch.mockReturnValue(mockDispatch);

    // Default tmnt data (one squad)
    mockTmntFullData = {
      id: "tmt_123",
      squads: [{ id: "squad_1" }],
    };

    mockState = {
      tmntFullData: {
        tmntFullData: mockTmntFullData,
      },
    };

    // useSelector always calls selector(mockState)
    mockedUseSelector.mockImplementation((selector: any) =>
      selector(mockState)
    );

    // Default load status + error
    mockLoadStatus = "idle";
    mockError = null;

    // Selectors just return our mutable vars
    mockedGetLoadStatus.mockImplementation(() => mockLoadStatus);
    mockedGetError.mockImplementation(() => mockError);

    // Thunk action returned by fetchTmntFullData
    mockedFetchTmntFullData.mockReturnValue({
      type: "tmntFullData/fetchTmntFullData",
    });

    // Default getSquadStage behaviour (can be overridden per test)
    mockedGetSquadStage.mockResolvedValue(SquadStage.DEFINE);
  });

  describe("data loading", () => {
    it("dispatches fetchTmntFullData with tmntId from the URL on mount", () => {
      mockLoadStatus = "loading";

      render(<RunTmntPage />);

      expect(mockedFetchTmntFullData).toHaveBeenCalledTimes(1);
      expect(mockedFetchTmntFullData).toHaveBeenCalledWith("tmt_123");
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "tmntFullData/fetchTmntFullData",
        })
      );
    });

    it("shows WaitModal with 'Loading...' message when status is loading", () => {
      mockLoadStatus = "loading";

      render(<RunTmntPage />);

      const modal = screen.getByTestId("wait-modal");
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveTextContent("Loading...");
    });

    it("does not show WaitModal when status is succeeded", () => {
      mockLoadStatus = "succeeded";

      render(<RunTmntPage />);

      expect(screen.queryByTestId("wait-modal")).not.toBeInTheDocument();
    });

    it("renders error message when load fails and tmntError is set", () => {
      mockLoadStatus = "failed";
      mockError = "Boom!";

      render(<RunTmntPage />);

      expect(
        screen.getByText("Error: Boom! tmntLoadStatus: failed")
      ).toBeInTheDocument();
    });

    it("does not show error banner when status is succeeded", () => {
      mockLoadStatus = "succeeded";
      mockError = "Boom!";

      render(<RunTmntPage />);

      expect(
        screen.queryByText(/Error: Boom! tmntLoadStatus:/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("layout and navigation buttons", () => {
    it("renders Run Tournament heading and all main buttons when load succeeds", () => {
      mockLoadStatus = "succeeded";

      render(<RunTmntPage />);

      // Heading
      expect(screen.getByText("Run Tournament")).toBeInTheDocument();

      // All the visible buttons/links
      expect(
        screen.getByRole("link", { name: /back to list/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /edit bowlers/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /enter scores/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /set prize fund/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /print reports/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /finalize/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /last button/i })
      ).toBeInTheDocument();

      // TmntDataForm gets rendered
      expect(screen.getByTestId("tmnt-form-mock")).toBeInTheDocument();
      expect(mockedTmntDataForm).toHaveBeenCalled();
    });

    it("Back to list link points to /user/tmnts", () => {
      mockLoadStatus = "succeeded";

      render(<RunTmntPage />);

      const backLink = screen.getByRole("link", {
        name: /back to list/i,
      });
      expect(backLink).toHaveAttribute("href", "/user/tmnts");
    });

    it("Edit Bowlers link points to /dataEntry/editPlayers/[tmntId]", () => {
      mockLoadStatus = "succeeded";
      mockedUseParams.mockReturnValue({ tmntId: "tmt_999" });

      render(<RunTmntPage />);

      const editLink = screen.getByRole("link", {
        name: /edit bowlers/i,
      });
      expect(editLink).toHaveAttribute(
        "href",
        "/dataEntry/editPlayers/tmt_999"
      );
    });
  });

  describe("squad stage loading", () => {
    it("shows stage error when tournament has no squad", async () => {
      mockLoadStatus = "succeeded";

      // No squads in the loaded tournament
      mockTmntFullData = {
        id: "tmt_123",
        squads: [],
      };
      mockState.tmntFullData.tmntFullData = mockTmntFullData;

      render(<RunTmntPage />);

      // Stage effect runs after load succeeds
      const msg = await screen.findByText(
        /Stage error: Tournament has no squad/i
      );
      expect(msg).toBeInTheDocument();

      // getSquadStage should never be called when there is no squad id
      expect(mockedGetSquadStage).not.toHaveBeenCalled();
    });

    it("calls getSquadStage with the first squad id when load succeeds", async () => {
      mockLoadStatus = "succeeded";

      mockTmntFullData = {
        id: "tmt_123",
        squads: [{ id: "squad_first" }, { id: "squad_second" }],
      };
      mockState.tmntFullData.tmntFullData = mockTmntFullData;

      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      await waitFor(() => {
        expect(mockedGetSquadStage).toHaveBeenCalledTimes(1);
        // expect(mockedGetSquadStage).toHaveBeenCalledWith("squad_first");
      });
      // only one expect inside waitFor. ok to have others after waitFor
      expect(mockedGetSquadStage).toHaveBeenCalledWith("squad_first");
    });

    it("passes a safe fallback stage (DEFINE) to TmntDataForm before async stage loads", () => {
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      // The *first* call to TmntDataForm happens before getSquadStage resolves
      const firstCall = mockedTmntDataForm.mock.calls[0][0];
      const tmntProps = firstCall.tmntProps;

      expect(tmntProps.stage).toBe(SquadStage.DEFINE);
    });

    it("updates TmntDataForm with the resolved stage from getSquadStage", async () => {
      mockLoadStatus = "succeeded";
      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      // Wait until TmntDataForm has been rendered more than once
      // (initial render with DEFINE, then rerender with SCORES)
      await waitFor(() => {
        expect(mockedTmntDataForm.mock.calls.length).toBeGreaterThan(1);
      });

      // Now inspect the *latest* call to TmntDataForm
      const calls = mockedTmntDataForm.mock.calls;
      const lastCallProps = calls[calls.length - 1][0].tmntProps;

      // Last call should reflect the updated stage
      expect(lastCallProps.stage).toBe(SquadStage.SCORES);
    });

    it("sets stage to ERROR and shows error message if getSquadStage rejects", async () => {
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockRejectedValue(
        new Error("Stage fetch failed")
      );

      render(<RunTmntPage />);

      const msg = await screen.findByText(
        /Stage error: Stage fetch failed/i
      );
      expect(msg).toBeInTheDocument();

      // In the last call, the stage should be ERROR
      const calls = mockedTmntDataForm.mock.calls;
      const lastProps = calls[calls.length - 1][0].tmntProps;
      expect(lastProps.stage).toBe(SquadStage.ERROR);
    });
  });
});