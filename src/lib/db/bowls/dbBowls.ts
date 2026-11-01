import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../../test/testApi";
import type { bowlType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankBowl } from "../initVals";
import { toErrorMessage } from "../helpers";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;  

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
