SELECT "Player".id as player_id,
	"Player".first_name,
	"Player".last_name,
	"Player".average,
	"Player".lane,
	"Player".position
FROM public."Player"
INNER JOIN public."Squad"
	ON "Player".squad_id = "Squad".id
		INNER JOIN public."Event"
			ON "Squad".event_id = "Event".id
				INNER JOIN public."Tmnt"
					ON "Event".tmnt_id = "Tmnt".id 
WHERE "Tmnt".id = 'tmt_d237a388a8fc4641a2e37233f1d6bebd'