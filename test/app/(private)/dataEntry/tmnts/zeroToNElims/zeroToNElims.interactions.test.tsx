// test/app/(private)/dataEntry/tmnts/zeroToNElims/zeroToNElims.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNElims.tsx
// (validateElims and validateElim are tested in zeroToNElims.validate.test.tsx)
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNElims from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
import type { elimType } from "@/lib/types/types";
import {
  divId1,
  mockTmntFullData,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
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

type Props = React.ComponentProps<typeof ZeroToNElims>;
type User = ReturnType<typeof userEvent.setup>;

// ---------------------------------------------------------------------------
// data and expected messages
// ---------------------------------------------------------------------------

const divs = mockTmntFullData.divs;
const squadGames = mockTmntFullData.squads[0].games;
const scratchName = divs.find((d) => d.id === divId1)!.div_name;

const divRequiredMsg = "Division is required";
const feeLowMsg = "Fee cannot be less than " + minFeeText;
const feeHighMsg = "Fee cannot be more than " + maxMoneyText;
const startLowMsg = "Start cannot be less than 1";
const startHighMsg = "Start cannot be more than " + squadGames;
const gamesLowMsg = "Games cannot be less than 1";
const gamesHighMsg = "Games cannot be more than " + squadGames;
const endsAfterMsg = "Eliminator ends after last game";
const duplicateMsg = "Eliminator - Division, Start & Games already exists";

/** fresh copy of the mock elims with all errors cleared */
const cleanElims = (): elimType[] =>
  cloneDeep(mockTmntFullData.elims).map((e) => ({
    ...e,
    div_err: "",
    start_err: "",
    fee_err: "",
    games_err: "",
    errClassName: "",
  }));

const elimName = (elim: elimType) => getBrktOrElimName(elim, divs);

const acdnErr = (objName: string, errMsg: string) => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

/** a start and games no mock elim uses */
const freeSlot = { start: "2", games: "3" };

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNElims with mock setters; any prop can be overridden */
const renderElims = (overrides: Partial<Props> = {}) => {
  const setElims = jest.fn();
  const setAcdnErr = jest.fn();
  const setShowingModal = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    elims: cleanElims(),
    setElims,
    divs: cloneDeep(divs),
    squads: cloneDeep(mockTmntFullData.squads),
    setAcdnErr,
    setShowingModal,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<ZeroToNElims {...props} />);
  return { props, setElims, setAcdnErr, setShowingModal, markPendingChanges };
};

/** wraps ZeroToNElims in real state, so setElims re-renders it */
const StatefulElims: React.FC<{
  initialElims: elimType[];
  divsToUse?: typeof divs;
}> = ({ initialElims, divsToUse = divs }) => {
  const [elims, setElims] = React.useState(initialElims);
  return (
    <ZeroToNElims
      elims={elims}
      setElims={setElims}
      divs={divsToUse}
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
  screen.getByRole("tabpanel", { name: /create eliminator/i });
const panelFor = (elim: elimType) =>
  screen.getByRole("tabpanel", { name: elimName(elim) });

const createFee = () => within(createPanel()).getByLabelText(/^fee$/i);
const createStart = () => within(createPanel()).getByLabelText(/^start$/i);
const createGames = () => within(createPanel()).getByLabelText(/^games$/i);
const addBtn = () =>
  within(createPanel()).getByRole("button", { name: /add eliminator/i });

const divErr = () => screen.getByTestId("dangerElimDivRadio");
const feeErr = () => screen.getByTestId("dangerCreateElimFee");
const startErr = () => screen.getByTestId("dangerCreateElimStart");
const gamesErr = () => screen.getByTestId("dangerCreateElimGames");

/** fills in the Create Eliminator form; leave a field out to skip it */
const fillCreate = async (
  user: User,
  {
    divName,
    fee,
    start,
    games,
  }: { divName?: string; fee?: string; start?: string; games?: string },
) => {
  if (divName) {
    await user.click(within(createPanel()).getByRole("radio", { name: divName }));
  }
  const fields: [() => HTMLElement, string | undefined][] = [
    [createFee, fee],
    [createStart, start],
    [createGames, games],
  ];
  for (const [getInput, value] of fields) {
    if (value === undefined) continue;
    await user.clear(getInput());
    if (value) await user.type(getInput(), value);
  }
};

/** clicks Delete for an elim, then Yes in the confirm dialog */
const deleteAndConfirm = async (user: User, elim: elimType) => {
  await user.click(
    within(panelFor(elim)).getByRole("button", { name: /delete eliminator/i }),
  );
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /yes/i }));
};

const editFee = (elim: elimType, value: string) =>
  fireEvent.change(within(panelFor(elim)).getByLabelText(/^fee$/i), {
    target: { value },
  });

// ---------------------------------------------------------------------------

