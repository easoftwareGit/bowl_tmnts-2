import React from "react";
import { render, screen, waitFor } from '../../../test-utils'
import userEvent from "@testing-library/user-event";
import RootLayout from '../../../../src/app/layout'; 
import { mockTmnt } from "../../../mocks/tmnts/twoDivs/mockTmnt";
import { mockEvent } from "../../../mocks/tmnts/twoDivs/mockEvent";
import { mockDivs, mockPots, mockBrkts, mockElims } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { mockSquad } from "../../../mocks/tmnts/twoDivs/mockSquad";
import { allDataOneTmntType, dataOneTmntType } from "@/lib/types/types";
import { defaultHdcpPer, defaultHdcpFrom, initBrkts, initDivs, initElims, initEvents, initPots, initSquads, initLanes, blankDataOneTmnt } from "@/lib/db/initVals";
import { formatValuePercent2Dec } from "@/lib/currency/formatValue";
import { RootState } from "@/redux/store";
import { mockStateBowls } from "../../../mocks/state/mockState";
import { ReduxProvider } from "@/redux/provider";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
import { mockSDBrkts, mockSDDivs, mockSDElims, mockSDEvents, mockSDLanes, mockSDPots, mockSDSquads, mockSDTmnt } from "../../../mocks/tmnts/singlesAndDoubles/mockSD";
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


