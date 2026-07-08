"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams, useRouter } from "next/navigation";
import { fetchGamesForSquad, getGamesForSquadLoadStatus } from "@/redux/features/gamesForSquad/gamesForSquadSlice";
import { populateScoreRows, scoreEntryRow } from "../../scoresForm/scoreRows";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import ScoresEntryForm from "../../scoresForm/scoresForm";
import WaitModal from "@/components/modal/waitModal";

export default function EditScoresPage() { 
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ squadId: string }>();
  const router = useRouter();

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
  const gamesLoadStatus = useSelector(getGamesForSquadLoadStatus);

  const [isNavigatingAfterSave, setIsNavigatingAfterSave] = useState(false);
  const [dataWasChanged, setDataWasChanged] = useState(false);

  const runTmntUrl = `/dataEntry/runTmnt/${tmntFullData?.tmnt.id}`;

  // fetch games for this squad
  useEffect(() => {
    if (!squadId) return;
    dispatch(fetchGamesForSquad(squadId));
  }, [dispatch, squadId]);

  // write init values into state "once", when tmnt data finishes loading
  // guard with initializedRef to avoid overwriting user edits if redux data updates later
  useEffect(() => {
    if (tmntLoadStatus !== "succeeded" || gamesLoadStatus !== "succeeded") return;
    if (initializedRef.current) return; // run only once

    const currRows = populateScoreRows(
      tmntFullData,
      games,
    );

    setRows(currRows);

    origRowsRef.current = currRows;
    initializedRef.current = true;    

  }, [tmntLoadStatus, gamesLoadStatus, tmntFullData, games, setRows]);
  
  useUnsavedChangesGuard(dataWasChanged && !isNavigatingAfterSave);

  const isLoading =
    !initializedRef.current &&
    (
      tmntLoadStatus === "loading" ||
      gamesLoadStatus === "loading"
    );

  const enableEditing = true;  

  // after save, if user tries to navigate away, don't want to show the unsaved changes prompt
  useEffect(() => {
    if (!isNavigatingAfterSave) return;
    if (dataWasChanged) return;
    if (!tmntFullData?.tmnt.id) return;

    router.push(runTmntUrl);
  }, [isNavigatingAfterSave, dataWasChanged, tmntFullData, router, runTmntUrl]);

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
                dataWasChanged={dataWasChanged}
                onDataChanged={() => setDataWasChanged(true)}
                onDataReset={() => setDataWasChanged(false)}
                onNavigateAfterSave={() => setIsNavigatingAfterSave(true)}
                onSaveComplete={(savedRows) => {
                  setRows(savedRows);
                  origRowsRef.current = savedRows.map(row => ({ ...row }));
                  setDataWasChanged(false);
                }}
              />
            </>
          )}
        </div>          
      </div>
    </>
  )
}