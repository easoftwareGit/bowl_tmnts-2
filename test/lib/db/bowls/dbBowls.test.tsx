// Tests for src/lib/db/bowls/dbBowls.ts using a mocked axios instance module.
// No database or server needed.
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
import { blankBowl, initBowl } from "@/lib/db/initVals";
import type { bowlType } from "@/lib/types/types";

// Replace the axios instances with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  publicApi: { get: jest.fn() },
  privateApi: { put: jest.fn() },
}));
const mockGet = publicApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;

// same url logic as dbBowls.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;
const oneBowlUrl = url + "/bowl/";

const testBowlId = "bwl_012342f8b85942929f2584318b3d49a2";
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

// Looks like the error axios rejects with for a non-2xx response.
// AxiosError extends Error, and its message is
// "Request failed with status code <status>".
const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    code: status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    response: { status, data: {} },
  });

// what the API sends back (plain JSON, only the api fields)
const apiBowls = [
  {
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
  },
  {
    id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl_name: "Yosemite Lanes",
    city: "Modesto",
    state: "CA",
    url: "http://yosemitelanes.com",
  },
  {
    id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
    bowl_name: "Coconut Bowl",
    city: "Sparks",
    state: "NV",
    url: "https://wildisland.com/bowl",
  },
  {
    id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
    bowl_name: "Diablo Lanes",
    city: "Concord",
    state: "CA",
    url: "http://diablolanes.com",
  },
];

describe("dbBowls", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPut.mockReset();
  });

  describe("getBowls()", () => {
    it("should return all bowls data", async () => {
      mockGet.mockResolvedValue({ data: { bowls: apiBowls } });

      const bowls = await getBowls();

      expect(bowls).toHaveLength(4);
      expect(bowls).toEqual(apiBowls.map((b) => ({ ...blankBowl, ...b })));
    });

    it("should call the bowls url once with the public api", async () => {
      mockGet.mockResolvedValue({ data: { bowls: apiBowls } });

      await getBowls();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(url);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should fill missing fields with empty strings", async () => {
      mockGet.mockResolvedValue({ data: { bowls: [{ id: apiBowls[0].id }] } });

      const bowls = await getBowls();

      expect(bowls).toEqual([
        {
          ...blankBowl,
          id: apiBowls[0].id,
          bowl_name: "",
          city: "",
          state: "",
          url: "",
        },
      ]);
    });

    it("should return an empty array when there are no bowls", async () => {
      mockGet.mockResolvedValue({ data: { bowls: [] } });

      const bowls = await getBowls();

      expect(bowls).toEqual([]);
    });

    it("should throw when bowls is not an array", async () => {
      mockGet.mockResolvedValue({ data: { bowls: "not an array" } });

      await expect(getBowls()).rejects.toThrow(
        new Error("getBowls failed: Invalid bowls response")
      );
    });

    it("should throw when the response has no data", async () => {
      mockGet.mockResolvedValue({});

      await expect(getBowls()).rejects.toThrow(
        new Error("getBowls failed: Invalid bowls response")
      );
    });

    it("should throw when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getBowls()).rejects.toThrow(
        new Error("getBowls failed: Request failed with status code 500")
      );
    });
  });

  describe("upsertBowl()", () => {
    const bowlToPost: bowlType = {
      ...initBowl,
      id: testBowlId,
      bowl_name: "Test Bowl",
      city: "Somehwere",
      state: "CA",
      url: "https://www.google.com",
    };

    const bowlToPut: bowlType = {
      ...initBowl,
      id: bowlToPost.id,
      bowl_name: "Updated Bowl Name",
      city: "Updated City",
      state: "US",
      url: "https://www.updated.com",
    };

    // the API echoes back the upserted bowl
    const apiBowlFrom = (bowl: bowlType) => ({
      id: bowl.id,
      bowl_name: bowl.bowl_name,
      city: bowl.city,
      state: bowl.state,
      url: bowl.url,
    });

    it("should upsert (insert) a bowl", async () => {
      mockPut.mockResolvedValue({ data: { bowl: apiBowlFrom(bowlToPost) } });

      const upsertedBowl = await upsertBowl(bowlToPost);

      expect(upsertedBowl).toEqual({ ...blankBowl, ...apiBowlFrom(bowlToPost) });
    });

    it("should upsert (update) a bowl", async () => {
      mockPut.mockResolvedValue({ data: { bowl: apiBowlFrom(bowlToPut) } });

      const upsertedBowl = await upsertBowl(bowlToPut);

      expect(upsertedBowl).toEqual({ ...blankBowl, ...apiBowlFrom(bowlToPut) });
    });

    it("should put the bowl JSON to the one bowl url with the private api", async () => {
      mockPut.mockResolvedValue({ data: { bowl: apiBowlFrom(bowlToPut) } });

      await upsertBowl(bowlToPut);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        oneBowlUrl + bowlToPut.id,
        JSON.stringify(bowlToPut)
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should NOT upsert a bowl with invalid data", async () => {
      // the route validates the data and answers 422
      mockPut.mockRejectedValue(axiosError(422));
      const invalidBowl: bowlType = {
        ...bowlToPut,
        bowl_name: "",
      };

      await expect(upsertBowl(invalidBowl)).rejects.toThrow(
        new Error("upsertBowl failed: Request failed with status code 422")
      );
    });

    it("should throw when the response has no bowl", async () => {
      mockPut.mockResolvedValue({ data: {} });

      await expect(upsertBowl(bowlToPut)).rejects.toThrow(
        new Error("upsertBowl failed: Error upserting bowl")
      );
    });

    it("should not upsert a bowl with invalid ID", async () => {
      const invalidBowl: bowlType = {
        ...bowlToPut,
        id: "invalid",
      };

      await expect(upsertBowl(invalidBowl)).rejects.toThrow(
        new Error("Invalid bowl data")
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should not upsert a bowl with valid id, but not a bowl id", async () => {
      const invalidBowl: bowlType = {
        ...bowlToPut,
        id: userId,
      };

      await expect(upsertBowl(invalidBowl)).rejects.toThrow(
        new Error("Invalid bowl data")
      );
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should not upsert a bowl when passed null", async () => {
      await expect(upsertBowl(null as unknown as bowlType)).rejects.toThrow(
        new Error("Invalid bowl data")
      );
      expect(mockPut).not.toHaveBeenCalled();
    });
  });
});