describe('TmntDataPage - Divs Component', () => { 

  const tmntProps: allDataOneTmntType = {
    origData: blankDataOneTmnt(),
    curData: {
      tmnt: mockSDTmnt,
      events: mockSDEvents,
      divs: mockSDDivs,
      squads: mockSDSquads,
      lanes: mockSDLanes,
      pots: mockSDPots,
      brkts: mockSDBrkts,
      elims: mockSDElims,
    }
  };   

  describe('click on the divs accordian', () => { 
    it('find and open the divs accordian', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
    })
    it('render the divs tab', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(scratchTabs).toHaveLength(6);
      expect(scratchTabs[0]).toBeVisible();      
      const hdcpTab = await screen.findAllByRole('tab', { name: /handicap/i })
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(hdcpTab).toHaveLength(6);
      expect(hdcpTab[0]).toBeVisible();      
    })
    // # divs, hdcp %, Hdcp From, Integer Hdcp, Hdcp For renders in oneToNDivs.test.tsx
  })

  describe('render multiple divs', () => {
    it('render multiple divs', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(scratchTabs).toHaveLength(6);
      expect(scratchTabs[0]).toBeVisible();      
      expect(scratchTabs[0]).toBeInTheDocument();
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(hdcpTabs).toHaveLength(6);
      expect(hdcpTabs[0]).toBeVisible();            
      expect(hdcpTabs[0]).toBeInTheDocument();
    })
  })

  describe('changing the div name changes the div tab title', () => {
    it('changing the div name changes the div tab title', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      expect(divNames).toHaveLength(2);
      expect(divNames[0]).toHaveValue("Scratch");
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(scratchTabs).toHaveLength(6);
      expect(scratchTabs[0]).toBeVisible();      
      expect(scratchTabs[0]).toBeInTheDocument();
      await user.click(divNames[0]);
      await user.clear(divNames[0]);
      expect(divNames[0]).toHaveValue("");
      await user.type(divNames[0], "Testing");      
      expect(divNames[0]).toHaveValue("Testing");
      const divsTabs = await screen.findAllByRole('tab', { name: /testing/i })      
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(divsTabs).toHaveLength(6);
      expect(divsTabs[0]).toBeInTheDocument();
      expect(scratchTabs[0]).toHaveTextContent("Testing");
    })
  })

  describe('changing the div name changes the divisions radio buttons', () => {
    it('changing the 1st div name changes the divisions radio buttons', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      expect(divNames).toHaveLength(2);
      expect(divNames[0]).toHaveValue("Scratch");
      await user.click(divNames[0]);
      await user.clear(divNames[0]);
      expect(divNames[0]).toHaveValue("");
      await user.type(divNames[0], "Open");
      expect(divNames[0]).toHaveValue("Open");
      const potsAcdn = await screen.findAllByRole('button', { name: /pots/i });
      await user.click(potsAcdn[0]);
      const testingRadios = screen.getAllByRole('radio', { name: /open/i }) as HTMLInputElement[];
      expect(testingRadios).toHaveLength(3);      // pots, brackets & elims
      expect(testingRadios[0]).not.toBeChecked(); // pots
      expect(testingRadios[1]).not.toBeChecked(); // brackets
      expect(testingRadios[2]).not.toBeChecked(); // elims
    })
    it('changing the 2nd div name changes the divisions radio buttons', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      expect(divNames).toHaveLength(2);
      expect(divNames[1]).toHaveValue("Handicap");
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      await user.click(hdcpTabs[1]);
      await user.click(divNames[1]);
      await user.clear(divNames[1]);
      expect(divNames[1]).toHaveValue("");
      await user.type(divNames[1], "Hdcp");
      expect(divNames[1]).toHaveValue("Hdcp");
      const potsAcdn = await screen.findAllByRole('button', { name: /pots/i });
      await user.click(potsAcdn[0]);
      const testingRadios = screen.getAllByRole('radio', { name: /hdcp/i }) as HTMLInputElement[];
      expect(testingRadios).toHaveLength(3);      // pots, brackets & elims
      expect(testingRadios[0]).not.toBeChecked(); // pots
      expect(testingRadios[1]).not.toBeChecked(); // brackets
      expect(testingRadios[2]).not.toBeChecked(); // elims
    })
  })

  describe('changing the div name changes the Pots, Brackets & Eliminations tabs names', () => {
    it('changing the 1st div name changes the Pots, Brackets & Eliminations tabs names', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      expect(divNames).toHaveLength(2);
      expect(divNames[0]).toHaveValue("Scratch");
      await user.click(divNames[0]);
      await user.clear(divNames[0]);
      expect(divNames[0]).toHaveValue("");
      await user.type(divNames[0], "Open");
      expect(divNames[0]).toHaveValue("Open");
      const testingTabs = await screen.findAllByRole('tab', { name: /open/i })      
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(testingTabs).toHaveLength(6);
    })
    it('changing the 2nd div name changes the Pots, Brackets & Eliminations tabs names', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      expect(divNames).toHaveLength(2);
      expect(divNames[1]).toHaveValue("Handicap");
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      await user.click(hdcpTabs[1]);
      await user.click(divNames[1]);
      await user.clear(divNames[1]);
      expect(divNames[1]).toHaveValue("");
      await user.type(divNames[1], "Hdcp");
      expect(divNames[1]).toHaveValue("Hdcp");            
      const testingTabs = await screen.findAllByRole('tab', { name: /hdcp/i })      
      // [0] - divs, [1] - pots, [2,3] - brkts, [4,5] - lanes
      expect(testingTabs).toHaveLength(6);
    })
  })

  describe('disable/enable hdcp specific inputs', () => {
    it('set hdcp to 0, disable hdcp from', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpFroms = screen.getAllByRole("spinbutton", { name: /hdcp from/i });
      // use mockDiv[1]
      expect(hdcpFroms[1]).toBeEnabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[1]);
      await user.type(hdcps[1], '0');
      expect(hdcps[1]).toHaveValue('0%'); // focus stays on hdcp, no trailing ".00"
      expect(hdcpFroms[1]).toBeDisabled();
    })
    it('set hdcp to 0%, disable hdcp int checkbox', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i });
      // use mockDiv[1]
      expect(intHdcps[1]).toBeEnabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[1]);
      await user.type(hdcps[1], '0');
      expect(hdcps[1]).toHaveValue('0%');
      expect(intHdcps[1]).toBeDisabled();
    })
    it('set hdcp to 0%, disable hdcp for game radio', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      // [0,1] - divs, [2,3] - pots (game and last game)
      expect(hdcpForGames).toHaveLength(4);
      // use mockDiv[1]
      expect(hdcpForGames[1]).toBeEnabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[1]);
      await user.type(hdcps[1], '0');
      expect(hdcps[1]).toHaveValue('0%');
      expect(hdcpForGames[1]).toBeDisabled();
    })
    it('set hdcp to 0%, disable hdcp for series radio', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      // [0,1] - divs, [2] - pots 
      expect(hdcpForSeries).toHaveLength(3);
      // use mockDiv[1]
      expect(hdcpForSeries[1]).toBeEnabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[1]);
      await user.type(hdcps[1], '0');
      expect(hdcps[1]).toHaveValue('0%');
      expect(hdcpForSeries[1]).toBeDisabled();
    })
    it('set hdcp to 100%, enable hdcp from', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpFroms = screen.getAllByRole("spinbutton", { name: /hdcp from/i });
      expect(hdcpFroms[0]).toBeDisabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '90');
      expect(hdcps[0]).toHaveValue('90%');
      expect(hdcpFroms[0]).toBeEnabled();
    })
    it('set hdcp to 100%, enable hdcp int checkbox', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i });
      expect(intHdcps).toHaveLength(2);
      expect(intHdcps[0]).toBeDisabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '90');
      expect(hdcps[0]).toHaveValue('90%');
      expect(intHdcps[0]).toBeEnabled();
    })
    it('set hdcp to 100%, disable hdcp for game radio', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      // [0,1] - divs, [2,3] - pots (game and last game)
      expect(hdcpForGames).toHaveLength(4);
      expect(hdcpForGames[0]).toBeDisabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '90');
      expect(hdcps[0]).toHaveValue('90%');
      expect(hdcpForGames[0]).toBeEnabled();
    })
    it('set hdcp to 100%, enable hdcp for series radio', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      // [0,1] - divs, [2] - pots 
      expect(hdcpForSeries).toHaveLength(3);
      expect(hdcpForSeries[0]).toBeDisabled();
      const hdcps = screen.getAllByRole("textbox", { name: /hdcp %/i });
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '90');
      expect(hdcps[0]).toHaveValue('90%');
      expect(hdcpForSeries[0]).toBeEnabled();
    })
  })

  describe('render the div name errors', () => {
    // create invalid data so click on save button will not try to save
    const invalidTmnt = structuredClone(tmntProps)
    invalidTmnt.curData.tmnt.tmnt_name = '';

    it('render the div name required error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      const divTabs = await screen.findAllByRole('tab', { name: /scratch/i })      
      expect(divNames[0]).toHaveValue("Scratch");
      await user.click(divNames[0]);
      await user.clear(divNames[0]);
      expect(divNames[0]).toHaveValue("");
      await user.click(saveBtn);
      const divNameErrors = await screen.findAllByTestId('dangerDivName');    
      expect(divNameErrors[0]).toHaveTextContent("Div Name is required");
      expect(acdns[0]).toHaveTextContent("Divisions - 2: Error in Divisions - Div Name is required");
      expect(divTabs[0]).toHaveClass('objError')
    })
    it('render error for duplicate div names', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];      
      await user.clear(divNames[1]);
      await user.type(divNames[1], 'Scratch')
      expect(divNames[0]).toHaveValue("Scratch")
      expect(divNames[1]).toHaveValue("Scratch")
      // click will cause invalid data errors to show
      await user.click(saveBtn);
      const divNameErrors = await screen.findAllByTestId('dangerDivName');    
      expect(divNameErrors[1]).toHaveTextContent("has already been used");
      expect(acdns[0]).toHaveTextContent("has already been used");
      expect(hdcpTabs[0]).toHaveClass('objError');
    })
    it('clear the div name error', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];
      const divTabs = await screen.findAllByRole('tab', { name: /scratch/i })      
      expect(divNames[0]).toHaveValue("Scratch");
      await user.click(divNames[0]);
      await user.clear(divNames[0]);
      expect(divNames[0]).toHaveValue("");
      await user.click(saveBtn);
      const divNameErrors = await screen.findAllByTestId('dangerDivName');    
      expect(divNameErrors[0]).toHaveTextContent("Div Name is required");
      expect(acdns[0]).toHaveTextContent("Divisions - 2: Error in Divisions - Div Name is required");
      expect(divTabs[0]).toHaveClass('objError')
      await user.click(divNames[0]);  
      // editing div name should clear the error
      await user.type(divNames[0], 'Testing')
      expect(divNameErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent(": Error in Divisions - Div Name is required");
      expect(divTabs[0]).not.toHaveClass('objError')
    })
  })

  describe('render hdcp % errors', () => { 
    // create invalid data so click on save button will not try to save
    const invalidTmnt = structuredClone(tmntProps)
    invalidTmnt.curData.tmnt.tmnt_name = '';
    
    it('render Hdcp % over max error', async () => {
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });      
      await user.click(acdns[0]);      
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];            
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcps[1]).toHaveValue(formatValuePercent2Dec(0.9));
      await user.clear(hdcps[1]);      
      await user.type(hdcps[1], '234')            
      expect(hdcps[1]).toHaveValue('234%');      
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcp');          
      await user.click(saveBtn);
      expect(hdcps[1]).toHaveValue('234.00%');
      expect(divHdcpErrors[1]).toHaveTextContent("Hdcp % cannot be more than");
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");
      expect(hdcpTabs[0]).toHaveClass('objError');            
    })
    it('clear Hdcp %, no error, reset hdcp % to 0', async () => {
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });      
      await user.click(acdns[0]);         
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];      
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcps[1]).toHaveValue(formatValuePercent2Dec(0.9))
      // clear hdcp %, resets to 0 if blank. 0 is valid
      await user.clear(hdcps[1]); 
      await user.click(saveBtn);      
      expect(hdcps[1]).toHaveValue('0.00%');
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcp');          
      await user.click(saveBtn);
      expect(divHdcpErrors[1]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp %");
      expect(hdcpTabs[0]).not.toHaveClass('objError');            
    })    
    it('type "-1" into hdcp %, converts to 01, NO error', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });      
      await user.click(acdns[0]);      
      const divTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];      
      expect(hdcps[0]).toHaveValue(formatValuePercent2Dec(0))
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '-1');
      await user.click(saveBtn);      
      expect(hdcps[0]).toHaveValue('1.00%');
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcp');          
      await user.click(saveBtn);
      expect(divHdcpErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp %");
      expect(divTabs[0]).not.toHaveClass('objError');            
    })    
    it('paste "-2" into hdcp %', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const divTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];
      expect(hdcps[0]).toHaveValue(formatValuePercent2Dec(0))      
      await user.clear(hdcps[0]);
      await user.paste('-2');
      await user.click(saveBtn);
      expect(hdcps[0]).toHaveValue('2.00%');
    })
    it('clear hdcp % error', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });      
      await user.click(acdns[0]);      
      const divTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];      
      expect(hdcps[0]).toHaveValue(formatValuePercent2Dec(0))      
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '234')
      await user.click(saveBtn);      
      expect(hdcps[0]).toHaveValue('234.00%');
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcp');          
      await user.click(saveBtn);
      expect(divHdcpErrors[0]).toHaveTextContent("Hdcp % cannot be more than");
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");
      expect(divTabs[0]).toHaveClass('objError');            
      await user.clear(hdcps[0]);
      // entering value clears error
      await user.type(hdcps[0], '100');      
      expect(divHdcpErrors[0]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp % cannot be more than");
      expect(divTabs[0]).not.toHaveClass('objError');            
    })
  })

  describe('render the hdcp from errors', () => {
    // create invalid data so click on save button will not try to save
    const invalidTmnt = structuredClone(tmntProps)
    invalidTmnt.curData.tmnt.tmnt_name = '';
    
    it('render the hdcp from error', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcpfroms[1]).toHaveValue(defaultHdcpFrom)
      await user.clear(hdcpfroms[1]);      
      await user.type(hdcpfroms[1], '301');
      await user.click(saveBtn);
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcpFrom');
      expect(divHdcpErrors[1]).toHaveTextContent("Hdcp From cannot be more than");
      expect(acdns[0]).toHaveTextContent("Hdcp From cannot be more than");
      expect(hdcpTabs[0]).toHaveClass('objError');
    })
    it('clear Hdcp From, no error, reset hdcp from to 0', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })      
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcpfroms[1]).toHaveValue(defaultHdcpFrom)
      // clear hdcp from, resets to 0 if blank. 0 is valid
      await user.clear(hdcpfroms[1]);
      await user.click(saveBtn);
      expect(hdcpfroms[1]).toHaveValue(0)
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcpFrom');
      expect(divHdcpErrors[1]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp From cannot be more than");
      expect(hdcpTabs[0]).not.toHaveClass('objError');
    })
    it('type "-1" into hdcp from, converts to 01, NO error', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })      
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcpfroms[1]).toHaveValue(defaultHdcpFrom)
      await user.clear(hdcpfroms[1]);
      await user.type(hdcpfroms[1], '-1');
      await user.click(saveBtn);
      expect(hdcpfroms[1]).toHaveValue(1)
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcpFrom');
      expect(divHdcpErrors[1]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp From cannot be more than");
      expect(hdcpTabs[0]).not.toHaveClass('objError');
    })    
    it('enter -20 into hdcp from', async () => {
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })      
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcpfroms[1]).toHaveValue(defaultHdcpFrom)      
      await user.clear(hdcpfroms[1]);
      await user.click(hdcpfroms[1]);
      await user.type(hdcpfroms[1], '{arrowleft}-2'); // 0 remains, gives -20
      await user.click(saveBtn);
      expect(hdcpfroms[1]).toHaveValue(-20);
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcpFrom');
      expect(divHdcpErrors[1]).toHaveTextContent("Hdcp From cannot be less than");
      expect(acdns[0]).toHaveTextContent("Hdcp From cannot be less than");
      expect(hdcpTabs[0]).toHaveClass('objError');
    })
    it('clear hdcp % error', async () => { 
      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })      
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      expect(hdcpfroms[1]).toHaveValue(defaultHdcpFrom)
      await user.clear(hdcpfroms[1]);      
      await user.type(hdcpfroms[1], '301');
      await user.click(saveBtn);
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcpFrom');
      expect(divHdcpErrors[1]).toHaveTextContent("Hdcp From cannot be more than");
      expect(acdns[0]).toHaveTextContent("Hdcp From cannot be more than");
      expect(hdcpTabs[0]).toHaveClass('objError');
      await user.clear(hdcpfroms[1]);
      // entering value clears error
      await user.type(hdcpfroms[1], '230');
      expect(divHdcpErrors[1]).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Hdcp From cannot be more than");
      expect(hdcpTabs[0]).not.toHaveClass('objError');
    })
  })

  describe('render multiple errors', () => { 
    // create invalid data so click on save button will not try to save
    const invalidTmnt = structuredClone(tmntProps)
    invalidTmnt.curData.tmnt.tmnt_name = '';

    it('should render multiple errors', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });      
      await user.click(acdns[0]);      
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const hdcpfroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];            
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];            
      await user.click(hdcpTabs[0]);
      // use mockDivs[1]
      await user.clear(divNames[1]);

      expect(hdcps[1]).toHaveValue(formatValuePercent2Dec(0.9));
      await user.clear(hdcps[1]);      
      await user.type(hdcps[1], '150')            
      expect(hdcps[1]).toHaveValue('150%');      
      const divHdcpErrors = await screen.findAllByTestId('dangerHdcp');          
      await user.click(saveBtn);
      expect(hdcpTabs[0]).toHaveClass('objError');            
      await user.clear(hdcpfroms[1]);
      await user.type(hdcpfroms[1], '301')      
      expect(hdcpfroms[1]).toHaveValue(301)
      await user.click(saveBtn);    
      expect(hdcpTabs[0]).toHaveClass('objError');      
      expect(acdns[0]).toHaveTextContent("Div Name is required");
      await user.clear(divNames[1]);
      await user.type(divNames[1], 'Testing');
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");               
      await user.clear(hdcps[1]);      
      await user.type(hdcps[1], '234');
      expect(hdcps[1]).toHaveValue('234%');
      await user.click(saveBtn);    
      expect(hdcpTabs[0]).toHaveClass('objError');      
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");
    })
    it('clear hdcp from error, reset hdcp from to default if hdcp set to 0', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })      
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];      
      const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      expect(hdcps[0]).toHaveValue('0.00%')
      await user.clear(hdcps[0]);      
      await user.type(hdcps[0], '150')
      await user.clear(hdcpFroms[0]);
      await user.type(hdcpFroms[0], '301')
      await user.click(saveBtn);    
      expect(scratchTabs[0]).toHaveClass('objError');      
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");
      const divHdcpFromErrors = await screen.findAllByTestId('dangerHdcpFrom');          
      expect(divHdcpFromErrors[0]).toHaveTextContent("Hdcp From cannot be more than");
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '0');
      expect(hdcps[0]).toHaveValue('0%');
      await user.click(saveBtn);    
      expect(hdcpFroms[0]).toHaveValue(defaultHdcpFrom);
      expect(divHdcpFromErrors[0]).toHaveTextContent("");      
      expect(scratchTabs[0]).not.toHaveClass('objError');            
      expect(acdns[0]).not.toHaveTextContent("Hdcp % cannot be more than");
      expect(acdns[0]).not.toHaveTextContent("Hdcp From cannot be more than");
    })
    it('render errors in different divisions', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const scratchTabs = await screen.findAllByRole('tab', { name: /scratch/i })
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];      
      const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
      expect(hdcps[0]).toHaveValue('0.00%')
      await user.clear(hdcps[0]);      
      await user.type(hdcps[0], '150')
      await user.click(hdcpTabs[0]);
      await user.clear(hdcpFroms[1]);
      await user.type(hdcpFroms[1], '301')
      await user.click(saveBtn);
      expect(scratchTabs[0]).toHaveClass('objError');      
      // show 1st division error before 2nd division error
      expect(acdns[0]).toHaveTextContent("Hdcp % cannot be more than");
      expect(hdcpTabs[0]).toHaveClass('objError');
      await user.click(scratchTabs[0]);
      await user.clear(hdcps[0]);
      await user.type(hdcps[0], '0')
      // show 2nd division error
      expect(acdns[0]).toHaveTextContent("Hdcp From cannot be more than");
    })
  })

  describe('delete division errors', () => {
    it('delete division error, when division to delete has a pot', async () => {
      // create invalid data so click on save button will not try to save      
      const invalidTmnt = structuredClone(tmntProps)
      invalidTmnt.curData.tmnt.tmnt_name = '';

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = screen.getAllByRole('tab', { name: /handicap/i }) as HTMLElement[];
      await user.click(hdcpTabs[0]);
      const deleteBtn = screen.getByRole('button', { name: /delete div/i }) as HTMLElement;
      await user.click(deleteBtn);
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeNull
      const cannotDelete = screen.getByText('Cannot Delete')
      expect(cannotDelete).toBeInTheDocument();
    })
    it('delete division error, when division to delete has a bracket', async () => {
      // create invalid data so click on save button will not try to save
      // also remove pots
      const invalidTmnt = structuredClone(tmntProps)
      invalidTmnt.curData.tmnt.tmnt_name = '';
      invalidTmnt.curData.pots = [];

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = screen.getAllByRole('tab', { name: /handicap/i }) as HTMLElement[];
      await user.click(hdcpTabs[0]);
      const deleteBtn = screen.getByRole('button', { name: /delete div/i }) as HTMLElement;
      await user.click(deleteBtn);
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeNull
      const cannotDelete = screen.getByText('Cannot Delete')
      expect(cannotDelete).toBeInTheDocument();
    })
    it('delete division error, when division to delete has an eliminator', async () => {
      // create invalid data so click on save button will not try to save
      // also remove pots and brackets
      const invalidTmnt = structuredClone(tmntProps)
      invalidTmnt.curData.tmnt.tmnt_name = '';
      invalidTmnt.curData.pots = [];
      invalidTmnt.curData.brkts = [];

      const user = userEvent.setup()
      render(<ReduxProvider><TmntDataForm tmntProps={invalidTmnt} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const hdcpTabs = screen.getAllByRole('tab', { name: /handicap/i }) as HTMLElement[];
      await user.click(hdcpTabs[0]);
      const deleteBtn = screen.getByRole('button', { name: /delete div/i }) as HTMLElement;
      await user.click(deleteBtn);
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeNull
      const cannotDelete = screen.getByText('Cannot Delete')
      expect(cannotDelete).toBeInTheDocument();
    })
  })

  describe('add new division', () => { 
    it('should add new division', async () => { 
      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);
      const numDivs = screen.getByLabelText('# Divisions');
      const addButton = screen.getByTestId('divAdd');
      expect(numDivs).toHaveValue('2');
      await user.click(addButton);    
    })
  })

  describe('delete division', () => { 
    it('should delete the division', async () => { 
      // create invalid data so click on save button will not try to save
      // also remove pots, brackets and eliminators
      const invalidTmnt = structuredClone(tmntProps)
      invalidTmnt.curData.tmnt.tmnt_name = '';
      invalidTmnt.curData.pots = [];
      invalidTmnt.curData.brkts = [];
      invalidTmnt.curData.elims = [];

      const user = userEvent.setup()      
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>);      
      const acdns = await screen.findAllByRole('button', { name: /divisions/i });
      await user.click(acdns[0]);      
      const hdcpTabs = await screen.findAllByRole('tab', { name: /handicap/i })
      await user.click(hdcpTabs[0]);
      const delBtn = await screen.findByRole('button', { name: /delete div/i });
      await user.click(delBtn);    
    }) 
  })

})