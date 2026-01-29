import React from "react"; 
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import { configureStore } from "@reduxjs/toolkit"; 
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import { bowlType, ioDataError, tmntFormDataType, tmntFormParent } from "@/lib/types/types"; 
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools"; 
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 
import { validateEvents } from "@/app/dataEntry/tmntForm/oneToNEvents"; 
import { validateDivs } from "@/app/dataEntry/tmntForm/oneToNDivs"; 
import { validateSquads } from "@/app/dataEntry/tmntForm/oneToNSquads"; 
import { validatePots } from "@/app/dataEntry/tmntForm/zeroToNPots"; 
import { validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts"; 
import { validateElims } from "@/app/dataEntry/tmntForm/zeroToNElims"; 
  
const mockPush = jest.fn();

// Mock useRouter: 
jest.mock("next/navigation", () => ({ 
  useRouter() { 
    return { 
      push: mockPush, 
      prefetch: jest.fn(), 
    }; 
  }, 
})); 

// mock the components
jest.mock("@/app/dataEntry/tmntForm/oneToNEvents", () => ({ 
  __esModule: true, 
  default: () => <div>MockEvents</div>, 
  validateEvents: jest.fn().mockReturnValue(true), 
})); 
jest.mock("@/app/dataEntry/tmntForm/oneToNDivs", () => ({ 
  __esModule: true, 
  default: () => <div>MockDivs</div>, 
  validateDivs: jest.fn().mockReturnValue(true), 
})); 
jest.mock("@/app/dataEntry/tmntForm/oneToNSquads", () => ({ 
  __esModule: true, 
  default: () => <div>MockSquads</div>, 
  validateSquads: jest.fn().mockReturnValue(true), 
})); 
jest.mock("@/app/dataEntry/tmntForm/oneToNLanes", () => ({
  __esModule: true,
  default: () => <div>MockLanes</div>,
}));
jest.mock("@/app/dataEntry/tmntForm/zeroToNPots", () => ({ 
  __esModule: true, 
  default: () => <div>MockPots</div>, 
  validatePots: jest.fn().mockReturnValue(true), 
})); 
jest.mock("@/app/dataEntry/tmntForm/zeroToNBrkts", () => ({ 
  __esModule: true, 
  default: () => <div>MockBrkts</div>, 
  validateBrkts: jest.fn().mockReturnValue(true), 
})); 
jest.mock("@/app/dataEntry/tmntForm/zeroToNElims", () => ({ 
  __esModule: true, 
  default: () => <div>MockElims</div>, 
  validateElims: jest.fn().mockReturnValue(true), 
})); 

// mock the modals
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({
    show,
    title,
    message,
  }: {
    show: boolean;
    title: string;
    message: string;
  }) => (
    <div
      data-testid="ModalConfirmMock"
      data-show={String(!!show)}
      data-title={title}
      data-message={message}
    />
  ),
}));
jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  cannotSaveTitle: "Cannot Save",
  default: ({
    show,
    title,
    message,
  }: {
    show: boolean;
    title: string;
    message: string;
  }) => (
    <div
      data-testid="ModalErrorMsgMock"
      data-show={String(!!show)}
      data-title={title}
      data-message={message}
    />
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

// mock the redux
jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
  saveTmntFullData: jest.fn(),
}));

import { postInitialStageForSquad } from "@/lib/db/stages/dbStages";
import { SquadStage } from "@prisma/client";

// mock the postInitialStageForSquad
jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  postInitialStageForSquad: jest.fn(),
}));

const makeStore = (bowls: bowlType[] = []) =>
  configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },    
    preloadedState: {
      bowls: {
        bowls,
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
      },
      tmntFullData: {
        tmntFullData: getBlankTmntFullData(),
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
        ioError: ioDataError.NONE,
      },
    },
  });

// mock react-bootstrap Accordion
// - Accordion.Header becomes a real <button>
// - Accordion.Body renders always (no collapse logic)
jest.mock("react-bootstrap", () => {
  const actual = jest.requireActual("react-bootstrap");

  // Plain AccordionItem wrapper
  const AccordionItemMock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="AccordionItemMock">{children}</div>
  );

  // Accordion wrapper WITH static subcomponents: Accordion.Header / Accordion.Body  
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
    }
  );

  return {
    __esModule: true,
    ...actual,

    // Override ONLY once each
    Accordion: AccordionMock,
    AccordionItem: AccordionItemMock,
  };
});

