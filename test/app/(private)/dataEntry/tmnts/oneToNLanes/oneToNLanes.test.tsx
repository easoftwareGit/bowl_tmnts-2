// test/app/(private)/dataEntry/tmnts/oneToNLanes/oneToNLanes.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNLanes.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneDeep } from "lodash";
import OneToNLanes from "@/app/(private)/dataEntry/tmntForm/oneToNLanes";
import LanesList, { pairsOfLanes } from "@/components/tmnts/lanesList";
import {
  mockLanes,
  mockSquads,
} from "../../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import type { laneType, squadType } from "@/lib/types/types";

// wrap the real LanesList in a jest.fn, so tests can see the props it gets
// and still render the real table
jest.mock("@/components/tmnts/lanesList", () => {
  const actual = jest.requireActual("@/components/tmnts/lanesList");
  return {
    __esModule: true,
    ...actual,
    default: jest.fn((props) =>
      jest.requireActual("react").createElement(actual.default, props),
    ),
  };
});

const mockLanesList = LanesList as unknown as jest.Mock;

type Props = React.ComponentProps<typeof OneToNLanes>;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const squad1 = mockSquads[0];
const squad2 = mockSquads[1];

const lanesFor = (squadId: string, lanes: laneType[] = mockLanes) =>
  cloneDeep(lanes.filter((lane) => lane.squad_id === squadId));

/** renders OneToNLanes with fresh copies of the mocks; any prop can be overridden */
const renderLanes = (overrides: Partial<Props> = {}) => {
  const setLanes = jest.fn();
  const markPendingChanges = jest.fn();
  const props: Props = {
    lanes: cloneDeep(mockLanes),
    setLanes,
    squads: cloneDeep(mockSquads),
    isDisabled: false,
    markPendingChanges,
    ...overrides,
  };
  const utils = render(<OneToNLanes {...props} />);
  return { ...utils, props, setLanes, markPendingChanges };
};

/** just squad 1 and its lanes */
const oneSquadProps = (): Partial<Props> => ({
  squads: [cloneDeep(squad1)],
  lanes: lanesFor(squad1.id),
});

/** the props LanesList got for one squad, from its last render */
const lanesListPropsFor = (squadId: string) => {
  const calls = mockLanesList.mock.calls.filter(
    ([props]) => props.squadId === squadId,
  );
  return calls[calls.length - 1][0];
};

const checkboxes = () => screen.getAllByRole("checkbox") as HTMLInputElement[];

// ---------------------------------------------------------------------------

