import { validBtdbMoney, validMoney } from "@/lib/currency/validate";
import { maxMoney } from "@/lib/validation";

describe("validAmount", () => {
  it("should return true if amount is a valid number", () => {
    expect(validMoney("5", 0, maxMoney)).toBe(true);
    expect(validMoney("0", 0, maxMoney)).toBe(true);
    expect(validMoney("000", 0, maxMoney)).toBe(true);
    expect(validMoney("00.0", 0, maxMoney)).toBe(true);
    expect(validMoney("0.00", 0, maxMoney)).toBe(true);
    expect(validMoney("0.5", 0, maxMoney)).toBe(true);
    expect(validMoney("5.55", 0, maxMoney)).toBe(true);
    expect(validMoney("-5", maxMoney * -1, maxMoney)).toBe(true);  
    expect(validMoney(5 as any, 0, maxMoney)).toBe(true);
    expect(validMoney("1000", 0, maxMoney)).toBe(true);  
    expect(validMoney("1,000", 0, maxMoney)).toBe(true);  
    expect(validMoney("$1000", 0, maxMoney)).toBe(true);  
    expect(validMoney("$1,000", 0, maxMoney)).toBe(true);  
    expect(validMoney("$1,000.00", 0, maxMoney)).toBe(true);  
    expect(validMoney("-$5", maxMoney * -1, maxMoney)).toBe(true);  
  });
  it("should return false if amount is not a valid number", () => {
    expect(validMoney("0.0005", 0, maxMoney)).toBe(true); // sanitied to 0.00
    expect(validMoney("abc", 0, maxMoney)).toBe(false);
    expect(validMoney("5.abc", 0, maxMoney)).toBe(false);        
    expect(validMoney("5.5.5", 0, maxMoney)).toBe(false);
    expect(validMoney("5.55-", 0, maxMoney)).toBe(false);
    expect(validMoney("-5", 0, maxMoney)).toBe(false);
    expect(validMoney("5$", 0, maxMoney)).toBe(false);
    expect(validMoney("-5.55", 0, maxMoney)).toBe(false);
    expect(validMoney("(5.55)", 0, maxMoney)).toBe(false);
    expect(validMoney("", 0, maxMoney * -1)).toBe(false);
    expect(validMoney(null as any, 0, maxMoney)).toBe(false);
    expect(validMoney(undefined as any, 0, maxMoney)).toBe(false);
  });
})

describe("validBtdbMoney function (bowl tournament database)", () => {
  it('should return true for blank string', () => { 
    const result = validBtdbMoney('');
    expect(result).toBe(true);
  })
  it('should return true for value value', () => { 
    const result = validBtdbMoney('123');
    expect(result).toBe(true);
  })
  it('should return true for value value with comma in the right place', () => { 
    const result = validBtdbMoney('1,234');
    expect(result).toBe(true);
  })
  it('should return true for just one zero string "0"', () => { 
    const result = validBtdbMoney('0');
    expect(result).toBe(true);
  })
  it('should return true for just one zero string "0"', () => { 
    const result = validBtdbMoney('0');
    expect(result).toBe(true);
  })
  it('should return true for just zeros in a string "0000"', () => { 
    const result = validBtdbMoney('0000');
    expect(result).toBe(true);
  })
  it('should return true for "000.0"', () => { 
    const result = validBtdbMoney('000.0');
    expect(result).toBe(true);
  })
  it('should return true for "00.00"', () => { 
    const result = validBtdbMoney('00.00');
    expect(result).toBe(true);
  })
  it("should return false for negative number when min is not set", () => {
    const result = validBtdbMoney("-1");
    expect(result).toBe(false);
  });
  it("should return true for negative number when larger then min", () => {
    const result = validBtdbMoney("-1", -10);
    expect(result).toBe(true);
  });
  it("should return false for number when smaller then min", () => {
    const result = validBtdbMoney("-10", -1);
    expect(result).toBe(false);
  });
  it("should return false for number when smaller then min, both numbers not negative", () => {
    const result = validBtdbMoney("0", 1);
    expect(result).toBe(false);
  });
  it("should return false for when passed a blank, and min more then 0", () => {
    const result = validBtdbMoney("", 1);
    expect(result).toBe(false);
  });
  it('should return true for value value with comma in the wrong place', () => { 
    const result = validBtdbMoney('12,34');
    expect(result).toBe(false);
  })
  it("should return false for value too high and max is not set", () => {
    const result = validBtdbMoney("123456789");
    expect(result).toBe(false);
  });
  it("should return true for value value is less than max when max is set", () => {
    const result = validBtdbMoney("123456", 0, 1234567);
    expect(result).toBe(true);
  });
  it("should return false for value value is more than max when max is set", () => {
    const result = validBtdbMoney("123456", 0, 12345);
    expect(result).toBe(false);
  });
  it("should return false for value with brackets ( )", () => {
    const result = validBtdbMoney("(123456789)");
    expect(result).toBe(false);
  });
  it("should return false for trailing negative sign", () => {
    const result = validBtdbMoney("123-");
    expect(result).toBe(false);
  });
  it("should return false for non-numeric", () => {
    const result = validBtdbMoney('ABC');
    expect(result).toBe(false);
  });
  it("should return false when passed null", () => {
    const result = validBtdbMoney(null as any);
    expect(result).toBe(false);
  });
  it("should return false when passed undefined", () => {
    const result = validBtdbMoney(undefined as any);
    expect(result).toBe(false);
  });
});

