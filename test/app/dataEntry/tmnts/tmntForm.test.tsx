import React from "react"; 
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
import "@testing-library/jest-dom"; 
import { Provider } from "react-redux"; 
import userEvent from "@testing-library/user-event"; 
import { configureStore } from "@reduxjs/toolkit"; 
import tmntFullDataReducer, { saveTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice"; 
import bowlsReducer from "@/redux/features/bowls/bowlsSlice"; 
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm"; 
import { acdnErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { bowlType, ioDataError, tmntActions, tmntFormDataType } from "@/lib/types/types"; 
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools"; 
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData"; 
import { ioStatusType } from "@/redux/statusTypes"; 
import { validateEvents } from "@/app/dataEntry/tmntForm/oneToNEvents"; 
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

jest.mock("@/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  ...jest.requireActual("@/redux/features/tmntFullData/tmntFullDataSlice"),
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
  
  describe('TmntDataForm - vallidation', () => { 

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

    describe('shows error messages in accordian headers', () => {
      beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
      })

      it('shows Events accordian error message and class when validateEvents sets an error', async () => {
        const user = userEvent.setup();

        // Other children pass        
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);

        // Events fail AND set the accordion error
        (validateEvents as jest.Mock).mockImplementation(
          (events, setEvents, setAcdnErr) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Entry Fee cannot be more than $999,999.00",
            });
            return false; // cause validateTmnt() to treat Events as invalid
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        // Trigger validateTmnt -> validateEvents
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);
        
        const eventsHeader = await screen.findByTestId("eventsAcdnHeader");

        expect(eventsHeader).toHaveTextContent(/events -/i);
        expect(eventsHeader).toHaveTextContent(/entry fee cannot be more than/i);
        expect(eventsHeader).toHaveClass(acdnErrClassName);

        // And since Events failed, the save thunk should not be dispatched
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });
      it('shows Divs accordian error message and class when validateDivs sets an error', async () => {
        const user = userEvent.setup();
        
        (validateEvents as jest.Mock).mockReturnValue(true);        
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);
        
        (validateDivs as jest.Mock).mockImplementation(
          (divs, setDivs, setAcdnErr) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Hdcp % cannot be more than 125%",
            });
            return false; 
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);       

        const divsHeader = await screen.findByTestId("divsAcdnHeader");
        expect(divsHeader).toHaveTextContent(/divisions -/i);
        expect(divsHeader).toHaveTextContent(/hdcp % cannot be more than/i);
        expect(divsHeader).toHaveClass(acdnErrClassName);
        
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });
      it('shows Squads accordian error message and class when validateSquads sets an error', async () => {
        const user = userEvent.setup();
        
        (validateEvents as jest.Mock).mockReturnValue(true);        
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);
        
        (validateSquads as jest.Mock).mockImplementation(
          (squads, setSquads, events, setAcdnErr, minDate, maxDate) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Squad Ganes cannot be more than 6",
            });
            return false; 
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);       

        const squadsHeader = await screen.findByTestId("squadsAcdnHeader");
        expect(squadsHeader).toHaveTextContent(/squads -/i);
        expect(squadsHeader).toHaveTextContent(/squad ganes cannot be more than/i);
        expect(squadsHeader).toHaveClass(acdnErrClassName);
        
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });
      it('shows Pots accordian error message and class when validatePots sets an error', async () => {
        const user = userEvent.setup();
        
        (validateEvents as jest.Mock).mockReturnValue(true);
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);
        
        (validatePots as jest.Mock).mockImplementation(
          (pots, setPots, divs, setAcdnErr) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Pot Scratch: Fee cannot be less than $1.00",
            });
            return false; 
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);       

        const potsHeader = await screen.findByTestId("potsAcdnHeader");
        expect(potsHeader).toHaveTextContent(/pots -/i);
        expect(potsHeader).toHaveTextContent(/fee cannot be less than/i);
        expect(potsHeader).toHaveClass(acdnErrClassName);
        
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });
      it('shows Brkts accordian error message and class when validateBrkts sets an error', async () => {
        const user = userEvent.setup();
        
        (validateEvents as jest.Mock).mockReturnValue(true);
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);
        
        (validateBrkts as jest.Mock).mockImplementation(
          (brkts, setBrkts, divs, maxStartGame, setAcdnErr) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Fee cannot be less than $1.00",
            });
            return false; 
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);       

        const brktsHeader = await screen.findByTestId("brktsAcdnHeader");
        expect(brktsHeader).toHaveTextContent(/brackets -/i);
        expect(brktsHeader).toHaveTextContent(/fee cannot be less than/i);
        expect(brktsHeader).toHaveClass(acdnErrClassName);
        
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });
      it('shows Brkts accordian error message and class when validateBrkts sets an error', async () => {
        const user = userEvent.setup();
        
        (validateEvents as jest.Mock).mockReturnValue(true);
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);         
        
        (validateElims as jest.Mock).mockImplementation(
          (elims, setElims, divs, squadGames, setAcdnErr) => {
            setAcdnErr({
              errClassName: acdnErrClassName,
              message: " - Fee cannot be less than $1.00",
            });
            return false; 
          }
        );

        const store = makeStore([mockBowl]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus();
        await user.click(saveBtn);       

        const elimsHeader = await screen.findByTestId("elimsAcdnHeader");
        expect(elimsHeader).toHaveTextContent(/Eliminators -/i);
        expect(elimsHeader).toHaveTextContent(/fee cannot be less than/i);
        expect(elimsHeader).toHaveClass(acdnErrClassName);
        
        await waitFor(() => expect(saveTmntFullData).not.toHaveBeenCalled());
      });

    });

  })
    
});