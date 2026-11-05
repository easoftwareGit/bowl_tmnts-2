// test/app/components/tmnts/lanesList.test.tsx
// tests for src/components/tmnts/lanesList.tsx
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import LanesList, {
  getLanesFromPairs,
  lanesNotThisSquad,
  lanesThisSquad,
  pairsOfLanes,
} from "@/components/tmnts/lanesList";
import {
  laneId1,
  laneId2,
  laneId3,
  laneId4,
  mockTmntFullData,
  squadId1,
  squadId2,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { laneType, pairsOfLanesType } from "@/lib/types/types";
import { cloneDeep } from "lodash";

/**
 * Returns the item at an index, or throws if there is none.
 * Keeps tests free of "possibly undefined" errors.
 *
 * @param {T[]} items - array to read from
 * @param {number} index - index of the item
 * @returns {T} the item at the index
 */
const getAt = <T,>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`No item at index ${index}`);
  }
  return item;
};

/**
 * Keeps only the laneType fields that getLanesFromPairs sets,
 * so lanes can be compared even if the mock lanes have extra fields.
 *
 * @param {laneType[]} lanes - lanes to compare
 * @returns {laneType[]} lanes with id, lane_number, squad_id and in_use
 */
const laneFields = (lanes: laneType[]): laneType[] =>
  lanes.map(({ id, lane_number, squad_id, in_use }) => ({
    id,
    lane_number,
    squad_id,
    in_use,
  }));

/** squad 1 lanes from the mock tournament: 29, 30, 31, 32 */
const squad1Lanes: laneType[] = mockTmntFullData.lanes;
const squad1Pairs: pairsOfLanesType[] = [
  {
    left_id: laneId1,
    left_lane: 29,
    right_id: laneId2,
    right_lane: 30,
    in_use: true,
  },
  {
    left_id: laneId3,
    left_lane: 31,
    right_id: laneId4,
    right_lane: 32,
    in_use: true,
  },
];

/** lanes 1 to 4 for squad 2, which the mock tournament does not have */
const squad2Lanes: laneType[] = [1, 2, 3, 4].map((laneNum) => ({
  ...getAt(squad1Lanes, 0),
  id: `lan_0456${String(laneNum).padStart(28, "0")}`,
  lane_number: laneNum,
  squad_id: squadId2,
  in_use: true,
}));

/** squad 1 lanes first, then squad 2 lanes */
const lanes2Squads: laneType[] = [...squad1Lanes, ...squad2Lanes];

const notFoundSquadId = "sqd_01234567890123456789012345678901";

describe("LanesList", () => {
  it("mock data has 4 lanes, all in use, for squad 1", () => {
    // guards the tests below against changes to the mock data
    expect(squad1Lanes).toHaveLength(4);
    expect(squad1Lanes.map((lane) => lane.lane_number)).toEqual([
      29, 30, 31, 32,
    ]);
    squad1Lanes.forEach((lane) => {
      expect(lane.squad_id).toBe(squadId1);
      expect(lane.in_use).toBe(true);
    });
  });

  describe("lanesThisSquad()", () => {
    it("returns the lanes for squad 1 in order", () => {
      const result = lanesThisSquad(squadId1, lanes2Squads);
      expect(result).toEqual(squad1Lanes);
    });
    it("returns the lanes for squad 2 in order", () => {
      const result = lanesThisSquad(squadId2, lanes2Squads);
      expect(result).toEqual(squad2Lanes);
    });
    it("returns an empty array when no lanes match the squad id", () => {
      expect(lanesThisSquad(notFoundSquadId, lanes2Squads)).toEqual([]);
    });
    it("returns an empty array when lanes is empty", () => {
      expect(lanesThisSquad(squadId1, [])).toEqual([]);
    });
    it("returns an empty array when lanes is null or undefined", () => {
      expect(lanesThisSquad(squadId1, null as unknown as laneType[])).toEqual(
        [],
      );
      expect(
        lanesThisSquad(squadId1, undefined as unknown as laneType[]),
      ).toEqual([]);
    });
    it("returns an empty array when the squad id is empty or null", () => {
      expect(lanesThisSquad("", lanes2Squads)).toEqual([]);
      expect(lanesThisSquad(null as unknown as string, lanes2Squads)).toEqual(
        [],
      );
    });
  });

  describe("lanesNotThisSquad()", () => {
    it("returns the lanes for other squads when given squad 1", () => {
      const result = lanesNotThisSquad(squadId1, lanes2Squads);
      expect(result).toEqual(squad2Lanes);
    });
    it("returns the lanes for other squads when given squad 2", () => {
      const result = lanesNotThisSquad(squadId2, lanes2Squads);
      expect(result).toEqual(squad1Lanes);
    });
    it("returns all lanes in order when no lanes match the squad id", () => {
      const result = lanesNotThisSquad(notFoundSquadId, lanes2Squads);
      expect(result).toEqual(lanes2Squads);
    });
    it("returns an empty array when lanes is empty", () => {
      expect(lanesNotThisSquad(squadId1, [])).toEqual([]);
    });
    it("returns an empty array when lanes is null or undefined", () => {
      expect(
        lanesNotThisSquad(squadId1, null as unknown as laneType[]),
      ).toEqual([]);
      expect(
        lanesNotThisSquad(squadId1, undefined as unknown as laneType[]),
      ).toEqual([]);
    });
    it("returns an empty array when the squad id is empty", () => {
      expect(lanesNotThisSquad("", lanes2Squads)).toEqual([]);
    });
  });

  describe("pairsOfLanes()", () => {
    it("returns the pairs of lanes for squad 1", () => {
      expect(pairsOfLanes(squadId1, squad1Lanes)).toEqual(squad1Pairs);
    });
    it("returns only squad 1 pairs when lanes has 2 squads", () => {
      expect(pairsOfLanes(squadId1, lanes2Squads)).toEqual(squad1Pairs);
    });
    it("returns only squad 2 pairs when lanes has 2 squads", () => {
      const lane1 = getAt(squad2Lanes, 0);
      const lane2 = getAt(squad2Lanes, 1);
      const lane3 = getAt(squad2Lanes, 2);
      const lane4 = getAt(squad2Lanes, 3);
      expect(pairsOfLanes(squadId2, lanes2Squads)).toEqual([
        {
          left_id: lane1.id,
          left_lane: 1,
          right_id: lane2.id,
          right_lane: 2,
          in_use: true,
        },
        {
          left_id: lane3.id,
          left_lane: 3,
          right_id: lane4.id,
          right_lane: 4,
          in_use: true,
        },
      ]);
    });
    it("uses the left lane in_use for the pair", () => {
      const lanes = cloneDeep(squad1Lanes);
      getAt(lanes, 2).in_use = false;
      const pairs = pairsOfLanes(squadId1, lanes);
      expect(getAt(pairs, 0).in_use).toBe(true);
      expect(getAt(pairs, 1).in_use).toBe(false);
    });
    it("returns an empty array when the number of lanes is odd", () => {
      const oddLanes: laneType[] = [
        ...squad1Lanes,
        {
          ...getAt(squad1Lanes, 0),
          id: "lan_01239d9e6b6e4c5b9f6b7d9e7f9b6c5e",
          lane_number: 33,
        },
      ];
      expect(pairsOfLanes(squadId1, oddLanes)).toEqual([]);
    });
    it("returns the pairs when another squad has an odd number of lanes", () => {
      // squad 1: 4 lanes, squad 2: 3 lanes, 7 lanes in all
      const lanes = [...squad1Lanes, ...squad2Lanes.slice(0, 3)];
      expect(lanes).toHaveLength(7);
      expect(pairsOfLanes(squadId1, lanes)).toEqual(squad1Pairs);
    });
    it("returns an empty array when the squad has an odd number of lanes but all lanes are even", () => {
      // squad 1: 4 lanes, squad 2: 3 lanes, plus 1 lane for a 3rd squad, 8 lanes in all
      const lanes: laneType[] = [
        ...squad1Lanes,
        ...squad2Lanes.slice(0, 3),
        {
          ...getAt(squad1Lanes, 0),
          id: "lan_07890000000000000000000000000001",
          lane_number: 40,
          squad_id: notFoundSquadId,
        },
      ];
      expect(lanes).toHaveLength(8);
      expect(pairsOfLanes(squadId2, lanes)).toEqual([]);
    });
    it("returns an empty array when no lanes match the squad id", () => {
      expect(pairsOfLanes(notFoundSquadId, lanes2Squads)).toEqual([]);
    });
    it("returns an empty array when lanes is empty", () => {
      expect(pairsOfLanes(squadId1, [])).toEqual([]);
    });
    it("returns an empty array when lanes is null", () => {
      expect(pairsOfLanes(squadId1, null as unknown as laneType[])).toEqual(
        [],
      );
    });
    it("returns an empty array when the squad id is empty or null", () => {
      expect(pairsOfLanes("", squad1Lanes)).toEqual([]);
      expect(pairsOfLanes(null as unknown as string, squad1Lanes)).toEqual([]);
    });
    it("does not change the lanes passed in", () => {
      const original = cloneDeep(lanes2Squads);
      pairsOfLanes(squadId1, lanes2Squads);
      expect(lanes2Squads).toEqual(original);
    });
  });

  describe("getLanesFromPairs()", () => {
    it("returns 2 lanes per pair, in order, with the squad id", () => {
      const result = getLanesFromPairs(squad1Pairs, squadId1);
      expect(result).toEqual(laneFields(squad1Lanes));
    });
    it("uses the squad id passed in for every lane", () => {
      const result = getLanesFromPairs(squad1Pairs, squadId2);
      expect(result).toHaveLength(4);
      result.forEach((lane) => expect(lane.squad_id).toBe(squadId2));
    });
    it("is the reverse of pairsOfLanes()", () => {
      const pairs = pairsOfLanes(squadId1, squad1Lanes);
      expect(getLanesFromPairs(pairs, squadId1)).toEqual(
        laneFields(squad1Lanes),
      );
    });
    it("keeps lanes that are not in use, with in_use false", () => {
      const pairs = cloneDeep(squad1Pairs);
      getAt(pairs, 1).in_use = false;
      const result = getLanesFromPairs(pairs, squadId1);
      expect(result.map((lane) => lane.in_use)).toEqual([
        true,
        true,
        false,
        false,
      ]);
    });
    it("skips pairs with a missing left_id or right_id", () => {
      const leftMissing = cloneDeep(squad1Pairs);
      getAt(leftMissing, 0).left_id = "";
      expect(getLanesFromPairs(leftMissing, squadId1)).toEqual(
        laneFields(squad1Lanes.slice(2)),
      );

      const rightMissing = cloneDeep(squad1Pairs);
      getAt(rightMissing, 1).right_id = "";
      expect(getLanesFromPairs(rightMissing, squadId1)).toEqual(
        laneFields(squad1Lanes.slice(0, 2)),
      );
    });
    it("skips pairs with a missing left_lane or right_lane", () => {
      const pairs = cloneDeep(squad1Pairs);
      getAt(pairs, 0).left_lane = undefined as unknown as number;
      getAt(pairs, 1).right_lane = undefined as unknown as number;
      expect(getLanesFromPairs(pairs, squadId1)).toEqual([]);
    });
    it("returns an empty array when pairs is empty", () => {
      expect(getLanesFromPairs([], squadId1)).toEqual([]);
    });
    it("returns an empty array when pairs is null or undefined", () => {
      expect(
        getLanesFromPairs(null as unknown as pairsOfLanesType[], squadId1),
      ).toEqual([]);
      expect(
        getLanesFromPairs(undefined as unknown as pairsOfLanesType[], squadId1),
      ).toEqual([]);
    });
    it("does not change the pairs passed in", () => {
      const original = cloneDeep(squad1Pairs);
      getLanesFromPairs(squad1Pairs, squadId1);
      expect(squad1Pairs).toEqual(original);
    });
  });

  describe("render the lanes list", () => {
    const mockSetLanes = jest.fn<void, [laneType[]]>();
    const mockMarkPendingChanges = jest.fn<void, [boolean]>();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    /**
     * Renders LanesList for squad 1 with the mock tournament lanes.
     *
     * @param {Partial<React.ComponentProps<typeof LanesList>>} props - props to override
     * @returns {ReturnType<typeof render>} the render result
     */
    const renderLanesList = (
      props: Partial<React.ComponentProps<typeof LanesList>> = {},
    ): ReturnType<typeof render> =>
      render(
        <LanesList
          squadId={squadId1}
          lanes={squad1Lanes}
          setLanes={mockSetLanes}
          isDisabled={false}
          markPendingChanges={mockMarkPendingChanges}
          {...props}
        />,
      );

    /** the checkbox in each row, in row order */
    const getCheckboxes = (): HTMLInputElement[] =>
      screen.getAllByRole<HTMLInputElement>("checkbox");

    /** the "left - right" text in each row, in row order */
    const getRowTexts = (): string[] =>
      screen
        .queryAllByText(/^\d+ - \d+$/)
        .map((cell) => cell.textContent ?? "");

    /** the lanes from the most recent setLanes call */
    const lastSetLanes = (): laneType[] => {
      const { calls } = mockSetLanes.mock;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) {
        throw new Error("setLanes was not called");
      }
      return lastCall[0];
    };

    it('renders the "Lanes" and "In Use" column headers', () => {
      renderLanesList();
      expect(
        screen.getByRole("columnheader", { name: "Lanes" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "In Use" }),
      ).toBeInTheDocument();
    });
    it("renders one row per pair of lanes", () => {
      renderLanesList();
      expect(getRowTexts()).toEqual(["29 - 30", "31 - 32"]);
      expect(getCheckboxes()).toHaveLength(2);
    });
    it("renders only the pairs for the squad", () => {
      renderLanesList({ squadId: squadId2, lanes: lanes2Squads });
      expect(getRowTexts()).toEqual(["1 - 2", "3 - 4"]);
      expect(screen.queryByText("29 - 30")).not.toBeInTheDocument();
    });
    it("renders the squad's pairs when another squad has an odd number of lanes", () => {
      renderLanesList({ lanes: [...squad1Lanes, ...squad2Lanes.slice(0, 3)] });
      expect(getRowTexts()).toEqual(["29 - 30", "31 - 32"]);
    });
    it("renders no rows when there are no lanes", () => {
      renderLanesList({ lanes: [] });
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    });
    it("gives each checkbox an id from the left lane id", () => {
      renderLanesList();
      const checkboxes = getCheckboxes();
      expect(getAt(checkboxes, 0)).toHaveAttribute("id", `inUse${laneId1}`);
      expect(getAt(checkboxes, 1)).toHaveAttribute("id", `inUse${laneId3}`);
    });
    it("checks the checkbox when the pair is in use", () => {
      const lanes = cloneDeep(squad1Lanes);
      getAt(lanes, 2).in_use = false;
      getAt(lanes, 3).in_use = false;
      renderLanesList({ lanes });
      const checkboxes = getCheckboxes();
      expect(getAt(checkboxes, 0)).toBeChecked();
      expect(getAt(checkboxes, 1)).not.toBeChecked();
    });
    it("enables the checkboxes when isDisabled is false", () => {
      renderLanesList();
      getCheckboxes().forEach((checkbox) => expect(checkbox).toBeEnabled());
    });
    it("disables the checkboxes when isDisabled is true", () => {
      renderLanesList({ isDisabled: true });
      getCheckboxes().forEach((checkbox) => expect(checkbox).toBeDisabled());
    });
    it("does not call setLanes or markPendingChanges when rendering", () => {
      renderLanesList();
      expect(mockSetLanes).not.toHaveBeenCalled();
      expect(mockMarkPendingChanges).not.toHaveBeenCalled();
    });
    it("updates the rows when the lanes prop changes", () => {
      const { rerender } = renderLanesList();
      expect(getRowTexts()).toEqual(["29 - 30", "31 - 32"]);
      rerender(
        <LanesList
          squadId={squadId2}
          lanes={lanes2Squads}
          setLanes={mockSetLanes}
          isDisabled={false}
        />,
      );
      expect(getRowTexts()).toEqual(["1 - 2", "3 - 4"]);
    });

    describe("uncheck a pair (handleInputChange)", () => {
      it("calls markPendingChanges with true", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0));
        expect(mockMarkPendingChanges).toHaveBeenCalledTimes(1);
        expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
      });
      it("unchecks the pair and adds a new pair in use after the last pair", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0));

        expect(getRowTexts()).toEqual(["29 - 30", "31 - 32", "33 - 34"]);
        const checkboxes = getCheckboxes();
        expect(getAt(checkboxes, 0)).not.toBeChecked();
        expect(getAt(checkboxes, 1)).toBeChecked();
        expect(getAt(checkboxes, 2)).toBeChecked();
      });
      it("calls setLanes with the unchecked lanes and 2 new lanes", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0));

        expect(mockSetLanes).toHaveBeenCalledTimes(1);
        const lanes = lastSetLanes();
        expect(lanes).toHaveLength(6);
        expect(lanes.slice(0, 4)).toEqual([
          { id: laneId1, lane_number: 29, squad_id: squadId1, in_use: false },
          { id: laneId2, lane_number: 30, squad_id: squadId1, in_use: false },
          { id: laneId3, lane_number: 31, squad_id: squadId1, in_use: true },
          { id: laneId4, lane_number: 32, squad_id: squadId1, in_use: true },
        ]);
        expect(lanes.slice(4)).toEqual([
          {
            id: expect.stringMatching(/^lan_/),
            lane_number: 33,
            squad_id: squadId1,
            in_use: true,
          },
          {
            id: expect.stringMatching(/^lan_/),
            lane_number: 34,
            squad_id: squadId1,
            in_use: true,
          },
        ]);
      });
      it("gives the 2 new lanes new, different ids", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0));

        const ids = lastSetLanes().map((lane) => lane.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
      it("adds the new pair after the last pair when the last pair is unchecked", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 1));

        expect(getRowTexts()).toEqual(["29 - 30", "31 - 32", "33 - 34"]);
        expect(lastSetLanes().map((lane) => lane.in_use)).toEqual([
          true,
          true,
          false,
          false,
          true,
          true,
        ]);
      });
      it("does not change the lanes prop", () => {
        const lanes = cloneDeep(squad1Lanes);
        renderLanesList({ lanes });
        fireEvent.click(getAt(getCheckboxes(), 0));
        expect(lanes).toEqual(squad1Lanes);
      });
      it("works without markPendingChanges", () => {
        renderLanesList({ markPendingChanges: undefined });
        fireEvent.click(getAt(getCheckboxes(), 0));
        expect(mockSetLanes).toHaveBeenCalledTimes(1);
        expect(getRowTexts()).toHaveLength(3);
      });
    });

    describe("check a pair (handleInputChange)", () => {
      it("calls markPendingChanges with true", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0)); // uncheck
        mockMarkPendingChanges.mockClear();

        fireEvent.click(getAt(getCheckboxes(), 0)); // check
        expect(mockMarkPendingChanges).toHaveBeenCalledTimes(1);
        expect(mockMarkPendingChanges).toHaveBeenCalledWith(true);
      });
      it("removes the added pair when the unchecked pair is checked again", () => {
        renderLanesList();
        fireEvent.click(getAt(getCheckboxes(), 0)); // uncheck 29 - 30
        fireEvent.click(getAt(getCheckboxes(), 0)); // check 29 - 30

        expect(getRowTexts()).toEqual(["29 - 30", "31 - 32"]);
        getCheckboxes().forEach((checkbox) => expect(checkbox).toBeChecked());
        expect(mockSetLanes).toHaveBeenCalledTimes(2);
        expect(lastSetLanes()).toEqual(laneFields(squad1Lanes));
      });
      it("also removes pairs at the end that are not in use", () => {
        renderLanesList();
        // uncheck 31 - 32: 29 - 30 on, 31 - 32 off, 33 - 34 on
        fireEvent.click(getAt(getCheckboxes(), 1));
        // uncheck 33 - 34: 29 - 30 on, 31 - 32 off, 33 - 34 off, 35 - 36 on
        fireEvent.click(getAt(getCheckboxes(), 2));
        expect(getRowTexts()).toEqual([
          "29 - 30",
          "31 - 32",
          "33 - 34",
          "35 - 36",
        ]);

        // check 31 - 32: removes 35 - 36, then 33 - 34 (not in use)
        fireEvent.click(getAt(getCheckboxes(), 1));

        expect(getRowTexts()).toEqual(["29 - 30", "31 - 32"]);
        getCheckboxes().forEach((checkbox) => expect(checkbox).toBeChecked());
        expect(lastSetLanes()).toEqual(laneFields(squad1Lanes));
      });
      it("keeps pairs not in use that are not at the end", () => {
        renderLanesList();
        // uncheck 29 - 30: 29 - 30 off, 31 - 32 on, 33 - 34 on
        fireEvent.click(getAt(getCheckboxes(), 0));
        // uncheck 31 - 32: 29 - 30 off, 31 - 32 off, 33 - 34 on, 35 - 36 on
        fireEvent.click(getAt(getCheckboxes(), 1));

        // check 31 - 32: removes only 35 - 36
        fireEvent.click(getAt(getCheckboxes(), 1));

        expect(getRowTexts()).toEqual(["29 - 30", "31 - 32", "33 - 34"]);
        const checkboxes = getCheckboxes();
        expect(getAt(checkboxes, 0)).not.toBeChecked();
        expect(getAt(checkboxes, 1)).toBeChecked();
        expect(getAt(checkboxes, 2)).toBeChecked();
        expect(lastSetLanes().map((lane) => lane.lane_number)).toEqual([
          29, 30, 31, 32, 33, 34,
        ]);
      });
    });
  });
});


// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import LanesList, { getLanesFromPairs, lanesNotThisSquad, lanesThisSquad, pairsOfLanes } from '@/components/tmnts/lanesList';
// import { mockLanes, mockPairs } from '../../../mocks/tmnts/newTmnt/mockNewTmnt';
// import type { laneType, pairsOfLanesType } from '@/lib/types/types';
// import { cloneDeep } from 'lodash';

// describe('LanesList - Component', () => {

//   const lanes2Squads = [...mockLanes];
//   lanes2Squads.push({
//     ...mockLanes[0],
//     id: "lan_abc1c5cc04f6463d89f24e6e19a12613",
//     lane_number: 13,
//     squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
//     in_use: true
//   })
//   lanes2Squads.push({
//     ...mockLanes[0],
//     id: "lan_abc1c5cc04f6463d89f24e6e19a12614",
//     lane_number: 14,
//     squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
//     in_use: true
//   })
//   lanes2Squads.push({
//     ...mockLanes[0],
//     id: "lan_abc1c5cc04f6463d89f24e6e19a12615",
//     lane_number: 15,
//     squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
//     in_use: true
//   })
//   lanes2Squads.push({
//     ...mockLanes[0],
//     id: "lan_abc1c5cc04f6463d89f24e6e19a12616",
//     lane_number: 16,
//     squad_id: 'sqd_abcdce5f80164830830a7157eb093396',
//     in_use: true
//   })

