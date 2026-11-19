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
import { getPlayerName, getBrktOrElimName } from "@/lib/getName";
import BracketHeader, { type brktPageBtnType } from "../bracketHeader";
import { updateAllBracketMatches } from "../updateAllBracketMatches";
import { missingDataError } from "../player/[playerId]/playerBrktData";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { truncateToTwoDecimals } from "@/lib/currency/convert";
import { brktType, divType } from "@/lib/types/types";

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

// dollars rounded down to two decimals, as whole cents (35 / 3 -> 1166)
const toTruncatedCents = (dollars: number): number =>
  Math.round(truncateToTwoDecimals(dollars) * 100);

const formatCents = (cents: number): string =>
  formatValueSymbSep2Dec((cents / 100).toString(), localConfig);

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
        aria-pressed={selectedBrktId === "all"}
        onClick={() => {
          onSelect("all");
        }}
      >
        All
      </button>
      {brkts.map((brkt) => (
        <button
          key={brkt.id}
          type="button"
          className={`btn btn-outline-primary ${selectedBrktId === brkt.id ? "active" : ""}`}
          aria-pressed={selectedBrktId === brkt.id}
          onClick={() => {
            onSelect(brkt.id);
          }}
        >
          {getBrktOrElimName(brkt, divs)}
        </button>
      ))}
    </div>
  );
};

const BracketsPayoutsPage = () => {
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

  // a tournament with no brackets has nothing to show, so its results are not
  // needed. While the tournament is still loading the results are fetched
  // anyway, so the two requests run side by side.
  const tmntHasNoBrackets = hasTmntData && tmntFullData.brkts.length === 0;

  // get tmnt results
  useEffect(() => {
    if (tmntHasNoBrackets) return;

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
    tmntHasNoBrackets,
    tmntId,
    resultsTmntId,
    resultsLoadStatus,
    requestedResultsTmntId,
    dispatch,
  ]);

  const hasTmntGamesData = resultsTmntId !== "" && resultsTmntId === tmntId;

  // every bracket has a bracket list, so a bracket without one is a bug
  const missingListBrkt = hasTmntData
    ? tmntFullData.brkts.find((brkt) => !(brkt.id in brktListRecords))
    : undefined;

  // rows for the brackets whose lists are complete. Earnings are only read
  // from a list once every bracket in it is complete. Amounts are rounded
  // down to the cent, so they match the single bracket page.
  const { brktPayoutTableRows, completeBrktIds } = useMemo(() => {
    const rows: brktPayoutTableRow[] = [];
    const completeIds = new Set<string>();
    if (!hasTmntData || !hasTmntGamesData) {
      return { brktPayoutTableRows: rows, completeBrktIds: completeIds };
    }

    // bring matches up to date with the game results before reading earnings
    updateAllBracketMatches(brktListRecords, tmntResults);

    Object.entries(brktListRecords).forEach(([brktId, brktList]) => {
      if (!brktList.allBracketsCompleted()) return;
      completeIds.add(brktId);
      tmntFullData.brktEntries
        .filter((entry) => entry.brkt_id === brktId)
        .forEach((entry) => {
          const cents = toTruncatedCents(brktList.playerEarnings(entry.player_id));
          rows.push({
            player_id: entry.player_id,
            last_first: getPlayerName(
              tmntFullData.players,
              entry.player_id,
              false,
            ),
            brkt_id: brktId,
            amount: cents / 100,
            amountStr: formatCents(cents),
          });
        });
    });
    return { brktPayoutTableRows: rows, completeBrktIds: completeIds };
  }, [
    hasTmntData,
    hasTmntGamesData,
    brktListRecords,
    tmntResults,
    tmntFullData.players,
    tmntFullData.brktEntries,
  ]);

  const filterPayoutRows = useMemo(() => {
    if (brktPayoutTableRows.length === 0) return [];

    if (selectedBrktId === "all") {
      // add up whole cents, so the total is the sum of the amounts shown on
      // each bracket ($11.66 + $11.66 = $23.32)
      const totalCents = new Map<string, number>();
      const firstRows = new Map<string, brktPayoutTableRow>();
      brktPayoutTableRows.forEach((row) => {
        const cents = Math.round(row.amount * 100);
        totalCents.set(row.player_id, (totalCents.get(row.player_id) ?? 0) + cents);
        if (!firstRows.has(row.player_id)) firstRows.set(row.player_id, row);
      });
      const summedPayouts: brktPayoutTableRow[] = [];
      firstRows.forEach((row, playerId) => {
        const cents = totalCents.get(playerId) ?? 0;
        if (cents <= 0) return;
        summedPayouts.push({
          ...row,
          brkt_id: "all",
          amount: cents / 100,
          amountStr: formatCents(cents),
        });
      });
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
      : copy.sort((a, b) =>
          b.amount - a.amount ||
          a.last_first.localeCompare(b.last_first, undefined, { sensitivity: "base" }));
  }, [filterPayoutRows, resultSort]);

  /*********************************************/
  /* render loading/error until data is loaded */
  /*********************************************/

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

  // a tournament with no brackets has nothing to show, so no results are needed
  if (tmntHasNoBrackets) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        <div className="text-center mt-3">
          <h5>No brackets are available for this tournament.</h5>
        </div>
      </>
    );
  }

  if (!hasTmntGamesData && failedForThisTmntGames) {
    const errmsg =
      resultsError ||
      `An error occurred while loading game results for tournament with id: ${tmntId}.`;

    return (
      <div className="text-center mt-5">
        <h4>Unable to load tournament game results</h4>
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

  if (missingListBrkt) {
    return (
      <>
        <TmntHomeHeader tmntFullData={tmntFullData} selectedTmntPageBtn={tmntPageBtn} />
        {missingDataError(
          `Bracket list with bracket definition id ${missingListBrkt.id} not found.`,
        )}
      </>
    );
  }

  // names of the brackets left out of the totals because they are not complete
  const notCompleteNames = tmntFullData.brkts
    .filter((brkt) => !completeBrktIds.has(brkt.id))
    .map((brkt) => getBrktOrElimName(brkt, tmntFullData.divs));

  const selectedNotComplete =
    selectedBrktId !== "all" && !completeBrktIds.has(selectedBrktId);

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

        {selectedBrktId === "all" && notCompleteNames.length > 0 && (
          <p className="small text-muted mt-2 mb-0">
            Not complete, not included: {notCompleteNames.join(", ")}
          </p>
        )}

        <div className="d-flex justify-content-center">
          <div className="overflow-x-auto">
            {selectedNotComplete ? (
              <div className="text-center pt-3">
                <h5>Bracket not complete</h5>
              </div>
            ) : displayRows.length === 0 ? (
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
                        onClick={() => {
                          setResultSort("name");
                        }}
                      >
                        Name
                      </button>
                    </th>
                    <th className="text-end align-middle" style={{ width: amountWidth }}>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none fw-semibold"
                        onClick={() => {
                          setResultSort("amount");
                        }}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BracketsPayoutsPage;
