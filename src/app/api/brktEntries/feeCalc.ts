import type { brktEntriesFromPrisa, brktEntryWithFeeType } from "@/lib/types/types"

/**
 * Calculates the fee for each brktEntry
 * 
 * @param {brktEntriesFromPrisa[]} brktEntries - array of brktEntries without fee
 * @returns {brktEntryWithFeeType[]} array of brktEntries with fee 
 */
export const brktEntriesWithFee = (brktEntries: brktEntriesFromPrisa[]): brktEntryWithFeeType[] => {
  const brktEntriesWithFee: brktEntryWithFeeType[] = [];
  brktEntries.forEach((brktEntry) => {
    const beWithFee: brktEntryWithFeeType = {      
      ...brktEntry,
      time_stamp: brktEntry.time_stamp.getTime(),
      fee: (brktEntry.brkt.fee && brktEntry.num_brackets)
        ? brktEntry.brkt.fee * brktEntry.num_brackets
        : 0,
    }
    brktEntriesWithFee.push(beWithFee)
  })
  return brktEntriesWithFee
}