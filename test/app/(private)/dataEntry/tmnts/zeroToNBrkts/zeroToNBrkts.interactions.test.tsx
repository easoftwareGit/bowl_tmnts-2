// test/app/(private)/dataEntry/tmnts/zeroToNBrkts/zeroToNBrkts.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNBrkts.tsx
// (validateBrkts and validateBrkt are tested in zeroToNBrkts.validate.test.tsx)
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNBrackets from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
import type { brktType, squadType } from "@/lib/types/types";
import {
  divId1,
  mockTmntFullData,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { defaultBrktGames } from "@/lib/db/initVals";
import { maxMoney, minFee } from "@/lib/validation/constants";
import {
  maxMoneyText,
  minFeeText,
} from "@/components/currency/eaCurrencyInput";
import { getBrktOrElimName } from "@/lib/getName";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";

type Props = React.ComponentProps<typeof ZeroToNBrackets>;
type User = ReturnType<typeof userEvent.setup>;

// ---------------------------------------------------------------------------
// data and expected messages
// ---------------------------------------------------------------------------

const divs = mockTmntFullData.divs;
const squadGames = mockTmntFullData.squads[0].games;
const maxStart = squadGames - (defaultBrktGames - 1);
const scratchName = divs.find((d) => d.id === divId1)!.div_name;

const divRequiredMsg = "Division is required";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;
const startLowMsg = "Start cannot be less than 1";
const startHighMsg = "Start cannot be more than " + maxStart;
const duplicateMsg = "Bracket - Division & Start already exists";

/** fresh copy of the mock brkts with all errors cleared */
const cleanBrkts = (): brktType[] =>
  cloneDeep(mockTmntFullData.brkts).map((b) => ({
    ...b,
    div_err: "",
    start_err: "",
    fee_err: "",
    errClassName: "",
  }));

const brktName = (brkt: brktType) => getBrktOrElimName(brkt, divs);

const acdnErr = (objName: string, errMsg: string) => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNBrackets with mock setters; any prop can be overridden */
const renderBrkts = (overrides: Partial<Props> = {}) => {
  const setBrkts = jest.fn();
  const setAcdnErr = jest.fn();
  const setShowingModal = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    brkts: cleanBrkts(),
    setBrkts,
    divs: cloneDeep(divs),
    squads: cloneDeep(mockTmntFullData.squads),
    setAcdnErr,
    setShowingModal,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<ZeroToNBrackets {...props} />);
  return { props, setBrkts, setAcdnErr, setShowingModal, markPendingChanges };
};

/** wraps ZeroToNBrackets in real state, so setBrkts re-renders it */
const StatefulBrkts: React.FC<{ initialBrkts: brktType[] }> = ({
  initialBrkts,
}) => {
  const [brkts, setBrkts] = React.useState(initialBrkts);
  return (
    <ZeroToNBrackets
      brkts={brkts}
      setBrkts={setBrkts}
      divs={divs}
      squads={mockTmntFullData.squads}
      setAcdnErr={jest.fn()}
      setShowingModal={jest.fn()}
      isDisabled={false}
    />
  );
};

/** StatefulBrkts with no brkts and only the Scratch division */
const StatefulOneDiv: React.FC = () => {
  const [brkts, setBrkts] = React.useState<brktType[]>([]);
  return (
    <ZeroToNBrackets
      brkts={brkts}
      setBrkts={setBrkts}
      divs={divs.filter((d) => d.id === divId1)}
      squads={mockTmntFullData.squads}
      setAcdnErr={jest.fn()}
      setShowingModal={jest.fn()}
      isDisabled={false}
    />
  );
};

const lastArg = <T,>(fn: jest.Mock): T =>
  fn.mock.calls[fn.mock.calls.length - 1][0];

const createPanel = () =>
  screen.getByRole("tabpanel", { name: /create bracket/i });
const panelFor = (brkt: brktType) =>
  screen.getByRole("tabpanel", { name: brktName(brkt) });

