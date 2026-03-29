import "server-only";
import { hash, compare } from "bcrypt";
import { bcryptLength, maxToHashLength } from "@/lib/validation/constants";

const getSaltRounds = (): number => {
  const raw = process.env.SALT_ROUNDS ?? process.env.TEST_SALT_ROUNDS;
  const n = Number(raw);
  // choose whatever fallback you want; 10 is common
  return Number.isFinite(n) && n > 0 ? n : 10;
};

/**
 * Hashes a string
 * 
 * @param {string} toHash - string to hash
 * @returns {Promise<string>} - hashed string 
 */
export const doHash = async (toHash: string): Promise<string> => {
  try {
    if (!toHash || toHash.length > maxToHashLength) return "";
    return await hash(toHash, getSaltRounds());
  } catch {
    return "";
  }
};

/**
 * Compares a string with a hashed string
 * 
 * @param {string} toHash - string to hash
 * @param {string} hashed - hashed string
 * @returns {Promise<boolean>} - true if toHash and hashed match 
 */
export const doCompare = async (toHash: string, hashed: string): Promise<boolean> => {
  try {
    if (!toHash || toHash.length > maxToHashLength) return false;
    if (!hashed || hashed.length !== bcryptLength) return false;
    return await compare(toHash, hashed);
  } catch {
    return false;
  }
};