// test/app/(private)/dataEntry/tmnts/zeroToNBrkts/zeroToNBrkts.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNBrkts.tsx
// (rendering only - clicks, typing, adds and deletes are in
//  zeroToNBrkts.interactions.test.tsx)
import React, { act } from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNBrackets from "@/app/(private)/dataEntry/tmntForm/zeroToNBrkts";
import {
  mockBrkts,
  mockDivs,
  mockSquads,
} from "../../../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { defaultBrktGames, defaultBrktPlayers, initBrkt } from "@/lib/db/initVals";
import { getBrktOrElimName, getDivName } from "@/lib/getName";
import type { brktType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof ZeroToNBrackets>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNBrackets with fresh copies of the mocks; any prop can be overridden */
const renderBrkts = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    brkts: cloneDeep(mockBrkts),
    setBrkts: jest.fn(),
    divs: cloneDeep(mockDivs),
    squads: cloneDeep(mockSquads),
    setAcdnErr: jest.fn(),
    setShowingModal: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<ZeroToNBrackets {...props} />);
  return props;
};

const brktName = (brkt: brktType) => getBrktOrElimName(brkt, mockDivs);
const money = (value: string) => formatValueSymbSep2Dec(value, localConfig);

const createPanel = () =>
  screen.getByRole("tabpanel", { name: /create bracket/i });
const panelFor = (brkt: brktType) =>
  screen.getByRole("tabpanel", { name: brktName(brkt) });

/** every input in a panel, found by its label */
const inputsIn = (panel: HTMLElement) => {
  const byLabel = (label: RegExp) =>
    within(panel).getByLabelText(label) as HTMLInputElement;
  return {
    fee: byLabel(/^fee$/i),
    start: byLabel(/^start$/i),
    games: byLabel(/^games$/i),
    players: byLabel(/^players$/i),
    first: byLabel(/^first$/i),
    second: byLabel(/^second$/i),
    admin: byLabel(/^admin$/i),
    fsa: byLabel(/f\+s\+a/i),
  };
};

/** a bracket panel's Division box */
const divisionIn = (panel: HTMLElement) =>
  within(panel).getByRole("textbox", { name: /division/i }) as HTMLInputElement;

/** label, brkt index - used to run the same checks on every mock brkt */
const brktCases = mockBrkts.map((b, i) => [brktName(b), i] as const);

// ---------------------------------------------------------------------------

