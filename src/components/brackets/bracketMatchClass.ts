import { bracketPlayerType } from "@/lib/types/types";
import { Bracket } from "./bracketClass";
import type { GameScoreMap, PlayerBracketMap } from "./bracketMaps";
import { getGameScoreKey } from "./bracketMaps";

type brktPosInMatchType = 0 | 1; // top or bottom position

// match numbers:
// 0\
//   4
// 1/ \
//     6
// 2\ /
//   5
// 3/
//
// 0-3 - game 1
// 4-5 - game 2
// 6   - game 3

export type matchNumberType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type matchResultType = "W" | "L" | "T" | undefined;

export type matchSeedInfoType = {
  playerId: string;
  first_name: string;
  last_name: string;
  average: number | undefined;
  score: number | undefined;
  hdcp: number | undefined;
  total: number | undefined;
  result: matchResultType;
};

const byePlayerInfo: bracketPlayerType = {
  id: "bye_00000000000000000000000000000000",
  first_name: "Bye",
  last_name: "",
  average: 0,
  hdcp: 0,
};

export class BracketMatch {
  private _gameScoreMap: GameScoreMap;
  private _playerMap: PlayerBracketMap;
  private _parent: Bracket;

  constructor(parent: Bracket) {
    this._parent = parent;
    if (!parent) throw new Error("parent is null");
    if (!parent.parent) throw new Error("parent.parent is null");
    if (!parent.parent.gameScoreMap)
      throw new Error("parent.parent.gameScoreMap is null");
    this._gameScoreMap = parent.parent.gameScoreMap;
    if (!parent.parent.playerMap)
      throw new Error("parent.parent.playerMap is null");
    this._playerMap = parent.parent.playerMap;
  }

  get gameScoreMap(): GameScoreMap {
    return this._gameScoreMap;
  }
  get playerMap(): PlayerBracketMap {
    return this._playerMap;
  }
  get parent(): Bracket {
    return this._parent;
  }

  /**
   * Get the game score for a player in a match
   *
   * @param {string} playerId - player id
   * @param {number} gameNum - game number
   * @return {(number | undefined)} - game score for player in match or undefined
   */
  private gameScore(playerId: string, gameNum: number): number | undefined {
    if (!playerId || !gameNum) return undefined;
    if (playerId.startsWith("bye")) return 0; // bye player will have no score, return 0
    return this._gameScoreMap.get(getGameScoreKey(playerId, gameNum));
  }

  /**
   * gets the match number of the prior match
   *
   * @param {matchNumberType} matchNumber - current match number
   * @param {brktPosInMatchType} position - position in current match
   * @return {matchNumberType}  - match number of prior match
   */
  private getPriorMatch(
    matchNumber: matchNumberType,
    position: brktPosInMatchType,
  ): matchNumberType {
    if (matchNumber === 4) {
      return position === 0 ? 0 : 1;
    }
    if (matchNumber === 5) {
      return position === 0 ? 2 : 3;
    }
    if (matchNumber === 6) {
      return position === 0 ? 4 : 5;
    }

    throw new Error(`Match ${matchNumber} has no prior match.`);
  }

  /**
   * Get the game number for a match
   *
   * @param {matchNumberType} matchNumber - match number
   * @return {number} - game number
   */
  private getMatchGameNum(matchNumber: matchNumberType): number {
    if (matchNumber <= 3) {
      return 1;
    }
    if (matchNumber <= 5) {
      return 2;
    }
    return 3;
  }

  /**
   * Check if a match is completed
   *
   * @param {matchSeedInfoType} matchScore - match score
   * @return {boolean} - true if match is completed
   */
  private isCompletedMatchScore = (matchScore: matchSeedInfoType): boolean => {
    return matchScore.score !== undefined && matchScore.total !== undefined;
  };

  /**
   * Get the handicap for a player
   *
   * @param {string} playerId - player id
   * @return {number} - player's handicap
   */
  private playerHdcp(playerId: string): number {
    if (!playerId || playerId.startsWith("bye")) return 0;
    return this._playerMap.get(playerId)?.hdcp || 0;
  }