//   const squad1Id = mockLanes[0].squad_id
//   const squad2Id = 'sqd_abcdce5f80164830830a7157eb093396'
//   const notFoundSquadId = "sqd_01234567890123456789012345678901";

//   const mockSetLanes = jest.fn();

//   describe('get the array of pairs of lanes', () => {
//     it('return an empty array when passed an empty array', () => {
//       const emptyLanes: laneType[] = [];
//       const pairs = pairsOfLanes(mockLanes[0].squad_id, emptyLanes)
//       expect(pairs).toHaveLength(0)
//     })
//     it('return an empty array when passed an array with an odd length (not even length)', () => {
//       const oneLane: laneType[] = [
//         {
//           id: "lan_abc1c5cc04f6463d89f24e6e19a12601",
//           lane_number: 1,
//           squad_id: squad2Id,
//           in_use: true
//         }
//       ];
//       const pairs = pairsOfLanes(squad2Id, oneLane)
//       expect(pairs).toHaveLength(0)
//     })
//     it('should get the array of pairs of lanes for 1st squad', () => {
//       const pairs = pairsOfLanes(mockLanes[0].squad_id, mockLanes)
//       expect(pairs).toHaveLength(6) // lanes 1 to 12, 6 pairs
//     })
//     it('should get the array of pairs of lanes for 2nd squad', () => {
//       const pairs = pairsOfLanes(squad2Id, lanes2Squads)
//       expect(pairs).toHaveLength(2) // lanes 13 to 16, 2 pairs
//     })
//     it('should get the array of pairs of lanes', () => {
//       const pairs = pairsOfLanes(mockLanes[0].squad_id, mockLanes)
//       expect(pairs[0].left_lane).toEqual(mockLanes[0].lane_number)
//       expect(pairs[0].right_lane).toEqual(mockLanes[1].lane_number)
//       expect(pairs[0].left_id).toEqual(mockLanes[0].id)
//       expect(pairs[0].right_id).toEqual(mockLanes[1].id)
//       expect(pairs[0].in_use).toEqual(true)
//     })
//   })

