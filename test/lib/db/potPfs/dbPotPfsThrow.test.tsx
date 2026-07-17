import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../testApi";
import type { potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
import {
  getAllPotPfsForPot,
  updateAllPotPfsForPot,
} from "@/lib/db/potPfs/dbPotPfs";

jest.mock("@/lib/api/axios", () => ({
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url =
  process.env.NODE_ENV === "test" && testBasePotPfsApi
    ? testBasePotPfsApi
    : basePotPfsApi;

const potUrl = url + "/pot/";

const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const potId = "pot_b2a7b02d761b4f5ab5438be84f642c3b";

const manyPotPfs: potPfType[] = [
  {
    ...initPotPf,
    id: "ppf_59eac0c17bf74348b44041e97469ad76",
    pot_id: potId,
    position: 1,
    amount: 50,
  },
  {
    ...initPotPf,
    id: "ppf_0fed31aae5374e6690b6535ced1ebff5",
    pot_id: potId,
    position: 2,
    amount: 10,
  },
];

const validPotPf: potPfType = {
  ...manyPotPfs[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPotPfsForPot - non standard throw cases", () => { 
    it("should throw an error when response.data.divs is missing", async () => {
      mockedPrivateApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllPotPfsForPot(potId)).rejects.toThrow(
        "getAllPotPfsForPot failed: Error fetching potPfs",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.get).toHaveBeenCalledWith(potUrl + potId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotPfsForPot(potId)).rejects.toThrow(
        "getAllPotPfsForPot failed: Network Error",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotPfsForPot(potId)).rejects.toThrow(
        "getAllPotPfsForPot failed: testing 123",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("updateAllPotPfsForPot - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: {},
      });

      await expect(updateAllPotPfsForPot(potId, manyPotPfs)).rejects.toThrow(
        "updateAllPotPfsForPot failed: Error updating potPfs for pot",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        potUrl + potId,
        JSON.stringify(manyPotPfs),
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllPotPfsForPot(potId, manyPotPfs)).rejects.toThrow(
        "updateAllPotPfsForPot failed: Network Error",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(updateAllPotPfsForPot(potId, manyPotPfs)).rejects.toThrow(
        "updateAllPotPfsForPot failed: testing 123",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

});