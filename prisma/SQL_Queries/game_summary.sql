SELECT 
    player_id,
    SUM(CASE WHEN game_num = 1 THEN score ELSE null END) AS "Game 1",
    SUM(CASE WHEN game_num = 2 THEN score ELSE null END) AS "Game 2",
    SUM(CASE WHEN game_num = 3 THEN score ELSE null END) AS "Game 3",
    SUM(CASE WHEN game_num = 4 THEN score ELSE null END) AS "Game 4",
    SUM(CASE WHEN game_num = 5 THEN score ELSE null END) AS "Game 5",
    SUM(CASE WHEN game_num = 6 THEN score ELSE null END) AS "Game 6",
    SUM(score) AS total
FROM 
    public."Game"
GROUP BY 
    player_id;

-- max games for squad
SELECT MAX(game_num)
FROM public."Game"
WHERE squad_id = 'sqd_7116ce5f80164830830a7157eb093396'

-- games for a squad
SELECT 
    player_id,
    SUM(CASE WHEN game_num = 1 THEN score ELSE null END) AS "Game 1",
    SUM(CASE WHEN game_num = 2 THEN score ELSE null END) AS "Game 2",
    SUM(CASE WHEN game_num = 3 THEN score ELSE null END) AS "Game 3",
    SUM(CASE WHEN game_num = 4 THEN score ELSE null END) AS "Game 4",
    SUM(CASE WHEN game_num = 5 THEN score ELSE null END) AS "Game 5",
    SUM(CASE WHEN game_num = 6 THEN score ELSE null END) AS "Game 6",
    SUM(score) AS total
FROM public."Game"
WHERE squad_id = 'sqd_7116ce5f80164830830a7157eb093396'
GROUP BY player_id;

-- games in div 
SELECT 
    "Game".player_id,
    CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE null END) AS INTEGER) AS "Game 1",
    CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE null END) AS INTEGER) AS "Game 2",
    CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE null END) AS INTEGER) AS "Game 3",
    CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE null END) AS INTEGER) AS "Game 4",
    CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE null END) AS INTEGER) AS "Game 5",
    CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE null END) AS INTEGER) AS "Game 6",
    CAST(SUM(score) AS INTEGER) AS total
FROM public."Game"
JOIN "Div_Entry" 
	ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
JOIN "Squad" 
	ON "Game".squad_id = "Squad".id
WHERE "Div_Entry".div_id = 'div_f30aea2c534f4cfe87f4315531cef8ef'
GROUP BY "Game".player_id;

-- max games for div
SELECT MAX(game_num)
FROM public."Game"
JOIN "Div_Entry" 
	ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
JOIN "Squad" 
	ON "Game".squad_id = "Squad".id
WHERE "Div_Entry".div_id = 'div_f30aea2c534f4cfe87f4315531cef8ef'

-- number of games in squad for a div
SELECT MAX(games) as games
FROM public."Squad"
JOIN "Div_Entry" 
	ON "Div_Entry".squad_id = "Squad".id
WHERE "Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8'

-- game in div with full name no hdcp
SELECT        
    "Game".player_id,
    "Player".first_name || ' ' || "Player".last_name AS full_name,
    CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE null END) AS INTEGER) AS "Game 1",
    CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE null END) AS INTEGER) AS "Game 2",
    CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE null END) AS INTEGER) AS "Game 3",
    CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE null END) AS INTEGER) AS "Game 4",
    CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE null END) AS INTEGER) AS "Game 5",
    CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE null END) AS INTEGER) AS "Game 6",
    CAST(SUM(score) AS INTEGER) AS total
FROM public."Game"
JOIN "Div_Entry" 
	ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
JOIN "Squad" 
	ON "Game".squad_id = "Squad".id
JOIN "Player" 
	ON "Game".player_id = "Player".id
WHERE "Div_Entry".div_id = 'div_f30aea2c534f4cfe87f4315531cef8ef'
GROUP BY "Game".player_id, "Player".first_name, "Player".last_name
ORDER BY total DESC;

