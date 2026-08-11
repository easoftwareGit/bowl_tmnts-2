import { brktSeedType, brktType, oneBrktType } from "@/lib/types/types";
import { Bracket } from "./bracketClass";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";

/**
 * populates an array of brackets with data from the database
 * 
 * @param brkt - current bracket
 * @param one_brkts - array of one brkts for current bracket
 * @param seeds - array of seeds for current bracket
 * @returns - array of all brackets for current bracket
 */
export const populateBrackets = (
  brkt: brktType,
  one_brkts: oneBrktType[],
  seeds: brktSeedType[],
): Bracket[] => {

  if (!brkt || !one_brkts || !seeds) return [];
  if (!Array.isArray(one_brkts) || !Array.isArray(seeds)) return [];
  if (one_brkts.length === 0 || seeds.length === 0) return [];

  const brackets: Bracket[] = [];  
  const calcPlayersPerMatch = brkt.games === 0
    ? defaultPlayersPerMatch
    : (brkt.players ** (1 / brkt.games));
  const playersPerMatch = (Number.isInteger(calcPlayersPerMatch)) 
    ? calcPlayersPerMatch 
    : defaultPlayersPerMatch;    

  // Group all seeds by one_brkt_id.
  // Map key = one_brkt_id.
  // Map value = array of brktSeeds for that one_brkt.
  const seedsByOneBrkt = new Map<string, brktSeedType[]>();

  seeds.forEach((seed) => {
    // Get the existing array of seeds for this one_brkt_id.
    const brktSeeds = seedsByOneBrkt.get(seed.one_brkt_id);

    if (brktSeeds) {
      // Key exists: add this seed to its array of seeds.
      brktSeeds.push(seed);
    } else {
      // Key does not exist: create it with the first seed.
      seedsByOneBrkt.set(seed.one_brkt_id, [seed]);
    }
  });  
  
  one_brkts.forEach((one_brkt) => {
    // Get the array of seeds for this one_brkt.
    const brktSeeds = seedsByOneBrkt.get(one_brkt.id) ?? [];
    // Create a new bracket.
    const bracket = new Bracket(one_brkt.id, playersPerMatch, brkt.games);
    // Populate the bracket with players.
    bracket.populateBracket(brktSeeds);
    
    brackets.push(bracket);
  });


  return brackets;
};
