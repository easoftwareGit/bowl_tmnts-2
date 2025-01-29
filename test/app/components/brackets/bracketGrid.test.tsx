import React from "react";
import { render, screen } from "@testing-library/react";
import BracketGrid, { BGDataType } from "@/components/brackets/bracketGrid";

describe('BracketGrid', () => { 

  describe('render default values', () => { 
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: [], 
      for1ByeValues: [],  
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };

    it('should render correctly', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridElement = screen.getByRole('grid');
      expect(gridElement).toBeInTheDocument();
    });    
    it('should render default column headers', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '1' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '2' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '3' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '4' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '5' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '6' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '7' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '8' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '9' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '10' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    });    
    it('should render default row headers', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const row1Header = screen.getByText('For Full');
      expect(row1Header).toBeInTheDocument();
      const row2Header = screen.getByText('For 1 Bye');
      expect(row2Header).toBeInTheDocument();
    })
    it('should render 2 to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const toFillCells = screen.getAllByText('0');
      expect(toFillCells).toHaveLength(2);
    })
    it('should render 3 (1 header and 2 data) rows', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3);
    })
    it('should render 24 grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(24);
    })
    it('should render 20 (10 for 2 rows) blank grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells = screen.getAllByRole('gridcell', { name: '' });
      expect(gridCells).toHaveLength(20);
    })
  })

  describe('render 10 brackets with test data', () => { 
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: [1, 1, 1, 1, 2, 2, 5, 6, 7, 7], 
      for1ByeValues: [0, 0, 0, 0, 1, 1, 4, 5, 6, 6],  
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };

    it('should render column headers', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();

      const b1Header = screen.getByRole('columnheader', { name: '1' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '2' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '3' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '4' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '5' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '6' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '7' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '8' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '9' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '10' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    });    
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const toFillForFull = screen.getAllByText('33');
      expect(toFillForFull).toHaveLength(1);
      const toFillFor1Bye = screen.getAllByText('23');
      expect(toFillFor1Bye).toHaveLength(1);
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 4 for 1 Bye
      expect(gridCells0).toHaveLength(4);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 4 for Full, 2 for 1 Bye
      expect(gridCells1).toHaveLength(6);
      
      const gridCells2 = screen.getAllByRole('gridcell', { name: '2' });
      // 2 for full 
      expect(gridCells2).toHaveLength(2);

      const gridCells4 = screen.getAllByRole('gridcell', { name: '4' });
      // 1 for 1 Bye
      expect(gridCells4).toHaveLength(1);

      const gridCells5 = screen.getAllByRole('gridcell', { name: '5' });
      // 1 for Full, 1 for 1 Bye
      expect(gridCells5).toHaveLength(2);

      const gridCells6 = screen.getAllByRole('gridcell', { name: '6' });
      // 1 for Full, 2 for 1 Bye
      expect(gridCells6).toHaveLength(3);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 2 for Full
      expect(gridCells7).toHaveLength(2);

    })
  })

  describe('render 12 brackets with test data', () => { 
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: [1, 1, 1, 1, 2, 2, 5, 6, 7, 7, 7, 7], 
      for1ByeValues: [0, 0, 0, 0, 1, 1, 4, 5, 6, 6, 6, 6],  
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };

    it('should render column headers', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '3' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '4' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '5' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '6' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '7' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '8' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '9' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '10' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '11' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '12' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    });    
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const toFillForFull = screen.getAllByText('47');
      expect(toFillForFull).toHaveLength(1);
      const toFillFor1Bye = screen.getAllByText('35');
      expect(toFillFor1Bye).toHaveLength(1);
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 2 for 1 Bye
      expect(gridCells0).toHaveLength(2);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 2 for Full, 2 for 1 Bye
      expect(gridCells1).toHaveLength(4);
      
      const gridCells2 = screen.getAllByRole('gridcell', { name: '2' });
      // 2 for full 
      expect(gridCells2).toHaveLength(2);

      const gridCells4 = screen.getAllByRole('gridcell', { name: '4' });
      // 1 for 1 Bye
      expect(gridCells4).toHaveLength(1);

      const gridCells5 = screen.getAllByRole('gridcell', { name: '5' });
      // 1 for Full, 1 for 1 Bye
      expect(gridCells5).toHaveLength(2);

      const gridCells6 = screen.getAllByRole('gridcell', { name: '6' });
      // 1 for Full, 4 for 1 Bye
      expect(gridCells6).toHaveLength(5);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 4 for Full
      expect(gridCells7).toHaveLength(4);

    })
  })

  describe('render 8 brackets with test data', () => { 
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: [1, 1, 1, 1, 3, 3, 6, 7], 
      for1ByeValues: [0, 0, 0, 0, 2, 2, 5, 6],  
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };

    it('should render column headers', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '1' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '2' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '3' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '4' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '5' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '6' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '7' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '8' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '9' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '10' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    });    
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const toFillForFull = screen.getAllByText('23');
      expect(toFillForFull).toHaveLength(1);
      const toFillFor1Bye = screen.getAllByText('15');
      expect(toFillFor1Bye).toHaveLength(1);
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);

      const gridCellsBlank = screen.getAllByRole('gridcell', { name: '' });
      // 2 for Full, 2 for 1 Bye
      expect(gridCellsBlank).toHaveLength(4);

      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 4 for 1 Bye
      expect(gridCells0).toHaveLength(4);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 4 for Full,
      expect(gridCells1).toHaveLength(4);
      
      const gridCells2 = screen.getAllByRole('gridcell', { name: '2' });
      // 2 for 1 Bye 
      expect(gridCells2).toHaveLength(2);

      const gridCells4 = screen.getAllByRole('gridcell', { name: '3' });
      // 2 for Full
      expect(gridCells4).toHaveLength(2);

      const gridCells5 = screen.getAllByRole('gridcell', { name: '5' });
      // 1 for 1 Bye
      expect(gridCells5).toHaveLength(1);

      const gridCells6 = screen.getAllByRole('gridcell', { name: '6' });
      // 1 for Full, 1 for 1 Bye
      expect(gridCells6).toHaveLength(2);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 1 for Full
      expect(gridCells7).toHaveLength(1);

    })
  })

})