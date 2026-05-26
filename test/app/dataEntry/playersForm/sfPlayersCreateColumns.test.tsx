import {
  brktsColNameEnd,
  feeColNameEnd,
  hdcpColNameEnd,
  intHdcpColNameEnd,
  refundsColNameEnd,
  timeStampColNameEnd,
  validPosChars,
  entryFeeColName,
  divEntryHdcpColName,
  divEntryIntHdcpColName,
  entryNumBrktsColName,
  entryNumRefundsColName,
  timeStampColName,
  getBrktIdFromColName,
  getElimFee,
  getOnlyIntegerOrNull,
  getPotFee,
  isBrktsColumnName,
  isDivEntryFeeColumnName,
  isPotFeeColumnName,
  isElimFeeColumnName,
  isValidFee,
  valueGetterForMoney,
  valueParserForMoney,
  createStackedPlayerColumns,
  createOptionalMoneyEdit,  
  createPositionEdit,
} from "@/app/dataEntry/playersForm/sfCreatePlayerColumns";

import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";

jest.mock("@/lib/mobileDevices/mobileDevices", () => ({
  isTouchDevice: jest.fn(),
}));

jest.mock("@/lib/getName", () => ({
  getBrktOrElimName: jest.fn((obj) => obj.name ?? obj.id),
  getPotShortName: jest.fn((obj) => obj.pot_name ?? obj.id),
}));

const mockAppendTo = jest.fn();
const mockDestroy = jest.fn();
const mockSetProperties = jest.fn();
const mockDataBind = jest.fn();

jest.mock("@syncfusion/ej2-inputs", () => {
  return {
    NumericTextBox: jest.fn().mockImplementation(function (
      this: any,
      options
    ) {
      this.options = options;

      this.element = document.createElement("input");

      this.hiddenInput = document.createElement("input");

      this.appendTo = mockAppendTo;

      this.destroy = mockDestroy;

      this.setProperties = mockSetProperties;

      this.dataBind = mockDataBind;
    }),
  };
});

