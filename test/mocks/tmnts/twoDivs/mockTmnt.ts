import { startOfDayFromString } from "@/lib/dateTools";
import { tmntType } from "@/lib/types/types";

export const mockTmnt: tmntType = {
  id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
  user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
  tmnt_name: "New Year's Eve 6 Gamer",
  tmnt_name_err: "",
  bowl_id: 'bwl_561540bd64974da9abdd97765fdb3659',
  bowl_id_err: "",
  start_date: startOfDayFromString('2023-12-31') as Date, 
  start_date_err: "",
  end_date: startOfDayFromString('2023-12-31') as Date, 
  end_date_err: "",
  bowls: {
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com/",
  },
}