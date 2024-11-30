import React from "react";
import { render, screen } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import { blankDataOneTmnt } from "@/lib/db/initVals";
import { tmntActions, tmntFormDataType } from "@/lib/types/types";
import { mockSDBrkts, mockSDDivs, mockSDElims, mockSDEvents, mockSDLanes, mockSDPots, mockSDSquads, mockSDTmnt } from "../../../mocks/tmnts/singlesAndDoubles/mockSD";
import { RootState } from "@/redux/store";
import { mockStateBowls } from "../../../mocks/state/mockState";
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

describe("TmntDataPage - Pots Component", () => {

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

  describe("click on the pots accordian", () => {
    it("find and open the pots accordian", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      expect(acdns).toHaveLength(1);
      await user.click(acdns[0]);
    });
    it("render the pots tab", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const createTab = await screen.findByRole("tab", { name: /create pot/i });
      expect(createTab).toBeVisible();
    });
  });

  describe("click the pot type radio buttons", () => {
    it("render the pot type radio buttons, should all be unchecked", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];            
      const lastGame = screen.getByRole("radio", { name: /last game/i, }) as HTMLInputElement;    
      const series = screen.getAllByRole("radio", { name: /series/i, }) as HTMLInputElement[];      
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      expect(games[2]).not.toBeChecked();      
      expect(lastGame).not.toBeChecked();
      // series[0,1]: Div Hdcp for, series[2]: Pot Series
      expect(series).toHaveLength(3);
      expect(series[2]).not.toBeChecked();
    });
    it("check the Game pot type radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];            
      const lastGame = screen.getByRole("radio", { name: /last game/i, }) as HTMLInputElement;    
      const series = screen.getAllByRole("radio", { name: /series/i, }) as HTMLInputElement[];      
      await user.click(games[2]);      
      expect(games[2]).toBeChecked();
      expect(lastGame).not.toBeChecked();
      expect(series[2]).not.toBeChecked();
    });
    it("check the Last Game pot type radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const lastGame = screen.getByRole("radio", { name: /last game/i, }) as HTMLInputElement;    
      const series = screen.getAllByRole("radio", { name: /series/i, }) as HTMLInputElement[];      
      await user.click(lastGame);
      expect(games[2]).not.toBeChecked();
      expect(lastGame).toBeChecked();
      expect(series[2]).not.toBeChecked();
    });
    it("check the Series pot type radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const lastGame = screen.getByRole("radio", { name: /last game/i, }) as HTMLInputElement;    
      const series = screen.getAllByRole("radio", { name: /series/i, }) as HTMLInputElement[];      
      await user.click(series[2]);
      expect(games[2]).not.toBeChecked();
      expect(lastGame).not.toBeChecked();
      expect(series[2]).toBeChecked();
    });
    it("cyles throw all pot game radio buttons", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const lastGame = screen.getByRole("radio", { name: /last game/i }) as HTMLInputElement;      
      const series = screen.getAllByRole("radio", { name: /series/i }) as HTMLInputElement[];      
      await user.click(games[2]);
      expect(games[2]).toBeChecked();
      expect(lastGame).not.toBeChecked();
      expect(series[2]).not.toBeChecked();
      await user.click(lastGame);
      expect(games[2]).not.toBeChecked();
      expect(lastGame).toBeChecked();
      expect(series[2]).not.toBeChecked();
      await user.click(series[2]);
      expect(games[2]).not.toBeChecked();
      expect(lastGame).not.toBeChecked();
      expect(series[2]).toBeChecked();
    });
  });

  describe("click on the division radios", () => {
    it("render multiple division radio buttons", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
    });
    it("check 1st div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);            
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
      await user.click(scratchs[0]);
      expect(scratchs[0]).toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
    });
    it("check 2nd div radio radio button", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
      await user.click(hdcps[0]);
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).toBeChecked();
    });
    it("cycle through radio buttons", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole("radio", {name: /handicap/i }) as HTMLInputElement[];
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
      await user.click(scratchs[0]);
      expect(scratchs[0]).toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
      await user.click(hdcps[0]);
      expect(scratchs[0]).not.toBeChecked();      
      expect(hdcps[0]).toBeChecked();
      await user.click(scratchs[0]);
      expect(scratchs[0]).toBeChecked();      
      expect(hdcps[0]).not.toBeChecked();
    });
  });

  describe('render pot type error', () => { 
    it("create a pot without a pot type, render error", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0, 1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0,1] - pots, scratchs[2] - brkts, divs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      await user.click(scratchs[0]);
      await user.clear(fees[0]);
      await user.type(fees[0], "20");
      await user.click(addBtn);
      const potTypeError = await screen.findByTestId('dangerPotType');    
      expect(potTypeError).toHaveTextContent("Pot Type is required");
    });
    it("clear pot type error", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0, 1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0,1] - pots, scratchs[2] - brkts, divs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims
      expect(fees).toHaveLength(15);
      await user.click(scratchs[0]);
      await user.clear(fees[0]);
      await user.type(fees[0], "20");
      await user.click(addBtn);
      const potTypeError = await screen.findByTestId('dangerPotType');    
      expect(potTypeError).toHaveTextContent("Pot Type is required");
      await user.click(games[2]);
      expect(potTypeError).toHaveTextContent("");
    });
  })

  describe('render the pot division error', () => { 
    it("create a pot without a division, render error", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(games[2]);
      await user.clear(fees[2]);
      await user.type(fees[2], "20");
      await user.click(addBtn);
      const divError = await screen.findByTestId('dangerDiv');    
      expect(divError).toHaveTextContent("Division is required");
    });
    it("clear pot division error", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(games[2]);
      await user.clear(fees[2]);
      await user.type(fees[2], "20");
      await user.click(addBtn);
      const divError = await screen.findByTestId('dangerDiv');    
      expect(divError).toHaveTextContent("Division is required");
      await user.click(scratchs[0]);
      expect(divError).toHaveTextContent("");
    });
  })

  describe('render the pot fee errors', () => { 
    it("create a pot without a fee less than min", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(games[2]);
      await user.click(scratchs[0]);      
      await user.click(addBtn);      
      const feeErrors = await screen.findAllByTestId('dangerPotFee');    
      expect(feeErrors[0]).toHaveTextContent("Fee cannot be less than");      
    });
    it("create a pot without a fee more than max", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(games[2]);
      await user.click(scratchs[0]);      
      await user.type(fees[2], "1234567");
      await user.click(addBtn);
      const feeErrors = await screen.findAllByTestId('dangerPotFee');    
      expect(feeErrors[0]).toHaveTextContent("Fee cannot be more than");
    });
    it("clear pot fee error", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(games[2]);
      await user.click(scratchs[0]);      
      await user.click(addBtn);
      const feeError = await screen.findByTestId('dangerPotFee');    
      expect(feeError).toHaveTextContent("Fee cannot be less than");
      await user.click(fees[2]);
      // clear/type will clear the error
      await user.clear(fees[2]);
      await user.type(fees[2], "20");
      expect(feeError).toHaveTextContent("");
    });
    it('should show error for error in editted pot fee', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims            
      const potScratchTab = await screen.findByRole("tab", { name: "Game - Scratch" }) as HTMLInputElement;      
      expect(fees).toHaveLength(15);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      await user.click(potScratchTab);
      await user.click(fees[3]);      
      await user.clear(fees[3]);
      await user.click(saveBtn);
      const feeError = await screen.findByTestId('dangerPotFee' + tmntProps.curData.pots[0].id);       
      expect(feeError).toHaveTextContent("Fee cannot be less than");
      expect(acdns[0]).toHaveTextContent("Fee cannot be less than");
      expect(potScratchTab).toHaveClass('objError')      
    })
    it('should clear error for error in editted pot fee', async () => { 
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims            
      const potScratchTab = await screen.findByRole("tab", { name: "Game - Scratch" }) as HTMLInputElement;      
      expect(fees).toHaveLength(15);
      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      await user.click(potScratchTab);
      await user.click(fees[3]);      
      await user.clear(fees[3]);
      await user.click(saveBtn);
      const feeError = await screen.findByTestId('dangerPotFee' + tmntProps.curData.pots[0].id);       
      expect(feeError).toHaveTextContent("Fee cannot be less than");
      expect(acdns[0]).toHaveTextContent("Fee cannot be less than");
      expect(potScratchTab).toHaveClass('objError')      
      await user.click(fees[3]);
      await user.type(fees[3], "10");
      expect(feeError).toHaveTextContent("");
      expect(acdns[0]).not.toHaveTextContent("Fee cannot be less than");
      expect(potScratchTab).not.toHaveClass('objError')      
    })
  })

  describe('render multiple errors', () => { 
    it("create a pot withoyt type and division", async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const addBtn = await screen.findByRole("button", { name: /add pot/i });
      const games = screen.getAllByLabelText('Game') as HTMLInputElement[];      
      const scratchs = screen.getAllByRole("radio", { name: /scratch/i }) as HTMLInputElement[];
      const hdcps = screen.getAllByRole("radio", { name: /handicap/i }) as HTMLInputElement[];
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // games[0,1]: div hdcp for, games[2]: Pot Game
      expect(games).toHaveLength(3);
      // scratchs[0] - pots, scratchs[1] - brkts, scratchs[2] - elims
      expect(scratchs).toHaveLength(3);      
      // hdcps[0] - pots, hdcps[1] - brkts, hdcps[2] - elims
      expect(hdcps).toHaveLength(3);      
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      await user.click(fees[2]);
      await user.type(fees[2], "10");
      // await user.click(games[2]);
      // await user.click(scratchs[0]);      
      await user.click(addBtn);      
      const potTypeError = await screen.findByTestId('dangerPotType');    
      expect(potTypeError).toHaveTextContent("Pot Type is required");
      const divError = await screen.findByTestId('dangerDiv');    
      expect(divError).toHaveTextContent("Division is required");
      await user.click(games[2]);
      expect(potTypeError).toHaveTextContent("");
      expect(divError).toHaveTextContent("Division is required");
      await user.click(scratchs[0]);  
      expect(divError).toHaveTextContent("");
    });
    it('render multiple errors', async () => { 
      const testTmnt = structuredClone(tmntProps)
      testTmnt.curData.pots[0].fee = '0';
      testTmnt.curData.pots[1].fee = '1234567';

      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={testTmnt} /></ReduxProvider>)

      const saveBtn = await screen.findByRole('button', { name: /save tournament/i });      
      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      // fees[0,1] - events, fees[2-4] - pots, fees[5-9] - brkts, fees[10-14] - elims      
      expect(fees).toHaveLength(15);
      expect(fees[3]).toHaveValue('$0.00');
      expect(fees[4]).toHaveValue('$1,234,567.00');
      const gameScratchTab = await screen.findByRole("tab", { name: "Game - Scratch" }) as HTMLInputElement;            
      await user.click(gameScratchTab);
      await user.click(saveBtn)
      
      const scratchFeeError = await screen.findByTestId('dangerPotFee' + testTmnt.curData.pots[0].id);
      expect(scratchFeeError).toHaveTextContent("Fee cannot be less than");
      const hdcpFeeError = await screen.findByTestId('dangerPotFee' + testTmnt.curData.pots[1].id);
      expect(hdcpFeeError).toHaveTextContent("Fee cannot be more than");
      expect(acdns[0]).toHaveTextContent("Fee cannot be less than");
      expect(gameScratchTab).toHaveClass('objError')

      await user.clear(fees[3]);
      await user.type(fees[3], "20");
      expect(scratchFeeError).toHaveTextContent("");
      expect(acdns[0]).toHaveTextContent("Fee cannot be more than");      
    })
  })
  
  describe('render and click the delete button', () => { 
    it('render the and click the delete button', async () => {
      const user = userEvent.setup();
      render(<ReduxProvider><TmntDataForm tmntProps={tmntProps} /></ReduxProvider>)

      const acdns = await screen.findAllByRole("button", { name: /pots/i });
      await user.click(acdns[0]);
      const gameScratchTab = await screen.findByRole("tab", { name: "Game - Scratch" }) as HTMLInputElement;      
      await user.click(gameScratchTab)
      const deleteBtns = await screen.findAllByRole('button', { name: /delete pot/i }) as HTMLElement[];
      expect(deleteBtns).toHaveLength(2);
      await user.click(deleteBtns[0]);
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();              
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();              
    })
  })

});
