"use client";

import "@/lib/syncfusion-license";

import { scoreEntryRow, extractGameScores } from "./scoreRows";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGamesForSquadLoadStatus, getGamesForSquadSaveStatus, updateGamesForSquad } from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import type { ClickEventArgs, ItemModel } from "@syncfusion/ej2-navigations";
import {
  ActionEventArgs,
  ColumnDirective,
  ColumnsDirective,
  Edit,
  GridComponent,
  Inject,
  Toolbar,
  type CellSaveArgs,
  type EditSettingsModel,
  type RecordClickEventArgs,
  type RecordDoubleClickEventArgs,    
} from "@syncfusion/ej2-react-grids";
import {
  createScoreColumns,  
  scoreEntryIdColName,
  scoreEntryPlusMinusColName,
  scoreEntryTotalColName
} from "./sfCreateScoreColumns";
import ModalConfirm, { cancelConfTitle, delConfTitle } from "@/components/modal/confirmModal";
import { initModalObj, modalObjectType } from "@/components/modal/modalObjType";
import "./scoresForm.css";
import WaitModal from "@/components/modal/waitModal";

/*********
 * Types *
 *********/

type totalType = {
  total: number;
  plusMinus: string;
  totalHdcp: number;
  totalPlusHdcp: number;
}

interface ChildProps {
  rows: scoreEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<scoreEntryRow[]>>;    
  enableEditing?: boolean;
  dataWasChanged: boolean;
  onDataChanged: () => void;
  onDataReset: () => void;
  onNavigateAfterSave?: () => void;
  onSaveComplete?: (savedRows: scoreEntryRow[]) => void;
}

