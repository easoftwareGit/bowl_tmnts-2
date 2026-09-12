import { BracketList } from "./bracketListClass";
import { btDbUuid } from "@/lib/uuid";
import { shuffleArray } from "@/lib/tools";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { BracketMatch } from "./bracketMatchClass";
import type { matchNumberType, matchSeedInfoType } from "./bracketMatchClass";
import { brktSeedType } from "@/lib/types/types";
import { isEven, isOdd } from "@/lib/validation/validation";

export enum playerStatus {
  NOT_IN_BRACKET = 0,
  IN_BRACKET = 1,
  LOSER = 2,
  RUNNER_UP = 3,
  WINNER = 4,
}

type PlayerMatchInfoType = {
  gameNum: number;
  playerId: string;
  playerInfo: matchSeedInfoType;
  matchInfo: matchSeedInfoType[];
  matchNumber: matchNumberType;
  matchPlayers: string[];
};

// 2 players per match ** 3 games = 2 ** 3 = 8
// 8 player bracket, 7 matches
const defaultMatchesPerBracket = 7;

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

export type OneMatchInfoType = {
  top: matchSeedInfoType[];
  bottom: matchSeedInfoType[];
};

export class Bracket {
  static errInvalidPlayerId = -1;
  static errAlreadyInBracket = -2;
  static errBracketIsFull = -3;
  static errInvalidMatch = -4;
  static errDuplicatePlayerId = -5;
  static errMultipleByePlayers = -6;
  static byePlayerId = "bye_00000000000000000000000000000000";

  private _fullBracketInfo: OneMatchInfoType[];
  private _games: number;
  private _id: string = "";
  private _loserIds = new Set<string>();
  private _match: BracketMatch;
  private _parent: BracketList | undefined;
  private _playersPerMatch: number;
  private _players: string[];
  private _semiFinalTies = new Set<string>();
  private _runnerUpIds = new Set<string>();
  private _winnerIds = new Set<string>();

  constructor(
    id: string = "",
    playersPerMatch: number = defaultPlayersPerMatch,
    games: number = defaultBrktGames,
  ) {
    this._games = games;
    this._id = id !== "" ? id : btDbUuid("obk");
    this._match = new BracketMatch(this);
    this._players = [];
    this._playersPerMatch = playersPerMatch;
    this._fullBracketInfo = Array.from(
      { length: defaultMatchesPerBracket },
      () => ({ top: [], bottom: [] }),
    );
  }

  get games(): number {
    return this._games;
  }
  get id(): string {
    return this._id;
  }
  get isFull(): boolean {
    return this._players.length >= this.playersPerBracket;
  }
  // only used in testing
  get loserIds(): Set<string> {
    return this._loserIds;
  }
  get match(): BracketMatch | undefined {
    return this._match;
  }
  get parent(): BracketList | undefined {
    return this._parent;
  }
  get players(): string[] {
    return this._players;
  }
  get playersPerBracket(): number {
    // 2 players per match ** 3 games = 2 ** 3 = 8
    return this._playersPerMatch ** this._games;
  }
  get playersPerMatch(): number {
    return this._playersPerMatch;
  }
  // only used in testing
  get runnerUpIds(): Set<string> {
    return this._runnerUpIds;
  }
  // only used in testing
  get semiFinalTies(): Set<string> {
    return this._semiFinalTies;
  }
  // only used in testing
  get winnerIds(): Set<string> {
    return this._winnerIds;
  }

  set parent(parent: BracketList | undefined) {
    this._parent = parent;
    if (parent && parent.gameScoreMap && parent.playersMap) {
      this._match = new BracketMatch(this);
    }
  }

