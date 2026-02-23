"use client";
import React, { useEffect, useMemo, useState } from "react";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import type { tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent } from "@/lib/enums/enums";
import Link from "next/link";
import WaitModal from "@/components/modal/waitModal";
import ModalErrorMsg from "@/components/modal/errorModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { fetchTmntFullData, getTmntFullDataError, getTmntFullDataLoadStatus } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { getBlankTmntFullData, getSquadStage } from "../../tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";

// http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

const RunTmntPage = () => { 
  
  const params = useParams();
  const router = useRouter();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);    
  const stateTmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData
  )
  const [stage, setStage] = useState<SquadStage | null>(null);
  const [stageError, setStageError] = useState<string | null>(null);
  const [errModalObj, setErrModalObj] = useState(initModalObj);

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
    if (tmntLoadStatus === "succeeded") {
      // If stage hasn't loaded yet, fall back to a safe default
      const effectiveStage = stage ?? SquadStage.DEFINE; // or SquadStage.ERROR
      return {
        tmntFullData: stateTmntFullData,
        stage: effectiveStage,
        parentForm: tmntFormParent.RUN,
      };
    }

    return {
      tmntFullData: getBlankTmntFullData(),
      stage: SquadStage.ERROR,
      parentForm: tmntFormParent.RUN,
    };
  }, [tmntLoadStatus, stage, stateTmntFullData]);  
  
  const canceledModalErr = () => {
    setErrModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleEditBowlersClick = () => {
    if (stage === SquadStage.DEFINE || stage === SquadStage.ENTRIES) {
      router.push(`/dataEntry/editPlayers/${tmntId}`);
    } else { 
      setErrModalObj({
        show: true,
        title: "Cannot Edit Bowlers",
        message: `This tournament has been finalized and moved into the entering scores stage.`,
        id: "none",
      });
    }
  }

  return (
    <>
      <WaitModal show={tmntLoadStatus === 'loading'} message="Loading..." />
      <ModalErrorMsg
        show={errModalObj.show}
        title={errModalObj.title}
        message={errModalObj.message}
        onCancel={canceledModalErr}
      />
      {(tmntLoadStatus !== 'loading' && tmntLoadStatus !== 'succeeded' && tmntError) && (
        <>Error: {tmntError} tmntLoadStatus: {tmntLoadStatus}</>
      )}     
      {(tmntLoadStatus === 'succeeded') && ( 
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
            {tmntLoadStatus === "succeeded" && stageError && (
              <div className="text-danger mb-2">
                Stage error: {stageError}
              </div>
            )}
            <div className="row g-3">
              <div className="col-6">
                <h2 className="mb-3">Run Tournament</h2>
              </div>
              <div className="col-4">
                <Link className="btn btn-primary" href="/user/tmnts">
                  Back to list
                </Link> 
              </div>
            </div>
            <div className="row g-3 mb-2">
              <div className="col-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditBowlersClick}                  
                >
                  Edit Bowlers
                </button>
                {/* <Link
                  className="btn btn-primary"
                  href={`/dataEntry/editPlayers/${tmntId}`}                  
                >
                  Edit Bowlers
                </Link> */}
              </div> 
              <div className="col-2">
                <Link className="btn btn-primary" href="#">
                  Enter Scores
                </Link>
              </div> 
              <div className="col-2">
                <Link className="btn btn-success" href="#">
                  Set Prize Fund
                </Link>
              </div> 
              <div className="col-2">
                <Link className="btn btn-info" href="#">
                  Print Reports
                </Link>
              </div> 
              <div className="col-2 d-grid gap-2">
                <Link className="btn btn-block btn-dark" href="#" >                  
                  Finalize
                </Link>
              </div> 
              <div className="col-2">
                {/* <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleLastButtonClick}
                >
                  Last Button
                </button> */}
                <Link className="btn btn-warning" href="#">
                  Last Button
                </Link>
              </div> 
            </div>
            <TmntDataForm tmntProps={tmntFormData} />
          </div>
        </div> 
      )}  
    </>
  )
}

export default RunTmntPage;