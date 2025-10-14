"use client";
import React, { useEffect } from "react";
import { tmntActions, tmntFormDataType } from "@/lib/types/types";
import TmntDataForm from "../../tmntForm/tmntForm";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchTmntFullData, getTmntFullDataLoadStatus, getTmntFullDataError } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import { AppDispatch, RootState } from "@/redux/store";
import WaitModal from "@/components/modal/waitModal";
import { getBlankTmntFullData } from "../../tmntForm/tmntTools";

// http://localhost:3000/dataEntry/editTmnt/tmt_d237a388a8fc4641a2e37233f1d6bebd

export default function EditTmntPage() {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchTmntFullData(tmntId));
  }, [tmntId, dispatch]);

  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);

  const tmntFormData: tmntFormDataType = {
    tmntFullData: getBlankTmntFullData(),
    tmntAction: tmntActions.None,
  };

  const stateTmntFullData = useSelector(
    (state: RootState) => state.tmntFullData.tmntFullData
  ) 
  if (stateTmntFullData) {
    tmntFormData.tmntFullData = stateTmntFullData;
    tmntFormData.tmntAction = tmntActions.Edit;
  }

  return (
    <>
      <WaitModal show={tmntLoadStatus === "loading"} message="Loading..." />
      {tmntLoadStatus !== "loading" &&
        tmntLoadStatus !== "succeeded" &&
        tmntError && (
          <>
            Error: {tmntError} tmntLoadStatus: {tmntLoadStatus}
          </>
        )}
      {}
      {tmntLoadStatus === "succeeded" && (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <div className="shadow p-3 m-3 rounded-3 container">
            <h2 className="mb-3">Edit Tournament</h2>
            <TmntDataForm tmntProps={tmntFormData} />
          </div>
        </div>
      )}
    </>
  );
}
