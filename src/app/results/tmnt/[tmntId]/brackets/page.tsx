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
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { GameNum } from "@/lib/types/resultsTypes";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { populatePlayerBrktRows2 } from "./populateBrktPlayerRows";
import { getGameNums } from "@/components/tmnts/games";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import "./bracketGames.css";

export type brktGamesTableRow = {
  id: string;
  player_id: string;
  last_name: string;
  first_name: string;
  lane: number;
  in: number;
  cash: string;

  [key: GameNum]: number;  
}

const PlayerBrktsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const [squadId, setSquadId] = useState("");    

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);  
  
  const brktListRecords = useSelector(getBrktListRecords);

  const [mounted, setMounted] = useState(false);

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

  // set initial squad id after tournament data is loaded
  useEffect(() => {
    if (
      squadId === "" &&
      tmntFullData.tmnt.id === tmntId &&
      tmntFullData.squads.length > 0
    ) {
      setSquadId(tmntFullData.squads[0].id);
    }
  }, [
    squadId,
    tmntId,
    tmntFullData.tmnt.id,
    tmntFullData.squads,
  ]);

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

  const playerBrktRows = useMemo<brktGamesTableRow[]>(
    () => populatePlayerBrktRows2(tmntResults, brktListRecords),
    [tmntResults, brktListRecords]
  );

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/  
  
  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;
    
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

  const cashWidth = 35;
  const firstNameWidth = 100;    
  const gameWidth = 45;
  const inWidth = 45;
  const laneWidth = 50;
  const lastNameWidth = 120;

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} />      

      <div className="text-center mb-2">
        <h4>Player Brackets</h4>
        <div className="d-flex justify-content-center">
          <div className="brkt_table overflow-x-auto">
            <table className="table table-sm table-striped table-hover w-auto">
              <thead>
                <tr>
                  <th
                    className="text-end align-middle"
                    style={{ width: laneWidth }}
                  >
                    Lane
                  </th>
                  <th
                    className="text-start align-middle"
                    style={{ width: lastNameWidth }}
                  >
                    Last Name
                  </th>
                  <th
                    className="text-start align-middle"
                    style={{ width: firstNameWidth }}
                  >
                    First Name
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
              <tbody className="table-group-divider">
                {playerBrktRows.map((playerBrktRow) => (
                  <tr key={playerBrktRow.id}>
                    <td className="text-end align-middle">
                      {playerBrktRow.lane}
                    </td>
                    <td className="text-start align-middle">
                      <Link
                        href={`/results/tmnt/${tmntId}/brackets/player/${playerBrktRow.id}`}
                        className="p-0"
                      >
                        {playerBrktRow.last_name}
                      </Link>
                    </td>
                    <td className="text-start align-middle">
                      <Link
                        href={`/results/tmnt/${tmntId}/brackets/player/${playerBrktRow.id}`}
                        className="p-0"
                      >
                        {playerBrktRow.first_name}
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