import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ZeroToNBrackets from "@/app/dataEntry/tmntForm/zeroToNBrkts";
import { brktType, tmntActions } from "@/lib/types/types";
import { mockTmntFullData, divId1 } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { minFee, maxMoney, maxGames } from "@/lib/validation";

const mockSetBrkts = jest.fn();
const mockSetAcdnErr = jest.fn();
const mockSetShowingModal = jest.fn();

const mockSquads = mockTmntFullData.squads;

const baseProps = {
  brkts: [] as brktType[],
  setBrkts: mockSetBrkts,
  divs: mockTmntFullData.divs,
  squads: mockTmntFullData.squads,
  setAcdnErr: mockSetAcdnErr,
  setShowingModal: mockSetShowingModal,
  tmntAction: tmntActions.New,
};

const renderCreateBrkt = (brktsOverride?: brktType[]) => {
  mockSetBrkts.mockClear();
  mockSetAcdnErr.mockClear();

  const brkts = brktsOverride ?? [];
  render(<ZeroToNBrackets {...baseProps} brkts={brkts} />);
};

describe("ZeroToNBrackets - Create Bracket tab", () => {
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
});