describe("OneToNLanes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("tabs", () => {
    it("renders one tab per squad, titled with tab_title", () => {
      renderLanes();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(mockSquads.length);
      tabs.forEach((tab, i) =>
        expect(tab).toHaveTextContent(mockSquads[i].tab_title),
      );
    });

    it("makes the first squad's tab active", () => {
      renderLanes();

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });

    it("selecting the 2nd tab makes it active", async () => {
      const user = userEvent.setup();
      renderLanes();

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("uses 'lane' + the squad id as each tab's key", () => {
      renderLanes();

      // react-bootstrap builds each tab's id from the Tabs id and the eventKey
      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("id", `lanes-tabs-tab-lane${squad1.id}`);
      expect(tabs[1]).toHaveAttribute("id", `lanes-tabs-tab-lane${squad2.id}`);
    });

    it("renders an empty tab list, without crashing, when there are no squads", () => {
      renderLanes({ squads: [], lanes: [] });

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.queryAllByRole("tab")).toHaveLength(0);
      expect(mockLanesList).not.toHaveBeenCalled();
    });
  });

  describe("what it passes to LanesList", () => {
    it("renders one LanesList per squad, each with its own squad id", () => {
      renderLanes();

      const squadIds = new Set(
        mockLanesList.mock.calls.map(([props]) => props.squadId),
      );
      expect(squadIds).toEqual(new Set([squad1.id, squad2.id]));
    });

    it("passes every lane, setLanes, isDisabled and markPendingChanges through unchanged", () => {
      const { props } = renderLanes({ isDisabled: true });

      [squad1.id, squad2.id].forEach((squadId) => {
        const listProps = lanesListPropsFor(squadId);
        expect(listProps.lanes).toBe(props.lanes);
        expect(listProps.setLanes).toBe(props.setLanes);
        expect(listProps.isDisabled).toBe(true);
        expect(listProps.markPendingChanges).toBe(props.markPendingChanges);
      });
    });

    it("passes markPendingChanges as undefined when it is omitted", () => {
      renderLanes({ markPendingChanges: undefined });

      expect(lanesListPropsFor(squad1.id).markPendingChanges).toBeUndefined();
    });
  });

  // these run the real LanesList, to check the two work together
  describe("with the real LanesList", () => {
    it("renders one table per squad, each with Lanes and In Use headers", () => {
      renderLanes();

      const tables = screen.getAllByRole("table");
      expect(tables).toHaveLength(mockSquads.length);
      tables.forEach((table) => {
        expect(
          within(table).getByRole("columnheader", { name: /lanes/i }),
        ).toBeInTheDocument();
        expect(
          within(table).getByRole("columnheader", { name: /in use/i }),
        ).toBeInTheDocument();
      });
    });

    it("shows each squad's own lane pairs in its table", () => {
      const lanes = cloneDeep(mockLanes);
      renderLanes({ lanes });

      const tables = screen.getAllByRole("table");
      [squad1, squad2].forEach((squad, t) => {
        const pairs = pairsOfLanes(squad.id, lanes);
        const rows = within(tables[t]).getAllByRole("row").slice(1); // skip header
        expect(rows).toHaveLength(pairs.length);

        rows.forEach((row, i) =>
          expect(row).toHaveTextContent(
            `${pairs[i].left_lane} - ${pairs[i].right_lane}`,
          ),
        );
        // every row's checkbox matches its pair's in_use
        const checkedStates = rows.map(
          (row) => (within(row).getByRole("checkbox") as HTMLInputElement).checked,
        );
        expect(checkedStates).toEqual(pairs.map((p) => p.in_use));
      });
    });

    it("disables every In Use checkbox when isDisabled is true", () => {
      renderLanes({ isDisabled: true });
      checkboxes().forEach((box) => expect(box).toBeDisabled());
    });

    it("does not call setLanes when a disabled checkbox is clicked", async () => {
      const user = userEvent.setup();
      const { setLanes } = renderLanes({ ...oneSquadProps(), isDisabled: true });

      await user.click(checkboxes()[0]);

      expect(setLanes).not.toHaveBeenCalled();
    });

    it("calls setLanes when an In Use checkbox is clicked", async () => {
      const user = userEvent.setup();
      const { setLanes } = renderLanes(oneSquadProps());

      expect(checkboxes()[0]).toBeChecked();
      await user.click(checkboxes()[0]);

      expect(setLanes).toHaveBeenCalledTimes(1);
    });

    it("unchecking a middle pair adds a pair at the end; checking it again removes that pair", async () => {
      const user = userEvent.setup();
      const props = oneSquadProps();
      const squadId = (props.squads as squadType[])[0].id;
      const startLanes = props.lanes as laneType[];
      const { setLanes, rerender } = renderLanes(props);

      const startPairs = pairsOfLanes(squadId, startLanes);
      const inUseCount = startPairs.filter((p) => p.in_use).length;
      const middle = startPairs[2]; // the 3rd pair, e.g. "5 - 6"
      const last = startPairs[startPairs.length - 1];

      // uncheck the middle pair
      await user.click(checkboxes()[2]);

      expect(setLanes).toHaveBeenCalledTimes(1);
      const afterUncheck: laneType[] = setLanes.mock.calls[0][0];
      const pairsAfterUncheck = pairsOfLanes(squadId, afterUncheck);
      const inUseAfterUncheck = pairsAfterUncheck.filter((p) => p.in_use);

      // the same number of pairs are in use
      expect(inUseAfterUncheck).toHaveLength(inUseCount);
      // the middle pair is no longer in use
      expect(
        inUseAfterUncheck.some((p) => p.left_lane === middle.left_lane),
      ).toBe(false);
      // a new pair, just after the old last pair, is now in use
      const newLast = pairsAfterUncheck[pairsAfterUncheck.length - 1];
      expect(newLast.in_use).toBe(true);
      expect(newLast.left_lane).toBe(last.right_lane + 1);
      expect(newLast.right_lane).toBe(last.right_lane + 2);

      // show the new lanes, then check the middle pair again
      setLanes.mockClear();
      rerender(
        <OneToNLanes
          lanes={afterUncheck}
          setLanes={setLanes}
          squads={props.squads as squadType[]}
          isDisabled={false}
        />,
      );
      await user.click(checkboxes()[2]);

      expect(setLanes).toHaveBeenCalledTimes(1);
      const afterRecheck: laneType[] = setLanes.mock.calls[0][0];
      const pairsAfterRecheck = pairsOfLanes(squadId, afterRecheck);
      const inUseAfterRecheck = pairsAfterRecheck.filter((p) => p.in_use);

      expect(inUseAfterRecheck).toHaveLength(inUseCount);
      expect(
        inUseAfterRecheck.some((p) => p.left_lane === middle.left_lane),
      ).toBe(true);
      // the extra pair at the end is gone
      expect(
        pairsAfterRecheck.some((p) => p.left_lane === newLast.left_lane),
      ).toBe(false);
    });

    it("toggles a checkbox without crashing when markPendingChanges is omitted", async () => {
      const user = userEvent.setup();
      const { setLanes } = renderLanes({
        ...oneSquadProps(),
        markPendingChanges: undefined,
      });

      await user.click(checkboxes()[0]);

      expect(setLanes).toHaveBeenCalledTimes(1);
    });
  });
});

