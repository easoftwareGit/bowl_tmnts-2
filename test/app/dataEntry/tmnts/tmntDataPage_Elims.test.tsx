import React from "react";
import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import { blankDataOneTmnt } from "@/lib/db/initVals";
import { tmntActions, tmntFormDataType} from "@/lib/types/types";
import { RootState } from "@/redux/store";
import { mockStateBowls } from "../../../mocks/state/mockState";
import { mockSDBrkts, mockSDDivs, mockSDElims, mockSDEvents, mockSDLanes, mockSDPots, mockSDSquads, mockSDTmnt } from "../../../mocks/tmnts/singlesAndDoubles/mockSD";
import { ReduxProvider } from "@/redux/provider";
import TmntDataForm from "@/app/dataEntry/tmntForm/tmntForm";
import { cloneDeep } from "lodash";

// Mock state for bowls
const mockState: Partial<RootState> = {
  bowls: {
    bowls: mockStateBowls,
    loadStatus: "idle",
    saveStatus: "idle",
    error: "",
  },  
}
// Mock redux state 
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

describe("TmntDataPage - Eliminators Component", () => { 

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

  describe("click on the eliminators accordian", () => { 
    it("find and open the eliminators accordian", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
    });
    it("render the create eliminators tab", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const createTab = await screen.findByRole("tab", { name: /create eliminator/i });
      expect(createTab).toBeVisible();
    });
  })

  describe('click the eliminator division radio buttons', () => { 
    it('initially one division for eliminators, radio buton not checked', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", {name: /scratch/i}) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      expect(scratchs[2]).not.toBeChecked();
    })
    it('render multiple division radio buttons', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
    })
    it("check 1st div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
      await user.click(scratchs[2]);
      expect(scratchs[2]).toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
    });
    it("check 2nd div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
      await user.click(hdcps[2]);
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).toBeChecked();
    });
    it("cycle through radio buttons", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs).toHaveLength(3);
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
      await user.click(scratchs[2]);
      expect(scratchs[2]).toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
      await user.click(hdcps[2]);
      expect(scratchs[2]).not.toBeChecked();      
      expect(hdcps[2]).toBeChecked();
      await user.click(scratchs[2]);
      expect(scratchs[2]).toBeChecked();      
      expect(hdcps[2]).not.toBeChecked();
    });
  })

  describe('render eliminator divison error', () => { 
    it('create eliminator without a division', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
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
      const elimDivErr = await screen.findByTestId('dangerElimDivRadio');    
      expect(elimDivErr).toHaveTextContent("Division is required");
    })
    it('clear no division error', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
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
      const elimDivErr = await screen.findByTestId('dangerElimDivRadio');    
      expect(elimDivErr).toHaveTextContent("Division is required");
      await user.click(scratchs[2]);
      expect(elimDivErr).toHaveTextContent("");
    })
  })

  describe('render eliminator fee error', () => { 
    it('create eliminator with fee less than min fee', async () => {      
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      expect(fees[10]).toHaveTextContent("");      
      await user.click(addBtn);      
      const elimFeeErr = await screen.findByTestId('dangerCreateElimFee');    
      expect(elimFeeErr).toHaveTextContent("Fee cannot be less than");
    })
    it('create eliminator with fee more than max fee', async () => {      
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], "1234567");    
      await user.click(addBtn);
      expect(fees[10]).toHaveValue("$1,234,567.00");     
      const elimFeeErr = await screen.findByTestId('dangerCreateElimFee');    
      expect(elimFeeErr).toHaveTextContent("Fee cannot be more than");
    })
    it('clear eliminator fee error', async () => {      
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];      
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [3-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], "1234567");    
      await user.click(addBtn);
      expect(fees[10]).toHaveValue("$1,234,567.00");
      const elimFeeErr = await screen.findByTestId('dangerCreateElimFee');    
      expect(elimFeeErr).toHaveTextContent("Fee cannot be more than");
      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], "20[Tab]");    
      expect(fees[10]).toHaveValue("$20.00");
      expect(elimFeeErr).toHaveTextContent("");
    })
  })

  describe('render the eliminator start error', () => { 
    it('create eliminator with start less than min start', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '0');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');
      
      await user.click(addBtn);
      const elimStartErr = await screen.findByTestId('dangerCreateElimStart');
      expect(elimStartErr).toHaveTextContent("Start cannot be less than");
    })
    it('create eliminator with start setting eleinator to end past last game', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '9');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');
      
      await user.click(addBtn);
      const elimStartErr = await screen.findByTestId('dangerCreateElimStart');
      expect(elimStartErr).toHaveTextContent("Eliminator ends after last game");
    })
    it('clear eliminator start error', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);
      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '9');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');
      
      await user.click(addBtn);
      const elimStartErr = await screen.findByTestId('dangerCreateElimStart');
      expect(elimStartErr).toHaveTextContent("Eliminator ends after last game");

      await user.clear(start[7]);
      await user.type(start[7], '1');
      expect(elimStartErr).toHaveTextContent("");
    })
  })

  describe('render the eliminator games error', () => { 
    it('create eliminator with games less than min games', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      const games = screen.getByTestId('createElimGames') as HTMLInputElement;
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);

      await user.click(games)
      await user.clear(games)
      await user.type(games, '0');

      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '1');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');
      
      await user.click(addBtn);
      const elimGamesErr = await screen.findByTestId('dangerCreateElimGames');
      expect(elimGamesErr).toHaveTextContent("Games cannot be less than");
    })
    it('create eliminator with games more than max games', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      const games = screen.getByTestId('createElimGames') as HTMLInputElement;
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);

      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '1');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');

      await user.click(games)
      await user.clear(games)
      await user.type(games, '100');

      await user.click(addBtn);
      const elimGamesErr = await screen.findByTestId('dangerCreateElimGames');
      expect(elimGamesErr).toHaveTextContent("Games cannot be more than");
    })
    it('create eliminator with games setting eleinator to end past last game', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      const games = screen.getByTestId('createElimGames') as HTMLInputElement;
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);

      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '4');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');

      await user.click(games)
      await user.clear(games)
      await user.type(games, '9');

      await user.click(addBtn);
      const elimGamesErr = await screen.findByTestId('dangerCreateElimGames');
      expect(elimGamesErr).toHaveTextContent("Games cannot be more than");
    })
    it('clear eliminator games error', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const start = screen.getAllByRole("spinbutton", { name: /start/i }) as HTMLInputElement[];
      const games = screen.getByTestId('createElimGames') as HTMLInputElement;
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      // start[0,1] - squads, [2-6] brkts, [7-11] - elims
      expect(start).toHaveLength(12);

      await user.click(start[7]);
      await user.clear(start[7]);
      await user.type(start[7], '4');

      await user.click(fees[10]);
      await user.clear(fees[10]);
      await user.type(fees[10], '5');

      await user.click(games)
      await user.clear(games)
      await user.type(games, '9');

      await user.click(addBtn);
      const elimGamesErr = await screen.findByTestId('dangerCreateElimGames');
      expect(elimGamesErr).toHaveTextContent("Games cannot be more than");

      await user.click(games)
      await user.clear(games)
      await user.type(games, '3');
      expect(elimGamesErr).toHaveTextContent("");
    })
  })

  describe('render edited eliminator fee errors', () => {

    it('edited eliminator fee less than min error', async () => {
      const testTmnt = cloneDeep(tmntProps)
      testTmnt.curData.elims[0].fee = '0';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /eliminator/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[1]);
      expect(fees[11]).toHaveValue('$0.00');

      await user.click(saveBtn)
      const elimFeeErr = await screen.findByTestId(`dangerElimFee${testTmnt.curData.elims[0].id}`);
      expect(elimFeeErr).toHaveTextContent("Fee cannot be less than");
      expect(acdns[0]).toHaveTextContent("Eliminators - 4: Error in Scratch: 1-3 - Fee cannot be less than");
      expect(scratchGame1Tabs[1]).toHaveClass('objError')
    })
    it('edited eliminator more than max error', async () => {
      const testTmnt = cloneDeep(tmntProps)
      testTmnt.curData.elims[0].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /eliminator/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[1]);
      expect(fees[11]).toHaveValue('$1,234,567.00');

      await user.click(saveBtn)
      const elimFeeErr = await screen.findByTestId(`dangerElimFee${testTmnt.curData.elims[0].id}`);
      expect(elimFeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Eliminators - 4: Error in Scratch: 1-3 - Fee cannot be more than");
      expect(scratchGame1Tabs[1]).toHaveClass('objError')
    })
    it('clear eliminator fee error', async () => {
      const testTmnt = cloneDeep(tmntProps)
      testTmnt.curData.elims[0].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /eliminator/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15)
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      // [0] - brkts, [1] - elims
      expect(scratchGame1Tabs).toHaveLength(2)
      await user.click(scratchGame1Tabs[1]);
      expect(fees[11]).toHaveValue('$1,234,567.00');

      await user.click(saveBtn)
      const elimFeeErr = await screen.findByTestId(`dangerElimFee${testTmnt.curData.elims[0].id}`);
      expect(elimFeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Eliminators - 4: Error in Scratch: 1-3 - Fee cannot be more than");
      expect(scratchGame1Tabs[1]).toHaveClass('objError')

      // clear or type will clear the error
      await user.clear(fees[11]);
      await user.type(fees[11], "10");
      expect(elimFeeErr).toHaveTextContent("");
      expect(acdns[0]).toHaveTextContent("Eliminators - 4");
      expect(scratchGame1Tabs[1]).not.toHaveClass('objError')
    })
  })

  describe('render multiple errors', () => { 
    it('render multiple errors for different eliminators', async () => {       
      const testTmnt = cloneDeep(tmntProps)
      testTmnt.curData.elims[0].fee = '0';
      testTmnt.curData.elims[1].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add eliminator/i });
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
      const scratch13FeeErr = await screen.findByTestId(`dangerElimFee${testTmnt.curData.elims[0].id}`);
      const scratch46FeeErr = await screen.findByTestId(`dangerElimFee${testTmnt.curData.elims[1].id}`);

      await user.click(saveBtn);

      expect(scratch13FeeErr).toHaveTextContent("Fee cannot be less than");
      expect(scratch46FeeErr).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Eliminators - 4: Error in Scratch: 1-3 - Fee cannot be less than");
      expect(scratchGame1Tabs[1]).toHaveClass('objError')
      expect(scratchGame4Tabs[1]).toHaveClass('objError')
    
      await user.click(scratchGame1Tabs[1]);  
      await user.clear(fees[11]);
      await user.type(fees[11], '5');
      expect(scratch13FeeErr).toHaveTextContent("");
      expect(scratchGame1Tabs[0]).not.toHaveClass('objError')
      expect(acdns[0]).toHaveTextContent("Eliminators - 4: Error in Scratch: 4-6 - Fee cannot be more than");
      await user.click(scratchGame4Tabs[1]);  
      await user.clear(fees[12]);
      await user.type(fees[12], '5');
      expect(acdns[0]).toHaveTextContent("Eliminators - 4");
      expect(scratchGame4Tabs[1]).not.toHaveClass('objError')
    })
  })

  describe('delete eliminator', () => {
    it('delete eliminator confirmation', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /eliminators/i });
      await user.click(acdns[0]);
      const scratchGame1Tabs = screen.getAllByRole("tab", { name: /scratch: 1-3/i }) as HTMLInputElement[];
      await user.click(scratchGame1Tabs[1]);
      const delBtns = screen.getAllByRole('button', { name: /delete eliminator/i }) as HTMLElement[];
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