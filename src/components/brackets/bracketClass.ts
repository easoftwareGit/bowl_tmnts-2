import { BracketList } from "./bracketListClass";
import { btDbUuid } from "@/lib/uuid";
import { shuffleArray } from "@/lib/tools";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { BracketMatch } from "./bracketMatchClass";
import type { matchNumberType, matchSeedInfoType } from "./bracketMatchClass";
import { brktSeedType } from "@/lib/types/types";

export class Bracket {
  static errInvalidPlayerId = -1;
  static errAlreadyInBracket = -2;
  static errBracketIsFull = -3;
  static errInvalidMatch = -4;
  static errDuplicatePlayerId = -5;
  static errMultipleByePlayers = -6;
  static byePlayerId = "bye_00000000000000000000000000000000";

  private _games: number;
  private _id: string = "";
  private _match: BracketMatch | undefined;
  private _parent: BracketList | undefined;
  private _playersPerMatch: number;
  private _players: string[];

  constructor(
    id: string = "",
    playersPerMatch: number = defaultPlayersPerMatch,
    games: number = defaultBrktGames,
  ) {
    this._games = games;
    this._id = id !== "" ? id : btDbUuid("obk");
    this._players = [];
    this._playersPerMatch = playersPerMatch;
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
    // 2 bolwers per match ** 3 games = 2 ** 3 = 8
    return this._playersPerMatch ** this._games;
  }
  get playersPerMatch(): number {
    return this._playersPerMatch;
  }

  set parent(parent: BracketList | undefined) {
    this._parent = parent;
    if (parent && parent.gameScoreMap && parent.playerMap) {
      this._match = new BracketMatch(this);
    }
  }

  /**
   * Add players in a match to bracket
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
   * get the game scores for a match
   *
   * @param {matchNumberType} matchNumber
   * @param {number} gameNum
   * @return {*}  {matchSeedInfoType[]}
   * @memberof Bracket
   */
  getMatchScores(
    matchNumber: matchNumberType,
    gameNum: number,
  ): matchSeedInfoType[] {
    if (!this._match) return [];
    const matchPlayers = this._match.getMatchPlayers(matchNumber);
    return this._match.getMatchInfo(matchPlayers, gameNum);
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
   * finds the index of a player
   *
   * @param {string} playerId - player id to find
   * @returns {number} - index of player
   */
  playerIndex(playerId: string): number {
    return this._players.indexOf(playerId);
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
    )
      return;
    const sorted =brktSeeds.sort((a, b) => a.seed - b.seed);
    // use for loop instead of forEach because i+=2, not i++    
    for (let i = 0; i < this.playersPerBracket; i+=2) {
      this.addMatch([
        sorted[i].player_id,
        sorted[i + 1].player_id
      ]);
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
