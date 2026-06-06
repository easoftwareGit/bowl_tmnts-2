import { maxBrackets } from "./validation/constants";
import { NumericTextBox } from "@syncfusion/ej2-inputs";

export type OptionalIntegerEditArgs = {
  placeholder?: string;
  min?: number;
  max?: number;
  onCommit?: () => void;
  onAutoCommit?: () => void;
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
 *   @param {() => void} onAutoCommit - callback used to auto-commit after 3 digits are typed
 * }
 * @return {*}  {SyncfusionEditor}
 */
export const createOptionalIntegerEdit = ({
  placeholder,
  min = 0,
  max = maxBrackets,
  onCommit,
  onAutoCommit,
}: OptionalIntegerEditArgs): SyncfusionEditor => {
  let inputEl: HTMLInputElement | null = null;
  let numericObj: NumericTextBox | null = null;
  let actualInput: HTMLInputElement | null = null;

  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  let inputHandler: ((e: Event) => void) | null = null;
  let blurHandler: ((e: FocusEvent) => void) | null = null;

  let isAutoCommitting = false;

  /**
   * Sets the data-validate-now attribute on the input to control when Syncfusion validation occurs.
   * 
   * @param validate - whether to enable validation on the next input event
   */
  const setValidateNow = (validate: boolean): void => {
    const value = validate ? "true" : "false";

    if (actualInput) actualInput.dataset.validateNow = value;

    const hiddenInput = (numericObj as any)?.hiddenInput as
      | HTMLInputElement
      | undefined;

    if (hiddenInput) hiddenInput.dataset.validateNow = value;
  };

  /**
   * Parses the value from the input field
   * 
   * @returns {number | null} - parsed integer value or null if input is empty or invalid
   */
  const parseInputValue = (): number | null => {
    if (!actualInput) return null;

    const raw = actualInput.value.trim();
    if (raw === "") return null;

    const num = Number(raw);
    if (!Number.isFinite(num)) return null;
    if (!Number.isInteger(num)) return null;

    return Math.trunc(num);
  };

  /**
   * Syncs the numeric value from the input field
   * 
   * @returns {number | null} - parsed integer value or null if input is empty or invalid
   */
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

  /**
   * Syncs the input field from the numeric value
   */
  const normalizeAndNotify = (): void => {
    syncNumericFromInput();
    onCommit?.();
  };

  /**
   * try to Auto-commit after 3 digits are typed
   */
  const tryAutoCommit = (): void => {
    if (!actualInput) return;
    if (isAutoCommitting) return;

    const rawDigits = actualInput.value.replace(/\D/g, "");

    // Auto-commit only after exactly 3 typed digits:
    // 001, 099, 234, 300 
    // note: syncFusion allows 00# and 0## for autoCommit, 
    // but shows # or ## after committing. This is the desired behavior
    if (rawDigits.length !== 3) return;

    const value = Number(rawDigits);

    if (!Number.isInteger(value)) return;
    if (value < min || value > max) return;

    isAutoCommitting = true;

    actualInput.value = rawDigits;

    setValidateNow(true);
    normalizeAndNotify();

    setTimeout(() => {
      onAutoCommit?.();
      isAutoCommitting = false;
    }, 0);
  };

  return {
    create: (): HTMLInputElement => {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      return inputEl;
    },

    write: (args: {
      rowData: Record<string, unknown>;
      column: { field: string };
    }): void => {
      if (!inputEl) return;

      const rawValue = args.rowData[args.column.field];

      const initialValue: number | undefined =
        rawValue == null || rawValue === ""
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

      actualInput = numericObj.element as HTMLInputElement | null;
      if (!actualInput) return;

      setValidateNow(false);

      keydownHandler = (e: KeyboardEvent): void => {
        if (e.key === "Enter") {
          setValidateNow(true);
          normalizeAndNotify();
          return;
        }

        if (e.key === "Tab") {
          setValidateNow(true);
          normalizeAndNotify();
          return;
        }

        if (
          e.key.length === 1 ||
          e.key === "Backspace" ||
          e.key === "Delete"
        ) {
          setValidateNow(false);
        }
      };

      inputHandler = (): void => {
        setValidateNow(false);
        tryAutoCommit();
      };

      blurHandler = (): void => {
        setValidateNow(true);

        setTimeout(() => {
          normalizeAndNotify();
        }, 0);
      };

      actualInput.addEventListener("keydown", keydownHandler, true);
      actualInput.addEventListener("input", inputHandler);
      actualInput.addEventListener("blur", blurHandler);
    },

    read: (): number | null => {
      setValidateNow(true);
      return syncNumericFromInput();
    },

    destroy: (): void => {
      if (actualInput && keydownHandler) {
        actualInput.removeEventListener("keydown", keydownHandler, true);
      }

      if (actualInput && inputHandler) {
        actualInput.removeEventListener("input", inputHandler);
      }

      if (actualInput && blurHandler) {
        actualInput.removeEventListener("blur", blurHandler);
      }

      keydownHandler = null;
      inputHandler = null;
      blurHandler = null;
      actualInput = null;

      numericObj?.destroy();
      numericObj = null;
      inputEl = null;
      isAutoCommitting = false;
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
