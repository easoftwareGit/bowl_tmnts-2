import { Bracket } from "./bracketClass";
import { entryNumBrktsColName, playerEntryData, timeStampColName } from "@/app/dataEntry/playersForm/createColumns";
import { cloneDeep } from "lodash";
import { BGNumberedColCount, brktColTitle, initBGColNames, toFillColTitle } from "./bracketGrid";
import { maxBrackets } from "@/lib/validation";

export type findPlayerResult = {
  playerIndex: number,
  brktIndex: number
}

export type brktEntryType = {
  // player_id: string, // player_id is key in map, so no need to add it here
  num_brackets: number,
  createdAt: number,
  orig_num_brackets: number,
}

export interface brktCountType {
  brktInfo: string;
  toFill: string;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  B5: number;
  B6: number;
  B7: number;
  B8: number;
  B9: number;
  B10: number;
  [key: string]: number | string; // add an index signature
}

// interface filledBrktType { 
//   pos: string;
//   [key: string]: string;
// }

export const brktsToShow = 10

export type initBrktCountsType = {
  forFullValues: (number | null)[];
  forOneByeValues: (number | null)[];  
}

export type totalBrktsType = {  
  total: number;
  full: number;
  oneBye: number;
}

type mergeStartInfoType = {
  brktIndex: number;    // index for brackets[]
  playerIndex: number;  // index into one bracket[].players[]
}

const initBrktCounts: initBrktCountsType = {
  forFullValues: [],
  forOneByeValues: []
}

export class BracketList { 

  private _copyFrom: Bracket[] = [];   
  // private _brktColTitles = cloneDeep(initBGColNames);
  private _brktCounts: initBrktCountsType = cloneDeep(initBrktCounts) as initBrktCountsType;
  // private _entries: playerBrktEntryType[] = [];   
  private _fullCount: number = 0;
  private _oneByeCount: number = 0;
  private _totalEntries: number = 0;
  // private _filledBrkts: Bracket[] = [];
  
  private entriesMap: Map<string, brktEntryType> = new Map();

  brktId: string;   
  errorMessage: string;
  games: number;
  playersPerMatch: number;
  
  brackets: Bracket[] = [];

  constructor(brktId: string, playersPerMatch: number, games: number, copyFrom: Bracket[] = []) {
    this.brktId = brktId;
    this.entriesMap = new Map();
    this.errorMessage = '';
    this.playersPerMatch = playersPerMatch;
    this.games = games;
    this._copyFrom = copyFrom;
    if (this._copyFrom.length > 0) {
      this.brackets.push(...this._copyFrom); 
    }
  }

  get allBrkts(): Bracket[] {
    return this.brackets;
  }
  // get brktColTitles() {
  //   return this._brktColTitles;
  // }
  get brktCounts() {
    return this._brktCounts;
  }
  get fullCount() {
    return this._fullCount;
  }
  get oneByeCount() {
    return this._oneByeCount;    
  }
  get totalEntries() {
    return this._totalEntries;
  }

  // get filledBrkts(): Bracket[] {
  //   return this._filledBrkts;
  // }
  get needToAddBrkt(): boolean {
    if (this.brackets.length === 0) return true;
    for (let i = 0; i < this.brackets.length; i++) { 
      if (this.brackets[i].isFull) return false;
    }
    return true;
  }
  get playersPerBrkt(): number {
    // 2 bolwers per match ** 3 games = 2**3 = 8
    return this.playersPerMatch ** this.games;
  }

  addBrkt(): Bracket{
    const brkt = new Bracket(this);
    this.brackets.push(brkt);
    return brkt;
  }

  /**
   * finds brackets where the player can be added
   * 
   * @param {string} playerId - player id
   * @returns {Bracket[]} - array of brackets where the player can be added 
   */
  brktsAvaliableForPlayer(playerId: string): Bracket[] {
    return this.brackets.filter(brkt => !brkt.isFull && brkt.findPlayerIndex(playerId) === -1);
  }

