// test/app/components/tmnts/tmntsList.test.tsx
// tests for src/components/tmnts/tmntsList.tsx
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import TmntsList, {
  getSortedStateOptions,
} from "@/components/tmnts/tmntsList";
import { getMonthDay } from "@/lib/dateTools";
import {
  mockBowl,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { YearObj, tmntsListType } from "@/lib/types/types";

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
    throw new Error(`No item at index ${String(index)}`);
  }
  return item;
};

/** the tournament from the full tournament mock data: Mock Bowl, CA */
const mockTmnt: tmntsListType = {
  ...mockTmntFullData.tmnt,
  bowl: {
    bowl_name: mockBowl.bowl_name,
    city: mockBowl.city,
    state: mockBowl.state,
    url: mockBowl.url,
  },
};

/**
 * Creates another tournament list row from mockTmnt, with its own
 * id, name, date and bowl.
 *
 * @param {string} idSuffix - replaces the last character of mockTmnt.id
 * @param {string} tmntName - tournament name
 * @param {string} startDate - start date string, YYYY-MM-DD
 * @param {tmntsListType["bowl"]} bowl - bowl for the tournament
 * @returns {tmntsListType} new tournament list row
 */
const createTmnt = (
  idSuffix: string,
  tmntName: string,
  startDate: string,
  bowl: tmntsListType["bowl"],
): tmntsListType => ({
  ...mockTmnt,
  id: `${mockTmnt.id.slice(0, -1)}${idSuffix}`,
  tmnt_name: tmntName,
  start_date_str: startDate,
  bowl,
});

const nvTmnt = createTmnt("2", "Silver State Classic", "2025-06-14", {
  bowl_name: "Reno Lanes",
  city: "Reno",
  state: "NV",
  url: "https://www.example.com/reno",
});

const azTmnt = createTmnt("3", "Desert Doubles", "2025-03-08", {
  bowl_name: "Phoenix Bowl",
  city: "Phoenix",
  state: "AZ",
  url: "https://www.example.com/phoenix",
});

const caTmnt2 = createTmnt("4", "Golden Gate Open", "2025-11-22", {
  bowl_name: "Bay Bowl",
  city: "San Francisco",
  state: "CA",
  url: "https://www.example.com/bay",
});

/**
 * States are not in order, and CA is listed twice, so the tests cover
 * inserting at the start (AZ), adding at the end (NV) and skipping a
 * duplicate (CA).
 */
const mockTmnts: tmntsListType[] = [mockTmnt, nvTmnt, azTmnt, caTmnt2];

const mockYears: YearObj[] = [
  { year: "2025" },
  { year: "2024" },
  { year: "2023" },
];

const noYears: YearObj[] = [];

const mockOnYearChange = jest.fn();

/** text in the tournament column, e.g. "Mock Tournament - Sep 1" */
const tmntText = (tmnt: tmntsListType): string =>
  `${tmnt.tmnt_name} - ${getMonthDay(tmnt.start_date_str)}`;

/** text in the location column, e.g. "Somewhere, CA" */
const locationText = (tmnt: tmntsListType): string =>
  `${tmnt.bowl.city}, ${tmnt.bowl.state}`;

interface RenderOptions {
  years?: YearObj[];
  tmnts?: tmntsListType[];
  tmntYear?: string;
  showResults?: boolean;
}

const renderTmntsList = ({
  years = mockYears,
  tmnts = mockTmnts,
  tmntYear = "2025",
  showResults = true,
}: RenderOptions = {}) =>
  render(
    <TmntsList
      years={years}
      tmnts={tmnts}
      tmntYear={tmntYear}
      showResults={showResults}
      onYearChange={mockOnYearChange}
    />,
  );

/** the rows in the table body (the header row is not included) */
const getBodyRows = (): HTMLElement[] => {
  const tbody = getAt(screen.getAllByRole("rowgroup"), 1);
  return within(tbody).queryAllByRole("row");
};

const getStateSelect = (): HTMLElement =>
  screen.getByRole("combobox", { name: "Select State" });

const getOptionTexts = (select: HTMLElement): string[] =>
  within(select)
    .getAllByRole<HTMLOptionElement>("option")
    .map((option) => option.text);

