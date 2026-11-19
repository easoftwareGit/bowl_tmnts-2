// test/app/(private)/dataEntry/tmnts/oneToNEvents/oneToNEvents.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNEvents.tsx
// (rendering only - clicks, typing and deletes are in oneToNEvents.interactions.test.tsx)
import React, { act } from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNEvents from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
import { mockEvents } from "../../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { mockSquads } from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { initEvent } from "@/lib/db/initVals";
import { maxEventLength } from "@/lib/validation/constants";
import type { eventType, validTypeStrings } from "@/lib/types/types";

type Props = React.ComponentProps<typeof OneToNEvents>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders OneToNEvents with a fresh copy of mockEvents; any prop can be overridden */
const renderEvents = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    events: cloneDeep(mockEvents),
    setEvents: jest.fn(),
    squads: cloneDeep(mockSquads),
    setSquads: jest.fn(),
    setAcdnErr: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<OneToNEvents {...props} />);
  return props;
};

/** mockEvents with every error set on the 2nd event */
const eventsWithErrors = (): eventType[] => {
  const events = cloneDeep(mockEvents);
  events[1] = {
    ...events[1],
    event_name_err: "test event name error",
    team_size_err: "test team size error",
    games_err: "test games error",
    added_money_err: "test added money error",
    entry_fee_err: "test entry fee error",
    lineage_err: "test lineage error",
    prize_fund_err: "test prize fund error",
    other_err: "test other error",
    expenses_err: "test expenses error",
    lpox_err: "test lpox error",
    lpox_valid: "is-invalid",
    errClassName: "test-err-class",
  };
  return events;
};

/** mockEvents plus a 3rd event; lpox_valid can be set */
const thirdEventId = "evt_3";
const threeEvents = (lpoxValid: validTypeStrings = ""): eventType[] => {
  const events = cloneDeep(mockEvents);
  return [
    ...events,
    {
      ...initEvent,
      id: thirdEventId,
      tmnt_id: events[0].tmnt_id,
      sort_order: 3,
      event_name: "Trios",
      tab_title: "Trios",
      lpox_valid: lpoxValid,
    },
  ];
};

const money = (value: string) => formatValueSymbSep2Dec(value, localConfig);

const textboxes = (name: RegExp) =>
  screen.getAllByRole("textbox", { name }) as HTMLInputElement[];
const spinbuttons = (name: RegExp) =>
  screen.getAllByRole("spinbutton", { name }) as HTMLInputElement[];

const nameInputs = () => textboxes(/event name/i);
const teamSizeInputs = () => spinbuttons(/team size/i);
const gamesInputs = () => spinbuttons(/event games/i);
const addedInputs = () => textboxes(/added \$/i);
const entryFeeInputs = () => textboxes(/entry fee/i);
const lineageInputs = () => textboxes(/lineage/i);
const prizeInputs = () => textboxes(/prize fund/i);
const otherInputs = () => textboxes(/other/i);
const expensesInputs = () => textboxes(/expenses/i);
const lpoxInputs = () => textboxes(/L\+P\+O\+X/i);

/** every editable field: label text, its inputs, its error test id and error field */
const editableFields = [
  ["Event Name", nameInputs, "dangerEventName", "event_name_err"],
  ["Team Size", teamSizeInputs, "dangerTeamSize", "team_size_err"],
  ["Event Games", gamesInputs, "dangerEventGames", "games_err"],
  ["Added $", addedInputs, "dangerEventAddedMoney", "added_money_err"],
  ["Entry Fee", entryFeeInputs, "dangerEventEntryFee", "entry_fee_err"],
  ["Lineage", lineageInputs, "dangerEventLineage", "lineage_err"],
  ["Prize Fund", prizeInputs, "dangerEventPrizeFund", "prize_fund_err"],
  ["Other", otherInputs, "dangerEventOther", "other_err"],
  ["Expenses", expensesInputs, "dangerEventExpenses", "expenses_err"],
] as const;

/** money fields: label text, its inputs, and the event field it shows */
const moneyFields = [
  ["Added $", addedInputs, "added_money"],
  ["Entry Fee", entryFeeInputs, "entry_fee"],
  ["Lineage", lineageInputs, "lineage"],
  ["Prize Fund", prizeInputs, "prize_fund"],
  ["Other", otherInputs, "other"],
  ["Expenses", expensesInputs, "expenses"],
  ["L+P+O+X", lpoxInputs, "lpox"],
] as const;

