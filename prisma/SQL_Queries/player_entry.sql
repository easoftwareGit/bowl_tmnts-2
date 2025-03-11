SELECT 
    public."Player".id AS player_id,
    public."Player".first_name,
    public."Player".last_name,
    public."Player".average,
    public."Player".lane,
    public."Player".position,
    
    -- Division Fees and Handicaps
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN public."Div_Entry".fee END) AS div_578834e04e5e4885bbae79229d8b96e8_fee,
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN 
        FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_578834e04e5e4885bbae79229d8b96e8_hdcp,
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_fe72ab97edf8407186c8e6df7f7fb741_fee,
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN 
        FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_fe72ab97edf8407186c8e6df7f7fb741_hdcp,
    
    -- Pot Fees
    MAX(CASE WHEN public."Pot".id = 'pot_791fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_791fb6d8a9a04cb4b3372e212da2a3b0_fee,
    MAX(CASE WHEN public."Pot".id = 'pot_781fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_781fb6d8a9a04cb4b3372e212da2a3b0_fee,
    MAX(CASE WHEN public."Pot".id = 'pot_771fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_771fb6d8a9a04cb4b3372e212da2a3b0_fee,
    MAX(CASE WHEN public."Pot".id = 'pot_761fb6d8a9a04cb4b3372e212da2a3b0' THEN public."Pot_Entry".fee END) AS pot_761fb6d8a9a04cb4b3372e212da2a3b0_fee,

    -- Bracket Entries
    MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d017ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d017ea07dbc6453a8a705f4bb7599ed4_num_brackets,
    MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d027ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d027ea07dbc6453a8a705f4bb7599ed4_num_brackets,
    MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d037ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d037ea07dbc6453a8a705f4bb7599ed4_num_brackets,
    MAX(CASE WHEN public."Brkt_Entry".brkt_id = 'brk_d047ea07dbc6453a8a705f4bb7599ed4' THEN public."Brkt_Entry".num_brackets END) AS brk_d047ea07dbc6453a8a705f4bb7599ed4_num_brackets,

    -- Elimination Fees
    MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c01077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c01077494c2d4d9da166d697c08c28d2_fee,
    MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c02077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c02077494c2d4d9da166d697c08c28d2_fee,
    MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c03077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c03077494c2d4d9da166d697c08c28d2_fee,
    MAX(CASE WHEN public."Elim_Entry".elim_id = 'elm_c04077494c2d4d9da166d697c08c28d2' THEN public."Elim_Entry".fee END) AS elm_c04077494c2d4d9da166d697c08c28d2_fee

FROM public."Player"

LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id
LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id
LEFT JOIN public."Pot_Entry" ON public."Player".id = public."Pot_Entry".player_id
LEFT JOIN public."Pot" ON public."Pot_Entry".pot_id = public."Pot".id
LEFT JOIN public."Brkt_Entry" ON public."Player".id = public."Brkt_Entry".player_id
LEFT JOIN public."Brkt" ON public."Brkt_Entry".brkt_id = public."Brkt".id
LEFT JOIN public."Elim_Entry" ON public."Player".id = public."Elim_Entry".player_id
LEFT JOIN public."Elim" ON public."Elim_Entry".elim_id = public."Elim".id

JOIN public."Event" ON public."Div".tmnt_id = public."Event".tmnt_id
JOIN public."Squad" ON public."Event".id = public."Squad".event_id

WHERE public."Squad".id = 'sqd_3397da1adc014cf58c44e07c19914f71'

GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position
ORDER BY public."Player".lane, public."Player".position;