import type {
  brktType,
  divType,
  elimType,
  potType,
  syncfusionColumnDef,
  syncfusionStackedColDef,
  SyncfusionValidationArgs,
} from "@/lib/types/types";
import {
  maxAverage,
  maxBrackets,
  maxMoney,
} from "@/lib/validation/constants";
import { getBrktOrElimName, getPotShortName } from "@/lib/getName";
import { isTouchDevice } from "@/lib/mobileDevices/mobileDevices";
import { NumericTextBox } from "@syncfusion/ej2-inputs";
import {
  createOptionalIntegerEdit,
  isOptionalIntegerValid,
  setNumericNull,
  SyncfusionEditor
} from "@/lib/syncfusionTools";

export const brktsColNameEnd = "_brkts";
export const feeColNameEnd = "_fee";
export const hdcpColNameEnd = "_hdcp";
export const intHdcpColNameEnd = "_intHdcp";
export const refundsColNameEnd = "_refunds";
export const timeStampColNameEnd = "_timeStamp";

export const validPosChars = /^[a-zA-Z1-9]+$/;

export const feeColWidthTouch = 120;
export const feeColWidthNoTouch = 120;

type columnDataType = 'Div' | 'Pot' | 'Elim';
type MoneyInput = number | string | null | undefined;

export const entryFeeColName = (id: string) => id + feeColNameEnd;
export const divEntryHdcpColName = (div_id: string) => div_id + hdcpColNameEnd;
export const divEntryIntHdcpColName = (div_id: string) => div_id + intHdcpColNameEnd;
export const entryNumBrktsColName = (id: string) => id + brktsColNameEnd;
export const entryNumRefundsColName = (id: string) => id + refundsColNameEnd;
export const timeStampColName = (id: string) => id + timeStampColNameEnd;

const averageValidationRules = {
  averageRange: [
    (args: { value: unknown }) => isOptionalIntegerValid(args.value, 0, maxAverage),
    `Average must be an integer from 0 to ${maxAverage}`,
  ],
};

/**
 * validation rules for lane
 *
 * @param {number} minLane - minimum lane
 * @param {number} maxLane - maximum lane
 * @returns {Record<string, unknown>} - validation rules for lane
 */
const laneValidationRules = (minLane: number, maxLane: number) => ({
  laneRange: [
    (args: { value: unknown }) => isOptionalIntegerValid(args.value, minLane, maxLane),
    `Lane must be an integer from ${minLane} to ${maxLane}`,
  ],
});

const moneyValidationRules = (label: string, min = 0, max = maxMoney) => ({
  moneyRange: [
    (args: { value: unknown }) => isOptionalNumberValid(args.value, min, max),
    `${label} must be between ${min} and ${max}`,
  ],
});

const positionValidationRules = {
  positionRule: [
    (args: { value: unknown }) => {
      const val = String(args.value ?? "").toUpperCase();
      return val === "" || (val.length === 1 && validPosChars.test(val));
    },
    "Position must be one character A-Z or 1-9",
  ],
};

type OptionalMoneyEditArgs = {
  feeLabel: string;
  onCommit?: () => void;
  columnData: columnDataType;
};

/**
 * Creates a custom Syncfusion NumericTextBox editor for optional money fields.
 *
 * Used for division, pot, and eliminator fee columns where:
 * - blank means no entry
 * - 0 means no entry
 * - valid money values are saved as numbers rounded to 2 decimals
 *
 * The editor normalizes values during change, Tab, Enter, blur, and read().
 * Enter must normalize synchronously because Syncfusion commits the row
 * immediately after Enter is pressed.
 *
 * @param {OptionalMoneyEditArgs} args - Editor setup options
 *    @param {string} args.feeLabel - Placeholder label shown in the money editor
 *    @param {() => void} [args.onCommit] - Optional callback used to recalculate totals
 *    @param {columnDataType} args.columnData - Column data: Div, Pot, or Elim
 * @returns {SyncfusionEditor} - Syncfusion custom editor object
 */
