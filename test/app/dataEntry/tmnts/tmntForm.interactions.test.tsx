import React from "react"; 
import { render, screen, fireEvent } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import userEvent from "@testing-library/user-event"; 
import { configureStore } from "@reduxjs/toolkit"; 
import tmntFullDataReducer from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import type { bowlType, squadType, tmntFormDataType } from "@/lib/types/types"; 
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
let lastSquadsProp: squadType[] = [];
// jest.mock("@/app/dataEntry/tmntForm/oneToNSquads", () => ({ 
//   __esModule: true, 
//   default: () => <div>MockSquads</div>, 
//   validateSquads: jest.fn().mockReturnValue(true), 
// })); 
jest.mock("@/app/dataEntry/tmntForm/oneToNSquads", () => ({
  __esModule: true,
  // Capture the squads passed from TmntDataForm
  default: (props: { squads: squadType[] }) => {
    lastSquadsProp = props.squads;
    return <div>MockSquads</div>;
  },
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


const tmntProps: tmntFormDataType = { 
  tmntFullData: mockTmntFullData, 
  stage: SquadStage.DEFINE,
  parentForm: tmntFormParent.NEW
} 

describe('tmntDataForm - interactions', () => { 
  
  describe('handleInputChange', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
      lastSquadsProp = [];
    });

    it('should update the tmnt_name when input changes', () => {
      const store = makeStore([mockBowl]); 
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      )

      const nameInput = screen.getByLabelText(/Tournament Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { name: 'tmnt_name', value: 'New Value' } });

      expect(nameInput.value).toBe('New Value');
    });
    it('should update start_date and adjust squads within range', () => {
      const store = makeStore([mockBowl]); 
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      )

      const startDateInput = screen.getByTestId("inputStartDate") as HTMLInputElement;
      fireEvent.change(startDateInput, { target: { name: "start_date", value: "2025-01-02" } });

      expect(startDateInput.value).toBe("2025-01-02");
    });
    it('should update end_date and adjust squads within range', () => {
      const store = makeStore([mockBowl]); 
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      )

      const endDateInput = screen.getByTestId("inputEndDate") as HTMLInputElement;
      fireEvent.change(endDateInput, { target: { name: "end_date", value: "2025-01-02" } });

      expect(endDateInput.value).toBe("2025-01-02");
    });
    it("clamps squad_date_str to the new start date when squad date is outside the range", () => {
      // 1) Seed tmntProps with a squad whose date is OUTSIDE the start/end range
      const customTmnt = cloneDeep(mockTmntFullData);

      // Original tournament date range
      customTmnt.tmnt.start_date_str = "2025-01-01";
      customTmnt.tmnt.end_date_str = "2025-01-10";

      // Single squad with a date clearly *before* the start date, so it should be clamped
      customTmnt.squads = [
        {
          ...customTmnt.squads[0],
          squad_date_str: "2024-12-01", // outside [2025-01-01, 2025-01-10]
        } as any,
      ];

      const props: tmntFormDataType = {
        tmntFullData: customTmnt,
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };

      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={props} />
        </Provider>
      );

      // At this point, TmntDataForm has initialized state with our custom squads
      // lastSquadsProp has the initial squads passed into OneToNSquads
      expect(lastSquadsProp[0].squad_date_str).toBe("2024-12-01");

      // 2) Change the start date to a new valid value
      const newStart = "2025-01-02";
      const startDateInput = screen.getByTestId("inputStartDate") as HTMLInputElement;

      fireEvent.change(startDateInput, {
        target: { name: "start_date", value: newStart },
      });

      // 3) After handleInputChange runs, squads are re-mapped and passed to OneToNSquads again
      //    Any squad whose date is outside the [startDate, endDate] range should be set to start date
      expect(lastSquadsProp[0].squad_date_str).toBe(newStart);
    });    
  })

  describe('handleSelectChange', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();        
    });

    it('should update the bowl_id when select changes', async () => {
      const store = makeStore([mockBowl]); 
      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      )

      const bowlSelect = screen.getByTestId('inputBowlName') as HTMLInputElement;
      await userEvent.selectOptions(bowlSelect, mockBowl.id);

      const selectedOption = screen.getByRole('option', { name: `${mockBowl.bowl_name} - ${mockBowl.city}, ${mockBowl.state}` }) as HTMLOptionElement;
      expect(selectedOption.selected).toBe(true);
      expect(bowlSelect.value).toBe(mockBowl.id);
    });
  });

  describe('error clearing on change', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();        
    });
    
    it('clears tmnt_name_err when user types a valid tournament name after required error', async () => {
      const user = userEvent.setup();

      const blankTmnt = getBlankTmntFullData();
      blankTmnt.tmnt.tmnt_name = ""; // simulate missing name

      const props: tmntFormDataType = {
        tmntFullData: blankTmnt,
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };

      const store = makeStore([mockBowl]); // bowls exist so bowl_id_err won't block

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={props} />
        </Provider>
      );

      // Click Save -> should trigger validateTmntInfo -> missing name error
      const saveBtn = screen.getByRole("button", { name: /save tournament/i });
      saveBtn.focus();
      await user.click(saveBtn);

      // Required error should appear
      expect(screen.getByText(/tournament name is required/i)).toBeInTheDocument();

      // Now type a valid name
      const nameInput = screen.getByRole("textbox", { name: /tournament name/i });
      await user.clear(nameInput);
      await user.type(nameInput, "My Tmnt");

      // Error message should disappear after typing
      expect(
        screen.queryByText(/tournament name is required/i)
      ).not.toBeInTheDocument();
    });
    it('clears bowl_id_err when user selects a valid bowl after required error', async () => {
      const user = userEvent.setup();

      const blankTmnt = getBlankTmntFullData();
      blankTmnt.tmnt.bowl_id = ""; // missing bowl triggers required error

      const props: tmntFormDataType = {
        tmntFullData: blankTmnt,
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };

      // make a store with bowls so select dropdown can populate
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={props} />
        </Provider>
      );

      // Save -> missing bowl produces required error
      const saveBtn = screen.getByRole("button", { name: /save tournament/i });
      saveBtn.focus();
      await user.click(saveBtn);

      const bowlError = screen.getByTestId("dangerBowlName");

      // Confirm the required error text is there
      expect(bowlError).toHaveTextContent(/bowl name is required/i);

      // Now select a bowl
      const select = screen.getByRole("combobox", { name: /bowl name/i });
      await user.selectOptions(select, mockBowl.id);

      // Required error should now be cleared
      expect(bowlError).not.toHaveTextContent(/\S/); // no non-whitespace text
    });
  });

  describe('getLanesTabTitle', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();        
    });

    it('renders "Lanes -" with a single lane_count', () => {
      const tmntPropsOne: tmntFormDataType = {
        tmntFullData: {
          ...mockTmntFullData,
          squads: [{ lane_count: 8 } as any],
        },
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };
      const store = makeStore([mockBowl]); 

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntPropsOne} />
        </Provider>
      );

      expect(screen.getByText("Lanes - 8")).toBeInTheDocument();
    });

    it('renders comma-separated lane counts for multiple squads', () => {
      const tmntPropsMulti: tmntFormDataType = {
        tmntFullData: {
          ...mockTmntFullData,
          squads: [
            { lane_count: 8 } as any,
            { lane_count: 12 } as any,
            { lane_count: 16 } as any,
          ],
        },
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };
      const store = makeStore([mockBowl]); 

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntPropsMulti} />
        </Provider>
      );

      expect(screen.getByText("Lanes - 8, 12, 16")).toBeInTheDocument();
    });

    it('renders empty after "Lanes -" when there are no squads', () => {
      const tmntPropsEmpty: tmntFormDataType = {
        tmntFullData: {
          ...mockTmntFullData,
          squads: [],
        },
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };
      const store = makeStore([mockBowl]); 

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntPropsEmpty} />
        </Provider>
      );

      expect(screen.getByText("Lanes -")).toBeInTheDocument();
    });
  });

  describe("TmntDataForm - cancel behavior", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('when stage is not DEFINE, clicking Cancel navigates directly back to "/user/tmnts" and does not show confirm modal', () => {
      const disableProps: tmntFormDataType = {
        ...tmntProps,
        stage: SquadStage.ENTRIES
      };

      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={disableProps} />
        </Provider>
      );

      // There should be a Cancel button (enabled) in DISABLE mode      
      const cancelBtn = screen.getByRole("button", { name: /^cancel$/i });
      expect(cancelBtn).toBeEnabled();

      // Click Cancel
      fireEvent.click(cancelBtn);

      // 👉 Confirm modal should NOT be shown
      const confirmModal = screen.getByTestId("ModalConfirmMock");
      expect(confirmModal).toHaveAttribute("data-show", "false");

      // 👉 Router push should have been called with /user/tmnts
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/user/tmnts");
    });

    it('when stage is DEFINE, clicking Cancel shows confirm modal and does NOT navigate yet', () => {
      const store = makeStore([mockBowl]);

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={tmntProps} />
        </Provider>
      );

      const cancelBtn = screen.getByRole("button", { name: /^cancel$/i });
      expect(cancelBtn).toBeEnabled();

      // Click Cancel
      fireEvent.click(cancelBtn);

      // 👉 Router push should NOT have been called yet
      expect(mockPush).not.toHaveBeenCalled();

      // 👉 Confirm modal should now be visible, with appropriate title/message
      const confirmModal = screen.getByTestId("ModalConfirmMock");
      expect(confirmModal).toHaveAttribute("data-show", "true");
      expect(confirmModal).toHaveAttribute("data-title", "Cancel Editing Tournament");
      expect(confirmModal).toHaveAttribute(
        "data-message",
        "Do you want to cancel editing tournament?"
      );
    });

  });

  describe("Save button interactions / active element guard", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('does NOT attempt save when Save button is not the active element (activeElement guard)', () => {
      // We intentionally make a tournament that is valid (so validation won't block save)
      const props: tmntFormDataType = {
        tmntFullData: mockTmntFullData,
        stage: SquadStage.DEFINE,
        parentForm: tmntFormParent.NEW
      };

      const store = makeStore([mockBowl]);

      // Spy on dispatch so we can see if anything new is dispatched when we click Save
      const dispatchSpy = jest.spyOn(store, "dispatch");

      render(
        <Provider store={store}>
          <TmntDataForm tmntProps={props} />
        </Provider>
      );

      // Record how many dispatches happened during init/render
      const initialCallCount = dispatchSpy.mock.calls.length;

      // === Step 1 ===
      // Focus a *different* element so activeElement !== saveButton
      const nameInput = screen.getByLabelText(/tournament name/i);
      nameInput.focus();
      expect(nameInput).toHaveFocus();

      // === Step 2 ===
      // Use fireEvent.click so we DON'T move focus to the button automatically
      const saveBtn = screen.getByRole("button", { name: /save tournament/i });
      fireEvent.click(saveBtn);

      // === Step 3 ===
      // Assert: no *additional* dispatches happened due to handleSave,
      // meaning the activeElement guard caused an early return.
      expect(dispatchSpy.mock.calls.length).toBe(initialCallCount);
    });

  })  

})