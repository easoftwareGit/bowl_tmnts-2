import { startOfDayFromString } from "@/lib/dateTools"
import { squadType } from "@/lib/types/types"

export const mockSquad: squadType[] = [
  {
    id: "sqd_e214ede16c5c46a4950e9a48bfeef61a",
    event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",    
    event_id_err: '',
    tab_title: "Singles",
    squad_name: "Singles",
    squad_name_err: "",
    games: 6,
    games_err: "",
    starting_lane: 13,
    starting_lane_err: "",
    lane_count: 28,
    lane_count_err: "",  
    squad_date: startOfDayFromString('2023-12-31') as Date, 
    squad_date_str: "2023-12-31",
    squad_date_err: "",
    squad_time: "18:00",
    squad_time_err: "",
    sort_order: 1,
    errClassName: "",   
  },
]