export const createOptionalMoneyEdit = ({
  feeLabel, 
  onCommit,
  columnData,
}: OptionalMoneyEditArgs): SyncfusionEditor => {
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
    if (!numericObj || !actualInput) return null;
    
    // get what the user typed
    const raw = actualInput.value.trim();

    // if the user cleared the input, return null
    if (raw === "") return null;

    // allow values like $10.00 and 1,000.00 to be normal numbers
    const cleaned = raw.replace(/[$,]/g, "");
    const num = Number(cleaned);

    // convert invalid values and zero to no entry
    if (!Number.isFinite(num)) return null;
    if (num === 0) return null;

    // round to 2 decimal places
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  // parse the visible textbox value, not just the numericObj.value
  const syncNumericFromInput = (): number | null => {
    if (!numericObj) return null;

    // get the cleaned value
    const parsed = parseInputValue();

    // if user cleared the input, entered 0 or an invalid value, set value to null
    if (parsed == null) {
      setNumericNull(numericObj);
      return null;
    }

    // set the value
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
        decimals: 2,
        format: "n2",
        min: 0,
        max: maxMoney,        
        strictMode: columnData === "Div" ? false : true,
        showSpinButton: false,
        validateDecimalOnType: true,
        placeholder: feeLabel,
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

        // If the user starts typing or deleting again, suppress exact-fee
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

      // add event handlers      
      actualInput.addEventListener("keydown", keydownHandler);
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
        actualInput.removeEventListener("keydown", keydownHandler);
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
 * Creates the position editor, so only 
 *  accepts A-Z and 1-9
 *  accepts up to 1 character
 *  sets the value to upper case
 *  calls the onCommit function when the value changes
 *  returns a string
 *
 * @param {() => void} onChange - the function to call when the value changes
 * @return {SyncfusionEditor} -  Syncfusion custom editor object
 */
export const createPositionEdit = (onChange?: () => void): SyncfusionEditor => {
  let positionInput: HTMLInputElement | null = null;
  let positionInputInputHandler: ((e: Event) => void) | null = null;
  let positionInputBlurHandler: ((e: FocusEvent) => void) | null = null;
  let positionInputKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

  return {
    // create the input
    create: (): HTMLInputElement => {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "position";
      input.maxLength = 1;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.style.textTransform = "uppercase";
      positionInput = input;
      return input;
    },

    // update the input
    write: (args: {
      rowData: Record<string, unknown>;
      column: { field: string };
    }): void => {
      if (!positionInput) return;

      // get the raw value
      const rawValue = String(args.rowData[args.column.field] ?? "");
      // make sure value is upper case, A-Z or 1-9, and only 1 character
      positionInput.value = rawValue
        .toUpperCase()
        .replace(/[^A-Z1-9]/g, "")
        .slice(0, 1);

      // keep typed value valid, but do NOT trigger lanePos update yet
      positionInputInputHandler = (e: Event): void => {
        // get the typed value
        const target = e.target as HTMLInputElement;
        // make sure value is upper case, A-Z or 1-9, and only 1 character
        const cleaned = target.value
          .toUpperCase()
          .replace(/[^A-Z1-9]/g, "")
          .slice(0, 1);

        // if the value has changed, update it
        if (target.value !== cleaned) {
          target.value = cleaned;
        }
      };

      // commit when the editor loses focus
      positionInputBlurHandler = (): void => {
        onChange?.();
      };

      // commit when user accepts/moves with Enter or Tab
      positionInputKeydownHandler = (e: KeyboardEvent): void => {
        if (e.key === "Enter" || e.key === "Tab") {
          onChange?.();
        }
      };

      // add event listeners
      positionInput.addEventListener("input", positionInputInputHandler);
      positionInput.addEventListener("blur", positionInputBlurHandler);
      positionInput.addEventListener("keydown", positionInputKeydownHandler);
    },

    // return the current value
    read: (): string => {
      return positionInput?.value ?? "";
    },

    // remove event listeners
    destroy: (): void => {
      if (positionInput) {
        if (positionInputInputHandler) {
          positionInput.removeEventListener("input", positionInputInputHandler);
        }
        if (positionInputBlurHandler) {
          positionInput.removeEventListener("blur", positionInputBlurHandler);
        }
        if (positionInputKeydownHandler) {
          positionInput.removeEventListener("keydown", positionInputKeydownHandler);
        }
      }

      positionInputInputHandler = null;
      positionInputBlurHandler = null;
      positionInputKeydownHandler = null;
      positionInput = null;
    },
  };
};

/**
 * gets the bracket id from a column name
 * 
 * @param {string} colName - column name to check
 * @returns {string} - bracket id
 */
export const getBrktIdFromColName = (colName: string): string => {
  if (!isBrktsColumnName(colName)) return "";
  const sliceLength = brktsColNameEnd.length * -1;
  return colName.slice(0, sliceLength);
};

/**
 * gets the eliminator fee
 * 
 * @param {elimType[]} elims - array of tournament eliminators
 * @param {string} elimId - eliminator id
 * @returns {number} - eliminator fee 
 */
export const getElimFee = (elims: elimType[], elimId: string): number => {
  if (!elims || elims.length === 0 || !elimId) return 0;
  const elim = elims.find((e) => e.id === elimId);
  return elim ? Number(elim.fee) : 0;
};

/**
 * Returns a number or null
 * 
 * @param {number} value - value to check
 * @returns {number | null} - number or null 
 */
export const getOnlyIntegerOrNull = (value: number): number | null => {
  if ((!value || isNaN(value) || typeof value === "string") && value !== 0) {
    return null;
  }
  return Math.trunc(value);
};

/**
 * gets the pot fee
 * 
 * @param {potType[]} pots - array of tournament pots
 * @param {string} potId - id of pot
 * @returns {number} - pot fee 
 */
export const getPotFee = (pots: potType[], potId: string): number => {
  if (!pots || pots.length === 0 || !potId) return 0;
  const pot = pots.find((p) => p.id === potId);
  return pot ? Number(pot.fee) : 0;
};

/**
 * Checks if a column name is a number of brackets column
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a number of brackets column
 */
export const isBrktsColumnName = (colName: string): boolean => {
  if (!colName || typeof colName !== "string") return false;
  return colName.startsWith("brk") && colName.endsWith(brktsColNameEnd);
};

/**
 * Checks if a column name is a division entry fee column
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a division entry fee column
 */
export const isDivEntryFeeColumnName = (colName: string): boolean => {
  if (!colName) return false;
  return colName.startsWith("div") && colName.endsWith(feeColNameEnd);
};

/**
 * Checks if a column name is a pot fee column
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is a pot fee column
 */
export const isPotFeeColumnName = (colName: string): boolean => {
  if (!colName || typeof colName !== "string") return false;
  return colName.startsWith("pot") && colName.endsWith(feeColNameEnd);
};

/**
 * Checks if a column name is an eliminator fee column
 * 
 * @param {string} colName - column name to check
 * @returns {boolean} - true if column name is an eliminator fee column
 */
export const isElimFeeColumnName = (colName: string): boolean => {
  if (!colName || typeof colName !== "string") return false;
  return colName.startsWith("elm") && colName.endsWith(feeColNameEnd);
};

/**
 * Checks if a value is a number between min and max
 *
 * @param {unknown} value - value to check
 * @param {number} min - minimum value
 * @param {number} max - maximum value
 * @return {boolean} - true if value is a number between min and max
 */
const isOptionalNumberValid = (
  value: unknown,
  min: number,
  max: number
): boolean => {
  if (value == null || value === "") return true;
  const num = Number(value);
  if (Number.isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Checks if an entry fee is valid
 * 
 * @param {number | string} value - entry fee
 * @param {number} fee - fee  
 * @returns {boolean} - true if entry fee === 0 || entry fee === fee 
 */
export const isValidFee = (value: number | string, fee: number): boolean => {
  if (value == null) return true;
  if (typeof value === "object") return false;
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return false;
  return num === 0 || num === fee;
};

/**
 * Converts a MoneyInput to a number
 * 
 * @param {MoneyInput} value - value to get number from
 * @returns {number} - number 
 */
export const valueGetterForMoney = (value: MoneyInput): number => {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Converts a MoneyInput to a number
 * 
 * @param {MoneyInput} value - value to parse
 * @returns {number} - number 
 */
export const valueParserForMoney = (value: MoneyInput): number => {
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace("$", "").trim());
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "number") return value;
  return 0;
};

/**
 * Creates stacked columns
 * 
 * @param divs - tournament divisions
 * @param pots - tournament pots 
 * @param brkts - tournament brackets 
 * @param elims - tournament eliminators
 * @param maxLane - maximum lane
 * @param minLane - minimum lane 
 * @param onLaneOrPosChange - on lane or position change
 * @param onHandleDivPotElimFeeChange - on handle div, pot, elim fee change
 * @returns {syncfusionStackedColDef[]} - stacked columns 
 */
export const createStackedPlayerColumns = (
  divs: divType[],
  pots: potType[],
  brkts: brktType[],
  elims: elimType[],
  maxLane: number,
  minLane: number,
  onLaneOrPosChange?: () => void,
  onHandleDivPotElimFeeChange?: () => void,
  onNumBrktChange?: (brktCol: string) => void,
  onAverageChange?: () => void,
): syncfusionStackedColDef[] => {
  const isTouch = isTouchDevice();

  const averageColWidth = isTouch ? "100" : "100";
  const laneColWidth = isTouch ? "95" : "95";
  const lanePosColWidth = isTouch ? "100" : "100";
  const nameWidth = isTouch ? "110" : "110";
  const positionColWidth = isTouch ? "100" : "100";
  const feeColWidth = isTouch ? String(feeColWidthTouch) : String(feeColWidthNoTouch);
  const hdcpColWidth = isTouch ? "80" : "80";
  const numBrktsColWidth = isTouch ? "120" : "120";
  const brktFeeColWidth = isTouch ? "100" : "100";
  const potsColWith = isTouch ? "120" : String(feeColWidthNoTouch);
  const elimColWidth = isTouch ? "120" : String(feeColWidthNoTouch);
  const totalColWidth = isTouch ? "120" : String(feeColWidthNoTouch);

  /**
   * Checks if an entry value is valid
   *
   * @param {unknown} value - value from cell entry to check 
   * @return {boolean} - true if entry value is valid
   */
  const hasEntryValue = (value: unknown): boolean => {
    if (value === null || value === undefined || value === "") return false;

    const num = Number(value);
    return Number.isFinite(num) && num > 0;
  };

  /**
   * Gets the value of another field's editor input within the same Syncfusion edit row.
   *
   * @param {(HTMLInputElement | undefined)} element - The current editor input element (args.element from Syncfusion validation) 
   * @param {string} fieldName - The target field name (column.field) to retrieve from the same row 
   * @return {(string | null)} - The value of the input element in the same edit row, or null if not found / not in edit mode
   */
  const getSameEditRowInputValue = (
    element: HTMLInputElement | undefined,
    fieldName: string
  ): string | null => {
    // get the DOM table row that the input element is in
    const row = element?.closest("tr");
    if (!row) return null;

    // get the desired input element in the same row
    const input = row.querySelector<HTMLInputElement>(
      `[name="${fieldName}"]`
    );

    // return the value of the input element
    return input?.value ?? null;
  }

  const playersColumns: syncfusionColumnDef[] = [
    {
      field: "first_name",
      headerText: "First Name",
      width: nameWidth,
      validationRules: {
        required: [(_args: { value: unknown }) => true, "First Name is required"],
      },
      customAttributes: { class: "group-players" },
    },
    {
      field: "last_name",
      headerText: "Last Name",
      width: nameWidth,
      validationRules: {
        required: [(_args: { value: unknown }) => true, "Last Name is required"],
      },
      customAttributes: { class: "group-players" },
    },
    {
      field: "average",
      headerText: "Average",
      width: averageColWidth,
      textAlign: "Center",
      type: "number",
      editType: "numericedit",
      edit: createOptionalIntegerEdit({
        placeholder: "Average",
        min: 0,
        max: maxAverage,
        onCommit: onAverageChange,
      }),      
      validationRules: averageValidationRules,
      customAttributes: { class: "group-players" },
    },
    {
      field: "lane",
      headerText: "Lane #",
      width: laneColWidth,
      textAlign: "Center",
      type: "number",
      editType: "numericedit",
      edit: {
        params: {
          decimals: 0,
          format: "n0",
          min: 0,
          max: maxLane,
          showSpinButton: false,
          validateDecimalOnType: true,
        }
      },
      validationRules: laneValidationRules(minLane, maxLane),
      customAttributes: { class: "group-players" },
    },
    {
      field: "position",
      headerText: "Position",
      width: positionColWidth,
      textAlign: "Center",
      editType: "maskededit",
      edit: createPositionEdit(onLaneOrPosChange),
      validationRules: positionValidationRules,
      customAttributes: { class: "group-players" },
    },
    {
      field: "lanePos",
      headerText: "Lane-Pos",
      width: lanePosColWidth,
      textAlign: "Center",
      allowEditing: false,      
      customAttributes: { class: "group-players" },      
    },
  ];

  const divColumns: syncfusionColumnDef[] = [];
  divs.forEach((div) => {
    divColumns.push({
      field: entryFeeColName(div.id),
      headerText: div.div_name,
      width: feeColWidth,
      textAlign: "Right",
      type: "number",
      format: "C2",
      editType: "numericedit",      
      edit: createOptionalMoneyEdit({
        feeLabel: div.div_name,
        onCommit: onHandleDivPotElimFeeChange,
        columnData: "Div",
      }),
      validationRules: moneyValidationRules(div.div_name),
      customAttributes: { class: "group-divs" },
    });

    divColumns.push({
      field: divEntryHdcpColName(div.id),
      headerText: "HDCP",
      width: hdcpColWidth,
      textAlign: "Center",
      type: "number",
      allowEditing: false,
      customAttributes: { class: "group-divs" },
    });
  });

  const potColumns: syncfusionColumnDef[] = pots.map((pot) => ({
    field: entryFeeColName(pot.id),
    headerText: getPotShortName(pot, divs),
    width: potsColWith,
    textAlign: "Right",    
    format: "C2",
    type: "number",
    editType: "numericedit",    
    edit: createOptionalMoneyEdit({
      feeLabel: getPotShortName(pot, divs),
      onCommit: onHandleDivPotElimFeeChange,
      columnData: "Pot",
    }),
    validationRules: {
      potDivisionEntryRule: [
        (args: SyncfusionValidationArgs) => {
          const input = args.element as HTMLInputElement | undefined;
          const validateNow = input?.dataset.validateNow === "true";

          if (!validateNow) return true;
          if (args.value == null || args.value === "") return true;

          const val = Number(args.value);

          // no entry → valid
          if (!Number.isFinite(val) || val === 0) return true;

          const divFeeCol = entryFeeColName(pot.div_id);
          const divFeeValue = getSameEditRowInputValue(input, divFeeCol);

          return hasEntryValue(divFeeValue);
        },
        `${getPotShortName(pot, divs)} requires the player to be entered in its division.`,
      ],

      potExactFeeRule: [
        (args: SyncfusionValidationArgs) => {
          const input = args.element as HTMLInputElement | undefined;
          const validateNow = input?.dataset.validateNow === "true";

          if (!validateNow) return true;
          if (args.value == null || args.value === "") return true;

          const val = Number(args.value);

          return (
            Number.isFinite(val) &&
            (val === Number(pot.fee) || val === 0)
          );
        },
        `${getPotShortName(pot, divs)} must be blank or ${Number(pot.fee).toFixed(2)}`,
      ],
    },    
    customAttributes: { class: "group-pots" },
  }));

  const brktColumns: syncfusionColumnDef[] = [];
  brkts.forEach((brkt) => {
    const brktColName = entryNumBrktsColName(brkt.id);

    brktColumns.push({
      field: entryNumBrktsColName(brkt.id),
      headerText: getBrktOrElimName(brkt, divs),
      width: numBrktsColWidth,
      textAlign: "Center",
      type: "number",
      editType: "numericedit",
      edit: createOptionalIntegerEdit({
        placeholder: getBrktOrElimName(brkt, divs),
        min: 0,
        max: maxBrackets,
        onCommit: () => onNumBrktChange?.(brktColName),
      }),
      // validationRules: bracketCountValidationRules,
      validationRules: {
        brktDivisionEntryRule: [
          (args: SyncfusionValidationArgs) => {
            const input = args.element as HTMLInputElement | undefined;
            const validateNow = input?.dataset.validateNow === "true";

            if (!validateNow) return true;
            if (args.value == null || args.value === "") return true;

            const val = Number(args.value);

            // no entry → valid
            if (!Number.isFinite(val) || val === 0) return true;

            const divFeeCol = entryFeeColName(brkt.div_id);
            const divFeeValue = getSameEditRowInputValue(input, divFeeCol);

            return hasEntryValue(divFeeValue);
          },
          `${getBrktOrElimName(brkt, divs)} requires the player to be entered in its division.`,
        ],

        brktRangeRule: [
          (args: SyncfusionValidationArgs) => {
            const input = args.element as HTMLInputElement | undefined;
            const validateNow = input?.dataset.validateNow === "true";

            if (!validateNow) return true;                    

            return (isOptionalIntegerValid(args.value, 0, maxBrackets));
            
          },
          `Bracket count must be an integer from 0 to ${maxBrackets}`,
        ],
      },    

      customAttributes: { class: "group-brkts" },
    });

    brktColumns.push({
      field: entryFeeColName(brkt.id),
      headerText: "Fee",
      width: brktFeeColWidth,
      textAlign: "Right",
      type: "number",
      format: "C2",
      allowEditing: false,
      customAttributes: { class: "group-brkts" },
    });
  });

  const elimColumns: syncfusionColumnDef[] = elims.map((elim) => ({
    field: entryFeeColName(elim.id),
    headerText: getBrktOrElimName(elim, divs),
    width: elimColWidth,
    textAlign: "Right",
    format: "C2",
    type: "number",
    editType: "numericedit",    
    edit: createOptionalMoneyEdit({
      feeLabel: getBrktOrElimName(elim, divs),
      onCommit: onHandleDivPotElimFeeChange,
      columnData: "Elim",
    }),
    validationRules: {
      elimDivisionEntryRule: [
        (args: SyncfusionValidationArgs) => {
          const input = args.element as HTMLInputElement | undefined;
          const validateNow = input?.dataset.validateNow === "true";

          if (!validateNow) return true;
          if (args.value == null || args.value === "") return true;

          const val = Number(args.value);

          // no entry → valid
          if (!Number.isFinite(val) || val === 0) return true;

          const divFeeCol = entryFeeColName(elim.div_id);
          const divFeeValue = getSameEditRowInputValue(input, divFeeCol);

          return hasEntryValue(divFeeValue);
        },
        `${getBrktOrElimName(elim, divs)} requires the player to be entered in its division.`,
      ],

      elimExactFeeRule: [
        (args: SyncfusionValidationArgs) => {
          const input = args.element as HTMLInputElement | undefined;
          const validateNow = input?.dataset.validateNow === "true";

          if (!validateNow) return true;
          if (args.value == null || args.value === "") return true;

          const val = Number(args.value);

          return (
            Number.isFinite(val) &&
            (val === Number(elim.fee) || val === 0)
          );
        },
        `${getBrktOrElimName(elim, divs)} must be blank or ${Number(elim.fee).toFixed(2)}`,
      ],
    },
    customAttributes: { class: "group-elims" },
  }));

  const totalColumns: syncfusionColumnDef[] = [
    {
      field: "feeTotal",
      headerText: "Total Fee",
      width: totalColWidth,
      textAlign: "Center",
      type: "number",
      format: "C2",
      allowEditing: false,
      customAttributes: { class: "group-total" },
    },
  ];

  return [
    {
      headerText: "Players",
      customAttributes: { class: "group-players" },
      columns: playersColumns,
      textAlign: "Center",      
    },
    {
      headerText: "Divisions",
      customAttributes: { class: "group-divs" },
      columns: divColumns,
      textAlign: "Center",
    },
    {
      headerText: "Pots",
      customAttributes: { class: "group-pots" },
      columns: potColumns,
      textAlign: "Center",
    },
    {
      headerText: "Brackets",
      customAttributes: { class: "group-brkts" },
      columns: brktColumns,
      textAlign: "Center",
    },
    {
      headerText: "Eliminators",
      customAttributes: { class: "group-elims" },
      columns: elimColumns,
      textAlign: "Center",
    },
    {
      headerText: "Total",
      customAttributes: { class: "group-total" },
      columns: totalColumns,
      textAlign: "Center",
    },
  ];
};