describe("ZeroToNElims - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add an eliminator", () => {
    it("passes the elims plus the new elim to setElims when every field is valid", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const { setElims, markPendingChanges, props } = renderElims({ elims });

      await fillCreate(user, { divName: scratchName, fee: "5", ...freeSlot });
      await user.click(addBtn());

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setElims).toHaveBeenCalledTimes(1);

      const updated = lastArg<elimType[]>(setElims);
      expect(updated).toHaveLength(elims.length + 1);
      expect(updated.slice(0, elims.length)).toEqual(elims);

      const newElim = updated[updated.length - 1];
      expect(newElim.id).toMatch(/^elm_/);
      expect(newElim.div_id).toBe(divId1);
      expect(newElim.squad_id).toBe(props.squads[0].id);
      expect(newElim.start).toBe(2);
      expect(newElim.games).toBe(3);
      expect(Number(newElim.fee)).toBe(5);
      expect(newElim.div_err).toBe("");
      expect(newElim.fee_err).toBe("");
      expect(newElim.start_err).toBe("");
      expect(newElim.games_err).toBe("");
    });

    it("gives the first new elim the next sort_order after the existing elims", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const { setElims } = renderElims({ elims });

      await fillCreate(user, { divName: scratchName, fee: "5", ...freeSlot });
      await user.click(addBtn());

      const updated = lastArg<elimType[]>(setElims);
      // before the fix this was initElim's sort_order, the same as an existing elim
      expect(updated[updated.length - 1].sort_order).toBe(
        elims[elims.length - 1].sort_order + 1,
      );
    });

    it("gives the first elim sort_order 1 when there are none yet", async () => {
      const user = userEvent.setup();
      const { setElims } = renderElims({ elims: [] });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1", games: "3" });
      await user.click(addBtn());

      expect(lastArg<elimType[]>(setElims)[0].sort_order).toBe(1);
    });

    it("adds a tab for each new elim and keeps the Create Eliminator tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulElims initialElims={[]} />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1", games: "3" });
      await user.click(addBtn());
      await fillCreate(user, { start: "2" });
      await user.click(addBtn());

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3); // Create + 2 elims
      expect(tabs[0]).toHaveTextContent("Create Eliminator");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("keeps the create form's values after adding, so adding again shows the duplicate error", async () => {
      const user = userEvent.setup();
      render(<StatefulElims initialElims={[]} />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1", games: "3" });
      await user.click(addBtn());
      await user.click(addBtn());

      expect(startErr()).toHaveTextContent(duplicateMsg);
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("allows the same division and start with a different number of games", async () => {
      const user = userEvent.setup();
      render(<StatefulElims initialElims={[]} />);

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1", games: "3" });
      await user.click(addBtn());
      await fillCreate(user, { games: "4" });
      await user.click(addBtn());

      expect(startErr()).toBeEmptyDOMElement();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });
  });

  describe("create form errors", () => {
    const valid = { divName: scratchName, fee: "5", start: "1", games: "3" };

    it.each([
      ["no division", { ...valid, divName: undefined }, "div", divRequiredMsg],
      ["a fee below the minimum", { ...valid, fee: (minFee - 0.01).toFixed(2) }, "fee", feeLowMsg],
      ["a fee above the maximum", { ...valid, fee: String(maxMoney + 1) }, "fee", feeHighMsg],
      ["a start below 1", { ...valid, start: "0" }, "start", startLowMsg],
      [
        "a start after the last game",
        { ...valid, start: String(squadGames + 1) },
        "start",
        startHighMsg,
      ],
      ["games below 1", { ...valid, games: "0" }, "games", gamesLowMsg],
      [
        "more games than the squad has",
        { ...valid, games: String(squadGames + 1) },
        "games",
        gamesHighMsg,
      ],
      [
        "games that run past the last game",
        { ...valid, start: String(squadGames - 1), games: "3" },
        "start",
        endsAfterMsg,
      ],
    ] as const)(
      "with %s, shows only that error and adds nothing",
      async (_label, fields, errField, msg) => {
        const user = userEvent.setup();
        const { setElims, markPendingChanges } = renderElims({ elims: [] });

        await fillCreate(user, fields);
        await user.click(addBtn());

        expect(markPendingChanges).toHaveBeenCalledWith(true);
        const errs = { div: divErr(), fee: feeErr(), start: startErr(), games: gamesErr() };
        expect(errs[errField]).toHaveTextContent(msg);
        (Object.keys(errs) as (keyof typeof errs)[])
          .filter((key) => key !== errField)
          .forEach((key) => expect(errs[key]).toBeEmptyDOMElement());
        expect(setElims).not.toHaveBeenCalled();
      },
    );

    it("shows every error at once when nothing is valid", async () => {
      const user = userEvent.setup();
      const { setElims } = renderElims({ elims: [] });

      await fillCreate(user, { start: "0", games: "0" });
      await user.click(addBtn());

      expect(divErr()).toHaveTextContent(divRequiredMsg);
      expect(feeErr()).toHaveTextContent(feeLowMsg);
      expect(startErr()).toHaveTextContent(startLowMsg);
      expect(gamesErr()).toHaveTextContent(gamesLowMsg);
      expect(setElims).not.toHaveBeenCalled();
    });

    it("shows the start error, not 'ends after last game', when the start itself is too high", async () => {
      const user = userEvent.setup();
      renderElims({ elims: [] });

      await fillCreate(user, { ...valid, start: String(squadGames + 1) });
      await user.click(addBtn());

      // before the fix, "ends after last game" always replaced this message
      expect(startErr()).toHaveTextContent(startHighMsg);
    });

    it("shows the duplicate error for the same division, start and games as an existing elim", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const existing = elims[0];
      const { setElims } = renderElims({ elims });

      await fillCreate(user, {
        divName: divs.find((d) => d.id === existing.div_id)!.div_name,
        fee: "5",
        start: String(existing.start),
        games: String(existing.games),
      });
      await user.click(addBtn());

      expect(startErr()).toHaveTextContent(duplicateMsg);
      expect(setElims).not.toHaveBeenCalled();
    });

    it("clears each error as its field is changed", async () => {
      const user = userEvent.setup();
      renderElims({ elims: [] });

      await fillCreate(user, { start: "0", games: "0" });
      await user.click(addBtn());

      await fillCreate(user, { divName: scratchName });
      expect(divErr()).toBeEmptyDOMElement();
      await fillCreate(user, { fee: "5" });
      expect(feeErr()).toBeEmptyDOMElement();
      await fillCreate(user, { start: "1" });
      expect(startErr()).toBeEmptyDOMElement();
      await fillCreate(user, { games: "3" });
      expect(gamesErr()).toBeEmptyDOMElement();
    });

    it("changing games clears an 'ends after last game' error", async () => {
      const user = userEvent.setup();
      renderElims({ elims: [] });

      await fillCreate(user, { ...valid, start: String(squadGames - 1), games: "3" });
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(endsAfterMsg);

      // the error is shown on Start, but fewer games fixes it
      await fillCreate(user, { games: "2" });

      expect(startErr()).toBeEmptyDOMElement();
    });

    it("picking a division keeps a real start error", async () => {
      const user = userEvent.setup();
      renderElims({ elims: [] });

      await fillCreate(user, { fee: "5", start: "0", games: "3" });
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(startLowMsg);

      await fillCreate(user, { divName: scratchName });

      // before the fix, "=" instead of "===" cleared every start error here
      expect(startErr()).toHaveTextContent(startLowMsg);
    });

    it("picking a division clears a duplicate error", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const existing = elims[0];
      const otherDiv = divs.find((d) => d.id !== existing.div_id);
      // this test needs a 2nd division in the mock data
      expect(otherDiv).toBeDefined();
      renderElims({ elims });

      await fillCreate(user, {
        divName: divs.find((d) => d.id === existing.div_id)!.div_name,
        fee: "5",
        start: String(existing.start),
        games: String(existing.games),
      });
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(duplicateMsg);

      await fillCreate(user, { divName: otherDiv!.div_name });
      expect(startErr()).toBeEmptyDOMElement();
    });
  });

  describe("with only one division", () => {
    const oneDiv = () => [cloneDeep(divs.find((d) => d.id === divId1)!)];

    it("picks the only division for the user, so Add works without clicking it", async () => {
      const user = userEvent.setup();
      const { setElims } = renderElims({ elims: [], divs: oneDiv() });

      expect(
        within(createPanel()).getByRole("radio", { name: scratchName }),
      ).toBeChecked();

      await fillCreate(user, { fee: "5", start: "1", games: "3" });
      await user.click(addBtn());

      expect(divErr()).toBeEmptyDOMElement();
      expect(lastArg<elimType[]>(setElims)[0].div_id).toBe(divId1);
    });

    it("does not pick a division when there is more than one", () => {
      renderElims({ elims: [] });

      within(createPanel())
        .getAllByRole("radio")
        .forEach((radio) => expect(radio).not.toBeChecked());
    });

    it("clears a duplicate error when the start or games is changed", async () => {
      const user = userEvent.setup();
      render(<StatefulElims initialElims={[]} divsToUse={oneDiv()} />);

      await fillCreate(user, { fee: "5", start: "1", games: "3" });
      await user.click(addBtn());
      await user.click(addBtn());
      expect(startErr()).toHaveTextContent(duplicateMsg);

      // with one division, changing the start or games is the only way to fix it
      await fillCreate(user, { start: "2" });
      expect(startErr()).toBeEmptyDOMElement();

      await user.click(addBtn());
      expect(screen.getAllByRole("tab")).toHaveLength(3); // Create + 2 elims
    });
  });

  describe("delete an eliminator", () => {
    it("asks to confirm with the elim's name, then removes it", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const target = elims[1];
      const { setElims, setShowingModal, markPendingChanges } = renderElims({
        elims,
      });

      await user.click(
        within(panelFor(target)).getByRole("button", { name: /delete eliminator/i }),
      );

      expect(setShowingModal).toHaveBeenCalledWith(true);
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText(`Do you want to delete Eliminator: ${elimName(target)}?`),
      ).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(lastArg(setElims)).toEqual(elims.filter((e) => e.id !== target.id));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("clears the accordion error when the deleted elim had the only error", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      elims[1].fee_err = "Fee error";
      elims[1].errClassName = objErrClassName;
      const { setAcdnErr } = renderElims({ elims });

      await deleteAndConfirm(user, elims[1]);

      // before the fix, delete never touched the accordion error
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("sets the accordion error to the next elim that still has an error", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      elims[0].fee_err = "Fee error";
      const { setAcdnErr } = renderElims({ elims });

      await deleteAndConfirm(user, elims[1]);

      expect(lastArg(setAcdnErr)).toEqual(acdnErr(elimName(elims[0]), "Fee error"));
    });

    it("makes the Create Eliminator tab active after a delete", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      render(<StatefulElims initialElims={elims} />);

      await user.click(screen.getByRole("tab", { name: elimName(elims[1]) }));
      await deleteAndConfirm(user, elims[1]);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(elims.length); // Create + (elims.length - 1) left
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user clicks No", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const { setElims, setAcdnErr, setShowingModal, markPendingChanges } =
        renderElims({ elims });

      await user.click(
        within(panelFor(elims[1])).getByRole("button", { name: /delete eliminator/i }),
      );
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /no/i }));

      expect(setShowingModal).toHaveBeenLastCalledWith(false);
      expect(setElims).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("edit an existing eliminator's fee", () => {
    it("typing clears its fee error and red tab, and the accordion error", () => {
      const elims = cleanElims();
      elims[0].fee_err = feeLowMsg;
      elims[0].errClassName = objErrClassName;
      const { setElims, setAcdnErr, markPendingChanges } = renderElims({ elims });

      editFee(elims[0], "10");

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const edited = lastArg<elimType[]>(setElims).find((e) => e.id === elims[0].id)!;
      expect(edited.fee).toBe("10");
      expect(edited.fee_err).toBe("");
      expect(edited.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited elim", () => {
      const elims = cleanElims();
      const { setElims } = renderElims({ elims });

      editFee(elims[1], "7");

      expect(lastArg<elimType[]>(setElims)[0]).toBe(elims[0]);
    });

    it("keeps the elim's other errors and its red tab", () => {
      const elims = cleanElims();
      elims[1].start_err = "Start error";
      elims[1].errClassName = objErrClassName;
      const { setElims, setAcdnErr } = renderElims({ elims });

      editFee(elims[1], "7");

      const edited = lastArg<elimType[]>(setElims).find((e) => e.id === elims[1].id)!;
      expect(edited.start_err).toBe("Start error");
      expect(edited.errClassName).toBe(objErrClassName);
      expect(lastArg(setAcdnErr)).toEqual(acdnErr(elimName(elims[1]), "Start error"));
    });

    it("keeps the red tab and accordion error when the elim's only other error is on games", () => {
      const elims = cleanElims();
      elims[1].games_err = "Games error";
      elims[1].errClassName = objErrClassName;
      const { setElims, setAcdnErr } = renderElims({ elims });

      editFee(elims[1], "7");

      // before the fix, getElimErrMsg ignored games_err, so both were cleared
      const edited = lastArg<elimType[]>(setElims).find((e) => e.id === elims[1].id)!;
      expect(edited.errClassName).toBe(objErrClassName);
      expect(lastArg(setAcdnErr)).toEqual(acdnErr(elimName(elims[1]), "Games error"));
    });

    it("sets the accordion error to another elim's error when the edited one is fixed", () => {
      const elims = cleanElims();
      elims[0].start_err = "Start error";
      elims[1].fee_err = feeLowMsg;
      const { setAcdnErr } = renderElims({ elims });

      editFee(elims[1], "7");

      expect(lastArg(setAcdnErr)).toEqual(acdnErr(elimName(elims[0]), "Start error"));
    });
  });

  describe("isDisabled = true", () => {
    it("hides the Create Eliminator tab and makes the first elim's tab active", () => {
      const elims = cleanElims();
      renderElims({ elims, isDisabled: true });

      expect(
        screen.queryByRole("tab", { name: /create eliminator/i }),
      ).not.toBeInTheDocument();
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(elims.length);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("disables every fee and Delete button, and typing or clicking does nothing", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const { setElims, setShowingModal, markPendingChanges } = renderElims({
        elims,
        isDisabled: true,
      });

      for (const elim of elims) {
        const panel = panelFor(elim);
        const fee = within(panel).getByLabelText(/^fee$/i);
        const del = within(panel).getByRole("button", { name: /delete eliminator/i });
        expect(fee).toBeDisabled();
        expect(del).toBeDisabled();
        expect(del).toHaveClass("btn-dark");
        await user.type(fee, "9");
        await user.click(del);
      }

      expect(setElims).not.toHaveBeenCalled();
      expect(setShowingModal).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds an elim without crashing", async () => {
      const user = userEvent.setup();
      const { setElims } = renderElims({ elims: [], markPendingChanges: undefined });

      await fillCreate(user, { divName: scratchName, fee: "5", start: "1", games: "3" });
      await user.click(addBtn());

      expect(setElims).toHaveBeenCalledTimes(1);
    });

    it("updates an existing elim's fee without crashing", () => {
      const elims = cleanElims();
      const { setElims } = renderElims({ elims, markPendingChanges: undefined });

      editFee(elims[0], "10");

      expect(setElims).toHaveBeenCalled();
    });

    it("deletes an elim without crashing", async () => {
      const user = userEvent.setup();
      const elims = cleanElims();
      const { setElims } = renderElims({ elims, markPendingChanges: undefined });

      await deleteAndConfirm(user, elims[1]);

      expect(setElims).toHaveBeenCalled();
    });
  });
});


