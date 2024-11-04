import {
  sanitizeEvent,
  validateEvent,
  validEventName,
  validGames,
  validTeamSize,
  validEventMoney,
  exportedForTesting,
  entryFeeEqualsLpox,
  validEventFkId,
  allEventMoneyValid,
  validateEvents,
} from "@/app/api/events/validate";
import { initEvent } from "@/lib/db/initVals";
import { eventType, validEventsType } from "@/lib/types/types";
import { ErrorCode, maxEventLength, maxSortOrder } from "@/lib/validation";
import { startOfDayFromString, todayStr } from "@/lib/dateTools";
import { mockEvents } from "../../../mocks/tmnts/singlesAndDoubles/mockEvents";

const { gotEventMoney, gotEventData, validEventData, sanitizedEventMoney } = exportedForTesting;

const eventId = 'evt_cb97b73cb538418ab993fc867f860510'
const notfoundParentId = "tmt_01234567890123456789012345678901";

const validEvent = {
  ...initEvent,
  tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  event_name: "Event Name",
  team_size: 1,
  games: 6,
  added_money: "500",
  entry_fee: "100",
  lineage: "18",
  prize_fund: "75",
  other: "2",
  expenses: "5",
  lpox: "100",
  sort_order: 1,
} as eventType;

describe("tests for event validation", () => {

  describe('gotEventMoney', () => {
    it('should return true when the input is an empty string', () => {
      const result = gotEventMoney("");
      expect(result).toBe(true);
    });
    it('should return false when the money string represents a number less than MIN_SAFE_INTEGER', () => {
      const result = gotEventMoney((Number.MIN_SAFE_INTEGER - 1).toString());
      expect(result).toBe(false);
    });
    it('should return false for a money string greater than MAX_SAFE_INTEGER', () => {
      const result = gotEventMoney("9007199254740992");
      expect(result).toBe(false);
    });
    it('should return true for valid money string within safe integer range', () => {
      const result = gotEventMoney("500");
      expect(result).toBe(true);
    });
    it('should return false for an invalid money string', () => {
      const result = gotEventMoney("abc");
      expect(result).toBe(false);
    });
    it('should return false for a money string with non-numeric characters', () => {
      const result = gotEventMoney("abc");
      expect(result).toBe(false);
    });
    it('should return true for a money string with special characters', () => {
      const result = gotEventMoney("*1,000");
      expect(result).toBe(false);
    });
    it('should return true for a money string with brackets for negative', () => {
      const result = gotEventMoney("<1000>");
      expect(result).toBe(false);
    });
    it('should return true for a money string with leading "$"', () => {
      const result = gotEventMoney("$1,000");
      expect(result).toBe(true);
    });
    it('should return true for empty string input', () => {
      const result = gotEventMoney("");
      expect(result).toBe(true);
    });
    it('should return true for money string with leading spaces after trimming', () => {
        const result = gotEventMoney('   50.25'.trim());
        expect(result).toBe(true);
    });
    it('should return true for empty string', () => {
      const result = gotEventMoney("");
      expect(result).toBe(true);
    });
    it('should return true for values over 999', () => {
      const result = gotEventMoney("1000");
      expect(result).toBe(true);
    });
    it('should return true for values over 999', () => {
      const result = gotEventMoney("1000");
      expect(result).toBe(true);
    });
    it('should return true for value 1,000 without commas', () => {
      const result = gotEventMoney("1000");
      expect(result).toBe(true);
    });
    it('should return true for value 1,000', () => {
      const result = gotEventMoney("1,000");
      expect(result).toBe(true);
    });
  });

  describe("gotEventData function", () => {
    it("should return ErrorCode.None when all data is valid", () => {
      const result = gotEventData(validEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it('should return ErrorCode.None when all data is valid, added_money is "0"', () => {
      const testEvent = {
        ...validEvent,
        added_money: "0",
      };
      const result = gotEventData(validEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it('should return ErrorCode.None when all data is valid, added_money is blank', () => {
      const testEvent = {
        ...validEvent,
        added_money: "",
      };
      const result = gotEventData(validEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it('should return ErrorCode.None when all money values are blank', () => {
      const testEvent = {
        ...validEvent,
        added_money: "",
        entry_fee: "",
        lineage: "",
        prize_fund: "",
        other: "",
        expenses: "",
        lpox: "",
      };
      const result = gotEventData(validEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.MissingData when event_name is missing", () => {
      const invalidEvent = {
        ...validEvent,
        event_name: "",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when team_size is missing", () => {
      const invalidEvent = {
        ...validEvent,
        team_size: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when games is missing", () => {
      const invalidEvent = {
        ...validEvent,
        games: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when added_money is missing", () => {
      const invalidEvent = {
        ...validEvent,
        added_money: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when entry_fee is missing", () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when lineage is missing", () => {
      const invalidEvent = {
        ...validEvent,
        lineage: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when prize_fund is missing", () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when other is missing", () => {
      const invalidEvent = {
        ...validEvent,
        other: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when expenses is missing", () => {
      const invalidEvent = {
        ...validEvent,
        expenses: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when lpox is missing", () => {
      const invalidEvent = {
        ...validEvent,
        lpox: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when sort_order is missing", () => {
      const invalidEvent = {
        ...validEvent,
        sort_order: null as any,
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.None when added_money is a valid number (no fee !== lpox error)", () => {
      const zeroAddedMoneyEvent = {
        ...validEvent,
        added_money: 0 as any,
      };
      const result = gotEventData(zeroAddedMoneyEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when other is a valid number", () => {
      const zeroAddedMoneyEvent = {
        ...validEvent,
        other: 0 as any,
      };
      const result = gotEventData(zeroAddedMoneyEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.OtherError when passed null", () => {
      const result = gotEventData(null as any);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.None when added_money is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        added_money: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when added_money is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        added_money: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when entry_fee is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when entry_fee is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when lineage is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        lineage: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when lineage is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        lineage: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when prize_fund is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when prize_fund is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when other is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        other: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when other is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        other: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when expenses is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        expenses: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when expenses is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        expenses: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when lpox is valid number but over maxMoney", () => {
      const invalidEvent = {
        ...validEvent,
        lpox: "1234567890",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when lpox is valid number but less than 0", () => {
      const invalidEvent = {
        ...validEvent,
        lpox: "-1",
      };
      const result = gotEventData(invalidEvent);
      expect(result).toBe(ErrorCode.None);
    });
  });

  describe("validEventName function", () => {
    it("should return true when valid", () => {
      const result = validEventName("Event Name");
      expect(validEventName("Event Name")).toBe(true);
    });
    it("should return false when over max length", () => {
      const result = validEventName("a".repeat(maxEventLength + 1));
      expect(result).toBe(false);
    });
    it("should return false when under min length", () => {
      const result = validEventName("");
      expect(result).toBe(false);
    });
    it("should sanitize event name", () => {
      const result = validEventName("<script>alert(1)</script>");
      expect(result).toBe(true); // sanitizes to 'alert1'
    });
    it("should return false when passed null", () => {
      const result = validEventName(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validEventName(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("validTeamSize function", () => {
    it("should return true when valid", () => {
      const result = validTeamSize(1);
      expect(result).toBe(true);
    });
    it("should return false when over max size", () => {
      const result = validTeamSize(6);
      expect(result).toBe(false);
    });
    it("should return false when under min size", () => {
      const result = validTeamSize(0);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validTeamSize(2.5);
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validTeamSize(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validTeamSize(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("validGames function", () => {
    it("should return true when valid", () => {
      const result = validGames(3);
      expect(result).toBe(true);
    });
    it("should return false when over max games", () => {
      const result = validGames(123);
      expect(result).toBe(false);
    });
    it("should return false when under min games", () => {
      const result = validGames(0);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validGames(2.5);
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validGames(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validGames(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("validEventMoney function", () => {
    it('should return true for blank string', () => { 
      const result = validEventMoney('');
      expect(result).toBe(true);
    })
    it('should return true for value value', () => { 
      const result = validEventMoney('123');
      expect(result).toBe(true);
    })
    it('should return true for just one zero string "0"', () => { 
      const result = validEventMoney('0');
      expect(result).toBe(true);
    })
    it('should return true for just one zero string "0"', () => { 
      const result = validEventMoney('0');
      expect(result).toBe(true);
    })
    it('should return true for just zeros in a string "0000"', () => { 
      const result = validEventMoney('0000');
      expect(result).toBe(true);
    })
    it('should return true for "000.0"', () => { 
      const result = validEventMoney('000.0');
      expect(result).toBe(true);
    })
    it('should return true for "00.00"', () => { 
      const result = validEventMoney('00.00');
      expect(result).toBe(true);
    })
    it("should return true when valid value", () => {
      const result = validEventMoney(validEvent.added_money);
      expect(result).toBe(true);
    });
    it("should return true when valid entry_fee", () => {
      const result = validEventMoney(validEvent.entry_fee);
      expect(result).toBe(true);
    });
    it("should return true when valid lineage", () => {
      const result = validEventMoney(validEvent.lineage);
      expect(result).toBe(true);
    });
    it("should return true when valid prize fund", () => {
      const result = validEventMoney(validEvent.prize_fund);
      expect(result).toBe(true);
    });
    it("should return true when valid other", () => {
      const result = validEventMoney(validEvent.other);
      expect(result).toBe(true);
    });
    it("should return true when valid expenses", () => {
      const result = validEventMoney(validEvent.expenses);
      expect(result).toBe(true);
    });
    it("should return true when valid lpox", () => {
      const result = validEventMoney(validEvent.lpox);
      expect(result).toBe(true);
    });

    it("should return false for negative number", () => {
      const result = validEventMoney("-1");
      expect(result).toBe(false);
    });
    it("should return false for value too high", () => {
      const result = validEventMoney("123456789");
      expect(result).toBe(false);
    });
    it("should return false for value with brackets ( )", () => {
      const result = validEventMoney("(123456789)");
      expect(result).toBe(false);
    });
    it("should return false for trailing negative sign", () => {
      const result = validEventMoney("123-");
      expect(result).toBe(false);
    });
    it("should return false for non-numeric", () => {
      const result = validEventMoney('ABC');
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validEventMoney(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validEventMoney(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("entryFeeEqualsLpox function", () => {
    it("should return true when entry_fee equals lpox", () => {
      const result = entryFeeEqualsLpox(validEvent);
      expect(result).toBe(true);
    });
    it("should return false when entry_fee does not equal lpox", () => {
      const invalidEvent = {
        ...initEvent,
        entry_fee: "99",
      };
      const result = entryFeeEqualsLpox(invalidEvent);
      expect(result).toBe(false);
    });
    it("should return false when entry_fee does not equal lpox", () => {
      const invalidEvent = {
        ...initEvent,
        lpox: "99",
      };
      const result = entryFeeEqualsLpox(invalidEvent);
      expect(result).toBe(false);
    });
    it("should return false when passed null event", () => {
      const result = entryFeeEqualsLpox(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined event", () => {
      const result = entryFeeEqualsLpox(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("validEventFkId function", () => {
    it("should return true for valid tmnt_id", () => {
      expect(validEventFkId(validEvent.tmnt_id, "tmt")).toBe(true);
    });
    it("should return false for invalid foreign key id", () => {
      expect(validEventFkId("abc_def", "tmt")).toBe(false);
    });
    it("should return false if foreign key id type does not match id type", () => {
      expect(validEventFkId(validEvent.tmnt_id, "usr")).toBe(false);
    });
    it("should return false for an empty foreign key id", () => {
      expect(validEventFkId("", "bwl")).toBe(false);
    });
    it("should return false for an null foreign key id", () => {
      expect(validEventFkId(null as any, "tmt")).toBe(false);
    });
    it("should return false for an null key type", () => {
      expect(validEventFkId(validEvent.tmnt_id, null as any)).toBe(false);
    });
  });

  describe('allEventMoneyValid function', () => { 
    it('should return true for valid event data', () => {
      expect(allEventMoneyValid(validEvent)).toBe(true)
    })
    it('should return true if all money fields are blank', () => {
      const okEvent = {
        ...validEvent,
        added_money: "",
        entry_fee: "",
        lineage: "",
        prize_fund: "",
        other: "",
        expenses: "",
        lpox: "",
      }
      expect(allEventMoneyValid(okEvent)).toBe(true)
    })
    it('should return false if added_money a valid number', () => {
      const invalidEvent = {
        ...validEvent,
        added_money: 0 as any,
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if added_money is negative', () => {
      const invalidEvent = {
        ...validEvent,
        added_money: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if added_money is too big', () => {
      const invalidEvent = {
        ...validEvent,
        added_money: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if added_money is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        added_money: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if entry_fee is valid number value', () => {
      const okEvent = {
        ...validEvent,
        entry_fee: 100 as any,
      }
      expect(allEventMoneyValid(okEvent)).toBe(false)
    })
    it('should return false if entry_fee is negative', () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if entry_fee is too big', () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if entry_fee is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        entry_fee: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if lineage is valid number value', () => {
      const okEvent = {
        ...validEvent,
        lineage: 10 as any,
      }
      expect(allEventMoneyValid(okEvent)).toBe(false)
    })
    it('should return false if lineage is negative', () => {
      const invalidEvent = {
        ...validEvent,
        lineage: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if lineage is too big', () => {
      const invalidEvent = {
        ...validEvent,
        lineage: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if lineage is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        lineage: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if prize_fund is valid number value', () => {
      const okEvent = {
        ...validEvent,
        prize_fund: 70 as any,
      }
      expect(allEventMoneyValid(okEvent)).toBe(false)
    })
    it('should return false if prize_fund is negative', () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if prize_fund is too big', () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if prize_fund is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        prize_fund: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if other is valid number value', () => {
      const okEvent = {
        ...validEvent,
        other: 7 as any,
      }
      expect(allEventMoneyValid(okEvent)).toBe(false)
    })
    it('should return false if other is negative', () => {
      const invalidEvent = {
        ...validEvent,
        other: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if other is too big', () => {
      const invalidEvent = {
        ...validEvent,
        other: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if other is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        other: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if expenses is valid number value', () => {
      const okEvent = {
        ...validEvent,
        expenses: 5 as any,
      }
      expect(allEventMoneyValid(okEvent)).toBe(false)
    })
    it('should return false if expenses is negative', () => {
      const invalidEvent = {
        ...validEvent,
        expenses: "-1",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if expenses is too big', () => {
      const invalidEvent = {
        ...validEvent,
        expenses: "1234567890",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
    it('should return false if expenses is not a number', () => {
      const invalidEvent = {
        ...validEvent,
        expenses: "abc",
      }
      expect(allEventMoneyValid(invalidEvent)).toBe(false)
    })
  })

  describe("validEventData function", () => {
    it("should return ErrorCode.None when valid event data", () => {
      const result = validEventData(validEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when blank added money", () => {
      const noAddedMoneyEvent = {
        ...validEvent,
        added_money: "",
      };
      const result = validEventData(noAddedMoneyEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when '0' added money", () => {
      const noAddedMoneyEvent = {
        ...validEvent,
        added_money: "0",
      };
      const result = validEventData(noAddedMoneyEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when blank values for all money fields", () => {
      const noAddedMoneyEvent = {
        ...validEvent,
        added_money: "",
        entry_fee: "",
        lineage: "",
        prize_fund: "",
        other: "",
        expenses: "",
        lpox: "",
      };
      const result = validEventData(noAddedMoneyEvent);
      expect(result).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.InvalidData when tmnt_id is empty", () => {
      const invalidEvent = {
        ...initEvent,
        tmnt_id: "",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when tmnt_id is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        tmnt_id: "abc",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when tmnt_id is valid, but not tmt type", () => {
      const invalidEvent = {
        ...initEvent,
        tmnt_id: "usr_12345678901234567890123456789012",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when event_name is empty", () => {
      const invalidEvent = {
        ...initEvent,
        event_name: "",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when team_size is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        team_size: 0,
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when games is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        games: 0,
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when added_money is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        added_money: "",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when entry_fee is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        entry_fee: "ABC",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when lineage is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        lineage: "123-",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when prize_fund is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        prize_fund: "-1",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when expenses is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        expenses: "ABC",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when other is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        other: "12345678",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when lpox is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        lpox: "ABC",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when entry_fee !== linage + prize_fund + other + expenses", () => {
      const invalidEvent = {
        ...initEvent,
        entry_fee: "99",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when entry_fee !== lpox", () => {
      const invalidEvent = {
        ...initEvent,
        entry_fee: "99",
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });

    it("should return ErrorCode.InvalidData when sort_order is invalid", () => {
      const invalidEvent = {
        ...initEvent,
        sort_order: 0,
      };
      const result = validEventData(invalidEvent);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when passed null event", () => {
      const result = validEventData(null as any);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when passed undefined event", () => {
      const result = validEventData(undefined as any);
      expect(result).toBe(ErrorCode.InvalidData);
    });
  });

  describe('sanitizedEventMoney', () => {
    it('should return sanitized format when given a valid currency string', () => {
      const input = "$1,234.56";
      const expectedOutput = "1234.56";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return an empty string when given an invalid currency format', () => {
      const input = "invalid_currency";
      const expectedOutput = "";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return "0" when the input string is empty', () => {
      const input = "";
      const expectedOutput = "0";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return sanitized format when given a valid currency string', () => {
      const input = "$1,234.56";
      const expectedOutput = "1234.56";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return sanitized format for currency string ending with ".00"', () => {
      const input = "100.00";
      const expectedOutput = "100";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should convert NaN values to an empty string when provided with a non-numeric string', () => {
      const input = "invalid";
      const expectedOutput = "";
      const result = sanitizedEventMoney(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return empty string for null input', () => {
      const input = null;
      const expectedOutput = "";
      const result = sanitizedEventMoney(input as any);
      expect(result).toBe(expectedOutput);
    });    
  })

  describe("sanitizeEvent function", () => {
    it("should return a sanitized event when event is already sanitized", () => {
      const sanitizedEvent = sanitizeEvent(validEvent);
      expect(sanitizedEvent.id).toEqual(validEvent.id);
      expect(sanitizedEvent.tmnt_id).toEqual("tmt_fd99387c33d9c78aba290286576ddce5"); // not valid, but sanitized
      expect(sanitizedEvent.event_name).toEqual("Event Name");
      expect(sanitizedEvent.team_size).toEqual(1);
      expect(sanitizedEvent.games).toEqual(6);
      expect(sanitizedEvent.added_money).toEqual("500");
      expect(sanitizedEvent.entry_fee).toEqual("100");
      expect(sanitizedEvent.lineage).toEqual("18");
      expect(sanitizedEvent.prize_fund).toEqual("75");
      expect(sanitizedEvent.other).toEqual("2");
      expect(sanitizedEvent.expenses).toEqual("5");
      expect(sanitizedEvent.sort_order).toEqual(1);
    });
    it("should return a sanitized event text and money values when event is NOT already sanitized", () => {
      // no numerical fields in this test
      const testEvent = {
        ...validEvent,
        tmnt_id: "abc_123",
        event_name: "  Test Name*   ",
        added_money: "500.00",
        entry_fee: "100.000",
        lineage: "18",
        prize_fund: "75.0",
        other: "2.0",
        expenses: "5.00",
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.tmnt_id).toEqual("");   
      expect(sanitizedEvent.event_name).toEqual("Test Name");
      expect(sanitizedEvent.added_money).toEqual("500");
      expect(sanitizedEvent.entry_fee).toEqual("100");
      expect(sanitizedEvent.lineage).toEqual("18");
      expect(sanitizedEvent.prize_fund).toEqual("75");
      expect(sanitizedEvent.other).toEqual("2");
      expect(sanitizedEvent.expenses).toEqual("5");
    });
    it('should return a sanitized event when event has an invalid id', () => { 
      const testEvent = {
        ...validEvent,
        id: 'abc',
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.id).toEqual('');
    })
    it('should return a sanitized event when event has an invalid added_money', () => { 
      const testEvent = {
        ...validEvent,
        added_money: 'abc',
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.added_money).toEqual('');
    })
    it("should return a sanitized event when event has null for numerical fields", () => {
      const testEvent = {
        ...validEvent,
        team_size: null as any,
        games: null as any,
        sort_order: null as any,
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.team_size).toBeNull();
      expect(sanitizedEvent.games).toBeNull();
      expect(sanitizedEvent.sort_order).toBeNull();
    });
    it("should return a sanitized event when event has values for numerical fields are too low", () => {
      const testEvent = {
        ...validEvent,
        team_size: 0,
        games: 0,
        sort_order: 0,
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.team_size).toBe(0);
      expect(sanitizedEvent.games).toBe(0);
      expect(sanitizedEvent.sort_order).toBe(0);
    });    
    it("should return a sanitized event when event has values for numerical fields are not numbers", () => {
      const testEvent = {
        ...validEvent,
        team_size: 'abc' as any,
        games: ['abc', 'def'] as any,
        sort_order: startOfDayFromString(todayStr) as Date as any,
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.team_size).toBe(null);
      expect(sanitizedEvent.games).toBe(null);
      expect(sanitizedEvent.sort_order).toBe(null);      
    });        
    it("should return a sanitized event when event has values for numerical fields are too high", () => {
      const testEvent = {
        ...validEvent,
        team_size: 10,
        games: 100,
        sort_order: 1234567, 
      };
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.team_size).toBe(10);
      expect(sanitizedEvent.games).toBe(100);
      expect(sanitizedEvent.sort_order).toBe(1234567);      
    });    
    it("should return null when passed null event", () => {
      const result = sanitizeEvent(null as any);
      expect(result).toBe(null);
    });
    it("should return null when passed undefined event", () => {
      const result = sanitizeEvent(undefined as any);
      expect(result).toBe(null);
    });
    it('should return a sanitzed event with "0" values for monery fields when event monery fields are blank', () => {
      const testEvent = {
        ...validEvent,
        added_money: "",
        entry_fee: "",
        lineage: "",
        prize_fund: "",
        other: "",
        expenses: "",
      };      
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.added_money).toEqual("0");
      expect(sanitizedEvent.entry_fee).toEqual("0");
      expect(sanitizedEvent.lineage).toEqual("0");
      expect(sanitizedEvent.prize_fund).toEqual("0");
      expect(sanitizedEvent.other).toEqual("0");
      expect(sanitizedEvent.expenses).toEqual("0");
    })
    it('should return a sanitzed event with "0" values for monery fields when event monery fields are "0"', () => {
      const testEvent = {
        ...validEvent,
        added_money: "0",
        entry_fee: "0.0",
        lineage: "0.00",
        prize_fund: "00",
        other: "0,000.0",
        expenses: "00.00",
      };      
      const sanitizedEvent = sanitizeEvent(testEvent);
      expect(sanitizedEvent.added_money).toEqual("0");
      expect(sanitizedEvent.entry_fee).toEqual("0");
      expect(sanitizedEvent.lineage).toEqual("0");
      expect(sanitizedEvent.prize_fund).toEqual("0");
      expect(sanitizedEvent.other).toEqual("0");
      expect(sanitizedEvent.expenses).toEqual("0");
    })
  });

  describe("validateEvent function", () => {

    describe("validateEvent function - valid data", () => {
      it("should return ErrorCode.None when passed valid event", () => {
        const result = validateEvent(validEvent);
        expect(result).toBe(ErrorCode.None);
      });
      it("should return ErrorCode.None when all fields are properly sanitized", () => {
        const validTestEvent = {
          ...validEvent,
          event_name: "  Test Name*   ",
          team_size: 1,
          games: 6,
          added_money: "500",
          entry_fee: "100.000",
          lineage: "18",
          prize_fund: "75.0",
          other: "2.0",
          expenses: "5.00",
          sort_order: 2,
        };
        const result = validateEvent(validTestEvent);
        expect(result).toBe(ErrorCode.None);
      });
      it("should return ErrorCode.None when all fields valid, even if partent id is not in database", () => {
        const validTestEvent = {
          ...validEvent,
          tmnt_id: notfoundParentId,
        }
        const result = validateEvent(validTestEvent);
        expect(result).toBe(ErrorCode.None);
      })
      it("should return ErrorCode.None when added money is blank", () => {
        const validTestEvent = {
          ...validEvent,
          added_money: "",
        };
        const result = validateEvent(validTestEvent);
        expect(result).toBe(ErrorCode.None);
      });
      it("should return ErrorCode.None when all monery fields are blank", () => {
        const validTestEvent = {
          ...validEvent,
          added_money: "",
          entry_fee: "",
          lineage: "",
          prize_fund: "",
          other: "",
          expenses: "",
          lpox: "",
        };
        const result = validateEvent(validTestEvent);
        expect(result).toBe(ErrorCode.None);
      });

    });

    describe("validateEvent function - missing data", () => {
      it("should return ErrorCode.MissingData when id is blank", () => {
        const invalidEvent = {
          ...validEvent,
          id: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when tmnt_id is blank", () => {
        const invalidEvent = {
          ...validEvent,
          tmnt_id: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when event_name is blank", () => {
        const invalidEvent = {
          ...validEvent,
          event_name: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when event_name is only specail characters", () => {
        const invalidEvent = {
          ...validEvent,
          event_name: "****",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when team_size is empty", () => {
        const invalidEvent = {
          ...validEvent,
          team_size: null as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when team_size is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          team_size: "This is not a number" as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData); // sanitized to 0
      });
      it("should return ErrorCode.MissingData when games is empty", () => {
        const invalidEvent = {
          ...validEvent,
          games: null as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when games is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          games: "This is not a number" as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData); // sanitized to 0
      });
      it("should return ErrorCode.InvalidData when entry_fee is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          entry_fee: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when entry_fee is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          entry_fee: "This is not a number",
        };
        // sanitized to an empty string, thus missing data error
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.InvalidData when lineage is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          lineage: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when lineage is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          lineage: "This is not a number",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.InvalidData when prize_fund is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          prize_fund: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when prize_fund is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          prize_fund: "This is not a number",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.InvalidData when other is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          other: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when other is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          other: "This is not a number",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.InvalidData when expenses is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          expenses: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when expenses is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          expenses: "This is not a number",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.InvalidData when lpox is blank (entry_fee !== lpox)", () => {
        const invalidEvent = {
          ...validEvent,
          lpox: "",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.MissingData when lpox is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          lpox: "This is not a number",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when sort_order is empty", () => {
        const invalidEvent = {
          ...validEvent,
          sort_order: null as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it("should return ErrorCode.MissingData when sort_order is not a number", () => {
        const invalidEvent = {
          ...validEvent,
          sort_order: "This is not a number" as any,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.MissingData); // sanitized to 0
      });
      it("should return ErrorCode.MissingData when event object is null", () => {
        const result = validateEvent(null as any);
        expect(result).toBe(ErrorCode.MissingData);
      });
    });

    describe("validateEvent function - invalid data", () => {
      it("should return ErrorCode.InvalidData when event_name exceeds max length", () => {
        const invalidEvent = {
          ...validEvent,
          event_name:
            "This event name is way too long and should exceed the maximum length allowed",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when team_size is over max", () => {
        const invalidEvent = {
          ...validEvent,
          team_size: 123456789,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when team_size is under min", () => {
        const invalidEvent = {
          ...validEvent,
          team_size: -1,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when games is over max", () => {
        const invalidEvent = {
          ...validEvent,
          games: 123456789,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when games is under min", () => {
        const invalidEvent = {
          ...validEvent,
          games: -1,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when added_money is over max", () => {
        const invalidEvent = {
          ...validEvent,
          added_money: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when added_money is under min", () => {
        const invalidEvent = {
          ...validEvent,
          added_money: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when entry_fee is over max", () => {
        const invalidEvent = {
          ...validEvent,
          entry_fee: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when entry_fee is under min", () => {
        const invalidEvent = {
          ...validEvent,
          entry_fee: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when lineage is over max", () => {
        const invalidEvent = {
          ...validEvent,
          lineage: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when lineage is under min", () => {
        const invalidEvent = {
          ...validEvent,
          lineage: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when prize_fund is over max", () => {
        const invalidEvent = {
          ...validEvent,
          prize_fund: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when prize_fund is under min", () => {
        const invalidEvent = {
          ...validEvent,
          prize_fund: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when other is over max", () => {
        const invalidEvent = {
          ...validEvent,
          other: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when other is under min", () => {
        const invalidEvent = {
          ...validEvent,
          other: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when expenses is over max", () => {
        const invalidEvent = {
          ...validEvent,
          expenses: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when expenses is under min", () => {
        const invalidEvent = {
          ...validEvent,
          expenses: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when lpox is over max", () => {
        const invalidEvent = {
          ...validEvent,
          lpox: "123456789",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when lpox is under min", () => {
        const invalidEvent = {
          ...validEvent,
          lpox: "-1",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when sort_order is over max", () => {
        const invalidEvent = {
          ...validEvent,
          sort_order: maxSortOrder + 1,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when sort_order is under min", () => {
        const invalidEvent = {
          ...validEvent,
          sort_order: -1,
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when entry_fee !== linage + prize_fund + other + expenses", () => {
        const invalidEvent = {
          ...validEvent,
          entry_fee: "99",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
      it("should return ErrorCode.InvalidData when entry_fee !== lpox", () => {
        const invalidEvent = {
          ...validEvent,
          lpox: "99",
        };
        const result = validateEvent(invalidEvent);
        expect(result).toBe(ErrorCode.InvalidData);
      });
    });
  });

  describe('validateEvents', () => { 

    it('should validate events', async () => { 
      const eventsToValidate = [...mockEvents];
      const validEvents: validEventsType = validateEvents(eventsToValidate);      
      expect(validEvents.errorCode).toEqual(ErrorCode.None);
      expect(validEvents.events.length).toEqual(mockEvents.length);

      for (let i = 0; i < mockEvents.length; i++) {
        expect(validEvents.events[i].id).toEqual(mockEvents[i].id);
        expect(validEvents.events[i].tmnt_id).toEqual(mockEvents[i].tmnt_id);
        expect(validEvents.events[i].event_name).toEqual(mockEvents[i].event_name);
        expect(validEvents.events[i].team_size).toEqual(mockEvents[i].team_size);
        expect(validEvents.events[i].games).toEqual(mockEvents[i].games);
        expect(validEvents.events[i].entry_fee).toEqual(mockEvents[i].entry_fee);
        expect(validEvents.events[i].lineage).toEqual(mockEvents[i].lineage);
        expect(validEvents.events[i].prize_fund).toEqual(mockEvents[i].prize_fund);
        expect(validEvents.events[i].other).toEqual(mockEvents[i].other);
        expect(validEvents.events[i].expenses).toEqual(mockEvents[i].expenses);
        expect(validEvents.events[i].added_money).toEqual(mockEvents[i].added_money);
        expect(validEvents.events[i].lpox).toEqual(mockEvents[i].lpox);
        expect(validEvents.events[i].sort_order).toEqual(mockEvents[i].sort_order);      
      }      
    })
    it('should return ErrorCode.None and sanitize events', async () => { 
      const toSanotzize = [
        {
          ...mockEvents[0],
          event_name: ' Event 1 **** ',
        },
        {
          ...mockEvents[1],
          event_name: '<script>Event 2</script>',
        }
      ]
      const validEvents = validateEvents(toSanotzize);
      expect(validEvents.errorCode).toEqual(ErrorCode.None);  
      expect(validEvents.events[0].event_name).toEqual('Event 1');
      expect(validEvents.events[1].event_name).toEqual('Event 2');
    })
    it('should return ErrorCode.MissingData when required data is missing', async () => { 
      const invalidEvents = [
        {
          ...mockEvents[0],
          event_name: ''
        },
        {
          ...mockEvents[1],          
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);
      expect(validEvents.events.length).toEqual(0);
    })
    it('should return ErroCode.MissingData when tmnt_id is not a valid tmnt id', async () => {       
      // ErroCode.MissingData because sanitize will change invalid tmnt_id to ''
      const invalidEvents = [
        {
          ...mockEvents[0],          
        },
        {
          ...mockEvents[1],          
          tmnt_id: eventId,
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);      
    })
    it('should return ErroCode.MissingData and return events length 1 when 1st event is valid, 2nd is not', async () => { 
      // ErroCode.MissingData because sanitize will change invalid tmnt_id to ''
      const invalidEvents = [
        {
          ...mockEvents[0],          
        },
        {
          ...mockEvents[1],          
          tmnt_id: eventId,
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);      
      expect(validEvents.events.length).toEqual(1);
    })
    it("should return ErroCode.InvalidData when all tmnt_id's are not the same", async () => { 
      const invalidEvents = [
        {
          ...mockEvents[0],
        },
        {
          ...mockEvents[1],                    
          tmnt_id: 'tmt_00000000000000000000000000000000',
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.InvalidData);
      expect(validEvents.events.length).toEqual(1); // 1st event valid
    })
    it('should return ErroCode.InvalidData when required data is invalid', async () => { 
      const invalidEvents = [
        {
          ...mockEvents[0],
          games: 100
        },
        {
          ...mockEvents[1],          
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.InvalidData);
    })
    it('should return ErroCode.MissingData when id is not a valid event id', async () => { 
      const invalidEvents = [
        {
          ...mockEvents[0],
          id: 'tmt_00000000000000000000000000000000',
        },
        {
          ...mockEvents[1],          
        }
      ]
      const validEvents = validateEvents(invalidEvents);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when passed empty array', async () => {
      const validEvents = validateEvents([]);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);      
      expect(validEvents.events.length).toEqual(0);
    })
    it('should return ErrorCode.MissingData when passed null', async () => {
      const validEvents = validateEvents(null as any);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);      
      expect(validEvents.events.length).toEqual(0);
    })
    it('should return ErrorCode.MissingData when passed undefined', async () => {
      const validEvents = validateEvents(undefined as any);
      expect(validEvents.errorCode).toEqual(ErrorCode.MissingData);      
      expect(validEvents.events.length).toEqual(0);
    })
  })

});
