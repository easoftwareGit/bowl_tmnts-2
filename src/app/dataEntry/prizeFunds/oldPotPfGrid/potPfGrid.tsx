"use client";

import "@/lib/syncfusion-license";

import type { potPfEntryRow } from "@/lib/types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClickEventArgs, ItemModel } from "@syncfusion/ej2-navigations";
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
  Toolbar,
  type ActionEventArgs,
  type CellSaveArgs,  
  type EditSettingsModel,
  type RecordClickEventArgs,
  type RecordDoubleClickEventArgs,
} from "@syncfusion/ej2-react-grids";
import ModalConfirm, { cancelConfTitle } from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import WaitModal from "@/components/modal/waitModal";
import {
  getDivPfsSaveStatus,
  saveDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
// import {
//   createDivPfColumns,
//   divPfEntryAmountColName,
//   divPfEntryIdColName,
//   divPfEntryPercentColName,
// } from "./sfCreateDivPfColumns";
// import {
//   createDivPfDiffAggregates,
//   createDivPfTotalAggregates,
// } from "./sfDivPfAggregates";
import { extractPotPfs } from "@/lib/db/potPfs/dbPotPfs";
import ModalErrorMsg from "@/components/modal/errorModal";

interface ChildProps {
  rows: potPfEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<potPfEntryRow[]>>;  
  totalPrizeFund: number;
  enableEditing?: boolean;
  gridDataWasChanged: boolean;
  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onNavigateAfterSave?: () => void;
  onBack: () => void;
  onSaveComplete?: (savedRows: potPfEntryRow[]) => void;
}

const PotPrizeFundGrid: React.FC<ChildProps> = ({
  rows,
  setRows,
  totalPrizeFund,
  enableEditing = true,
  gridDataWasChanged = false,
  onGridDataChanged,
  onGridDataReset,
  onNavigateAfterSave,
  onBack,
  onSaveComplete,
}) => { 

  const dispatch = useDispatch<AppDispatch>();  

  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);
  const [errModalObj, setErrModalObj] = useState<modalObjectType>(initModalObj);

  const amountsDontMatchMsg = 'The sum of the "Amount" columns does not match the "Pot Prize Fund" amount.';
  const amountPositionErrMsg = "A lower finishing position cannot receive more prize money than a higher finishing position.";

  /***********************
   * Toolbar Constants   *
   ***********************/

  const CANCEL_ID = "undo_all";
  const BACK_ID = "back";
  const EDIT_ID = "edit";
  const SAVE_ID = "save";
  const SAVE_CLOSE_ID = "done";

  /*******************
   * Toolbar Options *
   *******************/

  const toolbarOptions: (string | ItemModel)[] = [
    {
      text: "Edit",
      tooltipText: "Double-click to edit an amount",
      id: EDIT_ID,
      prefixIcon: "e-icons e-edit",
    },
    {
      text: "Save",
      tooltipText: "Save the scores",
      id: SAVE_ID,
      prefixIcon: "e-icons e-check",
    },
    {
      text: "Save and Close",
      tooltipText: "Save the scores and return to the Run Tournament page",
      id: SAVE_CLOSE_ID,
      prefixIcon: "e-icons e-update",
    },
    {
      text: "Cancel",
      tooltipText: "cancel all changes since last save",
      id: CANCEL_ID,
      prefixIcon: "e-icons e-cancel",
    },
    {
      text: "Back",
      tooltipText: "Back to the Run Tournament page",
      id: BACK_ID,
      prefixIcon: "e-icons e-back",
    },
  ];

  /*****************
   * edit setiings *
   *****************/

  const editSettings: EditSettingsModel = {
    allowEditing: enableEditing,
    allowAdding: false,
    allowDeleting: false,
    mode: "Batch",
    showConfirmDialog: false,
    showDeleteConfirmDialog: false,
  };

  /****************
   * Redux State  *
   ****************/

  const saveStatus = useSelector(getDivPfsSaveStatus);

  /********
   * Refs *
   ********/

  const gridRef = useRef<GridComponent | null>(null);
  const lastFocusedRowIndexRef = useRef<number | null | undefined>(null);

  const currentEditRef = useRef<{
    rowIndex: number;
    field: string;
  } | null>(null);

  const saveRequestedRef = useRef(false);
  const closeAfterSaveRef = useRef(false);
  const gridDataWasChangedRef = useRef(gridDataWasChanged);

  /******************
   * modal Handlers *
   ******************/

  /**
   * runs when the user clicks yes in the confirm modal
   * does all the actions when the user clicks yes
   *  - cancel
   *
   * @return {Promise<void>}
   */
  const confirmYes = async (): Promise<void> => {
    const grid = gridRef.current;
    if (!grid) return;

    /**********
     * cancel *
     **********/
    if (confModalObj.id === CANCEL_ID) {
      setConfModalObj(initModalObj); // reset modal object (hides modal)

      grid.editModule.batchCancel();
      grid.clearSelection();

      currentEditRef.current = null;

      onGridDataReset?.();

      return;
    }
  };

  const confirmNo = (): void => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const canceledModalErr = () => {
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  /****************
   * Grid Helpers *
   ****************/

  /**
   * create a mutable copy of the rows for the Syncfusion grid
   * useMemo so this only reruns when rows change, not on every render
   *
   * @returns {void}
   */
  const gridData = useMemo<potPfEntryRow[]>(() => {
    return rows.map((row) => ({ ...row }));
  }, [rows]);

  /**
   * gets the total amount in the grid
   *
   * @returns {number} - total amount in the grid
   */
  const getGridTotalPrizeFund = (): number => {
    const grid = gridRef.current;
    if (!grid) return 0;

    const currentRows = grid.getCurrentViewRecords() as potPfEntryRow[];

    const batchChanges = grid.getBatchChanges() as {
      changedRecords?: potPfEntryRow[];
    };

    const changedRecords = batchChanges.changedRecords ?? [];

    const currentRowsWithChanges = currentRows.map((row) => {
      const changedRow = changedRecords.find(
        (changed) => changed.id === row.id,
      );

      return changedRow ? { ...row, ...changedRow } : row;
    });

    return currentRowsWithChanges.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0,
    );
  };  

  /**
   * Validates that prize fund amounts never increase as the finishing
   * position gets lower. (2nd place cant receive more than 1st place, etc.)
   * 
   * This intentionally performs a second pass through the grid rather than
   * combining the logic with getGridTotalPrizeFund(). The grid contains fewer
   * than 100 rows, so the additional O(n) pass has negligible performance
   * impact while keeping each function focused on a single responsibility.
   *
   * @returns {boolean} true if all prize amounts are valid
   */
  const validatePrizeFundAmounts = (): boolean => {
    const grid = gridRef.current;
    if (!grid) return true;

    const currentRows = grid.getCurrentViewRecords() as potPfEntryRow[];

    const batchChanges = grid.getBatchChanges() as {
      changedRecords?: potPfEntryRow[];
    };

    const changedRecords = batchChanges.changedRecords ?? [];

    const currentRowsWithChanges = currentRows.map((row) => {
      const changedRow = changedRecords.find(
        (changed) => changed.id === row.id,
      );

      return changedRow ? { ...row, ...changedRow } : row;
    });

    for (let i = 1; i < currentRowsWithChanges.length; i++) {
      const previousAmount = Number(currentRowsWithChanges[i - 1].amount) || 0;
      const currentAmount = Number(currentRowsWithChanges[i].amount) || 0;

      if (currentAmount > previousAmount) {
        return false;
      }
    }

    return true;
  };

  /**
   * gets the index of a field in the grid
   *
   * @param {string} field - field name
   * @returns {number} - index of the field in the grid
   */
  const getCellIndex = (field: string): number => {
    const grid = gridRef.current;
    if (!grid) return -1;

    return grid.getVisibleColumns().findIndex((col) => col.field === field);
  };

  /**
   * validate and save the grid
   *
   * @param {boolean} closeAfterSave - whether to close the page after saving
   * @returns {void}
   */
  const validateAndSave = useCallback(
    (closeAfterSave: boolean): void => {
      const grid = gridRef.current;
      if (!grid) return;

      grid.editModule.saveCell();

      setTimeout(() => {
        const total = getGridTotalPrizeFund();

        if (total !== totalPrizeFund) {
          setErrModalObj({
            show: true,
            title: "Validate Error",
            message: amountsDontMatchMsg,
            id: "validate_error",
          });
          return;
        }

        if (!validatePrizeFundAmounts()) {
          setErrModalObj({
            show: true,
            title: "Validate Error",
            message: amountPositionErrMsg,
            id: "validate_error",
          });
          return;
        }

        saveRequestedRef.current = true;
        closeAfterSaveRef.current = closeAfterSave;

        grid.editModule.batchSave();
      }, 0);
    },
    [totalPrizeFund],
  );

  /**
   * Starts editing the first editable field in the grid
   *
   * @returns {void}
   */
  const beginToolbarEdit = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    let rowIndex = lastFocusedRowIndexRef.current ?? 0;

    if (rowIndex < 0 || rowIndex >= gridData.length) {
      rowIndex = 0;
    }

    const cellIndex = getCellIndex(divPfEntryAmountColName);
    if (cellIndex < 0) return;

    grid.selectCell({ rowIndex, cellIndex });

    // small timeout helps Syncfusion settle selection first
    setTimeout(() => {
      grid.editCell(rowIndex, divPfEntryAmountColName);
    }, 0);
  }, [gridData.length]);

  /**
   * Updates the toolbar state based on whether data has changed
   *
   * @returns {void}
   */
  const updateToolbarState = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.toolbarModule.enableItems(
      [SAVE_ID, SAVE_CLOSE_ID, CANCEL_ID],
      gridDataWasChanged,
    );
  }, [gridDataWasChanged]);


  return (
    <>
    </>
  )
}

export default PotPrizeFundGrid;