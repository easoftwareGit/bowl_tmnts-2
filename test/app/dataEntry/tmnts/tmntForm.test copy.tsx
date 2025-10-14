import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as ReactRedux from "react-redux";
import { Provider } from "react-redux";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import tmntFullDataReducer, { saveTmntFullData, tmntFullDataState } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import bowlsReducer, { bowlsSliceState } from "@/redux/features/bowls/bowlsSlice";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
import { bowlType, ioDataError, tmntActions, tmntFormDataType, tmntFullType } from "@/lib/types/types";
import { startOfDayFromString } from "@/lib/dateTools";
import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools";
import { mockBowl, mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { bowlsSlice } from "@/redux/features/bowls/bowlsSlice";
import { ioStatusType } from "@/redux/statusTypes";
import { validateEvents } from "../../../../src/app/dataEntry/tmntForm/oneToNEvents";
import { validateDivs } from "@/app/dataEntry/tmntForm/oneToNDivs";
import { validateSquads } from "@/app/dataEntry/tmntForm/oneToNSquads";
import { validatePots } from "@/app/dataEntry/tmntForm/zeroToNPots";
import { validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import { validateElims } from "@/app/dataEntry/tmntForm/zeroToNElims";
import { cloneDeep } from "lodash";
// import {tmntFullDataSlice} from '../../../../src/redux/features/tmntFullData/tmntFullDataSlice'

// import React from "react";
// import { render, screen, fireEvent } from '@testing-library/react';
// import "@testing-library/jest-dom";
// import userEvent from "@testing-library/user-event";
// import { ReduxProvider } from '@/redux/provider';
// import { RootState } from "@/redux/store";
// import TmntDataForm from '@/app/dataEntry/tmntForm/tmntForm';
// import { startOfTodayUTC, dateTo_UTC_yyyyMMdd, todayStr, dateTo_yyyyMMdd, startOfDayFromString } from '@/lib/dateTools';
// import { tmntActions, tmntFormDataType, tmntFullType } from '@/lib/types/types';
// import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
// import { mockStateBowls } from '../../../mocks/state/mockState';
// import { addDays, addMonths } from "date-fns";
// import { cloneDeep } from "lodash";
// import { getBlankTmntFullData } from "@/app/dataEntry/tmntForm/tmntTools";

// mock redux store
const makeStore = (bowls: bowlType[] = []) =>
  configureStore({
    reducer: {
      tmntFullData: tmntFullDataReducer,
      bowls: bowlsReducer,
    },
    preloadedState: {
      bowls: { 
        bowls: bowls,
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
      } as bowlsSliceState,  
      tmntFullData: {
        tmntFullData: getBlankTmntFullData(),
        loadStatus: "idle" as ioStatusType,
        saveStatus: "idle" as ioStatusType,
        error: "",
        ioError: ioDataError.None,
      },
    }
  });

// Mock useRouter:
// jest.mock("next/navigation", () => ({
//   useRouter() {
//     return {
//       prefetch: () => null
//     };
//   }
// }));

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// // Mock child components that aren’t relevant to validation
// jest.mock("../../../../src/components/modal/errorModal", () => function MockErrorModal() {
//   return <div>MockErrorModal</div>;
// });
// jest.mock("../../../../src/components/modal/confirmModal", () => function MockConfirmModal() {
//   return <div>MockConfirmModal</div>;
// });
// jest.mock("../../../../src/components/modal/waitModal", () => function MockWaitModal() {
//   return <div>MockWaitModal</div>;
// });

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

const mockDispatch = jest.fn();
jest.spyOn(ReactRedux, "useDispatch").mockReturnValue(mockDispatch);

const mockUnwrap = jest.fn().mockResolvedValue(true);
jest.mock("../../../../src/redux/features/tmntFullData/tmntFullDataSlice", () => ({
  __esModule: true,
  default: (state = {}) => state,
  getTmntFullDataLoadStatus: jest.fn(),
  getTmntFullDataIoError: jest.fn(),
  saveTmntFullData: jest.fn(() => ({ unwrap: jest.fn().mockResolvedValue(true) })), // mock thunk
  // saveTmntFullData: jest.fn(() => {
  //     const mockDispatchResult: any = {
  //       unwrap: mockUnwrap
  //     };
  //     return mockDispatchResult;
  // }),  
  // saveTmntFullData: jest.fn(() => async (dispatch: any) => {
  //   return {
  //     unwrap: async () => true
  //   };
  // }),
}));

jest.mock("react-bootstrap/Modal", () => {
  // 1. Define the main mock component with a name
  const MockModal = ({ children, show }: any) => (
    show ? <div data-testid="mock-modal">{children}</div> : null
  );

  // 2. Define each sub-component with a name
  const MockHeader = ({ children }: any) => <div>{children}</div>;
  const MockTitle = ({ children }: any) => <div>{children}</div>;
  const MockBody = ({ children }: any) => <div>{children}</div>;
  const MockFooter = ({ children }: any) => <div>{children}</div>;

  // 3. Use Object.assign to attach the named sub-components
  return Object.assign(MockModal, {
    Header: MockHeader,
    Title: MockTitle,
    Body: MockBody,
    Footer: MockFooter,
  });
});

const tmntProps: tmntFormDataType = {
  tmntFullData: mockTmntFullData,
  tmntAction: tmntActions.New,
}

// // Mock state for bowls
// const mockState: Partial<RootState> = {
//   bowls: {
//     bowls: mockStateBowls,
//     loadStatus: "idle",
//     saveStatus: "idle",
//     error: "",
//   },  
// }
// // Mock redux state 
// jest.mock('react-redux', () => ({
//   ...jest.requireActual('react-redux'),
//   useSelector: jest.fn().mockImplementation((selector) => selector(mockState)),
// }));
// // Mock useRouter:
// jest.mock("next/navigation", () => ({
//   useRouter() {
//     return {
//       prefetch: () => null
//     };
//   }
// }));

// const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde';
// const bowlId = 'bwl_561540bd64974da9abdd97765fdb3659';

// const blankTmnt: tmntFullType = getBlankTmntFullData();

// const tmntProps: tmntFormDataType = {
//   tmntFullData: blankTmnt,
//   tmntAction: tmntActions.New
// };    

describe('TmntDataForm - Component', () => {
  
  describe('TmntDataForm - functions', () => {
    
    describe('handleInputChange', () => {

      it('should update the tmnt_name when input changes', () => {
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);

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
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);

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

      it('should update the bowl_id when select changes', async () => {
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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

        // fireEvent.change(bowlSelect, { target: { name: 'bowl_id', value: mockBowl.id } });

        // await waitFor(() => expect(bowlSelect.value).toBe(mockBowl.id));
      });
    });

    describe('validation - validateTmnt and validateTmntInfo', () => {

      it('shows all required errors when fields are empty', async () => {
        const blankTmnt = getBlankTmntFullData();
        blankTmnt.tmnt.start_date_str = '';
        blankTmnt.tmnt.end_date_str = '';
        const blankTmntProps: tmntFormDataType = {
          tmntFullData: blankTmnt,
          tmntAction: tmntActions.New
        };
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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
        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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
        jest.clearAllMocks();
      })

      it('calls saveTmntFullData when all child validations pass', async () => {
        (validateEvents as jest.Mock).mockReturnValue(true);
        (validateDivs as jest.Mock).mockReturnValue(true);
        (validateSquads as jest.Mock).mockReturnValue(true);
        (validatePots as jest.Mock).mockReturnValue(true);
        (validateBrkts as jest.Mock).mockReturnValue(true);
        (validateElims as jest.Mock).mockReturnValue(true);

        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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

        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
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
      
    describe('save modals', () => {

      beforeEach(() => {
        jest.clearAllMocks();
      })

      it('show success modal when save is successful', async () => {

        const store = makeStore([{
          id: mockBowl.id,
          bowl_name: mockBowl.bowl_name,
          city: mockBowl.city,
          state: mockBowl.state,
          url: mockBowl.url
        }]);
        render(
          <Provider store={store}>
            <TmntDataForm tmntProps={tmntProps} />
          </Provider>
        );

        const user = userEvent.setup();
        const saveBtn = screen.getByText("Save Tournament");
        saveBtn.focus(); // needed to focus the button          
        await user.click(saveBtn);

        const modalTitle = await screen.findByText(/Tournament Saved/i);
        expect(modalTitle).toBeInTheDocument();

        // await waitFor(() => {
        //   const modalTitle = screen.queryByText(/Tournament Saved/i);
        //   expect(modalTitle).toBeInTheDocument();
        // });
        // await waitFor(() => {
        //   const okBtn = screen.queryByRole('button', { name: /ok/i });
        //   expect(okBtn).toBeInTheDocument();
        // });

        // const okBtn = screen.queryByRole('button', { name: /ok/i }) as HTMLInputElement;
        // expect(okBtn).toBeInTheDocument();
        // const modalTitle = screen.queryByText(/Tournament Saved/i) as HTMLInputElement
        // expect(modalTitle).toBeInTheDocument();

      });
    });
  })

  // describe('render TmntDataForm', () => { 
  
  //   it('render tournament items', async () => {
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

  //     const tmntLabel = screen.getByLabelText('Tournament Name');
  //     expect(tmntLabel).toBeInTheDocument();
      
  //     const tmntNameInput = screen.getByRole('textbox', { name: /tournament name/i }) as HTMLInputElement;
  //     expect(tmntNameInput).toBeInTheDocument();

  //     const bowlLabel = screen.getByLabelText('Bowl Name');
  //     expect(bowlLabel).toBeInTheDocument();

  //     const bowlSelect = screen.getByRole('combobox', { name: /bowl name/i }) as HTMLInputElement;
  //     expect(bowlSelect).toBeInTheDocument();
      
  //     const bowlOpts = screen.getAllByRole('option');      
  //     // 1 for Choose...
  //     // 4 for Bowls
  //     // 1 for Squad Event 
  //     expect(bowlOpts).toHaveLength(6);      

  //     const startDateLabel = screen.getByLabelText('Start Date');
  //     expect(startDateLabel).toBeInTheDocument();

  //     const startDateInput = screen.getByTestId('inputStartDate') as HTMLInputElement;
  //     expect(startDateInput).toBeInTheDocument();   
  //     expect(startDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));
      
  //     const endDateLabel = screen.getByLabelText('End Date');
  //     expect(endDateLabel).toBeInTheDocument();

  //     const endDateInput = screen.getByTestId('inputEndDate') as HTMLInputElement;
  //     expect(endDateInput).toBeInTheDocument();      
  //     expect(endDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));

  //     const saveBtn = screen.getByRole('button', { name: /save tournament/i });
  //     expect(saveBtn).toBeInTheDocument();

  //     const cancelBtn = screen.getByRole('button', { name: /cancel/i });
  //     expect(cancelBtn).toBeInTheDocument();
  //   })
  // })

  // describe('render TmntDataForm when tmntAction === Run', () => { 
  
  //   const runTmntProps: tmntFormDataType = {
  //     tmntFullData: mockTmntFullData,
  //     tmntAction: tmntActions.Run
  //   };    
    
  //   it('render tournament items', async () => {
  //     render(<ReduxProvider><TmntDataForm tmntProps={runTmntProps} /></ReduxProvider>)

  //     const tmntNameInput = screen.getByRole('textbox', { name: /tournament name/i }) as HTMLInputElement;
  //     expect(tmntNameInput).toBeInTheDocument();
  //     expect(tmntNameInput).toBeDisabled();

  //     const bowlSelect = screen.getByRole('combobox', { name: /bowl name/i }) as HTMLInputElement;
  //     expect(bowlSelect).toBeInTheDocument();
  //     expect(bowlSelect).toBeDisabled();
      
  //     const startDateInput = screen.getByTestId('inputStartDate') as HTMLInputElement;
  //     expect(startDateInput).toBeInTheDocument();   
  //     expect(startDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));
  //     expect(startDateInput).toBeDisabled();
      
  //     const endDateInput = screen.getByTestId('inputEndDate') as HTMLInputElement;
  //     expect(endDateInput).toBeInTheDocument();      
  //     expect(endDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));
  //     expect(endDateInput).toBeDisabled();

  //     const saveBtn = screen.queryByRole('button', { name: /save tournament/i });
  //     expect(saveBtn).not.toBeInTheDocument();

  //     const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
  //     expect(cancelBtn).not.toBeInTheDocument();

  //   })
  // })

  // describe('show tournament name error and then remove error', () => { 

  //   it('show tournament name error and then remove error', async () => { 
  //     const user = userEvent.setup()      
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
  //     const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
  //     // click will cause invalid data errors to show
  //     await user.click(saveBtn);
  //     const tmntName = await screen.findByRole('textbox', { name: /tournament name/i });      
  //     const tmntError = await screen.findByTestId('dangerTmntName');      
  //     expect(tmntError).not.toHaveTextContent("");   
  //     // editing tmnt name will cause tmnt name error to clear
  //     await user.clear(tmntName);
  //     await user.type(tmntName, 'Test Tournament');
  //     expect(tmntError).toHaveTextContent("");
  //     // click will cause invalid data errors to show, should not show tmnt name error
  //     await user.click(saveBtn);
  //     expect(tmntError).toHaveTextContent("");
  //   })
  // })

  // describe('TmntDataForm - Bowl Name combobox', () => {

  //   it('should render the combobox', () => { 
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
  //     const combobox = screen.getByTestId('inputBowlName');
  
  //     expect(combobox).toBeInTheDocument();    
  //     expect(combobox).toHaveDisplayValue("Choose...");
  //     expect(combobox).toHaveTextContent('Coconut Bowl - Sparks, NV');
  //     expect(combobox).toHaveTextContent('Diablo Lanes - Concord, CA');
  //     expect(combobox).toHaveTextContent("Earl Anthony's Dublin Bowl - Dublin, CA");
  //     expect(combobox).toHaveTextContent('Yosemite Lanes - Modesto, CA');
  //   })

  //   it('render Bowl Name error and clear it', async () => { 
  //     const user = userEvent.setup()
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
  //     const combobox = screen.getByTestId('inputBowlName');      
  //     const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
  //     expect(saveBtn).toBeInTheDocument();
  //     await user.click(saveBtn);

  //     const bowlError = await screen.findByTestId('dangerBowlName');      
  //     expect(bowlError).not.toHaveTextContent("");

  //     await user.selectOptions(combobox, bowlId);
  //     expect(bowlError).toHaveTextContent("");
  //   })
  // })

  // describe('enter invalid end date before start date', () => { 

  //   it('enter invalid end date before start date', async () => { 
  //     const user = userEvent.setup()
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);      
  //     const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
  //     const endDate = await screen.findByLabelText(/end date/i);      
  //     const endError = await screen.findByTestId("dangerEndDate");
  //     // use fireEvent to simulate user input for date inputs, not user type 
  //     fireEvent.change(endDate, { target: { value: '2000-01-01' } });
  //     expect(endDate).toHaveValue('2000-01-01');
  //     fireEvent.click(saveBtn);
  //     expect(endError).not.toHaveTextContent("");
  //     fireEvent.change(endDate, { target: { value: '2000-02-02' } });
  //     expect(endDate).toHaveValue('2000-02-02');
  //     expect(endError).toHaveTextContent("");
  //   })
  // })

  // describe('render TmntDataForm - render errors', () => {   
  //   const tmntWithErrors = cloneDeep(tmntProps);
  //   tmntWithErrors.tmntFullData.tmnt.bowl_id_err = "bowl error";
  //   tmntWithErrors.tmntFullData.tmnt.tmnt_name_err = "tmnt error";
  //   tmntWithErrors.tmntFullData.tmnt.start_date_err = "start date error";
  //   tmntWithErrors.tmntFullData.tmnt.end_date_err = "end date error";

  //   it('render tournament items after loaded Bowls', async () => {
  //     render(<ReduxProvider><TmntDataForm tmntProps={tmntWithErrors} /></ReduxProvider>)

  //     const nameError = await screen.findByTestId("dangerTmntName");      
  //     expect(nameError).toHaveTextContent("tmnt error");

  //     const bowlError = await screen.findByTestId("dangerBowlName");
  //     expect(bowlError).toHaveTextContent("bowl error");

  //     const startError = await screen.findByTestId("dangerStartDate");
  //     expect(startError).toHaveTextContent("start date error");

  //     const endError = await screen.findByTestId("dangerEndDate");
  //     expect(endError).toHaveTextContent("end date error");
  //   })
  // })

  // describe('changes to start or end date can change squad(s) date', () => {      

  //   it('should not change squad date if end date is changed and valid', async () => { 
  //     const tempTmnt = cloneDeep(tmntProps);
  //     tempTmnt.tmntFullData.tmnt.start_date_str = todayStr
  //     tempTmnt.tmntFullData.tmnt.end_date_str = todayStr
  //     tempTmnt.tmntFullData.squads[0].squad_date_str = todayStr  
  //     const tomorrowStr = dateTo_yyyyMMdd(addDays(new Date(todayStr), 1))

  //     const user = userEvent.setup()
  //     render(<ReduxProvider><TmntDataForm tmntProps={tempTmnt} /></ReduxProvider>);      
  //     const endDate = await screen.findByLabelText(/end date/i);
  //     const endError = await screen.findByTestId("dangerEndDate");
  //     fireEvent.change(endDate, { target: { value: tomorrowStr } });
  //     expect(endDate).toHaveValue(tomorrowStr);
  //     expect(endError).toHaveTextContent("");      
  //   })
  //   it('should change squad date if start date and end date valid, and new start date is after squad date', async () => {
  //     const tempTmnt = cloneDeep(tmntProps);
  //     tempTmnt.tmntFullData.tmnt.start_date_str = todayStr
  //     tempTmnt.tmntFullData.tmnt.end_date_str = todayStr
  //     tempTmnt.tmntFullData.squads[0].squad_date_str = todayStr  
  //     const yesterdayStr = dateTo_yyyyMMdd(addDays(startOfDayFromString(todayStr) as Date, -1))
  //     const lastMonthStr = dateTo_yyyyMMdd(addMonths(startOfDayFromString(todayStr) as Date, -1))

  //     const user = userEvent.setup()
  //     render(<ReduxProvider><TmntDataForm tmntProps={tempTmnt} /></ReduxProvider>);      

  //     const acdns = await screen.findAllByRole('button', { name: /squads/i });
  //     const startDate = await screen.findByLabelText(/start date/i);
  //     const endDate = await screen.findByLabelText(/end date/i);

  //     await user.click(acdns[0]);
  //     const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
  //     expect(squadDates).toHaveLength(1);
  //     expect(squadDates[0]).toHaveValue(todayStr);

  //     fireEvent.change(squadDates[0], { target: { value: lastMonthStr } });
  //     expect(squadDates[0]).toHaveValue(lastMonthStr);
  //     fireEvent.change(startDate, { target: { value: yesterdayStr } });
  //     expect(startDate).toHaveValue(yesterdayStr);
  //     expect(endDate).toHaveValue(todayStr);
  //     expect(squadDates[0]).toHaveValue(yesterdayStr);
  //   })
  //   it('should change squad date if start date and end date valid, and new end date is before squad date', async () => {
  //     const tempTmnt = cloneDeep(tmntProps);
  //     tempTmnt.tmntFullData.tmnt.start_date_str = todayStr
  //     tempTmnt.tmntFullData.tmnt.end_date_str = todayStr
  //     tempTmnt.tmntFullData.squads[0].squad_date_str = todayStr       
      
  //     const tomorrowStr = dateTo_yyyyMMdd(addDays(startOfDayFromString(todayStr) as Date, 1))
  //     const nextMonthStr = dateTo_yyyyMMdd(addMonths(startOfDayFromString(todayStr) as Date, 1))

  //     const user = userEvent.setup()
  //     render(<ReduxProvider><TmntDataForm tmntProps={tempTmnt} /></ReduxProvider>);      

  //     const acdns = await screen.findAllByRole('button', { name: /squads/i });
  //     const startDate = await screen.findByLabelText(/start date/i);
  //     const endDate = await screen.findByLabelText(/end date/i);

  //     await user.click(acdns[0]);
  //     const squadDates = screen.getAllByTestId('squadDate') as HTMLInputElement[];
  //     expect(squadDates).toHaveLength(1);
  //     expect(squadDates[0]).toHaveValue(todayStr);

  //     fireEvent.change(squadDates[0], { target: { value: nextMonthStr } });
  //     expect(squadDates[0]).toHaveValue(nextMonthStr);
  //     fireEvent.change(endDate, { target: { value: tomorrowStr } });
  //     expect(startDate).toHaveValue(todayStr);
  //     expect(endDate).toHaveValue(tomorrowStr);
  //     expect(squadDates[0]).toHaveValue(todayStr); // start date value
  //   })    
  // })

});