  /**
   * gets the bracket number column name for count of brackets grid
   * 
   * @param {number} brktNum - bracket number
   * @returns {string} - bracket number column name or empty string
   */
  brktNumColName(brktNum: number): string {
    if (!brktNum || brktNum < 1 || brktNum > this.brackets.length) return "";
    return "B" + brktNum.toString();
  }

  /**
   * finds a bracket with all the players in it
   * 
   * @param {string[]} playerIds - array of player ids
   * @param {number} startBrktIndex - bracket index to start at
   * @returns {number} - bracket index where all the players were found or -1 
   */
  // findBrkt(playerIds: string[], startBrktIndex: number = 0): number {
  //   for (let i = startBrktIndex; i < this.brackets.length; i++) {
  //     if (this.brackets[i].findMissingPlayerIndex(playerIds) === -1) {
  //       return i;
  //     }
  //   }
  //   return -1;
  // }
  
  /**
   * clears all brackets
   */
  clear(): void {
    this.brackets = [];
    // this._brktColTitles = cloneDeep(initBGColNames);
    this._brktCounts.forFullValues.length = 0;
    this._brktCounts.forOneByeValues.length = 0;
    this.entriesMap.clear();
  }

  /**
   * calculated the number of empty spots in all brackets
   * 
   * @returns {number} - number of empty spots in all brackets or -1 if no brackets
   */
  emptySpotsCalculated(): number {
    if (this._fullCount < 0
      || this._oneByeCount < 0
      || (this._fullCount === 0 && this._oneByeCount === 0)
    ) return -1;
    return ((this._fullCount + this._oneByeCount) * this.playersPerBrkt) - this.totalEntries;
  }

  /**
   * finds the number of empty spots in all brackets by counting emprt spots in each bracket
   * 
   * @returns {number} - number of empty spots in all brackets or -1 if no brackets
   */
  emptySpotsLookup(): number {
    if (!this.brackets || this.brackets.length === 0) return -1;
    let es = 0;    
    for (let i = 0; i < this.brackets.length; i++) {
      es += this.brackets[i].emptySpots();
    }
    return es;
  }

  /**
   * finds the index of a player in a bracket, starting at startBrktIndex
   * also returns the bracket index where the player was found
   * 
   * @param {string} playerId - player id to find
   * @param {number} startBrktIndex - bracket index to start at
   * @returns {findPlayerResult} - player index and bracket index 
   */
  findPlayer(playerId: string, startBrktIndex: number = 0): findPlayerResult {
    const result: findPlayerResult = {
      playerIndex: -1,
      brktIndex: -1
    }
    if (!playerId
      || playerId.length === 0
      || startBrktIndex < 0
      || startBrktIndex >= this.brackets.length)
    {
      return result;       
    }
    for (let i = startBrktIndex; i < this.brackets.length; i++) {
      const pIndex = this.brackets[i].findPlayerIndex(playerId);
      if (pIndex >= 0) {
        result.playerIndex = pIndex;
        result.brktIndex = i;
        return result;        
      }
    }
    return result;
  }

  /**
   * puts a player in a bracket or returns null if cant put player in a bracket
   * 
   * @param playerId - player id to add
   * @returns {Bracket | null} - bracket where player was added or null 
   */
  putPlayerInBrkt(playerId: string): Bracket | null {        
    for (let i = 0; i < this.brackets.length; i++) { 
      const brkt = this.brackets[i];
      if (!brkt.isFull) { 
        if (brkt.findPlayerIndex(playerId) === -1) { 
          brkt.addPlayer(playerId);
          return brkt;
        }
      }
    }
    return null;
  }
  
  // adjustPlayersNumBrkts(brktEntRows: (typeof playerEntryData)[], totalBrkts: totalBrktsType): void {
    
  //   // if less than 0 oneBye, calc correct full and reset one bye to 1
  //   if (totalBrkts.oneBye < 0) {      
  //     totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
  //     totalBrkts.oneBye = 1;
  //     totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
  //   } else { 
  //     // check if each player's numBrkts <= total brackets
  //     let pIndex = brktEntRows.length - 1;
  //     const numBrktsName = entryNumBrktsColName(this.brktId);
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

