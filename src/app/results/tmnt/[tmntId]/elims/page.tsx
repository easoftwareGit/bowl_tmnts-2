"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
  selectOneTmntGameResults,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import WaitModal from "@/components/modal/waitModal";
import TmntHomeHeader, {
  tmntPageBtnType,
} from "@/app/results/tmntHeader/tmntHomeHeader";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getBrktOrElimName } from "@/lib/getName";
import { divType, elimPfType, elimType } from "@/lib/types/types";
import {
  fetchElimPfs,
  getElimPfsError,
  getElimPfsLoadStatus,
  getElimPfsRequestedTmntId,
  getElimPfsTmntId,
  selectElimPfs,
} from "@/redux/features/elimPfs/elimPfsSlice";
import {
  buildElimResultsRows,
  elimResults,  
  getElimAdvancingScores,
} from "@/lib/results/elims/elimResults";
import ElimGame from "./elimGame";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import "./elims.css";

type ElimsHeaderProps = {
  elims: elimType[];
  divs: divType[];
  selectedElimId: string;
  onSelect: (elimId: string) => void;
};

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const ElimsHeader = ({
  elims,
  divs,
  selectedElimId,
  onSelect,
}: ElimsHeaderProps) => {
  return (
    <div
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Select elim"
    >
      {elims.map((elim) => (
        <button
          key={elim.id}
          type="button"
          className={`btn btn-outline-primary ${selectedElimId === elim.id ? "active" : ""}`}
          onClick={() => onSelect(elim.id)}
        >
          {getBrktOrElimName(elim as elimType, divs)}
        </button>
      ))}
    </div>
  );
};

type ElimsPrizeProps = {
  resultsFinal: boolean,
  row: elimResults,
  index: number
  justElimPfs: elimPfType[]
};

const ElimsPrize = ({
  resultsFinal,
  row,
  index,
  justElimPfs
}: ElimsPrizeProps) => {
  return (
    <>
      {resultsFinal ? (
        <>
          {row.prize != null
            ? formatValueSymbSep2Dec(
                row.prize.toString(),
                localConfig,
              )
            : ""}
        </>
      ) : (
        <>
          {index < justElimPfs.length &&
          justElimPfs[index].amount
            ? formatValueSymbSep2Dec(
                justElimPfs[index].amount.toString(),
                localConfig,
              )
            : ""}
        </>
      )}
    </>
  )
}

type ElimGameHeaderProps = {
  gameNum: number;
  advScore: number | undefined;
};

const ElimGameHeader = ({ gameNum, advScore }: ElimGameHeaderProps) => {
  if (advScore == null) return <>{gameNum}</>;

  return (
    <>
      {gameNum}
      <OverlayTrigger
        placement="top"
        delay={{ show: 250, hide: 400 }}
        overlay={
          <Tooltip id={`elim-game-${gameNum}-tooltip`}>
            Advancing score &gt;= {advScore}
          </Tooltip>
        }
      >      
        <span          
          className="text-primary"
          style={{ cursor: "help" }}
          tabIndex={0}
          aria-label={`Advancing score ${advScore} or more`}
        >
          &nbsp;*
        </span>
      </OverlayTrigger>
    </>
  );
};

const ElimsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const requestedResultsTmntId = useSelector(
    getOneTmntGameResultsRequestedTmntId,
  );
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);

  const requestedPrizesTmntId = useSelector(getElimPfsRequestedTmntId);
  const prizesTmntId = useSelector(getElimPfsTmntId);
  const prizesLoadStatus = useSelector(getElimPfsLoadStatus);
  const prizesError = useSelector(getElimPfsError);
  const elimPfs = useSelector(selectElimPfs);

  const [mounted, setMounted] = useState(false);

  const [selectedElimId, setSelectedElimId] = useState("");

  const tmntPageBtn: tmntPageBtnType = "Elims";

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

  const hasElims = hasTmntData && tmntFullData.elims.length > 0;

  // get tmnt results
  useEffect(() => {
    if (!hasElims) return;

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
    hasElims,
    tmntId,
    resultsTmntId,
    resultsLoadStatus,
    requestedResultsTmntId,
    dispatch,
  ]);

  // get elim prizes
  useEffect(() => {
    if (!hasElims) return;

    const needsElimPrizes = prizesTmntId !== tmntId;

    const failedForThisTmntPrizes =
      prizesLoadStatus === "failed" && requestedPrizesTmntId === tmntId;

    if (
      needsElimPrizes &&
      prizesLoadStatus !== "loading" &&
      !failedForThisTmntPrizes
    ) {
      dispatch(fetchElimPfs(tmntId));
    }
  }, [
    hasElims,
    prizesTmntId,
    tmntId,
    requestedPrizesTmntId,
    prizesLoadStatus,
    dispatch,
  ]);

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;
  const hasPrizesData = prizesTmntId !== "" && prizesTmntId === tmntId;

  /***********************************************/
  /* active elim: user's choice, else first elim */
  /***********************************************/

  // recalculated when selectedElimId changes, re-renders
  const elims = tmntFullData.elims;
  const activeElimId = elims.some((elim) => elim.id === selectedElimId)
    ? selectedElimId
    : (elims[0]?.id ?? "");
  const activeElim = elims.find((elim) => elim.id === activeElimId);
  const elimDiv = tmntFullData.divs.find(
    (div) => div.id === activeElim?.div_id,
  );
  const gotHdcp = (elimDiv?.hdcp_per ?? 0) > 0;

  /*****************************************/
  /* build all rows once, when data loads  */
  /*****************************************/
  const justElimPfs = useMemo(
    () => elimPfs.filter((pf) => pf.elim_id === activeElimId),
    [elimPfs, activeElimId],
  );

  const elimResultsRows = useMemo(() => {
    if (!hasTmntData || !hasTmntGamesData || !hasPrizesData) return [];
    return buildElimResultsRows(
      activeElimId,
      tmntFullData,
      tmntResults,
      justElimPfs,
    );
  }, [
    hasTmntData,
    hasTmntGamesData,
    hasPrizesData,
    activeElimId,
    tmntFullData,
    tmntResults,
    justElimPfs,
  ]);

  const advancingScores = useMemo(
    () =>
      activeElim
        ? getElimAdvancingScores(elimResultsRows, activeElim)
        : new Map<number, number>(),
    [elimResultsRows, activeElim],
  );

  const resultsFinal =
    elimResultsRows.length > 0 && elimResultsRows[0].position != null;
  const lastCashIndex = justElimPfs.length - 1;

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const failedForThisTmntGames =
    resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;

  const failedForThisTmntPrizes =
    prizesLoadStatus === "failed" && requestedPrizesTmntId === tmntId;

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

  // a tournament with no elims has nothing to show, so no results are needed
  if (tmntFullData.elims.length === 0) {
    return (
      <>
        <TmntHomeHeader
          tmntFullData={tmntFullData}
          selectedTmntPageBtn={tmntPageBtn}
        />
        <p className="text-center mt-3">
          No eliminators are available for this tournament.
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
        <h4>Unable to load tournament results</h4>
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

  if (!hasPrizesData && failedForThisTmntPrizes) {
    const errmsg =
      prizesError ||
      `An error occurred while loading prizes for tournament with id: ${tmntId}.`;

    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament prizes</h4>
        <p>{errmsg}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => dispatch(fetchElimPfs(tmntId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasPrizesData) {
    return <WaitModal show={mounted} message="Loading..." />;
  }

  const gameNums = activeElim
    ? Array.from({ length: activeElim.games }, (_, i) => activeElim.start + i)
    : [];
  const gameWidth = gotHdcp ? 135 : 60;
  const playerNameWidth = 140;
  const positionWidth = elimResultsRows.length > 100 ? 55 : 40;
  const prizeWidth = 85;

  if (!elimDiv) {
    const errMsg = "Division data for active eliminator not found";
    return (
      <>
        <TmntHomeHeader
          tmntFullData={tmntFullData}
          selectedTmntPageBtn={tmntPageBtn}
        />
        <p className="text-center mt-3">{errMsg}</p>
      </>
    );
  }

  return (
    <>
      <TmntHomeHeader
        tmntFullData={tmntFullData}
        selectedTmntPageBtn={tmntPageBtn}
      />

      <div className="text-center mb-2">
        {activeElim && (
          <>
            <ElimsHeader
              elims={tmntFullData.elims}
              divs={tmntFullData.divs}
              selectedElimId={activeElimId}
              onSelect={setSelectedElimId}
            />

            <div className="d-flex justify-content-center">
              <div className="tmnt_table overflow-x-auto">
                <table className="table table-sm table-striped table-hover w-auto fs-6">
                  <thead>
                    <tr>
                      <th
                        className="text-start align-middle"
                        style={{ width: positionWidth }}
                      >
                        &nbsp;
                      </th>
                      <th
                        className="text-start align-middle"
                        style={{ width: playerNameWidth }}
                      >
                        Name
                      </th>
                      {gameNums.map((gameNum) => (
                        <th
                          key={gameNum}
                          className="text-center align-middle"
                          style={{ width: gameWidth }}
                        >
                          <ElimGameHeader
                            gameNum={gameNum}
                            advScore={advancingScores.get(gameNum)}
                          />
                        </th>
                      ))}
                      <th
                        className="text-end align-middle"
                        style={{ width: prizeWidth }}
                      >
                        Prize
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider small">
                    {elimResultsRows.map((row, index) => (
                      <tr
                        key={row.player_id}
                        className={index === lastCashIndex ? "cut-row" : ""}
                      >
                        <td className="text-center align-middle">
                          {row.position}
                        </td>
                        <td className="text-start align-middle">
                          <Link
                            href={`/results/tmnt/${tmntId}/standings/div/${elimDiv!.id}/player/${row.player_id}`}
                            className="p-0"
                          >
                            {row.full_name}
                          </Link>
                        </td>
                        {gameNums.map((gameNum) => (
                          <td key={gameNum} className="align-middle">
                            <ElimGame
                              row={row}
                              elimDiv={elimDiv!}
                              gameNum={gameNum}
                            />
                          </td>
                        ))}
                        <td className="text-end align-middle">
                          <ElimsPrize
                            resultsFinal={resultsFinal}
                            row={row}
                            justElimPfs={justElimPfs}
                            index={index}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ElimsPage;
