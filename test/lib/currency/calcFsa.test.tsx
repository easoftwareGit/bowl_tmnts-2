import { calcFSA } from "@/lib/currency/fsa";

describe('calcFSA', () => {

  it('should convert string numbers to actual numbers and return their sum', () => {
    const result = calcFSA(25, 10, 5);
    expect(result).toBe(40);
  });
  it('should return 0 when any input is NaN', () => {
    const result = calcFSA('a', 2, 3);
    expect(result).toBe(0);
  });
  it('should convert string numbers to actual numbers and return their sum', () => {
    const result = calcFSA('10', '20', '30');
    expect(result).toBe(60);
  });
  it('should return the sum of three numbers rounded to two decimal places when inputs are valid numbers', () => {
    const result = calcFSA(10.123, 20.456, 30.789);
    expect(result).toBe(61.37);
  });
  it('should return 0 when any input is undefined', () => {
    const result1 = calcFSA(undefined, 1, 1);
    const result2 = calcFSA(1, undefined, 1);
    const result3 = calcFSA(1, 1, undefined);
    expect(result1).toBe(0);
    expect(result2).toBe(0);
    expect(result3).toBe(0);
  });
  it('should correctly handle very large numbers without overflow', () => {
    const largeNumber = Number.MAX_SAFE_INTEGER;
    const result = calcFSA(largeNumber, largeNumber, largeNumber);
    expect(result).toBeCloseTo(largeNumber * 3, 2);
  });
  it('should return 0 when all inputs are non-zero', () => {
    const result = calcFSA(1e-10, 2e-10, 3e-10);
    expect(result).toBe(0);
  });
  it('should correctly calculate the sum when inputs are numeric strings', () => {
    const result = calcFSA('10', '20', '30');
    expect(result).toBe(60);
  });
  it('should return the correct sum when inputs are negative numbers', () => {
    const result = calcFSA(-5, -10, -15);
    expect(result).toBe(-30);
  });
});
