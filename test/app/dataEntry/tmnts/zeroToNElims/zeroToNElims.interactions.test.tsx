import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNElims, { validateElims } from "@/app/dataEntry/tmntForm/zeroToNElims";
import { AcdnErrType, elimType } from "@/lib/types/types";
import { minFee, maxMoney, maxGames, minGames } from "@/lib/validation/validation";
import { divId1, mockTmntFullData } from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/dataEntry/tmntForm/errors";
import { getBrktOrElimName } from "@/lib/getName";
import { mock } from "node:test";
import { defaultBrktGames } from "@/lib/db/initVals";

const mockSetElims = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockElims = mockTmntFullData.elims;
const mockDivs = mockTmntFullData.divs;
const mockSquads = mockTmntFullData.squads;

const mockZeroToNElimsProps = {
  elims: mockElims, 
  setElims: mockSetElims,
  divs: mockDivs,
  squads: mockSquads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
  isDisabled: false,
}

const renderCreateElim = (elims: elimType[] = []) => {
  mockSetElims.mockClear();
  mockSetAcdnErr.mockClear();
  mockSetShowingModal.mockClear();

  return render(
    <ZeroToNElims
      elims={elims}
      setElims={mockSetElims}      
      divs={mockDivs}
      squads={mockSquads}
      setAcdnErr={mockSetAcdnErr}
      setShowingModal={mockSetShowingModal}
      isDisabled={false}
    />
  );
};

