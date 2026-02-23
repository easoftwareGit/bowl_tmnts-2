import { Bracket } from "./bracketClass";
import {
  entryNumBrktsColName,
  timeStampColName,
} from "@/app/dataEntry/playersForm/createColumns";
import { isOdd, maxBrackets } from "@/lib/validation/validation";
import {
  blankPlayer,
  defaultBrktGames,
  defaultPlayersPerMatch,  
} from "@/lib/db/initVals";
import { shuffleArray } from "@/lib/tools";
import type { playerType } from "@/lib/types/types";
import type { playerEntryRow } from "@/app/dataEntry/playersForm/populateRows";
import { cloneDeep } from "lodash";

export type findPlayerResult = {
  playerIndex: number;
  brktIndex: number;
};

export type brktEntryType = {
  // player_id: string, // player_id is key in map, so no need to add it here
  num_brackets: number;
  createdAt: number;
  orig_num_brackets: number;
};

export const brktsToShow = 10;

export type initBrktCountsType = {
  forFullValues: (number | null)[];
  forOneByeValues: (number | null)[];
};

export type totalBrktsType = {
  total: number;
  full: number;
  oneBye: number;
};

export type playerUsedType = {
  playerId: string;
  used: boolean;
};

const initBrktCounts: initBrktCountsType = {
  forFullValues: [],
  forOneByeValues: [],
};

export type randmoizeErrorType = {
  error: number;
  message: string;
  badEntries: string;
  badBrackets: string;
  tryCount: number;
  playerId: string;
  brktId: string;
  shuffledIndex: number;
  totalMatches: number;
};

export enum matchTestCodes {
  VALID,
  USED,
  SELF,
  PAST,
  PRIOR,
}

const maxTries = 250;

export class BracketList {
  static noError = 0;  
  static reRandomize = -97;
  static reShuffle = -98;
  static resetMatches = -99;
  static errInvalidBrktEntries = -100;
  static errCantRandomize = -110;
  static errNoBracketsForPlayer = -111;
  static errInvalidAvalableBrkts = -112;
  static errInvalidShuffledBrktIndex = -113;
  static errInvalidPlayerBrktSet = -114;
  static errInvalidOpponentBrktSet = -115;
  static errCantMoveMatch = -116;
  static errInvalidBracketIndex = -117;
  static errCantFindNeededCount = -118;
  static errInvalidNeededCount = -119;
  static errCantCreateOppoMap = -120;
  static errNoValuesInOppoMap = -121;
  static errNotEnoughOppoEntries = -122;

  private _addedBye = false;
  private _brackets: Bracket[] = [];
  private _brktCounts: initBrktCountsType = cloneDeep(
    initBrktCounts,
  ) as initBrktCountsType;
  private _brktEntries: playerEntryRow[] = [];
  private _brktId: string;
  private _byeEntry: playerEntryRow = {};
  private _byePlayer: playerType = blankPlayer;
  private _copyFrom: Bracket[] = [];
  private _dupThreshold = 12; // can have a duplicate match 1 in 12 times
  private _errorCode: number = BracketList.noError;
  private _errorMessage: string = "";
  private _fullCount: number = 0;
  private _games: number = defaultBrktGames;  
  private _numBrktsName: string = "";
  private _oneByeCount: number = 0;
  private _playersPerMatch: number = defaultPlayersPerMatch;
  private _playersWithRefunds: boolean = false;
  private _randomizeErrors: randmoizeErrorType[] = [];
  private _shuffled: playerUsedType[] = [];
  private _timeStampName: string = "";
  private _totalEntries: number = 0;

  constructor(
    brktId: string,
    playersPerMatch: number,
    games: number,
    byePlayer: playerType = blankPlayer,
    copyFrom: Bracket[] = [],
  ) {
    this._shuffled = [];
    this._brktId = brktId;
    this._games = games;
    this._numBrktsName = entryNumBrktsColName(this._brktId);
    this._timeStampName = timeStampColName(this._brktId);
    this._playersPerMatch = playersPerMatch;
    this._byePlayer = byePlayer;
    this._copyFrom = copyFrom;
    if (this._copyFrom.length > 0) {
      this._brackets.push(...this._copyFrom);
    }
  }

  get brackets() {
    return this._brackets;
  }
  get brktCounts() {
    return this._brktCounts;
  }
  get brktId() {
    return this._brktId;
  }
  get brktEntries() {
    return this._brktEntries;
  }
  get byeEntry() {
    return this._byeEntry;
  }
  get byePlayer() {
    return this._byePlayer;
  }
  get errorCode() {
    return this._errorCode;
  }
  get errorMessage() {
    return this._errorMessage;
  }
  get fullCount() {
    return this._fullCount;
  }
  get games() {
    return this._games;
  }
  get numBrktsName() {
    return this._numBrktsName;
  }
  get oneByeCount() {
    return this._oneByeCount;
  }
  get playersPerBrkt(): number {
    // 2 bolwers per match ** 3 games = 2**3 = 8
    return this._playersPerMatch ** this._games;
  }
  get playersPerMatch() {
    return this._playersPerMatch;
  }
  get playersWithRefunds() {
    return this._playersWithRefunds;
  }
  get randomizeErrors() {
    return this._randomizeErrors;
  }
  get totalBrackets() {
    return this._fullCount + this._oneByeCount;
  }
  get totalEntries() {
    return this._totalEntries;
  }

  getDebugShuffle(): string {
    let debugStr = "";
    for (let i = 0; i < this._shuffled.length; i++) {
      const entryObj = this._shuffled[i];
      debugStr += entryObj.playerId + "\t";
    }
    return debugStr;
  }

  /**
   * sorts bracket entries by # brackets (DESC), usedCount (ASC) and createdAt (ASC)
   * only used internally, so make private
   *
   * @returns {void}
   */
  private sortBrktEntries(): void {
    // sort by # brackets (DESC), usedCount (ASC) and createdAt (ASC)
    this._brktEntries.sort((a, b) => {
      if (a[this._numBrktsName] !== b[this._numBrktsName]) {
        return b[this._numBrktsName] - a[this._numBrktsName]; // descending
      } else {
        return a[this._timeStampName] - b[this._timeStampName]; // ascending
      }
    });
  }

  /**
   * adds bracket entries
   *
   * @param {playerEntryRow[]} playerEntries - array of player entry rows
   * @returns {void}
   */
  addBrktEntries(playerEntries: playerEntryRow[]): void {
    if (
      playerEntries == null ||
      !Array.isArray(playerEntries) ||
      playerEntries.length === 0
    ) {
      playerEntries = [];
      return;
    }
    // filter out player entries with no brackets
    this._brktEntries = cloneDeep(
      playerEntries.filter((entry) => entry[this._numBrktsName] > 0),
    );
  }

