"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent } from "@/lib/enums/enums";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTmntFullData,
  getTmntFullDataLoadStatus,
  getTmntFullDataError,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { AppDispatch } from "@/redux/store";
import WaitModal from "@/components/modal/waitModal";
import { getSquadStage } from "../../tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

// http://localhost:3000/dataEntry/editTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

export default function EditTmntPage() {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  // the store keeps the last tournament loaded; only use it if it's this one
  const isLoaded =
    tmntLoadStatus === "succeeded" && stateTmntFullData.tmnt.id === tmntId;

  const [stage, setStage] = useState<SquadStage | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);

  /*************************
   * Unsaved Changes Guard *
   *************************/

  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const markPendingChanges = useCallback((pending: boolean): void => {
    setHasPendingChanges(pending);
  }, []);

  useUnsavedChangesGuard(hasPendingChanges);

  /**********************
   * fetch TmntFullData *
   **********************/
  useEffect(() => {
    if (!tmntId) return;
    dispatch(fetchTmntFullData(tmntId));
  }, [tmntId, dispatch]);

  /***************
   * Squad Stage *
   ***************/
  // NOTE: Squad stage is intentionally *not* stored in Redux.
  // always read it directly from the DB via getSquadStage to avoid stale stage
  // values when other processes update the stage.
  useEffect(() => {
    if (!isLoaded) {
      setStage(null);
      setStageError(null);
      return;
    }

    const firstSquadId = stateTmntFullData.squads[0]?.id;
    if (!firstSquadId) {
      setStageError("Tournament has no squad");
      setStage(SquadStage.ERROR);
      return;
    }

    // cleanup required when async may outlive the component
    let cancelled = false;

    (async () => {
      try {
        const s = await getSquadStage(firstSquadId);
        if (!cancelled) {
          setStage(s);
          setStageError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setStage(SquadStage.ERROR);
          setStageError(
            err instanceof Error ? err.message : "Failed to load squad stage"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, stateTmntFullData]);

  /*************
   * Form Data *
   *************/
  // null until the tournament and its stage are both loaded
  const tmntFormData = useMemo<tmntFormDataType | null>(() => {
    if (!isLoaded || stage === null) return null;
    return {
      tmntFullData: stateTmntFullData,
      stage,
      parentForm: tmntFormParent.EDIT,
    };
  }, [isLoaded, stage, stateTmntFullData]);

  const showLoading = tmntLoadStatus === "loading";
  const showError = tmntLoadStatus === "failed";

  return (
    <>
      <WaitModal show={showLoading} message="Loading..." />
      {showError && (
        <div className="alert alert-danger" role="alert">
          Could not load the tournament.{tmntError ? ` ${tmntError}` : ""}
        </div>
      )}
      {tmntFormData && (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
            {stageError && (
              <div className="text-danger mb-2">
                Stage error: {stageError}
              </div>
            )}
            <h2 className="mb-3">Edit Tournament</h2>
            <TmntDataForm
              tmntProps={tmntFormData}
              markPendingChanges={markPendingChanges}
            />
          </div>
        </div>
      )}
    </>
  );
}
