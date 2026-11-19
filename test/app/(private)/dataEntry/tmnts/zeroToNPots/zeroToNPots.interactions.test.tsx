// test/app/(private)/dataEntry/tmnts/zeroToNPots/zeroToNPots.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNPots.tsx
// (validatePots is tested in zeroToNPots.validate.test.tsx)
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNPots from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
import type { potType } from "@/lib/types/types";
import {
  maxMoney,
  minFee,
  ptGame,
  ptLastGame,
  ptSeries,
} from "@/lib/validation/constants";
import {
  divId1,
  mockTmntFullData,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { getDivName, getPotName } from "@/lib/getName";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";

type Props = React.ComponentProps<typeof ZeroToNPots>;
type User = ReturnType<typeof userEvent.setup>;

// NOTE: a fee like "abc" can't be typed into EaCurrencyInput, so the
// "Invalid Fee" error is tested in zeroToNPots.validate.test.tsx

// ---------------------------------------------------------------------------
// data and expected messages
// ---------------------------------------------------------------------------

const divs = mockTmntFullData.divs;
const scratchName = divs.find((d) => d.id === divId1)!.div_name;
const otherDiv = divs.find((d) => d.id !== divId1)!;

const potTypeRequiredMsg = "Pot Type is required";
const divRequiredMsg = "Division is required";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;
const duplicateMsg = (potType: string, divId: string) =>
  `Pot: ${potType} - ${getDivName(divId, divs)} already exists`;

/** fresh copy of the mock pots with all errors cleared */
const cleanPots = (): potType[] =>
  cloneDeep(mockTmntFullData.pots).map((p) => ({
    ...p,
    pot_type_err: "",
    div_err: "",
    fee_err: "",
    errClassName: "",
  }));

/** a valid pot; override any field */
const makePot = (overrides: Partial<potType> = {}): potType => ({
  ...cleanPots()[0],
  ...overrides,
});

const potName = (pot: potType) => getPotName(pot, divs);

const acdnErr = (pot: potType, errMsg: string) => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(potName(pot), errMsg),
});

/** a pot type that is not used by any pot in the given division */
const unusedPotType = (pots: potType[], divId: string) =>
  [ptGame, ptLastGame, ptSeries].find(
    (t) => !pots.some((p) => p.pot_type === t && p.div_id === divId),
  )!;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNPots with mock setters; any prop can be overridden */
const renderPots = (overrides: Partial<Props> = {}) => {
  const setPots = jest.fn();
  const setAcdnErr = jest.fn();
  const setShowingModal = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    pots: cleanPots(),
    setPots,
    divs: cloneDeep(divs),
    squads: cloneDeep(mockTmntFullData.squads),
    setAcdnErr,
    setShowingModal,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<ZeroToNPots {...props} />);
  return { props, setPots, setAcdnErr, setShowingModal, markPendingChanges };
};

/** wraps ZeroToNPots in real state, so setPots re-renders it */
const StatefulPots: React.FC<{ initialPots: potType[] }> = ({ initialPots }) => {
  const [pots, setPots] = React.useState(initialPots);
  return (
    <ZeroToNPots
      pots={pots}
      setPots={setPots}
      divs={divs}
      squads={mockTmntFullData.squads}
      setAcdnErr={jest.fn()}
      setShowingModal={jest.fn()}
      isDisabled={false}
    />
  );
};

const lastArg = <T,>(fn: jest.Mock): T =>
  fn.mock.calls[fn.mock.calls.length - 1][0];

const createPanel = () => screen.getByRole("tabpanel", { name: /create pot/i });
const panelFor = (pot: potType) =>
  screen.getByRole("tabpanel", { name: potName(pot) });

const createFee = () => within(createPanel()).getByLabelText(/^fee$/i);
const addBtn = () => within(createPanel()).getByRole("button", { name: /add pot/i });

const potTypeErr = () => screen.getByTestId("dangerPotType");
const divErr = () => screen.getByTestId("dangerDiv");
const feeErr = () => screen.getByTestId("dangerPotFee");

/** fills in the Create Pot form; leave a field out to skip it */
const fillCreate = async (
  user: User,
  { potType, divName, fee }: { potType?: string; divName?: string; fee?: string },
) => {
  if (potType) {
    await user.click(within(createPanel()).getByRole("radio", { name: potType }));
  }
  if (divName) {
    await user.click(within(createPanel()).getByRole("radio", { name: divName }));
  }
  if (fee !== undefined) {
    await user.clear(createFee());
    if (fee) await user.type(createFee(), fee);
  }
};

/** clicks Delete for a pot, then Yes in the confirm dialog */
const deleteAndConfirm = async (user: User, pot: potType) => {
  await user.click(within(panelFor(pot)).getByRole("button", { name: /delete pot/i }));
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /yes/i }));
};

const editFee = (pot: potType, value: string) =>
  fireEvent.change(within(panelFor(pot)).getByLabelText(/^fee$/i), {
    target: { value },
  });

const valid = { potType: ptGame, divName: scratchName, fee: "5" };

// ---------------------------------------------------------------------------

describe("ZeroToNPots - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add a pot", () => {
    it("passes the pots plus the new pot to setPots when every field is valid", async () => {
      const user = userEvent.setup();
      const { setPots, markPendingChanges, props } = renderPots({ pots: [] });

      await fillCreate(user, valid);
      await user.click(addBtn());

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setPots).toHaveBeenCalledTimes(1);

      const updated = lastArg<potType[]>(setPots);
      expect(updated).toHaveLength(1);
      const newPot = updated[0];
      expect(newPot.id).toMatch(/^pot_/);
      expect(newPot.pot_type).toBe(ptGame);
      expect(newPot.div_id).toBe(divId1);
      expect(newPot.squad_id).toBe(props.squads[0].id);
      expect(Number(newPot.fee)).toBe(5);
      expect(newPot.pot_type_err).toBe("");
      expect(newPot.div_err).toBe("");
      expect(newPot.fee_err).toBe("");

      expect(potTypeErr()).toBeEmptyDOMElement();
      expect(divErr()).toBeEmptyDOMElement();
      expect(feeErr()).toBeEmptyDOMElement();
    });

    it("keeps the existing pots, in order, ahead of the new pot", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const { setPots } = renderPots({ pots });

      await fillCreate(user, {
        potType: unusedPotType(pots, divId1),
        divName: scratchName,
        fee: "5",
      });
      await user.click(addBtn());

      const updated = lastArg<potType[]>(setPots);
      expect(updated).toHaveLength(pots.length + 1);
      expect(updated.slice(0, pots.length)).toEqual(pots);
    });

    it("gives the first new pot the next sort_order after the existing pots", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const { setPots } = renderPots({ pots });

      await fillCreate(user, {
        potType: unusedPotType(pots, divId1),
        divName: scratchName,
        fee: "5",
      });
      await user.click(addBtn());

      const updated = lastArg<potType[]>(setPots);
      // before the fix this was initPot's sort_order, the same as an existing pot
      expect(updated[updated.length - 1].sort_order).toBe(
        pots[pots.length - 1].sort_order + 1,
      );
    });

    it("gives the first pot sort_order 1 when there are none yet", async () => {
      const user = userEvent.setup();
      const { setPots } = renderPots({ pots: [] });

      await fillCreate(user, valid);
      await user.click(addBtn());

      expect(lastArg<potType[]>(setPots)[0].sort_order).toBe(1);
    });

    it("adds a tab for each new pot and keeps the Create Pot tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulPots initialPots={[]} />);

      await fillCreate(user, valid);
      await user.click(addBtn());
      await fillCreate(user, { potType: ptSeries });
      await user.click(addBtn());

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3); // Create + 2 pots
      expect(tabs[0]).toHaveTextContent("Create Pot");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("keeps the create form's values after adding, so adding again shows the duplicate error", async () => {
      const user = userEvent.setup();
      render(<StatefulPots initialPots={[]} />);

      await fillCreate(user, valid);
      await user.click(addBtn());
      await user.click(addBtn());

      expect(potTypeErr()).toHaveTextContent(duplicateMsg(ptGame, divId1));
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });
  });

  describe("create form errors", () => {
    it.each([
      ["no pot type", { ...valid, potType: undefined }, "potType", potTypeRequiredMsg],
      ["no division", { ...valid, divName: undefined }, "div", divRequiredMsg],
      ["a fee below the minimum", { ...valid, fee: (minFee - 0.01).toFixed(2) }, "fee", feeLowMsg],
      ["a fee above the maximum", { ...valid, fee: String(maxMoney + 1) }, "fee", feeHighMsg],
      ["no fee", { ...valid, fee: "" }, "fee", feeLowMsg],
    ] as const)(
      "with %s, shows only that error and adds nothing",
      async (_label, fields, errField, msg) => {
        const user = userEvent.setup();
        const { setPots, markPendingChanges } = renderPots({ pots: [] });

        await fillCreate(user, fields);
        await user.click(addBtn());

        expect(markPendingChanges).toHaveBeenCalledWith(true);
        const errs = { potType: potTypeErr(), div: divErr(), fee: feeErr() };
        expect(errs[errField]).toHaveTextContent(msg);
        (Object.keys(errs) as (keyof typeof errs)[])
          .filter((key) => key !== errField)
          .forEach((key) => expect(errs[key]).toBeEmptyDOMElement());
        expect(setPots).not.toHaveBeenCalled();
      },
    );

    it("shows every error at once when nothing is filled in", async () => {
      const user = userEvent.setup();
      const { setPots } = renderPots();

      await user.click(addBtn());

      expect(potTypeErr()).toHaveTextContent(potTypeRequiredMsg);
      expect(divErr()).toHaveTextContent(divRequiredMsg);
      expect(feeErr()).toHaveTextContent(feeLowMsg);
      expect(setPots).not.toHaveBeenCalled();
    });

    it("marks the fee input as invalid when the fee has an error", async () => {
      const user = userEvent.setup();
      renderPots({ pots: [] });

      expect(createFee()).not.toHaveClass("is-invalid");
      await user.click(addBtn());

      expect(createFee()).toHaveClass("is-invalid");
    });

    it("shows the duplicate error for the same pot type and division as an existing pot", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const existing = pots[0];
      const { setPots } = renderPots({ pots });

      await fillCreate(user, {
        potType: existing.pot_type,
        divName: getDivName(existing.div_id, divs),
        fee: "5",
      });
      await user.click(addBtn());

      expect(potTypeErr()).toHaveTextContent(
        duplicateMsg(existing.pot_type, existing.div_id),
      );
      expect(setPots).not.toHaveBeenCalled();
    });

    it("clears each error as its field is changed", async () => {
      const user = userEvent.setup();
      renderPots({ pots: [] });

      await user.click(addBtn());

      await fillCreate(user, { potType: ptGame });
      expect(potTypeErr()).toBeEmptyDOMElement();
      await fillCreate(user, { divName: scratchName });
      expect(divErr()).toBeEmptyDOMElement();
      await fillCreate(user, { fee: "20" });
      expect(feeErr()).toBeEmptyDOMElement();
    });

    it("picking a division keeps a 'Pot Type is required' error", async () => {
      const user = userEvent.setup();
      renderPots({ pots: [] });

      await user.click(addBtn());
      await fillCreate(user, { divName: scratchName });

      expect(potTypeErr()).toHaveTextContent(potTypeRequiredMsg);
    });

    it("picking another division clears a duplicate error", async () => {
      const user = userEvent.setup();
      const pots = [makePot({ pot_type: ptGame, div_id: divId1 })];
      renderPots({ pots });

      await fillCreate(user, valid);
      await user.click(addBtn());
      expect(potTypeErr()).toHaveTextContent(duplicateMsg(ptGame, divId1));

      await fillCreate(user, { divName: otherDiv.div_name });

      expect(potTypeErr()).toBeEmptyDOMElement();
    });

    it("picking another pot type clears a duplicate error, and the pot can be added", async () => {
      const user = userEvent.setup();
      const pots = [makePot({ pot_type: ptGame, div_id: divId1 })];
      const { setPots } = renderPots({ pots });

      await fillCreate(user, valid);
      await user.click(addBtn());
      expect(potTypeErr()).toHaveTextContent(duplicateMsg(ptGame, divId1));
      expect(setPots).not.toHaveBeenCalled();

      await fillCreate(user, { potType: ptSeries });
      expect(potTypeErr()).toBeEmptyDOMElement();
      await user.click(addBtn());

      expect(setPots).toHaveBeenCalledTimes(1);
      expect(lastArg<potType[]>(setPots)[1].pot_type).toBe(ptSeries);
    });
  });

  describe("with only one division", () => {
    const oneDiv = () => [cloneDeep(divs.find((d) => d.id === divId1)!)];

    it("picks the only division for the user, so Add works without clicking it", async () => {
      const user = userEvent.setup();
      const { setPots } = renderPots({ pots: [], divs: oneDiv() });

      expect(
        within(createPanel()).getByRole("radio", { name: scratchName }),
      ).toBeChecked();

      await fillCreate(user, { potType: ptGame, fee: "5" });
      await user.click(addBtn());

      expect(divErr()).toBeEmptyDOMElement();
      expect(lastArg<potType[]>(setPots)[0].div_id).toBe(divId1);
    });

    it("does not pick a division when there is more than one", () => {
      renderPots({ pots: [] });

      divs.forEach((div) =>
        expect(
          within(createPanel()).getByRole("radio", { name: div.div_name }),
        ).not.toBeChecked(),
      );
    });
  });

  describe("delete a pot", () => {
    it("asks to confirm with the pot's name, then removes it", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const target = pots[1];
      const { setPots, setShowingModal, markPendingChanges } = renderPots({ pots });

      await user.click(within(panelFor(target)).getByRole("button", { name: /delete pot/i }));

      expect(setShowingModal).toHaveBeenCalledWith(true);
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText(`Do you want to delete Pot: ${potName(target)}?`),
      ).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(lastArg(setPots)).toEqual(pots.filter((p) => p.id !== target.id));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("clears the accordion error when the deleted pot had the only error", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      pots[1].fee_err = feeLowMsg;
      pots[1].errClassName = objErrClassName;
      const { setAcdnErr } = renderPots({ pots });

      await deleteAndConfirm(user, pots[1]);

      // before the fix, delete never touched the accordion error
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("sets the accordion error to the next pot that still has an error", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      pots[0].fee_err = feeLowMsg;
      const { setAcdnErr } = renderPots({ pots });

      await deleteAndConfirm(user, pots[1]);

      expect(lastArg(setAcdnErr)).toEqual(acdnErr(pots[0], feeLowMsg));
    });

    it("makes the Create Pot tab active after a delete", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      render(<StatefulPots initialPots={pots} />);

      await user.click(screen.getByRole("tab", { name: potName(pots[1]) }));
      await deleteAndConfirm(user, pots[1]);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(pots.length); // Create + (pots.length - 1) left
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user clicks No", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const { setPots, setAcdnErr, setShowingModal, markPendingChanges } =
        renderPots({ pots });

      await user.click(within(panelFor(pots[1])).getByRole("button", { name: /delete pot/i }));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /no/i }));

      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(setPots).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });

    it("does not submit a surrounding form", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <ZeroToNPots
            pots={pots}
            setPots={jest.fn()}
            divs={divs}
            squads={mockTmntFullData.squads}
            setAcdnErr={jest.fn()}
            setShowingModal={jest.fn()}
            isDisabled={false}
          />
        </form>,
      );

      await user.click(within(panelFor(pots[0])).getByRole("button", { name: /delete pot/i }));

      // before the fix, the Delete button had no type, so it was a submit button
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("edit an existing pot's fee", () => {
    it("typing clears its fee error and red tab, and the accordion error", () => {
      const pots = cleanPots();
      pots[0].fee_err = feeLowMsg;
      pots[0].errClassName = objErrClassName;
      const { setPots, setAcdnErr, markPendingChanges } = renderPots({ pots });

      editFee(pots[0], "34");

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const edited = lastArg<potType[]>(setPots).find((p) => p.id === pots[0].id)!;
      expect(edited.fee).toBe("34");
      expect(edited.fee_err).toBe("");
      expect(edited.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited pot", () => {
      const pots = cleanPots();
      const { setPots } = renderPots({ pots });

      editFee(pots[1], "34");

      const updated = lastArg<potType[]>(setPots);
      expect(updated[0]).toBe(pots[0]);
      expect(updated).toHaveLength(pots.length);
    });

    it("sets the accordion error to another pot's error when the edited one is fixed", () => {
      const pots = cleanPots();
      pots[0].fee = "0";
      pots[0].fee_err = feeLowMsg;
      pots[0].errClassName = objErrClassName;
      const { setPots, setAcdnErr } = renderPots({ pots });

      editFee(pots[1], "34");

      const edited = lastArg<potType[]>(setPots).find((p) => p.id === pots[1].id)!;
      expect(edited.fee).toBe("34");
      expect(edited.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(acdnErr(pots[0], feeLowMsg));
    });
  });

  describe("isDisabled = true", () => {
    it("hides the Create Pot tab and makes the first pot's tab active", () => {
      const pots = cleanPots();
      renderPots({ pots, isDisabled: true });

      expect(screen.queryByRole("tab", { name: /create pot/i })).not.toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(pots.length);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("disables every fee and Delete button, and typing or clicking does nothing", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const { setPots, setShowingModal, markPendingChanges } = renderPots({
        pots,
        isDisabled: true,
      });

      for (const pot of pots) {
        const panel = panelFor(pot);
        const fee = within(panel).getByLabelText(/^fee$/i);
        const del = within(panel).getByRole("button", { name: /delete pot/i });
        expect(fee).toBeDisabled();
        expect(del).toBeDisabled();
        expect(del).toHaveClass("btn-dark");
        await user.type(fee, "9");
        await user.click(del);
      }

      expect(setPots).not.toHaveBeenCalled();
      expect(setShowingModal).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds a pot without crashing", async () => {
      const user = userEvent.setup();
      const { setPots } = renderPots({ pots: [], markPendingChanges: undefined });

      await fillCreate(user, valid);
      await user.click(addBtn());

      expect(setPots).toHaveBeenCalledTimes(1);
    });

    it("updates an existing pot's fee without crashing", () => {
      const pots = cleanPots();
      const { setPots } = renderPots({ pots, markPendingChanges: undefined });

      editFee(pots[0], "10");

      expect(setPots).toHaveBeenCalled();
    });

    it("deletes a pot without crashing", async () => {
      const user = userEvent.setup();
      const pots = cleanPots();
      const { setPots } = renderPots({ pots, markPendingChanges: undefined });

      await deleteAndConfirm(user, pots[1]);

      expect(setPots).toHaveBeenCalled();
    });
  });
});
