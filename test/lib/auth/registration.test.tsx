// test/lib/auth/registration.test.tsx
// tests for src/lib/auth/registration.ts
import { isBetaRegistrationOpen } from "@/lib/auth/registration";

describe("isBetaRegistrationOpen", () => {
  const original = process.env.REGISTRATION_MODE;

  afterEach(() => {
    // restore whatever .env (loaded by next/jest) or the shell provided
    if (original === undefined) {
      delete process.env.REGISTRATION_MODE;
    } else {
      process.env.REGISTRATION_MODE = original;
    }
  });

  it('is open when REGISTRATION_MODE is exactly "beta"', () => {
    process.env.REGISTRATION_MODE = "beta";
    expect(isBetaRegistrationOpen()).toBe(true);
  });

  it("is closed when REGISTRATION_MODE is not set", () => {
    delete process.env.REGISTRATION_MODE;
    expect(isBetaRegistrationOpen()).toBe(false);
  });

  it('is closed when REGISTRATION_MODE is "closed"', () => {
    process.env.REGISTRATION_MODE = "closed";
    expect(isBetaRegistrationOpen()).toBe(false);
  });

  it.each(["", "Beta", "BETA", " beta", "beta ", "betatest", "true"])(
    'is closed for near-miss value "%s"',
    (value) => {
      process.env.REGISTRATION_MODE = value;
      expect(isBetaRegistrationOpen()).toBe(false);
    }
  );
});