import React from "react";
import { render, screen } from "@testing-library/react";
import BracketGrid, { BGDataType } from "@/components/brackets/bracketGrid";
import { BracketList } from "@/components/brackets/bracketListClass";

describe('BracketGrid', () => { 

  describe('render default values', () => { 
    
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: [], 
      forOneByeValues: [],        
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

  describe('render 18 bracktes with test data, 138 entries', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_brkts'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 8, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 5, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 12, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 6, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 6, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 8, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 8, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 10, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 6, createdAt: 1100 },
      { player_id: 'Lou', test_brkts: 5, createdAt: 1200 },
      { player_id: 'Mike', test_brkts: 8, createdAt: 1300 },
      { player_id: 'Nate', test_brkts: 10, createdAt: 1400 },
      { player_id: 'Otto', test_brkts: 7, createdAt: 1500 },
      { player_id: 'Paul', test_brkts: 4, createdAt: 1600 },
      { player_id: 'Quin', test_brkts: 5, createdAt: 1700 },
      { player_id: 'Rob', test_brkts: 10, createdAt: 1800 },
    ];      
    testBracketList.calcTotalBrkts(playerData);            
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues, 
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,        
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => { 
      expect(testBracketList.fullCount).toBe(12);
      expect(testBracketList.oneByeCount).toBe(6);  
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 12) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 9-12:0, 13-19:1; One Bye: 9-18:0', async () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '9' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '10' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '11' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '12' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '13' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '14' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '15' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '16' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '17' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '18' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    })
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);      
      let divs = screen.getAllByRole('gridcell', { name: '6' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();        
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 15: 10 for One Bye, 4 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(15);
      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 6 for Full
      expect(gridCells1).toHaveLength(6);    
    })
  })

  describe('render 10Px8B full bracktes with test data, 80 entries', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 8, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 6, createdAt: 300 },
      { player_id: 'Don', test_brkts: 7, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 6, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 5, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 6, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 8, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 8, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 10, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 6, createdAt: 1100 },
    ];      
    testBracketList.calcTotalBrkts(playerData);            
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues, 
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,        
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => { 
      expect(testBracketList.fullCount).toBe(10);
      expect(testBracketList.oneByeCount).toBe(0);  
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 10) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 1-10:0; One Bye: 1-10:0', async () => { 
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
    })
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);      
      let divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFill = divs.filter(div => div.getAttribute('aria-colindex') === '12');
      expect(toFill).toHaveLength(2); // Full ToFill: 1, OneBye ToFill: 1
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 22: 10 for One Bye, 10 for Full, 2 To Fill
      expect(gridCells0).toHaveLength(22);
    })
  })

  describe('render 1Px10B, 17Px4B bracktes with test data, 78 entries', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 4, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 4, createdAt: 300 },
      { player_id: 'Don', test_brkts: 4, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 4, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 4, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 4, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 4, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 4, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 4, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 4, createdAt: 1100 },
      { player_id: 'Lou', test_brkts: 4, createdAt: 1200 },
      { player_id: 'Mike', test_brkts: 4, createdAt: 1300 },
      { player_id: 'Nate', test_brkts: 4, createdAt: 1400 },
      { player_id: 'Otto', test_brkts: 4, createdAt: 1500 },
      { player_id: 'Paul', test_brkts: 4, createdAt: 1600 },
      { player_id: 'Quin', test_brkts: 4, createdAt: 1700 },
      { player_id: 'Rob', test_brkts: 4, createdAt: 1800 },
    ];      
    testBracketList.calcTotalBrkts(playerData);            
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues, 
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,        
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => { 
      expect(testBracketList.fullCount).toBe(8);
      expect(testBracketList.oneByeCount).toBe(2);  
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 8) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 1-8:0, 9-10:1; One Bye: 1-10:0', async () => { 
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
    })
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);      
      let divs = screen.getAllByRole('gridcell', { name: '2' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();        
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 19: 10 for One Bye, 8 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(19);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 2 for Full
      expect(gridCells1).toHaveLength(2);
    })
  })

  describe('render 10Px10B bracktes with test data, 100 entries', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 10, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 10, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 10, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 10, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 10, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 10, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 10, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 10, createdAt: 1000 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(9);
      expect(testBracketList.oneByeCount).toBe(4);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 9) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 1-8:0, 9-10:1; One Bye: 1-10:0', async () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '4' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '5' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '6' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '7' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '8' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '9' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '10' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '11' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '12' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '13' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '4' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 17: 10 for One Bye, 6 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(17);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 4 for Full
      expect(gridCells1).toHaveLength(4);
    })
  })

  describe('render 10Px10B, 4Px5B bracktes with test data, 100 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 10, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 10, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 10, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 10, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 10, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 10, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 5, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 5, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 5, createdAt: 1100 },
      { player_id: 'Lou', test_brkts: 5, createdAt: 1200 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(9);
      expect(testBracketList.oneByeCount).toBe(4);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 9) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 1-8:0, 9-10:1; One Bye: 1-10:0', async () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '4' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '5' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '6' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '7' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '8' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '9' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '10' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '11' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '12' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '13' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '4' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 17: 10 for One Bye, 6 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(17);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 4 for Full
      expect(gridCells1).toHaveLength(4);
    })
  })

  describe('edge case 1: render random bracktes with Al 50 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 50, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 8, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 5, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 12, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 6, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 6, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 8, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 8, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 10, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 6, createdAt: 1100 },
      { player_id: 'Lou', test_brkts: 5, createdAt: 1200 },
      { player_id: 'Mike', test_brkts: 8, createdAt: 1300 },
      { player_id: 'Nate', test_brkts: 10, createdAt: 1400 },
      { player_id: 'Otto', test_brkts: 7, createdAt: 1500 },
      { player_id: 'Paul', test_brkts: 4, createdAt: 1600 },
      { player_id: 'Quin', test_brkts: 5, createdAt: 1700 },
      { player_id: 'Rob', test_brkts: 10, createdAt: 1800 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(14);
      expect(testBracketList.oneByeCount).toBe(5);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 14) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 10-14:0, 15-19:1; One Bye: 10-19:0', async () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '10' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '11' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '12' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '13' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '14' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '15' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '16' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '17' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '18' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '19' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '5' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 16: 10 for One Bye, 5 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(16);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 5 for Full
      expect(gridCells1).toHaveLength(5);
    })
  })

  describe('edge case 2: render random bracktes with Al and Bob 50 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 50, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 50, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 5, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 12, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 6, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 6, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 8, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 8, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 10, createdAt: 1000 },
      { player_id: 'Ken', test_brkts: 6, createdAt: 1100 },
      { player_id: 'Lou', test_brkts: 5, createdAt: 1200 },
      { player_id: 'Mike', test_brkts: 8, createdAt: 1300 },
      { player_id: 'Nate', test_brkts: 10, createdAt: 1400 },
      { player_id: 'Otto', test_brkts: 7, createdAt: 1500 },
      { player_id: 'Paul', test_brkts: 4, createdAt: 1600 },
      { player_id: 'Quin', test_brkts: 5, createdAt: 1700 },
      { player_id: 'Rob', test_brkts: 10, createdAt: 1800 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(15);
      expect(testBracketList.oneByeCount).toBe(6);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 15) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 12-15:0, 16-21:1; One Bye: 12-21:0', async () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const brktsHeader = screen.getByRole('columnheader', { name: 'Brackets' });
      expect(brktsHeader).toBeInTheDocument();
      const b1Header = screen.getByRole('columnheader', { name: '12' });
      expect(b1Header).toBeInTheDocument();
      const b2Header = screen.getByRole('columnheader', { name: '13' });
      expect(b2Header).toBeInTheDocument();
      const b3Header = screen.getByRole('columnheader', { name: '14' });
      expect(b3Header).toBeInTheDocument();
      const b4Header = screen.getByRole('columnheader', { name: '15' });
      expect(b4Header).toBeInTheDocument();
      const b5Header = screen.getByRole('columnheader', { name: '16' });
      expect(b5Header).toBeInTheDocument();
      const b6Header = screen.getByRole('columnheader', { name: '17' });
      expect(b6Header).toBeInTheDocument();
      const b7Header = screen.getByRole('columnheader', { name: '18' });
      expect(b7Header).toBeInTheDocument();
      const b8Header = screen.getByRole('columnheader', { name: '19' });
      expect(b8Header).toBeInTheDocument();
      const b9Header = screen.getByRole('columnheader', { name: '20' });
      expect(b9Header).toBeInTheDocument();
      const b10Header = screen.getByRole('columnheader', { name: '21' });
      expect(b10Header).toBeInTheDocument();
      const toFillHeader = screen.getByRole('columnheader', { name: 'To Fill' });
      expect(toFillHeader).toBeInTheDocument();
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '6' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 15: 10 for One Bye, 4 for Full, 1 To Fill
      expect(gridCells0).toHaveLength(15);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 6 for Full
      expect(gridCells1).toHaveLength(6);
    })
  })

  describe('edge case 3: render 10Px4B bracktes with test data, 40 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 4, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 4, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 4, createdAt: 300 },
      { player_id: 'Don', test_brkts: 4, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 4, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 4, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 4, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 4, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 4, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 4, createdAt: 1000 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(5);
      expect(testBracketList.oneByeCount).toBe(0);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 5) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }
      }
    })
    it('should render brackets Full: 1-5:0, 6-10:8; One Bye: 1-5:0, 6-10:7', async () => {
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
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '40' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '35' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 10: 5 for One Bye, 5 for Full
      expect(gridCells0).toHaveLength(10);

      const gridCells8 = screen.getAllByRole('gridcell', { name: '8' });
      // 5 for Full
      expect(gridCells8).toHaveLength(5);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 5 for one Bye
      expect(gridCells7).toHaveLength(5);
    })
  })

  describe('edge case 4: render 10Px2B bracktes with test data, 20 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 2, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 2, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 2, createdAt: 300 },
      { player_id: 'Don', test_brkts: 2, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 2, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 2, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 2, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 2, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 2, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 2, createdAt: 1000 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(1);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 2) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else if (i === 2) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(2);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(1);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
         }
      }
    })
    it('should render brackets Full: 1-2:1, 3:2, 4-10:8; One Bye: 1-2:0, 3:1, 4-10:7', async () => {
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
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '60' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '50' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 2: 2 for One Bye
      expect(gridCells0).toHaveLength(2);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 3: 2 for Full, 1 for One Bye
      expect(gridCells1).toHaveLength(3);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 7 for one Bye
      expect(gridCells7).toHaveLength(7);

      const gridCells8 = screen.getAllByRole('gridcell', { name: '8' });
      // 7 for one Bye
      expect(gridCells7).toHaveLength(7);
    })
  })

  describe('edge case 5: render 7Px10B brackets bracktes with test data, 70 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 10, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 10, createdAt: 300 },
      { player_id: 'Don', test_brkts: 10, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 10, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 10, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 10, createdAt: 700 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(10);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 10) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('should render brackets Full: 1-10:1; One Bye: 1-10:0', async () => {
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
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '10' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '0' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 11: 10 for One Bye, 1 To Fill
      expect(gridCells0).toHaveLength(11);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 10 for Full
      expect(gridCells1).toHaveLength(10);
    })
  })

  describe('edge case 6: render 7Px4B brackets bracktes with test data, 28 entries', () => {

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 4, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 4, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 4, createdAt: 300 },
      { player_id: 'Don', test_brkts: 4, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 4, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 4, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 4, createdAt: 700 },
    ];
    testBracketList.calcTotalBrkts(playerData);
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues,
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,
    };
    const mockBrktGridProps = {
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => {
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(4);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 4) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }
      }
    })
    it('should render brackets Full: 1-10:1; One Bye: 1-10:0', async () => {
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
    })
    it('should render to fill cells (1 per row)', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      let divs = screen.getAllByRole('gridcell', { name: '52' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();
      divs = screen.getAllByRole('gridcell', { name: '42' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => {
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 4: 4 for One Bye
      expect(gridCells0).toHaveLength(4);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 1 for Full
      expect(gridCells1).toHaveLength(4);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 6 for One Bye
      expect(gridCells7).toHaveLength(6);

      const gridCells8 = screen.getAllByRole('gridcell', { name: '8' });
      // 6 for Full
      expect(gridCells8).toHaveLength(6);
    })
  })

  describe('edge case 7: render 7Px random B, min 5B bracktes with test data', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 10, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 8, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 6, createdAt: 300 },
      { player_id: 'Don', test_brkts: 7, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 6, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 5, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 6, createdAt: 700 },
    ];      
    testBracketList.calcTotalBrkts(playerData);            
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues, 
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,        
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => { 
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(5);  
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 5) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }        
      }
    })
    it('should render brackets Full: 1-5:1, 6-10:8; One Bye: 1-5:0, 6-10:7', async () => { 
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
    })
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);      
      let divs = screen.getAllByRole('gridcell', { name: '45' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();        
      divs = screen.getAllByRole('gridcell', { name: '35' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 5 for One Bye
      expect(gridCells0).toHaveLength(5);

      const gridCells1 = screen.getAllByRole('gridcell', { name: '1' });
      // 5 for Full
      expect(gridCells1).toHaveLength(5);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 5 for One Bye
      expect(gridCells7).toHaveLength(5);

      const gridCells8 = screen.getAllByRole('gridcell', { name: '8' });
      // 5 for Full
      expect(gridCells8).toHaveLength(5);
    })
  })

  describe('edge case 8: render 6Px2B, 4Px1B bracktes with test data, 16 entries', () => { 

    const testBracketList = new BracketList('test', 2, 3);
    // num brackets name = id + "_brkts" = 'test_name'
    const playerData = [
      { player_id: 'Al', test_brkts: 2, createdAt: 100 },
      { player_id: 'Bob', test_brkts: 2, createdAt: 200 },
      { player_id: 'Chad', test_brkts: 2, createdAt: 300 },
      { player_id: 'Don', test_brkts: 2, createdAt: 400 },
      { player_id: 'Ed', test_brkts: 2, createdAt: 500 },
      { player_id: 'Fred', test_brkts: 2, createdAt: 600 },
      { player_id: 'Greg', test_brkts: 1, createdAt: 700 },
      { player_id: 'Hal', test_brkts: 1, createdAt: 800 },
      { player_id: 'Ian', test_brkts: 1, createdAt: 900 },
      { player_id: 'Jim', test_brkts: 1, createdAt: 1000 },
    ];      
    testBracketList.calcTotalBrkts(playerData);            
    const mockBrktGridData: BGDataType = {
      // Initialize the properties of BGDataType here
      forFullValues: testBracketList.brktCounts.forFullValues, 
      forOneByeValues: testBracketList.brktCounts.forOneByeValues,        
    };    
    const mockBrktGridProps = {  
      brktGridData: mockBrktGridData
    };
    it('should calculate total brackets correctly before rendering', () => { 
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(0);  
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 2) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }        
      }
    })
    it('should render brackets Full: 1-2:1, 3-10:8; One Bye: 1-2:0, 3-10:7', async () => { 
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
    })
    it('should render to fill cells (1 per row)', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);      
      let divs = screen.getAllByRole('gridcell', { name: '64' });
      const toFillForFull = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForFull).toBeInTheDocument();        
      divs = screen.getAllByRole('gridcell', { name: '56' });
      const toFillForOneBye = divs.find(div => div.getAttribute('aria-colindex') === '12');
      expect(toFillForOneBye).toBeInTheDocument();
    })
    it('should render grid cells', () => { 
      render(<BracketGrid {...mockBrktGridProps} />);
      const gridCells0 = screen.getAllByRole('gridcell', { name: '0' });
      // 4: 2 for One Bye, 2 for Full
      expect(gridCells0).toHaveLength(4);

      const gridCells7 = screen.getAllByRole('gridcell', { name: '7' });
      // 8 for One Bye
      expect(gridCells7).toHaveLength(8);

      const gridCells8 = screen.getAllByRole('gridcell', { name: '8' });
      // 8 for Full
      expect(gridCells8).toHaveLength(8);
    })
  })

})