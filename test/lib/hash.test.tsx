import { doHash } from "@/lib/hash";

describe('doHash', () => {

  // Successfully hash a password string with valid salt rounds
  it('should hash password string when salt rounds are valid', async () => {
    process.env.SALT_ROUNDS = '10';

    const password = 'myPassword123';
    const hashedResult = await doHash(password);

    expect(hashedResult).toBeDefined();
    expect(typeof hashedResult).toBe('string');
    expect(hashedResult).not.toBe(password);
  });

  // Handle empty string password input
  it('should hash empty string when provided as password', async () => {
    process.env.SALT_ROUNDS = '10';

    const password = '';
    const hashedResult = await doHash(password);

    expect(hashedResult).toBeDefined();
    expect(typeof hashedResult).toBe('string');
    expect(hashedResult).not.toBe(password);
  });

  // Return a different hash for the same input string on multiple calls
  it('should return different hashes for the same input on multiple calls', async () => {
    process.env.SALT_ROUNDS = '10';

    const password = 'myPassword123';
    const firstHash = await doHash(password);
    const secondHash = await doHash(password);

    expect(firstHash).toBeDefined();
    expect(secondHash).toBeDefined();
    expect(firstHash).not.toBe(secondHash);
  });

  // Handle passwords of varying lengths (short, medium, long)
  it('should hash passwords of varying lengths correctly', async () => {
    process.env.SALT_ROUNDS = '10';

    const shortPassword = 'short';
    const mediumPassword = 'mediumLengthPassword';
    const longPassword = 'thisIsAVeryLongPasswordThatExceedsNormalLength';

    const hashedShort = await doHash(shortPassword);
    const hashedMedium = await doHash(mediumPassword);
    const hashedLong = await doHash(longPassword);

    expect(hashedShort).toBeDefined();
    expect(typeof hashedShort).toBe('string');
    expect(hashedShort).not.toBe(shortPassword);

    expect(hashedMedium).toBeDefined();
    expect(typeof hashedMedium).toBe('string');
    expect(hashedMedium).not.toBe(mediumPassword);

    expect(hashedLong).toBeDefined();
    expect(typeof hashedLong).toBe('string');
    expect(hashedLong).not.toBe(longPassword);
  });

  // Process common password characters (letters, numbers, special chars)
  it('should hash password with letters, numbers, and special characters', async () => {
    process.env.SALT_ROUNDS = '10';

    const password = 'P@ssw0rd!2023';
    const hashedResult = await doHash(password);

    expect(hashedResult).toBeDefined();
    expect(typeof hashedResult).toBe('string');
    expect(hashedResult).not.toBe(password);
  });

  // Handle very long password strings (>72 chars bcrypt limit)
  it('should hash very long password strings correctly', async () => {
    process.env.SALT_ROUNDS = '10';

    const longPassword = 'a'.repeat(100); // 100 characters long
    const hashedResult = await doHash(longPassword);

    expect(hashedResult).toBeDefined();
    expect(typeof hashedResult).toBe('string');
    expect(hashedResult).not.toBe(longPassword);
  });
});
