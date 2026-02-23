import {
  exportedForTesting,
  sanitizeBrktEntry,
  validateBrktEntries,
  validateBrktEntry,
  validBrktEntryFee,
  validBrktEntryNumBrackets,
  validBrktEntryNumRefunds,
} from "@/lib/validation/brktEntries/validate";
import { initBrktEntry } from "@/lib/db/initVals";
import { maxDate, minDate, minTimeStamp } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { mockBrktEntriesToPost } from "../../mocks/tmnts/singlesAndDoubles/mockSquads";
import type { validBrktEntriesType } from "@/lib/types/types";
import { cloneDeep } from "lodash";

const { gotBrktEntryData, sanitizedBrktEntryMoney, validBrktEntryData } =
  exportedForTesting;

const validBrktEntry = {
  ...initBrktEntry,
  id: "ben_bc4c581d7b1c4fc99dbdbd46f4f7210a",
  brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
  num_brackets: 8,
  num_refunds: 0,
  fee: "40",
  time_stamp: new Date().getTime(),
};

const userId = "usr_01234567890123456789012345678901";

describe("tests for brktEntry validation", () => {
  // describe("gotBrktEntryData()", () => {
  //   it("should return ErrorCode.NONE when all data is present", () => {
  //     const errorCode = gotBrktEntryData(validBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.NONE when all data is present - got refunds", () => {
  //     const zeroRefund = cloneDeep(validBrktEntry);
  //     zeroRefund.num_refunds = 0;
  //     const errorCode = gotBrktEntryData(zeroRefund);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.NONE when all data is present - refunds is null", () => {
  //     const nullRefund = cloneDeep(validBrktEntry);
  //     nullRefund.num_refunds = null as any;
  //     const errorCode = gotBrktEntryData(nullRefund);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.NONE when all data is present - timestamp = 0", () => {
  //     const zeroTimeStamp = cloneDeep(validBrktEntry);
  //     zeroTimeStamp.time_stamp = 0;
  //     const errorCode = gotBrktEntryData(zeroTimeStamp);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when id is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when brkt_id is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when player_id is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when num_brackets is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when fee is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when time_stamp is missing", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       time_stamp: null as any,
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: "",
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when brkt_id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: "",
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when player_id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: "",
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  //   it("should return ErrorCode.MISSING_DATA when fee is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "",
  //     };
  //     const errorCode = gotBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //   });
  // });

  // describe("validBrktEntryNumBrackets()", () => {
  //   it("should return true when num_brackets is valid", () => {
  //     expect(validBrktEntryNumRefunds(validBrktEntry.num_refunds)).toBe(true);
  //   });
  //   it("should return true when num_brackets is null", () => {
  //     expect(validBrktEntryNumRefunds(null as any)).toBe(true);
  //   });
  //   it("should return true when num_brackets is undefined", () => {
  //     expect(validBrktEntryNumRefunds(undefined as any)).toBe(true);
  //   });
  //   it("should return false when num_brackets is not a number", () => {
  //     expect(validBrktEntryNumRefunds("abc" as any)).toBe(false);
  //   });
  //   it("should return false when num_brackets is too low", () => {
  //     expect(validBrktEntryNumRefunds(-1)).toBe(false);
  //   });
  //   it("should return false when num_brackets is too big", () => {
  //     expect(validBrktEntryNumRefunds(1234567890)).toBe(false);
  //   });
  //   it("should retur true when num_brackets has non integer decimal", () => {
  //     expect(validBrktEntryNumRefunds(1.1)).toBe(false);
  //   });
  // });

  // describe("validBrktEntryNumRefunds()", () => {
  //   it("should return true when num_brackets is valid", () => {
  //     expect(validBrktEntryNumBrackets(validBrktEntry.num_brackets)).toBe(true);
  //   });
  //   it("should return false when num_brackets is null", () => {
  //     expect(validBrktEntryNumBrackets(null as any)).toBe(false);
  //   });
  //   it("should return false when num_brackets is undefined", () => {
  //     expect(validBrktEntryNumBrackets(undefined as any)).toBe(false);
  //   });
  //   it("should return false when num_brackets is not a number", () => {
  //     expect(validBrktEntryNumBrackets("abc" as any)).toBe(false);
  //   });
  //   it("should return false when num_brackets is too low", () => {
  //     expect(validBrktEntryNumBrackets(0)).toBe(false);
  //   });
  //   it("should return false when num_brackets is too big", () => {
  //     expect(validBrktEntryNumBrackets(1234567890)).toBe(false);
  //   });
  //   it("should retur true when num_brackets has non integer decimal", () => {
  //     expect(validBrktEntryNumBrackets(1.1)).toBe(false);
  //   });
  // });

  // describe("validBrktEntryFee()", () => {
  //   it("should return true when fee is valid", () => {
  //     expect(validBrktEntryFee(validBrktEntry.fee)).toBe(true);
  //   });
  //   it("should return true when fee is blank", () => {
  //     expect(validBrktEntryFee("")).toBe(true);
  //   });
  //   it("should return false when fee is null", () => {
  //     expect(validBrktEntryFee(null as any)).toBe(false);
  //   });
  //   it("should return false when fee is undefined", () => {
  //     expect(validBrktEntryFee(undefined as any)).toBe(false);
  //   });
  //   it("should return false when fee is not a number", () => {
  //     expect(validBrktEntryFee("abc" as any)).toBe(false);
  //   });
  //   it("should return false when fee is negative", () => {
  //     expect(validBrktEntryFee("-1")).toBe(false);
  //   });
  //   it("should return false when fee is too big", () => {
  //     expect(validBrktEntryFee("1234567890")).toBe(false);
  //   });
  //   it("should retur true when fee has non integer decimal", () => {
  //     expect(validBrktEntryFee("1.1")).toBe(true);
  //   });
  // });

  // describe("validBrktEntryData()", () => {
  //   it("should return ErrorCode.NONE when all data is valid", () => {
  //     const errorCode = validBrktEntryData(validBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is 0 and fee is 0", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 0,
  //       fee: "0",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it('should return ErrorCode.INVALID_DATA when num_brackets is 0 and fee is ""', () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 0,
  //       fee: "",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.NONE when num_refunds is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.NONE);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: "abc",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when id is a valid id, but not a brktEntry id", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: userId,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: "",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when id is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when id is undefined", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when brkt_id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: "abc",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when brkt_id is a valid id, but not a brktEntry id", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: userId,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when brkt_id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: "",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when brkt_id is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when brkt_id is undefined", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when player_id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: "abc",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when player_id is a valid id, but not a player id", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: userId,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when player_id is blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: "",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when player_id is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when player_id is undefined", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is not a number", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: "abc" as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: -1,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 1234567890,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is undefined", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is 0 and fee is not 0 or blank", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 0,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_refunds is not a number", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: "abc" as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_refunds is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: -1,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_refunds is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: 1234567890,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when num_brackets is 0 and num_refunds is > 0", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 0,
  //       num_refunds: 1,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is not a number", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "abc",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "-1",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "1234567890",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is null", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is undefined", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: null as any,
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it("should return ErrorCode.INVALID_DATA when fee is blank and num_brackets is not 0", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  //   it('should return ErrorCode.INVALID_DATA when fee is "0" and num_brackets is not 0', () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "0",
  //     };
  //     const errorCode = validBrktEntryData(testBrktEntry);
  //     expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //   });
  // });

  // describe("sanitizedBrktEntryMoney", () => {
  //   it("should return sanitized format when given a valid currency string", () => {
  //     const input = "$1,234.56";
  //     const expectedOutput = "1234.56";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it("should return an empty string when given an invalid currency format", () => {
  //     const input = "invalid_currency";
  //     const expectedOutput = "";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it('should return "0" when the input string is empty', () => {
  //     const input = "";
  //     const expectedOutput = "0";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it("should return sanitized format when given a valid currency string", () => {
  //     const input = "$1,234.56";
  //     const expectedOutput = "1234.56";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it('should return sanitized format for currency string ending with ".00"', () => {
  //     const input = "100.00";
  //     const expectedOutput = "100";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it("should convert NaN values to an empty string when provided with a non-numeric string", () => {
  //     const input = "invalid";
  //     const expectedOutput = "";
  //     const result = sanitizedBrktEntryMoney(input);
  //     expect(result).toBe(expectedOutput);
  //   });
  //   it("should return empty string for null input", () => {
  //     const input = null;
  //     const expectedOutput = "";
  //     const result = sanitizedBrktEntryMoney(input as any);
  //     expect(result).toBe(expectedOutput);
  //   });
  // });

  // describe("sanitizeBrktEntry()", () => {
  //   it("should return a sanitized brktEntry with no refunds", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized).toEqual(testBrktEntry);
  //   });
  //   it("should return a sanitized brktEntry with refunds", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: 1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized).toEqual(testBrktEntry);
  //   });
  //   it("should return a sanitized brktEntry with null refunds", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: null as any,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized).toEqual(testBrktEntry);
  //   });
  //   it("should return a sanitized brktEntry with undefined refunds", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: undefined as any,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized).toEqual(testBrktEntry);
  //   });
  //   it("should return a sanitized brktEntry when id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: "abc",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.id).toEqual("");
  //   });
  //   it("should return a sanitized brktEntry when brkt_id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       brkt_id: "abc",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.brkt_id).toEqual("");
  //   });
  //   it("should return a sanitized brktEntry when player_id is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       player_id: "abc",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.player_id).toEqual("");
  //   });
  //   it("should return a sanitized brktEntry when num_brackets is not a number", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: "abc" as any,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_brackets).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when num_brackets is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: -1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_brackets).toEqual(-1);
  //   });
  //   it("should return a sanitized brktEntry when num_brackets is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 1234567890,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_brackets).toEqual(1234567890);
  //   });
  //   it("should return a sanitized brktEntry when num_brackets is not an integer", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_brackets: 1.1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_brackets).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when num_refunds is not a number", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: "abc" as any,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_refunds).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when num_refunds is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: -1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_refunds).toEqual(-1);
  //   });
  //   it("should return a sanitized brktEntry when num_refunds is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: 1234567890,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_refunds).toEqual(1234567890);
  //   });
  //   it("should return a sanitized brktEntry when num_refunds is not an integer", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       num_refunds: 1.1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.num_refunds).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when fee is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "abc",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.fee).toEqual("");
  //   });
  //   it("should return a sanitized brktEntry when fee is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "-1",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.fee).toEqual("-1");
  //   });
  //   it("should return a sanitized brktEntry when fee is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "1234567890",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.fee).toEqual("1234567890");
  //   });
  //   it("should return a sanitized brktEntry when fee is sanitzied", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       fee: "80.000",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.fee).toEqual("80");
  //   });
  //   it("should return a sanitized brktEntry when time_stamp is invalid", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       time_stamp: "abc" as any,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.time_stamp).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when time_stamp is too low", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       time_stamp: Number.MIN_SAFE_INTEGER - 1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.time_stamp).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when time_stamp is too high", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       time_stamp: Number.MAX_SAFE_INTEGER + 1,
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.time_stamp).toEqual(0);
  //   });
  //   it("should return a sanitized brktEntry when data is not sanitzied", () => {
  //     const testBrktEntry = {
  //       ...validBrktEntry,
  //       id: "<script>alert(1)</script>",
  //       brkt_id: "<script>alert(1)</script>",
  //       player_id: "<script>alert(1)</script>",
  //       fee: "<script>alert(1)</script>",
  //     };
  //     const sanitized = sanitizeBrktEntry(testBrktEntry);
  //     expect(sanitized.id).toEqual("");
  //     expect(sanitized.brkt_id).toEqual("");
  //     expect(sanitized.player_id).toEqual("");
  //     expect(sanitized.fee).toEqual(""); // sanitized, not valildated
  //     expect(sanitized.time_stamp).toBeGreaterThanOrEqual(0);
  //     expect(sanitized.time_stamp).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
  //   });
  // });

  // describe("validateBrktEntry()", () => {
  //   describe("valid data", () => {
  //     it("should return ErrorCode.NONE when all data is valid", () => {
  //       const errorCode = validateBrktEntry(validBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.NONE);
  //     });
  //   });
  //   describe("missing data", () => {
  //     it("should return ErrorCode.MISSING_DATA when id is missing", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         id: null as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //     it("should return ErrorCode.MISSING_DATA when brkt_id is missing", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         brkt_id: null as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //     it("should return ErrorCode.MISSING_DATA when player_id is missing", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         player_id: null as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //     it("should return ErrorCode.MISSING_DATA when num_brackets is missing", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_brackets: null as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //     it("should return ErrorCode.MISSING_DATA when fee is missing", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         fee: null as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //     it("should return ErrorCode.MISSING_DATA when time_stamp is null", () => {
  //       const noTimeStampBrktEntry = cloneDeep(validBrktEntry);
  //       noTimeStampBrktEntry.time_stamp = null as any;
  //       const errorCode = validateBrktEntry(noTimeStampBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.MISSING_DATA);
  //     });
  //   });
  //   describe("invalid data", () => {
  //     it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         id: "abc",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when id is a valid id, but not a brktEntry id", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         id: userId,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when brkt_id is invalid", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         brkt_id: "abc",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when brkt_id is a valid id, but not a div id", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         brkt_id: userId,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when player_id is invalid", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         player_id: "abc",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when player_id is a valid id, but not a player id", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         player_id: userId,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_brackets is not a number", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_brackets: "abc" as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_brackets is too low", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_brackets: -1,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_brackets is too high", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_brackets: 1234567890,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_refunds is not a number", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_refunds: "abc" as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_refunds is too low", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_refunds: -1,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_refunds is too high", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_refunds: 1234567890,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when num_refunds is more than num_brackets", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         num_refunds: 123,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when fee is not a number", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         fee: "abc",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when fee is too low", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         fee: "-1",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when fee is too high", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         fee: "1234567890",
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when time_stamp is not a number", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         time_stamp: "abc" as any,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when time_stamp is too low", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         time_stamp: minDate.getTime() - 1,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //     it("should return ErrorCode.INVALID_DATA when time_stamp is too high", () => {
  //       const testBrktEntry = {
  //         ...validBrktEntry,
  //         time_stamp: maxDate.getTime() + 1,
  //       };
  //       const errorCode = validateBrktEntry(testBrktEntry);
  //       expect(errorCode).toBe(ErrorCode.INVALID_DATA);
  //     });
  //   });
  // });

  describe("validateBrktEntries()", () => {
    it("should return ErrorCode.NONE when all data is valid", () => {
      const brktEntriesToValidate = [...mockBrktEntriesToPost];
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.NONE);
      expect(validBrktEntries.brktEntries.length).toBe(
        brktEntriesToValidate.length,
      );
      for (let i = 0; i < validBrktEntries.brktEntries.length; i++) {
        expect(validBrktEntries.brktEntries[i].id).toBe(
          brktEntriesToValidate[i].id,
        );
        expect(validBrktEntries.brktEntries[i].brkt_id).toBe(
          brktEntriesToValidate[i].brkt_id,
        );
        expect(validBrktEntries.brktEntries[i].player_id).toBe(
          brktEntriesToValidate[i].player_id,
        );
        expect(validBrktEntries.brktEntries[i].num_brackets).toBe(
          brktEntriesToValidate[i].num_brackets,
        );
        expect(validBrktEntries.brktEntries[i].fee).toBe(
          brktEntriesToValidate[i].fee,
        );
        expect(validBrktEntries.brktEntries[i].time_stamp).toBe(
          brktEntriesToValidate[i].time_stamp,
        );
      }
    });
    it("should return ErrorCode.NONE when num_refunds is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.NONE when num_refunds is undefined", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = undefined as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.NONE);
    });
    it("should return sanitized brktEntries when data is not sanitized", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "85.000";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.NONE);
      expect(validBrktEntries.brktEntries.length).toBe(
        brktEntriesToValidate.length,
      );
      expect(validBrktEntries.brktEntries[1].fee).toBe("85");
    });
    it('should return ErrorCode.INVALID_DATA when id is sanitzied to ""', () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].id = '<script>alert("xss")</script>';
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it('should return ErrorCode.INVALID_DATA when brkt_id is sanitzied to ""', () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].brkt_id = "test";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it('should return ErrorCode.MISSING_DATA when player_id is sanitzied to ""', () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].player_id = "";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_brackets is not a number", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_brackets = "abc" as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when fee is not a number", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "abc";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when time_stamp is not a number", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].time_stamp = "abc" as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when id is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].id = "abc";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when id is valid, but not a brktEntry id", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].id = userId;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when brkt_id is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].brkt_id = "abc";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when id is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].id = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when brkt_id is valid, but not a div id", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].brkt_id = userId;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when brkt_id is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].brkt_id = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when player_id is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].player_id = "abc";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when player_id is valid, but not a player id", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].player_id = userId;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when player_id is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].player_id = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_brackets is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_brackets = "abc" as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_brackets is too low", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_brackets = -1;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_brackets is too high", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_brackets = 1234567890;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_brackets is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_brackets = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.NONE when num_refunds is not a number (sanitized to 0)", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = "abc" as any;
      // num_refunds is sanitized to 0
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.INVALID_DATA when num_refunds is too low", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = -1;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_refunds is too high", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = 1234567890;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when num_refunds more than num_brackets", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].num_refunds = 123;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when fee is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "abc";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when fee is too low", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "-1";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when fee is too high", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "1234567890";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when fee is blank", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = "";
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when fee is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].fee = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when time_stamp is invalid", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].time_stamp = "abc" as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when time_stamp is too low", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].time_stamp = -1;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when time_stamp is too high", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].time_stamp = 8.64e15 + 1;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.MISSING_DATA when time_stamp is null", () => {
      const brktEntriesToValidate = cloneDeep(mockBrktEntriesToPost);
      brktEntriesToValidate[1].time_stamp = null as any;
      const validBrktEntries: validBrktEntriesType = validateBrktEntries(
        brktEntriesToValidate,
      );
      expect(validBrktEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    });
  });
});
