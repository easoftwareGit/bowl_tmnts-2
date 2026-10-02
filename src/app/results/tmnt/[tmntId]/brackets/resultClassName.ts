import { matchResultType } from "@/components/brackets/bracketMatchClass"

/**
 * Get the class name for a match result, 
 * so text is green for win, red for loss, and blue for tie
 * 
 * @param {matchResultType} playerResult - player's result in a match: T, W, L or undefined
 * @returns {string} - result class name
 */
export const getResultClassName = (playerResult: matchResultType): string => {
  return playerResult === "W"
    ? "text-success"
    : playerResult === "L"
      ? "text-danger"
      : "text-primary";
}