-- game in div with hdcp
WITH game_scores AS (
    SELECT 
        "Game".player_id, 
        CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE 0 END) AS INTEGER) AS "Game 1",
        CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE 0 END) AS INTEGER) AS "Game 2",
        CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE 0 END) AS INTEGER) AS "Game 3",
		    CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE 0 END) AS INTEGER) AS "Game 4",
		    CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE 0 END) AS INTEGER) AS "Game 5",
		    CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE 0 END) AS INTEGER) AS "Game 6",
        CAST(SUM(score) AS INTEGER) AS total
    FROM public."Game"
	  JOIN "Div_Entry" 
		    ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
	  JOIN "Squad" 
		    ON "Game".squad_id = "Squad".id
	  JOIN "Player" 
		    ON "Game".player_id = "Player".id
	  WHERE "Div_Entry".div_id = 'div_f30aea2c534f4cfe87f4315531cef8ef'
	  GROUP BY "Game".player_id, "Player".first_name, "Player".last_name	
),
player_info AS (
    SELECT 
        "Player".id AS player_id, 
        "Player".first_name || ' ' || "Player".last_name AS full_name,
        "Player".average, 
        "Div".hdcp_from, 
        "Div".hdcp_per 
    FROM public."Player"
    JOIN public."Div_Entry" ON "Player".id = "Div_Entry".player_id
    JOIN public."Div" ON "Div_Entry".div_id = "Div".id
    WHERE "Div_Entry".div_id = 'div_24b1cd5dee0542038a1244fc2978e862'
),
calculated_hdcp AS (
    SELECT 
        player_info.player_id, 
        player_info.full_name, 
        player_info.average, 
        player_info.hdcp_from, 
        player_info.hdcp_per, 
        CAST(CASE 
            WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) 
            ELSE 0 
        END AS INTEGER) AS hdcp 
    FROM player_info
),
final_result AS (
    SELECT 
        game_scores.player_id, 
        calculated_hdcp.full_name, 
		    calculated_hdcp.average, 
        calculated_hdcp.hdcp, 
        game_scores."Game 1", 
        game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", 
        game_scores."Game 2", 
        game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", 
        game_scores."Game 3", 
        game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", 
        game_scores."Game 4", 
        game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", 
        game_scores."Game 5", 
        game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", 
        game_scores."Game 6", 
        game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", 
        game_scores.total, 
        game_scores.total + calculated_hdcp.hdcp AS "total + Hdcp"
    FROM game_scores 
    JOIN calculated_hdcp ON game_scores.player_id = calculated_hdcp.player_id
)
SELECT * 
FROM final_result
ORDER BY "total + Hdcp" DESC;

-- combined query for div games, hdcp or no hdcp
WITH game_scores AS (
    SELECT 
        "Game".player_id, 
        "Player".first_name || ' ' || "Player".last_name AS full_name,
        CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1",
        CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2",
        CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3",
        CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4",
        CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5",
        CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6",
        CAST(SUM(score) AS INTEGER) AS total
    FROM public."Game"
    JOIN "Div_Entry" 
        ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
    JOIN "Squad" 
        ON "Game".squad_id = "Squad".id
    JOIN "Player" 
        ON "Game".player_id = "Player".id
    WHERE "Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8'
    GROUP BY "Game".player_id, "Player".first_name, "Player".last_name  
),
player_info AS (
    SELECT 
        "Player".id AS player_id, 
        "Player".first_name || ' ' || "Player".last_name AS full_name,
        "Player".average, 
        "Div".hdcp_from, 
        "Div".hdcp_per 
    FROM public."Player"
    JOIN public."Div_Entry" ON "Player".id = "Div_Entry".player_id
    JOIN public."Div" ON "Div_Entry".div_id = "Div".id
    WHERE "Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8'
),
calculated_hdcp AS (
    SELECT 
        player_info.player_id, 
        player_info.full_name, 
        player_info.average, 
        player_info.hdcp_from, 
        player_info.hdcp_per, 
        CASE 
            WHEN player_info.hdcp_per = 0 THEN 0
            ELSE CAST(
                CASE 
                    WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) 
                    ELSE 0 
                END AS INTEGER
            )
        END AS hdcp 
    FROM player_info
),
final_result AS (
    SELECT 
        game_scores.player_id, 
        calculated_hdcp.full_name, 
        calculated_hdcp.average, 
        calculated_hdcp.hdcp, 
        game_scores."Game 1", 
        game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", 
        game_scores."Game 2", 
        game_scores."Game 2" + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "Game 2 + Hdcp", 
        game_scores."Game 3", 
        game_scores."Game 3" + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "Game 3 + Hdcp", 
        game_scores."Game 4", 
        game_scores."Game 4" + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "Game 4 + Hdcp", 
        game_scores."Game 5", 
        game_scores."Game 5" + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "Game 5 + Hdcp", 
        game_scores."Game 6", 
        game_scores."Game 6" + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "Game 6 + Hdcp", 
        game_scores.total, 
        game_scores.total + CASE WHEN calculated_hdcp.hdcp IS NOT NULL THEN calculated_hdcp.hdcp ELSE 0 END AS "total + Hdcp"
    FROM game_scores 
    JOIN calculated_hdcp ON game_scores.player_id = calculated_hdcp.player_id
)
SELECT * 
FROM final_result
ORDER BY "total + Hdcp" DESC;


-- max games for tmnt
JOIN "Div_Entry" 
	ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
JOIN "Div"
	ON "Div_Entry".div_id = "Div".id
JOIN "Squad" 
	ON "Game".squad_id = "Squad".id
JOIN "Player" 
	ON "Game".player_id = "Player".id
WHERE "Div".tmnt_id = 'tmt_fd99387c33d9c78aba290286576ddce5'

