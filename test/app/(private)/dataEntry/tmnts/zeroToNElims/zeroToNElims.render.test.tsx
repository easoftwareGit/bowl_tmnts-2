// test/app/(private)/dataEntry/tmnts/zeroToNElims/zeroToNElims.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNElims.tsx
// (rendering only - clicks, typing, adds and deletes are in
//  zeroToNElims.interactions.test.tsx)
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNElims from "@/app/(private)/dataEntry/tmntForm/zeroToNElims";
import {
  mockElims,
  mockDivs,
  mockSquads,
} from "../../../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { defaultElimGames, initElim } from "@/lib/db/initVals";
import { getBrktOrElimName, getDivName } from "@/lib/getName";
import type { elimType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof ZeroToNElims>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNElims with fresh copies of the mocks; any prop can be overridden */
const renderElims = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    elims: cloneDeep(mockElims),
    setElims: jest.fn(),
    divs: cloneDeep(mockDivs),
    squads: cloneDeep(mockSquads),
    setAcdnErr: jest.fn(),
    setShowingModal: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<ZeroToNElims {...props} />);
  return props;
};

const elimName = (elim: elimType) => getBrktOrElimName(elim, mockDivs);
const money = (value: string) => formatValueSymbSep2Dec(value, localConfig);

const createPanel = () =>
  screen.getByRole("tabpanel", { name: /create eliminator/i });
const panelFor = (elim: elimType) =>
  screen.getByRole("tabpanel", { name: elimName(elim) });

/** the Fee, Start and Games inputs in a panel, found by their labels */
const inputsIn = (panel: HTMLElement) => {
  const byLabel = (label: RegExp) =>
    within(panel).getByLabelText(label) as HTMLInputElement;
  return {
    fee: byLabel(/^fee$/i),
    start: byLabel(/^start$/i),
    games: byLabel(/^games$/i),
  };
};

/** an elim panel's Division box */
const divisionIn = (panel: HTMLElement) =>
  within(panel).getByRole("textbox", { name: /division/i }) as HTMLInputElement;

const createErrIds = [
  "dangerElimDivRadio",
  "dangerCreateElimFee",
  "dangerCreateElimStart",
  "dangerCreateElimGames",
];

/** label, elim index - used to run the same checks on every mock elim */
const elimCases = mockElims.map((e, i) => [elimName(e), i] as const);

// ---------------------------------------------------------------------------