  // calculateNumBrackets(brktEntRows: (typeof playerEntryData)[], totalBrkts: totalBrktsType): void {      
  //   totalBrkts.total = 0;
  //   totalBrkts.full = 0;
  //   totalBrkts.oneBye = 0;
  //   if (!brktEntRows || brktEntRows.length === 0) return;
  //   const numBrktsName = entryNumBrktsColName(this.brktId)
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
  
  /**
   * calculates total # full and one bye brackets based on player bracket entry rows
   * 
   * @param {typeof playerEntryData[]} playerEntries - array of player entry rows for tmnt
   * @returns {void} - no return 
   */
  calcTotalBrkts(playerEntries: (typeof playerEntryData)[]): void {  
   
    const numBrktsName = entryNumBrktsColName(this.brktId)
    const timeStampName = timeStampColName(this.brktId)
    const totalBrkts = { total: 0, full: 0, oneBye: 0 }; 
    let totalEntries = 0;
    // /**
    //  * add a player to brackts without adding a bracket
    //  * used when player count > number of players per bracket 
    //  * AND
    //  * number of brackets for player <= empty spots in brackets
    //  * 
    //  * @returns {void}
    //  */
    // const addPlayerNoAddBrackets = () => {
    //   let toMerge: string[] = Array(numBrkts).fill(playerId);
    //   const msi = findMergeStartInfo();
    //   if (msi.brktIndex === -1) return;          
    //   while (toMerge.length > 0) { 
    //     let brktIndex = msi.brktIndex;
    //     let playerIndex = msi.playerIndex;
    //     while (playerIndex < this.playersPerBrkt && toMerge.length > 0) {
    //       toMerge = mergePlayers(toMerge, brktIndex, playerIndex);
    //       playerIndex++;                         
    //       if (toMerge.length > 0) {   // if got more players to merge
    //         // if past last player in brkt (all brakets have been filled) 
    //         if (playerIndex === this.playersPerBrkt) {  
    //           playerIndex = 0;                      // go to first player in all brackets
    //           const oneBracket = new Bracket(this); // add a new bracket
    //           this.brackets.push(oneBracket);
    //         }
    //         // add players from next row
    //         toMerge = getSecondaryMerges(toMerge, playerIndex); 
    //         brktIndex = 0;  // reset brkt index
    //       }
    //     }
    //   }    
    // }

    // /**
    //  * add a player to brackets and add brackets
    //  * used when player count > number of players per bracket 
    //  * AND
    //  * number of brackets for player > empty spots in brackets
    //  * 
    //  * @returns {void}
    //  */
    // const addPlayerAddBrackets = () => {
    //   // clear all brackets
    //   for (let i = 0; i < this.brackets.length; i++) {
    //     this.brackets[i].clearPlayers();
    //   }
    //   // calculate number of brackets to add
    //   const es = this.emptySpots();
    //   if (es === 0) return;
    //   let toAdd = Math.floor(es / this.playersPerBrkt);
    //   if (es % this.playersPerBrkt > 0) toAdd++;
    //   // add brackets
    //   for (let i = 0; i < toAdd; i++) {
    //     const oneBracket = new Bracket(this);
    //     this.brackets.push(oneBracket);
    //   }
    //   let qBrktIndex = 0;
    //   let qPlayerIndex = 0;      
    //   let qPlayerId = brktEntRows[0].player_id;
    //   let qNumBrkts = brktEntRows[0][numBrktsName];
    //   let toMerge: string[] = Array(qNumBrkts).fill(qPlayerId);
    //   let q = 0;
    //   while (q <= p) {
    //     // qPlayerId = brktEntRows[q].player_id;
    //     // qNumBrkts = brktEntRows[q][numBrktsName];
    //     // toMerge.push(...Array(qNumBrkts).fill(qPlayerId)); 
    //     while (toMerge.length < this.brackets.length && q + 1 <= p) {
    //       q++;
    //       qPlayerId = brktEntRows[q].player_id;
    //       qNumBrkts = brktEntRows[q][numBrktsName];
    //       toMerge.push(...Array(qNumBrkts).fill(qPlayerId));             
    //     }
    //     toMerge = mergePlayers(toMerge, qBrktIndex, qPlayerIndex);
    //     // while (toMerge.length < this.brackets.length && q + 1 <= p) {
    //     //   q++;
    //     //   qPlayerId = brktEntRows[q].player_id;
    //     //   qNumBrkts = brktEntRows[q][numBrktsName];
    //     //   toMerge.push(...Array(qNumBrkts).fill(qPlayerId));             
    //     // }
    //     q++;
    //   }
    // }

    // /**
    //  * finds the starting point for a merge
    //  * 
    //  * @returns {mergeStartInfoType} - object with bracket index and position index, -1 indicates error
    //  */
    // const findMergeStartInfo = (): mergeStartInfoType => { 
    //   if (!this.brackets || this.brackets.length === 0) return {
    //     brktIndex: -1,
    //     playerIndex: -1,
    //   }
    //   let b = this.brackets.length;
    //   let maxEmpty = this.brackets[b - 1].emptySpots();
    //   // if max empty is 0, then the last bracket is full
    //   if (maxEmpty === 0) {
    //     // return starting point as first bracket first position
    //     return {
    //       brktIndex: 0,
    //       playerIndex: 0
    //     }
    //   }
    //   while (b >= 1) { 
    //     if (this.brackets[b-1].emptySpots() < maxEmpty) {
    //       return {
    //         brktIndex: b,
    //         playerIndex: this.playersPerBrkt - this.brackets[b].emptySpots()
    //       }
    //     }
    //     b--;
    //   }
    //   // if got here, something wrong, return error
    //   return {
    //     brktIndex: -1,
    //     playerIndex: -1
    //   }
    // }

    // /**
    //  * initial adding player to multiple brackets when when 
    //  * player count <= number of players per bracket
    //  * for example, adding 7th player when there are 8 players per bracket
    //  * 
    //  * @returns {void}
    //  */
    // const initAddPlayer = () => {
    //   for (let n = 1; n <= numBrkts; n++) { // numBrkts times
    //     let oneBracket = this.putPlayerInBrkt(playerId);
    //     if (!oneBracket) {
    //       oneBracket = new Bracket(this);
    //       oneBracket.addPlayer(playerId);
    //       this.brackets.push(oneBracket);
    //     }
    //   }    
    // }
    
    // /**
    //  * combines current list of player id's to merge and player id's at index playerIndex
    //  * 
    //  * @param {string[]} toMerge - current list of player id's to merge
    //  * @param {number} playerIndex - index into each brackt's players array
    //  * @returns {string[]} - list of player id's to merge 
    //  */
    // const getSecondaryMerges = (toMerge: string[], playerIndex: number): string[] => {
    //   if (toMerge.length === 0 || playerIndex >= this.playersPerBrkt) {
    //     return toMerge;
    //   }
    //   let x = 0;  // brackets x axis
    //   while (x < this.brackets.length
    //     && this.brackets[x]
    //     && this.brackets[x].players[playerIndex])
    //   {
    //     toMerge.push(this.brackets[x].players[playerIndex]);
    //     x++;
    //   }
    //   return toMerge;
    // }
    
    // /**
    //  * merges a list of player id's into the list of brackets
    //  * 
    //  * @param {string[]} toMerge array of player id's to merge
    //  * @param {number} startBrktIndex - bracket index to start at
    //  * @param {number} playerIndex - index into each bracket's player array 
    //  * @returns - array of player id's not yet merged
    //  */
    // const mergePlayers = (toMerge: string[], startBrktIndex: number, playerIndex: number): string[] => {
    //   if (!toMerge ||
    //     toMerge.length === 0 ||
    //     startBrktIndex === undefined ||      
    //     startBrktIndex < 0 ||
    //     startBrktIndex >= this.brackets.length ||
    //     playerIndex < 0 ||
    //     playerIndex >= this.playersPerBrkt)
    //   {
    //     return [];
    //   }
    //   let i = 0;  
    //   let x = startBrktIndex;
    //   // for each bracket, update the player with new merged players
    //   while (i < toMerge.length && x < this.brackets.length) {
    //     this.brackets[x].players[playerIndex] = toMerge[i];
    //     i++;
    //     x++;
    //   }
    //   toMerge.splice(0, i);     // remove merged players
    //   return toMerge;           // return the remaining players in row to be merged
    // } 

    /**
     * adjusts the number of brackets for each player when:
     *   players numBrkts > total brackets
     * adjusts the number of oneBye brackets when:
     *   oneBye brackets < 0
     * 
     * @returns {void}
     */    
    const adjustPlayersNumBrkts = (): void => {
      // if no full brackets
      if (brktEntries.length < this.playersPerBrkt) { 

      }

      // if less than 0 oneBye, calc correct full and reset one bye to 1
      if (totalBrkts.oneBye < 0) {      
        totalBrkts.full = totalBrkts.full + totalBrkts.oneBye;
        totalBrkts.oneBye = 1;
        totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
      } else { 
        // check if each player's numBrkts <= total brackets
        let pIndex = brktEntries.length - 1;        
        while (pIndex >= 0) { 
          if (brktEntries[pIndex][numBrktsName] > totalBrkts.total) {
            break;
          }
          pIndex--;        
        }
        // if pIndex < 0, all player's numBrkts <= total brackets, no need to adjust
        if (pIndex < 0) return;
  
        // adjust player's numBrkts where needed until valid numBrkts
        pIndex = brktEntries.length - 1;                   
        let done = false;      
        let pIndexReset = -1;
        let newNumBrkts = totalBrkts.total        
        while (!done) { 
          while (pIndex >= 0 && brktEntries[pIndex][numBrktsName] <= totalBrkts.total) {
            pIndex--;          
          }
          if (pIndex >= 0) {
            // new value is min of brktEntRows[pIndex][numBrktsName] and totalBrkts.total
            const newVal = Math.min(newNumBrkts, brktEntries[pIndex][numBrktsName] - 1);
            updateEntry(brktEntries[pIndex].player_id, { [numBrktsName]: newVal });
            brktEntries[pIndex][numBrktsName] = newVal;
            // brktEntries[pIndex][numBrktsName] = Math.min(newNumBrkts, brktEntries[pIndex][numBrktsName] - 1);
            if (pIndexReset === -1) {
              pIndexReset = pIndex;
            }
          }
          calculateNumBrackets();
          if (pIndex === 0 && brktEntries[0][numBrktsName] === totalBrkts.total) {
            done = true;
          } else { 
            pIndex--;
            if (pIndex < 0) { 
              pIndex = pIndexReset;
              newNumBrkts = totalBrkts.total;
            }
          }
        }
      }
    } 

    /**
     * calculates the number of brackets needed
     * sets values in totalBrkts object
     * 
     * @returns {void}  
     */
    const calculateNumBrackets = (): void => {      
      // not enough data to calculate
      if (!brktEntries
        || brktEntries.length === 0
        || brktEntries.length < this.playersPerBrkt - 1)
      { 
        return;
      }       
      // if only enough players for one bye
      totalEntries = 0;
      brktEntries.forEach(brktEntRow => {
        totalEntries += brktEntRow[numBrktsName]
      });    

      if (brktEntries.length === this.playersPerBrkt - 1) {        
        // set one bye to min to min of # brackets entered
        totalBrkts.oneBye = brktEntries.reduce((min, brktEntry) => Math.min(min, brktEntry[numBrktsName]), Infinity);        
      } else { 
        // totalEntries = 0;
        // brktEntries.forEach(brktEntRow => {
        //   totalEntries += brktEntRow[numBrktsName]
        // });    
        let gotAnswer = false;      
        let addToFull = 1;    
        const ppFull = this.playersPerBrkt;
        const ppOneBye = ppFull - 1;
        const maxFull = (totalEntries / 8) < ppFull ? ppFull : (totalEntries / 8) + 1; // OK not to be an int here
        totalBrkts.full = 0;
        while (!gotAnswer && totalBrkts.full <= maxFull) {
          totalBrkts.full += addToFull;
          totalBrkts.oneBye = (totalEntries - (this.playersPerBrkt * totalBrkts.full)) / ppOneBye;
          if (Number.isInteger(totalBrkts.oneBye)) {          
            if (totalBrkts.oneBye <= ppOneBye) {
              gotAnswer = true;
            }
            addToFull = ppOneBye
          } 
        }        
      }
      totalBrkts.total = totalBrkts.full + totalBrkts.oneBye;
    }  

    /**
     * populate bracket counts (full, oneBye) for each bracket
     * 
     * @returns {void}
     */
    const populateBrktCounts = (): void => {
      this._brktCounts.forFullValues.length = 0;
      this._brktCounts.forOneByeValues.length = 0;
      if (totalBrkts.total === 0) return;
      if (totalBrkts.total >= BGNumberedColCount) {
        this._brktCounts.forFullValues = Array(totalBrkts.full).fill(0);
        this._brktCounts.forFullValues.push(...Array(totalBrkts.oneBye).fill(1));
        this._brktCounts.forOneByeValues = Array(totalBrkts.total).fill(0);
      } else { 
        this._brktCounts.forFullValues = Array(BGNumberedColCount).fill(8);
        this._brktCounts.forOneByeValues = Array(BGNumberedColCount).fill(7);
        const emptySpots = (totalBrkts.total * this.playersPerBrkt) - totalEntries;
        for (let b = 0; b < totalBrkts.total; b++) {
          const f = Math.floor(emptySpots / totalBrkts.total);
          this._brktCounts.forFullValues[b] = f
          this._brktCounts.forOneByeValues[b] = (f === 0) ? 0 : f - 1;
        }
        const remainder = emptySpots % totalBrkts.total;
        for (let i = totalBrkts.total - remainder; i < totalBrkts.total; i++) {
          const f = (this._brktCounts.forFullValues[i] ?? 0) + 1;
          this._brktCounts.forFullValues[i] = f
          this._brktCounts.forOneByeValues[i] = (f === 0) ? 0 : f - 1;
        }
      }
    }  

    /**
     * populates the bracket column titles
     * 
     * @returns {void}
     */
    // const populateBrktColTitles = (): void => {        
    //   let iStart = totalBrkts.total - (BGNumberedColCount - 1);
    //   // if less than 10 brackets, use default column titles
    //   if (iStart < 1) { 
    //     this._brktColTitles = cloneDeep(initBGColNames);
    //     return;
    //   }
    //   const iEnd = iStart + BGNumberedColCount - 1;
    //   this._brktColTitles.length = 0;
    //   this._brktColTitles.push(brktColTitle);    
    //   for (let i = iStart; i <= iEnd; i++) {
    //     this._brktColTitles.push(i + '');
    //   }
    //   this._brktColTitles.push(toFillColTitle);
    // }

    /**
     * saves the original bracket entries 
     * 
     * @returns {void}
     */
    const saveOrigBrktEntries = (): void => {      
      brktEntries.forEach(brktEntry => {
        const { player_id, ...rest } = brktEntry;
        const newBrktEntry: brktEntryType = {
          num_brackets: rest[numBrktsName],
          createdAt: rest.createdAt,
          orig_num_brackets: rest[numBrktsName],
        }
        this.entriesMap.set(brktEntry.player_id, newBrktEntry);
      })
    }

    
    const updateEntry = (player_id: string, updated: Partial<brktEntryType>): void => {
      const entry = this.entriesMap.get(player_id);
      if (entry) {
        Object.assign(entry, updated);
      }
    }

    /**
     * checks if bracket entries are valid before calculations
     * 
     * @returns {boolean} - true if bracket entries are valid
     */
    const validBrktEntries = (): boolean => { 
      if (!brktEntries || brktEntries.length === 0) return false;
      let b = 0;
      while (b < brktEntries.length) {
        if (!brktEntries[b].player_id
          || brktEntries[b].player_id === ''
          || !brktEntries[b][numBrktsName]
          || brktEntries[b][numBrktsName] < 0
          || brktEntries[b][numBrktsName] > maxBrackets
          || !Number.isInteger(brktEntries[b][numBrktsName])
          || !brktEntries[b][timeStampName])
        {
          return false;
        }        
        b++;
      }
      return true;
    }

    // 1) clear
    // 2) remove all rows with no bracket entries
    // 3) validate bracket entries
    // 4) save original # of brackets
    // 5) sort by # brackets (DESC), and createdAt (ASC)
    // 6) calculate # of brackets
    // 7) adjust player's # of brackets if/as needed    
    // 8) populate full and oneBye brackets counts     

    // 1) clear and initialize brackets
    this.clear();

    // 2) remove all rows with no bracket entries
    const brktEntries = cloneDeep(playerEntries.filter(entry => entry[numBrktsName] > 0));

    // 3) validate bracket entries    
    if (validBrktEntries()) {

      // 4) save original # of brackets
      saveOrigBrktEntries();

      // 5) sort by # brackets (DESC), and createdAt (ASC)
      // sort by # brackets (DESC), usedCount (ASC) and createdAt (ASC)    
      brktEntries.sort((a, b) => {
        if (a[numBrktsName] !== b[numBrktsName]) {
          return b[numBrktsName] - a[numBrktsName]; // descending
        } else {
          return a.createdAt - b.createdAt;         // ascending
        }
      });

      // 6) calculate # of brackets
      calculateNumBrackets();

      // 7) adjust player's # of brackets if/as needed
      adjustPlayersNumBrkts();
    };
    // 8) populate full and oneBye brackets counts 
    populateBrktCounts();
    // this.populateFilledBrkts();    

    // 9) populate column titles
    // populateBrktColTitles();

    this._fullCount = totalBrkts.full;
    this._oneByeCount = totalBrkts.oneBye;
    this._totalEntries = totalEntries;
  } 

