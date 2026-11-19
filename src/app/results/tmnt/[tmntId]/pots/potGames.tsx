import React from "react";
import { potGameResults, potResultsRowType } from "../../../../../lib/results/pots/potResults";
import { potPfType, tmntFullType } from "@/lib/types/types";
import { missingDataError } from "../brackets/player/[playerId]/playerBrktData";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import PlayerNameWithScore from "./playerNameWithScore";

type potGameProps = {
  pot_id: string;
  tmntFullData: tmntFullType;
  potResultsRows: potResultsRowType[];
  potPfs: potPfType[];
  numGames: number;
};

export const potPayoutWidth = 90;
export const potHdcpGameWidth = 240;
export const potNoHdcpGameWidth = 180;

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: "en-US",
};
const localConfig = getLocaleConfig(ic);
localConfig.prefix = "$";

export const hasAmount = (potPf: potPfType): potPf is potPfType & { amount: number } =>
  potPf.amount !== null;

const PotGames = ({
  pot_id,
  tmntFullData,
  potResultsRows,
  potPfs,
  numGames,
}: potGameProps) => {
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

  // sort by amount, highest to lowest
  potPrizeFund.sort((a, b) => b.amount - a.amount);

  const gameResults = potGameResults(pot_id, tmntFullData, potResultsRows, numGames);

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
              {potPrizeFund.map((potPrize) => (
                <tr key={potPrize.id}>
                  <td className="text-center align-middle text-success">
                    {formatValueSymbSep2Dec(
                      potPrize.amount.toString(),
                      localConfig,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {gameResults.map(({ gameNum, rows }) => (
            <table
              key={gameNum}
              className="table table-sm table-striped table-hover w-auto flex-shrink-0"
              data-testid={`pot-game-${gameNum}`}
            >
              <thead>
                <tr>
                  <th 
                    className="text-center align-middle"
                    style={{ width: gameWidth }}
                  >
                    Game {gameNum}
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider small">
                {rows.map((row) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default PotGames;
