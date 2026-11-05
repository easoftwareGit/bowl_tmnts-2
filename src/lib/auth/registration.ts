import "server-only";

/**
 * Self-registration (the register form, or signing up with Google) is only
 * open during beta. Anything other than exactly "beta" — including a missing
 * variable — means closed.
 */
export function isBetaRegistrationOpen(): boolean {
  return process.env.REGISTRATION_MODE === "beta";
}