  /**
   * - Get player match info
   *
   * @param {string} playerId - player's id
   * @param {number} gameNum - game number in bracket
   * @return {(PlayerMatchInfoType | undefined)}    
   */
  getPlayerMatchInfo(
    playerId: string,
    gameNum: number,
  ): PlayerMatchInfoType | undefined {
    // get match number
    const matchNumber = this.getPlayerMatchNumber(playerId, gameNum);
    if (matchNumber === undefined) return undefined;

    // get match players
    let matchPlayers = this._match.getMatchPlayers(matchNumber);
    if (matchPlayers.length === 0) return undefined;

    // get match info
    const matchInfo = this._match.getMatchInfo(matchPlayers, gameNum);

    // get player info in match
    const playerInfo = matchInfo.find((info) => info.playerId === playerId);
    if (!playerInfo) return undefined;

    return {
      gameNum: gameNum,
      playerId: playerId,
      playerInfo: playerInfo,
      matchInfo: matchInfo,
      matchNumber: matchNumber,
      matchPlayers: matchPlayers,
    };
  }

  /**
   * Get player status for game
   *
   * @param {PlayerMatchInfoType | undefined} pmi - player match info
   * @return {playerStatus} - player status
   */
  getPlayerStatusForGame(pmi: PlayerMatchInfoType | undefined): playerStatus {    
    if (!pmi) return playerStatus.NOT_IN_BRACKET;    
    if (this._loserIds.has(pmi.playerId)) return playerStatus.LOSER;
    if (this._runnerUpIds.has(pmi.playerId)) return playerStatus.RUNNER_UP;
    if (this._winnerIds.has(pmi.playerId)) return playerStatus.WINNER;    
    if (this.playerIndex(pmi.playerId) < 0) return playerStatus.NOT_IN_BRACKET;

    return playerStatus.IN_BRACKET;
  }

  // getPlayerStatusForGame(playerId: string, gameNum: number): playerStatus {
  //   // get match number
  //   const matchNumber = this.getPlayerMatchNumber(playerId, gameNum);
  //   if (matchNumber === undefined) return playerStatus.NOT_IN_BRACKET;

  //   // get match players
  //   let matchPlayers = this._match.getMatchPlayers(matchNumber);
  //   if (!matchPlayers || matchPlayers.length === 0)
  //     return playerStatus.NOT_IN_BRACKET;

  //   // get match info
  //   let matchInfo = this._match.getMatchInfo(matchPlayers, gameNum);
  //   if (!matchInfo) return playerStatus.NOT_IN_BRACKET;

  //   // get player info in match
  //   let playerInfo = matchInfo.find((info) => info.playerId === playerId);
  //   if (!playerInfo) return playerStatus.NOT_IN_BRACKET;

  //   // if (gameNum === 1) {
  //   //   // game 1 no ties, so just get top and bottom from match info
  //   //   this._fullBracketInfo[matchNumber].top.push(matchInfo[0]);
  //   //   this._fullBracketInfo[matchNumber].bottom.push(matchInfo[1]);
  //   // } else {
  //   //   // game 2, no ties
  //   //   if (matchInfo.length === 2) {
  //   //     this._fullBracketInfo[matchNumber].top.push(matchInfo[0]);
  //   //     this._fullBracketInfo[matchNumber].bottom.push(matchInfo[1]);
  //   //   } else {
  //   //     const topStartIndex = 0;
  //   //     const topEndIndex = matchInfo.length / 2;
  //   //     const bottomStartIndex = topEndIndex;
  //   //     const bottomEndIndex = matchInfo.length;
  //   //   }

  //   // }

  //   // bracket game gameNum scores not entered yet for either player in match
  //   if (playerInfo.result === undefined) {
  //     return playerStatus.IN_BRACKET;
  //   }

  //   // bracket game gameNum scores in entered, player has lost
  //   if (playerInfo.result === "L") {
  //     this._loserIds.add(playerId);
  //     return playerStatus.LOSER;
  //   }

  //   // bracket game gameNum scores in entered, player has won, other players have lost
  //   if (playerInfo.result === "W") {
  //     // get other players
  //     const otherPlayersInfo = matchInfo.filter(
  //       (info) => info.playerId !== playerId,
  //     );
  //     // add other players to losers
  //     otherPlayersInfo.forEach((info) => {
  //       this._loserIds.add(info.playerId);
  //     });
  //     return playerStatus.IN_BRACKET;
  //   }

  //   // if got here, game was a tie between player and any other player(s)
  //   // but check if a semi final match
  //   if (gameNum === this._games - 1) {
  //     // add player to semi final ties
  //     matchInfo.forEach((info) => {
  //       this._semiFinalTies.add(info.playerId);
  //     });
  //   }

