"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import { Tabs, Tab } from "react-bootstrap";
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
  getDivPfRequestedTmntId,
  getDivPfsTmntId,
  getDivPfsError,
  getDivPfsLoadStatus,
  selectDivPfs,
} from "@/redux/features/divPfs/divPfsSlice";
import type { divDataType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import { blankDivData } from "@/lib/db/initVals";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import TmntStandingsForm from "./tmntStandingsForm";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import "./tmntStandings.css";

const TmntResultsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);  
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);
  const resultsError = useSelector(getOneTmntGameResultsError);
    
  const requestedPrizesTmntId = useSelector(getDivPfRequestedTmntId);
  const prizesTmntId = useSelector(getDivPfsTmntId);
  const prizesLoadStatsus = useSelector(getDivPfsLoadStatus);
  const prizesError = useSelector(getDivPfsError);    
  const divPfs = useSelector(selectDivPfs);
  
  const [tabKey, setTabKey] = useState("");

  const [mounted, setMounted] = useState(false);

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
      resultsLoadStatsus === "failed" && requestedResultsTmntId === tmntId;

    if (
      needTmntGames &&
      resultsLoadStatsus !== "loading" &&
      !failedForThisTmntGames
    ) {
      dispatch(fetchOneTmntGameResults(tmntId));
    }
  }, [
    tmntId,
    resultsTmntId,
    resultsLoadStatsus,    
    requestedResultsTmntId,
    dispatch
  ]);

  // get division prizes
  useEffect(() => {
    const needsDivPrizes = prizesTmntId !== tmntId;

    const failedForThisTmntPrizes =
      prizesLoadStatsus === "failed" && requestedPrizesTmntId === tmntId;

    if (
      needsDivPrizes &&
      prizesLoadStatsus !== "loading" &&
      !failedForThisTmntPrizes
    ) {
      dispatch(fetchDivPfs(tmntId));
    }
  }, [
    prizesTmntId,
    tmntId,
    requestedPrizesTmntId,
    prizesLoadStatsus,    
    dispatch
  ]);

  const tmntDivs = useMemo<divDataType[]>(() => {
    if (
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
  }, [tmntResults, resultsTmntId, tmntId, tmntFullData]);

  const defaultTabKey = tmntDivs[0]?.id ?? "";

  // set tab key
  useEffect(() => {
    if (tmntDivs.length > 0) {
      setTabKey(tmntDivs[0].id);
    }
  }, [tmntDivs, setTabKey]);
    
  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  
  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;

  const hasPrizesData =
    prizesTmntId !== "" &&
    prizesTmntId === tmntId;
  
  const failedForThisTmntGames =
    resultsLoadStatsus === "failed" &&
    requestedResultsTmntId === tmntId;
  
  const failedForThisTmntPrizes =
    prizesLoadStatsus === "failed" &&
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

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} />      

      {hasTmntData && hasTmntGamesData && hasPrizesData && (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <Tabs
            defaultActiveKey={defaultTabKey}
            id="tmnt-tabs"
            className="mb-1"
            variant="pills"
            activeKey={tabKey ?? defaultTabKey} // ensure a tab is alwas selected
            onSelect={handleTabSelect}
          >
            {tmntDivs.map((div) => (
              <Tab key={div.id} eventKey={`${div.id}`} title={div.div_name}>
                <TmntStandingsForm
                  tmntId={tmntId}
                  div={div}
                  tmntResults={tmntResults}
                  divPfs={divPfs}
                />
              </Tab>
            ))}
          </Tabs>          
        </div>
      )}
    </>
  );
};

export default TmntResultsPage;