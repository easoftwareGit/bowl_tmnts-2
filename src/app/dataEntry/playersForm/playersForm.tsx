"use client";

import "@/lib/syncfusion-license";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import type { syncfusionStackedColDef, tmntFullType } from "@/lib/types/types";
import {
  Aggregate,
  AggregateColumnDirective,
  AggregateColumnsDirective,
  AggregateDirective,
  AggregatesDirective,
  ColumnDirective,
  ColumnsDirective,
  Edit,
  GridComponent,
  Inject,
  Resize,
  Sort,
  Toolbar,
  type ActionEventArgs,
  type EditEventArgs,
  type EditSettingsModel,
  type RecordClickEventArgs,
  type RecordDoubleClickEventArgs,  
} from "@syncfusion/ej2-react-grids";
import type { ClickEventArgs, ItemModel } from "@syncfusion/ej2-navigations";
import {
  createStackedColumns,
  entryFeeColName,
  entryNumBrktsColName,
  divEntryHdcpColName,
  timeStampColName,
  getBrktIdFromColName,
  isBrktsColumnName,  
} from "./sfCreateColumns";
import { createAggregates } from "./sfAggregates";
import type { playerEntryRow } from "./populateRows";
import { btDbUuid } from "@/lib/uuid";
import { useRouter } from "next/navigation";
import {
  getTmntDataSaveStatus,
  saveTmntEntriesData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import WaitModal from "@/components/modal/waitModal";
import { BracketList } from "@/components/brackets/bracketListClass";
import { extractDataFromRows, extractFullBrktsData } from "./extractData";
import { SquadStage } from "@prisma/client";
import { sanitizeName } from "@/lib/validation/sanitize";
import {  
  maxBrackets,
  maxFirstNameLength,
  maxLastNameLength,
} from "@/lib/validation/constants";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { validAverage } from "@/lib/validation/players/validate";
import ModalConfirm, {
  delConfTitle,
  cancelConfTitle
} from "@/components/modal/confirmModal";
import ModalErrorMsg from "@/components/modal/errorModal";
import { type modalObjectType, initModalObj } from "@/components/modal/modalObjType";
import "./playersForm.css";
import { validateFinalizeRows } from "./finalizeValidation";
import { randomizeAllBrkts } from "./buildBrktList";

export type errInfoType = {
  id: string;
  column: string;
  msg: string;
};

interface ChildProps {
  rows: playerEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<playerEntryRow[]>>;    
  enableEditing?: boolean;
  onNavigateAfterSave?: () => void;
}

const PlayersEntryForm: React.FC<ChildProps> = ({
  rows,
  setRows,
  enableEditing = true,
  onNavigateAfterSave,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );
  const entriesSaveStatus = useSelector(getTmntDataSaveStatus);  

  const gridRef = useRef<GridComponent | null>(null);
  const hasPendingChangesRef = useRef(false);
  const pendingSaveAllRef = useRef(false);
  const editFocusFieldRef = useRef<string | null>(null);  
  const navigatingAfterSaveRef = useRef(false);

  const lanes = tmntData?.lanes ?? [];
  const squadMinLane = lanes[0]?.lane_number ?? 1;
  const squadMaxLane = lanes.length
    ? lanes[lanes.length - 1].lane_number
    : squadMinLane + 1;
  
  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);
  const [errModalObj, setErrModalObj] = useState<modalObjectType>(initModalObj);
  const [saving, setSaving] = useState<boolean>(false);
   
  const validateTitle = 'Validate Bowlers';

  /*******************
   * modal functions *
   *******************/

  /**
   * runs when the user clicks yes in the confirm modal
   * does all the actions when the user clicks yes 
   *  - delete
   *  - cancel (Cancel All, not Cancel row edit)
   *  - validate
   *
   * @return {Promise<void>}
   */
  const confirmYes = async (): Promise<void> => {
    /**********
     * delete *
     **********/     
    if (confModalObj.title === delConfTitle) {
      const idToDelete = confModalObj.id;

      // delete the row
      const updatedRows = rows.filter((row) => row.id !== idToDelete);
      const normalizedRows = updatedRows.map((row) =>
        normalizeEditedRow({ ...row })
      );
      
      setRows(normalizedRows);

      // defer aggregate refresh until the grid reflects the deleted row
      setTimeout(() => {
        refreshGridAndAggregates(normalizedRows);
      }, 0);

      setConfModalObj(initModalObj);
      setCommitRowEnabled(false);
      markPendingChanges(true);
      return;
    }

    /**********
     * cancel *
     **********/     
    if (confModalObj.title === cancelConfTitle) {
      setConfModalObj(initModalObj); // reset modal object (hides modal)
      // go back to run tournament page
      router.push(`/dataEntry/runTmnt/${tmntData.tmnt.id}`);
      return;
    }
    
    /************
     * validate *
     ************/
    if (confModalObj.title === validateTitle) {
      setConfModalObj(initModalObj); // reset modal object (hides modal)

      const validateErr = validateFinalizeRows({
        rows,
        tmntData,
      });

      if (validateErr) {
        setErrModalObj({
          show: true,
          title: "Validate Error",
          message: validateErr.msg,
          id: validateErr.id
        });
        focusGridCell(validateErr.id, validateErr.column);
        return;
      }

      const ramdomizedBrkts = randomizeAllBrkts({ rows, tmntData });
      if (!(ramdomizedBrkts instanceof Array)) {
        const { id, column, msg } = ramdomizedBrkts;
        setErrModalObj({ show: true, title: "Brackets Error", message: msg, id });
        // do not focus grid cell. 
        return;
      }

      // save and go back to run tournament page
      await doSave(rows, ramdomizedBrkts);   
      router.push(`/dataEntry/runTmnt/${tmntData.tmnt.id}`);
    }
  };

  const confirmNo = (): void => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };  

  const canceledModalErr = () => {
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  /******************************
   * create the grid components *
   ******************************/

  /**
   * create a mutable copy of the rows for the Syncfusion grid
   * useMemo so this only reruns when rows change, not on every render
   *
   * @returns {void}
   */
  const gridData = useMemo<playerEntryRow[]>(() => {
    return rows.map((row) => ({ ...row }));
  }, [rows]);

  const CANCEL_ALL_ID = "cancel_all";
  const COMMIT_ROW_ID = "commit_row";
  const VALIDATE_ID = "validate";
  const SAVE_ID = "save";  

  const cancelAlltext = enableEditing ? "Cancel All" : "Return to Run";
  const cancelAllTooltip = enableEditing
    ? "Cancel all changes and return to the Run Tournament page"
    : "Return to the Run Tournament page";

  const toolbarOptions: (string | ItemModel)[] = [
    "Add",
    "Edit",
    "Delete",
    "Cancel",
    {
      text: "Commit Row",
      tooltipText: "Commit the current row edit",
      id: COMMIT_ROW_ID,
      prefixIcon: "e-icons e-check",
    },
    {
      text: "Save",
      tooltipText: "Save all rows (incomplete allowed)",
      id: SAVE_ID,
      prefixIcon: "e-icons e-update",
    },
    {
      text: "Validate & Save",
      tooltipText: "Validate all required fields, randomize brackets and save",
      id: VALIDATE_ID,
      prefixIcon: "e-icons e-lock",
    },
    {
      text: cancelAlltext,
      tooltipText: cancelAllTooltip,
      id: CANCEL_ALL_ID,
      prefixIcon: "e-icons e-back",
    },    
  ];

  const editSettings: EditSettingsModel = {
    allowEditing: enableEditing,
    allowAdding: enableEditing,
    allowDeleting: enableEditing,
    mode: "Normal",
    showDeleteConfirmDialog: false,
  };

  /****************************
   * helpers for calculations *
   ****************************/

  /**
   * normalize the edited row before saving
   *
   * @param {playerEntryRow} row - the edited row
   * @return {playerEntryRow} - the normalized row
   */
  const normalizeEditedRow = (row: playerEntryRow): playerEntryRow => {
    const updated = { ...row };

    // names
    updated.first_name = sanitizeName(updated.first_name).slice(0, maxFirstNameLength,);    
    updated.last_name = sanitizeName(updated.last_name).slice(0, maxLastNameLength,);

    // average: blank if no valid value
    const averageNum = Number(updated.average);
    updated.average =
      updated.average == null ||
      updated.average === "" ||
      !Number.isFinite(averageNum)
        ? undefined
        : Math.trunc(averageNum);

    // lane: blank if no valid value
    const laneNum = Number(updated.lane);
    updated.lane =
      updated.lane == null || updated.lane === "" || !Number.isFinite(laneNum)
        ? undefined
        : Math.trunc(laneNum);

    // position: blank or one valid character
    updated.position =
      updated.position == null
        ? undefined
        : String(updated.position)
            .toUpperCase()
            .replace(/[^A-Z1-9]/g, "")
            .slice(0, 1);

    // division fees and handicap
    tmntData?.divs?.forEach((div) => {
      const feeField = entryFeeColName(div.id);
      const hdcpField = divEntryHdcpColName(div.id);

      const rawFee = updated[feeField];
      const divFeeNum = Number(rawFee);

      const averageNum = Number(updated.average);
      const validFee =
        rawFee != null &&
        rawFee !== "" &&
        Number.isFinite(divFeeNum) &&
        divFeeNum > 0;

      const validAvg = validAverage(averageNum);

      updated[feeField] = validFee ? divFeeNum : undefined;

      updated[hdcpField] =
        validFee && validAvg
          ? calcHandicap(
              averageNum,
              div.hdcp_from,
              div.hdcp_per,
              div.int_hdcp,
              div.hdcp_for,
              tmntData?.events?.[0]?.games ?? 1,
            )
          : undefined;
    });

    // bracket counts, fees, timestamps
    tmntData?.brkts?.forEach((brkt) => {
      const countField = entryNumBrktsColName(brkt.id);
      const feeField = entryFeeColName(brkt.id);
      const timestampField = timeStampColName(brkt.id);

      const rawCount = updated[countField];
      const countNum = Number(rawCount);

      const validCount =
        rawCount != null &&
        rawCount !== "" &&
        Number.isFinite(countNum) &&
        Number.isInteger(countNum) &&
        countNum > 0 &&
        countNum <= maxBrackets;

      if (!validCount) {
        updated[countField] = undefined;
        updated[feeField] = undefined;
        updated[timestampField] = 0;
        return;
      }

      const safeCount = Math.trunc(countNum);
      const feePerBracket = Number(brkt.fee ?? 0);

      updated[countField] = safeCount;
      updated[feeField] = safeCount * feePerBracket;

      const existingTimestamp = Number(updated[timestampField] ?? 0);
      // only set timestamp when the player first enters this bracket
      if (!existingTimestamp) {
        updated[timestampField] = Date.now();
      }
    });

    // pot fees
    tmntData?.pots?.forEach((pot) => {
      const field = entryFeeColName(pot.id);
      const rawVal = updated[field];
      const valNum = Number(rawVal);

      updated[field] =
        rawVal == null ||
        rawVal === "" ||
        !Number.isFinite(valNum) ||
        valNum === 0
          ? undefined
          : valNum;
    });

    // elim fees
    tmntData?.elims?.forEach((elim) => {
      const field = entryFeeColName(elim.id);
      const rawVal = updated[field];
      const valNum = Number(rawVal);

      updated[field] =
        rawVal == null ||
        rawVal === "" ||
        !Number.isFinite(valNum) ||
        valNum === 0
          ? undefined
          : valNum;
    });

    // total fee
    updated.feeTotal = Object.entries(updated).reduce(
      (total, [field, value]) => {
        if (!field.endsWith("_fee")) return total;

        const num = Number(value);
        return Number.isFinite(num) ? total + num : total;
      },
      0,
    );

    return updated;
  };

  /**
   * updates the fee for a bracket
   * 
   * need to use useCallback because called from funcs that are useCallback(...)
   *
   * @param {string} brktCol - the name of the bracket column
   * @returns {void}
   */
  const updateBrktFee = useCallback(
    (brktCol: string): void => {
      const grid = gridRef.current;
      if (!grid) return;
      if (!isBrktsColumnName(brktCol)) return;

      const numBrkts = parseEditorNumber(brktCol);
      const brktId = getBrktIdFromColName(brktCol);

      const brkt = tmntData?.brkts?.find((b) => b.id === brktId);
      const feePerBracket = Number(brkt?.fee ?? 0);

      const brktFeeColName = entryFeeColName(brktId);
      const brktTimeStampColName = timeStampColName(brktId);

      const brktFeeInput = grid.element.querySelector(
        `input[name = "${brktFeeColName}"]`,
      ) as HTMLInputElement | null;

      if (!brktFeeInput) return;
      // get the selected row from the dataGrid
      const selectedRow = grid.getSelectedRecords()[0] as
        | playerEntryRow
        | undefined;
      if (
        !brktId ||
        numBrkts == null ||
        numBrkts <= 0 ||
        numBrkts > maxBrackets
      ) {
        brktFeeInput.value = "";

        if (selectedRow) {
          selectedRow[brktTimeStampColName] = 0;
        }
        return;
      }

      brktFeeInput.value = String(numBrkts * feePerBracket);
      // update the timestamp field
      if (selectedRow) {
        const existingTimeStamp = Number(
          selectedRow[brktTimeStampColName] ?? 0,
        );
        // only update timestamp if not already set
        if (!existingTimeStamp) {
          selectedRow[brktTimeStampColName] = Date.now();
        }
      }
    },
    [tmntData?.brkts],
  );

  /**
   * updates all division handicap columns for the current edit row.
   * If average is invalid or the matching division fee is empty/invalid,
   * the handicap cell is cleared.
   * 
   * need to use useCallback because called from funcs that are useCallback(...)
   * 
   * @returns {void}
   */
  const updateDivHdcps = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const average = parseEditorNumber("average");
    const games = tmntData?.events?.[0]?.games ?? 1;

    tmntData?.divs?.forEach((div) => {
      const feeField = entryFeeColName(div.id);
      const hdcpField = divEntryHdcpColName(div.id);

      const fee = parseEditorNumber(feeField);
      const hdcpInput = grid.element.querySelector(
        `input[name = "${hdcpField}"]`,
      ) as HTMLInputElement | null;

      if (!hdcpInput) return;

      // use your existing validator
      if (
        !validAverage(average) ||
        fee == null ||
        !Number.isFinite(fee) ||
        fee <= 0
      ) {
        hdcpInput.value = "";
        return;
      }

      hdcpInput.value = String(
        calcHandicap(
          average ?? 0,
          div.hdcp_from,
          div.hdcp_per,
          div.int_hdcp,
          div.hdcp_for,
          games,
        ),
      );
    });
  }, [tmntData?.divs, tmntData?.events]);

  /**
   * update the lanePos field.
   * 
   * need to use useCallback because called from funcs that are useCallback(...)
   *
   * @returns {void}
   */
  const updateLanePos = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const lane = parseEditorNumber("lane");
    const position = parseEditorString("position");
    const pos =
      position == null ? "" : position.trim().toUpperCase().slice(0, 1);

    const lanePosInput = grid.element.querySelector(
      `input[name = "lanePos"]`,
    ) as HTMLInputElement | null;
    if (lanePosInput) {
      if (!lane || !pos) {
        lanePosInput.value = "";
      } else {
        lanePosInput.value = `${lane}-${pos}`;
      }
    }
  }, [gridRef]); // gridRef is stable, but safe to include

  /**
   * Updates the total column
   * 
   * need to use useCallback because called from funcs that are useCallback(...)
   *
   * @return {void}
   */
  const updateFeeTotal = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    let total = 0;
    grid.getColumns().forEach((col) => {
      if (!col.field.endsWith("_fee")) return;
      const num = parseEditorNumber(col.field);

      total += num ?? 0; // treats (num = null or num = undefined) as 0
      // total += isNull(num) ? 0 : num;
    });
    const feeTotalInput = grid.element.querySelector(
      `input[name = "feeTotal"]`,
    ) as HTMLInputElement | null;

    if (feeTotalInput) {
      feeTotalInput.value = total == null ? "" : String(total);
    }
  }, [gridRef]);

  /********************
   * helper functions *
   ********************/

  /**
   * Focuses the desired editor
   *
   * @param {EditEventArgs} args - The edit event arguments
   * @return {void}
   */
  const focusDesiredEditor = (args: EditEventArgs): void => {
    const grid = gridRef.current;
    const fieldName = editFocusFieldRef.current;
    if (!grid || !fieldName || !args.form) return;

    const editor = args.form.querySelector(
      `#${grid.element.id}${fieldName}`,
    ) as HTMLElement | null;

    editor?.focus();
  };

  /**
   * Focuses the editor for the specified field
   *
   * @param {string} fieldName - The name of the field
   * @return {void}
   */
  const focusEditorByField = (fieldName: string): void => {
    const grid = gridRef.current;
    if (!grid) return;

    setTimeout(() => {
      const input = grid.element.querySelector(
        `input[name="${fieldName}"]`,
      ) as HTMLInputElement | null;

      input?.focus();
    }, 0);
  };

  /**
   * Focus a specific grid cell by row id and column field name.
   *
   * @param rowId - primary key value for the row
   * @param fieldName - column field name
   * @param beginEdit - if true, start editing the row
   */
  const focusGridCell = (
    rowId: string,
    fieldName: string,
    beginEdit = false
  ): void => {
    const grid = gridRef.current;
    if (!grid) return;

    // current rows in grid
    const rows = grid.getCurrentViewRecords() as playerEntryRow[];

    // locate row index
    const rowIndex = rows.findIndex((r) => r.id === rowId);
    if (rowIndex < 0) return;

    // locate column index
    const columnIndex = grid
      .getColumns()
      .findIndex((col) => col.field === fieldName);

    if (columnIndex < 0) return;

    // select the row
    grid.selectRow(rowIndex);

    // focus the cell
    grid.selectCell({ rowIndex, cellIndex: columnIndex });

    // optionally begin editing
    if (beginEdit) {
      grid.startEdit();

      // allow editor to render first
      setTimeout(() => {
        const input = grid.element.querySelector<HTMLElement>(
          `[name="${fieldName}"]`
        );

        input?.focus();
      }, 0);
    }
  };

  /**
   * Returns the id of the toolbar item
   *
   * @param {string} suffix - The suffix of the toolbar item
   * @return {string | null} - The id of the toolbar item or null
   */
  const getToolbarItemId = (suffix: string): string | null => {
    const grid = gridRef.current;
    if (!grid) return null;

    const item = grid.element.querySelector(
      `[id="${suffix}"], [id$="_${suffix}"]`,
    ) as HTMLElement | null;

    return item?.id ?? null;
  };

  /**
   * Checks if a value has a name (called for firstName and lastName)
   *
   * @param {unknown} value - The value to check
   * @return {boolean} - True if the value has a name, false otherwise
   */
  const hasNameValue = (value: unknown): boolean => {
    return sanitizeName(value).trim().length > 0;
  };

  /**
   * Marks the grid as having pending changes
   *
   * @param {boolean} pending - Whether the grid has pending changes
   * @return {void}
   */
  const markPendingChanges = (pending: boolean): void => {
    hasPendingChangesRef.current = pending;
    syncSaveButtonsEnabled();
  };

  /**
   * Returns the value of the number editor as a number
   *
   * @param {string} fieldName - The name of the field
   * @return {number | null} - The value of the number editor as a number or null
   */
  const parseEditorNumber = (fieldName: string): number | null => {
    const grid = gridRef.current;
    if (!grid) return null;

    // Syncfusion only has one row in edit state at a time
    // gets the input element for field in the edit row
    const input = grid.element.querySelector(
      `input[name = "${fieldName}"]`,
    ) as HTMLInputElement | null;
    if (!input) return null;

    const value = input.value.trim();
    if (value === "") return null;

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  /**
   * Returns the value of the string editor as a string
   *
   * @param {string} fieldName - The name of the field
   * @return {string | null} - The value of the string editor as a string or null    
   */
  const parseEditorString = (fieldName: string): string | null => {
    const grid = gridRef.current;
    if (!grid) return null;

    const input = grid.element.querySelector(
      `input[name = "${fieldName}"]`,
    ) as HTMLInputElement | null;
    if (!input) return null;

    const value = input.value.trim();
    return value === "" ? null : value;
  };

  /**
   * Refreshes the grid and aggregates (grid totals)
   * 
   * @param {playerEntryRow[]} data - The data to refresh
   * @return {void}
   */
  const refreshGridAndAggregates = (data: playerEntryRow[]): void => {
    const grid = gridRef.current;
    if (!grid) return;

    // refresh the grid
    grid.dataSource = data;
    grid.refresh();

    // refresh the aggregates
    grid.aggregateModule?.refresh(data, grid.element);
  };

  /**
   * Stores the field name of the last clicked/double-clicked cell
   * used to restore focus to that column when edit mode starts
   *
   * @param {number} cellIndex - The index of the cell
   * @return {void} 
   */
  const rememberClickedField = (cellIndex: number): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const column = grid.getColumnByIndex(cellIndex);
    if (!column?.field) return;

    editFocusFieldRef.current = column.field;
  };

  /**
   * Enables or disables the commit row toolbar item
   *
   * @param {boolean} enabled - Whether the commit row toolbar item should be enabled
   * @return {void}
   */
  const setCommitRowEnabled = (enabled: boolean): void => {
    if (navigatingAfterSaveRef.current) return;
    const grid = gridRef.current;
    if (!grid) return;    

    if (!enableEditing) { 

      const commitRowToolbarItemId = getToolbarItemId(COMMIT_ROW_ID);
      if (commitRowToolbarItemId) {
        grid.enableToolbarItems([commitRowToolbarItemId], false);
      }

      const saveAllToolbarItemId = getToolbarItemId(SAVE_ID);
      if (saveAllToolbarItemId) {
        grid.enableToolbarItems([saveAllToolbarItemId], false);
      }

      const validateToolbarItemId = getToolbarItemId(VALIDATE_ID);
      if (validateToolbarItemId) {
        grid.enableToolbarItems([validateToolbarItemId], false);
      }

      const cancelAllToolbarItemId = getToolbarItemId(CANCEL_ALL_ID);
      if (cancelAllToolbarItemId) {
        grid.enableToolbarItems([cancelAllToolbarItemId], true);
      }
    } else {
      const commitRowToolbarItemId = getToolbarItemId(COMMIT_ROW_ID);
      if (commitRowToolbarItemId) {
        grid.enableToolbarItems([commitRowToolbarItemId], enabled);
      }

      const saveAllToolbarItemId = getToolbarItemId(SAVE_ID);
      if (saveAllToolbarItemId) {
        grid.enableToolbarItems([saveAllToolbarItemId], !enabled);
      }

      const validateToolbarItemId = getToolbarItemId(VALIDATE_ID);
      if (validateToolbarItemId) {
        grid.enableToolbarItems([validateToolbarItemId], !enabled);
      }
    }
  };

  /**
   * Enables or disables the toolbar items Save and Validate
   *
   * @param {boolean} enabled - Whether toolbar items Save and Validate should be enabled
   * @return {void}
   */
  const setSaveButtonsEnabled = useCallback((enabled: boolean): void => {
    if (navigatingAfterSaveRef.current) return;
		const grid = gridRef.current;
		if (!grid) return;

		const saveId = getToolbarItemId(SAVE_ID);

		if (saveId) {
			grid.toolbarModule.enableItems([saveId], enabled);
		}
	}, []);

  /**
   * Synchronizes the rows in the grid with the parent component
   *
   * @return {playerEntryRow[]} - The rows in the grid
   */
  const syncRowsToParent = (): playerEntryRow[] => {
    const grid = gridRef.current;
    if (!grid) return rows;

    // getCurrentViewRecords() is used instead of grid.dataSource because
    // grid.dataSource can still contain stale row values after editing an
    // existing row. getCurrentViewRecords() reflects the grid's committed
    // current records after endEdit/save.
    const currentRows = grid.getCurrentViewRecords() as playerEntryRow[];

    const normalizedRows = currentRows.map((row) =>
      normalizeEditedRow({ ...row })
    );
   
    setRows(normalizedRows); // update parent's rows state
    return normalizedRows;   // return normalized rows (setRows is not async)
  };

  /**
   * Synchronizes the Save toolbar button with pending changes
   *
   * @return {void}
   */
  const syncSaveButtonsEnabled = (): void => {
    if (navigatingAfterSaveRef.current) return;
    setSaveButtonsEnabled(hasPendingChangesRef.current);
  };

  /**
   * Updates a row in the grid's data source
   *
   * @param {playerEntryRow} updatedRow - The updated row
   * @return {void} 
   */
  const updateGridDataSourceRow = (updatedRow: playerEntryRow): void => {
    const grid = gridRef.current;
    if (!grid) return;

    // get the data source as a playerEntryRow[]
    const dataSource = grid.dataSource as playerEntryRow[];

    if (!Array.isArray(dataSource)) return;

    // find the index of the updated row
    const index = dataSource.findIndex((row) => row.id === updatedRow.id);
    if (index < 0) return;

    // replace the stale row with the normalized row before aggregate recalculation
    dataSource[index] = updatedRow;
  };  

  /*************
   * save data *
   *************/

  /**
   * Does the save
   *
   * @param {playerEntryRow[]} rowsToSave - The rows to save
   * @param {BracketList[]} brktLists - The bracket lists
   * @return {void} 
   */
  const doSave = async (
    rowsToSave: playerEntryRow[],
    brktLists: BracketList[],
  ): Promise<void> => {
    if (!tmntData) return;
    
    try {
      navigatingAfterSaveRef.current = true;
      setSaving(true);
      onNavigateAfterSave?.();

      // update the stage 
      const updatedStage: SquadStage =
        brktLists.length === 0 ? SquadStage.ENTRIES : SquadStage.SCORES;

      // extract the data from the rows
      const entriesData = extractDataFromRows(
        rowsToSave,
        tmntData.squads[0].id,
        brktLists,
      );
      const brktsData = extractFullBrktsData(brktLists);

      // create the tmnt to save
      const tmntToSave: tmntFullType = {
        ...tmntData,
        players: [...entriesData.players],
        divEntries: [...entriesData.divEntries],
        elimEntries: [...entriesData.elimEntries],
        brktEntries: [...entriesData.brktEntries],
        oneBrkts: [...brktsData.oneBrkts],
        brktSeeds: [...brktsData.brktSeeds],
        potEntries: [...entriesData.potEntries],
        stage: {
          ...tmntData.stage,
          stage: updatedStage,
        },
      };
      // add the bye player if needed
      for (const brktList of brktLists) {
        if (brktList.oneByeCount > 0) {
          const foundByePlayer = tmntToSave.players.find(
            (p) => p.id === brktList.byePlayer.id,
          );
          // if did not find the bye player, add it
          if (!foundByePlayer) {
            tmntToSave.players.push(brktList.byePlayer);
            break;
          }
        }
      }

      // alert('dispatching saveTmntEntriesData...');
      // return; // just for testing calculations, remove when ready to test save
      
      await dispatch(saveTmntEntriesData(tmntToSave)).unwrap();
      // router.push(`/dataEntry/runTmnt/${tmntData.tmnt.id}`);      
    } catch (error) {
      navigatingAfterSaveRef.current = false;
      setSaving(false);
    }
  };

  /******************
   * event handlers *
   ******************/

  const handleActionBegin = (args: ActionEventArgs): void => {
    if (args.requestType === "add") {
      const newId = btDbUuid("ply");
      const newRow = args.data as playerEntryRow;

      newRow.id = newId;
      newRow.player_id = newId;

      editFocusFieldRef.current = "first_name";
      return;
    }

    if (args.requestType === "delete") {
      args.cancel = true; // cancel the delete

      // get the row to delete
      const deletedRows = Array.isArray(args.data)
        ? (args.data as playerEntryRow[])
        : [args.data as playerEntryRow];

      const rowToDelete = deletedRows[0];
      if (!rowToDelete) return;

      const playerName = `${rowToDelete.first_name ?? ""} ${
        rowToDelete.last_name ?? ""
      }`.trim();

      // show the confirm delete modal
      setConfModalObj({
        show: true,
        id: rowToDelete.id,        
        title: delConfTitle,        
        message: `Do you want to delete: ${playerName}?`,
      });

      return;
    }

    if (args.requestType === SAVE_ID) {
      const row = args.data as playerEntryRow;

      if (!hasNameValue(row.first_name)) {
        args.cancel = true;
        editFocusFieldRef.current = "first_name";
        focusEditorByField("first_name");
        return;
      }

      if (!hasNameValue(row.last_name)) {
        args.cancel = true;
        editFocusFieldRef.current = "last_name";
        focusEditorByField("last_name");
        return;
      }

      const normalized = normalizeEditedRow({ ...row });

      Object.assign(row, normalized);

      // update Syncfusion's backing data before it recalculates aggregates
      updateGridDataSourceRow(normalized);
    }    
  };

  const handleActionComplete = async (args: ActionEventArgs): Promise<void> => {
    
    if (args.requestType === "beginEdit" || args.requestType === "add") {
      setCommitRowEnabled(true);

      setTimeout(() => {
        focusDesiredEditor(args as EditEventArgs);
      }, 0);

      return;
    }

    if (args.requestType === "delete") {
      setCommitRowEnabled(false);

      syncRowsToParent();

      markPendingChanges(true);
      return;
    }

    if (args.requestType === "cancel") {
      setCommitRowEnabled(false);      
      return;
    }

    if (args.requestType === SAVE_ID) {
      setCommitRowEnabled(false);

      const normalizedRows = syncRowsToParent();
      
      markPendingChanges(true);

      if (pendingSaveAllRef.current) {
        pendingSaveAllRef.current = false;

        await doSave(normalizedRows, []);
        markPendingChanges(false);
        router.push(`/dataEntry/runTmnt/${tmntData.tmnt.id}`);
      }

      return;
    }
  };

  const handleAverageChange = useCallback((): void => {
    updateDivHdcps();
  }, [updateDivHdcps]);

  const handleCreated = (): void => {
    // wait for the grid to be created, toolbar rendered, buttons exits in DOM
    setTimeout(() => {
      setCommitRowEnabled(false);
      markPendingChanges(false);
    }, 0);
  };

  const handleDivPotElimFeeChange = useCallback((): void => {
    updateDivHdcps();
    updateFeeTotal();
  }, [updateDivHdcps, updateFeeTotal]);

  const handleLaneOrPosChange = useCallback((): void => {
    updateLanePos();
  }, [updateLanePos]);

  const handleNumBrktChange = useCallback(
    (brktCol: string): void => {
      updateBrktFee(brktCol);
      updateFeeTotal();
    },
    [updateBrktFee, updateFeeTotal],
  );

  const handleRecordClick = (args: RecordClickEventArgs): void => {
    if (typeof args.cellIndex === "number") {
      rememberClickedField(args.cellIndex);
    }
  };

  const handleRecordDoubleClick = (args: RecordDoubleClickEventArgs): void => {
    const cell = args.cell as HTMLTableCellElement | null;

    if (cell && typeof cell.cellIndex === "number") {
      rememberClickedField(cell.cellIndex);
    }
  };

  const handleToolbarClick = async (args: ClickEventArgs): Promise<void> => {
    const grid = gridRef.current;
    if (!grid) return;

    const clickedId = args.item.id ?? "";

    const isEditing =
      (grid as GridComponent & { isEdit?: boolean }).isEdit === true;

    if (clickedId === COMMIT_ROW_ID || clickedId.endsWith("_" + COMMIT_ROW_ID)) {
      if (isEditing) {
        grid.endEdit();
      }
      return;
    }

    if (clickedId === SAVE_ID || clickedId.endsWith("_" + SAVE_ID)) {
      if (isEditing) {
        pendingSaveAllRef.current = true;
        grid.endEdit();
        return;
      }

      const normalizedRows = syncRowsToParent();

      await doSave(normalizedRows, []);
      markPendingChanges(false);
      return;
    }

    if (clickedId === VALIDATE_ID || clickedId.endsWith("_" + VALIDATE_ID)) {
      if (rows.length === 0) {
        setErrModalObj({
          show: true,
          title: "No rows to validate",
          message: `Enter player data before validating.`,
          id: "none",
        });
        return;
      }
      setConfModalObj({
        show: true,
        title: validateTitle,
        message: 'Do you want to validate all bowler entries for this tournament? This will also randomize brackets (if any).\n\n Note: you will not be able to edit bowlers after this.',
        id: "0",
      })
    }

    if (clickedId === CANCEL_ALL_ID || clickedId.endsWith("_" + CANCEL_ALL_ID)) {
      // if no data in grid or not editing
      if (rows.length === 0 || !enableEditing) {
        router.push(`/dataEntry/runTmnt/${tmntData.tmnt.id}`);
        return;
      }
      if (enableEditing) {
        setConfModalObj({
          show: true,
          title: cancelConfTitle,
          message: `Do you want to cancel editing bowlers for this tournament?`,
          id: "0",
        }); // cancel done in confirmYes
        return;        
      } 
    }    
  };

  // create the stacked/grouped columns
  // place the tmntData objects that are used to create the columns in the useMemo
  // array as the 2nd parameter so this only reruns when those objects change
  const stackedColumnGroups = useMemo(
    () =>
      createStackedColumns(
        tmntData?.divs ?? [],
        tmntData?.pots ?? [],
        tmntData?.brkts ?? [],
        tmntData?.elims ?? [],
        squadMaxLane,
        squadMinLane,
        handleLaneOrPosChange,
        handleDivPotElimFeeChange,
        handleNumBrktChange,
        handleAverageChange,
      ),
    [
      tmntData?.divs,
      tmntData?.pots,
      tmntData?.brkts,
      tmntData?.elims,
      squadMaxLane,
      squadMinLane,
      handleLaneOrPosChange,
      handleDivPotElimFeeChange,
      handleNumBrktChange,
      handleAverageChange,
    ],
  );

  /**
   * create the column footer summaries
   * place the tmntData objects that are used to create the columns in the useMemo
   * array as the 2nd parameter so this only reruns when those objects change
   *
   * @returns {syncfusionStackedColDef[]} - array of column footer summaries
   */
  const gridAggregates = useMemo(
    () =>
      createAggregates(
        tmntData?.divs ?? [],
        tmntData?.pots ?? [],
        tmntData?.brkts ?? [],
        tmntData?.elims ?? [],
      ),
    [tmntData?.divs, tmntData?.pots, tmntData?.brkts, tmntData?.elims],
  );

  const enhanceStackedColumns = useCallback(
    (groups: syncfusionStackedColDef[]): syncfusionStackedColDef[] => {
      return groups.map((group) => ({
        ...group,
        columns: group.columns.map((col) => {
          if (col.field === "lane" || col.field === "position") {
            return {
              ...col,
              edit: {
                ...(col.edit ?? {}),
                params: {
                  ...(col.edit?.params ?? {}),
                  change: handleLaneOrPosChange,
                },
              },
            };
          }
          if (col.field === "first_name") {
            return {
              ...col,
              validationRules: {
                ...(col.validationRules ?? {}),
                required: [true, "First Name is required"],
              },
            };
          }
          if (col.field === "last_name") {
            return {
              ...col,
              validationRules: {
                ...(col.validationRules ?? {}),
                required: [true, "Last Name is required"],
              },
            };
          }          

          return col;
        }),
      }));
    },
    [handleLaneOrPosChange], // <-- important
  );

  const enhancedGroups = useMemo(
    () => enhanceStackedColumns(stackedColumnGroups),
    [stackedColumnGroups, enhanceStackedColumns],
  );

  return (
    <>
      <WaitModal show={entriesSaveStatus === "saving"} message="Saving..." />

      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />      

      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}
        onCancel={canceledModalErr}
      />      
      
      <div>
        <h5>Tournament: {tmntData?.tmnt.tmnt_name}</h5>
        <h6>Entries: {rows.length}</h6>
        {!enableEditing && !saving && (
          <div className="alert alert-warning">
            This tournament has been validated. Bowler editing is disabled.
          </div>
        )}
      </div>
      <GridComponent
        id="playersGrid"
        ref={gridRef}
        dataSource={gridData}
        allowResizing={true}
        allowSorting={true}
        disabled={!enableEditing}
        editSettings={editSettings}
        gridLines="Both"
        height="450"
        readOnly={!enableEditing}
        toolbar={toolbarOptions}
        actionBegin={handleActionBegin}
        actionComplete={handleActionComplete}
        created={handleCreated}        
        recordClick={handleRecordClick}
        recordDoubleClick={handleRecordDoubleClick}
        toolbarClick={handleToolbarClick}        
      >
        <ColumnsDirective>
          {enhancedGroups.map((group) => (
            <ColumnDirective
              key={group.headerText}
              headerText={group.headerText}
              columns={group.columns}
              customAttributes={group.customAttributes}
              textAlign={group.textAlign}
            />
          ))}
        </ColumnsDirective>

        <AggregatesDirective>
          <AggregateDirective>
            <AggregateColumnsDirective>
              {gridAggregates.map((col) => (
                <AggregateColumnDirective key={col.field} {...col} />
              ))}
            </AggregateColumnsDirective>
          </AggregateDirective>
        </AggregatesDirective>

        <Inject services={[Aggregate, Edit, Resize, Sort, Toolbar]} />
      </GridComponent>
    </>
  );
};

export default PlayersEntryForm;
