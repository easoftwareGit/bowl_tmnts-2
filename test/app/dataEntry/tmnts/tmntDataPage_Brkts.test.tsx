import React from "react";
import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import { blankDataOneTmnt } from "@/lib/db/initVals";
import { tmntActions, tmntFormDataType } from "@/lib/types/types";
import { RootState } from "@/redux/store";
import { mockStateBowls } from "../../../mocks/state/mockState";
import { mockSDBrkts, mockSDDivs, mockSDElims, mockSDEvents, mockSDLanes, mockSDPots, mockSDSquads, mockSDTmnt } from "../../../mocks/tmnts/singlesAndDoubles/mockSD";
import { ReduxProvider } from "@/redux/provider";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
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
// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null
    };
  }
}));

describe("TmntDataPage - Brackets Component", () => { 

  const tmntProps: tmntFormDataType = {
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
    },
    tmntAction: tmntActions.Edit
  };   

  describe("click on the brackets accordian", () => {
    it("find and open the brackets accordian", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
    });
    it("render the create brackets tab", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const createTab = await screen.findByRole("tab", { name: /create bracket/i });
      expect(createTab).toBeVisible();
    });
  });  

  describe('click the bracket division radio buttons', () => { 
    it('initially one division for brackets, radio buton not checked', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", {name: /scratch/i}) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      expect(scratchs[1]).not.toBeChecked();
    })
    it('render multiple division radio buttons', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
    })
    it("check 1st div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
      await user.click(scratchs[1]);
      expect(scratchs[1]).toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
    });
    it("check 2nd div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
      await user.click(hdcps[1]);
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).toBeChecked();
    });
    it("cycle through radio buttons", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
      await user.click(scratchs[1]);
      expect(scratchs[1]).toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
      await user.click(hdcps[1]);
      expect(scratchs[1]).not.toBeChecked();      
      expect(hdcps[1]).toBeChecked();
      await user.click(scratchs[1]);
      expect(scratchs[1]).toBeChecked();      
      expect(hdcps[1]).not.toBeChecked();
    });
  })

  describe('render bracket divison error', () => { 
    it('create bracket without a division', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.clear(fees[5]);
      await user.type(fees[5], "20[Tab]");
      expect(fees[5]).toHaveValue("$20.00");
      await user.click(addBtn);            
      const brktDivErr = await screen.findByTestId('dangerBrktDivRadio');    
      expect(brktDivErr).toHaveTextContent("Division is required");
    })
    it('clear no division error', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // divs1[0] - pots, divs1[1] - brkts, divs1[2] - elims
      expect(scratchs).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.clear(fees[5]);
      await user.type(fees[5], "20");
      await user.click(addBtn);
      const brktDivErr = await screen.findByTestId('dangerBrktDivRadio');    
      expect(brktDivErr).toHaveTextContent("Division is required");
      await user.click(scratchs[1]);
      expect(brktDivErr).toHaveTextContent("");
    })
  })

  describe('render bracket fee error', () => { 
    it('create bracket with fee less than min fee', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      expect(fees[5]).toHaveTextContent("");      
      await user.click(addBtn);      
      const brktFeeErr = await screen.findByTestId('dangerCreateBrktFee');    
      expect(brktFeeErr).toHaveTextContent("Fee cannot be less than");
    })
    it('create bracket with fee more than max fee', async () => {      
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], "1234567");    
      await user.click(addBtn);
      expect(fees[5]).toHaveValue("$1,234,567.00");     
      const brktFeeErr = await screen.findByTestId('dangerCreateBrktFee');    
      expect(brktFeeErr).toHaveTextContent("Fee cannot be more than");
    })
    it('clear bracket fee error', async () => {      
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], "1234567");    
      await user.click(addBtn);
      expect(fees[5]).toHaveValue("$1,234,567.00");
      const brktFeeErr = await screen.findByTestId('dangerCreateBrktFee');    
      expect(brktFeeErr).toHaveTextContent("Fee cannot be more than");
      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], "20[Tab]");    
      expect(fees[5]).toHaveValue("$20.00");
      expect(brktFeeErr).toHaveTextContent("");
    })
  })
  
  describe('render the bracket start error', () => { 
    it('create bracket with start less than min start', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });      
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[2]);
      await user.clear(start[2]);
      await user.type(start[2], '0');

      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], '5');
      
      await user.click(addBtn);
      const brktStartErr = await screen.findByTestId('dangerCreateBrktStart');
      expect(brktStartErr).toHaveTextContent("Start cannot be less than");
    })
    it('create bracket with start more than max start', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });      
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[2]);
      await user.clear(start[2]);
      await user.type(start[2], '9');

      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], '5');
      
      await user.click(addBtn);
      const brktStartErr = await screen.findByTestId('dangerCreateBrktStart');
      expect(brktStartErr).toHaveTextContent("Start cannot be more than");
    })
    it('clear bracket start error', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add bracket/i });      
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[2]);
      await user.clear(start[2]);
      await user.type(start[2], '9');

      await user.click(fees[5]);
      await user.clear(fees[5]);
      await user.type(fees[5], '5');
      
      await user.click(addBtn);
      const brktStartErr = await screen.findByTestId('dangerCreateBrktStart');
      expect(brktStartErr).toHaveTextContent("Start cannot be more than");

      await user.clear(start[2]);
      await user.type(start[2], '1');
      expect(brktStartErr).toHaveTextContent("");
    })
  })

  describe('render edited bracket fee errors', () => {
    it('edited bracket fee less than min error', async () => {
      const testTmnt = structuredClone(tmntProps)
      testTmnt.curData.brkts[0].fee = '0';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[0]);
      expect(fees[6]).toHaveValue('$0.00');

      await user.click(saveBtn)
      const brktFeeErr = await screen.findByTestId(`dangerBrktFee${testTmnt.curData.brkts[0].id}`);
      expect(brktFeeErr).toHaveTextContent("Fee cannot be less than");
      expect(acdns[0]).toHaveTextContent("Brackets - 4: Error in Scratch: 1-3 - Fee cannot be less than");
      expect(scratchGame1Tabs[0]).toHaveClass('objError')
    })
    it('edited bracket more than max error', async () => {
      const testTmnt = structuredClone(tmntProps)
      testTmnt.curData.brkts[0].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[0]);
      expect(fees[6]).toHaveValue('$1,234,567.00');

      await user.click(saveBtn)
      const brktFeeErr = await screen.findByTestId(`dangerBrktFee${testTmnt.curData.brkts[0].id}`);
      expect(brktFeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Brackets - 4: Error in Scratch: 1-3 - Fee cannot be more than");
      expect(scratchGame1Tabs[0]).toHaveClass('objError')
    })
    it('clear bracket fee error', async () => {
      const testTmnt = structuredClone(tmntProps)
      testTmnt.curData.brkts[0].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[0]);
      expect(fees[6]).toHaveValue('$1,234,567.00');

      await user.click(saveBtn)
      const brktFeeErr = await screen.findByTestId(`dangerBrktFee${testTmnt.curData.brkts[0].id}`);
      expect(brktFeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Brackets - 4: Error in Scratch: 1-3 - Fee cannot be more than");
      expect(scratchGame1Tabs[0]).toHaveClass('objError')
      await user.click(fees[6]);
      // clear or type will clear the error
      await user.clear(fees[6]);
      await user.type(fees[6], '5');

      expect(brktFeeErr).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Error in Scratch: 1-3 - Fee cannot be more than");
      expect(scratchGame1Tabs[0]).not.toHaveClass('objError')
    })
  })

  describe('render multiple errors', () => { 
    
    it('render multiple errors for different brackets', async () => {       
      const testTmnt = structuredClone(tmntProps)
      testTmnt.curData.brkts[0].fee = '0';
      testTmnt.curData.brkts[1].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);      
      const scratches = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // scratches[0] - pots, scratches[1] - brkts, scratches[2] - elims
      expect(scratches).toHaveLength(3);
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      // start[0,1] - squad,  start[2-6] - brkts, start[7-11] - elims
      expect(start).toHaveLength(12);        
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)      
      const scratchGame4Tabs = screen.getAllByRole("tab", { name: /scratch: 4-6/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame4Tabs).toHaveLength(2)
      const scratch13FeeErr = await screen.findByTestId(`dangerBrktFee${testTmnt.curData.brkts[0].id}`);
      const scratch46FeeErr = await screen.findByTestId(`dangerBrktFee${testTmnt.curData.brkts[1].id}`);

      await user.click(saveBtn);

      expect(scratch13FeeErr).toHaveTextContent("Fee cannot be less than");
      expect(scratch46FeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Brackets - 4: Error in Scratch: 1-3 - Fee cannot be less than");
      expect(scratchGame1Tabs[0]).toHaveClass('objError')
      expect(scratchGame4Tabs[0]).toHaveClass('objError')
    
      await user.click(scratchGame1Tabs[0]);  
      await user.clear(fees[6]);
      await user.type(fees[6], '5');
      expect(scratch13FeeErr).toHaveTextContent("");
      expect(scratchGame1Tabs[0]).not.toHaveClass('objError')
      expect(acdns[0]).toHaveTextContent("Brackets - 4: Error in Scratch: 4-6 - Fee cannot be more than");
      await user.click(scratchGame4Tabs[0]);  
      await user.clear(fees[7]);
      await user.type(fees[7], '5');
      expect(acdns[0]).toHaveTextContent("Brackets - 4");
      expect(scratchGame4Tabs[0]).not.toHaveClass('objError')
    })
  })

  describe('delete bracket', () => {  
    it('delete bracket confirmation', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /brackets/i });
      await user.click(acdns[0]);
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      await user.click(scratchGame1Tabs[0]);
      const delBtns = screen.getAllByRole('button', { name: /delete bracket/i }) as HTMLElement[];
      expect(delBtns).toHaveLength(4);
      await user.click(delBtns[0]);
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();
      const confirmDelete = screen.getByText('Confirm Delete')
      expect(confirmDelete).toBeInTheDocument();
    })
  })

})