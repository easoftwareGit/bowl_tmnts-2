import { getErrorStatus } from "@/app/api/errCodes";

describe('getErrorStatus', () => {
  it('returns 409 for unique constraint error (P2002)', () => {
    const code = 'P2002';
    const expectedStatus = 409;
    const result = getErrorStatus(code);
    expect(result).toBe(expectedStatus);
  });

  it('returns 409 for foreign key constraint error (P2003)', () => {
    const code = 'P2003';
    const expectedStatus = 409;
    const result = getErrorStatus(code);
    expect(result).toBe(expectedStatus);
  });

  it('returns 404 for record not found error (P2025)', () => {
    const code = 'P2025';
    const expectedStatus = 404;
    const result = getErrorStatus(code);
    expect(result).toBe(expectedStatus);
  });

  it('returns 500 for unknown error code', () => {
    const code = ' unknown';
    const expectedStatus = 500;
    const result = getErrorStatus(code);
    expect(result).toBe(expectedStatus);
  });

  it('returns 500 for null error code', () => {
    const code = null;
    const expectedStatus = 500;
    const result = getErrorStatus(code as any);
    expect(result).toBe(expectedStatus);
  });

  it('returns 500 for undefined error code', () => {
    const code = undefined;
    const expectedStatus = 500;
    const result = getErrorStatus(code as any);
    expect(result).toBe(expectedStatus);
  });

  it('returns 500 for code a number', () => {
    const code = 123;
    const expectedStatus = 500;
    const result = getErrorStatus(code as any);
    expect(result).toBe(expectedStatus);
  });

});