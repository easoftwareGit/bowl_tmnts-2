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

/**
 * gets SQL for getting squad games
 * 
 * @param {string} squadId - id of squad
 * @param {number} squadGames - number of games in squad 
 * @returns {string} - SQL for getting squad games 
 */
export const getSquadGamesSql = (squadId: string, squadGames: number) => { 

  if (!isValidBtDbId(squadId, "sqd") || !validGames(squadGames)) return '';  
  const squadGamesSQL =
    `SELECT ` + 
    `player_id, ` +  
    getSumsForGames(squadGames) +
    `FROM public."Game" ` +
    `WHERE squad_id = '${squadId}' ` +
    `GROUP BY player_id;`
  return squadGamesSQL
}

const getScoresPlusHdcp = (squadGames: number) => { 
  let scoresSql = ''
  for (let i = 1; i <= squadGames; i++) {
    scoresSql += `game_scores."Game ${i}", `;
    scoresSql += `game_scores."Game ${i}" + calculated_hdcp.hdcp AS "Game ${i} + Hdcp", `;
  }
  scoresSql += `game_scores.total, `;
  scoresSql += `game_scores.total + (calculated_hdcp.hdcp * ${squadGames}) AS "total + Hdcp" `
  return scoresSql
}

/**
 * gets SQL for getting division games
 * 
 * @param {string} divId - id of division
 * @param {number} squadGames - number of games in squad
 * @returns {string} - SQL for getting division games 
 */
export const getDivGamesSql = (divId: string, squadGames: number) => { 

  if (!isValidBtDbId(divId, "div") || !validGames(squadGames)) return '';  
  const divGamesSql = 
    // get game scores
    `WITH game_scores AS (` +
    `SELECT ` +  
    `"Game".player_id, ` +
    `"Player".first_name || ' ' || "Player".last_name AS full_name, ` +
    getSumsForGames(squadGames) +
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
    `JOIN public."Div_Entry" ON "Player".id = "Div_Entry".player_id `+
    `JOIN public."Div" ON "Div_Entry".div_id = "Div".id ` +
    `WHERE "Div_Entry".div_id = '${divId}'` +
    `), ` +
    // get calculated handicaps
    `calculated_hdcp AS (` +
    `SELECT ` +
    `player_info.player_id, ` +
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
    `calculated_hdcp.full_name, ` +
    `calculated_hdcp.average, ` +
    `calculated_hdcp.hdcp, ` +
    getScoresPlusHdcp(squadGames) +
    // `game_scores."Game 1", ` +
    // `game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", ` +
    // `game_scores."Game 2", ` +
    // `game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", ` +
    // `game_scores."Game 3", ` +
    // `game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", ` +
    // `game_scores."Game 4", ` +
    // `game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", ` +
    // `game_scores."Game 5", ` +
    // `game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", ` +
    // `game_scores."Game 6", ` +
    // `game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", ` +
    // `game_scores.total, ` +
    // `game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp" ` +
    `FROM game_scores ` +
    `JOIN calculated_hdcp ON game_scores.player_id = calculated_hdcp.player_id` +
    `) ` +
    `SELECT * ` +
    `FROM final_result ` +
    `ORDER BY "total + Hdcp" DESC;`
  return divGamesSql
}

// export const getDivGamesSql = (divId: string, hdcp_per: number, squadGames: number) => {   

//   if (!isValidBtDbId(divId, "div")
//     || !validHdcpPer(hdcp_per)
//     || !validGames(squadGames)
//   ) return ''; 
//   if (hdcp_per === 0) return getDivGamesSqlNoHdcp(divId, squadGames);
//   return getDivGamesSqlWithHdcp(divId, squadGames);
// }

// export const exportedForTesting = {
//   getSumsForGames,
//   getDivGamesSqlNoHdcp 
// }