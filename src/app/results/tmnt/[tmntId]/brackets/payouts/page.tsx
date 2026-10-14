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
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import { getPlayerName } from "@/lib/getName";
import BracketHeader, { type brktPageBtnType } from "../bracketHeader";
import { updateAllBracketMatches } from "../updateAllBracketMatches";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { brktType, divType } from "@/lib/types/types";
import { getBrktOrElimName } from "@/lib/getName";

export type brktPayoutTableRow = {
  player_id: string;
  last_first: string;
  brkt_id: string;
  amount: number;
  amountStr: string;
};

type PayoutBrktHeaderProps = {
  brkts: brktType[];
  divs: divType[];
  selectedBrktId: string;
  onSelect: (brktId: string) => void;
};

type ResultSort = "name" | "amount";

const PayoutBrktHeader = ({
  brkts,
  divs,
  selectedBrktId,
  onSelect,
}: PayoutBrktHeaderProps) => {
  return (
    <div
      className="btn-group btn-group-sm"
      role="group"
      aria-label="Select bracket"
    >
      <button
        type="button"
        className={`btn btn-outline-primary ${selectedBrktId === "all" ? "active" : ""}`}
        onClick={() => onSelect("all")}
      >
        All
      </button>
      {brkts.map((brkt) => (
        <button
          key={brkt.id}
          type="button"
          className={`btn btn-outline-primary ${selectedBrktId === brkt.id ? "active" : ""}`}
          onClick={() => onSelect(brkt.id)}
        >
          {getBrktOrElimName(brkt as brktType, divs || [])}
        </button>
      ))}
    </div>
  );
};

const BracketsPayoutsPage = () => {
  const params = useParams();
  const tmntId = params.tmntId as string;

  const dispatch = useDispatch<AppDispatch>();

  const [squadId, setSquadId] = useState("");

  const requestedResultsTmntId = useSelector(
    getOneTmntGameResultsRequestedTmntId,
  );
  const resultsLoadStatus = useSelector(getOneTmntGameResultsLoadStatus);
  const resultsError = useSelector(getOneTmntGameResultsError);
  const resultsTmntId = useSelector(getOneTmntGameResultsTmntId);
  const tmntResults = useSelector(selectOneTmntGameResults);

  const brktListRecords = useSelector(getBrktListRecords);

  const [mounted, setMounted] = useState(false);

  const [resultSort, setResultSort] = useState<ResultSort>("amount");
  const [selectedBrktId, setSelectedBrktId] = useState("all");  

  const tmntPageBtn: tmntPageBtnType = "Brackets";
  const selectedBrktPageBtn: brktPageBtnType = "Payouts";

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

  // set initial squad id after tournament data is loaded
  useEffect(() => {
    if (
      squadId === "" &&
      tmntFullData.tmnt.id === tmntId &&
      tmntFullData.squads.length > 0
    ) {
      setSquadId(tmntFullData.squads[0].id);
    }
  }, [squadId, tmntId, tmntFullData.tmnt.id, tmntFullData.squads]);

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
    dispatch,
  ]);

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  const brktPayoutTableRows = useMemo(() => {
    if (!hasTmntGamesData) return [];

    // bring matches up to date with the game results before reading earnings
    updateAllBracketMatches(brktListRecords, tmntResults);

    const rows: brktPayoutTableRow[] = [];
    Object.entries(brktListRecords).forEach(([brktId, brktList]) => {
      tmntFullData.brktEntries
        .filter((entry) => entry.brkt_id === brktId)
        .forEach((entry) => {
          const amount = brktList.playerEarnings(entry.player_id);
          rows.push({
            player_id: entry.player_id,
            last_first: getPlayerName(
              tmntFullData.players,
              entry.player_id,
              false,
            ),
            brkt_id: brktId,
            amount,
            amountStr: formatValueSymbSep2Dec(amount!.toString(), localConfig)
          });
        });
    });
    return rows;
  }, [
    hasTmntGamesData,
    brktListRecords,
    tmntResults,
    tmntFullData.players,
    tmntFullData.brktEntries,
  ]);

  const filterPayoutRows = useMemo(() => {
    if (brktPayoutTableRows.length === 0) return [];

    if (selectedBrktId === "all") {
      const totals = new Map<string, brktPayoutTableRow>();
      brktPayoutTableRows.forEach((row) => {
        const existing = totals.get(row.player_id);
        if (existing) existing.amount += row.amount;
        else totals.set(row.player_id, { ...row, brkt_id: "all" });
      });
      // filter out zero amounts, then format summed amounts
      const summedPayouts = Array.from(totals.values())
        .filter((row) => row.amount > 0)
        .map((row) => ({
          ...row,
          amountStr: formatValueSymbSep2Dec(row.amount.toString(), localConfig),
        }));
      return summedPayouts;
    } else {
      return brktPayoutTableRows.filter(
        (row) => row.brkt_id === selectedBrktId && row.amount > 0,
      );
    }
  }, [brktPayoutTableRows, selectedBrktId]);

  const displayRows = useMemo(() => {
    const copy = [...filterPayoutRows];
    return resultSort === "name"
      ? copy.sort((a, b) =>
          a.last_first.localeCompare(b.last_first, undefined, { sensitivity: "base" }))
      : copy.sort((a, b) => b.amount - a.amount || a.last_first.localeCompare(b.last_first));
  }, [filterPayoutRows, resultSort]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

  const failedForThisTmntGames =
    resultsLoadStatus === "failed" && requestedResultsTmntId === tmntId;

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

  const nameWidth = 140;
  const amountWidth = 120;

  return (
    <>
      <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />

      <div className="text-center mb-2">
        <BracketHeader tmntFullData={tmntFullData} selectedBrktPageBtn={selectedBrktPageBtn} />

        <PayoutBrktHeader
          brkts={tmntFullData.brkts}
          divs={tmntFullData.divs}
          selectedBrktId={selectedBrktId}
          onSelect={setSelectedBrktId}
        />
        
        <div className="d-flex justify-content-center">
          <div className="overflow-x-auto">
            {displayRows.length === 0
              ? (
                <div className="text-center pt-3">
                  <h5>No completed brackets</h5>
                </div>
              ) : (
                <table className="table table-sm table-striped table-hover w-auto">
                  <thead>
                    <tr>
                      <th className="text-start align-middle" style={{ width: nameWidth }}>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => setResultSort("name")}
                        >
                          Name
                        </button>
                      </th>
                      <th className="text-end align-middle" style={{ width: amountWidth }}>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => setResultSort("amount")}
                        >
                          Amount
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider small">
                    {displayRows.map((row) => (
                      <tr key={row.player_id}>
                        <td className="text-start align-middle ps-2">
                          <Link
                            href={`/results/tmnt/${tmntId}/brackets/player/${row.player_id}`}
                            className="p-0"
                          >
                            {row.last_first}
                          </Link>
                        </td>
                        <td className="text-end align-middle" style={{ width: amountWidth }}>
                          {row.amountStr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default BracketsPayoutsPage;
