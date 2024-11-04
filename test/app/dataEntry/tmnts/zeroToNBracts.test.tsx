import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNBrackets, { exportedForTesting, validateBrkts }  from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import { mockBrkts, mockDivs, mockSquads } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { defaultBrktGames, defaultBrktPlayers } from "@/lib/db/initVals";
import { getDivName } from "@/lib/getName";
import { brktType, divType, squadType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";
import { maxGames } from "@/lib/validation";
import { minFeeText } from "@/components/currency/eaCurrencyInput";
const { validateBrkt } = exportedForTesting;

const mockSetBrkts = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockZeroToNBrktsProps = {
  brkts: mockBrkts, 
  setBrkts: mockSetBrkts,
  divs: mockDivs,
  squads: mockSquads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
}

describe("ZeroToNBrackets - Component", () => {
  
  describe("render the component", () => {
    
    describe('render the Create Bracket tab', () => { 
      it('render "Division" labels', () => {
        // ARRANGE        
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT                
        const brktLabels = screen.getAllByText(/division/i);
        // ASSERT
        expect(brktLabels).toHaveLength(mockBrkts.length + 1); // + 1 for create bracket
      })
      it('render the "Scratch" radio button', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).not.toBeChecked();        
      })
      it('render the "Hdcp" radio button', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).not.toBeChecked();        
      })
      it('render the "Fee" labels', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const feeLabels = screen.getAllByText(/fee/i);
        expect(feeLabels).toHaveLength(mockBrkts.length + 1); // + 1 for create bracket
      })
      it('render the "Fee" input', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(fees).toHaveLength(mockBrkts.length + 1); 
        expect(fees[0]).toHaveValue('');
      })
      it('DO NOT render the create bracket fee error', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktFeeError = screen.queryByTestId("dangerCreateBrktFee");
        expect(brktFeeError).toHaveTextContent("");
      })
      it('render the "Start" labels', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const startLabels = screen.getAllByText(/start/i);
        expect(startLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the create bracket "Start" input', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];        
        expect(startInputs).toHaveLength(mockBrkts.length + 1);
        expect(startInputs[0]).toHaveValue(1);
      })
      it('DO NOT render the create bracket "Start" error', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktStartError = screen.queryByTestId("dangerCreateBrktStart");
        expect(brktStartError).toHaveTextContent("");
      })
      it('render the "Games" labels', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const gamesLabels = screen.getAllByText("Games");
        expect(gamesLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the "Games" input', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />); 
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(mockBrkts.length + 1);
        expect(gamesInputs[0]).toHaveValue(defaultBrktGames);
        expect(gamesInputs[0]).toBeDisabled();
      })
      it('render the "Players" labels', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktPlayersLabels = screen.getAllByText(/players/i);
        expect(brktPlayersLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the "Players" input', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const brktPlayersInputs = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];        
        expect(brktPlayersInputs).toHaveLength(mockBrkts.length + 1);
        expect(brktPlayersInputs[0]).toHaveValue(defaultBrktPlayers)
        expect(brktPlayersInputs[0]).toBeDisabled();
      })
      it('render the "Add Bracket" button', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const addBtn = screen.getByRole("button", { name: /add bracket/i });
        expect(addBtn).toBeInTheDocument();
      })
      it('render the bracket "First" labels', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktFirstLabels = screen.getAllByText("First");
        expect(brktFirstLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the bracket "First" input', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const brktFirstInputs = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];
        expect(brktFirstInputs).toHaveLength(mockBrkts.length + 1);
        expect(brktFirstInputs[0]).toBeDisabled();
        expect(brktFirstInputs[0]).toHaveValue("");        
      })
      it('render the bracket "Second" labels', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktSecondLabels = screen.getAllByText("Second");
        expect(brktSecondLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the bracket "Second" input', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const brktSecondInputs = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];        
        expect(brktSecondInputs).toHaveLength(mockBrkts.length + 1);
        expect(brktSecondInputs[0]).toBeDisabled();
        expect(brktSecondInputs[0]).toHaveValue("");
      })
      it('render the bracket "Admin" label', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktAdminLabels = screen.getAllByText("Admin");
        expect(brktAdminLabels).toHaveLength(mockBrkts.length + 1);
      })
      it('render the bracket "Admin" input', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const brktAdminInputs = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];        
        expect(brktAdminInputs).toHaveLength(mockBrkts.length + 1);
        expect(brktAdminInputs[0]).toBeDisabled();
        expect(brktAdminInputs[0]).toHaveValue("");
      })
      it('render the bracket "FSA" labels', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const brktFSAs = screen.getAllByLabelText(/F\+S\+A/i);
        expect(brktFSAs).toHaveLength(mockBrkts.length + 1);
      })
      it('render "FSA" titles', () => {
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const fsaTitles = screen.getAllByTitle("First + Second + Admin must equal Fee * Players");
        expect(fsaTitles).toHaveLength(mockBrkts.length + 1);
        expect(fsaTitles[0]).toHaveTextContent("?");
      });
      it('render "FSA" input', () => { 
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);        
        const fsaInputs = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];        
        expect(fsaInputs).toHaveLength(mockBrkts.length + 1);
        expect(fsaInputs[0]).toBeDisabled();
        expect(fsaInputs[0]).toHaveValue("");        
      })
      it('render the tabs', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(mockBrkts.length + 1);
        await user.click(tabs[0]);
        expect(tabs[0]).toHaveTextContent('Create Bracket');
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveTextContent('Scratch: 1-3');
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveTextContent('Scratch: 4-6');
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveTextContent('Hdcp: 1-3');
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveTextContent('Hdcp: 4-6');
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })
    })

    describe('render the "Scratch 1-3" bracket', () => { 
      it('render the "Scratch 1-3" bracket', async () => { 
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockBrkts.length + 1);
        // ARRANGE
        await user.click(tabs[1]);
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })
      it('render the Division value', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];        
        expect(divInputs).toHaveLength(mockBrkts.length);
        const divName = getDivName(mockBrkts[1].div_id, mockDivs);
        expect(divInputs[0]).toHaveValue(divName);
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(feeInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];                
        expect(startInputs[1]).toHaveValue(mockBrkts[0].start);
        expect(startInputs[1]).toBeDisabled();
      })
      it('render the Games input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];        
        expect(gamesInputs[1]).toHaveValue(mockBrkts[0].games);
        expect(gamesInputs[1]).toBeDisabled();
      })
      it('render the Players input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const playersInputs = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];                
        expect(playersInputs[1]).toHaveValue(mockBrkts[0].players);
        expect(playersInputs[1]).toBeDisabled();
      })
      it('input the First input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const firstInputs = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];        
        expect(firstInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].first, localConfig));        
        expect(firstInputs[1]).toBeDisabled();
      })
      it('input the Second input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const secondInputs = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];                
        expect(secondInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].second, localConfig));
        expect(secondInputs[1]).toBeDisabled();
      })
      it('input the Admin input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const adminInputs = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];                
        expect(adminInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].admin, localConfig));
        expect(adminInputs[1]).toBeDisabled();
      })
      it('render the FSA input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const fsaInputs = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];                
        expect(fsaInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[0].fsa, localConfig));
        expect(fsaInputs[1]).toBeDisabled();
      })
      it('render the Delete Bracket button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const delBtns = screen.getAllByRole("button", { name: /delete bracket/i });        
        expect(delBtns).toHaveLength(mockBrkts.length) // add button shown in Create Bracket tab
      })
    })

    describe('render the "Scratch 4-6" bracket', () => { 
      it('render the "Scratch 4-6" bracket', async () => { 
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockBrkts.length + 1);
        // ARRANGE
        await user.click(tabs[2]);
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "true");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })
      it('render the Division input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        const divName = getDivName(mockBrkts[1].div_id, mockDivs);
        expect(divInputs[1]).toHaveValue(divName);        
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];                
        expect(feeInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];                
        expect(startInputs[2]).toHaveValue(mockBrkts[1].start);
        expect(startInputs[2]).toBeDisabled();
      })
      it('render the Games input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];        
        expect(gamesInputs[2]).toHaveValue(mockBrkts[1].games);
        expect(gamesInputs[2]).toBeDisabled();
      })
      it('render the Players input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const playersInputs = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];                
        expect(playersInputs[2]).toHaveValue(mockBrkts[1].players);
        expect(playersInputs[2]).toBeDisabled();
      })
      it('input the First input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const firstInputs = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];        
        expect(firstInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].first, localConfig));        
        expect(firstInputs[2]).toBeDisabled();
      })
      it('input the Second input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const secondInputs = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];                
        expect(secondInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].second, localConfig));
        expect(secondInputs[2]).toBeDisabled();
      })
      it('input the Admin input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const adminInputs = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];                
        expect(adminInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].admin, localConfig));
        expect(adminInputs[2]).toBeDisabled();
      })
      it('render the FSA input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const fsaInputs = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];                
        expect(fsaInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[1].fsa, localConfig));
        expect(fsaInputs[2]).toBeDisabled();
      })
    })

    describe('render the "Hdcp 1-3" bracket', () => { 
      it('render the "Scratch 1-3" bracket', async () => { 
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockBrkts.length + 1);
        // ARRANGE
        await user.click(tabs[3]);
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "true");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })
      it('render the Division input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        const divName = getDivName(mockBrkts[2].div_id, mockDivs);
        expect(divInputs[2]).toHaveValue(divName);        
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);        
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];                
        expect(feeInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];                
        expect(startInputs[3]).toHaveValue(mockBrkts[2].start);
        expect(startInputs[3]).toBeDisabled();
      })
      it('render the Games input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];        
        expect(gamesInputs[3]).toHaveValue(mockBrkts[2].games);
        expect(gamesInputs[3]).toBeDisabled();
      })
      it('render the Players input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const playersInputs = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];                
        expect(playersInputs[3]).toHaveValue(mockBrkts[2].players);
        expect(playersInputs[3]).toBeDisabled();
      })
      it('input the First input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const firstInputs = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];        
        expect(firstInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].first, localConfig));        
        expect(firstInputs[3]).toBeDisabled();
      })
      it('input the Second input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const secondInputs = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];                
        expect(secondInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].second, localConfig));
        expect(secondInputs[3]).toBeDisabled();
      })
      it('input the Admin input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const adminInputs = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];                
        expect(adminInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].admin, localConfig));
        expect(adminInputs[3]).toBeDisabled();
      })
      it('render the FSA input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const fsaInputs = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];                
        expect(fsaInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[2].fsa, localConfig));
        expect(fsaInputs[3]).toBeDisabled();
      })
    })

    describe('render the "Hdcp 4-6" bracket', () => { 
      it('render the "Scratch 4-6" bracket', async () => { 
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockBrkts.length + 1);
        // ARRANGE
        await user.click(tabs[4]);
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "true");
      })
      it('render the Division input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];                
        const divName = getDivName(mockBrkts[3].div_id, mockDivs);
        expect(divInputs[3]).toHaveValue(divName);        
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];                
        expect(feeInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];                
        expect(startInputs[4]).toHaveValue(mockBrkts[3].start);
        expect(startInputs[4]).toBeDisabled();
      })
      it('render the Games input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];        
        expect(gamesInputs[4]).toHaveValue(mockBrkts[3].games);
        expect(gamesInputs[4]).toBeDisabled();
      })
      it('render the Players input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const playersInputs = screen.getAllByRole('spinbutton', { name: /players/i }) as HTMLInputElement[];                
        expect(playersInputs[4]).toHaveValue(mockBrkts[3].players);
        expect(playersInputs[4]).toBeDisabled();
      })
      it('input the First input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const firstInputs = screen.getAllByRole('textbox', { name: /first/i }) as HTMLInputElement[];        
        expect(firstInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].first, localConfig));        
        expect(firstInputs[4]).toBeDisabled();
      })
      it('input the Second input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);        
        const secondInputs = screen.getAllByRole('textbox', { name: /second/i }) as HTMLInputElement[];                
        expect(secondInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].second, localConfig));
        expect(secondInputs[4]).toBeDisabled();
      })
      it('input the Admin input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const adminInputs = screen.getAllByRole('textbox', { name: /admin/i }) as HTMLInputElement[];                
        expect(adminInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].admin, localConfig));
        expect(adminInputs[4]).toBeDisabled();
      })
      it('render the FSA input', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const fsaInputs = screen.getAllByRole('textbox', { name: /F\+S\+A/i }) as HTMLInputElement[];                
        expect(fsaInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockBrkts[3].fsa, localConfig));
        expect(fsaInputs[4]).toBeDisabled();
      })
    })

    describe('render radio buttons, buttons in group have the same name', () => { 
      it("pot type radio buttons have the same name", () => {
        // const user = userEvent.setup()
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(scratchRadio).toHaveAttribute('name', 'brktsDivRadio');
        expect(hdcpRadio).toHaveAttribute('name', 'brktsDivRadio');
      })  
    })

    describe('render the create bracket with errors', () => { 
      it('render errors', async () => { 
        // ARRANGE
        const user = userEvent.setup();
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT      
        const divError = screen.queryByTestId("dangerBrktDivRadio");      
        const feeError = screen.queryByTestId("dangerCreateBrktFee");
        const startError = screen.queryByTestId("dangerCreateBrktStart");
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];        
        const createStartInput = startInputs[0];        
        const addBtn = screen.getByRole('button', { name: /add bracket/i });
        await user.clear(createStartInput);
        await user.type(createStartInput, '5');
        await user.click(addBtn);                        
        // ASSERT      
        expect(divError).toHaveTextContent('Division is required');
        expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
        expect(startError).toHaveTextContent('Start cannot be more than 1');
      })
      it('render errors, then clear errors', async () => { 
        // ARRANGE
        const user = userEvent.setup();
        render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
        // ACT      
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        const divError = screen.queryByTestId("dangerBrktDivRadio");      
        const feeError = screen.queryByTestId("dangerCreateBrktFee");
        const startError = screen.queryByTestId("dangerCreateBrktStart");
        const createFeeInput = fees[0];
        const createStartInput = startInputs[0];        
        const addBtn = screen.getByRole('button', { name: /add bracket/i });
        await user.clear(createStartInput);
        await user.type(createStartInput, '5');
        await user.click(addBtn);                        
        // ASSERT      
        expect(divError).toHaveTextContent('Division is required');
        expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
        expect(startError).toHaveTextContent('Start cannot be more than 1');
        // ACT part 2
        await user.click(scratchRadio)
        await user.clear(createFeeInput);
        await user.type(createFeeInput, '5');
        await user.clear(createStartInput);
        await user.type(createStartInput, '1');
        // ASSERT part 2
        expect(divError).toHaveTextContent('');
        expect(feeError).toHaveTextContent('');
        expect(startError).toHaveTextContent('');
      })
    })

    describe('render the "Scratch 1-3" with errors', () => { 
      it('render errors', async () => { 
        // ARRANGE
        const brktsWithErrors = [
          {
            ...mockBrkts[0],
            start: 5,
            start_err: 'Start cannot be more than 4',
            fee: '0',
            fee_err: "Fee cannot be less than " + minFeeText,
          },
          {
            ...mockBrkts[1],
          },
          {
            ...mockBrkts[2],
          },
          {
            ...mockBrkts[3],
          },
        ]
        const dataWithErrs = {
          brkts: brktsWithErrors, 
          setBrkts: mockSetBrkts,
          divs: mockDivs,
          squads: mockSquads,
          setAcdnErr: mockSetAcdnErr,
          setShowingModal: mockSetShowingModal,
        }
        dataWithErrs.brkts = brktsWithErrors;
        const user = userEvent.setup();        
        render(<ZeroToNBrackets {...dataWithErrs} />);
        // ACT              
        const feeError = screen.queryByTestId(`dangerBrktFee${brktsWithErrors[0].id}`);
        const startError = screen.queryByTestId(`dangerViewBrktStart${brktsWithErrors[0].id}`);
        // ASSERT              
        expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
        expect(startError).toHaveTextContent('Start cannot be more than 4');
      })
    })

  })

  describe('add a bracket', () => { 
    it('test if added bracket has correct title', async () => {
      // ARRANGE
      const noBrktsYet: brktType[] = [];      
      const mockNoBrktsYet = { ...mockZeroToNBrktsProps, brkts: noBrktsYet };

      const user = userEvent.setup();
      render(<ZeroToNBrackets {...mockNoBrktsYet} />);
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
      const createFeeInout = fees[0];
      const createStartInput = startInputs[0];
      const divError = screen.queryByTestId("dangerBrktDivRadio");      
      const feeError = screen.queryByTestId("dangerCreateBrktFee");
      const startError = screen.queryByTestId("dangerCreateBrktStart");
      const addBtn = screen.getByRole('button', { name: /add bracket/i });
      // ACT 
      await user.click(scratchRadio)
      await user.clear(createFeeInout);
      await user.type(createFeeInout, '3');
      await user.clear(createStartInput);
      await user.type(createStartInput, '1');
      await user.click(addBtn);

      // ASSERT
      // expect no errors
      expect(divError).toHaveTextContent('');
      expect(feeError).toHaveTextContent('');
      expect(startError).toHaveTextContent('');
      expect(mockZeroToNBrktsProps.setBrkts).toHaveBeenCalled();            
    })
  })

  describe('remove a bracket', () => {
    it('delete bracket', async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<ZeroToNBrackets {...mockZeroToNBrktsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[5]);
      const delBtns = screen.getAllByText("Delete Bracket");
      // ASSERT
      expect(delBtns.length).toBe(4);
      // ACT
      await user.click(delBtns[3]);
      // ASSERT
      // get the buttons in the modal dialog      
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();
      // ACT
      await user.click(okBtn);
      // ASSERT
      expect(mockZeroToNBrktsProps.setBrkts).toHaveBeenCalled();                    
    })      
  })

  describe('validateBrkt()', () => { 

    it('validate a bracket with empty brackets array', () => { 
      const vBrkt = validateBrkt(mockBrkts[0], [], 4);
      expect(vBrkt.div_err).toBe("");
      expect(vBrkt.start_err).toBe("");
      expect(vBrkt.fee_err).toBe("");
    })
    it('validate a bracket with populated brackets array', () => { 
      const validBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        start: 2
      };
      const vBrkt = validateBrkt(validBrkt, mockBrkts, 4);
      expect(vBrkt.div_err).toBe("");
      expect(vBrkt.start_err).toBe("");
      expect(vBrkt.fee_err).toBe("");
    })
    it('should not validate a brkt with no division', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.div_id = "";
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.div_err).not.toBe("");
    })
    it('should not validate a brkt with start game too low', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.start = 0;
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");
    })
    it('should not validate a brkt with start game too high', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };
      invalidBrkt.start = 5; // more than max games, last param in validateBrkt
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");
    })
    it('should not validate a brkt with no fee', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee as not a number', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "abc",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee too low', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "0",
      };      
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a brkt with fee too high', () => { 
      const invalidBrkt = {
        ...mockBrkts[0],
        id: btDbUuid('brk'),
        fee: "123456789",
      };            
      const vBrkt = validateBrkt(invalidBrkt, mockBrkts, 4);
      expect(vBrkt.fee_err).not.toBe("");
    })
    it('should not validate a duplicate brkt', () => { 
      const duplicateBrkt ={
        ...mockBrkts[0],
        id: btDbUuid('brk'),
      };      
      const vBrkt = validateBrkt(duplicateBrkt, mockBrkts, 4);
      expect(vBrkt.start_err).not.toBe("");      
    })
  })

  describe('validateBrkts()', () => { 
    it('should validate brackets', () => { 
      const isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(true);
    })
    it('should validate empty brackets', () => { 
      const isValid = validateBrkts([] as brktType[], mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(true);
    })
    it('should not validate brackts with null params', () => {
      let isValid = validateBrkts(null as any, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, null as any, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, null as any, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, null as any, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, mockDivs, 6, null as any);
      expect(isValid).toBe(false);
    })
    it('should not validate brackts with empty divs', () => {
      let isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })
    it('should not validate brackts with invalid maxStartGame', () => {
      let isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], 0, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], maxGames + 1, mockSetAcdnErr);
      expect(isValid).toBe(false);
      isValid = validateBrkts(mockBrkts, mockSetBrkts, [] as divType[], 'abc' as any, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })
    it('should not validate duplicate brackts', () => { 
      const duplicateBrkts = [
        {
          ...mockBrkts[0],
        }, 
        {
          ...mockBrkts[1],
        },
        {
          ...mockBrkts[0],
          id: btDbUuid('brk'),
        }      
      ] 
      const isValid = validateBrkts(duplicateBrkts, mockSetBrkts, mockDivs, 6, mockSetAcdnErr);
      expect(isValid).toBe(false);
    })

  })
})