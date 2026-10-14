import React from "react";
import { potResultsRowType } from "./potResults";
import { potPfType, tmntFullType } from "@/lib/types/types";
import { missingDataError } from "../brackets/player/[playerId]/playerBrktData";
import { getPlayerName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";

type potGameProps = {
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

type playerNameWithScoreProps = {
  row: potResultsRowType;
};

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

  // game numbers 1..numGames
  const gameNums = Array.from({ length: numGames }, (_, i) => i + 1);

  // for each game: rows for this game and pot, highest scoreWithHdcp first
  const gameResults = gameNums.map((gameNum) => ({
    gameNum,
    rows: potResultsRows
      .filter(
        (row) => row.gameNum === gameNum && potPlayerIds.has(row.player_id),
      )
      .sort((a, b) => (b.scoreWithHdcp ?? 0) - (a.scoreWithHdcp ?? 0)),
  }));  

  const PlayerNameWithScore = ({row}: playerNameWithScoreProps) => {
    return (
      <div className="d-flex align-items-center">
        <span>{getPlayerName(tmntFullData.players, row.player_id)}</span>
        <span className="ms-auto ps-2 text-nowrap">
          {row.scoreWithHdcp}
          {div.hdcp_per > 0 && row.score != null &&  (
            <span className="small">
              {" "}({row.score} + {row.hdcp})
            </span>
          )}
        </span>
      </div>
    )
  }

  const payoutWidth = 80;
  const gameWidth = (div.hdcp_per > 0) ? 240 : 180;

  return (
    <div className="d-flex justify-content-center">
      <div className="overflow-x-auto">
        {/* scrolls sideways when the pot columns do not fit the page */}
        <div className="overflow-x-auto" data-testid="pots-columns-scroll">
          <div
            className="d-flex flex-nowrap align-items-start gap-2 pb-2"
            data-testid="pot-columns-row"
          >
            <table className="table table-sm table-striped table-hover w-auto">
              <thead>
                <tr>
                  <th
                    className="text-center align-middle"
                    style={{ width: payoutWidth }}
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
                        (potPrize.amount!).toString(),
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
                className="table table-sm table-striped table-hover w-auto shrink-0"
                data-testid={`pot-game-${gameNum}`}
              >
                <thead>
                  <tr>
                    <th className="text-center align-middle">Game {gameNum}</th>
                  </tr>
                </thead>
                <tbody className="table-group-divider small">
                  {rows.map((row) => (
                    <tr key={row.player_id}>
                      <td
                        className="align-middle"
                        style={{ width: gameWidth }}
                      >
                        <PlayerNameWithScore row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PotGames;