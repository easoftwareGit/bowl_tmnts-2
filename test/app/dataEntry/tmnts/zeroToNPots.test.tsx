import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNPots from "@/app/dataEntry/tmntForm/zeroToNPots";
import styles from "@/app/dataEntry/tmntForm/tmntForm.module.css";
import { mockPots, mockDivs, mockSquads } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getDivName } from "@/lib/getName";
import { potType, tmntActions } from "@/lib/types/types";
import { cloneDeep } from "lodash";

const mockSetPots = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockZeroToNPotsProps = {
  pots: mockPots, 
  setPots: mockSetPots,
  divs: mockDivs,
  squads: mockSquads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
  tmntAction: tmntActions.New,
}

describe("ZeroToNPots - Component", () => { 

  describe("render the component", () => {

    describe("render the Create Pot tab - no pots exist", () => {
      const noPots: potType[] = [];
      const mockNoPots = cloneDeep(mockZeroToNPotsProps);
      mockNoPots.pots = noPots;
      it('render the "Create Pots" tab', async () => {        
        // ARRANGE        
        render(<ZeroToNPots {...mockNoPots} />);        
        // ACT        
        const tabs = screen.getAllByRole("tab");        
        // ASSERT     
        expect(tabs).toHaveLength(noPots.length + 1);  //  + 1 for create pot tab
        expect(tabs[0]).toHaveTextContent("Create Pot");
      })
      it('render the "Create Pot tab screen with the correct background color"', async () => {
        render(<ZeroToNPots {...mockNoPots} />); 

        const wrapper = screen.getByTestId("createPotContainer");

        expect(wrapper).toHaveClass("container");
        expect(wrapper).toHaveClass("rounded-3");
        expect(wrapper).toHaveClass(styles.createBackground);
      })
      it("render Pot Type Radio label", () => {        
        render(<ZeroToNPots {...mockNoPots} />);        
        const potTypeLabels = screen.getAllByText(/pot type/i, { selector: "label" });                
        expect(potTypeLabels).toHaveLength(noPots.length + 1); // + 1 for create pot
      })
      it('render the "Game" radio button', () => {
        render(<ZeroToNPots {...mockNoPots} />);        
        const gameRadio = screen.getByRole('radio', { name: "Game" }) as HTMLInputElement;
        expect(gameRadio).toBeInTheDocument();
        expect(gameRadio).not.toBeChecked();
      })
      it('render the "Last Game" radio button', () => {
        render(<ZeroToNPots {...mockNoPots} />);        
        const lastRadio = screen.getByRole('radio', { name: /last game/i }) as HTMLInputElement;
        expect(lastRadio).toBeInTheDocument();
        expect(lastRadio).not.toBeChecked();
      })
      it('render the "Series" radio button', () => {
        render(<ZeroToNPots {...mockNoPots} />);        
        const seriesRadio = screen.getByRole('radio', { name: /series/i }) as HTMLInputElement;
        expect(seriesRadio).toBeInTheDocument();
        expect(seriesRadio).not.toBeChecked();
      })
      it('render the Pot Type error', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const potTypeError = screen.queryByTestId("dangerPotType");
        expect(potTypeError).toHaveTextContent("");
      })
      it('render the Division Radio label', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const divLabels = screen.getAllByText(/division/i, { selector: "label" });
        expect(divLabels).toHaveLength(noPots.length + 1); // + 1 for create pot
      })
      it('render the "Sratch" radio button', () => {
        render(<ZeroToNPots {...mockNoPots} />);        
        const scratchRadio = screen.queryByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).toBeInTheDocument();
      })
      it('render the "HDCP" radio button', () => {
        render(<ZeroToNPots {...mockNoPots} />);                       
        const hdcpRadio = screen.queryByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).toBeInTheDocument();
      })
      it('render the Division error', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const divError = screen.queryByTestId("dangerDiv");
        expect(divError).toBeInTheDocument();
      })
      it('render the "Fee" labels', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const feeLabels = screen.getAllByText(/fee/i, { selector: "label" });
        expect(feeLabels).toHaveLength(noPots.length + 1); // + 1 for create pot
      })
      it('render the "Fee" values', () => {
        render(<ZeroToNPots {...mockNoPots} />);        
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(noPots.length + 1); // no create pot fee input        
      })
      it('render the "Fee" error', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const feeError = screen.queryByTestId("dangerPotFee");        
        expect(feeError).toBeInTheDocument();
      })
      it('render the "Add Pot" button', () => {
        render(<ZeroToNPots {...mockNoPots} />);
        const addBtn = screen.queryByRole("button", { name: /add pot/i });
        expect(addBtn).toBeInTheDocument();
      })
    });

    describe('render the 1st pot', () => { 
      it('render the "Game - Scratch" pot', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockPots.length + 1);
        // ARRANGE
        await user.click(tabs[1]);

        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })    
      it('render the pot type value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        expect(potTypeValues[0]).toHaveValue(mockPots[0].pot_type);
        expect(potTypeValues[0]).toBeDisabled();
      })
      it('render the division value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);        
        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(mockPots.length);
        expect(divValues[0]).toHaveValue(getDivName(mockPots[0].div_id, mockDivs));
        expect(divValues[0]).toBeDisabled();
      })
      it('render the pot fee value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const potFeeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(potFeeValues[1]).toHaveValue(formatValueSymbSep2Dec(mockPots[0].fee, localConfig));
      })
      it('DO NOT render the pot fee error', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const potFeeError = screen.queryByTestId(`dangerPotFee${mockPots[0].id}`);
        expect(potFeeError).toHaveTextContent("");
      })
      it('render the "Delete Pot" button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);   
        const delBtns = screen.getAllByRole("button", { name: /delete pot/i });
        expect(delBtns).toHaveLength(mockPots.length); // add button shown in Create Pot tab
      })
    })

    describe('render the 2nd pot', () => { 
      beforeAll(() => {
        mockPots[1].fee_err = 'test fee error';
      })
      afterAll(() => {
        mockPots[1].fee_err = '';
      })
      it('render the "Game - Scratch" pot', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockPots.length + 1);
        // ARRANGE
        await user.click(tabs[2]);

        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "true");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })    
      it('render the pot type value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        expect(potTypeValues[1]).toHaveValue(mockPots[1].pot_type);
        expect(potTypeValues[1]).toBeDisabled();
      })
      it('render the division value', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(mockPots.length);
        expect(divValues[1]).toHaveValue(getDivName(mockPots[1].div_id, mockDivs));
        expect(divValues[1]).toBeDisabled();
      })
      it('render the pot fee value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const potFeeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(potFeeValues[2]).toHaveValue(formatValueSymbSep2Dec(mockPots[1].fee, localConfig)); 
      })
      it('render the pot fee error', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const potFeeError = screen.queryByTestId(`dangerPotFee${mockPots[1].id}`);
        expect(potFeeError).toHaveTextContent('test fee error');
      })
      it('render the "Delete Pot" button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);   
        const delBtns = screen.getAllByRole("button", { name: /delete pot/i });
        expect(delBtns).toHaveLength(mockPots.length); // add button shown in Create Pot tab
      })
    })

    describe('render the 3rd pot', () => { 
      it('render the "Game - Scratch" pot', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(5);
        // ARRANGE
        await user.click(tabs[3]);

        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "true");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })    
      it('render the pot type value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        expect(potTypeValues[2]).toHaveValue(mockPots[2].pot_type);
        expect(potTypeValues[2]).toBeDisabled();
      })
      it('render the division value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(mockPots.length);
        expect(divValues[2]).toHaveValue(getDivName(mockPots[2].div_id, mockDivs));
        expect(divValues[2]).toBeDisabled();
      })
      it('render the pot fee value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const potFeeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(potFeeValues[3]).toHaveValue(formatValueSymbSep2Dec(mockPots[2].fee, localConfig)); 
      })
      it('DO NOT render the pot fee error', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const potFeeError = screen.queryByTestId(`dangerPotFee${mockPots[2].id}`);
        expect(potFeeError).toHaveTextContent("");
      })
      it('render the "Delete Pot" button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);   
        const delBtns = screen.getAllByRole("button", { name: /delete pot/i });
        expect(delBtns).toHaveLength(mockPots.length); // add button shown in Create Pot tab
      })
    })

    describe('render the 4th pot', () => { 
      it('render the "Game - Scratch" pot', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(5);
        // ARRANGE
        await user.click(tabs[4]);

        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "true");
      })    
      it('render the pot type value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        expect(potTypeValues[3]).toHaveValue(mockPots[3].pot_type);
        expect(potTypeValues[3]).toBeDisabled();
      })
      it('render the division value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(mockPots.length);
        expect(divValues[3]).toHaveValue(getDivName(mockPots[3].div_id, mockDivs));
        expect(divValues[3]).toBeDisabled();
      })
      it('render the pot fee value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const potFeeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
        expect(potFeeValues[4]).toHaveValue(formatValueSymbSep2Dec(mockPots[3].fee, localConfig)); 
      })
      it('DO NOT render the pot fee error', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const potFeeError = screen.queryByTestId(`dangerPotFee${mockPots[3].id}`);
        expect(potFeeError).toHaveTextContent("");
      })
      it('render the "Delete Pot" button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);   
        const delBtns = screen.getAllByRole("button", { name: /delete pot/i });
        expect(delBtns).toHaveLength(mockPots.length); // add button shown in Create Pot tab
      })
    })

    describe('render Pots when tmntAction === Run', () => { 
      const runTmntProps = cloneDeep(mockZeroToNPotsProps);
      runTmntProps.tmntAction = tmntActions.Run;
      it('render the pot type value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]);        
        const potTypeValues = screen.getAllByRole('textbox', { name: /pot type/i }) as HTMLInputElement[];
        expect(potTypeValues).toHaveLength(mockPots.length);        
        for (let i = 0; i < mockPots.length; i++) {
          expect(potTypeValues[i]).toBeDisabled();
        }        
      })
      it('render the division value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]);
        const divValues = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divValues).toHaveLength(mockPots.length);        
        for (let i = 0; i < mockPots.length; i++) {
          expect(divValues[i]).toBeDisabled();  
        }        
      })
      it('render the pot fee value', async () => { 
        const user = userEvent.setup()
        render(<ZeroToNPots {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]);
        const potFeeValues = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];                
        expect(potFeeValues).toHaveLength(mockPots.length);
        for (let i = 0; i < mockPots.length; i++) {
          expect(potFeeValues[i]).toBeDisabled();
        }        
      })
      it('render the "Delete Pot" button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNPots {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[0]);   
        const delBtns = screen.getAllByRole("button", { name: /delete pot/i });
        expect(delBtns).toHaveLength(mockPots.length); // add button shown in Create Pot tab
        for (let i = 0; i < mockPots.length; i++) {
          expect(delBtns[i]).toBeDisabled();
        }        
      })
    })

    describe('DO NOT render Create Pots tab when tmntAction === Run', () => { 
      const runTmntProps = cloneDeep(mockZeroToNPotsProps);
      runTmntProps.tmntAction = tmntActions.Run;
      it('DO NOT render the "Create Pots" tab', async () => {        
        render(<ZeroToNPots {...runTmntProps} />);        
        const tabs = screen.getAllByRole("tab");        
        expect(tabs).toHaveLength(mockPots.length);  // no create pot tab

        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");                

        expect(tabs[0]).not.toHaveTextContent(/create pot/i);
        expect(tabs[1]).not.toHaveTextContent(/create pot/i);
        expect(tabs[2]).not.toHaveTextContent(/create pot/i);
        expect(tabs[3]).not.toHaveTextContent(/create pot/i);
      })
      it("DO NOT render Pot Type Radio label", () => {        
        render(<ZeroToNPots {...runTmntProps} />);        
        const potTypeLabels = screen.getAllByText(/pot type/i);                
        expect(potTypeLabels).toHaveLength(mockPots.length); // no create pot label
      })
      it('DO NOT render the "Game" radio button', () => {
        render(<ZeroToNPots {...runTmntProps} />);        
        const gameRadio = screen.queryByRole('radio', { name: "Game" });
        expect(gameRadio).not.toBeInTheDocument();
      })
      it('DO NOT render the "Last Game" radio button', () => {
        render(<ZeroToNPots {...runTmntProps} />);        
        const lastRadio = screen.queryByRole('radio', { name: /last game/i }) as HTMLInputElement;
        expect(lastRadio).not.toBeInTheDocument();        
      })
      it('DO NOT render the "Series" radio button', () => {
        render(<ZeroToNPots {...runTmntProps} />);        
        const seriesRadio = screen.queryByRole('radio', { name: /series/i }) as HTMLInputElement;
        expect(seriesRadio).not.toBeInTheDocument();        
      })
      it('DO NOT render the Pot Type errors', () => {
        render(<ZeroToNPots {...runTmntProps} />);
        const potTypeError = screen.queryByTestId("dangerPotType");
        expect(potTypeError).not.toBeInTheDocument();
      })
      it('DO NOT render the Division Radio label', () => {
        render(<ZeroToNPots {...runTmntProps} />);
        const divLabels = screen.getAllByText(/division/i)
        expect(divLabels).toHaveLength(mockPots.length); // no create pot label
      })
      it('DO NOT render the "Sratch" radio button', () => {
        render(<ZeroToNPots {...runTmntProps} />);        
        const scratchRadio = screen.queryByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).not.toBeInTheDocument();
      })
      it('DO NOT render the "HDCP" radio button', () => {
        render(<ZeroToNPots {...runTmntProps} />);                       
        const hdcpRadio = screen.queryByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).not.toBeInTheDocument();
      })
      it('DO NOT render the Division errors', () => {
        render(<ZeroToNPots {...runTmntProps} />);
        const divError = screen.queryByTestId("dangerDiv");
        expect(divError).not.toBeInTheDocument();
      })
    })
        
  });

  describe('render radio buttons, buttons in group have the same name', () => { 

    it("pot type radio buttons have the same name", () => {
      // const user = userEvent.setup()
      render(<ZeroToNPots {...mockZeroToNPotsProps} />);      
      const gameRadio = screen.getByRole('radio', { name: "Game" }) as HTMLInputElement;
      const lastRadio = screen.getByRole('radio', { name: /last game/i }) as HTMLInputElement;
      const seriesRadio = screen.getByRole('radio', { name: /series/i }) as HTMLInputElement;
      expect(gameRadio).toHaveAttribute('name', 'potTypeRadio');
      expect(lastRadio).toHaveAttribute('name', 'potTypeRadio');
      expect(seriesRadio).toHaveAttribute('name', 'potTypeRadio');
    })

    it("division radio buttons have the same name", () => {
      render(<ZeroToNPots {...mockZeroToNPotsProps} />);
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
      expect(scratchRadio).toHaveAttribute('name', 'potsDivRadio');
      expect(hdcpRadio).toHaveAttribute('name', 'potsDivRadio');
    })
  })

  describe('render the create pot with errors', () => {     
    it("render Pot Type errors", async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<ZeroToNPots {...mockZeroToNPotsProps} />);
      // ACT      
      const potTypeError = screen.queryByTestId("dangerPotType"); 
      const divError = screen.queryByTestId("dangerDiv");      
      const feeError = screen.queryByTestId("dangerPotFee");
      const addBtn = screen.getByRole('button', { name: /add pot/i });
      await user.click(addBtn);                        
      // ASSERT      
      expect(potTypeError).toHaveTextContent('Pot Type is required');
      expect(divError).toHaveTextContent('Division is required');
      expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');      
    })
    it("render Pot Type errors, then clear the errors", async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<ZeroToNPots {...mockZeroToNPotsProps} />);
      // ACT            
      const gameRadio = screen.getByRole('radio', { name: "Game" }) as HTMLInputElement;            
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const potTypeError = screen.queryByTestId("dangerPotType"); 
      const divError = screen.queryByTestId("dangerDiv");      
      const feeError = screen.queryByTestId("dangerPotFee");
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const createFeeInput = fees[0];
      const addBtn = screen.getByRole('button', { name: /add pot/i });
      await user.click(addBtn);                        
      // ASSERT      
      expect(potTypeError).toHaveTextContent('Pot Type is required');
      expect(divError).toHaveTextContent('Division is required');
      expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
      // ACT part 2
      await user.click(gameRadio)
      await user.click(scratchRadio);
      await user.clear(createFeeInput);
      await user.type(createFeeInput, '20');
      // ASSERT      
      expect(potTypeError).toHaveTextContent('');
      expect(divError).toHaveTextContent('');
      expect(feeError).toHaveTextContent('');
    })
  })

  describe('add a pot', () => { 
    it('test if added pot', async () => { 
      // ARRANGE
      const notPotsYet: potType[] = [];
      const mockNoPotsYet = { ...mockZeroToNPotsProps, pots: notPotsYet }
      
      const user = userEvent.setup();
      render(<ZeroToNPots {...mockNoPotsYet} />);

      const gameRadio = screen.getByRole('radio', { name: "Game" }) as HTMLInputElement;            
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const createFeeInput = fees[0];
      const potTypeError = screen.queryByTestId("dangerPotType"); 
      const divError = screen.queryByTestId("dangerDiv");      
      const feeError = screen.queryByTestId("dangerPotFee");
      const addBtn = screen.getByRole('button', { name: /add pot/i });                 

      // ACT
      await user.click(gameRadio)
      await user.click(scratchRadio);
      await user.clear(createFeeInput);
      await user.type(createFeeInput, '10');
      await user.click(addBtn);

      // ASSERT
      // expect no errors
      expect(potTypeError).toHaveTextContent('');
      expect(divError).toHaveTextContent('');
      expect(feeError).toHaveTextContent('');
      expect(mockZeroToNPotsProps.setPots).toHaveBeenCalled();
    })
  })

  describe('remove a pot', () => {
    it('delete pot', async () => { 
      // ARRANGE
      const user = userEvent.setup();
      render(<ZeroToNPots {...mockZeroToNPotsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[5]);
      const delBtns = screen.getAllByText("Delete Pot");
      // ASSERT
      expect(delBtns.length).toBe(4);
      // ACT
      await user.click(delBtns[3]);
      // ASSERT
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(yesBtn);
      // ASSERT
      expect(mockZeroToNPotsProps.setPots).toHaveBeenCalled();            
    })
  })
})