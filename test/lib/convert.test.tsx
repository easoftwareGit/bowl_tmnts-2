import { convertToString } from "@/lib/convert";

describe('convertToString', () => {
  
  it('should convert number to string when given a valid number', () => {
    const input = 42;
    const result = convertToString(input);
    expect(result).toBe('42');    
  });
  it('should return the same string when given a regular string', () => {
    const input = 'hello';
    const result = convertToString(input);
    expect(result).toBe('hello');    
  });
  it('should convert boolean to string when given a boolean value', () => {
    const input = true;
    const result = convertToString(input);
    expect(result).toBe('true');    
    const input2 = false;
    const result2 = convertToString(input2);
    expect(result2).toBe('false');    
  });
  it('should return an empty string when given an empty string', () => {
    const input = '';
    const result = convertToString(input);
    expect(result).toBe('');    
  });
  it('should return empty string when value is undefined', () => {
    const input = undefined;
    const result = convertToString(input);
    expect(result).toBe('');
    
  });
  it('should return \'NaN\' when given NaN', () => {
    const input = NaN;
    const result = convertToString(input);
    expect(result).toBe('NaN');
  });
  it('should return empty string when given null or undefined', () => {
    expect(convertToString(null)).toBe('');
    expect(convertToString(undefined)).toBe('');
  });
  it('should convert array to string when given an array', () => {
    const input = [1, 2, 3];
    const result = convertToString(input);
    expect(result).toBe('1,2,3');
  });
  it('should convert Date object to string when given a valid Date', () => {
    const input = new Date('2023-10-05T14:48:00.000Z');
    const result = convertToString(input);
    expect(result).toBe(input.toString());
  });
});
