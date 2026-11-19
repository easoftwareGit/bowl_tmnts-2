import React from "react";
import { potLastGameResults, potResultsRowType } from "../../../../../lib/results/pots/potResults";
import { potPfType, tmntFullType } from "@/lib/types/types";
import { missingDataError } from "../brackets/player/[playerId]/playerBrktData";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { calcPrizes } from "@/lib/results/calcResults";
import PlayerNameWithScore from "./playerNameWithScore";
import { potHdcpGameWidth, potNoHdcpGameWidth, potPayoutWidth, hasAmount } from "./potGames";

type potLastGameProps = {
  pot_id: string;
  tmntFullData: tmntFullType;
  potResultsRows: potResultsRowType[];
  potPfs: potPfType[];
  numGames: number;
};

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

const PotLastGame = ({
  pot_id,
  tmntFullData,
  potResultsRows,
  potPfs,
  numGames,
}: potLastGameProps) => {
  if (!pot_id) return missingDataError("No pot id");
  if (!tmntFullData) return missingDataError("No tournament data");
  if (!potResultsRows) return missingDataError("No pot results rows");
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

  // every saved prize fund has an amount; after this check TypeScript
  // knows amount is a number for every item in potPrizeFund
  if (!potPrizeFund.every(hasAmount)) {
    return missingDataError("Pot prize fund has no amount");
  }

  // calcPrizes needs the prize fund in position order (1st, 2nd, ...).
  // amounts never increase by position (checked when saved), so sorting
  // by amount, highest to lowest, gives position order
  potPrizeFund.sort((a, b) => b.amount - a.amount);

  // last game rows, highest scoreWithHdcp first
  const lastGameResults = potLastGameResults(pot_id, tmntFullData, potResultsRows, numGames);

  // only calculate ties once at least one player has a score for the last game;
  // before that, show the prize fund amounts in position order.
  // after: one prize per row of lastGameResults, tied scores split the prizes
  // they cover, rows past the last paid position get no prize
  const prizes: number[] = lastGameResults.some((row) => row.score != null)
    ? calcPrizes(lastGameResults, "scoreWithHdcp", potPrizeFund)
    : potPrizeFund.map((pf) => pf.amount);
  // only paid places get a row: no rows for players past the last paid
  // position, or for a prize of 0. Amounts never increase, so a 0 can only
  // be at the end and the paid rows still line up with the player rows
  const paidPrizes = prizes.filter((prize) => prize > 0);

  const gameWidth = (div.hdcp_per > 0) ? potHdcpGameWidth : potNoHdcpGameWidth;

  return (
    <div className="d-flex justify-content-center">
      {/* scrolls sideways when the pot columns do not fit the page */}
      <div className="overflow-x-auto" data-testid="pots-columns-scroll">
        <div
          className="d-flex flex-nowrap align-items-start gap-2 pb-2"
          data-testid="pot-columns-row"
        >
          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0"
            data-testid="pot-payouts"
          >
            <thead>
              <tr>
                <th
                  className="text-center align-middle"
                  style={{ width: potPayoutWidth }}
                >
                  Game $
                </th>
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {paidPrizes.map((prize, index) => (
                <tr key={`payout-${String(index)}`}>
                  <td className="text-center align-middle text-success">
                    {formatValueSymbSep2Dec(prize.toString(), localConfig)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <table
            className="table table-sm table-striped table-hover w-auto flex-shrink-0"
            data-testid="pot-last-game"
          >
            <thead>
              <tr>
                <th className="text-center align-middle">Game {numGames}</th>
              </tr>
            </thead>
            <tbody className="table-group-divider small">
              {lastGameResults.map((row) => (
                <tr key={row.player_id}>
                  <td
                    className="align-middle"
                    style={{ width: gameWidth }}
                  >
                    <PlayerNameWithScore
                      row={row}
                      tmntFullData={tmntFullData}
                      div={div}
                    />
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

export default PotLastGame;
