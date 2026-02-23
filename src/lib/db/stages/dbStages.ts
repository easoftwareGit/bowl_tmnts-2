import axios, { AxiosError } from "axios";
import { baseStagesApi } from "@/lib/db/apiPaths";
import { testBaseStagesApi } from "../../../../test/testApi";
import type {
  fullStageType,
  justStageType,
  justStageOverrideType,
  tmntFullType,
} from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { initFullStage } from "../initVals";
import { SquadStage } from "@prisma/client";
import { validStageValue } from "@/lib/validation/stages/validate";
import { btDbUuid } from "@/lib/uuid";

const url = testBaseStagesApi.startsWith("undefined")
  ? baseStagesApi
  : testBaseStagesApi;
const stageUrl = url + "/stage/";
const squadUrl = url + "/squad/";

/**
 * Get a full stage for a squad
 *
 * @param {string} squadId - id of stage to get
 * @returns {fullStageType | null} - stage object with full stage data or null
 */
export const getFullStageForSquad = async (squadId: string): Promise<fullStageType | null> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(squadUrl + squadId, { withCredentials: true });
  } catch (err) {
    // Just propagate the underlying error message, no function-name prefix
    throw new Error(`getFullStageForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching stage`);
  }  
  return response.data.stage; 
};

export async function getJustStage(squadId: string): Promise<justStageType | null>;
export async function getJustStage(
  fullTmntData: tmntFullType
): Promise<justStageType | null>;
/**
 * gets justStage object
 *
 * @param {string | tmntFullType} input - squad id or full tmnt data
 * @returns {justStageType | null} - juststage object or null
 * @throws {Error} - if input is invalid or API call fails
 */
export async function getJustStage(
  input: string | tmntFullType
): Promise<justStageType | null> {
  if (input == null) {
    throw new Error("Invalid squad id");
  }
  const squadId: string | undefined =
    typeof input === "string"
      ? input
      : Array.isArray(input.squads)
      ? input.squads[0]?.id
      : undefined;
  if (squadId == null) {
    throw new Error("Invalid squad id");
  }
  let fullStage: fullStageType | null;
  try { 
    fullStage = await getFullStageForSquad(squadId);
  } catch (err) {
    throw new Error(
      `getJustStage failed: ${err instanceof Error ? err.message : String(err)}`
    );    
  }
  // const fullStage = await getFullStageForSquad(squadId);
  if (fullStage == null) return null;    
  return {
    id: fullStage.id,
    squad_id: fullStage.squad_id,
    stage: fullStage.stage,
    stage_set_at: fullStage.stage_set_at,
    scores_started_at: fullStage.scores_started_at,
  };
}

export async function getJustStageOverride(
  squadId: string
): Promise<justStageOverrideType | null>;
export async function getJustStageOverride(
  fullTmntData: tmntFullType
): Promise<justStageOverrideType | null>;
/**
 * gets justStageOverride object
 *
 * @param {string | tmntFullType} input - squad id or full tmnt data
 * @returns {justStageType | null} - squad stage object or null
 * @throws {Error} - if input is invalid or API call fails
 */
export async function getJustStageOverride(
  input: string | tmntFullType
): Promise<justStageOverrideType | null> {
  if (input == null) {
    throw new Error("Invalid squad id");
  }
  const squadId: string | undefined =
    typeof input === "string"
      ? input
      : Array.isArray(input.squads)
      ? input.squads[0]?.id
      : undefined;
  if (squadId == null) {
    throw new Error("Invalid squad id");
  }
  const fullStage = await getFullStageForSquad(squadId);
  if (fullStage == null) return null;
  return {
    id: fullStage.id,
    squad_id: fullStage.squad_id,
    stage_override_enabled: fullStage.stage_override_enabled,
    stage_override_at: fullStage.stage_override_at,
    stage_override_reason: fullStage.stage_override_reason,
  };
}

/**
 * posts a full stage
 *
 * @param {fullStageType} fullStage - full stage to post
 * @returns {fullStageType} - full stage object with just stage data
 * @throws {Error} - if stage data is invalid
 */
