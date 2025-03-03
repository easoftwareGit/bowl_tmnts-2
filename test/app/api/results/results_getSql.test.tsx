import { getDivGamesSql, getTmntGamesSql } from "@/app/api/results/games/getSql"
import { maxGames } from "@/lib/validation"

describe('getSql', () => { 

  const squadId = "sqd_3397da1adc014cf58c44e07c19914f71"

  describe('getSQL for div games', () => { 

    const divId = "div_578834e04e5e4885bbae79229d8b96e8"
    const divIdHdcp = 'div_24b1cd5dee0542038a1244fc2978e862'
    const squadGames = 6

    describe('should return the correct SQL for div games', () => { 
      
      it('should return the correct SQL for div games - NO HDCP', () => { 
        const sql = getDivGamesSql(divId, squadGames);
        const expected = 
          // get game scores
          `WITH game_scores AS (` + 
          `SELECT ` +          
          `"Game".player_id, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1", ` +
          `CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2", ` +
          `CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3", ` +
          `CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4", ` +
          `CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5", ` + 
          `CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6", ` +
          `CAST(SUM(score) AS INTEGER) AS total ` +
          `FROM public."Game" ` +
          `JOIN "Div_Entry" ` +
          `ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id ` +
          `JOIN "Squad" ` +
          `ON "Game".squad_id = "Squad".id ` +
          `JOIN "Player" ` +
          `ON "Game".player_id = "Player".id ` +
          `WHERE "Div_Entry".div_id = '${divId}' ` +
          `GROUP BY "Game".player_id, "Player".first_name, "Player".last_name` +
          `), ` +     
          // get player info
          `player_info AS (` +
          `SELECT ` +
          `"Player".id AS player_id, ` + 
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `"Player".average, ` +
          `"Div".hdcp_from, ` +
          `"Div".hdcp_per ` +
          `FROM public."Player" ` +
          `JOIN public."Div_Entry" ON "Player".id = "Div_Entry".player_id ` +
          `JOIN public."Div" ON "Div_Entry".div_id = "Div".id ` +
          `WHERE "Div_Entry".div_id = '${divId}'`+
          `), ` +
          // get calculated HDCP
          `calculated_hdcp AS (` +
          `SELECT ` +
          `player_info.player_id, ` +
          `player_info.full_name, ` +
          `player_info.average, ` +
          `player_info.hdcp_from, ` +
          `player_info.hdcp_per, ` +
          `CASE ` + 
          `WHEN player_info.hdcp_per = 0 THEN 0 ` +
          `ELSE CAST( `+
          `CASE ` +
          `WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) ` +
          `ELSE 0 ` +
          `END AS INTEGER ` +
          `) ` +
          `END AS hdcp ` +
          `FROM player_info` +
          `), ` +
          // get final result
          `final_result AS (` +
          `SELECT ` +
          `game_scores.player_id, ` +
          `calculated_hdcp.full_name, ` +
          `calculated_hdcp.average, ` +
          `calculated_hdcp.hdcp, ` +
          `game_scores."Game 1", ` +
          `game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", ` +
          `game_scores."Game 2", ` +
          `game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", ` +
          `game_scores."Game 3", ` +
          `game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", ` +
          `game_scores."Game 4", ` +
          `game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", ` +
          `game_scores."Game 5", ` +
          `game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", ` +
          `game_scores."Game 6", ` +
          `game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", ` +
          `game_scores.total, ` +
          `game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp" ` +
          `FROM game_scores ` +
          `JOIN calculated_hdcp ON game_scores.player_id = calculated_hdcp.player_id` +
          `) ` + 
          `SELECT * ` +
          `FROM final_result ` +
          `ORDER BY "total + Hdcp" DESC;`

        expect(sql).toBe(expected)
      })
      it('should return the correct SQL for div games - HDCP', () => { 
        const sql = getDivGamesSql(divIdHdcp, squadGames);
        const expected = 
          // get game scores
          `WITH game_scores AS (` + 
          `SELECT ` +          
          `"Game".player_id, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1", ` +
          `CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2", ` +
          `CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3", ` +
          `CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4", ` +
          `CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5", ` + 
          `CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6", ` +
          `CAST(SUM(score) AS INTEGER) AS total ` +
          `FROM public."Game" ` +
          `JOIN "Div_Entry" ` +
          `ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id ` +
          `JOIN "Squad" ` +
          `ON "Game".squad_id = "Squad".id ` +
          `JOIN "Player" ` +
          `ON "Game".player_id = "Player".id ` +
          `WHERE "Div_Entry".div_id = '${divIdHdcp}' ` +
          `GROUP BY "Game".player_id, "Player".first_name, "Player".last_name` +
          `), ` +     
          // get player info
          `player_info AS (` +
          `SELECT ` +
          `"Player".id AS player_id, ` + 
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `"Player".average, ` +
          `"Div".hdcp_from, ` +
          `"Div".hdcp_per ` +
          `FROM public."Player" ` +
          `JOIN public."Div_Entry" ON "Player".id = "Div_Entry".player_id ` +
          `JOIN public."Div" ON "Div_Entry".div_id = "Div".id ` +
          `WHERE "Div_Entry".div_id = '${divIdHdcp}'`+
          `), ` +
          // get calculated HDCP
          `calculated_hdcp AS (` +
          `SELECT ` +
          `player_info.player_id, ` +
          `player_info.full_name, ` +
          `player_info.average, ` +
          `player_info.hdcp_from, ` +
          `player_info.hdcp_per, ` +
          `CASE ` + 
          `WHEN player_info.hdcp_per = 0 THEN 0 ` +
          `ELSE CAST( `+
          `CASE ` +
          `WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) ` +
          `ELSE 0 ` +
          `END AS INTEGER ` +
          `) ` +
          `END AS hdcp ` +
          `FROM player_info` +
          `), ` +
          // get final result
          `final_result AS (` +
          `SELECT ` +
          `game_scores.player_id, ` +
          `calculated_hdcp.full_name, ` +
          `calculated_hdcp.average, ` +
          `calculated_hdcp.hdcp, ` +
          `game_scores."Game 1", ` +
          `game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", ` +
          `game_scores."Game 2", ` +
          `game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", ` +
          `game_scores."Game 3", ` +
          `game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", ` +
          `game_scores."Game 4", ` +
          `game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", ` +
          `game_scores."Game 5", ` +
          `game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", ` +
          `game_scores."Game 6", ` +
          `game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", ` +
          `game_scores.total, ` +
          `game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp" ` +
          `FROM game_scores ` +
          `JOIN calculated_hdcp ON game_scores.player_id = calculated_hdcp.player_id` +
          `) ` + 
          `SELECT * ` +
          `FROM final_result ` +
          `ORDER BY "total + Hdcp" DESC;`

        expect(sql).toBe(expected)
      })
    })

    describe('should return "" for div games SQL with invalid params', () => {     

      it('should return "" if invalid divId', () => {
        const sql = getDivGamesSql("invalid", squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if divId is null', () => {
        const sql = getDivGamesSql(null as any, squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if divId is valid, but not a div id', () => {
        const sql = getDivGamesSql(squadId, squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is too low', () => {
        const sql = getDivGamesSql(divId, -1);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is too high', () => {
        const sql = getDivGamesSql(divId, maxGames + 1);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is null', () => {
        const sql = getDivGamesSql(divId, null as any);
        expect(sql).toBe("")
      })
    })

  })

  describe('getSQL for tmnt games', () => { 

    const tmntIdMultiDivs = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1';
    const tmntIdOneDiv = 'tmt_fd99387c33d9c78aba290286576ddce5';
    const squadGames = 6;

    describe('should return the correct SQL for tmnt games', () => { 

      it('should return the corect SQL for tmnt games, multi divs', () => { 
        const sql = getTmntGamesSql(tmntIdMultiDivs, squadGames);
        const expected = 
          // get game scores
          `WITH game_scores AS (` +
          `SELECT ` +
          `"Game".player_id, ` +
          `"Div_Entry".div_id, ` +
          `"Div".div_name, ` +
          `"Div".sort_order, ` +
          `"Tmnt".tmnt_name, ` +
          `"Tmnt".start_date, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1", ` +
          `CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2", ` +
          `CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3", ` +
          `CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4", ` +
          `CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5", ` +
          `CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6", ` +
          `CAST(SUM(score) AS INTEGER) AS total ` +
          `FROM public."Game" ` +
          `JOIN "Div_Entry" ` +
          `ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id ` +
          `JOIN "Div" ` +
          `ON "Div_Entry".div_id = "Div".id ` +
          `JOIN "Squad" ` +
          `ON "Game".squad_id = "Squad".id ` +
          `JOIN "Player" ` +
          `ON "Game".player_id = "Player".id ` +
          `JOIN "Tmnt" ` +
          `ON "Tmnt".id = "Div".tmnt_id ` +      
          `WHERE "Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1' ` +
          `GROUP BY "Game".player_id, "Div_Entry".div_id, "Div".div_name, "Div".sort_order, "Tmnt".tmnt_name, "Tmnt".start_date, "Player".first_name, "Player".last_name ` +
          `), ` +
          // get player info
          `player_info AS (` +
          `SELECT ` +
          `"Player".id AS player_id, ` +
          `"Div_Entry".div_id, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `"Player".average, ` +
          `"Div".hdcp_from, ` +
          `"Div".hdcp_per ` +
          `FROM public."Player" ` +
          `JOIN public."Div_Entry" ` +
          `ON "Player".id = "Div_Entry".player_id ` +
          `JOIN public."Div" ` +
          `ON "Div_Entry".div_id = "Div".id ` +
          `WHERE "Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1' ` +
          `), ` +
          // get calculated handicaps
          `calculated_hdcp AS (` +
          `SELECT ` +
          `player_info.player_id, ` +
          `player_info.div_id, ` +
          `player_info.full_name, ` +
          `player_info.average, ` +
          `player_info.hdcp_from, ` +
          `player_info.hdcp_per, ` +
          `CASE ` +
          `WHEN player_info.hdcp_per = 0 THEN 0 ` + 
          `ELSE CAST( ` +
          `CASE ` + 
          `WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) ` +
          `ELSE 0 ` + 
          `END AS INTEGER ` +
          `) ` +
          `END AS hdcp ` +
          `FROM player_info` +
          `), ` + 
          // get final result
          `final_result AS (` +
          `SELECT ` +
          `game_scores.player_id, ` +
          `game_scores.div_id, ` + 
          `game_scores.div_name, ` +
          `game_scores.sort_order, ` + 
          `game_scores.tmnt_name, ` +
          `game_scores.start_date, ` +
          `calculated_hdcp.full_name, ` + 
          `calculated_hdcp.average, ` + 
          `calculated_hdcp.hdcp, ` +
          `game_scores."Game 1", ` +
          `game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", ` +
          `game_scores."Game 2", ` +
          `game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", ` +
          `game_scores."Game 3", ` +
          `game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", ` +
          `game_scores."Game 4", ` +
          `game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", ` +
          `game_scores."Game 5", ` +
          `game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", ` +
          `game_scores."Game 6", ` +
          `game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", ` +
          `game_scores.total, ` +
          `game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp" ` +
          `FROM game_scores ` +
          `JOIN calculated_hdcp ` +
          `ON game_scores.player_id = calculated_hdcp.player_id ` +
          `AND game_scores.div_id = calculated_hdcp.div_id ` +
          `) ` +
          `SELECT * ` +
          `FROM final_result ` +
          `ORDER BY "total + Hdcp" DESC;`
      
        expect(sql).toBe(expected)
      })
      it('should return the corect SQL for tmnt games, multi divs', () => { 
        const sql = getTmntGamesSql(tmntIdOneDiv, squadGames);
        const expected = 
          // get game scores
          `WITH game_scores AS (` +
          `SELECT ` +
          `"Game".player_id, ` +
          `"Div_Entry".div_id, ` +
          `"Div".div_name, ` +
          `"Div".sort_order, ` +
          `"Tmnt".tmnt_name, ` +
          `"Tmnt".start_date, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1", ` +
          `CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2", ` +
          `CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3", ` +
          `CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4", ` +
          `CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5", ` +
          `CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6", ` +
          `CAST(SUM(score) AS INTEGER) AS total ` +
          `FROM public."Game" ` +
          `JOIN "Div_Entry" ` +
          `ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id ` +
          `JOIN "Div" ` +
          `ON "Div_Entry".div_id = "Div".id ` +
          `JOIN "Squad" ` +
          `ON "Game".squad_id = "Squad".id ` +
          `JOIN "Player" ` +
          `ON "Game".player_id = "Player".id ` +
          `JOIN "Tmnt" ` +
          `ON "Tmnt".id = "Div".tmnt_id ` +      
          `WHERE "Div".tmnt_id = 'tmt_fd99387c33d9c78aba290286576ddce5' ` +
          `GROUP BY "Game".player_id, "Div_Entry".div_id, "Div".div_name, "Div".sort_order, "Tmnt".tmnt_name, "Tmnt".start_date, "Player".first_name, "Player".last_name ` +
          `), ` +
          // get player info
          `player_info AS (` +
          `SELECT ` +
          `"Player".id AS player_id, ` +
          `"Div_Entry".div_id, ` +
          `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
          `"Player".average, ` +
          `"Div".hdcp_from, ` +
          `"Div".hdcp_per ` +
          `FROM public."Player" ` +
          `JOIN public."Div_Entry" ` +
          `ON "Player".id = "Div_Entry".player_id ` +
          `JOIN public."Div" ` +
          `ON "Div_Entry".div_id = "Div".id ` +
          `WHERE "Div".tmnt_id = 'tmt_fd99387c33d9c78aba290286576ddce5' ` +
          `), ` +
          // get calculated handicaps
          `calculated_hdcp AS (` +
          `SELECT ` +
          `player_info.player_id, ` +
          `player_info.div_id, ` +
          `player_info.full_name, ` +
          `player_info.average, ` +
          `player_info.hdcp_from, ` +
          `player_info.hdcp_per, ` +
          `CASE ` +
          `WHEN player_info.hdcp_per = 0 THEN 0 ` + 
          `ELSE CAST( ` +
          `CASE ` + 
          `WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) ` +
          `ELSE 0 ` + 
          `END AS INTEGER ` +
          `) ` +
          `END AS hdcp ` +
          `FROM player_info` +
          `), ` + 
          // get final result
          `final_result AS (` +
          `SELECT ` +
          `game_scores.player_id, ` +
          `game_scores.div_id, ` + 
          `game_scores.div_name, ` +
          `game_scores.sort_order, ` + 
          `game_scores.tmnt_name, ` +
          `game_scores.start_date, ` +
          `calculated_hdcp.full_name, ` + 
          `calculated_hdcp.average, ` + 
          `calculated_hdcp.hdcp, ` +
          `game_scores."Game 1", ` +
          `game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", ` +
          `game_scores."Game 2", ` +
          `game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", ` +
          `game_scores."Game 3", ` +
          `game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", ` +
          `game_scores."Game 4", ` +
          `game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", ` +
          `game_scores."Game 5", ` +
          `game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", ` +
          `game_scores."Game 6", ` +
          `game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", ` +
          `game_scores.total, ` +
          `game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp" ` +
          `FROM game_scores ` +
          `JOIN calculated_hdcp ` +
          `ON game_scores.player_id = calculated_hdcp.player_id ` +
          `AND game_scores.div_id = calculated_hdcp.div_id ` +
          `) ` +
          `SELECT * ` +
          `FROM final_result ` +
          `ORDER BY "total + Hdcp" DESC;`
      
        expect(sql).toBe(expected)
      })

    })

    describe('should return "" for tmnt games SQL with invalid params', () => {     

      it('should return "" if invalid tmntId', () => {
        const sql = getTmntGamesSql("invalid", squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if tmntId is null', () => {
        const sql = getTmntGamesSql(null as any, squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if tmntId is valid, but not a tmnt id', () => {
        const sql = getTmntGamesSql(squadId, squadGames);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is too low', () => {
        const sql = getTmntGamesSql(tmntIdOneDiv, -1);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is too high', () => {
        const sql = getTmntGamesSql(tmntIdOneDiv, maxGames + 1);
        expect(sql).toBe("")
      })
      it('should return "" if squadGames is null', () => {
        const sql = getTmntGamesSql(tmntIdOneDiv, null as any);
        expect(sql).toBe("")
      })
    })

  })
})