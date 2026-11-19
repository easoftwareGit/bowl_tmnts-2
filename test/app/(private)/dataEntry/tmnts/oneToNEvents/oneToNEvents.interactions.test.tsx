// test/app/(private)/dataEntry/tmnts/oneToNEvents/oneToNEvents.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNEvents.tsx
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNEvents from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
import { mockEvents } from "../../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { mockSquads } from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { localConfig } from "@/lib/currency/const";
import {
  formatValue2Dec,
  formatValueSymbSep2Dec,
} from "@/lib/currency/formatValue";
import { initEvent } from "@/lib/db/initVals";
import { calcLpox, calcLpoxValid } from "@/lib/db/helpers";
import { maxGames } from "@/lib/validation/constants";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import type { eventType, squadType } from "@/lib/types/types";

// simple stand-ins for the modals, so tests don't depend on react-bootstrap's Modal
jest.mock("@/components/modal/confirmModal", () => ({
  __esModule: true,
  default: ({ show, title, message, onConfirm, onCancel }: any) =>
    show ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  delConfTitle: "Confirm Delete",
}));

jest.mock("@/components/modal/errorModal", () => ({
  __esModule: true,
  default: ({ show, title, message, onCancel }: any) =>
    show ? (
      <div data-testid="error-modal">
        <p>{title}</p>
        <p>{message}</p>
        <button onClick={onCancel}>Close</button>
      </div>
    ) : null,
  cannotDeleteTitle: "Cannot Delete",
}));

type Props = React.ComponentProps<typeof OneToNEvents>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** fresh copy of mockEvents with all errors cleared */
const cleanEvents = (): eventType[] =>
  cloneDeep(mockEvents).map((e) => ({
    ...e,
    event_name_err: "",
    team_size_err: "",
    games_err: "",
    added_money_err: "",
    entry_fee_err: "",
    lineage_err: "",
    prize_fund_err: "",
    other_err: "",
    expenses_err: "",
    lpox_err: "",
    errClassName: "",
  }));

/** cleanEvents plus a 3rd event ("Trios") with no squads */
const thirdEventId = "evt_3";
const cleanEventsPlusThird = (): eventType[] => {
  const events = cleanEvents();
  return [
    ...events,
    {
      ...initEvent,
      id: thirdEventId,
      tmnt_id: events[0].tmnt_id,
      sort_order: 3,
      event_name: "Trios",
      tab_title: "Trios",
    },
  ];
};

/** renders OneToNEvents with mock setters; any prop can be overridden */
const renderEvents = (overrides: Partial<Props> = {}) => {
  const setEvents = jest.fn();
  const setSquads = jest.fn();
  const setAcdnErr = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    events: cleanEvents(),
    setEvents,
    squads: [],
    setSquads,
    setAcdnErr,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<OneToNEvents {...props} />);
  return { props, setEvents, setSquads, setAcdnErr, markPendingChanges };
};

/** wraps OneToNEvents in real state, so setEvents re-renders the component */
const StatefulEvents: React.FC<{ initialEvents: eventType[] }> = ({
  initialEvents,
}) => {
  const [events, setEvents] = React.useState(initialEvents);
  const [squads, setSquads] = React.useState<squadType[]>([]);
  return (
    <OneToNEvents
      events={events}
      setEvents={setEvents}
      squads={squads}
      setSquads={setSquads}
      setAcdnErr={jest.fn()}
      isDisabled={false}
    />
  );
};

const lastArg = <T,>(fn: jest.Mock): T =>
  fn.mock.calls[fn.mock.calls.length - 1][0];

/** one event from the last setEvents call */
const lastEvent = (setEvents: jest.Mock, id: string): eventType => {
  const event = lastArg<eventType[]>(setEvents).find((e) => e.id === id);
  if (!event) throw new Error(`event ${id} not in last setEvents call`);
  return event;
};

const acdnErr = (objName: string, errMsg: string) => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

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

const deleteBtn = (id: string) => screen.getByTestId(`eventDel${id}`);

// ---------------------------------------------------------------------------

