import { applyAverageCellColor, createBrktEntryColumns, createDivEntryColumns, createElimEntryColumns, createPlayerEntryColumns, createPotEntryColumns, feeColWidth, getElimFee, getOnlyIntegerOrNull, getPotFee, isDivEntryFeeColumnName, isValidAverage, isValidFee } from "@/app/dataEntry/playersForm/createColumns";
import { initBrkt, initDiv, initElim, initPot } from "@/lib/db/initVals";
import { brktType, divType, elimType, potType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";
import { GridApi, GridCellParams, GridColDef, GridRowModel } from "@mui/x-data-grid";
import '@testing-library/jest-dom/extend-expect';
import { MutableRefObject } from "react";

describe('createColumns functions tests', () => {
  
  interface GridValueFormatterParams {
    value: never;
    row: GridRowModel;
    colDef: GridColDef;
    api: MutableRefObject<GridApi>;
  }

  describe('getOnlyIntegerOrNull', () => {
    it('should return integer part when given positive decimal number', () => {
      const input = 123.456;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBe(123);
    });
    it('should return null when input is NaN', () => {
      const input = NaN;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBeNull();
    });
    it('should return null when input is null', () => {
      const input = null;
      const result = getOnlyIntegerOrNull(input as any);
      expect(result).toBeNull();
    });
    it('should return null when input is undefined', () => {
      const input = undefined;
      const result = getOnlyIntegerOrNull(input as any);
      expect(result).toBeNull();
    });
    it('should return null when input is ""', () => {
      const input = '';
      const result = getOnlyIntegerOrNull(input as any);
      expect(result).toBeNull();
    });
    it('should return integer part when given negative decimal number', () => {
      const input = -123.456;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBe(-123);
    });
    it('should return the same integer value when given an integer input', () => {
      const input = 42;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBe(42);
    });    
    it('should return zero when input is zero', () => {
      const input = 0;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBe(0);
    });
    it('should return integer part when given a number with floating point precision issues', () => {
      const input = 0.1 + 0.2;
      const result = getOnlyIntegerOrNull(input);
      expect(result).toBe(0);
    });
    it('should return null when input is undefined', () => {
      const input = undefined;
      const result = getOnlyIntegerOrNull(input as any);
      expect(result).toBeNull();
    });
    it('should return integer part when given a string number', () => {
      const input = "456.789";
      const result = getOnlyIntegerOrNull(Number(input));
      expect(result).toBe(456);
    });
  });

  describe('isValidAverage', () => {

    it('should return true when average is between 0 and maxAverage', () => {
      const validAverage = 150;
      const result = isValidAverage(validAverage);
      expect(result).toBe(true);
    });
    it('should return false when average is negative', () => {
      const negativeAverage = -1;
      const result = isValidAverage(negativeAverage);
      expect(result).toBe(false);
    });
    it('should return true when average is zero', () => {
      const validAverage = 0;
      const result = isValidAverage(validAverage);
      expect(result).toBe(true);
    });
    it('should return true when average is equal to maxAverage', () => {
      const maxAvg = maxAverage;
      const result = isValidAverage(maxAvg);
      expect(result).toBe(true);
    });
    it('should return true for decimal values within range', () => {
      const validDecimalAverage = 150.5;
      const result = isValidAverage(validDecimalAverage);
      expect(result).toBe(true);
    });
    it('should return false when average exceeds maxAverage', () => {
      const invalidAverage = maxAverage + 1;
      const result = isValidAverage(invalidAverage);
      expect(result).toBe(false);
    });
    it('should return false when average is not a number', () => {
      const result = isValidAverage('test' as any);
      expect(result).toBe(false);
    })
    it('should return false when input is NaN', () => {
      const invalidAverage = NaN;
      const result = isValidAverage(invalidAverage);
      expect(result).toBe(false);
    });
    it('should return false when input is undefined', () => {
      const result = isValidAverage(undefined as any);
      expect(result).toBe(false);
    });
    it('should return true when input is null', () => {
      const result = isValidAverage(null as any);
      expect(result).toBe(false);
    });
  });

  describe('applyAverageCellColor', () => {

    it('should return empty string when value is a valid average', () => {
      const validAverage = 180;
      const result = applyAverageCellColor(validAverage);
      expect(result).toBe('');
    });
    it('should return cellError when value is negative', () => {
      const negativeValue = -10;
      const result = applyAverageCellColor(negativeValue);
      expect(result).toBe('cellError');
    });
    it('should return empty string when value is 0', () => {
      const value = 0;
      const result = applyAverageCellColor(value);
      expect(result).toBe('');
    });
    it('should return empty string when value is within valid average range', () => {
      const validAverage = 50; // Assuming 50 is within the valid range
      const result = applyAverageCellColor(validAverage);
      expect(result).toBe('');
    });
    it('should return "cellError" when value exceeds maxAverage', () => {
      const exceedingValue = maxAverage + 1;
      const result = applyAverageCellColor(exceedingValue);
      expect(result).toBe('cellError');
    });
    it('should return empty string when value is null', () => {
      const nullValue = null;
      const result = applyAverageCellColor(nullValue as any);
      expect(result).toBe('');
    });
    it('should return empty string when value is undefined', () => {
      const undefinedValue = undefined;
      const result = applyAverageCellColor(undefinedValue as any);
      expect(result).toBe('');
    });
    it('should return \'\' when value is NaN', () => {
      const nanValue = NaN;
      const result = applyAverageCellColor(nanValue);
      expect(result).toBe('');
    });
    it('should return empty string when value is a valid decimal average', () => {
      const validDecimalAverage = 150.5;
      const result = applyAverageCellColor(validDecimalAverage);
      expect(result).toBe('');
    });
  });

  describe('createPlayerEntryColumns', () => { 

    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", hdcp_per: 0.9, hdcp_from: 230, int_hdcp: true },
      { ...initDiv, id: "div2", hdcp_per: 0.9, hdcp_from: 230, int_hdcp: false }
    ];
    const maxLane = 40;
    const minLane = 1;

    it('should return all required column fields with correct properties', () => {
      const playerDivs: divType[] = [];

      const columns = createPlayerEntryColumns(playerDivs, maxLane, minLane);

      const requiredFields = ['first_name', 'last_name', 'average', 'lane', 'position', 'lanePos'];
      const columnFields = columns.map(col => col.field);

      expect(columnFields).toEqual(expect.arrayContaining(requiredFields));
      expect(columns.length).toBe(6);

      columns.forEach(col => {
        expect(col.headerClassName).toBe('playersHeader');
        expect(col.description).toBeTruthy();        
      });

      expect(columns[0].editable).toBe(true);
      expect(columns[1].editable).toBe(true);
      expect(columns[2].editable).toBe(true);
      expect(columns[3].editable).toBe(true);
      expect(columns[4].editable).toBe(true);
      expect(columns[5].editable).toBe(undefined); // lanePos is not editable

      expect(columns[0].width).toBe(120); // first name
      expect(columns[1].width).toBe(120); // last name
      expect(columns[2].width).toBe(80);  // average
      expect(columns[3].width).toBe(70);  // lane
      expect(columns[4].width).toBe(80);  // position
      expect(columns[5].width).toBe(80);  // lanePos

      expect(columns[2].type).toBe('number'); // average
      expect(columns[3].type).toBe('number'); // lane
    });
    it('should set sanitized first name', () => { 
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setFirstName = columns.find(col => col.field === 'first_name')?.valueSetter;
      const col = columns.find(col => col.field === 'first_name');
      expect(setFirstName).toBeDefined();
      if (!setFirstName) return;        
      const row = { first_name: '  John  ' };
      const updatedRow = setFirstName(row.first_name, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.first_name).toBe('John');

      const row2 = { first_name: '<script>alert("XSS");</script>' };
      const updatedRow2 = setFirstName(row2.first_name, row, col as any, null as any);
      expect(updatedRow2).toBeDefined();      
      expect(updatedRow2.first_name).toBe('alertXSS');
    })
    it('should set sanitized last name', () => { 
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setLastName = columns.find(col => col.field === 'last_name')?.valueSetter;
      const col = columns.find(col => col.field === 'last_name');
      expect(setLastName).toBeDefined();
      if (!setLastName) return;        
      const row = { last_name: '  Doe ***  ' };
      const updatedRow = setLastName(row.last_name, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.last_name).toBe('Doe');

      const row2 = { last_name: '<script>alert("XSS");</script>' };
      const updatedRow2 = setLastName(row2.last_name, row, col as any, null as any);
      expect(updatedRow2).toBeDefined();      
      expect(updatedRow2.last_name).toBe('alertXSS');
    })
    it('should calculate handicap correctly based on division settings and average value', () => {
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setHdcps = columns.find(col => col.field === 'average')?.valueSetter;
      const col = columns.find(col => col.field === 'average');
      expect(setHdcps).toBeDefined();
      if (!setHdcps) return;        

      const row = { average: 196 };
      const updatedRow = setHdcps(row.average, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.average).toBe(196);
      expect(updatedRow['div1_hdcp']).toBe(30);   // trunc((230 - 196) * 0.9) 30
      expect(updatedRow['div2_hdcp']).toBe(30.6); // (230 - 196) * 0.9 = 30.6
    });
    it('should return "" if lane number within min and max range, else returm "cellError', () => {
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);      
      if (!columns) return;         
      const applyLaneCellColor = columns.find(col => col.field === 'lane')?.cellClassName;
      expect(applyLaneCellColor).toBeDefined();
      const cellParams: GridCellParams = {
        id: 'lane',
        field: 'lane',
        value: 1,
        row: {}, // mock row object
        rowNode: null as any, // mock row node object
        colDef: null as any, // mock column definition object
        cellMode: 'view', // mock cell mode
        api: null as any, // mock grid API object
        isEditable: true, // mock editable flag
        hasFocus: false, // add this property
        tabIndex: -1, // add this property
      };            
      if (typeof applyLaneCellColor === 'function') {
        expect(applyLaneCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyLaneCellColor(cellParams)).toBe('cellError');
        cellParams.value = 40;
        expect(applyLaneCellColor(cellParams)).toBe('');
        cellParams.value = 41;
        expect(applyLaneCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyLaneCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyLaneCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyLaneCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyLaneCellColor(cellParams)).toBe('cellError');
        cellParams.value = 'abc';
        expect(applyLaneCellColor(cellParams)).toBe('cellError');
      } else {
        // Handle the case where applyLaneCellColor is not a function
        expect(applyLaneCellColor).toBe('');
      }            
    });
    it('change lane, should set lanePos correctly based on lane and position values', () => {
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setLaneAndLanePos = columns.find(col => col.field === 'lane')?.valueSetter;
      const col = columns.find(col => col.field === 'lane');
      expect(setLaneAndLanePos).toBeDefined();
      if (!setLaneAndLanePos) return;        

      const row = { lane: 1, position: 'A', lanePos: '' };
      let updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(1);
      expect(updatedRow.lanePos).toBe('1-A');      
      row.lane = -1
      updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(-1);
      expect(updatedRow.lanePos).toBe('');      
      row.lane = 41
      updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(41);
      expect(updatedRow.lanePos).toBe('');      
      row.lane = 1
      row.position = null as any
      updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(1);
      expect(updatedRow.lanePos).toBe('');      
      row.lane = 2
      row.position = ''
      updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(2);
      expect(updatedRow.lanePos).toBe('');      
      row.lane = 3
      row.position = 'B'
      updatedRow = setLaneAndLanePos(row.lane, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.lane).toBe(3);
      expect(updatedRow.lanePos).toBe('3-B');      
    });
    it('change position, should set lanePos correctly based on lane and position values', () => {
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setPositionAndLanePos = columns.find(col => col.field === 'position')?.valueSetter;
      const col = columns.find(col => col.field === 'position');
      expect(setPositionAndLanePos).toBeDefined();
      if (!setPositionAndLanePos) return;        

      const row = { lane: 1, position: 'A', lanePos: '' };
      let updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.position).toBe('A');
      expect(updatedRow.lanePos).toBe('1-A');      
      row.position = ''
      updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined(); 
      expect(updatedRow.position).toBe(null);
      expect(updatedRow.lanePos).toBe('');      
      row.position = null as any
      updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined();  
      expect(updatedRow.position).toBe(null);
      expect(updatedRow.lanePos).toBe('');      
      row.lane = null as any
      row.position = 'A'
      updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.position).toBe('A');
      expect(updatedRow.lanePos).toBe('');      
      row.lane = -2
      row.position = 'A'
      updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.position).toBe('A');
      expect(updatedRow.lanePos).toBe('');      
      row.lane = 3
      row.position = 'B'
      updatedRow = setPositionAndLanePos(row.position, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.position).toBe('B');
      expect(updatedRow.lanePos).toBe('3-B');      
    });

  })

  describe('createDivEntryColumns', () => { 
    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", div_name:'Scratch', hdcp_per: 0.9, hdcp_from: 230, int_hdcp: true },
      { ...initDiv, id: "div2", div_name:'Handicap', hdcp_per: 0.9, hdcp_from: 230, int_hdcp: false }
    ];
    const cellParams: GridCellParams = {
      id: 'div1_fee',
      field: 'div1_fee',
      value: 80,
      row: {}, // mock row object
      rowNode: null as any, // mock row node object
      colDef: null as any, // mock column definition object
      cellMode: 'view', // mock cell mode
      api: null as any, // mock grid API object
      isEditable: true, // mock editable flag
      hasFocus: false, // add this property
      tabIndex: -1, // add this property
    };

    afterEach(() => {
      cellParams.value = 80;
    })

    it('should create fee and HDCP columns for each division', () => {
      const columns = createDivEntryColumns(mockDivs);

      expect(columns).toHaveLength(4); // 2 cols per division
      expect(columns[0].field).toBe('div1_fee');
      expect(columns[0].headerName).toBe('Scratch');
      expect(columns[0].description).toBe('Scratch')
      expect(columns[0].headerClassName).toBe('divsHeader');
      expect(columns[0].type).toBe('number');
      expect(columns[0].editable).toBe(true);
      expect(columns[0].width).toBe(feeColWidth);
      expect(columns[0].align).toBe('right');
      expect(columns[0].headerAlign).toBe('right');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe('div1_hdcp');
      expect(columns[1].headerName).toBe('HDCP');
      expect(columns[1].description).toBe('HDCP')
      expect(columns[1].headerClassName).toBe('divsHeader');
      expect(columns[1].type).toBe('number');
      expect(columns[1].editable).toBe(undefined); // hdcp is not editable
      expect(columns[1].width).toBe(80);
      expect(columns[1].align).toBe('center');
      expect(columns[1].headerAlign).toBe('center');
      expect(columns[1].disableExport).toBe(true);

      expect(columns[2].field).toBe('div2_fee');
      expect(columns[2].headerName).toBe('Handicap');
      expect(columns[2].description).toBe('Handicap')
      expect(columns[2].headerClassName).toBe('divsHeader');
      expect(columns[2].type).toBe('number');
      expect(columns[2].editable).toBe(true);
      expect(columns[2].width).toBe(feeColWidth);
      expect(columns[2].align).toBe('right');
      expect(columns[2].headerAlign).toBe('right');
      expect(columns[2].renderEditCell).toBeDefined();
      expect(columns[2].renderEditCell).toBeInstanceOf(Function);

      expect(columns[3].field).toBe('div2_hdcp');
      expect(columns[3].headerName).toBe('HDCP');
      expect(columns[3].description).toBe('HDCP')
      expect(columns[3].headerClassName).toBe('divsHeader');
      expect(columns[3].type).toBe('number');
      expect(columns[3].editable).toBe(undefined); // hdcp is not editable
      expect(columns[3].width).toBe(80);
      expect(columns[3].align).toBe('center');
      expect(columns[3].headerAlign).toBe('center');
      expect(columns[3].disableExport).toBe(false);

    });
    it('should apply error class for invalid fee values', () => {      
      const columns = createDivEntryColumns(mockDivs);
      if (!columns) return;         
      const applyDivFeeCellColor = columns?.[0].cellClassName;
      expect(applyDivFeeCellColor).toBeDefined();
      if (typeof applyDivFeeCellColor === 'function') {
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = maxMoney + 1;
        expect(applyDivFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = -1;
        expect(applyDivFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = NaN;
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyDivFeeCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyDivFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = 'abc';
        expect(applyDivFeeCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyDivFeeCellColor).toBeUndefined();
      }
    });
    it('should format fee column values as currency when valid numbers are provided', () => {  
      const columns = createDivEntryColumns(mockDivs);      
      if (!columns) return;         
      const formattedValue = columns?.[0].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 80 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      if (typeof formattedValue === 'function') {
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$80.00');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else { 
        expect(formattedValue).toBeUndefined();
      }
    });    
    it('should format HDCP values as integers when int_hdcp is true and as decimals when false', () => {
      const columns = createDivEntryColumns(mockDivs);

      const formatCellParams: GridValueFormatterParams = {
        value: 10.6 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      const hdcpColumnInt = columns.find(col => col.field === 'div1_hdcp');
      expect(hdcpColumnInt).toBeDefined();
      const formatHdcpInt = hdcpColumnInt!.valueFormatter;
      formatCellParams.colDef = hdcpColumnInt as GridColDef;
      expect(formatHdcpInt!(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api)).toBe('10');

      const hdcpColumnDec = columns.find(col => col.field === 'div2_hdcp');
      expect(hdcpColumnDec).toBeDefined();
      const formatHdcpDec = hdcpColumnDec!.valueFormatter;
      formatCellParams.colDef = hdcpColumnDec as GridColDef;
      expect(formatHdcpInt!(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api)).toBe('10.6');
    });    
  })

  describe('isDivEntryFeeColumnName', () => {
    it('should return true when column name starts with den and ends with fee suffix', () => {
      const colName = 'div1_fee';  
      const result = isDivEntryFeeColumnName(colName);  
      expect(result).toBe(true);
    });
    it('should return false when column name is empty string', () => {
      const colName = '';  
      const result = isDivEntryFeeColumnName(colName);  
      expect(result).toBe(false);
    });
    it('should return false when column name does not start with "den"', () => {
      const colName = 'abc1_fee';
      const result = isDivEntryFeeColumnName(colName);
      expect(result).toBe(false);
    });
    it('should return false when column name does not end with fee suffix', () => {
      const colName = 'div1_notFee';
      const result = isDivEntryFeeColumnName(colName);
      expect(result).toBe(false);
    });
    it('should return true when column name is exactly "den" followed by the suffix', () => {
      const feeColNameEnd = '_fee';
      const colName = 'div' + feeColNameEnd;
      const result = isDivEntryFeeColumnName(colName);
      expect(result).toBe(true);
    });
    it('should return false when column name is null or undefined', () => {
      let colName = null;
      let result = isDivEntryFeeColumnName(colName as any);
      expect(result).toBe(false);  
      colName = undefined;
      result = isDivEntryFeeColumnName(colName as any);
      expect(result).toBe(false);
    });    
  })

  describe('getPotFee', () => {

    it('should return correct fee when valid pot ID is provided', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot,id: 'pot2', fee: '50' }
      ];  
      const result = getPotFee(mockPots, 'pot1');  
      expect(result).toBe(25);
    });
    it('should return 0 when pots array is empty', () => {
      const emptyPots: potType[] = [];
      const result = getPotFee(emptyPots, 'pot1');
      expect(result).toBe(0);
    });
    it('should return numeric fee when pot with given ID exists', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '30' },
        { ...initPot, id: 'pot2', fee: '45' }
      ];
      const result = getPotFee(mockPots, 'pot2');
      expect(result).toBe(45);
    });
    it('should return correct fee when multiple pots are provided and valid pot ID is given', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot, id: 'pot2', fee: '50' },
        { ...initPot, id: 'pot3', fee: '75' }
      ];
      const result = getPotFee(mockPots, 'pot2');
      expect(result).toBe(50);
    });
    it('should return correct numeric fee when valid pot ID is provided', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot, id: 'pot2', fee: '50' }
      ];
      const result = getPotFee(mockPots, 'pot1');
      expect(result).toBe(25);
    });
    it('should return 0 when pots array is null', () => {
      const result = getPotFee(null as any, 'pot1');
      expect(result).toBe(0);
    });
    it('should return 0 when potId is an empty string', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot, id: 'pot2', fee: '50' }
      ];
      const result = getPotFee(mockPots, '');
      expect(result).toBe(0);
    });
    it('should return 0 when potId is null', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot, id: 'pot2', fee: '50' }
      ];
      const result = getPotFee(mockPots, null as any);
      expect(result).toBe(0);
    });
    it('should return 0 when pot ID is not found in the list', () => {
      const mockPots: potType[] = [
        { ...initPot, id: 'pot1', fee: '25' },
        { ...initPot, id: 'pot2', fee: '50' }
      ];
      const result = getPotFee(mockPots, 'pot3');
      expect(result).toBe(0);
    });
  });

  describe('isValidFee', () => {

    it('should return true when value equals fee', () => {
      const value = 100;
      const fee = 100;
      const result = isValidFee(value, fee);
      expect(result).toBe(true);
    });
    it('should return false when value is NaN', () => {
      const value = NaN;
      const fee = 100;
      const result = isValidFee(value, fee);
      expect(result).toBe(false);
    });
    it('should return true when value equals 0', () => {
      const value = 0;
      const fee = 100;
      const result = isValidFee(value, fee);
      expect(result).toBe(true);
    });
    it('should return true when value is undefined', () => {
      const value = undefined;
      const fee = 100;
      const result = isValidFee(value as any, fee);
      expect(result).toBe(true);
    });
    it('should return true when value is null', () => {
      const value = null;
      const fee = 100;
      const result = isValidFee(value as any, fee);
      expect(result).toBe(true);
    });
    it('shuold return true when value is NaN', () => { 
      const value = NaN;
      const fee = 100;
      const result = isValidFee(value, fee);
      expect(result).toBe(false);
    })
    it('should return true when value matches fee exactly', () => {
      const value = 50;
      const fee = 50;
      const result = isValidFee(value, fee);
      expect(result).toBe(true);
    });
    it('should return false when value is slightly different from fee', () => {
      const value = 100.01;
      const fee = 100;
      const result = isValidFee(value, fee);
      expect(result).toBe(false);
    });
  });

  describe('createPotEntryColumns', () => { 
    const mockPots: potType[] = [
      { ...initPot, id: "pot1", pot_type: 'Game', fee: '20'},
      { ...initPot, id: "pot2", pot_type: 'Last Game', fee: '10' }
    ];
    const cellParams: GridCellParams = {
      id: 'pot1_fee',
      field: 'pot1_fee',
      value: 20,
      row: {}, // mock row object
      rowNode: null as any, // mock row node object
      colDef: null as any, // mock column definition object
      cellMode: 'view', // mock cell mode
      api: null as any, // mock grid API object
      isEditable: true, // mock editable flag
      hasFocus: false, // add this property
      tabIndex: -1, // add this property
    };

    afterEach(() => {
      cellParams.value = 20;
    })

    it('should create fee column for each pot', () => {
      const columns = createPotEntryColumns(mockPots);

      expect(columns).toHaveLength(2); // 1 col per pot
      expect(columns[0].field).toBe('pot1_fee');
      expect(columns[0].headerName).toBe('Game');
      expect(columns[0].description).toBe('Game');
      expect(columns[0].headerClassName).toBe('potsHeader');
      expect(columns[0].width).toBe(feeColWidth);
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe('right');
      expect(columns[0].headerAlign).toBe('center');
      expect(columns[0].type).toBe('number');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe('pot2_fee');
      expect(columns[1].headerName).toBe('Last Game');
      expect(columns[1].description).toBe('Last Game');
      expect(columns[1].headerClassName).toBe('potsHeader');
      expect(columns[1].width).toBe(feeColWidth);
      expect(columns[1].editable).toBe(true);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('center');
      expect(columns[1].type).toBe('number');
      expect(columns[1].renderEditCell).toBeDefined();
      expect(columns[1].renderEditCell).toBeInstanceOf(Function);

    });
    it('should apply error class for invalid Game fee values', () => {      
      const columns = createPotEntryColumns(mockPots);
      if (!columns) return;         
      const applyPotOrElimFeeCellColor = columns?.[0].cellClassName;
      expect(applyPotOrElimFeeCellColor).toBeDefined();
      if (typeof applyPotOrElimFeeCellColor === 'function') {
        cellParams.value = Number(mockPots[0].fee);
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = Number(mockPots[0].fee) + 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = Number(mockPots[0].fee) - 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyPotOrElimFeeCellColor).toBeUndefined();
      }
    });
    it('should apply error class for invalid Last Game fee values', () => {      
      const columns = createPotEntryColumns(mockPots);
      if (!columns) return;         
      const applyPotOrElimFeeCellColor = columns?.[1].cellClassName;
      expect(applyPotOrElimFeeCellColor).toBeDefined();
      if (typeof applyPotOrElimFeeCellColor === 'function') {
        cellParams.value = 10;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = Number(mockPots[1].fee) + 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = Number(mockPots[1].fee) - 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyPotOrElimFeeCellColor).toBeUndefined();
      }
    });
    it('should format Game fee column values as currency when valid numbers are provided', () => {  
      const columns = createPotEntryColumns(mockPots);      
      if (!columns) return;         
      const formattedValue = columns?.[0].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 20 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      if (typeof formattedValue === 'function') {
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$20.00');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else { 
        expect(formattedValue).toBeUndefined();
      }
    });    
    it('should format Last Game fee column values as currency when valid numbers are provided', () => {  
      const columns = createPotEntryColumns(mockPots);      
      if (!columns) return;         
      const formattedValue = columns?.[1].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 10 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      if (typeof formattedValue === 'function') {
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$10.00');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else { 
        expect(formattedValue).toBeUndefined();
      }
    });    
  })

  describe('createBrktEntryColumns', () => {
    const timeStamp = new Date().getTime();
    const mockBrkts: brktType[] = [
      { ...initBrkt, id: "brkt1", div_id: "div1", start: 1, games: 3, fee: '5' },
      { ...initBrkt, id: "brkt2", div_id: "div1", start: 4, games: 3, fee: '5' }
    ];
    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", div_name:'Scratch', hdcp_per: 0, hdcp_from: 230, int_hdcp: true },      
    ];

    const cellParams: GridCellParams = {
      id: 'brkt1_fee',
      field: 'brkt1_fee',
      value: 5,
      row: {}, // mock row object
      rowNode: null as any, // mock row node object
      colDef: null as any, // mock column definition object
      cellMode: 'view', // mock cell mode
      api: null as any, // mock grid API object
      isEditable: true, // mock editable flag
      hasFocus: false, // add this property
      tabIndex: -1, // add this property
    };
    afterEach(() => {
      cellParams.id = 'brkt1_fee';
      cellParams.field = 'brkt1_fee';
      cellParams.value = 20;
    })

    it('should create number of brackets and fee columns for each bracket', () => {
      const columns = createBrktEntryColumns(mockBrkts, mockDivs);

      expect(columns).toHaveLength(4); // 2 cols per division
      expect(columns[0].field).toBe('brkt1_name');
      expect(columns[0].headerName).toBe('Scratch: 1-3');
      expect(columns[0].description).toBe('Scratch: 1-3');
      expect(columns[0].headerClassName).toBe('brktsHeader');
      expect(columns[0].width).toBe(110);
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe('center');
      expect(columns[0].headerAlign).toBe('center');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe('brkt1_fee');
      expect(columns[1].headerName).toBe('Fee');
      expect(columns[1].description).toBe('Fee');
      expect(columns[1].headerClassName).toBe('brktsHeader');
      expect(columns[1].width).toBe(feeColWidth);
      expect(columns[1].editable).toBe(undefined);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('right');

      expect(columns[2].field).toBe('brkt2_name');
      expect(columns[2].headerName).toBe('Scratch: 4-6');
      expect(columns[2].description).toBe('Scratch: 4-6');
      expect(columns[2].headerClassName).toBe('brktsHeader');
      expect(columns[2].width).toBe(110);
      expect(columns[2].editable).toBe(true);
      expect(columns[2].align).toBe('center');
      expect(columns[2].headerAlign).toBe('center');
      expect(columns[2].renderEditCell).toBeDefined();
      expect(columns[2].renderEditCell).toBeInstanceOf(Function);

      expect(columns[3].field).toBe('brkt2_fee');
      expect(columns[3].headerName).toBe('Fee');
      expect(columns[3].description).toBe('Fee');
      expect(columns[3].headerClassName).toBe('brktsHeader');
      expect(columns[3].width).toBe(feeColWidth);
      expect(columns[3].editable).toBe(undefined);
      expect(columns[3].align).toBe('right');
      expect(columns[3].headerAlign).toBe('right');
    });
    it('should apply error class for invalid Scratch 1-3 values', () => {      
      const columns = createBrktEntryColumns(mockBrkts, mockDivs);
      if (!columns) return;         
      const applyNumBrktsCellColor = columns?.[0].cellClassName;
      expect(applyNumBrktsCellColor).toBeDefined();
      if (typeof applyNumBrktsCellColor === 'function') {
        cellParams.value = 8
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = maxBrackets + 1;
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
        cellParams.value = -1;
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyNumBrktsCellColor).toBeUndefined();
      }
    });
    it('should apply error class for invalid Scratch 4-6 values', () => {      
      const columns = createBrktEntryColumns(mockBrkts, mockDivs);
      if (!columns) return;         
      const applyNumBrktsCellColor = columns?.[2].cellClassName;
      expect(applyNumBrktsCellColor).toBeDefined();
      if (typeof applyNumBrktsCellColor === 'function') {
        cellParams.id = 'brkt2_fee';
        cellParams.field = 'brkt2_fee';  
        cellParams.value = 8
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = maxBrackets + 1;
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
        cellParams.value = -1;
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyNumBrktsCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyNumBrktsCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyNumBrktsCellColor).toBeUndefined();
      }
    });
    it('should calculate brkt fee correctly based on number of brakets and fee', () => {
      const columns = createBrktEntryColumns(mockBrkts, mockDivs);
      expect(columns).toBeDefined();
      if (!columns) return;         
      const setBrktsFee = columns[0]?.valueSetter;
      const col = columns.find(col => col.field === 'brkt1_name');
      expect(setBrktsFee).toBeDefined();
      if (!setBrktsFee) return;        

      const row = { brkt1_name: 8 };
      let updatedRow = setBrktsFee(row.brkt1_name, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.brkt1_name).toBe(8);
      expect(updatedRow['brkt1_fee']).toBe(40);   // brkt_fee * num_brkts = 5 * 8 = 40
      row.brkt1_name = null as any;
      updatedRow = setBrktsFee(row.brkt1_name, row, col as any, null as any);
      expect(updatedRow).toBeDefined();      
      expect(updatedRow.brkt1_name).toBe(0);
      expect(updatedRow['brkt1_fee']).toBe(0);

      const setBrktsFee2 = columns[2]?.valueSetter;
      const col2 = columns.find(col => col.field === 'brkt2_name');
      expect(setBrktsFee2).toBeDefined();
      if (!setBrktsFee2) return;        
      const row2 = { brkt2_name: 6 };
      const updatedRow2 = setBrktsFee(row2.brkt2_name, row2, col2 as any, null as any);
      expect(updatedRow2).toBeDefined();      
      expect(updatedRow2.brkt2_name).toBe(6);
      expect(updatedRow2['brkt2_fee']).toBe(30);   // brkt_fee * num_brkts = 5 * 6 = 30
    });
  })

  describe('getElimFee', () => {

    const mockElims: elimType[] = [
      { ...initElim, id: 'elim1', fee: '25' },
      { ...initElim, id: 'elim2', fee: '50' }
    ];

    it('should return elim fee when valid elimId matches an elim', () => {
      const result = getElimFee(mockElims, 'elim2');
      expect(result).toBe(50);
    });
    it('should return 0 when elims array is empty', () => {
      const noElims: elimType[] = [];
      const result = getElimFee(noElims, 'elim1');
      expect(result).toBe(0);
    });
    it('should return 0 when elimId does not match any elim', () => {
      const result = getElimFee(mockElims, 'elim3');
      expect(result).toBe(0);
    });
    it('should return elim fee when valid elimId matches an elim', () => {
      const result = getElimFee(mockElims, 'elim2');
      expect(result).toBe(50);
    });
    it('should return 0 when elimId does not match any elim', () => {
      const result = getElimFee(mockElims, 'elim3');
      expect(result).toBe(0);
    });
    it('should return 0 when elimId is an empty string', () => {
      const result = getElimFee(mockElims, '');
      expect(result).toBe(0);
    });
    it('should return 0 when elims array is null', () => {
      const noElims = null;
      const result = getElimFee(noElims as any, 'elim1');
      expect(result).toBe(0);
    });
    it('should return 0 when elimId is null', () => {
      const result = getElimFee(mockElims, null as any);
      expect(result).toBe(0);
    });
    it('should return 0 when no elimId matches any elim in the array', () => {
      const result = getElimFee(mockElims, 'elim3');
      expect(result).toBe(0);
    });
  });

  describe('createElimEntryColumns', () => { 
    const mockElims: elimType[] = [
      { ...initElim, id: "elim1", div_id: "div1", start: 1, games: 3, fee: '5' },
      { ...initElim, id: "elim2", div_id: "div1", start: 4, games: 3, fee: '5' }
    ];
    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", div_name:'Scratch', hdcp_per: 0, hdcp_from: 230, int_hdcp: true },      
    ];

    const cellParams: GridCellParams = {
      id: 'elim1_fee',
      field: 'elim1_fee',
      value: 5,
      row: {}, // mock row object
      rowNode: null as any, // mock row node object
      colDef: null as any, // mock column definition object
      cellMode: 'view', // mock cell mode
      api: null as any, // mock grid API object
      isEditable: true, // mock editable flag
      hasFocus: false, // add this property
      tabIndex: -1, // add this property
    };
    afterEach(() => {
      cellParams.id = 'elim1_fee';
      cellParams.field = 'elim1_fee';
      cellParams.value = 5;
    })
    it('should create fee column for each elim', () => {
      const columns = createElimEntryColumns(mockElims, mockDivs);

      expect(columns).toHaveLength(2); // 1 col per pot
      expect(columns[0].field).toBe('elim1_fee');
      expect(columns[0].headerName).toBe('Scratch: 1-3');
      expect(columns[0].description).toBe('Scratch: 1-3');
      expect(columns[0].headerClassName).toBe('elimsHeader');
      expect(columns[0].width).toBe(feeColWidth);
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe('right');
      expect(columns[0].headerAlign).toBe('center');
      expect(columns[0].type).toBe('number');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);
      
      expect(columns[1].field).toBe('elim2_fee');
      expect(columns[1].headerName).toBe('Scratch: 4-6');
      expect(columns[1].description).toBe('Scratch: 4-6');
      expect(columns[1].headerClassName).toBe('elimsHeader');
      expect(columns[1].width).toBe(feeColWidth);
      expect(columns[1].editable).toBe(true);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('center');
      expect(columns[1].type).toBe('number');
      expect(columns[1].renderEditCell).toBeDefined();
      expect(columns[1].renderEditCell).toBeInstanceOf(Function);
    });
    it('should apply error class for invalid Scratch: 1-3 fee values', () => {      
      const columns = createElimEntryColumns(mockElims, mockDivs);
      if (!columns) return;         
      const applyPotOrElimFeeCellColor = columns?.[0].cellClassName;
      expect(applyPotOrElimFeeCellColor).toBeDefined();
      if (typeof applyPotOrElimFeeCellColor === 'function') {
        cellParams.value = Number(mockElims[0].fee);
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = Number(mockElims[0].fee) + 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = Number(mockElims[0].fee) - 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyPotOrElimFeeCellColor).toBeUndefined();
      }
    });
    it('should apply error class for invalid Scratch: 4-6 fee values', () => {      
      const columns = createElimEntryColumns(mockElims, mockDivs);
      if (!columns) return;         
      const applyPotOrElimFeeCellColor = columns?.[1].cellClassName;
      expect(applyPotOrElimFeeCellColor).toBeDefined();
      if (typeof applyPotOrElimFeeCellColor === 'function') {
        cellParams.value = Number(mockElims[1].fee);
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 0;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = Number(mockElims[1].fee) + 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = Number(mockElims[1].fee) - 1;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
        cellParams.value = null;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = undefined;
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = '0';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('');
        cellParams.value = 'abc';
        expect(applyPotOrElimFeeCellColor(cellParams)).toBe('cellError');
      } else {        
        expect(applyPotOrElimFeeCellColor).toBeUndefined();
      }
    });
    it('should format Sctarch: 1-3 fee column values as currency when valid numbers are provided', () => {  
      const columns = createElimEntryColumns(mockElims, mockDivs); 
      if (!columns) return;         
      const formattedValue = columns?.[0].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 5 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      if (typeof formattedValue === 'function') {
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$5.00');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else { 
        expect(formattedValue).toBeUndefined();
      }
    });    
    it('should format Sctarch: 4-6 fee column values as currency when valid numbers are provided', () => {  
      const columns = createElimEntryColumns(mockElims, mockDivs); 
      if (!columns) return;         
      const formattedValue = columns?.[1].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 5 as never,
        row: null as any,
        colDef: null as any,
        api: null as any    
      }

      if (typeof formattedValue === 'function') {
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$5.00');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else { 
        expect(formattedValue).toBeUndefined();
      }
    });    

  })

})