  /**
   * calculates total # full and one bye brackets based on player bracket entry rows
   *
   * @param {playerEntryRow[]} playerEntries - array of player entry rows for tmnt
   * @returns {void} - no return
   */
  calcTotalBrkts(playerEntries: playerEntryRow[]): void {
    // 1) clear
    // 2) remove all rows with no bracket entries
    // 3) validate bracket entries
    // 4) sort by # brackets (DESC), and createdAt (ASC)
    // 5) calculate # of brackets
    // 6) adjust player's # of brackets if/as needed

    const timeStampName = timeStampColName(this._brktId);
    // use object to calc total brackets, so the values
    // this._fullCount and this._oneByeCount are only set when needed
    const totalBrkts = { total: 0, full: 0, oneBye: 0 };
    let totalEntries = 0;

    /**
     * adjusts the number of brackets for each player when:
     *   players numBrkts > total brackets
     * adjusts the number of oneBye brackets when:
     *   oneBye brackets < 0
     *
     * @returns {void}
     */
    const adjustPlayersNumBrkts = (): void => {
      // // if no full brackets, no need to adjust, exit now
      // if (this._brktEntries.length < this.playersPerBrkt) return;

      // if less than 0 oneBye, calc correct full and reset one bye 
      if (totalBrkts.oneBye < 0) {
        totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
        // if got exactly (this.playersPerBrkt - 1) entries left
        // set oneBye to 1 else set oneByeto 0
        totalBrkts.oneBye =
          ((totalEntries - (totalBrkts.full * this.playersPerBrkt))
            === (this.playersPerBrkt - 1))
            ? 1
            : 0;        
        totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
      } else {
        // check if each player's numBrkts <= total brackets
        let pIndex = this._brktEntries.length - 1;
        while (pIndex >= 0) {
          if (
            this._brktEntries[pIndex][this._numBrktsName] > totalBrkts.total
          ) {
            break;
          }
          pIndex--;
        }
        // if pIndex < 0, all player's numBrkts <= total brackets, no need to adjust
        if (pIndex < 0) return;

        // adjust player's numBrkts where needed until valid numBrkts
        this._playersWithRefunds = true;
        pIndex = this._brktEntries.length - 1;
        let done = false;
        let newNumBrkts = totalBrkts.total;
        let newVal = 0;
        while (!done) {
          while (
            pIndex >= 0 &&
            this._brktEntries[pIndex][this._numBrktsName] <= totalBrkts.total
          ) {
            pIndex--;
          }
          if (pIndex >= 0) {
            // new value is min of brktEntRows[pIndex][numBrktsName] and totalBrkts.total
            if (newVal === 0) {
              newVal = Math.min(
                newNumBrkts,
                this._brktEntries[pIndex][this._numBrktsName] - 1,
              );
            }
            // const newVal = Math.min(newNumBrkts, this._brktEntries[pIndex][this._numBrktsName] - 1);
            this._brktEntries[pIndex][this._numBrktsName] = newVal;
          }
          calculateNumBrackets();
          if (
            pIndex === 0 &&
            this._brktEntries[0][this._numBrktsName] === totalBrkts.total
          ) {
            done = true;
            if (totalBrkts.oneBye < 0) {
              totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
              totalBrkts.oneBye = 0;
              totalBrkts.total = totalBrkts.full;
            }
          } else {
            pIndex--;
            if (pIndex < 0) {
              pIndex = this._brktEntries.length - 1; // restart pIndex at last player
              newNumBrkts = totalBrkts.total;
              newVal = 0; // reset newVal
            }
          }
        }
      }
    };

    /**
     * calculates the number of brackets needed
     * sets values in totalBrkts object
     *
     * @returns {void}
     */
    const calculateNumBrackets = (): void => {
      const lowEntriesPerPerson = 2;

      // not enough data to calculate
      if (
        !this._brktEntries ||
        this._brktEntries.length === 0 ||
        this._brktEntries.length < this.playersPerBrkt - 1
      ) {
        totalBrkts.total = 0;
        totalBrkts.full = 0;
        totalBrkts.oneBye = 0;
        return;
      }

      // calculate total entries
      totalEntries = this._brktEntries.reduce(
        (total, brktEntry) => total + brktEntry[this._numBrktsName],
        0,
      );
      const ppOneBye = this.playersPerBrkt - 1;
      // not enough data to calculate
      if (totalEntries < ppOneBye) {
        totalBrkts.total = 0;
        totalBrkts.full = 0;
        totalBrkts.oneBye = 0;
        return;
      }

      // if # players = # playersPerBrkt with one bye - edge case min # of players
      if (this._brktEntries.length === this.playersPerBrkt - 1) {
        // set one bye to min to min of # brackets entered
        totalBrkts.oneBye = this._brktEntries.reduce(
          (min, brktEntry) => Math.min(min, brktEntry[this._numBrktsName]),
          Infinity,
        );
      // else # players >= # playersPerBrkt
      } else {
        let gotAnswer = false;
        let addToFull = 1;
        const maxFull =
          totalEntries / 8 < this.playersPerBrkt
            ? this.playersPerBrkt
            : totalEntries / 8 + 1; // OK not to be an int here
        totalBrkts.full = 0;
        while (!gotAnswer && totalBrkts.full <= maxFull) {
          totalBrkts.full += addToFull;
          totalBrkts.oneBye =
            (totalEntries - this.playersPerBrkt * totalBrkts.full) / ppOneBye;
          if (Number.isInteger(totalBrkts.oneBye)) {
            if (totalBrkts.oneBye <= ppOneBye) {
              gotAnswer = true;
              // low number of entries per person edge case
              if (
                totalBrkts.oneBye < 0 &&
                totalEntries / this._brktEntries.length < lowEntriesPerPerson
              ) {
                // if can fit exactly into one bye brackets
                if (Number.isInteger(totalEntries / ppOneBye)) {
                  totalBrkts.oneBye = totalEntries / ppOneBye;
                  totalBrkts.full = 0;
                } else {
                  // oneBye is negative, so this reduces full
                  totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
                  totalBrkts.oneBye = 0;
                }
              }
            }
            addToFull = ppOneBye;
          }
        }
      }
      totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
    };

    /**
     * checks if bracket entries are valid before calculations
     *
     * @returns {boolean} - true if bracket entries are valid
     */
    const validBrktEntries = (): boolean => {
      if (!this._brktEntries || this._brktEntries.length === 0) return false;
      let b = 0;
      while (b < this._brktEntries.length) {
        if (
          !this._brktEntries[b].player_id ||
          this._brktEntries[b].player_id === "" ||
          !this._brktEntries[b][this._numBrktsName] ||
          this._brktEntries[b][this._numBrktsName] <= 0 ||
          this._brktEntries[b][this._numBrktsName] > maxBrackets ||
          !Number.isInteger(this._brktEntries[b][this._numBrktsName]) ||
          !this._brktEntries[b][timeStampName]
        ) {
          this._errorCode = BracketList.errInvalidBrktEntries;
          return false;
        }
        b++;
      }
      return true;
    };

    // 1) clear and initialize brackets
    this.clear();            

    // 2) remove all rows with no bracket entries
    this.addBrktEntries(playerEntries);

    // 3) validate bracket entries
    if (validBrktEntries()) {
      // if enough data to calculate
      if (
        this._brktEntries &&
        this._brktEntries.length > 0 &&
        this._brktEntries.length >= this.playersPerBrkt - 1
      ) {
        // 4) sort by # brackets (DESC), and createdAt (ASC)
        this.sortBrktEntries();

        // 5) calculate # of brackets
        calculateNumBrackets();

        // 6) adjust player's # of brackets if/as needed
        adjustPlayersNumBrkts();
      }
    }

    this._fullCount = totalBrkts.full;
    this._oneByeCount = totalBrkts.oneBye;
    this._totalEntries = totalEntries;
  }

  /**
   * checks to see if brackets can be randomized
   * checks for:
   * - enough players for brackets
   * - enough brackets
   * - all entries can be assigned to brackets
   *
   * @returns {boolean} - true if brackets can be randomized, false otherwise
   */
  canRandomize(): boolean {
    if (this._errorCode !== BracketList.noError) { 
      if (this._errorCode === BracketList.errInvalidBrktEntries) {
        this._errorMessage = "Invalid bracket entries";
      } else { 
        this._errorMessage = "Unknown error";
      }
      return false;
    } 
    if (this._brktEntries.length < this.playersPerBrkt - 1) {
      this._errorCode = BracketList.errCantRandomize;
      this._errorMessage = "Not enough players for brackets";
      return false;
    }
    if (this.fullCount <= 0 && this.oneByeCount <= 0) {
      this._errorCode = BracketList.errCantRandomize;
      this._errorMessage = "No brackets";
      return false;
    }
    if (
      this._fullCount * this.playersPerBrkt +
        this._oneByeCount * (this.playersPerBrkt - 1) !==
      this.totalEntries
    ) {
      this._errorCode = BracketList.errCantRandomize;
      this._errorMessage =
        "Not all entries can be assigned to brackets. Adjust entries";
      return false;
    }
    return true;
  }

  /**
   * clears all brackets and associated data
   */
  clear(): void {
    this._brackets = [];
    this._fullCount = 0;
    this._oneByeCount = 0;
    this._brktCounts.forFullValues.length = 0;
    this._brktCounts.forOneByeValues.length = 0;
    this._randomizeErrors.length = 0;
    this._errorCode = BracketList.noError;
    this._errorMessage = "";
    this._playersWithRefunds = false;
  }