//   describe('lanesThisSquad() function ', () => {
//     it('should get the lanes for squad 1', () => {
//       const squad1Lanes = lanesThisSquad(mockLanes[0].squad_id, mockLanes)
//       expect(squad1Lanes).toHaveLength(12)
//     })
//     it('should return lanes matching the given squad_id', () => {
//       const result = lanesThisSquad(squad2Id, lanes2Squads);
//       expect(result.length).toEqual(4);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(lanes2Squads[i+12]);
//       }
//     });
//     it('should return an empty array when lanes array is empty', () => {
//       const result = lanesThisSquad('sqd_abcdce5f80164830830a7157eb093396', []);
//       expect(result).toEqual([]);
//     });
//     it('should return an empty array when no lanes match the given squad_id', () => {
//       const result = lanesThisSquad('sqd_abcdce5f80164830830a7157eb093396', mockLanes);
//       expect(result).toEqual([]);
//     });
//     it('should return an empty array when lanes input is null', () => {
//       const result = lanesThisSquad('squad1', null as unknown as laneType[]);
//       expect(result).toEqual([]);
//     });
//     it('should return an empty array when squad_id is null', () => {
//       const result = lanesThisSquad(null as unknown as string, mockLanes);
//       expect(result).toEqual([]);
//     });
//     it('should maintain the order of lanes in the returned array including all lanes', () => {
//       const result = lanesThisSquad(mockLanes[0].squad_id, mockLanes);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(mockLanes[i]);
//       }
//     });
//   })

