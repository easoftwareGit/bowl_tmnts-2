import { validGames } from "@/lib/validation/squads/validate"
import { isValidBtDbId } from "@/lib/validation/validation"

const getSumsForGames = (squadGames: number) => {
  let sumSQL = ''
  for (let i = 1; i <= squadGames; i++) {
    sumSQL += `CAST(SUM(CASE WHEN game_num = ${i} THEN score ELSE NULL END) AS INTEGER) AS "Game ${i}", `
  }
  sumSQL += `CAST(SUM(score) AS INTEGER) AS total `
  return sumSQL
}

const getScoresPlusHdcp = (squadGames: number) => { 
  let scoresSql = ''
  for (let i = 1; i <= squadGames; i++) {
    scoresSql += `game_scores."Game ${i}", `;
    // scoresSql += `game_scores."Game ${i}" + calculated_hdcp.hdcp AS "Game ${i} + Hdcp", `;  
  }
  scoresSql += `game_scores.total `;  // removed trailing comma
  // scoresSql += `game_scores.total, `;  
  // scoresSql += `game_scores.total + (calculated_hdcp.hdcp * ${squadGames}) AS "total + Hdcp" `
  return scoresSql
}

/**
 * gets SQL for getting tmnt games
 * 
 * @param {string} tmntId - id of tmnt where to get games
 * @param {number} squadGames - number of games in squad
 * @param {string} squadGames - SQL for getting tmnt games or ''
 */
export const getTmntGamesSql = (tmntId: string, squadGames: number): string => { 

  if (!isValidBtDbId(tmntId, "tmt") || !validGames(squadGames)) return '';

  const tmntGamesSql = 
    // get game scores, but FROM Div_Entry so all players are included
    `WITH game_scores AS (` +
    `SELECT ` +
      `"Div_Entry".player_id, ` +
      `"Div_Entry".div_id, ` +
      `"Div".div_name, ` +
      `"Div".hdcp_per, ` +
      `"Div".sort_order, ` +
      `"Tmnt".tmnt_name, ` +
      `"Tmnt".start_date, ` +
      `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
    getSumsForGames(squadGames) +
    `FROM public."Div_Entry" ` +
    `JOIN public."Player" ` +
      `ON "Div_Entry".player_id = "Player".id ` +
    `JOIN public."Div" ` +
      `ON "Div_Entry".div_id = "Div".id ` +
    `JOIN public."Tmnt" ` +
      `ON "Tmnt".id = "Div".tmnt_id ` +
    `LEFT JOIN public."Game" ` +
      `ON "Div_Entry".player_id = "Game".player_id AND "Div_Entry".squad_id = "Game".squad_id ` +
    `WHERE "Div".tmnt_id = '${tmntId}' ` +
    `GROUP BY "Div_Entry".player_id, "Div_Entry".div_id, "Div".div_name, "Div".hdcp_per, "Div".sort_order, "Tmnt".tmnt_name, "Tmnt".start_date, "Player".first_name, "Player".last_name ` +
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
    `WHERE "Div".tmnt_id = '${tmntId}' ` +
    `), ` +
    // get calculated handicaps
    `calculated_hdcp AS (` +
    `SELECT ` +
      `player_info.player_id, ` +
      `player_info.div_id, ` +
      `player_info.full_name, ` +
      `player_info.average, `+
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
      `game_scores.div_id, ` +
      `game_scores.div_name, ` +    
      `game_scores.sort_order, ` +
      `game_scores.tmnt_name, ` +
      `game_scores.start_date, ` +
      `calculated_hdcp.full_name, ` +
      `calculated_hdcp.average, ` +
      `calculated_hdcp.hdcp, ` +
    getScoresPlusHdcp(squadGames) +
    `FROM game_scores ` +
    `JOIN calculated_hdcp ` +
      `ON game_scores.player_id = calculated_hdcp.player_id AND game_scores.div_id = calculated_hdcp.div_id ` +
    `) ` +
    `SELECT * ` +
    `FROM final_result;` // added semi colon for end
    // `FROM final_result ` +
    // `ORDER BY "total + Hdcp" DESC NULLS LAST;`

  return tmntGamesSql
}