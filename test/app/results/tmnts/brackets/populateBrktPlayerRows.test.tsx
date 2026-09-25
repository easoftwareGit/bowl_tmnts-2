import {
  populatePlayerBrktRows,
} from "@/app/results/tmnt/[tmntId]/brackets/populateBrktPlayerRows";
import {
  BracketList,
  brktListInitialDataType,
} from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import {
  brktId1,
  brktId2,
  divId1,
  mockByePlayer,
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
} from "../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("populatePlayerBrktRows", () => {
  let brktListRecords: brktListRecord;

  const initData: brktListInitialDataType = {
    tmntFullData: mockTmntFullData,
    divId: divId1,
  };

  /**
   * Creates the two bracket lists used by mockTmntFullData.
   *
   * brktId1 uses games 1, 2 and 3.
   * brktId2 uses games 4, 5 and 6.
   */
  const setup = (): void => {
    const brktList1 = new BracketList(
      brktId1,
      2,
      3,
      [1, 2, 3],
      mockByePlayer,
      initData,
    );

    const brktList2 = new BracketList(
      brktId2,
      2,
      3,
      [4, 5, 6],
      mockByePlayer,
      initData,
    );

    brktListRecords = {
      [brktId1]: brktList1,
      [brktId2]: brktList2,
    };
  };

  /**
   * Converts mockGames into the tournament-result format used by
   * populatePlayerBrktRows().
   *
   * Only games through lastGame are included. This lets each test
   * simulate scores being entered one game at a time.
   */
  const resultsThrough = (
    lastGame: number,
  ): tmntGameResult[] => {
    const playerIds = [
      playerId1,
      playerId2,
      playerId3,
      playerId4,
      playerId5,
      playerId6,
      playerId7,
      playerId8,
    ];

    return playerIds.map((playerId) => {
      const result = {
        player_id: playerId,
      } as tmntGameResult;

      mockGames
        .filter(
          (game) =>
            game.player_id === playerId &&
            game.game_num <= lastGame,
        )
        .forEach((game) => {
          const gameCol =
            `Game ${game.game_num}` as keyof tmntGameResult;

          (
            result as unknown as Record<string, unknown>
          )[gameCol] = game.score;
        });

      return result;
    });
  };

  /**
   * Returns one player row or throws a useful test error if
   * populatePlayerBrktRows() did not create the row.
   */
  const getPlayerRow = (
    rows: ReturnType<typeof populatePlayerBrktRows>,
    playerId: string,
  ) => {
    const row = rows.find(
      (playerRow) =>
        playerRow.player_id === playerId,
    );

    if (row === undefined) {
      throw new Error(
        `Player row not found for ${playerId}.`,
      );
    }

    return row;
  };

  beforeEach(() => {
    setup();
  });

  // it("creates one row for each player when no scores have been entered", () => {
  //   const rows = populatePlayerBrktRows(
  //     [],
  //     brktListRecords,
  //   );

  //   expect(rows).toHaveLength(8);

  //   expect(
  //     rows.map((row) => row.player_id),
  //   ).toEqual(
  //     expect.arrayContaining([
  //       playerId1,
  //       playerId2,
  //       playerId3,
  //       playerId4,
  //       playerId5,
  //       playerId6,
  //       playerId7,
  //       playerId8,
  //     ]),
  //   );
  // });

  // it("combines the In counts from both bracket lists when no scores have been entered", () => {
  //   const rows = populatePlayerBrktRows(
  //     [],
  //     brktListRecords,
  //   );

  //   /*
  //    * Every player is entered in:
  //    *
  //    *   8 brackets for brktId1
  //    * + 8 brackets for brktId2
  //    * ------------------------
  //    *  16 brackets total
  //    */
  //   rows.forEach((row) => {
  //     expect(row.in).toBe(16);
  //     expect(row.cash).toBe("");
  //   });
  // });

  // it("does not add game columns when no scores have been entered", () => {
  //   const rows = populatePlayerBrktRows(
  //     [],
  //     brktListRecords,
  //   );

  //   rows.forEach((row) => {
  //     expect(row).not.toHaveProperty("Game 1");
  //     expect(row).not.toHaveProperty("Game 2");
  //     expect(row).not.toHaveProperty("Game 3");
  //     expect(row).not.toHaveProperty("Game 4");
  //     expect(row).not.toHaveProperty("Game 5");
  //     expect(row).not.toHaveProperty("Game 6");
  //   });
  // });

  // it("copies game 1 scores into the player rows", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(1),
  //     brktListRecords,
  //   );

  //   expect(
  //     getPlayerRow(rows, playerId1)["Game 1"],
  //   ).toBe(201);

  //   expect(
  //     getPlayerRow(rows, playerId2)["Game 1"],
  //   ).toBe(210);

  //   expect(
  //     getPlayerRow(rows, playerId3)["Game 1"],
  //   ).toBe(195);

  //   expect(
  //     getPlayerRow(rows, playerId4)["Game 1"],
  //   ).toBe(205);

  //   expect(
  //     getPlayerRow(rows, playerId5)["Game 1"],
  //   ).toBe(225);

  //   expect(
  //     getPlayerRow(rows, playerId6)["Game 1"],
  //   ).toBe(229);

  //   expect(
  //     getPlayerRow(rows, playerId7)["Game 1"],
  //   ).toBe(190);

  //   expect(
  //     getPlayerRow(rows, playerId8)["Game 1"],
  //   ).toBe(230);
  // });

  it("does not change the second bracket list before game 4 is entered", () => {
    const rows = populatePlayerBrktRows(
      resultsThrough(3),
      brktListRecords,
    );

    /*
     * Games 1-3 can eliminate players from brktId1.
     *
     * brktId2 does not start until game 4, so every player
     * must still have at least the 8 brktId2 entries alive.
     */
    rows.forEach((row) => {
      expect(row.in).toBeGreaterThanOrEqual(8);
    });
  });

  // it("copies games 1 through 3 without adding games 4 through 6", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(3),
  //     brktListRecords,
  //   );

  //   const player1Row = getPlayerRow(
  //     rows,
  //     playerId1,
  //   );

  //   expect(player1Row["Game 1"]).toBe(201);
  //   expect(player1Row["Game 2"]).toBe(202);
  //   expect(player1Row["Game 3"]).toBe(203);

  //   expect(player1Row).not.toHaveProperty("Game 4");
  //   expect(player1Row).not.toHaveProperty("Game 5");
  //   expect(player1Row).not.toHaveProperty("Game 6");
  // });

  // it("starts updating the second bracket list when game 4 is entered", () => {
  //   const rowsBeforeGame4 =
  //     populatePlayerBrktRows(
  //       resultsThrough(3),
  //       brktListRecords,
  //     );

  //   /*
  //    * Recreate the lists because populatePlayerBrktRows()
  //    * updates their bracket state.
  //    */
  //   setup();

  //   const rowsAfterGame4 =
  //     populatePlayerBrktRows(
  //       resultsThrough(4),
  //       brktListRecords,
  //     );

  //   /*
  //    * Game 4 is the first game used by brktId2.
  //    * At least one player's total number of live brackets
  //    * should therefore decrease.
  //    */
  //   const inChanged = rowsAfterGame4.some(
  //     (row) => {
  //       const beforeRow = getPlayerRow(
  //         rowsBeforeGame4,
  //         row.player_id,
  //       );

  //       return row.in < beforeRow.in;
  //     },
  //   );

  //   expect(inChanged).toBe(true);
  // });

  // it("copies the new random game 4 scores into the player rows", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(4),
  //     brktListRecords,
  //   );

  //   expect(
  //     getPlayerRow(rows, playerId1)["Game 4"],
  //   ).toBe(252);

  //   expect(
  //     getPlayerRow(rows, playerId2)["Game 4"],
  //   ).toBe(265);

  //   expect(
  //     getPlayerRow(rows, playerId3)["Game 4"],
  //   ).toBe(263);

  //   expect(
  //     getPlayerRow(rows, playerId4)["Game 4"],
  //   ).toBe(181);

  //   expect(
  //     getPlayerRow(rows, playerId5)["Game 4"],
  //   ).toBe(228);

  //   expect(
  //     getPlayerRow(rows, playerId6)["Game 4"],
  //   ).toBe(222);

  //   expect(
  //     getPlayerRow(rows, playerId7)["Game 4"],
  //   ).toBe(193);

  //   expect(
  //     getPlayerRow(rows, playerId8)["Game 4"],
  //   ).toBe(263);
  // });

  // it("copies the new random game 5 scores into the player rows", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(5),
  //     brktListRecords,
  //   );

  //   expect(
  //     getPlayerRow(rows, playerId1)["Game 5"],
  //   ).toBe(182);

  //   expect(
  //     getPlayerRow(rows, playerId2)["Game 5"],
  //   ).toBe(202);

  //   expect(
  //     getPlayerRow(rows, playerId3)["Game 5"],
  //   ).toBe(242);

  //   expect(
  //     getPlayerRow(rows, playerId4)["Game 5"],
  //   ).toBe(188);

  //   expect(
  //     getPlayerRow(rows, playerId5)["Game 5"],
  //   ).toBe(182);

  //   expect(
  //     getPlayerRow(rows, playerId6)["Game 5"],
  //   ).toBe(183);

  //   expect(
  //     getPlayerRow(rows, playerId7)["Game 5"],
  //   ).toBe(228);

  //   expect(
  //     getPlayerRow(rows, playerId8)["Game 5"],
  //   ).toBe(261);
  // });

  // it("copies all six game scores into the player rows", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(6),
  //     brktListRecords,
  //   );

  //   const player1Row = getPlayerRow(
  //     rows,
  //     playerId1,
  //   );

  //   expect(player1Row).toMatchObject({
  //     "Game 1": 201,
  //     "Game 2": 202,
  //     "Game 3": 203,
  //     "Game 4": 252,
  //     "Game 5": 182,
  //     "Game 6": 185,
  //   });

  //   const player8Row = getPlayerRow(
  //     rows,
  //     playerId8,
  //   );

  //   expect(player8Row).toMatchObject({
  //     "Game 1": 230,
  //     "Game 2": 231,
  //     "Game 3": 232,
  //     "Game 4": 263,
  //     "Game 5": 261,
  //     "Game 6": 239,
  //   });
  // });

  // it("marks players who cash after completed brackets", () => {
  //   const rows = populatePlayerBrktRows(
  //     resultsThrough(6),
  //     brktListRecords,
  //   );

  //   /*
  //    * At least one player must finish first or second in
  //    * one of the sixteen individual brackets.
  //    */
  //   expect(
  //     rows.some((row) => row.cash === "$"),
  //   ).toBe(true);
  // });

  // it("returns the rows sorted by last name and first name", () => {
  //   const rows = populatePlayerBrktRows(
  //     [],
  //     brktListRecords,
  //   );

  //   expect(
  //     rows.map((row) => ({
  //       first_name: row.first_name,
  //       last_name: row.last_name,
  //     })),
  //   ).toEqual([
  //     {
  //       first_name: "Jane",
  //       last_name: "Doe",
  //     },
  //     {
  //       first_name: "Jill",
  //       last_name: "Doe",
  //     },
  //     {
  //       first_name: "Joe",
  //       last_name: "Doe",
  //     },
  //     {
  //       first_name: "John",
  //       last_name: "Doe",
  //     },
  //     {
  //       first_name: "Terri",
  //       last_name: "Smith",
  //     },
  //     {
  //       first_name: "Tina",
  //       last_name: "Smith",
  //     },
  //     {
  //       first_name: "Tom",
  //       last_name: "Smith",
  //     },
  //     {
  //       first_name: "Tony",
  //       last_name: "Smith",
  //     },
  //   ]);
  // });
});