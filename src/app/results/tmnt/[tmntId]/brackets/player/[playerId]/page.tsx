"use client";

import "@/lib/syncfusion-license";
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
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { fullName } from "@/lib/getName";
import PlayerDivBrkts from "./playerDivBrackets";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { missingDataError, getBrktSummaryDataError } from "./playerBrktData";
import { getBrktListRecordsWithResults } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import "./playerBrackets.css";
import AllBrktsSummary from "./allBrktsSummary";

const PlayerBrktProgressPage = () => {
  const params = useParams();
  const playerId = params.playerId as string;
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);  
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  
  const brktListRecords = useSelector(getBrktListRecordsWithResults);
  
  const [mounted, setMounted] = useState(false);

  const tmntPageBtn: tmntPageBtnType = "Brackets";

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

  // The player. Only read the tournament once the hook says it is loaded.
  const playerRow = hasTmntData
    ? tmntFullData.players.find((player) => player.id === playerId)
    : undefined;

  // Only the brackets this player has an entry in, in the brackets' sort order.
  // PlayerDivBrkts shows an error for a bracket the player is not in, so those
  // are not rendered.
  const playerBrkts = useMemo(() => {
    if (!hasTmntData || !playerRow) return [];
    return tmntFullData.brkts
      .filter((brkt) =>
        tmntFullData.brktEntries.some(
          (entry) => entry.player_id === playerId && entry.brkt_id === brkt.id,
        ),
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [hasTmntData, playerRow, tmntFullData, playerId]);

  // data problems for each bracket the player is in; checked here, with plain
  // code, because nothing needs a hook for this
  const bracketDataErrors = hasTmntData
    ? playerBrkts
        .map((brkt) => getBrktSummaryDataError(tmntFullData, brkt.id, playerId))
        .filter((err): err is string => err !== null)
    : [];

  const hasPlayerBrkts = playerBrkts.length > 0;
  
  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
    
  const failedForThisTmntGames =
    resultsLoadStatus === "failed" &&
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

  if (!playerRow) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <div className="text-center mt-5">
          <h4>Player not found</h4>
          <p>No player with ID {playerId} was found in this tournament.</p>
        </div>
      </>
    );
  }  

  // the first problem found, shown in place of the page content
  if (bracketDataErrors.length > 0) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        {missingDataError(bracketDataErrors[0])}
      </>
    );
  }  
  
  const playerName = fullName(playerRow.first_name, playerRow.last_name);

  return (
    <>      
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
      
      <div className="text-center mb-2">
        <h4>Bracket Progress for {playerName}</h4>

        {!hasPlayerBrkts ? (
          <p className="mt-3">
            {tmntFullData.brkts.length === 0
              ? "No brackets are available for this tournament."
              : `${playerName} is not entered in any brackets.`}
          </p>
        ) : (
          <div
            data-testid="BrktProgressOuterWrapper"
            className="player-brkt-progress-outer"
          >
            <div
              data-testid="BrktProgressInnerWrapper"
              className="player-brkt-progress-inner"
            >
              {playerBrkts.map((brkt) => {
                const brktList = brktListRecords[brkt.id];
                // a brktList with no list has nothing to show
                if (!brktList) return null;
                return (
                  <PlayerDivBrkts
                    key={brkt.id}
                    playerId={playerId}
                    tmntFullData={tmntFullData}
                    brktList={brktList}
                  />
                );
              })}
            </div>
            <AllBrktsSummary
              tmntFullData={tmntFullData}
              brktListRecords={brktListRecords}
              playerId={playerId}
              playerName={playerName}
              brktIds={playerBrkts.map((b) => b.id)}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default PlayerBrktProgressPage