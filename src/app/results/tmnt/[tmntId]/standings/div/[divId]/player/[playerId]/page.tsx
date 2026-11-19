"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
  getOneTmntGameResultsError,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, { tmntPageBtnType } from "@/app/results/tmntHeader/tmntHomeHeader";
import { getGameNums } from "@/components/tmnts/games";
import {
  tmntGameResult,
  tgrGameKey,
  tgrHdcpKey,
} from "@/lib/types/resultsTypes";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import "./../../../../tmntStandings.css";

const TmntPlayerScoresPage = () => {
  const params = useParams();
  const divId = params.divId as string;
  const tmntId = params.tmntId as string;
  const playerId = params.playerId as string;

  const tmntPageBtn: tmntPageBtnType = "Standings";

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(
    getOneTmntGameResultsRequestedTmntId,
  );
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);
  const resultsError = useSelector(getOneTmntGameResultsError);

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
      void dispatch(fetchOneTmntGameResults(tmntId));
    }
  }, [
    tmntId,
    resultsTmntId,
    resultsLoadStatus,
    requestedResultsTmntId,
    dispatch,
  ]);

  const gotHdcp =
    (tmntFullData.divs.find((div) => div.id === divId)?.hdcp_per ?? 0) > 0;

  // undefined when the player has no result in this division
  const playerResult = useMemo<tmntGameResult | undefined>(
    () =>
      tmntResults.find(
        (result) => result.player_id === playerId && result.div_id === divId,
      ),
    [tmntResults, playerId, divId],
  );

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  const failedForThisTmntGames =
    resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;

  if (!hasTmntData && failedForThisTmnt) {
    const errmsg = tmntError?.includes("missing required child")
      ? `Tournament with id: ${tmntId} is missing data.`
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
        <h4>Unable to load tournament results</h4>
        <p>{errmsg}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            void dispatch(fetchOneTmntGameResults(tmntId));
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasTmntGamesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  // guard against bad links: the division must belong to this tournament,
  // and the player must have a result in that division
  const divFound = tmntFullData.divs.some((div) => div.id === divId);

  if (!divFound || !playerResult) {
    const heading = !divFound ? "Division not found" : "Player results not found";
    const message = !divFound
      ? `This tournament has no division with id: ${divId}.`
      : "No results were found for this player in this division.";

    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <div className="text-center mt-4">
          <h4>{heading}</h4>
          <p>{message}</p>
          <Link href={`/results/tmnt/${tmntId}/standings`}>Back to standings</Link>
        </div>
      </>
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
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />

      <div className="d-flex justify-content-center">
        <div className="overflow-x-auto">
          <table className="table table-sm table-striped table-hover w-auto tmnt-table">
            <thead>
              <tr>
                {gotHdcp && (
                  <>
                    <th
                      className="text-center align-middle"
                      style={{ width: averageWidth }}
                    >
                      Ave
                    </th>
                    <th
                      className="text-center align-middle"
                      style={{ width: hdcpWidth }}
                    >
                      Hdcp
                    </th>
                  </>
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
              <tr>
                {gotHdcp && (
                  <>
                    <td className="text-center align-middle">
                      {playerResult.average}
                    </td>
                    <td className="text-center align-middle">
                      {playerResult.hdcp}
                    </td>
                  </>
                )}
                <td>{playerResult.full_name}</td>
                {gameNums.map((gameNum) => (
                  <td key={gameNum} className="text-end align-middle">
                    {playerResult[tgrGameKey(gameNum)]}
                  </td>
                ))}
                {gotHdcp && (
                  <>
                    <td className="text-end align-middle">
                      {playerResult.total}
                    </td>
                    <td className="text-end align-middle">
                      {playerResult.total_hdcp}
                    </td>
                  </>
                )}
                <td className="text-end align-middle">
                  {playerResult["total + Hdcp"]}
                </td>
              </tr>
              {gotHdcp && (
                <>
                  <tr>
                    <td colSpan={2}>&nbsp;</td>
                    <td className="text-end align-middle">per game hdcp</td>
                    {gameNums.map((gameNum) => (
                      <td key={gameNum} className="text-end align-middle">
                        {playerResult[tgrHdcpKey(gameNum)] != null &&
                          playerResult[tgrGameKey(gameNum)] != null && (
                            <>
                              {playerResult[tgrHdcpKey(gameNum)] -
                                playerResult[tgrGameKey(gameNum)]}
                            </>
                          )}
                      </td>
                    ))}
                    <td className="text-end align-middle">
                      {playerResult.total_hdcp}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>&nbsp;</td>
                    <td className="text-end align-middle">Total</td>
                    {gameNums.map((gameNum) => (
                      <td key={gameNum} className="text-end align-middle">
                        {playerResult[tgrGameKey(gameNum)] != null
                          ? playerResult[tgrHdcpKey(gameNum)]
                          : null}
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
    </>
  );
};

export default TmntPlayerScoresPage;
