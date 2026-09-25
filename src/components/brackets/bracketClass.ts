import { BracketList } from "./bracketListClass";
import { btDbUuid } from "@/lib/uuid";
import { hasUniqueValues, shuffleArray } from "@/lib/tools";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import { BracketMatch } from "./bracketMatchClass";
import type { matchNumberType, matchSeedInfoType } from "./bracketMatchClass";
import { brktSeedType } from "@/lib/types/types";
import { isNumber } from "@/lib/validation/validation";

export enum playerStatusValues {
  NOT_IN_BRACKET = 0,
  IN_BRACKET = 1,
  LOSER = 2,
  RUNNER_UP = 3,
  WINNER = 4,
}

type playerMatchInfoType = {
  brktGameNum: number;
  playerId: string;  
  matchInfo: matchSeedInfoType[];
  matchNumber: matchNumberType;
  matchPlayers: string[];
};

const validSeedSet = new Set<number>([0, 1, 2, 3, 4, 5, 6, 7]);

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

  private _id: string = "";
  private _loserBrktGame1Ids = new Set<string>();
  private _loserBrktGame2Ids = new Set<string>();
  private _match: BracketMatch;
  private _parent: BracketList | undefined;
  private _playersPerMatch: number;
  private _players: string[];
  private _semiFinalTies = new Set<string>();
  private _runnerUpAmount: number = 0;
  private _runnerUpIds = new Set<string>();
  private _winnerAmount: number = 0;
  private _winnerIds = new Set<string>();

  constructor(
    id: string = "",
    playersPerMatch: number = defaultPlayersPerMatch,
  ) {
    this._id = id !== "" ? id : btDbUuid("obk");
    this._match = new BracketMatch(this);
    this._players = [];
    this._playersPerMatch = playersPerMatch;
  }

  get id(): string {
    return this._id;
  }
  get isFull(): boolean {
    return this._players.length >= this.playersPerBracket;
  }
  get games(): number {
    // return this._games;
    return this._parent == null ? 0 : this._parent.games;
  }
  get loserBrktGame1Ids(): Set<string> {
    return this._loserBrktGame1Ids;
  }
  get loserBrktGame2Ids(): Set<string> {
    return this._loserBrktGame2Ids;
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
    // return this._playersPerMatch ** this._games;
    return this._playersPerMatch ** this.games;
  }
  get playersPerMatch(): number {
    return this._playersPerMatch;
  }
  get runnerUpAmount(): number {
    return this._runnerUpAmount;
  }
  // only used in testing
  get runnerUpIds(): Set<string> {
    return this._runnerUpIds;
  }
  // only used in testing
  get semiFinalTies(): Set<string> {
    return this._semiFinalTies;
  }
  get winnerAmount(): number {    
    return this._winnerAmount;
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
    if (parent && parent.brkt && isNumber(parent.brkt.fee)) {            
      const brktFeeAmount = Number(parent.brkt.fee);
      // 8 players in bracket,
      // 1 fee -> admin
      // 2 fee -> runner up
      // 4 or 5 fee -> winner (4 if there is a bye player)
      // for bye = 7 players = 4 + 2 + 1
      // for no bye = 8 players = 5 + 2 + 1
      const feeToWinnerMultiplier = this.hasByePlayer() ? 4 : 5;
      this._winnerAmount = brktFeeAmount * feeToWinnerMultiplier;
      this._runnerUpAmount = brktFeeAmount * 2;
    }
  }

  /*********************
   * private functions *
   ********************/

  /**
   * get player match number for a game
   *
   * note: this does not confirm player has reached a match
   *       just if the payer HAD won every match upto the desired game
   *       return the corresponing match number
   *       see the match numbers at the top of the code
   *
   * @param {string} playerId - player id
   * @param {number} brktGameNum - bracket game number
   * @returns {matchNumberType | undefined} - match number
   */
  private getPlayerMatchNumber(
    playerId: string,
    brktGameNum: number,
  ): matchNumberType | undefined {
    const playerIndex = this._players.indexOf(playerId);
    if (playerIndex === -1 || playerIndex >= this.playersPerBracket)
      return undefined;
    // if (brktGameNum < 1 || brktGameNum > this._games) return undefined;
    if (brktGameNum < 1 || brktGameNum > this.games) return undefined;
    if (brktGameNum === 1) {
      return Math.floor(playerIndex / 2) as matchNumberType; // 0-3
    }
    if (brktGameNum === 2) {
      return (Math.floor(playerIndex / 4) + 4) as matchNumberType; // 4 or 5
    }
    return 6 as matchNumberType; // 6
  }

  /**
   * Get player status
   *
   * @param {string} playerId - player id
   * @return {playerStatusValues} - player status
   */
  private playerStatus(playerId: string): playerStatusValues {
    if (!this._players.includes(playerId))
      return playerStatusValues.NOT_IN_BRACKET;
    if (
      this._loserBrktGame1Ids.has(playerId) ||
      this._loserBrktGame2Ids.has(playerId)
    )
      return playerStatusValues.LOSER;
    if (this._runnerUpIds.has(playerId)) return playerStatusValues.RUNNER_UP;
    if (this._winnerIds.has(playerId)) return playerStatusValues.WINNER;
    return playerStatusValues.IN_BRACKET;
  }

  /**
   * Update final placements - game 3, final match
   *   
   * @param {matchSeedInfoType[]} finalInfo - final match info
   * @return {void}
   */
  private updateFinalPlacements(finalInfo: matchSeedInfoType[]): void {
    // Wait until every finalist has a score.
    if (
      finalInfo.length === 0 ||
      finalInfo.some((info) => info.total === undefined)
    ) {
      return;
    }

    // Group finalists by the semifinal match they came from.
    // finalInfo still contains their game 3 scores.
    const fromMatch4 = finalInfo.filter(
      (info) => this.getPlayerMatchNumber(info.playerId, 2) === 4,
    );
    const fromMatch5 = finalInfo.filter(
      (info) => this.getPlayerMatchNumber(info.playerId, 2) === 5,
    );

    // if did not get data for game 2, both semiFinals, return now
    if (fromMatch4.length === 0 || fromMatch5.length === 0) return;
    
    // Resolve ties left over from a semifinal
    // If several players advanced from one semifinal, their game 3
    // scores break that semifinal tie. If only one advanced,
    // return that player.
    const resolveSemifinalTie = (matchSeedsInfo: matchSeedInfoType[]): matchSeedInfoType[] => {
      // These are game 3 scores, even though the players are
      // grouped by their game 2 match.
      const highScore = Math.max(...matchSeedsInfo.map((msInfo) => msInfo.total!));
      
      // A lower game 3 score loses the semifinal tie breaker.
      for (const msInfo of matchSeedsInfo) {
        if (msInfo.total! < highScore) {
          this._loserBrktGame2Ids.add(msInfo.playerId);
        }
      }

      // A tie for the high score can leave multiple players.
      return matchSeedsInfo.filter((msInfo) => msInfo.total === highScore);
    };

    // get game 2, semi final winners
    const winnersMatch4 = resolveSemifinalTie(fromMatch4);
    const winnersMatch5 = resolveSemifinalTie(fromMatch5);

    // Compare the highest game 3 score from each semifinal group.
    // Every player remaining in a group has that group's high score.    
    // ok to use index[0] because all winnersMatch4 
    // and winnersMatch5 have the same high score    
    const highScoreMatch4 = winnersMatch4[0].total!; 
    const highScoreMatch5 = winnersMatch5[0].total!;

    // if high score for match 4 is higher than high score for match 5
    if (highScoreMatch4 >= highScoreMatch5) {
      winnersMatch4.forEach((info) => this._winnerIds.add(info.playerId));
    } else {
      winnersMatch4.forEach((info) => this._runnerUpIds.add(info.playerId));
    }

    if (highScoreMatch5 >= highScoreMatch4) {
      winnersMatch5.forEach((info) => this._winnerIds.add(info.playerId));
    } else {
      winnersMatch5.forEach((info) => this._runnerUpIds.add(info.playerId));
    }
  }

  /**
   * Update player sets with player match info
   *
   * @param {playerMatchInfoType} pmi - player match info
   * @return {void}
   */
  private updatePlayerSets(pmi: playerMatchInfoType): void {
    // if no data or no score yet, return
    // have a result means all players in match have scores entered
    if (pmi == null) return;
    const playerInfo = pmi.matchInfo.find((info) => info.playerId === pmi.playerId);
    if (!playerInfo || playerInfo.result === undefined) return;
    
    // if player has already lost, return
    if (
      this._loserBrktGame1Ids.has(pmi.playerId) ||
      this._loserBrktGame2Ids.has(pmi.playerId)
    )
      return;

    // bracket game 1 or 2
    // if (pmi.brktGameNum < this._games) {
    if (pmi.brktGameNum < this.games) {
      // bracket game brktGameNum scores in entered, player has lost
      if (playerInfo.result === "L") {
        if (pmi.brktGameNum === 1) {
          this._loserBrktGame1Ids.add(pmi.playerId);
        } else {
          this._loserBrktGame2Ids.add(pmi.playerId);
        }
      }
      // bracket game brktGameNum scores in entered, player has won, other players have lost
      if (playerInfo.result === "W") {
        // get other players
        const otherPlayersInfo = pmi.matchInfo.filter(
          (info) => info.playerId !== pmi.playerId,
        );
        // add other players to losers
        otherPlayersInfo.forEach((info) => {
          if (pmi.brktGameNum === 1) {
            this._loserBrktGame1Ids.add(info.playerId);
          } else {
            this._loserBrktGame2Ids.add(info.playerId);
          }
        });
      }
      // if a tie in the semi final
      // if (pmi.brktGameNum === this._games - 1 && pmi.playerInfo.result === "T") {
      if (pmi.brktGameNum === this.games - 1 && playerInfo.result === "T") {
        // add all tie players to semi final ties
        pmi.matchInfo.forEach((info) => {
          this._semiFinalTies.add(info.playerId);
        });
      }
    } else {
      // bracket game 3 scores in entered, player has lost
      if (playerInfo.result === "L") {       
        // A player from a tied semifinal still needs their game-3
        // score compared with the other players from that tie.
        if (!this._semiFinalTies.has(pmi.playerId)) {
          this._runnerUpIds.add(pmi.playerId);
        }        

        // bracket game 3 scores in entered, player has won, other players have lost
      } else if (playerInfo.result === "W") {
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
              // add other player to losersGame2, lost semi-final tie breaker
              this._loserBrktGame2Ids.add(info.playerId);
              // else high score in final for those in semi final tie
            } else {
              // get highest score for tie losers
              const highestScore = Math.max(
                ...otherPlayersInfo.map(
                  (onePlayerInfo) => onePlayerInfo.total!,
                ),
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
                // tie losers in final go into loserGame2
                this._loserBrktGame2Ids.add(otherTieId);
              });
            }
          }
        });
        // bracket game 3 scores in entered, tie
      } else {
        this._winnerIds.add(pmi.playerId);
      }
    }
  }

  /**************************************************
   * methods below are used in randonizing brackets *
   **************************************************/

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

  /**********************************************************
   * methods below are used in calculating brackets results *
   **********************************************************/

  /**
   * - Get player match info
   *
   * @param {string} playerId - player's id
   * @param {number} brktGameNum - game number in bracket
   * @return {(playerMatchInfoType | undefined)}
   */
  getPlayerMatchInfo(
    playerId: string,
    brktGameNum: number,
  ): playerMatchInfoType | undefined {
    // get match number
    const matchNumber = this.getPlayerMatchNumber(playerId, brktGameNum);
    if (matchNumber === undefined) return undefined;

    // get match players
    let matchPlayers = this._match.getMatchPlayers(matchNumber);
    if (matchPlayers.length === 0) return undefined;

    // get match info
    if (!this._parent) return undefined;
    const squadGameNum = this._parent.squadGameNumber(brktGameNum);
    const matchInfo = this._match.getMatchInfo(matchPlayers, squadGameNum);

    // get player info in match
    const playerInfo = matchInfo.find((info) => info.playerId === playerId);
    if (!playerInfo) return undefined;

    return {
      brktGameNum: brktGameNum,
      playerId: playerId,      
      matchInfo: matchInfo,
      matchNumber: matchNumber,
      matchPlayers: matchPlayers,
    };
  }

  /**
   * get player status in this bracket
   *
   * @param {string} playerId - player id
   * @return {playerStatusValues} - player status
   */
  getPlayerStatus(playerId: string): playerStatusValues {
    let status = this.playerStatus(playerId);
    if (status !== playerStatusValues.IN_BRACKET) {
      return status;
    }

    // game 1 of bracket
    let pmi = this.getPlayerMatchInfo(playerId, 1);
    if (!pmi) return status;
    const playerMatchSeed = pmi.matchInfo.find((info) => info.playerId === playerId);
    if (!playerMatchSeed) return status;

    this.updatePlayerSets(pmi);
    status = this.playerStatus(playerId);
    if (status !== playerStatusValues.IN_BRACKET) {
      return status;
    }

    // game 2 of bracket - semi final
    pmi = this.getPlayerMatchInfo(playerId, 2);
    if (!pmi) return status;
    this.updatePlayerSets(pmi);
    status = this.playerStatus(playerId);
    if (status !== playerStatusValues.IN_BRACKET) {
      return status;
    }

    // game 3 of bracket - final
    pmi = this.getPlayerMatchInfo(playerId, 3);
    if (!pmi) return status;
    this.updatePlayerSets(pmi);
    return this.playerStatus(playerId);
  }

  /**
   * checks if player is in bracket
   *
   * NOTE: this is used for checking if a player is in a bracket
   *       DOES NOT return index of player
   *
   * @param {string} playerId - id of player to check
   * @return {boolean} - true if player is in bracket, false otherwise
   */
  hasPlayer(playerId: string): boolean {
    return this._players.includes(playerId);
  }

  /**
   * checks if player is alive in bracket, 1st or 2nd place
   *
   * @param {string} playerId - id of player to check
   * @return {boolean} - false if player in losers or not found
   */
  isPlayerAlive(playerId: string): boolean {
    const status = this.playerStatus(playerId);
    return (
      status === playerStatusValues.IN_BRACKET ||
      status === playerStatusValues.WINNER ||
      status === playerStatusValues.RUNNER_UP
    );
  }

  /**
   * checks if player is in 1st or 2nd place
   *
   * @param {string} playerId - id of player to check
   * @return {boolean} - true if player is in 1st or 2nd place
   */
  isPlayerFirstOrSecond(playerId: string): boolean {
    const status = this.playerStatus(playerId);
    return (
      status === playerStatusValues.WINNER ||
      status === playerStatusValues.RUNNER_UP
    );
  }

  /**
   * checks if player is in bracket game 2
   *
   * @param {string} playerId - id of player to check
   * @return {boolean} - true if player is in brkt game 2 (didn't loose in brkt game 1)
   */
  isPlayerInBracketGame2(playerId: string): boolean {
    return !this._loserBrktGame1Ids.has(playerId);
  }

  /**
   * checks if player is in bracket game 3
   *
   * @param {string} playerId - id of player to check
   * @return {boolean} - true if player is in brkt game 3 (did not loose in brkt game 2)
   */
  isPlayerInBrktGame3(playerId: string): boolean {
    return (
      !this._loserBrktGame2Ids.has(playerId) &&
      this.isPlayerInBracketGame2(playerId)
    );
  }

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
    ) {
      return;
    }

    // Verify every required seed exists exactly once.
    const brktSeedsSet = new Set(brktSeeds.map((brktSeed) => brktSeed.seed));
    if (
      brktSeedsSet.size !== this.playersPerBracket ||
      ![...brktSeedsSet].every((seed) => validSeedSet.has(seed))
    ) {
      return;
    }

    // A player can appear only once in a bracket.
    const justPlayerIds = brktSeeds.map((brktSeed) => brktSeed.player_id);
    if (!hasUniqueValues(justPlayerIds)) return;

    const sorted = brktSeeds.sort((a, b) => a.seed - b.seed);
    // use for loop instead of forEach because i+=2, not i++
    for (let i = 0; i < this.playersPerBracket; i += 2) {
      this.addMatch([sorted[i].player_id, sorted[i + 1].player_id]);
    }
  }

  /**
   * updates all matches in the bracket
   */
  updateMatches(): void {
    this._loserBrktGame1Ids.clear();
    this._loserBrktGame2Ids.clear();
    this._runnerUpIds.clear();
    this._semiFinalTies.clear();
    this._winnerIds.clear();

    // if no game scores yet, return
    if (this._parent == null) return;
    if (this._parent.gameScoreMap == null) return;

    for (let m = 0; m <= 6; m++) {
      const players = this._match.getMatchPlayers(m as matchNumberType);      
      const brktGameNum = m <= 3 ? 1 : m <= 5 ? 2 : 3;      
      const squadGameNum = this._parent.squadGameNumber(brktGameNum);
      const matchSeedInfo = this._match.getMatchInfo(players, squadGameNum);
      // if the final match (game 3), update final placements
      if (m === 6) {
        this.updateFinalPlacements(matchSeedInfo);
        // else quarter final (game 1, matches 0-3) or semifinal (game 2, matches 4, 5)
      } else {         
        for (let p = 0; p < players.length; p++) {
          let pmi: playerMatchInfoType = {
            playerId: players[p],
            brktGameNum: brktGameNum,          
            matchInfo: matchSeedInfo,
            matchPlayers: players,
            matchNumber: m as matchNumberType,
          };
          this.updatePlayerSets(pmi);
        }
      }
    }
  }
}
