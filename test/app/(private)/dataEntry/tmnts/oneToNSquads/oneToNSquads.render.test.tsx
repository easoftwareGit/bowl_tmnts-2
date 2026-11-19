// test/app/(private)/dataEntry/tmnts/oneToNSquads/oneToNSquads.render.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNSquads.tsx
// (rendering only - clicks, typing, deletes, updatedLanes and validLanes are in
//  oneToNSquads.interactions.test.tsx)
import React, { act } from "react";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNSquads from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
import {
  mockLanes,
  mockSquads,
} from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { mockEvents } from "../../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { initSquad } from "@/lib/db/initVals";
import {
  maxEventLength,
  maxGames,
  maxLaneCount,
  maxStartLane,
  minGames,
  minLaneCount,
  minStartLane,
} from "@/lib/validation/constants";
import type { squadType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof OneToNSquads>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** renders OneToNSquads with fresh copies of the mocks; any prop can be overridden */
const renderSquads = (overrides: Partial<Props> = {}) => {
  const props: Props = {
    squads: cloneDeep(mockSquads),
    setSquads: jest.fn(),
    lanes: cloneDeep(mockLanes),
    setLanes: jest.fn(),
    events: cloneDeep(mockEvents),
    setAcdnErr: jest.fn(),
    isDisabled: false,
    markPendingChanges: jest.fn(),
    ...overrides,
  };
  render(<OneToNSquads {...props} />);
  return props;
};

/** mockSquads with every error set on the 2nd squad */
const squadsWithErrors = (): squadType[] => {
  const squads = cloneDeep(mockSquads);
  squads[1] = {
    ...squads[1],
    event_id_err: "test event error",
    squad_name_err: "test name error",
    games_err: "test games error",
    starting_lane_err: "test starting lane error",
    lane_count_err: "test lane count error",
    squad_date_err: "test date error",
    squad_time_err: "test time error",
    errClassName: "test-err-class",
  };
  return squads;
};

/** mockSquads plus a 3rd squad */
const thirdSquadId = "sqd_3";
const threeSquads = (): squadType[] => [
  ...cloneDeep(mockSquads),
  {
    ...initSquad,
    id: thirdSquadId,
    event_id: mockEvents[0].id,
    sort_order: 3,
    squad_name: "Trios",
    tab_title: "Trios",
  },
];

const nameInputs = () =>
  screen.getAllByRole("textbox", { name: /squad name/i }) as HTMLInputElement[];
const gamesInputs = () =>
  screen.getAllByRole("spinbutton", { name: /squad games/i }) as HTMLInputElement[];
const eventSelects = () =>
  screen.getAllByRole("combobox", { name: /event/i }) as HTMLSelectElement[];
const startLaneInputs = () =>
  screen.getAllByRole("spinbutton", { name: /starting lane/i }) as HTMLInputElement[];
const laneCountInputs = () =>
  screen.getAllByRole("spinbutton", { name: /# of lanes/i }) as HTMLInputElement[];
const dateInputs = () =>
  screen.getAllByLabelText(/^date$/i) as HTMLInputElement[];
const timeInputs = () =>
  screen.getAllByLabelText(/start time/i) as HTMLInputElement[];

/** every field: label, its inputs, its error test id and error field */
const fields = [
  ["Squad Name", nameInputs, "dangerSquadName", "squad_name_err"],
  ["Squad Games", gamesInputs, "dangerSquadGames", "games_err"],
  ["Event", eventSelects, "dangerSquadEvent", "event_id_err"],
  ["Starting Lane", startLaneInputs, "dangerStartingLane", "starting_lane_err"],
  ["# of Lanes", laneCountInputs, "dangerLaneCount", "lane_count_err"],
  ["Date", dateInputs, "dangerSquadDate", "squad_date_err"],
  ["Start Time", timeInputs, "dangerSquadTime", "squad_time_err"],
] as const;

const labelFor = (text: string) =>
  screen.getAllByText((_c, el) =>
    el?.tagName === "LABEL" && (el.textContent ?? "").trim().startsWith(text),
  ) as HTMLLabelElement[];

// ---------------------------------------------------------------------------

describe("OneToNSquads - render", () => {
  describe("tabs", () => {
    it("renders one tab per squad, titled with tab_title, with the first tab active", () => {
      renderSquads();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockSquads.length);
      tabs.forEach((tab, i) =>
        expect(tab).toHaveTextContent(mockSquads[i].tab_title),
      );
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });

    it("selecting the 2nd tab makes it active", async () => {
      const user = userEvent.setup();
      renderSquads();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("adds the squad's errClassName to its tab", () => {
      renderSquads({ squads: squadsWithErrors() });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveClass("test-err-class");
      expect(tabs[0]).not.toHaveClass("test-err-class");
    });

    it("with one squad, renders one active tab", () => {
      renderSquads({ squads: [cloneDeep(mockSquads[0])] });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(1);
      expect(tabs[0]).toHaveTextContent(mockSquads[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Add and Delete", () => {
    it("renders the # Squads label and a disabled count of the squads", () => {
      renderSquads();

      expect(screen.getByText("# Squads")).toBeInTheDocument();
      const numSquads = screen.getByRole("textbox", { name: /# squads/i });
      expect(numSquads).toHaveValue(String(mockSquads.length));
      expect(numSquads).toBeDisabled();
    });

    it("renders one enabled, green Add button, on the first squad", () => {
      renderSquads();

      const addBtns = screen.getAllByRole("button", { name: /add/i });
      expect(addBtns).toHaveLength(1);
      expect(addBtns[0]).toBeEnabled();
      expect(addBtns[0]).toHaveClass("btn-success");
    });

    it("renders an enabled, red Delete button on every squad but the first", () => {
      renderSquads();

      expect(
        screen.queryByTestId(`squadDel${mockSquads[0].id}`),
      ).not.toBeInTheDocument();
      const delBtn = screen.getByTestId(`squadDel${mockSquads[1].id}`);
      expect(delBtn).toHaveTextContent("Delete Squad");
      expect(delBtn).toBeEnabled();
      expect(delBtn).toHaveClass("btn-danger");
    });

    it("with one squad, shows a count of 1 and no Delete button", () => {
      renderSquads({ squads: [cloneDeep(mockSquads[0])] });

      expect(screen.getByRole("textbox", { name: /# squads/i })).toHaveValue("1");
      expect(
        screen.queryByRole("button", { name: /delete squad/i }),
      ).not.toBeInTheDocument();
    });

    it("with 3 squads, shows a count of 3 and 2 Delete buttons with their own ids", () => {
      const squads = threeSquads();
      renderSquads({ squads });

      expect(screen.getByRole("textbox", { name: /# squads/i })).toHaveValue("3");
      const ids = screen
        .getAllByRole("button", { name: /delete squad/i })
        .map((btn) => btn.id);
      expect(ids).toEqual([`squadDel${squads[1].id}`, `squadDel${thirdSquadId}`]);
    });

    it("renders no modal", () => {
      renderSquads();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("labels", () => {
    it.each(fields.map(([label]) => label))(
      "renders a %s label for each squad",
      (label) => {
        renderSquads();
        expect(labelFor(label)).toHaveLength(mockSquads.length);
      },
    );

    it("renders the # of Lanes label text, then a space, then a ? help icon", () => {
      renderSquads();

      const label = labelFor("# of Lanes")[0];
      expect(label.textContent ?? "").toMatch(/^# of Lanes\s+\?/);
      const helpSpan = within(label).getByText("?", { selector: "span" });
      expect(helpSpan).toHaveClass("popup-help");
      // one or more spaces, then '?', then one or more spaces
      expect(helpSpan.textContent ?? "").toMatch(/^\s+\?\s+$/);
    });
  });

  describe("values", () => {
    it("renders every field's value for each squad", () => {
      renderSquads();

      mockSquads.forEach((squad, i) => {
        expect(nameInputs()[i]).toHaveValue(squad.squad_name);
        expect(gamesInputs()[i]).toHaveValue(squad.games);
        expect(eventSelects()[i]).toHaveValue(squad.event_id);
        expect(startLaneInputs()[i]).toHaveValue(squad.starting_lane);
        expect(laneCountInputs()[i]).toHaveValue(squad.lane_count);
        expect(dateInputs()[i]).toHaveValue(squad.squad_date_str);
        expect(timeInputs()[i]).toHaveValue(squad.squad_time);
      });
    });

    it("lists every event, by name, in each Event select", () => {
      renderSquads();

      eventSelects().forEach((select) => {
        const options = within(select).getAllByRole("option") as HTMLOptionElement[];
        expect(options.map((o) => o.textContent)).toEqual(
          mockEvents.map((e) => e.event_name),
        );
        expect(options.map((o) => o.value)).toEqual(mockEvents.map((e) => e.id));
      });
    });

    it("renders a blank start time when squad_time is blank or null", () => {
      const squads = cloneDeep(mockSquads);
      squads[0].squad_time = "";
      squads[1].squad_time = null as unknown as squadType["squad_time"];
      renderSquads({ squads });

      expect(timeInputs()[0]).toHaveValue("");
      expect(timeInputs()[1]).toHaveValue("");
    });

    it("limits the squad name length to maxEventLength", () => {
      renderSquads();
      nameInputs().forEach((input) =>
        expect(input).toHaveAttribute("maxLength", String(maxEventLength)),
      );
    });

    it.each([
      ["Squad Games", gamesInputs, minGames, maxGames, 1],
      ["Starting Lane", startLaneInputs, minStartLane, maxStartLane, 2],
      ["# of Lanes", laneCountInputs, minLaneCount, maxLaneCount, 2],
    ] as const)(
      "gives %s the right min, max and step",
      (_label, getInputs, min, max, step) => {
        renderSquads();
        getInputs().forEach((input) => {
          expect(input).toHaveAttribute("min", String(min));
          expect(input).toHaveAttribute("max", String(max));
          expect(input).toHaveAttribute("step", String(step));
        });
      },
    );
  });

  describe("no errors", () => {
    it.each(fields)(
      "renders %s without is-invalid and with an empty error message",
      (_label, getInputs, testId) => {
        const squads = cloneDeep(mockSquads).map((s) => ({
          ...s,
          event_id_err: "",
          squad_name_err: "",
          games_err: "",
          starting_lane_err: "",
          lane_count_err: "",
          squad_date_err: "",
          squad_time_err: "",
        }));
        renderSquads({ squads });

        getInputs().forEach((input) => expect(input).not.toHaveClass("is-invalid"));
        const errors = screen.getAllByTestId(testId);
        expect(errors).toHaveLength(mockSquads.length);
        errors.forEach((err) => expect(err).toBeEmptyDOMElement());
      },
    );
  });

  describe("squad with errors", () => {
    it.each(fields)(
      "marks %s as invalid and shows its error message",
      (_label, getInputs, testId, errField) => {
        const squads = squadsWithErrors();
        renderSquads({ squads });

        expect(getInputs()[1]).toHaveClass("is-invalid");
        expect(screen.getAllByTestId(testId)[1]).toHaveTextContent(
          squads[1][errField],
        );
        // the squad without errors is not marked
        expect(getInputs()[0]).not.toHaveClass("is-invalid");
      },
    );
  });

  describe("isDisabled = true", () => {
    it("disables Add and Delete, and uses dark button styles", () => {
      renderSquads({ isDisabled: true });

      const addBtn = screen.getByRole("button", { name: /add/i });
      expect(addBtn).toBeDisabled();
      expect(addBtn).toHaveClass("btn-dark");
      expect(addBtn).not.toHaveClass("btn-success");

      const delBtn = screen.getByTestId(`squadDel${mockSquads[1].id}`);
      expect(delBtn).toBeDisabled();
      expect(delBtn).toHaveClass("btn-dark");
      expect(delBtn).not.toHaveClass("btn-danger");
    });

    it.each(fields)("disables every %s input", (_label, getInputs) => {
      renderSquads({ isDisabled: true });
      getInputs().forEach((input) => expect(input).toBeDisabled());
    });

    it("still renders the values", () => {
      renderSquads({ isDisabled: true });

      expect(nameInputs()[0]).toHaveValue(mockSquads[0].squad_name);
      expect(startLaneInputs()[1]).toHaveValue(mockSquads[1].starting_lane);
    });
  });

  describe("# of Lanes help tooltip", () => {
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
      const tooltipRegex = /Number of lanes used in the squad/i;
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderSquads();

      // before hover - no tooltip
      expect(screen.queryByText(tooltipRegex)).not.toBeInTheDocument();

      const helpSpan = within(labelFor("# of Lanes")[0]).getByText("?", {
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
    });
  });
});

