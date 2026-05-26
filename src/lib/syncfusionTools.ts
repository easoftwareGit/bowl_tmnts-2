import { maxBrackets } from "./validation/constants";
import { NumericTextBox } from "@syncfusion/ej2-inputs";

export type OptionalIntegerEditArgs = {
  placeholder?: string;
  min?: number;
  max?: number;
  onCommit?: () => void;
};

export type SyncfusionEditor = {
  create: () => HTMLInputElement;
  write: (args: {
    rowData: Record<string, unknown>;
    column: { field: string };
  }) => void;
  read: () => number | string | null;
  destroy: () => void;
};

/**
 * Sets the value of a Syncfusion NumericTextBox control to null
 * 
 * NumericTextBox supports an empty value at runtime, but its TypeScript
 * definition treats value as a number. The setProperties cast is used so
 * the editor can store null as the empty value.
 *
 * Clearing only the control value is not enough; the visible input and
 * Syncfusion's internal hidden input also need to be cleared so the Grid
 * does not read a stale value during Tab or Enter commits.
 * 
 * @param {NumericTextBox} control
 */
export const setNumericNull = (control: NumericTextBox): void => {
  // set the value to null (clears Syncfusion control value)
  control.setProperties({ value: null as unknown as number }, true);

  // clear the visible input text (clears what the user sees)
  control.element.value = "";

  // clear the hidden input used internally by Syncfusion
  const hiddenInput = (control as any).hiddenInput as HTMLInputElement | undefined;
  if (hiddenInput) {
    hiddenInput.value = "";
  }

  // update the control
  control.dataBind();
};

/**
 * Create an optional money editor for a column
 *
 * @param {OptionalIntegerEditArgs} {
 *   @param {string} placeholder - placeholder label shown in the editor
 *   @param {number} min - minimum value, with a default of 0,
 *   @param {number} max - maximum value, with a default of maxBrackets,
 *   @param {() => void} onCommit - callback used to recalculate totals
 * }
 * @return {*}  {SyncfusionEditor}
 */
export const createOptionalIntegerEdit = ({
  placeholder,
  min = 0,
  max = maxBrackets,
  onCommit,
}: OptionalIntegerEditArgs): SyncfusionEditor => {
  let inputEl: HTMLInputElement | null = null;
  let numericObj: NumericTextBox | null = null;
  let actualInput: HTMLInputElement | null = null;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  let blurHandler: ((e: FocusEvent) => void) | null = null;

  // set validateNow to true or false for both the visible and hidden inputs
  const setValidateNow = (validate: boolean): void => {
    const value = validate ? "true" : "false";

    if (actualInput) actualInput.dataset.validateNow = value;
    
    const hiddenInput = (numericObj as any)?.hiddenInput as
      | HTMLInputElement
      | undefined;

    if (hiddenInput) hiddenInput.dataset.validateNow = value;    
  };

  // parse the visible textbox value, not just the numericObj.value
  const parseInputValue = (): number | null => {
    if (!actualInput) return null;

    const raw = actualInput.value.trim();

    if (raw === "") return null;

    const num = Number(raw);

    if (!Number.isFinite(num)) return null;
    if (!Number.isInteger(num)) return null;
    if (num === 0) return null;

    return Math.trunc(num);
  };

  // parse the visible textbox value, not just the numericObj.value
  const syncNumericFromInput = (): number | null => {
    if (!numericObj) return null;

    const parsed = parseInputValue();

    if (parsed == null) {
      setNumericNull(numericObj);
      return null;
    }

    numericObj.setProperties({ value: parsed }, true);
    numericObj.dataBind();

    return parsed;
  };

  // normalize the input and calls onCommit callback (recalcualte total) if provided
  const normalizeAndNotify = (): void => {
    syncNumericFromInput();
    onCommit?.();
  };

  return {
    // create the input element
    create: (): HTMLInputElement => {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      return inputEl;
    },

    // write the value when row goes into edit mode
    write: (args: {
      rowData: Record<string, unknown>;
      column: { field: string };
    }): void => {
      if (!inputEl) return;

      // gets the current value of the field
      const rawValue = args.rowData[args.column.field];
      // convert it to a number (use undefined if null, empty string or 0)
      const initialValue: number | undefined =
        rawValue == null || rawValue === "" || Number(rawValue) === 0
          ? undefined
          : Number(rawValue);

      numericObj = new NumericTextBox({
        value: initialValue,
        decimals: 0,
        format: "n0",
        min,
        max,
        strictMode: false,
        showSpinButton: false,
        validateDecimalOnType: true,
        placeholder,
      });

      numericObj.appendTo(inputEl);
      // get the input element
      actualInput = numericObj.element as HTMLInputElement | null;
      if (!actualInput) return;

      // while typing, do not show exact-fee validation yet
      setValidateNow(false);

      // handle keydown and blur
      keydownHandler = (e: KeyboardEvent): void => {
        if (e.key === "Enter") {
          // set the flag to show exact-fee validation          
          setValidateNow(true);
          normalizeAndNotify();    
          return;
        }

        if (e.key === "Tab") {
          // set the flag to show exact-fee validation          
          setValidateNow(true);
          normalizeAndNotify();
        }

        // If the user starts typing or deleting again, suppress 
        // validation until they leave or commit the cell.
        if (
          e.key.length === 1 ||
          e.key === "Backspace" ||
          e.key === "Delete"
        ) {
          setValidateNow(false);          
        }
      };

      blurHandler = (): void => {
        // set the flag to show exact-fee validation        
        setValidateNow(true);
        // let blur formatting finish first
        setTimeout(() => {
          normalizeAndNotify();
        }, 0);
      };

      // actualInput.addEventListener("keydown", keydownHandler);
      actualInput.addEventListener("keydown", keydownHandler, true);
      actualInput.addEventListener("blur", blurHandler);
    },

    read: (): number | null => {
      setValidateNow(true);
      // VERY IMPORTANT:
      // force one final sync right before Grid reads the editor value
      return syncNumericFromInput();
    },

    destroy: (): void => {
      if (actualInput && keydownHandler) {
        actualInput.removeEventListener("keydown", keydownHandler, true);
      }

      if (actualInput && blurHandler) {
        actualInput.removeEventListener("blur", blurHandler);
      }

      keydownHandler = null;
      blurHandler = null;
      actualInput = null;

      numericObj?.destroy();
      numericObj = null;
      inputEl = null;
    },
  };
};

/**
 * Checks if a value is an integer between min and max
 *
 * @param {unknown} value - value to check
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {boolean} - true if value is an integer between min and max
 */
export const isOptionalIntegerValid = (
  value: unknown,
  min: number,
  max: number
): boolean => {
  if (value == null || value === "") return true;
  const num = Number(value);
  if (!Number.isInteger(num)) return false;
  return num >= min && num <= max;
};
