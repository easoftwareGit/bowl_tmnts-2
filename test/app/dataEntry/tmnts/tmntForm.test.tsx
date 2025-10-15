import React from "react"; 
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import userEvent from "@testing-library/user-event"; 
import { configureStore } from "@reduxjs/toolkit"; 
import tmntFullDataReducer, { saveTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import { bowlType, ioDataError, tmntActions, tmntFormDataType } from "@/lib/types/types"; 
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools"; 
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 
import { validateEvents } from "../../../../src/app/dataEntry/tmntForm/oneToNEvents"; 
import { validateDivs } from "@/app/dataEntry/tmntForm/oneToNDivs"; 
import { validateSquads } from "@/app/dataEntry/tmntForm/oneToNSquads"; 
import { validatePots } from "@/app/dataEntry/tmntForm/zeroToNPots"; 
import { validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts"; 
import { validateElims } from "@/app/dataEntry/tmntForm/zeroToNElims"; 
import { cloneDeep } from "lodash"; 

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
        ioError: ioDataError.None,
      },
    },
  });
  
// Mock useRouter: 
jest.mock("next/navigation", () => ({ 
	useRouter() { 
		return { 
			push: jest.fn(), 
			prefetch: jest.fn(), 
		}; 
	}, 
})); 

jest.mock("../../../../src/app/dataEntry/tmntForm/oneToNEvents", () => ({ 
	__esModule: true, 
	default: () => <div>MockEvents</div>, 
	validateEvents: jest.fn().mockReturnValue(true), 
})); 
jest.mock("../../../../src/app/dataEntry/tmntForm/oneToNDivs", () => ({ 
	__esModule: true, 
	default: () => <div>MockDivs</div>, 
	validateDivs: jest.fn().mockReturnValue(true), 
})); 
jest.mock("../../../../src/app/dataEntry/tmntForm/oneToNSquads", () => ({ 
	__esModule: true, 
	default: () => <div>MockSquads</div>, 
	validateSquads: jest.fn().mockReturnValue(true), 
})); 
jest.mock("../../../../src/app/dataEntry/tmntForm/zeroToNPots", () => ({ 
	__esModule: true, 
	default: () => <div>MockPots</div>, 
	validatePots: jest.fn().mockReturnValue(true), 
})); 
jest.mock("../../../../src/app/dataEntry/tmntForm/zeroToNBrkts", () => ({ 
	__esModule: true, 
	default: () => <div>MockBrkts</div>, 
	validateBrkts: jest.fn().mockReturnValue(true), 
})); 
jest.mock("../../../../src/app/dataEntry/tmntForm/zeroToNElims", () => ({ 
	__esModule: true, 
	default: () => <div>MockElims</div>, 
	validateElims: jest.fn().mockReturnValue(true), 
})); 

jest.mock("../../../../src/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("../../../../src/redux/features/tmntFullData/tmntFullDataSlice"),
  saveTmntFullData: jest.fn(),
}));

const tmntProps: tmntFormDataType = { 
	tmntFullData: mockTmntFullData, 
	tmntAction: tmntActions.New, 
} 

describe('TmntDataForm - Component', () => { 

	describe('TmntDataForm - functions', () => { 
	
    describe('handleInputChange', () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();        
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

    describe('validation - validateTmnt and validateTmntInfo', () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();        
      });

      it('shows all required errors when fields are empty', async () => {
        const blankTmnt = getBlankTmntFullData();
        blankTmnt.tmnt.start_date_str = '';
        blankTmnt.tmnt.end_date_str = '';
        const blankTmntProps: tmntFormDataType = {
          tmntFullData: blankTmnt,
          tmntAction: tmntActions.New
        };
        const store = makeStore([mockBowl]);         
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={blankTmntProps} />
          </Provider>
        )
        // Simulate save click
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus(); // needed to focus the button
        fireEvent.click(saveBtn);

        const nameError = await screen.findByTestId("dangerTmntName");
        const bowlError = await screen.findByTestId("dangerBowlName");
        const startError = await screen.findByTestId("dangerStartDate");
        const endError = await screen.findByTestId("dangerEndDate");

        // Expect validation errors
        expect(nameError).toHaveTextContent(/required/i);
        expect(bowlError).toHaveTextContent(/required/i);
        expect(startError).toHaveTextContent(/required/i);
        expect(endError).toHaveTextContent(/required/i);
      });
      it('shows error when start date before end date', async () => {
        const invalidTmnt = cloneDeep(mockTmntFullData)
        invalidTmnt.tmnt.start_date_str = '2025-09-02'; // one day after end date
        const invalidTmntProps: tmntFormDataType = {
          tmntFullData: invalidTmnt,
          tmntAction: tmntActions.New
        };
        const store = makeStore([mockBowl]); 
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={invalidTmntProps} />
          </Provider>
        )
        // Simulate save click
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus(); // needed to focus the button
        fireEvent.click(saveBtn);
        
        const endError = await screen.findByTestId("dangerEndDate");

        // Expect validation errors
        expect(endError).toHaveTextContent(/End date cannot be before start date/i);
      });

    });

    describe('validation - child components', () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();        
      })

      it('calls saveTmntFullData when all child validations pass', async () => {
        (validateEvents as jest.Mock).mockReturnValue(true);
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);

        const store = makeStore([mockBowl]); 
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        )
        // Simulate save click
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus(); // needed to focus the button
        fireEvent.click(saveBtn);

        await waitFor(() => expect(validateEvents).toHaveBeenCalled());
        await waitFor(() => expect(validateDivs).toHaveBeenCalled());
        await waitFor(() => expect(validateSquads).toHaveBeenCalled());
        await waitFor(() => expect(validatePots).toHaveBeenCalled());
        await waitFor(() => expect(validateBrkts).toHaveBeenCalled());
        await waitFor(() => expect(validateElims).toHaveBeenCalled());
        await waitFor(() => expect(saveTmntFullData).toHaveBeenCalled());
      })
      it('does not call saveTmntFullData when a child validations fails', async () => {
        (validateEvents as jest.Mock).mockReturnValue(false);

        const store = makeStore([mockBowl]); 
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        )
        // Simulate save click
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus(); // needed to focus the button
        fireEvent.click(saveBtn);

        await waitFor(() => expect(validateEvents).toHaveBeenCalled());
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
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
          tmntAction: tmntActions.New,
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
          tmntAction: tmntActions.New,
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
          tmntAction: tmntActions.New,
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

	});	
});