// // test/app/(private)/dataEntry/tmnts/zeroToNElims/zeroToNElims.interactions.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/zeroToNElims.tsx
// import React from "react";
// import { render, screen, within } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import ZeroToNElims, { validateElims } from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
// import type { AcdnErrType, elimType } from "@/lib/types/types";
// import { minFee, maxMoney, maxGames, minGames } from "@/lib/validation/constants";
// import { divId1, mockTmntFullData } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { cloneDeep } from "lodash";
// import { acdnErrClassName, noAcdnErr, objErrClassName } from "@/app/(private)/dataEntry/tmntForm/errors";
// import { getBrktOrElimName } from "@/lib/getName";

// const mockSetElims = jest.fn();
// const mockSetAcdnErr = jest.fn();
// const mockSetShowingModal = jest.fn();
// const mockMarkPendingChanges = jest.fn();

// const mockElims = mockTmntFullData.elims;
// const mockDivs = mockTmntFullData.divs;
// const mockSquads = mockTmntFullData.squads;

// const mockZeroToNElimsProps = {
//   elims: mockElims, 
//   setElims: mockSetElims,
//   divs: mockDivs,
//   squads: mockSquads,
//   setAcdnErr: mockSetAcdnErr,
//   setShowingModal: mockSetShowingModal,
//   isDisabled: false,
//   markPendingChanges: mockMarkPendingChanges
// }

