SELECT "Brkt".id as "brkt_id", 
	"Div".div_name, 
	"Brkt".start, 
	"Brkt".games,
	CONCAT("Div".div_name, ': ', "Brkt".start, '-', "Brkt".start + "Brkt".games - 1) as brkt_name,
	"Brkt_Entry".player_id, 
	"Brkt_Entry".num_brackets,
	"Brkt_Entry".fee,	
	CONCAT("Player".last_name, ', ', "Player".first_name)
FROM public."Div" 
INNER JOIN public."Brkt"
  ON "Div".id = "Brkt".div_id
  	INNER JOIN public."Brkt_Entry"
	  ON "Brkt".id = "Brkt_Entry".brkt_id
	    INNER JOIN public."Player"
		  ON "Brkt_Entry".player_id = "Player".id
