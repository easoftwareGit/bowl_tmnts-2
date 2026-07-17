import {
  createPfColumns,
  pfEntryAmountColName,
  pfEntryIdColName,
  pfEntryPercentColName,
  pfEntryPositionColName,
} from "@/app/dataEntry/prizeFunds/prizeFundGrid/sfCreatePfColumns";
import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import { createMoneyEdit } from "@/lib/syncfusionTools";
import { maxMoney } from "@/lib/validation/constants";

jest.mock("@/lib/mobileDevices/mobileDevices", () => ({
  isTouchDevice: jest.fn(),
}));

jest.mock("@/lib/syncfusionTools", () => ({
  createMoneyEdit: jest.fn(),
}));

const mockIsTouchDevice = jest.mocked(isTouchDevice);
const mockCreateMoneyEdit = jest.mocked(createMoneyEdit);

describe("createPfColumns", () => {
  const mockMoneyEdit = {
    create: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
    destroy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockIsTouchDevice.mockReturnValue(false);
    mockCreateMoneyEdit.mockReturnValue(mockMoneyEdit);
  });

  it("creates the expected column definitions", () => {
    const onHandleMoneyCellChange = jest.fn();

    const result = createPfColumns(onHandleMoneyCellChange);

    expect(result).toHaveLength(4);

    expect(result[0]).toEqual({
      field: pfEntryIdColName,
      headerText: "ID",
      isPrimaryKey: true,
      visible: false,
    });

    expect(result[1]).toEqual({
      field: pfEntryPositionColName,
      headerText: "Pos",
      width: "100",
      textAlign: "Center",
      allowEditing: false,
    });

    expect(result[2]).toMatchObject({
      field: pfEntryAmountColName,
      headerText: "Amount",
      width: "110",
      textAlign: "Right",
      format: "C2",
      allowEditing: true,
      editType: "numericEdit",
      edit: mockMoneyEdit,
    });

    expect(result[3]).toEqual({
      field: pfEntryPercentColName,
      headerText: "Percent",
      width: "80",
      textAlign: "Right",
      allowEditing: false,
      editType: "numericEdit",
      format: "p2",
      type: "number",
    });
  });

  it("creates the amount column money editor with the correct settings", () => {
    const onHandleMoneyCellChange = jest.fn();

    createPfColumns(onHandleMoneyCellChange);

    expect(mockCreateMoneyEdit).toHaveBeenCalledTimes(1);
    expect(mockCreateMoneyEdit).toHaveBeenCalledWith({
      onCommit: onHandleMoneyCellChange,
      feeLabel: "Amount",
      min: 1,
      max: maxMoney,
    });
  });

  it("passes undefined onCommit when no callback is supplied", () => {
    createPfColumns();

    expect(mockCreateMoneyEdit).toHaveBeenCalledWith({
      onCommit: undefined,
      feeLabel: "Amount",
      min: 1,
      max: maxMoney,
    });
  });

  it("uses the same widths on touch devices", () => {
    mockIsTouchDevice.mockReturnValue(true);

    const result = createPfColumns();

    expect(result[1].width).toBe("100");
    expect(result[2].width).toBe("110");
    expect(result[3].width).toBe("80");
  });

  it("validates amount values between 0 and maxMoney", () => {
    const result = createPfColumns();
    const amountCol = result.find(
      (col) => col.field === pfEntryAmountColName,
    );

    const moneyRange = amountCol?.validationRules?.moneyRange as [
      (args: { value: unknown }) => boolean,
      string,
    ];

    expect(moneyRange[0]({ value: 0 })).toBe(true);
    expect(moneyRange[0]({ value: 1 })).toBe(true);
    expect(moneyRange[0]({ value: maxMoney })).toBe(true);

    expect(moneyRange[0]({ value: -1 })).toBe(false);
    expect(moneyRange[0]({ value: maxMoney + 1 })).toBe(false);
    expect(moneyRange[0]({ value: "abc" })).toBe(false);

    expect(moneyRange[1]).toBe(`Amount must be between 0 and ${maxMoney}`);
  });

  it("allows numeric string amount values", () => {
    const result = createPfColumns();
    const amountCol = result.find(
      (col) => col.field === pfEntryAmountColName,
    );

    const moneyRange = amountCol?.validationRules?.moneyRange as [
      (args: { value: unknown }) => boolean,
      string,
    ];

    expect(moneyRange[0]({ value: "25" })).toBe(true);
    expect(moneyRange[0]({ value: "25.5" })).toBe(true);
  });
});