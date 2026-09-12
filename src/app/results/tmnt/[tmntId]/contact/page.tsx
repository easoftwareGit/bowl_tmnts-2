"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData,
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import {
  fetchUser,
  getUserError,
  getUserLoadStatus,
  getUserRequestId
} from "@/redux/features/user/userSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";

const TmntContactPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  const requestedUserId = useSelector(getUserRequestId);
  const userLoadStatus = useSelector(getUserLoadStatus);
  const userError = useSelector(getUserError);
  const userData = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const needsTmntData = stateTmntFullData.tmnt.id !== tmntId;

    const failedForThisTmnt =
      tmntLoadStatus === "failed" && requestedTmntId === tmntId;

    if (
      needsTmntData &&
      tmntLoadStatus !== "loading" &&
      !failedForThisTmnt
    ) {
      dispatch(fetchTmntFullData(tmntId));
    }
  }, [
    tmntId,
    stateTmntFullData.tmnt.id,
    tmntLoadStatus,
    requestedTmntId,
    dispatch,
  ]);

  // fetch user only after tmnt data is loaded
  useEffect(() => {
    const hasTmntData =
      stateTmntFullData.tmnt.id !== "" &&
      stateTmntFullData.tmnt.id === tmntId;

    if (!hasTmntData) return;

    const needUserData =
      userData.id === "" ||
      userData.id !== stateTmntFullData.tmnt.user_id;

    const failedForThisUser =
      userLoadStatus === "failed" && requestedUserId === stateTmntFullData.tmnt.user_id;
    
    if (
      needUserData &&
      userLoadStatus !== "loading" &&
      !failedForThisUser
    ) {
      dispatch(fetchUser(stateTmntFullData.tmnt.user_id));
    }
  }, [
    tmntId,
    userData.id,
    userLoadStatus,
    stateTmntFullData.tmnt.id,
    stateTmntFullData.tmnt.user_id,
    requestedUserId,
    dispatch,
  ]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  const hasTmntData =
    stateTmntFullData.tmnt.id !== "" &&
    stateTmntFullData.tmnt.id === tmntId;

  const hasUserData =
    userData.id !== "" &&
    userData.id === stateTmntFullData.tmnt.user_id;

  const failedForThisTmnt =
    tmntLoadStatus === "failed" &&
    requestedTmntId === tmntId;
  
  const failedForThisUser =
    userLoadStatus === "failed" &&
    requestedUserId === stateTmntFullData.tmnt.user_id;
  
  if (!hasTmntData && failedForThisTmnt) {
    const errmsg = tmntError
      ? tmntError.includes("missing required child")
        ? `Tournament with id: ${tmntId} is missing data.`
        : `An error occurred while loading the tournament with id: ${tmntId}.`
      : `An error occurred while loading the tournament with id: ${tmntId}.`;

    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament</h4>

        <p>{errmsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchTmntFullData(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasUserData && failedForThisUser) {
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament director</h4>

        <p>
          {userError ??
            "An error occurred while loading the tournament director."}
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            dispatch(fetchUser(stateTmntFullData.tmnt.user_id))
          }
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntData || !hasUserData) {
    return (
      <WaitModal show={tmntLoadStatus === "loading"} message="Loading..." />
    );
  }

  const tmntDirName = userData
    ? userData.first_name + " " + userData.last_name
    : "";

  return (
    <>
      <TmntHomeHeader
        tmntFullData={stateTmntFullData}
      />
      <div className="text-center mb-4">
        <h4>Contact information for Tournament Director {tmntDirName}</h4>        
      </div>      
      <div className="text-center mb-2">
        <span className="fw-bold">Email: </span>
        <a href={`mailto:${userData.email}`}>
          {userData.email}
        </a>
      </div>
      <div className="text-center">
        <span className="fw-bold">Phone: </span>
        {userData.phone}
      </div>
    </>
  );
};

export default TmntContactPage;