const createFee = () => within(createPanel()).getByLabelText(/^fee$/i);
const createStart = () => within(createPanel()).getByLabelText(/^start$/i);
const addBtn = () =>
  within(createPanel()).getByRole("button", { name: /add bracket/i });

const divErr = () => screen.getByTestId("dangerBrktDivRadio");
const feeErr = () => screen.getByTestId("dangerCreateBrktFee");
const startErr = () => screen.getByTestId("dangerCreateBrktStart");

/** fills in the Create Bracket form; leave a field out to skip it */
const fillCreate = async (
  user: User,
  { divName, fee, start }: { divName?: string; fee?: string; start?: string },
) => {
  if (divName) {
    await user.click(within(createPanel()).getByRole("radio", { name: divName }));
  }
  if (fee !== undefined) {
    await user.clear(createFee());
    if (fee) await user.type(createFee(), fee);
  }
  if (start !== undefined) {
    await user.clear(createStart());
    if (start) await user.type(createStart(), start);
  }
};

/** the money fields shown in a panel */
const moneyIn = (panel: HTMLElement) => ({
  first: within(panel).getByLabelText(/^first$/i) as HTMLInputElement,
  second: within(panel).getByLabelText(/^second$/i) as HTMLInputElement,
  admin: within(panel).getByLabelText(/^admin$/i) as HTMLInputElement,
  fsa: within(panel).getByLabelText(/f\+s\+a/i) as HTMLInputElement,
});

/** clicks Delete for a brkt, then Yes in the confirm dialog */
const deleteAndConfirm = async (user: User, brkt: brktType) => {
  await user.click(
    within(panelFor(brkt)).getByRole("button", { name: /delete bracket/i }),
  );
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /yes/i }));
};

// ---------------------------------------------------------------------------

