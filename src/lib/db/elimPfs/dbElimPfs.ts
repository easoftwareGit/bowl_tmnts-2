import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../../test/testApi";
import type { elimPfSaveDataType, elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankElimPf } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;

const tmntUrl = url + "/tmnt/";  

/**
 * maps API value to app elimPf
 *
 * @param {unknown} value - value from API response
 * @returns {elimPfType} mapped elimPf
 */
const mapElimPf = (value: unknown): elimPfType => {
  const obj = value as Record<string, unknown>;
  return {
    ...blankElimPf,
    id: String(obj.id ?? ""),
    elim_id: String(obj.elim_id ?? ""),
    position: obj.position == null ? null : Number(obj.position),
    amount: obj.amount == null ? null : Number(obj.amount),
  }
};

/**
 * extract elimPf data from GET API response
 *
 * @param {any} elimPfs - array of elimPfs from GET API response
 * @returns {elimPfType[]} - array of elimPfs
 */
export const extractElimPfs = (elimPfs: any): elimPfType[] => {
  if (elimPfs == null || !Array.isArray(elimPfs)) return [];
  return elimPfs.map((elimPf: any) => mapElimPf(elimPf));
};

/**
 * get all elimPfs for a tmnt
 *
 * @param {string} tmntId - id of tmnt with elimPfs to get
 * @returns {elimPfType[]} - array of elimPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllElimPfsForTmnt = async (tmntId: string): Promise<elimPfType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await privateApi.get(tmntUrl + tmntId);

    if (!response.data?.elimPfs) {
      throw new Error("Error fetching elimPfs");
    }

    return extractElimPfs(response.data.elimPfs);
  } catch (err) {
    throw new Error(
      `getAllElimPfsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * update all elimPfs for a tmnt
 * 
 * @param {tmntElimPfSaveDataType} dataToUpdate - data to update
 * - tmntId: id of tmnt to update elimPfs for
 * - elimIds: array of valid elimIds in elimPfs
 * - elimPfData: array of elimPfs to update
 *
 * @param {string} tmntId - id of tmnt to update elimPfs for
 * @param {string[]} elimIds - array of valid elimIds in elimPfs
 * @param {elimPfType[]} elimPfs - array of elimPfs to update
 * @returns {elimPfType[]} - array of updated elimPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const updateAllElimPfsForTmnt = async (
  dataToUpdate: tmntElimPfSaveDataType
  // tmntId: string,
  // elimIds: string[],
  // elimPfs: elimPfType[]
): Promise<elimPfType[]> => {
  if (!isValidBtDbId(dataToUpdate.tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }  
  if (!Array.isArray(dataToUpdate.elimIds)) {
    throw new Error("Invalid elimIds array");
  }
  if (!Array.isArray(dataToUpdate.elimPfData)) {
    throw new Error("Invalid elimPfs array");
  }

  // elimPfs.length = 0 is OK - clears all elimPfs for a elim

  try {
    const tmntElimPfData: elimPfSaveDataType = {
      elimPfData: dataToUpdate.elimPfData,
      elimIds: dataToUpdate.elimIds
    }
    const elimPfJSON = JSON.stringify(tmntElimPfData);
    const response = await privateApi.put(tmntUrl + dataToUpdate.tmntId, elimPfJSON);    

    // only check if passed elimPfs to update
    if (dataToUpdate.elimPfData.length > 0 && !response.data?.elimPfs) {
      throw new Error("Error updating elimPfs for tmnt");
    }

    return response.data.elimPfs;
  } catch (err) {
    throw new Error(
      `updateAllElimPfsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
}


// /**
//  * get all elimPfs for an elim
//  *
//  * @param {string} elimId - id of elim with elimPfs to get
//  * @returns {elimPfType[]} - array of elimPfs
//  * @throws {Error} - if elimId is invalid or API call fails
//  */
// export const getAllElimPfsForElim = async (elimId: string): Promise<elimPfType[]> => {
//   if (!isValidBtDbId(elimId, "elm")) {
//     throw new Error("Invalid elim id");
//   }

//   try {
//     const response = await privateApi.get(elimUrl + elimId);

//     if (!response.data?.elimPfs) {
//       throw new Error("Error fetching elimPfs");
//     }

//     return extractElimPfs(response.data.elimPfs);
//   } catch (err) {
//     throw new Error(
//       `getAllElimPfsForElim failed: ${err instanceof Error ? err.message : err}`
//     );
//   }
// };

// /**
//  * update all elimPfs for an elim
//  *
//  * @param {string} elimId - id of elim to update elimPfs for
//  * @param {elimPfType[]} elimPfs - array of elimPfs to update
//  * @returns {elimPfType[]} - array of updated elimPfs
//  * @throws {Error} - if elimId is invalid or API call fails
//  */
// export const updateAllElimPfsForElim = async (elimId: string, elimPfs: elimPfType[]): Promise<elimPfType[]> => {
//   if (!isValidBtDbId(elimId, "elm")) {
//     throw new Error("Invalid elim id");
//   }
//   if (!Array.isArray(elimPfs)) {
//     throw new Error("Invalid elimPfs array");
//   }

//   // elimPfs.length = 0 is OK - clears all elimPfs for an elim

//   try {
//     const elimPfsJSON = JSON.stringify(elimPfs);
//     const response = await privateApi.put(elimUrl + elimId, elimPfsJSON);

//     // only check if passed elimPfs to update
//     if (elimPfs.length > 0 && !response.data?.elimPfs) {
//       throw new Error("Error updating elimPfs for elim");
//     }

//     return response.data.elimPfs;
//   } catch (err) {
//     throw new Error(
//       `updateAllElimPfsForElim failed: ${
//         err instanceof Error ? err.message : err
//       }`
//     );
//   }
// }
