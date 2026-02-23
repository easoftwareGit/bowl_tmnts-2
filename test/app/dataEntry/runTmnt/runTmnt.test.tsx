import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// ---------- Mocks ----------

jest.mock("next/navigation", () => ({
  __esModule: true,
  useParams: jest.fn(),
  useRouter: jest.fn(),
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

// ModalErrorMsg mock – show dialog only when show=true; expose title/message and an OK button
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onCancel?: () => void;
  }) =>
    show ? (
      <div data-testid="ModalErrorMsgMock" role="dialog" aria-label="Error">
        <div data-testid="error-title">{title}</div>
        <div data-testid="error-message">{message}</div>
        <button type="button" onClick={onCancel}>
          OK
        </button>
      </div>
    ) : (
      <div data-testid="ModalErrorMsgMock" data-show="false" />
    ),
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
import { useParams, useRouter } from "next/navigation";
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
const mockedUseRouter = useRouter as unknown as jest.Mock;

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

let mockPush: jest.Mock;

describe("RunTmntPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default params
    mockedUseParams.mockReturnValue({ tmntId: "tmt_123" });

    // Router
    mockPush = jest.fn();
    mockedUseRouter.mockReturnValue({ push: mockPush });

    // Dispatch
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
    mockedUseSelector.mockImplementation((selector: any) => selector(mockState));

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

      expect(screen.queryByText(/Error: Boom! tmntLoadStatus:/i)).not.toBeInTheDocument();
    });
  });

  describe("layout and navigation buttons", () => {
    it("renders Run Tournament heading and all main buttons/links when load succeeds", () => {
      mockLoadStatus = "succeeded";

      render(<RunTmntPage />);

      // Heading
      expect(screen.getByText("Run Tournament")).toBeInTheDocument();

      // Back link is still a Link
      expect(screen.getByRole("link", { name: /back to list/i })).toBeInTheDocument();

      // Edit Bowlers is now a button
      expect(screen.getByRole("button", { name: /edit bowlers/i })).toBeInTheDocument();

      // Other items are still links
      expect(screen.getByRole("link", { name: /enter scores/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /set prize fund/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /print reports/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /finalize/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /last button/i })).toBeInTheDocument();

      // TmntDataForm gets rendered
      expect(screen.getByTestId("tmnt-form-mock")).toBeInTheDocument();
      expect(mockedTmntDataForm).toHaveBeenCalled();
    });

    it("Back to list link points to /user/tmnts", () => {
      mockLoadStatus = "succeeded";

      render(<RunTmntPage />);

      const backLink = screen.getByRole("link", { name: /back to list/i });
      expect(backLink).toHaveAttribute("href", "/user/tmnts");
    });
  });

  describe("Edit Bowlers button behavior", () => {
    it("clicking Edit Bowlers navigates to editPlayers when stage is DEFINE", async () => {
      const user = userEvent.setup();
      mockLoadStatus = "succeeded";
      mockedUseParams.mockReturnValue({ tmntId: "tmt_999" });

      // stage resolves to DEFINE
      mockedGetSquadStage.mockResolvedValue(SquadStage.DEFINE);

      render(<RunTmntPage />);

      // wait for stage load effect to run
      await waitFor(() => {
        expect(mockedGetSquadStage).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /edit bowlers/i }));

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/dataEntry/editPlayers/tmt_999");
    });

    it("clicking Edit Bowlers navigates to editPlayers when stage is ENTRIES", async () => {
      const user = userEvent.setup();
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockResolvedValue(SquadStage.ENTRIES);

      render(<RunTmntPage />);

      await waitFor(() => {
        expect(mockedGetSquadStage).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /edit bowlers/i }));

      expect(mockPush).toHaveBeenCalledWith("/dataEntry/editPlayers/tmt_123");
    });

    it("clicking Edit Bowlers shows Cannot Edit Bowlers modal when stage is SCORES", async () => {
      const user = userEvent.setup();
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      await waitFor(() => {
        expect(mockedGetSquadStage).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /edit bowlers/i }));

      const dlg = await screen.findByRole("dialog", { name: /error/i });
      expect(dlg).toBeInTheDocument();

      expect(screen.getByTestId("error-title")).toHaveTextContent("Cannot Edit Bowlers");
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "This tournament has been finalized and moved into the entering scores stage."
      );

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("clicking OK on the modal hides it (canceledModalErr)", async () => {
      const user = userEvent.setup();
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      await waitFor(() => {
        expect(mockedGetSquadStage).toHaveBeenCalledTimes(1);
      });

      await user.click(screen.getByRole("button", { name: /edit bowlers/i }));
      expect(await screen.findByRole("dialog", { name: /error/i })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /ok/i }));

      // Our mock renders a non-dialog placeholder when hidden
      expect(screen.queryByRole("dialog", { name: /error/i })).not.toBeInTheDocument();
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
      const msg = await screen.findByText(/Stage error: Tournament has no squad/i);
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
      });

      expect(mockedGetSquadStage).toHaveBeenCalledWith("squad_first");
    });

    it("passes a safe fallback stage (DEFINE) to TmntDataForm before async stage loads", () => {
      mockLoadStatus = "succeeded";
      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      // first render uses stage ?? DEFINE fallback
      const firstCall = mockedTmntDataForm.mock.calls[0][0];
      const tmntProps = firstCall.tmntProps;

      expect(tmntProps.stage).toBe(SquadStage.DEFINE);
    });

    it("updates TmntDataForm with the resolved stage from getSquadStage", async () => {
      mockLoadStatus = "succeeded";
      mockedGetSquadStage.mockResolvedValue(SquadStage.SCORES);

      render(<RunTmntPage />);

      await waitFor(() => {
        expect(mockedTmntDataForm.mock.calls.length).toBeGreaterThan(1);
      });

      const calls = mockedTmntDataForm.mock.calls;
      const lastCallProps = calls[calls.length - 1][0].tmntProps;

      expect(lastCallProps.stage).toBe(SquadStage.SCORES);
    });

    it("sets stage to ERROR and shows error message if getSquadStage rejects", async () => {
      mockLoadStatus = "succeeded";

      mockedGetSquadStage.mockRejectedValue(new Error("Stage fetch failed"));

      render(<RunTmntPage />);

      const msg = await screen.findByText(/Stage error: Stage fetch failed/i);
      expect(msg).toBeInTheDocument();

      const calls = mockedTmntDataForm.mock.calls;
      const lastProps = calls[calls.length - 1][0].tmntProps;
      expect(lastProps.stage).toBe(SquadStage.ERROR);
    });
  });
});