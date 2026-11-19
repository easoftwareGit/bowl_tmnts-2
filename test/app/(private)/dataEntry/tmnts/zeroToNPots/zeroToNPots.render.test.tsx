// test/app/(private)/dataEntry/tmnts/zeroToNPots/zeroToNPots.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/zeroToNPots.tsx
// (rendering only - clicks, typing, adds and deletes are in
//  zeroToNPots.interactions.test.tsx)
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import ZeroToNPots from "@/app/(private)/dataEntry/tmntForm/zeroToNPots";
import {
  mockPots,
  mockDivs,
  mockSquads,
} from "../../../../../mocks/tmnts/twoDivs/mockDivs";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getDivName, getPotName } from "@/lib/getName";
import { ptGame, ptLastGame, ptSeries } from "@/lib/validation/constants";
import type { potType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof ZeroToNPots>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders ZeroToNPots with fresh copies of the mocks; any prop can be overridden */
const renderPots = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    pots: cloneDeep(mockPots),
    setPots: jest.fn(),
    divs: cloneDeep(mockDivs),
    squads: cloneDeep(mockSquads),
    setAcdnErr: jest.fn(),
    setShowingModal: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<ZeroToNPots {...props} />);
  return props;
};

const potTypes = [ptGame, ptLastGame, ptSeries];

const potName = (pot: potType) => getPotName(pot, mockDivs);
const money = (value: string) => formatValueSymbSep2Dec(value, localConfig);

const createPanel = () => screen.getByRole("tabpanel", { name: /create pot/i });
/**
 * a pot's tab panel, found by the pot's id. React-Bootstrap gives each pane
 * the id "<tabs id>-tabpane-<eventKey>", and the eventKey is the pot's id.
 * (finding it by name breaks when two mock pots have the same name)
 */
const panelFor = (pot: potType) => {
  const panel = screen
    .getAllByRole("tabpanel")
    .find((p) => p.id === `pots-tabs-tabpane-${pot.id}`);
  if (!panel) throw new Error(`no tab panel for pot ${pot.id}`);
  return panel;
};

/** a pot panel's Pot Type, Division and Fee inputs, found by their labels */
const inputsIn = (panel: HTMLElement) => {
  const byLabel = (label: RegExp) =>
    within(panel).getByLabelText(label) as HTMLInputElement;
  return {
    potType: byLabel(/^pot type$/i),
    division: byLabel(/^division$/i),
    fee: byLabel(/^fee$/i),
  };
};

const createFee = () =>
  within(createPanel()).getByLabelText(/^fee$/i) as HTMLInputElement;

const createErrIds = ["dangerPotType", "dangerDiv", "dangerPotFee"];

/** label, pot index - used to run the same checks on every mock pot */
const potCases = mockPots.map((p, i) => [potName(p), i] as const);

// ---------------------------------------------------------------------------