//   describe('lanesNotThisSquad() function', () => {

//     it('should filter out lanes with matching squad_id', () => {
//       const result = lanesNotThisSquad(squad1Id, lanes2Squads);
//       expect(result.length).toEqual(4);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(lanes2Squads[i + 12]);
//       }
//     });
//     it('should return an empty array when lanes input is null or undefined', () => {
//       expect(lanesNotThisSquad(squad1Id, null as unknown as laneType[])).toEqual([]);
//       expect(lanesNotThisSquad(squad1Id, undefined as unknown as laneType[])).toEqual([]);
//     });
//     it('should return all lanes when no lane has matching squad_id', () => {
//       const result = lanesNotThisSquad(notFoundSquadId, lanes2Squads);
//       expect(result.length).toEqual(lanes2Squads.length);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(lanes2Squads[i]);
//       }
//     });
//     it('should return empty array when input lanes array is empty', () => {
//       const lanes: laneType[] = [];
//       const result = lanesNotThisSquad(squad1Id, lanes);
//       expect(result).toEqual([]);
//     });
//     it('should return empty array when no lanes are provided', () => {
//       const result = lanesNotThisSquad(squad1Id, []);
//       expect(result).toEqual([]);
//     });
//     it('should filter out lanes with matching squad_id when multiple lanes with different squad_ids are present', () => {
//       const result = lanesNotThisSquad(squad2Id, lanes2Squads);
//       expect(result.length).toEqual(12);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(lanes2Squads[i]);
//       }
//     });
//     it('should return an empty array when squadId is an empty string', () => {
//       const result = lanesNotThisSquad('', lanes2Squads);
//       expect(result).toEqual([]);
//     });
//     it('should maintain order of lanes in the output', () => {
//       const result = lanesNotThisSquad(squad2Id, lanes2Squads);
//       expect(result.length).toEqual(12);
//       for (let i = 0; i < result.length; i++) {
//         expect(result[i]).toEqual(lanes2Squads[i]);
//       }
//     });
//   });