  //   // do not add player to loserIds
  //   // also, do not know if other players lost or tied, do nothing else here
  //   return playerStatus.IN_BRACKET;
  // }

  /**
   * get player match number for a game
   *
   * note: this does not confirm player has reached a match
   *       just if the payer HAD won every match upto the desired game
   *       return the corresponing match number
   *       see the match numbers at the top of the code
   *
   * @param {string} playerId - player id
   * @param {number} gameNum - game number
   * @returns {matchNumberType | undefined} - match number
   */
  getPlayerMatchNumber(
    playerId: string,
    gameNum: number,
  ): matchNumberType | undefined {
    const playerIndex = this._players.indexOf(playerId);
    if (playerIndex === -1 || playerIndex >= this.playersPerBracket)
      return undefined;
    if (gameNum < 1 || gameNum > this._games) return undefined;
    if (gameNum === 1) {
      return Math.floor(playerIndex / 2) as matchNumberType; // 0-3
    }
    if (gameNum === 2) {
      return (Math.floor(playerIndex / 4) + 4) as matchNumberType; // 4 or 5
    }
    return 6 as matchNumberType; // 6
  }

  /**
   * Get player index
   *
   * @param {string} playerId - player id
   * @return {number} - player index, -1 if not found   
   */
  playerIndex(playerId: string): number {
    return this._players.indexOf(playerId);
  }

  /**
   * Get player status
   *
   * @param {string} playerId - player id
   * @return {playerStatus} - player status
   */
  playerStatus(playerId: string): playerStatus {
    if (!this._players.includes(playerId)) return playerStatus.NOT_IN_BRACKET;
    if (this._loserIds.has(playerId)) return playerStatus.LOSER;
    if (this._runnerUpIds.has(playerId)) return playerStatus.RUNNER_UP;
    if (this._winnerIds.has(playerId)) return playerStatus.WINNER;
    return playerStatus.IN_BRACKET;
  }

  /**
   * Update player sets with player match info
   *
   * @param {PlayerMatchInfoType} pmi - player match info
   * @return {void}   
   */
  updatePlayerSets(pmi: PlayerMatchInfoType): void {
    // if no data or no score yet, return
    // have a result means all players in match have scores entered
    if (!pmi || pmi.playerInfo.result === undefined) return;

    if (pmi.gameNum < this._games) {
      // bracket game gameNum scores in entered, player has lost
      if (pmi.playerInfo.result === "L") {
        this._loserIds.add(pmi.playerId);
      }
      // bracket game gameNum scores in entered, player has won, other players have lost
      if (pmi.playerInfo.result === "W") {
        // get other players
        const otherPlayersInfo = pmi.matchInfo.filter(
          (info) => info.playerId !== pmi.playerId,
        );
        // add other players to losers
        otherPlayersInfo.forEach((info) => {
          this._loserIds.add(info.playerId);
        });
      }
      // if a tie in the semi final
      if (pmi.gameNum === this._games - 1 && pmi.playerInfo.result === "T") {
        // add all tie players to semi final ties
        pmi.matchInfo.forEach((info) => {
          this._semiFinalTies.add(info.playerId);
        });
      }
    } else { 
      // bracket game 3 scores in entered, player has lost
      if (pmi.playerInfo.result === "L") {
        this._runnerUpIds.add(pmi.playerId);

      // bracket game 3 scores in entered, player has won, other players have lost        
      } else if (pmi.playerInfo.result === "W") {
        this._winnerIds.add(pmi.playerId);
        const winnerWasInTie = this._semiFinalTies.has(pmi.playerId);
        // get other players
        const otherPlayersInfo = pmi.matchInfo.filter(
          (info) => info.playerId !== pmi.playerId,
        );        
        // add other players to losers or runnersUp
        otherPlayersInfo.forEach((info) => {
          // if was NOT in semi final tie, and lost final, then a runner up
          if (!this._semiFinalTies.has(info.playerId)) {
            this._runnerUpIds.add(info.playerId);

          // else other player was in a semi final tie
          } else {
            // if winner was in a tie, and loser was in a tie
            if (winnerWasInTie) {
              // add other player to losers, lost tie breaker
              this._loserIds.add(info.playerId);

            // else high score in final for those in semi final tie 
            } else { 
              // get highest score for tie losers
              const highestScore = Math.max(
                ...otherPlayersInfo.map((onePlayerInfo) => onePlayerInfo.total!),
              );
              const highTieLoser = otherPlayersInfo
                .filter((onePlayerInfo) => onePlayerInfo.total === highestScore)
                .map((onePlayerInfo) => onePlayerInfo.playerId);
              // high tie loser in final is runner up
              highTieLoser.forEach((highTieId) => {
                this._runnerUpIds.add(highTieId);
              });
              // non high tie losers in final are losers
              const otherTieLosers = otherPlayersInfo
                .filter((onePlayerInfo) => onePlayerInfo.total !== highestScore)
                .map((onePlayerInfo) => onePlayerInfo.playerId);
              otherTieLosers.forEach((otherTieId) => {
                this._loserIds.add(otherTieId);
              });
            }
          }
        });
      // bracket game 3 scores in entered, tie
      } else { 
        this._winnerIds.add(pmi.playerId);
      }
    };
  };

  /* EVERTHING ABOVE THIS LINE WILL BE PRIVATE */

  /**
   * Add players in a match to bracket
   *
   * note: only used when randonizing brackets
   *       use populateBracket to add players from database
   *
   * @param {string[]} playerIds - array of players in match to add to bracket
   * @returns {number} - number of players in bracket
   */
  addMatch(playerIds: string[]): number {
    if (!playerIds || playerIds.length === 0) return Bracket.errInvalidPlayerId;
    if (playerIds.length !== this.playersPerMatch)
      return Bracket.errInvalidMatch;
    if (playerIds.length + this._players.length > this.playersPerBracket)
      return Bracket.errBracketIsFull;
    for (let i = 0; i < playerIds.length; i++) {
      if (this._players.includes(playerIds[i]))
        return Bracket.errAlreadyInBracket;
    }
    playerIds.forEach((playerId) => {
      this._players.push(playerId);
    });
    return this._players.length;
  }

  /**
   * clear all players from bracket
   * also resets empty indexes
   *
   * note: called clearPlayers() not emptyPlayers(), to avoid confusion with emptySpots()
   */
  clearPlayers(): void {
    this._players.length = 0;
  }

  /**
   * get number of empty spots in bracket
   *
   * @returns {number} - number of empty spots in bracket
   */
  emptySpots(): number {
    return this.playersPerBracket - this._players.length;
  }

