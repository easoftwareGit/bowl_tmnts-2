import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNPots from "@/app/dataEntry/tmntForm/zeroToNPots";
import { potType } from "@/lib/types/types";
import { minFee, maxMoney } from "@/lib/validation/validation";
import { divId1, mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { noAcdnErr } from "@/app/dataEntry/tmntForm/errors";
import { before, cloneDeep } from "lodash";

const mockSetPots = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockPots = mockTmntFullData.pots;
const mockDivs = mockTmntFullData.divs;
const mockSquads = mockTmntFullData.squads;
const div1Name = mockTmntFullData.divs[0].div_name;

const renderCreatePot = (pots: potType[] = []) => {
  mockSetPots.mockClear();
  mockSetAcdnErr.mockClear();
  mockSetShowingModal.mockClear();

  return render(
    <ZeroToNPots
      pots={pots}
      setPots={mockSetPots}
      divs={mockDivs}
      squads={mockSquads}
      setAcdnErr={mockSetAcdnErr}
      setShowingModal={mockSetShowingModal}
      isDisabled={false}
    />
  );
};

const mockZeroToNPotsProps = {
  pots: mockPots, 
  setPots: mockSetPots,
  divs: mockDivs,
  squads: mockSquads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
  isDisabled: false
}

describe("zeroToNPots - interactions", () => {
  
  describe("create Pot tab", () => {
    // NOTE:
    // We do not test "non-numeric fee input" here because EaCurrencyInput
    // (the spin-edit widget) prevents non-numeric characters at the UI level,
    // both in browser behavior and in test environments.
    // Therefore the user cannot enter values like "abc", making that scenario
    // untestable as an interaction for zeroToNPots.
    
    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it("shows Pot Type error and does not add a pot when Pot Type is not selected", async () => {
      const user = userEvent.setup();
      renderCreatePot([]); // no existing pots

      // Scope to the Create Pot tab panel
      const createPotPanel = screen.getByRole("tabpanel", { name: /create pot/i });

      // Leave Game unselected

      // Select a valid Division ("Scratch")
      await user.click(within(createPotPanel).getByLabelText(/scratch/i));

      // Enter a valid fee
      const feeInput = within(createPotPanel).getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      // Click Add Pot without selecting a Pot Type
      await user.click(within(createPotPanel).getByRole("button", { name: /add pot/i }));

      // Pot Type error should appear
      expect(screen.getByTestId("dangerPotType")).toHaveTextContent(/pot type is required/i);

      // Division and Fee should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerDiv")).toHaveTextContent("");
      expect(screen.getByTestId("dangerPotFee")).toHaveTextContent("");

      // No pot was added
      expect(mockSetPots).not.toHaveBeenCalled();
    });
    it("shows Division error and does not add a pot when Division is not selected", async () => {
      const user = userEvent.setup();
      renderCreatePot([]); // no existing pots

      const createPotPanel = screen.getByRole("tabpanel", { name: /create pot/i });

      // Select a valid Pot Type ("Game")
      await user.click(within(createPotPanel).getByLabelText(/^Game$/i));

      // Leave Division unselected

      // Enter a valid fee
      const feeInput = within(createPotPanel).getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      // Click Add Pot
      await user.click(within(createPotPanel).getByRole("button", { name: /add pot/i }));

      // Division error should appear
      expect(screen.getByTestId("dangerDiv")).toHaveTextContent(/division is required/i);

      // Pot Type and Fee should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerPotType")).toHaveTextContent("");
      expect(screen.getByTestId("dangerPotFee")).toHaveTextContent("");

      // No pot was added
      expect(mockSetPots).not.toHaveBeenCalled();
    });
    it("shows fee error when fee is too low and does not add a pot", async () => {
      const user = userEvent.setup();
      renderCreatePot();

      // select Pot Type "Game" (not Last Game or Series)
      await user.click(screen.getByLabelText(/^Game$/i));

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee < minFee
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (minFee - 0.01).toString());

      // click Add Pot
      await user.click(screen.getByRole("button", { name: /add pot/i }));

      // error visible
      expect(screen.getByTestId("dangerPotFee")).toHaveTextContent(
        /cannot be less than/i
      );

      // no pot added
      expect(mockSetPots).not.toHaveBeenCalled();
    });
    it("shows fee error when fee is too high and does not add a pot", async () => {
      const user = userEvent.setup();
      renderCreatePot();

      await user.click(screen.getByLabelText(/^Game$/i));
      await user.click(screen.getByLabelText(/scratch/i));

      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (maxMoney + 1).toString());

      await user.click(screen.getByRole("button", { name: /add pot/i }));

      expect(screen.getByTestId("dangerPotFee")).toHaveTextContent(
        /cannot be more than/i
      );

      expect(mockSetPots).not.toHaveBeenCalled();
    });
    it("adds a pot when Pot Type, Division, and Fee are all valid", async () => {
      const user = userEvent.setup();
      renderCreatePot([]);

      await user.click(screen.getByLabelText(/^Game$/i));
      await user.click(screen.getByLabelText(/scratch/i));

      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      await user.click(screen.getByRole("button", { name: /add pot/i }));

      expect(mockSetPots).toHaveBeenCalledTimes(1);

      const newPots = mockSetPots.mock.calls[0][0] as potType[];
      expect(newPots).toHaveLength(1);
      const newPot = newPots[0];

      expect(newPot.pot_type).toBe("Game");
      expect(newPot.div_id).toBe(divId1);   // id of scratch division        
      expect(newPot.fee).toBe(minFee.toFixed(2));
      
      // no create-tab errors
      expect(screen.getByTestId("dangerPotType")).toHaveTextContent("");
      expect(screen.getByTestId("dangerDiv")).toHaveTextContent("");
      expect(screen.getByTestId("dangerPotFee")).toHaveTextContent("");
    });
    it("prevents adding a duplicate pot (same Pot Type + Division)", async () => {
      const user = userEvent.setup();

      const existingPots = mockTmntFullData.pots;

      renderCreatePot(existingPots);

      // try to create the SAME pot again
      await user.click(screen.getByLabelText(/^Game$/i));
      await user.click(screen.getByLabelText(/^Scratch$/i)); // same as existingPots[0]

      // Scope to the Create Pot tab panel
      const createPotPanel = screen.getByRole("tabpanel", { name: /create pot/i });

      // Now find the Fee input only within that panel
      const feeInput = within(createPotPanel).getByLabelText(/fee/i);
      // const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      await user.click(screen.getByRole("button", { name: /add pot/i }));

      // duplicate error appears in pot_type_err area
      expect(screen.getByTestId("dangerPotType")).toHaveTextContent(
        /already exists/i
      );

      // no new pot added
      expect(mockSetPots).not.toHaveBeenCalled();
    });
  });

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

  describe('add a Pot', () => {
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

  describe('edit a Pot', () => { 
    it("edits the fee amount of an existing pot with a valid fee", async () => {
      const user = userEvent.setup();

      const existingPots = mockTmntFullData.pots;

      renderCreatePot(existingPots);

      // Select the first existing pot tab.
      // tabs[0] = "Create Pot", tabs[1] = first existing pot, etc.
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      // There are multiple "Fee" inputs:
      // [0] = Create Pot fee, [1] = first existing pot fee, [2] = second pot, ...
      const feeInputs = screen.getAllByRole("textbox", { name: /fee/i }) as HTMLInputElement[];
      const potFeeInput = feeInputs[1]; // first existing pot

      // Edit the fee
      fireEvent.change(potFeeInput, { target: { value: '34' } });

      // Component should call setPots with an updated pots array
      expect(mockSetPots).toHaveBeenCalled();

      // Inspect the *last* call to setPots
      const lastCall = mockSetPots.mock.calls[mockSetPots.mock.calls.length - 1];
      const updatedPots = lastCall[0] as potType[];

      // Find the updated pot by id
      const updatedPot = updatedPots.find((p) => p.id === existingPots[0].id);
      expect(updatedPot).toBeDefined();

      // Fee should be updated - stored as a string
      expect(updatedPot!.fee).toBe('34');

      // Errors should be cleared
      expect(updatedPot!.fee_err).toBe("");
      expect(updatedPot!.errClassName).toBe("");

      // Since the fee is valid and no other fee errors are introduced,
      // the accordion error should be cleared
      expect(mockSetAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("render 2 pots, pot[0] has an invalid fee, edit pot[1] with valid fee, setAcdnErr called with pot[0]'s name ", async () => {
      const user = userEvent.setup();

      const testPots = cloneDeep(mockTmntFullData.pots);
      testPots[0].fee = "0";
      testPots[0].fee_err = "Fee cannot be less than $1.00";
      testPots[1].pot_type = 'Series';
      testPots[1].fee = "10";
      renderCreatePot(testPots);

      // Select the second existing pot tab.
      // tabs[0] = "Create Pot", tabs[1] = pot with error, tabs[2] = pot to edit.
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[2]);

      // There are multiple "Fee" inputs:
      // [0] = Create Pot fee, [1] = first existing pot fee, [2] = second pot, ...
      const feeInputs = screen.getAllByRole("textbox", { name: /fee/i }) as HTMLInputElement[];
      const potFeeInput = feeInputs[2];                     // fee for second pot
      expect(potFeeInput.value.toString()).toBe("$10.00");  // confirm correct fee input

      // Edit the fee
      fireEvent.change(potFeeInput, { target: { value: '34' } });

      // Component should call setPots with an updated pots array
      expect(mockSetPots).toHaveBeenCalled();

      // Inspect the *last* call to setPots
      const lastCall = mockSetPots.mock.calls[mockSetPots.mock.calls.length - 1];
      const updatedPots = lastCall[0] as potType[];

      // Find the updated pot by id
      const updatedPot = updatedPots.find((p) => p.id === testPots[1].id);
      expect(updatedPot).toBeDefined();

      // Fee should be updated - stored as a string
      expect(updatedPot!.fee).toBe('34');

      // Errors should be cleared
      expect(updatedPot!.fee_err).toBe("");
      expect(updatedPot!.errClassName).toBe("");

      // Since the fee in pot[0] is invalid
      // the accordion error should be for pot[0] "Sratch: Game fee cannot be less than $1.00"
      expect(mockSetAcdnErr).toHaveBeenCalledWith({
        errClassName: "acdnError",
        message: ": Error in Scratch: Game - Fee cannot be less than $1.00"
      });
    });

    // it("change duplicate pot (same Pot Type + Division) to non-duplicate", async () => {
    //   const user = userEvent.setup();

    //   const existingPots = mockTmntFullData.pots;

    //   renderCreatePot(existingPots);

    //   // try to create the SAME pot again
    //   await user.click(screen.getByLabelText(/^Game$/i));
    //   await user.click(screen.getByLabelText(/^Scratch$/i)); // same as existingPots[0]

    //   // Scope to the Create Pot tab panel
    //   const createPotPanel = screen.getByRole("tabpanel", { name: /create pot/i });

    //   // Now find the Fee input only within that panel
    //   const feeInput = within(createPotPanel).getByLabelText(/fee/i);
    //   // const feeInput = screen.getByLabelText(/fee/i);
    //   await user.clear(feeInput);
    //   await user.type(feeInput, minFee.toString());

    //   const addButton = screen.getByRole("button", { name: /add pot/i });
    //   await user.click(addButton);      

    //   // duplicate error appears in pot_type_err area
    //   expect(screen.getByTestId("dangerPotType")).toHaveTextContent(
    //     /already exists/i
    //   );

    //   // no new pot added
    //   expect(mockSetPots).not.toHaveBeenCalled();

    //   // change to non-duplicate - change game Series
    //   await user.click(screen.getByLabelText(/^Series$/i));
    //   expect(screen.getByTestId("dangerPotType")).toHaveTextContent("");
    //   await user.click(addButton);

    //   expect(mockSetPots).toHaveBeenCalledTimes(1);
    // });
  })

  describe('delete a Pot', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it('delete pot', async () => { 
      const addPotsProps = cloneDeep(mockZeroToNPotsProps);
      // ARRANGE
      const user = userEvent.setup();
      render(<ZeroToNPots {...addPotsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[5]);
      const delBtns = screen.getAllByText("Delete Pot");
      // ASSERT
      expect(delBtns.length).toBe(2);
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(yesBtn);
      // ASSERT
      expect(addPotsProps.setPots).toHaveBeenCalled();            
    })    
    it('delete pot - then cancel', async () => { 
      // ARRANGE
      const user = userEvent.setup();
      const delPotsProps = cloneDeep(mockZeroToNPotsProps);
      render(<ZeroToNPots {...delPotsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      // ARRANGE
      await user.click(tabs[5]);
      const delBtns = screen.getAllByText("Delete Pot");
      // ASSERT
      expect(delBtns.length).toBe(2);
      // ACT
      await user.click(delBtns[1]);
      // ASSERT
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(noBtn); // do not delete
      // ASSERT
      expect(mockSetShowingModal).toHaveBeenCalledWith(false);
      expect(delPotsProps.setPots).not.toHaveBeenCalled();
    })    

  })

});