describe("ZeroToNBrackets - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add a bracket", () => {
    it("passes the brkts plus the new brkt to setBrkts when every field is valid", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const { setBrkts, markPendingChanges, props } = renderBrkts({ brkts });

      // start 2 is not used by the mock brkts
      await fillCreate(user, { divName: scratchName, fee: "5", start: "2" });
      await user.click(addBtn());

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setBrkts).toHaveBeenCalledTimes(1);

      const updated = lastArg<brktType[]>(setBrkts);
      expect(updated).toHaveLength(brkts.length + 1);
      expect(updated.slice(0, brkts.length)).toEqual(brkts);

      const newBrkt = updated[updated.length - 1];
      expect(newBrkt.id).toMatch(/^brk_/);
      expect(newBrkt.div_id).toBe(divId1);
      expect(newBrkt.squad_id).toBe(props.squads[0].id);
      expect(newBrkt.start).toBe(2);
      expect(Number(newBrkt.fee)).toBe(5);
      expect(newBrkt.div_err).toBe("");
      expect(newBrkt.fee_err).toBe("");
      expect(newBrkt.start_err).toBe("");
    });

    it("gives the first new brkt the next sort_order after the existing brkts", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const { setBrkts } = renderBrkts({ brkts });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "2" });
      await user.click(addBtn());

      const updated = lastArg<brktType[]>(setBrkts);
      // before the fix this was initBrkt's sort_order, the same as an existing brkt
      expect(updated[updated.length - 1].sort_order).toBe(
        brkts[brkts.length - 1].sort_order + 1,
      );
    });

    it("gives the first brkt sort_order 1 when there are none yet", async () => {
      const user = userEvent.setup();
      const { setBrkts } = renderBrkts({ brkts: [] });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());

      expect(lastArg<brktType[]>(setBrkts)[0].sort_order).toBe(1);
    });

    it("adds a tab for each new brkt and keeps the Create Bracket tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulBrkts initialBrkts={[]} />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());
      await fillCreate(user, { start: "2" });
      await user.click(addBtn());

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3); // Create + 2 brkts
      expect(tabs[0]).toHaveTextContent("Create Bracket");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("keeps the create form's values after adding, so adding again shows the duplicate error", async () => {
      const user = userEvent.setup();
      render(<StatefulBrkts initialBrkts={[]} />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());
      expect(screen.getAllByRole("tab")).toHaveLength(2);

      await user.click(addBtn());

      expect(startErr()).toHaveTextContent(duplicateMsg);
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("calculates First, Second, Admin and F+S+A when the fee loses focus", async () => {
      const user = userEvent.setup();
      renderBrkts({ brkts: [] });

      await fillCreate(user, { fee: "5" });
      await user.tab();

      const money = moneyIn(createPanel());
      // updateFSA: first = fee * 5, second = fee * 2, admin = fee, fsa = fee * 8
      expect(money.first.value).toMatch(/25\.00/);
      expect(money.second.value).toMatch(/10\.00/);
      expect(money.admin.value).toMatch(/5\.00/);
      expect(money.fsa.value).toMatch(/40\.00/);
    });

    it("clears the fee and First, Second, Admin and F+S+A when the fee is cleared", async () => {
      const user = userEvent.setup();
      renderBrkts({ brkts: [] });

      await fillCreate(user, { fee: "5" });
      await user.tab();
      await fillCreate(user, { fee: "" });
      await user.tab();

      const money = moneyIn(createPanel());
      expect(createFee()).toHaveValue("");
      expect(money.first).toHaveValue("");
      expect(money.second).toHaveValue("");
      expect(money.admin).toHaveValue("");
      expect(money.fsa).toHaveValue("");
    });
  });

  describe("create form errors", () => {
    it.each([
      ["no division", { fee: "5", start: "1" }, "div", divRequiredMsg],
      [
        "a fee below the minimum",
        { divName: scratchName, fee: (minFee - 0.01).toFixed(2), start: "1" },
        "fee",
        feeLowMsg,
      ],
      [
        "a fee above the maximum",
        { divName: scratchName, fee: (maxMoney + 1).toString(), start: "1" },
        "fee",
        feeHighMsg,
      ],
      [
        "a start below 1",
        { divName: scratchName, fee: "5", start: "0" },
        "start",
        startLowMsg,
      ],
      [
        "a start above the last start game",
        { divName: scratchName, fee: "5", start: String(maxStart + 1) },
        "start",
        startHighMsg,
      ],
    ] as const)(
      "with %s, shows only that error and adds nothing",
      async (_label, fields, errField, msg) => {
        const user = userEvent.setup();
        const { setBrkts, markPendingChanges } = renderBrkts({ brkts: [] });

        await fillCreate(user, fields);
        await user.click(addBtn());

        expect(markPendingChanges).toHaveBeenCalledWith(true);
        const errs = { div: divErr(), fee: feeErr(), start: startErr() };
        expect(errs[errField]).toHaveTextContent(msg);
        // the other two error messages stay empty
        (Object.keys(errs) as (keyof typeof errs)[])
          .filter((key) => key !== errField)
          .forEach((key) => expect(errs[key]).toBeEmptyDOMElement());
        expect(setBrkts).not.toHaveBeenCalled();
      },
    );

    it("shows every error at once when nothing is valid", async () => {
      const user = userEvent.setup();
      const { setBrkts } = renderBrkts({ brkts: [] });

      await fillCreate(user, { start: String(maxStart + 1) });
      await user.click(addBtn());

      expect(divErr()).toHaveTextContent(divRequiredMsg);
      expect(feeErr()).toHaveTextContent(feeLowMsg);
      expect(startErr()).toHaveTextContent(startHighMsg);
      expect(setBrkts).not.toHaveBeenCalled();
    });

    it("shows the duplicate error for the same division and start as an existing brkt", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const existing = brkts[0];
      const { setBrkts } = renderBrkts({ brkts });

      await fillCreate(user, {
        divName: divs.find((d) => d.id === existing.div_id)!.div_name,
        fee: "5",
        start: String(existing.start),
      });
      await user.click(addBtn());

      expect(startErr()).toHaveTextContent(duplicateMsg);
      expect(setBrkts).not.toHaveBeenCalled();
    });

    it("clears each error as its field is changed", async () => {
      const user = userEvent.setup();
      renderBrkts({ brkts: [] });

      await fillCreate(user, { start: String(maxStart + 1) });
      await user.click(addBtn());

      await fillCreate(user, { divName: scratchName });
      expect(divErr()).toBeEmptyDOMElement();
      await fillCreate(user, { fee: "5" });
      expect(feeErr()).toBeEmptyDOMElement();
      await fillCreate(user, { start: "1" });
      expect(startErr()).toBeEmptyDOMElement();
    });

    it("picking a division keeps a real start error", async () => {
      const user = userEvent.setup();
      renderBrkts({ brkts: [] });

      await fillCreate(user, { fee: "5", start: String(maxStart + 1) });
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(startHighMsg);

      await fillCreate(user, { divName: scratchName });

      // before the fix, "=" instead of "===" cleared every start error here
      expect(startErr()).toHaveTextContent(startHighMsg);
    });

    it("picking a division clears a duplicate error", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const existing = brkts[0];
      const otherDiv = divs.find((d) => d.id !== existing.div_id);
      // this test needs a 2nd division in the mock data
      expect(otherDiv).toBeDefined();
      renderBrkts({ brkts });

      await fillCreate(user, {
        divName: divs.find((d) => d.id === existing.div_id)!.div_name,
        fee: "5",
        start: String(existing.start),
      });
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(duplicateMsg);

      await fillCreate(user, { divName: otherDiv!.div_name });
      expect(startErr()).toBeEmptyDOMElement();
    });

    it("shows a start error instead of crashing when the squad has too few games", async () => {
      const user = userEvent.setup();
      const squads: squadType[] = [
        { ...cloneDeep(mockTmntFullData.squads[0]), games: defaultBrktGames - 1 },
      ];
      const { setBrkts } = renderBrkts({ brkts: [], squads });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      // before the fix, validateBrkt returned null here and Add threw
      await user.click(addBtn());

      expect(startErr()).toHaveTextContent(
        `Squad needs at least ${defaultBrktGames} games for a bracket`,
      );
      expect(setBrkts).not.toHaveBeenCalled();
    });
  });

  describe("with only one division", () => {
    const oneDiv = () => [cloneDeep(divs.find((d) => d.id === divId1)!)];

    it("shows one division radio, and adds a brkt for it", async () => {
      const user = userEvent.setup();
      const { setBrkts } = renderBrkts({ brkts: [], divs: oneDiv() });

      expect(within(createPanel()).getAllByRole("radio")).toHaveLength(1);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());

      const [newBrkt] = lastArg<brktType[]>(setBrkts);
      expect(newBrkt.div_id).toBe(divId1);
    });

    it("picks the only division for the user, so Add works without clicking it", async () => {
      const user = userEvent.setup();
      const { setBrkts } = renderBrkts({ brkts: [], divs: oneDiv() });

      expect(
        within(createPanel()).getByRole("radio", { name: scratchName }),
      ).toBeChecked();

      // no division click
      await fillCreate(user, { fee: "5", start: "1" });
      await user.click(addBtn());

      expect(divErr()).toBeEmptyDOMElement();
      expect(lastArg<brktType[]>(setBrkts)[0].div_id).toBe(divId1);
    });

    it("does not pick a division when there is more than one", () => {
      renderBrkts({ brkts: [] });

      within(createPanel())
        .getAllByRole("radio")
        .forEach((radio) => expect(radio).not.toBeChecked());
    });

    it("clears a duplicate error when the start is changed", async () => {
      const user = userEvent.setup();
      render(<StatefulOneDiv />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(duplicateMsg);

      // with one division, changing the start is the only way to fix it
      await fillCreate(user, { start: "2" });
      expect(startErr()).toBeEmptyDOMElement();

      await user.click(addBtn());
      expect(screen.getAllByRole("tab")).toHaveLength(3); // Create + 2 brkts
    });

    it("keeps the duplicate error when the same division is clicked again", async () => {
      const user = userEvent.setup();
      render(<StatefulOneDiv />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());
      await user.click(addBtn());

      // the radio is already checked, so clicking it changes nothing
      await user.click(within(createPanel()).getByRole("radio", { name: scratchName }));

      expect(startErr()).toHaveTextContent(duplicateMsg);
    });
  });

  describe("delete a bracket", () => {
    it("asks to confirm with the brkt's name, then removes it", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const target = brkts[1];
      const { setBrkts, setShowingModal, markPendingChanges } = renderBrkts({
        brkts,
      });

      await user.click(
        within(panelFor(target)).getByRole("button", { name: /delete bracket/i }),
      );

      expect(setShowingModal).toHaveBeenCalledWith(true);
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText(`Do you want to delete Bracket: ${brktName(target)}?`),
      ).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(lastArg(setBrkts)).toEqual(brkts.filter((b) => b.id !== target.id));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("clears the accordion error when the deleted brkt had the only error", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      brkts[1].fee_err = "Fee error";
      brkts[1].errClassName = objErrClassName;
      const { setAcdnErr } = renderBrkts({ brkts });

      await deleteAndConfirm(user, brkts[1]);

      // before the fix, delete never touched the accordion error
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("sets the accordion error to the next brkt that still has an error", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      brkts[0].fee_err = "Fee error";
      const { setAcdnErr } = renderBrkts({ brkts });

      await deleteAndConfirm(user, brkts[1]);

      expect(lastArg(setAcdnErr)).toEqual(acdnErr(brktName(brkts[0]), "Fee error"));
    });

    it("makes the Create Bracket tab active after a delete", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      render(<StatefulBrkts initialBrkts={brkts} />);

      await user.click(screen.getByRole("tab", { name: brktName(brkts[1]) }));
      await deleteAndConfirm(user, brkts[1]);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(brkts.length); // Create + 1 left
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user clicks No", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const { setBrkts, setAcdnErr, setShowingModal, markPendingChanges } =
        renderBrkts({ brkts });

      await user.click(
        within(panelFor(brkts[1])).getByRole("button", { name: /delete bracket/i }),
      );
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /no/i }));

      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(setBrkts).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("edit an existing bracket's fee", () => {
    it("typing clears its fee error and red tab, and the accordion error", () => {
      const brkts = cleanBrkts();
      brkts[1].fee_err = feeLowMsg;
      brkts[1].errClassName = objErrClassName;
      const { setBrkts, setAcdnErr, markPendingChanges } = renderBrkts({ brkts });

      fireEvent.change(within(panelFor(brkts[1])).getByLabelText(/^fee$/i), {
        target: { value: "7" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const edited = lastArg<brktType[]>(setBrkts).find((b) => b.id === brkts[1].id)!;
      expect(edited.fee).toBe("7");
      expect(edited.fee_err).toBe("");
      expect(edited.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited brkt", () => {
      const brkts = cleanBrkts();
      const { setBrkts } = renderBrkts({ brkts });

      fireEvent.change(within(panelFor(brkts[1])).getByLabelText(/^fee$/i), {
        target: { value: "7" },
      });

      expect(lastArg<brktType[]>(setBrkts)[0]).toBe(brkts[0]);
    });

    it("sets the accordion error to another brkt's error when the edited one is fixed", () => {
      const brkts = cleanBrkts();
      brkts[0].start_err = "Start error";
      brkts[1].fee_err = feeLowMsg;
      const { setAcdnErr } = renderBrkts({ brkts });

      fireEvent.change(within(panelFor(brkts[1])).getByLabelText(/^fee$/i), {
        target: { value: "7" },
      });

      expect(lastArg(setAcdnErr)).toEqual(acdnErr(brktName(brkts[0]), "Start error"));
    });

    it("recalculates First, Second, Admin and F+S+A when the fee loses focus", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      render(<StatefulBrkts initialBrkts={brkts} />);

      const fee = within(panelFor(brkts[0])).getByLabelText(/^fee$/i);
      await user.clear(fee);
      await user.type(fee, "7");
      fireEvent.blur(fee);

      // MoneyDisabled is defined inside the component, so it remounts on every
      // render: query the fields again after the update, not before
      await waitFor(() =>
        expect(moneyIn(panelFor(brkts[0])).first.value).toMatch(/35\.00/),
      );
      const money = moneyIn(panelFor(brkts[0]));
      expect(money.second.value).toMatch(/14\.00/);
      expect(money.admin.value).toMatch(/7\.00/);
      expect(money.fsa.value).toMatch(/56\.00/);
    });

    it("clears the fee and First, Second, Admin and F+S+A when the fee is cleared", () => {
      const brkts = cleanBrkts();
      const { setBrkts } = renderBrkts({ brkts });

      fireEvent.blur(within(panelFor(brkts[0])).getByLabelText(/^fee$/i), {
        target: { name: "fee", value: "" },
      });

      // the old test for this typed "7" and checked for 35, so it never cleared
      const edited = lastArg<brktType[]>(setBrkts).find((b) => b.id === brkts[0].id)!;
      expect(edited.fee).toBe("");
      expect(edited.first).toBe("");
      expect(edited.second).toBe("");
      expect(edited.admin).toBe("");
      expect(edited.fsa).toBe("");
    });
  });

  describe("isDisabled = true", () => {
    it("hides the Create Bracket tab and makes the first brkt's tab active", () => {
      const brkts = cleanBrkts();
      renderBrkts({ brkts, isDisabled: true });

      expect(screen.queryByRole("tab", { name: /create bracket/i })).not.toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(brkts.length);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("disables every fee and Delete button, and typing or clicking does nothing", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const { setBrkts, setShowingModal, markPendingChanges } = renderBrkts({
        brkts,
        isDisabled: true,
      });

      for (const brkt of brkts) {
        const panel = panelFor(brkt);
        const fee = within(panel).getByLabelText(/^fee$/i);
        const del = within(panel).getByRole("button", { name: /delete bracket/i });
        expect(fee).toBeDisabled();
        expect(del).toBeDisabled();
        expect(del).toHaveClass("btn-dark");
        await user.type(fee, "9");
        await user.click(del);
      }

      expect(setBrkts).not.toHaveBeenCalled();
      expect(setShowingModal).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds a brkt without crashing", async () => {
      const user = userEvent.setup();
      const { setBrkts } = renderBrkts({ brkts: [], markPendingChanges: undefined });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1" });
      await user.click(addBtn());

      expect(setBrkts).toHaveBeenCalledTimes(1);
    });

    it("updates the create fee and its money fields without crashing", async () => {
      const user = userEvent.setup();
      renderBrkts({ markPendingChanges: undefined });

      await fillCreate(user, { fee: "7" });
      await user.tab();

      expect(moneyIn(createPanel()).first.value).toMatch(/35\.00/);
    });

    it("updates an existing brkt's fee without crashing", () => {
      const brkts = cleanBrkts();
      const { setBrkts } = renderBrkts({ brkts, markPendingChanges: undefined });

      fireEvent.change(within(panelFor(brkts[0])).getByLabelText(/^fee$/i), {
        target: { value: "7" },
      });

      expect(setBrkts).toHaveBeenCalled();
    });

    it("deletes a brkt without crashing", async () => {
      const user = userEvent.setup();
      const brkts = cleanBrkts();
      const { setBrkts } = renderBrkts({ brkts, markPendingChanges: undefined });

      await deleteAndConfirm(user, brkts[1]);

      expect(setBrkts).toHaveBeenCalled();
    });
  });
});