  getPlayerStatus(playerId: string): playerStatus {
    if (!this._match) return playerStatus.NOT_IN_BRACKET;
    const status = this.playerStatus(playerId);
    if (status !== playerStatus.IN_BRACKET) {
      return status;
    }
    
    
    // // only update status if status is IN_BRACKET

    // // status = this.getPlayerStatusForGame(playerId, 1);
    // // if (status !== playerStatus.IN_BRACKET) return status;

    // // status = this.getPlayerStatusForGame(playerId, 2);
    // // if (status !== playerStatus.IN_BRACKET) return status;

    // const matchNumber = this.getPlayerMatchNumber(playerId, 3);
    // const matchPlayers = this._match.getMatchPlayers(matchNumber!);
    // if (!matchPlayers) return playerStatus.NOT_IN_BRACKET;

    // // no players or no opponents
    // if (matchPlayers.length <= 1) return playerStatus.IN_BRACKET;
    // const matchInfo = this._match.getMatchInfo(matchPlayers, 3);
    // if (!matchInfo) return playerStatus.NOT_IN_BRACKET;
    // const playerInfo = matchInfo.find((info) => info.playerId === playerId);
    // if (!playerInfo) return playerStatus.NOT_IN_BRACKET;

    // // bracket game 3 scores not entered yet for either player in match
    // if (playerInfo.result === undefined) {
    //   return playerStatus.IN_BRACKET;
    // }

    // // bracket game 3 scores in entered, player has lost
    // if (playerInfo.result === "L") {
    //   this._runnerUpIds.add(playerId);
    //   return playerStatus.RUNNER_UP;
    // }
    // // bracket game 3 scores in entered, player has won, other players have lost
    // if (playerInfo.result === "W") {
    //   this._winnerIds.add(playerId);

    //   // get other players
    //   const otherPlayersInfo = matchInfo.filter(
    //     (info) => info.playerId !== playerId,
    //   );
    //   // add other players to losers or runners up
    //   otherPlayersInfo.forEach((info) => {
    //     // if was NOT in semi final tie, and lost final, then a runner up
    //     if (!this._semiFinalTies.has(info.playerId)) {
    //       this._runnerUpIds.add(info.playerId);
    //     } else {
    //       // get highest score for tie losers
    //       const highestScore = Math.max(
    //         ...otherPlayersInfo.map((onePlayerInfo) => onePlayerInfo.total!),
    //       );
    //       const highTieLoser = otherPlayersInfo
    //         .filter((onePlayerInfo) => onePlayerInfo.total === highestScore)
    //         .map((onePlayerInfo) => onePlayerInfo.playerId);
    //       // high tie loser in final is runner up
    //       highTieLoser.forEach((highTieId) => {
    //         this._runnerUpIds.add(highTieId);
    //       });
    //       // non high tie losers in final are losers
    //       const otherTieLosers = otherPlayersInfo
    //         .filter((onePlayerInfo) => onePlayerInfo.total !== highestScore)
    //         .map((onePlayerInfo) => onePlayerInfo.playerId);
    //       otherTieLosers.forEach((otherTieId) => {
    //         this._loserIds.add(otherTieId);
    //       });
    //     }
    //   });
    //   return playerStatus.WINNER;
    // }

    // // tied for the win
    // this._winnerIds.add(playerId);
    // // cant tell ifother players were ties or lose, so do nothing else here
    // return playerStatus.WINNER;
  }

  /**
   * checks if bracket has a bye player
   *
   * @returns {boolean} - true if bracket has a bye player, false otherwise
   */
  hasByePlayer(): boolean {
    return this._players.find((id) => id.startsWith("bye")) !== undefined;
  }

  /**
   * gets the number of positions in players without a player id
   *
   * @returns {number} - number of positions in players without a player id
   */
  numEmptySpots(): number {
    // return this._emptyIndexes.size;
    return this.playersPerBracket - this._players.length;
  }

  // /**
  //  * finds the index of a player
  //  *
  //  * @param {string} playerId - player id to find
  //  * @returns {number} - index of player
  //  */
  // playerIndex(playerId: string): number {
  //   return this._players.indexOf(playerId);
  // }

  /**
   * populates the bracket with players
   *
   * NOTE: this is used for creating a bracket from a list bracket seeds
   * when the data has been fetched from the database. data in database has
   * already been randomized.
   *
   * @param {brktSeedType[]} brktSeeds
   */
  populateBracket(brktSeeds: brktSeedType[]): void {
    if (
      !brktSeeds ||
      !Array.isArray(brktSeeds) ||
      brktSeeds.length !== this.playersPerBracket
    )
      return;
    const sorted = brktSeeds.sort((a, b) => a.seed - b.seed);
    // use for loop instead of forEach because i+=2, not i++
    for (let i = 0; i < this.playersPerBracket; i += 2) {
      this.addMatch([sorted[i].player_id, sorted[i + 1].player_id]);
    }
  }

  /**
   * shuffles the players in the bracket, keeping the matches intact
   * positions in a match are shuffled too
   */
  shuffle(): void {
    // if players is empty or bracket is not full, do nothing
    if (!this._players || !this.isFull) return;

    // 1) split the players into the matches
    const matches = [];
    for (let i = 0; i < this._players.length; i += 2) {
      matches.push([this._players[i], this._players[i + 1]]);
    }

    // 2) shuffle each individual match
    matches.forEach((match) => {
      if (Math.random() > 0.5) {
        match.reverse();
      }
    });

    // 3) shuffle the matches using the Fisher-Yates shuffle algorithm
    shuffleArray(matches);

    // 4) flatten the matches back into a single array and save it to _players
    this._players = matches.flat();
  }
}
