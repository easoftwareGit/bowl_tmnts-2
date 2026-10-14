import React from "react";
import { potResultsRowType } from "./potResults";
import { potPfType, tmntFullType } from "@/lib/types/types";
import { missingDataError } from "../brackets/player/[playerId]/playerBrktData";
import { getPlayerName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { tmntGameResult } from "@/lib/types/resultsTypes";
import { getGameNums } from "@/components/tmnts/games";

type potGameProps = {
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

type playerNameWithScoreProps = {
  row: tmntGameResult;
};

const PotSeries = ({
  pot_id,
  tmntFullData,
  tmntResults,
  potPfs,
  numGames,
}: potGameProps) => {
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
  if (!potPrizeFund || potPrizeFund.length === 0) {
    return missingDataError("No pot prize fund");
  }  
  const potPlayers = tmntFullData.potEntries.filter(
    (potEntry) => potEntry.pot_id === pot_id,
  );
  if (!potPlayers || potPlayers.length === 0) {
    return missingDataError("No pot players");
  }
  const potPlayerIds = new Set(potPlayers.map((potPlayer) => potPlayer.player_id));

  // sort by amount, highest to lowest
  potPrizeFund.sort((a, b) => {
    if (a.amount === null || b.amount === null) {
      return 0;
    }
    return b.amount! - a.amount!;
  });

  const gameResults = tmntResults
    .filter((row) => {potPlayerIds.has(row.player_id)})
    .sort((a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0));

  const gameNums = getGameNums(tmntResults);
  
  const PlayerNameWithScore = ({row}: playerNameWithScoreProps) => {
    return (
      <div className="d-flex align-items-center">
        <span>
          {getPlayerName(tmntFullData.players, row.player_id)}
        </span>
        <span className="ms-auto ps-2 text-nowrap">
          {row["total + Hdcp"]}
        </span>
      </div>
    )
  }

  const payoutWidth = 100;
  const gameWidth = 40;

  return (
    <div data-testid="PotsOuterWrapper" className="pots-outer">
      <div data-testid="PotsInnerWrapper" className="pots-inner">
        {/* scrolls sideways when the pot columns do not fit the page */}
        <div className="overflow-x-auto" data-testid="brkt-columns-scroll">
          <div
            className="d-flex flex-nowrap align-items-start gap-2 pb-2"
            data-testid="pot-columns-row"
          >
            {/* game scores table */}
            <table
              key={numGames}
              className="table table-sm table-striped table-hover w-auto shrink-0"
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

            {/* player name and total table */}
            <table
              key={numGames}
              className="table table-sm table-striped table-hover w-auto shrink-0"
              data-testid="pot-series-games"
            >
              <thead>
                <tr>
                  <td className="text-center align-middle">
                    Total
                  </td>
                </tr>
              </thead>
              <tbody className="table-group-divider small">
                {gameResults.map((row) => (
                  <tr key={row.player_id}>
                    <td className="align-middle">
                      <PlayerNameWithScore row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* prizes table */}
            <table className="table table-sm table-striped table-hover w-auto shrink-0">
              <thead>
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: payoutWidth }}
                  >
                    Total $
                  </th>
                </tr>
              </thead>
              <tbody className="table-group-divider small">
                {potPrizeFund.map((potPrize) => (
                  <tr key={potPrize.id}>
                    <td className="text-center align-middle text-success">
                      {formatValueSymbSep2Dec(
                        (potPrize.amount!).toString(),
                        localConfig,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotSeries;