import { Bracket } from "@/components/brackets/bracketClass";
import { BracketMatch, matchNumberType } from "@/components/brackets/bracketMatchClass";
import {
  byeId,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { BracketList } from "@/components/brackets/bracketListClass";
import { playerEntryRow, populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { gameType, playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

/***************************************
* createPlayersMap is private.         *
* change to public before testing      *
* change to private back after testing *
***************************************/

describe("BracketMatch - throw errors", () => {
  let brktList: BracketList;
  let bracket: Bracket;
  let bracketMatch: BracketMatch;
  let testGames: gameType[];

  const oneBrkt = mockTmntFullData.oneBrkts[0];
  const div1Entries = mockTmntFullData.divEntries.filter(
    (divEntry) => divEntry.div_id === mockTmntFullData.divs[0].id,
  );

  const brktSeeds = mockTmntFullData.brktSeeds
    .filter((brktSeed) => brktSeed.one_brkt_id === oneBrkt.id)
    .sort((a, b) => a.seed - b.seed);

  const playerIds = brktSeeds.map((brktSeed) => brktSeed.player_id);

  const mockPlayerRows: playerEntryRow[] = populatePlayerRows(mockTmntFullData);
  const brktId = mockTmntFullData.brkts[0].id;

  const addPlayersToBracket = (bracket: Bracket, players: string[]): void => {
    if (players.length > 0 && ((players.length & 2) === 0)) {
      for (let i = 0; i < players.length; i += 2) {
        bracket.addMatch([players[i], players[i + 1]]);
      }
    }
  };
  
  beforeEach(() => {
    testGames = cloneDeep(mockGames);

    brktList = new BracketList(
      brktId,
      2,
      3,
      [1, 2, 3],
    );
    brktList.addBrktEntries(mockPlayerRows);
    brktList.createGameScoresMap(testGames);
    brktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);

    bracket = new Bracket(mockTmntFullData.brkts[0].id);
    bracket.parent = brktList;

    addPlayersToBracket(bracket, playerIds);
    expect(bracket.players.length).toBe(8);

    bracketMatch = new BracketMatch(bracket);
  });

  it("throws when BracketMatch parent is null", () => {
    expect(() => {
      new BracketMatch(null as unknown as Bracket);
    }).toThrow("parent is null");
  });

  it("throws when gameScoreMap is null", () => {
    const testBrktList = new BracketList(
      brktId,
      2,
      3,
      [1, 2, 3],
    );

    testBrktList.addBrktEntries(mockPlayerRows);
    testBrktList.createPlayersMap(
      div1Entries,
      mockTmntFullData.divs[0],
    );

    const testBracket = new Bracket(
      mockTmntFullData.brkts[0].id,
    );
    testBracket.parent = testBrktList;

    addPlayersToBracket(testBracket, playerIds);

    const testBracketMatch = new BracketMatch(testBracket);

    expect(() => {
      testBracketMatch.getMatchInfo(
        [playerId1, playerId2],
        1,
      );
    }).toThrow("gameScoreMap is null");
  });

  it("throws when playerMap is null", () => {
    const testBrktList = new BracketList(
      brktId,
      2,
      3,
      [1, 2, 3],
    );

    testBrktList.addBrktEntries(mockPlayerRows);
    testBrktList.createGameScoresMap(testGames);

    const testBracket = new Bracket(
      mockTmntFullData.brkts[0].id,
    );
    testBracket.parent = testBrktList;

    addPlayersToBracket(testBracket, playerIds);

    const testBracketMatch = new BracketMatch(testBracket);

    expect(() => {
      testBracketMatch.getMatchInfo(
        [playerId1, playerId2],
        1,
      );
    }).toThrow("playerMap is null");
  });

  it("throws when requesting players for an invalid later match", () => {
    expect(() => {
      bracketMatch.getPlayersForPosition(
        7 as unknown as matchNumberType,
        0,
      );
    }).toThrow("Match 7 has no prior match.");
  });

});