/** labels with a ? help icon: label text, label regex, tooltip text */
const helpLabels = [
  ["Team Size", /^Team Size\s+\?/, /Singles = 1, Doubles = 2\.\.\./],
  [
    "Added $",
    /^Added \$\s+\?/,
    /Total Prize Fund = Added \$ \+ \(Entry Prize Fund \* Number of Entries\)/,
  ],
  [
    "L+P+O+X",
    /^L\+P\+O\+X\s+\?/,
    /Lineage \+ Prize Fund \+ Other \+ eXpenses must equal Entry Fee/,
  ],
] as const;

const labelFor = (text: string) =>
  screen.getAllByText((_c, el) =>
    el?.tagName === "LABEL" && (el.textContent ?? "").startsWith(text),
  ) as HTMLLabelElement[];

// ---------------------------------------------------------------------------

describe("OneToNEvents - render", () => {
  describe("tabs", () => {
    it("renders one tab per event, titled with tab_title, with the first tab active", () => {
      renderEvents();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockEvents.length);
      tabs.forEach((tab, i) =>
        expect(tab).toHaveTextContent(mockEvents[i].tab_title),
      );
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });

    it("selecting the 2nd tab makes it active", async () => {
      const user = userEvent.setup();
      renderEvents();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("adds the event's errClassName to its tab", () => {
      renderEvents({ events: eventsWithErrors() });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveClass("test-err-class");
      expect(tabs[0]).not.toHaveClass("test-err-class");
    });
  });

  describe("Add and Delete", () => {
    it("renders the # Events label and a disabled count of the events", () => {
      renderEvents();

      expect(screen.getByText("# Events")).toBeInTheDocument();
      const numEvents = screen.getByRole("textbox", { name: /# events/i });
      expect(numEvents).toHaveValue(String(mockEvents.length));
      expect(numEvents).toBeDisabled();
    });

    it("renders one enabled, green Add button, on the first event", () => {
      renderEvents();

      const addBtns = screen.getAllByRole("button", { name: /add/i });
      expect(addBtns).toHaveLength(1);
      expect(addBtns[0]).toBeEnabled();
      expect(addBtns[0]).toHaveClass("btn-success");
    });

    it("renders an enabled, red Delete button on every event but the first", () => {
      renderEvents();

      expect(
        screen.queryByTestId(`eventDel${mockEvents[0].id}`),
      ).not.toBeInTheDocument();
      const delBtn = screen.getByTestId(`eventDel${mockEvents[1].id}`);
      expect(delBtn).toHaveTextContent("Delete Event");
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
    });

    it("with 3 events, renders 3 tabs, a count of 3 and 2 Delete buttons with their own ids", () => {
      const events = threeEvents();
      renderEvents({ events });

      expect(screen.getAllByRole("tab")).toHaveLength(3);
      expect(screen.getByRole("textbox", { name: /# events/i })).toHaveValue("3");
      const ids = screen
        .getAllByRole("button", { name: /delete event/i })
        .map((btn) => btn.id);
      expect(ids).toEqual([`eventDel${events[1].id}`, `eventDel${thirdEventId}`]);
    });

    it("renders no modal", () => {
      renderEvents();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("labels", () => {
    it.each(editableFields.map(([label]) => label))(
      "renders a %s label for each event",
      (label) => {
        renderEvents();
        expect(labelFor(label)).toHaveLength(mockEvents.length);
      },
    );

    it("renders an L+P+O+X label for each event", () => {
      renderEvents();
      expect(labelFor("L+P+O+X")).toHaveLength(mockEvents.length);
    });

    it.each(helpLabels)(
      "renders the %s label text, then a space, then a ? help icon",
      (label, labelRegex) => {
        renderEvents();

        const labelEl = labelFor(label)[0];
        expect(labelEl.textContent ?? "").toMatch(labelRegex);
        const helpSpan = within(labelEl).getByText("?", { selector: "span" });
        expect(helpSpan).toHaveClass("popup-help");
        // one or more spaces, then '?', then one or more spaces
        expect(helpSpan.textContent ?? "").toMatch(/^\s+\?\s+$/);
      },
    );
  });

  describe("values", () => {
    it("renders the event name, team size and games for each event", () => {
      renderEvents();

      mockEvents.forEach((event, i) => {
        expect(nameInputs()[i]).toHaveValue(event.event_name);
        expect(teamSizeInputs()[i]).toHaveValue(event.team_size);
        expect(gamesInputs()[i]).toHaveValue(event.games);
      });
    });

    it.each(moneyFields)(
      "renders %s as formatted money for each event",
      (_label, getInputs, field) => {
        renderEvents();

        mockEvents.forEach((event, i) =>
          expect(getInputs()[i]).toHaveValue(money(event[field])),
        );
      },
    );

    it("limits the event name length to maxEventLength", () => {
      renderEvents();
      nameInputs().forEach((input) =>
        expect(input).toHaveAttribute("maxLength", String(maxEventLength)),
      );
    });
  });

  describe("no errors", () => {
    it.each(editableFields)(
      "renders %s without is-invalid and with an empty error message",
      (_label, getInputs, testId) => {
        renderEvents();

        getInputs().forEach((input) => expect(input).not.toHaveClass("is-invalid"));
        const errors = screen.getAllByTestId(testId);
        expect(errors).toHaveLength(mockEvents.length);
        errors.forEach((err) => expect(err).toBeEmptyDOMElement());
      },
    );

    it("renders an empty L+P+O+X error message", () => {
      renderEvents();
      screen
        .getAllByTestId("dangerEventLpox")
        .forEach((err) => expect(err).toBeEmptyDOMElement());
    });
  });

  describe("event with errors", () => {
    it.each(editableFields)(
      "marks %s as invalid and shows its error message",
      (_label, getInputs, testId, errField) => {
        const events = eventsWithErrors();
        renderEvents({ events });

        expect(getInputs()[1]).toHaveClass("is-invalid");
        expect(screen.getAllByTestId(testId)[1]).toHaveTextContent(
          events[1][errField],
        );
        // the event without errors is not marked
        expect(getInputs()[0]).not.toHaveClass("is-invalid");
        expect(screen.getAllByTestId(testId)[0]).toBeEmptyDOMElement();
      },
    );

    it("shows the L+P+O+X error message", () => {
      renderEvents({ events: eventsWithErrors() });

      expect(screen.getAllByTestId("dangerEventLpox")[1]).toHaveTextContent(
        "test lpox error",
      );
    });
  });

  describe("L+P+O+X field", () => {
    it("is always disabled", () => {
      renderEvents();
      lpoxInputs().forEach((input) => expect(input).toBeDisabled());
    });

    it.each(["is-valid", "is-invalid"] as const)(
      "adds lpox_valid '%s' as a class",
      (lpoxValid) => {
        renderEvents({ events: threeEvents(lpoxValid) });
        expect(lpoxInputs()[2]).toHaveClass(lpoxValid);
      },
    );

    it("adds neither class when lpox_valid is blank", () => {
      renderEvents({ events: threeEvents("") });

      expect(lpoxInputs()[2]).not.toHaveClass("is-valid");
      expect(lpoxInputs()[2]).not.toHaveClass("is-invalid");
    });
  });

  describe("isDisabled = true", () => {
    it("disables Add and Delete, and uses dark button styles", () => {
      renderEvents({ isDisabled: true });

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeDisabled();
      expect(addBtn).toHaveClass("btn-dark");
      expect(addBtn).not.toHaveClass("btn-success");

      const delBtn = screen.getByTestId(`eventDel${mockEvents[1].id}`);
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");
    });

    it.each(editableFields)("disables every %s input", (_label, getInputs) => {
      renderEvents({ isDisabled: true });
      getInputs().forEach((input) => expect(input).toBeDisabled());
    });

    it("still renders the values", () => {
      renderEvents({ isDisabled: true });

      expect(nameInputs()[0]).toHaveValue(mockEvents[0].event_name);
      expect(entryFeeInputs()[1]).toHaveValue(money(mockEvents[1].entry_fee));
    });
  });

  describe("help tooltips", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      act(() => {
        jest.runOnlyPendingTimers();
      });
      jest.useRealTimers();
    });

    it.each(helpLabels)(
      "only shows the %s tooltip while its help icon is hovered",
      async (label, _labelRegex, tooltipRegex) => {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        renderEvents();

        // before hover - no tooltip
        expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

        const helpSpan = within(labelFor(label)[0]).getByText("?", {
          selector: "span",
        });

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
      },
    );
  });
});