  /**
   * ppopulates filled brackets
   * 
   * @returns {void} - no return
   */
  // populateFilledBrkts(): void {
  //   this._filledBrkts.length = 0;
  //   if (this.brackets.length === 0) return;

  //   this.brackets.forEach(brkt => {
  //     if (brkt.isFull) {
  //       this._filledBrkts.push(brkt);
  //     }
  //   });
  //   // for (let p = 1; p <= this.playersPerBrkt; p++) {
  //   //   const filledRow: filledBrktType = {
  //   //     pos: p + ''
  //   //   };
  //   //   this._filledBrkts.push(filledRow);
  //   // }
  //   // for (let b = 0; b < this.brackets.length; b++) {
  //   //   const bColName = this.brktNumColName(b + 1);
  //   //   for (let i = 0; i < this.brackets[b].players.length; i++) {
  //   //     this._filledBrkts[i][bColName] = this.brackets[b].players[i]
  //   //   }
  //   // }
  // }
  
  /**
   * checks to see if brackets are valid
   * also sets/clears errorMessage
   * 
   * @returns {boolean} - true if brackets are valid
   */
  validBrackets(): boolean { 
    if (this.brackets.length === 0) { 
      this.errorMessage = 'No brackets';
      return false;
    };
    if (!this._brktCounts
      || !this._brktCounts.forFullValues
      || this._brktCounts.forFullValues.length !== this.brackets.length)
    { 
      this.errorMessage = 'Invalid bracket counts';
      return false;
    }
    let oneByeCount = 0
    for (let i = this._brktCounts.forFullValues.length - 1; i >= 0; i--) {
      if (this._brktCounts.forFullValues[i] === null || this._brktCounts.forFullValues[i] === undefined) {
        this.errorMessage = `Bracket ${i + 1} count is missing`;
        return false;
      } 
      const count = this._brktCounts.forFullValues[i] as number;
      if (count > 1) { 
        this.errorMessage = `Bracket ${i + 1} has more than 1 empty spot`;
        return false;        
      }
      if (count === 1) {
        oneByeCount++;
      }
      if (oneByeCount === this.playersPerBrkt) {
        this.errorMessage = `More than ${this.playersPerBrkt - 1} brackets with one bye`;
        return false;
      }
    }
    return true;
  }
}