//   describe('pairsOfLanes() function', () => {
//     it('should get the pairs of lanes for squad 1', () => {
//       const pairs = pairsOfLanes(squad1Id, mockLanes)
//       expect(pairs).toHaveLength(6)
//       expect(pairs[0].left_lane).toEqual(1)
//       expect(pairs[0].right_lane).toEqual(2)
//       expect(pairs[1].left_lane).toEqual(3)
//       expect(pairs[1].right_lane).toEqual(4)
//       expect(pairs[5].left_lane).toEqual(11)
//       expect(pairs[5].right_lane).toEqual(12)
//     })
//     it('should get the pairs of lanes for squad 2', () => {
//       const pairs = pairsOfLanes(squad2Id, lanes2Squads)
//       expect(pairs).toHaveLength(2)
//       expect(pairs[0].left_lane).toEqual(13)
//       expect(pairs[0].right_lane).toEqual(14)
//       expect(pairs[1].left_lane).toEqual(15)
//       expect(pairs[1].right_lane).toEqual(16)
//     })
//     it('should return pairs of lanes when the number of lanes is even', () => {
//       const result = pairsOfLanes(squad1Id, mockLanes);
//       expect(result.length).toEqual(6);
//     });
//     it('should return an empty array when the number of lanes is odd', () => {
//       const invalidLanes = [...mockLanes];
//       invalidLanes.push({
//         ...mockLanes[0],
//         id: "lan_abc1c5cc04f6463d89f24e6e19a12613",
//         lane_number: 13,
//         in_use: true
//       })
//       const result = pairsOfLanes(squad1Id, invalidLanes);
//       expect(result).toEqual([]);
//     });
//     it('should pair lanes sequentially when the number of lanes is even', () => {
//       const result = pairsOfLanes(squad2Id, lanes2Squads);
//       expect(result).toEqual([
//         {
//           left_id: lanes2Squads[12].id,
//           left_lane: lanes2Squads[12].lane_number,
//           right_id: lanes2Squads[13].id,
//           right_lane: lanes2Squads[13].lane_number,
//           in_use: true
//         },
//         {
//           left_id: lanes2Squads[14].id,
//           left_lane: lanes2Squads[14].lane_number,
//           right_id: lanes2Squads[15].id,
//           right_lane: lanes2Squads[15].lane_number,
//           in_use: true
//         }
//       ]);
//     });
//     it("should set 'in_use' to true for all pairs by default", () => {
//       const result = pairsOfLanes(squad1Id, mockLanes);
//       result.forEach(pair => {
//         expect(pair.in_use).toBe(true);
//       });
//     });
//     it('should return empty array when lanes array is empty', () => {
//       const result = pairsOfLanes(squad1Id, []);
//       expect(result).toEqual([]);
//     });
//     it('should return empty array when squadId is null', () => {
//       const result = pairsOfLanes(null as any, mockLanes);
//       expect(result).toEqual([]);
//     });
//     it('should return empty array when lanes array is null', () => {
//       const result = pairsOfLanes(squad1Id, null as any);
//       expect(result).toEqual([]);
//     });
//     it('should return empty array when squadId does not match any lanes', () => {
//       const result = pairsOfLanes(notFoundSquadId, mockLanes);
//       expect(result).toEqual([]);
//     });
//     it('should maintain order of lanes in pairs when generating pairs of lanes', () => {
//       const result = pairsOfLanes(squad2Id, lanes2Squads);
//       expect(result).toEqual([
//         {
//           left_id: lanes2Squads[12].id,
//           left_lane: lanes2Squads[12].lane_number,
//           right_id: lanes2Squads[13].id,
//           right_lane: lanes2Squads[13].lane_number,
//           in_use: true
//         },
//         {
//           left_id: lanes2Squads[14].id,
//           left_lane: lanes2Squads[14].lane_number,
//           right_id: lanes2Squads[15].id,
//           right_lane: lanes2Squads[15].lane_number,
//           in_use: true
//         }
//       ]);
//     });
//     it('should not modify the input arrays when generating pairs of lanes', () => {
//       const originalLanes = [...mockLanes];
//       pairsOfLanes(squad1Id, mockLanes);
//       expect(mockLanes).toEqual(originalLanes);
//     });
//   })

//   describe('getLanesFromPairs() function', () => {
//     it('should get the lanes from pairs', () => {
//       const squadLanes = getLanesFromPairs(mockPairs, squad1Id)
//       expect(squadLanes).toHaveLength(12)
//     })
//     it('should get the lanes correcly ordered from pairs', () => {
//       const squadLanes = getLanesFromPairs(mockPairs, squad1Id)
//       expect(squadLanes[0].lane_number).toEqual(1)
//       expect(squadLanes[1].lane_number).toEqual(2)
//       expect(squadLanes[2].lane_number).toEqual(3)
//       expect(squadLanes[3].lane_number).toEqual(4)
//       expect(squadLanes[4].lane_number).toEqual(5)
//       expect(squadLanes[5].lane_number).toEqual(6)
//       expect(squadLanes[6].lane_number).toEqual(7)
//       expect(squadLanes[7].lane_number).toEqual(8)
//       expect(squadLanes[8].lane_number).toEqual(9)
//       expect(squadLanes[9].lane_number).toEqual(10)
//       expect(squadLanes[10].lane_number).toEqual(11)
//       expect(squadLanes[11].lane_number).toEqual(12)
//     })
//     it('should return empty array when pairs is empty', () => {
//       const pairs: pairsOfLanesType[] = [];
//       const result = getLanesFromPairs(pairs, squad1Id);
//       expect(result).toEqual([]);
//     });
//     it('should return empty array when pairs is null or undefined', () => {
//       let result = getLanesFromPairs(null as any, squad1Id);
//       expect(result).toEqual([]);
  
