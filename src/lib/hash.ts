import { hash } from "bcrypt";

/**
 * hashes a string
 * 
 * @param {string} toHash - string to hash
 * @returns {string} - hashed string
 */
export const doHash = async (toHash: string): Promise<string> => {

  const saltRoundsStr: any = process.env.SALT_ROUNDS;
  const saltRounds = parseInt(saltRoundsStr);
  return await hash(toHash, saltRounds);
};