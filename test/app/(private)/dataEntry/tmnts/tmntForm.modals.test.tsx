// test/app/(private)/dataEntry/tmnts/tmntForm.modals.test.tsx
// Tests for src/app/(private)/dataEntry/tmntForm/tmntForm.tsx with the REAL
// ConfirmModal, ErrorModalMsg and WaitModal. Only react-bootstrap's Modal
// shell is replaced, so the modals render without portals or animation.
//
// tmntForm.interactions.test.tsx covers the save and cancel logic in detail
// (every error type, double saves, stage failures) with mocked modals.
// This file checks that the form and the real modals work together:
// the right modal opens, with the right title, text and buttons, and the
// buttons do the right thing.
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";
import tmntFullDataReducer, {
  saveTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
import TmntDataForm from "@/app/(private)/dataEntry/tmntForm/tmntForm";
import type { tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent, ioDataError } from "@/lib/enums/enums";
import { getBlankTmntFullData } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { postInitialStageForSquad } from "@/lib/db/stages/dbStages";
import { validateEvents } from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
import { validateDivs } from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
import { validateSquads } from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
import { validatePots } from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
import { validateBrkts } from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
import { validateElims } from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { ioStatusType } from "@/redux/statusTypes";

// ---- mocks ----

const mockPush = jest.fn();
const mockMarkPendingChanges = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: jest.fn(),
  }),
}));

// redux: keep the real reducer, replace the save thunk
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  saveTmntFullData: jest.fn(),
}));
const mockSave = saveTmntFullData as unknown as jest.Mock;

jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  postInitialStageForSquad: jest.fn(),
}));
const mockPostInitialStage = postInitialStageForSquad as jest.Mock;

// react-bootstrap Modal: a plain role="dialog" div, rendered only when shown.
// The real modal components (ConfirmModal, ErrorModalMsg, WaitModal) run.
jest.mock("react-bootstrap/Modal", () => {
  const MockModal = ({
    show,
    children,
  }: {
    show: boolean;
    children: React.ReactNode;
  }) => (show ? <div role="dialog">{children}</div> : null);

  const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Header.displayName = "MockModalHeader";
  const Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
  Title.displayName = "MockModalTitle";
  const Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Body.displayName = "MockModalBody";
  const Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Footer.displayName = "MockModalFooter";

  MockModal.Header = Header;
  MockModal.Title = Title;
  MockModal.Body = Body;
  MockModal.Footer = Footer;
  MockModal.displayName = "MockModal";

  return MockModal;
});

// the tournament sections are not part of this test; stub them and make
// their validators pass, so Save always reaches the save step
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNEvents", () => ({
  __esModule: true,
  default: () => <div>MockEvents</div>,
  validateEvents: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNDivs", () => ({
  __esModule: true,
  default: () => <div>MockDivs</div>,
  validateDivs: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNSquads", () => ({
  __esModule: true,
  default: () => <div>MockSquads</div>,
  validateSquads: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNLanes", () => ({
  __esModule: true,
  default: () => <div>MockLanes</div>,
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNPots", () => ({
  __esModule: true,
  default: () => <div>MockPots</div>,
  validatePots: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNBrkts", () => ({
  __esModule: true,
  default: () => <div>MockBrkts</div>,
  validateBrkts: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNElims", () => ({
  __esModule: true,
  default: () => <div>MockElims</div>,
  validateElims: jest.fn(),
}));

// ---- helpers ----

// starts from each slice's real initial state, so new slice fields are present
const makeStore = (saveStatus: ioStatusType = "idle" as ioStatusType) => {
  const initAction = { type: "@@test/init" };
  const tmntFullDataInit = tmntFullDataReducer(undefined, initAction);
  const bowlsInit = bowlsReducer(undefined, initAction);

  return configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: { ...bowlsInit, bowls: [mockBowl] },
      tmntFullData: {
        ...tmntFullDataInit,
        tmntFullData: mockTmntFullData,
        saveStatus,
      },
    },
  });
};

// The form calls dispatch(saveTmntFullData(data)).unwrap(), so:
//   saveTmntFullData(data) must return a thunk (a function),
//   the thunk middleware runs it, and its result needs an unwrap().
// These build an implementation for mockSave: data => thunk => result
const saveResolving = (value: unknown) => () => () =>
  Object.assign(Promise.resolve(undefined), {
    unwrap: () => Promise.resolve(value),
  });
const saveRejecting = (err: unknown) => () => () =>
  Object.assign(Promise.resolve(undefined), {
    unwrap: () => Promise.reject(err),
  });

// an existing tournament (has a name), so the form is "editing"
const tmntProps: tmntFormDataType = {
  tmntFullData: mockTmntFullData,
  stage: SquadStage.DEFINE,
  parentForm: tmntFormParent.NEW,
};
const tmntName = mockTmntFullData.tmnt.tmnt_name;

// a new tournament: the form treats a blank name as new
const newTmntData = () => {
  const data = cloneDeep(mockTmntFullData);
  data.tmnt.tmnt_name = "";
  return data;
};

const renderForm = (
  overrides: Partial<tmntFormDataType> = {},
  store = makeStore(),
) => {
  const user = userEvent.setup();
  const utils = render(
    <Provider store={store}>
      <TmntDataForm
        tmntProps={{ ...tmntProps, ...overrides }}
        markPendingChanges={mockMarkPendingChanges}
      />
    </Provider>,
  );
  return { user, ...utils };
};

