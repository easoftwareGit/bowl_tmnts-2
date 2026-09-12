"use client";

import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { prizeFundEntryRow, tmntPotPfSaveDataType } from "@/lib/types/types";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  getPotPfsSaveStatus,
  savePotPfs,
} from "@/redux/features/potPfs/potPfsSlice";
import { extractPotPfs } from "@/lib/db/potPfs/dbPotPfs";
import { pfEntryRowsToPotPfEntryRows } from "../convertPfTypes";
import PrizeFundGrid, { type PrizeFundGridHandle } from "../prizeFundGrid";

interface PotPrizeFundGridProps {
  rows: prizeFundEntryRow[];
  setRows: React.Dispatch<React.SetStateAction<prizeFundEntryRow[]>>;
  potId: string;
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
 * Pot-specific wrapper for the generic PrizeFundGrid.
 *
 * Responsibilities:
 * 1. Pass the page's prize-fund rows and event handlers to PrizeFundGrid.
 * 2. Convert generic prize-fund rows into pot prize-fund records.
 * 3. Save the pot prize-fund records through Redux.
 * 4. Forward the parent page's ref to PrizeFundGrid.
 *
 * The page and PrizeFundGrid both work with prizeFundEntryRow objects.
 * This wrapper contains only the pot-specific conversion and save logic.
 *
 * forwardRef is required because this wrapper sits between the page and
 * PrizeFundGrid. Without forwardRef, the ref supplied by the page would stop
 * at this component and could not reach PrizeFundGrid.
 *
 * This component does not define the methods exposed by the ref.
 * PrizeFundGrid defines those methods with useImperativeHandle.
 */
const PotPrizeFundGrid = React.forwardRef<PrizeFundGridHandle, PotPrizeFundGridProps>(({
  rows,
  setRows,
  potId,
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
  const saveStatus = useSelector(getPotPfsSaveStatus);

  const allPotPfs = useSelector(
    (state: RootState) => state.potPfs.potPfs,
  );
  const tmntData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData,
  );

  /**
   * Saves generic prize-fund rows as pot prize-fund records.
   *
   * PrizeFundGrid calls this function after Syncfusion completes its
   * batch-save operation. The currentRows argument contains the grid's
   * current values, including the user's completed batch edits.
   *
   * Data flow:
   * prizeFundEntryRow[]
   *   -> potPfEntryRow[]
   *   -> potPfType[]
   *   -> Redux save
   *
   * @param currentRows - Current rows supplied by PrizeFundGrid.
   */
  const handleSave = useCallback(
    async (
      currentRows: prizeFundEntryRow[],
    ): Promise<void> => {
      // 1. Convert generic rows to pot entry rows.
      const potPfEntryRows = pfEntryRowsToPotPfEntryRows(currentRows);

      // 2. Extract the database pot prize-fund records.
      const potPfsToSave = extractPotPfs(potPfEntryRows);

      // 3. Replace this pot's existing rows with the
      // current rows from the grid.
      const toSavePotPfs = [
        ...allPotPfs.filter((potPf) => potPf.pot_id !== potId),
        ...potPfsToSave,
      ];

      // 4. Save through the division prize-fund Redux slice.
      if (potPfsToSave.length === 0) {
        return;
      }

      const toSave: tmntPotPfSaveDataType = {
        potPfData: toSavePotPfs,
        potIds: toSavePotPfs.map((potPf) => potPf.pot_id),
        tmntId: tmntData.tmnt.id,
      }
      await dispatch(savePotPfs(toSave)).unwrap();
    },
    [dispatch, allPotPfs, potId, tmntData],
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
      gridId="potPfGrid"
      prizeFundType="pot"
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

PotPrizeFundGrid.displayName = "PotPrizeFundGrid";

export default PotPrizeFundGrid;