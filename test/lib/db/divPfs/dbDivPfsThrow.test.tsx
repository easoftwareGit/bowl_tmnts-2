import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import type { divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import {
  getAllDivPfsForDiv,
  updateAllDivPfsForDiv,
} from "@/lib/db/divPfs/dbDivPfs";

jest.mock("@/lib/api/axios", () => ({
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url =
  process.env.NODE_ENV === "test" && testBaseDivPfsApi
    ? testBaseDivPfsApi
    : baseDivPfsApi;

const divUrl = url + "/div/";

const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";

const manyDivPfs: divPfType[] = [
  {
    ...initDivPf,
    id: "dpf_ce55c52bd60d4943bb747590a03c9732",
    div_id: divId,
    position: 1,
    amount: 300,
  },
  {
    ...initDivPf,
    id: "dpf_ce55c52bd60d4943bb747590a03c9733",
    div_id: divId,
    position: 2,
    amount: 200,
  },
];

const validDivPf: divPfType = {
  ...manyDivPfs[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllDivPfsForDiv - non standard throw cases", () => {
    it("should throw an error when response.data.divs is missing", async () => {
      mockedPrivateApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllDivPfsForDiv(divId)).rejects.toThrow(
        "getAllDivPfsForDiv failed: Error fetching divPfs",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.get).toHaveBeenCalledWith(divUrl + divId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivPfsForDiv(divId)).rejects.toThrow(
        "getAllDivPfsForDiv failed: Network Error",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivPfsForDiv(divId)).rejects.toThrow(
        "getAllDivPfsForDiv failed: testing 123",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateAllDivPfsForDiv - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: {},
      });

      await expect(updateAllDivPfsForDiv(divId, manyDivPfs)).rejects.toThrow(
        "updateAllDivPfsForDiv failed: Error updating divPfs for div",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        divUrl + divId,
        JSON.stringify(manyDivPfs),
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllDivPfsForDiv(divId, manyDivPfs)).rejects.toThrow(
        "updateAllDivPfsForDiv failed: Network Error",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(updateAllDivPfsForDiv(divId, manyDivPfs)).rejects.toThrow(
        "updateAllDivPfsForDiv failed: testing 123",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });
});
