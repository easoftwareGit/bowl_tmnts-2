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

type PlayerDivBrktProps = {
  playerId: string;
  tmntFullData: tmntFullType;
  brktList: BracketList;
};

type brktInfoType = {
  playerResult: matchResultType;
  playerAmount: number;
  fmtdPlayerAmount: string;
  oppoPlayerIds: string[];
  oppoGameScores: string[];
  oppoFullNames: string[];
};

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
};

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
      "Squad configuration not found: Id: " + brkt.squad_id,
    );
  const playerRow = tmntFullData.players.find((p) => p.id === playerId);
  if (!playerRow)
    return missingDataError("Player configuration not found. Id: " + playerId);
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
  const fmtdEntryPerBrkt = formatValueSymbSep2Dec(
    brkt.fee.toString(),
    localConfig,
  );
  const playerEntryAmt = Number(brkt.fee) * playerOneBrktIds.length;
  const fmtdPlayerEntryAmt = formatValueSymbSep2Dec(
    playerEntryAmt.toString(),
    localConfig,
  );
  let totalAmt = 0;

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

  const bracketSummaryElement = (): JSX.Element => {
    const leftcolWidth = "33%";
    const summaryWidth = "230px";
    const fmtdPlayerEarnings = formatValueSymbSep2Dec(
      totalAmt.toString(),
      localConfig,
    );
    return (
      <div className="row gx-0 align-middle fw-semibold small-table-font">
        {/* spacer column */}
        <div style={{ width: leftcolWidth }} />

        {/* summary column */}
        <div className="text-center" style={{ width: summaryWidth }}>
          &nbsp;
          <div className="border border-dark rounded-top rounded-bottom">
            <div className="text-center bracket-title_backgroud text-white rounded-top">
              {playerName}
            </div>
            <div className="text-center bracket-title_backgroud text-white">
              Summary for {brktName}
            </div>
            <div className="border-top border-bottom border-dark text-end pe-1">
              {playerOneBrktIds.length} entries @ {fmtdEntryPerBrkt} ={" "}
              {fmtdPlayerEntryAmt}
            </div>
            <div className="text-end text-success pe-1 rounded-bottom">
              Earnings: {fmtdPlayerEarnings}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getBrktInfo = (
    oneBrktId: string,
    brktGameNum: number,
  ): brktInfoType => {
    const brktInfo: brktInfoType = {
      playerResult: undefined,
      playerAmount: 0,
      fmtdPlayerAmount: "",
      oppoPlayerIds: [],
      oppoGameScores: [],
      oppoFullNames: [],
    };
    const bindex = brktList.bracketIndexMap!.get(oneBrktId)!;
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
      if (oneBrkt.runnerUpIds.has(playerId)) {        
        brktInfo.playerAmount = oneBrkt.runnerUpAmount / oneBrkt.runnerUpIds.size;
        brktInfo.fmtdPlayerAmount = formatValueSymbSep2Dec(
          brktInfo.playerAmount.toString(),
          localConfig,
        );
      } else if (oneBrkt.winnerIds.has(playerId)) {        
        brktInfo.playerAmount = oneBrkt.winnerAmount / oneBrkt.winnerIds.size;
        brktInfo.fmtdPlayerAmount = formatValueSymbSep2Dec(
          brktInfo.playerAmount.toString(),
          localConfig,
        );
      }
    }

    oppoMi.forEach((matchInfo) => {
      brktInfo.playerResult = playerInfo.result;
      let oppoGameStr = "";
      if (matchInfo.score != null) {
        oppoGameStr = matchInfo.score + "";
        if (
          div.hdcp_per > 0 &&
          matchInfo.hdcp != null &&
          !matchInfo.playerId.startsWith("bye")
        ) {
          oppoGameStr += ` + ${matchInfo.hdcp} = ${matchInfo.total}`;
        }
        brktInfo.oppoGameScores.push(oppoGameStr);
      }
      brktInfo.oppoPlayerIds.push(matchInfo.playerId);
      brktInfo.oppoFullNames.push(
        fullName(matchInfo.first_name, matchInfo.last_name),
      );
    });
    return brktInfo;
  };

  return (
    <>
      <div className="row gx-0 text-center align-middle fw-bold">
        <div className="text-center align-middle fw-bold col-12 bracket-title_backgroud text-white border-bottom border-dark rounded">
          {brktName}
        </div>
      </div>

      <div className="row gx-0 pb-2">
        {[1, 2, 3].map((brktGameNum) => {
          const infoWidth = brktGameNum === 3 ? "36%" : "32%";
          const playerGameScore = getPlayerGameScore(brktGameNum);

          return (
            <React.Fragment key={brktGameNum}>
              <div
                className="text-start align-middle"
                style={{ width: infoWidth }}
              >
                {playerColumnHeaderElement(brktGameNum, playerGameScore)}

                {playerOneBrktIds.map((oneBrktId) => {
                  const brktInfo = getBrktInfo(oneBrktId, brktGameNum);
                  const resultClass = getResultClassName(brktInfo.playerResult);

                  if (brktGameNum === 3 && brktInfo.playerAmount > 0) {
                    totalAmt += brktInfo.playerAmount;
                  }
                  if (brktInfo.oppoGameScores.length === 0) {
                    brktInfo.oppoGameScores.push("");
                  }
                  if (brktInfo.oppoFullNames.length === 0) {
                    brktInfo.oppoFullNames.push("");
                  }

                  return (
                    <React.Fragment key={oneBrktId + playerId + brktGameNum}>
                      {brktInfo.oppoPlayerIds.map((oppoPlayerId, index) => (
                        <div
                          key={oneBrktId + oppoPlayerId + brktGameNum}
                          className="d-flex align-middle"
                        >
                          <Link
                            href={`/results/tmnt/${tmntId}/brackets/oneBrkt/${oneBrktId}`}
                            className="p-0"
                          >
                            {brktInfo.oppoGameScores[index] !== "" &&
                            playerGameScore !== "" ? (
                              <>
                                <span
                                  className={`${resultClass} d-inline-block text-center`}
                                  style={{ width: "1.5rem" }}
                                >
                                  {brktInfo.playerResult}
                                </span>
                                {index === 0 ? "" : "& "}
                                {brktInfo.oppoGameScores[index]}
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
                          &nbsp;{brktInfo.oppoFullNames[index]}
                          {brktInfo.playerAmount > 0 && (
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
    </>
  );
};

export default PlayerDivBrkts;
