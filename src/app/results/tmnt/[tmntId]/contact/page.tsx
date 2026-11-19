"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchTmntDirector,
  getTmntDirectorError,
  getTmntDirectorLoadStatus,
  getTmntDirectorRequestId,
  selectTmntDirector,
} from "@/redux/features/director/directorSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";

const TmntContactPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntDirectorRequestId);
  const directorLoadStatus = useSelector(getTmntDirectorLoadStatus);
  const directorError = useSelector(getTmntDirectorError);
  const tmntDirector = useSelector(selectTmntDirector);

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

  /**************************/
  /* get tmnt director data */
  /**************************/
  // only needs the tmntId, so it loads at the same time as the tmnt data
  useEffect(() => {
    if (!tmntId) return;
    // already loading, loaded or failed for this tmnt. A failure is retried
    // with the Retry button, not automatically.
    if (requestedTmntId === tmntId && directorLoadStatus !== "idle") return;
    void dispatch(fetchTmntDirector(tmntId));
  }, [tmntId, requestedTmntId, directorLoadStatus, dispatch]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const directorIsForThisTmnt = requestedTmntId === tmntId;

  const hasDirectorData =
    directorIsForThisTmnt && directorLoadStatus === "succeeded";

  const failedForThisDirector =
    directorIsForThisTmnt && directorLoadStatus === "failed";

  if (!hasTmntData && failedForThisTmnt) {
    const errmsg = tmntError?.includes("missing required child")
      ? `Tournament with id: ${tmntId} is missing data.`
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

  if (failedForThisDirector) {
    const directorErrMsg =
      directorError || "An error occurred while loading the tournament director.";

    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament director</h4>

        <p>{directorErrMsg}</p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void dispatch(fetchTmntDirector(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasDirectorData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  const tmntDirName = tmntDirector.first_name + " " + tmntDirector.last_name;

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
      <div className="text-center mb-4">
        <h4>Contact information for Tournament Director {tmntDirName}</h4>
      </div>
      <div className="text-center mb-2">
        <span className="fw-bold">Email: </span>
        <a href={`mailto:${tmntDirector.email}`}>
          {tmntDirector.email}
        </a>
      </div>
      <div className="text-center">
        <span className="fw-bold">Phone: </span>
        {tmntDirector.phone}
      </div>
    </>
  );
};

export default TmntContactPage;