describe("ZeroToNPots - render", () => {
  describe("tabs", () => {
    it("renders a Create Pot tab, then one tab per pot titled with its name", () => {
      renderPots();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockPots.length + 1);
      expect(tabs[0]).toHaveTextContent("Create Pot");
      mockPots.forEach((pot, i) =>
        expect(tabs[i + 1]).toHaveTextContent(potName(pot)),
      );
    });

    it("makes the Create Pot tab active", () => {
      renderPots();

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it.each(potCases)("selecting the %s tab makes only it active", async (_name, i) => {
      const user = userEvent.setup();
      renderPots();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[i + 1]);

      tabs.forEach((tab, t) =>
        expect(tab).toHaveAttribute("aria-selected", String(t === i + 1)),
      );
    });

    it("renders only the active Create Pot tab when there are no pots", () => {
      renderPots({ pots: [] });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveTextContent("Create Pot");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("adds a pot's errClassName to its tab", () => {
      const pots = cloneDeep(mockPots);
      pots[1].errClassName = "test-err-class";
      renderPots({ pots });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[2]).toHaveClass("test-err-class");
      expect(tabs[1]).not.toHaveClass("test-err-class");
    });
  });

  describe("Create Pot tab", () => {
    it("has the create background classes", () => {
      renderPots({ pots: [] });

      const wrapper = screen.getByTestId("createPotContainer");
      expect(wrapper).toHaveClass("container");
      expect(wrapper).toHaveClass("rounded-3");
      expect(wrapper).toHaveClass("createBackground");
    });

    it("renders one Pot Type radio per pot type, none checked, all in one group", () => {
      renderPots({ pots: [] });

      potTypes.forEach((potType) => {
        const radio = within(createPanel()).getByRole("radio", { name: potType });
        expect(radio).not.toBeChecked();
        expect(radio).toHaveAttribute("name", "potTypeRadio");
      });
    });

    it("renders one Division radio per division, none checked, all in one group", () => {
      renderPots({ pots: [] });

      mockDivs.forEach((div) => {
        const radio = within(createPanel()).getByRole("radio", { name: div.div_name });
        expect(radio).not.toBeChecked();
        expect(radio).toHaveAttribute("name", "potsDivRadio");
      });
      expect(within(createPanel()).getAllByRole("radio")).toHaveLength(
        potTypes.length + mockDivs.length,
      );
    });

    it("checks the only Division radio when there is one division", () => {
      renderPots({ pots: [], divs: [cloneDeep(mockDivs[0])] });

      expect(
        within(createPanel()).getByRole("radio", { name: mockDivs[0].div_name }),
      ).toBeChecked();
    });

    it("renders the Pot Type and Division group labels", () => {
      renderPots({ pots: [] });

      expect(
        within(createPanel()).getByText(/^pot type$/i, { selector: "label" }),
      ).toBeInTheDocument();
      expect(
        within(createPanel()).getByText(/^division$/i, { selector: "label" }),
      ).toBeInTheDocument();
    });

    it("renders an empty, editable Fee", () => {
      renderPots({ pots: [] });

      expect(createFee()).toHaveValue("");
      expect(createFee()).toBeEnabled();
    });

    it("renders empty error messages and no invalid fee", () => {
      renderPots({ pots: [] });

      createErrIds.forEach((testId) =>
        expect(screen.getByTestId(testId)).toBeEmptyDOMElement(),
      );
      expect(createFee()).not.toHaveClass("is-invalid");
    });

    it("renders an Add Pot button and no Delete button", () => {
      renderPots({ pots: [] });

      const addBtn = within(createPanel()).getByRole("button", { name: /add pot/i });
      expect(addBtn).toBeEnabled();
      expect(addBtn).toHaveAttribute("type", "button");
      expect(
        within(createPanel()).queryByRole("button", { name: /delete pot/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("each pot tab", () => {
    it.each(potCases)("renders every value of %s", (_name, i) => {
      renderPots();
      const pot = mockPots[i];

      const { potType, division, fee } = inputsIn(panelFor(pot));
      expect(potType).toHaveValue(pot.pot_type);
      expect(division).toHaveValue(getDivName(pot.div_id, mockDivs));
      expect(fee).toHaveValue(money(pot.fee));
    });

    it.each(potCases)("lets the user edit only the Fee of %s", (_name, i) => {
      renderPots();

      const { potType, division, fee } = inputsIn(panelFor(mockPots[i]));
      expect(potType).toBeDisabled();
      expect(division).toBeDisabled();
      expect(fee).toBeEnabled();
    });

    it.each(potCases)("renders an enabled, red Delete button on %s", (_name, i) => {
      renderPots();

      const delBtn = within(panelFor(mockPots[i])).getByRole("button", {
        name: /delete pot/i,
      });
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
      // without a type, the button would submit the tournament form
      expect(delBtn).toHaveAttribute("type", "button");
    });

    it("renders no radios and no Add button in a pot tab", () => {
      renderPots();
      const panel = panelFor(mockPots[0]);

      expect(within(panel).queryAllByRole("radio")).toHaveLength(0);
      expect(
        within(panel).queryByRole("button", { name: /add pot/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("pot with an error", () => {
    const potsWithError = () => {
      // a copy, so the shared mock data is never changed
      const pots = cloneDeep(mockPots);
      pots[1].fee_err = "test fee error";
      return pots;
    };

    it("marks its Fee as invalid and shows the message", () => {
      const pots = potsWithError();
      renderPots({ pots });

      expect(inputsIn(panelFor(pots[1])).fee).toHaveClass("is-invalid");
      expect(screen.getByTestId(`dangerPotFee${pots[1].id}`)).toHaveTextContent(
        "test fee error",
      );
    });

    it("does not mark the other pots as invalid", () => {
      const pots = potsWithError();
      renderPots({ pots });

      pots
        .filter((_pot, i) => i !== 1)
        .forEach((pot) => {
          expect(inputsIn(panelFor(pot)).fee).not.toHaveClass("is-invalid");
          expect(screen.getByTestId(`dangerPotFee${pot.id}`)).toBeEmptyDOMElement();
        });
    });
  });

  describe("isDisabled = true", () => {
    it("does not render the Create Pot tab, and makes the first pot's tab active", () => {
      renderPots({ isDisabled: true });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockPots.length);
      expect(tabs[0]).toHaveTextContent(potName(mockPots[0]));
      tabs.forEach((tab) => expect(tab).not.toHaveTextContent(/create pot/i));
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      tabs.slice(1).forEach((tab) =>
        expect(tab).toHaveAttribute("aria-selected", "false"),
      );
    });

    it("renders none of the create form: no radios, Add button or create errors", () => {
      renderPots({ isDisabled: true });

      expect(screen.queryByTestId("createPotContainer")).not.toBeInTheDocument();
      expect(screen.queryAllByRole("radio")).toHaveLength(0);
      expect(screen.queryByRole("button", { name: /add pot/i })).not.toBeInTheDocument();
      createErrIds.forEach((testId) =>
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument(),
      );
    });

    it.each(potCases)("disables every input of %s, and its dark Delete button", (_name, i) => {
      renderPots({ isDisabled: true });
      const panel = panelFor(mockPots[i]);

      Object.values(inputsIn(panel)).forEach((input) => expect(input).toBeDisabled());
      const delBtn = within(panel).getByRole("button", { name: /delete pot/i });
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");
    });

    it("still renders the values", () => {
      renderPots({ isDisabled: true });

      const pot = mockPots[0];
      const { potType, division, fee } = inputsIn(panelFor(pot));
      expect(potType).toHaveValue(pot.pot_type);
      expect(division).toHaveValue(getDivName(pot.div_id, mockDivs));
      expect(fee).toHaveValue(money(pot.fee));
    });
  });
});

