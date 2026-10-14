"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchUser,
  getUserError,
  getUserLoadStatus,
  getUserRequestId
} from "@/redux/features/user/userSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";

const TmntContactPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedUserId = useSelector(getUserRequestId);
  const userLoadStatus = useSelector(getUserLoadStatus);
  const userError = useSelector(getUserError);
  const userData = useSelector((state: RootState) => state.user.user);

  const [mounted, setMounted] = useState(false);

  const tmntPageBtn: tmntPageBtnType = "None";

  useEffect(() => {
    setMounted(true);
  }, []);

  /*****************/
  /* get tmnt data */
  /*****************/
  const {
    data: tmntFullData,
    hasData: hasTmntData,
    failed: failedForThisTmnt,
    error: tmntError,
    retry: retryTmnt,
  } = useTmntFullData(tmntId);

  const requestedDirectorIdRef = useRef("");

  const loadedTmntId = hasTmntData ? tmntFullData.tmnt.id : "";
  const directorId = hasTmntData ? tmntFullData.tmnt.user_id : "";

  useEffect(() => {
    const tmntLoaded = loadedTmntId !== "" && loadedTmntId === tmntId;

    if (!tmntLoaded) return;

    const needUserData = userData.id === "" || userData.id !== directorId;

    const userFailed =
      userLoadStatus === "failed" && requestedUserId === directorId;

    const alreadyRequested = requestedDirectorIdRef.current === directorId;

    if (
      needUserData &&
      userLoadStatus !== "loading" &&
      !userFailed &&
      !alreadyRequested
    ) {
      requestedDirectorIdRef.current = directorId;
      dispatch(fetchUser(directorId));
    }
  }, [
    tmntId,
    loadedTmntId,
    directorId,
    userData.id,
    userLoadStatus,
    requestedUserId,
    dispatch,
  ]);  

  // useEffect(() => {
  //   const tmntLoaded =
  //     tmntFullData.tmnt.id !== "" &&
  //     tmntFullData.tmnt.id === tmntId;

  //   if (!tmntLoaded) return;

  //   const directorUserId = tmntFullData.tmnt.user_id;

  //   const needUserData =
  //     userData.id === "" ||
  //     userData.id !== directorUserId;

  //   const userFailed =
  //     userLoadStatus === "failed" && requestedUserId === directorUserId;

  //   const alreadyRequested =
  //     requestedDirectorIdRef.current === directorUserId;

  //   if (
  //     needUserData &&
  //     userLoadStatus !== "loading" &&
  //     !userFailed &&
  //     !alreadyRequested
  //   ) {
  //     requestedDirectorIdRef.current = directorUserId;
  //     dispatch(fetchUser(directorUserId));
  //   }
  // }, [
  //   tmntId,
  //   userData.id,
  //   userLoadStatus,
  //   tmntFullData.tmnt.id,
  //   tmntFullData.tmnt.user_id,
  //   requestedUserId,
  //   dispatch,
  // ]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  

  const hasUserData =
    hasTmntData && userData.id === directorId;
  
  const failedForThisUser =
    hasTmntData &&
    !hasUserData &&
    userLoadStatus === "failed" &&
    requestedUserId === directorId;
  
  const userNotFound =
    hasTmntData &&
    !hasUserData &&
    userLoadStatus === "succeeded" &&
    requestedUserId === directorId;  
  
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
          onClick={() => {
            void retryTmnt();
          }}             
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }
  
  if (failedForThisUser || userNotFound) {
    const directorErrMsg = userNotFound
      ? "The tournament director could not be found."
      : userError || "An error occurred while loading the tournament director.";

    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament director</h4>

        <p>{directorErrMsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchUser(directorId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasUserData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  const tmntDirName = userData.first_name + " " + userData.last_name

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
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