import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TmntsList, { getSortedStateOptions } from '@/components/tmnts/tmntsList'; 
import { mockYears } from '../../../mocks/tmnts/mockYears';
import { mockResults } from '../../../mocks/tmnts/mockResults';
import { mockUpcoming } from '../../../mocks/tmnts/mockUpcoming';
import { YearObj } from '@/lib/types/types';

const mockOnYearChange = jest.fn();

const mockResultsProps = {
  yearsArr: mockYears,
  tmntsArr: mockResults,
  onYearChange: mockOnYearChange,
};

const emptyYearsArr: YearObj[] = [];

const mockUpcomingProps = {
  yearsArr: emptyYearsArr,
  tmntsArr: mockUpcoming,
  onYearChange: mockOnYearChange,
}

describe("TmntsList - Component", () => {

  describe('getSortedStateOptions', () => {
    // also tests sortedIndex function in tmntsList component
    it("returns an array of state options", () => { 

      // ARRANGE
      const stateOptions = getSortedStateOptions(mockResults);  // ACT
      // ASSERT
      expect(stateOptions.length).toBe(2);
      expect(stateOptions[0].value).toBe("CA");
      expect(stateOptions[1].value).toBe("NV");
    })
  })

  describe('TmntsList: Results', () => {

    it("renders the component with initial data", () => {
      render(<TmntsList {...mockResultsProps} />);  // ARRANGE            
      const stateLabel = screen.getByLabelText("Select State")  // ACT
      const options = screen.getAllByTestId('select-option')    // ACT 
      const dublinText = screen.getAllByText(/dublin/i)  // ACT 
      const sparksText = screen.getAllByText(/sparks/i)  // ACT 
      expect(stateLabel).toBeInTheDocument(); // ASSERT
      expect(options.length).toBe(2);  // ASSERT      
      expect(dublinText.length).toBeGreaterThanOrEqual(1) // ASSERT
      expect(sparksText.length).toBeGreaterThanOrEqual(1) // ASSERT
    });

    it("handles year change correctly", () => {
      render(<TmntsList {...mockResultsProps} />); // ARRANGE

      // ACT  Simulate year change event 
      fireEvent.change(screen.getByTestId("yearSelect"), {
        target: { value: "2023" },
      });

      // ASSERT  Verify onYearChange callback called with correct value
      expect(mockOnYearChange).toHaveBeenCalledWith("2023");
    });

    it("handles state filter change correctly", async () => {
      render(<TmntsList {...mockResultsProps} />); //ARRANGE

      // ARRANGE Simulate state filter change event    
      fireEvent.change(screen.getByTestId("stateSelect"), {
        target: { value: "CA" }, 
      });
      
      const tmntInfo = screen.getAllByText(/dublin/i)  // ACT 
      expect(tmntInfo.length).toBeGreaterThanOrEqual(1) // ASSERT
              
      const missing = screen.queryByText(/sparks/i); // ACT
      expect(missing).not.toBeInTheDocument(); // ASSERT
    });
  })

  describe('TmntsList: Upcoming', () => { 
    it("renders the component with initial data", () => {
      render(<TmntsList {...mockUpcomingProps} />);  // ARRANGE            
      const stateLabel = screen.getByLabelText("Select State")  // ACT
      const yearSelect = screen.queryByTestId("yearSelect")  // ACT       
      const stateTest = screen.getAllByText(/dublin/i)  // ACT 
      expect(stateLabel).toBeInTheDocument(); // ASSERT
      expect(yearSelect).not.toBeInTheDocument();  // ASSERT      
      expect(stateTest.length).toBeGreaterThanOrEqual(1) // ASSERT
    });

  })
});