describe("sfCreateColumns helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (isTouchDevice as jest.Mock).mockReturnValue(false);
  });

  describe("constants", () => {
    it("exports correct suffix constants", () => {
      expect(brktsColNameEnd).toBe("_brkts");
      expect(feeColNameEnd).toBe("_fee");
      expect(hdcpColNameEnd).toBe("_hdcp");
      expect(intHdcpColNameEnd).toBe("_intHdcp");
      expect(refundsColNameEnd).toBe("_refunds");
      expect(timeStampColNameEnd).toBe("_timeStamp");
    });

    it("exports validPosChars regex", () => {
      expect(validPosChars.test("A")).toBe(true);
      expect(validPosChars.test("9")).toBe(true);
      expect(validPosChars.test("0")).toBe(false);
      expect(validPosChars.test("@")).toBe(false);
    });
  });

  describe("column name helpers", () => {
    it("creates entry fee column name", () => {
      expect(entryFeeColName("div1")).toBe("div1_fee");
    });

    it("creates handicap column name", () => {
      expect(divEntryHdcpColName("div1")).toBe("div1_hdcp");
    });

    it("creates integer handicap column name", () => {
      expect(divEntryIntHdcpColName("div1")).toBe("div1_intHdcp");
    });

    it("creates bracket count column name", () => {
      expect(entryNumBrktsColName("brk1")).toBe("brk1_brkts");
    });

    it("creates refund column name", () => {
      expect(entryNumRefundsColName("div1")).toBe("div1_refunds");
    });

    it("creates timestamp column name", () => {
      expect(timeStampColName("brk1")).toBe("brk1_timeStamp");
    });
  });

  describe("getBrktIdFromColName", () => {
    it("returns bracket id", () => {
      expect(getBrktIdFromColName("brk123_brkts")).toBe("brk123");
    });

    it("returns empty string for invalid column", () => {
      expect(getBrktIdFromColName("bad")).toBe("");
    });
  });

  describe("getElimFee", () => {
    const elims = [
      {
        id: "elm1",
        fee: 25,
      },
    ] as any;

    it("returns eliminator fee", () => {
      expect(getElimFee(elims, "elm1")).toBe(25);
    });

    it("returns 0 when not found", () => {
      expect(getElimFee(elims, "missing")).toBe(0);
    });

    it("returns 0 for invalid input", () => {
      expect(getElimFee([], "elm1")).toBe(0);
    });
  });

  describe("getPotFee", () => {
    const pots = [
      {
        id: "pot1",
        fee: 10,
      },
    ] as any;

    it("returns pot fee", () => {
      expect(getPotFee(pots, "pot1")).toBe(10);
    });

    it("returns 0 when not found", () => {
      expect(getPotFee(pots, "missing")).toBe(0);
    });
  });

  describe("getOnlyIntegerOrNull", () => {
    it("returns truncated integer", () => {
      expect(getOnlyIntegerOrNull(12.9)).toBe(12);
    });

    it("returns 0 for 0", () => {
      expect(getOnlyIntegerOrNull(0)).toBe(0);
    });

    it("returns null for NaN", () => {
      expect(getOnlyIntegerOrNull(NaN)).toBeNull();
    });
  });

  describe("column type checks", () => {
    it("detects bracket column", () => {
      expect(isBrktsColumnName("brk1_brkts")).toBe(true);
    });

    it("detects division fee column", () => {
      expect(isDivEntryFeeColumnName("div1_fee")).toBe(true);
    });

    it("detects pot fee column", () => {
      expect(isPotFeeColumnName("pot1_fee")).toBe(true);
    });

    it("detects eliminator fee column", () => {
      expect(isElimFeeColumnName("elm1_fee")).toBe(true);
    });

    it("returns false for invalid columns", () => {
      expect(isBrktsColumnName("abc")).toBe(false);
      expect(isDivEntryFeeColumnName("abc")).toBe(false);
      expect(isPotFeeColumnName("abc")).toBe(false);
      expect(isElimFeeColumnName("abc")).toBe(false);
    });
  });

  describe("isValidFee", () => {
    it("returns true for matching fee", () => {
      expect(isValidFee(10, 10)).toBe(true);
    });

    it("returns true for zero", () => {
      expect(isValidFee(0, 10)).toBe(true);
    });

    it("returns false for invalid fee", () => {
      expect(isValidFee(5, 10)).toBe(false);
    });

    it("returns false for NaN", () => {
      expect(isValidFee("abc", 10)).toBe(false);
    });
  });

  describe("valueGetterForMoney", () => {
    it("rounds money correctly", () => {
      expect(valueGetterForMoney("10.129")).toBe(10.13);
    });

    it("returns 0 for invalid input", () => {
      expect(valueGetterForMoney("abc")).toBe(0);
    });
  });

  describe("valueParserForMoney", () => {
    it("parses dollar string", () => {
      expect(valueParserForMoney("$10.25")).toBe(10.25);
    });

    it("returns number directly", () => {
      expect(valueParserForMoney(15)).toBe(15);
    });

    it("returns 0 for invalid value", () => {
      expect(valueParserForMoney("abc")).toBe(0);
    });
  });

  describe("createStackedColumns", () => {
    const divs = [
      {
        id: "div1",
        div_name: "Singles",
      },
    ] as any;

    const pots = [
      {
        id: "pot1",
        pot_name: "Scratch Pot",
        div_id: "div1",
        fee: 5,
      },
    ] as any;

    const brkts = [
      {
        id: "brk1",
        name: "Brackets",
        div_id: "div1",
      },
    ] as any;

    const elims = [
      {
        id: "elm1",
        name: "Elim",
        div_id: "div1",
        fee: 20,
      },
    ] as any;

    it("creates all stacked column groups", () => {
      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      expect(result).toHaveLength(6);

      expect(result[0].headerText).toBe("Players");
      expect(result[1].headerText).toBe("Divisions");
      expect(result[2].headerText).toBe("Pots");
      expect(result[3].headerText).toBe("Brackets");
      expect(result[4].headerText).toBe("Eliminators");
      expect(result[5].headerText).toBe("Total");
    });

    it("creates player columns", () => {
      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      const playersCols = result[0].columns;

      expect(playersCols.some((c) => c.field === "first_name")).toBe(true);
      expect(playersCols.some((c) => c.field === "last_name")).toBe(true);
      expect(playersCols.some((c) => c.field === "average")).toBe(true);
    });

    it("creates division fee column", () => {
      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      const divCols = result[1].columns;

      expect(
        divCols.some((c) => c.field === "div1_fee")
      ).toBe(true);
    });

    it("creates bracket columns", () => {
      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      const brktCols = result[3].columns;

      expect(
        brktCols.some((c) => c.field === "brk1_brkts")
      ).toBe(true);
    });

    it("creates total fee column", () => {
      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      const totalCols = result[5].columns;

      expect(totalCols[0].field).toBe("feeTotal");
    });

    it("uses touch widths when touch device", () => {
      (isTouchDevice as jest.Mock).mockReturnValue(true);

      const result = createStackedPlayerColumns(
        divs,
        pots,
        brkts,
        elims,
        40,
        1,
      );

      expect(result).toBeDefined();
    });
  });

  describe("createOptionalMoneyEdit", () => {
    it("creates a text input", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      const input = editor.create();

      expect(input).toBeInstanceOf(HTMLInputElement);
      expect(input.type).toBe("text");
    });

    it("creates NumericTextBox with money options", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      const input = editor.create();

      editor.write({
        rowData: { div1_fee: 25 },
        column: { field: "div1_fee" },
      });

      expect(mockAppendTo).toHaveBeenCalledWith(input);

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      expect(NumericTextBoxMock).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 25,
          decimals: 2,
          format: "n2",
          min: 0,
          strictMode: false,
          showSpinButton: false,
          validateDecimalOnType: true,
          placeholder: "Singles",
        }),
      );
    });

    it("uses strictMode true for Pot and Elim columns", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Scratch Pot",
        columnData: "Pot",
      });

      editor.create();

      editor.write({
        rowData: { pot1_fee: 5 },
        column: { field: "pot1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      expect(NumericTextBoxMock).toHaveBeenCalledWith(
        expect.objectContaining({
          strictMode: true,
        }),
      );
    });

    it("read returns rounded money value from visible input", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: "" },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.value = "$12.345";

      const result = editor.read();

      expect(result).toBe(12.35);

      expect(mockSetProperties).toHaveBeenCalledWith(
        { value: 12.35 },
        true,
      );

      expect(mockDataBind).toHaveBeenCalled();
    });

    it("read returns null and clears NumericTextBox when input is blank", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: 25 },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.value = "";

      const result = editor.read();

      expect(result).toBeNull();

      expect(mockSetProperties).toHaveBeenCalledWith(
        { value: null },
        true,
      );

      expect(numericInstance.element.value).toBe("");
      expect(numericInstance.hiddenInput.value).toBe("");
      expect(mockDataBind).toHaveBeenCalled();
    });

    it("read treats 0 as null", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: 25 },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.value = "0";

      expect(editor.read()).toBeNull();
    });

    it("sets validateNow true and calls onCommit on Enter", () => {
      const onCommit = jest.fn();

      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
        onCommit,
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: "" },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.value = "10";

      numericInstance.element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        }),
      );

      expect(numericInstance.element.dataset.validateNow).toBe("true");
      expect(numericInstance.hiddenInput.dataset.validateNow).toBe("true");
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it("sets validateNow false when user types", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: "" },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.dataset.validateNow = "true";

      numericInstance.element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "1",
          bubbles: true,
        }),
      );

      expect(numericInstance.element.dataset.validateNow).toBe("false");
    });

    it("calls onCommit on blur", () => {
      jest.useFakeTimers();

      const onCommit = jest.fn();

      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
        onCommit,
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: "" },
        column: { field: "div1_fee" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.instances[0];

      numericInstance.element.value = "10";

      numericInstance.element.dispatchEvent(
        new FocusEvent("blur", {
          bubbles: true,
        }),
      );

      jest.runOnlyPendingTimers();

      expect(onCommit).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it("destroys NumericTextBox", () => {
      const editor = createOptionalMoneyEdit({
        feeLabel: "Singles",
        columnData: "Div",
      });

      editor.create();

      editor.write({
        rowData: { div1_fee: 25 },
        column: { field: "div1_fee" },
      });

      editor.destroy();

      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe("createPositionEdit", () => {
    it("creates position input", () => {
      const editor = createPositionEdit();

      const input = editor.create();

      expect(input).toBeInstanceOf(HTMLInputElement);
      expect(input.type).toBe("text");
      expect(input.name).toBe("position");
      expect(input.maxLength).toBe(1);
      expect(input.autocomplete).toBe("off");
      expect(input.spellcheck).toBe(false);
      expect(input).toHaveStyle({ textTransform: "uppercase", });      
    });

    it("write normalizes initial value to uppercase single valid character", () => {
      const editor = createPositionEdit();

      const input = editor.create();

      editor.write({
        rowData: { position: "b@" },
        column: { field: "position" },
      });

      expect(input.value).toBe("B");
    });

    it("input event removes invalid characters", () => {
      const editor = createPositionEdit();

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.value = "@c2";

      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );

      expect(input.value).toBe("C");
    });

    it("read returns current position value", () => {
      const editor = createPositionEdit();

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.value = "D";

      expect(editor.read()).toBe("D");
    });

    it("calls onChange on blur", () => {
      const onChange = jest.fn();

      const editor = createPositionEdit(onChange);

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.dispatchEvent(
        new FocusEvent("blur", {
          bubbles: true,
        }),
      );

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange on Enter", () => {
      const onChange = jest.fn();

      const editor = createPositionEdit(onChange);

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        }),
      );

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange on Tab", () => {
      const onChange = jest.fn();

      const editor = createPositionEdit(onChange);

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
        }),
      );

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("does not call onChange for normal key", () => {
      const onChange = jest.fn();

      const editor = createPositionEdit(onChange);

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "A",
          bubbles: true,
        }),
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("removes event listeners on destroy", () => {
      const onChange = jest.fn();

      const editor = createPositionEdit(onChange);

      const input = editor.create();

      editor.write({
        rowData: { position: "" },
        column: { field: "position" },
      });

      editor.destroy();

      input.dispatchEvent(
        new FocusEvent("blur", {
          bubbles: true,
        }),
      );

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        }),
      );

      expect(onChange).not.toHaveBeenCalled();
    });
  });

});
