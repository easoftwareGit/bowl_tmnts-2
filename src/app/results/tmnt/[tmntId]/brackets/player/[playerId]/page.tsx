"use client";

import "@/lib/syncfusion-license";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,  
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { fullName } from "@/lib/getName";
import PlayerDivBrkts from "./playerDivBrackets";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import "./playerBrackets.css";

const PlayerBrktPrgressPage = () => {
  const params = useParams();
  const playerId = params.playerId as string;
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);  
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);

  const brktListRecords = useSelector(getBrktListRecords);

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

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  
  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;
  
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

  const playerRow = tmntFullData.players.find((player) => player.id === playerId);

  if (!playerRow) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} />
        <div className="text-center mt-5">
          <h4>Player not found</h4>
          <p>No player with ID {playerId} was found in this tournament.</p>
        </div>
      </>
    );
  }  
  
  const playerName = playerRow
    ? fullName(playerRow.first_name, playerRow.last_name)
    : ""; 

  return (
    <>      
      <TmntHomeHeader tmntFullData={tmntFullData} />
      
      <div className="text-center mb-2">
        <h4>Bracket Progress for {playerName}</h4>
        <div
          data-testid="GamesOuterWrapper"
          className="player-brkt-progress-outer"
        >      
          <div
            data-testid="GamesInnerWrapper"
            className="player-brkt-progress-inner"
          >
            {tmntFullData.brkts.map((brkt) => (
              <PlayerDivBrkts
                key={brkt.id}
                playerId={playerId}
                tmntFullData={tmntFullData}
                brktList={brktListRecords[brkt.id]}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayerBrktPrgressPage