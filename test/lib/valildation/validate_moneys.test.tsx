import {
  exportedForTesting,
  sanitizeTmntMoney,
  validateTmntMoney,
  validateTmntMoneys,
  validTmntMoneyAmount,
  validDescripValue,
  validFlowValue,
} from "@/lib/validation/moneys/validate";

import { blankTmntMoney, initTmntMoney } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/enums/enums";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import type {
  validTmntMoneyType,
  tmntMoneyType,
} from "@/lib/types/types";
import { maxMoney } from "@/lib/validation/constants";

const { gotTmntMoneyData, validTmntMoneyData } =
  exportedForTesting;

const validTmntMoney: tmntMoneyType = {
  ...initTmntMoney,
  id: "mon_652fc6c5556e407291c4b5666b2dccd7",
  event_id: "evt_7116ce5f80164830830a7157eb093396",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  descrip: MoneyDescrip.ENTRIES,
  flow: MoneyFlow.IN,
  amount: 80,
  pot_id: null as any,
  brkt_id: null as any,
  elim_id: null as any,
  sort_order: 1,
};

const mockTmntMoneys: tmntMoneyType[] = [
  { ...validTmntMoney },
  {
    ...validTmntMoney,
    id: "mon_22222222222222222222222222222222",
  },
];

const userId = "usr_01234567890123456789012345678901";

describe('validate tmntMoneys', () => { 

  describe("gotTmntMoneyData()", () => {
    it("should return ErrorCode.NONE when all data is present", () => {
      expect(
        gotTmntMoneyData(validTmntMoney),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when event_id is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          event_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when squad_id is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          squad_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when div_id is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          div_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when descrip is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          descrip: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when flow is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          flow: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when amount is 0", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          amount: 0,
        }),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when sort_order is missing", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          sort_order: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });    

    it("should return ErrorCode.MISSING_DATA when sort_order is 0", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          sort_order: 0,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });    
  });

  describe("validTmntMoneyAmount()", () => {

    it("should return true when amount is valid", () => {
      expect(validTmntMoneyAmount(80)).toBe(true);
    });

    it("should return true when amount is 0", () => {
      expect(validTmntMoneyAmount(0)).toBe(true);
    });

    it("should return false when amount is null", () => {
      expect(validTmntMoneyAmount(null as any)).toBe(false);
    });

    it("should return false when amount is undefined", () => {
      expect(validTmntMoneyAmount(undefined as any)).toBe(false);
    });

    it("should return false when amount is a string", () => {
      expect(validTmntMoneyAmount("80" as any)).toBe(false);
    });

    it("should return false when amount is not numeric", () => {
      expect(validTmntMoneyAmount("abc" as any)).toBe(false);
    });

    it("should return false when amount is negative", () => {
      expect(validTmntMoneyAmount(-1)).toBe(false);
    });

    it("should return false when amount is too large", () => {
      expect(validTmntMoneyAmount(1234567890)).toBe(false);
    });

    it("should return true when amount has decimals", () => {
      expect(validTmntMoneyAmount(1.1)).toBe(true);
    });

  });

  describe("validDescripValue()", () => {
    it("should return true for ENTRIES", () => {
      expect(
        validDescripValue(MoneyDescrip.ENTRIES),
      ).toBe(true);
    });

    it("should return true for PRIZEFUND", () => {
      expect(
        validDescripValue(MoneyDescrip.PRIZEFUND),
      ).toBe(true);
    });

    it("should return true for LINEAGE", () => {
      expect(
        validDescripValue(MoneyDescrip.LINEAGE),
      ).toBe(true);
    });

    it("should return true for EXPENSES", () => {
      expect(
        validDescripValue(MoneyDescrip.EXPENSES),
      ).toBe(true);
    });

    it("should return true for ADDED", () => {
      expect(
        validDescripValue(MoneyDescrip.ADDED),
      ).toBe(true);
    });

    it("should return true for OTHER", () => {
      expect(
        validDescripValue(MoneyDescrip.OTHER),
      ).toBe(true);
    });

    it("should return true for ERROR", () => {
      expect(
        validDescripValue(MoneyDescrip.ERROR),
      ).toBe(true);
    });

    it("should return false for invalid value", () => {
      expect(
        validDescripValue("BAD_VALUE"),
      ).toBe(false);
    });

    it("should return false for null", () => {
      expect(
        validDescripValue(null),
      ).toBe(false);
    });
  });

  describe("validFlowValue()", () => {
    it("should return true for IN", () => {
      expect(
        validFlowValue(MoneyFlow.IN),
      ).toBe(true);
    });

    it("should return true for OUT", () => {
      expect(
        validFlowValue(MoneyFlow.OUT),
      ).toBe(true);
    });

    it("should return false for invalid value", () => {
      expect(
        validFlowValue("BAD_VALUE"),
      ).toBe(false);
    });

    it("should return false for null", () => {
      expect(
        validFlowValue(null),
      ).toBe(false);
    });
  });

  describe("validTmntMoneyData()", () => {
    it("should return ErrorCode.NONE when data is valid", () => {
      expect(
        validTmntMoneyData(validTmntMoney),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      expect(
        validTmntMoneyData(
          {
            ...validTmntMoney,
            id: "abc",
          },
        ),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when event_id is invalid", () => {
      expect(
        validTmntMoneyData(
          {
            ...validTmntMoney,
            event_id: "abc",
          },
        ),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when squad_id is invalid", () => {
      expect(
        validTmntMoneyData(
          {
            ...validTmntMoney,
            squad_id: "abc",
          },
        ),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id is invalid", () => {
      expect(
        validTmntMoneyData(
          {
            ...validTmntMoney,
            div_id: "abc",
          },
        ),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when descrip is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          descrip: "BAD" as any,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when flow is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          flow: "BAD" as any,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      expect(
        validTmntMoneyData(
          {
            ...validTmntMoney,
            amount: -1,
          },
        ),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          pot_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when brkt_id is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          brkt_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when elim_id is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          elim_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id and brkt_id both exist", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          pot_id: "pot_11111111111111111111111111111111",
          brkt_id: "brk_11111111111111111111111111111111",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id and elim_id both exist", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          pot_id: "pot_11111111111111111111111111111111",
          elim_id: "elm_11111111111111111111111111111111",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when brkt_id and elim_id both exist", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          brkt_id: "brk_11111111111111111111111111111111",
          elim_id: "elm_11111111111111111111111111111111",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when sort_order is invalid", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          sort_order: -1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });    

    it("should return ErrorCode.INVALID_DATA when sort_order is null", () => {
      expect(
        validTmntMoneyData({
          ...validTmntMoney,
          sort_order: null as any,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });  
    
    it("should return ErrorCode.MISSING_DATA when sort_order is 0", () => {
      expect(
        gotTmntMoneyData({
          ...validTmntMoney,
          sort_order: 0,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });    
  });

  describe("sanitizeTmntMoney()", () => {
    it("should return unchanged valid tmntMoney", () => {
      expect(
        sanitizeTmntMoney(validTmntMoney),
      ).toEqual(validTmntMoney);
    });

    it("should allow invalid id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        id: "abc",
      })
      expect(result.id).toBe('abc');
    });    
    it("should trim long id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should allow invalid event_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        event_id: "abc",
      })
      expect(result.event_id).toBe('abc');
    });
    it("should trim long event_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        event_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.event_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should allow invalid squad_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        squad_id: "abc",
      })
      expect(result.squad_id).toBe('abc');
    });
    it("should trim long squad_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        squad_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.squad_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should allow invalid div_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        div_id: "abc",
      })
      expect(result.div_id).toBe('abc');
    });
    it("should trim long div_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        div_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.div_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should reset invalid descrip", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        descrip: "BAD" as any,
      });

      expect(result.descrip).toBeNull();
    });

    it("should reset invalid flow", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        flow: "BAD" as any,
      });

      expect(result.flow).toBeNull();
    });

    it("should sanitize amount", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        amount: "80.000" as any,
      });

      expect(result.amount).toBe(80);
    });

    it("should remove invalid pot_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        pot_id: "abc",
      })
      expect(result.pot_id).toBe('abc');
    });
    it("should trim long pot_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        pot_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.pot_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should remove invalid brkt_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        brkt_id: "abc",
      })
      expect(result.brkt_id).toBe('abc');
    });
    it("should trim long brkt_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        brkt_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.brkt_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should remove invalid elim_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        elim_id: "abc",
      })
      expect(result.elim_id).toBe('abc');
    });
    it("should trim long elim_id", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        elim_id: "abcdefghijklmopqrstuvwxyzabcdefghijklmopqrstuvwxyz",
      })
      expect(result.elim_id).toBe("abcdefghijklmopqrstuvwxyzabcdefghijk");
    });

    it("should preserve valid sort_order", () => {
      const result = sanitizeTmntMoney(validTmntMoney);

      expect(result.sort_order).toBe(1);
    });    

    it("should preserve null sort_order", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        sort_order: null as any,
      });

      expect(result.sort_order).toBeNull();
    });

    it("should reset invalid sort_order", () => {
      const result = sanitizeTmntMoney({
        ...validTmntMoney,
        sort_order: "abc" as any,
      });

      expect(result.sort_order).toBe(
        blankTmntMoney.sort_order,
      );
    });    
  });

  describe("validateTmntMoney()", () => {
    it("should return ErrorCode.NONE for valid data", () => {
      expect(
        validateTmntMoney(validTmntMoney),
      ).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when id missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when event_id missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          event_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when event_id is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          event_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when squad_id missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          squad_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when squad_id is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          squad_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when div_id missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          div_id: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when div_id is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          div_id: "abc",
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when descrip is missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          descrip: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when descrip is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          descrip: 'BAD' as any,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          amount: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when amount is invalid", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          amount: maxMoney + 1,
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id and brkt_id both exist", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          pot_id: 'pot_11111111111111111111111111111111',
          brkt_id: 'brk_11111111111111111111111111111111',
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when pot_id and elim_id both exist", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          pot_id: 'pot_11111111111111111111111111111111',
          elim_id: 'elm_11111111111111111111111111111111',
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });
    

    it("should return ErrorCode.INVALID_DATA when brkt_id and elim_id both exist", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,        
          brkt_id: 'brk_11111111111111111111111111111111',
          elim_id: 'elm_11111111111111111111111111111111',
        }),
      ).toBe(ErrorCode.INVALID_DATA);
    });
    
    it("should return ErrorCode.MISSING_DATA when sort_order is missing", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          sort_order: null as any,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });   
    
    it("should return ErrorCode.MISSING_DATA when sort_order is 0", () => {
      expect(
        validateTmntMoney({
          ...validTmntMoney,
          sort_order: 0,
        }),
      ).toBe(ErrorCode.MISSING_DATA);
    });   
  });

  describe("validateTmntMoneys()", () => {

    it("should return ErrorCode.NONE when all data is valid", () => {
      const result =
        validateTmntMoneys(mockTmntMoneys);

      expect(result.errorCode).toBe(
        ErrorCode.NONE,
      );
      expect(result.tmntMoneys).toHaveLength(2);
    });

    it("should sanitize amount values", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        amount: "85.000" as any,
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.NONE);

      expect(result.tmntMoneys).toHaveLength(tmntMoneysToValidate.length);

      expect(result.tmntMoneys[1].amount).toBe(85);
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        id: '<script>alert("xss")</script>',
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when event_id sanitizes to blank", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        event_id: "abc",
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when descrip sanitizes to null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        descrip: "BAD_VALUE" as any,
      };

      const result: validTmntMoneyType =validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when amount sanitizes to blank", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        amount: "abc" as any,
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when id is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        id: null as any,
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when event_id is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        event_id: null as any,
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when descrip is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        descrip: null as any,
      };

      const result: validTmntMoneyType =
        validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.tmntMoneys).toHaveLength(1);
    });

    it("should return ErrorCode.MISSING_DATA when flow is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        flow: null as any,
      };

      const result: validTmntMoneyType =
        validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.tmntMoneys).toHaveLength(1);
    });

    it("should return ErrorCode.MISSING_DATA when amount is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        amount: null as any,
      };

      const result: validTmntMoneyType = validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when sort_order is null", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        sort_order: null as any,
      };

      const result =
        validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(
        ErrorCode.MISSING_DATA,
      );
    });    

    it("should return ErrorCode.INVALID_DATA when sort_order is invalid", () => {
      const tmntMoneysToValidate = [
        ...mockTmntMoneys,
      ];

      tmntMoneysToValidate[1] = {
        ...tmntMoneysToValidate[1],
        sort_order: -1,
      };

      const result =
        validateTmntMoneys(tmntMoneysToValidate);

      expect(result.errorCode).toBe(
        ErrorCode.INVALID_DATA,
      );
    });
  });
})