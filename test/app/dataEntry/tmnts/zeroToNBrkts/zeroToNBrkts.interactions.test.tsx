import React, { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNBrackets, { validateBrkts } from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import type { brktType, AcdnErrType } from "@/lib/types/types";
import { mockTmntFullData, divId1 } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { minFee, maxMoney, maxGames } from "@/lib/validation/validation";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { cloneDeep } from "lodash";

const mockSetBrkts = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockZeroToNBrktsProps = {
  brkts: mockTmntFullData.brkts, 
  setBrkts: mockSetBrkts,
  divs: mockTmntFullData.divs,
  squads: mockTmntFullData.squads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,  
  isDisabled: false,
}

const mockSquads = mockTmntFullData.squads;

const renderCreateBrkt = (brktsOverride?: brktType[]) => {
  mockSetBrkts.mockClear();
  mockSetAcdnErr.mockClear();

  const brkts = brktsOverride ?? [];
  render(<ZeroToNBrackets {...mockZeroToNBrktsProps} brkts={brkts} />);
};

describe("zeroToNBrackets - interactions", () => {

  describe("zeroToNBrackets - create Bracket tab", () => {
    // NOTE:
    // We do not test "non-numeric fee input" here because EaCurrencyInput
    // (the spin-edit widget) prevents non-numeric characters at the UI level,
    // both in browser behavior and in test environments.
    // Therefore the user cannot enter values like "abc", making that scenario
    // untestable as an interaction for zeroToNBrkts.

    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it("shows Division error and does not add a brkt when Division is not selected", async () => {
      const user = userEvent.setup();
      renderCreateBrkt([]); // no existing brkts

      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

      // Leave Division unselected

      // Enter a valid fee
      const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      // no need to Enter a valid start - it will default to 1

      // Click Add bracket
      await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

      // Division error should appear
      expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent(/division is required/i);

      // Fee and Start should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent("");

      // No pot was added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });
    it("shows fee error when fee is too low and does not add a brkt", async () => {
      const user = userEvent.setup();
      renderCreateBrkt();
      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });
      
      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee < minFee
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (minFee - 0.01).toString());

      // no need to Enter a valid start - it will default to 1

      // Click Add bracket
      await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent(
        /cannot be less than/i
      );
      // division and Start should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent("");

      // no pot added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });
    it("shows fee error when fee is too high and does not add a brkt", async () => {
      const user = userEvent.setup();
      renderCreateBrkt();
      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });
      
      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee < minFee
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (maxMoney + 0.01).toString());

      // no need to Enter a valid start - it will default to 1

      // Click Add bracket
      await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent(
        /cannot be more than/i
      );
      // division and Start should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent("");

      // no pot added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });
    it("shows fee error when start is too low and does not add a brkt", async () => {
      const user = userEvent.setup();
      renderCreateBrkt();
      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });
      
      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      // enter start less than min
      const startInput = screen.getByLabelText(/start/i);
      await user.clear(startInput);
      await user.type(startInput, "0");

      // Click Add bracket
      await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
        /cannot be less than/i
      );
      // division and Start should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent("");

      // no pot added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });
    it("shows fee error when start is too high and does not add a brkt", async () => {
      const user = userEvent.setup();
      renderCreateBrkt();
      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });
      
      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      // enter start more than max start
      const startInput = screen.getByLabelText(/start/i);
      await user.clear(startInput);
      await user.type(startInput, "9");

      // Click Add bracket
      await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
        /cannot be more than/i
      );
      // division and Start should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent("");

      // no pot added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });
    it("prevents adding a duplicate brkt (same Division and Start)", async () => {
      const user = userEvent.setup();

      const existingBrkts = mockTmntFullData.brkts;

      renderCreateBrkt(existingBrkts);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3); // 1 create, 1 Scratch 1-3, 1 Scratch 4-6

      // try to create the SAME brkt again      
      await user.click(screen.getByLabelText(/^Scratch$/i)); // same as existingBrkts[0]

      const feeInputs = screen.getAllByLabelText(/fee/i);
      await user.clear(feeInputs[0]);
      await user.type(feeInputs[0], existingBrkts[0].fee);      
      // no need to Enter a valid start - it will default to 1

      // Scope to the Create Brkt tab panel
      const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

      await user.click(screen.getByRole("button", { name: /add bracket/i }));

      expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
        /already exists/i
      );

      // no new pot added
      expect(mockSetBrkts).not.toHaveBeenCalled();
    });

  })  

  describe('add a bracket', () => { 

    describe('add bracket without errors', () => { 
      it("adds a bracket when Division, Fee, and Start are all valid", async () => {
        const user = userEvent.setup();
        renderCreateBrkt([]);

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, minFee.toString());

        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        await user.clear(startInput);
        await user.type(startInput, "1");

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        expect(mockSetBrkts).toHaveBeenCalledTimes(1);

        const newBrkts = mockSetBrkts.mock.calls[0][0] as brktType[];
        expect(newBrkts).toHaveLength(1);
        const newBrkt = newBrkts[0];

        expect(newBrkt.div_id).toBe(divId1); // Scratch division
        expect(Number(newBrkt.fee)).toBeCloseTo(minFee);
        expect(newBrkt.start).toBe(1);

        // Create-panel errors should be clear
        expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent("");
        expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent("");
        expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent("");
      });
      it("calculates First, Second, Admin, and F+S+A based on fee", async () => {
        const user = userEvent.setup();
        renderCreateBrkt();

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        // Set fee to 5 and blur
        const feeInput = within(createBrktPanel).getByLabelText(/fee/i) as HTMLInputElement;
        await user.clear(feeInput);
        await user.type(feeInput, "5");
        await user.tab(); // trigger blur -> handleCreateBrktBlur -> updateFSA

        const firstInput = within(createBrktPanel).getByLabelText(/first/i) as HTMLInputElement;
        const secondInput = within(createBrktPanel).getByLabelText(/second/i) as HTMLInputElement;
        const adminInput = within(createBrktPanel).getByLabelText(/admin/i) as HTMLInputElement;
        const fsaInput = within(createBrktPanel).getByLabelText(/f\+s\+a/i) as HTMLInputElement;

        // We don't assume exact currency format, just that the numeric part is correct
        expect(firstInput.value).toMatch(/25(\.00)?/); // 5 * 5
        expect(secondInput.value).toMatch(/10(\.00)?/); // 5 * 2
        expect(adminInput.value).toMatch(/5(\.00)?/); // 5 * 1
        expect(fsaInput.value).toMatch(/40(\.00)?/); // 5 * 8
      });
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

    describe('do not add bracket with errors', () => { 
      it("shows Division error and does not add a bracket when Division is not selected", async () => {
        const user = userEvent.setup();
        renderCreateBrkt([]); // no existing brackets
        
        // Scope to the Create Bracket tab panel
        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        // leave Division blank

        // enter fee
        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, "5");

        // leave default start at 1

        // click add bracket withour selecting a division
        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        // Division error visible
        expect(screen.getByTestId("dangerBrktDivRadio")).toHaveTextContent(
          /division is required/i
        );
        // fee and start error not visible
        expect(screen.getByTestId('dangerCreateBrktFee')).toHaveTextContent('');
        expect(screen.getByTestId('dangerCreateBrktStart')).toHaveTextContent('');

        // no bracket added
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
      it("shows fee error when fee is too low and does not add a bracket", async () => {
        const user = userEvent.setup();
        renderCreateBrkt();

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        // select Division "Scratch" 
        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        // valid start
        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        await user.clear(startInput);
        await user.type(startInput, "1");

        // fee < minFee
        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, (minFee - 0.01).toString());

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        // fee error visible
        expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent(
          /cannot be less than/i
        );

        // no bracket added
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
      it("shows fee error when fee is too high and does not add a bracket", async () => {
        const user = userEvent.setup();
        renderCreateBrkt();

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        await user.clear(startInput);
        await user.type(startInput, "1");

        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, (maxMoney + 0.01).toString());

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        expect(screen.getByTestId("dangerCreateBrktFee")).toHaveTextContent(
          /cannot be more than/i
        );
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
      it("shows start error when start is too low and does not add a bracket", async () => {
        const user = userEvent.setup();
        renderCreateBrkt();

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, minFee.toString());

        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        await user.clear(startInput);
        await user.type(startInput, "0"); // invalid

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
          /cannot be less than 1/i
        );
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
      it("shows start error when start is too high and does not add a bracket", async () => {
        const user = userEvent.setup();
        renderCreateBrkt();

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, minFee.toString());

        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        const tooHighStart = maxGames - 1; // max is maxGames - 2
        await user.clear(startInput);
        await user.type(startInput, tooHighStart.toString());

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
          new RegExp(`cannot be more than ${mockSquads[0].games - 2}`, "i")
        );
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
      it("prevents adding a duplicate bracket (same Division + Start)", async () => {
        const user = userEvent.setup();

        // Use one of the existing mock brackets as the existing one
        const existingBrkt = {
          ...mockTmntFullData.brkts[0],
          div_id: divId1,
          start: 1,
          fee: minFee.toString(),
        };
        renderCreateBrkt([existingBrkt]);

        const createBrktPanel = screen.getByRole("tabpanel", { name: /create bracket/i });

        // same division
        await user.click(within(createBrktPanel).getByLabelText(/scratch/i));

        // same start
        const startInput = within(createBrktPanel).getByLabelText(/start/i);
        await user.clear(startInput);
        await user.type(startInput, existingBrkt.start.toString());

        // valid fee
        const feeInput = within(createBrktPanel).getByLabelText(/fee/i);
        await user.clear(feeInput);
        await user.type(feeInput, minFee.toString());

        await user.click(within(createBrktPanel).getByRole("button", { name: /add bracket/i }));

        // duplicate error appears on Start
        expect(screen.getByTestId("dangerCreateBrktStart")).toHaveTextContent(
          /already exists/i
        );

        // no new bracket added
        expect(mockSetBrkts).not.toHaveBeenCalled();
      });
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
        expect(startError).toHaveTextContent('Start cannot be more than 4');
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
        expect(startError).toHaveTextContent('Start cannot be more than 4');
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
  })

  describe('delete a bracket', () => { 

    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it('deletes bracket', async () => {      
      // ARRANGE
      const user = userEvent.setup();
      const delBrktProps = cloneDeep(mockZeroToNBrktsProps);
      render(<ZeroToNBrackets {...delBrktProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3); // delBrktProps.brkts.length + 1
      // ARRANGE
      await user.click(tabs[2]);    // tab for second bracket
      const delBtns = screen.getAllByText("Delete Bracket");
      // ASSERT
      expect(delBtns.length).toBe(2);
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      // get the buttons in the modal dialog      
      const yesBtn = await screen.findByRole('button', { name: /yes/i });      
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });      
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(yesBtn);
      // ASSERT
      expect(delBrktProps.setBrkts).toHaveBeenCalled();                    
    })      
    it('cancels deleting a bracket', async () => {      
      // ARRANGE
      const user = userEvent.setup();
      const delBrktProps = cloneDeep(mockZeroToNBrktsProps);
      render(<ZeroToNBrackets {...delBrktProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      // ARRANGE
      await user.click(tabs[2]); // tab for second bracket
      const delBtns = screen.getAllByText("Delete Bracket");
      // ASSERT
      expect(delBtns.length).toBe(2);
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      // get the buttons in the modal dialog      
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      // const yesBtn = screen.queryByRole('button', { name: /yes/i }) as HTMLInputElement;
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      // const noBtn = screen.queryByRole('button', { name: /no/i }) as HTMLInputElement;
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(noBtn);
      // ASSERT
      expect(mockSetShowingModal).toHaveBeenCalledWith(false);
      expect(delBrktProps.setBrkts).not.toHaveBeenCalled()
    })      
  })

  describe('edit a bracket', () => { 

    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it('clears fee and accordion errors while editing an existing bracket fee', async () => {

      const user = userEvent.setup();
      const editBrktProps = cloneDeep(mockZeroToNBrktsProps);

      // Seed an error on that bracket
      const target = editBrktProps.brkts[1];
      target.fee_err = "Fee cannot be less than $1.00";
      target.errClassName = objErrClassName;

      render(<ZeroToNBrackets {...editBrktProps} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[2]); // pick the bracket tab you want

      const feeInputs = screen.getAllByRole("textbox", { name: /fee/i }) as HTMLInputElement[];
      await user.clear(feeInputs[2]);
      await user.type(feeInputs[2], "0.99"); // or whatever

      // Child should have called setBrkts
      expect(mockSetBrkts).toHaveBeenCalled();

      // While editing, accordion error should be cleared
      expect(mockSetAcdnErr).toHaveBeenLastCalledWith(noAcdnErr);

      // Last brkts state sent up from child
      const editedBrkts =
        mockSetBrkts.mock.calls[mockSetBrkts.mock.calls.length - 1][0] as brktType[];

      const editedId = editBrktProps.brkts[1].id;
      const edited = editedBrkts.find((b) => b.id === editedId)!;

      // Child cleared fee_err & errClassName while user is typing
      expect(edited.fee_err).toBe("");
      expect(edited.errClassName).toBe("");
    });
    it('shows fee error on Save for a bracket with an invalid fee', () => {
      // Start from existing props (like after some user edits)
      const baseBrkts = cloneDeep(mockZeroToNBrktsProps.brkts);
      const editedId = baseBrkts[1].id;

      // Simulate that the parent now holds edited data with invalid fee
      const editedBrkts = baseBrkts.map((b) =>
        b.id === editedId
          ? { ...b, fee: (minFee - 0.01).toString() } // invalid
          : b
      );

      const parentSetBrkts: jest.Mock<void, [brktType[]]> = jest.fn();
      const parentSetAcdnErr: jest.Mock<void, [AcdnErrType]> = jest.fn();
      
      mockZeroToNBrktsProps.squads[0].games

      const isValid = validateBrkts(
        editedBrkts,
        parentSetBrkts,
        mockZeroToNBrktsProps.divs,
        mockZeroToNBrktsProps.squads[0].games,
        parentSetAcdnErr
      );

      // Now we *know* the fee is invalid, so validateBrkts must catch it
      expect(isValid).toBe(false);
      expect(parentSetBrkts).toHaveBeenCalledTimes(1);

      const validatedBrkts = parentSetBrkts.mock.calls[0][0] as brktType[];
      const editedAfter = validatedBrkts.find((b) => b.id === editedId)!;

      expect(editedAfter.fee_err).toMatch(/cannot be less than/i);

      expect(parentSetAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be less than"),
        })
      );
    });
    it("updates First, Second, Admin, and F+S+A for an existing bracket on blur of Fee change", async () => {
      const user = userEvent.setup();

      // Start with a single existing bracket so indexing is simple:
      // tab[0] = Create Bracket, tab[1] = this existing bracket
      const existingBrkt: brktType = {
        ...mockTmntFullData.brkts[0],
        fee: "5",   // known starting fee
        first: "",
        second: "",
        admin: "",
        fsa: "",
      };

      // Local wrapper that behaves like the real parent: keeps brkts in state
      const Wrapper: React.FC = () => {
      const [brkts, setBrkts] = useState<brktType[]>([existingBrkt]);

        return (
          <ZeroToNBrackets
            brkts={brkts}
            setBrkts={setBrkts}
            divs={mockTmntFullData.divs}
            squads={mockTmntFullData.squads}
            setAcdnErr={mockSetAcdnErr}
            setShowingModal={mockSetShowingModal}
            isDisabled={false}
          />
        );
      };

      render(<Wrapper />);

      // Select the existing bracket tab (index 1: 0 = Create, 1 = first existing)
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      // Fee inputs: [0] = Create, [1] = existing bracket
      const feeInputs = screen.getAllByRole("textbox", {
        name: /fee/i,
      }) as HTMLInputElement[];
      expect(feeInputs).toHaveLength(2);

      const existingFeeInput = feeInputs[1];

      // Change fee to 7 and trigger blur (updateFSA via handleBlur)
      await user.clear(existingFeeInput);
      await user.type(existingFeeInput, "7");
      fireEvent.blur(existingFeeInput);

      // Now we should have 2 sets of money fields:
      // index 0 = Create, index 1 = existing bracket we just edited
      // need to use await findAllByRole for first because 
      // we need to wait for re-render, no await for others
      const firstInputs = await screen.findAllByRole("textbox", {
        name: /first/i,
      }) as HTMLInputElement[];
      const secondInputs = screen.getAllByRole("textbox", {
        name: /second/i,
      }) as HTMLInputElement[];
      const adminInputs = screen.getAllByRole("textbox", {
        name: /admin/i,
      }) as HTMLInputElement[];
      const fsaInputs = screen.getAllByRole("textbox", {
        name: /f\+s\+a/i,
      }) as HTMLInputElement[];

      // We don't assume exact currency formatting, just that the numeric part is correct
      // updateFSA logic: first = fee * 5, second = fee * 2, admin = fee * 1, fsa = fee * 8
      expect(firstInputs[1].value).toMatch(/35(\.00)?/); // 7 * 5
      expect(secondInputs[1].value).toMatch(/14(\.00)?/); // 7 * 2
      expect(adminInputs[1].value).toMatch(/7(\.00)?/);   // 7 * 1
      expect(fsaInputs[1].value).toMatch(/56(\.00)?/);    // 7 * 8
    });
    it("clears First, Second, Admin, and F+S+A for an existing bracket on blur of Fee cleared", async () => {
      const user = userEvent.setup();

      // Start with a single existing bracket so indexing is simple:
      // tab[0] = Create Bracket, tab[1] = this existing bracket
      const existingBrkt: brktType = {
        ...mockTmntFullData.brkts[0],
        fee: "5",   // known starting fee
        first: "",
        second: "",
        admin: "",
        fsa: "",
      };

      // Local wrapper that behaves like the real parent: keeps brkts in state
      const Wrapper: React.FC = () => {
      const [brkts, setBrkts] = useState<brktType[]>([existingBrkt]);

        return (
          <ZeroToNBrackets
            brkts={brkts}
            setBrkts={setBrkts}
            divs={mockTmntFullData.divs}
            squads={mockTmntFullData.squads}
            setAcdnErr={mockSetAcdnErr}
            setShowingModal={mockSetShowingModal}
            isDisabled={false}
          />
        );
      };

      render(<Wrapper />);

      // Select the existing bracket tab (index 1: 0 = Create, 1 = first existing)
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      // Fee inputs: [0] = Create, [1] = existing bracket
      const feeInputs = screen.getAllByRole("textbox", {
        name: /fee/i,
      }) as HTMLInputElement[];
      expect(feeInputs).toHaveLength(2);

      const existingFeeInput = feeInputs[1];

      // Change fee to 7 and trigger blur (updateFSA via handleBlur)
      await user.clear(existingFeeInput);
      await user.type(existingFeeInput, "7");
      fireEvent.blur(existingFeeInput);

      // Now we should have 2 sets of money fields:
      // index 0 = Create, index 1 = existing bracket we just edited
      // need to use await findAllByRole for first because 
      // we need to wait for re-render, no await for others
      const firstInputs = await screen.findAllByRole("textbox", {
        name: /first/i,
      }) as HTMLInputElement[];
      const secondInputs = screen.getAllByRole("textbox", {
        name: /second/i,
      }) as HTMLInputElement[];
      const adminInputs = screen.getAllByRole("textbox", {
        name: /admin/i,
      }) as HTMLInputElement[];
      const fsaInputs = screen.getAllByRole("textbox", {
        name: /f\+s\+a/i,
      }) as HTMLInputElement[];

      // We don't assume exact currency formatting, just that the numeric part is correct
      // updateFSA logic: first = fee * 5, second = fee * 2, admin = fee * 1, fsa = fee * 8
      expect(firstInputs[1].value).toMatch(/35(\.00)?/); // 7 * 5
      expect(secondInputs[1].value).toMatch(/14(\.00)?/); // 7 * 2
      expect(adminInputs[1].value).toMatch(/7(\.00)?/);   // 7 * 1
      expect(fsaInputs[1].value).toMatch(/56(\.00)?/);    // 7 * 8
    });

  })
});
