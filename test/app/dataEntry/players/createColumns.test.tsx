import {
  applyAverageCellColor,
  brktsColNameEnd,
  createBrktEntryColumns,
  createDivEntryColumns,
  createElimEntryColumns,
  createPlayerEntryColumns,
  createPotEntryColumns,
  feeColNameEnd,  
  feeTotalColumn,
  formatIntZeroAsBlank,
  getBrktIdFromColName,
  getElimFee,
  getOnlyIntegerOrNull,
  getPosition,
  getPotFee,
  isBrktsColumnName,
  isDivEntryFeeColumnName,
  isElimFeeColumnName,
  isPotFeeColumnName,
  isValidAverage,
  isValidFee,
  valueGetterForMoney,
  valueParserForMoney,  
  exportedForTesting2,  
  feeColWidthNoTouch,
  feeColWidthTouch,
} from "@/app/dataEntry/playersForm/createColumns";
import { initBrkt, initDiv, initElim, initPot } from "@/lib/db/initVals";
import { brktType, divType, elimType, potType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";
import {
  GridApi,
  GridCellParams,
  GridColDef,
  GridRowModel,
} from "@mui/x-data-grid";
import "@testing-library/jest-dom/extend-expect";
import { RefObject } from "react";
import { isTouchDevice } from "../../../../src/lib/mobileDevices/mobileDevices";

const {
  formatFee,
  formatFeeBlankAsZero,
  applyPotOrElimFeeCellColor,
  applyNumBrktsCellColor,
} = exportedForTesting2;

jest.mock("../../../../src/lib/mobileDevices/mobileDevices", () => ({
  isTouchDevice: jest.fn(),
}));

describe("createColumns functions tests", () => {
  interface GridValueFormatterParams {
    value: never;
    row: GridRowModel;
    colDef: GridColDef;
    // api: MutableRefObject<GridApi>;
    api: RefObject<GridApi>;
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
  });

  describe("isValidAverage", () => {
    it("returns false when value is null", () => {
      expect(isValidAverage(null as any)).toBe(false);
    });
    it("returns false when value is NaN", () => {
      expect(isValidAverage(NaN)).toBe(false);
    });
    it("returns true for value 0", () => {
      expect(isValidAverage(0)).toBe(true);
    });
    it('returns true for number with floating point precision issues', () =>
      expect(isValidAverage(100.1 + 0.2)).toBe(true)
    );
    it("returns true for value equal to maxAverage", () => {
      expect(isValidAverage(maxAverage)).toBe(true);
    });
    it("returns true for value within valid range", () => {
      expect(isValidAverage(150)).toBe(true);
    });
    it("returns false for value greater than maxAverage", () => {
      expect(isValidAverage(maxAverage + 1)).toBe(false);
    });
    it("returns false for negative value", () => {
      expect(isValidAverage(-1)).toBe(false);
    });
    it("returns false for undefined", () => {
      expect(isValidAverage(undefined as any)).toBe(false);
    });
    it("returns false for non-numeric types", () => {
      expect(isValidAverage("invalid" as any)).toBe(false);
      expect(isValidAverage("100" as any)).toBe(false);
      expect(isValidAverage({} as any)).toBe(false);
      expect(isValidAverage([] as any)).toBe(false);
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

  describe('getPosition', () => {
    it('should return the correct position (1st char)', () => {
      const position = '1A';
      const result = getPosition(position);
      expect(result).toBe('1');
    });
    it('should return the correct position one char', () => {
      const position = 'A';
      const result = getPosition(position);
      expect(result).toBe('A');
    });
    it('should return the correct position integer', () => {
      const position = 1;
      const result = getPosition(position as any);
      expect(result).toBe('1');
    });
    it('should return "" when passed ""', () => {
      const position = '';
      const result = getPosition(position);
      expect(result).toBe('');
    });
    it('should return "" when passed null', () => {
      const position = null;
      const result = getPosition(position as any);
      expect(result).toBe('');
    });
  })

  describe("formatIntZeroAsBlank", () => {
    it("returns empty string when value is 0", () => {
      expect(formatIntZeroAsBlank(0)).toBe("");
    });
    it("returns empty string when value is falsy (e.g., NaN)", () => {
      expect(formatIntZeroAsBlank(NaN as unknown as number)).toBe("");
    });
    it("returns empty string when value is undefined", () => {
      // @ts-expect-error testing invalid input intentionally
      expect(formatIntZeroAsBlank(undefined)).toBe("");
    });
    it("returns empty string when value is null", () => {
      // @ts-expect-error testing invalid input intentionally
      expect(formatIntZeroAsBlank(null)).toBe("");
    });
    it("returns number as string when value is positive integer", () => {
      expect(formatIntZeroAsBlank(5)).toBe("5");
    });
    it("returns number as string when value is negative integer", () => {
      expect(formatIntZeroAsBlank(-3)).toBe("-3");
    });
    it("returns number as string when value is decimal (even though not int)", () => {
      expect(formatIntZeroAsBlank(4.7)).toBe("4.7");
    });
    it("returns number as string when value is very large integer", () => {
      expect(formatIntZeroAsBlank(1234567890)).toBe("1234567890");
    });
  });

  describe("valueGetterForMoney", () => {
    it("returns 0 for NaN input", () => {
      expect(valueGetterForMoney(NaN)).toBe(0);
    });
    it("returns 0 for null input", () => {
      expect(valueGetterForMoney(null)).toBe(0);
    });
    it("returns 0 for undefined input", () => {
      expect(valueGetterForMoney(undefined)).toBe(0);
    });
    it("returns 0 for non-numeric string", () => {
      expect(valueGetterForMoney("abc")).toBe(0);
    });
    it("returns numeric value rounded to 2 decimals for valid number", () => {
      expect(valueGetterForMoney(12.3456)).toBe(12.35);
      expect(valueGetterForMoney(12.344)).toBe(12.34);
    });
    it("returns numeric value rounded to 2 decimals for numeric string", () => {
      expect(valueGetterForMoney("45.678")).toBe(45.68);
      expect(valueGetterForMoney("45.671")).toBe(45.67);
    });
    it("returns 0 for empty string", () => {
      expect(valueGetterForMoney("")).toBe(0);
    });
    it("handles negative numbers correctly", () => {
      expect(valueGetterForMoney(-9.876)).toBe(-9.88);
    });
    it("handles integer inputs correctly", () => {
      expect(valueGetterForMoney(100)).toBe(100);
    });
    it("handles very large numbers correctly", () => {
      expect(valueGetterForMoney(123456789.9876)).toBe(123456789.99);
    });
    it("handles booleans by numeric conversion", () => {
      expect(valueGetterForMoney(true)).toBe(1);
      expect(valueGetterForMoney(false)).toBe(0);
    });
    it("handles objects and arrays gracefully (returns 0)", () => {
      expect(valueGetterForMoney({})).toBe(0);
      expect(valueGetterForMoney([])).toBe(0);
      expect(valueGetterForMoney([123])).toBe(123); // Number([123]) === 123
    });
  });

  describe("valueParserForMoney", () => {
    // Strings with currency symbols or spaces
    it("parses string with dollar sign correctly", () => {
      expect(valueParserForMoney("$12.34")).toBe(12.34);
    });
    it("parses string with dollar sign and spaces correctly", () => {
      expect(valueParserForMoney("  $45.67  ")).toBe(45.67);
    });
    // Plain numeric strings
    it("parses plain numeric string correctly", () => {
      expect(valueParserForMoney("15")).toBe(15);
    });
    it("parses decimal numeric string correctly", () => {
      expect(valueParserForMoney("9.99")).toBe(9.99);
    });
    // Negative values
    it("parses negative dollar string correctly", () => {
      expect(valueParserForMoney("$-7.50")).toBe(-7.5);
    });
    it("parses negative number string correctly", () => {
      expect(valueParserForMoney("-10.25")).toBe(-10.25);
    });
    // Invalid strings
    it("returns 0 for non-numeric string", () => {
      expect(valueParserForMoney("abc")).toBe(0);
    });
    it("returns 0 for empty string", () => {
      expect(valueParserForMoney("")).toBe(0);
    });
    // Numbers
    it("returns same number if input is a number", () => {
      expect(valueParserForMoney(123.45)).toBe(123.45);
    });
    it("handles 0 as a valid number", () => {
      expect(valueParserForMoney(0)).toBe(0);
    });
    it("handles negative number correctly", () => {
      expect(valueParserForMoney(-88.76)).toBe(-88.76);
    });
    // Other invalid types
    it("returns 0 for null", () => {
      expect(valueParserForMoney(null)).toBe(0);
    });
    it("returns 0 for undefined", () => {
      expect(valueParserForMoney(undefined)).toBe(0);
    });
    it("returns 0 for object input", () => {
      expect(valueParserForMoney({})).toBe(0);
    });
    it("returns 0 for array input", () => {
      expect(valueParserForMoney([])).toBe(0);
    });
    // Edge cases
    it("returns 0 for string with only '$'", () => {
      expect(valueParserForMoney("$")).toBe(0);
    });
    it("returns 0 for string with invalid number after '$'", () => {
      expect(valueParserForMoney("$abc")).toBe(0);
    });
    it("parses large dollar string correctly", () => {
      expect(valueParserForMoney("$123456.78")).toBe(123456.78);
    });
  });

  describe('createPlayerEntryColumns', () => {

    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", hdcp_per: 0.9, hdcp_from: 230, int_hdcp: true },
      { ...initDiv, id: "div2", hdcp_per: 0.9, hdcp_from: 230, int_hdcp: false }
    ];
    const maxLane = 40;
    const minLane = 1;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all required column fields with correct properties', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);
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
      expect(updatedRow.position).toBe('');
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
    it('should set the colunm width - isTouchDevice is false', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;
      const aveCol = columns.find(col => col.field === 'average');
      expect(aveCol?.width).toBe(80);
      const laneCol = columns.find(col => col.field === 'lane');
      expect(laneCol?.width).toBe(70);
      const lanePosCol = columns.find(col => col.field === 'lanePos');
      expect(lanePosCol?.width).toBe(80);
      const fnameCol = columns.find(col => col.field === 'first_name');
      expect(fnameCol?.width).toBe(120);
      const lnameCol = columns.find(col => col.field === 'last_name');
      expect(lnameCol?.width).toBe(120);
      const positionCol = columns.find(col => col.field === 'position');
      expect(positionCol?.width).toBe(80);
    });
    it('should set the colunm width - isTouchDevice is true', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);
      const columns = createPlayerEntryColumns(mockDivs, maxLane, minLane);
      expect(columns).toBeDefined();
      if (!columns) return;
      const aveCol = columns.find(col => col.field === 'average');
      expect(aveCol?.width).toBe(130);
      const laneCol = columns.find(col => col.field === 'lane');
      expect(laneCol?.width).toBe(120);
      const lanePosCol = columns.find(col => col.field === 'lanePos');
      expect(lanePosCol?.width).toBe(140);
      const fnameCol = columns.find(col => col.field === 'first_name');
      expect(fnameCol?.width).toBe(150);
      const lnameCol = columns.find(col => col.field === 'last_name');
      expect(lnameCol?.width).toBe(150);
      const positionCol = columns.find(col => col.field === 'position');
      expect(positionCol?.width).toBe(130);
    });
  })

  describe("isDivEntryFeeColumnName", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("returns false when colName is empty string", () => {
      expect(isDivEntryFeeColumnName("")).toBe(false);
    });
    it("returns false when colName is null or undefined", () => {
      expect(isDivEntryFeeColumnName(null as any)).toBe(false);
      expect(isDivEntryFeeColumnName(undefined as any)).toBe(false);
    });
    it("returns true when name starts with 'div' and ends with feeColNameEnd", () => {
      const name = `div12345${feeColNameEnd}`;
      expect(isDivEntryFeeColumnName(name)).toBe(true);
    });
    it("returns false when name starts with 'div' but does not end with feeColNameEnd", () => {
      expect(isDivEntryFeeColumnName("div12345fee")).toBe(false);
    });
    it("returns false when name ends with feeColNameEnd but does not start with 'div'", () => {
      expect(isDivEntryFeeColumnName(`brkt12345${feeColNameEnd}`)).toBe(false);
    });
    it("returns false when name does not start with 'div' or end with feeColNameEnd", () => {
      expect(isDivEntryFeeColumnName("random_column")).toBe(false);
    });
    it("is case-sensitive (must start with lowercase 'div')", () => {
      const name = `Div12345${feeColNameEnd}`;
      expect(isDivEntryFeeColumnName(name)).toBe(false);
    });
    it("returns true even if UUID part in middle is malformed", () => {
      // The function intentionally does NOT validate UUID in the middle
      const name = `div-not-a-uuid${feeColNameEnd}`;
      expect(isDivEntryFeeColumnName(name)).toBe(true);
    });
    it("returns false if extra characters appear after feeColNameEnd", () => {
      const name = `div12345${feeColNameEnd}_extra`;
      expect(isDivEntryFeeColumnName(name)).toBe(false);
    });
  });

  describe("createDivEntryColumns", () => {
    const mockDivs: divType[] = [
      {
        ...initDiv,
        id: "div1",
        div_name: "Scratch",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: true,
      },
      {
        ...initDiv,
        id: "div2",
        div_name: "Handicap",
        hdcp_per: 0.9,
        hdcp_from: 230,
        int_hdcp: false,
      },
    ];
    const cellParams: GridCellParams = {
      id: "div1_fee",
      field: "div1_fee",
      value: 80,
      row: {}, // mock row object
      rowNode: null as any, // mock row node object
      colDef: null as any, // mock column definition object
      cellMode: "view", // mock cell mode
      api: null as any, // mock grid API object
      isEditable: true, // mock editable flag
      hasFocus: false, // add this property
      tabIndex: -1, // add this property
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      cellParams.value = 80;
    });

    it("should create fee and HDCP columns for each division", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createDivEntryColumns(mockDivs);

      expect(columns).toHaveLength(4); // 2 cols per division
      expect(columns[0].field).toBe("div1_fee");
      expect(columns[0].headerName).toBe("Scratch");
      expect(columns[0].description).toBe("Scratch");
      expect(columns[0].headerClassName).toBe("divsHeader");
      expect(columns[0].type).toBe("number");
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe("right");
      expect(columns[0].headerAlign).toBe("right");
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe("div1_hdcp");
      expect(columns[1].headerName).toBe("HDCP");
      expect(columns[1].description).toBe("HDCP");
      expect(columns[1].headerClassName).toBe("divsHeader");
      expect(columns[1].type).toBe("number");
      expect(columns[1].editable).toBe(undefined); // hdcp is not editable      
      expect(columns[1].align).toBe("center");
      expect(columns[1].headerAlign).toBe("center");
      expect(columns[1].disableExport).toBe(true);

      expect(columns[2].field).toBe("div2_fee");
      expect(columns[2].headerName).toBe("Handicap");
      expect(columns[2].description).toBe("Handicap");
      expect(columns[2].headerClassName).toBe("divsHeader");
      expect(columns[2].type).toBe("number");
      expect(columns[2].editable).toBe(true);      
      expect(columns[2].align).toBe("right");
      expect(columns[2].headerAlign).toBe("right");
      expect(columns[2].renderEditCell).toBeDefined();
      expect(columns[2].renderEditCell).toBeInstanceOf(Function);

      expect(columns[3].field).toBe("div2_hdcp");
      expect(columns[3].headerName).toBe("HDCP");
      expect(columns[3].description).toBe("HDCP");
      expect(columns[3].headerClassName).toBe("divsHeader");
      expect(columns[3].type).toBe("number");
      expect(columns[3].editable).toBe(undefined); // hdcp is not editable      
      expect(columns[3].align).toBe("center");
      expect(columns[3].headerAlign).toBe("center");
      expect(columns[3].disableExport).toBe(false);
    });
    it("should apply error class for invalid fee values", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createDivEntryColumns(mockDivs);
      if (!columns) return;
      const applyDivFeeCellColor = columns?.[0].cellClassName;
      expect(applyDivFeeCellColor).toBeDefined();
      if (typeof applyDivFeeCellColor === "function") {
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = 0;
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = maxMoney + 1;
        expect(applyDivFeeCellColor(cellParams)).toBe("cellError");
        cellParams.value = -1;
        expect(applyDivFeeCellColor(cellParams)).toBe("cellError");
        cellParams.value = null;
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = undefined;
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = NaN;
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = "";
        expect(applyDivFeeCellColor(cellParams)).toBe("");
        cellParams.value = "0";
        expect(applyDivFeeCellColor(cellParams)).toBe("cellError");
        cellParams.value = "abc";
        expect(applyDivFeeCellColor(cellParams)).toBe("cellError");
      } else {
        expect(applyDivFeeCellColor).toBeUndefined();
      }
    });
    it("should format fee column values as currency when valid numbers are provided", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
      const columns = createDivEntryColumns(mockDivs);
      if (!columns) return;
      const formattedValue = columns?.[0].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 80 as never,
        row: null as any,
        colDef: null as any,
        api: null as any,
      };

      if (typeof formattedValue === "function") {
        let formattedCellValue = formattedValue(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        );
        expect(formattedCellValue).toBe("$80.00");
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        );
        expect(formattedCellValue).toBe("");
        formatCellParams.value = "" as never;
        formattedCellValue = formattedValue(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        );
        expect(formattedCellValue).toBe("");
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        );
        expect(formattedCellValue).toBe("");
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        );
        expect(formattedCellValue).toBe("$123.46");
      } else {
        expect(formattedValue).toBeUndefined();
      }
    });
    it("should format HDCP values as integers when int_hdcp is true and as decimals when false", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createDivEntryColumns(mockDivs);

      const formatCellParams: GridValueFormatterParams = {
        value: 10.6 as never,
        row: null as any,
        colDef: null as any,
        api: null as any,
      };

      const hdcpColumnInt = columns.find((col) => col.field === "div1_hdcp");
      expect(hdcpColumnInt).toBeDefined();
      const formatHdcpInt = hdcpColumnInt!.valueFormatter;
      formatCellParams.colDef = hdcpColumnInt as GridColDef;
      expect(
        formatHdcpInt!(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        )
      ).toBe("10");

      const hdcpColumnDec = columns.find((col) => col.field === "div2_hdcp");
      expect(hdcpColumnDec).toBeDefined();
      const formatHdcpDec = hdcpColumnDec!.valueFormatter;
      formatCellParams.colDef = hdcpColumnDec as GridColDef;
      expect(
        formatHdcpInt!(
          formatCellParams.value,
          formatCellParams.row,
          formatCellParams.colDef,
          formatCellParams.api
        )
      ).toBe("10.6");
    });
    it("should set widths for fee and HDCP columns when isTouchDevice is false", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createDivEntryColumns(mockDivs);

      const fee1Column = columns.find((col) => col.field === "div1_fee");
      expect(fee1Column?.width).toBe(feeColWidthNoTouch);
      const hdcp1Column = columns.find((col) => col.field === "div1_hdcp");
      expect(hdcp1Column?.width).toBe(80);
      const fee2Column = columns.find((col) => col.field === "div2_fee");
      expect(fee2Column?.width).toBe(feeColWidthNoTouch);
      const hdcp2Column = columns.find((col) => col.field === "div2_hdcp");
      expect(hdcp2Column?.width).toBe(80);
    });
    it("should set widths for fee and HDCP columns when isTouchDevice is true", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);

      const columns = createDivEntryColumns(mockDivs);

      const fee1Column = columns.find((col) => col.field === "div1_fee");
      expect(fee1Column?.width).toBe(feeColWidthTouch);
      const hdcp1Column = columns.find((col) => col.field === "div1_hdcp");
      expect(hdcp1Column?.width).toBe(120);
      const fee2Column = columns.find((col) => col.field === "div2_fee");
      expect(fee2Column?.width).toBe(feeColWidthTouch);
      const hdcp2Column = columns.find((col) => col.field === "div2_hdcp");
      expect(hdcp2Column?.width).toBe(120);
    });
  });

  describe("formatFee", () => {
    it("returns empty string when value is 0", () => {
      expect(formatFee(0)).toBe("");
    });
    it("returns formatted $0.00 when value is NaN", () => {
      expect(formatFee(NaN)).toBe("$0.00");
    });
    it("formats positive values correctly", () => {
      expect(formatFee(12.3456)).toBe("$12.35");
    });
    it("formats negative values correctly", () => {
      expect(formatFee(-9.876)).toBe("-$9.88");
    });
    it("rounds to 2 decimal places", () => {
      expect(formatFee(5.004)).toBe("$5.00");
      expect(formatFee(5.005)).toBe("$5.01");
    });
    it("handles undefined gracefully", () => {
      expect(formatFee(undefined as any)).toBe("");
    });
    it("handles null gracefully", () => {
      expect(formatFee(null as any)).toBe("");
    });
  });

  describe("formatFeeBlankAsZero", () => {
    it("returns formatted $0.00 when value is 0", () => {
      expect(formatFeeBlankAsZero(0)).toBe("$0.00");
    });
    it("returns formatted $0.00 when value is NaN", () => {
      expect(formatFeeBlankAsZero(NaN)).toBe("$0.00");
    });
    it("formats positive values correctly", () => {
      expect(formatFeeBlankAsZero(45.678)).toBe("$45.68");
    });
    it("formats negative values correctly", () => {
      expect(formatFeeBlankAsZero(-8.991)).toBe("-$8.99");
    });
    it("returns formatted $0.00 when value is undefined", () => {
      expect(formatFeeBlankAsZero(undefined as any)).toBe("$0.00");
    });
    it("returns formatted $0.00 when value is null", () => {
      expect(formatFeeBlankAsZero(null as any)).toBe("$0.00");
    });
    it("rounds correctly with Number.EPSILON adjustment", () => {
      expect(formatFeeBlankAsZero(5.005)).toBe("$5.01");
    });
  });

  describe("isPotFeeColumnName", () => {
    it("returns false when colName is empty string", () => {
      expect(isPotFeeColumnName("")).toBe(false);
    });

    it("returns false when colName is null", () => {
      expect(isPotFeeColumnName(null as any)).toBe(false);
    });
    it("returns false when colName is undefined", () => {
      expect(isPotFeeColumnName(undefined as any)).toBe(false);
    });
    it("returns false when colName is not a string (e.g., number, object, array)", () => {
      expect(isPotFeeColumnName(123 as any)).toBe(false);
      expect(isPotFeeColumnName({} as any)).toBe(false);
      expect(isPotFeeColumnName([] as any)).toBe(false);
    });
    it("returns true when name starts with 'pot' and ends with feeColNameEnd", () => {
      const col = `pot12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(true);
    });
    it("returns false when name starts with 'pot' but does not end with feeColNameEnd", () => {
      expect(isPotFeeColumnName("pot12345_entry")).toBe(false);
    });
    it("returns false when name ends with feeColNameEnd but does not start with 'pot'", () => {
      const col = `div12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
    it("returns false when name neither starts with 'pot' nor ends with feeColNameEnd", () => {
      expect(isPotFeeColumnName("random_column")).toBe(false);
    });
    it("is case-sensitive (must start with lowercase 'pot')", () => {
      const col = `Pot12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
    it("returns true even if middle section (uuid) is malformed", () => {
      const col = `pot-xyz${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(true);
    });
    it("returns false if extra characters appear after feeColNameEnd", () => {
      const col = `pot12345${feeColNameEnd}_extra`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
  });

  describe("isPotFeeColumnName", () => {
    it("returns false when colName is empty string", () => {
      expect(isPotFeeColumnName("")).toBe(false);
    });
    it("returns false when colName is null", () => {
      expect(isPotFeeColumnName(null as any)).toBe(false);
    });
    it("returns false when colName is undefined", () => {
      expect(isPotFeeColumnName(undefined as any)).toBe(false);
    });
    it("returns false when colName is not a string", () => {
      expect(isPotFeeColumnName(123 as any)).toBe(false);
      expect(isPotFeeColumnName({} as any)).toBe(false);
      expect(isPotFeeColumnName([] as any)).toBe(false);
    });
    it("returns true when name starts with 'pot' and ends with feeColNameEnd", () => {
      const col = `pot12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(true);
    });
    it("returns false when name starts with 'pot' but does not end with feeColNameEnd", () => {
      expect(isPotFeeColumnName("pot12345_entry")).toBe(false);
    });
    it("returns false when name ends with feeColNameEnd but does not start with 'pot'", () => {
      const col = `div12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
    it("returns false when name neither starts with 'pot' nor ends with feeColNameEnd", () => {
      expect(isPotFeeColumnName("random_column")).toBe(false);
    });
    it("is case-sensitive (must start with lowercase 'pot')", () => {
      const col = `Pot12345${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
    it("returns true even if middle section is malformed (not a valid uuid)", () => {
      const col = `pot-xyz${feeColNameEnd}`;
      expect(isPotFeeColumnName(col)).toBe(true);
    });
    it("returns false if extra characters appear after feeColNameEnd", () => {
      const col = `pot12345${feeColNameEnd}_extra`;
      expect(isPotFeeColumnName(col)).toBe(false);
    });
  });

  describe("getPotFee", () => {
    it("should return correct fee when valid pot ID is provided", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
      ];
      const result = getPotFee(mockPots, "pot1");
      expect(result).toBe(25);
    });
    it("should return 0 when pots array is empty", () => {
      const emptyPots: potType[] = [];
      const result = getPotFee(emptyPots, "pot1");
      expect(result).toBe(0);
    });
    it("should return numeric fee when pot with given ID exists", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "30" },
        { ...initPot, id: "pot2", fee: "45" },
      ];
      const result = getPotFee(mockPots, "pot2");
      expect(result).toBe(45);
    });
    it("should return correct fee when multiple pots are provided and valid pot ID is given", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
        { ...initPot, id: "pot3", fee: "75" },
      ];
      const result = getPotFee(mockPots, "pot2");
      expect(result).toBe(50);
    });
    it("should return correct numeric fee when valid pot ID is provided", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
      ];
      const result = getPotFee(mockPots, "pot1");
      expect(result).toBe(25);
    });
    it("should return 0 when pots array is null", () => {
      const result = getPotFee(null as any, "pot1");
      expect(result).toBe(0);
    });
    it("should return 0 when potId is an empty string", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
      ];
      const result = getPotFee(mockPots, "");
      expect(result).toBe(0);
    });
    it("should return 0 when potId is null", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
      ];
      const result = getPotFee(mockPots, null as any);
      expect(result).toBe(0);
    });
    it("should return 0 when pot ID is not found in the list", () => {
      const mockPots: potType[] = [
        { ...initPot, id: "pot1", fee: "25" },
        { ...initPot, id: "pot2", fee: "50" },
      ];
      const result = getPotFee(mockPots, "pot3");
      expect(result).toBe(0);
    });
  });

  describe("isValidFee", () => {
    it("returns true when value is null", () => {
      expect(isValidFee(null as any, 10)).toBe(true);
    });
    it("returns true when value is undefined", () => {
      expect(isValidFee(undefined as any, 10)).toBe(true);
    });
    it("returns false when value is NaN", () => {
      expect(isValidFee(NaN, 10)).toBe(false);
    });
    it("returns true when value equals 0", () => {
      expect(isValidFee(0, 10)).toBe(true);
    });
    it("returns true when value equals fee", () => {
      expect(isValidFee(25, 25)).toBe(true);
    });
    it("returns true when value is a string number matching fee", () => {
      expect(isValidFee("25" as any, 25)).toBe(true);
    });
    it("returns false when value does not equal 0 or fee", () => {
      expect(isValidFee(15, 25)).toBe(false);
    });
    it("returns true when value is a string number '0'", () => {
      expect(isValidFee("0" as any, 25)).toBe(true);
    });
    it("returns false when value is a non-numeric string", () => {
      expect(isValidFee("abc" as any, 25)).toBe(false);
    });
    it("returns false when value is an object", () => {
      expect(isValidFee({} as any, 25)).toBe(false);
    });
    it("returns false when value is an array", () => {
      expect(isValidFee([] as any, 25)).toBe(false);
    });
    it("handles negative fees correctly", () => {
      expect(isValidFee(-5, -5)).toBe(true);
      expect(isValidFee(-5, 5)).toBe(false);
    });
    it("handles floating point rounding equivalence", () => {
      expect(isValidFee(10.0, 10)).toBe(true);
      expect(isValidFee(10.01, 10)).toBe(false);
    });
  });

  describe("applyPotOrElimFeeCellColor", () => {

    it("returns empty string when value is 0", () => {
      expect(applyPotOrElimFeeCellColor(0, 10)).toBe("");
    });
    it("returns empty string when value is '0'", () => {
      expect(applyPotOrElimFeeCellColor('0' as any, 10)).toBe("");
    });
    it("returns empty string when value is same as fee", () => {
      expect(applyPotOrElimFeeCellColor(10, 10)).toBe("");
    });
    it("returns empty string when value is falsy (e.g., undefined, null, NaN)", () => {
      expect(applyPotOrElimFeeCellColor(undefined as any, 10)).toBe("");
      expect(applyPotOrElimFeeCellColor(null as any, 10)).toBe("");
      expect(applyPotOrElimFeeCellColor(NaN as unknown as number, 10)).toBe("");
    });
    it("returns styles.cellError when value is invalid", () => {
      const result = applyPotOrElimFeeCellColor(20, 10);
      expect(result).toBe('cellError');
    });
    it("returns styles.cellError when value is not a number", () => {
      const result = applyPotOrElimFeeCellColor('abc', 10);
      expect(result).toBe('cellError');
    });
  });

  describe('isPotFeeColumnName', () => {
    it('returns false for empty string', () => {
      expect(isPotFeeColumnName('')).toBe(false);
    });
    it('returns false for null or undefined', () => {
      expect(isPotFeeColumnName(null as any)).toBe(false);
      expect(isPotFeeColumnName(undefined as any)).toBe(false);
    });
    it('returns false for non-string input', () => {
      expect(isPotFeeColumnName(123 as any)).toBe(false);
    });
    it('returns false for column name that does not start with "pot"', () => {
      expect(isPotFeeColumnName('hello' + feeColNameEnd)).toBe(false);
    });
    it('returns false for column name that does not end with feeColNameEnd', () => {
      expect(isPotFeeColumnName('pothello')).toBe(false);
    });
    it('returns true for column name that starts with "pot" and ends with feeColNameEnd', () => {
      expect(isPotFeeColumnName('pot' + feeColNameEnd)).toBe(true);
    });
    it('returns true for column name that starts with "pot" and ends with feeColNameEnd, with other characters in between', () => {
      expect(isPotFeeColumnName('pot123' + feeColNameEnd)).toBe(true);
    });
  });

  describe("isBrktsColumnName", () => {

    it("returns false when colName is an empty string", () => {
      expect(isBrktsColumnName("")).toBe(false);
    });
    it("returns false when colName is null", () => {
      expect(isBrktsColumnName(null as any)).toBe(false);
    });
    it("returns false when colName is undefined", () => {
      expect(isBrktsColumnName(undefined as any)).toBe(false);
    });
    it("returns false when colName is not a string", () => {
      expect(isBrktsColumnName(123 as any)).toBe(false);
      expect(isBrktsColumnName({} as any)).toBe(false);
      expect(isBrktsColumnName([] as any)).toBe(false);
    });
    it("returns true when colName starts with 'brk' and ends with brktsColNameEnd", () => {
      const col = `brk12345${brktsColNameEnd}`;
      expect(isBrktsColumnName(col)).toBe(true);
    });
    it("returns false when colName starts with 'brk' but does not end with brktsColNameEnd", () => {
      expect(isBrktsColumnName("brk12345_fee")).toBe(false);
    });
    it("returns false when colName ends with brktsColNameEnd but does not start with 'brk'", () => {
      const col = `div12345${brktsColNameEnd}`;
      expect(isBrktsColumnName(col)).toBe(false);
    });
    it("returns false when colName neither starts with 'brk' nor ends with brktsColNameEnd", () => {
      expect(isBrktsColumnName("random_column")).toBe(false);
    });
    it("is case-sensitive (must start with lowercase 'brk')", () => {
      const col = `Brk12345${brktsColNameEnd}`;
      expect(isBrktsColumnName(col)).toBe(false);
    });
    it("returns true even if middle part (uuid) is malformed", () => {
      const col = `brk-xyz${brktsColNameEnd}`;
      expect(isBrktsColumnName(col)).toBe(true);
    });
    it("returns false if extra characters appear after brktsColNameEnd", () => {
      const col = `brk12345${brktsColNameEnd}_extra`;
      expect(isBrktsColumnName(col)).toBe(false);
    });
  });

  describe("getBrktIdFromColName", () => {
    it("returns empty string when isBrktsColumnName returns false", () => {
      expect(getBrktIdFromColName("random_column")).toBe("");
    });
    it("returns correct bracket id when isBrktsColumnName returns true", () => {
      const col = `brk12345${brktsColNameEnd}`; // example: "brk12345_num_brkts"
      const result = getBrktIdFromColName(col);
      expect(result).toBe("brk12345");
    });
    it("removes only the '_num_brkts' suffix, preserving the prefix", () => {
      const col = `brk-xyz${brktsColNameEnd}`;
      const result = getBrktIdFromColName(col);
      expect(result).toBe("brk-xyz");
    });
    it("handles column names with extra underscores before suffix correctly", () => {
      const col = `brk_abc_123${brktsColNameEnd}`;
      const result = getBrktIdFromColName(col);
      expect(result).toBe("brk_abc_123");
    });
    it("returns empty string when input is null, undefined, or empty", () => {
      expect(getBrktIdFromColName(null as any)).toBe("");
      expect(getBrktIdFromColName(undefined as any)).toBe("");
      expect(getBrktIdFromColName("")).toBe("");
    });
    it("returns empty string when column name ends with unexpected suffix", () => {
      const col = "brk12345_wrong_suffix";
      expect(getBrktIdFromColName(col)).toBe("");
    });
  });

  describe("applyNumBrktsCellColor", () => {

    it("returns empty string when value is 0", () => {
      expect(applyNumBrktsCellColor(0)).toBe("");      
    });
    it("returns empty string when value is falsy (e.g., undefined, null, NaN)", () => {      
      expect(applyNumBrktsCellColor(undefined as any)).toBe("");      
      expect(applyNumBrktsCellColor(null as any)).toBe("");
      expect(applyNumBrktsCellColor(NaN as unknown as number)).toBe("");      
    });
    it("returns styles.cellError when validBrkts returns false", () => {      
      const result1 = applyNumBrktsCellColor(-1);
      expect(result1).toBe('cellError');      
      const result2 = applyNumBrktsCellColor(maxBrackets + 1);
      expect(result2).toBe('cellError');
    });
    it("returns empty string when validBrkts returns true", () => {      
      const result = applyNumBrktsCellColor(3);
      expect(result).toBe("");      
    });
  });

  describe('createPotEntryColumns', () => {
    const mockPots: potType[] = [
      { ...initPot, id: "pot1", div_id: "div1", pot_type: 'Game', fee: '20'},
      { ...initPot, id: "pot2", div_id: "div1", pot_type: 'Last Game', fee: '10' }
    ];
    const mockDivs: divType[] = [
      { ...initDiv, id: "div1", div_name: 'Scratch' }
    ]
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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      cellParams.value = 20;
    })

    it('should create fee column for each pot', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);

      expect(columns).toHaveLength(2); // 1 col per pot
      expect(columns[0].field).toBe('pot1_fee');
      expect(columns[0].headerName).toBe('Scratch: Gm');
      expect(columns[0].description).toBe('Scratch: Game');
      expect(columns[0].headerClassName).toBe('potsHeader');
      expect(columns[0].width).toBe(105);
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe('right');
      expect(columns[0].headerAlign).toBe('right');
      expect(columns[0].type).toBe('number');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe('pot2_fee');
      expect(columns[1].headerName).toBe('Scratch: LG');
      expect(columns[1].description).toBe('Scratch: Last Game');
      expect(columns[1].headerClassName).toBe('potsHeader');
      expect(columns[1].width).toBe(105);
      expect(columns[1].editable).toBe(true);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('right');
      expect(columns[1].type).toBe('number');
      expect(columns[1].renderEditCell).toBeDefined();
      expect(columns[1].renderEditCell).toBeInstanceOf(Function);

    });
    it('should apply error class for invalid Game fee values', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);
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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);
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
    it("should set width for pot fee column when isTouchDevice is false", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createPotEntryColumns(mockPots, mockDivs);

      const fee1Column = columns.find((col) => col.field === "pot1_fee");
      expect(fee1Column?.width).toBe(105);
    });
    it("should set widths for fee and HDCP columns when isTouchDevice is true", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);

      const columns = createPotEntryColumns(mockPots, mockDivs);

      const fee1Column = columns.find((col) => col.field === "pot1_fee");
      expect(fee1Column?.width).toBe(160);
    });
  })

  describe('isBrktColumnName', () => {
    it('returns false for empty string', () => {
      expect(isBrktsColumnName('')).toBe(false);
    });
    it('returns false for string that does not start with "brk"', () => {
      expect(isBrktsColumnName('hello')).toBe(false);
    });
    it('returns false for string that starts with "brk" but does not end with correct suffix', () => {
      expect(isBrktsColumnName('brkfoo')).toBe(false);
    });
    it('returns true for string that starts with "brk" and ends with correct suffix', () => {
      expect(isBrktsColumnName('brk' + brktsColNameEnd)).toBe(true);
    });
    it('returns false for null or undefined', () => {
      expect(isBrktsColumnName(null as any)).toBe(false);
      expect(isBrktsColumnName(undefined as any)).toBe(false);
    });
    it('should return false for non string input', () => {
      expect(isBrktsColumnName(123 as any)).toBe(false);
    });
  })

  describe('getBrktIdFromColName', () => {
    it('returns empty string for empty input', () => {
      expect(getBrktIdFromColName('')).toBe('');
    });
    it('returns empty string for input that is not a brackets column name', () => {
      expect(getBrktIdFromColName('hello')).toBe('');
    });
    it('returns empty string for null or undefined input', () => {
      expect(getBrktIdFromColName(null as any)).toBe('');
      expect(getBrktIdFromColName(undefined as any)).toBe('');
    });
    it('returns bracket ID for valid brackets column name', () => {
      const colName = 'brk123' + brktsColNameEnd;
      expect(getBrktIdFromColName(colName)).toBe('brk123');
    });
    it('returns bracket ID for valid brackets column name with different suffix', () => {
      const colName = 'brk456' + brktsColNameEnd;
      expect(getBrktIdFromColName(colName)).toBe('brk456');
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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      cellParams.id = 'brkt1_fee';
      cellParams.field = 'brkt1_fee';
      cellParams.value = 20;
    })

    it('should create number of brackets and fee columns for each bracket', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createBrktEntryColumns(mockBrkts, mockDivs);

      expect(columns).toHaveLength(4); // 2 cols per division
      expect(columns[0].field).toBe('brkt1_brkts');
      expect(columns[0].headerName).toBe('Scratch: 1-3');
      expect(columns[0].description).toBe('Scratch: 1-3');
      expect(columns[0].headerClassName).toBe('brktsHeader');      
      expect(columns[0].editable).toBe(true);
      expect(columns[0].align).toBe('center');
      expect(columns[0].headerAlign).toBe('center');
      expect(columns[0].renderEditCell).toBeDefined();
      expect(columns[0].renderEditCell).toBeInstanceOf(Function);

      expect(columns[1].field).toBe('brkt1_fee');
      expect(columns[1].headerName).toBe('Fee');
      expect(columns[1].description).toBe('Fee');
      expect(columns[1].headerClassName).toBe('brktsHeader');      
      expect(columns[1].editable).toBe(undefined);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('right');

      expect(columns[2].field).toBe('brkt2_brkts');
      expect(columns[2].headerName).toBe('Scratch: 4-6');
      expect(columns[2].description).toBe('Scratch: 4-6');
      expect(columns[2].headerClassName).toBe('brktsHeader');      
      expect(columns[2].editable).toBe(true);
      expect(columns[2].align).toBe('center');
      expect(columns[2].headerAlign).toBe('center');
      expect(columns[2].renderEditCell).toBeDefined();
      expect(columns[2].renderEditCell).toBeInstanceOf(Function);

      expect(columns[3].field).toBe('brkt2_fee');
      expect(columns[3].headerName).toBe('Fee');
      expect(columns[3].description).toBe('Fee');
      expect(columns[3].headerClassName).toBe('brktsHeader');      
      expect(columns[3].editable).toBe(undefined);
      expect(columns[3].align).toBe('right');
      expect(columns[3].headerAlign).toBe('right');
    });
    it('should apply error class for invalid Scratch 1-3 values', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createBrktEntryColumns(mockBrkts, mockDivs);
      expect(columns).toBeDefined();
      if (!columns) return;
      const setBrktsFee = columns[0]?.valueSetter;
      const col = columns.find(col => col.field === 'brkt1_brkts');
      expect(setBrktsFee).toBeDefined();
      if (!setBrktsFee) return;

      const row = { brkt1_brkts: 8 };
      // pass null as the third param - not used so just pass null
      let updatedRow = setBrktsFee(row.brkt1_brkts, row, col as any, null as any);
      expect(updatedRow).toBeDefined();
      expect(updatedRow.brkt1_brkts).toBe(8);
      expect(updatedRow['brkt1_fee']).toBe(40);   // brkt_fee * num_brkts = 5 * 8 = 40
      row.brkt1_brkts = null as any;
      updatedRow = setBrktsFee(row.brkt1_brkts, row, col as any, null as any);
      expect(updatedRow).toBeDefined();
      expect(updatedRow.brkt1_brkts).toBe(0);
      expect(updatedRow['brkt1_fee']).toBe(0);

      const setBrktsFee2 = columns[2]?.valueSetter;
      const col2 = columns.find(col => col.field === 'brkt2_brkts');
      expect(setBrktsFee2).toBeDefined();
      if (!setBrktsFee2) return;
      const row2 = { brkt2_brkts: 6 };
      const updatedRow2 = setBrktsFee(row2.brkt2_brkts, row2, col2 as any, null as any);
      expect(updatedRow2).toBeDefined();
      expect(updatedRow2.brkt2_brkts).toBe(6);
      expect(updatedRow2['brkt2_fee']).toBe(30);   // brkt_fee * num_brkts = 5 * 6 = 30
    });
    it("should set widths for fee and num_brkts columns when isTouchDevice is false", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createBrktEntryColumns(mockBrkts, mockDivs);

      const fee1Column = columns.find((col) => col.field === "brkt1_fee");
      expect(fee1Column?.width).toBe(feeColWidthNoTouch);
      const num1Column = columns.find((col) => col.field === "brkt1_brkts");
      expect(num1Column?.width).toBe(120);
      const fee2Column = columns.find((col) => col.field === "brkt2_fee");
      expect(fee2Column?.width).toBe(feeColWidthNoTouch);
      const num2Column = columns.find((col) => col.field === "brkt2_brkts");
      expect(num2Column?.width).toBe(120);
    });
    it("should set widths for fee and HDCP columns when isTouchDevice is true", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);

      const columns = createBrktEntryColumns(mockBrkts, mockDivs);

      const fee1Column = columns.find((col) => col.field === "brkt1_fee");
      expect(fee1Column?.width).toBe(feeColWidthTouch);
      const num1Column = columns.find((col) => col.field === "brkt1_brkts");
      expect(num1Column?.width).toBe(155);
      const fee2Column = columns.find((col) => col.field === "brkt2_fee");
      expect(fee2Column?.width).toBe(feeColWidthTouch);
      const num2Column = columns.find((col) => col.field === "brkt2_brkts");
      expect(num2Column?.width).toBe(155);
    });
  })

  describe("isElimFeeColumnName", () => {
    it("returns false when colName is empty string", () => {
      expect(isElimFeeColumnName("")).toBe(false);
    });
    it("returns false when colName is null", () => {
      expect(isElimFeeColumnName(null as any)).toBe(false);      
    });
    it("returns false when colName is undefined", () => {      
      expect(isElimFeeColumnName(undefined as any)).toBe(false);
    });
    it("returns false when colName is not a string", () => {      
      expect(isElimFeeColumnName(123 as any)).toBe(false);      
      expect(isElimFeeColumnName({} as any)).toBe(false);      
      expect(isElimFeeColumnName([] as any)).toBe(false);
    });
    it("returns true when name starts with 'elm' and ends with feeColNameEnd", () => {
      const col = `elm12345${feeColNameEnd}`;
      expect(isElimFeeColumnName(col)).toBe(true);
    });
    it("returns false when name starts with 'elm' but does not end with feeColNameEnd", () => {
      expect(isElimFeeColumnName("elm12345_entry")).toBe(false);
    });
    it("returns false when name ends with feeColNameEnd but does not start with 'elm'", () => {
      const col = `div12345${feeColNameEnd}`;
      expect(isElimFeeColumnName(col)).toBe(false);
    });
    it("returns false when name neither starts with 'elm' nor ends with feeColNameEnd", () => {
      expect(isElimFeeColumnName("random_column")).toBe(false);
    });
    it("is case-sensitive (must start with lowercase 'elm')", () => {
      const col = `Elm12345${feeColNameEnd}`;
      expect(isElimFeeColumnName(col)).toBe(false);
    });
    it("returns true even if middle section (uuid) is malformed", () => {
      const col = `elm-xyz${feeColNameEnd}`;
      expect(isElimFeeColumnName(col)).toBe(true);
    });
    it("returns false if extra characters appear after feeColNameEnd", () => {
      const col = `elm12345${feeColNameEnd}_extra`;
      expect(isElimFeeColumnName(col)).toBe(false);
    });
  });

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

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      cellParams.id = 'elim1_fee';
      cellParams.field = 'elim1_fee';
      cellParams.value = 5;
    });

    it('should create fee column for each elim', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createElimEntryColumns(mockElims, mockDivs);

      expect(columns).toHaveLength(2); // 1 col per pot
      expect(columns[0].field).toBe('elim1_fee');
      expect(columns[0].headerName).toBe('Scratch: 1-3');
      expect(columns[0].description).toBe('Scratch: 1-3');
      expect(columns[0].headerClassName).toBe('elimsHeader');      
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
      expect(columns[1].editable).toBe(true);
      expect(columns[1].align).toBe('right');
      expect(columns[1].headerAlign).toBe('center');
      expect(columns[1].type).toBe('number');
      expect(columns[1].renderEditCell).toBeDefined();
      expect(columns[1].renderEditCell).toBeInstanceOf(Function);
    });
    it('should apply error class for invalid Scratch: 1-3 fee values', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
    it('should format Scratch: 1-3 fee column values as currency when valid numbers are provided', () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
      (isTouchDevice as jest.Mock).mockReturnValue(false);

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
    it("should set widths for fee column when isTouchDevice is false", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);

      const columns = createElimEntryColumns(mockElims, mockDivs);

      const fee1Column = columns.find((col) => col.field === "elim1_fee");
      expect(fee1Column?.width).toBe(feeColWidthNoTouch);
    });
    it("should set widths for fee column when isTouchDevice is true", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);

      const columns = createElimEntryColumns(mockElims, mockDivs);

      const fee1Column = columns.find((col) => col.field === "elim1_fee");
      expect(fee1Column?.width).toBe(160);
    });
  })

  describe("feeTotalColumn", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("returns an array with one column definition", async () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
      const result = feeTotalColumn();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });
    it("column has correct basic properties", async () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
      const [col] = feeTotalColumn();
      expect(col.field).toBe("feeTotal");
      expect(col.headerName).toBe("Total Fee");
      expect(col.description).toBe("Total Fee");
      expect(col.headerClassName).toBe("totalHeader");
      expect(col.headerAlign).toBe("center");
      expect(col.align).toBe("right");
    });
    it("uses 160 width when isTouchDevice() returns true", async () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);
      const [col] = feeTotalColumn();
      expect(col.width).toBe(160); 
    });
    it("uses 95 width when isTouchDevice() returns false", async () => {
      (isTouchDevice as jest.Mock).mockReturnValue(false);
      const [col] = feeTotalColumn();
      expect(col.width).toBe(feeColWidthNoTouch);
    });
    it("should format total fee column values as currency when valid numbers are provided", () => {
      const col = feeTotalColumn();
      if (!col) return;
      const formattedValue = col[0].valueFormatter;
      expect(formattedValue).toBeDefined();

      const formatCellParams: GridValueFormatterParams = {
        value: 432.10 as never,
        row: null as any,
        colDef: null as any,
        api: null as any
      }
      if (typeof formattedValue === 'function') {
        (isTouchDevice as jest.Mock).mockReturnValue(false);
        let formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$432.10');
        formatCellParams.value = 0 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$0.00');
        formatCellParams.value = '' as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$0.00');
        formatCellParams.value = null as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$0.00');
        formatCellParams.value = 123.456 as never;
        formattedCellValue = formattedValue(formatCellParams.value, formatCellParams.row, formatCellParams.colDef, formatCellParams.api);
        expect(formattedCellValue).toBe('$123.46');
      } else {
        expect(formattedValue).toBeUndefined();
      }
    });
  });

});
