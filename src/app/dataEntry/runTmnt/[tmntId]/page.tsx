"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { getBlankTmntFullData, getSquadStage } from "../../tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";
import PrizeFundOptions from "@/components/prizeFunds/prizeFundOptions";
import ReportOptions from "@/components/reports/reportOptions";


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
  const [gotStage, setGotStage] = useState(false);
  const [errModalObj, setErrModalObj] = useState(initModalObj);
  const [showPrizeFundOptions, setShowPrizeFundOptions] = useState<boolean>(false);
  const [showReportOptions, setShowReportOptions] = useState<boolean>(false);

  const hasPendingChangesRef = useRef(false);

  const markPendingChanges = useCallback((pending: boolean): void => {
    hasPendingChangesRef.current = pending;
  }, []);

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
          setGotStage(true);
          setStage(s);
          setStageError(null);          
        }
      } catch (err) {
        if (!cancelled) {
          setGotStage(false);
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

    router.push(`/dataEntry/editPlayers/${tmntId}`);
  }

  const handleEnterScoresClick = () => {
    const squadId = stateTmntFullData.squads[0]?.id; // only 1 squad at this point
    if (stage !== SquadStage.SCORES) { 
      setErrModalObj({
        show: true,
        title: "Enter Scores Error",
        message: 'Cannot enter scores until stage is Validated. Click the "Validate and Save" button when editing bowlers.',
        id: squadId
      });
      return;
    }
    router.push(`/dataEntry/scores/${squadId}`);
  }

  return (
    <>
      <WaitModal show={tmntLoadStatus === 'loading' || gotStage === false} message="Loading..." />
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
              </div> 
              <div className="col-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEnterScoresClick}
                >
                  Enter Scores
                </button>
              </div> 
              <div className="col-2 d-grid gap-2">
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-success h-100 w-100" 
                    onClick={() => setShowPrizeFundOptions(true)}                  
                  >
                    Prize Funds
                  </button>
                  <PrizeFundOptions
                    show={showPrizeFundOptions}
                    fullTmntData={stateTmntFullData}
                    onClose={() => setShowPrizeFundOptions(false)}
                    stage={stage ?? SquadStage.ERROR}
                  />
                </div>
              </div> 
              <div className="col-2 d-grid gap-2">
                <div className="position-relative">
                  <button
                    type="button"
                    className="btn btn-info h-100 w-100" 
                    onClick={() => setShowReportOptions(true)}                
                  >
                    Reports
                  </button>
                  <ReportOptions
                    show={showReportOptions}
                    tmntId={tmntId}
                    onClose={() => setShowReportOptions(false)}
                    stage={stage ?? SquadStage.ERROR}
                  />
                </div>
              </div> 
              <div className="col-2 d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-block btn-dark"                   
                >
                  Finalize
                </button>
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
            {/* <ReportOptions
              show={showReportOptions}
              tmntId={tmntId}
              onClose={() => setShowReportOptions(false)}
              stage={stage ?? SquadStage.ERROR}
            /> */}
            <TmntDataForm
              tmntProps={tmntFormData}
              markPendingChanges={markPendingChanges}
            />
          </div>
        </div> 
      )}  
    </>
  )
}

export default RunTmntPage;