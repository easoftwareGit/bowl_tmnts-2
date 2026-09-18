"use client";

import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { prizeFundEntryRow, tmntElimPfSaveDataType } from "@/lib/types/types";
import type { AppDispatch } from "@/redux/store";
import {
  getElimPfsSaveStatus,
  saveElimPfs,
  selectElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import { selectTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { extractElimPfs } from "@/lib/db/elimPfs/dbElimPfs";
import { pfEntryRowsToElimPfEntryRows } from "../convertPfTypes";
import PrizeFundGrid, { type PrizeFundGridHandle } from "../prizeFundGrid";

interface ElimPrizeFundGridProps {
  rows: prizeFundEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<prizeFundEntryRow[]>>;
  elimId: string;
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
 * Elim-specific wrapper for the generic PrizeFundGrid.
 *
 * Responsibilities:
 * 1. Pass the page's prize-fund rows and event handlers to PrizeFundGrid.
 * 2. Convert generic prize-fund rows into elim prize-fund records.
 * 3. Save the elim prize-fund records through Redux.
 * 4. Forward the parent page's ref to PrizeFundGrid.
 *
 * The page and PrizeFundGrid both work with prizeFundEntryRow objects.
 * This wrapper contains only the elim-specific conversion and save logic.
 *
 * forwardRef is required because this wrapper sits between the page and
 * PrizeFundGrid. Without forwardRef, the ref supplied by the page would stop
 * at this component and could not reach PrizeFundGrid.
 *
 * This component does not define the methods exposed by the ref.
 * PrizeFundGrid defines those methods with useImperativeHandle.
 */
const ElimPrizeFundGrid = React.forwardRef<PrizeFundGridHandle, ElimPrizeFundGridProps>(({
  rows,
  setRows,
  elimId,
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
  const saveStatus = useSelector(getElimPfsSaveStatus);

  const allElimPfs = useSelector(selectElimPfs);
  const tmntData = useSelector(selectTmntFullData);

  /**
   * Saves generic prize-fund rows as elim prize-fund records.
   *
   * PrizeFundGrid calls this function after Syncfusion completes its
   * batch-save operation. The currentRows argument contains the grid's
   * current values, including the user's completed batch edits.
   *
   * Data flow:
   * prizeFundEntryRow[]
   *   -> elimPfEntryRow[]
   *   -> elimPfType[]
   *   -> Redux save
   *
   * @param currentRows - Current rows supplied by PrizeFundGrid.
   */
  const handleSave = useCallback(
    async (
      currentRows: prizeFundEntryRow[],
    ): Promise<void> => {
      // 1. Convert generic rows to elim entry rows.
      const elimPfEntryRows =
        pfEntryRowsToElimPfEntryRows(currentRows);

      // 2. Extract the database elim prize-fund records.
      const elimPfsToSave = extractElimPfs(elimPfEntryRows);

      // 3. Replace this elim's existing rows with the
      // current rows from the grid.
      const toSaveElimPfs = [
        ...allElimPfs.filter((elimPf) => elimPf.elim_id !== elimId),
        ...elimPfsToSave,
      ];

      // 4. Save through the elim prize-fund Redux slice.
      if (toSaveElimPfs.length === 0) {
        return;
      }
      const elimIdsForElimPfs: string[] = [
        ...new Set(
          toSaveElimPfs.map(
            (elimPf) => elimPf.elim_id,
          ),
        ),
      ];
      const toSave: tmntElimPfSaveDataType = {
        elimPfData: toSaveElimPfs,
        elimIds: elimIdsForElimPfs,
        tmntId: tmntData.tmnt.id,
      }
      await dispatch(saveElimPfs(toSave)).unwrap();

    },
    [dispatch, allElimPfs, elimId, tmntData],
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
      gridId="elimPfGrid"
      prizeFundType="elm"
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

ElimPrizeFundGrid.displayName = "ElimPrizeFundGrid";

export default ElimPrizeFundGrid;