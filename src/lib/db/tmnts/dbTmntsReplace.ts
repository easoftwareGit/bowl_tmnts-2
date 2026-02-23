import axios from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../../test/testApi";
import type { fullStageType, tmntFullType } from "@/lib/types/types";
import { ErrorCode } from "@/lib/enums/enums";
import { validateFullTmnt } from "@/lib/validation/tmnts/full/validate";
import { SquadStage } from "@prisma/client";

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;
const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";

/**
 * replaces full tmnt data, tmnt table and all child/grandchild tables
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<boolean>} - true on success or throws error
 */
export const replaceTmntFullData = async (
  tmntFullData: tmntFullType,
): Promise<boolean> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {
    throw new Error("invalid tmntFullData data");
  }

  // need to set stage date fields so stage can pass validation
  // stage date fields
  const stageDate = new Date();
  const stageDateStr = stageDate.toISOString(); // app sets stage date
  tmntFullData.stage.stage_set_at = stageDateStr;
  tmntFullData.stage.scores_started_at =
    tmntFullData.stage.stage === SquadStage.SCORES ? stageDateStr : null;
  tmntFullData.stage.stage_override_at = tmntFullData.stage
    .stage_override_enabled
    ? stageDateStr
    : null;

  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }

  let response;
  try {
    const tmntJSON = JSON.stringify(tmntFullData);
    response = await axios.put(fullUrl + tmntFullData.tmnt.id, tmntJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `replaceTmntFullData failed: ${err instanceof Error ? err.message : err}`,
    );
  }
  if (response.status !== 200 || !response.data?.success) {
    throw new Error("Error replacing full tmnt");
  }
  return response.data.success;
};

/**
 * replaces full tmnt entries data
 * replaces players, divEntries, potEntries, brktEntries, brktRefunds,
 * onebrkts, brktSeeds, and elimEntries
 * DOES NOT replace tmnt, events, divs, squads, lanes, pots, brkts, or elims
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<boolean>} - true on success or throws error
 */
export const replaceTmntEntriesData = async (
  tmntFullData: tmntFullType,
): Promise<{ success: true; stage: fullStageType }> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {
    throw new Error("invalid tmntFullData data");
  }

  // need to set stage date fields so stage can pass validation
  // stage date fields
  const stageDate = new Date();
  const stageDateStr = stageDate.toISOString(); // app sets stage date
  tmntFullData.stage.stage_set_at = stageDateStr;
  tmntFullData.stage.scores_started_at = tmntFullData.stage.stage === SquadStage.SCORES
    ? stageDateStr
    : null;
  tmntFullData.stage.stage_override_at = tmntFullData.stage
    .stage_override_enabled
    ? stageDateStr
    : null;

  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }

  let response;
  try {
    const tmntJSON = JSON.stringify(tmntFullData);
    response = await axios.put(
      fullEntriesUrl + tmntFullData.tmnt.id,
      tmntJSON,
      {
        withCredentials: true,
      },
    );
  } catch (err) {
    throw new Error(
      `replaceTmntFullEntriesData failed: ${err instanceof Error ? err.message : err}`,
    );
  }
  if (response.status !== 200 || !response.data?.success) {
    throw new Error("Error replacing full tmnt entries");
  }
  return response.data; // { success, stage }
};