describe("OneToNEvents - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add event", () => {
    it("passes the events plus one new event with correct defaults to setEvents", async () => {
      const user = userEvent.setup();
      const startingEvents = cleanEvents();
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events: startingEvents,
      });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setEvents).toHaveBeenCalledTimes(1);

      const updated = lastArg<eventType[]>(setEvents);
      expect(updated).toHaveLength(startingEvents.length + 1);
      expect(updated.slice(0, startingEvents.length)).toEqual(startingEvents);

      const lastSort = startingEvents[startingEvents.length - 1].sort_order;
      const newEvent = updated[updated.length - 1];
      expect(newEvent).toEqual({
        ...initEvent,
        id: newEvent.id,
        tmnt_id: startingEvents[0].tmnt_id,
        sort_order: lastSort + 1,
        event_name: `Event ${lastSort + 1}`,
        tab_title: `Event ${lastSort + 1}`,
      });
      expect(newEvent.id).toMatch(/^evt_/);
      expect(startingEvents.some((e) => e.id === newEvent.id)).toBe(false);
      expect(setAcdnErr).not.toHaveBeenCalled();
    });

    it("appends a new tab and keeps the first tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulEvents initialEvents={cleanEvents()} />);

      expect(screen.getAllByRole("tab")).toHaveLength(2);
      await user.click(screen.getByRole("button", { name: /add/i }));

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("numbers each new event one higher than the last", async () => {
      const user = userEvent.setup();
      const startingEvents = cleanEvents();
      const lastSort = startingEvents[startingEvents.length - 1].sort_order;
      render(<StatefulEvents initialEvents={startingEvents} />);

      const addBtn = () => screen.getByRole("button", { name: /add/i });
      await user.click(addBtn());
      await user.click(addBtn());

      expect(
        screen.getByRole("tab", { name: `Event ${lastSort + 1}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: `Event ${lastSort + 2}` }),
      ).toBeInTheDocument();
    });
  });

  describe("delete event", () => {
    it("does not show a Delete button for the first event", () => {
      const events = cleanEvents();
      renderEvents({ events });

      expect(screen.queryByTestId(`eventDel${events[0].id}`)).not.toBeInTheDocument();
      expect(deleteBtn(events[1].id)).toBeInTheDocument();
    });

    it("gives each Delete button its own id", () => {
      const events = cleanEventsPlusThird();
      renderEvents({ events });

      const ids = screen
        .getAllByRole("button", { name: /delete event/i })
        .map((btn) => btn.id);
      expect(ids).toEqual([`eventDel${events[1].id}`, `eventDel${thirdEventId}`]);
    });

    it("asks to confirm, then removes the event and clears the accordion error", async () => {
      const user = userEvent.setup();
      const events = cleanEventsPlusThird();
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events,
      });

      await user.click(deleteBtn(thirdEventId));

      const modal = screen.getByTestId("confirm-modal");
      expect(
        within(modal).getByText("Do you want to delete Event: Trios?"),
      ).toBeInTheDocument();
      expect(setEvents).not.toHaveBeenCalled();

      await user.click(within(modal).getByRole("button", { name: "Confirm" }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setEvents).toHaveBeenCalledTimes(1);
      expect(lastArg(setEvents)).toEqual(
        events.filter((e) => e.id !== thirdEventId),
      );
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    it("after a delete, sets the accordion error to the next event that still has an error", async () => {
      const user = userEvent.setup();
      const events = cleanEventsPlusThird();
      events[0].games_err = "Games error";
      const { setAcdnErr } = renderEvents({ events });

      await user.click(deleteBtn(thirdEventId));
      await user.click(screen.getByRole("button", { name: "Confirm" }));

      expect(lastArg(setAcdnErr)).toEqual(
        acdnErr(events[0].event_name, "Games error"),
      );
    });

    it("after a delete, makes the first tab active", async () => {
      const user = userEvent.setup();
      render(<StatefulEvents initialEvents={cleanEventsPlusThird()} />);

      await user.click(screen.getByRole("tab", { name: "Trios" }));
      await user.click(deleteBtn(thirdEventId));
      await user.click(screen.getByRole("button", { name: "Confirm" }));

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user cancels", async () => {
      const user = userEvent.setup();
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events: cleanEventsPlusThird(),
      });

      await user.click(deleteBtn(thirdEventId));
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(setEvents).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    it("shows an error and does not delete when the event has a squad", async () => {
      const user = userEvent.setup();
      const events = cleanEvents();
      const squads = [{ ...cloneDeep(mockSquads[0]), event_id: events[1].id }];
      const { setEvents, markPendingChanges } = renderEvents({ events, squads });

      await user.click(deleteBtn(events[1].id));

      const modal = screen.getByTestId("error-modal");
      expect(within(modal).getByText("Cannot Delete")).toBeInTheDocument();
      expect(
        within(modal).getByText(
          `Cannot delete Event: ${events[1].event_name}. It has a Squad.`,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();

      await user.click(within(modal).getByRole("button", { name: "Close" }));

      expect(screen.queryByTestId("error-modal")).not.toBeInTheDocument();
      expect(setEvents).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("editing name, team size and games", () => {
    it("updating event_name sets the tab title and clears the name error and accordion error", () => {
      const events = cleanEvents();
      events[1].event_name_err = "Event Name is required";
      events[1].errClassName = objErrClassName;
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events,
      });

      fireEvent.change(nameInputs()[1], { target: { value: "New Name" } });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastEvent(setEvents, events[1].id);
      expect(updated.event_name).toBe("New Name");
      expect(updated.tab_title).toBe("New Name");
      expect(updated.event_name_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited event", () => {
      const events = cleanEvents();
      const { setEvents } = renderEvents({ events });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      expect(lastArg<eventType[]>(setEvents)[0]).toBe(events[0]);
    });

    it("keeps other errors on the edited event and leaves it marked as an error", () => {
      const events = cleanEvents();
      events[1].games_err = "Games error";
      events[1].errClassName = objErrClassName;
      const { setEvents, setAcdnErr } = renderEvents({ events });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      const updated = lastEvent(setEvents, events[1].id);
      expect(updated.games_err).toBe("Games error");
      expect(updated.errClassName).toBe(objErrClassName);
      expect(lastArg(setAcdnErr)).toEqual(acdnErr("Changed", "Games error"));
    });

    it("sets the accordion error to another event's error when the edited one is fixed", () => {
      const events = cleanEvents();
      events[0].team_size_err = "Team Size error";
      events[1].event_name_err = "Event Name is required";
      const { setAcdnErr } = renderEvents({ events });

      fireEvent.change(nameInputs()[1], { target: { value: "Fixed" } });

      expect(lastArg(setAcdnErr)).toEqual(
        acdnErr(events[0].event_name, "Team Size error"),
      );
    });

    it("updating team_size stores a number and clears its error", () => {
      const events = cleanEvents();
      events[1].team_size_err = "Team Size error";
      const { setEvents } = renderEvents({ events });

      fireEvent.change(teamSizeInputs()[1], { target: { value: "3" } });

      const updated = lastEvent(setEvents, events[1].id);
      expect(updated.team_size).toBe(3);
      expect(updated.team_size_err).toBe("");
    });

    it("updating games stores a number and clears its error", () => {
      const events = cleanEvents();
      events[1].games_err = "Games error";
      const { setEvents } = renderEvents({ events });

      fireEvent.change(gamesInputs()[1], { target: { value: "5" } });

      const updated = lastEvent(setEvents, events[1].id);
      expect(updated.games).toBe(5);
      expect(updated.games_err).toBe("");
    });
  });

  describe("changing games updates the event's squads", () => {
    /** event 0 has 3 games; squads A and B belong to it, squad C does not */
    const setup = (eventGames = 3) => {
      const events = cleanEvents();
      events[0].games = eventGames;
      const base = cloneDeep(mockSquads[0]);
      const squads: squadType[] = [
        { ...base, id: "sqd_A", event_id: events[0].id, games: eventGames },
        { ...base, id: "sqd_B", event_id: events[0].id, games: 4 },
        { ...base, id: "sqd_C", event_id: events[1].id, games: eventGames },
      ];
      return { events, squads, ...renderEvents({ events, squads }) };
    };

    it("updates a squad whose games matched the event's old games", () => {
      const { setSquads } = setup();

      fireEvent.change(gamesInputs()[0], { target: { value: "5" } });

      const updated = lastArg<squadType[]>(setSquads);
      expect(updated.find((s) => s.id === "sqd_A")!.games).toBe(5);
    });

    it("keeps a squad that has its own games count", () => {
      const { setSquads } = setup();

      fireEvent.change(gamesInputs()[0], { target: { value: "5" } });

      const updated = lastArg<squadType[]>(setSquads);
      expect(updated.find((s) => s.id === "sqd_B")!.games).toBe(4);
    });

    it("does not change squads of other events", () => {
      const { setSquads, squads } = setup();

      fireEvent.change(gamesInputs()[0], { target: { value: "5" } });

      const updated = lastArg<squadType[]>(setSquads);
      expect(updated.find((s) => s.id === "sqd_C")).toBe(squads[2]);
    });

    it("updates every linked squad when the event's games was 0", () => {
      const { setSquads } = setup(0);

      fireEvent.change(gamesInputs()[0], { target: { value: "5" } });

      const updated = lastArg<squadType[]>(setSquads);
      expect(updated.find((s) => s.id === "sqd_A")!.games).toBe(5);
      expect(updated.find((s) => s.id === "sqd_B")!.games).toBe(5);
    });

    it("does not update squads when games is out of range", () => {
      const { setSquads, setEvents, events } = setup();

      fireEvent.change(gamesInputs()[0], {
        target: { value: String(maxGames + 1) },
      });

      expect(setSquads).not.toHaveBeenCalled();
      expect(lastEvent(setEvents, events[0].id).games).toBe(maxGames + 1);
    });
  });

  describe("editing money fields", () => {
    it("stores the typed entry fee and clears its error and the accordion error", () => {
      const events = cleanEvents();
      events[0].entry_fee_err = "Entry Fee error";
      events[0].errClassName = objErrClassName;
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events,
      });

      fireEvent.change(entryFeeInputs()[0], { target: { value: "150" } });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.entry_fee).toBe("150");
      expect(updated.entry_fee_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("stores an empty string when the entry fee is cleared", async () => {
      const user = userEvent.setup();
      const events = cleanEvents();
      const { setEvents } = renderEvents({ events });

      await user.clear(entryFeeInputs()[0]);

      expect(lastEvent(setEvents, events[0].id).entry_fee).toBe("");
    });

    it("clears lpox_err when a part of the entry fee changes", () => {
      const events = cleanEvents();
      events[0].lpox_err = "Entry Fee ≠ LPOX";
      events[0].lineage = "1";
      const { setEvents } = renderEvents({ events });

      fireEvent.change(lineageInputs()[0], { target: { value: "12" } });

      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.lineage).toBe("12");
      expect(updated.lpox_err).toBe("");
    });

    it("keeps lpox_err when added money changes, because it is not part of the entry fee", () => {
      const events = cleanEvents();
      events[0].lpox_err = "Entry Fee ≠ LPOX";
      const { setEvents } = renderEvents({ events });

      fireEvent.change(addedInputs()[0], { target: { value: "500" } });

      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.added_money).toBe("500");
      expect(updated.lpox_err).toBe("Entry Fee ≠ LPOX");
    });
  });

  describe("handleBlur", () => {
    it("an empty event_name resets to 'Event <sort_order>' and clears the name error", () => {
      const events = cleanEvents();
      events[1].event_name_err = "Event Name is required";
      const { setEvents, markPendingChanges } = renderEvents({ events });

      fireEvent.blur(nameInputs()[1], {
        target: { name: "event_name", value: "" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastEvent(setEvents, events[1].id);
      const expectedName = `Event ${events[1].sort_order}`;
      expect(updated.event_name).toBe(expectedName);
      expect(updated.tab_title).toBe(expectedName);
      // the old code cleared "name_err", a field that doesn't exist
      expect(updated.event_name_err).toBe("");
    });

    it("an empty team_size resets to 1 and clears its error", () => {
      const events = cleanEvents();
      events[0].team_size_err = "Team Size error";
      const { setEvents } = renderEvents({ events });

      fireEvent.blur(teamSizeInputs()[0], {
        target: { name: "team_size", value: "" },
      });

      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.team_size).toBe(1);
      expect(updated.team_size_err).toBe("");
    });

    it("an empty games resets to 3 and clears its error", () => {
      const events = cleanEvents();
      events[0].games_err = "Games error";
      const { setEvents } = renderEvents({ events });

      fireEvent.blur(gamesInputs()[0], {
        target: { name: "games", value: "" },
      });

      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.games).toBe(3);
      expect(updated.games_err).toBe("");
    });

    it("a money field with a value is formatted, and L+P+O+X is recalculated", () => {
      const events = cleanEvents();
      events[0].lineage_err = "Lineage error";
      const { setEvents, markPendingChanges } = renderEvents({ events });

      fireEvent.blur(lineageInputs()[0], {
        target: { name: "lineage", value: "45" },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      // EaCurrencyInput calls onValueChange on blur, then onBlur, so setEvents
      // is called twice. The last call is the one from handleBlur.
      expect(setEvents).toHaveBeenCalled();
      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.lineage).toBe(formatValue2Dec("45", localConfig));
      expect(updated.lineage_err).toBe("");
      expect(updated.lpox).toBe(calcLpox(updated));
      expect(updated.lpox_valid).toBe(calcLpoxValid(updated));
    });

    it("an empty money field is stored as '', and L+P+O+X is recalculated", () => {
      const events = cleanEvents();
      const { setEvents } = renderEvents({ events });

      fireEvent.blur(otherInputs()[0], {
        target: { name: "other", value: "" },
      });

      const updated = lastEvent(setEvents, events[0].id);
      expect(updated.other).toBe("");
      expect(updated.lpox).toBe(calcLpox(updated));
    });

    it("a non-empty name, team size or games does nothing", () => {
      const { setEvents, markPendingChanges } = renderEvents();

      fireEvent.blur(nameInputs()[0], {
        target: { name: "event_name", value: "Still Here" },
      });
      fireEvent.blur(teamSizeInputs()[0], {
        target: { name: "team_size", value: "2" },
      });

      expect(setEvents).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });

    it("updates the L+P+O+X field as the parts of the entry fee are entered", async () => {
      const user = userEvent.setup();
      const events = cleanEvents();
      events[0] = {
        ...events[0],
        entry_fee: "150",
        lineage: "",
        prize_fund: "",
        other: "",
        expenses: "",
      };
      render(<StatefulEvents initialEvents={events} />);

      const enter = async (input: HTMLInputElement, value: string) => {
        await user.clear(input);
        await user.type(input, value);
        await user.tab(); // blur recalculates L+P+O+X
      };
      await enter(lineageInputs()[0], "45");
      await enter(prizeInputs()[0], "95");
      await enter(otherInputs()[0], "4");
      await enter(expensesInputs()[0], "6");

      expect(lpoxInputs()[0]).toHaveValue(
        formatValueSymbSep2Dec("150", localConfig),
      );
    });
  });

  describe("isDisabled = true", () => {
    it("disables Add and Delete, and clicking them does nothing", async () => {
      const user = userEvent.setup();
      const events = cleanEvents();
      const { setEvents, setAcdnErr, markPendingChanges } = renderEvents({
        events,
        isDisabled: true,
      });

      const addBtn = screen.getByRole("button", { name: /add/i });
      const delBtn = deleteBtn(events[1].id);
      expect(addBtn).toBeDisabled();
      expect(delBtn).toBeDisabled();

      await user.click(addBtn);
      await user.click(delBtn);

      expect(setEvents).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    it.each([
      ["Event Name", nameInputs, "New Name"],
      ["Team Size", teamSizeInputs, "2"],
      ["Event Games", gamesInputs, "5"],
      ["Added $", addedInputs, "100"],
      ["Entry Fee", entryFeeInputs, "100"],
      ["Lineage", lineageInputs, "20"],
      ["Prize Fund", prizeInputs, "70"],
      ["Other", otherInputs, "5"],
      ["Expenses", expensesInputs, "5"],
    ] as const)(
      "disables every %s input, and typing does nothing",
      async (_label, getInputs, text) => {
        const user = userEvent.setup();
        const { setEvents, setSquads, markPendingChanges } = renderEvents({
          isDisabled: true,
        });

        for (const input of getInputs()) {
          expect(input).toBeDisabled();
          await user.type(input, text);
        }

        expect(setEvents).not.toHaveBeenCalled();
        expect(setSquads).not.toHaveBeenCalled();
        expect(markPendingChanges).not.toHaveBeenCalled();
      },
    );

    it("always disables the L+P+O+X field", () => {
      renderEvents();
      lpoxInputs().forEach((input) => expect(input).toBeDisabled());
    });
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds an event without crashing", async () => {
      const user = userEvent.setup();
      const { setEvents } = renderEvents({ markPendingChanges: undefined });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(setEvents).toHaveBeenCalled();
    });

    it("updates event_name without crashing", () => {
      const { setEvents } = renderEvents({ markPendingChanges: undefined });

      fireEvent.change(nameInputs()[0], { target: { value: "Updated" } });

      expect(setEvents).toHaveBeenCalled();
    });

    it("deletes an event without crashing", async () => {
      const user = userEvent.setup();
      const { setEvents } = renderEvents({
        events: cleanEventsPlusThird(),
        markPendingChanges: undefined,
      });

      await user.click(deleteBtn(thirdEventId));
      await user.click(screen.getByRole("button", { name: "Confirm" }));

      expect(setEvents).toHaveBeenCalled();
    });
  });
});


// // test/app/(private)/dataEntry/tmnts/oneToNEvents/oneToNEvents.interactions.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/oneToNEvents.tsx
// import React from "react";
// import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import OneToNEvents from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
// import { mockEvents } from "../../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
// import { mockSquads } from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
// import { localConfig } from "@/lib/currency/const";
// import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
// import { initEvent } from "@/lib/db/initVals";
// import { cloneDeep } from "lodash";

// const mockSetEvents = jest.fn();
// const mockSetSquads = jest.fn();
// const mockSetAcdnErr = jest.fn();
// const mockMarkPendingChanges = jest.fn();

// const mockOneToNEventsProps = {
//   events: mockEvents,
//   setEvents: mockSetEvents,
//   squads: mockSquads,
//   setSquads: mockSetSquads,
//   setAcdnErr: mockSetAcdnErr,
//   isDisabled: false,
//   markPendingChanges: mockMarkPendingChanges,
// };

// // mock the modals
// jest.mock("@/components/modal/confirmModal", () => ({
//   __esModule: true,
//   default: ({ show, title, message, onConfirm, onCancel }: any) =>
//     show ? (
//       <div data-testid="confirm-modal">
//         <p>{title}</p>
//         <p>{message}</p>
//         <button onClick={onConfirm}>Confirm</button>
//         <button onClick={onCancel}>Cancel</button>
//       </div>
//     ) : null,
//   delConfTitle: "Delete Event",
// }));

// jest.mock("@/components/modal/errorModal", () => ({
//   __esModule: true,
//   default: ({ show, title, message, onCancel }: any) =>
//     show ? (
//       <div data-testid="error-modal">
//         <p>{title}</p>
//         <p>{message}</p>
//         <button onClick={onCancel}>Close</button>
//       </div>
//     ) : null,
//   cannotDeleteTitle: "Cannot Delete",
// }));

// const makeProps = (overrides: Partial<React.ComponentProps<typeof OneToNEvents>> = {}) => {
//   const eventsCopy = cloneDeep(mockEvents);
//   const squadsCopy = cloneDeep(mockSquads);

//   return {
//     events: eventsCopy,
//     squads: squadsCopy,
//     setEvents: jest.fn(),
//     setSquads: jest.fn(),
//     setAcdnErr: jest.fn(),
//     isDisabled: false,
//     markPendingChanges: jest.fn(),
//     ...overrides,
//   } as React.ComponentProps<typeof OneToNEvents>;
// };

// describe("OneToNEvents - Interactions", () => { 
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("add event", () => {
//     beforeAll(() => {
//       mockEvents.push({
//         ...initEvent,
//         id: "3",
//         sort_order: 3,
//         event_name: "Trios",
//         tab_title: "Trios",
//       });
//     });

//     afterAll(() => {
//       if (mockEvents.length === 3) mockEvents.pop();
//     });

//     it("test if added event has correct tab title", async () => {
//       // ARRANGE
//       const user = userEvent.setup();
//       render(<OneToNEvents {...mockOneToNEventsProps} />);
//       const addBtn = screen.getByText("Add");
//       // ACT
//       await user.click(addBtn);
//       // ASSERT
//       expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();

//       // ACT
//       const tabs = screen.getAllByRole("tab");
//       // ASSERT
//       expect(tabs).toHaveLength(3);
//       expect(tabs[2]).toHaveTextContent("Trios");
//       // // ARRANGE
//       await user.click(tabs[2]);
//       // ACT
//       const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
//       await user.clear(eventNames[2])
//       await user.type(eventNames[2], "Trios")
//       expect(eventNames[2]).toHaveValue(mockEvents[2].event_name);      
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     });
//     it('enter team size', async () => {
//       // ARRANGE
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       // ACT
//       const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i })
//       await user.clear(teamSizes[2])
//       await user.type(teamSizes[2], "3")
//       // ASSERT
//       expect(teamSizes[2]).toHaveValue(mockEvents[2].team_size);
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter games', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];
//       await user.clear(games[2])
//       await user.type(games[2], "5")
//       expect(games[2]).toHaveValue(mockEvents[2].games);
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter added money', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
//       await user.clear(addeds[2])
//       await user.type(addeds[2], "250")      
//       expect(addeds[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].added_money, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter entry fee', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];
//       await user.clear(fees[2])
//       await user.type(fees[2], "150")
//       expect(fees[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter lineage', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
//       await user.clear(lineages[2])
//       await user.type(lineages[2], "45")      
//       expect(lineages[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].lineage, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter prize fund', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
//       await user.clear(prizes[2])
//       await user.type(prizes[2], "95")
//       expect(prizes[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].prize_fund, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter other', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
//       await user.clear(others[2])
//       await user.type(others[2], "4")
//       expect(others[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].other, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('enter expenses', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
//       await user.clear(expenses[2])
//       await user.type(expenses[2], "6")
//       expect(expenses[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].expenses, localConfig)
//       );
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     })
//     it('test if LPOX is recalculated', async () => {
//       const logSpy = jest.spyOn(global.console, 'log')
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[];      
//       const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
//       await user.clear(fees[2])
//       await user.type(fees[2], "150");      
//       const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];
//       await user.click(eventNames[2]);
//       expect(fees[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig)
//       );    
//       expect(lpoxs[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].lpox, localConfig)
//       );      
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//       expect(lpoxs[2]).toHaveClass('form-control')
//     })
//     it('test if LPOX is correct', async () => {
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       await user.click(addBtn);
//       const tabs = screen.getAllByRole('tab');
//       await user.click(tabs[2]);
//       const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i }) as HTMLInputElement[];      
//       const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];            
//       const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
//       const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[]; 
//       const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
//       const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
//       const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
//       const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
//       const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
//       await user.type(teamSizes[2], "3")
//       await user.type(games[2], "5")
//       await user.type(addeds[2], "1000")
//       await user.type(fees[2], "150")
//       await user.type(lineages[2], "45")
//       await user.type(prizes[2], "95")
//       await user.type(others[2], "4")
//       await user.type(expenses[2], "6")

//       const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];      
//       await user.click(eventNames[2]);

//       // test lpox vs entry fee, to test if lpox calc is working
//       expect(lpoxs[2]).toHaveValue(
//         formatValueSymbSep2Dec(mockEvents[2].lpox, localConfig)
//       );      
//       expect(lpoxs[2]).toHaveClass('form-control')
//     })
//     it("add an event", async () => {
//       // ARRANGE
//       const user = userEvent.setup()
//       render(<OneToNEvents {...mockOneToNEventsProps} />)
//       const addBtn = screen.getByText("Add");
//       // ACT
//       await user.click(addBtn);
//       // ASSERT
//       expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);

//       // ACT
//       const tabs = screen.getAllByRole('tab');
//       // ASSERT
//       expect(tabs).toHaveLength(3)

//       // ARRANGE                       
//       const eventNames = screen.getAllByRole("textbox", { name: /event name/i }) as HTMLInputElement[];      
//       const teamSizes = screen.getAllByRole('spinbutton', { name: /team size/i }) as HTMLInputElement[];      
//       const games = screen.getAllByRole('spinbutton', { name: /event games/i }) as HTMLInputElement[];            
//       const addeds = screen.getAllByRole('textbox', { name: /added \$/i }) as HTMLInputElement[];
//       const fees = screen.getAllByRole('textbox', { name: /entry fee/i }) as HTMLInputElement[]; 
//       const lineages = screen.getAllByRole('textbox', { name: /lineage/i }) as HTMLInputElement[];
//       const prizes = screen.getAllByRole('textbox', { name: /prize fund/i }) as HTMLInputElement[];
//       const others = screen.getAllByRole('textbox', { name: /other/i }) as HTMLInputElement[];
//       const expenses = screen.getAllByRole('textbox', { name: /expenses/i }) as HTMLInputElement[];
//       const lpoxs = screen.getAllByRole('textbox', { name: /L\+P\+O\+X/i }) as HTMLInputElement[];
//       // ACT 
//       await user.click(tabs[2]);
//       expect(eventNames[2]).toHaveValue(mockEvents[2].event_name);
//       expect(teamSizes[2].value as string).toBe(mockEvents[2].team_size.toString());      
//       expect(games[2].value as string).toBe(mockEvents[2].games.toString());
//       expect(addeds[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].added_money[0], localConfig));      
//       expect(fees[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig));
//       expect(lineages[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].lineage, localConfig));
//       expect(prizes[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].prize_fund, localConfig));
//       expect(others[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].other, localConfig));
//       expect(expenses[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].expenses, localConfig));
//       // test lpox vs entry fee, to test if lpox calc is working
//       expect(lpoxs[2].value as string).toBe(formatValueSymbSep2Dec(mockEvents[2].entry_fee, localConfig));
//       expect(lpoxs[2]).not.toHaveClass('is-invalid')      
//     })
//   });

//   describe("delete event", () => {
//     beforeAll(() => {
//       mockEvents.push({
//         ...initEvent,
//         id: "3",
//         sort_order: 3,
//         event_name: "Trios",
//         tab_title: "Trios",
//       });
//     });

//     afterAll(() => {
//       if (mockEvents.length === 3) mockEvents.pop();
//     });

//     it("delete event", async () => {
//       // ARRANGE
//       const user = userEvent.setup();
//       render(<OneToNEvents {...mockOneToNEventsProps} />);

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[2]);

//       const delBtns = screen.getAllByText("Delete Event");
//       expect(delBtns).toHaveLength(2);

//       // ACT - first click only opens confirm modal
//       await user.click(delBtns[1]);

//       const confirmModal = await screen.findByTestId("confirm-modal");
//       expect(confirmModal).toBeInTheDocument();

//       const confirmButton = within(confirmModal).getByText("Confirm");
//       await user.click(confirmButton);

//       // ASSERT - delete happens after confirm
//       expect(mockOneToNEventsProps.setEvents).toHaveBeenCalled();
//       expect(mockOneToNEventsProps.markPendingChanges).toHaveBeenCalledWith(true);
//     });    
//   });
  
//   describe("setSquads sync when event.games changes", () => {
//     it("updates squads.games for squads tied to the event when games changes within valid range", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();

//       // Make sure at least one squad belongs to the first event
//       props.squads[0].event_id = props.events[0].id;

//       const setSquads = jest.fn();
//       props.setSquads = setSquads;

//       render(<OneToNEvents {...props} />);

//       const gamesInputs = screen.getAllByRole("spinbutton", {
//         name: /event games/i,
//       }) as HTMLInputElement[];
      
//       // Simulate the user changing the value to "5"
//       fireEvent.change(gamesInputs[0], { target: { value: "5" } });

//       expect(setSquads).toHaveBeenCalled();  
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);

//       const [[updatedSquads]] = setSquads.mock.calls as any;
//       const linkedSquad = updatedSquads.find(
//         (s: any) => s.event_id === props.events[0].id
//       );

//       expect(linkedSquad).toBeDefined();
//       expect(linkedSquad.games).toBe(5);
//     });
//   });

//   describe("delete flow", () => {
//     it("does not show Delete button when there is only one event (cannot delete last event)", () => {
//       const props = makeProps({
//         events: [cloneDeep(mockEvents[0])], // just one event
//       });

//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const delBtn = screen.queryByText("Delete Event");
//       expect(delBtn).not.toBeInTheDocument();
//       expect(setEvents).not.toHaveBeenCalled();
//       expect(mockOneToNEventsProps.markPendingChanges).not.toHaveBeenCalledWith(true);
//     });

//     it("shows error modal and does not delete when event has squads", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();

//       // Make sure the second event has at least one squad
//       props.squads[0].event_id = props.events[1].id;

//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[1]); // focus second event

//       const delBtn = screen.getByText("Delete Event");
//       await user.click(delBtn);

//       const errorModal = await screen.findByTestId("error-modal");
//       expect(errorModal).toBeInTheDocument();
//       expect(within(errorModal).getByText("Cannot Delete")).toBeInTheDocument();

//       // No delete was actually performed
//       expect(setEvents).not.toHaveBeenCalled();
//       expect(mockOneToNEventsProps.markPendingChanges).not.toHaveBeenCalledWith(true);
//       // And we never showed the confirm modal
//       expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
//     });

//     it("shows confirm modal and deletes event when confirmed", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();

//       // Make sure no squad is tied to the second event
//       props.squads = props.squads.filter(
//         (s) => s.event_id !== props.events[1].id
//       );

//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[1]); // focus second event

//       const delBtn = screen.getByText("Delete Event");
//       await user.click(delBtn);

//       const confirmModal = await screen.findByTestId("confirm-modal");
//       const confirmButton = within(confirmModal).getByText("Confirm");
//       await user.click(confirmButton);

//       expect(setEvents).toHaveBeenCalled();      
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);

//       const [[updatedEvents]] = setEvents.mock.calls as any;
//       // One less event
//       expect(updatedEvents).toHaveLength(props.events.length - 1);
//       // And the deleted id is not present
//       const deletedStillThere = updatedEvents.find(
//         (e: any) => e.id === props.events[1].id
//       );
//       expect(deletedStillThere).toBeUndefined();
//     });
//   });

//   describe("amount field edge cases", () => {
//     it("clears non-numeric currency input and sets entry_fee to ''", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();

//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const feeInputs = screen.getAllByRole("textbox", {
//         name: /entry fee/i,
//       }) as HTMLInputElement[];

//       await user.clear(feeInputs[0]);
//       await user.type(feeInputs[0], "abc"); // non-numeric

//       expect(setEvents).toHaveBeenCalled();
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);      

//       const [[updatedEvents]] = setEvents.mock.calls as any;
//       const ev0 = updatedEvents.find(
//         (e: any) => e.id === props.events[0].id
//       );

//       expect(ev0.entry_fee).toBe(""); // sanitized to empty string
//     });

//     it("clears lpox_err when editing a fee component field (e.g. lineage)", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();

//       // seed an event with an lpox_err set
//       props.events[0].lpox_err = "Entry Fee ≠ LPOX";
//       const originalLineage = props.events[0].lineage;

//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const lineageInputs = screen.getAllByRole("textbox", {
//         name: /lineage/i,
//       }) as HTMLInputElement[];

//       await user.clear(lineageInputs[0]);
//       await user.type(lineageInputs[0], "12");

//       expect(setEvents).toHaveBeenCalled();
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);      

//       // Look at the *last* call (final state)
//       const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
//       const [updatedEvents] = lastCall;
//       const ev0 = updatedEvents.find(
//         (e: any) => e.id === props.events[0].id
//       );

//       expect(ev0).toBeDefined();
//       // don't care about the exact string, only that it changed:
//       expect(ev0.lineage).not.toBe(originalLineage);
//       // This is the real behavior under test:
//       expect(ev0.lpox_err).toBe("");
//     });

//   });

//   describe("handleBlur defaulting behavior", () => {
//     it("defaults blank event_name back to 'Event {sort_order}' and tab_title", () => {
//       const props = makeProps();
//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const nameInputs = screen.getAllByRole("textbox", {
//         name: /event name/i,
//       }) as HTMLInputElement[];

//       const firstNameInput = nameInputs[0];

//       // Manually blank out the input's DOM value
//       firstNameInput.value = "";

//       // Trigger blur so handleBlur runs and sees value === ""
//       fireEvent.blur(firstNameInput);

//       expect(setEvents).toHaveBeenCalled();
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);      

//       // Use the last call (the blur handler)
//       const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
//       const [updatedEvents] = lastCall;
//       const ev0 = updatedEvents.find(
//         (e: any) => e.id === props.events[0].id
//       );

//       expect(ev0).toBeDefined();
//       expect(ev0.event_name).toBe(`Event ${ev0.sort_order}`);
//       expect(ev0.tab_title).toBe(`Event ${ev0.sort_order}`);
//     });
    
//     it("defaults blank team_size back to 1 on blur", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();
//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const teamInputs = screen.getAllByRole("spinbutton", { name: /team size/i }) as HTMLInputElement[];

//       teamInputs[0].value = "";
//       fireEvent.blur(teamInputs[0]);

//       expect(setEvents).toHaveBeenCalled();
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);      

//       const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
//       const [updatedEvents] = lastCall;
//       const ev0 = updatedEvents.find(
//         (e: any) => e.id === props.events[0].id
//       );

//       expect(ev0).toBeDefined();
//       expect(ev0.team_size).toBe(1);
//       expect(ev0.team_size_err).toBe("");
//     });

//     it("defaults blank games back to 3 on blur", async () => {
//       const user = userEvent.setup();
//       const props = makeProps();
//       const setEvents = jest.fn();
//       props.setEvents = setEvents;

//       render(<OneToNEvents {...props} />);

//       const gamesInputs = screen.getAllByRole("spinbutton", { name: /event games/i }) as HTMLInputElement[];

//       gamesInputs[0].value = "";
//       fireEvent.blur(gamesInputs[0]);      

//       expect(setEvents).toHaveBeenCalled();
//       expect(props.markPendingChanges).toHaveBeenCalledWith(true);      

//       const lastCall = setEvents.mock.calls[setEvents.mock.calls.length - 1] as any;
//       const [updatedEvents] = lastCall;
//       const ev0 = updatedEvents.find(
//         (e: any) => e.id === props.events[0].id
//       );

//       expect(ev0).toBeDefined();
//       expect(ev0.games).toBe(3);
//       expect(ev0.games_err).toBe("");
//     });
//   });

//   describe("optional markPendingChanges prop", () => {

//     beforeEach(() => {
//       jest.clearAllMocks();
//     });

//     it("adds an event without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       const setEvents = jest.fn();

//       const props = makeProps({
//         setEvents,
//       });

//       delete (props as Partial<typeof props>).markPendingChanges;

//       render(<OneToNEvents {...props} />);

//       const addBtn = screen.getByRole("button", { name: /add/i });

//       await user.click(addBtn);

//       expect(setEvents).toHaveBeenCalled();
//     });

//     it("updates event_name without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       const setEvents = jest.fn();

//       const props = makeProps({
//         setEvents,
//       });

//       delete (props as Partial<typeof props>).markPendingChanges;

//       render(<OneToNEvents {...props} />);

//       const nameInputs = screen.getAllByRole("textbox", {
//         name: /event name/i,
//       }) as HTMLInputElement[];

//       await user.clear(nameInputs[0]);
//       await user.type(nameInputs[0], "Updated Event");

//       expect(setEvents).toHaveBeenCalled();
//     });

//     it("deletes an event without crashing when markPendingChanges is omitted", async () => {
//       const user = userEvent.setup();

//       const props = makeProps({
//         setEvents: jest.fn(),
//       });

//       // ensure second event has no squads tied to it
//       props.squads = props.squads.filter(
//         (s) => s.event_id !== props.events[1].id
//       );

//       delete (props as Partial<typeof props>).markPendingChanges;

//       render(<OneToNEvents {...props} />);

//       const tabs = screen.getAllByRole("tab");
//       await user.click(tabs[1]);

//       const delBtn = screen.getByText("Delete Event");
//       await user.click(delBtn);

//       const confirmModal = await screen.findByTestId("confirm-modal");

//       const confirmButton = within(confirmModal).getByText("Confirm");

//       await user.click(confirmButton);

//       expect(props.setEvents).toHaveBeenCalled();
//     });

//   });  
// })

