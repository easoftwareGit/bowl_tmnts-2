// test/app/(private)/dataEntry/tmnts/tmntForm.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/tmntForm.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
import type { bowlType, squadType, tmntFormDataType } from "@/lib/types/types";
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
  useRouter() {
    return {
      push: mockPush,
      prefetch: jest.fn(),
    };
  },
}));

// The last props each child component received, keyed by child.
// Read only at render time, so it is initialized by then.
const mockChildProps: Record<string, Record<string, unknown>> = {};

// child components: record their props, render a stub.
// The paths must match the real files, now under (private).
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNEvents", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.events = props;
    return <div>MockEvents</div>;
  },
  validateEvents: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNDivs", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.divs = props;
    return <div>MockDivs</div>;
  },
  validateDivs: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNSquads", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.squads = props;
    return <div>MockSquads</div>;
  },
  validateSquads: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNLanes", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.lanes = props;
    return <div>MockLanes</div>;
  },
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNPots", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.pots = props;
    return <div>MockPots</div>;
  },
  validatePots: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNBrkts", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.brkts = props;
    return <div>MockBrkts</div>;
  },
  validateBrkts: jest.fn(),
}));
jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNElims", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChildProps.elims = props;
    return <div>MockElims</div>;
  },
  validateElims: jest.fn(),
}));

// modals: expose their props as attributes, and their handlers as buttons.
// Button names are unique so they never match the form's own Cancel button.
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div
      data-testid="ModalConfirmMock"
      data-show={String(!!show)}
      data-title={title}
      data-message={message}
    >
      <button type="button" onClick={onConfirm}>
        ConfirmMock-yes
      </button>
      <button type="button" onClick={onCancel}>
        ConfirmMock-no
      </button>
    </div>
  ),
}));
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  cannotSaveTitle: "Cannot Save",
  default: ({
    show,
    title,
    message,
    onCancel,
  }: {
    show: boolean;
    title: string;
    message: string;
    onCancel: () => void;
  }) => (
    <div
      data-testid="ModalErrorMsgMock"
      data-show={String(!!show)}
      data-title={title}
      data-message={message}
    >
      <button type="button" onClick={onCancel}>
        ErrorModalMock-close
      </button>
    </div>
  ),
}));
jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) => (
    <div data-testid="WaitModalMock" data-show={String(!!show)}>
      {message}
    </div>
  ),
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

// react-bootstrap Accordion: Header is a plain <button>, Body always renders
jest.mock("react-bootstrap", () => {
  const actual = jest.requireActual("react-bootstrap");

  const AccordionItemMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AccordionItemMock">{children}</div>
  );

  const AccordionMock = Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="AccordionMock">{children}</div>
    ),
    {
      Header: ({
        children,
        className,
        "data-testid": testId,
      }: {
        children: React.ReactNode;
        className?: string;
        "data-testid"?: string;
      }) => (
        <button type="button" data-testid={testId} className={className}>
          {children}
        </button>
      ),
      Body: ({
        children,
        className,
        "data-testid": testId,
      }: {
        children: React.ReactNode;
        className?: string;
        "data-testid"?: string;
      }) => (
        <div data-testid={testId} className={className}>
          {children}
        </div>
      ),
    },
  );

  return {
    __esModule: true,
    ...actual,
    Accordion: AccordionMock,
    AccordionItem: AccordionItemMock,
  };
});

// ---- helpers ----

// starts from each slice's real initial state, so new fields added to a
// slice later (like requestedTmntId) are always present
const makeStore = (
  bowls: bowlType[] = [],
  saveStatus: ioStatusType = "idle" as ioStatusType,
) => {
  const initAction = { type: "@@test/init" };
  const tmntFullDataInit = tmntFullDataReducer(undefined, initAction);
  const bowlsInit = bowlsReducer(undefined, initAction);

  return configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: {
        ...bowlsInit,
        bowls,
      },
      tmntFullData: {
        ...tmntFullDataInit,
        tmntFullData: getBlankTmntFullData(),
        saveStatus,
      },
    },
  });
};

// The form calls dispatch(saveTmntFullData(data)).unwrap(), so:
//   saveTmntFullData(data) must return a thunk (a function),
//   the thunk middleware runs it, and its result needs an unwrap()
//   like a real async thunk's result.
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
  store = makeStore([mockBowl]),
) => {
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <TmntDataForm
        tmntProps={{ ...tmntProps, ...overrides }}
        markPendingChanges={mockMarkPendingChanges}
      />
    </Provider>,
  );
  return { user, store };
};

const nameInput = () =>
  screen.getByLabelText(/tournament name/i) as HTMLInputElement;
const saveButton = () =>
  screen.getByRole("button", { name: /save tournament/i });
const cancelButton = () => screen.getByRole("button", { name: /^cancel$/i });
const errorModal = () => screen.getByTestId("ModalErrorMsgMock");
const confirmModal = () => screen.getByTestId("ModalConfirmMock");
const squadsProp = () => mockChildProps.squads.squads as squadType[];

// handleSave only runs when the Save button itself has focus
const clickSave = async (user: ReturnType<typeof userEvent.setup>) => {
  saveButton().focus();
  await user.click(saveButton());
};

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockChildProps)) delete mockChildProps[key];

  // every section is valid unless a test says otherwise
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

