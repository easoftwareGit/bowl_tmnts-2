"use client";

import "@/lib/syncfusion-license";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { fullName } from "@/lib/getName";

const PlayerBrktPrgressPage = () => {
  const params = useParams();
  const playerId = params.playerId as string;
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntFullData = useSelector(selectTmntFullData);

  // get tmnt data 
  useEffect(() => {
    const needsTmntData = tmntFullData.tmnt.id !== tmntId;

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
    tmntFullData.tmnt.id,
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

  const playerRow = tmntFullData.players.find((player) => player.id === playerId);
  const playerName = playerRow
    ? fullName(playerRow.first_name, playerRow.last_name)
    : ""; 

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
        tmntFullData={tmntFullData}
      />

      {resultsLoadStatsus === "succeeded" && (
        <div className="text-center mb-2">
          <h4>Bracket Progress for {playerName}</h4>
          <div
            data-testid="GamesOuterWrapper"
            className="brkt-games-grid-outer"
          >      
            <div
              data-testid="GamesInnerWrapper"
              className="brkt-games-grid-inner"
            >



            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PlayerBrktPrgressPage