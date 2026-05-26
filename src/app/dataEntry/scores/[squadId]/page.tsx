"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import { fetchGamesForSquad, getGamesForSquadStatus } from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import { populateScoreRows, scoreEntryRow } from "../../scoresForm/populateScoreRows";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import ScoresEntryForm from "../../scoresForm/scoresForm";
import WaitModal from "@/components/modal/waitModal";

export default function EditScoresPage() { 
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ squadId: string }>();
  const squadId = params.squadId;

  const [rows, setRows] = useState<scoreEntryRow[]>([]);

  // get original rows for change detection (useRef -> no re-renders)
  const origRowsRef = useRef<scoreEntryRow[]>([]);

  // so only initialize state once when data first becomes available
  // prevents the page from reinitializing state multiple times.
  // redux updates, rerenders, async fetches could overwrite user edits
  const initializedRef = useRef(false);

  // redux selectors
  const tmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData
  );  
  const games = useSelector(
    (state: RootState) => state.gamesForSquad.games
  );  

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const gamesLoadStatus = useSelector(getGamesForSquadStatus);

  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);

  // fetch games for this squad
  useEffect(() => {
    if (!squadId) return;
    dispatch(fetchGamesForSquad(squadId));
  }, [dispatch, squadId]);
  
  // init values for form when retrieving data from state
  // computes ALL initial derived values from tournament data.
  // calculations only need to be done once, no recalc after every render
  const initValues = useMemo(() => { 
    // if no tmnt data or non array for games 
    if (!tmntFullData || !Array.isArray(games)) {      
      return { currRows: [] as scoreEntryRow[] };
    }
    // build rows - most of the work
    return {
      currRows: populateScoreRows(tmntFullData, games)
    } 
  }, [tmntFullData, games]);

  // write init values into state "once", when tmnt data finishes loading
  // guard with initializedRef to avoid overwriting user edits if redux data updates later
  useEffect(() => {
    if (tmntLoadStatus !== "succeeded" || gamesLoadStatus !== "succeeded") return;
    if (initializedRef.current) return; // run only once
    
    const { currRows } = initValues;
    setRows(currRows);

    origRowsRef.current = currRows;
    initializedRef.current = true;    
  }, [tmntLoadStatus, gamesLoadStatus, initValues]);

  const dataWasChanged = useCallback(() => {
    const orig = origRowsRef.current || [];
    for (let i = 0; i < rows.length; i++) {
      if (JSON.stringify(rows[i]) !== JSON.stringify(orig[i])) return true;
    }
    return false;
  }, [rows]);  

  useUnsavedChangesGuard(dataWasChanged);

  const isLoading =
    tmntLoadStatus === "loading" ||
    gamesLoadStatus === "loading";

  const enableEditing = true;  
  
  return (
    <>
      <div className="scores-page-wrapper">
        <div className="scores-content">
          <WaitModal
            show={isLoading}
            message="Loading Scores..."
          />

          {tmntLoadStatus === "succeeded" && gamesLoadStatus === "succeeded" && (
            <>
              <h2>Scores</h2>
              <ScoresEntryForm
                rows={rows}
                setRows={setRows}
                enableEditing={enableEditing}
                onNavigateAfterSave={() => setIsNavigatingAfterSave(true)}
              />
            </>
          )}
        </div>          
      </div>
    </>
  )
}