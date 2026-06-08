import {
  createOptionalIntegerEdit,
  setNumericNull,
  isOptionalIntegerValid
} from "@/lib/syncfusionTools";
import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";

jest.mock("@/lib/mobileDevices/mobileDevices", () => ({
  isTouchDevice: jest.fn(),
}));

jest.mock("@syncfusion/ej2-inputs", () => {
  return {
    NumericTextBox: jest.fn().mockImplementation(function (options) {
      const instance = {
        options,
        element: document.createElement("input"),
        hiddenInput: document.createElement("input"),
        appendTo: mockAppendTo,
        setProperties: mockSetProperties,
        dataBind: jest.fn(),
        destroy: mockDestroy,
      };

      return instance;
    }),
  };
});
const mockAppendTo = jest.fn();
const mockSetProperties = jest.fn();
const mockDestroy = jest.fn();

describe("syncfusionTools", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    (isTouchDevice as jest.Mock).mockReturnValue(false);
  });

  describe("setNumericNull", () => {

    it("sets the NumericTextBox value to null", () => {
      const control = {
        setProperties: mockSetProperties,
        element: document.createElement("input"),
        dataBind: jest.fn(),
      } as any;

      setNumericNull(control);

      expect(mockSetProperties).toHaveBeenCalledWith(
        { value: null },
        true,
      );
    });

    it("clears the visible input value", () => {
      const input = document.createElement("input");
      input.value = "225";

      const control = {
        setProperties: mockSetProperties,
        element: input,
        dataBind: jest.fn(),
      } as any;

      setNumericNull(control);

      expect(control.element.value).toBe("");
    });

    it("clears the hidden input value when hiddenInput exists", () => {
      const hiddenInput = document.createElement("input");
      hiddenInput.value = "225";

      const control = {
        setProperties: mockSetProperties,
        element: document.createElement("input"),
        hiddenInput,
        dataBind: jest.fn(),
      } as any;

      setNumericNull(control);

      expect(hiddenInput.value).toBe("");
    });

    it("does not fail when hiddenInput does not exist", () => {
      const control = {
        setProperties: mockSetProperties,
        element: document.createElement("input"),
        dataBind: jest.fn(),
      } as any;

      expect(() => {
        setNumericNull(control);
      }).not.toThrow();
    });

    it("calls dataBind after clearing values", () => {
      const dataBind = jest.fn();

      const control = {
        setProperties: mockSetProperties,
        element: document.createElement("input"),
        dataBind,
      } as any;

      setNumericNull(control);

      expect(dataBind).toHaveBeenCalledTimes(1);
    });

  });

  describe("createOptionalIntegerEdit", () => {
    it("creates a text input", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Average",
      });

      const input = editor.create();

      expect(input).toBeInstanceOf(HTMLInputElement);
      expect(input.type).toBe("text");
    });

    it("initializes validateNow to false", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Score",
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      expect(
        numericInstance.element.dataset.validateNow,
      ).toBe("false");
    });

    it("sets validateNow false when typing", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Score",
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.dataset.validateNow = "true";

      numericInstance.element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "5",
          bubbles: true,
        }),
      );

      expect(
        numericInstance.element.dataset.validateNow,
      ).toBe("false");
    });

    it("creates NumericTextBox with integer options", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Average",
        min: 0,
        max: 300,
      });

      const input = editor.create();

      editor.write({
        rowData: { average: 210 },
        column: { field: "average" },
      });

      expect(mockAppendTo).toHaveBeenCalledWith(input);

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      expect(NumericTextBoxMock).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 210,
          decimals: 0,
          format: "n0",
          min: 0,
          max: 300,
          strictMode: false,
          showSpinButton: false,
          validateDecimalOnType: true,
          placeholder: "Average",
        }),
      );
    });

    it("read returns integer value from visible input", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Average",
      });

      editor.create();

      editor.write({
        rowData: { average: "" },
        column: { field: "average" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "225";

      const result = editor.read();

      expect(result).toBe(225);

      expect(mockSetProperties).toHaveBeenCalledWith(
        { value: 225 },
        true,
      );
    });

    it("read returns null for decimal integer input", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Average",
      });

      editor.create();

      editor.write({
        rowData: { average: "" },
        column: { field: "average" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "225.5";

      expect(editor.read()).toBeNull();
    });

    // it("read treats 0 as null", () => {
    //   const editor = createOptionalIntegerEdit({
    //     placeholder: "Brackets",
    //   });

    //   editor.create();

    //   editor.write({
    //     rowData: { brk1_brkts: 3 },
    //     column: { field: "brk1_brkts" },
    //   });

    //   const NumericTextBoxMock =
    //     jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

    //   const numericInstance = NumericTextBoxMock.mock.results[0].value;

    //   numericInstance.element.value = "0";

    //   expect(editor.read()).toBeNull();
    // });

    it("read returns 0 when input contains 0", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Score",
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "0";

      expect(editor.read()).toBe(0);
    });

    it("read returns null for blank input", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Score",
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "";

      expect(editor.read()).toBeNull();
    });

    it("calls onCommit on Enter", () => {
      const onCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        placeholder: "Brackets",
        onCommit,
      });

      editor.create();

      editor.write({
        rowData: { brk1_brkts: "" },
        column: { field: "brk1_brkts" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "4";

      numericInstance.element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
        }),
      );

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(numericInstance.element.dataset.validateNow).toBe("true");
    });

    it("calls onCommit on Tab", () => {
      const onCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        placeholder: "Brackets",
        onCommit,
      });

      editor.create();

      editor.write({
        rowData: { brk1_brkts: "" },
        column: { field: "brk1_brkts" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "4";

      numericInstance.element.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
        }),
      );

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(numericInstance.element.dataset.validateNow).toBe("true");
    });

    it("calls onCommit on blur", () => {
      jest.useFakeTimers();

      const onCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        placeholder: "Brackets",
        onCommit,
      });

      editor.create();

      editor.write({
        rowData: { brk1_brkts: "" },
        column: { field: "brk1_brkts" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance = NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "4";

      numericInstance.element.dispatchEvent(
        new FocusEvent("blur", {
          bubbles: true,
        }),
      );

      jest.runOnlyPendingTimers();

      expect(onCommit).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it("calls onAutoCommit after exactly three digits when typing - if autoCommit is enabled", () => {
      jest.useFakeTimers();

      const onAutoCommit = jest.fn();
      const onCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        min: 0,
        max: 300,
        onCommit,
        onAutoCommit,
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "234";

      numericInstance.element.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );

      jest.runOnlyPendingTimers();

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onAutoCommit).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it("does not auto commit for two digits", () => {
      const onAutoCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        onAutoCommit,
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "99";

      numericInstance.element.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );

      expect(onAutoCommit).not.toHaveBeenCalled();
    });    

    it("does not auto commit when value exceeds max", () => {
      const onAutoCommit = jest.fn();

      const editor = createOptionalIntegerEdit({
        min: 0,
        max: 300,
        onAutoCommit,
      });

      editor.create();

      editor.write({
        rowData: { score: "" },
        column: { field: "score" },
      });

      const NumericTextBoxMock =
        jest.requireMock("@syncfusion/ej2-inputs").NumericTextBox;

      const numericInstance =
        NumericTextBoxMock.mock.results[0].value;

      numericInstance.element.value = "999";

      numericInstance.element.dispatchEvent(
        new Event("input", {
          bubbles: true,
        }),
      );

      expect(onAutoCommit).not.toHaveBeenCalled();
    });

    it("destroys NumericTextBox", () => {
      const editor = createOptionalIntegerEdit({
        placeholder: "Average",
      });

      editor.create();

      editor.write({
        rowData: { average: 200 },
        column: { field: "average" },
      });

      editor.destroy();

      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe("isOptionalIntegerValid", () => {

    it("returns true for null", () => {
      expect(
        isOptionalIntegerValid(null, 0, 10)
      ).toBe(true);
    });

    it("returns true for undefined", () => {
      expect(
        isOptionalIntegerValid(undefined, 0, 10)
      ).toBe(true);
    });

    it("returns true for empty string", () => {
      expect(
        isOptionalIntegerValid("", 0, 10)
      ).toBe(true);
    });

    it("returns true for integer within range", () => {
      expect(
        isOptionalIntegerValid(5, 0, 10)
      ).toBe(true);
    });

    it("returns true for integer string within range", () => {
      expect(
        isOptionalIntegerValid("5", 0, 10)
      ).toBe(true);
    });

    it("returns true for min boundary", () => {
      expect(
        isOptionalIntegerValid(0, 0, 10)
      ).toBe(true);
    });

    it("returns true for max boundary", () => {
      expect(
        isOptionalIntegerValid(10, 0, 10)
      ).toBe(true);
    });

    it("returns false for decimal number", () => {
      expect(
        isOptionalIntegerValid(5.5, 0, 10)
      ).toBe(false);
    });

    it("returns false for decimal string", () => {
      expect(
        isOptionalIntegerValid("5.5", 0, 10)
      ).toBe(false);
    });

    it("returns false for value below min", () => {
      expect(
        isOptionalIntegerValid(-1, 0, 10)
      ).toBe(false);
    });

    it("returns false for value above max", () => {
      expect(
        isOptionalIntegerValid(11, 0, 10)
      ).toBe(false);
    });

    it("returns false for non numeric string", () => {
      expect(
        isOptionalIntegerValid("abc", 0, 10)
      ).toBe(false);
    });

  });

});