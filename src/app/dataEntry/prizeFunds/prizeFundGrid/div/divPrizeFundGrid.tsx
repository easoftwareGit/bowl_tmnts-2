"use client";

import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { prizeFundEntryRow, tmntDivPfSaveDataType } from "@/lib/types/types";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  getDivPfsSaveStatus,
  saveDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";
import { pfEntryRowsToDivPfEntryRows } from "../convertPfTypes";
import PrizeFundGrid, { type PrizeFundGridHandle } from "../prizeFundGrid";

interface DivPrizeFundGridProps {
  rows: prizeFundEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<prizeFundEntryRow[]>>;
  divId: string;
  totalPrizeFund: number;
  enableEditing?: boolean;
  gridDataWasChanged: boolean;
  onGridDataChanged: () => void;
  onGridDataReset: () => void;
  onNavigateAfterSave?: () => void;
  onBack: () => void;
  onSaveComplete?: (savedRows: prizeFundEntryRow[]) => void;
}

/**
 * Division-specific wrapper for the generic PrizeFundGrid.
 *
 * Responsibilities:
 * 1. Pass the page's prize-fund rows and event handlers to PrizeFundGrid.
 * 2. Convert generic prize-fund rows into division prize-fund records.
 * 3. Save the division prize-fund records through Redux.
 * 4. Forward the parent page's ref to PrizeFundGrid.
 *
 * The page and PrizeFundGrid both work with prizeFundEntryRow objects.
 * This wrapper contains only the division-specific conversion and save logic.
 *
 * forwardRef is required because this wrapper sits between the page and
 * PrizeFundGrid. Without forwardRef, the ref supplied by the page would stop
 * at this component and could not reach PrizeFundGrid.
 *
 * This component does not define the methods exposed by the ref.
 * PrizeFundGrid defines those methods with useImperativeHandle.
 */
const DivPrizeFundGrid = React.forwardRef<PrizeFundGridHandle, DivPrizeFundGridProps>(({
  rows,
  setRows,
  divId,
  totalPrizeFund,
  enableEditing = true,
  gridDataWasChanged,
  onGridDataChanged,
  onGridDataReset,
  onNavigateAfterSave,
  onBack,
  onSaveComplete,
}, ref) => {
  const dispatch = useDispatch<AppDispatch>();
  const saveStatus = useSelector(getDivPfsSaveStatus);

  const allDivPfs = useSelector(
    (state: RootState) => state.divPfs.divPfs,
  );
  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );

  /**
   * Saves generic prize-fund rows as division prize-fund records.
   *
   * PrizeFundGrid calls this function after Syncfusion completes its
   * batch-save operation. The currentRows argument contains the grid's
   * current values, including the user's completed batch edits.
   *
   * Data flow:
   * prizeFundEntryRow[]
   *   -> divPfEntryRow[]
   *   -> divPfType[]
   *   -> Redux save
   *
   * @param currentRows - Current rows supplied by PrizeFundGrid.
   */
  const handleSave = useCallback(
    async (
      currentRows: prizeFundEntryRow[],
    ): Promise<void> => {
      // 1. Convert generic rows to division entry rows.
      const divPfEntryRows = 
        pfEntryRowsToDivPfEntryRows(currentRows);

      // 2. Extract the database division prize-fund records.
      const divPfsToSave = extractDivPfs(divPfEntryRows);

      // 3. Replace this division's existing rows with the
      // current rows from the grid.
      const toSaveDivPfs = [
        ...allDivPfs.filter((divPf) => divPf.div_id !== divId),
        ...divPfsToSave,
      ];

      // 4. Save through the division prize-fund Redux slice.
      if (toSaveDivPfs.length === 0) {
        return;
      }

      const toSave: tmntDivPfSaveDataType = {
        divPfData: toSaveDivPfs,
        divIds: toSaveDivPfs.map((divPf) => divPf.div_id),
        tmntId: tmntData.tmnt.id,
      }
      await dispatch(saveDivPfs(toSave)).unwrap();
    },
    [dispatch, allDivPfs, divId, tmntData],
  );

  return (
    <PrizeFundGrid
      /*
       * Forward the ref received from the page to PrizeFundGrid.
       *
       * PrizeFundGrid uses useImperativeHandle to attach its public
       * methods, such as getCurrentRows(), to this ref.
       */      
      ref={ref}
      gridId="divPfGrid"
      prizeFundType="div"
      rows={rows}
      setRows={setRows}
      totalPrizeFund={totalPrizeFund}
      enableEditing={enableEditing}
      gridDataWasChanged={gridDataWasChanged}
      saveStatus={saveStatus}
      onGridDataChanged={onGridDataChanged}
      onGridDataReset={onGridDataReset}
      onSave={handleSave}
      onNavigateAfterSave={onNavigateAfterSave}
      onBack={onBack}
      onSaveComplete={onSaveComplete}
    />    
  );
});

DivPrizeFundGrid.displayName = "DivPrizeFundGrid";

export default DivPrizeFundGrid;