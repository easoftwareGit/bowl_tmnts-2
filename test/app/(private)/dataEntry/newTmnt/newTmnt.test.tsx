// test/app/(private)/dataEntry/newTmnt/newTmnt.test.tsx
// Tests for src/app/(private)/dataEntry/newTmnt/page.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { SquadStage } from "@prisma/client";
import { useSession } from "next-auth/react";
import NewTmntPage from "@/app/(private)/dataEntry/newTmnt/page";
import { getBlankTmntFullData } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { tmntFormParent } from "@/lib/enums/enums";
import type { tmntFormDataType } from "@/lib/types/types";

// ---- mocks ----

jest.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: jest.fn(),
}));
const mockUseSession = useSession as jest.Mock;

jest.mock("@/app/(private)/dataEntry/tmntForm/tmntTools", () => ({
  __esModule: true,
  getBlankTmntFullData: jest.fn(),
}));
const mockGetBlank = getBlankTmntFullData as jest.Mock;

jest.mock("@/hooks/useUnsavedChangesGuard", () => ({
  __esModule: true,
  useUnsavedChangesGuard: jest.fn(),
}));
const mockGuard = useUnsavedChangesGuard as jest.Mock;

// the form has its own tests; record every set of props it is rendered
// with, and give the test a way to call markPendingChanges
type FormProps = {
  tmntProps: tmntFormDataType;
  markPendingChanges: (pending: boolean) => void;
};
const mockFormRenders: FormProps[] = [];
jest.mock("@/app/(private)/dataEntry/tmntForm/tmntForm", () => ({
  __esModule: true,
  default: (props: FormProps) => {
    mockFormRenders.push(props);
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

const makeBlankTmnt = () => ({
  tmnt: { id: "tmt_1", user_id: "ORIG" },
  brktEntries: [],
  brktSeeds: [],
  brkts: [],
  divs: [],
  divEntries: [],
  elimEntries: [],
  elims: [],
  events: [],
  lanes: [],
  pots: [],
  potEntries: [],
  squads: [],
  players: [],
  moneys: [],
});

const signedInAs = (id: string | undefined) =>
  mockUseSession.mockReturnValue({
    status: "authenticated",
    data: { user: id === undefined ? {} : { id } },
  });

const sessionLoading = () =>
  mockUseSession.mockReturnValue({ status: "loading", data: null });

const lastFormProps = () => mockFormRenders[mockFormRenders.length - 1];
const queryForm = () => screen.queryByTestId("TmntDataFormMock");

beforeEach(() => {
  jest.clearAllMocks();
  mockFormRenders.length = 0;
  // a fresh blank on every call, like the real function
  mockGetBlank.mockImplementation(makeBlankTmnt);
  signedInAs("usr_123");
});

// ---- tests ----

describe("NewTmntPage", () => {
  it('renders the heading "New Tournament"', () => {
    render(<NewTmntPage />);

    expect(
      screen.getByRole("heading", { name: /^new tournament$/i, level: 2 }),
    ).toBeInTheDocument();
  });

  describe("while the session is loading", () => {
    // the form copies its props into state when it mounts, so mounting it
    // before the user id is known would save the tournament without one
    it("shows the wait modal and does not render the form yet", () => {
      sessionLoading();
      render(<NewTmntPage />);

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute("data-show", "true");
      expect(queryForm()).not.toBeInTheDocument();
    });

    it("renders the form with the user id once the session loads", () => {
      sessionLoading();
      const { rerender } = render(<NewTmntPage />);

      signedInAs("usr_123");
      rerender(<NewTmntPage />);

      expect(queryForm()).toBeInTheDocument();
      // the very first props the form ever received already have the id
      expect(mockFormRenders[0].tmntProps.tmntFullData.tmnt.user_id).toBe("usr_123");
    });
  });

  describe("props passed to the form", () => {
    it("passes a blank tournament for the signed-in user, stage DEFINE, parent NEW", () => {
      render(<NewTmntPage />);

      const { tmntProps } = lastFormProps();
      expect(tmntProps.stage).toBe(SquadStage.DEFINE);
      expect(tmntProps.parentForm).toBe(tmntFormParent.NEW);
      expect(tmntProps.tmntFullData.tmnt.user_id).toBe("usr_123");
      expect(tmntProps.tmntFullData.tmnt.id).toBe("tmt_1");
    });

    it("falls back to an empty user_id when the session user has no id", () => {
      signedInAs(undefined);
      render(<NewTmntPage />);

      expect(lastFormProps().tmntProps.tmntFullData.tmnt.user_id).toBe("");
    });

    it("sets an empty user_id when not signed in", () => {
      // the (private) layout normally prevents this
      mockUseSession.mockReturnValue({ status: "unauthenticated", data: null });
      render(<NewTmntPage />);

      expect(lastFormProps().tmntProps.tmntFullData.tmnt.user_id).toBe("");
    });
  });

  describe("re-renders", () => {
    // a new blank each render would mean new ids and a new object, which can
    // reset what the user has typed
    it("keeps the same blank tournament when the page re-renders", async () => {
      const user = userEvent.setup();
      render(<NewTmntPage />);
      const firstProps = lastFormProps().tmntProps;

      // marking pending changes updates page state, so the page re-renders
      await user.click(screen.getByRole("button", { name: "Mark Pending" }));

      expect(mockFormRenders.length).toBeGreaterThan(1);
      expect(lastFormProps().tmntProps).toBe(firstProps);
      expect(mockGetBlank).toHaveBeenCalledTimes(1);
    });

    it("passes the same markPendingChanges function on every render", async () => {
      const user = userEvent.setup();
      render(<NewTmntPage />);
      const firstFn = lastFormProps().markPendingChanges;

      await user.click(screen.getByRole("button", { name: "Mark Pending" }));

      expect(lastFormProps().markPendingChanges).toBe(firstFn);
    });
  });

  describe("unsaved changes guard", () => {
    it("starts with no pending changes", () => {
      render(<NewTmntPage />);

      expect(mockGuard).toHaveBeenLastCalledWith(false);
    });

    it("turns on when the form reports pending changes", async () => {
      const user = userEvent.setup();
      render(<NewTmntPage />);

      await user.click(screen.getByRole("button", { name: "Mark Pending" }));

      expect(mockGuard).toHaveBeenLastCalledWith(true);
    });
  });
});
