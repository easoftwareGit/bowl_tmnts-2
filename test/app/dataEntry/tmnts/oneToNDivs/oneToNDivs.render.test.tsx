import React, { act } from "react";
import { render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNDivs from "@/app/dataEntry/tmntForm/oneToNDivs";
import { mockDivs, mockPots, mockBrkts, mockElims } from '../../../../mocks/tmnts/twoDivs/mockDivs'
import { defaultHdcpFrom, initDiv } from "@/lib/db/initVals";
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
  isDisabled: false,
}

describe("OneToNDivs - render", () => { 

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
      it('render hdcp % label', () => {        
        render(<OneToNDivs {...mockOneToNDivsProps} />)      
        const hdcplabels = screen.getAllByText(/hdcp %/i);  
        expect(hdcplabels).toHaveLength(2)
      })
      it("render hdcp % label with space before help icon", () => {
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const hdcpTitles = screen.getAllByText(/hdcp %/i, { selector: "label" });
        expect(hdcpTitles).toHaveLength(2);

        const label = hdcpTitles[0] as HTMLLabelElement;
        const text = label.textContent ?? "";
        expect(text).toMatch(/^Hdcp %\s+\?/);
      });
      it('render hdcp % help icon with surrounding spaces', () => {
        render(<OneToNDivs {...mockOneToNDivsProps} />);
        const hdcpTitles = screen.getAllByText(/hdcp %/i, { selector: "label" });
        expect(hdcpTitles).toHaveLength(2);
        
        const label = hdcpTitles[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });
        expect(helpSpan).toBeInTheDocument();        
        expect(helpSpan).toHaveClass("popup-help");
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
      // it('render int hdcp checkbox', () => {        
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];
      //   expect(intHdcps).toHaveLength(2)
      //   // 0 hdcp % will have this disabled, not checked in mock for testing
      //   expect(intHdcps[0]).not.toBeChecked()
      //   expect(intHdcps[0]).toBeDisabled()
      // })
      // it('render hdcp for game radio', () => {
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      //   expect(hdcpForGames).toHaveLength(2)
      //   // 0 hdcp % will have this disabled, not checked in mock for testing
      //   expect(hdcpForGames[0]).not.toBeChecked()
      //   expect(hdcpForGames[0]).toBeDisabled()
      // })
      // it('render hdcp for series radio', () => {
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      //   expect(hdcpForSeries).toHaveLength(2)
      //   // 0 hdcp % will have this disabled, checked in mock for testing
      //   expect(hdcpForSeries[0]).toBeChecked()
      //   expect(hdcpForSeries[0]).toBeDisabled()
      // })
      it("uses dark button styles for Add and Delete when disabled", () => {
        const runTmntProps = cloneDeep(mockOneToNDivsProps);
        runTmntProps.isDisabled = true;

        render(<OneToNDivs {...runTmntProps} />);

        const addBtn = screen.getByRole("button", { name: /add/i });
        expect(addBtn).toHaveClass("btn-dark");

        const delBtn = screen.getByRole("button", { name: /delete div/i });
        expect(delBtn).toHaveClass("btn-dark");
      });      
    })

    describe('render the 2nd division', () => { 
      const oneToNDivsPropsWithErros = cloneDeep(mockOneToNDivsProps);
      oneToNDivsPropsWithErros.divs[1].div_name_err = 'test div name error';
      oneToNDivsPropsWithErros.divs[1].hdcp_from_err = 'test hdcp from error';
      oneToNDivsPropsWithErros.divs[1].hdcp_per_err = 'test hdcp error';

      it('render the 2nd division', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
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
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const delBtn = screen.getByRole("button", { name: /delete div/i });
        expect(delBtn).toBeInTheDocument();
      })
      it('render div name inputs', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const divNames = screen.getAllByRole('textbox', { name: /div name/i }) as HTMLInputElement[];
        expect(divNames[1]).toHaveClass("is-invalid");
        expect(divNames[1]).toHaveValue('Hdcp')
      })
      it('render 2nd div name errors', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const nameErrors = screen.queryAllByTestId("dangerDivName");
        expect(nameErrors).toHaveLength(2);
        expect(nameErrors[1]).toHaveTextContent("test div name error");
      })
      it('render hdcp % inputs', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const hdcpPers = screen.getAllByRole('textbox', { name: /hdcp %/i }) as HTMLInputElement[];
        expect(hdcpPers[1]).toHaveClass("is-invalid");
        expect(hdcpPers[1]).toHaveValue('100.00%')
      })
      it('render 2nd hdcp % errors', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const hdcpPerErrors = screen.queryAllByTestId("dangerHdcp");
        expect(hdcpPerErrors).toHaveLength(2);
        expect(hdcpPerErrors[1]).toHaveTextContent("test hdcp error");
      })
      it('render hdcp from inputs', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const hdcpFroms = screen.getAllByRole('spinbutton', { name: /hdcp from/i }) as HTMLInputElement[];
        expect(hdcpFroms[1]).toHaveClass("is-invalid");
        expect(hdcpFroms[1]).toHaveValue(230)
        expect(hdcpFroms[1]).toBeEnabled()
      })
      it('render 2nd hdcp from errors', async () => {
        const user = userEvent.setup()
        render(<OneToNDivs {...oneToNDivsPropsWithErros} />)
        const tabs = screen.getAllByRole('tab');
        await user.click(tabs[1]);
        const hdcpFromErrors = screen.queryAllByTestId("dangerHdcpFrom");
        expect(hdcpFromErrors).toHaveLength(2);
        expect(hdcpFromErrors[1]).toHaveTextContent("test hdcp from error");
      })
      // it('render int hdcp checkbox', async () => {
      //   const user = userEvent.setup()
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const tabs = screen.getAllByRole('tab');
      //   await user.click(tabs[1]);
      //   const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];
      //   expect(intHdcps).toHaveLength(2)
      //   expect(intHdcps[1]).toBeChecked()
      //   expect(intHdcps[1]).toBeEnabled()
      // })
      // it('render hdcp for game radio', async () => {
      //   const user = userEvent.setup()
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const tabs = screen.getAllByRole('tab');
      //   await user.click(tabs[1]);
      //   const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      //   expect(hdcpForGames).toHaveLength(2)
      //   expect(hdcpForGames[1]).toBeChecked()
      //   expect(hdcpForGames[1]).toBeEnabled()
      // })
      // it('render hdcp for series radio', async () => {
      //   const user = userEvent.setup()
      //   render(<OneToNDivs {...mockOneToNDivsProps} />)
      //   const tabs = screen.getAllByRole('tab');
      //   await user.click(tabs[1]);
      //   const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      //   expect(hdcpForSeries).toHaveLength(2)
      //   expect(hdcpForSeries[1]).not.toBeChecked()
      //   expect(hdcpForSeries[1]).toBeEnabled()
      // })
      it("uses dark button styles for Add and Delete when disabled", () => {
        const runTmntProps = cloneDeep(mockOneToNDivsProps);
        runTmntProps.isDisabled = true;

        render(<OneToNDivs {...runTmntProps} />);

        const addBtn = screen.getByRole("button", { name: /add/i });
        expect(addBtn).toHaveClass("btn-dark");

        const delBtn = screen.getByRole("button", { name: /delete div/i });
        expect(delBtn).toHaveClass("btn-dark");
      });
    })

    describe('render tabs for each div', () => {
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
      });
    });

    describe('render the divs when isDisabled is true - inputs and buttons disabled', () => {
      const runTmntProps = cloneDeep(mockOneToNDivsProps);
      runTmntProps.isDisabled = true;
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
      // it('render int hdcp checkbox', () => {
      //   render(<OneToNDivs {...runTmntProps} />)
      //   const intHdcps = screen.getAllByRole('checkbox', { name: /integer hdcp/i }) as HTMLInputElement[];
      //   expect(intHdcps).toHaveLength(2)
      //   expect(intHdcps[0]).toBeDisabled()
      //   expect(intHdcps[1]).toBeDisabled()
      // })
      // it('render hdcp for game radio', () => {
      //   render(<OneToNDivs {...runTmntProps} />)
      //   const hdcpForGames = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
      //   expect(hdcpForGames).toHaveLength(2)
      //   expect(hdcpForGames[0]).toBeDisabled()
      //   expect(hdcpForGames[1]).toBeDisabled()
      // })
      // it('render hdcp for series radio', () => {
      //   render(<OneToNDivs {...runTmntProps} />)
      //   const hdcpForSeries = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
      //   expect(hdcpForSeries).toHaveLength(2)
      //   expect(hdcpForSeries[0]).toBeDisabled()
      //   expect(hdcpForSeries[1]).toBeDisabled()
      // })
    })
    
    describe('render the popup-help text', () => { 
      beforeEach(() => {
        jest.useFakeTimers();
      })
      afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();        
      })
      it("only shows the Hdcp % tooltip while the help icon is hovered", async () => { 
        const hdcpLineRegex = /Enter Hdcp %/i;
        const zeroLineRegex = /Enter 0 for scratch/;

        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        render(<OneToNDivs {...mockOneToNDivsProps} />)

        // 1) BEFORE HOVER – tooltip is NOT in the document
        expect(screen.queryByText(hdcpLineRegex)).not.toBeInTheDocument();
        expect(screen.queryByText(zeroLineRegex)).not.toBeInTheDocument();

        const teamLabels = screen.getAllByText(/hdcp %/i, { selector: "label" });
        expect(teamLabels).toHaveLength(2);
        const label = teamLabels[0] as HTMLLabelElement;
        const helpSpan = within(label).getByText("?", { selector: "span" });

        // 2) HOVER OVER help icon
        await user.hover(helpSpan);
        act(() => {
          jest.advanceTimersByTime(300); // > 250ms show delay
        });

        const hdcpTip = await screen.findByText(hdcpLineRegex);
        expect(hdcpTip).toBeInTheDocument();
        const zeroTip = await screen.findByText(zeroLineRegex);
        expect(zeroTip).toBeInTheDocument();

        // 3) UNHOVER – tooltip disappears after hide delay (1000ms)
        await user.unhover(helpSpan);
        act(() => {
          jest.advanceTimersByTime(1000); // > 250ms show delay
        });
        await waitForElementToBeRemoved(() => screen.queryByText(hdcpLineRegex));
        // if hdcpLineRegex is removed, so is the zeroLineRegex, no need to check
      })
    });
    
  })

  // describe('radio buttons per divsion should have same name (group)', () => { 
  //   it('test if "Scratch" div radio buttons have same name', () => {
  //     render(<OneToNDivs {...mockOneToNDivsProps} />)
  //     const gameRadios = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
  //     const seriesRadios = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
  //     expect(gameRadios[0]).toHaveAttribute('name', 'divHdcpRadio1');
  //     expect(seriesRadios[0]).toHaveAttribute('name', 'divHdcpRadio1');
  //   })
  //   it('test if "Hdcp" div radio buttons have same name', async () => {
  //     const user = userEvent.setup()
  //     render(<OneToNDivs {...mockOneToNDivsProps} />)
  //     const tabs = screen.getAllByRole('tab');
  //     await user.click(tabs[1]);
  //     const gameRadios = screen.getAllByRole('radio', { name: /game/i }) as HTMLInputElement[];
  //     const seriesRadios = screen.getAllByRole('radio', { name: /series/i }) as HTMLInputElement[];
  //     expect(gameRadios[1]).toHaveAttribute('name', 'divHdcpRadio2');
  //     expect(seriesRadios[1]).toHaveAttribute('name', 'divHdcpRadio2');
  //   })
  // })

})