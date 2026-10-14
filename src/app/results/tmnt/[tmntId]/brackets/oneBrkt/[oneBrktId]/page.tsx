"use client";

import "@/lib/syncfusion-license";
import React, { JSX, useEffect, useState, useMemo } from "react";
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
import { fullName, getBrktOrElimName } from "@/lib/getName";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { matchNumberType, matchSeedInfoType } from "@/components/brackets/bracketMatchClass";
import { getResultClassName } from "../../resultClassName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import Link from "next/link";
import { btDbUuid } from "@/lib/uuid";
import { missingDataError } from "../../player/[playerId]/playerBrktData";
import "./oneBrkt.css";

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const OneBrktPage = () => {
  const params = useParams();
  const oneBrktId = params.oneBrktId as string;
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(getOneTmntGameResultsRequestedTmntId);
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);  
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
    
  const brktListRecords = useSelector(getBrktListRecords);

  const [mounted, setMounted] = useState(false);

  const tmntPageBtn: tmntPageBtnType = "Brackets";

  const hasTmntGamesData =
    resultsTmntId !== "" && resultsTmntId === tmntId;
  
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
  bracket.updateMatches() // make sure matches are up to date
  const div = tmntFullData.divs.find((div) => div.id === brkt.div_id);
  if (!div) {
    return missingDataError(`Div with id ${brkt.div_id} not found.`);
  }

  /**
   * returns a map of player id to player earnings
   *
   * @param {matchSeedInfoType[]} topPlayersMi
   * @return {Map<string, string>}
   */
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

  /**
   * returns JSX for a vertical line spacer
   *
   * @param {string} key
   * @param {boolean} endBorder
   * @return {JSX.Element}
   */
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

  /**
   * returns JSX for one player in a match
   *
   * @param {(matchSeedInfoType | undefined)} playerMatchInfo
   * @return {JSX.Element}
   */
  const matchElement = (
    playerMatchInfo: matchSeedInfoType | undefined,
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
          {!playerMatchInfo?.finalMatch && 
            <span className="text-end text-nowrap pe-1">
              {scoreStr}&nbsp;
              <span className={resultClassName}>
                {matchResult}
              </span>
            </span>
           } 
        </div>
      </>      
    )
  }

  /**
   * returns JSX for one Game 1 or 2 player.
   *
   * @param {(matchSeedInfoType | undefined)} playerMi
   * @param {number} gameNum
   * @param {boolean} playerBorderEnd
   * @return {JSX.Element}
   */
  const game1Or2PlayerElement = (
    playerMi: matchSeedInfoType | undefined,
    gameNum: number,
    playerBorderEnd: boolean
  ): JSX.Element => {
    const playerClassNameStr = playerBorderEnd
      ? "align-middle border-end border-bottom border-dark"
      : "align-middle border-bottom border-dark";
    const keyStr = playerMi != null
      ? gameNum + playerMi.playerId
      : gameNum + btDbUuid('ply')
    return (
      <>
        <div
          key={keyStr}
          className={playerClassNameStr}
        >
          {matchElement(playerMi)}
        </div>
      </>
    )
  }

  /**
   * returns JSX for one Game 1 match.
   *
   * @param {matchSeedInfoType[]} matchInfo
   * @param {matchNumberType} matchNum
   * @return {JSX.Element}
   */
  const game1MatchElement = (
    matchInfo: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {     
    const midSpacerNum = matchNum === 0 
      ? 2
      : matchNum === 1
        ? 6
        : matchNum === 2
          ? 10
          : 14
    const postSpacerNum = midSpacerNum + 2    
    return (
      <>
        {game1Or2PlayerElement(matchInfo[0], 1, false)}
        {lineSpacer(matchNum + 'spacer' + midSpacerNum, true)}
        {game1Or2PlayerElement(matchInfo[1], 1, true)}
        {matchNum < 3 &&
          <>
            {lineSpacer(matchNum + 'spacer' + postSpacerNum, false)}
          </>
        }
      </>      
    )
  }

  /**
   * Render all Game 1 matches.
   *
   * @return {JSX.Element}
   */
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

  /**
   * Render one side of a Game 2 match.
   *
   * The top side fills four rows, including trailing spacers.
   * The bottom side ends immediately after its last player.
   * 
   * @param {matchSeedInfoType[]} playersMi - Array of player match info
   * @param {matchNumberType} matchNum - Game 2 match number
   * @param {boolean} isTop - True for top side
   * 
   * @returns JSX
   */
  const game2MatchSideElement = (
    playersMi: matchSeedInfoType[],
    matchNum: matchNumberType,
    isTop: boolean
  ): JSX.Element => {
    // Keep one blank player slot when no players have advanced yet.
    const playerSlots = Math.max(playersMi.length, 1);
    const spacerRows = 2 - playerSlots;

    const sideKey = isTop ? "top" : "bottom";
    const keyPrefix = `game2-${matchNum}-${sideKey}`;

    return (
      <>
        {/* Leading spacers have a right border only on the bottom side. */}
        {Array.from({ length: spacerRows }, (_, index) =>
          lineSpacer(`${keyPrefix}-before-${index}`, !isTop)
        )}

        {Array.from({ length: playerSlots }, (_, index) => {
          const playerMi = playersMi[index];

          // The first top player starts the vertical connector.
          const playerBorderEnd = !isTop || index > 0;

          // Top players always have a spacer afterward.
          // Bottom players have one only between players.
          const showSpacerAfter = isTop || index < playerSlots - 1;

          return (
            <React.Fragment
              key={`${keyPrefix}-${playerMi?.playerId ?? "blank"}`}
            >
              {game1Or2PlayerElement(
                playerMi,
                2,
                playerBorderEnd
              )}

              {showSpacerAfter &&
                lineSpacer(`${keyPrefix}-between-${index}`, true)}
            </React.Fragment>
          );
        })}

        {/* Fill the remaining top-side rows. */}
        {isTop &&
          Array.from({ length: spacerRows }, (_, index) =>
            lineSpacer(`${keyPrefix}-after-${index}`, true)
          )}
      </>
    );
  };

  /**
   * returns JSX for one Game 2 match.
   *
   * @param {matchSeedInfoType[]} matchInfo - Array of player match info
   * @param {matchNumberType} matchNum - Game 2 match number
   * @return {JSX.Element}
   */
  const game2MatchElement = (
    matchInfo: matchSeedInfoType[],
    matchNum: matchNumberType
  ): JSX.Element => {
    const topPlayers = brktMatch.getPlayersForPosition(matchNum, 0);
    const bottomPlayers = brktMatch.getPlayersForPosition(matchNum, 1);

    const topPlayersMi = matchInfo.filter((mi) =>
      topPlayers.includes(mi.playerId)
    );
    const bottomPlayersMi = matchInfo.filter((mi) =>
      bottomPlayers.includes(mi.playerId)
    );

    const bottomPlayerSlots = Math.max(bottomPlayersMi.length, 1);

    // Separate match 4 from match 5 using the original layout's spacing.
    const betweenMatchesSpacerRows = 3 - bottomPlayerSlots;

    return (
      <>
        {game2MatchSideElement(topPlayersMi, matchNum, true)}
        {game2MatchSideElement(bottomPlayersMi, matchNum, false)}

        {matchNum === 4 &&
          Array.from({ length: betweenMatchesSpacerRows }, (_, index) =>
            lineSpacer(`game2-${matchNum}-after-match-${index}`, false)
          )}
      </>
    );
  };  
  
  /**
   * Render all Game 2 matches.
   *
   * @return {JSX.Element}
   */
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

  /**
   * returns a Game 3 player element
   *
   * @param {(matchSeedInfoType | undefined)} playerMi
   * @param {Map<string, string>} playerEarningsMap
   * @param {boolean} playerBorderEnd
   * @param {boolean} resultBorderEnd
   * @param {number} lineNum
   * @return {JSX.Element}
   */
  const game3PlayerElement = (
    playerMi: matchSeedInfoType | undefined,
    playerEarningsMap: Map<string, string>,
    playerBorderEnd: boolean,
    resultBorderEnd: boolean,
    lineNum: number
  ): JSX.Element => {
    const playerClassNameStr = playerBorderEnd
      ? "align-middle border-end border-bottom border-dark"
      : "align-middle border-bottom border-dark";
    const resultClassNameStr = resultBorderEnd
      ? "text-end align-middle border-end border-dark text-success pe-1"
      : "text-end align-middle border-dark text-success pe-1";
    const keyStr = playerMi != null
      ? '6' + playerMi.playerId
      : '6' + btDbUuid('ply')    
    return (
      <>
        <div
          key={keyStr}
          className={playerClassNameStr}
        >
          {matchElement(playerMi)}
        </div>
        <div
          key={'6' + 'spacer' + (lineNum + 1)}
          className={resultClassNameStr}          
        >
          {playerMi != null && playerEarningsMap.get(playerMi.playerId) !== "" && playerMi.result === "L"
            ? playerEarningsMap.get(playerMi.playerId)
            : ""
          }
        </div>
      </>
    )
  }

  /**
   * Render one side of the final match.
   *
   * Each player occupies two rows: player information and earnings.
   * The top side includes trailing spacers to fill its eight rows.
   * The bottom side ends immediately after the last earnings row.
   * 
   * @param {matchSeedInfoType[]} playersMi - Array of player match info
   * @param {boolean} isTop - True if this is the top side
   * 
   * @returns JSX
   */
  const game3MatchSideElement = (
    playersMi: matchSeedInfoType[],
    isTop: boolean
  ): JSX.Element => {
    const playerEarningsMap = getPlayerEarningsMap(playersMi);

    // Keep one blank player slot when this side has no finalists yet.
    const playerSlots = Math.max(playersMi.length, 1);
    const spacerRows = 4 - playerSlots;

    const sideKey = isTop ? "top" : "bottom";
    const firstSideLine = isTop ? 1 : 9;

    return (
      <>
        {/* Leading spacers have a right border only on the bottom side. */}
        {Array.from({ length: spacerRows }, (_, index) =>
          lineSpacer(`game3-${sideKey}-before-${index}`, !isTop)
        )}

        {Array.from({ length: playerSlots }, (_, index) => {
          const playerMi = playersMi[index];

          // Each earlier player occupies two rows.
          const playerLineNum = firstSideLine + spacerRows + index * 2;

          // The first top player starts the vertical connector.
          const playerBorderEnd = !isTop || index > 0;

          // The connector ends before the last bottom earnings row.
          const resultBorderEnd = isTop || index < playerSlots - 1;

          return (
            <React.Fragment
              key={`game3-${sideKey}-${playerMi?.playerId ?? "blank"}`}
            >
              {game3PlayerElement(
                playerMi,
                playerEarningsMap,
                playerBorderEnd,
                resultBorderEnd,
                playerLineNum
              )}
            </React.Fragment>
          );
        })}

        {/* Only the top side needs trailing spacers. */}
        {isTop &&
          Array.from({ length: spacerRows }, (_, index) =>
            lineSpacer(`game3-${sideKey}-after-${index}`, true)
          )}
      </>
    );
  };

  /**
   * returns JSX for a Game 3 match.
   *
   * @param {matchSeedInfoType[]} matchInfo
   * @return {JSX.Element}
   */
  const game3MatchElement = (
    matchInfo: matchSeedInfoType[]
  ): JSX.Element => {
    // Game 3 is match 6.
    const topPlayers = brktMatch.getPlayersForPosition(6, 0);
    const bottomPlayers = brktMatch.getPlayersForPosition(6, 1);

    const topPlayersMi = matchInfo.filter((mi) =>
      topPlayers.includes(mi.playerId)
    );
    const bottomPlayersMi = matchInfo.filter((mi) =>
      bottomPlayers.includes(mi.playerId)
    );

    return (
      <>
        {game3MatchSideElement(topPlayersMi, true)}
        {game3MatchSideElement(bottomPlayersMi, false)}
      </>
    );
  };

  /**
   * Render Game 3 match.
   *
   * @return {JSX.Element}
   */
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

  /**
   * returns JSX for one Game 3 player.
   *
   * @param {matchSeedInfoType} playerMi
   * @param {Map<string, string>} playerEarningsMap
   * @param {number} lineNum
   * @return {*}  {JSX.Element}
   */
  const winnerPlayerElement = (
    playerMi: matchSeedInfoType,
    playerEarningsMap: Map<string, string>,    
    lineNum: number
  ): JSX.Element => {
    return (
      <>
        <div
          key={'W' + playerMi.playerId}
          className="align-middle border-bottom border-dark"
        >
          {matchElement(playerMi)}
        </div>
        <div
          key={'W' + 'spacer' + (lineNum + 1)}
          className="text-end align-middle border-dark text-success pe-1"
        >
          {playerEarningsMap.get(playerMi.playerId)}
        </div>
      </>
    )
  }

  /**
   * renders Game 3 winner(s).
   *
   * @return {JSX.Element}
   */
  const winner = (): JSX.Element => {
    const players = brktMatch.getMatchPlayers(6);
    const squadGameNum = bracket.parent!.squadGameNumber(3);
    const matchInfo = brktMatch.getMatchInfo(players, squadGameNum);

    const winnersMi = matchInfo.filter((info) => info.result === "W" || info.result === "T");
    winnersMi.forEach((info) => info.finalMatch = true);
    const playerEarningsMap = getPlayerEarningsMap(winnersMi);

    // Each winner occupies two rows: player information and prize amount.
    // Center the group within the bracket's 15-row layout. row 8 is middle.
    const blankRowsPerSide = 8 - winnersMi.length;
    const blankPlayerMi: matchSeedInfoType = {
      playerId: btDbUuid('ply'),
      first_name: '',
      last_name: '',
      average: undefined,
      score: undefined,
      hdcp: undefined,
      total: undefined,
      result: undefined, 
      finalMatch: true,
    }
    return (
      <>
        {winnersMi.length === 0
          ? (
            <>
              {Array.from({ length: 7 }, (_, index) =>
                lineSpacer(`wSpacer${index}`, false)
              )}
              {winnerPlayerElement(blankPlayerMi, playerEarningsMap, 8)}
            </>
          ) : (
            <>  
              {Array.from({ length: blankRowsPerSide }, (_, index) =>
                lineSpacer(`wSpacer-${index}`, false)
              )}

              {winnersMi.map((playerMi, index) => {
                const playerLineNum = blankRowsPerSide + index * 2 + 1;
                
                return (
                  <React.Fragment key={playerMi.playerId}>
                    {winnerPlayerElement(
                      playerMi,
                      playerEarningsMap,
                      playerLineNum
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )
        }
      </>
    );
  };

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
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} /> 

      <div className="container-fluid">
        <div
          data-testid="BrktProgressOuterWrapper"
          className="one-brkt-progress-outer"
        >      
          <div
            data-testid="BrktProgressInnerWrapper"
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
              <div
                className="one-brkt-game-column"
                style={{ width: brktMatchColWidth }}
              >
                {winner()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OneBrktPage