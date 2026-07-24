"use client";

import "@/lib/syncfusion-license";

import type { idTypes, prizeFundEntryRow } from "@/lib/types/types";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
  createPfColumns,
  pfEntryAmountColName,
  pfEntryIdColName,
  pfEntryPercentColName,
} from "./sfCreatePfColumns";
import {
  createPfDiffAggregates,
  createPfTotalAggregates,
} from "./sfPfAggregates";
import ModalErrorMsg from "@/components/modal/errorModal";
import { maxMoney } from "@/lib/validation/constants";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";


/*********************
 * Validation Errors *
 *********************/

enum validationError {
  NONE = 0,
  NO_ROWS = -1,
  INVALID_AMOUNT = -2,
  INVALID_SEQUENCE = -3,
}

/*********************
 * Toolbar Constants *
 *********************/

const TOOLBAR_IDS = {
  CANCEL: "undo_all",
  BACK: "back",
  EDIT: "edit",
  SAVE: "save",
  SAVE_CLOSE: "done",
} as const;

/**
 * Methods exposed to the parent component through React.forwardRef().
 *
 * The page normally communicates with the grid through props.
 * However, while the user is batch editing, Syncfusion keeps the
 * current edits inside the grid instead of React state.
 *
 * These methods let the parent retrieve the grid's current data
 * without interrupting batch editing.
 */
export interface PrizeFundGridHandle {
  /**
   * Returns the grid rows including any unsaved batch edits.
   */
  getCurrentRows: () => prizeFundEntryRow[];
}
interface PrizeFundGridProps {
  gridId: string;
  prizeFundType: idTypes;
  rows: prizeFundEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<prizeFundEntryRow[]>>;
  totalPrizeFund: number;
  enableEditing?: boolean;
  gridHeight?: number | string;
  gridDataWasChanged: boolean;
  saveStatus: string;
  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onSave: (rows: prizeFundEntryRow[]) => Promise<void>;
  onNavigateAfterSave?: () => void;
  onBack: () => void;
  onSaveComplete?: (savedRows: prizeFundEntryRow[]) => void;
}

/**
 * Generic prize-fund grid.
 *
 * React props are used for normal communication with the parent.
 *
 * React.forwardRef() is used only to expose a few helper methods
 * (see PrizeFundGridHandle) that allow the parent page to retrieve
 * the grid's current batch-edited rows.
 */
