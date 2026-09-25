"use client";

import { useState } from "react";
import { tmntGameResult, tmntStandingsTableRow } from "@/lib/types/resultsTypes";
import { divDataType, divPfType } from "@/lib/types/types";
import { populateStandingsRows } from "./populateStandingsRows";
import { getGameNums } from "@/components/tmnts/games";
import Link from "next/link";
import "./tmntStandings.css";

type ResultSort =
  | "player"
  | "scratch" 
  | "total";

/**
 * Calculate the width of the "Prize" column
 *
 * @param {divPfType[]} justDivPfs - just this division's prize funds
 * @return {number} - width of the "Prize" column in pixels
 */
const calcPrizeColWidth = (justDivPfs: divPfType[]): number => {
  if (
    !justDivPfs ||
    !Array.isArray(justDivPfs) ||
    justDivPfs.length === 0 ||
    !justDivPfs[0].amount
  )
    return 90;

  if (justDivPfs[0].amount < 1000) return 90;
  if (justDivPfs[0].amount < 10000) return 130;
  return 180;
};

interface ChildProps {
  tmntId: string;
  div: divDataType;
  tmntResults: tmntGameResult[];
  divPfs: divPfType[];
}

const TmntStandingsForm: React.FC<ChildProps> = ({
  tmntId,
  div,
  tmntResults,
  divPfs,
}) => {

  const [resultSort, setResultSort] = useState<ResultSort>("total");

  const gameNums = getGameNums(tmntResults);
  const justDiv = tmntResults.filter((result) => result.div_id === div.id);
  const gotHdcp = div.hdcp_per > 0;
  const justDivPfs = divPfs.filter((pf) => pf.div_id === div.id);  
  const standingsRows = populateStandingsRows(justDiv, justDivPfs);
  const lastCashRow = justDivPfs.length - 1;  

  /**
   * Sorts the standings rows by total_plus_total_hdcp.
   *
   * Sort order:
   * 1. total_plus_total_hdcp
   * 2. full_name
   * 
   * @param {tmntStandingsTableRow[]} standingsRows - standings rows to sort.
   * @returns {tmntStandingsTableRow[]} - sorted standings rows.
   */
  const sortStandingsByTotal = (
    standingsRows: tmntStandingsTableRow[],
  ): tmntStandingsTableRow[] => {
    // sort by total_plus_total_hdcp, then full name
    return standingsRows.sort(
      (a, b) =>
        (b.total_plus_total_hdcp) - (a.total_plus_total_hdcp) ||
        a.full_name.localeCompare(b.full_name, undefined, {
          sensitivity: "base",
        })
    );
  };

  /**
   * Sorts the standings rows by total.
   *
   * Sort order:
   * 1. total
   * 2. total_plus_total_hdcp
   * 3. full_name
   * 
   * @param {tmntStandingsTableRow[]} standingsRows - standings rows to sort.
   * @returns {tmntStandingsTableRow[]} - sorted standings rows.
   */
  const sortStandingByScratch = (
    standingsRows: tmntStandingsTableRow[],
  ): tmntStandingsTableRow[] => {
    // sort by last name, then first name, then lane, then average
    return standingsRows.sort(
      (a, b) =>
        (b.total ?? 0) - (a.total ?? 0) ||
        (b.total_plus_total_hdcp) - (a.total_plus_total_hdcp) ||
        a.full_name.localeCompare(b.full_name, undefined, {
          sensitivity: "base",
        })
    );
  };

  /**
   * Sorts the standings rows by full name.
   *
   * Sort order:
   * 1. full_name
   * 2. total_plus_total_hdcp
   * 
   * @param {tmntStandingsTableRow[]} standingsRows - The tournament result data rows to sort.
   * @returns {tmntStandingsTableRow[]} The sorted tournament result data rows.
   */
  const sortStandingsByPlayer = (
    standingsRows: tmntStandingsTableRow[],
  ): tmntStandingsTableRow[] => {
    // sort by last name, then first name, then lane, then average
    return standingsRows.sort(
      (a, b) =>
        a.full_name.localeCompare(b.full_name, undefined, {
          sensitivity: "base",
        }) ||
        (b.total_plus_total_hdcp) - (a.total_plus_total_hdcp)        
    );
  };

  switch (resultSort) {
    case "player":
      sortStandingsByPlayer(standingsRows);
      break;

    case "scratch":
      sortStandingByScratch(standingsRows);
      break;

    case "total":
      sortStandingsByTotal(standingsRows);
      break;
    
    default:
      sortStandingsByTotal(standingsRows);
      break;
  }

  const gameWidth = 45;
  const playerNameWidth = 150;
  const plusMinusWidth = 55;
  const positionWidth = tmntResults.length > 100 ? 55 : 40;
  const prizeWidth = calcPrizeColWidth(justDivPfs);
  const scratchWidth = 75;
  const totalWidth = 65;

  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="tmnt_table overflow-x-auto">
          <table className="table table-sm table-striped table-hover w-auto">
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
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setResultSort("player")}
                  >
                    Player
                  </button>                  
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
                  <th
                    className="text-end align-middle"
                    style={{ width: scratchWidth }}
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={() => setResultSort("scratch")}
                    >
                      Scratch
                    </button>                    
                  </th>
                )}
                <th
                  className="text-end align-middle"
                  style={{ width: totalWidth }}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setResultSort("total")}
                  >
                    Total
                  </button>                  
                </th>
                {!gotHdcp && (
                  <th
                    className="text-end align-middle"
                    style={{ width: plusMinusWidth }}
                  >
                    +/-
                  </th>
                )}                
                <th
                  className="text-end align-middle"
                  style={{ width: prizeWidth }}
                >
                  Prize
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {standingsRows.map((row, index) => (
                <tr
                  key={row.player_id}
                  className={index === lastCashRow ? "cut-row" : ""}
                >
                  <td className="text-center align-middle">{row.position}</td>
                  <td className="text-start align-middle">{row.full_name}</td>

                  {gameNums.map((gameNum) => (
                    <td key={gameNum} className="text-end align-middle">
                      {row[`Game ${gameNum}`]}
                    </td>
                  ))}

                  {gotHdcp && (
                    <td className="text-end align-middle">{row.total}</td>
                  )}

                  <td className="text-end align-middle">
                    <Link
                      href={`/results/tmnt/${tmntId}/standings/div/${div.id}/player/${row.player_id}`}
                      className="p-0"
                    >
                      {/* ok to use total_plus_total_hdcp, 
                          for scratch, will be same as total */}
                      {row.total_plus_total_hdcp}
                    </Link>                    
                  </td>

                  {!gotHdcp && (
                    <td className="text-end align-middle">{row.plus_minus}</td>
                  )}

                  <td className="text-end align-middle">{row.prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TmntStandingsForm;