// const renderCreateElim = (elims: elimType[] = []) => {
//   mockSetElims.mockClear();
//   mockSetAcdnErr.mockClear();
//   mockSetShowingModal.mockClear();

//   return render(
//     <ZeroToNElims
//       elims={elims}
//       setElims={mockSetElims}      
//       divs={mockDivs}
//       squads={mockSquads}
//       setAcdnErr={mockSetAcdnErr}
//       setShowingModal={mockSetShowingModal}
//       isDisabled={false}
//       markPendingChanges={mockMarkPendingChanges}
//     />
//   );
// };

// describe('zeroToNElims - interactions', () => { 

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
  
//   describe("zeroToNElims - Create Eliminator tab", () => {
//     // NOTE:
//     // We do not test "non-numeric fee input" here because EaCurrencyInput
//     // (the spin-edit widget) prevents non-numeric characters at the UI level,
//     // both in browser behavior and in test environments.
//     // Therefore the user cannot enter values like "abc", making that scenario
//     // untestable as an interaction for zeroToNBrkts.
    
//     it("shows Division error and does not add a eliminator when Division is not selected", async () => {
//       const user = userEvent.setup();
//       renderCreateElim([]); // no existing pots

//       // Scope to the Create Pot tab panel
//       const createElimPanel = screen.getByRole("tabpanel", { name: /create eliminator/i });

