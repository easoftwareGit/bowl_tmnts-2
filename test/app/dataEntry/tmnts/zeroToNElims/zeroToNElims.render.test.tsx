import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNElims from "@/app/dataEntry/tmntForm/zeroToNElims";
import styles from "@/app/dataEntry/tmntForm/tmntForm.module.css";
import { mockElims, mockDivs, mockSquads } from "../../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { defaultElimGames} from "@/lib/db/initVals";
import { getBrktOrElimName, getDivName } from "@/lib/getName";
import type { elimType } from "@/lib/types/types";
import { minFeeText } from "@/components/currency/eaCurrencyInput";
import { cloneDeep } from "lodash";

const mockSetElims = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockZeroToNElimsProps = {
  elims: mockElims, 
  setElims: mockSetElims,
  divs: mockDivs,
  squads: mockSquads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
  isDisabled: false,
}

describe('ZeroToNElims - render', () => { 

  describe('render the component', () => { 

    describe('render the Create Eliminator tab - no elims exist', () => { 
      const noElims: elimType[] = [];
      const mockNoElims = cloneDeep(mockZeroToNElimsProps);
      mockNoElims.elims = noElims;
      it('render the "Create Pots" tab', async () => {        
        // ARRANGE        
        render(<ZeroToNElims {...mockNoElims} />);        
        // ACT        
        const tabs = screen.getAllByRole("tab");        
        // ASSERT     
        expect(tabs).toHaveLength(noElims.length + 1);  //  + 1 for create pot tab
        expect(tabs[0]).toHaveTextContent("Create Eliminator");
      })
      it('render the "Create Eliminator tab screen with the correct background color"', async () => {
        render(<ZeroToNElims {...mockNoElims} />);

        const wrapper = screen.getByTestId("createElimContainer");

        expect(wrapper).toHaveClass("container");
        expect(wrapper).toHaveClass("rounded-3");
        expect(wrapper).toHaveClass(styles.createBackground);
      })
      it('render the Division label', () => {
        render(<ZeroToNElims {...mockNoElims} />)
        const divLabels = screen.getAllByText(/division/i);
        expect(divLabels).toHaveLength(noElims.length + 1); // + 1 for create pot
      })
      it('render the "Scratch" radio button', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).not.toBeChecked();
      })
      it('render the "Hdcp" radio button', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).not.toBeChecked();
      })
      it('DO NOT render the divison errors', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const divError = screen.queryByTestId("dangerElimDivRadio");
        expect(divError).toHaveTextContent("");
      })
      it('render the "Fee" label', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const feeLabels = screen.getAllByText("Fee");
        expect(feeLabels).toHaveLength(noElims.length + 1);
      })
      it('render the "Fee" input', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(noElims.length + 1);
        expect(fees[0]).toHaveValue('');
      })
      it('DO NOT render the create eliminator fee error', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const elimFeeError = screen.queryByTestId("dangerCreateElimFee");
        expect(elimFeeError).toHaveTextContent("");
      })
      it('render the create eliminator "Start" label', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const startLabels = screen.getAllByText(/start/i);
        expect(startLabels).toHaveLength(noElims.length + 1);
      })
      it('render the create eliminator "Start" input', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs).toHaveLength(noElims.length + 1);
        expect(startInputs[0]).toHaveValue(1);
      })
      it('DO NOT render the create eliminator "Start" error', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const elimStartError = screen.queryByTestId("dangerCreateElimStart");
        expect(elimStartError).toHaveTextContent("");
      })
      it('render the "Games" label', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const gamesLabels = screen.getAllByText("Games");
        expect(gamesLabels).toHaveLength(noElims.length + 1);
      })
      it('render the "Games" input', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(noElims.length + 1);
        expect(gamesInputs[0]).toHaveValue(defaultElimGames)
      })
      it('DO NOT render the create eliminator "Start" error', () => {
        render(<ZeroToNElims {...mockNoElims} />);
        const elimGamesError = screen.queryByTestId("dangerCreateElimGames");
        expect(elimGamesError).toHaveTextContent("");
      })
      it('render the "Add Eliminator" button', () => {
        render(<ZeroToNElims {...mockNoElims} />);        
        const addBtn = screen.getByRole('button', { name: /add eliminator/i });
        expect(addBtn).toBeInTheDocument();
      })
    })

    describe('render the "Scratch: 1-3" eliminator', () => {
      it('render the "Scratch: 1-3" eliminator', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockElims.length + 1);
        // ARRANGE
        await user.click(tabs[1]);
        // ASSERT
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");
        expect(tabs[4]).toHaveAttribute("aria-selected", "false");
      })
      it('render the Division label', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const divLabels = screen.getAllByText(/division/i);
        expect(divLabels).toHaveLength(mockElims.length + 1);
      })
      it('render the Division input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divInputs).toHaveLength(mockElims.length);
        expect(divInputs[0]).toHaveValue(getDivName(mockElims[0].div_id, mockDivs));
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeInputs[1]).toHaveValue(formatValueSymbSep2Dec(mockElims[0].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs[1]).toHaveValue(mockElims[0].start);
        expect(startInputs[1]).toBeDisabled();
      })
      it('render the Games input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs[1]).toHaveValue(mockElims[0].games);
        expect(gamesInputs[1]).toBeDisabled();
      })
      it('render the Delete Eliminator button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const delBtns = screen.getAllByRole("button", { name: /delete eliminator/i });
        expect(delBtns).toHaveLength(mockElims.length) // add button shown in Create Bracket tab
      })
    })

    describe('render the "Scratch: 4-6" eliminator', () => {
      it('render the "Scratch: 4-6" eliminator', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockElims.length + 1);
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
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divInputs).toHaveLength(mockElims.length);
        expect(divInputs[1]).toHaveValue(getDivName(mockElims[1].div_id, mockDivs));
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeInputs[2]).toHaveValue(formatValueSymbSep2Dec(mockElims[1].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs[2]).toHaveValue(mockElims[1].start);
        expect(startInputs[2]).toBeDisabled();
      })
      it('render the Games input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[2]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs[2]).toHaveValue(mockElims[1].games);
        expect(gamesInputs[2]).toBeDisabled();
      })
    })

    describe('render the "Hdcp: 1-3" eliminator', () => {
      it('render the "Hdcp: 1-3" eliminator', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockElims.length + 1);
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
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divInputs).toHaveLength(mockElims.length);
        expect(divInputs[2]).toHaveValue(getDivName(mockElims[2].div_id, mockDivs));
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeInputs[3]).toHaveValue(formatValueSymbSep2Dec(mockElims[2].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs[3]).toHaveValue(mockElims[2].start);
        expect(startInputs[3]).toBeDisabled();
      })
      it('render the Games input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[3]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs[3]).toHaveValue(mockElims[2].games);
        expect(gamesInputs[3]).toBeDisabled();
      })
    })

    describe('render the "Hdcp: 4-6" eliminator', () => {
      it('render the "Hdcp: 4-6" eliminator', async () => {
        // ARRANGE
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        // ACT
        const tabs = screen.getAllByRole("tab");
        // ASSERT
        expect(tabs).toHaveLength(mockElims.length + 1);
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
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divInputs).toHaveLength(mockElims.length);
        expect(divInputs[3]).toHaveValue(getDivName(mockElims[3].div_id, mockDivs));
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeInputs[4]).toHaveValue(formatValueSymbSep2Dec(mockElims[3].fee, localConfig));
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs[4]).toHaveValue(mockElims[3].start);
        expect(startInputs[4]).toBeDisabled();
      })
      it('render the Games input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[4]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs[4]).toHaveValue(mockElims[3].games);
        expect(gamesInputs[4]).toBeDisabled();
      })
    })

    describe('render radio buttons, buttons in group have the same name', () => {
      it("pot type radio buttons have the same name", () => {
        // const user = userEvent.setup()
        render(<ZeroToNElims {...mockZeroToNElimsProps} />);
        const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        const hdcpRadio = screen.getByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(scratchRadio).toHaveAttribute('name', 'elimsDivRadio');
        expect(hdcpRadio).toHaveAttribute('name', 'elimsDivRadio');
      })
    })

    // describe('render the create eliminator with errors', () => {
    //   it('render Eliminator errors', async () => {
    //     // ARRANGE
    //     const user = userEvent.setup()
    //     render(<ZeroToNElims {...mockZeroToNElimsProps} />);
    //     // ACT
    //     const divError = screen.queryByTestId("dangerElimDivRadio");
    //     const feeError = screen.queryByTestId("dangerCreateElimFee");
    //     const startError = screen.queryByTestId("dangerCreateElimStart");
    //     const gamesError = screen.queryByTestId("dangerCreateElimGames");
    //     const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
    //     const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
    //     const createElimStarts = starts[0];
    //     const createElimGames = games[0]
    //     const addBtn = screen.getByRole('button', { name: /add eliminator/i });
    //     await user.clear(createElimStarts);
    //     await user.type(createElimStarts, '0');
    //     await user.clear(createElimGames);
    //     await user.type(createElimGames, '0');
    //     await user.click(addBtn);

    //     // ASSERT
    //     expect(divError).toHaveTextContent('Division is required');
    //     expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
    //     expect(startError).toHaveTextContent('Start cannot be less than 1');
    //     expect(gamesError).toHaveTextContent('Games cannot be less than 1');
    //   })
    //   it('render Eliminator errors, then clear errors', async () => {
    //     // ARRANGE
    //     const user = userEvent.setup()
    //     render(<ZeroToNElims {...mockZeroToNElimsProps} />);
    //     // ACT
    //     const divError = screen.queryByTestId("dangerElimDivRadio");
    //     const feeError = screen.queryByTestId("dangerCreateElimFee");
    //     const startError = screen.queryByTestId("dangerCreateElimStart");
    //     const gamesError = screen.queryByTestId("dangerCreateElimGames");
    //     const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
    //     const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
    //     const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
    //     const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
    //     const createElimFee = fees[0];
    //     const createElimStarts = starts[0];
    //     const createElimGames = games[0]
    //     const addBtn = screen.getByRole('button', { name: /add eliminator/i });
    //     await user.clear(createElimStarts);
    //     await user.type(createElimStarts, '0');
    //     await user.clear(createElimGames);
    //     await user.type(createElimGames, '0');
    //     await user.click(addBtn);

    //     // ASSERT
    //     expect(divError).toHaveTextContent('Division is required');
    //     expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
    //     expect(startError).toHaveTextContent('Start cannot be less than 1');
    //     expect(gamesError).toHaveTextContent('Games cannot be less than 1');

    //     // ACT part 2
    //     await user.click(scratchRadio)
    //     await user.click(createElimFee);
    //     await user.type(createElimFee, '10');
    //     await user.clear(createElimStarts);
    //     await user.type(createElimStarts, '1');
    //     await user.clear(createElimGames);
    //     await user.type(createElimGames, '3');
    //     // ASSERT
    //     expect(divError).toHaveTextContent('');
    //     expect(feeError).toHaveTextContent('');
    //     expect(startError).toHaveTextContent('');
    //     expect(gamesError).toHaveTextContent('');
    //   })
    // })

    describe('render the Scratch: 1-3 eliminator with errors', () => { 
      it('render Eliminator errors', async () => { 
        // ARRANGE
        const elimsWithErrors = [
          {
            ...mockElims[0],
            start: 5,
            start_err: 'Start cannot be more than 4',
            fee: '0',
            fee_err: "Fee cannot be less than " + minFeeText,
          },
          {
            ...mockElims[1],
          },
          {
            ...mockElims[2],
          },
          {
            ...mockElims[3],
          },
        ]
        const dataWithErrors = {
          elims: elimsWithErrors, 
          setElims: mockSetElims,
          divs: mockDivs,
          squads: mockSquads,
          setAcdnErr: mockSetAcdnErr,
          setShowingModal: mockSetShowingModal,
          isDisabled: false,
        }
        
        const user = userEvent.setup()
        render(<ZeroToNElims {...dataWithErrors} />);
        // ACT              
        const feeError = screen.queryByTestId(`dangerElimFee${mockElims[0].id}`);
        const startError = screen.queryByTestId(`dangerViewElimStart${mockElims[0].id}`);
        // ASSERT      
        expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');      
        expect(startError).toHaveTextContent('Start cannot be more than 4');
      })
    })
        
    describe('render elims when isDiabled is true', () => { 
      const runTmntProps = cloneDeep(mockZeroToNElimsProps);
      runTmntProps.isDisabled = true;
      it('render the Division input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const divInputs = screen.getAllByRole('textbox', { name: /division/i }) as HTMLInputElement[];
        expect(divInputs).toHaveLength(mockElims.length);
        for (let i = 0; i < mockElims.length; i++) {
          expect(divInputs[i]).toBeDisabled();
        }
      })
      it('render the Fee input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const feeInputs = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(feeInputs).toHaveLength(mockElims.length);
        for (let i = 0; i < mockElims.length; i++) {
          expect(feeInputs[i]).toBeDisabled();
        }
      })
      it('render the Start input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs).toHaveLength(mockElims.length);
        for (let i = 0; i < mockElims.length; i++) {
          expect(startInputs[i]).toBeDisabled();
        }
      })
      it('render the Games input', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(mockElims.length);
        for (let i = 0; i < mockElims.length; i++) {
          expect(gamesInputs[i]).toBeDisabled();
        }
      })
      it('render the Delete Eliminator button', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const delBtns = screen.getAllByRole("button", { name: /delete eliminator/i });
        expect(delBtns).toHaveLength(mockElims.length);
        for (let i = 0; i < mockElims.length; i++) {
          expect(delBtns[i]).toBeDisabled();
        }
      })
    })

    describe('DO NOT render Create Eliminators tab when isDisabled is true', () => { 
      const runTmntProps = cloneDeep(mockZeroToNElimsProps);
      runTmntProps.isDisabled = true;
      it('DO NOT render the "Create Pots" tab', async () => {        
        render(<ZeroToNElims {...runTmntProps} />);        
        const tabs = screen.getAllByRole("tab");        
        expect(tabs).toHaveLength(mockElims.length);  // no create pot tab

        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
        expect(tabs[3]).toHaveAttribute("aria-selected", "false");                

        expect(tabs[0]).not.toHaveTextContent(/create eliminator/i);
        expect(tabs[1]).not.toHaveTextContent(/create eliminator/i);
        expect(tabs[2]).not.toHaveTextContent(/create eliminator/i);
        expect(tabs[3]).not.toHaveTextContent(/create eliminator/i);
      })
      it('DO NOT render the Division label', async () => {
        const user = userEvent.setup()
        render(<ZeroToNElims {...runTmntProps} />);
        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);
        const divLabels = screen.getAllByText(/division/i);
        expect(divLabels).toHaveLength(mockElims.length); // no div label for create eliminator
      })
      it('DO NOT render the "Scratch" radio button', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const scratchRadio = screen.queryByRole('radio', { name: /scratch/i }) as HTMLInputElement;
        expect(scratchRadio).not.toBeInTheDocument();
      })
      it('render the "Hdcp" radio button', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const hdcpRadio = screen.queryByRole('radio', { name: /hdcp/i }) as HTMLInputElement;
        expect(hdcpRadio).not.toBeInTheDocument();
      })
      it('DO NOT render the divison errors', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const divError = screen.queryByTestId("dangerElimDivRadio");
        expect(divError).not.toBeInTheDocument();
      })
      it('DO NOT render the "Fee" label', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const feeLabels = screen.getAllByText("Fee");
        expect(feeLabels).toHaveLength(mockElims.length); // no fee label for create eliminator
      })
      it('render the "Fee" input', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
        expect(fees).toHaveLength(mockElims.length); // no fee input for create eliminator
      })
      it('DO NOT render the create eliminator fee error', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const elimFeeError = screen.queryByTestId("dangerCreateElimFee");
        expect(elimFeeError).not.toBeInTheDocument();
      })
      it('DO NOT render the create eliminator "Start" label', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const startLabels = screen.getAllByText(/start/i);
        expect(startLabels).toHaveLength(mockElims.length); // no start label for create eliminator
      })
      it('DO NOT render the create eliminator "Start" input', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const startInputs = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
        expect(startInputs).toHaveLength(mockElims.length); // no start input for create eliminator        
      })
      it('DO NOT render the create eliminator "Start" error', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const elimStartError = screen.queryByTestId("dangerCreateElimStart");
        expect(elimStartError).not.toBeInTheDocument();
      })
      it('DO NOT render the "Games" label', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const gamesLabels = screen.getAllByText("Games");
        expect(gamesLabels).toHaveLength(mockElims.length); // no games label for create eliminator
      })
      it('DO NOT render the "Games" input', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const gamesInputs = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
        expect(gamesInputs).toHaveLength(mockElims.length); // no games input for create eliminator        
      })
      it('DO NOT render the create eliminator "Start" error', () => {
        render(<ZeroToNElims {...runTmntProps} />);
        const elimGamesError = screen.queryByTestId("dangerCreateElimGames");
        expect(elimGamesError).not.toBeInTheDocument();
      })
      it('render the "Add Eliminator" button', () => {
        render(<ZeroToNElims {...runTmntProps} />);        
        const addBtn = screen.queryByRole('button', { name: /add eliminator/i });
        expect(addBtn).not.toBeInTheDocument();
      })
    })

  })

  describe("default tab behavior", () => {
    it('when enabled and there are no elims, the active tab is "Create Eliminator"', () => {
      const noElimsProps = cloneDeep(mockZeroToNElimsProps);
      noElimsProps.elims = [];
      noElimsProps.isDisabled = false;

      render(<ZeroToNElims {...noElimsProps} />);

      const tabs = screen.getAllByRole("tab");

      // Only the Create tab should exist
      expect(tabs).toHaveLength(1);

      const firstTab = tabs[0];

      expect(firstTab).toHaveTextContent(/create eliminator/i);
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });
    it("when disabled and elims exist, first elim tab is selected and Create tab is not rendered", () => {
      const disabledProps = cloneDeep(mockZeroToNElimsProps);
      disabledProps.isDisabled = true;

      render(<ZeroToNElims {...disabledProps} />);

      const tabs = screen.getAllByRole("tab");

      // No Create tab; one tab per elim
      expect(tabs).toHaveLength(mockElims.length);

      const firstTab = tabs[0];

      // First tab should be the first elim's name, not "Create Eliminator"
      const firstElimName = getBrktOrElimName(mockElims[0], mockDivs);
      expect(firstTab).toHaveTextContent(firstElimName);
      expect(firstTab).not.toHaveTextContent(/create eliminator/i);

      // And it should be the active tab
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });
  });
  
})