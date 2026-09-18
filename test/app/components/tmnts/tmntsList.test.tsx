import React from "react";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import TmntsList, {
  getSortedStateOptions,
} from "@/components/tmnts/tmntsList";
import { mockYears } from "../../../mocks/tmnts/mockYears";
import { mockResults } from "../../../mocks/tmnts/mockResults";
import { mockUpcoming } from "../../../mocks/tmnts/mockUpcoming";
import type { YearObj } from "@/lib/types/types";

const mockOnYearChange = jest.fn();

const mockResultsProps = {
  yearsArr: mockYears,
  tmntsArr: mockResults,
  tmntYear: "2022",
  onYearChange: mockOnYearChange,
};

const emptyYearsArr: YearObj[] = [];

const mockUpcomingProps = {
  yearsArr: emptyYearsArr,
  tmntsArr: mockUpcoming,
  tmntYear: "",
  onYearChange: mockOnYearChange,
};

describe("TmntsList - Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSortedStateOptions", () => {
    // also tests sortedIndex function in tmntsList component
    it("returns an array of state options", () => {
      // ARRANGE / ACT
      const stateOptions = getSortedStateOptions(mockResults);

      // ASSERT
      expect(stateOptions.length).toBe(2);
      expect(stateOptions[0].value).toBe("CA");
      expect(stateOptions[1].value).toBe("NV");
    });

    it("returns state options sorted with no duplicates", () => {
      // ACT
      const stateOptions = getSortedStateOptions(mockResults);

      // ASSERT
      expect(stateOptions).toEqual([
        { value: "CA", text: "CA" },
        { value: "NV", text: "NV" },
      ]);
    });
  });

  describe("TmntsList: Results", () => {
    it("renders the component with initial data", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear={mockResultsProps.tmntYear}
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ACT
      const stateLabel = screen.getByLabelText("Select State");
      const options = screen.getAllByTestId("select-option");
      const dublinText = screen.getAllByText(/dublin/i);
      const sparksText = screen.getAllByText(/sparks/i);

      // ASSERT
      expect(stateLabel).toBeInTheDocument();
      expect(options.length).toBe(2);
      expect(dublinText.length).toBeGreaterThanOrEqual(1);
      expect(sparksText.length).toBeGreaterThanOrEqual(1);
    });

    it("sets the selected year from tmntYear", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear="2023"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      const yearSelect = screen.getByTestId(
        "yearSelect",
      ) as HTMLSelectElement;

      expect(yearSelect.value).toBe("2023");
    });

    it("handles year change correctly", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear={mockResultsProps.tmntYear}
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ACT
      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      // ASSERT
      expect(mockOnYearChange).toHaveBeenCalledTimes(1);
      expect(mockOnYearChange).toHaveBeenCalledWith("2023");
    });

    it("clears displayed tournaments when the year changes", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear={mockResultsProps.tmntYear}
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ARRANGE
      expect(screen.getAllByText(/dublin/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/sparks/i).length).toBeGreaterThan(0);

      // ACT
      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      // ASSERT
      expect(screen.queryByText(/dublin/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sparks/i)).not.toBeInTheDocument();
    });

    it("resets the state filter to all when the year changes", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear={mockResultsProps.tmntYear}
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      const stateSelect = screen.getByTestId(
        "stateSelect",
      ) as HTMLSelectElement;

      // ARRANGE
      fireEvent.change(stateSelect, {
        target: { value: "CA" },
      });

      expect(stateSelect.value).toBe("CA");

      // ACT
      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      // ASSERT
      expect(stateSelect.value).toBe("all");
    });

    it("handles state filter change correctly", () => {
      render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear={mockResultsProps.tmntYear}
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ACT
      fireEvent.change(screen.getByTestId("stateSelect"), {
        target: { value: "CA" },
      });

      // ASSERT
      const tmntInfo = screen.getAllByText(/dublin/i);
      expect(tmntInfo.length).toBeGreaterThanOrEqual(1);

      const missing = screen.queryByText(/sparks/i);
      expect(missing).not.toBeInTheDocument();
    });

    it("repopulates tournaments when tmnts changes", () => {
      const { rerender } = render(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={[]}
          tmntYear="2022"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ARRANGE
      expect(screen.queryByText(/dublin/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sparks/i)).not.toBeInTheDocument();

      // ACT
      rerender(
        <TmntsList
          years={mockResultsProps.yearsArr}
          tmnts={mockResultsProps.tmntsArr}
          tmntYear="2023"
          showResults={true}
          onYearChange={mockOnYearChange}
        />,
      );

      // ASSERT
      expect(screen.getAllByText(/dublin/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/sparks/i).length).toBeGreaterThan(0);
    });
  });

  describe("TmntsList: Upcoming", () => {
    it("renders the component with initial data", () => {
      render(
        <TmntsList
          years={mockUpcomingProps.yearsArr}
          tmnts={mockUpcomingProps.tmntsArr}
          tmntYear={mockUpcomingProps.tmntYear}
          showResults={false}
          onYearChange={mockOnYearChange}
        />,
      );

      // ACT
      const stateLabel = screen.getByLabelText("Select State");
      const yearSelect = screen.queryByTestId("yearSelect");
      const stateTest = screen.getAllByText(/dublin/i);

      // ASSERT
      expect(stateLabel).toBeInTheDocument();
      expect(yearSelect).not.toBeInTheDocument();
      expect(stateTest.length).toBeGreaterThanOrEqual(1);
    });
  });
});
