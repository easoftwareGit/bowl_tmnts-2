import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import type { elimPfSaveDataType, elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import {
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
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

const tmntUrl = url + "/tmnt/";

const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
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
    amount: 20,
  }
];

const validElimIds = [elimId];

const elimSaveData: elimPfSaveDataType = {
  elimPfData: manyElimPfs,
  elimIds: validElimIds,
} 

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllElimPfsForTmnt - non standard throw cases", () => { 
    it("should throw an error when response.data.elims is missing", async () => {
      mockedPrivateApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllElimPfsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: Error fetching elimPfs",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimPfsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: Network Error",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPrivateApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimPfsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: testing 123",
      );

      expect(mockedPrivateApi.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("updateAllElimPfsForTmnt - non standard throw cases", () => {
    const toSave: tmntElimPfSaveDataType = {
      elimPfData: manyElimPfs,
      elimIds: validElimIds,
      tmntId: tmntId
    }

    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: {},
      });

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        tmntUrl + tmntId,
        JSON.stringify(elimSaveData),
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Network Error",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: testing 123",
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

});