export const postFullStage = async (
  fullStage: fullStageType
): Promise<fullStageType> => {
  if (!fullStage || !isValidBtDbId(fullStage.id, "stg")) {
    throw new Error("Invalid stage data");
  }
  let response;
  try {
    // further sanatation and validation done in POST route
    const fullStageJSON = JSON.stringify(fullStage);
    response = await axios.post(url, fullStageJSON, { withCredentials: true });
  } catch (err) {
    if (err instanceof AxiosError && err.status === 422) {
      throw new Error("Invalid stage data");
    }
    throw new Error(
      `postFullStage failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 201 || !response.data.stage) {
    throw new Error("Error posting stage");
  }
  const fullStageData = response.data.stage;
  return fullStageData;
};

/**
 * posts an initial stage
 * 
 * @param {string} squadId - squad id for initial stage 
 * @returns {fullStageType} - full stage object  
 * @throws {Error} - if squad id is invalid or API call fails
 */
export const postInitialStageForSquad = async (
  squadId: string
): Promise<fullStageType> => {
  if (!squadId || !isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");    
  }
  // initFullStage sets stage_override_enabled: false
  // date fields set in POST route
  const newFullStage: fullStageType = {
    ...initFullStage,
    id: btDbUuid('stg'),
    squad_id: squadId,
    stage: SquadStage.DEFINE
  }
  const posted = await postFullStage(newFullStage);
  return posted;
};

/**
 * patches a justStage
 *
 * @param {string} id - id of stage to patch
 * @param {SquadStage} stage - stage value to patch
 * @returns {justStageType} - justStage object with just stage data
 * @throws {Error} - if stage data is invalid or API call fails
 */
export const patchJustStage = async (
  id: string,
  stage: SquadStage
): Promise<justStageType> => {
  if (!id || !isValidBtDbId(id, "stg") || !validStageValue(stage)) {
    throw new Error("Invalid justStage data");
  }
  let response;
  try {    
    const toBePatched = {
      id,
      stage,
    }
    // further sanatation and validation done in POST route
    const justStageJSON = JSON.stringify(toBePatched);    
    response = await axios.patch(stageUrl + id, justStageJSON, {
      withCredentials: true,
    });
  } catch (err) {
    if (err instanceof AxiosError && err.status === 422) {
      throw new Error("Invalid justStage data");
    }
    throw new Error(
      `patchJustStage failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 200 || !response.data.stage) {
    throw new Error("Error patching justStage");
  }
  const fullStage = response.data.stage;
  const patched: justStageType = {
    id: fullStage.id,
    squad_id: fullStage.squad_id,
    stage: fullStage.stage,
    stage_set_at: fullStage.stage_set_at,
    scores_started_at: fullStage.scores_started_at,
  };
  return patched;
};

/**
 * patches a justStageOverride
 * 
 * @param {string} id - id of stage to patch
 * @param {boolean} enabled - enabled value to patch
 * @param {string} reason - reason value to patch 
 * @returns {justStageOverrideType} - justStageOverride object with just stage data
 * @throws {Error} - if stage data is invalid or API call fails 
 */
export const patchJustStageOverride = async (
  id: string,
  enabled: boolean,
  reason: string
): Promise<justStageOverrideType> => {
  if (!id || !isValidBtDbId(id, "stg") || enabled == null || reason == null) {
    throw new Error("Invalid justStageOverride data");
  }
  let response;
  try {
    const toBePatched = {
      id,
      stage_override_enabled: enabled,
      stage_override_reason: enabled ? reason : "",
    }
    // further sanatation and validation done in POST route
    const justStageOverrideJSON = JSON.stringify(toBePatched);
    response = await axios.patch(
      stageUrl + id,
      justStageOverrideJSON,
      { withCredentials: true }
    );
  } catch (err) {
    if (err instanceof AxiosError && err.status === 422) {
      throw new Error("Invalid justStageOverride data");
    }
    throw new Error(
      `patchJustStageOverride failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 200 || !response.data.stage) {
    throw new Error("Error patching justStageOverride");
  }
  const fullStage = response.data.stage;
  const patched: justStageOverrideType = {
    id: fullStage.id,
    squad_id: fullStage.squad_id,
    stage_override_enabled: fullStage.stage_override_enabled,
    stage_override_at: fullStage.stage_override_at,
    stage_override_reason: fullStage.stage_override_reason,
  };
  return patched;
};

/**
 * deletes a full stage
 *
 * @param {string} stageId - id of stage to delete
 * @returns {number} - number of squads deleted
 * @throws {Error} - if stageId is invalid or API call fails
 */
export const deleteFullStage = async (stageId: string): Promise<number> => {
  if (!isValidBtDbId(stageId, "stg")) {
    throw new Error("Invalid stage id");
  }
  let response;
  try {
    response = await axios.delete(stageUrl + stageId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteFullStage failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting stage");
  }
  return response.data.count;
};
