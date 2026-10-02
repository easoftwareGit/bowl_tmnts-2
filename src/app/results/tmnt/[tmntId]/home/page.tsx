"use client";
import React from "react";
import { useParams } from "next/navigation";
import { getMonthDayYear } from "@/lib/dateTools";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";

const TmntHomePage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

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

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

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
    return <WaitModal show={true} message="Loading..." />;
  }

  const dateStr =
    tmntFullData?.tmnt.start_date_str ===
    tmntFullData?.tmnt.end_date_str
      ? getMonthDayYear(tmntFullData.tmnt.start_date_str)
      : getMonthDayYear(tmntFullData.tmnt.start_date_str) +
        " - " +
        getMonthDayYear(tmntFullData.tmnt.end_date_str);

  const entryFeeStr =
    tmntFullData.events.length === 0
      ? ""
      : formatValueSymbSep2Dec(
          tmntFullData.events[0].entry_fee,
          localConfig,
        );  
  
  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} />
      
      <div className="text-center mb-4">
        <h4>Welcome to {tmntFullData?.tmnt.tmnt_name}</h4>
        <div className="mb-2">
          Hosted by{" "}
          <a
            href={tmntFullData?.tmnt.bowl.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tmntFullData?.tmnt.bowl.bowl_name}
          </a>
        </div>
        <div className="mb-2">
          {tmntFullData?.tmnt.bowl.city},{" "}
          {tmntFullData?.tmnt.bowl.state}
        </div>
        <div className="mb-2">{dateStr}</div>
        <div className="mb-2">
          {tmntFullData?.tmnt.tmnt_name} - {entryFeeStr} entry
        </div>
        <div>
          <a href={`/results/tmnt/${tmntId}/contact`}>Contact Director</a>
        </div>
      </div>
    </>
  );
};

export default TmntHomePage;
