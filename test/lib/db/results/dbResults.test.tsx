import { getGameResultsForTmnt } from "@/lib/db/results/dbResults";

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.

const userId = "usr_01234567890123456789012345678901";

describe("dbResults", () => {

  describe("getGameResultsForTmnt", () => {
    const tmntIdMultiDivs = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
    const tmntIdOneDiv = "tmt_fd99387c33d9c78aba290286576ddce5";

    it("should return game results for tmnt with multiple divs", async () => {
      const gameResults = await getGameResultsForTmnt(tmntIdMultiDivs);

      expect(gameResults).toBeDefined();
      expect(gameResults).toBeInstanceOf(Array);
      if (!gameResults) return
      expect(gameResults.length).toBe(8); // 4 players, 2 divs

      expect(gameResults[0]).toHaveProperty("player_id");
      expect(gameResults[0]).toHaveProperty("div_id");
      expect(gameResults[0]).toHaveProperty("div_name");
      expect(gameResults[0]).toHaveProperty("sort_order");
      expect(gameResults[0]).toHaveProperty("full_name");
      expect(gameResults[0]).toHaveProperty("average");
      expect(gameResults[0]).toHaveProperty("hdcp");
      expect(gameResults[0]).toHaveProperty("Game 1");
      expect(gameResults[0]).toHaveProperty("Game 1 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 2");
      expect(gameResults[0]).toHaveProperty("Game 2 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 3");
      expect(gameResults[0]).toHaveProperty("Game 3 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 4");
      expect(gameResults[0]).toHaveProperty("Game 4 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 5");
      expect(gameResults[0]).toHaveProperty("Game 5 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 6");
      expect(gameResults[0]).toHaveProperty("Game 6 + Hdcp");
      expect(gameResults[0]).toHaveProperty("total");
      expect(gameResults[0]).toHaveProperty("total_hdcp");
      expect(gameResults[0]).toHaveProperty("total + Hdcp");

      expect(Number.isInteger(gameResults[0].hdcp)).toBe(true);
      expect(gameResults[0]["Game 1 + Hdcp"]).toBe(
        gameResults[0]["Game 1"] + gameResults[0].hdcp
      );
      expect(gameResults[0].total_hdcp).toBe(gameResults[0].hdcp * 6);
      expect(gameResults[0]["total + Hdcp"]).toBe(
        gameResults[0].total + gameResults[0].hdcp * 6
      );
    });

    it("should return game results for tmnt with one div", async () => {
      const gameResults = await getGameResultsForTmnt(tmntIdOneDiv);

      expect(gameResults).toBeDefined();
      expect(gameResults).toBeInstanceOf(Array);
      if (!gameResults) return
      expect(gameResults.length).toBe(4); // 4 players, 1 div

      expect(gameResults[0]).toHaveProperty("player_id");
      expect(gameResults[0]).toHaveProperty("div_id");
      expect(gameResults[0]).toHaveProperty("div_name");
      expect(gameResults[0]).toHaveProperty("sort_order");
      expect(gameResults[0]).toHaveProperty("full_name");
      expect(gameResults[0]).toHaveProperty("average");
      expect(gameResults[0]).toHaveProperty("hdcp");
      expect(gameResults[0]).toHaveProperty("Game 1");
      expect(gameResults[0]).toHaveProperty("Game 1 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 2");
      expect(gameResults[0]).toHaveProperty("Game 2 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 3");
      expect(gameResults[0]).toHaveProperty("Game 3 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 4");
      expect(gameResults[0]).toHaveProperty("Game 4 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 5");
      expect(gameResults[0]).toHaveProperty("Game 5 + Hdcp");
      expect(gameResults[0]).toHaveProperty("Game 6");
      expect(gameResults[0]).toHaveProperty("Game 6 + Hdcp");
      expect(gameResults[0]).toHaveProperty("total");
      expect(gameResults[0]).toHaveProperty("total_hdcp");
      expect(gameResults[0]).toHaveProperty("total + Hdcp");

      expect(gameResults[0].hdcp).toBe(0);
      expect(Number.isInteger(gameResults[0].hdcp)).toBe(true);
      expect(gameResults[0]["Game 1 + Hdcp"]).toBe(
        gameResults[0]["Game 1"] + gameResults[0].hdcp
      );
      expect(gameResults[0].total_hdcp).toBe(gameResults[0].hdcp * 6);
      expect(gameResults[0]["total + Hdcp"]).toBe(
        gameResults[0].total + gameResults[0].hdcp * 6
      );
    });

    it("should return sorted game results", async () => {
      const gameResults = await getGameResultsForTmnt(tmntIdOneDiv);

      expect(gameResults).toBeDefined();
      expect(gameResults).toBeInstanceOf(Array);
      if (!gameResults) return
      expect(gameResults.length).toBe(4); // 4 players, 1 div      
      expect(gameResults[0]["total + Hdcp"]).toBeGreaterThan(
        gameResults[1]["total + Hdcp"]!
      )
      expect(gameResults[1]["total + Hdcp"]).toBeGreaterThan(
        gameResults[2]["total + Hdcp"]!
      )
      expect(gameResults[1]["total + Hdcp"]).toBeGreaterThan(
        gameResults[2]["total + Hdcp"] ?? 0
      )
    });

    it("should return empty game results for tmnt with not in database", async () => {
      const noGamesTmntId = "tmt_01234567890123456789012345678901";
      const gameResults = await getGameResultsForTmnt(noGamesTmntId);

      expect(gameResults).toBeDefined();
      expect(gameResults).toBeInstanceOf(Array);
      if (!gameResults) return
      expect(gameResults.length).toBe(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getGameResultsForTmnt("test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      await expect(getGameResultsForTmnt(userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getGameResultsForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });
});