describe("TmntsList - Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSortedStateOptions", () => {
    // also tests sortedIndex in tmntsList.tsx
    it("returns the states sorted, with no duplicates", () => {
      const stateOptions = getSortedStateOptions(mockTmnts);

      expect(stateOptions).toEqual([
        { value: "AZ", text: "AZ" },
        { value: "CA", text: "CA" },
        { value: "NV", text: "NV" },
      ]);
    });

    it("returns the same options whatever the order of the tournaments", () => {
      const reversed = [...mockTmnts].reverse();

      expect(getSortedStateOptions(reversed)).toEqual(
        getSortedStateOptions(mockTmnts),
      );
    });

    it("returns one option for a single tournament", () => {
      expect(getSortedStateOptions([mockTmnt])).toEqual([
        { value: mockBowl.state, text: mockBowl.state },
      ]);
    });

    it("returns one option when every tournament is in the same state", () => {
      expect(getSortedStateOptions([mockTmnt, caTmnt2, mockTmnt])).toEqual([
        { value: "CA", text: "CA" },
      ]);
    });

    it("returns an empty array for no tournaments", () => {
      expect(getSortedStateOptions([])).toEqual([]);
    });

    it("returns an empty array when tmnts is null", () => {
      expect(getSortedStateOptions(null as unknown as tmntsListType[])).toEqual([]);
    });

    it("returns an empty array when tmnts is undefined", () => {
      expect(getSortedStateOptions(undefined as unknown as tmntsListType[])).toEqual([]);
    });
  });

  describe("TmntsList: Results", () => {
    it("renders one row per tournament", () => {
      renderTmntsList();

      expect(getBodyRows()).toHaveLength(mockTmnts.length);
    });

    it("renders the column headers", () => {
      renderTmntsList();

      expect(
        screen.getByRole("columnheader", { name: "Tournament" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("columnheader", { name: "Center" }),
      ).toBeInTheDocument();
    });

    it("links each tournament name and date to its results page", () => {
      renderTmntsList();

      mockTmnts.forEach((tmnt) => {
        expect(
          screen.getByRole("link", { name: tmntText(tmnt) }),
        ).toHaveAttribute("href", `/results/tmnt/${tmnt.id}/home`);
      });
    });

    it("links each bowl name to the bowl's website in a new tab", () => {
      renderTmntsList();

      const bowlLink = screen.getByRole("link", { name: mockBowl.bowl_name });
      expect(bowlLink).toHaveAttribute("href", mockBowl.url);
      expect(bowlLink).toHaveAttribute("target", "_blank");
      expect(bowlLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows the city and state for each tournament", () => {
      renderTmntsList();

      mockTmnts.forEach((tmnt) => {
        expect(screen.getByText(locationText(tmnt))).toBeInTheDocument();
      });
    });

    it("shows the tournaments in the order they are passed in", () => {
      renderTmntsList();

      const rows = getBodyRows();
      mockTmnts.forEach((tmnt, index) => {
        expect(
          within(getAt(rows, index)).getByText(tmntText(tmnt)),
        ).toBeInTheDocument();
      });
    });

    it("renders a year option for each year", () => {
      renderTmntsList();

      expect(getOptionTexts(screen.getByTestId("yearSelect"))).toEqual(
        mockYears.map((yearObj) => yearObj.year),
      );
    });

    it("sets the selected year from tmntYear", () => {
      renderTmntsList({ tmntYear: "2024" });

      expect(screen.getByTestId("yearSelect")).toHaveValue("2024");
    });

    it("renders the state options with 'all' first, then sorted states", () => {
      renderTmntsList();

      expect(getOptionTexts(getStateSelect())).toEqual([
        "all",
        "AZ",
        "CA",
        "NV",
      ]);
      expect(getStateSelect()).toHaveValue("all");
    });

    it("sends the new year to onYearChange when the year changes", () => {
      renderTmntsList();

      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      expect(mockOnYearChange).toHaveBeenCalledTimes(1);
      expect(mockOnYearChange).toHaveBeenCalledWith("2023");
    });

    it("clears the displayed tournaments when the year changes", () => {
      renderTmntsList();
      expect(getBodyRows()).toHaveLength(mockTmnts.length);

      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      expect(getBodyRows()).toHaveLength(0);
      expect(
        screen.queryByRole("link", { name: tmntText(mockTmnt) }),
      ).not.toBeInTheDocument();
    });

    it("resets the state filter to 'all' when the year changes", () => {
      renderTmntsList();
      const stateSelect = getStateSelect();

      fireEvent.change(stateSelect, { target: { value: "CA" } });
      expect(stateSelect).toHaveValue("CA");

      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      expect(stateSelect).toHaveValue("all");
    });

    it("shows only the tournaments in the selected state", () => {
      renderTmntsList();

      fireEvent.change(getStateSelect(), { target: { value: "CA" } });

      expect(getBodyRows()).toHaveLength(2);
      expect(screen.getByText(locationText(mockTmnt))).toBeInTheDocument();
      expect(screen.getByText(locationText(caTmnt2))).toBeInTheDocument();
      expect(
        screen.queryByText(locationText(nvTmnt)),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(locationText(azTmnt)),
      ).not.toBeInTheDocument();
    });

    it("changes the shown tournaments when a different state is picked", () => {
      renderTmntsList();

      fireEvent.change(getStateSelect(), { target: { value: "CA" } });
      fireEvent.change(getStateSelect(), { target: { value: "NV" } });

      const rows = getBodyRows();
      expect(rows).toHaveLength(1);
      expect(
        within(getAt(rows, 0)).getByText(tmntText(nvTmnt)),
      ).toBeInTheDocument();
    });

    it("shows every tournament again when 'all' is picked", () => {
      renderTmntsList();

      fireEvent.change(getStateSelect(), { target: { value: "AZ" } });
      expect(getBodyRows()).toHaveLength(1);

      fireEvent.change(getStateSelect(), { target: { value: "all" } });

      expect(getBodyRows()).toHaveLength(mockTmnts.length);
    });

    it("does not call onYearChange when the state filter changes", () => {
      renderTmntsList();

      fireEvent.change(getStateSelect(), { target: { value: "CA" } });

      expect(mockOnYearChange).not.toHaveBeenCalled();
    });

    it("repopulates the tournaments when tmnts changes", () => {
      const { rerender } = renderTmntsList({ tmnts: [] });
      expect(getBodyRows()).toHaveLength(0);
      expect(getOptionTexts(getStateSelect())).toEqual(["all"]);

      rerender(
        <TmntsList
          years={mockYears}
          tmnts={mockTmnts}
          tmntYear="2024"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      expect(getBodyRows()).toHaveLength(mockTmnts.length);
      expect(getOptionTexts(getStateSelect())).toEqual([
        "all",
        "AZ",
        "CA",
        "NV",
      ]);
      expect(screen.getByTestId("yearSelect")).toHaveValue("2024");
    });

    it("shows the new year's tournaments after a year change", () => {
      const { rerender } = renderTmntsList({ tmnts: [mockTmnt] });

      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2024" },
      });
      expect(getBodyRows()).toHaveLength(0);

      // parent loads the tournaments for the new year
      rerender(
        <TmntsList
          years={mockYears}
          tmnts={[nvTmnt, azTmnt]}
          tmntYear="2024"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      expect(getBodyRows()).toHaveLength(2);
      expect(screen.getByText(tmntText(nvTmnt))).toBeInTheDocument();
      expect(screen.getByText(tmntText(azTmnt))).toBeInTheDocument();
      expect(screen.queryByText(tmntText(mockTmnt))).not.toBeInTheDocument();
    });

    it("resets the state filter to 'all' when tmnts changes", () => {
      const { rerender } = renderTmntsList();
      fireEvent.change(getStateSelect(), { target: { value: "CA" } });
      expect(getBodyRows()).toHaveLength(2);

      // parent sends a new tmnts array that still has CA tournaments
      rerender(
        <TmntsList
          years={mockYears}
          tmnts={[...mockTmnts]}
          tmntYear="2025"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // every tournament is shown, so the select must say 'all', not CA
      expect(getBodyRows()).toHaveLength(mockTmnts.length);
      expect(getStateSelect()).toHaveValue("all");
    });

    it("keeps the selected state after a re-render with the same tmnts", () => {
      const { rerender } = renderTmntsList();
      fireEvent.change(getStateSelect(), { target: { value: "NV" } });

      // same props, e.g. the parent re-renders for another reason
      rerender(
        <TmntsList
          years={mockYears}
          tmnts={mockTmnts}
          tmntYear="2025"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      expect(getStateSelect()).toHaveValue("NV");
      expect(getBodyRows()).toHaveLength(1);
    });

    it("renders only the 'all' state option and no rows when there are no tournaments", () => {
      renderTmntsList({ tmnts: [] });

      expect(getBodyRows()).toHaveLength(0);
      expect(getOptionTexts(getStateSelect())).toEqual(["all"]);
    });
  });

  describe("TmntsList: Upcoming", () => {
    it("does not render the year select when there are no years", () => {
      renderTmntsList({ years: noYears, tmntYear: "", showResults: false });

      expect(screen.queryByTestId("yearSelect")).not.toBeInTheDocument();
      expect(getStateSelect()).toBeInTheDocument();
    });

    it("shows tournament names and dates as text, not links", () => {
      renderTmntsList({ years: noYears, tmntYear: "", showResults: false });

      mockTmnts.forEach((tmnt) => {
        expect(screen.getByText(tmntText(tmnt))).toBeInTheDocument();
        expect(
          screen.queryByRole("link", { name: tmntText(tmnt) }),
        ).not.toBeInTheDocument();
      });
    });

    it("still links each bowl name to the bowl's website", () => {
      renderTmntsList({ years: noYears, tmntYear: "", showResults: false });

      expect(screen.getAllByRole("link")).toHaveLength(mockTmnts.length);
      expect(
        screen.getByRole("link", { name: mockBowl.bowl_name }),
      ).toHaveAttribute("href", mockBowl.url);
    });

    it("filters the tournaments by state", () => {
      renderTmntsList({ years: noYears, tmntYear: "", showResults: false });

      fireEvent.change(getStateSelect(), { target: { value: "NV" } });

      const rows = getBodyRows();
      expect(rows).toHaveLength(1);
      expect(
        within(getAt(rows, 0)).getByText(tmntText(nvTmnt)),
      ).toBeInTheDocument();
    });
  });
});
