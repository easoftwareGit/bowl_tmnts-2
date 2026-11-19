// test/app/(private)/dataEntry/tmnts/oneToNSquads/oneToNSquads.interactions.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNSquads.tsx
// (rendering only tests belong in oneToNSquads.render.test.tsx)
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNSquads, {
  updatedLanes,
  validLanes,
} from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
import {
  mockLanes,
  mockSquads,
} from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { mockEvents } from "../../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
import { initSquad } from "@/lib/db/initVals";
import { todayStr } from "@/lib/dateTools";
import {
  maxLaneCount,
  maxStartLane,
  minLaneCount,
  minStartLane,
} from "@/lib/validation/constants";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import type { laneType, squadType } from "@/lib/types/types";

type Props = React.ComponentProps<typeof OneToNSquads>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** fresh copy of mockSquads with all errors cleared */
const cleanSquads = (): squadType[] =>
  cloneDeep(mockSquads).map((s) => ({
    ...s,
    event_id_err: "",
    squad_name_err: "",
    games_err: "",
    starting_lane_err: "",
    lane_count_err: "",
    squad_date_err: "",
    squad_time_err: "",
    errClassName: "",
  }));

/** cleanSquads plus a 3rd squad ("Trios") on lanes 31-34 */
const thirdSquadId = "sqd_3";
const cleanSquadsPlusThird = (): squadType[] => [
  ...cleanSquads(),
  {
    ...initSquad,
    id: thirdSquadId,
    event_id: mockEvents[0].id,
    sort_order: 3,
    squad_name: "Trios",
    tab_title: "Trios",
    starting_lane: 31,
    lane_count: 4,
  },
];

/** mockLanes plus lanes 31-34 for the 3rd squad */
const lanesPlusThird = (): laneType[] => [
  ...cloneDeep(mockLanes),
  ...[31, 32, 33, 34].map((n) => ({
    id: `lan_${n}`,
    lane_number: n,
    squad_id: thirdSquadId,
    in_use: true,
  })),
];

/** renders OneToNSquads with mock setters; any prop can be overridden */
const renderSquads = (overrides: Partial<Props> = {}) => {
  const setSquads = jest.fn();
  const setLanes = jest.fn();
  const setAcdnErr = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    squads: cleanSquads(),
    setSquads,
    lanes: cloneDeep(mockLanes),
    setLanes,
    events: cloneDeep(mockEvents),
    setAcdnErr,
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  render(<OneToNSquads {...props} />);
  return { props, setSquads, setLanes, setAcdnErr, markPendingChanges };
};

/** wraps OneToNSquads in real state, so setSquads and setLanes re-render it */
const StatefulSquads: React.FC<{
  initialSquads: squadType[];
  initialLanes?: laneType[];
}> = ({ initialSquads, initialLanes = cloneDeep(mockLanes) }) => {
  const [squads, setSquads] = React.useState(initialSquads);
  const [lanes, setLanes] = React.useState(initialLanes);
  return (
    <OneToNSquads
      squads={squads}
      setSquads={setSquads}
      lanes={lanes}
      setLanes={setLanes}
      events={mockEvents}
      setAcdnErr={jest.fn()}
      isDisabled={false}
    />
  );
};

const lastArg = <T,>(fn: jest.Mock): T =>
  fn.mock.calls[fn.mock.calls.length - 1][0];

/** one squad from the last setSquads call */
const lastSquad = (setSquads: jest.Mock, id: string): squadType => {
  const squad = lastArg<squadType[]>(setSquads).find((s) => s.id === id);
  if (!squad) throw new Error(`squad ${id} not in last setSquads call`);
  return squad;
};

/** lane numbers for one squad, in order */
const laneNumbers = (lanes: laneType[], squadId: string) =>
  lanes.filter((l) => l.squad_id === squadId).map((l) => l.lane_number);

/** lane numbers from start, count long */
const range = (start: number, count: number) =>
  Array.from({ length: count }, (_, i) => start + i);