describe('tmntDataForm - saving and stages', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('for new tournament: calls postInitialStageForSquad once per saved squad and shows "Tournament Saved" modal', async () => {
    // 1) All child validations pass
    (validateEvents as jest.Mock).mockReturnValue(true);
    (validateDivs as jest.Mock).mockReturnValue(true);
    (validateSquads as jest.Mock).mockReturnValue(true);
    (validatePots as jest.Mock).mockReturnValue(true);
    (validateBrkts as jest.Mock).mockReturnValue(true);
    (validateElims as jest.Mock).mockReturnValue(true);

    // 2) Mock what the *saved* tmnt looks like (with DB squad ids)
    // at this point only one squad per tournament
    const mockSavedTmnt = {
      ...mockTmntFullData,
      squads: [{ ...mockTmntFullData.squads[0], id: "sqd_111" }],
    };

    // 3) dispatch(...).unwrap() should resolve to mockSavedTmnt
    const unwrapMock = jest.fn().mockResolvedValue(mockSavedTmnt);

    const store = makeStore([mockBowl]);
    jest.spyOn(store, "dispatch").mockReturnValue({
      unwrap: unwrapMock,
    } as any);

    const postInitialStageForSquadMock =
      postInitialStageForSquad as unknown as jest.Mock;

    // 4) Make props represent a *new* tournament: blank name in props
    const newTmntProps: tmntFormDataType = {
      tmntFullData: {
        ...mockTmntFullData,
        tmnt: {
          ...mockTmntFullData.tmnt,
          tmnt_name: "",          // <-- makes newTmnt === true
        },
      },
      stage: SquadStage.DEFINE,
      parentForm: tmntFormParent.NEW,
    };

    // 5) Render
    render(
      <Provider store={store}>
        <TmntDataForm tmntProps={newTmntProps} />
      </Provider>
    );

    // 6) User types a name so validation passes
    const newName = "My New Tournament";
    const nameInput = screen.getByLabelText(/tournament name/i) as HTMLInputElement;
    fireEvent.change(nameInput, {
      target: { name: "tmnt_name", value: newName },
    });
    expect(nameInput.value).toBe(newName);

    // 7) Click Save
    const saveBtn = screen.getByText("Save Tournament");
    saveBtn.focus(); // needed because handleSave checks activeElement.id === 'saveButton'
    fireEvent.click(saveBtn);

    // 8) unwrap() called once (i.e., save "succeeded")
    await waitFor(() => expect(unwrapMock).toHaveBeenCalledTimes(1));

    // 9) Stage rows created from *saved* squads (because newTmnt === true)
    await waitFor(() =>
      expect(postInitialStageForSquadMock).toHaveBeenCalledTimes(1)
    );
    expect(postInitialStageForSquadMock).toHaveBeenCalledWith("sqd_111");

    // 10) Success modal shown with the *current* tmnt name
    const errModal = screen.getByTestId("ModalErrorMsgMock");
    expect(errModal).toHaveAttribute("data-show", "true");
    expect(errModal).toHaveAttribute("data-title", "Tournament Saved");
    expect(errModal).toHaveAttribute(
      "data-message",
      expect.stringContaining(newName)
    );
  });

  it('for EDIT in DEFINE stage: does NOT call postInitialStageForSquad but still shows "Tournament Saved" modal', async () => {
    (validateEvents as jest.Mock).mockReturnValue(true);
    (validateDivs as jest.Mock).mockReturnValue(true);
    (validateSquads as jest.Mock).mockReturnValue(true);
    (validatePots as jest.Mock).mockReturnValue(true);
    (validateBrkts as jest.Mock).mockReturnValue(true);
    (validateElims as jest.Mock).mockReturnValue(true);

    const editedSavedTmnt = {
      ...mockTmntFullData,
      tmnt: {
        ...mockTmntFullData.tmnt,
        tmnt_name: "Edited Tournament",
      },
      squads: [{ ...mockTmntFullData.squads[0], id: "sqd_999" }],
    };

    const unwrapMock = jest.fn().mockResolvedValue(editedSavedTmnt);

    const store = makeStore([mockBowl]);
    jest.spyOn(store, "dispatch").mockReturnValue({
      unwrap: unwrapMock,
    } as any);

    const postInitialStageForSquadMock =
      postInitialStageForSquad as unknown as jest.Mock;

    const editedProps: tmntFormDataType = {
      tmntFullData: editedSavedTmnt,
      stage: SquadStage.DEFINE, // define stage for EDIT
      parentForm: tmntFormParent.EDIT,
    };

    render(
      <Provider store={store}>
        <TmntDataForm tmntProps={editedProps} />
      </Provider>
    );

    const saveBtn = screen.getByText("Save Tournament");
    saveBtn.focus();
    fireEvent.click(saveBtn);

    await waitFor(() => expect(unwrapMock).toHaveBeenCalledTimes(1));

    // 👉 Now we expect a call for EDIT as well (since we changed the code above)
    await waitFor(() =>
      expect(postInitialStageForSquadMock).toHaveBeenCalledTimes(0)
    );
    // expect(postInitialStageForSquadMock).toHaveBeenCalledWith("sqd_999");

    const errModal = screen.getByTestId("ModalErrorMsgMock");
    expect(errModal).toHaveAttribute("data-show", "true");
    expect(errModal).toHaveAttribute("data-title", "Tournament Saved");
    expect(errModal).toHaveAttribute(
      "data-message",
      expect.stringContaining("Edited Tournament")
    );
  });

})