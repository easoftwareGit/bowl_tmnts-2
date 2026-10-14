import React, { JSX } from "react";
import Link from "next/link";
import { tmntFullType } from "@/lib/types/types";
import { fullName } from "@/lib/getName";
import { BracketList } from "@/components/brackets/bracketListClass";
import { getGameScoreKey } from "@/components/brackets/bracketMaps";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { matchResultType } from "@/components/brackets/bracketMatchClass";
import { getBrktOrElimName } from "@/lib/getName";
import { isNumber, isValidBtDbId } from "@/lib/validation/validation";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { getResultClassName } from "../../resultClassName";
import { missingDataError } from "./playerBrktData";

type PlayerDivBrktProps = {
  playerId: string;
  tmntFullData: tmntFullType;
  brktList: BracketList;
};

type oppoInfoType = {
  playerId: string;
  gameScore: number | null;
  gameScoreStr: string;
  fullName: string;
};

type brktInfoType = {
  playerResult: matchResultType;
  playerAmount: number;
  fmtdPlayerAmount: string;
  oppoInfo: oppoInfoType[];
};

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const PlayerDivBrkts = ({
  playerId,
  tmntFullData,
  brktList,
}: PlayerDivBrktProps) => {
  if (!playerId || playerId === "") return missingDataError("No Player id.");
  if (
    !tmntFullData ||
    !tmntFullData.tmnt ||
    !tmntFullData.tmnt.id ||
    !isValidBtDbId(tmntFullData.tmnt.id, "tmt")
  )
    return missingDataError("No Tournament Data.");
  if (!brktList) return missingDataError("No Bracket List.");
  const brkt = tmntFullData.brkts.find((b) => b.id === brktList.brktId);
  if (!brkt)
    return missingDataError(
      "Bracket configuration not found. Id: " + brktList.brktId,
    );
  const div = tmntFullData.divs.find((d) => d.id === brkt.div_id);
  if (!div)
    return missingDataError(
      "Division configuration not found. Id: " + brkt.div_id,
    );
  const squad = tmntFullData.squads.find((s) => s.id === brkt.squad_id);
  if (!squad)
    return missingDataError(
      "Squad configuration not found. Id: " + brkt.squad_id,
    );
  const playerRow = tmntFullData.players.find((p) => p.id === playerId);
  if (!playerRow)
    return missingDataError("Player configuration not found. Id: " + playerId);
  const playerBrktEntries = tmntFullData.brktEntries.find(
    (be) => be.player_id === playerId && be.brkt_id === brkt.id,
  );
  if (!playerBrktEntries)
    return missingDataError(
      "Player bracket entries not found. Id: " + playerId,
    );
  if (!brktList.bracketIndexMap || brktList.bracketIndexMap.size === 0)
    return missingDataError("Bracket index map not found.");
  if (!brktList.gameScoreMap || brktList.gameScoreMap.size === 0)
    return missingDataError("Game score map not found.");
  if (!brktList.playersMap || brktList.playersMap.size === 0)
    return missingDataError("Players map not found.");
  if (brktList.brackets.length === 0)
    return missingDataError("Brackets not found.");
  if (!isNumber(brkt.fee)) return missingDataError("Bracket fee not found.");
  if (!isNumber(brkt.first))
    return missingDataError("Bracket first amount not found.");
  if (!isNumber(brkt.second))
    return missingDataError("Bracket second amount not found.");

  const playerName = fullName(playerRow.first_name, playerRow.last_name);
  const tmntId = tmntFullData.tmnt.id;
  const brktName = getBrktOrElimName(brkt, tmntFullData.divs);
  const playerOneBrktIds = brktList.playerBracketIdsSorted(playerId);
  const brktFeeNum = Number(brkt.fee);
  const playerEntryAmt = brktFeeNum * playerOneBrktIds.length;
  const numRefunds = playerBrktEntries.num_refunds ?? 0;
  const refundAmnt = brktFeeNum * numRefunds;
  const fmtdEntryPerBrkt = formatValueSymbSep2Dec(
    brkt.fee.toString(),
    localConfig,
  );  
  const fmtdPlayerEntryAmt = formatValueSymbSep2Dec(
    playerEntryAmt.toString(),
    localConfig,
  );

  const getPlayerGameScore = (brktGameNum: number): string => {
    const squadGameNum = brktList.squadGameNumber(brktGameNum);
    const gameMapKey = getGameScoreKey(playerId, squadGameNum);

    return brktList.gameScoreMap?.get(gameMapKey)?.toString() ?? "";
  };

  const playerColumnHeaderElement = (
    brktGame: number,
    playerGameScore: string,
  ): JSX.Element => {
    const squadGameNum = brktList.squadGameNumber(brktGame);

    const playerHdcp =
      div.hdcp_per > 0
        ? calcHandicap(
            playerRow.average,
            div.hdcp_from,
            div.hdcp_per,
            div.int_hdcp,
          )
        : 0;
    const totalScore = Number(playerGameScore) + playerHdcp;
    const plusHdcp =
      div.hdcp_per > 0 && playerGameScore !== ""
        ? `+${playerHdcp}=${totalScore}`
        : "";
    const aliveCount = brktList.aliveCount(playerId, brktGame);

    return (
      <div className="fw-semibold">
        {playerGameScore}
        {plusHdcp} {playerName} Game {squadGameNum}&nbsp;
        {(brktGame === 1 || (brktGame > 1 && playerGameScore !== "")) && (
          <span className="small-table-font">({aliveCount} brackets)</span>
        )}
      </div>
    );
  };

  /**
   * Calculate total earnings for all the player's brackets
   *
   * note: this is only called when the player has a game 3 score
   *
   * @return {number} - total earnings for all of one player's brackets
   */
  const calcTotalEarnings = (): number =>
    playerOneBrktIds.reduce((sum, oneBrktId) => {
      const bindex = brktList.bracketIndexMap?.get(oneBrktId);
      if (bindex === undefined) return sum;
      const oneBrkt = brktList.brackets[bindex];
      if (!oneBrkt) return sum;
      if (
        oneBrkt.winnerIds.has(playerId) ||
        oneBrkt.runnerUpIds.has(playerId)
      ) {
        return sum + oneBrkt.playerEarnings(playerId);
      }
      return sum;
    }, 0);  

  const bracketSummaryElement = (): JSX.Element => {    
    const summaryWidth = "230px";
    const totalEarnings = calcTotalEarnings();
    const fmtdPlayerEarnings = formatValueSymbSep2Dec(
      totalEarnings.toString(),
      localConfig,
    );
    const totalPaid = playerEntryAmt + refundAmnt;
    const totalPayout = totalEarnings + refundAmnt;        
    const fmtdRefunds = refundAmnt > 0
      ? formatValueSymbSep2Dec(
          (refundAmnt).toString(),
          localConfig,
        )
      : "";
    const entriesLabel = playerOneBrktIds.length === 1 ? "entry" : "entries";
    const refundsLabel = numRefunds === 1 ? "refund" : "refunds";

    return (
      <div
        className="d-flex justify-content-center align-middle fw-semibold small-table-font"
        data-testid="brkt-summary"
      >
        {/* summary column */}
        <div
          className="text-center"
          data-testid="brkt-summary-box"
          style={{ width: summaryWidth }}
        >
          &nbsp;
          <div className="border border-dark rounded-top rounded-bottom">
            <div className="text-center bracket-title_backgroud text-white">
              {playerName}
            </div>
            <div className="text-center bracket-title_backgroud text-white">
              Summary for {brktName}
            </div>
            <div className="border-bottom border-dark text-end pe-1">
              {playerOneBrktIds.length} {entriesLabel} @ {fmtdEntryPerBrkt} = {" "}
              {fmtdPlayerEntryAmt}
            </div>
            {refundAmnt > 0 && (
              <>
                <div className="border-bottom border-dark text-end pe-1">
                  {numRefunds} unused @ {fmtdEntryPerBrkt} = {" "}
                  {fmtdRefunds}
                </div>
                <div className="border-bottom border-dark text-end pe-1">
                  Total Paid:&nbsp;
                  {formatValueSymbSep2Dec(
                    (totalPaid).toString(),
                    localConfig,
                  )}
                </div>
              </>
            )}
            {refundAmnt === 0
              ? (
                <div className="border-top border-dark text-end text-success pe-1">
                  Earnings: {fmtdPlayerEarnings}
                </div>
              ) : (
                <div className="text-end text-success">
                  <div className="border-top border-bottom border-dark pe-1">
                    Earnings: {fmtdPlayerEarnings}
                  </div>
                  <div className="border-bottom border-dark pe-1">
                    {numRefunds} {refundsLabel} @ {fmtdEntryPerBrkt} = {" "}
                    {fmtdRefunds}
                  </div>
                  <div className="pe-1">
                    Total Returned:&nbsp;
                    {formatValueSymbSep2Dec(
                      (totalPayout).toString(),
                      localConfig,
                    )}
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  };

  /**
   * Get bracket info for one bracket
   *
   * @param {string} oneBrktId - one bracket id
   * @param {number} brktGameNum - bracket game number
   * @return {brktInfoType} - bracket info
   */
  const getBrktInfo = (
    oneBrktId: string,
    brktGameNum: number,
  ): brktInfoType => {
    const brktInfo: brktInfoType = {
      playerResult: undefined,
      playerAmount: 0,
      fmtdPlayerAmount: "",
      oppoInfo: [],
    };
    const bindex = brktList.bracketIndexMap?.get(oneBrktId);
    if (bindex === undefined) return brktInfo;
    const oneBrkt = brktList.brackets[bindex];
    if (!oneBrkt) return brktInfo;
    const playerMatchInfo = oneBrkt.getPlayerMatchInfo(playerId, brktGameNum);
    if (!playerMatchInfo) return brktInfo;
    const playerInfo = playerMatchInfo.matchInfo.find(
      (info) => info.playerId === playerId,
    );
    if (!playerInfo) return brktInfo;
    const oppoMi = playerMatchInfo.matchInfo.filter(
      (info) => info.playerId !== playerId,
    );
    if (oppoMi.length === 0) return brktInfo;

    if (brktGameNum === 3) {
      if (
        oneBrkt.winnerIds.has(playerId) ||
        oneBrkt.runnerUpIds.has(playerId)
      ) {
        brktInfo.playerAmount = oneBrkt.playerEarnings(playerId);
        brktInfo.fmtdPlayerAmount = formatValueSymbSep2Dec(
          brktInfo.playerAmount.toString(),
          localConfig,
        );
      }
    }

    oppoMi.forEach((matchInfo) => {
      brktInfo.playerResult = playerInfo.result;
      const oppoInfo: oppoInfoType = {
        playerId: matchInfo.playerId,
        gameScore: null,
        gameScoreStr: "",
        fullName: fullName(matchInfo.first_name, matchInfo.last_name),
      };
      if (matchInfo.score != null) {
        oppoInfo.gameScore = matchInfo.score;
        oppoInfo.gameScoreStr = matchInfo.score + "";
        if (
          div.hdcp_per > 0 &&
          matchInfo.hdcp != null &&
          !matchInfo.playerId.startsWith("bye")
        ) {
          oppoInfo.gameScore += matchInfo.hdcp;
          oppoInfo.gameScoreStr += ` + ${matchInfo.hdcp} = ${matchInfo.total}`;
        }
      }
      brktInfo.oppoInfo.push(oppoInfo);
    });

    // sort oppoInfo by game score, highest to lowest
    brktInfo.oppoInfo.sort((a, b) => {
      if (a.gameScore === null && b.gameScore === null) return 0;
      if (a.gameScore === null) return 1;
      if (b.gameScore === null) return -1;

      return b.gameScore - a.gameScore;
    });

    return brktInfo;
  };

  const minColumnWidth = "300px";

  return (
    <>
      <div className="row gx-0 text-center align-middle fw-bold">
        <div className="text-center align-middle fw-bold col-12 bracket-title_backgroud text-white border-bottom border-dark rounded">
          {brktName}
        </div>
      </div>

      {/* scrolls sideways when the three columns do not fit the page */}
      <div className="overflow-x-auto" data-testid="brkt-columns-scroll">
        <div
          className="row gx-0 pb-2 flex-nowrap"
          data-testid="brkt-columns-row"
        >
          {[1, 2, 3].map((brktGameNum) => {
            const infoWidth = brktGameNum === 3 ? "36%" : "32%";
            const playerGameScore = getPlayerGameScore(brktGameNum);

            return (
              <React.Fragment key={brktGameNum}>
                <div
                  className="text-start align-middle"
                  data-testid={`brkt-game-column-${brktGameNum}`}
                  style={{ width: infoWidth, minWidth: minColumnWidth }}
                >
                  {playerColumnHeaderElement(brktGameNum, playerGameScore)}

                  {playerOneBrktIds.map((oneBrktId) => {
                    const brktInfo = getBrktInfo(oneBrktId, brktGameNum);
                    const resultClass = getResultClassName(brktInfo.playerResult);

                    return (
                      <React.Fragment key={oneBrktId + playerId + brktGameNum}>
                        {brktInfo.oppoInfo.map((opi, index) => (
                          <div
                            key={oneBrktId + opi.playerId + brktGameNum}
                            className="d-flex align-middle small"
                          >
                            <Link
                              href={`/results/tmnt/${tmntId}/brackets/oneBrkt/${oneBrktId}`}
                              className="p-0"
                            >
                              {opi.gameScoreStr !== "" &&
                              playerGameScore !== "" ? (
                                <>
                                  <span
                                    className={`${resultClass} d-inline-block text-center`}
                                    style={{ width: "1.5rem" }}
                                  >
                                    {index === 0 ? brktInfo.playerResult : ""}
                                  </span>
                                  {index === 0 ? "" : "& "}
                                  {opi.gameScoreStr}
                                </>
                              ) : (
                                <span
                                  className="d-inline-block text-center"
                                  style={{ width: "1.5rem" }}
                                >
                                  __
                                </span>
                              )}
                            </Link>
                            &nbsp;{opi.fullName}
                            {brktInfo.playerAmount > 0 && index === 0 && (
                              <span className="ms-auto text-end text-success">
                                {brktInfo.fmtdPlayerAmount}
                              </span>
                            )}
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {brktGameNum === 3 && playerGameScore !== "" && (
                    <div>{bracketSummaryElement()}</div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>      
    </>
  );
};

export default PlayerDivBrkts;