//       // Leave Game Division unselected
      
//       // Enter a valid fee
//       const feeInput = within(createElimPanel).getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, minFee.toString());

//       const startInput = within(createElimPanel).getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "1");

//       const gamesInput = within(createElimPanel).getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       // Click Add Eliminator without selecting a Division
//       await user.click(within(createElimPanel).getByRole("button", { name: /add eliminator/i }));

//       // division error should appear
//       expect(screen.getByTestId("dangerElimDivRadio")).toHaveTextContent(/division is required/i);

//       // Division and Fee should *not* show errors (they're valid)
//       expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent("");
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent("");
//       expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent("");

//       // No pot was added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });  
//     it("shows fee error when fee is too low and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee < minFee
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, (minFee - 0.01).toString());

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "1");

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent(
//         /cannot be less than/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows fee error when fee is too high and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // enter fee < minFee
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, (maxMoney + 0.01).toString());

//       await user.click(screen.getByLabelText(/^Games$/i));
//       await user.click(screen.getByLabelText(/scratch/i));

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent(
//         /cannot be more than/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows start error when start is too low and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee 
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "0");

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
//         /cannot be less than/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows start error when start is too high and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee 
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, (maxGames + 1).toString());

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
//         /eliminator ends after last game/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows games error when games is too low and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee 
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, (maxGames + 1).toString());

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, (minGames - 1).toString());

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent(
//         /cannot be less than/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows games error when games is too low and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee 
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, (maxGames + 1).toString());

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, (maxGames + 1).toString());

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent(
//         /cannot be more than/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("shows games error when start + (games - 1) > squad games and does not add a elim", async () => {
//       const user = userEvent.setup();
//       renderCreateElim();

//       // select Division "Scratch"
//       await user.click(screen.getByLabelText(/scratch/i));

//       // enter fee 
//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, (mockSquads[0].games - 2).toString());

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "4");

//       // click Add Eliminator
//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // error visible
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
//         /ends after last game/i
//       );

//       // no elim added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//     it("adds a pot when Division, Fee, Start and Games are all valid", async () => {
//       const user = userEvent.setup();
//       renderCreateElim([]);

//       await user.click(screen.getByLabelText(/scratch/i));

//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "1");

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       expect(mockSetElims).toHaveBeenCalledTimes(1);

//       const newElims = mockSetElims.mock.calls[0][0] as elimType[];
//       expect(newElims).toHaveLength(1);
//       const newElim = newElims[0];

//       expect(newElim.div_id).toBe(divId1);   // id of scratch division
//       expect(newElim.fee).toBe("5.00");   // id of scratch division        
//       expect(newElim.start).toBe(1);
//       expect(newElim.games).toBe(3);
      
//       // no create-tab errors    
//       expect(screen.getByTestId("dangerElimDivRadio")).toHaveTextContent("");
//       expect(screen.getByTestId("dangerCreateElimFee")).toHaveTextContent("");
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent("");
//       expect(screen.getByTestId("dangerCreateElimGames")).toHaveTextContent("");
//     });
//     it("prevents adding a duplicate pot (same Pot Type + Division)", async () => {
//       const user = userEvent.setup();
//       const existingElims = mockTmntFullData.elims;
//       renderCreateElim(existingElims);

//       // Scope to the Create Pot tab panel
//       const createElimPanel = screen.getByRole("tabpanel", { name: /create eliminator/i });

//       // try to create the SAME elim again
//       await user.click(within(createElimPanel).getByLabelText(/scratch/i));

//       const feeInput = within(createElimPanel).getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = within(createElimPanel).getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "1");

//       const gamesInput = within(createElimPanel).getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       await user.click(screen.getByRole("button", { name: /add eliminator/i }));

//       // duplicate error appears in div_type_err area
//       expect(screen.getByTestId("dangerCreateElimStart")).toHaveTextContent(
//         /already exists/i
//       );

//       // no new pot added
//       expect(mockSetElims).not.toHaveBeenCalled();
//     });
//   });  

//   describe('render the create eliminator with errors', () => { 
//     it('render Eliminator errors', async () => {
//       // ARRANGE
//       const user = userEvent.setup()
//       render(<ZeroToNElims {...mockZeroToNElimsProps} />);
//       // ACT
//       const divError = screen.queryByTestId("dangerElimDivRadio");
//       const feeError = screen.queryByTestId("dangerCreateElimFee");
//       const startError = screen.queryByTestId("dangerCreateElimStart");
//       const gamesError = screen.queryByTestId("dangerCreateElimGames");
//       const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
//       const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
//       const createElimStarts = starts[0];
//       const createElimGames = games[0]
//       const addBtn = screen.getByRole('button', { name: /add eliminator/i });
//       await user.clear(createElimStarts);
//       await user.type(createElimStarts, '0');
//       await user.clear(createElimGames);
//       await user.type(createElimGames, '0');
//       await user.click(addBtn);

