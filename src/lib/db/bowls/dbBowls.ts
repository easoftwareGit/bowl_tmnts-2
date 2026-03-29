import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../../test/testApi";
import type { bowlType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankBowl } from "../initVals";

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;

const oneBowlUrl = `${url}/bowl/`;

type ApiBowl = {
  id?: string;
  bowl_name?: string;
  city?: string;
  state?: string;
  url?: string;
};

type GetBowlsResponse = {
  bowls?: ApiBowl[];
};

type GetBowlResponse = {
  bowl?: ApiBowl;
};

type DeleteBowlResponse = {
  count?: number;
};

const toErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

const mapApiBowlToBowl = (bowl: ApiBowl): bowlType => ({
  ...blankBowl,
  id: bowl.id ?? "",
  bowl_name: bowl.bowl_name ?? "",
  city: bowl.city ?? "",
  state: bowl.state ?? "",
  url: bowl.url ?? "",
});

/**
 * get array of bowls
 *
 * @returns {bowlType[]} - array of bowls
 * @throws {Error} - if API call fails
 */
export const getBowls = async (): Promise<bowlType[]> => {
  try {
    const response = await publicApi.get<GetBowlsResponse>(url);

    if (!Array.isArray(response.data?.bowls)) {
      throw new Error("Invalid bowls response");
    }

    return response.data.bowls.map(mapApiBowlToBowl);
  } catch (err) {
    throw new Error(`getBowls failed: ${toErrorMessage(err)}`);
  }
};

/**
 * gets a single bowl
 *
 * @param {string} id - id of bowl to get
 * @returns {bowlType} - bowl from database
 * @throws {Error} - if id is invalid or if API call fails
 */
export const getBowl = async (id: string): Promise<bowlType> => {
  if (!isValidBtDbId(id, "bwl")) {
    throw new Error("Invalid bowl id");
  }

  try {
    const response = await publicApi.get<GetBowlResponse>(oneBowlUrl + id);

    if (!response.data?.bowl) {
      throw new Error("Invalid bowl response");
    }

    return mapApiBowlToBowl(response.data.bowl);
  } catch (err) {
    throw new Error(`getBowl failed: ${toErrorMessage(err)}`);
  }
};

/**
 * posts a bowl
 *
 * @param {bowlType} bowl - bowl to post
 * @returns {bowlType} - posted bowl
 * @throws {Error} - if id is invalid or if API call fails
 */
export const postBowl = async (bowl: bowlType): Promise<bowlType> => {
  if (!bowl || !isValidBtDbId(bowl.id, "bwl")) {
    throw new Error("Invalid bowl data");
  }

  try {
    const bowlJSON = JSON.stringify(bowl);
    const response = await privateApi.post<GetBowlResponse>(url, bowlJSON);

    if (!response.data?.bowl) {
      throw new Error("Error posting bowl");
    }

    return mapApiBowlToBowl(response.data.bowl);
  } catch (err) {
    throw new Error(`postBowl failed: ${toErrorMessage(err)}`);
  }
};

/**
 * puts a bowl
 *
 * @param {bowlType} bowl - bowl to update
 * @returns {bowlType} - updated bowl
 * @throws {Error} - if id is invalid or if API call fails
 */
export const putBowl = async (bowl: bowlType): Promise<bowlType> => {
  if (!bowl || !isValidBtDbId(bowl.id, "bwl")) {
    throw new Error("Invalid bowl data");
  }

  try {
    const bowlJSON = JSON.stringify(bowl);
    const response = await privateApi.put<GetBowlResponse>(
      oneBowlUrl + bowl.id,
      bowlJSON
    );

    if (!response.data?.bowl) {
      throw new Error("Error putting bowl");
    }

    return mapApiBowlToBowl(response.data.bowl);
  } catch (err) {
    throw new Error(`putBowl failed: ${toErrorMessage(err)}`);
  }
};

/**
 * upserts a bowl (updates or inserts)
 *
 * @param {bowlType} bowl - bowl to upsert
 * @returns {bowlType} - upserted bowl
 * @throws {Error} - if id is invalid or if API call fails
 */
export const upsertBowl = async (bowl: bowlType): Promise<bowlType> => {
  if (!bowl || !isValidBtDbId(bowl.id, "bwl")) {
    throw new Error("Invalid bowl data");
  }

  try {
    const bowlJSON = JSON.stringify(bowl);
    const response = await privateApi.put<GetBowlResponse>(
      oneBowlUrl + bowl.id,
      bowlJSON
    );

    if (!response.data?.bowl) {
      throw new Error("Error upserting bowl");
    }

    return mapApiBowlToBowl(response.data.bowl);
  } catch (err) {
    throw new Error(`upsertBowl failed: ${toErrorMessage(err)}`);
  }
};

/**
 * deletes a bowl
 *
 * @param {string} id - id of bowl to delete
 * @returns {number} - 1 if successful
 * @throws {Error} - if id is invalid or if API call fails
 */
export const deleteBowl = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "bwl")) {
    throw new Error("Invalid bowl data");
  }

  try {
    const response = await privateApi.delete<DeleteBowlResponse>(oneBowlUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting bowl");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(`deleteBowl failed: ${toErrorMessage(err)}`);
  }
};