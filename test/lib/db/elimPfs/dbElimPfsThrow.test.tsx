import { privateApi } from "@/lib/api/axios";
import { baseElimPfsApi } from "@/lib/api/apiPaths";
import { testBaseElimPfsApi } from "../../../testApi";
import {
  getAllElimPfsForTmnt,
  updateAllElimPfsForTmnt,
} from "@/lib/db/elimPfs/dbElimPfs";
import type { elimPfType, tmntElimPfSaveDataType } from "@/lib/types/types";
import { blankElimPf, initElimPf } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPrivateGet = privateApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseElimPfsApi
  ? testBaseElimPfsApi
  : baseElimPfsApi;

const tmntUrl = url + "/tmnt/";

const pmTmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const pmElimId = "elm_45d884582e7042bb95b4818ccdd9974c";
const pmElimPf1: elimPfType = {
  ...initElimPf,
  id: "epf_59eac0c17bf74348b44041e97469ad76",
  elim_id: pmElimId,
  position: 1,
  amount: 50,
};

const toSave: tmntElimPfSaveDataType = {
  elimPfData: [pmElimPf1],
  elimIds: [pmElimId],
  tmntId: pmTmntId,
};

const emptyToSave: tmntElimPfSaveDataType = {
  elimPfData: [],
  elimIds: [pmElimId],
  tmntId: pmTmntId,
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPrivateGet.mockReset();
    mockPrivatePut.mockReset();
  });

  describe("getAllElimPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.elimPfs is missing", async () => {
      mockPrivateGet.mockResolvedValue({
        data: {},
      });

      await expect(getAllElimPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: Error fetching elimPfs"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(tmntUrl + pmTmntId);
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivateGet.mockResolvedValue({
        data: null,
      });

      await expect(getAllElimPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: Error fetching elimPfs"
      );
    });

    it("should throw with custom message if privateApi.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: Network Error"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getAllElimPfsForTmnt(pmTmntId)).rejects.toThrow(
        "getAllElimPfsForTmnt failed: testing 123"
      );
    });
  });

  describe("updateAllElimPfsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.elimPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        tmntUrl + pmTmntId,
        JSON.stringify({ elimPfData: toSave.elimPfData, elimIds: toSave.elimIds })
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: testing 123"
      );
    });

    it("should throw an error for empty elimPfs when response.data.elimPfs is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(updateAllElimPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt"
      );
    });

    it("should throw an error for empty elimPfs when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(updateAllElimPfsForTmnt(emptyToSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt"
      );
    });

    it("should throw an error when response.data.elimPfs is not an array", async () => {
      mockPrivatePut.mockResolvedValue({
        data: { elimPfs: "not an array" },
      });

      await expect(updateAllElimPfsForTmnt(toSave)).rejects.toThrow(
        "updateAllElimPfsForTmnt failed: Error updating elimPfs for tmnt"
      );
    });

    it("should map response.data.elimPfs like getAllElimPfsForTmnt", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {
          elimPfs: [
            { id: pmElimPf1.id, elim_id: pmElimId, position: "1", amount: "50" },
          ],
        },
      });

      const updated = await updateAllElimPfsForTmnt(toSave);

      expect(updated).toEqual([
        { ...blankElimPf, id: pmElimPf1.id, elim_id: pmElimId, position: 1, amount: 50 },
      ]);
    });
  });
});