//       // ASSERT
//       expect(divError).toHaveTextContent('Division is required');
//       expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
//       expect(startError).toHaveTextContent('Start cannot be less than 1');
//       expect(gamesError).toHaveTextContent('Games cannot be less than 1');
//     })
//     it('render Eliminator errors, then clear errors', async () => {
//       // ARRANGE
//       const user = userEvent.setup()
//       render(<ZeroToNElims {...mockZeroToNElimsProps} />);
//       // ACT
//       const divError = screen.queryByTestId("dangerElimDivRadio");
//       const feeError = screen.queryByTestId("dangerCreateElimFee");
//       const startError = screen.queryByTestId("dangerCreateElimStart");
//       const gamesError = screen.queryByTestId("dangerCreateElimGames");
//       const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
//       const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];
//       const starts = screen.getAllByRole('spinbutton', { name: /start/i }) as HTMLInputElement[];
//       const games = screen.getAllByRole('spinbutton', { name: /games/i }) as HTMLInputElement[];
//       const createElimFee = fees[0];
//       const createElimStarts = starts[0];
//       const createElimGames = games[0]
//       const addBtn = screen.getByRole('button', { name: /add eliminator/i });
//       await user.clear(createElimStarts);
//       await user.type(createElimStarts, '0');
//       await user.clear(createElimGames);
//       await user.type(createElimGames, '0');
//       await user.click(addBtn);

//       // ASSERT
//       expect(divError).toHaveTextContent('Division is required');
//       expect(feeError).toHaveTextContent('Fee cannot be less than $1.00');
//       expect(startError).toHaveTextContent('Start cannot be less than 1');
//       expect(gamesError).toHaveTextContent('Games cannot be less than 1');

//       // ACT part 2
//       await user.click(scratchRadio)
//       await user.click(createElimFee);
//       await user.type(createElimFee, '10');
//       await user.clear(createElimStarts);
//       await user.type(createElimStarts, '1');
//       await user.clear(createElimGames);
//       await user.type(createElimGames, '3');
//       // ASSERT
//       expect(divError).toHaveTextContent('');
//       expect(feeError).toHaveTextContent('');
//       expect(startError).toHaveTextContent('');
//       expect(gamesError).toHaveTextContent('');
//     })
//   })
 
//   describe('add an eliminator', () => {
//     it('test if added eliminator', async () => {
//       // ARRANGE
//       const notElimsYet: elimType[] = [];
//       const mockNoPotsYet = { ...mockZeroToNElimsProps, elims: notElimsYet };

//       const user = userEvent.setup();
//       render(<ZeroToNElims {...mockNoPotsYet} />);
//       const scratchRadio = screen.getByRole('radio', { name: /scratch/i }) as HTMLInputElement;
//       const fees = screen.getAllByRole('textbox', { name: /fee/i }) as HTMLInputElement[];        
//       const createElimFee = fees[0];
//       const divError = screen.queryByTestId("dangerElimDivRadio");      
//       const feeError = screen.queryByTestId("dangerCreateElimFee");
//       const startError = screen.queryByTestId("dangerCreateElimStart");
//       const gamesError = screen.queryByTestId("dangerCreateElimGames");

//       const addBtn = screen.getByRole('button', { name: /add eliminator/i });

//       // ACT
//       await user.click(scratchRadio);
//       await user.click(createElimFee);
//       await user.type(createElimFee, '13');
//       await user.click(addBtn);
//       // ASSERT
//       expect(divError).toHaveTextContent('');        
//       expect(feeError).toHaveTextContent('');      
//       expect(startError).toHaveTextContent('');
//       expect(gamesError).toHaveTextContent('');

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(mockZeroToNElimsProps.setElims).toHaveBeenCalled();
//     })
//   })

//   describe('delete an eliminator', () => { 

//     beforeEach(() => {
//       jest.clearAllMocks();
//     });    

//     it('delete eliminator', async () => {
//       const toDelProps = cloneDeep(mockZeroToNElimsProps);

//       // ARRANGE
//       const user = userEvent.setup();
//       render(<ZeroToNElims {...toDelProps} />);
//       // ACT
//       const tabs = screen.getAllByRole("tab");
//       expect(tabs).toHaveLength(3);   // toDelProps.elims.length + 1
//       // ARRANGE
//       await user.click(tabs[2]);      // tab for 2nd elim
//       const delBtns = screen.getAllByText("Delete Eliminator");
//       // ASSERT
//       expect(delBtns.length).toBe(2); // toDelProps.elims.length
//       // ACT
//       await user.click(delBtns[1]);   // only 2 delete buttons, click the last one
//       // ASSERT
//       // get the buttons in the modal dialog      
//       const yesBtn = await screen.findByRole('button', { name: /yes/i });
//       expect(yesBtn).toBeInTheDocument();
//       const noBtn = await screen.findByRole('button', { name: /no/i });
//       expect(noBtn).toBeInTheDocument();
//       // ACT
//       await user.click(yesBtn);
//       // ASSERT
//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(toDelProps.setElims).toHaveBeenCalled();                    
//     })
//     it('cancels deleting an eliminator', async () => {      
//       // ARRANGE
//       const user = userEvent.setup();
//       const delElimsProps = cloneDeep(mockZeroToNElimsProps);
//       render(<ZeroToNElims {...delElimsProps} />);
//       // ACT
//       const tabs = screen.getAllByRole("tab");
//       expect(tabs).toHaveLength(3);
//       // ARRANGE
//       await user.click(tabs[2]);      // tab for second elim
//       const delBtns = screen.getAllByText("Delete Eliminator");
//       // ASSERT
//       expect(delBtns.length).toBe(2); // delete buttons - one for each elim
//       // ACT
//       await user.click(delBtns[1]);   // click the last delete button
//       // ASSERT
//       // get the buttons in the modal dialog      
//       const yesBtn = await screen.findByRole('button', { name: /yes/i });      
//       expect(yesBtn).toBeInTheDocument();
//       const noBtn = await screen.findByRole('button', { name: /no/i });      
//       expect(noBtn).toBeInTheDocument();
//       // ACT
//       await user.click(noBtn);
//       // ASSERT
//       expect(mockSetShowingModal).toHaveBeenCalledWith(false);
//       expect(mockMarkPendingChanges).not.toHaveBeenCalled();
//       expect(mockSetElims).not.toHaveBeenCalled();      
//     })      