describe("ZeroToNBrackets - render", () => {
  describe("tabs", () => {
    it("renders a Create Bracket tab, then one tab per brkt titled with its name", () => {
      renderBrkts();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockBrkts.length + 1);
      expect(tabs[0]).toHaveTextContent("Create Bracket");
      mockBrkts.forEach((brkt, i) =>
        expect(tabs[i + 1]).toHaveTextContent(brktName(brkt)),
      );
    });

    it("makes the Create Bracket tab active", () => {
      renderBrkts();

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it.each(brktCases)("selecting the %s tab makes only it active", async (_name, i) => {
      const user = userEvent.setup();
      renderBrkts();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[i + 1]);

      tabs.forEach((tab, t) =>
        expect(tab).toHaveAttribute("aria-selected", String(t === i + 1)),
      );
    });

    it("renders only the Create Bracket tab when there are no brkts", () => {
      renderBrkts({ brkts: [] });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveTextContent("Create Bracket");
    });

    it("adds a brkt's errClassName to its tab", () => {
      const brkts = cloneDeep(mockBrkts);
      brkts[1].errClassName = "test-err-class";
      renderBrkts({ brkts });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[2]).toHaveClass("test-err-class");
      expect(tabs[1]).not.toHaveClass("test-err-class");
    });
  });

  describe("Create Bracket tab", () => {
    it("has the create background classes", () => {
      renderBrkts({ brkts: [] });

      const wrapper = screen.getByTestId("createBrktContainer");
      expect(wrapper).toHaveClass("container");
      expect(wrapper).toHaveClass("rounded-3");
      expect(wrapper).toHaveClass("createBackground");
    });

    it("renders one Division radio per division, none checked, all in one group", () => {
      renderBrkts({ brkts: [] });

      const radios = within(createPanel()).getAllByRole("radio") as HTMLInputElement[];
      expect(radios).toHaveLength(mockDivs.length);
      mockDivs.forEach((div, i) => {
        expect(radios[i]).toHaveAccessibleName(div.div_name);
        expect(radios[i]).not.toBeChecked();
        expect(radios[i]).toHaveAttribute("name", "brktsDivRadio");
      });
    });

    it("checks the only Division radio when there is one division", () => {
      renderBrkts({ brkts: [], divs: [cloneDeep(mockDivs[0])] });

      const radios = within(createPanel()).getAllByRole("radio");
      expect(radios).toHaveLength(1);
      expect(radios[0]).toBeChecked();
    });

    it("renders the default values", () => {
      renderBrkts({ brkts: [] });

      const inputs = inputsIn(createPanel());
      expect(inputs.fee).toHaveValue("");
      expect(inputs.start).toHaveValue(initBrkt.start);
      expect(inputs.games).toHaveValue(defaultBrktGames);
      expect(inputs.players).toHaveValue(defaultBrktPlayers);
      expect(inputs.first).toHaveValue("");
      expect(inputs.second).toHaveValue("");
      expect(inputs.admin).toHaveValue("");
      expect(inputs.fsa).toHaveValue("");
    });

    it("lets the user edit only Fee and Start", () => {
      renderBrkts({ brkts: [] });

      const { fee, start, ...rest } = inputsIn(createPanel());
      expect(fee).toBeEnabled();
      expect(start).toBeEnabled();
      Object.values(rest).forEach((input) => expect(input).toBeDisabled());
    });

    it("renders empty error messages and no invalid inputs", () => {
      renderBrkts({ brkts: [] });

      ["dangerBrktDivRadio", "dangerCreateBrktFee", "dangerCreateBrktStart"].forEach(
        (testId) => expect(screen.getByTestId(testId)).toBeEmptyDOMElement(),
      );
      const { fee, start } = inputsIn(createPanel());
      expect(fee).not.toHaveClass("is-invalid");
      expect(start).not.toHaveClass("is-invalid");
    });

    it("renders an Add Bracket button and no Delete button", () => {
      renderBrkts({ brkts: [] });

      expect(
        within(createPanel()).getByRole("button", { name: /add bracket/i }),
      ).toBeEnabled();
      expect(
        within(createPanel()).queryByRole("button", { name: /delete bracket/i }),
      ).not.toBeInTheDocument();
    });

    it("renders the F+S+A label text, then a space, then a ? help icon", () => {
      renderBrkts({ brkts: [] });

      const label = within(createPanel()).getByText(/f\+s\+a/i, { selector: "label" });
      expect(label.textContent ?? "").toMatch(/^F\+S\+A\s+\?/);
      const helpSpan = within(label).getByText("?", { selector: "span" });
      expect(helpSpan).toHaveClass("popup-help");
      expect(helpSpan.textContent ?? "").toMatch(/^\s+\?\s+$/);
    });
  });

  describe("each bracket tab", () => {
    it.each(brktCases)("renders every value of %s", (_name, i) => {
      renderBrkts();
      const brkt = mockBrkts[i];
      const panel = panelFor(brkt);

      // the old tests compared brkt 0's inputs with brkt 1's values
      expect(divisionIn(panel)).toHaveValue(getDivName(brkt.div_id, mockDivs));
      const inputs = inputsIn(panel);
      expect(inputs.fee).toHaveValue(money(brkt.fee));
      expect(inputs.start).toHaveValue(brkt.start);
      expect(inputs.games).toHaveValue(brkt.games);
      expect(inputs.players).toHaveValue(brkt.players);
      expect(inputs.first).toHaveValue(money(brkt.first));
      expect(inputs.second).toHaveValue(money(brkt.second));
      expect(inputs.admin).toHaveValue(money(brkt.admin));
      expect(inputs.fsa).toHaveValue(money(brkt.fsa));
    });

    it.each(brktCases)("lets the user edit only the Fee of %s", (_name, i) => {
      renderBrkts();
      const panel = panelFor(mockBrkts[i]);

      expect(divisionIn(panel)).toBeDisabled();
      const { fee, ...rest } = inputsIn(panel);
      expect(fee).toBeEnabled();
      Object.values(rest).forEach((input) => expect(input).toBeDisabled());
    });

    it.each(brktCases)("renders an enabled, red Delete button on %s", (_name, i) => {
      renderBrkts();

      const delBtn = within(panelFor(mockBrkts[i])).getByRole("button", {
        name: /delete bracket/i,
      });
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
    });

    it("renders no radios and no Add button in a bracket tab", () => {
      renderBrkts();
      const panel = panelFor(mockBrkts[0]);

      expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
      expect(
        within(panel).queryByRole("button", { name: /add bracket/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("bracket with errors", () => {
    const brktsWithErrors = () => {
      const brkts = cloneDeep(mockBrkts);
      brkts[0] = {
        ...brkts[0],
        fee_err: "test fee error",
        start_err: "test start error",
      };
      return brkts;
    };

    it("marks its Fee and Start as invalid and shows both messages", () => {
      const brkts = brktsWithErrors();
      renderBrkts({ brkts });

      const { fee, start } = inputsIn(panelFor(brkts[0]));
      expect(fee).toHaveClass("is-invalid");
      expect(start).toHaveClass("is-invalid");
      expect(screen.getByTestId(`dangerBrktFee${brkts[0].id}`)).toHaveTextContent(
        "test fee error",
      );
      expect(
        screen.getByTestId(`dangerViewBrktStart${brkts[0].id}`),
      ).toHaveTextContent("test start error");
    });

    it("does not mark the other brkts as invalid", () => {
      const brkts = brktsWithErrors();
      renderBrkts({ brkts });

      brkts.slice(1).forEach((brkt) => {
        const { fee, start } = inputsIn(panelFor(brkt));
        expect(fee).not.toHaveClass("is-invalid");
        expect(start).not.toHaveClass("is-invalid");
        expect(screen.getByTestId(`dangerBrktFee${brkt.id}`)).toBeEmptyDOMElement();
      });
    });
  });

  describe("isDisabled = true", () => {
    it("does not render the Create Bracket tab, and makes the first brkt's tab active", () => {
      renderBrkts({ isDisabled: true });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockBrkts.length);
      tabs.forEach((tab) => expect(tab).not.toHaveTextContent(/create bracket/i));
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it("renders none of the create form: no radios, Add button or create errors", () => {
      renderBrkts({ isDisabled: true });

      expect(screen.queryByTestId("createBrktContainer")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: /add bracket/i }),
      ).not.toBeInTheDocument();
      ["dangerBrktDivRadio", "dangerCreateBrktFee", "dangerCreateBrktStart"].forEach(
        (testId) => expect(screen.queryByTestId(testId)).not.toBeInTheDocument(),
      );
    });

    it.each(brktCases)("disables every input of %s, and its dark Delete button", (_name, i) => {
      renderBrkts({ isDisabled: true });
      const panel = panelFor(mockBrkts[i]);

      expect(divisionIn(panel)).toBeDisabled();
      Object.values(inputsIn(panel)).forEach((input) => expect(input).toBeDisabled());
      const delBtn = within(panel).getByRole("button", { name: /delete bracket/i });
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");
    });

    it("still renders the values", () => {
      renderBrkts({ isDisabled: true });

      const brkt = mockBrkts[0];
      expect(divisionIn(panelFor(brkt))).toHaveValue(getDivName(brkt.div_id, mockDivs));
      expect(inputsIn(panelFor(brkt)).fee).toHaveValue(money(brkt.fee));
    });
  });

  describe("F+S+A help tooltip", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers();
      });
      jest.useRealTimers();
    });

    it("only shows the tooltip while the help icon is hovered", async () => {
      const tooltipRegex = /First \+ Second \+ Admin must equal Fee \* Players/;
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderBrkts({ brkts: [] });

      // before hover - no tooltip
      expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

      const label = within(createPanel()).getByText(/f\+s\+a/i, { selector: "label" });
      const helpSpan = within(label).getByText("?", { selector: "span" });

      // hover - tooltip shows after the 250ms show delay
      await user.hover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(await screen.findByText(tooltipRegex)).toBeInTheDocument();

      // unhover - tooltip goes away after the 1000ms hide delay
      await user.unhover(helpSpan);
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      await waitForElementToBeRemoved(() => screen.queryByText(tooltipRegex));
    });
  });
});

