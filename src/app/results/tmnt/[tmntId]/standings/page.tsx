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
import type { divDataType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import { blankDivData } from "@/lib/db/initVals";
import TmntResultsForm from "./tmntResultsForm";
import { fetchTmntFullData, getTmntFullDataError, getTmntFullDataLoadStatus, getTmntFullDataRequestedTmntId, selectTmntFullData } from "@/redux/features/tmntFullData/tmntFullDataSlice";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import "./tmntResults.css";

const TmntResultsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);
  
  const [tabKey, setTabKey] = useState("");

  // get tmnt data 
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

  const tmntDivs = useMemo<divDataType[]>(() => {
    if (!tmntResults || tmntResults.length === 0) {
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
        tDivs.push({
          ...blankDivData,
          id: divId,
          tmnt_id: tmntId,
          div_name: result.div_name,
          sort_order: result.sort_order,
        });
      }
    });

    return tDivs.sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }, [tmntResults, tmntId]);

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
  
  const hasTmntData =
    stateTmntFullData.tmnt.id !== "" &&
    stateTmntFullData.tmnt.id === tmntId;

  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;
  
  const failedForThisTmnt =
    tmntLoadStatus === "failed" &&
    requestedTmntId === tmntId;
  
  const failedForThisTmntGames =
    resultsLoadStatsus === "failed" &&
    requestedResultsTmntId === tmntId;
    
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
          onClick={() => dispatch(fetchOneTmntGameResults(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntGamesData && failedForThisTmntGames) {
    const errmsg = `An error occurred while loading games for tournament with id: ${tmntId}.`;
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

  const handleTabSelect = (key: string | null) => {
    if (key) {
      setTabKey(key);
    }
  };

  return (
    <>
      <WaitModal show={resultsLoadStatsus === "loading"} message="Loading..." />
      {resultsLoadStatsus !== "loading" &&
        resultsLoadStatsus !== "succeeded" &&
        resultsError && (
          <div>
            Error: {resultsError} tmntLoadStatus: {resultsLoadStatsus}
          </div>
        )}
      
      <TmntHomeHeader
        tmntFullData={stateTmntFullData}
      />      

      {resultsLoadStatsus === "succeeded" && (
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
                <TmntResultsForm
                  divid={div.id}
                  tmntResults={tmntResults}
                  cashers={9}
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