//   })

//   describe("editing existing elim fee (handleAmountValueChange)", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     it("clears fee_err and errClassName and sets AcdnErr to noAcdnErr when fee becomes valid", async () => {
//       const user = userEvent.setup();

//       // Start with an elim that has a fee_err + errClassName set
//       const elimsWithError = cloneDeep(mockElims);
//       elimsWithError[0].fee_err = "Fee cannot be less than $1.00";
//       elimsWithError[0].errClassName = objErrClassName;

//       render(
//         <ZeroToNElims
//           elims={elimsWithError}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//           markPendingChanges={mockMarkPendingChanges}
//         />
//       );

//       // Go to the first existing elim tab (Scratch: 1-3)
//       const tabs = screen.getAllByRole("tab");
//       // index 0 is "Create Eliminator", index 1 is first elim
//       await user.click(tabs[1]);

//       const feeInputs = screen.getAllByRole("textbox", {
//         name: /fee/i,
//       }) as HTMLInputElement[];
//       // index 0 = create-tab fee, index 1 = first elim fee
//       const elimFeeInput = feeInputs[1];

//       await user.clear(elimFeeInput);
//       await user.type(elimFeeInput, "10");
//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);

//       // handler should have called setElims at least once
//       expect(mockSetElims).toHaveBeenCalled();

//       const lastSetElimsCall =
//         mockSetElims.mock.calls[mockSetElims.mock.calls.length - 1];
//       const updatedElims = lastSetElimsCall[0] as elimType[];
//       const updated = updatedElims.find(
//         (e) => e.id === elimsWithError[0].id
//       ) as elimType;

//       // fee_err cleared and errClassName cleared on that elim
//       expect(updated.fee_err).toBe("");
//       expect(updated.errClassName).toBe("");

//       // Accordion error should have been cleared to noAcdnErr
//       const lastAcdnErrArg =
//         mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

//       expect(lastAcdnErrArg).toEqual(noAcdnErr);
//     });
//     it("sets AcdnErr message for the elim that still has an error when others are valid", async () => {
//       const user = userEvent.setup();

//       const elims = cloneDeep(mockElims);

//       // Make sure elim[0] has no errors
//       elims[0].div_err = "";
//       elims[0].fee_err = "";
//       elims[0].start_err = "";
//       elims[0].games_err = "";
//       elims[0].errClassName = "";

//       // Seed elim[1] with a start_err (any non-fee error works here)
//       elims[1].start_err = "Start cannot be less than 1";
//       elims[1].div_err = "";
//       elims[1].fee_err = "";
//       elims[1].games_err = "";
//       elims[1].errClassName = objErrClassName;

//       render(
//         <ZeroToNElims
//           elims={elims}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//           markPendingChanges={mockMarkPendingChanges}
//         />
//       );

//       const tabs = screen.getAllByRole("tab");
//       // tab[2] is usually the second elim (index 0 = create, 1 = first elim, 2 = second elim)
//       await user.click(tabs[2]);

//       const feeInputs = screen.getAllByRole("textbox", {
//         name: /fee/i,
//       }) as HTMLInputElement[];
//       // create fee = 0, first elim = 1, second elim = 2
//       const secondElimFeeInput = feeInputs[2];

//       // Change the fee; the important part is that the elim still has start_err
//       await user.clear(secondElimFeeInput);
//       await user.type(secondElimFeeInput, "7");

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(mockSetElims).toHaveBeenCalled();

//       const lastAcdnErrArg =
//         mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

//       const secondElimName = getBrktOrElimName(elims[1], mockDivs);

//       expect(lastAcdnErrArg.errClassName).toBe(acdnErrClassName);
//       // Message should reference the correct eliminator name
//       expect(lastAcdnErrArg.message).toEqual(
//         expect.stringContaining(secondElimName)
//       );
//       // And the specific error message we seeded
//       expect(lastAcdnErrArg.message).toEqual(
//         expect.stringContaining("Start cannot be less than 1")
//       );
//     });
//     it('shows fee error on Save for an eliminator with an invalid fee', () => {
//       // Start from existing props (like after some user edits)
//       const baseElims = cloneDeep(mockZeroToNElimsProps.elims);
//       const editedId = baseElims[1].id;

//       // Simulate that the parent now holds edited data with invalid fee
//       const editedElims = baseElims.map((b) =>
//         b.id === editedId
//           ? { ...b, fee: (minFee - 0.01).toString() } // invalid
//           : b
//       );

//       const parentSetElims: jest.Mock<void, [elimType[]]> = jest.fn();
//       const parentSetAcdnErr: jest.Mock<void, [AcdnErrType]> = jest.fn();

