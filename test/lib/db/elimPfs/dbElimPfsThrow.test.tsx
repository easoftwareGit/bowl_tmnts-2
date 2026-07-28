import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import {
  getAllElimPfsForElim,
  updateAllElimPfsForElim,
} from "@/lib/db/elimPfs/dbElimPfs";

jest.mock("@/lib/api/axios", () => ({
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url =
  process.env.NODE_ENV === "test" && testBaseElimPfsApi
    ? testBaseElimPfsApi
    : baseElimPfsApi;

const elimUrl = url + "/elim/";

const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const elimId = "elm_45d884582e7042bb95b4818ccdd9974c";

const manyElimPfs: elimPfType[] = [
  {
    ...initElimPf,
    id: "epf_59eac0c17bf74348b44041e97469ad76",
    elim_id: elimId,
    position: 1,
    amount: 50,
  },
  {
    ...initElimPf,
    id: "epf_0fed31aae5374e6690b6535ced1ebff5",
    elim_id: elimId,
    position: 2,
    amount: 10,
  },
];

const validElimPf: elimPfType = {
  ...manyElimPfs[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllElimPfsForElim - non standard throw cases", () => { 
    it("should throw an error when response.data.divs is missing", async () => {
      mockedPrivateApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllElimPfsForElim(elimId)).rejects.toThrow(
        "getAllElimPfsForElim failed: Error fetching elimPfs",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.get).toHaveBeenCalledWith(elimUrl + elimId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimPfsForElim(elimId)).rejects.toThrow(
        "getAllElimPfsForElim failed: Network Error",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimPfsForElim(elimId)).rejects.toThrow(
        "getAllElimPfsForElim failed: testing 123",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("updateAllElimPfsForElim - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: {},
      });

      await expect(updateAllElimPfsForElim(elimId, manyElimPfs)).rejects.toThrow(
        "updateAllElimPfsForElim failed: Error updating elimPfs for elim",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        elimUrl + elimId,
        JSON.stringify(manyElimPfs),
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllElimPfsForElim(elimId, manyElimPfs)).rejects.toThrow(
        "updateAllElimPfsForElim failed: Network Error",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(updateAllElimPfsForElim(elimId, manyElimPfs)).rejects.toThrow(
        "updateAllElimPfsForElim failed: testing 123",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

});