const ScoresEntryForm: React.FC<ChildProps> = ({
  rows,
  setRows,
  enableEditing = true,
  dataWasChanged = false,
  onDataChanged,
  onDataReset,
  onNavigateAfterSave,
  onSaveComplete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const [confModalObj, setConfModalObj] = useState<modalObjectType>(initModalObj);

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
      text: "Double-click to edit a score",
      tooltipText: "Double-click to edit a score",
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

  const tmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );
  const games = useSelector(
    (state: RootState) => state.gamesForSquad.games,
  );
  const saveStatus = useSelector(getGamesForSquadSaveStatus);
  const loadStatus = useSelector(getGamesForSquadLoadStatus);

  /********
   * Refs *
   ********/

  const gridRef = useRef<GridComponent | null>(null);
  const lastFocusedRowIndexRef = useRef<number | null | undefined>(null);
  const lastFocusedFieldRef = useRef<string | null | undefined>(null);
    
  const currentEditRef = useRef<{
    rowIndex: number;
    field: string;
  } | null>(null);

  const pendingMoveRef = useRef<{
    rowIndex: number;
    field: string;
  } | null>(null);

  const saveRequestedRef = useRef(false);
  const closeAfterSaveRef = useRef(false);

  /******************
   * Derived Values *
   ******************/

  const runTmntUrl = `/dataEntry/runTmnt/${tmntFullData?.tmnt.id}`;  

  /*********************
   * Utility Functions *
   *********************/

  const returnToRunTmnt = useCallback(() => {
    router.push(runTmntUrl);
  }, [router, runTmntUrl]);

  /**
   * Calculates the totals for a row of scores
   *
   * @param {scoreEntryRow} row - The row with game scores to calculate totals 
   * @param {number} hdcp - The handicap value
   * @returns {totalType} - The calculated totals
   */
  const calcRowTotals = (row: scoreEntryRow, hdcp: number): totalType => {
    let total = 0;
    let plusMinus = 0;
    let totalHdcp = 0;
    let totalPlusHdcp = 0;

    let games = 0;
    Object.entries(row).forEach(([key, value]) => {
      if (!key.startsWith("game_")) return;

      const num = Number(value);
      if (Number.isFinite(num)) {
        total += num;
      }
      if (value !== null) games++;
    });
    plusMinus = total - (games * 200); // 200 is par for bowling
    totalHdcp = total + (hdcp * games);
    totalPlusHdcp = total + totalHdcp;

    return {
      total,
      plusMinus: plusMinus > 0 ? `+${plusMinus}` : `${plusMinus}`,
      totalHdcp,
      totalPlusHdcp,    
    };
  };

  /**
   * Gets the first editable field in the grid
   * 
   * @returns {string | null} - name of first editable field or null if none found
   */
  const getFirstEditableField = (): string | null => {
    const grid = gridRef.current;
    if (!grid) return null;

    const col = grid
      .getColumns()
      .find((c) => c.field?.startsWith("game_"));

    return col?.field ?? null;
  };

  /******************
   * modal Handlers *
   ******************/

  /**
   * runs when the user clicks yes in the confirm modal
   * does all the actions when the user clicks yes 
   *  - cancel 
   *  - cancel and close
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
      pendingMoveRef.current = null;

      onDataReset?.();

      return;
    }
    
    /********
     * back *
     ********/
    if (confModalObj.id === BACK_ID) {
      
      setConfModalObj(initModalObj); // reset modal object (hides modal)

      grid.editModule.batchCancel();
      grid.clearSelection();

      currentEditRef.current = null;
      pendingMoveRef.current = null;

      // go back to run tournament page
      // router.push(runTmntUrl);
      returnToRunTmnt();
      return;
    }
  };

  const confirmNo = (): void => {
    setConfModalObj(initModalObj); // reset modal object (hides modal)
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
  const gridData = useMemo<scoreEntryRow[]>(() => {
    return rows.map((row) => ({ ...row }));
  }, [rows]);

  /**
   * Commits the current edit and moves to the next row
   *
   * @returns {void}
   */
  const autoCommitAndMove = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const editInfo = currentEditRef.current;
    if (!editInfo) return;

    if (!Number.isInteger(editInfo.rowIndex)) return;

    pendingMoveRef.current = {
      rowIndex: editInfo.rowIndex + 1,
      field: editInfo.field,
    };

    grid.saveCell();
  }, []);

  /**
   * Starts editing the first editable field in the grid
   *
   * @returns {void}
   */
  const beginToolbarEdit = useCallback((): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const firstEditableField = getFirstEditableField();
    if (!firstEditableField) return;

    let rowIndex = lastFocusedRowIndexRef.current ?? 0;

    if (rowIndex < 0 || rowIndex >= gridData.length) {
      rowIndex = 0;
    }

    let field = lastFocusedFieldRef.current;

    const isEditable =
      field != null &&
      field.startsWith("game_");

    if (!isEditable) {
      field = firstEditableField;
    }

    grid.selectCell({ rowIndex, cellIndex: 0 });

    // small timeout helps Syncfusion settle selection first
    setTimeout(() => {
      grid.editCell(rowIndex, field!);
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
      dataWasChanged
    );
  }, [dataWasChanged]);

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
      if (!grid || !tmntFullData) return;

      const currentRows = grid.getCurrentViewRecords() as scoreEntryRow[];
      const squadId = tmntFullData.squads?.[0]?.id ?? "";
      const gamesToSave = extractGameScores(
        currentRows,
        games,
        squadId,
      );
      if (gamesToSave.length > 0) {
        await dispatch(
          updateGamesForSquad({
            squadId,
            games: gamesToSave,
          }),
        ).unwrap();
      }

      const savedRows = currentRows.map(row => ({ ...row }));
      const shouldCloseAfterSave = closeAfterSaveRef.current;

      closeAfterSaveRef.current = false;
      currentEditRef.current = null;
      pendingMoveRef.current = null;

      onSaveComplete?.(savedRows);
      if (shouldCloseAfterSave) {
        onSaveComplete?.(savedRows);
        onNavigateAfterSave?.();
        return;
      }

      setRows(savedRows);
    },
    [
      dispatch, 
      games, 
      tmntFullData, 
      setRows, 
      onSaveComplete, 
      onNavigateAfterSave,
    ],
  );

  const handleCellSaved = useCallback((args: CellSaveArgs): void => {
    const grid = gridRef.current;
    if (!grid) return;

    const rowData = args.rowData as scoreEntryRow;
    if (!rowData) return;

    const field = args.columnName as keyof scoreEntryRow;
    const value = args.value;

    // Patch the saved cell value into rowData first.
    rowData[field] = value as never;

    const playerHdcp = 0
    const totalsObj = calcRowTotals(rowData, playerHdcp);
    rowData[scoreEntryTotalColName] = totalsObj.total;  
    rowData[scoreEntryPlusMinusColName] = totalsObj.plusMinus;

    const rowId = rowData[scoreEntryIdColName];
    if (rowId) {
      grid.setCellValue(rowId, scoreEntryTotalColName, totalsObj.total);
      grid.setCellValue(rowId, scoreEntryPlusMinusColName, totalsObj.plusMinus);   
    }
    onDataChanged?.();

    const pendingMove = pendingMoveRef.current;
    // if a pending move and row index is still valid, move to next cell
    if (
      pendingMove &&
      pendingMove.rowIndex < gridData.length
    ) {
      pendingMoveRef.current = null;

      // small timeout helps Syncfusion settle selection first
      setTimeout(() => {
        const currentGrid = gridRef.current;
        if (!currentGrid) return;
        // Small timeout allows Syncfusion to finish the current
        // move to the next cell
        currentGrid.editCell(
          pendingMove.rowIndex,
          pendingMove.field,
        );
      }, 0);
    }

    currentEditRef.current = null;
  }, [gridData.length, onDataChanged] );

  const handleRecordClick = useCallback(
    (args: RecordClickEventArgs): void => {
      lastFocusedRowIndexRef.current = args.rowIndex;

      const field = (args.column as { field?: string })?.field;
      if (field) {
        lastFocusedFieldRef.current = field;
      }
    }, 
    [],
  );

  const handleRecordDoubleClick = useCallback(
    (args: RecordDoubleClickEventArgs): void => {
      lastFocusedRowIndexRef.current = args.rowIndex;

      const field = (args.column as { field?: string })?.field;
      if (field) {
        lastFocusedFieldRef.current = field;
      }
    }, 
    [],
  );

  const toolbarClick = useCallback((args: ClickEventArgs): void => {
    const grid = gridRef.current;
    if (!grid) return;

    switch (args.item.id) {
      case EDIT_ID:
        beginToolbarEdit();
        break;
      case SAVE_ID:
        saveRequestedRef.current = true;
        closeAfterSaveRef.current = false;
        grid.editModule.batchSave();
        break;
      case SAVE_CLOSE_ID:   
        saveRequestedRef.current = true;
        closeAfterSaveRef.current = true;
        grid.editModule.batchSave();
        break;
      case CANCEL_ID:
        setConfModalObj({
          show: true,
          id: CANCEL_ID,        
          title: cancelConfTitle,        
          message: 'Do you want to cancel edits?',
        });
        break;          
      case BACK_ID:
        if (dataWasChanged) {
          setConfModalObj({
            show: true,
            id: BACK_ID,
            title: cancelConfTitle,
            message: 'There are unsaved edits. Do you want to cancel edits and return to the Run Tournament page?',
          });
        } else { 
          returnToRunTmnt();
        }
        break;
    }
  }, [beginToolbarEdit, dataWasChanged, returnToRunTmnt] );

  /******************
   * Memoized Data  *
   ******************/

  /**
   * Creates the columns for the Syncfusion grid
   */
  const gameScoreColumns = useMemo(
    () =>
      createScoreColumns(tmntFullData, autoCommitAndMove),
    [ tmntFullData, autoCommitAndMove ],
  );

  /**********
   * Render *
   **********/
  
  return (
    <>
      <WaitModal show={loadStatus === "loading"} message="Loading..." />

      <WaitModal show={saveStatus === "saving"} message="Saving..." />

      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />     

      <div>
        <h5>Tournament: {tmntFullData?.tmnt.tmnt_name}</h5>
        <h6>Players: {gridData.length}</h6>        
        {/* {!enableEditing && !saving && (
          <div className="alert alert-warning">
            This tournament has been finalized. Score editing is disabled.
          </div>
        )} */}
      </div>
      <GridComponent
        id="gameScoresGrid"
        ref={gridRef}
        dataSource={gridData}           
        allowSelection={true}
        allowSorting={false}
        editSettings={editSettings}
        enableStickyHeader={true}
        gridLines="Both"
        height="450"
        selectionSettings={{ mode: "Cell" }}
        toolbar={toolbarOptions}

        actionComplete={handleActionComplete}
        cellSaved={handleCellSaved}
        recordClick={handleRecordClick}
        recordDoubleClick={handleRecordDoubleClick}
        toolbarClick={toolbarClick}

        cellEdit={(args) => {
          let rowIndex = args.rowIndex;

          if (rowIndex == null && args.row) {
            rowIndex = Number(args.row.getAttribute("aria-rowindex")) - 1;
          }

          currentEditRef.current = {
            rowIndex: rowIndex ?? 0,
            field: args.columnName,
          };
        }}   
      >
        <ColumnsDirective>
          {gameScoreColumns.map((col) => (
            <ColumnDirective
              allowEditing={col.allowEditing}
              customAttributes={col.customAttributes}
              edit={col.edit}
              editType={col.editType}
              field={col.field}              
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
        <Inject services={[Edit, Toolbar]} />
      </GridComponent>
    </>
  )
};

export default ScoresEntryForm;