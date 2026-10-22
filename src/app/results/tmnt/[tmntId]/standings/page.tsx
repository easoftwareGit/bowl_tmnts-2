"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchOneTmntGameResults,  
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { 
  fetchDivPfs,
  getDivPfsRequestedTmntId,
  getDivPfsTmntId,
  getDivPfsError,
  getDivPfsLoadStatus,
  selectDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import type { divDataType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import { blankDivData } from "@/lib/db/initVals";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import TmntStandingsForm from "./tmntStandingsForm";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import TmntDivHeader from "./tmntDivHeader";
import "./tmntStandings.css";

const TmntResultsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);  
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);
  const resultsError = useSelector(getOneTmntGameResultsError);
    
  const requestedPrizesTmntId = useSelector(getDivPfsRequestedTmntId);
  const prizesTmntId = useSelector(getDivPfsTmntId);
  const prizesLoadStatus = useSelector(getDivPfsLoadStatus);
  const prizesError = useSelector(getDivPfsError);    
  const divPfs = useSelector(selectDivPfs);
  
  const [selectedDivId, setSelectedDivId] = useState("");

  const [mounted, setMounted] = useState(false);

  const tmntPageBtn: tmntPageBtnType = "Standings";

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

  // get tmnt results 
  useEffect(() => {
    const needTmntGames = resultsTmntId !== tmntId;

    const failedForThisTmntGames =
      resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;

    if (
      needTmntGames &&
      resultsLoadStatus !== "loading" &&
      !failedForThisTmntGames
    ) {
      dispatch(fetchOneTmntGameResults(tmntId));
    }
  }, [
    tmntId,
    resultsTmntId,
    resultsLoadStatus,    
    requestedResultsTmntId,
    dispatch
  ]);

  // get division prizes
  useEffect(() => {
    const needsDivPrizes = prizesTmntId !== tmntId;

    const failedForThisTmntPrizes =
      prizesLoadStatus === "failed" && requestedPrizesTmntId === tmntId;

    if (
      needsDivPrizes &&
      prizesLoadStatus !== "loading" &&
      !failedForThisTmntPrizes
    ) {
      dispatch(fetchDivPfs(tmntId));
    }
  }, [
    prizesTmntId,
    tmntId,
    requestedPrizesTmntId,
    prizesLoadStatus,    
    dispatch
  ]);

  const tmntDivs = useMemo<divDataType[]>(() => {
    if (
      !hasTmntData ||
      tmntFullData.tmnt.id !== tmntId ||
      resultsTmntId !== tmntId ||
      !tmntResults ||
      tmntResults.length === 0
    ) {
      return [];
    }    

    const tmntDivIds = Array.from(
      new Set(tmntResults.map((result) => result.div_id))
    );

    const tDivs: divDataType[] = [];

    tmntDivIds.forEach((divId) => {
      const result = tmntResults.find(
        (result) => result.div_id === divId
      );

      if (result) {
        const div = tmntFullData.divs.find(
          (div) => div.id === divId
        )
        if (div) {
          tDivs.push({
            ...blankDivData,
            id: divId,
            tmnt_id: tmntId,
            div_name: result.div_name,
            hdcp_per: div?.hdcp_per,
            hdcp_from: div?.hdcp_from,
            int_hdcp: div?.int_hdcp,
            hdcp_for: div?.hdcp_for,
            sort_order: result.sort_order,
          });
        }
      }
    });

    return tDivs.sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }, [
    hasTmntData,
    tmntResults,
    resultsTmntId,
    tmntId,
    tmntFullData
  ]);

  // fall back to the first division until the user picks one
  const activeDivId = tmntDivs.some((d) => d.id === selectedDivId)
    ? selectedDivId
    : (tmntDivs[0]?.id ?? "");

  const activeDiv = tmntDivs.find((d) => d.id === activeDivId);
    
  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  
  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;

  const hasPrizesData =
    prizesTmntId !== "" &&
    prizesTmntId === tmntId;
  
  const failedForThisTmntGames =
    resultsLoadStatus === "failed" &&
    requestedResultsTmntId === tmntId;
  
  const failedForThisTmntPrizes =
    prizesLoadStatus === "failed" &&
    requestedPrizesTmntId === tmntId;
    
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

  if (!hasTmntGamesData && failedForThisTmntGames) {
    const errmsg =
      resultsError ||
      `An error occurred while loading games for tournament with id: ${tmntId}.`;
    
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament</h4>
        <p>{errmsg}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchOneTmntGameResults(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntGamesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  if (!hasPrizesData && failedForThisTmntPrizes) {
    const errmsg =
      prizesError ||
      `An error occurred while loading prizes for tournament with id: ${tmntId}.`;
    
    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament prizes</h4>
        <p>{errmsg}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchDivPfs(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }  

  if (!activeDiv) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <p className="text-center mt-3">
          No results are available for this tournament yet.
        </p>
      </>
    );
  }

  if (!hasPrizesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }  

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />      
     
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div className="d-flex flex-column justify-content-center align-items-center">
          <TmntDivHeader
            divs={tmntDivs}
            selectedDivId={activeDivId}
            onSelectDiv={setSelectedDivId}
          />
          <TmntStandingsForm
            tmntId={tmntId}
            div={activeDiv}
            tmntResults={tmntResults}
            divPfs={divPfs}
          />
        </div>          
      </div>
    </>
  );
};

export default TmntResultsPage;