//       const isValid = validateElims(
//         editedElims,
//         parentSetElims,
//         mockZeroToNElimsProps.divs,
//         mockZeroToNElimsProps.squads[0].games,
//         parentSetAcdnErr
//       );

//       // Now we *know* the fee is invalid, so validateElims must catch it
//       expect(isValid).toBe(false);

//       expect(parentSetElims).toHaveBeenCalledTimes(1);

//       const validatedElims = parentSetElims.mock.calls[0][0] as elimType[];
//       const editedAfter = validatedElims.find((b) => b.id === editedId)!;

//       expect(editedAfter.fee_err).toMatch(/cannot be less than/i);

//       expect(parentSetAcdnErr).toHaveBeenCalledWith(
//         expect.objectContaining({
//           errClassName: acdnErrClassName,
//           message: expect.stringContaining("Fee cannot be less than"),
//         })
//       );
//     });

//   });

//   describe("accordion error behavior on existing elims", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     it("sets AcdnErr and errClassName when editing the fee of an elim that still has an error", async () => {
//       const user = userEvent.setup();

//       // Start from the mock elims but inject an error on one existing elim
//       const elimsWithError = cloneDeep(mockElims);

//       // Make sure all start with clean errors
//       for (const e of elimsWithError) {
//         e.div_err = "";
//         e.fee_err = "";
//         e.start_err = "";
//         e.games_err = "";
//         e.errClassName = "";
//       }

//       // Choose the second elim to be the one with an existing error
//       const errorElim = elimsWithError[1];
//       errorElim.start_err = "Start cannot be more than 4";
//       errorElim.errClassName = objErrClassName;

//       render(
//         <ZeroToNElims
//           elims={elimsWithError}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//           markPendingChanges={mockMarkPendingChanges}
//         />
//       );

//       // Tabs: [0] Create Eliminator, [1] first elim, [2] second elim (our error elim)
//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[2]);

//       const feeInputs = screen.getAllByRole("textbox", {
//         name: /fee/i,
//       }) as HTMLInputElement[];

//       // feeInputs[0] = create-tab fee, [1] = first elim, [2] = second elim
//       const secondElimFeeInput = feeInputs[2];

//       // Edit the fee (any numeric value; the important part is that the elim still has start_err)
//       await user.clear(secondElimFeeInput);
//       await user.type(secondElimFeeInput, "7");

//       expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
//       expect(mockSetElims).toHaveBeenCalled();

//       // Grab the last setElims call and inspect the updated elims
//       const lastSetElimsCall =
//         mockSetElims.mock.calls[mockSetElims.mock.calls.length - 1];
//       const updatedElims = lastSetElimsCall[0] as elimType[];
//       const updatedErrorElim = updatedElims.find(
//         (e) => e.id === errorElim.id
//       ) as elimType;

//       // The underlying error (start_err) should still be present
//       expect(updatedErrorElim.start_err).toBe("Start cannot be more than 4");
//       // And this elim should be styled with objErrClassName
//       expect(updatedErrorElim.errClassName).toBe(objErrClassName);

//       // Accordion error should have been set based on getNextElimAcdnErrMsg
//       expect(mockSetAcdnErr).toHaveBeenCalled();

//       const lastAcdnErrArg =
//         mockSetAcdnErr.mock.calls[mockSetAcdnErr.mock.calls.length - 1][0];

//       const errorElimName = getBrktOrElimName(errorElim, mockDivs);

//       expect(lastAcdnErrArg.errClassName).toBe(acdnErrClassName);
//       expect(lastAcdnErrArg.message).toEqual(
//         expect.stringContaining(errorElimName)
//       );
//       expect(lastAcdnErrArg.message).toEqual(
//         expect.stringContaining("Start cannot be more than 4")
//       );
//     });
//   });

//   describe("optional markPendingChanges prop", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     it("adds an eliminator without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       render(
//         <ZeroToNElims
//           elims={[]}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//         />
//       );

//       await user.click(screen.getByLabelText(/scratch/i));

//       const feeInput = screen.getByLabelText(/fee/i);
//       await user.clear(feeInput);
//       await user.type(feeInput, "5");

//       const startInput = screen.getByLabelText(/^Start$/i);
//       await user.clear(startInput);
//       await user.type(startInput, "1");

//       const gamesInput = screen.getByLabelText(/^Games$/i);
//       await user.clear(gamesInput);
//       await user.type(gamesInput, "3");

//       await user.click(
//         screen.getByRole("button", { name: /add eliminator/i })
//       );

//       expect(mockSetElims).toHaveBeenCalled();
//     });

//     it("deletes an eliminator without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       render(
//         <ZeroToNElims
//           elims={mockElims}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//         />
//       );

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[1]);

//       const delBtns = screen.getAllByText("Delete Eliminator");

//       await user.click(delBtns[0]);

//       const yesBtn = await screen.findByRole("button", {
//         name: /yes/i,
//       });

//       await user.click(yesBtn);

//       expect(mockSetElims).toHaveBeenCalled();
//     });

//     it("updates existing eliminator fee without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       render(
//         <ZeroToNElims
//           elims={mockElims}
//           setElims={mockSetElims}
//           divs={mockDivs}
//           squads={mockSquads}
//           setAcdnErr={mockSetAcdnErr}
//           setShowingModal={mockSetShowingModal}
//           isDisabled={false}
//         />
//       );

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[1]);

//       const feeInputs = screen.getAllByRole("textbox", {
//         name: /fee/i,
//       }) as HTMLInputElement[];

//       const elimFeeInput = feeInputs[1];

//       await user.clear(elimFeeInput);
//       await user.type(elimFeeInput, "10");

//       expect(mockSetElims).toHaveBeenCalled();
//     });
//   });  

// })

