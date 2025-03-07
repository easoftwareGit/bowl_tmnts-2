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
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN public."Div_Entry".fee END) AS div_24b1cd5dee0542038a1244fc2978e862_fee,
    MAX(CASE WHEN public."Div_Entry".div_id = 'div_fe72ab97edf8407186c8e6df7f7fb741' THEN 
        FLOOR(GREATEST(0, public."Div".hdcp_from - public."Player".average) * public."Div".hdcp_per)::INTEGER END) AS div_24b1cd5dee0542038a1244fc2978e862_hdcp
    
FROM public."Player"

LEFT JOIN public."Div_Entry" ON public."Player".id = public."Div_Entry".player_id
LEFT JOIN public."Div" ON public."Div_Entry".div_id = public."Div".id

WHERE public."Div".tmnt_id = 'tmt_fe8ac53dad0f400abe6354210a8f4cd1'

GROUP BY public."Player".id, public."Player".first_name, public."Player".last_name, public."Player".average, public."Player".lane, public."Player".position
ORDER BY public."Player".lane, public."Player".position;