describe("ZeroToNElims - render", () => {
  describe("tabs", () => {
    it("renders a Create Eliminator tab, then one tab per elim titled with its name", () => {
      renderElims();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockElims.length + 1);
      expect(tabs[0]).toHaveTextContent("Create Eliminator");
      mockElims.forEach((elim, i) =>
        expect(tabs[i + 1]).toHaveTextContent(elimName(elim)),
      );
    });

    it("makes the Create Eliminator tab active", () => {
      renderElims();

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it.each(elimCases)("selecting the %s tab makes only it active", async (_name, i) => {
      const user = userEvent.setup();
      renderElims();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[i + 1]);

      tabs.forEach((tab, t) =>
        expect(tab).toHaveAttribute("aria-selected", String(t === i + 1)),
      );
    });

    it("renders only the active Create Eliminator tab when there are no elims", () => {
      renderElims({ elims: [] });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveTextContent("Create Eliminator");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("adds an elim's errClassName to its tab", () => {
      const elims = cloneDeep(mockElims);
      elims[1].errClassName = "test-err-class";
      renderElims({ elims });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[2]).toHaveClass("test-err-class");
      expect(tabs[1]).not.toHaveClass("test-err-class");
    });
  });

  describe("Create Eliminator tab", () => {
    it("has the create background classes", () => {
      renderElims({ elims: [] });

      const wrapper = screen.getByTestId("createElimContainer");
      expect(wrapper).toHaveClass("container");
      expect(wrapper).toHaveClass("rounded-3");
      expect(wrapper).toHaveClass("createBackground");
    });

    it("renders one Division radio per division, none checked, all in one group", () => {
      renderElims({ elims: [] });

      const radios = within(createPanel()).getAllByRole("radio");
      expect(radios).toHaveLength(mockDivs.length);
      mockDivs.forEach((div, i) => {
        expect(radios[i]).toHaveAccessibleName(div.div_name);
        expect(radios[i]).not.toBeChecked();
        expect(radios[i]).toHaveAttribute("name", "elimsDivRadio");
      });
    });

    it("checks the only Division radio when there is one division", () => {
      renderElims({ elims: [], divs: [cloneDeep(mockDivs[0])] });

      const radios = within(createPanel()).getAllByRole("radio");
      expect(radios).toHaveLength(1);
      expect(radios[0]).toBeChecked();
    });

    it("renders the default values, all editable", () => {
      renderElims({ elims: [] });

      const { fee, start, games } = inputsIn(createPanel());
      expect(fee).toHaveValue("");
      expect(start).toHaveValue(initElim.start);
      expect(games).toHaveValue(defaultElimGames);
      [fee, start, games].forEach((input) => expect(input).toBeEnabled());
    });

    it("renders empty error messages and no invalid inputs", () => {
      renderElims({ elims: [] });

      createErrIds.forEach((testId) =>
        expect(screen.getByTestId(testId)).toBeEmptyDOMElement(),
      );
      Object.values(inputsIn(createPanel())).forEach((input) =>
        expect(input).not.toHaveClass("is-invalid"),
      );
    });

    it("renders an Add Eliminator button and no Delete button", () => {
      renderElims({ elims: [] });

      expect(
        within(createPanel()).getByRole("button", { name: /add eliminator/i }),
      ).toBeEnabled();
      expect(
        within(createPanel()).queryByRole("button", { name: /delete eliminator/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("each eliminator tab", () => {
    it.each(elimCases)("renders every value of %s", (_name, i) => {
      renderElims();
      const elim = mockElims[i];
      const panel = panelFor(elim);

      expect(divisionIn(panel)).toHaveValue(getDivName(elim.div_id, mockDivs));
      const { fee, start, games } = inputsIn(panel);
      expect(fee).toHaveValue(money(elim.fee));
      expect(start).toHaveValue(elim.start);
      expect(games).toHaveValue(elim.games);
    });

    it.each(elimCases)("lets the user edit only the Fee of %s", (_name, i) => {
      renderElims();
      const panel = panelFor(mockElims[i]);

      expect(divisionIn(panel)).toBeDisabled();
      const { fee, start, games } = inputsIn(panel);
      expect(fee).toBeEnabled();
      expect(start).toBeDisabled();
      expect(games).toBeDisabled();
    });

    it.each(elimCases)("renders an enabled, red Delete button on %s", (_name, i) => {
      renderElims();

      const delBtn = within(panelFor(mockElims[i])).getByRole("button", {
        name: /delete eliminator/i,
      });
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
    });

    it("renders no radios and no Add button in an eliminator tab", () => {
      renderElims();
      const panel = panelFor(mockElims[0]);

      expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
      expect(
        within(panel).queryByRole("button", { name: /add eliminator/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("eliminator with errors", () => {
    const elimsWithErrors = () => {
      const elims = cloneDeep(mockElims);
      elims[0] = {
        ...elims[0],
        fee_err: "test fee error",
        start_err: "test start error",
        games_err: "test games error",
      };
      return elims;
    };

    it("marks its Fee, Start and Games as invalid and shows all three messages", () => {
      const elims = elimsWithErrors();
      const id = elims[0].id;
      renderElims({ elims });

      Object.values(inputsIn(panelFor(elims[0]))).forEach((input) =>
        expect(input).toHaveClass("is-invalid"),
      );
      expect(screen.getByTestId(`dangerElimFee${id}`)).toHaveTextContent("test fee error");
      expect(screen.getByTestId(`dangerViewElimStart${id}`)).toHaveTextContent(
        "test start error",
      );
      // before the fix, the Games error was never shown on an eliminator tab
      expect(screen.getByTestId(`dangerViewElimGames${id}`)).toHaveTextContent(
        "test games error",
      );
    });

    it("does not mark the other elims as invalid", () => {
      const elims = elimsWithErrors();
      renderElims({ elims });

      elims.slice(1).forEach((elim) => {
        Object.values(inputsIn(panelFor(elim))).forEach((input) =>
          expect(input).not.toHaveClass("is-invalid"),
        );
        expect(screen.getByTestId(`dangerElimFee${elim.id}`)).toBeEmptyDOMElement();
        expect(screen.getByTestId(`dangerViewElimStart${elim.id}`)).toBeEmptyDOMElement();
        expect(screen.getByTestId(`dangerViewElimGames${elim.id}`)).toBeEmptyDOMElement();
      });
    });
  });

  describe("isDisabled = true", () => {
    it("does not render the Create Eliminator tab, and makes the first elim's tab active", () => {
      renderElims({ isDisabled: true });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockElims.length);
      expect(tabs[0]).toHaveTextContent(elimName(mockElims[0]));
      tabs.forEach((tab) => expect(tab).not.toHaveTextContent(/create eliminator/i));
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it("renders none of the create form: no radios, Add button or create errors", () => {
      renderElims({ isDisabled: true });

      expect(screen.queryByTestId("createElimContainer")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: /add eliminator/i }),
      ).not.toBeInTheDocument();
      createErrIds.forEach((testId) =>
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument(),
      );
    });

    it.each(elimCases)("disables every input of %s, and its dark Delete button", (_name, i) => {
      renderElims({ isDisabled: true });
      const panel = panelFor(mockElims[i]);

      expect(divisionIn(panel)).toBeDisabled();
      Object.values(inputsIn(panel)).forEach((input) => expect(input).toBeDisabled());
      const delBtn = within(panel).getByRole("button", { name: /delete eliminator/i });
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");
    });

    it("still renders the values", () => {
      renderElims({ isDisabled: true });

      const elim = mockElims[0];
      const panel = panelFor(elim);
      expect(divisionIn(panel)).toHaveValue(getDivName(elim.div_id, mockDivs));
      const { fee, start, games } = inputsIn(panel);
      expect(fee).toHaveValue(money(elim.fee));
      expect(start).toHaveValue(elim.start);
      expect(games).toHaveValue(elim.games);
    });
  });
});
