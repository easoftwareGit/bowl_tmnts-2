"use client";
import React, { useEffect } from "react";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchOneTmnt, getOneTmntError, getOneTmntLoadStatus } from "@/redux/features/allDataOneTmnt/allDataOneTmntSlice";
import { allDataOneTmntType, allEntriesOneSquadType, tmntActions, tmntFormDataType } from "@/lib/types/types";
import Link from "next/link";
import WaitModal from "@/components/modal/waitModal";
// import { selectOneSquadEntries } from "@/redux/features/allEntriesOneSquad/allEntriesOneSquadSlice";

// http://localhost:3000/dataEntry/runTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

const RunTmntPage = () => { 

  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {    
    dispatch(fetchOneTmnt(tmntId));
  }, [tmntId, dispatch]);

  const tmntLoadStatus = useSelector(getOneTmntLoadStatus);
  const tmntError = useSelector(getOneTmntError);  
  
  const dataOneTmnt = useSelector((state: RootState) => state.allDataOneTmnt.tmntData) as allDataOneTmntType;
  const tmntFormData: tmntFormDataType = {
    origData: dataOneTmnt.origData,
    curData: dataOneTmnt.curData,
    tmntAction: tmntActions.Run,
  };  
  
  return (
    <>
      <WaitModal show={tmntLoadStatus === 'loading'} message="Loading..." />
      {tmntLoadStatus !== 'loading' && tmntLoadStatus !== 'succeeded' && tmntError
        ? (<div>Error: {tmntError} tmntLoadStatus: {tmntLoadStatus}</div>
        ) : null}     
      {(tmntLoadStatus === 'succeeded') ? ( 
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
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
                <Link
                  className="btn btn-primary"
                  href={`/dataEntry/editPlayers/${tmntId}`}
                >
                  Edit Bowlers
                </Link>
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
      ) : null}  
    </>
  )
}

export default RunTmntPage;