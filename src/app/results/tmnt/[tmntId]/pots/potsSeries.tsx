import React from "react";
import { potPfType, tmntFullType } from "@/lib/types/types";
import { missingDataError } from "../brackets/player/[playerId]/playerBrktData";
import { getPlayerName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { tgrGameKey, tmntGameResult } from "@/lib/types/resultsTypes";
import { getGameNums } from "@/components/tmnts/games";
import { calcPrizes } from "@/lib/results/calcResults";
import { hasAmount } from "./potGames";
import { FIGURE_SPACE } from "@/lib/validation/constants";
import "./pots.css";

type potSeriesProps = {
  pot_id: string;
  tmntFullData: tmntFullType;
  tmntResults: tmntGameResult[];
  potPfs: potPfType[];
  numGames: number;
};

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const PotSeries = ({
  pot_id,
  tmntFullData,
  tmntResults,
  potPfs,
  numGames,
}: potSeriesProps) => {
  if (!pot_id) return missingDataError("No pot id");
  if (!tmntFullData) return missingDataError("No tournament data");
  if (!tmntResults) return missingDataError("No pot results rows");
  if (!potPfs) return missingDataError("No pot prize funds");
  if (!numGames) return missingDataError("No number of games");

  const pot = tmntFullData.pots.find((pot) => pot.id === pot_id);
  if (!pot) return missingDataError("Could not find pot. Id: " + pot_id);
  const div = tmntFullData.divs.find((div) => div.id === pot.div_id);
  if (!div) return missingDataError("Could not find div. Id: " + pot.div_id);

  const potPrizeFund = potPfs.filter((potPf) => potPf.pot_id === pot_id);
  if (potPrizeFund.length === 0) {
    return missingDataError("No pot prize fund");
  }
  const potPlayers = tmntFullData.potEntries.filter(
    (potEntry) => potEntry.pot_id === pot_id,
  );
  if (potPlayers.length === 0) {
    return missingDataError("No pot players");
  }
  const potPlayerIds = new Set(potPlayers.map((potPlayer) => potPlayer.player_id));

  // every saved prize fund has an amount; after this check TypeScript
  // knows amount is a number for every item in potPrizeFund
  if (!potPrizeFund.every(hasAmount)) {
    return missingDataError("Pot prize fund has no amount");
  }

  // calcPrizes needs the prize fund in position order (1st, 2nd, ...).
  // amounts never increase by position (checked when saved), so sorting
  // by amount, highest to lowest, gives position order
  potPrizeFund.sort((a, b) => b.amount - a.amount);

  const gameResults = tmntResults
    .filter((row) => row.div_id === div.id && potPlayerIds.has(row.player_id))
    .sort((a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0));

  // only calculate ties once at least one result has a score for the last game;
  // before that, show the prize fund amounts in position order.
  // after: one prize per paid row of gameResults, tied totals split the
  // prizes they cover
  const lastGameKey = tgrGameKey(numGames);
  const prizes: number[] = gameResults.some((r) => r[lastGameKey] != null)
    ? calcPrizes(gameResults, "total + Hdcp", potPrizeFund)
    : potPrizeFund.map((pf) => pf.amount);
  // only paid places get a payout row; no rows for 0 prizes
  const paidPrizes = prizes.filter((prize) => prize > 0);

  const gameNums = getGameNums(tmntResults);

  const nameWidth = 140;
  const payoutWidth = 90;
  const gameWidth = 40;
  const totalWidth = 70;

  return (
    <div className="d-flex justify-content-center">
      {/* scrolls sideways when the pot columns do not fit the page */}
      <div className="overflow-x-auto" data-testid="pots-columns-scroll">
        <div
          className="d-flex flex-nowrap align-items-start gap-2 pb-2"
          data-testid="pot-columns-row"
        >
          {/* player name */}
          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0"
            data-testid="pot-players"
          >
            <thead>
              <tr>
                <th className="text-start align-middle" style={{ width: nameWidth }}>
                  Name
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {gameResults.map((row) => {
                const name = getPlayerName(tmntFullData.players, row.player_id);
                return (
                  <tr key={row.player_id}>
                    <td className="text-start align-middle">
                      {/* one line per name so every table's rows line up;
                          a long name is cut with "..." and shown in full on hover */}
                      <div className="text-truncate" style={{ maxWidth: nameWidth }} title={name}>
                        {name}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* game scores table */}
          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0 pots-table"
            data-testid="pot-series-games"
          >
            <thead>
              <tr>
                {gameNums.map((gameNum) => (
                  <th
                    key={gameNum}
                    className="text-end align-middle game-header-align"
                    style={{ width: gameWidth }}
                  >
                    {gameNum}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {gameResults.map((row) => (
                <tr key={row.player_id}>
                  {gameNums.map((gameNum) => (
                    <td key={gameNum} className="text-end align-middle">
                      {row[`Game ${gameNum}`]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* total table */}
          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0"
            data-testid="pot-series-totals"
          >
            <thead>
              <tr>
                <th className="text-center align-middle" style={{ width: totalWidth }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {gameResults.map((row) => (
                <tr key={row.player_id}>
                  <td className="text-end align-middle text-nowrap">
                    {row["total + Hdcp"]}{FIGURE_SPACE}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* prizes table */}
          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0"
            data-testid="pot-payouts"
          >
            <thead>
              <tr>
                <th
                  className="text-end align-middle pe-3"
                  style={{ width: payoutWidth }}
                >
                  Total $
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {paidPrizes.map((prize, index) => (
                <tr key={`payout-${String(index)}`}>
                  <td className="text-end align-middle text-success pe-3">
                    {formatValueSymbSep2Dec(prize.toString(), localConfig)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PotSeries;
