"use client";
import React, { useEffect } from "react";
import { allDataOneTmntType, tmntActions, tmntFormDataType } from "@/lib/types/types";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneTmnt, getOneTmntError, getOneTmntLoadStatus } from "@/redux/features/allDataOneTmnt/allDataOneTmntSlice";
import { AppDispatch, RootState } from "@/redux/store";
import WaitModal from "@/components/modal/waitModal";

export default function EditTmntPage() {

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
    tmntAction: tmntActions.Edit,
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
            <h2 className="mb-3">Edit Tournament</h2>            
            <TmntDataForm tmntProps={tmntFormData} />
          </div>
        </div> 
      ) : null}  
    </>
  );
}