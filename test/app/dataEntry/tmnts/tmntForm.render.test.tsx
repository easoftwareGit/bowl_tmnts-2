import React from "react"; 
import { render, screen } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import { configureStore } from "@reduxjs/toolkit"; 
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import type { bowlType, tmntFormDataType } from "@/lib/types/types"; 
import { tmntFormParent, ioDataError } from "@/lib/enums/enums";
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools"; 
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 
  
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

import { SquadStage } from "@prisma/client";
import { cloneDeep } from "lodash";

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

const renderForm = (
  props: tmntFormDataType,
  bowls: bowlType[] = [mockBowl]
) => {
  const store = makeStore(bowls);
  return render(
    <Provider store={store}>
      <TmntDataForm tmntProps={props} />
    </Provider>
  );
};  

const tmntProps: tmntFormDataType = { 
  tmntFullData: mockTmntFullData, 
  stage: SquadStage.DEFINE,
  parentForm: tmntFormParent.NEW,
} 

describe('tmntDataForm - render', () => { 

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders the top-level modals (hidden by default)", () => {
    renderForm(tmntProps);

    expect(screen.getByTestId("ModalConfirmMock")).toHaveAttribute(
      "data-show",
      "false"
    );
    expect(screen.getByTestId("ModalErrorMsgMock")).toHaveAttribute(
      "data-show",
      "false"
    );

    // saveStatus defaults to "idle" in makeStore, so WaitModal should be hidden
    expect(screen.getByTestId("WaitModalMock")).toHaveAttribute(
      "data-show",
      "false"
    );
  });
  it("renders bowl options from the Redux bowls slice", () => {
    const bowls: bowlType[] = [
      mockBowl,
      {
        ...(mockBowl as any),
        id: "bwl_2",
        bowl_name: "Second Bowl",
        city: "Austin",
        state: "TX",
      },
    ];

    renderForm(tmntProps, bowls);

    const select = screen.getByTestId("inputBowlName") as HTMLSelectElement;

    // includes the "Choose..." option plus bowlOptions
    expect(screen.getByRole("option", { name: /choose/i })).toBeDisabled();
    expect(
      screen.getByRole("option", {
        name: new RegExp(`${mockBowl.bowl_name} - ${mockBowl.city}, ${mockBowl.state}`, "i"),
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: /second bowl - austin, tx/i,
      })
    ).toBeInTheDocument();

    // select exists and is enabled in New mode
    expect(select).toBeEnabled();
  });
  it("shows Save/Cancel buttons when isDisabled is false", () => {
    renderForm(tmntProps);

    expect(
      screen.getByRole("button", { name: /save tournament/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
  it("does show Save/Cancel buttons when parentForm not 'RUN'", () => {
    renderForm(tmntProps);

    expect(
      screen.getByRole("button", { name: /save tournament/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
  it("does NOT show Save/Cancel buttons when parentForm is 'RUN'", () => {
    const runProps = cloneDeep(tmntProps);
    runProps.parentForm = tmntFormParent.RUN;

    renderForm(runProps);

    expect(
      screen.queryByRole("button", { name: /save tournament/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });
  it("when stage is NOT DEFINE, shows disabled warning and disables inputs", () => {
    const noEditProps: tmntFormDataType = {
      ...tmntProps,
      stage: SquadStage.ENTRIES,
      parentForm: tmntFormParent.EDIT,
    };

    renderForm(noEditProps);

    expect(
      screen.getByText(/tournament has entries\. cannot be edited\./i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/tournament name/i)).toBeDisabled();
    expect(screen.getByLabelText(/bowl name/i)).toBeDisabled();
    expect(screen.getByLabelText(/start date/i)).toBeDisabled();
    expect(screen.getByLabelText(/end date/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /save tournament/i })).toBeDisabled();
    // cancel button is ENABLED
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });
  it("hides 'Cannot edit' warning when parent form is 'RUN'", () => {
    const runEditProps: tmntFormDataType = {
      ...tmntProps,
      stage: SquadStage.ENTRIES,
      parentForm: tmntFormParent.RUN,
    };

    renderForm(runEditProps);

    expect(
      screen.queryByText(/tournament has entries\. cannot be edited\./i)
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText(/tournament name/i)).toBeDisabled();
    expect(screen.getByLabelText(/bowl name/i)).toBeDisabled();
    expect(screen.getByLabelText(/start date/i)).toBeDisabled();
    expect(screen.getByLabelText(/end date/i)).toBeDisabled();

    expect(screen.queryByRole("button", { name: /save tournament/i })).not.toBeInTheDocument();      
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });
  it("hides 'Cannot edit' warning when parent form is 'NEW' and stage is DEFINE", () => {
    renderForm(tmntProps);

    expect(
      screen.queryByText(/tournament has entries\. cannot be edited\./i)
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText(/tournament name/i)).toBeEnabled();
    expect(screen.getByLabelText(/bowl name/i)).toBeEnabled();
    expect(screen.getByLabelText(/start date/i)).toBeEnabled();
    expect(screen.getByLabelText(/end date/i)).toBeEnabled();

    expect(screen.getByRole("button", { name: /save tournament/i })).toBeEnabled();      
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });
  it("hides 'Cannot edit' warning when parent form is 'EDIT' and stage is DEFINE", () => {
    const editProps = cloneDeep(tmntProps);
    editProps.parentForm = tmntFormParent.EDIT;
    editProps.stage = SquadStage.DEFINE;

    renderForm(editProps);

    expect(
      screen.queryByText(/tournament has entries\. cannot be edited\./i)
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText(/tournament name/i)).toBeEnabled();
    expect(screen.getByLabelText(/bowl name/i)).toBeEnabled();
    expect(screen.getByLabelText(/start date/i)).toBeEnabled();
    expect(screen.getByLabelText(/end date/i)).toBeEnabled();

    expect(screen.getByRole("button", { name: /save tournament/i })).toBeEnabled();      
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });
  it("shows 'Cannot edit' warning when parent form is 'EDIT' and stage is ENTRIES", () => {
    const editProps = cloneDeep(tmntProps);
    editProps.parentForm = tmntFormParent.EDIT;
    editProps.stage = SquadStage.ENTRIES;

    renderForm(editProps);

    expect(
      screen.getByText(/tournament has entries\. cannot be edited\./i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/tournament name/i)).toBeDisabled();
    expect(screen.getByLabelText(/bowl name/i)).toBeDisabled();
    expect(screen.getByLabelText(/start date/i)).toBeDisabled();
    expect(screen.getByLabelText(/end date/i)).toBeDisabled();

    expect(screen.getByRole("button", { name: /save tournament/i })).toBeDisabled();
    // cancel button is ENABLED
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });
  it("renders accordion headers with counts derived from tmntFullData", () => {
    renderForm(tmntProps);

    // These are on the mocked Accordion.Header buttons
    expect(screen.getByTestId("eventsAcdnHeader")).toHaveTextContent(
      `Events - ${mockTmntFullData.events.length}`
    );
    expect(screen.getByTestId("divsAcdnHeader")).toHaveTextContent(
      `Divisions - ${mockTmntFullData.divs.length}`
    );
    expect(screen.getByTestId("squadsAcdnHeader")).toHaveTextContent(
      `Squads - ${mockTmntFullData.squads.length}`
    );
    expect(screen.getByTestId("potsAcdnHeader")).toHaveTextContent(
      `Pots - ${mockTmntFullData.pots.length}`
    );
    expect(screen.getByTestId("brktsAcdnHeader")).toHaveTextContent(
      `Brackets - ${mockTmntFullData.brkts.length}`
    );
    expect(screen.getByTestId("elimsAcdnHeader")).toHaveTextContent(
      `Eliminators - ${mockTmntFullData.elims.length}`
    );

    // Lanes header uses lane_count values from squads -> "Lanes - X" or "X, Y"
    expect(screen.getByText(/lanes -/i)).toBeInTheDocument();
  });
  it("renders mocked child sections inside accordion bodies", () => {
    renderForm(tmntProps);

    // Because we mocked Accordion.Body to always render, these should exist immediately.
    expect(screen.getByText("MockEvents")).toBeInTheDocument();
    expect(screen.getByText("MockDivs")).toBeInTheDocument();
    expect(screen.getByText("MockSquads")).toBeInTheDocument();
    expect(screen.getByText("MockLanes")).toBeInTheDocument();
    expect(screen.getByText("MockPots")).toBeInTheDocument();
    expect(screen.getByText("MockBrkts")).toBeInTheDocument();
    expect(screen.getByText("MockElims")).toBeInTheDocument();
  });

})