//       result = getLanesFromPairs(undefined as any, squad1Id);
//       expect(result).toEqual([]);
//     });
//     it('should assign correct squad_id to each lane', () => {
//       const result = getLanesFromPairs(mockPairs, squad1Id);
//       result.forEach(lane => expect(lane.squad_id).toEqual(squad1Id));
//     });
//     it('should exclude pairs if left_id or right_id is missing', () => {
//       const missingDataPairs = cloneDeep(mockPairs);
//       missingDataPairs[0].left_id = '';
//       missingDataPairs[1].right_id = '';
//       const result = getLanesFromPairs(missingDataPairs, squad1Id);
//       expect(result).toHaveLength(8);
//     });
//     it('should exclude pairs with undefined left_lane or right_lane values - Updated', () => {
//       const missingDataPairs = cloneDeep(mockPairs);
//       missingDataPairs[0].left_lane = undefined as any;
//       missingDataPairs[1].right_lane = undefined as any;
//       const result = getLanesFromPairs(missingDataPairs, squad1Id);
//       expect(result).toHaveLength(8);
//     });
//     it('should not mutate input pairs array', () => {
//       const originalPairs = cloneDeep(mockPairs);
//       getLanesFromPairs(mockPairs, squad1Id);
//       expect(mockPairs).toEqual(originalPairs);
//     });
//     it('should maintain order of lanes as they appear in pairs', () => {
//       const result = getLanesFromPairs(mockPairs, squad1Id);
//       expect(result[0].lane_number).toEqual(mockPairs[0].left_lane);
//       expect(result[1].lane_number).toEqual(mockPairs[0].right_lane);
//       expect(result[2].lane_number).toEqual(mockPairs[1].left_lane);
//       expect(result[3].lane_number).toEqual(mockPairs[1].right_lane);
//       expect(result[4].lane_number).toEqual(mockPairs[2].left_lane);
//       expect(result[5].lane_number).toEqual(mockPairs[2].right_lane);
//       expect(result[6].lane_number).toEqual(mockPairs[3].left_lane);
//       expect(result[7].lane_number).toEqual(mockPairs[3].right_lane);
//       expect(result[8].lane_number).toEqual(mockPairs[4].left_lane);
//       expect(result[9].lane_number).toEqual(mockPairs[4].right_lane);
//       expect(result[10].lane_number).toEqual(mockPairs[5].left_lane);
//       expect(result[11].lane_number).toEqual(mockPairs[5].right_lane);
//     });
//     it('should not skip not in use lanes, but set in_use to false', () => {
//       const notInUsePairs = cloneDeep(mockPairs)
//       notInUsePairs[2].in_use = false
//       const squadLanes = getLanesFromPairs(notInUsePairs, squad1Id)
//       expect(squadLanes).toHaveLength(12)
//       expect(squadLanes[4].in_use).toBe(false)
//       expect(squadLanes[5].in_use).toBe(false)
//     })
//   })

//   describe('render the lanes list', () => {

//     it('should render the "Lanes" column header', () => {
//       render(<LanesList
//         squadId={squad1Id}
//         lanes={mockLanes}
//         setLanes={mockSetLanes}
//         isDisabled={false}
//       />)
//       const lanesHeader = screen.getByText('Lanes');
//       expect(lanesHeader).toBeInTheDocument();
//     })
//     it('should render the "In Use" column header', () => {
//       render(<LanesList
//         squadId={squad1Id}
//         lanes={mockLanes}
//         setLanes={mockSetLanes}
//         isDisabled={false}
//       />)
//       const inUseHeader = screen.getByText('In Use');
//       expect(inUseHeader).toBeInTheDocument();
//     })
//     it('should render the first pair of lanes', () => {
//       render(<LanesList
//         squadId={squad1Id}
//         lanes={mockLanes}
//         setLanes={mockSetLanes}
//         isDisabled={false}
//       />)
//       const firstPairText = mockLanes[0].lane_number + ' - ' + mockLanes[1].lane_number
//       const firstPair = screen.getByText(firstPairText);
//       expect(firstPair).toBeInTheDocument();
//     })
//     it('should render the 2nd pair of lanes (map is working)', () => {
//       render(<LanesList
//         squadId={squad1Id}
//         lanes={mockLanes}
//         setLanes={mockSetLanes}
//         isDisabled={false}
//       />)
//       const secondPairText = mockLanes[2].lane_number + ' - ' + mockLanes[3].lane_number
//       const secondPair = screen.getByText(secondPairText);
//       expect(secondPair).toBeInTheDocument();
//     })
//     it('should render the component with checkboxes disabled', () => {
//       render(<LanesList
//         squadId={squad1Id}
//         lanes={mockLanes}
//         setLanes={mockSetLanes}
//         isDisabled={true}
//       />)
//       const checkboxes = screen.queryAllByRole('checkbox');
//       expect(checkboxes).toHaveLength(6);
//       for (let i = 0; i < checkboxes.length; i++) {
//         expect(checkboxes[i]).toBeDisabled();
//       }
//     })
//   })
// })