describe("tmntDataForm - interactions", () => {
  describe("handleInputChange", () => {
    it("should update the tmnt_name when input changes", () => {
      renderForm();

      fireEvent.change(nameInput(), {
        target: { name: "tmnt_name", value: "New Value" },
      });

      expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
      expect(nameInput().value).toBe("New Value");
    });

    it("should update start_date", () => {
      renderForm();

      const startDateInput = screen.getByTestId("inputStartDate") as HTMLInputElement;
      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: "2025-01-02" },
      });

      expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
      expect(startDateInput.value).toBe("2025-01-02");
    });

    it("should update end_date", () => {
      renderForm();

      const endDateInput = screen.getByTestId("inputEndDate") as HTMLInputElement;
      fireEvent.change(endDateInput, {
        target: { name: "end_date", value: "2025-01-02" },
      });

      expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
      expect(endDateInput.value).toBe("2025-01-02");
    });

    it("clamps squad_date_str to the new start date when the squad date is outside the range", () => {
      const customTmnt = cloneDeep(mockTmntFullData);
      customTmnt.tmnt.start_date_str = "2025-01-01";
      customTmnt.tmnt.end_date_str = "2025-01-10";
      // a squad date before the start date, so it should be clamped
      customTmnt.squads = [
        { ...customTmnt.squads[0], squad_date_str: "2024-12-01" },
      ];

      renderForm({ tmntFullData: customTmnt });
      expect(squadsProp()[0].squad_date_str).toBe("2024-12-01");

      fireEvent.change(screen.getByTestId("inputStartDate"), {
        target: { name: "start_date", value: "2025-01-02" },
      });

      expect(squadsProp()[0].squad_date_str).toBe("2025-01-02");
    });

    it("leaves a squad date that is inside the range alone", () => {
      const customTmnt = cloneDeep(mockTmntFullData);
      customTmnt.tmnt.start_date_str = "2025-01-01";
      customTmnt.tmnt.end_date_str = "2025-01-10";
      customTmnt.squads = [
        { ...customTmnt.squads[0], squad_date_str: "2025-01-05" },
      ];

      renderForm({ tmntFullData: customTmnt });

      fireEvent.change(screen.getByTestId("inputStartDate"), {
        target: { name: "start_date", value: "2025-01-02" },
      });

      expect(squadsProp()[0].squad_date_str).toBe("2025-01-05");
    });

    it("does not throw when markPendingChanges is not provided", () => {
      render(
        <Provider store={makeStore([mockBowl])}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>,
      );

      expect(() => {
        fireEvent.change(nameInput(), {
          target: { name: "tmnt_name", value: "New Value" },
        });
      }).not.toThrow();
      expect(nameInput().value).toBe("New Value");
    });
  });

  describe("handleBowlSelectChange", () => {
    it("should update the bowl_id when select changes", async () => {
      const { user } = renderForm();

      const bowlSelect = screen.getByTestId("inputBowlName") as HTMLSelectElement;
      await user.selectOptions(bowlSelect, mockBowl.id);

      const selectedOption = screen.getByRole("option", {
        name: `${mockBowl.bowl_name} - ${mockBowl.city}, ${mockBowl.state}`,
      }) as HTMLOptionElement;
      expect(selectedOption.selected).toBe(true);
      expect(bowlSelect.value).toBe(mockBowl.id);
      expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
    });
  });

  describe("tournament info validation", () => {
    it("shows required errors for a missing name, bowl and dates, and does not save", async () => {
      const data = cloneDeep(mockTmntFullData);
      data.tmnt.tmnt_name = "";
      data.tmnt.bowl_id = "";
      data.tmnt.start_date_str = "";
      data.tmnt.end_date_str = "";
      const { user } = renderForm({ tmntFullData: data });

      await clickSave(user);

      expect(screen.getByTestId("dangerTmntName")).toHaveTextContent(
        "Tournament Name is required",
      );
      expect(screen.getByTestId("dangerBowlName")).toHaveTextContent(
        "Bowl Name is required",
      );
      expect(screen.getByTestId("dangerStartDate")).toHaveTextContent(
        "Start date is required",
      );
      expect(screen.getByTestId("dangerEndDate")).toHaveTextContent(
        "End date is required",
      );
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("shows an error when the end date is before the start date", async () => {
      const data = cloneDeep(mockTmntFullData);
      data.tmnt.start_date_str = "2025-01-10";
      data.tmnt.end_date_str = "2025-01-01";
      const { user } = renderForm({ tmntFullData: data });

      await clickSave(user);

      expect(screen.getByTestId("dangerEndDate")).toHaveTextContent(
        "End date cannot be before start date",
      );
      expect(mockSave).not.toHaveBeenCalled();
    });

    it.each([
      ["events", validateEvents],
      ["divisions", validateDivs],
      ["squads", validateSquads],
      ["pots", validatePots],
      ["brackets", validateBrkts],
      ["eliminators", validateElims],
    ])("does not save when the %s are invalid", async (_label, validator) => {
      (validator as jest.Mock).mockReturnValue(false);
      const { user } = renderForm();

      await clickSave(user);

      expect(validator).toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });

    it("validates every section, not just up to the first failure", async () => {
      (validateEvents as jest.Mock).mockReturnValue(false);
      const { user } = renderForm();

      await clickSave(user);

      expect(validateDivs).toHaveBeenCalled();
      expect(validateSquads).toHaveBeenCalled();
      expect(validatePots).toHaveBeenCalled();
      expect(validateBrkts).toHaveBeenCalled();
      expect(validateElims).toHaveBeenCalled();
    });
  });

  describe("error clearing on change", () => {
    it("clears tmnt_name_err when user types a name after the required error", async () => {
      const blankTmnt = getBlankTmntFullData();
      blankTmnt.tmnt.tmnt_name = "";
      const { user } = renderForm({ tmntFullData: blankTmnt });

      await clickSave(user);
      expect(screen.getByText(/tournament name is required/i)).toBeInTheDocument();

      await user.type(nameInput(), "My Tmnt");

      expect(
        screen.queryByText(/tournament name is required/i),
      ).not.toBeInTheDocument();
    });

    it("clears bowl_id_err when user selects a bowl after the required error", async () => {
      const blankTmnt = getBlankTmntFullData();
      blankTmnt.tmnt.bowl_id = "";
      const { user } = renderForm({ tmntFullData: blankTmnt });

      await clickSave(user);
      const bowlError = screen.getByTestId("dangerBowlName");
      expect(bowlError).toHaveTextContent(/bowl name is required/i);

      await user.selectOptions(
        screen.getByRole("combobox", { name: /bowl name/i }),
        mockBowl.id,
      );

      expect(bowlError).not.toHaveTextContent(/\S/);
    });
  });

  describe("save - existing tournament", () => {
    it("dispatches saveTmntFullData with the form's data", async () => {
      const { user } = renderForm();

      await clickSave(user);

      await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tmnt: expect.objectContaining({ tmnt_name: tmntName }),
          squads: mockTmntFullData.squads,
        }),
      );
    });

    it("shows the success modal and clears pending changes", async () => {
      const { user } = renderForm();

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved");
      expect(errorModal()).toHaveAttribute(
        "data-message",
        `Tournament: ${tmntName} saved.`,
      );
      expect(mockMarkPendingChanges).toHaveBeenCalledWith(false);
    });

    it("does not create initial squad stages for an existing tournament", async () => {
      const { user } = renderForm();

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      expect(mockPostInitialStage).not.toHaveBeenCalled();
    });

    // stages are created based on whether the tournament is new (blank name),
    // not on which parent form opened it
    it("saves from the EDIT form without creating squad stages", async () => {
      const { user } = renderForm({ parentForm: tmntFormParent.EDIT });

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
      );
      expect(mockPostInitialStage).not.toHaveBeenCalled();
    });

    it("saves when no markPendingChanges prop is given", async () => {
      const user = userEvent.setup();
      render(
        <Provider store={makeStore([mockBowl])}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>,
      );

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
      );
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it("goes back to the tournament list when the success modal is closed", async () => {
      const { user } = renderForm();

      await clickSave(user);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      expect(mockPush).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });

    it("saves only once when Save is clicked twice while saving", async () => {
      let finishSave: (v: unknown) => void = () => {};
      mockSave.mockImplementation(() => () =>
        Object.assign(Promise.resolve(undefined), {
          unwrap: () =>
            new Promise((res) => {
              finishSave = res;
            }),
        }),
      );
      const { user } = renderForm();

      await clickSave(user);
      await clickSave(user);

      expect(mockSave).toHaveBeenCalledTimes(1);

      finishSave(mockTmntFullData);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
      );
    });

    it("does not save again after a successful save", async () => {
      const { user } = renderForm();

      await clickSave(user);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );

      await clickSave(user);

      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe("save - new tournament", () => {
    const savedSquads = [{ id: "sqd_1" }, { id: "sqd_2" }];

    it("creates an initial stage for each saved squad", async () => {
      mockSave.mockImplementation(
        saveResolving({ ...mockTmntFullData, squads: savedSquads }),
      );
      const { user } = renderForm({ tmntFullData: newTmntData() });

      await user.type(nameInput(), "My Tmnt");
      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
      );
      // the ids come from the SAVED squads, which now have database ids
      expect(mockPostInitialStage).toHaveBeenCalledTimes(2);
      expect(mockPostInitialStage).toHaveBeenCalledWith("sqd_1");
      expect(mockPostInitialStage).toHaveBeenCalledWith("sqd_2");
      expect(errorModal()).toHaveAttribute(
        "data-message",
        "Tournament: My Tmnt saved.",
      );
    });

    it("explains when the tournament saved but a squad stage did not", async () => {
      mockPostInitialStage.mockRejectedValue(new Error("stage failed"));
      const { user } = renderForm({ tmntFullData: newTmntData() });

      await user.type(nameInput(), "My Tmnt");
      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      expect(errorModal()).toHaveAttribute("data-title", "Cannot Save");
      expect(errorModal()).toHaveAttribute(
        "data-message",
        "Tournament saved, but squad stage could not be initialized.",
      );
    });

    // the tournament IS saved, so staying on the form and saving again
    // would create a second copy of it
    it("goes back to the list after a stage failure and does not save again", async () => {
      mockPostInitialStage.mockRejectedValue(new Error("stage failed"));
      const { user } = renderForm({ tmntFullData: newTmntData() });

      await user.type(nameInput(), "My Tmnt");
      await clickSave(user);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );

      await clickSave(user);
      expect(mockSave).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });
  });

  describe("save - errors", () => {
    it.each([
      [ioDataError.TMNT, `Cannot save Tournament "${tmntName}".`],
      [ioDataError.EVENTS, "Cannot save Events."],
      [ioDataError.DIVS, "Cannot save Divisions."],
      [ioDataError.SQUADS, "Cannot save Squads."],
      [ioDataError.LANES, "Cannot save Lanes."],
      [ioDataError.POTS, "Cannot save Pots."],
      [ioDataError.BRKTS, "Cannot save Brackets."],
      [ioDataError.ELIMS, "Cannot save Eliminators."],
    ])("shows the right message for error type %s", async (errorType, message) => {
      mockSave.mockImplementation(saveRejecting({ errorType }));
      const { user } = renderForm();

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      expect(errorModal()).toHaveAttribute("data-title", "Cannot Save");
      expect(errorModal()).toHaveAttribute("data-message", message);
      expect(mockMarkPendingChanges).not.toHaveBeenCalledWith(false);
    });

    it.each([
      ["an unknown error type", { errorType: "nope" }],
      ["a plain Error", new Error("boom")],
      ["undefined", undefined],
    ])("shows the unknown error message for %s", async (_label, err) => {
      mockSave.mockImplementation(saveRejecting(err));
      const { user } = renderForm();

      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute(
          "data-message",
          "Unknown error saving Tournament.",
        ),
      );
    });

    it("stays on the form when the error modal is closed", async () => {
      mockSave.mockImplementation(saveRejecting({ errorType: ioDataError.TMNT }));
      const { user } = renderForm();

      await clickSave(user);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-show", "true"),
      );
      await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

      expect(errorModal()).toHaveAttribute("data-show", "false");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("lets the user try again after a failed save", async () => {
      mockSave.mockImplementationOnce(
        saveRejecting({ errorType: ioDataError.TMNT }),
      );
      const { user } = renderForm();

      await clickSave(user);
      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Cannot Save"),
      );
      await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

      // 2nd try succeeds (default mock)
      await clickSave(user);

      await waitFor(() =>
        expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
      );
      expect(mockSave).toHaveBeenCalledTimes(2);
    });
  });

  describe("save button focus guard", () => {
    it("does not save when the Save button is not the focused element", () => {
      renderForm();

      nameInput().focus();
      expect(nameInput()).toHaveFocus();
      // fireEvent.click does not move focus to the button
      fireEvent.click(saveButton());

      expect(validateEvents).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe("wait modal", () => {
    it("shows 'Saving...' while the store is saving", () => {
      renderForm({}, makeStore([mockBowl], "saving" as ioStatusType));

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "true",
      );
      expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Saving...");
    });

    it("is hidden when the store is not saving", () => {
      renderForm();

      expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
        "data-show",
        "false",
      );
    });
  });

  describe("getLanesTabTitle", () => {
    it('renders "Lanes -" with a single lane_count', () => {
      renderForm({
        tmntFullData: {
          ...mockTmntFullData,
          squads: [{ lane_count: 8 } as squadType],
        },
      });

      expect(screen.getByText("Lanes - 8")).toBeInTheDocument();
    });

    it("renders comma-separated lane counts for multiple squads", () => {
      renderForm({
        tmntFullData: {
          ...mockTmntFullData,
          squads: [
            { lane_count: 8 } as squadType,
            { lane_count: 12 } as squadType,
            { lane_count: 16 } as squadType,
          ],
        },
      });

      expect(screen.getByText("Lanes - 8, 12, 16")).toBeInTheDocument();
    });

    it('renders nothing after "Lanes -" when there are no squads', () => {
      renderForm({ tmntFullData: { ...mockTmntFullData, squads: [] } });

      expect(screen.getByText("Lanes -")).toBeInTheDocument();
    });
  });

  describe("cancel", () => {
    it("when stage is not DEFINE, Cancel goes straight back to /user/tmnts", () => {
      renderForm({ stage: SquadStage.ENTRIES });

      expect(cancelButton()).toBeEnabled();
      fireEvent.click(cancelButton());

      expect(confirmModal()).toHaveAttribute("data-show", "false");
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });

    it("when editing in DEFINE, Cancel asks first and does not navigate yet", () => {
      renderForm();

      fireEvent.click(cancelButton());

      expect(mockPush).not.toHaveBeenCalled();
      expect(confirmModal()).toHaveAttribute("data-show", "true");
      expect(confirmModal()).toHaveAttribute(
        "data-title",
        "Cancel Editing Tournament",
      );
      expect(confirmModal()).toHaveAttribute(
        "data-message",
        "Do you want to cancel editing tournament?",
      );
    });

    it("for a new tournament, the confirm text says 'New'", () => {
      renderForm({ tmntFullData: newTmntData() });

      fireEvent.click(cancelButton());

      expect(confirmModal()).toHaveAttribute("data-title", "Cancel New Tournament");
      expect(confirmModal()).toHaveAttribute(
        "data-message",
        "Do you want to cancel entering new tournament?",
      );
    });

    it("confirming the cancel goes back to /user/tmnts", async () => {
      const { user } = renderForm();

      fireEvent.click(cancelButton());
      await user.click(screen.getByRole("button", { name: "ConfirmMock-yes" }));

      expect(confirmModal()).toHaveAttribute("data-show", "false");
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });

    it("declining the cancel closes the modal and stays on the form", async () => {
      const { user } = renderForm();

      fireEvent.click(cancelButton());
      await user.click(screen.getByRole("button", { name: "ConfirmMock-no" }));

      expect(confirmModal()).toHaveAttribute("data-show", "false");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not save while the cancel modal is showing", async () => {
      const { user } = renderForm();

      fireEvent.click(cancelButton());
      await clickSave(user);

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe("passes markPendingChanges to the child sections", () => {
    it.each(["events", "divs", "squads", "lanes", "pots", "brkts", "elims"])(
      "passes markPendingChanges to the %s section",
      (child) => {
        renderForm();

        expect(mockChildProps[child].markPendingChanges).toBe(
          mockMarkPendingChanges,
        );
      },
    );
  });
});

// // test/app/(private)/dataEntry/tmnts/tmntForm.interactions.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/tmntForm.tsx
// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import { Provider } from "react-redux";
// import userEvent from "@testing-library/user-event";
// import { configureStore } from "@reduxjs/toolkit";
// import { SquadStage } from "@prisma/client";
// import { cloneDeep } from "lodash";
// import tmntFullDataReducer, {
//   saveTmntFullData,
// } from "@/redux/features/tmntFullData/tmntFullDataSlice";
// import bowlsReducer from "@/redux/features/bowls/bowlsSlice";
// import TmntDataForm from "@/app/(private)/dataEntry/tmntForm/tmntForm";
// import type { bowlType, squadType, tmntFormDataType } from "@/lib/types/types";
// import { tmntFormParent, ioDataError } from "@/lib/enums/enums";
// import { getBlankTmntFullData } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
// import { postInitialStageForSquad } from "@/lib/db/stages/dbStages";
// import { validateEvents } from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
// import { validateDivs } from "@/app/(private)/dataEntry/tmntForm/oneToNDivs";
// import { validateSquads } from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
// import { validatePots } from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
// import { validateBrkts } from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
// import { validateElims } from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
// import {
//   mockBowl,
//   mockTmntFullData,
// } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { ioStatusType } from "@/redux/statusTypes";

// // ---- mocks ----

// const mockPush = jest.fn();
// const mockMarkPendingChanges = jest.fn();

// jest.mock("next/navigation", () => ({
//   useRouter() {
//     return {
//       push: mockPush,
//       prefetch: jest.fn(),
//     };
//   },
// }));

// // The last props each child component received, keyed by child.
// // Read only at render time, so it is initialized by then.
// const mockChildProps: Record<string, Record<string, unknown>> = {};

// // child components: record their props, render a stub.
// // The paths must match the real files, now under (private).
// jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNEvents", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.events = props;
//     return <div>MockEvents</div>;
//   },
//   validateEvents: jest.fn(),
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNDivs", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.divs = props;
//     return <div>MockDivs</div>;
//   },
//   validateDivs: jest.fn(),
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNSquads", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.squads = props;
//     return <div>MockSquads</div>;
//   },
//   validateSquads: jest.fn(),
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/oneToNLanes", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.lanes = props;
//     return <div>MockLanes</div>;
//   },
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNPots", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.pots = props;
//     return <div>MockPots</div>;
//   },
//   validatePots: jest.fn(),
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNBrkts", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.brkts = props;
//     return <div>MockBrkts</div>;
//   },
//   validateBrkts: jest.fn(),
// }));
// jest.mock("@/app/(private)/dataEntry/tmntForm/zeroToNElims", () => ({
//   __esModule: true,
//   default: (props: Record<string, unknown>) => {
//     mockChildProps.elims = props;
//     return <div>MockElims</div>;
//   },
//   validateElims: jest.fn(),
// }));

// // modals: expose their props as attributes, and their handlers as buttons.
// // Button names are unique so they never match the form's own Cancel button.
// jest.mock("@/components/modal/confirmModal", () => ({
//   __esModule: true,
//   default: ({
//     show,
//     title,
//     message,
//     onConfirm,
//     onCancel,
//   }: {
//     show: boolean;
//     title: string;
//     message: string;
//     onConfirm: () => void;
//     onCancel: () => void;
//   }) => (
//     <div
//       data-testid="ModalConfirmMock"
//       data-show={String(!!show)}
//       data-title={title}
//       data-message={message}
//     >
//       <button type="button" onClick={onConfirm}>
//         ConfirmMock-yes
//       </button>
//       <button type="button" onClick={onCancel}>
//         ConfirmMock-no
//       </button>
//     </div>
//   ),
// }));
// jest.mock("@/components/modal/errorModal", () => ({
//   __esModule: true,
//   cannotSaveTitle: "Cannot Save",
//   default: ({
//     show,
//     title,
//     message,
//     onCancel,
//   }: {
//     show: boolean;
//     title: string;
//     message: string;
//     onCancel: () => void;
//   }) => (
//     <div
//       data-testid="ModalErrorMsgMock"
//       data-show={String(!!show)}
//       data-title={title}
//       data-message={message}
//     >
//       <button type="button" onClick={onCancel}>
//         ErrorModalMock-close
//       </button>
//     </div>
//   ),
// }));
// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: ({ show, message }: { show: boolean; message: string }) => (
//     <div data-testid="WaitModalMock" data-show={String(!!show)}>
//       {message}
//     </div>
//   ),
// }));

// // redux: keep the real reducer, replace the save thunk
// jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
//   __esModule: true,
//   ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
//   saveTmntFullData: jest.fn(),
// }));
// const mockSave = saveTmntFullData as unknown as jest.Mock;

// jest.mock("@/lib/db/stages/dbStages", () => ({
//   __esModule: true,
//   postInitialStageForSquad: jest.fn(),
// }));
// const mockPostInitialStage = postInitialStageForSquad as jest.Mock;

// // react-bootstrap Accordion: Header is a plain <button>, Body always renders
// jest.mock("react-bootstrap", () => {
//   const actual = jest.requireActual("react-bootstrap");

//   const AccordionItemMock = ({ children }: { children: React.ReactNode }) => (
//     <div data-testid="AccordionItemMock">{children}</div>
//   );

//   const AccordionMock = Object.assign(
//     ({ children }: { children: React.ReactNode }) => (
//       <div data-testid="AccordionMock">{children}</div>
//     ),
//     {
//       Header: ({
//         children,
//         className,
//         "data-testid": testId,
//       }: {
//         children: React.ReactNode;
//         className?: string;
//         "data-testid"?: string;
//       }) => (
//         <button type="button" data-testid={testId} className={className}>
//           {children}
//         </button>
//       ),
//       Body: ({
//         children,
//         className,
//         "data-testid": testId,
//       }: {
//         children: React.ReactNode;
//         className?: string;
//         "data-testid"?: string;
//       }) => (
//         <div data-testid={testId} className={className}>
//           {children}
//         </div>
//       ),
//     },
//   );

//   return {
//     __esModule: true,
//     ...actual,
//     Accordion: AccordionMock,
//     AccordionItem: AccordionItemMock,
//   };
// });

// // ---- helpers ----

// const makeStore = (
//   bowls: bowlType[] = [],
//   saveStatus: ioStatusType = "idle" as ioStatusType,
// ) => {
//   // start from each slice's real initial state, so new fields added to a
//   // slice later (like requestedTmntId) are always present
//   const initAction = { type: "@@test/init" };
//   const tmntFullDataInit = tmntFullDataReducer(undefined, initAction);
//   const bowlsInit = bowlsReducer(undefined, initAction);

//   return configureStore({
//     reducer: {
//       tmntFullData: tmntFullDataReducer,
//       bowls: bowlsReducer,
//     },
//     preloadedState: {
//       bowls: {
//         ...bowlsInit,
//         bowls,
//       },
//       tmntFullData: {
//         ...tmntFullDataInit,
//         tmntFullData: getBlankTmntFullData(),
//         saveStatus,
//       },
//     },
//   });
// };

// // The form calls dispatch(saveTmntFullData(data)).unwrap(), so:
// //   saveTmntFullData(data) must return a thunk (a function),
// //   the thunk middleware runs it, and its result needs an unwrap()
// //   like a real async thunk's result.
// // These build an implementation for mockSave: data => thunk => result
// const saveResolving = (value: unknown) => () => () =>
//   Object.assign(Promise.resolve(undefined), {
//     unwrap: () => Promise.resolve(value),
//   });
// const saveRejecting = (err: unknown) => () => () =>
//   Object.assign(Promise.resolve(undefined), {
//     unwrap: () => Promise.reject(err),
//   });

// // an existing tournament (has a name), so the form is "editing"
// const tmntProps: tmntFormDataType = {
//   tmntFullData: mockTmntFullData,
//   stage: SquadStage.DEFINE,
//   parentForm: tmntFormParent.NEW,
// };
// const tmntName = mockTmntFullData.tmnt.tmnt_name;

// // a new tournament: the form treats a blank name as new
// const newTmntData = () => {
//   const data = cloneDeep(mockTmntFullData);
//   data.tmnt.tmnt_name = "";
//   return data;
// };

// const renderForm = (
//   overrides: Partial<tmntFormDataType> = {},
//   store = makeStore([mockBowl]),
// ) => {
//   const user = userEvent.setup();
//   render(
//     <Provider store={store}>
//       <TmntDataForm
//         tmntProps={{ ...tmntProps, ...overrides }}
//         markPendingChanges={mockMarkPendingChanges}
//       />
//     </Provider>,
//   );
//   return { user, store };
// };

// const nameInput = () =>
//   screen.getByLabelText(/tournament name/i) as HTMLInputElement;
// const saveButton = () =>
//   screen.getByRole("button", { name: /save tournament/i });
// const cancelButton = () => screen.getByRole("button", { name: /^cancel$/i });
// const errorModal = () => screen.getByTestId("ModalErrorMsgMock");
// const confirmModal = () => screen.getByTestId("ModalConfirmMock");
// const squadsProp = () => mockChildProps.squads.squads as squadType[];

// // handleSave only runs when the Save button itself has focus
// const clickSave = async (user: ReturnType<typeof userEvent.setup>) => {
//   saveButton().focus();
//   await user.click(saveButton());
// };

// beforeEach(() => {
//   jest.clearAllMocks();
//   for (const key of Object.keys(mockChildProps)) delete mockChildProps[key];

//   // every section is valid unless a test says otherwise
//   (validateEvents as jest.Mock).mockReturnValue(true);
//   (validateDivs as jest.Mock).mockReturnValue(true);
//   (validateSquads as jest.Mock).mockReturnValue(true);
//   (validatePots as jest.Mock).mockReturnValue(true);
//   (validateBrkts as jest.Mock).mockReturnValue(true);
//   (validateElims as jest.Mock).mockReturnValue(true);

//   mockSave.mockImplementation(saveResolving(mockTmntFullData));
//   mockPostInitialStage.mockResolvedValue(undefined);
// });

// // ---- tests ----

// describe("tmntDataForm - interactions", () => {
//   describe("handleInputChange", () => {
//     it("should update the tmnt_name when input changes", () => {
//       renderForm();

//       fireEvent.change(nameInput(), {
//         target: { name: "tmnt_name", value: "New Value" },
//       });

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(nameInput().value).toBe("New Value");
//     });

//     it("should update start_date", () => {
//       renderForm();

//       const startDateInput = screen.getByTestId("inputStartDate") as HTMLInputElement;
//       fireEvent.change(startDateInput, {
//         target: { name: "start_date", value: "2025-01-02" },
//       });

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(startDateInput.value).toBe("2025-01-02");
//     });

//     it("should update end_date", () => {
//       renderForm();

//       const endDateInput = screen.getByTestId("inputEndDate") as HTMLInputElement;
//       fireEvent.change(endDateInput, {
//         target: { name: "end_date", value: "2025-01-02" },
//       });

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(endDateInput.value).toBe("2025-01-02");
//     });

//     it("clamps squad_date_str to the new start date when the squad date is outside the range", () => {
//       const customTmnt = cloneDeep(mockTmntFullData);
//       customTmnt.tmnt.start_date_str = "2025-01-01";
//       customTmnt.tmnt.end_date_str = "2025-01-10";
//       // a squad date before the start date, so it should be clamped
//       customTmnt.squads = [
//         { ...customTmnt.squads[0], squad_date_str: "2024-12-01" },
//       ];

//       renderForm({ tmntFullData: customTmnt });
//       expect(squadsProp()[0].squad_date_str).toBe("2024-12-01");

//       fireEvent.change(screen.getByTestId("inputStartDate"), {
//         target: { name: "start_date", value: "2025-01-02" },
//       });

//       expect(squadsProp()[0].squad_date_str).toBe("2025-01-02");
//     });

//     it("leaves a squad date that is inside the range alone", () => {
//       const customTmnt = cloneDeep(mockTmntFullData);
//       customTmnt.tmnt.start_date_str = "2025-01-01";
//       customTmnt.tmnt.end_date_str = "2025-01-10";
//       customTmnt.squads = [
//         { ...customTmnt.squads[0], squad_date_str: "2025-01-05" },
//       ];

//       renderForm({ tmntFullData: customTmnt });

//       fireEvent.change(screen.getByTestId("inputStartDate"), {
//         target: { name: "start_date", value: "2025-01-02" },
//       });

//       expect(squadsProp()[0].squad_date_str).toBe("2025-01-05");
//     });

//     it("does not throw when markPendingChanges is not provided", () => {
//       render(
//         <Provider store={makeStore([mockBowl])}>
//           <TmntDataForm tmntProps={tmntProps} />
//         </Provider>,
//       );

//       expect(() => {
//         fireEvent.change(nameInput(), {
//           target: { name: "tmnt_name", value: "New Value" },
//         });
//       }).not.toThrow();
//       expect(nameInput().value).toBe("New Value");
//     });
//   });

//   describe("handleBowlSelectChange", () => {
//     it("should update the bowl_id when select changes", async () => {
//       const { user } = renderForm();

//       const bowlSelect = screen.getByTestId("inputBowlName") as HTMLSelectElement;
//       await user.selectOptions(bowlSelect, mockBowl.id);

//       const selectedOption = screen.getByRole("option", {
//         name: `${mockBowl.bowl_name} - ${mockBowl.city}, ${mockBowl.state}`,
//       }) as HTMLOptionElement;
//       expect(selectedOption.selected).toBe(true);
//       expect(bowlSelect.value).toBe(mockBowl.id);
//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//     });
//   });

//   describe("tournament info validation", () => {
//     it("shows required errors for a missing name, bowl and dates, and does not save", async () => {
//       const data = cloneDeep(mockTmntFullData);
//       data.tmnt.tmnt_name = "";
//       data.tmnt.bowl_id = "";
//       data.tmnt.start_date_str = "";
//       data.tmnt.end_date_str = "";
//       const { user } = renderForm({ tmntFullData: data });

//       await clickSave(user);

//       expect(screen.getByTestId("dangerTmntName")).toHaveTextContent(
//         "Tournament Name is required",
//       );
//       expect(screen.getByTestId("dangerBowlName")).toHaveTextContent(
//         "Bowl Name is required",
//       );
//       expect(screen.getByTestId("dangerStartDate")).toHaveTextContent(
//         "Start date is required",
//       );
//       expect(screen.getByTestId("dangerEndDate")).toHaveTextContent(
//         "End date is required",
//       );
//       expect(mockSave).not.toHaveBeenCalled();
//     });

//     it("shows an error when the end date is before the start date", async () => {
//       const data = cloneDeep(mockTmntFullData);
//       data.tmnt.start_date_str = "2025-01-10";
//       data.tmnt.end_date_str = "2025-01-01";
//       const { user } = renderForm({ tmntFullData: data });

//       await clickSave(user);

//       expect(screen.getByTestId("dangerEndDate")).toHaveTextContent(
//         "End date cannot be before start date",
//       );
//       expect(mockSave).not.toHaveBeenCalled();
//     });

//     it.each([
//       ["events", validateEvents],
//       ["divisions", validateDivs],
//       ["squads", validateSquads],
//       ["pots", validatePots],
//       ["brackets", validateBrkts],
//       ["eliminators", validateElims],
//     ])("does not save when the %s are invalid", async (_label, validator) => {
//       (validator as jest.Mock).mockReturnValue(false);
//       const { user } = renderForm();

//       await clickSave(user);

//       expect(validator).toHaveBeenCalled();
//       expect(mockSave).not.toHaveBeenCalled();
//     });

//     it("validates every section, not just up to the first failure", async () => {
//       (validateEvents as jest.Mock).mockReturnValue(false);
//       const { user } = renderForm();

//       await clickSave(user);

//       expect(validateDivs).toHaveBeenCalled();
//       expect(validateSquads).toHaveBeenCalled();
//       expect(validatePots).toHaveBeenCalled();
//       expect(validateBrkts).toHaveBeenCalled();
//       expect(validateElims).toHaveBeenCalled();
//     });
//   });

//   describe("error clearing on change", () => {
//     it("clears tmnt_name_err when user types a name after the required error", async () => {
//       const blankTmnt = getBlankTmntFullData();
//       blankTmnt.tmnt.tmnt_name = "";
//       const { user } = renderForm({ tmntFullData: blankTmnt });

//       await clickSave(user);
//       expect(screen.getByText(/tournament name is required/i)).toBeInTheDocument();

//       await user.type(nameInput(), "My Tmnt");

//       expect(
//         screen.queryByText(/tournament name is required/i),
//       ).not.toBeInTheDocument();
//     });

//     it("clears bowl_id_err when user selects a bowl after the required error", async () => {
//       const blankTmnt = getBlankTmntFullData();
//       blankTmnt.tmnt.bowl_id = "";
//       const { user } = renderForm({ tmntFullData: blankTmnt });

//       await clickSave(user);
//       const bowlError = screen.getByTestId("dangerBowlName");
//       expect(bowlError).toHaveTextContent(/bowl name is required/i);

//       await user.selectOptions(
//         screen.getByRole("combobox", { name: /bowl name/i }),
//         mockBowl.id,
//       );

//       expect(bowlError).not.toHaveTextContent(/\S/);
//     });
//   });

//   describe("save - existing tournament", () => {
//     it("dispatches saveTmntFullData with the form's data", async () => {
//       const { user } = renderForm();

//       await clickSave(user);

//       await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
//       expect(mockSave).toHaveBeenCalledWith(
//         expect.objectContaining({
//           tmnt: expect.objectContaining({ tmnt_name: tmntName }),
//           squads: mockTmntFullData.squads,
//         }),
//       );
//     });

//     it("shows the success modal and clears pending changes", async () => {
//       const { user } = renderForm();

//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved");
//       expect(errorModal()).toHaveAttribute(
//         "data-message",
//         `Tournament: ${tmntName} saved.`,
//       );
//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(false);
//     });

//     it("does not create initial squad stages for an existing tournament", async () => {
//       const { user } = renderForm();

//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       expect(mockPostInitialStage).not.toHaveBeenCalled();
//     });

//     it("goes back to the tournament list when the success modal is closed", async () => {
//       const { user } = renderForm();

//       await clickSave(user);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       expect(mockPush).not.toHaveBeenCalled();

//       await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

//       expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
//     });

//     it("saves only once when Save is clicked twice while saving", async () => {
//       let finishSave: (v: unknown) => void = () => {};
//       mockSave.mockImplementation(() => () =>
//         Object.assign(Promise.resolve(undefined), {
//           unwrap: () =>
//             new Promise((res) => {
//               finishSave = res;
//             }),
//         }),
//       );
//       const { user } = renderForm();

//       await clickSave(user);
//       await clickSave(user);

//       expect(mockSave).toHaveBeenCalledTimes(1);

//       finishSave(mockTmntFullData);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
//       );
//     });

//     it("does not save again after a successful save", async () => {
//       const { user } = renderForm();

//       await clickSave(user);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );

//       await clickSave(user);

//       expect(mockSave).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("save - new tournament", () => {
//     const savedSquads = [{ id: "sqd_1" }, { id: "sqd_2" }];

//     it("creates an initial stage for each saved squad", async () => {
//       mockSave.mockImplementation(
//         saveResolving({ ...mockTmntFullData, squads: savedSquads }),
//       );
//       const { user } = renderForm({ tmntFullData: newTmntData() });

//       await user.type(nameInput(), "My Tmnt");
//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
//       );
//       // the ids come from the SAVED squads, which now have database ids
//       expect(mockPostInitialStage).toHaveBeenCalledTimes(2);
//       expect(mockPostInitialStage).toHaveBeenCalledWith("sqd_1");
//       expect(mockPostInitialStage).toHaveBeenCalledWith("sqd_2");
//       expect(errorModal()).toHaveAttribute(
//         "data-message",
//         "Tournament: My Tmnt saved.",
//       );
//     });

//     it("explains when the tournament saved but a squad stage did not", async () => {
//       mockPostInitialStage.mockRejectedValue(new Error("stage failed"));
//       const { user } = renderForm({ tmntFullData: newTmntData() });

//       await user.type(nameInput(), "My Tmnt");
//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       expect(errorModal()).toHaveAttribute("data-title", "Cannot Save");
//       expect(errorModal()).toHaveAttribute(
//         "data-message",
//         "Tournament saved, but squad stage could not be initialized.",
//       );
//     });

//     // the tournament IS saved, so staying on the form and saving again
//     // would create a second copy of it
//     it("goes back to the list after a stage failure and does not save again", async () => {
//       mockPostInitialStage.mockRejectedValue(new Error("stage failed"));
//       const { user } = renderForm({ tmntFullData: newTmntData() });

//       await user.type(nameInput(), "My Tmnt");
//       await clickSave(user);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );

//       await clickSave(user);
//       expect(mockSave).toHaveBeenCalledTimes(1);

//       await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));
//       expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
//     });
//   });

//   describe("save - errors", () => {
//     it.each([
//       [ioDataError.TMNT, `Cannot save Tournament "${tmntName}".`],
//       [ioDataError.EVENTS, "Cannot save Events."],
//       [ioDataError.DIVS, "Cannot save Divisions."],
//       [ioDataError.SQUADS, "Cannot save Squads."],
//       [ioDataError.LANES, "Cannot save Lanes."],
//       [ioDataError.POTS, "Cannot save Pots."],
//       [ioDataError.BRKTS, "Cannot save Brackets."],
//       [ioDataError.ELIMS, "Cannot save Eliminators."],
//     ])("shows the right message for error type %s", async (errorType, message) => {
//       mockSave.mockImplementation(saveRejecting({ errorType }));
//       const { user } = renderForm();

//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       expect(errorModal()).toHaveAttribute("data-title", "Cannot Save");
//       expect(errorModal()).toHaveAttribute("data-message", message);
//       expect(mockMarkPendingChanges).not.toHaveBeenCalledWith(false);
//     });

//     it.each([
//       ["an unknown error type", { errorType: "nope" }],
//       ["a plain Error", new Error("boom")],
//       ["undefined", undefined],
//     ])("shows the unknown error message for %s", async (_label, err) => {
//       mockSave.mockImplementation(saveRejecting(err));
//       const { user } = renderForm();

//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute(
//           "data-message",
//           "Unknown error saving Tournament.",
//         ),
//       );
//     });

//     it("stays on the form when the error modal is closed", async () => {
//       mockSave.mockImplementation(saveRejecting({ errorType: ioDataError.TMNT }));
//       const { user } = renderForm();

//       await clickSave(user);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-show", "true"),
//       );
//       await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

//       expect(errorModal()).toHaveAttribute("data-show", "false");
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("lets the user try again after a failed save", async () => {
//       mockSave.mockImplementationOnce(
//         saveRejecting({ errorType: ioDataError.TMNT }),
//       );
//       const { user } = renderForm();

//       await clickSave(user);
//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-title", "Cannot Save"),
//       );
//       await user.click(screen.getByRole("button", { name: "ErrorModalMock-close" }));

//       // 2nd try succeeds (default mock)
//       await clickSave(user);

//       await waitFor(() =>
//         expect(errorModal()).toHaveAttribute("data-title", "Tournament Saved"),
//       );
//       expect(mockSave).toHaveBeenCalledTimes(2);
//     });
//   });

//   describe("save button focus guard", () => {
//     it("does not save when the Save button is not the focused element", () => {
//       renderForm();

//       nameInput().focus();
//       expect(nameInput()).toHaveFocus();
//       // fireEvent.click does not move focus to the button
//       fireEvent.click(saveButton());

//       expect(validateEvents).not.toHaveBeenCalled();
//       expect(mockSave).not.toHaveBeenCalled();
//     });
//   });

//   describe("wait modal", () => {
//     it("shows 'Saving...' while the store is saving", () => {
//       renderForm({}, makeStore([mockBowl], "saving" as ioStatusType));

//       expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
//         "data-show",
//         "true",
//       );
//       expect(screen.getByTestId("WaitModalMock")).toHaveTextContent("Saving...");
//     });

//     it("is hidden when the store is not saving", () => {
//       renderForm();

//       expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
//         "data-show",
//         "false",
//       );
//     });
//   });

//   describe("getLanesTabTitle", () => {
//     it('renders "Lanes -" with a single lane_count', () => {
//       renderForm({
//         tmntFullData: {
//           ...mockTmntFullData,
//           squads: [{ lane_count: 8 } as squadType],
//         },
//       });

//       expect(screen.getByText("Lanes - 8")).toBeInTheDocument();
//     });

//     it("renders comma-separated lane counts for multiple squads", () => {
//       renderForm({
//         tmntFullData: {
//           ...mockTmntFullData,
//           squads: [
//             { lane_count: 8 } as squadType,
//             { lane_count: 12 } as squadType,
//             { lane_count: 16 } as squadType,
//           ],
//         },
//       });

//       expect(screen.getByText("Lanes - 8, 12, 16")).toBeInTheDocument();
//     });

//     it('renders nothing after "Lanes -" when there are no squads', () => {
//       renderForm({ tmntFullData: { ...mockTmntFullData, squads: [] } });

//       expect(screen.getByText("Lanes -")).toBeInTheDocument();
//     });
//   });

//   describe("cancel", () => {
//     it("when stage is not DEFINE, Cancel goes straight back to /user/tmnts", () => {
//       renderForm({ stage: SquadStage.ENTRIES });

//       expect(cancelButton()).toBeEnabled();
//       fireEvent.click(cancelButton());

//       expect(confirmModal()).toHaveAttribute("data-show", "false");
//       expect(mockPush).toHaveBeenCalledTimes(1);
//       expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
//     });

//     it("when editing in DEFINE, Cancel asks first and does not navigate yet", () => {
//       renderForm();

//       fireEvent.click(cancelButton());

//       expect(mockPush).not.toHaveBeenCalled();
//       expect(confirmModal()).toHaveAttribute("data-show", "true");
//       expect(confirmModal()).toHaveAttribute(
//         "data-title",
//         "Cancel Editing Tournament",
//       );
//       expect(confirmModal()).toHaveAttribute(
//         "data-message",
//         "Do you want to cancel editing tournament?",
//       );
//     });

//     it("for a new tournament, the confirm text says 'New'", () => {
//       renderForm({ tmntFullData: newTmntData() });

//       fireEvent.click(cancelButton());

//       expect(confirmModal()).toHaveAttribute("data-title", "Cancel New Tournament");
//       expect(confirmModal()).toHaveAttribute(
//         "data-message",
//         "Do you want to cancel entering new tournament?",
//       );
//     });

//     it("confirming the cancel goes back to /user/tmnts", async () => {
//       const { user } = renderForm();

//       fireEvent.click(cancelButton());
//       await user.click(screen.getByRole("button", { name: "ConfirmMock-yes" }));

//       expect(confirmModal()).toHaveAttribute("data-show", "false");
//       expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
//     });

//     it("declining the cancel closes the modal and stays on the form", async () => {
//       const { user } = renderForm();

//       fireEvent.click(cancelButton());
//       await user.click(screen.getByRole("button", { name: "ConfirmMock-no" }));

//       expect(confirmModal()).toHaveAttribute("data-show", "false");
//       expect(mockPush).not.toHaveBeenCalled();
//     });

//     it("does not save while the cancel modal is showing", async () => {
//       const { user } = renderForm();

//       fireEvent.click(cancelButton());
//       await clickSave(user);

//       expect(mockSave).not.toHaveBeenCalled();
//     });
//   });

//   describe("disabled modes", () => {
//     it("NEW in DEFINE: everything is editable and no 'cannot be edited' note", () => {
//       renderForm();

//       expect(nameInput()).toBeEnabled();
//       expect(screen.getByTestId("inputBowlName")).toBeEnabled();
//       expect(screen.getByTestId("inputStartDate")).toBeEnabled();
//       expect(screen.getByTestId("inputEndDate")).toBeEnabled();
//       expect(saveButton()).toBeEnabled();
//       expect(cancelButton()).toBeEnabled();
//       expect(screen.queryByText(/cannot be edited/i)).not.toBeInTheDocument();
//       expect(mockChildProps.events.isDisabled).toBe(false);
//     });

//     it("EDIT after DEFINE: shows the note, disables inputs and Save, keeps Cancel", () => {
//       renderForm({ parentForm: tmntFormParent.EDIT, stage: SquadStage.ENTRIES });

//       expect(
//         screen.getByText("Tournament has entries. Cannot be edited."),
//       ).toBeInTheDocument();
//       expect(nameInput()).toBeDisabled();
//       expect(screen.getByTestId("inputBowlName")).toBeDisabled();
//       expect(screen.getByTestId("inputStartDate")).toBeDisabled();
//       expect(screen.getByTestId("inputEndDate")).toBeDisabled();
//       expect(saveButton()).toBeDisabled();
//       expect(cancelButton()).toBeEnabled();
//     });

//     it("RUN: inputs disabled, no Save or Cancel, no 'cannot be edited' note", () => {
//       renderForm({ parentForm: tmntFormParent.RUN, stage: SquadStage.DEFINE });

//       expect(nameInput()).toBeDisabled();
//       expect(
//         screen.queryByRole("button", { name: /save tournament/i }),
//       ).not.toBeInTheDocument();
//       expect(
//         screen.queryByRole("button", { name: /^cancel$/i }),
//       ).not.toBeInTheDocument();
//       expect(screen.queryByText(/cannot be edited/i)).not.toBeInTheDocument();
//     });

//     it.each(["events", "divs", "squads", "lanes", "pots", "brkts", "elims"])(
//       "passes isDisabled to the %s section",
//       (child) => {
//         renderForm({ parentForm: tmntFormParent.RUN });

//         expect(mockChildProps[child].isDisabled).toBe(true);
//       },
//     );
//   });

//   describe("passes markPendingChanges to the child sections", () => {
//     it.each(["events", "divs", "squads", "lanes", "pots", "brkts", "elims"])(
//       "passes markPendingChanges to the %s section",
//       (child) => {
//         renderForm();

//         expect(mockChildProps[child].markPendingChanges).toBe(
//           mockMarkPendingChanges,
//         );
//       },
//     );
//   });
// });

