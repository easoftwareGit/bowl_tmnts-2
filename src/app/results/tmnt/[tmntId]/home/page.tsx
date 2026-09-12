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
import { getMonthDayYear } from "@/lib/dateTools";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";

const TmntHomePage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

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
    stateTmntFullData,
    tmntLoadStatus,
    requestedTmntId,
    dispatch
  ]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const hasTmntData =
    stateTmntFullData.tmnt.id !== "" && stateTmntFullData.tmnt.id === tmntId;

  const failedForThisTmnt =
    tmntLoadStatus === "failed" && requestedTmntId === tmntId;

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

  if (!hasTmntData) {
    return (
      <WaitModal show={tmntLoadStatus === "loading"} message="Loading..." />
    );
  }

  const dateStr =
    stateTmntFullData?.tmnt.start_date_str ===
    stateTmntFullData?.tmnt.end_date_str
      ? getMonthDayYear(stateTmntFullData.tmnt.start_date_str)
      : getMonthDayYear(stateTmntFullData.tmnt.start_date_str) +
        " - " +
        getMonthDayYear(stateTmntFullData.tmnt.end_date_str);

  const entryFeeStr =
    stateTmntFullData.events.length === 0
      ? ""
      : formatValueSymbSep2Dec(
          stateTmntFullData.events[0].entry_fee,
          localConfig,
        );  
  
  return (
    <>
      <TmntHomeHeader
        tmntFullData={stateTmntFullData}
      />
      <div className="text-center mb-4">
        <h4>Welcome to {stateTmntFullData?.tmnt.tmnt_name}</h4>
        <div className="mb-2">
          Hosted by{" "}
          <a
            href={stateTmntFullData?.tmnt.bowl.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {stateTmntFullData?.tmnt.bowl.bowl_name}
          </a>
        </div>
        <div className="mb-2">
          {stateTmntFullData?.tmnt.bowl.city},{" "}
          {stateTmntFullData?.tmnt.bowl.state}
        </div>
        <div className="mb-2">{dateStr}</div>
        <div className="mb-2">
          {stateTmntFullData?.tmnt.tmnt_name} - {entryFeeStr} entry
        </div>
        <div>
          <a href={`/results/tmnt/${tmntId}/contact`}>Contact Director</a>
        </div>
      </div>
    </>
  );
};

export default TmntHomePage;