// handleSave only runs when the Save button itself has focus
const clickSave = async (user: ReturnType<typeof userEvent.setup>) => {
  const saveBtn = screen.getByRole("button", { name: /save tournament/i });
  saveBtn.focus();
  await user.click(saveBtn);
};

const okButton = () => screen.getByRole("button", { name: /^ok$/i });
const expectNoDialog = () =>
  waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

beforeEach(() => {
  jest.clearAllMocks();

  (validateEvents as jest.Mock).mockReturnValue(true);
  (validateDivs as jest.Mock).mockReturnValue(true);
  (validateSquads as jest.Mock).mockReturnValue(true);
  (validatePots as jest.Mock).mockReturnValue(true);
  (validateBrkts as jest.Mock).mockReturnValue(true);
  (validateElims as jest.Mock).mockReturnValue(true);

  mockSave.mockImplementation(saveResolving(mockTmntFullData));
  mockPostInitialStage.mockResolvedValue(undefined);
});

// ---- tests ----

describe("TmntDataForm - modals", () => {
  it("shows no modal when the form first opens", () => {
    renderForm();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("success modal", () => {
    it("shows 'Tournament Saved' with the tournament name and an OK button", async () => {
      const { user } = renderForm();

      await clickSave(user);

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Tournament Saved" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Tournament: ${tmntName} saved.`),
      ).toBeInTheDocument();
      expect(okButton()).toBeInTheDocument();
      expect(mockMarkPendingChanges).toHaveBeenCalledWith(false);
    });

    it("clicking OK closes the modal and goes back to the tournament list", async () => {
      const { user } = renderForm();

      await clickSave(user);
      await screen.findByRole("dialog");
      await user.click(okButton());

      await expectNoDialog();
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });
  });

  describe("error modal", () => {
    // every error type's message is checked in the interactions tests
    it("shows 'Cannot Save' with the error message and an OK button", async () => {
      mockSave.mockImplementation(saveRejecting({ errorType: ioDataError.TMNT }));
      const { user } = renderForm();

      await clickSave(user);

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Cannot Save" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Cannot save Tournament "${tmntName}".`),
      ).toBeInTheDocument();
      expect(okButton()).toBeInTheDocument();
    });

    it("clicking OK closes the modal and stays on the form", async () => {
      mockSave.mockImplementation(saveRejecting({ errorType: ioDataError.EVENTS }));
      const { user } = renderForm();

      await clickSave(user);
      await screen.findByRole("dialog");
      await user.click(okButton());

      await expectNoDialog();
      expect(mockPush).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: /save tournament/i }),
      ).toBeInTheDocument();
    });

    it("explains a new tournament saved without its squad stage, and OK goes to the list", async () => {
      mockPostInitialStage.mockRejectedValue(new Error("stage failed"));
      const { user } = renderForm({ tmntFullData: newTmntData() });

      await user.type(screen.getByLabelText(/tournament name/i), "My Tmnt");
      await clickSave(user);

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tournament saved, but squad stage could not be initialized.",
        ),
      ).toBeInTheDocument();

      await user.click(okButton());

      await expectNoDialog();
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });
  });

  describe.each([
    [
      "a new tournament",
      getBlankTmntFullData,
      "Cancel New Tournament",
      "Do you want to cancel entering new tournament?",
    ],
    [
      "an existing tournament",
      () => mockTmntFullData,
      "Cancel Editing Tournament",
      "Do you want to cancel editing tournament?",
    ],
  ])("confirm modal for %s", (_label, getData, title, message) => {
    const openCancel = async () => {
      const { user } = renderForm({ tmntFullData: getData() });
      await user.click(screen.getByRole("button", { name: /^cancel$/i }));
      await screen.findByRole("dialog");
      return { user };
    };

    it("shows the title, message and Yes / No buttons when Cancel is clicked", async () => {
      await openCancel();

      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^yes$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^no$/i })).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("Yes closes the modal and goes back to the tournament list", async () => {
      const { user } = await openCancel();

      await user.click(screen.getByRole("button", { name: /^yes$/i }));

      await expectNoDialog();
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });

    it("No closes the modal and stays on the form", async () => {
      const { user } = await openCancel();

      await user.click(screen.getByRole("button", { name: /^no$/i }));

      await expectNoDialog();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("wait modal", () => {
    it("shows 'Saving...' while saving, and hides when saving is done", () => {
      const { rerender } = renderForm({}, makeStore("saving" as ioStatusType));

      expect(screen.getByRole("dialog")).toHaveTextContent("Saving...");

      rerender(
        <Provider store={makeStore("success" as ioStatusType)}>
          <TmntDataForm
            tmntProps={tmntProps}
            markPendingChanges={mockMarkPendingChanges}
          />
        </Provider>,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("hides 'Saving...' when the error modal opens, even if still saving", async () => {
      mockSave.mockImplementation(saveRejecting({ errorType: ioDataError.TMNT }));
      // the mocked save never changes the store, so it stays "saving"
      const { user } = renderForm({}, makeStore("saving" as ioStatusType));
      expect(screen.getByText("Saving...")).toBeInTheDocument();

      await clickSave(user);

      expect(
        await screen.findByRole("heading", { name: "Cannot Save" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
    });
  });
});
