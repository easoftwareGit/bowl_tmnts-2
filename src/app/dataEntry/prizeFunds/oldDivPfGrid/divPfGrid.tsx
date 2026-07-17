"use client";

import "@/lib/syncfusion-license";

import type { divPfEntryRow } from "@/lib/types/types";
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
import {
  createDivPfColumns,
  divPfEntryAmountColName,
  divPfEntryIdColName,
  divPfEntryPercentColName,
} from "./sfCreateDivPfColumns";
import {
  createDivPfDiffAggregates,
  createDivPfTotalAggregates,
} from "./sfDivPfAggregates";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";
import ModalErrorMsg from "@/components/modal/errorModal";

interface ChildProps {
  rows: divPfEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<divPfEntryRow[]>>;  
  totalPrizeFund: number;
  enableEditing?: boolean;
  gridDataWasChanged: boolean;
  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onNavigateAfterSave?: () => void;
  onBack: () => void;
  onSaveComplete?: (savedRows: divPfEntryRow[]) => void;
}

const DivPrizeFundGrid: React.FC<ChildProps> = ({
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

  const amountsDontMatchMsg = 'The sum of the "Amount" columns does not match the "Total Prize Fund" amount.';
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
  const gridData = useMemo<divPfEntryRow[]>(() => {
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

    const currentRows = grid.getCurrentViewRecords() as divPfEntryRow[];

    const batchChanges = grid.getBatchChanges() as {
      changedRecords?: divPfEntryRow[];
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

    const currentRows = grid.getCurrentViewRecords() as divPfEntryRow[];

    const batchChanges = grid.getBatchChanges() as {
      changedRecords?: divPfEntryRow[];
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

  /**********************
   * Grid Event Handlers *
   **********************/

  const handleCellSaved = useCallback((args: CellSaveArgs): void => {
    console.log("3. cellSaved");

    const grid = gridRef.current;
    if (!grid) return;    

    const rowData = args.rowData as divPfEntryRow;
    if (!rowData) return;

    const field = args.columnName as keyof divPfEntryRow;
    const value = args.value;

    // Patch the saved cell value into rowData first.
    rowData[field] = value as never;

    const rowAmount = rowData.amount || (0 as number);
    const rowPercent = rowAmount === 0 ? 0 : rowAmount / totalPrizeFund;

    const rowId = rowData[divPfEntryIdColName];
    if (rowId) {
      grid.setCellValue(rowId, divPfEntryPercentColName, rowPercent);
    }
    onGridDataChanged?.();

    currentEditRef.current = null;
  }, [onGridDataChanged, totalPrizeFund]);

  const handleRecordClick = useCallback((args: RecordClickEventArgs): void => {
    lastFocusedRowIndexRef.current = args.rowIndex;
  }, []);

  const handleRecordDoubleClick = useCallback(
    (args: RecordDoubleClickEventArgs): void => {
      lastFocusedRowIndexRef.current = args.rowIndex;
    },
    [],
  );

  const toolbarClick = useCallback(
    (args: ClickEventArgs): void => {
      const grid = gridRef.current;
      if (!grid) return;

      switch (args.item.id) {
        case EDIT_ID:
          beginToolbarEdit();
          break;
        case SAVE_ID:
          validateAndSave(false);
          break;
        case SAVE_CLOSE_ID:
          validateAndSave(true);
          break;
        case CANCEL_ID:
          setConfModalObj({
            show: true,
            id: CANCEL_ID,
            title: cancelConfTitle,
            message: "Do you want to cancel edits?",
          });
          break;
        case BACK_ID:
          onBack();
          break;
      }
    },
    [validateAndSave, beginToolbarEdit, onBack],
  );

  /**********************
   * Grid Event Handlers *
   **********************/

  const handleActionComplete = useCallback(
    async (args: ActionEventArgs) => {
      if (args.requestType !== "batchsave") {
        return;
      }
      if (!saveRequestedRef.current) {
        return;
      }

      saveRequestedRef.current = false;

      const grid = gridRef.current;
      if (!grid) return;

      console.log("4. reading currentRows");

      const currentRows = grid.getCurrentViewRecords() as divPfEntryRow[];
      const divPfsToSave = extractDivPfs(currentRows);
      if (currentRows.length > 0) {
        await dispatch(saveDivPfs(divPfsToSave)).unwrap();
      }

      const savedRows = currentRows.map((row) => ({ ...row }));
      const shouldCloseAfterSave = closeAfterSaveRef.current;

      closeAfterSaveRef.current = false;
      currentEditRef.current = null;

      onSaveComplete?.(savedRows);
      if (shouldCloseAfterSave) {
        onSaveComplete?.(savedRows);
        onNavigateAfterSave?.();
        return;
      }

      setRows(savedRows);
    },
    [dispatch, setRows, onSaveComplete, onNavigateAfterSave],
  );

  /***********
   * Effects *
   ***********/

  /**
   * Updates the toolbar state when the rows change
   *
   * @returns {void}
   */
  useEffect(() => {
    updateToolbarState();
  }, [updateToolbarState]);

  /**
   * Updates the gridDataWasChangedRef when the gridDataWasChanged prop changes
   *
   * @returns {void}
   */
  useEffect(() => {
    gridDataWasChangedRef.current = gridDataWasChanged;
  }, [gridDataWasChanged]);

  /******************
   * Memoized Data  *
   ******************/

  /**
   * Creates the columns for the Syncfusion grid
   */
  const divPfColumns = createDivPfColumns();
  const totalAggregates = createDivPfTotalAggregates();
  const diffAggregates = createDivPfDiffAggregates(totalPrizeFund);

  return (
    <>
      <WaitModal show={saveStatus === "saving"} message="Saving..." />

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

      <GridComponent
        id="divPfGrid"
        ref={gridRef}
        dataSource={gridData}
        allowSelection={true}
        allowSorting={false}
        editSettings={editSettings}
        enableStickyHeader={true}
        gridLines="Both"
        width="450"
        height="350"
        selectionSettings={{ mode: "Cell" }}
        toolbar={toolbarOptions}
        actionComplete={handleActionComplete}
        cellSaved={handleCellSaved}
        recordClick={handleRecordClick}
        recordDoubleClick={handleRecordDoubleClick}
        toolbarClick={toolbarClick}
      >
        <ColumnsDirective>
          {divPfColumns.map((col) => (
            <ColumnDirective
              allowEditing={col.allowEditing}
              edit={col.edit}
              editType={col.editType}
              field={col.field}
              format={col.format}
              headerText={col.headerText}
              isPrimaryKey={col.isPrimaryKey}
              key={col.field}
              textAlign={col.textAlign}
              type={col.type}
              validationRules={col.validationRules}
              visible={col.visible}
              width={col.width}
            />
          ))}
        </ColumnsDirective>

        <AggregatesDirective>
          <AggregateDirective>
            <AggregateColumnsDirective>
              {totalAggregates.map((tCol) => (
                <AggregateColumnDirective key={tCol.field} {...tCol} />
              ))}
            </AggregateColumnsDirective>
          </AggregateDirective>
          <AggregateDirective>
            <AggregateColumnsDirective>
              {diffAggregates.map((dCol) => (
                <AggregateColumnDirective key={dCol.field} {...dCol} />
              ))}
            </AggregateColumnsDirective>
          </AggregateDirective>
        </AggregatesDirective>

        <Inject services={[Aggregate, Edit, Toolbar]} />
      </GridComponent>
    </>
  );
};

export default DivPrizeFundGrid;
