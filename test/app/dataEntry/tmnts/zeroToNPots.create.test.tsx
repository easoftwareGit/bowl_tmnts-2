import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNPots from "@/app/dataEntry/tmntForm/zeroToNPots";
import { potType, tmntActions } from "@/lib/types/types";
import { minFee, maxMoney } from "@/lib/validation";
import { divId1, mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

const mockSetPots = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockDivs = mockTmntFullData.divs;
const mockSquads = mockTmntFullData.squads;

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
      tmntAction={tmntActions.New}
    />
  );
};

describe("ZeroToNPots - Create Pot tab", () => {
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
