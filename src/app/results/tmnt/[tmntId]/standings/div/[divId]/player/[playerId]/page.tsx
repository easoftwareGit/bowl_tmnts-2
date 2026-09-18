"use client";

import React, { useEffect, useMemo } from "react";
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
import type { divDataType, divType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import {
  fetchTmntFullData,
  getTmntFullDataError,
  getTmntFullDataLoadStatus,
  getTmntFullDataRequestedTmntId,
  selectTmntFullData
} from "@/redux/features/tmntFullData/tmntFullDataSlice";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { getGameNums } from "@/components/tmnts/games";
import { TmntGameResult } from "@/lib/types/resultsTypes";
import { maxSortOrder } from "@/lib/validation/constants";

const TmntPlayerScoresPage = () => { 
  const params = useParams();
  const divId = params.divId as string;
  const tmntId = params.tmntId as string;
  const playerId = params.playerId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedTmntId = useSelector(getTmntFullDataRequestedTmntId);
  const tmntLoadStatus = useSelector(getTmntFullDataLoadStatus);
  const tmntError = useSelector(getTmntFullDataError);
  const stateTmntFullData = useSelector(selectTmntFullData);

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatsus = useSelector(getOneTmntGameResultsLoadStatus);
  // const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);
        
  const gameNums = getGameNums(tmntResults);
  const games = gameNums.length;  

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
  
  const gotHdcp = useMemo<boolean>(() => {
    if (!stateTmntFullData || stateTmntFullData.divs.length === 0) {
      return false;
    };

    const foundDiv = stateTmntFullData.divs.find((div) => div.id === divId);
    if (!foundDiv) {
      return false;
    }
    return foundDiv.hdcp_per > 0; 
  }, [stateTmntFullData, divId]);

  const playerResult = useMemo<TmntGameResult>(() => {
    if (!tmntResults || tmntResults.length === 0) {
      return {} as TmntGameResult;
    };    
    const result = tmntResults.find((result) => result.player_id === playerId);
    if (!result) {
      return {} as TmntGameResult;
    }
    return result;    
  }, [
    tmntResults,
    playerId,
  ]);

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
          onClick={() => dispatch(fetchTmntFullData(tmntId))} 
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
          onClick={() => dispatch(fetchOneTmntGameResults(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  const averageWidth = 70;  
  const fullNameWidth = 150;
  const hdcpWidth = 70;  
  const gameWidth = 45;
  const scratchWidth = 70;
  const totalHdcpWidth = 60;
  const totalPlusHdcpWidth = 60;    

  return (
    <>
      <WaitModal
        show={
          tmntLoadStatus === "loading" ||
          resultsLoadStatsus === "loading"          
        }
        message="Loading..."
      />

      <TmntHomeHeader
        tmntFullData={stateTmntFullData}
      />      

      {hasTmntData && hasTmntGamesData && (
        <div className="d-flex justify-content-center">
          <div className="tmnt_table overflow-x-auto">
            <table className="table table-sm table-striped table-hover w-auto">
              <thead>
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: averageWidth }}
                  >
                    Ave
                  </th>
                  {gotHdcp && (
                    <th
                      className="text-center align-middle"
                      style={{ width: hdcpWidth }}
                    >
                      Hdcp
                    </th>                    
                  )}
                  <th
                    className="text-start align-middle"
                    style={{ width: fullNameWidth }}
                  >
                    Name
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
                  {gotHdcp && (
                    <>
                      <th
                        className="text-end align-middle"
                        style={{ width: scratchWidth }}
                      >
                        Scratch
                      </th>
                      <th
                        className="text-end align-middle"
                        style={{ width: totalHdcpWidth }}
                      >
                        Hdcp
                      </th>
                    </>
                  )}
                  <th
                    className="text-end align-middle"
                    style={{ width: totalPlusHdcpWidth }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* first row is ave, hdcp*, full name, scores,
                    scratch*, total hdcp*, scratch + total hdcp 
                    *columns only exist if got hdcp = true */}
                <tr>
                  <td className="text-center align-middle">
                    {playerResult.average}
                  </td>
                  {gotHdcp && (
                    <td className="text-center align-middle">
                      {playerResult.hdcp}
                    </td>
                  )}
                  <td>
                    {playerResult.full_name}
                  </td>
                  {gameNums.map((gameNum) => (
                    <td key={gameNum} className="text-end align-middle">
                      {playerResult[`Game ${gameNum}`]}
                    </td>
                  ))}
                  {gotHdcp && (
                    <>
                      <td className="text-end align-middle">
                        {playerResult.total}
                      </td>
                      <td className="text-end align-middle">
                        {playerResult.hdcp * games}
                      </td>
                    </>
                  )}
                  <td className="text-end align-middle">
                    {/* ok to use ["total + Hdcp"], 
                        for scratch, will be same as total */}
                    {playerResult["total + Hdcp"]}
                  </td>
                </tr>
                {/* second and third rows only visible if gotHdcp = true */}
                { gotHdcp && (
                  <>
                    {/* second row is blank, blank, per game hdcp msg, 
                        per game hdcp, total hdcp */}
                    <tr>
                      <td colSpan={2}>
                        &nbsp;
                      </td>
                      <td className="text-end align-middle">
                        per game hdcp
                      </td>
                      {gameNums.map((gameNum) => (
                        <td key={gameNum} className="text-end align-middle">
                          {playerResult.hdcp}
                        </td>
                      ))}
                      <td className="text-end align-middle">
                        {playerResult.hdcp * games}
                      </td>
                    </tr>
                    {/* third row is blank, blank, total msg, 
                        game score + per game hdcp, scratch + total hdcp */}
                    <tr>
                      <td colSpan={2}>
                        &nbsp;
                      </td>
                      <td 
                        className="text-end align-middle"                    
                      >
                        Total
                      </td>
                      {gameNums.map((gameNum) => (
                        <td key={gameNum} className="text-end align-middle">
                          {playerResult[`Game ${gameNum} + Hdcp`]}
                        </td>
                      ))}
                      <td className="text-end align-middle">
                        {playerResult["total + Hdcp"]}
                      </td>
                    </tr>
                  </>                  
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );


}

export default TmntPlayerScoresPage