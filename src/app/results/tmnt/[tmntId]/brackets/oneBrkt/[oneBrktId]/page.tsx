"use client";

import "@/lib/syncfusion-license";
import React, { JSX, useEffect, useState } from "react";
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
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader from "@/app/results/tmntHeader/tmntHomeHeader";
import { fullName, getBrktOrElimName } from "@/lib/getName";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { matchNumberType, matchSeedInfoType } from "@/components/brackets/bracketMatchClass";
import { getResultClassName } from "../../resultClassName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import Link from "next/link";
import "./oneBrkt.css";

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const missingDataError = (errMsg: string) => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            {errMsg}
          </div>
        </div>
      </div>
    </>
  );
}

const OneBrktPage = () => {
  const params = useParams();
  const oneBrktId = params.oneBrktId as string;
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

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

  const oneBrkt = tmntFullData.oneBrkts.find(
    (oneBrkt) => oneBrkt.id === oneBrktId
  );
  if (!oneBrkt) {
    return missingDataError(`One bracket with id ${oneBrktId} not found.`);
  }  
  const brktId = oneBrkt.brkt_id;
  const brkt = tmntFullData.brkts.find((brkt) => brkt.id === brktId);
  if (!brkt) {
    return missingDataError(`Bracket definition with id ${brktId} not found.`);
  }
  const brktName = getBrktOrElimName(brkt, tmntFullData.divs)
  const bindex = oneBrkt.bindex;  
  const brktList = brktListRecords[brktId];
  if (!brktList) {
    return missingDataError(`Bracket list with bracket definition id ${brktId} not found.`);
  }
  const bracket = brktList.brackets[bindex];
  if (!bracket) {
    return missingDataError(`Bracket with index ${bindex} not found in bracket list.`);
  }
  const brktMatch = bracket.match;
  if (!brktMatch) {
    return missingDataError(`Bracket with index ${bindex} has no match class.`);
  }
  const div = tmntFullData.divs.find((div) => div.id === brkt.div_id);
  if (!div) {
    return missingDataError(`Div with id ${brkt.div_id} not found.`);
  }

  const matchElement = (
    playerMatchInfo: matchSeedInfoType,    
  ): JSX.Element => {     
    let playerName = "";
    let resultClassName = "";
    let scoreStr = "";
    let matchResult: string | undefined = "";
    if (playerMatchInfo != null) {
      playerName = fullName(playerMatchInfo.first_name, playerMatchInfo.last_name);
      resultClassName = getResultClassName(playerMatchInfo.result);
      if (playerMatchInfo.score != null) {
        scoreStr = `${playerMatchInfo.score}`;
        if (div.hdcp_per > 0 && !playerMatchInfo.playerId.startsWith('bye')) {
          scoreStr += ` + ${playerMatchInfo.hdcp} = ${playerMatchInfo.total}`;
        }
      }
      matchResult = playerMatchInfo.result;
    }
    return (
      <>        
        <div className="d-flex justify-content-between gap-2 ">
          <span
            className="text-start text-truncate ps-1"
            style={{ minWidth: 0 }}
            title={playerName}
          >
            {playerName}
          </span>
          <span className="text-end text-nowrap pe-1">
            {scoreStr}&nbsp;
            <span className={resultClassName}>
              {matchResult}
            </span>
          </span>
        </div>
      </>      
    )
  }

  const lineSpacer = (key: string, endBorder: boolean): JSX.Element => {
    return (
      <div
        key={key}
        className={endBorder ? "border-end border-dark" : ""}
      >
        &nbsp;
      </div>
    )
  } 

  const game1MatchElement = (
    matchInfo: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {     
    const player1mi = matchInfo[0];
    const player2mi = matchInfo[1];
    return (
      <>
        <div
          key={matchNum + player1mi.playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(player1mi)}
        </div>
        {lineSpacer(matchNum + 'spacer1', true)}
        <div
          key={matchNum + player2mi.playerId}
          className="align-middle border-bottom border-end border-dark"
        >
          {matchElement(player2mi)}
        </div>
        {/* spacer row unless at match 3 */}
        {matchNum < 3 && 
          <>
            {lineSpacer(matchNum + 'spacer2', false)}
          </>
        }
      </>      
    )
  }

  const game2MatchElementTopPlayersMi2 = (
    topPlayersMi: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    return (
      <>
        <div
          key={matchNum + topPlayersMi[0].playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        {lineSpacer(matchNum + 'spacer2', true)}
        <div
          key={matchNum + topPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[1])}
        </div>
        {lineSpacer(matchNum + 'spacer4', true)}
      </>
    )
  }

  const game2MatchElementTopPlayersMiNot2 = (
    topPlayersMi: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    return (
      <>
        {lineSpacer(matchNum + 'spacer1', false)}
        <div
          key={matchNum + 'topPlayer'}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        {lineSpacer(matchNum + 'spacer3', true)}
        {lineSpacer(matchNum + 'spacer4', true)}
      </>
    )
  }

  const game2MatchElementBottomPlayersMi2 = (
    bottomPlayersMi: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    return (
      <>
        <div
          key={matchNum + bottomPlayersMi[0].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div>
        {lineSpacer(matchNum + 'spacer6', true)}
        <div
          key={matchNum + bottomPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[1])}
        </div>
        {matchNum === 4 &&
          <>
            {lineSpacer(matchNum + 'spacer8', false)}
          </>
        }
      </>
    )
  }

  const game2MatchElementBottomPlayersMiNot2 = (
    bottomPlayersMi: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    return (
      <>
        {lineSpacer(matchNum + 'spacer5', true)}
        <div
          key={matchNum + 'bottomPlayer'}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div>
        {matchNum === 4 &&
          <>
            {lineSpacer(matchNum + 'spacer7', false)}
            {lineSpacer(matchNum + 'spacer8', false)}
          </>
        }        
      </>
    )
  }

  const game2MatchElement = (
    matchInfo: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    const topPlayers = brktMatch.getPlayersForPosition(matchNum, 0);
    const bottomPlayers = brktMatch.getPlayersForPosition(matchNum, 1);
    const topPlayersMi = matchInfo.filter((mi) => topPlayers.includes(mi.playerId));
    const bottomPlayersMi = matchInfo.filter((mi) => bottomPlayers.includes(mi.playerId));
    
    return (
      <>
        {topPlayersMi.length === 2
          ? (
            <>
              {game2MatchElementTopPlayersMi2(topPlayersMi, matchNum)}
            </>
          ) : (
            <>
              {game2MatchElementTopPlayersMiNot2(topPlayersMi, matchNum)}
            </>
          )
        }
        {bottomPlayersMi.length === 2
          ? (
            <>
              {game2MatchElementBottomPlayersMi2(bottomPlayersMi, matchNum)}
            </>
          ) : (
            <>
              {game2MatchElementBottomPlayersMiNot2(bottomPlayersMi, matchNum)}
            </>
        )}        
      </>      
    )
  }

  const getPlayerEarningsMap = (
    topPlayersMi: matchSeedInfoType[]
  ): Map<string, string> => {
    const playerEarningsMap = new Map<string, string>();
    topPlayersMi.forEach((mi) => {
      const earnings = bracket.playerEarnings(mi.playerId)
      const earningsStr = earnings === 0
        ? ''
        : formatValueSymbSep2Dec(earnings.toString(), localConfig)
      playerEarningsMap.set(mi.playerId, earningsStr);
    })
    return playerEarningsMap
  }

  const game3MatchElementTopPlayersMi4 = (
    topPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    

    const playerEarningsMap = getPlayerEarningsMap(topPlayersMi);
    return (
      <>
        <div
          key={'6' + topPlayersMi[0].playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer2'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer4'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[1].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[2].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[2])}
        </div>
        <div
          key={'6' + 'spacer6'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[2].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[3].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[3])}
        </div>
        <div
          key={'6' + 'spacer8'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[3].playerId)}
        </div>
      </>
    )
  }

  const game3MatchElementTopPlayersMi3 = (
    topPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    

    const playerEarningsMap = getPlayerEarningsMap(topPlayersMi);
    return (
      <>
        {lineSpacer('6spacer1', false)}
        <div
          key={'6' + topPlayersMi[0].playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer3'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer5'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[1].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[2].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[2])}
        </div>
        <div
          key={'6' + 'spacer7'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[2].playerId)}
        </div>
        {lineSpacer('6spacer8', true)}
      </>
    )
  }

  const game3MatchElementTopPlayersMi2 = (
    topPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    

    const playerEarningsMap = getPlayerEarningsMap(topPlayersMi);
    return (
      <>
        {lineSpacer('6spacer1', false)}
        {lineSpacer('6spacer2', false)}
        <div
          key={'6' + topPlayersMi[0].playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer4'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + topPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(topPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer6'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(topPlayersMi[1].playerId)}
        </div>
        {lineSpacer('6spacer7', true)}
        {lineSpacer('6spacer8', true)}        
      </>
    )
  }

  const game3MatchElementTopPlayersMiLessThan2 = (
    topPlayersMi: matchSeedInfoType[]
  ): JSX.Element => {
    const runnerUpAmntStr = formatValueSymbSep2Dec(bracket.runnerUpAmount.toString(), localConfig);

    return (
      <>
        {lineSpacer('6spacer1', false)}
        {lineSpacer('6spacer2', false)}
        {lineSpacer('6spacer3', false)}
        <div
          key={'6' + topPlayersMi[0].playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(topPlayersMi[0])}
        </div>
        {topPlayersMi[0].result === "L"
          ? (
            <>
              <div
                key={'6' + topPlayersMi[0].playerId + 'amount'}
                className="text-end align-middle border-end border-dark text-success pe-1"
              >
                {runnerUpAmntStr}
              </div>
              {lineSpacer('6spacer6', true)}
              {lineSpacer('6spacer7', true)}
              {lineSpacer('6spacer8', true)}
            </>
          ) : (
            <>
              {lineSpacer('6spacer5', true)}
              {lineSpacer('6spacer6', true)}
              {lineSpacer('6spacer7', true)}
              {lineSpacer('6spacer8', true)}
            </>
          )
        }
      </>
    )
  }

  const game3MatchElementBottomPlayersMi4 = (
    bottomPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    

    const playerEarningsMap = getPlayerEarningsMap(bottomPlayersMi);
    return (
      <>
        <div
          key={'6' + bottomPlayersMi[0].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer10'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer12'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[1].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[2].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[2])}
        </div>
        <div
          key={'6' + 'spacer14'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[2].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[3].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[3])}
        </div>
        <div
          key={'6' + 'spacer16'}
          className="text-end align-middle border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[3].playerId)}
        </div>
      </>
    )
  }

  const game3MatchElementBottomPlayersMi3 = (
    bottomPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    

    const playerEarningsMap = getPlayerEarningsMap(bottomPlayersMi);
    return (
      <>
        {lineSpacer('6spacer9', true)}
        <div
          key={'6' + bottomPlayersMi[0].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer11'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer13'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[1].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[2].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[2])}
        </div>
        <div
          key={'6' + 'spacer15'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          {playerEarningsMap.get(bottomPlayersMi[2].playerId)}
        </div>
      </>
    )
  }  

  const game3MatchElementBottomPlayersMi2 = (
    bottomPlayersMi: matchSeedInfoType[]    
  ): JSX.Element => {    
    const playerEarningsMap = getPlayerEarningsMap(bottomPlayersMi);
    return (
      <>
        {lineSpacer('6spacer9', true)}
        {lineSpacer('6spacer10', true)}
        <div
          key={'6' + bottomPlayersMi[0].playerId}
          className="align-middle border-bottom border-end border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div>
        <div
          key={'6' + 'spacer12'}
          className="text-end align-middle border-end border-dark text-success pe-1"
        >
          &nbsp;{playerEarningsMap.get(bottomPlayersMi[0].playerId)}
        </div>
        <div
          key={'6' + bottomPlayersMi[1].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[1])}
        </div>
        <div
          key={'6' + 'spacer14'}
          className="text-end align-middle border-dark text-success pe-1"
        >
          &nbsp;{playerEarningsMap.get(bottomPlayersMi[1].playerId)}
        </div>
      </>
    )
  } 

  const game3MatchElementBottomPlayersMiLessThan2 = (
    bottomPlayersMi: matchSeedInfoType[]
  ): JSX.Element => {
    const runnerUpAmntStr = formatValueSymbSep2Dec(bracket.runnerUpAmount.toString(), localConfig);

    return (
      <>
        {lineSpacer('6spacer9', true)}
        {lineSpacer('6spacer10', true)}
        {lineSpacer('6spacer11', true)}      
        <div
          key={'6' + bottomPlayersMi[0].playerId}
          className="align-middle border-end border-bottom border-dark"
        >
          {matchElement(bottomPlayersMi[0])}
        </div> 
        {bottomPlayersMi[0].result === "L" &&
          <>
            <div
              key={'6' + bottomPlayersMi[0].playerId + 'amount'}
              className="text-end align-middle border-dark text-success pe-1"
            >
              {runnerUpAmntStr}
            </div>
          </>
        }                          
      </>
    )
  }

  const game3MatchElement = (
    matchInfo: matchSeedInfoType[],    
  ): JSX.Element => {
    // game 3 is match 6
    const topPlayers = brktMatch.getPlayersForPosition(6, 0);
    const bottomPlayers = brktMatch.getPlayersForPosition(6, 1);
    const topPlayersMi = matchInfo.filter((mi) => topPlayers.includes(mi.playerId));
    const bottomPlayersMi = matchInfo.filter((mi) => bottomPlayers.includes(mi.playerId));    

    return (
      <>
        {topPlayersMi.length === 4
          ? (
            <>
              {game3MatchElementTopPlayersMi4(topPlayersMi)}
            </>
          ) : (
            <>
              {topPlayersMi.length === 3
                ? (
                  <>
                    {game3MatchElementTopPlayersMi3(topPlayersMi)}
                  </>
                ) : (
                  <>
                    {topPlayersMi.length === 2
                      ? (
                        <>
                          {game3MatchElementTopPlayersMi2(topPlayersMi)}
                        </>
                      ) : (
                        <>
                          {game3MatchElementTopPlayersMiLessThan2(topPlayersMi)}
                        </>
                      )
                    }
                  </>
                )
              }
            </>
          )
        }
        {bottomPlayersMi.length === 4
          ? (
            <>
              {game3MatchElementBottomPlayersMi4(bottomPlayersMi)}
            </>
          ) : (
            <>
              {bottomPlayersMi.length === 3
                ? (
                  <>
                    {game3MatchElementBottomPlayersMi3(bottomPlayersMi)}
                  </>
                ) : (
                  <>
                    {bottomPlayersMi.length === 2
                      ? (
                        <>
                          {game3MatchElementBottomPlayersMi2(bottomPlayersMi)}
                        </>
                      ) : (
                        <>
                          {game3MatchElementBottomPlayersMiLessThan2(bottomPlayersMi)}
                        </>
                      )
                    }
                  </>
                )
              }
            </>
          )
        }
      </>      
    )
  }

  const game1Matches = (): JSX.Element => {
    return (
      <>
        {[0, 1, 2, 3].map((matchNum) => {               
          const players = bracket.match!.getMatchPlayers(matchNum as matchNumberType);
          const squadGameNum = bracket.parent!.squadGameNumber(1);
          const matchInfo = bracket.match!.getMatchInfo(players, squadGameNum);
          return (
            <React.Fragment key={matchNum}>
              {game1MatchElement(matchInfo, matchNum as matchNumberType)}
            </React.Fragment>
          )          
        })}  
      </>
    )
  }

  const game2Matches = (): JSX.Element => {
    return (
      <>
        {[4, 5].map((matchNum) => {               
          const players = bracket.match!.getMatchPlayers(matchNum as matchNumberType);
          const squadGameNum = bracket.parent!.squadGameNumber(2);
          const matchInfo = bracket.match!.getMatchInfo(players, squadGameNum);
          return (
            <React.Fragment key={matchNum}>
              {game2MatchElement(matchInfo, matchNum as matchNumberType)}
            </React.Fragment>
          )
        })}  
      </>
    )
  }

  const game3Match = (): JSX.Element => {
    // game 3 has only match 6
    const players = bracket.match!.getMatchPlayers(6 as matchNumberType);
    const squadGameNum = bracket.parent!.squadGameNumber(3);
    const matchInfo = bracket.match!.getMatchInfo(players, squadGameNum);
    return (
      <>
        {game3MatchElement(matchInfo)}
      </>
    )
  }

  const winner = (): JSX.Element => {
    const players = bracket.match!.getMatchPlayers(6); // final match
    const squadGameNum = bracket.parent!.squadGameNumber(3);
    const matchInfo = bracket.match!.getMatchInfo(players, squadGameNum);
    const winnerMi = matchInfo.find((info) => info.result === "W")!;
    const winnerAmntStr = formatValueSymbSep2Dec(bracket.winnerAmount.toString(), localConfig);
    return (
      <>
        {[1, 2, 3, 4, 5, 6, 7].map((spacer) => { 
          return (
            <div key={'7spacer' + spacer}>
              &nbsp;
            </div>
          )
        })}
        <div
          key={'7' + winnerMi.playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(winnerMi)}
        </div>
        <div
          key={'7' + winnerMi.playerId + 'amount'}
          className="text-end align-middle text-success pe-1"
        >
          {winnerAmntStr}
        </div>
      </>      
    )
  }


  const brktMatchColWidth = "300px";

  const lastBindex = brktList.brackets.length - 1;
  const nextBindex = bindex === lastBindex ? 0 : bindex + 1;
  const prevBindex = bindex === 0 ? lastBindex : bindex - 1;
  const nextOneBrktId = brktList.brackets[nextBindex].id;
  const prevOneBrktId = brktList.brackets[prevBindex].id;
  const winnerAmtStr = formatValueSymbSep2Dec(bracket.winnerAmount.toString(), localConfig);
  const runnerUpAmtStr = formatValueSymbSep2Dec(bracket.runnerUpAmount.toString(), localConfig);

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} /> 

      <div className="container-fluid">
        <div
          data-testid="GamesOuterWrapper"
          className="one-brkt-progress-outer"
        >      
          <div
            data-testid="GamesInnerWrapper"
            className="one-brkt-progress-inner"
          >    
            {/* header for the bracket */}
            <div className="text-center align-middle mb-3">
              <Link
                href={`/results/tmnt/${tmntId}/brackets/oneBrkt/${prevOneBrktId}`}
                className="btn btn-primary p-0 ps-1 pe-1"
              >
                {`<-`}
              </Link>
              <span className="fw-bold align-middle ps-1 pe-1">
                {brktName} - Bracket Number {bindex+1}
              </span>
              <span className="text-success align-middle pe-1">
                1st {winnerAmtStr} 2nd {runnerUpAmtStr}
              </span>
              <Link
                href={`/results/tmnt/${tmntId}/brackets/oneBrkt/${nextOneBrktId}`}
                className="btn btn-primary p-0 ps-1 pe-1"
              >
                {`->`}
              </Link>
            </div>

            {/* the bracket */}
            <div className="row gx-0">

              {/* game 1 matches */}
              <div
                className="one-brkt-game-column"
                style={{ width: brktMatchColWidth }}
              >
                {game1Matches()}
              </div>

              {/* game 2 matches */}
              <div
                className="one-brkt-game-column"
                style={{ width: brktMatchColWidth }}
              >
                {game2Matches()}
              </div>

              {/* game 3 match */}
              <div
                className="one-brkt-game-column"
                style={{ width: brktMatchColWidth }}
              >
                {game3Match()}
              </div>

              {/* winner */}
              {/* <div style={{ width: brktMatchColWidth }}>
                {winner()}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OneBrktPage