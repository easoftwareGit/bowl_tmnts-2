import { initPrismaTmnt } from "@/lib/db/initVals";
import { startOfDayFromString } from "@/lib/dateTools";
import { tmntsListType, tmntType, userType } from "@/lib/types/types";
import { Tmnt } from "@prisma/client";
import { startOfToday } from "date-fns";

export const mockUser: userType = {
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "john.doe@example.com",  
  password: "Test123!",
  first_name: "John",
  last_name: "Doe",
  phone: "800-555-1234",
  role: "DIRECTOR",
  password_hash: "$2b$12$C16ySjxkx1krojAMpoVZ3.v/pHt4ZtvDEBOXVGe4AUdPM0K/M4teq",
}

export const mockTmnt: tmntType = {
  id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
  user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde", 
  tmnt_name: "New Year's Eve 6 Gamer",
  tmnt_name_err: "",
  bowl_id: 'bwl_561540bd64974da9abdd97765fdb3659',
  bowl_id_err: "",
  start_date: startOfToday(),
  start_date_err: "",
  end_date: startOfToday(),
  end_date_err: "",
  bowls: {
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com/",
  },
}

export const mockPrismaTmnts: Tmnt[] = [
  {
    ...initPrismaTmnt,
    id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "New Year's Eve 6 Gamer",
    bowl_id: 'bwl_561540bd64974da9abdd97765fdb3659',
    start_date: startOfDayFromString('2023-12-31') as Date,
    end_date: startOfDayFromString('2023-12-31') as Date,
  },
  {
    ...initPrismaTmnt,
    id: "tmt_56d916ece6b50e6293300248c6792316",
    user_id: "usr_516a113083983234fc316e31fb695b85",
    tmnt_name: "Yosemite 6 Gamer",
    bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    start_date: startOfDayFromString('2022-01-02') as Date, 
    end_date: startOfDayFromString('2022-01-02') as Date, 
  },
  {
    ...initPrismaTmnt,
    id: "tmt_e134ac14c5234d708d26037ae812ac33",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    start_date: startOfDayFromString('2025-08-19') as Date, 
    end_date: startOfDayFromString('2025-08-19') as Date,
  },
]

export const mockPrismaTmntsList: tmntsListType[] = [
  {
    id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",    
    tmnt_name: "New Year's Eve 6 Gamer",
    start_date: startOfDayFromString('2023-12-31') as Date, 
    bowls: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com/",
    }    
  },
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",   
    tmnt_name: "Yosemite 6 Gamer",    
    start_date: startOfDayFromString('2022-01-02') as Date,
    bowls: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanes.com/",
    }
  },
  {
    id: "tmt_e134ac14c5234d708d26037ae812ac33",
    tmnt_name: "Gold Pin",
    start_date: startOfDayFromString('2025-08-19') as Date,
    bowls: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com/",
    }
  }
]