describe('zeroToNElims - interactions', () => { 

  describe("zeroToNElims - Create Eliminator tab", () => {
    // NOTE:
    // We do not test "non-numeric fee input" here because EaCurrencyInput
    // (the spin-edit widget) prevents non-numeric characters at the UI level,
    // both in browser behavior and in test environments.
    // Therefore the user cannot enter values like "abc", making that scenario
    // untestable as an interaction for zeroToNBrkts.
    
    beforeEach(() => {
      jest.clearAllMocks();
    });  
    
    it("shows Division error and does not add a eliminator when Division is not selected", async () => {
      const user = userEvent.setup();
      renderCreateElim([]); // no existing pots

      // Scope to the Create Pot tab panel
      const createElimPanel = screen.getByRole("tabpanel", { name: /create eliminator/i });

      // Leave Game Division unselected
      
      // Enter a valid fee
      const feeInput = within(createElimPanel).getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, minFee.toString());

      const startInput = within(createElimPanel).getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, "1");

      const gamesInput = within(createElimPanel).getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      // Click Add Eliminator without selecting a Division
      await user.click(within(createElimPanel).getByRole("button", { name: /add eliminator/i }));

      // division error should appear
      expect(screen.getByTestId("dangerElimDivRadio")).toHaveTextContent(/division is required/i);

      // Division and Fee should *not* show errors (they're valid)
      expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent("");

      // No pot was added
      expect(mockSetElims).not.toHaveBeenCalled();
    });  
    it("shows fee error when fee is too low and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee < minFee
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (minFee - 0.01).toString());

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, "1");

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent(
        /cannot be less than/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows fee error when fee is too high and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // enter fee < minFee
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, (maxMoney + 0.01).toString());

      await user.click(screen.getByLabelText(/^Games$/i));
      await user.click(screen.getByLabelText(/scratch/i));

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent(
        /cannot be more than/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows start error when start is too low and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, "0");

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
        /cannot be less than/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows start error when start is too high and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, (maxGames + 1).toString());

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
        /eliminator ends after last game/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows games error when games is too low and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, (maxGames + 1).toString());

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, (minGames - 1).toString());

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent(
        /cannot be less than/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows games error when games is too low and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, (maxGames + 1).toString());

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, (maxGames + 1).toString());

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent(
        /cannot be more than/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("shows games error when start + (games - 1) > squad games and does not add a elim", async () => {
      const user = userEvent.setup();
      renderCreateElim();

      // select Division "Scratch"
      await user.click(screen.getByLabelText(/scratch/i));

      // enter fee 
      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, (mockSquads[0].games - 2).toString());

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "4");

      // click Add Eliminator
      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // error visible
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
        /ends after last game/i
      );

      // no elim added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
    it("adds a pot when Division, Fee, Start and Games are all valid", async () => {
      const user = userEvent.setup();
      renderCreateElim([]);

      await user.click(screen.getByLabelText(/scratch/i));

      const feeInput = screen.getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = screen.getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, "1");

      const gamesInput = screen.getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      expect(mockSetElims).toHaveBeenCalledTimes(1);

      const newElims = mockSetElims.mock.calls[0][0] as elimType[];
      expect(newElims).toHaveLength(1);
      const newElim = newElims[0];

      expect(newElim.div_id).toBe(divId1);   // id of scratch division
      expect(newElim.fee).toBe("5.00");   // id of scratch division        
      expect(newElim.start).toBe(1);
      expect(newElim.games).toBe(3);
      
      // no create-tab errors    
      expect(screen.getByTestId("dangerElimDivRadio")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent("");
      expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent("");
    });
    it("prevents adding a duplicate pot (same Pot Type + Division)", async () => {
      const user = userEvent.setup();
      const existingElims = mockTmntFullData.elims;
      renderCreateElim(existingElims);

      // Scope to the Create Pot tab panel
      const createElimPanel = screen.getByRole("tabpanel", { name: /create eliminator/i });

      // try to create the SAME elim again
      await user.click(within(createElimPanel).getByLabelText(/scratch/i));

      const feeInput = within(createElimPanel).getByLabelText(/fee/i);
      await user.clear(feeInput);
      await user.type(feeInput, "5");

      const startInput = within(createElimPanel).getByLabelText(/^Start$/i);
      await user.clear(startInput);
      await user.type(startInput, "1");

      const gamesInput = within(createElimPanel).getByLabelText(/^Games$/i);
      await user.clear(gamesInput);
      await user.type(gamesInput, "3");

      await user.click(screen.getByRole("button", { name: /add eliminator/i }));

      // duplicate error appears in div_type_err area
      expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
        /already exists/i
      );

      // no new pot added
      expect(mockSetElims).not.toHaveBeenCalled();
    });
  });  

  describe('render the create eliminator with errors', () => { 
    it('render Eliminator errors', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<ZeroToNElims {...mockZeroToNElimsProps} />);
      // ACT
      const divError = screen.queryByTestId("dangerElimDivRadio");
      const feeError = screen.queryByTestId("dangerCreateElimFee");
      const startError = screen.queryByTestId("dangerCreateElimStart");
      const gamesError = screen.queryByTestId("dangerCreateElimGames");
      const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
      const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
      const createElimStarts = starts[0];
      const createElimGames = games[0]
      const addBtn = screen.getByRole('button', { name: /add eliminator/i });
      await user.clear(createElimStarts);
      await user.type(createElimStarts, '0');
      await user.clear(createElimGames);
      await user.type(createElimGames, '0');
      await user.click(addBtn);

      // ASSERT
      expect(divError).toHaveTextContent('Division is required');
      expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
      expect(startError).toHaveTextContent('Start cannot be less than 1');
      expect(gamesError).toHaveTextContent('Games cannot be less than 1');
    })
    it('render Eliminator errors, then clear errors', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<ZeroToNElims {...mockZeroToNElimsProps} />);
      // ACT
      const divError = screen.queryByTestId("dangerElimDivRadio");
      const feeError = screen.queryByTestId("dangerCreateElimFee");
      const startError = screen.queryByTestId("dangerCreateElimStart");
      const gamesError = screen.queryByTestId("dangerCreateElimGames");
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
      const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
      const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
      const createElimFee = fees[0];
      const createElimStarts = starts[0];
      const createElimGames = games[0]
      const addBtn = screen.getByRole('button', { name: /add eliminator/i });
      await user.clear(createElimStarts);
      await user.type(createElimStarts, '0');
      await user.clear(createElimGames);
      await user.type(createElimGames, '0');
      await user.click(addBtn);

      // ASSERT
      expect(divError).toHaveTextContent('Division is required');
      expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
      expect(startError).toHaveTextContent('Start cannot be less than 1');
      expect(gamesError).toHaveTextContent('Games cannot be less than 1');

      // ACT part 2
      await user.click(scratchRadio)
      await user.click(createElimFee);
      await user.type(createElimFee, '10');
      await user.clear(createElimStarts);
      await user.type(createElimStarts, '1');
      await user.clear(createElimGames);
      await user.type(createElimGames, '3');
      // ASSERT
      expect(divError).toHaveTextContent('');
      expect(feeError).toHaveTextContent('');
      expect(startError).toHaveTextContent('');
      expect(gamesError).toHaveTextContent('');
    })
  })
 
  describe('add an eliminator', () => {
    it('test if added eliminator', async () => {
      // ARRANGE
      const notElimsYet: elimType[] = [];
      const mockNoPotsYet = { ...mockZeroToNElimsProps, elims: notElimsYet };

      const user = userEvent.setup();
      render(<ZeroToNElims {...mockNoPotsYet} />);
      const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
      const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
      const createElimFee = fees[0];
      const divError = screen.queryByTestId("dangerElimDivRadio");      
      const feeError = screen.queryByTestId("dangerCreateElimFee");
      const startError = screen.queryByTestId("dangerCreateElimStart");
      const gamesError = screen.queryByTestId("dangerCreateElimGames");

      const addBtn = screen.getByRole('button', { name: /add eliminator/i });

      // ACT
      await user.click(scratchRadio);
      await user.click(createElimFee);
      await user.type(createElimFee, '13');
      await user.click(addBtn);
      // ASSERT
      expect(divError).toHaveTextContent('');        
      expect(feeError).toHaveTextContent('');      
      expect(startError).toHaveTextContent('');
      expect(gamesError).toHaveTextContent('');
      expect(mockZeroToNElimsProps.setElims).toHaveBeenCalled();
    })
  })

  describe('delete an eliminator', () => { 

    beforeEach(() => {
      jest.clearAllMocks();
    });    

    it('delete eliminator', async () => {
      const toDelProps = cloneDeep(mockZeroToNElimsProps);

      // ARRANGE
      const user = userEvent.setup();
      render(<ZeroToNElims {...toDelProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);   // toDelProps.elims.length + 1
      // ARRANGE
      await user.click(tabs[2]);      // tab for 2nd elim
      const delBtns = screen.getAllByText("Delete Eliminator");
      // ASSERT
      expect(delBtns.length).toBe(2); // toDelProps.elims.length
      // ACT
      await user.click(delBtns[1]);   // only 2 delete buttons, click the last one
      // ASSERT
      // get the buttons in the modal dialog      
      const yesBtn = await screen.findByRole('button', { name: /yes/i });
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(yesBtn);
      // ASSERT
      expect(toDelProps.setElims).toHaveBeenCalled();                    
    })
    it('cancels deleting an eliminator', async () => {      
      // ARRANGE
      const user = userEvent.setup();
      const delElimsProps = cloneDeep(mockZeroToNElimsProps);
      render(<ZeroToNElims {...delElimsProps} />);
      // ACT
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      // ARRANGE
      await user.click(tabs[2]);      // tab for second elim
      const delBtns = screen.getAllByText("Delete Eliminator");
      // ASSERT
      expect(delBtns.length).toBe(2); // delete buttons - one for each elim
      // ACT
      await user.click(delBtns[1]);   // click the last delete button
      // ASSERT
      // get the buttons in the modal dialog      
      const yesBtn = await screen.findByRole('button', { name: /yes/i });      
      expect(yesBtn).toBeInTheDocument();
      const noBtn = await screen.findByRole('button', { name: /no/i });      
      expect(noBtn).toBeInTheDocument();
      // ACT
      await user.click(noBtn);
      // ASSERT
      expect(mockSetShowingModal).toHaveBeenCalledWith(false);
      expect(mockSetElims).not.toHaveBeenCalled();      
    })      

  })

  describe("editing existing elim fee (handleAmountValueChange)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("clears fee_err and errClassName and sets AcdnErr to noAcdnErr when fee becomes valid", async () => {
      const user = userEvent.setup();

      // Start with an elim that has a fee_err + errClassName set
      const elimsWithError = cloneDeep(mockElims);
      elimsWithError[0].fee_err = "Fee cannot be less than $1.00";
      elimsWithError[0].errClassName = objErrClassName;

      render(
        <ZeroToNElims
          elims={elimsWithError}
          setElims={mockSetElims}
          divs={mockDivs}
          squads={mockSquads}
          setAcdnErr={mockSetAcdnErr}
          setShowingModal={mockSetShowingModal}
          isDisabled={false}
        />
      );

      // Go to the first existing elim tab (Scratch: 1-3)
      const tabs = screen.getAllByRole("tab");
      // index 0 is "Create Eliminator", index 1 is first elim
      await user.click(tabs[1]);

      const feeInputs = screen.getAllByRole("textbox", {
        name: /fee/i,
      }) as HTMLInputElement[];
      // index 0 = create-tab fee, index 1 = first elim fee
      const elimFeeInput = feeInputs[1];

      await user.clear(elimFeeInput);
      await user.type(elimFeeInput, "10");

      // handler should have called setElims at least once
      expect(mockSetElims).toHaveBeenCalled();

      const lastSetElimsCall =
        mockSetElims.mock.calls[mockSetElims.mock.calls.length - 1];
      const updatedElims = lastSetElimsCall[0] as elimType[];
      const updated = updatedElims.find(
        (e) => e.id === elimsWithError[0].id
      ) as elimType;

      // fee_err cleared and errClassName cleared on that elim
      expect(updated.fee_err).toBe("");
      expect(updated.errClassName).toBe("");

      // Accordion error should have been cleared to noAcdnErr
      const lastAcdnErrArg =
        mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

      expect(lastAcdnErrArg).toEqual(noAcdnErr);
    });
    it("sets AcdnErr message for the elim that still has an error when others are valid", async () => {
      const user = userEvent.setup();

      const elims = cloneDeep(mockElims);

      // Make sure elim[0] has no errors
      elims[0].div_err = "";
      elims[0].fee_err = "";
      elims[0].start_err = "";
      elims[0].games_err = "";
      elims[0].errClassName = "";

      // Seed elim[1] with a start_err (any non-fee error works here)
      elims[1].start_err = "Start cannot be less than 1";
      elims[1].div_err = "";
      elims[1].fee_err = "";
      elims[1].games_err = "";
      elims[1].errClassName = objErrClassName;

      render(
        <ZeroToNElims
          elims={elims}
          setElims={mockSetElims}
          divs={mockDivs}
          squads={mockSquads}
          setAcdnErr={mockSetAcdnErr}
          setShowingModal={mockSetShowingModal}
          isDisabled={false}
        />
      );

      const tabs = screen.getAllByRole("tab");
      // tab[2] is usually the second elim (index 0 = create, 1 = first elim, 2 = second elim)
      await user.click(tabs[2]);

      const feeInputs = screen.getAllByRole("textbox", {
        name: /fee/i,
      }) as HTMLInputElement[];
      // create fee = 0, first elim = 1, second elim = 2
      const secondElimFeeInput = feeInputs[2];

      // Change the fee; the important part is that the elim still has start_err
      await user.clear(secondElimFeeInput);
      await user.type(secondElimFeeInput, "7");

      expect(mockSetElims).toHaveBeenCalled();

      const lastAcdnErrArg =
        mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

      const secondElimName = getBrktOrElimName(elims[1], mockDivs);

      expect(lastAcdnErrArg.errClassName).toBe(acdnErrClassName);
      // Message should reference the correct eliminator name
      expect(lastAcdnErrArg.message).toEqual(
        expect.stringContaining(secondElimName)
      );
      // And the specific error message we seeded
      expect(lastAcdnErrArg.message).toEqual(
        expect.stringContaining("Start cannot be less than 1")
      );
    });
    it('shows fee error on Save for an eliminator with an invalid fee', () => {
      // Start from existing props (like after some user edits)
      const baseElims = cloneDeep(mockZeroToNElimsProps.elims);
      const editedId = baseElims[1].id;

      // Simulate that the parent now holds edited data with invalid fee
      const editedElims = baseElims.map((b) =>
        b.id === editedId
          ? { ...b, fee: (minFee - 0.01).toString() } // invalid
          : b
      );

      const parentSetElims: jest.Mock<void, [elimType[]]> = jest.fn();
      const parentSetAcdnErr: jest.Mock<void, [AcdnErrType]> = jest.fn();

      const isValid = validateElims(
        editedElims,
        parentSetElims,
        mockZeroToNElimsProps.divs,
        mockZeroToNElimsProps.squads[0].games,
        parentSetAcdnErr
      );

      // Now we *know* the fee is invalid, so validateElims must catch it
      expect(isValid).toBe(false);
      expect(parentSetElims).toHaveBeenCalledTimes(1);

      const validatedElims = parentSetElims.mock.calls[0][0] as elimType[];
      const editedAfter = validatedElims.find((b) => b.id === editedId)!;

      expect(editedAfter.fee_err).toMatch(/cannot be less than/i);

      expect(parentSetAcdnErr).toHaveBeenCalledWith(
        expect.objectContaining({
          errClassName: acdnErrClassName,
          message: expect.stringContaining("Fee cannot be less than"),
        })
      );
    });

  });

  describe("accordion error behavior on existing elims", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("sets AcdnErr and errClassName when editing the fee of an elim that still has an error", async () => {
      const user = userEvent.setup();

      // Start from the mock elims but inject an error on one existing elim
      const elimsWithError = cloneDeep(mockElims);

      // Make sure all start with clean errors
      for (const e of elimsWithError) {
        e.div_err = "";
        e.fee_err = "";
        e.start_err = "";
        e.games_err = "";
        e.errClassName = "";
      }

      // Choose the second elim to be the one with an existing error
      const errorElim = elimsWithError[1];
      errorElim.start_err = "Start cannot be more than 4";
      errorElim.errClassName = objErrClassName;

      render(
        <ZeroToNElims
          elims={elimsWithError}
          setElims={mockSetElims}
          divs={mockDivs}
          squads={mockSquads}
          setAcdnErr={mockSetAcdnErr}
          setShowingModal={mockSetShowingModal}
          isDisabled={false}
        />
      );

      // Tabs: [0] Create Eliminator, [1] first elim, [2] second elim (our error elim)
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[2]);

      const feeInputs = screen.getAllByRole("textbox", {
        name: /fee/i,
      }) as HTMLInputElement[];

      // feeInputs[0] = create-tab fee, [1] = first elim, [2] = second elim
      const secondElimFeeInput = feeInputs[2];

      // Edit the fee (any numeric value; the important part is that the elim still has start_err)
      await user.clear(secondElimFeeInput);
      await user.type(secondElimFeeInput, "7");

      expect(mockSetElims).toHaveBeenCalled();

      // Grab the last setElims call and inspect the updated elims
      const lastSetElimsCall =
        mockSetElims.mock.calls[mockSetElims.mock.calls.length - 1];
      const updatedElims = lastSetElimsCall[0] as elimType[];
      const updatedErrorElim = updatedElims.find(
        (e) => e.id === errorElim.id
      ) as elimType;

      // The underlying error (start_err) should still be present
      expect(updatedErrorElim.start_err).toBe("Start cannot be more than 4");
      // And this elim should be styled with objErrClassName
      expect(updatedErrorElim.errClassName).toBe(objErrClassName);

      // Accordion error should have been set based on getNextElimAcdnErrMsg
      expect(mockSetAcdnErr).toHaveBeenCalled();

      const lastAcdnErrArg =
        mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

      const errorElimName = getBrktOrElimName(errorElim, mockDivs);

      expect(lastAcdnErrArg.errClassName).toBe(acdnErrClassName);
      expect(lastAcdnErrArg.message).toEqual(
        expect.stringContaining(errorElimName)
      );
      expect(lastAcdnErrArg.message).toEqual(
        expect.stringContaining("Start cannot be more than 4")
      );
    });
  });

})