-- num games for tmnt OK because only 1 squad per tmnt right now
SELECT MAX(games) as games
FROM public."Squad"
JOIN "Div_Entry" 
	ON "Div_Entry".squad_id = "Squad".id
JOIN "Div"
	ON "Div".id = "Div_Entry".div_id
WHERE "Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1'

-- combined query for tmnt games, multiple divs, hdcp or no hdcp
WITH game_scores AS (
    SELECT
        "Game".player_id, 
        "Div_Entry".div_id,
        "Div".div_name,
        "Div".sort_order,
        "Tmnt".tmnt_name,
        "Tmnt".start_date,
        "Player".first_name || ' ' || "Player".last_name AS full_name,
        CAST(SUM(CASE WHEN game_num = 1 THEN score ELSE NULL END) AS INTEGER) AS "Game 1",
        CAST(SUM(CASE WHEN game_num = 2 THEN score ELSE NULL END) AS INTEGER) AS "Game 2",
        CAST(SUM(CASE WHEN game_num = 3 THEN score ELSE NULL END) AS INTEGER) AS "Game 3",
        CAST(SUM(CASE WHEN game_num = 4 THEN score ELSE NULL END) AS INTEGER) AS "Game 4",
        CAST(SUM(CASE WHEN game_num = 5 THEN score ELSE NULL END) AS INTEGER) AS "Game 5",
        CAST(SUM(CASE WHEN game_num = 6 THEN score ELSE NULL END) AS INTEGER) AS "Game 6",
        CAST(SUM(score) AS INTEGER) AS total
    FROM public."Game"
    JOIN "Div_Entry" 
        ON "Game".player_id = "Div_Entry".player_id AND "Game".squad_id = "Div_Entry".squad_id
    JOIN "Div"
        ON "Div_Entry".div_id = "Div".id
    JOIN "Squad" 
        ON "Game".squad_id = "Squad".id
    JOIN "Player" 
        ON "Game".player_id = "Player".id
    JOIN "Tmnt" 
      ON "Tmnt".id = "Div".tmnt_id
    WHERE "Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1'
    GROUP BY "Game".player_id, "Div_Entry".div_id, "Div".div_name, "Div".sort_order, "Tmnt".tmnt_name, "Tmnt".start_date, "Player".first_name, "Player".last_name 
),
player_info AS (
    SELECT 
        "Player".id AS player_id, 
        "Div_Entry".div_id,
        "Player".first_name || ' ' || "Player".last_name AS full_name,
        "Player".average, 
        "Div".hdcp_from, 
        "Div".hdcp_per 
    FROM public."Player"
    JOIN public."Div_Entry" 
        ON "Player".id = "Div_Entry".player_id
    JOIN public."Div" 
        ON "Div_Entry".div_id = "Div".id        
    WHERE "Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1'
),
calculated_hdcp AS (
    SELECT 
        player_info.player_id, 
        player_info.div_id,
        player_info.full_name, 
        player_info.average, 
        player_info.hdcp_from, 
        player_info.hdcp_per, 
        CASE 
            WHEN player_info.hdcp_per = 0 THEN 0
            ELSE CAST(
                CASE 
                    WHEN player_info.average < player_info.hdcp_from THEN FLOOR((player_info.hdcp_from - player_info.average) * player_info.hdcp_per) 
                    ELSE 0 
                END AS INTEGER
            )
        END AS hdcp 
    FROM player_info
),
final_result AS (
    SELECT 
        game_scores.player_id, 
        game_scores.div_id,
        game_scores.div_name,
        game_scores.sort_order,
        game_scores.tmnt_name,
        game_scores.start_date,
        calculated_hdcp.full_name, 
        calculated_hdcp.average, 
        calculated_hdcp.hdcp, 
        game_scores."Game 1", 
        game_scores."Game 1" + calculated_hdcp.hdcp AS "Game 1 + Hdcp", 
        game_scores."Game 2", 
        game_scores."Game 2" + calculated_hdcp.hdcp AS "Game 2 + Hdcp", 
        game_scores."Game 3", 
        game_scores."Game 3" + calculated_hdcp.hdcp AS "Game 3 + Hdcp", 
        game_scores."Game 4", 
        game_scores."Game 4" + calculated_hdcp.hdcp AS "Game 4 + Hdcp", 
        game_scores."Game 5", 
        game_scores."Game 5" + calculated_hdcp.hdcp AS "Game 5 + Hdcp", 
        game_scores."Game 6", 
        game_scores."Game 6" + calculated_hdcp.hdcp AS "Game 6 + Hdcp", 
        game_scores.total, 
        game_scores.total + (calculated_hdcp.hdcp * 6) AS "total + Hdcp"
    FROM game_scores 
    JOIN calculated_hdcp 
        ON game_scores.player_id = calculated_hdcp.player_id
        AND game_scores.div_id = calculated_hdcp.div_id
)
SELECT * 
FROM final_result
ORDER BY "total + Hdcp" DESC;