  /**
   * Get the players for a position in a match
   * even though matches 0-3 will only return 1 player per position,
   * matches 4-6 can return multiple players per position beacuse of ties
   *
   * @param {matchNumberType} matchNumber - match number
   * @param {brktPosInMatchType} position - position in match
   * @return {string[]} - player ids for position in match
   */
  getPlayersForPosition(
    matchNumber: matchNumberType,
    position: brktPosInMatchType,
  ): string[] {
    // Matches 0-3 contain the original seeded players.
    if (matchNumber <= 3) {
      const playerIndex = matchNumber * 2 + position;

      const playerId = this._parent.players[playerIndex];

      return playerId === undefined ? [] : [playerId];
    }

    // Matches 4-6 receive players from one prior match.
    const priorMatch = this.getPriorMatch(matchNumber, position);

    const priorMatchPlayers = [
      ...this.getPlayersForPosition(priorMatch, 0),
      ...this.getPlayersForPosition(priorMatch, 1),
    ];

    return this.matchWinner(
      priorMatchPlayers,
      this.getMatchGameNum(priorMatch),
    );
  }

  getMatchPlayers(matchNumber: matchNumberType): string[] {
    return [
      ...this.getPlayersForPosition(matchNumber, 0),
      ...this.getPlayersForPosition(matchNumber, 1),
    ];
  }

  /**
   * Get the player info and match scores for a match
   *
   * @param {string[]} matchPlayers - players in match
   * @param {number} gameNum - game number
   * @return {matchSeedInfoType[]} - match scores for players in match
   */
  getMatchInfo(matchPlayers: string[], gameNum: number): matchSeedInfoType[] {
    const matchScores: matchSeedInfoType[] = [];
    matchPlayers.forEach((playerId) => {
      const gScore = playerId.startsWith("bye")
        ? 0
        : this.gameScore(playerId, gameNum);
      const playerInfo = playerId.startsWith("bye")
        ? {
            ...byePlayerInfo,
            id: playerId,
          }
        : this._playerMap.get(playerId);
      const matchScore: matchSeedInfoType = {
        playerId: playerId,
        first_name: "",
        last_name: "",
        average: undefined,
        score: undefined,
        hdcp: undefined,
        total: undefined,
        result: undefined,        
      }
      if (!(gScore == null)) { 
        matchScore.score = gScore;
      }
      if (!(playerInfo == null)) {
        matchScore.first_name = playerInfo.first_name || "";
        matchScore.last_name = playerInfo.last_name || "";
        matchScore.average = playerInfo.average;
        matchScore.hdcp = this.playerHdcp(playerId);
      }
      if (!(gScore == null) && !(playerInfo == null)) {
        matchScore.total = gScore + this.playerHdcp(playerId)
      }
      matchScores.push(matchScore);
    });
    return matchScores;
  }

  setMatchResult(matchScores: matchSeedInfoType[]) {
    if (matchScores.length === 0) {
      return [];
    }
    if (!matchScores.every(this.isCompletedMatchScore)) {
      return [];
    }
    // !matchScores.every(this.isCompletedMatchScore)
    // confirms that every player has a score and total
    const highestScore = Math.max(
      ...matchScores.map((matchScore) => matchScore.total!),
    );
    const winner = matchScores.filter(
      (matchScore) => matchScore.total === highestScore,
    );

    if (winner.length > 1) {
      winner.forEach((matchScore) => {
        matchScore.result = "T";
      });
    } else {
      winner[0].result = "W";
    }
    matchScores.forEach((matchScore) => {
      if (matchScore.total !== highestScore) {
        matchScore.result = "L";
      }
    });
  }

  /**
   * Get the winner(s) of a match
   * can return more than one player if there is a tie
   *
   * @param {string[]} matchPlayers - players in match
   * @param {number} gameNum - game number
   * @return {string[]} - player id(s) of winner of match
   */
  matchWinner(matchPlayers: string[], gameNum: number): string[] {
    const matchScores = this.getMatchInfo(matchPlayers, gameNum);

    if (matchScores.length === 0) {
      return [];
    }
    if (!matchScores.every(this.isCompletedMatchScore)) {
      return [];
    }

    // !matchScores.every(this.isCompletedMatchScore)
    // confirms that every player has a score and total
    const highestScore = Math.max(
      ...matchScores.map((matchScore) => matchScore.total!),
    );
    return matchScores
      .filter((matchScore) => matchScore.total === highestScore)
      .map((matchScore) => matchScore.playerId);
  }
}
