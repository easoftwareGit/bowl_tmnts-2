import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNElims from "@/app/dataEntry/tmntForm/zeroToNElims";
import { elimType, tmntActions } from "@/lib/types/types";
import { minFee, maxMoney, maxGames, minGames } from "@/lib/validation";
import { divId1, mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { max } from "lodash";

const mockSetElims = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockElims = mockTmntFullData.elims;
const mockDivs = mockTmntFullData.divs;
const mockSquads = mockTmntFullData.squads;

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
      tmntAction={tmntActions.New}
    />
  );
};

describe("ZeroToNElims - Create Eliminator tab", () => {
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
