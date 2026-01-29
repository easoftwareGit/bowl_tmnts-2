"use client";
import React, { useEffect, useMemo, useState } from "react";
import { tmntFormDataType, tmntFormParent } from "@/lib/types/types";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTmntFullData,
  getTmntFullDataLoadStatus,
  getTmntFullDataError,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { AppDispatch, RootState } from "@/redux/store";
import WaitModal from "@/components/modal/waitModal";
import { getBlankTmntFullData, getSquadStage } from "../../tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";

// http://localhost:3000/dataEntry/editTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

export default function EditTmntPage() {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData
  );

  const [stage, setStage] = useState<SquadStage | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);

  useEffect(() => {
    if (!tmntId) return;
    dispatch(fetchTmntFullData(tmntId));
  }, [tmntId, dispatch]);

  // NOTE: Squad stage is intentionally *not* stored in Redux.
  // always read it directly from the DB via getSquadStage to avoid stale stage
  // values when other processes update the stage.
  useEffect(() => {
    if (tmntLoadStatus !== "succeeded") { 
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

    // cleanup function required when async may outlive the component
    return () => {
      cancelled = true;
    };
  }, [tmntLoadStatus, stateTmntFullData]);

  const tmntFormData = useMemo<tmntFormDataType>(() => {
    if (tmntLoadStatus === "succeeded" && stage !== null) {
      return {
        tmntFullData: stateTmntFullData,
        stage: stage,
        parentForm: tmntFormParent.EDIT,
      }
    }
    return {
      tmntFullData: getBlankTmntFullData(),
      stage: SquadStage.ERROR,
      parentForm: tmntFormParent.EDIT,
    };
  }, [tmntLoadStatus, stage, stateTmntFullData]);

  const showLoading = tmntLoadStatus === "loading";
  const showError =
    tmntLoadStatus !== "loading" &&
    tmntLoadStatus !== "succeeded" &&
    !!tmntError;

  return (
    <>
      <WaitModal show={showLoading} message="Loading..." />
      {showError && (
        <>
          Error: {tmntError} tmntLoadStatus: {tmntLoadStatus}
        </>
      )}      
      {tmntLoadStatus === "succeeded" && stage !== null && (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
            {tmntLoadStatus === "succeeded" && stageError && (
              <div className="text-danger mb-2">
                Stage error: {stageError}
              </div>
            )}
            <h2 className="mb-3">Edit Tournament</h2>
            <TmntDataForm tmntProps={tmntFormData} />
          </div>
        </div>
      )}
    </>
  );
}
