import React from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { ReduxProvider } from '@/redux/provider';
import { RootState } from "@/redux/store";
import TmntDataForm from '@/app/dataEntry/tmntForm/tmntForm';
import {
  blankDataOneTmnt,
  linkedInitDataOneTmnt,
} from "@/lib/db/initVals";
import { startOfTodayUTC, dateTo_UTC_yyyyMMdd } from '@/lib/dateTools';
import { allDataOneTmntType } from '@/lib/types/types';
import { mockStateBowls } from '../../../mocks/state/mockState';
import 'core-js/actual/structured-clone';

// Mock state for bowls
const mockState: Partial<RootState> = {
  bowls: {
    bowls: mockStateBowls,
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  },  
}

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockImplementation((selector) => selector(mockState)),
}));

const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde';
const bowlId = 'bwl_561540bd64974da9abdd97765fdb3659';

const tmntProps: allDataOneTmntType = {
  origData: blankDataOneTmnt(),
  curData: linkedInitDataOneTmnt(userId)
};    

describe('TmntDataForm - Component', () => { 
  
  describe('render TmntDataForm', () => { 
  
    it('render tournament items', async () => {
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const tmntLabel = screen.getByLabelText('Tournament Name');
      expect(tmntLabel).toBeInTheDocument();
      
      const tmntNameInput = screen.getByRole('textbox', { name: /tournament name/i }) as HTMLInputElement;
      expect(tmntNameInput).toBeInTheDocument();

      const bowlLabel = screen.getByLabelText('Bowl Name');
      expect(bowlLabel).toBeInTheDocument();

      const bowlSelect = screen.getByRole('combobox', { name: /bowl name/i }) as HTMLInputElement;
      expect(bowlSelect).toBeInTheDocument();
      
      const bowlOpts = screen.getAllByRole('option');      
      // 1 for Choose...
      // 4 for Bowls
      // 1 for Squad Event 
      expect(bowlOpts).toHaveLength(6);      

      const startDateLabel = screen.getByLabelText('Start Date');
      expect(startDateLabel).toBeInTheDocument();

      const startDateInput = screen.getByTestId('inputStartDate') as HTMLInputElement;
      expect(startDateInput).toBeInTheDocument();   
      expect(startDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));
      
      const endDateLabel = screen.getByLabelText('End Date');
      expect(endDateLabel).toBeInTheDocument();

      const endDateInput = screen.getByTestId('inputEndDate') as HTMLInputElement;
      expect(endDateInput).toBeInTheDocument();      
      expect(endDateInput.value).toBe(dateTo_UTC_yyyyMMdd(startOfTodayUTC()));

      const saveBtn = screen.getByRole('button', { name: /save tournament/i });
      expect(saveBtn).toBeInTheDocument();
    })
  })

  describe('show tournament name error and then remove error', () => { 

    it('show tournament name error and then remove error', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      // click will cause invalid data errors to show
      await user.click(saveBtn);
      const tmntName = await screen.findByRole('textbox', { name: /tournament name/i });      
      const tmntError = await screen.findByTestId('dangerTmntName');      
      expect(tmntError).not.toHaveTextContent("");   
      // editing tmnt name will cause tmnt name error to clear
      await user.clear(tmntName);
      await user.type(tmntName, 'Test Tournament');
      expect(tmntError).toHaveTextContent("");
      // click will cause invalid data errors to show, should not show tmnt name error
      await user.click(saveBtn);
      expect(tmntError).toHaveTextContent("");
    })
  })

  describe('TmntDataForm - Bowl Name combobox', () => {

    it('should render the combobox', () => { 
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const combobox = screen.getByTestId('inputBowlName');
  
      expect(combobox).toBeInTheDocument();    
      expect(combobox).toHaveDisplayValue("Choose...");
      expect(combobox).toHaveTextContent('Coconut Bowl - Sparks, NV');
      expect(combobox).toHaveTextContent('Diablo Lanes - Concord, CA');
      expect(combobox).toHaveTextContent("Earl Anthony's Dublin Bowl - Dublin, CA");
      expect(combobox).toHaveTextContent('Yosemite Lanes - Modesto, CA');
    })

    it('render Bowl Name error and clear it', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const combobox = screen.getByTestId('inputBowlName');      
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      expect(saveBtn).toBeInTheDocument();
      await user.click(saveBtn);

      const bowlError = await screen.findByTestId('dangerBowlName');      
      expect(bowlError).not.toHaveTextContent("");

      await user.selectOptions(combobox, bowlId);
      expect(bowlError).toHaveTextContent("");
    })
  })

  describe('enter invalid end date before start date', () => { 

    it('enter invalid end date before start date', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);      
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const endDate = await screen.findByLabelText(/end date/i);      
      const endError = await screen.findByTestId("dangerEndDate");
      // use fireEvent to simulate user input for date inputs, not user type 
      fireEvent.change(endDate, { target: { value: '2000-01-01' } });
      expect(endDate).toHaveValue('2000-01-01');
      fireEvent.click(saveBtn);
      expect(endError).not.toHaveTextContent("");
      fireEvent.change(endDate, { target: { value: '2000-02-02' } });
      expect(endDate).toHaveValue('2000-02-02');
      expect(endError).toHaveTextContent("");
    })
  })

  describe('render TmntDataForm - render errors', () => {   
    const tmntWithErrors = structuredClone(tmntProps);
    tmntWithErrors.curData.tmnt.bowl_id_err = "bowl error";
    tmntWithErrors.curData.tmnt.tmnt_name_err = "tmnt error";
    tmntWithErrors.curData.tmnt.start_date_err = "start date error";
    tmntWithErrors.curData.tmnt.end_date_err = "end date error";

    it('render tournament items after loaded Bowls', async () => {
      render(<ReduxProvider><TmntDataForm tmntProps={tmntWithErrors} /></ReduxProvider>)

      const nameError = await screen.findByTestId("dangerTmntName");      
      expect(nameError).toHaveTextContent("tmnt error");

      const bowlError = await screen.findByTestId("dangerBowlName");
      expect(bowlError).toHaveTextContent("bowl error");

      const startError = await screen.findByTestId("dangerStartDate");
      expect(startError).toHaveTextContent("start date error");

      const endError = await screen.findByTestId("dangerEndDate");
      expect(endError).toHaveTextContent("end date error");
    })
  })

})