const PrizeFundGrid = forwardRef<PrizeFundGridHandle, PrizeFundGridProps>(
  (
    {
      gridId,
      prizeFundType,
      rows,
      setRows,
      totalPrizeFund,
      enableEditing = true,
      gridHeight = "150",
      gridDataWasChanged = false,
      saveStatus,
      onGridDataChanged,
      onGridDataReset,
      onSave,
      onNavigateAfterSave,
      onBack,
      onSaveComplete,
    },
    ref,
  ) => {
    if (
      !(
        prizeFundType === "div" ||
        prizeFundType === "pot" ||
        prizeFundType === "elm"
      )
    )
      throw new Error("prizeFundType must be 'div', 'pot', or 'elm'");

    const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);
    const [errModalObj, setErrModalObj] = useState<modalObjectType>(initModalObj);

    /*******************
     * Toolbar Options *
     *******************/

    const toolbarOptions: (string | ItemModel)[] = [
      {
        text: "Edit",
        tooltipText: "Double-click to edit an amount",
        id: TOOLBAR_IDS.EDIT,
        prefixIcon: "e-icons e-edit",
      },
      {
        text: "Save",
        tooltipText: "Save the amounts",
        id: TOOLBAR_IDS.SAVE,
        prefixIcon: "e-icons e-check",
      },
      {
        text: "Save and Close",
        tooltipText: "Save the amounts and return to the Run Tournament page",
        id: TOOLBAR_IDS.SAVE_CLOSE,
        prefixIcon: "e-icons e-update",
      },
      {
        text: "Cancel",
        tooltipText: "cancel all changes since last save",
        id: TOOLBAR_IDS.CANCEL,
        prefixIcon: "e-icons e-cancel",
      },
      {
        text: "Back",
        tooltipText: "Back to the Run Tournament page",
        id: TOOLBAR_IDS.BACK,
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

    /**
     * Stores the latest total prize fund.
     *
     * Syncfusion may retain the custom aggregate callback created during the
     * first render. The retained callback reads this ref so it always uses the
     * current total instead of the total captured during the first render.
     */
    const totalPrizeFundRef = useRef(totalPrizeFund);
    totalPrizeFundRef.current = totalPrizeFund;

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
      if (confModalObj.id === TOOLBAR_IDS.CANCEL) {
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

    /***********************
     * Grid Helper Methods *
     **********************/

    /**
     * create a mutable copy of the rows for the Syncfusion grid
     * useMemo so this only reruns when rows change, not on every render
     *
     * @returns {void}
     */
    const gridData = useMemo<prizeFundEntryRow[]>(() => {
      return rows.map((row) => ({ ...row }));
    }, [rows]);

    /**
     * Returns the current contents of the grid.
     *
     * Syncfusion stores batch edits internally until the user performs
     * a batch save. Therefore the React "rows" prop may not contain the
     * user's latest edits.
     *
     * This method merges:
     *   - current grid rows
     *   - pending batch edits
     *   - added rows
     *   - deleted rows
     *
     * so the caller receives the exact data currently shown in the grid.
     */
    const getCurrentGridRows = useCallback((): prizeFundEntryRow[] => {
      const grid = gridRef.current;

      if (!grid) {
        return rows.map((row) => ({ ...row }));
      }

      grid.editModule.saveCell();

      const currentRows = grid.getCurrentViewRecords() as prizeFundEntryRow[];

      const batchChanges = grid.getBatchChanges() as {
        changedRecords?: prizeFundEntryRow[];
        addedRecords?: prizeFundEntryRow[];
        deletedRecords?: prizeFundEntryRow[];
      };

      const changedRecords = batchChanges.changedRecords ?? [];
      const addedRecords = batchChanges.addedRecords ?? [];
      const deletedRecords = batchChanges.deletedRecords ?? [];

      const deletedIds = new Set(deletedRecords.map((row) => row.id));

      const mergedRows = currentRows
        .filter((row) => !deletedIds.has(row.id))
        .map((row) => {
          const changedRow = changedRecords.find(
            (changed) => changed.id === row.id,
          );

          return changedRow ? { ...row, ...changedRow } : { ...row };
        });

      return [...mergedRows, ...addedRecords.map((row) => ({ ...row }))];
    }, [rows]);

    /**
     * gets the total amount in the grid
     *
     * @returns {number} - total amount in the grid
     */
    const getGridTotalPrizeFund = (): number => {
      const grid = gridRef.current;
      if (!grid) return 0;

      const currentRows = grid.getCurrentViewRecords() as prizeFundEntryRow[];

      const batchChanges = grid.getBatchChanges() as {
        changedRecords?: prizeFundEntryRow[];
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
     * @returns {validationErrors} true if all prize amounts are valid
     */
    const validatePrizeFundAmounts = useCallback(
      (): validationError => {
        const grid = gridRef.current;
        if (!grid) return validationError.NONE;

        const currentRows =
          grid.getCurrentViewRecords() as prizeFundEntryRow[];

        if (currentRows.length === 0) {
          return validationError.NO_ROWS;
        }

        const batchChanges = grid.getBatchChanges() as {
          changedRecords?: prizeFundEntryRow[];
        };

        const changedRecords = batchChanges.changedRecords ?? [];

        const currentRowsWithChanges = currentRows.map((row) => {
          const changedRow = changedRecords.find(
            (changed) => changed.id === row.id,
          );

          return changedRow
            ? { ...row, ...changedRow }
            : row;
        });

        for (let i = 0; i < currentRowsWithChanges.length; i++) {
          const currentAmount = Number(currentRowsWithChanges[i].amount) || 0;

          if (currentAmount < 1 || currentAmount > maxMoney) {
            return validationError.INVALID_AMOUNT;
          }

          if (i > 0) {
            const previousAmount = 
              Number(currentRowsWithChanges[i - 1].amount) || 0;

            if (currentAmount > previousAmount) {
              return validationError.INVALID_SEQUENCE;
            }
          }
        }

        return validationError.NONE;
      }, [],
    );    
    
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
     * Expose selected helper methods to the parent component.
     *
     * The parent does not receive the GridComponent itself.
     * Instead it receives a small public API defined by
     * PrizeFundGridHandle.
     */
    useImperativeHandle(
      ref,
      () => ({
        getCurrentRows: getCurrentGridRows,
      }),
      [getCurrentGridRows],
    );

    /*********************
     * Validate and Save *
     *********************/

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
            const amountsDontMatchMsg =
              prizeFundType === "div"
                ? 'The sum of the "Amount" columns does not match the "Total Prize Fund" amount.'
                : 'The sum of the "Amount" columns does not match the "Game Prize Fund" amount.';
            setErrModalObj({
              show: true,
              title: "Validate Error",
              message: amountsDontMatchMsg,
              id: "validate_error",
            });
            return;
          }

          const validationResult = validatePrizeFundAmounts();
          if (validationResult !== validationError.NONE) {
            let message = "";
            switch (validationResult) {
              case validationError.NO_ROWS:
                message = "Prize amounts must have at least one row.";
                break;
              case validationError.INVALID_AMOUNT:
                const minStr = formatValueSymbSep2Dec("1.00", localConfig);
                const maxStr = formatValueSymbSep2Dec(maxMoney.toString(), localConfig);
                message = `Prize amounts must be between ${minStr} and ${maxStr}.`;
                break;
              case validationError.INVALID_SEQUENCE:
                message =
                  "Prize amounts must be in descending order of finishing position.";
                break;
              default:
                message = "An unknown error occurred.";
            }
            setErrModalObj({
              show: true,
              title: "Validate Error",
              message,
              id: "validate_error",
            });
            return;
          }

          saveRequestedRef.current = true;
          closeAfterSaveRef.current = closeAfterSave;

          grid.editModule.batchSave();
        }, 0);
      },
      [
        validatePrizeFundAmounts,
        totalPrizeFund,
        prizeFundType,                
      ],
    );

    /********************
     * Toolbar Handlers *
     ********************/

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

      const cellIndex = getCellIndex(pfEntryAmountColName);
      if (cellIndex < 0) return;

      grid.selectCell({ rowIndex, cellIndex });

      // small timeout helps Syncfusion settle selection first
      setTimeout(() => {
        grid.editCell(rowIndex, pfEntryAmountColName);
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
        [TOOLBAR_IDS.SAVE, TOOLBAR_IDS.SAVE_CLOSE, TOOLBAR_IDS.CANCEL],
        gridDataWasChanged,
      );
    }, [gridDataWasChanged]);

    const toolbarClick = useCallback(
      (args: ClickEventArgs): void => {
        const grid = gridRef.current;
        if (!grid) return;

        switch (args.item.id) {
          case TOOLBAR_IDS.EDIT:
            beginToolbarEdit();
            break;
          case TOOLBAR_IDS.SAVE:
            validateAndSave(false);
            break;
          case TOOLBAR_IDS.SAVE_CLOSE:
            validateAndSave(true);
            break;
          case TOOLBAR_IDS.CANCEL:
            setConfModalObj({
              show: true,
              id: TOOLBAR_IDS.CANCEL,
              title: cancelConfTitle,
              message: "Do you want to cancel edits?",
            });
            break;
          case TOOLBAR_IDS.BACK:
            onBack();
            break;
        }
      },
      [validateAndSave, beginToolbarEdit, onBack],
    );

    /**********************
     * Grid Event Handlers *
     **********************/

    const handleCellSaved = useCallback(
      (args: CellSaveArgs): void => {
        const grid = gridRef.current;
        if (!grid) return;

        const rowData = args.rowData as prizeFundEntryRow;
        if (!rowData) return;

        const field = args.columnName as keyof prizeFundEntryRow;
        const value = args.value;
        rowData[field] = value as never;

        const rowAmount = Number(rowData.amount) || 0;
        const rowPercent =
          rowAmount === 0 || totalPrizeFund === 0
            ? 0
            : rowAmount / totalPrizeFund;

        const rowId = rowData[pfEntryIdColName];
        if (rowId) {
          grid.setCellValue(rowId, pfEntryPercentColName, rowPercent);
        }

        onGridDataChanged();
        currentEditRef.current = null;
      },
      [onGridDataChanged, totalPrizeFund],
    );

    const handleRecordClick = useCallback(
      (args: RecordClickEventArgs): void => {
        lastFocusedRowIndexRef.current = args.rowIndex;
      },
      [],
    );

    const handleRecordDoubleClick = useCallback(
      (args: RecordDoubleClickEventArgs): void => {
        lastFocusedRowIndexRef.current = args.rowIndex;
      },
      [],
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

        const currentRows = grid.getCurrentViewRecords() as prizeFundEntryRow[];
        if (currentRows.length > 0) {
          await onSave(currentRows);
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
      [onSave, onSaveComplete, onNavigateAfterSave, setRows],
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

    /**
     * Refreshes the grid so Syncfusion recalculates the custom aggregates.
     *
     * The total prize fund is supplied from outside the grid's dataSource.
     * Updating it does not automatically cause Syncfusion to rerun the custom
     * aggregate functions.
     */
    useEffect(() => {
      const grid = gridRef.current;
      if (!grid) return;

      grid.refresh();
    }, [totalPrizeFund]);

    /******************
     * Memoized Data  *
     ******************/

    /**
     * Creates the columns for the Syncfusion grid
     */
    const pfColumns = createPfColumns();
    const totalAggregates = createPfTotalAggregates();

    const diffAggregates = useMemo(
      () =>
        createPfDiffAggregates(
          () => totalPrizeFundRef.current,
        ),
      [],
    );

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
          id={gridId}
          ref={gridRef}
          dataSource={gridData}
          allowSelection={true}
          allowSorting={false}
          editSettings={editSettings}
          enableStickyHeader={true}
          gridLines="Both"
          width="450"
          height={gridHeight}
          selectionSettings={{ mode: "Cell" }}
          toolbar={toolbarOptions}
          actionComplete={handleActionComplete}
          cellSaved={handleCellSaved}
          recordClick={handleRecordClick}
          recordDoubleClick={handleRecordDoubleClick}
          toolbarClick={toolbarClick}
        >
          <ColumnsDirective>
            {pfColumns.map((col) => (
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
  },
);

PrizeFundGrid.displayName = "PrizeFundGrid";

export default PrizeFundGrid;
