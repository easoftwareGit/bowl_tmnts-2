import { Event } from "@prisma/client";
import { eventType } from "@/lib/types/types";
import { Decimal } from "@prisma/client/runtime/library";

export const mockEvent: eventType[] = [
  {
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
    tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
    tab_title: "Singles",
    event_name: "Singles",
    event_name_err: '',
    team_size: 1,
    team_size_err: '',
    games: 6,
    games_err: '',
    entry_fee: '80',
    entry_fee_err: '',
    lineage: '21',
    lineage_err: '',
    prize_fund: '55',
    prize_fund_err: '',
    other: '',
    other_err: '',
    expenses: '4',
    expenses_err: '',
    added_money: '0',
    added_money_err: '',
    lpox: '80',
    lpox_valid: 'is-valid',
    lpox_err: '',
    sort_order: 1,
    errClassName: "",
  },
]

export const mockPrimsmaEvents: Event[] = [
  {
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
    tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",    
    event_name: "Singles",
    team_size: 1,
    games: 6,
    entry_fee: new Decimal(80),
    lineage: new Decimal(18),
    prize_fund: new Decimal(55),
    other: new Decimal(0),
    expenses: new Decimal(5),
    added_money: new Decimal(0),    
    sort_order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a63",
    tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",    
    event_name: "Doubles",
    team_size: 2,
    games: 6,
    entry_fee: new Decimal(160),
    lineage: new Decimal(36),
    prize_fund: new Decimal(110),
    other: new Decimal(0),
    expenses: new Decimal(10),
    added_money: new Decimal(0),    
    sort_order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]