  /**
   * counts the number of brackets player is in 1st position in match
   * NOTE: this is only valid BEFORE radmomizing matches in a bracket
   *
   * @param {string} playerId - player id to count brackets for
   * @returns {number} - number of brackets the player is in
   */
  count1stPosBrktsForPlayer(playerId: string): number {
    let count = 0;
    for (let b = 0; b < this._brackets.length; b++) {
      if (this._brackets[b].players.includes(playerId)) {
        const playerIndex = this._brackets[b].players.indexOf(playerId);
        if (!isOdd(playerIndex)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * counts the number of brackets player is in 2nd position in match
   * NOTE: this is only valid BEFORE radmomizing matches in a bracket
   *
   * @param {string} playerId - player id to count brackets for
   * @returns {number} - number of brackets the player is in
   */
  count2ndPosBrktsForPlayer(playerId: string): number {
    let count = 0;
    for (let b = 0; b < this._brackets.length; b++) {
      if (this._brackets[b].players.includes(playerId)) {
        const playerIndex = this._brackets[b].players.indexOf(playerId);
        if (isOdd(playerIndex)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * creates a map of how many brackets each opponent can fill
   * only used for testing
   *
   * @param {number} playerIndex - player index in this._brktEntries
   * @param {number} playerNumBrkts - number of brackets player need to be filled
   * @param {Map<string, number>} neededCountMap - map of how many brackets each player needs
   * @returns {Map<string, number>} - map of how many brackets each opponent can fill
   */
  createOppoMapForTesting(
    playerIndex: number,
    playerNumBrkts: number,
    neededCountMap: Map<string, number>,
  ): Map<string, number> {
    const comPlayerId = this._brktEntries[playerIndex].player_id;

    const playerStartingIndex = playerIndex + 1; // next player in this._brktEntries
    const oppoMap = new Map<string, number>();

    // get total number of available entries to assign
    let totalAvail = 0;
    for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
      // get how many brackets the opponent still needs
      totalAvail += neededCountMap.get(this._brktEntries[p].player_id)!;
    }
    const remainingOppos = this._brktEntries.length - playerStartingIndex;
    // get # of entries can assign to each oppo
    for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
      // get how many brackets the opponent still needs
      const oppoNeededCount = neededCountMap.get(
        this._brktEntries[p].player_id,
      )!;
      // get # of brackets the opponent has entered
      const oppoEntered = this._brktEntries[p][this._numBrktsName];
      // get % of available entries
      const percentOfAvail = oppoNeededCount / totalAvail;
      let oppoMapValue = oppoNeededCount * percentOfAvail;
      // round up to nearest integer
      oppoMapValue = Number.isInteger(oppoMapValue)
        ? oppoMapValue
        : Math.ceil(oppoMapValue);
      if (oppoMapValue > 1 && oppoEntered < this._dupThreshold) {
        oppoMapValue = 1;
      }
      oppoMap.set(this._brktEntries[p].player_id, oppoMapValue);
    }
    if (oppoMap.size === 0) {
      return new Map<string, number>();
    }

    const values = Array.from(oppoMap.values());
    let sumOfValues = values.reduce((sum, value) => sum + value, 0);
    if (sumOfValues === 0) {
      return new Map<string, number>();
    }
    if (sumOfValues < playerNumBrkts) {
      const max = Math.max(...values);
      const uniqueValues = Array.from(
        new Set(
          this._brktEntries.map((brktEntry) => brktEntry[this._numBrktsName]),
        ),
      );
      let i = 0;
      while (sumOfValues < playerNumBrkts && i < uniqueValues.length) {
        const filteredPlayers = this._brktEntries.filter(
          (brktEntry) => brktEntry[this._numBrktsName] === uniqueValues[i],
        );
        if (filteredPlayers.length > 0) {
          let f = 0;
          while (f < filteredPlayers.length) {
            const oppoId = filteredPlayers[f].player_id;
            if (oppoMap.has(oppoId)) {
              const oppoValue = oppoMap.get(oppoId)!;
              if (
                (max === 1 && oppoValue === 1) ||
                (max > 1 && oppoValue < max)
              ) {
                oppoMap.set(oppoId, oppoValue + 1);
                sumOfValues++;
              }
            }
            f++;
          }
        }
        i++;
      }
    }
    if (sumOfValues === 0) {
      return new Map<string, number>();
    }
    if (sumOfValues < playerNumBrkts) {
      return new Map<string, number>();
    }

    return oppoMap;
  }

  // /**
  //  *
  //  * @param {number} playerIndex - player index in this._brktEntries
  //  * @param {number} playerNumBrkts - number of brackets player need to be filled
  //  * @param {Map<string, number>} neededCountMap - map of how many brackets each player needs
  //  * @returns {Map<string, number>} - map of how many brackets each opponent can fill
  //  */
  // createOppoMapForTesting(
  //   playerIndex: number,
  //   playerNumBrkts: number,
  //   neededCountMap: Map<string, number>
  // ): Map<string, number> {
  //   const comPlayerId = this._brktEntries[playerIndex].player_id;

  //   const playerStartingIndex = playerIndex + 1; // next player in this._brktEntries
  //   const oppoMap = new Map<string, number>();

  //   // get total number of available entries to assign
  //   let totalAvail = 0;
  //   for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
  //     // get how many brackets the opponent still needs
  //     totalAvail += neededCountMap.get(this._brktEntries[p].player_id)!;
  //   }
  //   const remainingOppos = this._brktEntries.length - playerStartingIndex;
  //   // get # of entries can assign to each oppo
  //   for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
  //     // get how many brackets the opponent still needs
  //     const oppoNeededCount = neededCountMap.get(
  //       this._brktEntries[p].player_id
  //     )!;
  //     // get # of brackets the opponent has entered
  //     const oppoEntered = this._brktEntries[p][this._numBrktsName];
  //     // get % of available entries
  //     const percentOfAvail = oppoNeededCount / totalAvail;
  //     let oppoMapValue = oppoNeededCount * percentOfAvail;
  //     // round up to nearest integer
  //     oppoMapValue = Number.isInteger(oppoMapValue)
  //       ? oppoMapValue
  //       : Math.ceil(oppoMapValue);
  //     if (oppoMapValue > 1 && oppoEntered < this._dupThreshold) {
  //       oppoMapValue = 1;
  //     }
  //     oppoMap.set(this._brktEntries[p].player_id, oppoMapValue);
  //   }
  //   if (oppoMap.size === 0) {
  //     return new Map<string, number>();
  //   }

  //   const values = Array.from(oppoMap.values());
  //   let sumOfValues = values.reduce((sum, value) => sum + value, 0);
  //   if (sumOfValues === 0) {
  //     return new Map<string, number>();
  //   }
  //   if (sumOfValues < playerNumBrkts) {
  //     const max = Math.max(...values);
  //     const uniqueValues = Array.from(
  //       new Set(
  //         this._brktEntries.map((brktEntry) => brktEntry[this._numBrktsName])
  //       )
  //     );
  //     let i = 0;
  //     while (sumOfValues < playerNumBrkts && i < uniqueValues.length) {
  //       const filteredPlayers = this._brktEntries.filter(
  //         (brktEntry) => brktEntry[this._numBrktsName] === uniqueValues[i]
  //       );
  //       if (filteredPlayers.length > 0) {
  //         let f = 0;
  //         while (f < filteredPlayers.length) {
  //           const oppoId = filteredPlayers[f].player_id;
  //           if (oppoMap.has(oppoId)) {
  //             const oppoValue = oppoMap.get(oppoId)!;
  //             if (
  //               (max === 1 && oppoValue === 1) ||
  //               (max > 1 && oppoValue < max)
  //             ) {
  //               oppoMap.set(oppoId, oppoValue + 1);
  //               sumOfValues++;
  //             }
  //           }
  //           f++;
  //         }
  //       }
  //       i++;
  //     }
  //   }
  //   if (sumOfValues === 0) {
  //     return new Map<string, number>();
  //   }
  //   if (sumOfValues < playerNumBrkts) {
  //     return new Map<string, number>();
  //   }

  //   if (playerIndex > 1000) {
  //     console.log("playerId: ", comPlayerId);
  //   }

  //   return oppoMap;
  // }

  // TEST FUNCTIONS FOR calcTotalBrkts functions - START

  // adjustPlayersNumBrkts(brktEntRows: playerEntryRow[], totalBrkts: totalBrktsType): void {

  //   // if less than 0 oneBye, calc correct full and reset one bye to 1
  //   if (totalBrkts.oneBye < 0) {
  //     totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
  //     totalBrkts.oneBye = 1;
  //     totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
  //   } else {
  //     // check if each player's numBrkts <= total brackets
  //     let pIndex = brktEntRows.length - 1;
  //     const numBrktsName = entryNumBrktsColName(this._brktId);
  //     while (pIndex >= 0) {
  //       if (brktEntRows[pIndex][numBrktsName] > totalBrkts.total) {
  //         break;
  //       }
  //       pIndex--;
  //     }
  //     // if pIndex < 0, all player's numBrkts <= total brackets, no need to adjust
  //     if (pIndex < 0) return;

  //     // adjust player's numBrkts where needed until valid numBrkts
  //     pIndex = brktEntRows.length - 1;
  //     let done = false;
  //     let pIndexReset = -1;
  //     let tBrkts = totalBrkts.total;
  //     while (!done) {
  //       while (pIndex >= 0 && brktEntRows[pIndex][numBrktsName] <= totalBrkts.total) {
  //         pIndex--;
  //       }
  //       if (pIndex >= 0) {
  //         // new value is min of brktEntRows[pIndex][numBrktsName] and totalBrkts.total
  //         brktEntRows[pIndex][numBrktsName] = Math.min(tBrkts, brktEntRows[pIndex][numBrktsName] - 1);
  //         if (pIndexReset === -1) {
  //           pIndexReset = pIndex;
  //         }
  //       }
  //       this.calculateNumBrackets(brktEntRows, totalBrkts);
  //       if (pIndex === 0 && brktEntRows[0][numBrktsName] === totalBrkts.total) {
  //         done = true;
  //       } else {
  //         pIndex--;
  //         if (pIndex < 0) {
  //           pIndex = pIndexReset;
  //           tBrkts = totalBrkts.total;
  //         }
  //       }
  //     }
  //   }
  // }

  // calculateNumBrackets(brktEntRows: playerEntryRow[], totalBrkts: totalBrktsType): void {
  //   totalBrkts.total = 0;
  //   totalBrkts.full = 0;
  //   totalBrkts.oneBye = 0;
  //   if (!brktEntRows || brktEntRows.length === 0) return;
  //   const numBrktsName = entryNumBrktsColName(this._brktId)
  //   let totalEntries = 0;
  //   brktEntRows.forEach(brktEntRow => {
  //     totalEntries += brktEntRow[numBrktsName]
  //   });
  //   let gotAnswer = false;
  //   let gotInt = false;
  //   let addToFull = 1;
  //   const ppFull = this.playersPerBrkt;
  //   const ppOneBye = ppFull - 1;
  //   const maxFull = (totalEntries / 8) < ppFull ? ppFull : (totalEntries / 8) + 1; // OK not to be an int here
  //   while (!gotAnswer && totalBrkts.full <= maxFull) {
  //     totalBrkts.full += addToFull;
  //     totalBrkts.oneBye = (totalEntries - (this.playersPerBrkt * totalBrkts.full)) / ppOneBye;
  //     if (Number.isInteger(totalBrkts.oneBye)) {
  //       gotInt = true;
  //       if (totalBrkts.oneBye <= ppOneBye) {
  //         gotAnswer = true;
  //       }
  //       addToFull = ppOneBye
  //     }
  //   }
  //   totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
  // }

  // TEST FUNCTIONS FOR FUNCS IN RANDOMIZE - START, ENDS AT randomize

  // /**
  //  *
  //  * @returns
  //  */
  // createByeEntry(): void {
  //   if (this._oneByeCount === 0) {
  //     this._byeEntry = {};
  //     return;
  //   }
  //   const id = btDbUuid('ply')
  //   // create a bye player with corret # of brackets
  //   const entryData: playerEntryRow = {
  //     id: id,
  //     player_id: id,
  //     first_name: 'Bye',
  //     last_name: 'Bye',
  //     average: 0,
  //     [this.numBrktsName]: this._oneByeCount,
  //   } as playerEntryRow;

  //   this._byeEntry = entryData
  // }

  // /**
  //  *
  //  * @param playerIndex
  //  * @param neededCountMap
  //  * @returns
  //  */
  // createOppoMap(playerIndex: number, neededCountMap: Map<string, number>): Map<string, number> {
  //   const playerStartingIndex = playerIndex + 1; // next player in this._brktEntries
  //   const oppoMap = new Map<string, number>();
  //   const possibleOpps = (this._brktEntries.length - playerStartingIndex) - 1;
  //   const playerNumBrkts = this._brktEntries[playerIndex][this.numBrktsName];

  //   let maxInitOppo;
  //   if (possibleOpps >= playerNumBrkts) {
  //     maxInitOppo = 1;
  //   } else {
  //     maxInitOppo = (possibleOpps / playerNumBrkts)
  //     if (!Number.isInteger(maxInitOppo)) {
  //       maxInitOppo = Math.floor(maxInitOppo) + 1;
  //     }
  //   }
  //   for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
  //     const oppoNeededCount = neededCountMap.get(this._brktEntries[p].player_id)!;
  //     let oppoMapValue = (oppoNeededCount < maxInitOppo) ? oppoNeededCount : maxInitOppo;
  //     if (playerNumBrkts >= this._dupThreshold && oppoNeededCount >= this._dupThreshold) {
  //       oppoMapValue++;
  //     }
  //     oppoMap.set(this._brktEntries[p].player_id, oppoMapValue);
  //   }
  //   return oppoMap;
  // }

  // getAvailBrktsForPlayers = (playerId: string, oppoId: string, openBrktIndex: number): number[] => {

  //   const availBrktIndexs: number[] = [];
  //   const openBrkt = this._brackets[openBrktIndex].players;
  //   for (let i = 0; i < this._brackets.length; i++) {
  //     if (i !== openBrktIndex) {
  //       const players = this._brackets[i].players;
  //       if (!(players.includes(playerId) || players.includes(oppoId))) {
  //         const lastTwo = players.slice(-2);
  //         if (!(openBrkt.includes(lastTwo[0]) || openBrkt.includes(lastTwo[1]))) {
  //           availBrktIndexs.push(i);
  //         }
  //       }
  //     }
  //   }
  //   return availBrktIndexs;
  // };

  // /**
  //  *
  //  * @param bIndex
  //  * @param id
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // isBrktIdxAvailForPlayer(bIndex: number, id: string, playersBrktsMap: Map<string, Set<number>>): boolean {
  //   const playerBrktSet = playersBrktsMap.get(id)!;
  //   return playerBrktSet ? !(playerBrktSet.has(bIndex)) : false;
  // }

  // /**
  //  * gets a list of avalable bracket indexes for player
  //  *
  //  * @param playerId
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // getAvailBrktIdxesForPlayer(playerId: string, playersBrktsMap: Map<string, Set<number>>): number[] {
  //   const playerSet = playersBrktsMap.get(playerId);
  //   if (!playerSet) return [];
  //   const allBrktIndexs = Array.from({ length: this._brackets.length }, (_, index) => index);
  //   return allBrktIndexs.filter(brktIndex => !playerSet.has(brktIndex));
  // }

  // /**
  //  * gets the intersection of two arrays, items in both arrays
  //  *
  //  * @param arr1
  //  * @param arr2
  //  * @returns
  //  */
  // getIntersection(arr1: number[], arr2: number[]): number[] {
  //   const arr2Set = new Set(arr2);
  //   return arr1.filter(item => arr2Set.has(item));
  // }
  //
  // getOpenBracketIndex = (): number => {
  //   // if not just one open bracket, return -1
  //   // if (currentNumMatches() !== allMatchesButOne) return -1;
  //   for (let b = 0; b < this._brackets.length; b++) {
  //     if (this._brackets[b].players.length < this.playersPerBrkt) return b;
  //   }
  //   return -1;
  // };
  //
  // /**
  //  * gets list of bracket indexes for player, which can move to another bracket
  //  *
  //  * @param playerId
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // getPlayersCanMoveMatchBrktIdxes(playerId: string, playersBrktsMap: Map<string, Set<number>>): number[] {
  //   const playerSet = playersBrktsMap.get(playerId);
  //   const avail: number[] = [];
  //   playerSet?.forEach((brktIndex) => {
  //     if (brktIndex === this._brackets.length) return [];
  //     const playersLength = this._brackets[brktIndex].players.length;
  //     // if got players in the bracket, and the 2nd to last player is the player
  //     // then add the bracket index to avail
  //     if (playersLength >= 2
  //       && this._brackets[brktIndex].players[playersLength - 2] === playerId)
  //     {
  //       avail.push(brktIndex);
  //     }
  //   })
  //   return avail;
  // }

  // /**
  //  *
  //  * @param oppoId
  //  * @param shuffledBrktsForPlayer
  //  * @param playerId
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // getRandomBracketIndexForMatch(
  //   oppoId: string,
  //   shuffledBrktsForPlayer: number[],
  //   playerId: string,
  //   playersBrktsMap: Map<string, Set<number>>
  // ): number {
  //   if (!shuffledBrktsForPlayer || shuffledBrktsForPlayer.length === 0) {
  //     this._errorMessage = 'Invalid shuffled brackets index for player id: ' + playerId;
  //     return BracketList.errInvalidShuffledBrktIndex
  //   }
  //   for (let i = 0; i < shuffledBrktsForPlayer.length; i++) {
  //     const bIndex = shuffledBrktsForPlayer[i];
  //     if (this.isBrktIdxAvailForPlayer(bIndex, playerId, playersBrktsMap)
  //         && this.isBrktIdxAvailForPlayer(bIndex, oppoId, playersBrktsMap)) {
  //       shuffledBrktsForPlayer.splice(i, 1);
  //       return bIndex;
  //     }
  //   }
  //   return -1;
  // }

  // /**
  //  *
  //  * @param playerId
  //  * @param oppoId
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // getSwapIndexesForMatch(playerId: string, oppoId: string, playersBrktsMap: Map<string, Set<number>>): number[] {
  //   // step 1 - get match indexes that can be moved for player
  //   const plyCanMove = this.getPlayersCanMoveMatchBrktIdxes(playerId, playersBrktsMap);
  //   if (!plyCanMove || plyCanMove.length === 0) return [];
  //   // step 2 - get available brackets for opponent
  //   const oppoAvail = this.getAvailBrktIdxesForPlayer(oppoId, playersBrktsMap);
  //   if (!oppoAvail || oppoAvail.length === 0) return []
  //   // step 3 - get intersection of plyCanMove and oppoAvail
  //   const fromIndexes = this.getIntersection(plyCanMove, oppoAvail);
  //   if (fromIndexes.length === 0) return []
  //   // step 4 - get first opponent from step 3 intersection
  //   // for each opponent in canMove brackets for player
  //   let cmIndex = 0;
  //   while (cmIndex < fromIndexes.length) {
  //     const sfIndex = fromIndexes[cmIndex];
  //     // step 4 - get first opponent from step 3 intersection
  //     const swapOppoId = this._brackets[sfIndex].players[this._brackets[sfIndex].players.length - 1];
  //     // step 5 - get avaliable brackets for swapOppoId
  //     const swapOppoAvail = this.getAvailBrktIdxesForPlayer(swapOppoId, playersBrktsMap);
  //     if (!swapOppoAvail || swapOppoAvail.length === 0) {
  //       cmIndex++;
  //     } else {
  //       // step 6 - get available brackets for playerId
  //       const playerAvail = this.getAvailBrktIdxesForPlayer(playerId, playersBrktsMap);
  //       if (!playerAvail || playerAvail.length === 0) {
  //         cmIndex++;
  //       } else {
  //         // step 7 - get intersection of swapOppoAvail and playerAvail
  //         const toIndexes = this.getIntersection(swapOppoAvail, playerAvail);
  //         if (toIndexes.length === 0) {
  //           cmIndex++;
  //         } else {
  //           const toIndex = toIndexes[0];
  //           return [sfIndex, toIndex];
  //         }
  //       }
  //     }
  //   }
  //   // if got here, then cant swap match
  //   return [];
  // }

  // /**
  //  * tests if match is valid
  //  *
  //  * @param {string} playerInfo - player id
  //  * @param {playerUsedType} oppoInfo - opponent info
  //  * @returns: matchTestCodes:
  //  *    0 = Valid - match is valid,
  //  *    -1 = Used - opponent at index sIndex has already been used
  //  *    -2 = Self - cannot have a match against self
  //  *    -3 = Past - opponent has already had all their brackets set
  //  *    -4 = Prior - opposition already has a match vs player
  //  */
  // matchTest(
  //   oppoInfo: playerUsedType,
  //   playerId: string,
  //   pastPlayersSet: Set<string>,
  //   oppoMap: Map<string, number>
  // ): matchTestCodes {

  //   // has opponent entry been used
  //   if (oppoInfo.used) {
  //     return matchTestCodes.Used;
  //   }
  //   // cant have a match vs self
  //   if (playerId === oppoInfo.playerId) {
  //     return matchTestCodes.Self;
  //   }
  //   // cant have a match vs past player
  //   if (pastPlayersSet.has(oppoInfo.playerId)) {
  //     return matchTestCodes.Past;
  //   }
  //   // cant have duplicate matches
  //   const oppoMatchInfo = oppoMap.get(oppoInfo.playerId);
  //   // if no opposition matches left, then already have a match
  //   if (oppoMatchInfo === undefined || oppoMatchInfo === 0) {
  //     return matchTestCodes.Prior;
  //   }
  //   return matchTestCodes.Valid;
  // }

  // /**
  //  * moves a match
  //  * @returns
  //  */
  // moveMatch(
  //   playerId: string,
  //   swapIndexes: number[],
  //   playersBrktsMap: Map<string, Set<number>>,
  // ): number {
  //   if (!swapIndexes
  //     || swapIndexes.length !== 2
  //     || swapIndexes[0] === swapIndexes[1])
  //   {
  //     this._errorMessage = 'Cannot move match: Invalid swapIndexes for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   const fromBrktIndex = swapIndexes[0];
  //   const toBrktIndex = swapIndexes[1];
  //   if (this._brackets[fromBrktIndex].players.length < 2) {
  //     this._errorMessage = 'Cannot move match: Invalid players in from bracket for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   // get opponent to move
  //   const swapOppoId = this._brackets[fromBrktIndex].players.pop()!;
  //   if (swapOppoId === playerId) {
  //     this._brackets[fromBrktIndex].players.push(swapOppoId);
  //     this._errorMessage = 'Cannot move match: Opponent is invalid in from bracket for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   // confirm player vs opponent
  //   const poppedPlayerId = this._brackets[fromBrktIndex].players.pop()!;
  //   if (poppedPlayerId !== playerId) {
  //     this._brackets[fromBrktIndex].players.push(poppedPlayerId);
  //     this._errorMessage = 'Cannot move match: Player not found in from bracket for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   // move match to new bracket
  //   const plysInBrkt = this.brackets[toBrktIndex].addMatch([playerId, swapOppoId]);
  //   if (plysInBrkt < 0) {
  //     this._errorMessage = 'Cannot move match: Error moving match to new toIndex for player id: ' + playerId;
  //     return plysInBrkt;
  //   }
  //   const playerSet = playersBrktsMap.get(playerId);
  //   if (!playerSet) {
  //     this._errorMessage = 'Cannot move match: Invalid player brackets set for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   const oppoSet = playersBrktsMap.get(swapOppoId);
  //   if (!oppoSet) {
  //     this._errorMessage = 'Cannot move match: Invalid opponent brackets set for player id: ' + playerId;
  //     return BracketList.errCantMovematch;
  //   }
  //   // update player and opponent bracket sets
  //   playerSet.delete(fromBrktIndex);
  //   playerSet.add(toBrktIndex);
  //   oppoSet.delete(fromBrktIndex);
  //   oppoSet.add(toBrktIndex);
  //   // return new available bracket for player
  //   return fromBrktIndex;
  // }

  // /**
  //  *
  //  * @param oppoId
  //  * @param playerId
  //  * @param shuffledBrktsForPlayer
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // putMatchInBracket(
  //   oppoId: string,
  //   playerId: string,
  //   shuffledBrktsForPlayer: number[],
  //   playersBrktsMap: Map<string, Set<number>>,
  // ): number {
  //   let brktIndex = this.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);

  //   // if error in shuffledBrktsForPlayer
  //   if (brktIndex === BracketList.errInvalidShuffledBrktIndex) {
  //     // error message set in getRandomBracketIndexForMatch
  //   } else if (brktIndex === -1) {  // cant create a match
  //     const swapIndexes = this.getSwapIndexesForMatch(playerId, oppoId, playersBrktsMap);
  //     if (!swapIndexes || swapIndexes.length === 0) {
  //       return BracketList.reRandomize;
  //     }
  //     brktIndex = this.moveMatch(playerId, swapIndexes, playersBrktsMap);
  //     if (brktIndex >= 0) {
  //       this._brackets[swapIndexes[0]].addMatch([playerId, oppoId]);
  //     }
  //   } else {                        // create the match
  //     const pLength = this._brackets[brktIndex].addMatch([playerId, oppoId]);
  //     if (pLength < 0 || pLength > this.playersPerBrkt) {
  //       return BracketList.reRandomize;;
  //     }
  //   }
  //   return brktIndex;
  // }

  // /**
  //  *
  //  * @param playerId
  //  * @param numBrkts
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // setShuffledBrktsForPlayer(playerId: string, numBrkts: number, playersBrktsMap: Map<string, Set<number>>): number[] {
  //   // get a set of all bracket indexes
  //   const allIndexes = new Set<number>(Array.from({ length: numBrkts }, (_, index) => index));
  //   // get the set of all used indexes for this player
  //   const playerBrktSet = playersBrktsMap.get(playerId);
  //   // remove used indexes
  //   if (playerBrktSet) {
  //     playerBrktSet.forEach((brktIndex) => {
  //       allIndexes.delete(brktIndex);
  //     })
  //   }
  //   // create array of avalable indexes
  //   const shuffledBrktsForPlayer = Array.from(allIndexes);
  //   shuffleArray(shuffledBrktsForPlayer);
  //   return shuffledBrktsForPlayer;
  // }

  // /**
  //  *
  //  * @param id
  //  * @param brktIndex
  //  * @param playersBrktsMap
  //  * @returns
  //  */
  // updatePlayerSet(id: string, brktIndex: number, playersBrktsMap: Map<string, Set<number>>): number {
  //   const playerBrktSet = playersBrktsMap.get(id);
  //   if (!playerBrktSet) {
  //     this._errorMessage = 'Invalid player brackets set for player id: ' + id;
  //     return BracketList.errInvalidPlayerBrktSet;
  //   }
  //   playerBrktSet.add(brktIndex);
  //   return brktIndex;
  // }

  // /**
  //  * updates current player's opposition map
  //  *
  //  * @param oppoId - opponent id
  //  * @param oppoMap - current player's opposition map
  //  * @returns {void}
  //  */
  // updateOppoMap(oppoId: string, oppoMap: Map<string, number>): void  {
  //   if (oppoMap.has(oppoId)) {
  //     const remaining = oppoMap.get(oppoId)! - 1;
  //     if (remaining <= 0) {
  //       oppoMap.delete(oppoId);
  //     } else {
  //       oppoMap.set(oppoId, remaining);
  //     }
  //   }
  // }

  // END OF RANDOMIZE TEST CODE

  // /**
  //  * just for testing the for loop in randomize
  //  *
  //  * @param sIndex - index into shuffled array
  //  * @param startIndex - starting index for player in shuffled array
  //  * @param shuffled - shuffled array
  //  * @param playerNumBrkts - number of brackets for player
  //  * @param pStart - starting index for player
  //  * @param pastPlayersSet - set of past players (players who have had all their brackets set)
  //  * @param testShuffledBrackets - array of shuffled brackets for player
  //  * @returns
  //  */
  // randomForLoopTest(
  //   sIndex: number,
  //   startIndex: number,
  //   shuffled: playerUsedType[],
  //   pStart: number,
  //   pStop: number,
  //   pastPlayersSet: Set<string>,
  //   testShuffledBrackets: number[],
  //   neededCountMap: Map<string, number>,
  //   playersBrktsMap: Map<string, Set<number>>,
  // ): void {

  //   // for (let p = 0; p < this._brktEntries.length - 1; p++) {
  //   for (let p = pStart; p < pStop; p++) {
  //     // playerId = this._brktEntries[p].player_id;
  //     const playerId = this._brktEntries[p].player_id;
  //     let playerNumBrkts = this._brktEntries[p][this._numBrktsName];
  //     if (playerNumBrkts <= 0) {
  //       this._errorCode = BracketList.errNoBracketsForPlayer;
  //       this._errorMessage = `No brackets for player ${playerId}`;
  //       return;
  //     }
  //     const playerBrktSet = playersBrktsMap.get(playerId);
  //     if (!playerBrktSet) {
  //       this._errorCode = BracketList.errInvalidPlayerBrktSet;
  //       this._errorMessage = `Cannot randomize. Invalid player brackets set for player: ${playerId}`;
  //       return
  //     }
  //     // remove # brackets already assigned
  //     playerNumBrkts -= playerBrktSet.size;

  //     startIndex = -1;

  //     // this.setShuffledBrktsForPlayer(playerId, playerNumBrkts, playersBrktsMap);
  //     // const shuffledBrktsForPlayer = this.setShuffledBrktsForPlayer(playerId, playerNumBrkts, playersBrktsMap);
  //     const shuffledBrktsForPlayer = testShuffledBrackets;

  //     // this.createOppoMap(p, neededCountMap);
  //     const oppoMap = this.createOppoMap(p, neededCountMap);

  //     for (let b = 0; b < playerNumBrkts; b++) {
  //       let needMatch = true;
  //       while (needMatch) {
  //         const matchTestResult = this.matchTest(shuffled[sIndex], playerId, pastPlayersSet, oppoMap);
  //         if (matchTestResult === matchTestCodes.Valid) {
  //           const bIndex = this.putMatchInBracket(shuffled[sIndex].playerId, playerId, shuffledBrktsForPlayer, playersBrktsMap);
  //           if (bIndex < 0) {
  //             if (bIndex === BracketList.reRandomize) {
  //               // no error messahe for re-randomize
  //               this._errorCode = BracketList.reRandomize;
  //               return;
  //             }
  //             this._errorMessage = `Cannot randomize. Invalid bracket index for player: ${playerId}`;
  //             this._errorCode = BracketList.errInvalidBracketIndex;
  //             return;
  //           } else {
  //             this.updatePlayerSet(playerId, bIndex, playersBrktsMap);
  //             this.updatePlayerSet(shuffled[sIndex].playerId, bIndex, playersBrktsMap)
  //           }
  //           this.updateOppoMap(shuffled[sIndex].playerId, oppoMap);
  //           shuffled[sIndex].used = true;
  //           needMatch = false;
  //         } else if (matchTestResult === matchTestCodes.Prior) {
  //           if (startIndex === -1) startIndex = sIndex;
  //           // DO NOT UPDATE shuffled[sIndex].used
  //         } else { // match vs self, match vs past player, duplicate match
  //           shuffled[sIndex].used = true;
  //         }
  //         sIndex++;
  //         if (sIndex >= shuffled.length) {
  //           this._errorMessage = `Cannot randomize brackets for player: ${playerId}`;
  //           this._errorCode = BracketList.errCantRandomize;
  //           return;
  //         }
  //       }
  //     }

  //     pastPlayersSet.add(playerId);
  //   }
  // }

  randomize(forTesting: playerUsedType[]): void {
    // 1) check if valid brackets
    // 2) create needed # of brackets
    // 3) create array of all bracket entries (using sorted brktEntries)
    //  3a) add needed bye entries to bracket entries & resort
    //  3b) create array of all bracket entries (using sorted brktEntries)
    //      if a player has 10 entries, then player has 10 items in array
    //  3d) shuffle the array using Fisher-Yates algorithm
    // 4) for each player in brktEntries
    //  4a) create a map of how many times a player can face an opponent
    //  4b) create a map of how many brackets a player has entered
    // 5) for each player in entred into brackets (most entroes to least)
    //  5a) get array of available brackets indexes for player
    //  5b) shuffle the array of available brackets indexes
    //  5c) get opponent for player from shuffled array in step 3d
    //  5d) if impossible to assign a match
    //   5d1) reshuffle array from step 3d
    //   5d2) reset maps and sets
    //   5d3) go to step 4

    this.randomizeErrors.length = 0;
    const neededCountMap = new Map<string, number>(); // map of how many brackerts player still needs
    let oppoMap = new Map<string, number>(); // map of how many times a player can face an opponent
    // set of past players who have had all their brackets set, starts empty
    let pastPlayersSet = new Set<string>();
    let playerId = "";
    let shuffledBrktsForPlayer: number[] = [];
    const allMatchesButOne =
      ((this._fullCount + this._oneByeCount) * this.playersPerBrkt) / 2 - 1;

    // key is playerId
    // value is set of indexes of brackets player has been entered into
    const playersBrktsMap = new Map<string, Set<number>>();

    /**
     * create a bye entry if needed.
     *
     * bye entry has correct # of brackets to make all brackets full
     *
     * @returns {void}
     */
    const createByeEntry = (): void => {
      if (this._oneByeCount === 0) {
        this._byeEntry = {};
        this._byePlayer = blankPlayer;
        return;
      }
      if (gotByeEntries()) return;
      // if (this._addedBye) return;
      // this._addedBye = true;
      // create a bye player with corret # of brackets
      const entryData: playerEntryRow = {
        id: this._byePlayer.id,
        player_id: this._byePlayer.id,
        first_name: "Bye",
        average: 0,
        [this.numBrktsName]: this._oneByeCount,
        createdAt: new Date().setFullYear(3000),
      } as playerEntryRow;

      this._byeEntry = entryData;
    };

    /**
     * create map of how many times a player can face an opponent
     *
     * @param {number} playerIndex - index of player in this._brktEntries
     * @param {number} playerNumBrkts - number of brackets player need to be filled
     * @returns {number} -
     *  noError - successfully created oppoMap
     *  errCantCreateOppoMap - unable to populate oppoMap
     *  errNoValuesInOppoMap - no values in oppoMap
     *  errNotEnoughOppoEntries - not enough oppenent entries to fill brackets
     */
    const createOppoMap = (
      playerIndex: number,
      playerNumBrkts: number,
    ): number => {
      const playerStartingIndex = playerIndex + 1; // next player in this._brktEntries
      oppoMap.clear();

      // get total number of available entries to assign
      const totalAvail = getTotalAvalableBrkts(playerStartingIndex);
      if (totalAvail === 0) return BracketList.errCantCreateOppoMap;

      // get # of entries can assign to each oppo
      for (let p = playerStartingIndex; p < this._brktEntries.length; p++) {
        // get how many brackets the opponent still needs
        const oppoNeededCount = neededCountMap.get(
          this._brktEntries[p].player_id,
        )!;

        // get % of available entries
        const percentOfAvail = oppoNeededCount / totalAvail;
        let oppoMapValue = oppoNeededCount * percentOfAvail;
        // round up to nearest integer
        oppoMapValue = Number.isInteger(oppoMapValue)
          ? oppoMapValue
          : Math.ceil(oppoMapValue);

        if (oppoMapValue > 1) {
          const quotient = Math.floor(
            this._brktEntries[p][this.numBrktsName] / this._dupThreshold,
          );
          oppoMapValue = quotient + 1;
        }

        oppoMap.set(this._brktEntries[p].player_id, oppoMapValue);
      }
      if (oppoMap.size === 0) return BracketList.errNoValuesInOppoMap;

      const values = Array.from(oppoMap.values());
      let sumOfValues = values.reduce((sum, value) => sum + value, 0);
      if (sumOfValues === 0) return BracketList.errNoValuesInOppoMap;

      // if not enough entries in the oppo map, then add entries to the map
      if (sumOfValues < playerNumBrkts) {
        // if have 5 % of entries or less, then players with few entries
        // were shuffled to the end of the list. need to reshuffle to
        // prevent duplicate matches for these players
        if (playerNumBrkts / this._shuffled.length < 0.05) {
          return BracketList.errNotEnoughOppoEntries;
        }

        // get array of unique number of entries
        const uniqueSortedValues = Array.from(
          new Set(Array.from(neededCountMap.values())),
        ).sort((a, b) => b - a);
        let needToAdd = playerNumBrkts - sumOfValues;
        let u = 0;
        // while need to add ore oppos and still have unique values
        while (needToAdd > 0 && u < uniqueSortedValues.length) {
          // get all oppos with same number of entries
          const opposWithSameValue = Array.from(neededCountMap.entries())
            .filter(
              ([key, value]) =>
                value === uniqueSortedValues[u] && key !== playerId,
            )
            .map(([key, _]) => key);
          // create an array of the indexes, then randomize the indexes
          const randomIndexes = [];
          for (let i = 0; i < opposWithSameValue.length; i++) {
            randomIndexes.push(i);
          }
          shuffleArray(randomIndexes);
          let j = 0;
          // pick an oppo at random and add 1 to the oppoMap
          while (needToAdd > 0 && j < opposWithSameValue.length) {
            const oppoId = opposWithSameValue[randomIndexes[j]];
            let need = oppoMap.get(oppoId)!;
            if (need && need > 0) {
              oppoMap.set(oppoId, need + 1);
              sumOfValues++;
              needToAdd--;
            }
            j++;
          }
          u++;
        }
      }
      // if still not enough entries in the oppo map, then return error
      if (sumOfValues < playerNumBrkts)
        return BracketList.errNotEnoughOppoEntries;
      return BracketList.noError;
    };

    /**
     * Returns current number of matches in the brackets
     *
     * @returns {number} - current number of matches in the brackets
     */
    const currentNumMatches = (): number => {
      let total = 0;
      for (let b = 0; b < this._brackets.length; b++) {
        total += this._brackets[b].players.length;
      }
      return total / 2; // 2 players per match
    };

    /**
     * check if bracket index is available for player
     *
     * @param {number} bIndex - bracket index
     * @param {string} id - player id or opponent id
     * @returns {boolean} - true if bracket index is available for player
     */
    const isBrktIdxAvailForPlayer = (bIndex: number, id: string): boolean => {
      if (this._brackets[bIndex].players.length >= this.playersPerBrkt) {
        return false;
      }
      const playerBrktSet = playersBrktsMap.get(id)!;
      return playerBrktSet ? !playerBrktSet.has(bIndex) : false;
    };

    /**
     * gets available bracket indexes for the last match
     *
     * @param oppoId - opponent id
     * @param openBrktIndex - index of only open bracket
     * @returns - array of indexes that can have the last match
     */
    const getAvailBrktsForLastMatch = (
      oppoId: string,
      openBrktIndex: number,
    ): number[] => {
      const availBrktIndexs: number[] = [];
      const openBrkt = this._brackets[openBrktIndex].players;
      for (let i = 0; i < this._brackets.length; i++) {
        if (i !== openBrktIndex) {
          const players = this._brackets[i].players;
          if (!(players.includes(playerId) || players.includes(oppoId))) {
            const lastTwo = players.slice(-2);
            if (
              !(openBrkt.includes(lastTwo[0]) || openBrkt.includes(lastTwo[1]))
            ) {
              availBrktIndexs.push(i);
            }
          }
        }
      }
      return availBrktIndexs;
    };

    /**
     * gets available bracket indexes for player
     *
     * @param {string} id - a player's id - can be used with any player
     * @param {boolean} includeFullBrkts - if true, will include brackets that are full
     * @returns [number] - array of available bracket indexes
     */
    const getAvailBrktIdxesForPlayer = (
      id: string,
      includeFullBrkts: boolean,
    ): number[] => {
      const playerSet = playersBrktsMap.get(id);
      if (!playerSet) return [];
      const allBrktIndexs = Array.from(
        { length: this._brackets.length },
        (_, index) => index,
      );
      if (!includeFullBrkts) {
        return allBrktIndexs.filter(
          (brktIndex) =>
            !playerSet.has(brktIndex) &&
            this._brackets[brktIndex].players.length < this.playersPerBrkt,
        );
      }
      return allBrktIndexs.filter((brktIndex) => !playerSet.has(brktIndex));
    };

    // for debugging
    const getDebugBracketString = (): string => {
      let debugStr = "";
      for (let i = 0; i < this.playersPerBrkt; i++) {
        for (let b = 0; b < this._brackets.length; b++) {
          if (i < this._brackets[b].players.length) {
            debugStr += this._brackets[b].players[i];
            if (b < this._brackets.length - 1) {
              debugStr += "\t";
            }
          } else {
            debugStr += "\t";
          }
        }
        debugStr += "\r\n";
      }
      return debugStr;
    };

    /**
     * gets intersection of two arrays - itmes in both arrays
     *
     * @param {number[]} arr1 - array of numbers
     * @param {number[]} arr2 - array of numbers
     * @returns {number[]} - intersection of arr1 and arr2, items in both arrays
     */
    const getIntersection = (arr1: number[], arr2: number[]): number[] => {
      const arr2Set = new Set(arr2);
      return arr1.filter((item) => arr2Set.has(item));
    };

    /**
     * this function finds the index of the one remaining open bracket
     *
     * @returns {number} - index of open bracket or -1
     */
    const getOpenBracketIndex = (): number => {
      // if not just one open bracket, return -1
      if (currentNumMatches() !== allMatchesButOne) return -1;
      for (let b = 0; b < this._brackets.length; b++) {
        if (this._brackets[b].players.length < this.playersPerBrkt) return b;
      }
      return -1;
    };

    /**
     * gets list of bracket indexes for player, which can move to another bracket
     *
     * @returns {number[]} - bracket indexes where player's match can be moved from
     */
    const getPlayersCanMoveMatchBrktIdxes = (): number[] => {
      const playerSet = playersBrktsMap.get(playerId);
      const avail: number[] = [];
      playerSet?.forEach((brktIndex) => {
        if (brktIndex === this._brackets.length) return [];
        const playersLength = this._brackets[brktIndex].players.length;
        // if got players in the bracket, and the 2nd to last player is the player
        // then add the bracket index to avail
        if (
          playersLength >= 2 &&
          this._brackets[brktIndex].players[playersLength - 2] === playerId
        ) {
          avail.push(brktIndex);
        }
      });
      return avail;
    };

    /**
     * get random bracket index for match
     *
     * @param {string} oppoId - opponent id
     * @returns {number}
     *  - bracket index
     *  -1 if no avaliable bracket
     *  BracketList.errInvalidShuffledBrktIndex if error
     */
    const getRandomBracketIndexForMatch = (oppoId: string): number => {
      if (!shuffledBrktsForPlayer || shuffledBrktsForPlayer.length === 0) {
        this._errorCode = BracketList.errInvalidShuffledBrktIndex;
        this._errorMessage =
          "Invalid shuffled brackets index for player id: " + playerId;
        return BracketList.errInvalidShuffledBrktIndex;
      }
      for (let i = 0; i < shuffledBrktsForPlayer.length; i++) {
        const sbpIndex = shuffledBrktsForPlayer[i]; // spb: shuffled brackets for player
        if (
          isBrktIdxAvailForPlayer(sbpIndex, playerId) &&
          isBrktIdxAvailForPlayer(sbpIndex, oppoId)
        ) {
          shuffledBrktsForPlayer.splice(i, 1);
          return sbpIndex;
        }
      }
      return -1;
    };

    /**
     * gets total avalable brackets entries for all opponents
     * this._brktEntries is sorted by # entries (desc) & timestamp (asc)
     * startIndex to this._brktEntries.length - 1 gets all remaining opponents
     *
     * @param oppoStartingIndex - opponents starting index for bracket entries
     * @returns - total avalable brackets entries for all players
     */
    const getTotalAvalableBrkts = (oppoStartingIndex: number): number => {
      let totalAvail = 0;
      for (let i = oppoStartingIndex; i < this._brktEntries.length; i++) {
        // get how many brackets the opponent still needs
        totalAvail += neededCountMap.get(this._brktEntries[i].player_id)!;
      }
      return totalAvail;
    };

    /**
     * gets the swapFrom and swapTo indexes when swaping a match
     *
     * @param {string} oppoId - opponent id
     * @returns {number[]} - swapFrom and swapTo indexes
     */
    const getSwapIndexesForMatch = (oppoId: string): number[] => {
      const includeFullBrkts = true;
      const noFullBrkts = false;

      // step 1 - get match indexes that can be moved for player
      const plyCanMove = getPlayersCanMoveMatchBrktIdxes();
      if (!plyCanMove || plyCanMove.length === 0) return [];
      // step 2 - get available brackets for opponent
      const oppoAvail = getAvailBrktIdxesForPlayer(oppoId, includeFullBrkts);
      if (!oppoAvail || oppoAvail.length === 0) return [];
      // step 3 - get intersection of plyCanMove and oppoAvail
      const fromIndexes = getIntersection(plyCanMove, oppoAvail);
      if (fromIndexes.length === 0) return [];
      // step 4 - get first opponent from step 3 intersection
      // for each opponent in canMove brackets for player
      let cmIndex = 0;
      while (cmIndex < fromIndexes.length) {
        const sfIndex = fromIndexes[cmIndex];
        // step 4 - get first opponent from step 3 intersection
        const swapOppoId =
          this._brackets[sfIndex].players[
            this._brackets[sfIndex].players.length - 1
          ];
        // step 5 - get avaliable brackets for swapOppoId
        const swapOppoAvail = getAvailBrktIdxesForPlayer(
          swapOppoId,
          noFullBrkts,
        );
        if (!swapOppoAvail || swapOppoAvail.length === 0) {
          cmIndex++;
        } else {
          // step 6 - get available brackets for playerId
          const playerAvail = getAvailBrktIdxesForPlayer(playerId, noFullBrkts);
          if (!playerAvail || playerAvail.length === 0) {
            cmIndex++;
          } else {
            // step 7 - get intersection of swapOppoAvail and playerAvail
            const toIndexes = getIntersection(swapOppoAvail, playerAvail);
            if (toIndexes.length === 0) {
              cmIndex++;
            } else {
              const toIndex = toIndexes[0];
              return [sfIndex, toIndex];
            }
          }
        }
      }
      // if got here, then cant swap match
      return [];
    };

    /**
     * tests if bye entries exist
     *
     * @returns {boolean} - true if bye entries exist, false otherwise
     */
    const gotByeEntries = (): boolean => {
      const byeEntry = this._brktEntries.filter(
        // (entry) => entry.first_name === "Bye" && entry.last_name === "Bye"
        (entry) => entry.player_id.toLowerCase().startsWith("bye"),
      );
      return byeEntry.length > 0;
    };

    /**
     * tests if match is valid
     *
     * @param {playerUsedType} oppoInfo - opponent info
     * @returns: matchTestCodes:
     *    0 = Valid - match is valid,
     *    -1 = Used - opponent at index sIndex has already been used
     *    -2 = Self - cannot have a match against self
     *    -3 = Past - opponent has already had all their brackets set
     *    -4 = Prior - opposition already has a match vs player
     */
    const matchTest = (oppoInfo: playerUsedType): matchTestCodes => {
      // has opponent entry been used
      if (oppoInfo.used) {
        return matchTestCodes.USED;
      }
      // cant have a match vs self
      if (playerId === oppoInfo.playerId) {
        return matchTestCodes.SELF;
      }
      // cant have a match vs past player
      if (pastPlayersSet.has(oppoInfo.playerId)) {
        return matchTestCodes.PAST;
      }
      // cant have duplicate matches
      const oppoMatchInfo = oppoMap.get(oppoInfo.playerId);
      // if no opposition matches left, then already have a match
      if (oppoMatchInfo === undefined || oppoMatchInfo === 0) {
        return matchTestCodes.PRIOR;
      }
      return matchTestCodes.VALID;
    };

    /**
     * move match from one bracket to another
     *
     * @param {number[]} swapIndexes - indexes of brackets to swap [fromIndex, toIndex]
     * @returns {number} - fromIndex, or <0 error code
     */
    const moveMatch = (swapIndexes: number[]): number => {
      if (
        !swapIndexes ||
        swapIndexes.length !== 2 ||
        swapIndexes[0] === swapIndexes[1]
      ) {
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Invalid swapIndexes for player id: " + playerId;
        return BracketList.errCantMoveMatch;
      }
      const fromBrktIndex = swapIndexes[0];
      const toBrktIndex = swapIndexes[1];
      if (this._brackets[fromBrktIndex].players.length < 2) {
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Invalid players in from bracket for player id: " +
          playerId;
        return BracketList.errCantMoveMatch;
      }
      // get opponent to move
      const swapOppoId = this._brackets[fromBrktIndex].players.pop()!;
      if (swapOppoId === playerId) {
        this._brackets[fromBrktIndex].players.push(swapOppoId);
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Opponent is invalid in from bracket for player id: " +
          playerId;
        return BracketList.errCantMoveMatch;
      }
      // confirm player vs opponent
      const poppedPlayerId = this._brackets[fromBrktIndex].players.pop()!;
      if (poppedPlayerId !== playerId) {
        this._brackets[fromBrktIndex].players.push(poppedPlayerId);
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Player not found in from bracket for player id: " +
          playerId;
        return BracketList.errCantMoveMatch;
      }
      // move match to new bracket
      const plysInBrkt = this.brackets[toBrktIndex].addMatch([
        playerId,
        swapOppoId,
      ]);
      if (plysInBrkt < 0) {
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Error moving match to new toIndex for player id: " +
          playerId;
        return plysInBrkt;
      }
      const playerSet = playersBrktsMap.get(playerId);
      if (!playerSet) {
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Invalid player brackets set for player id: " +
          playerId;
        return BracketList.errCantMoveMatch;
      }
      const oppoSet = playersBrktsMap.get(swapOppoId);
      if (!oppoSet) {
        this._errorCode = BracketList.errCantMoveMatch;
        this._errorMessage =
          "Cannot move match: Invalid opponent brackets set for player id: " +
          playerId;
        return BracketList.errCantMoveMatch;
      }
      // update player and opponent bracket sets
      playerSet.delete(fromBrktIndex);
      playerSet.add(toBrktIndex);
      oppoSet.delete(fromBrktIndex);
      oppoSet.add(toBrktIndex);
      // return new available bracket for player
      return fromBrktIndex;
    };

    /**
     * puts match in bracket
     *
     * @param {string} oppoId - opponent id
     * @returns {number} - bracket index,
     *        -1 if no allable bracket,
     *        BracketList.errInvalidShuffledBrktIndex if error getting bracket index
     */
    const putMatchInBracket = (oppoId: string): number => {
      let brktIndex = getRandomBracketIndexForMatch(oppoId);

      // if error in shuffledBrktsForPlayer
      if (brktIndex === BracketList.errInvalidShuffledBrktIndex) {
        // error message set in getRandomBracketIndexForMatch
      } else if (brktIndex === -1) {
        if (currentNumMatches() === allMatchesButOne) {
          const openBrktIndex = getOpenBracketIndex();
          const availBrkts = getAvailBrktsForLastMatch(oppoId, openBrktIndex);
          if (availBrkts && availBrkts.length > 0) {
            shuffleArray(availBrkts);
            const swapIndexes: number[] = [availBrkts[0], openBrktIndex];

            const fromPId1 = this._brackets[swapIndexes[0]].players[6];
            const fromPId2 = this._brackets[swapIndexes[0]].players[7];

            this._brackets[swapIndexes[0]].players[6] = playerId;
            this._brackets[swapIndexes[0]].players[7] = oppoId;

            this._brackets[swapIndexes[1]].players[6] = fromPId1;
            this._brackets[swapIndexes[1]].players[7] = fromPId2;

            return swapIndexes[1]; // return index of filled match
          } else {
            // cant swap last match to a new location, re-randomize
            return BracketList.reRandomize;
          }
        } else {
          // cant create a match
          const swapIndexes = getSwapIndexesForMatch(oppoId);
          if (!swapIndexes || swapIndexes.length === 0) {
            return BracketList.reRandomize;
          }
          brktIndex = moveMatch(swapIndexes);
          if (brktIndex >= 0) {
            this._brackets[swapIndexes[0]].addMatch([playerId, oppoId]);
          }
        }
      } else {
        // create the match
        const pLength = this._brackets[brktIndex].addMatch([playerId, oppoId]);
        if (pLength < 0 || pLength > this.playersPerBrkt) {
          return BracketList.reRandomize;
        }
      }
      return brktIndex;
    };

    /**
     * reshuffled and resets all entries to not used
     * clears maps and pastPlayersSet
     * increments tryCount
     *
     * @returns {void}
     */
    const reShuffleAndReset = (): void => {
      shuffleArray(this._shuffled);
      // reset all entries to not used
      this._shuffled.forEach((obj) => {
        obj.used = false;
      });
      neededCountMap.clear();
      playersBrktsMap.clear();
      pastPlayersSet.clear();
      tryCount++;
    };

    /**
     * Sets shuffledBrktsForPlayer - shuffled list of avalable brackets for player
     *
     * @param playerId - id of player
     */
    const setShuffledBrktsForPlayer = (playerId: string): void => {
      // get a set of all bracket indexes
      const allIndexes = new Set<number>(
        Array.from({ length: numBrkts }, (_, index) => index),
      );
      // get the set of all used indexes for this player
      const playerBrktSet = playersBrktsMap.get(playerId);
      // remove used indexes
      if (playerBrktSet) {
        playerBrktSet.forEach((brktIndex) => {
          allIndexes.delete(brktIndex);
        });
      }
      // create array of avalable indexes
      shuffledBrktsForPlayer = Array.from(allIndexes);
      shuffleArray(shuffledBrktsForPlayer);
    };

    /**
     * shuffles each individual bracket, keeps the matches in tact
     */
    const shuffleIndividualBrackets = (): void => {
      this._brackets.forEach((bracket) => {
        bracket.shuffle();
      });
    };

    /**
     * Updates player brackets set
     *
     * @param {string} id - player or opponent id
     * @param {number} brktIndex - bracket index where player or oppenent was placed
     * @returns {number} - bracket index or BracketList.errInvalidPlayerBrktSet
     */
    const updatePlayerSet = (id: string, brktIndex: number): number => {
      const playerBrktSet = playersBrktsMap.get(id);
      if (!playerBrktSet) {
        this._errorCode = BracketList.errInvalidPlayerBrktSet;
        this._errorMessage = "Invalid player brackets set for player id: " + id;
        return BracketList.errInvalidPlayerBrktSet;
      }
      playerBrktSet.add(brktIndex);
      return brktIndex;
    };

    /**
     * updates needed count map for player or opponent
     *
     * @param {string} id - player or opponent id
     * @returns {void}
     */
    const updateNeededCountMap = (id: string): void => {
      const currentCount = neededCountMap.get(id);
      if (currentCount) {
        neededCountMap.set(id, currentCount - 1);
      }
    };

    /**
     * updates current player's opposition map
     *
     * @param oppoId - opponent id
     * @returns {void}
     */
    const updateOppoMap = (oppoId: string): void => {
      if (oppoMap.has(oppoId)) {
        const remaining = oppoMap.get(oppoId)! - 1;
        if (remaining <= 0) {
          oppoMap.delete(oppoId);
        }
        oppoMap.set(oppoId, remaining);
      }
    };

    // 1) check if valid brackets
    // canRandomize checks: got player entries, got brackets, correct # entries
    if (!this.canRandomize()) {
      return;
    }

    let doneRandomizing = false;
    let tryCount = 1;

    const numBrkts = this._fullCount + this._oneByeCount;
    this._addedBye = false;
    this._shuffled.length = 0; // reset shuffled array

    while (!doneRandomizing && tryCount <= maxTries) {
      this._errorCode = BracketList.noError;
      this._errorMessage = "";
      // 2) create needed # of brackets
      this._brackets.length = 0;
      this._brackets.push(
        ...Array.from({ length: numBrkts }, () => new Bracket(this)),
      );
      if (forTesting.length === 0) {
        // 3) create the shuffled array of all entries including byes
        // 3a) add needed bye entries to bracket entries & resort
        if (this._randomizeErrors.length === 0) {
          if (this._oneByeCount > 0 && !gotByeEntries()) {
            createByeEntry();
            this._brktEntries.push(this._byeEntry);
            // yes, resort. need sorted bracket entries to calculate # of byes
            this.sortBrktEntries();
          }
          // 3b) create array of all bracket entries (using sorted brktEntries)
          this._shuffled = this._brktEntries.flatMap((obj) =>
            Array(obj[this._numBrktsName])
              .fill(null)
              .map(() => ({
                playerId: obj.player_id,
                used: false,
              })),
          );
        }
        // 3c) shuffle the array using Fisher-Yates algorithm
        shuffleArray(this._shuffled);
      } else {
        // this is testing only
        if (this._randomizeErrors.length === 0) {
          createByeEntry();
          if (!this._addedBye && this._oneByeCount > 0) {
            this._byeEntry.id = "Bye";
            this._byeEntry.player_id = "Bye";
            this._brktEntries.push(this._byeEntry);
            this._addedBye = true;
            // yes, resort. need sorted bracket entries to calculate # of byes
            this.sortBrktEntries();
          }
          this._shuffled = cloneDeep(forTesting);
        }
      }
      let sIndex = 0; // index into shuffled array

      outerLoop: {
        // 4) create the neededCountMap and playerBrktsMap at the same time, 1 map entry per player
        for (let i = 0; i < this._brktEntries.length; i++) {
          neededCountMap.set(
            this._brktEntries[i].player_id,
            this._brktEntries[i][this.numBrktsName],
          );
          playersBrktsMap.set(
            this._brktEntries[i].player_id,
            new Set<number>(),
          );
        }

        // 5) assign random brackets
        // for each player (most barckets/plater to fewest)
        let startIndex; // starting index for player in shuffled array
        let playerNumBrkts;
        for (let p = 0; p < this._brktEntries.length - 1; p++) {
          playerId = this._brktEntries[p].player_id;

          // if no more brackets to assign, exit for loop
          if (getTotalAvalableBrkts(p + 1) === 0) {
            break;
          }

          // get number of brackets for player
          playerNumBrkts = this._brktEntries[p][this._numBrktsName];
          if (playerNumBrkts <= 0) {
            this._errorCode = BracketList.errNoBracketsForPlayer;
            this._errorMessage = `No brackets for player ${playerId}`;
            return;
          }
          const playerBrktSet = playersBrktsMap.get(playerId);
          if (!playerBrktSet) {
            this._errorCode = BracketList.errInvalidPlayerBrktSet;
            this._errorMessage = `Cannot randomize. Invalid player brackets set for player: ${playerId}`;
            return;
          }
          // remove # brackets already assigned
          playerNumBrkts -= playerBrktSet.size;
          // reset starting index for player
          startIndex = -1;

          // get shuffled brackets for player,
          // bracket indexes avalable for player in a shuffled array
          setShuffledBrktsForPlayer(playerId);
          // create player's opposition map
          // key: opponent id, value: max number of times player vs opponent
          // const opppoMapErr = createOppoMap(p, playerNumBrkts);
          const opppoMapErr = createOppoMap(p, playerNumBrkts);
          if (opppoMapErr !== BracketList.noError) {
            this._errorCode = opppoMapErr;
            if (opppoMapErr === BracketList.errCantCreateOppoMap) {
              this._errorMessage =
                "Cannot create opposition map for player: " + playerId;
            } else if (opppoMapErr === BracketList.errNoValuesInOppoMap) {
              this._errorMessage =
                "No entries in opposition map for player: " + playerId;
            } else if (opppoMapErr === BracketList.errNotEnoughOppoEntries) {
              this._errorMessage =
                "Not enough entries in opposition map for player: " + playerId;
            }
            const randError: randmoizeErrorType = {
              error: opppoMapErr,
              message: this._errorMessage,
              badEntries: this.getDebugShuffle(),
              badBrackets: getDebugBracketString(),
              tryCount: tryCount,
              playerId: playerId,
              brktId: this._brktId,
              shuffledIndex: sIndex,
              totalMatches: currentNumMatches(),
            };
            this._randomizeErrors.push(randError);
            reShuffleAndReset(); // reshuffle entries and reset maps
            sIndex = 0; // reset index into shuffled array
            break outerLoop; // re-randomize
          }

          // for number of remaining brackets to assign to player
          for (let b = 0; b < playerNumBrkts; b++) {
            let needMatch = true;
            while (needMatch) {
              // get next assigned match, and check if match is valid for player
              const matchTestResult = matchTest(this._shuffled[sIndex]);
              if (matchTestResult === matchTestCodes.VALID) {
                const bIndex = putMatchInBracket(
                  this._shuffled[sIndex].playerId,
                );
                // if bracket index is invalid
                if (bIndex < 0) {
                  if (bIndex === BracketList.reRandomize) {
                    this._errorCode = BracketList.reRandomize;
                    this._errorMessage = `Need to re-randomize, stopped at player: ${playerId} `;
                    const randError: randmoizeErrorType = {
                      error: BracketList.reRandomize,
                      message: this._errorMessage,
                      badEntries: this.getDebugShuffle(),
                      badBrackets: getDebugBracketString(),
                      tryCount: tryCount,
                      playerId: playerId,
                      brktId: this._brktId,
                      shuffledIndex: sIndex,
                      totalMatches: currentNumMatches(),
                    };
                    this._randomizeErrors.push(randError);
                    reShuffleAndReset(); // reshuffle entries and reset maps
                    sIndex = 0; // reset index into shuffled array
                    break outerLoop; // re-randomize
                  }
                  this._errorCode = BracketList.errInvalidBracketIndex;
                  this._errorMessage = `Cannot randomize. Invalid bracket index for player: ${playerId}`;
                  const randError: randmoizeErrorType = {
                    error: this._errorCode,
                    message: this._errorMessage,
                    badEntries: this.getDebugShuffle(),
                    badBrackets: getDebugBracketString(),
                    tryCount: tryCount,
                    playerId: playerId,
                    brktId: this._brktId,
                    shuffledIndex: sIndex,
                    totalMatches: currentNumMatches(),
                  };
                  this._randomizeErrors.push(randError);
                  return;
                }
                // update player's brackets set - list of brackets for player
                updatePlayerSet(playerId, bIndex);
                // update needed count map for player
                updateNeededCountMap(playerId);
                // update opponent's brackets set - list of brackets for opponent
                updatePlayerSet(this._shuffled[sIndex].playerId, bIndex);
                // update needed count map for opponent
                updateNeededCountMap(this._shuffled[sIndex].playerId);
                // update players - opponent's map - number of times player vs opponent
                updateOppoMap(this._shuffled[sIndex].playerId);
                // set current entry as used
                this._shuffled[sIndex].used = true;
                needMatch = false;
                // else if a prior match and startIndex not set
              } else if (matchTestResult === matchTestCodes.PRIOR) {
                // reset start index for next player if not already set
                if (startIndex === -1) startIndex = sIndex;
                // DO NOT UPDATE shuffled[sIndex].used
              } else {
                // match vs self, match vs past player, duplicate match
                this._shuffled[sIndex].used = true;
              }
              sIndex++;
              // if last player & last bracket and set the match
              if (
                p === this._brktEntries.length - 2 &&
                b === playerNumBrkts - 1 &&
                !needMatch &&
                currentNumMatches() * 2 ===
                  this._brackets.length * this.playersPerBrkt
              ) {
                doneRandomizing = true;
                this._errorCode = BracketList.noError;
                this._errorMessage = "";
                const randError: randmoizeErrorType = {
                  error: BracketList.noError,
                  message: "No errors - randomized brackets",
                  badEntries: this.getDebugShuffle(),
                  badBrackets: getDebugBracketString(),
                  tryCount: tryCount,
                  playerId: "",
                  brktId: this._brktId,
                  shuffledIndex: this._shuffled.length,
                  totalMatches: currentNumMatches(),
                };
                this._randomizeErrors.push(randError);
                shuffleIndividualBrackets();
                return;
              }
              if (!doneRandomizing && sIndex >= this._shuffled.length) {
                this._errorCode = BracketList.reShuffle;
                this._errorMessage = `Cannot randomize. Need to re-shuffle and re-randomize.`;
                const randError: randmoizeErrorType = {
                  error: this._errorCode,
                  message: this._errorMessage,
                  badEntries: this.getDebugShuffle(),
                  badBrackets: getDebugBracketString(),
                  tryCount: tryCount,
                  playerId: playerId,
                  brktId: this._brktId,
                  shuffledIndex: sIndex,
                  totalMatches: currentNumMatches(),
                };
                this._randomizeErrors.push(randError);
                reShuffleAndReset(); // reshuffle entries and reset maps
                sIndex = 0; // reset index into shuffled array
                break outerLoop; // re-randomize
              }
            }
          }
          // done with player's brackets, add player to past players set
          pastPlayersSet.add(playerId);
          // reset shuffle index if needed
          if (startIndex > -1) sIndex = startIndex;
        }

        // if current matches = number of matches to set, we are done
        if (currentNumMatches() === this._shuffled.length / 2) {
          doneRandomizing = true;
          this._errorCode = BracketList.noError;
          this._errorMessage = "";
          const randError: randmoizeErrorType = {
            error: BracketList.noError,
            message: "No errors - randomized brackets",
            badEntries: this.getDebugShuffle(),
            badBrackets: getDebugBracketString(),
            tryCount: tryCount,
            playerId: "",
            brktId: this._brktId,
            shuffledIndex: this._shuffled.length,
            totalMatches: currentNumMatches(),
          };
          this._randomizeErrors.push(randError);
          shuffleIndividualBrackets();
        } else {
          this._errorCode = BracketList.resetMatches;
          this._errorMessage =
            "Cannot randomize. Did not set all matches. Need to re-shuffle and re-randomize.";
          const randError: randmoizeErrorType = {
            error: this._errorCode,
            message: this._errorMessage,
            badEntries: this.getDebugShuffle(),
            badBrackets: getDebugBracketString(),
            tryCount: tryCount,
            playerId: playerId,
            brktId: this._brktId,
            shuffledIndex: sIndex,
            totalMatches: currentNumMatches(),
          };
          this._randomizeErrors.push(randError);
          reShuffleAndReset(); // reset all entries to not used
          sIndex = 0; // reset index into shuffled array
          break outerLoop; // re-randomize
        }
      }
    }
    if (tryCount >= maxTries) {
      this._errorCode = BracketList.errCantRandomize;
      this._errorMessage =
        "Cannot randomize brackets for players, over max tries";
      const randError: randmoizeErrorType = {
        error: this._errorCode,
        message: this._errorMessage,
        badEntries: this.getDebugShuffle(),
        badBrackets: getDebugBracketString(),
        tryCount: tryCount,
        playerId: playerId,
        brktId: this._brktId,
        shuffledIndex: -1,
        totalMatches: currentNumMatches(),
      };
      this._randomizeErrors.push(randError);
      return;
    }
    const lastErrorIndex = this._randomizeErrors.length - 1;
  }
}
