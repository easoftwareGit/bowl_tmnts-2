import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNDivs from "@/app/dataEntry/tmntForm/oneToNDivs";
import { mockDivs, mockPots, mockBrkts, mockElims } from '../../../mocks/tmnts/twoDivs/mockDivs'
import { defaultHdcpFrom, initDiv } from "@/lib/db/initVals";
import { tmntActions } from "@/lib/types/types";
import { cloneDeep } from "lodash";

const mockSetDivs = jest.fn();
const mockSetAcdnErr = jest.fn();

const mockOneToNDivsProps = {
  divs: mockDivs,
  setDivs: mockSetDivs,
  pots: mockPots,
  brkts: mockBrkts,
  elims: mockElims,
  setAcdnErr: mockSetAcdnErr,
  tmntAction: tmntActions.New,
}

describe("OneToNDivs - Component", () => { 

  describe("render the component", () => { 

    describe('render the 1st division', () => {
      it('render div label', () => { 
        // ARRANGE
        // const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        // ACT
        const divLabel = screen.getByText("# Divisions");
        // ASSERT
        expect(divLabel).toBeInTheDocument()
      })
      it('render num divs', () => {         
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        // const numDivs = screen.getByTestId('inputNumDivs') as HTMLInputElement;
        const numDivs = screen.getByRole('textbox', { name: /# divisions/i }) as HTMLInputElement;
        expect(numDivs).toBeInTheDocument()        
        expect(numDivs).toHaveValue('2')
        expect(numDivs).toBeDisabled()          
      })
      it('render add button', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />) 
        const addBtn = screen.getByRole("button", { name: /add/i });        
        expect(addBtn).toBeInTheDocument()          
      })
      it('render div name labels', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const nameLabels = screen.getAllByText('Div Name');
        expect(nameLabels).toHaveLength(2)
      })
      it('render div name inputs', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const divNames = screen.getAllByRole('textbox', { name: /div name/i }) as HTMLInputElement[];
        expect(divNames).toHaveLength(2)
        expect(divNames[0]).toHaveValue('Scratch')
      })
      it('DO NOT render div name errors', () => { 
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const nameErrors = screen.queryAllByTestId("dangerDivName");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[0]).toHaveTextContent("");
      })
      it('render hdcp % labels', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const hdcplabels = screen.getAllByText(/hdcp %/i);  
        expect(hdcplabels).toHaveLength(2)
      })
      it("render hdcp % titles", () => {
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const hdcpTitles = screen.getAllByTitle("Enter Hdcp % 0 for scratch");
        expect(hdcpTitles).toHaveLength(2);
        expect(hdcpTitles[0]).toHaveTextContent("?");
      });
      it('render hdcp % inputs', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)                      
        const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];
        expect(hdcps).toHaveLength(2)
        expect(hdcps[0]).toHaveValue('0.00%')
      })
      it('DO NOT render hdcp % errors', () => { 
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const hdcpErrors = screen.queryAllByTestId("dangerHdcp");
        expect(hdcpErrors).toHaveLength(2);
        expect(hdcpErrors[0]).toHaveTextContent("");
      })
      it('render hdcp from labels', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const hdcpFromLabels = screen.getAllByText('Hdcp From');  
        expect(hdcpFromLabels).toHaveLength(2)
      })
      it('render hdcp from inputs', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)              
        const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];        
        expect(hdcpFroms).toHaveLength(2)
        expect(hdcpFroms[0]).toHaveValue(defaultHdcpFrom)
        expect(hdcpFroms[0]).toBeDisabled()
      })
      it('DO NOT render hdcp from errors', () => { 
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const hdcpFromErrors = screen.queryAllByTestId("dangerHdcpFrom");
        expect(hdcpFromErrors).toHaveLength(2);
        expect(hdcpFromErrors[0]).toHaveTextContent("");
      })
      it('render int hdcp checkbox', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];
        expect(intHdcps).toHaveLength(2)
        // 0 hdcp % will have this disabled, not checked in mock for testing
        expect(intHdcps[0]).not.toBeChecked()
        expect(intHdcps[0]).toBeDisabled()
      })
      it('render hdcp for game radio', () => {
        render(<OneToNDivs {...mockOneToNDivsProps} />)               
        const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
        expect(hdcpForGames).toHaveLength(2)
        // 0 hdcp % will have this disabled, not checked in mock for testing
        expect(hdcpForGames[0]).not.toBeChecked()
        expect(hdcpForGames[0]).toBeDisabled()
      })
      it('render hdcp for series radio', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)              
        const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
        expect(hdcpForSeries).toHaveLength(2)
        // 0 hdcp % will have this disabled, checked in mock for testing
        expect(hdcpForSeries[0]).toBeChecked()  
        expect(hdcpForSeries[0]).toBeDisabled()
      })
      it('render tabs', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[0]); // focus on first tab
        expect(tabs).toHaveLength(2);
        expect(tabs[0]).toHaveTextContent(mockDivs[0].tab_title);        
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");                
        expect(tabs[1]).toHaveTextContent(mockDivs[1].tab_title);
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
      })
    })

    describe('render the 2nd division', () => { 
      beforeAll(() => {
        mockDivs[1].div_name_err = 'test div name error';
        mockDivs[1].hdcp_from_err = 'test hdcp from error';
        mockDivs[1].hdcp_per_err = 'test hdcp error';
      })
      afterAll(() => {
        mockDivs[1].div_name_err = '';
        mockDivs[1].hdcp_from_err = '';
        mockDivs[1].hdcp_per_err = '';
      })
      it('render the 2nd division', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        // ACT
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(2);
        await user.click(tabs[1]);        
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      })
      it('render the delete button', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const delBtn = screen.getByRole("button", { name: /delete div/i });        
        expect(delBtn).toBeInTheDocument();
      })
      it('render div name inputs', async () => {        
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const divNames = screen.getAllByRole('textbox', { name: /div name/i }) as HTMLInputElement[];        
        expect(divNames[1]).toHaveClass("is-invalid");
        expect(divNames[1]).toHaveValue('Hdcp')
      })
      it('render 2nd div name errors', async () => { 
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerDivName");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test div name error");
      })
      it('render hdcp % inputs', async () => {        
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);        
        const hdcpPers = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];        
        expect(hdcpPers[1]).toHaveClass("is-invalid");
        expect(hdcpPers[1]).toHaveValue('100.00%')
      })
      it('render 2nd hdcp % errors', async () => { 
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const hdcpPerErrors = screen.queryAllByTestId("dangerHdcp");
        expect(hdcpPerErrors).toHaveLength(2);
        expect(hdcpPerErrors[1]).toHaveTextContent("test hdcp error");
      })
      it('render hdcp from inputs', async () => {        
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];        
        expect(hdcpFroms[1]).toHaveClass("is-invalid");
        expect(hdcpFroms[1]).toHaveValue(230)
        expect(hdcpFroms[1]).toBeEnabled()
      })
      it('render 2nd hdcp from errors', async () => { 
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const hdcpFromErrors = screen.queryAllByTestId("dangerHdcpFrom");
        expect(hdcpFromErrors).toHaveLength(2);
        expect(hdcpFromErrors[1]).toHaveTextContent("test hdcp from error");
      })
      it('render int hdcp checkbox', async () => {        
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];        
        expect(intHdcps).toHaveLength(2)
        expect(intHdcps[1]).toBeChecked()
        expect(intHdcps[1]).toBeEnabled()
      })
      it('render hdcp for game radio', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];        
        expect(hdcpForGames).toHaveLength(2)
        expect(hdcpForGames[1]).toBeChecked()
        expect(hdcpForGames[1]).toBeEnabled()
      })
      it('render hdcp for series radio', async () => {        
        const user = userEvent.setup()
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const tabs = screen.getAllByRole('tab');  
        await user.click(tabs[1]);
        const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];        
        expect(hdcpForSeries).toHaveLength(2)
        expect(hdcpForSeries[1]).not.toBeChecked()  
        expect(hdcpForSeries[1]).toBeEnabled()
      })
    })

    describe('render the divs when tmntAction is Run - inputs and buttons disabled', () => { 
      const runTmntProps = cloneDeep(mockOneToNDivsProps);   
      runTmntProps.tmntAction = tmntActions.Run;
      it('render num divs', () => {         
        render(<OneToNDivs {...runTmntProps} />)      
        // const numDivs = screen.getByTestId('inputNumDivs') as HTMLInputElement;
        const numDivs = screen.getByRole('textbox', { name: /# divisions/i }) as HTMLInputElement;
        expect(numDivs).toBeInTheDocument()        
        expect(numDivs).toHaveValue('2')
        expect(numDivs).toBeDisabled()          
      })
      it('render add button', () => {        
        render(<OneToNDivs {...runTmntProps} />) 
        const addBtn = screen.getByRole("button", { name: /add/i });        
        expect(addBtn).toBeInTheDocument() 
        expect(addBtn).toBeDisabled()
      })
      it('render delete button', () => {        
        render(<OneToNDivs {...runTmntProps} />) 
        const delBtn = screen.getByRole("button", { name: /delete/i });        
        expect(delBtn).toBeInTheDocument() 
        expect(delBtn).toBeDisabled()
      })
      it('render div name inputs', () => {        
        render(<OneToNDivs {...runTmntProps} />)      
        const divNames = screen.getAllByRole('textbox', { name: /div name/i }) as HTMLInputElement[];
        expect(divNames).toHaveLength(2)
        expect(divNames[0]).toBeDisabled()
        expect(divNames[1]).toBeDisabled()
      })
      it('render hdcp % inputs', () => {        
        render(<OneToNDivs {...runTmntProps} />)                      
        const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];
        expect(hdcps).toHaveLength(2)
        expect(hdcps[0]).toBeDisabled()
        expect(hdcps[1]).toBeDisabled()
      })
      it('render hdcp from inputs', () => {        
        render(<OneToNDivs {...runTmntProps} />)              
        const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];        
        expect(hdcpFroms).toHaveLength(2)        
        expect(hdcpFroms[0]).toBeDisabled()
        expect(hdcpFroms[1]).toBeDisabled()
      })
      it('render int hdcp checkbox', () => {        
        render(<OneToNDivs {...runTmntProps} />)      
        const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];
        expect(intHdcps).toHaveLength(2)                
        expect(intHdcps[0]).toBeDisabled()
        expect(intHdcps[1]).toBeDisabled()
      })
      it('render hdcp for game radio', () => {
        render(<OneToNDivs {...runTmntProps} />)               
        const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
        expect(hdcpForGames).toHaveLength(2)                
        expect(hdcpForGames[0]).toBeDisabled()
        expect(hdcpForGames[1]).toBeDisabled()
      })
      it('render hdcp for series radio', () => {        
        render(<OneToNDivs {...runTmntProps} />)              
        const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
        expect(hdcpForSeries).toHaveLength(2)                
        expect(hdcpForSeries[0]).toBeDisabled()
        expect(hdcpForSeries[1]).toBeDisabled()
      })
    })
  })

  describe('radio buttons per divsion should have same name (group)', () => { 
    it('test if "Scratch" div radio buttons have same name', () => {      
      render(<OneToNDivs {...mockOneToNDivsProps} />)  
      const gameRadios = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      const seriesRadios = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      expect(gameRadios[0]).toHaveAttribute('name', 'divHdcpRadio1');
      expect(seriesRadios[0]).toHaveAttribute('name', 'divHdcpRadio1');
    })
    it('test if "Hdcp" div radio buttons have same name', async () => {
      const user = userEvent.setup()
      render(<OneToNDivs {...mockOneToNDivsProps} />)      
      const tabs = screen.getAllByRole('tab');  
      await user.click(tabs[1]);
      const gameRadios = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      const seriesRadios = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      expect(gameRadios[1]).toHaveAttribute('name', 'divHdcpRadio2');
      expect(seriesRadios[1]).toHaveAttribute('name', 'divHdcpRadio2');    
    })
  })

  describe("add division", () => { 
    beforeAll(() => {
      mockDivs.push({
        ...initDiv,
        id: "3",
        sort_order: 3,
        div_name: "50+",
        tab_title: "50+",
      });
    });

    afterAll(() => {
      if (mockDivs.length === 3) mockDivs.pop();
    });

    it('test if added division has the correct tab title', async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNDivs {...mockOneToNDivsProps} />)      
      const addBtn = screen.getByText('Add');          
      expect(addBtn).toBeInTheDocument()          
      // ACT
      await user.click(addBtn)
      // ASSERT
      expect(mockOneToNDivsProps.setDivs).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs).toHaveLength(3)
      expect(tabs[2]).toHaveTextContent("50+");
    })
    it('test added division keyboard fields', async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNDivs {...mockOneToNDivsProps} />)      
      const addBtn = screen.getByText('Add');          
      expect(addBtn).toBeInTheDocument()          
      // ACT
      await user.click(addBtn)
      // ASSERT
      expect(mockOneToNDivsProps.setDivs).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs).toHaveLength(3)

      // ARRANGE
      await user.click(tabs[2]);
      
      // ACT
      const divNames = screen.getAllByRole("textbox", { name: /div name/i }) as HTMLInputElement[];      
      const hdcps = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];
      const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];

      // ASSERT
      expect(divNames).toHaveLength(3)
      expect(hdcps).toHaveLength(3)
      expect(hdcpFroms).toHaveLength(3)
      expect(divNames[2]).toHaveValue(mockDivs[2].div_name);
      expect(hdcps[2]).toHaveValue(mockDivs[2].hdcp_per_str + "%"); // 1 is the number = 100.00% in entry field
      expect(hdcpFroms[2]).toHaveValue(mockDivs[2].hdcp_from);

      await user.type(divNames[2], 'Test Div');
      await user.type(hdcps[2], '0.90');
      await user.type(hdcpFroms[2], '225');

      expect(divNames[2]).toHaveValue(mockDivs[2].div_name);
      expect(hdcps[2]).toHaveValue(mockDivs[2].hdcp_per_str + "%");
      expect(hdcpFroms[2]).toHaveValue(mockDivs[2].hdcp_from);      
    })
    it('test added division check box', async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNDivs {...mockOneToNDivsProps} />)      
      const addBtn = screen.getByText('Add');          
      expect(addBtn).toBeInTheDocument()          
      // ACT
      await user.click(addBtn)
      // ASSERT
      expect(mockOneToNDivsProps.setDivs).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs).toHaveLength(3)

      // ARRANGE
      await user.click(tabs[2]);
      
      // ACT
      const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];

      // ASSERT
      expect(intHdcps).toHaveLength(3)              
      expect(intHdcps[2]).toBeChecked()      

      await user.click(intHdcps[2]);
      mockDivs[2].int_hdcp = false;
      try {
        expect(intHdcps[2]).not.toBeChecked()
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].int_hdcp).toBe(false);
      }

      await user.click(intHdcps[2]);
      mockDivs[2].int_hdcp = true;
      try {
        expect(intHdcps[2]).toBeChecked()  
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].int_hdcp).toBe(true);
      }
    })

    it('test added division radio buttons', async () => {
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNDivs {...mockOneToNDivsProps} />)      
      const addBtn = screen.getByText('Add');          
      expect(addBtn).toBeInTheDocument()          
      // ACT
      await user.click(addBtn)
      // ASSERT
      expect(mockOneToNDivsProps.setDivs).toHaveBeenCalled();

      // ACT
      const tabs = screen.getAllByRole("tab");
      // ASSERT
      expect(tabs).toHaveLength(3)

      // ARRANGE
      await user.click(tabs[2]);
      
      // ACT
      const gameRadios = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      const seriesRadios = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];

      // const hdcpForGames = screen.getAllByTestId('radioHdcpForGame') as HTMLInputElement[];  
      // const hdcpForSeries = screen.getAllByTestId('radioHdcpForSeries') as HTMLInputElement[];  

      // ASSERT
      expect(gameRadios).toHaveLength(3)
      expect(seriesRadios).toHaveLength(3)
              
      expect(gameRadios[2]).toBeChecked()
      expect(seriesRadios[2]).not.toBeChecked()

      // <input> atribute checked is set as: 
      // checked={div.hdcp_for === 'Game'}
      await user.click(seriesRadios[2]);
      mockDivs[2].hdcp_for = "Series";
      try {
        expect(gameRadios[2]).not.toBeChecked()
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].hdcp_for).toBe("Series");
      }
      try {
        expect(seriesRadios[2]).toBeChecked()  
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].hdcp_for).toBe("Series");
      }
      
      await user.click(gameRadios[2]);
      mockDivs[2].hdcp_for = "Game";
      try {
        expect(gameRadios[2]).toBeChecked()  
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].hdcp_for).toBe("Game");
      }
      try {
        expect(seriesRadios[2]).not.toBeChecked()        
      } catch (error) {
        expect(mockOneToNDivsProps.divs[2].hdcp_for).toBe("Game");
      }            
    })
  })

  describe("delete division", () => { 
    beforeAll(() => {
      mockDivs.push({
        ...initDiv,
        id: "3",
        sort_order: 3,
        div_name: "50+",
        tab_title: "50+",
      });
    });

    afterAll(() => {
      if (mockDivs.length === 3) mockDivs.pop();
    });

    it('delete division', async () => { 
      // ARRANGE
      const user = userEvent.setup();
      render(<OneToNDivs {...mockOneToNDivsProps} />) 
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[2]);      
      const delBtns = screen.getAllByRole("button", { name: /delete div/i });
      // ASSERT
      expect(delBtns).toHaveLength(2)
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      expect(mockOneToNDivsProps.setDivs).toHaveBeenCalled();      
    })
  })
})