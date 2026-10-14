"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { brktGamesTableRow } from "@/lib/types/resultsTypes";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { populatePlayerBrktRows } from "./populatePlayerBrktRows";
import { getGameNums } from "@/components/tmnts/games";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import BracketHeader, { type brktPageBtnType } from "./bracketHeader";
import "./bracketGames.css";

const PlayerBrktsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();  

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);  
  
  const brktListRecords = useSelector(getBrktListRecords);

  const [mounted, setMounted] = useState(false);

  const tmntPageBtn: tmntPageBtnType = "Brackets";
  const selectedBrktPageBtn: brktPageBtnType ="Brackets";

  useEffect(() => {
    setMounted(true);
  }, []);

  const gameNums = getGameNums(tmntResults);

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

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  // only true once the tournament is loaded, so tmntFullData is never read
  // before then (the hook can return no data while loading)
  const hasBrackets = hasTmntData && tmntFullData.brkts.length > 0;

  // Only calculate the rows once the tournament, its brackets and its results
  // are loaded for this tournament. Before that the store can still hold another
  // tournament's results and bracket lists. (A hook cannot come after an early
  // return, so the guard lives inside the memo.)
  const playerBrktRows = useMemo<brktGamesTableRow[]>(() => {
    if (!hasBrackets || !hasTmntGamesData) return [];
    return populatePlayerBrktRows(tmntResults, brktListRecords);
  }, [hasBrackets, hasTmntGamesData, tmntResults, brktListRecords]);

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

  // a tournament with no brackets has nothing to show, so no results are needed
  if (tmntFullData.brkts.length === 0) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <p className="text-center mt-3">
          No brackets are available for this tournament.
        </p>
      </>
    );
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

  const cashWidth = 35;    
  const gameWidth = 45;
  const inWidth = 45;
  const laneWidth = 50;  
  const nameWidth = 140;

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn}   />      

      <div className="text-center mb-2">
        
        <BracketHeader tmntFullData={tmntFullData} selectedBrktPageBtn={selectedBrktPageBtn} />
        
        <div className="d-flex justify-content-center">
          <div className="brkt_table overflow-x-auto">
            <table className="table table-sm table-striped table-hover w-auto">
              <thead>
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: laneWidth }}
                  >
                    Lane
                  </th>
                  <th
                    className="text-start align-middle ps-2"
                    style={{ width: nameWidth }}
                  >
                    Name
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: cashWidth }}
                  >
                    $
                  </th>
                  {gameNums.map((gameNum) => (
                    <th
                      key={gameNum}
                      className="text-end align-middle game-header-align"
                      style={{ width: gameWidth }}                    
                    >
                      {gameNum}
                    </th>
                  ))}
                  <th
                    className="text-end align-middle"
                    style={{ width: inWidth }}
                  >
                    In
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider small">
                {playerBrktRows.map((playerBrktRow) => (
                  <tr key={playerBrktRow.id}>
                    <td className="text-center align-middle">
                      {playerBrktRow.lane}
                    </td>
                    <td className="text-start align-middle ps-2">
                      <Link
                        href={`/results/tmnt/${tmntId}/brackets/player/${playerBrktRow.id}`}
                        className="p-0"
                      >
                        {playerBrktRow.last_first}
                      </Link>
                    </td>
                    <td className="text-center align-middle text-success">
                      {playerBrktRow.cash}
                    </td>
                    {gameNums.map((gameNum) => (
                      <td key={gameNum} className="text-end align-middle">
                        {playerBrktRow[`Game ${gameNum}`]}
                      </td>
                    ))}
                    <td className="text-end align-middle">
                      {playerBrktRow.in}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerBrktsPage;