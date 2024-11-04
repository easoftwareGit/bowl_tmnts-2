import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNPots from "@/app/dataEntry/tmntForm/zeroToNPots";
import { mockPots, mockDivs, mockSquads } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getDivName } from "@/lib/getName";
import { potType } from "@/lib/types/types";

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
}

describe("ZeroToNPots - Component", () => { 

  describe("render the component", () => {

    describe("render the Create Pot tab", () => {
      it("render Pot Type Radio label", () => {
        // ARRANGE        
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        // ACT        
        const potTypeLabels = screen.getAllByText(/pot type/i);        
        // ASSERT        
        expect(potTypeLabels).toHaveLength(mockPots.length + 1); // + 1 for create pot
      })
      it('render the "Game" radio button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const gameRadio = screen.getByRole('radio', { name: "Game" }) as HTMLInputElement;
        expect(gameRadio).toBeInTheDocument();
        expect(gameRadio).not.toBeChecked();
      })
      it('render the "Last Game" radio button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const lastRadio = screen.getByRole('radio', { name: /last game/i }) as HTMLInputElement;
        expect(lastRadio).toBeInTheDocument();
        expect(lastRadio).not.toBeChecked();
      })
      it('render the "Series" radio button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const seriesRadio = screen.getByRole('radio', { name: /series/i }) as HTMLInputElement;
        expect(seriesRadio).toBeInTheDocument();
        expect(seriesRadio).not.toBeChecked();
      })
      it('DO NOT render the Pot Type errors', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const potTypeError = screen.queryByTestId("dangerPotType");
        expect(potTypeError).toHaveTextContent("");
      })
      it('render the Division Radio label', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const divLabels = screen.getAllByText(/division/i)
        expect(divLabels).toHaveLength(mockPots.length + 1);
      })
      it('render the "Sratch" radio button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).not.toBeChecked();        
      })
      it('render the "HDCP" radio button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);                       
        const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).not.toBeChecked();
      })
      it('DO NOT render the Division errors', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const divError = screen.queryByTestId("dangerDiv");
        expect(divError).toHaveTextContent("");
      })
      it('render the "Fee" labels', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const feeLabels = screen.getAllByLabelText("Fee");
        expect(feeLabels).toHaveLength(mockPots.length + 1);
      })
      it('render the "Fee" values', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(mockPots.length + 1);
        expect(fees[0]).toHaveValue('')
      })
      it('DO NOT render the "Fee" errors', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const feeError = screen.queryByTestId("dangerPotFee");        
        expect(feeError).toHaveTextContent("");
      })
      it('render the "Add Pot" button', () => {
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);
        const addBtn = screen.getByRole("button", { name: /add pot/i });
        expect(addBtn).toBeInTheDocument();
      })
      it('render the tabs', async () => {         
        const user = userEvent.setup()
        render(<ZeroToNPots {...mockZeroToNPotsProps} />);        
        const tabs = screen.getAllByRole("tab");        
        expect(tabs).toHaveLength(mockPots.length + 1);
        await user.click(tabs[0]);
        
        expect(tabs[0]).toHaveTextContent('Create Pot');
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveTextContent(mockPots[0].pot_type + ' - ' + getDivName(mockPots[0].div_id, mockDivs));
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveTextContent(mockPots[1].pot_type + ' - ' + getDivName(mockPots[1].div_id, mockDivs));
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveTextContent(mockPots[2].pot_type + ' - ' + getDivName(mockPots[2].div_id, mockDivs));
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveTextContent(mockPots[3].pot_type + ' - ' + getDivName(mockPots[3].div_id, mockDivs));
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
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
        const potFeeError = screen.queryByTestId("dangerPotFee2");        
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
        const potFeeError = screen.queryByTestId("dangerPotFee3");      
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
        const potFeeError = screen.queryByTestId("dangerPotFee4");      
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
        const potFeeError = screen.queryByTestId("dangerPotFee5");      
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
      const okBtn = await screen.findByRole('button', { name: /ok/i });
      expect(okBtn).toBeInTheDocument();
      const cancelBtn = screen.queryByRole('button', { name: /cancel/i });
      expect(cancelBtn).toBeInTheDocument();
      // ACT
      await user.click(okBtn);
      // ASSERT
      expect(mockZeroToNPotsProps.setPots).toHaveBeenCalled();            
    })
  })
})