"use client";

import "@/lib/syncfusion-license";

import { scoreEntryRow } from "./populateScoreRows";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import type { ClickEventArgs, ItemModel } from "@syncfusion/ej2-navigations";
import {
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
import "./scoresForm.css";

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
  onNavigateAfterSave?: () => void;
}

const ScoresEntryForm: React.FC<ChildProps> = ({
  rows,
  setRows,
  enableEditing = true,
  onNavigateAfterSave,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const CANCEL_ID = "undo_all";
  const CANCEL_CLOSE_ID = "cancel";
  const EDIT_ID = "edit";
  const SAVE_ID = "save";
  const SAVE_CLOSE_ID = "done";

  const cancelAlltext = enableEditing ? "Cancel All" : "Return to Run";
  const cancelAllTooltip = enableEditing
    ? "Cancel all changes and return to the Run Tournament page"
    : "Return to the Run Tournament page";

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
      text: cancelAlltext,
      tooltipText: cancelAllTooltip,
      id: CANCEL_CLOSE_ID,
      prefixIcon: "e-icons e-back",
    },
  ];

  const editSettings: EditSettingsModel = {
    allowEditing: enableEditing,
    allowAdding: false,
    allowDeleting: false,
    mode: "Batch",
  };

  const tmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );

  const gridRef = useRef<GridComponent | null>(null);
  const lastFocusedRowIndexRef = useRef<number | null | undefined>(null);
  const lastFocusedFieldRef = useRef<string | null | undefined>(null);
    
  const currentEditRef = useRef<{
    rowIndex: number;
    field: string;
  } | null>(null);
  
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
      plusMinus: plusMinus >= 0 ? `+${plusMinus}` : `${plusMinus}`,
      totalHdcp,
      totalPlusHdcp,    
    };
  };

  /**
   * Updates the total column
   * 
   * need to use useCallback because called from funcs that are useCallback(...)
   *
   * @return {void}
   */
  // const updateTotalScore = useCallback((): void => {
  //   const grid = gridRef.current;
  //   if (!grid) return;

  //   let total = 0;
  //   grid.getColumns().forEach((col) => {
  //     if (!col.field?.startsWith("game_")) return;
  //     const num = parseEditorNumber(col.field);

  //     total += num ?? 0; // treats (num = null or num = undefined) as 0      
  //   });
  //   const scoresTotalInput = grid.element.querySelector(
  //     `input[name = "${scoreEntryTotalColName}"]`
  //   ) as HTMLInputElement | null;

  //   if (scoresTotalInput) {
  //     scoresTotalInput.value = total == null ? "" : String(total);
  //   }
  // }, [gridRef]);

  // const updateTotalScore = useCallback((): void => {
  //   const grid = gridRef.current;
  //   if (!grid) return;

  //   const editInfo = currentEditRef.current;
  //   if (!editInfo) return;

  //   let total = 0;

  //   grid.getColumns().forEach((col) => {
  //     if (!col.field?.startsWith("game_")) return;

  //     const num = parseEditorNumber(col.field);

  //     total += num ?? 0;
  //   });

  //   // update the readonly Total column in batch edit mode
  //   grid.editModule.updateCell(
  //     editInfo.rowIndex,
  //     scoreEntryTotalColName,
  //     total,
  //   );
  // }, []);

  // const updateTotalScore = useCallback((): void => {
  //   const grid = gridRef.current;
  //   if (!grid) return;

  //   const editInfo = currentEditRef.current;
  //   if (!editInfo) return;

  //   let total = 0;

  //   grid.getColumns().forEach((col) => {
  //     if (!col.field?.startsWith("game_")) return;

  //     const num = parseEditorNumber(col.field);

  //     total += num ?? 0;
  //   });

  //   // get the row being edited
  //   const rowData = grid.currentViewData[
  //     editInfo.rowIndex
  //   ] as scoreEntryRow;

  //   if (!rowData) return;

  //   // update underlying data
  //   rowData[scoreEntryTotalColName] = total;

  //   // refresh just that row
  //   grid.refreshRow(editInfo.rowIndex);
  // }, []);

  // const handleGameScoreChange = useCallback(
  //   (): void => {
  //     updateTotalScore();
  //   },
  //   [updateTotalScore],
  // );

  const gameScoreColumns = useMemo(
    () =>
      createScoreColumns(tmntFullData),    
    [ tmntFullData ],
  );

  const getFirstEditableField = (): string | null => {
    const grid = gridRef.current;
    if (!grid) return null;

    const col = grid
      .getColumns()
      .find((c) => c.field?.startsWith("game_"));

    return col?.field ?? null;
  };

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


  const toolbarClick = useCallback(
    (args: ClickEventArgs): void => {
      switch (args.item.id) {
        case EDIT_ID:
          beginToolbarEdit();
          break;
        case SAVE_ID:
        case SAVE_CLOSE_ID:
        case CANCEL_ID:
        case CANCEL_CLOSE_ID:
          break;
      }
    }, [beginToolbarEdit],
  );

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

  // const handleCellSaved = useCallback(
  //   (args: CellSaveArgs): void => {
  //     const grid = gridRef.current;
  //     if (!grid) return;

  //     const rowData = args.rowData as scoreEntryRow;
  //     if (!rowData) return;

  //     const total = calcRowTotal(rowData);
  //     rowData[scoreEntryTotalColName] = total;

  //     const rowId = rowData[scoreEntryIdColName];
  //     if (rowId) {
  //       grid.setCellValue(
  //         rowId,
  //         scoreEntryTotalColName,
  //         total,
  //       );
  //     }

  //     currentEditRef.current = null;
  //   }, [],
  // );

  const handleCellSaved = useCallback(
    (args: CellSaveArgs): void => {
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

      currentEditRef.current = null;
    }, [],
  );

  return (
    <>
      <div>
        <h5>Tournament: {tmntFullData?.tmnt.tmnt_name}</h5>
        <h6>Players: {gridData.length}</h6>        
        {/* {!enableEditing && !saving && (
          <div className="alert alert-warning">
            This tournament has been validated. Bowler editing is disabled.
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
        gridLines="Both"
        selectionSettings={{ mode: "Cell" }}
        toolbar={toolbarOptions}

        cellSaved={handleCellSaved}
        recordClick={handleRecordClick}
        recordDoubleClick={handleRecordDoubleClick}
        toolbarClick={toolbarClick}

        cellEdit={(args) => {
          currentEditRef.current = {
            rowIndex: args.rowIndex,
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