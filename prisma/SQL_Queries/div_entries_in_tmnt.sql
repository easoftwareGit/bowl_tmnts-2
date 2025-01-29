SELECT "Div".id as div_id,
	"Div".div_name,
	"Div".hdcp_per,
	"Div".hdcp_from,
	"Div".int_hdcp,
	"Div".hdcp_for,
	"Div_Entry".id as div_entry_id,
	"Div_Entry".player_id
FROM public."Div"
INNER JOIN public."Div_Entry"
	ON "Div_Entry".div_id = "Div".id
		INNER JOIN public."Tmnt"
			ON "Div".tmnt_id = "Tmnt".id
WHERE "Tmnt".id = 'tmt_d237a388a8fc4641a2e37233f1d6bebd'

-- with hdcp
SELECT "Div".id as div_id,
	"Div".div_name,
	"Div".hdcp_per,
	"Div".hdcp_from,
	"Div".int_hdcp,
	"Div".hdcp_for,
	"Div_Entry".id as div_entry_id,
	"Div_Entry".player_id,
	"Player".average,
	CASE WHEN "Player".average < "Div".hdcp_from 
		THEN ("Div".hdcp_from - "Player".average) * "Div".hdcp_per 
		ELSE 0 
	END as hdcp	
FROM public."Div"
INNER JOIN public."Div_Entry"
	ON "Div_Entry".div_id = "Div".id
		INNER JOIN public."Tmnt"
			ON "Div".tmnt_id = "Tmnt".id
        INNER JOIN public."Player"
			ON "Player".id = "Div_Entry".player_id
WHERE "Tmnt".id = 'tmt_d237a388a8fc4641a2e37233f1d6bebd'

-- with calculated int hdcp
SELECT "Div".id as div_id,
	"Div".div_name,
	"Div".hdcp_per,
	"Div".hdcp_from,
	"Div".int_hdcp,
	"Div".hdcp_for,
	"Div_Entry".id as div_entry_id,
	"Div_Entry".player_id,
	"Player".average,
	CASE WHEN "Player".average < "Div".hdcp_from 
		THEN CASE WHEN "Div".int_hdcp 
			THEN FLOOR(("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			ELSE (("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			END 
		ELSE 0 
	END as hdcp
FROM public."Div"
INNER JOIN public."Div_Entry"
	ON "Div_Entry".div_id = "Div".id
		INNER JOIN public."Tmnt"
			ON "Div".tmnt_id = "Tmnt".id
        INNER JOIN public."Player"
			ON "Player".id = "Div_Entry".player_id
WHERE "Tmnt".id = 'tmt_d237a388a8fc4641a2e37233f1d6bebd'

-- all div_entries:
SELECT "Div_Entry".id as div_entry_id,
	"Div_Entry".squad_id,
	"Div_Entry".div_id,
	"Div_Entry".player_id,
	"Div_Entry".fee,
	"Player".average,
	CASE WHEN "Player".average < "Div".hdcp_from 
		THEN CASE WHEN "Div".int_hdcp 
			THEN FLOOR(("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			ELSE (("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			END 
		ELSE 0 
	END as hdcp
FROM public."Div"
INNER JOIN public."Div_Entry"
	ON "Div_Entry".div_id = "Div".id
  INNER JOIN public."Player"
		ON "Player".id = "Div_Entry".player_id


-- with tmnt id as parameter
SELECT "Div_Entry".id as div_entry_id,
	"Div_Entry".squad_id,
	"Div_Entry".div_id,
	"Div_Entry".player_id,
	"Div_Entry".fee,
	"Player".average,
	CASE WHEN "Player".average < "Div".hdcp_from 
		THEN CASE WHEN "Div".int_hdcp 
			THEN FLOOR(("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			ELSE (("Div".hdcp_from - "Player".average) * "Div".hdcp_per) 
			END 
		ELSE 0 
	END as hdcp
FROM public."Div"
INNER JOIN public."Div_Entry"
	ON "Div_Entry".div_id = "Div".id
		INNER JOIN public."Tmnt"
			ON "Div".tmnt_id = "Tmnt".id
        INNER JOIN public."Player"
			ON "Player".id = "Div_Entry".player_id
WHERE "Tmnt".id = 'tmt_d237a388a8fc4641a2e37233f1d6bebd'

-- for prisma:
const tmntId = 'tmt_d237a388a8fc4641a2e37233f1d6bebd';

const result = await prisma.div.findMany({
  where: {
    tmnt: {
      id: tmntId,
    },
  },
  select: {
    id: true,
    div_name: true,
    hdcp_per: true,
    hdcp_from: true,
    int_hdcp: true,
    hdcp_for: true,
    Div_Entry: {
      select: {
        id: true,
        player_id: true,
        Player: {
          select: {
            average: true,
            hdcp: true, // Add a custom field for hdcp calculation
          },
        },
      },
    },
  },
});

const processedResult = result.map(div => ({
  ...div,
  Div_Entry: div.Div_Entry.map(entry => ({
    ...entry,
    Player: {
      ...entry.Player,
      hdcp: entry.Player.average < div.hdcp_from
        ? div.int_hdcp
          ? Math.floor((div.hdcp_from - entry.Player.average) * div.hdcp_per)
          : (div.hdcp_from - entry.Player.average) * div.hdcp_per
        : 0,
    },
  })),
}));

console.log(processedResult);