const acdnErr = (objName: string, errMsg: string) => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

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

const deleteBtn = (id: string) => screen.getByTestId(`squadDel${id}`);

/** clicks Delete for a squad, then Yes in the confirm dialog */
const deleteAndConfirm = async (
  user: ReturnType<typeof userEvent.setup>,
  id: string,
) => {
  await user.click(deleteBtn(id));
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /yes/i }));
};

// ---------------------------------------------------------------------------

describe("OneToNSquads - interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("add squad", () => {
    it("passes the squads plus one new squad with correct defaults to setSquads", async () => {
      const user = userEvent.setup();
      const startingSquads = cleanSquads();
      const { setSquads, markPendingChanges } = renderSquads({
        squads: startingSquads,
      });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(setSquads).toHaveBeenCalledTimes(1);

      const updated = lastArg<squadType[]>(setSquads);
      expect(updated).toHaveLength(startingSquads.length + 1);
      expect(updated.slice(0, startingSquads.length)).toEqual(startingSquads);

      const lastSort = startingSquads[startingSquads.length - 1].sort_order;
      const newSquad = updated[updated.length - 1];
      expect(newSquad).toEqual({
        ...initSquad,
        id: newSquad.id,
        event_id: mockEvents[0].id,
        sort_order: lastSort + 1,
        squad_name: `Squad ${lastSort + 1}`,
        tab_title: `Squad ${lastSort + 1}`,
      });
      expect(newSquad.id).toMatch(/^sqd_/);
    });

    it("links the new squad to the first event, which is the one its select shows", async () => {
      const user = userEvent.setup();
      const { setSquads } = renderSquads();

      await user.click(screen.getByRole("button", { name: /add/i }));

      const updated = lastArg<squadType[]>(setSquads);
      // before the fix this was blank, so validation said "Event not found"
      expect(updated[updated.length - 1].event_id).toBe(mockEvents[0].id);
    });

    it("adds lanes for the new squad and keeps every other lane", async () => {
      const user = userEvent.setup();
      const lanes = cloneDeep(mockLanes);
      const { setSquads, setLanes } = renderSquads({ lanes });

      await user.click(screen.getByRole("button", { name: /add/i }));

      const updatedSquads = lastArg<squadType[]>(setSquads);
      const newSquad = updatedSquads[updatedSquads.length - 1];
      const updatedLanesArg = lastArg<laneType[]>(setLanes);

      expect(updatedLanesArg.slice(0, lanes.length)).toEqual(lanes);
      expect(laneNumbers(updatedLanesArg, newSquad.id)).toEqual(
        range(newSquad.starting_lane, newSquad.lane_count),
      );
    });

    it("appends a new tab, keeps the first tab active, and numbers each new squad", async () => {
      const user = userEvent.setup();
      const startingSquads = cleanSquads();
      const lastSort = startingSquads[startingSquads.length - 1].sort_order;
      render(<StatefulSquads initialSquads={startingSquads} />);

      const addBtn = () => screen.getByRole("button", { name: /add/i });
      await user.click(addBtn());
      await user.click(addBtn());

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(startingSquads.length + 2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("tab", { name: `Squad ${lastSort + 1}` }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: `Squad ${lastSort + 2}` }),
      ).toBeInTheDocument();
    });
  });

  describe("delete squad", () => {
    it("does not show a Delete button for the first squad", () => {
      const squads = cleanSquads();
      renderSquads({ squads });

      expect(screen.queryByTestId(`squadDel${squads[0].id}`)).not.toBeInTheDocument();
      expect(deleteBtn(squads[1].id)).toBeInTheDocument();
    });

    it("gives each Delete button its own id", () => {
      const squads = cleanSquadsPlusThird();
      renderSquads({ squads, lanes: lanesPlusThird() });

      const ids = screen
        .getAllByRole("button", { name: /delete squad/i })
        .map((btn) => btn.id);
      expect(ids).toEqual([`squadDel${squads[1].id}`, `squadDel${thirdSquadId}`]);
    });

    it("asks to confirm, then removes the squad and its lanes", async () => {
      const user = userEvent.setup();
      const squads = cleanSquadsPlusThird();
      const lanes = lanesPlusThird();
      const { setSquads, setLanes, setAcdnErr, markPendingChanges } =
        renderSquads({ squads, lanes });

      await user.click(deleteBtn(thirdSquadId));
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByText("Do you want to delete Squad: Trios?"),
      ).toBeInTheDocument();
      expect(setSquads).not.toHaveBeenCalled();

      await user.click(within(dialog).getByRole("button", { name: /yes/i }));

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      expect(lastArg(setSquads)).toEqual(
        squads.filter((s) => s.id !== thirdSquadId),
      );
      expect(lastArg(setLanes)).toEqual(
        lanes.filter((l) => l.squad_id !== thirdSquadId),
      );
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("after a delete, sets the accordion error to the next squad that still has an error", async () => {
      const user = userEvent.setup();
      const squads = cleanSquadsPlusThird();
      squads[0].games_err = "Games error";
      const { setAcdnErr } = renderSquads({ squads, lanes: lanesPlusThird() });

      await deleteAndConfirm(user, thirdSquadId);

      expect(lastArg(setAcdnErr)).toEqual(
        acdnErr(squads[0].squad_name, "Games error"),
      );
    });

    it("deleting down to one squad clears its 'Time is required' error, red tab and accordion error", async () => {
      const user = userEvent.setup();
      const squads = cleanSquads();
      // the squad that is KEPT has the time error
      squads[0].squad_time_err = "Time is required";
      squads[0].errClassName = objErrClassName;
      const { setSquads, setAcdnErr } = renderSquads({ squads });

      await deleteAndConfirm(user, squads[1].id);

      const [kept] = lastArg<squadType[]>(setSquads);
      expect(lastArg<squadType[]>(setSquads)).toHaveLength(1);
      expect(kept.squad_time_err).toBe("");
      // before the fix the tab stayed red
      expect(kept.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("deleting down to one squad keeps its other errors", async () => {
      const user = userEvent.setup();
      const squads = cleanSquads();
      squads[0].squad_time_err = "Time is required";
      squads[0].games_err = "Games error";
      squads[0].errClassName = objErrClassName;
      const { setSquads, setAcdnErr } = renderSquads({ squads });

      await deleteAndConfirm(user, squads[1].id);

      const [kept] = lastArg<squadType[]>(setSquads);
      expect(kept.squad_time_err).toBe("");
      expect(kept.games_err).toBe("Games error");
      expect(kept.errClassName).toBe(objErrClassName);
      expect(lastArg(setAcdnErr)).toEqual(
        acdnErr(squads[0].squad_name, "Games error"),
      );
    });

    it("after a delete, makes the first tab active", async () => {
      const user = userEvent.setup();
      render(
        <StatefulSquads
          initialSquads={cleanSquadsPlusThird()}
          initialLanes={lanesPlusThird()}
        />,
      );

      await user.click(screen.getByRole("tab", { name: "Trios" }));
      await deleteAndConfirm(user, thirdSquadId);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("does not delete when the user clicks No", async () => {
      const user = userEvent.setup();
      const { setSquads, setLanes, setAcdnErr, markPendingChanges } =
        renderSquads({ squads: cleanSquadsPlusThird(), lanes: lanesPlusThird() });

      await user.click(deleteBtn(thirdSquadId));
      const dialog = await screen.findByRole("dialog");
      await user.click(within(dialog).getByRole("button", { name: /no/i }));

      expect(setSquads).not.toHaveBeenCalled();
      expect(setLanes).not.toHaveBeenCalled();
      expect(setAcdnErr).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  });

  describe("editing fields", () => {
    it("updating the name sets the tab title and clears the name error and accordion error", () => {
      const squads = cleanSquads();
      squads[1].squad_name_err = "Squad Name is required";
      squads[1].errClassName = objErrClassName;
      const { setSquads, setAcdnErr, markPendingChanges } = renderSquads({
        squads,
      });

      fireEvent.change(nameInputs()[1], { target: { value: "New Name" } });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastSquad(setSquads, squads[1].id);
      expect(updated.squad_name).toBe("New Name");
      expect(updated.tab_title).toBe("New Name");
      expect(updated.squad_name_err).toBe("");
      expect(updated.errClassName).toBe("");
      expect(lastArg(setAcdnErr)).toEqual(noAcdnErr);
    });

    it("only changes the edited squad", () => {
      const squads = cleanSquads();
      const { setSquads } = renderSquads({ squads });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      expect(lastArg<squadType[]>(setSquads)[0]).toBe(squads[0]);
    });

    it("keeps other errors on the edited squad and leaves it marked as an error", () => {
      const squads = cleanSquads();
      squads[1].games_err = "Games error";
      squads[1].errClassName = objErrClassName;
      const { setSquads, setAcdnErr } = renderSquads({ squads });

      fireEvent.change(nameInputs()[1], { target: { value: "Changed" } });

      const updated = lastSquad(setSquads, squads[1].id);
      expect(updated.games_err).toBe("Games error");
      expect(updated.errClassName).toBe(objErrClassName);
      expect(lastArg(setAcdnErr)).toEqual(acdnErr("Changed", "Games error"));
    });

    it("sets the accordion error to another squad's error when the edited one is fixed", () => {
      const squads = cleanSquads();
      squads[0].lane_count_err = "Lane count error";
      squads[1].squad_name_err = "Squad Name is required";
      const { setAcdnErr } = renderSquads({ squads });

      fireEvent.change(nameInputs()[1], { target: { value: "Fixed" } });

      expect(lastArg(setAcdnErr)).toEqual(
        acdnErr(squads[0].squad_name, "Lane count error"),
      );
    });

    it("updating games stores a number and clears its error", () => {
      const squads = cleanSquads();
      squads[0].games_err = "Games error";
      const { setSquads } = renderSquads({ squads });

      fireEvent.change(gamesInputs()[0], { target: { value: "6" } });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.games).toBe(6);
      expect(updated.games_err).toBe("");
    });

    it("choosing an event sets event_id and clears its error", () => {
      const squads = cleanSquads();
      squads[0].event_id = mockEvents[0].id;
      squads[0].event_id_err = "Event not found";
      const { setSquads, markPendingChanges } = renderSquads({ squads });

      fireEvent.change(eventSelects()[0], {
        target: { value: mockEvents[1].id },
      });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.event_id).toBe(mockEvents[1].id);
      expect(updated.event_id_err).toBe("");
    });

    it("updating the date sets squad_date_str and clears its error", () => {
      const squads = cleanSquads();
      squads[0].squad_date_err = "Date is required";
      const { setSquads } = renderSquads({ squads });

      fireEvent.change(dateInputs()[0], { target: { value: "2025-01-15" } });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.squad_date_str).toBe("2025-01-15");
      expect(updated.squad_date_err).toBe("");
    });

    it("an incomplete date leaves the squad's date and date error as they were", () => {
      const squads = cleanSquads();
      squads[0].squad_date_err = "Date is required";
      const { setSquads } = renderSquads({ squads });

      // a date input reports "" until the date is complete
      fireEvent.change(dateInputs()[0], { target: { value: "" } });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.squad_date_str).toBe(squads[0].squad_date_str);
      expect(updated.squad_date_err).toBe("Date is required");
    });

    it("updating the start time sets squad_time and clears its error", () => {
      const squads = cleanSquads();
      squads[0].squad_time_err = "Time is required";
      const { setSquads } = renderSquads({ squads });

      fireEvent.change(timeInputs()[0], { target: { value: "09:30" } });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.squad_time).toBe("09:30");
      expect(updated.squad_time_err).toBe("");
    });
  });

  describe("starting lane and # of lanes update the squad's lanes", () => {
    /** squad 1 on 4 lanes starting at 1 */
    const setup = () => {
      const squads = cleanSquads();
      squads[0] = { ...squads[0], starting_lane: 1, lane_count: 4 };
      const lanes = cloneDeep(mockLanes);
      return { squads, lanes, ...renderSquads({ squads, lanes }) };
    };
    const otherLanes = (lanes: laneType[], squadId: string) =>
      lanes.filter((l) => l.squad_id !== squadId);

    it("a valid starting lane rebuilds the squad's lanes from that lane", () => {
      const { squads, lanes, setSquads, setLanes } = setup();

      fireEvent.change(startLaneInputs()[0], { target: { value: "15" } });

      expect(lastSquad(setSquads, squads[0].id).starting_lane).toBe(15);
      const updated = lastArg<laneType[]>(setLanes);
      expect(laneNumbers(updated, squads[0].id)).toEqual(range(15, 4));
      expect(otherLanes(updated, squads[0].id)).toEqual(
        otherLanes(lanes, squads[0].id),
      );
    });

    it("a valid # of lanes rebuilds the squad's lanes with that many lanes", () => {
      const { squads, lanes, setLanes } = setup();

      fireEvent.change(laneCountInputs()[0], { target: { value: "16" } });

      const updated = lastArg<laneType[]>(setLanes);
      expect(laneNumbers(updated, squads[0].id)).toEqual(range(1, 16));
      expect(otherLanes(updated, squads[0].id)).toEqual(
        otherLanes(lanes, squads[0].id),
      );
    });

    it.each([
      ["an even starting lane", startLaneInputs, "2"],
      ["a starting lane over the maximum", startLaneInputs, String(maxStartLane + 2)],
      ["an odd # of lanes", laneCountInputs, "11"],
      ["a # of lanes over the maximum", laneCountInputs, String(maxLaneCount + 2)],
    ])(
      "%s removes the squad's lanes and keeps every other lane",
      (_label, getInputs, value) => {
        const { squads, lanes, setLanes } = setup();

        fireEvent.change(getInputs()[0], { target: { value } });

        const updated = lastArg<laneType[]>(setLanes);
        expect(laneNumbers(updated, squads[0].id)).toEqual([]);
        expect(updated).toEqual(otherLanes(lanes, squads[0].id));
      },
    );
  });

  describe("handleBlur", () => {
    it("an empty name resets to 'Squad <sort_order>' and clears the name error", () => {
      const squads = cleanSquads();
      squads[1].squad_name_err = "Squad Name is required";
      const { setSquads, markPendingChanges } = renderSquads({ squads });

      fireEvent.blur(nameInputs()[1], { target: { name: "name", value: "" } });

      expect(markPendingChanges).toHaveBeenCalledWith(true);
      const updated = lastSquad(setSquads, squads[1].id);
      expect(updated.squad_name).toBe(`Squad ${squads[1].sort_order}`);
      expect(updated.tab_title).toBe(`Squad ${squads[1].sort_order}`);
      expect(updated.squad_name_err).toBe("");
    });

    it("empty games resets to 3 and clears its error", () => {
      const squads = cleanSquads();
      squads[0].games_err = "Games error";
      const { setSquads } = renderSquads({ squads });

      fireEvent.blur(gamesInputs()[0], { target: { name: "games", value: "" } });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.games).toBe(3);
      expect(updated.games_err).toBe("");
    });

    it("an empty starting lane resets to 1 and rebuilds the squad's lanes", () => {
      const squads = cleanSquads();
      squads[0] = { ...squads[0], starting_lane: 7, lane_count: 4 };
      const { setSquads, setLanes } = renderSquads({ squads });

      fireEvent.blur(startLaneInputs()[0], {
        target: { name: "starting_lane", value: "" },
      });

      expect(lastSquad(setSquads, squads[0].id).starting_lane).toBe(1);
      // before the fix the lanes stayed cleared
      expect(laneNumbers(lastArg(setLanes), squads[0].id)).toEqual(range(1, 4));
    });

    it("an empty # of lanes resets to 2 and rebuilds the squad's lanes", () => {
      const squads = cleanSquads();
      squads[0] = { ...squads[0], starting_lane: 5, lane_count: 8 };
      const { setSquads, setLanes } = renderSquads({ squads });

      fireEvent.blur(laneCountInputs()[0], {
        target: { name: "lane_count", value: "" },
      });

      expect(lastSquad(setSquads, squads[0].id).lane_count).toBe(2);
      expect(laneNumbers(lastArg(setLanes), squads[0].id)).toEqual([5, 6]);
    });

    it("does not rebuild lanes when the other lane field is still invalid", () => {
      const squads = cleanSquads();
      squads[0] = { ...squads[0], starting_lane: 7, lane_count: 3 }; // odd count
      const { setLanes } = renderSquads({ squads });

      fireEvent.blur(startLaneInputs()[0], {
        target: { name: "starting_lane", value: "" },
      });

      expect(setLanes).not.toHaveBeenCalled();
    });

    it("an empty date resets to today and clears its error", () => {
      const squads = cleanSquads();
      squads[0].squad_date_err = "Date is required";
      const { setSquads } = renderSquads({ squads });

      fireEvent.blur(dateInputs()[0], {
        target: { name: "squad_date_str", value: "" },
      });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.squad_date_str).toBe(todayStr);
      expect(updated.squad_date_err).toBe("");
    });

    it("an empty start time is stored as '' and clears its error", () => {
      const squads = cleanSquads();
      squads[0].squad_time_err = "Time is required";
      const { setSquads } = renderSquads({ squads });

      fireEvent.blur(timeInputs()[0], {
        target: { name: "squad_time", value: "" },
      });

      const updated = lastSquad(setSquads, squads[0].id);
      expect(updated.squad_time).toBe("");
      expect(updated.squad_time_err).toBe("");
    });

    it("a non-empty value does nothing", () => {
      const { setSquads, setLanes, markPendingChanges } = renderSquads();

      fireEvent.blur(nameInputs()[0], {
        target: { name: "name", value: "Still Here" },
      });
      fireEvent.blur(startLaneInputs()[0], {
        target: { name: "starting_lane", value: "3" },
      });

      expect(setSquads).not.toHaveBeenCalled();
      expect(setLanes).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
    });
  });

  describe("isDisabled = true", () => {
    it("disables Add and Delete, and clicking them does nothing", async () => {
      const user = userEvent.setup();
      const squads = cleanSquads();
      const { setSquads, setLanes, markPendingChanges } = renderSquads({
        squads,
        isDisabled: true,
      });

      const addBtn = screen.getByRole("button", { name: /add/i });
      const delBtn = deleteBtn(squads[1].id);
      expect(addBtn).toBeDisabled();
      expect(delBtn).toBeDisabled();

      await user.click(addBtn);
      await user.click(delBtn);

      expect(setSquads).not.toHaveBeenCalled();
      expect(setLanes).not.toHaveBeenCalled();
      expect(markPendingChanges).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it.each([
      ["Squad Name", nameInputs, "New Name"],
      ["Squad Games", gamesInputs, "5"],
      ["Starting Lane", startLaneInputs, "9"],
      ["# of Lanes", laneCountInputs, "6"],
      ["Start Time", timeInputs, "10:00"],
    ] as const)(
      "disables every %s input, and typing does nothing",
      async (_label, getInputs, text) => {
        const user = userEvent.setup();
        const { setSquads, setLanes, markPendingChanges } = renderSquads({
          isDisabled: true,
        });

        for (const input of getInputs()) {
          expect(input).toBeDisabled();
          await user.type(input, text);
        }

        expect(setSquads).not.toHaveBeenCalled();
        expect(setLanes).not.toHaveBeenCalled();
        expect(markPendingChanges).not.toHaveBeenCalled();
      },
    );

    it("disables every Event select and Date input", () => {
      renderSquads({ isDisabled: true });

      [...eventSelects(), ...dateInputs()].forEach((el) =>
        expect(el).toBeDisabled(),
      );
    });
  });

  describe("without the optional markPendingChanges prop", () => {
    it("adds a squad without crashing", async () => {
      const user = userEvent.setup();
      const { setSquads, setLanes } = renderSquads({
        markPendingChanges: undefined,
      });

      await user.click(screen.getByRole("button", { name: /add/i }));

      expect(setSquads).toHaveBeenCalled();
      expect(setLanes).toHaveBeenCalled();
    });

    it("edits the name, event and starting lane without crashing", () => {
      const { setSquads, setLanes } = renderSquads({
        markPendingChanges: undefined,
      });

      fireEvent.change(nameInputs()[0], { target: { value: "Updated" } });
      fireEvent.change(eventSelects()[0], {
        target: { value: mockEvents[1].id },
      });
      fireEvent.change(startLaneInputs()[0], { target: { value: "15" } });

      expect(setSquads).toHaveBeenCalledTimes(3);
      expect(setLanes).toHaveBeenCalled();
    });

    it("deletes a squad without crashing", async () => {
      const user = userEvent.setup();
      const { setSquads, setLanes } = renderSquads({
        squads: cleanSquadsPlusThird(),
        lanes: lanesPlusThird(),
        markPendingChanges: undefined,
      });

      await deleteAndConfirm(user, thirdSquadId);

      expect(setSquads).toHaveBeenCalled();
      expect(setLanes).toHaveBeenCalled();
    });
  });

  describe("updatedLanes", () => {
    const squad: squadType = {
      ...initSquad,
      id: "sqd_A",
      starting_lane: 5,
      lane_count: 4,
    };
    const other: laneType = {
      id: "lan_other",
      lane_number: 1,
      squad_id: "sqd_B",
      in_use: true,
    };
    const old: laneType = {
      id: "lan_old",
      lane_number: 9,
      squad_id: "sqd_A",
      in_use: false,
    };

    it("keeps other squads' lanes and replaces this squad's lanes", () => {
      const result = updatedLanes([other, old], squad);

      expect(result[0]).toBe(other);
      expect(result.some((l) => l.id === "lan_old")).toBe(false);
      expect(laneNumbers(result, "sqd_A")).toEqual([5, 6, 7, 8]);
    });

    it("makes every new lane in use, with a new lane id", () => {
      const result = updatedLanes([], squad);

      result.forEach((lane) => {
        expect(lane.in_use).toBe(true);
        expect(lane.id).toMatch(/^lan_/);
      });
      expect(new Set(result.map((l) => l.id)).size).toBe(result.length);
    });

    it("returns [] for a squad with no id", () => {
      expect(updatedLanes([other], { ...squad, id: "" })).toEqual([]);
    });
  });

  describe("validLanes", () => {
    const base: squadType = {
      ...initSquad,
      starting_lane: minStartLane,
      lane_count: minLaneCount,
    };

    it("accepts the minimum and maximum starting lane and # of lanes", () => {
      expect(validLanes(base)).toBe(true);
      expect(
        validLanes({ ...base, starting_lane: maxStartLane, lane_count: maxLaneCount }),
      ).toBe(true);
    });

    it.each([
      ["starting lane below the minimum", { starting_lane: minStartLane - 2 }],
      ["starting lane above the maximum", { starting_lane: maxStartLane + 2 }],
      ["even starting lane", { starting_lane: minStartLane + 1 }],
      ["# of lanes below the minimum", { lane_count: minLaneCount - 2 }],
      ["# of lanes above the maximum", { lane_count: maxLaneCount + 2 }],
      ["odd # of lanes", { lane_count: minLaneCount + 1 }],
    ])("rejects a %s", (_label, change) => {
      expect(validLanes({ ...base, ...change })).toBe(false);
    });
  });
});
