import { publicApi, privateApi } from "@/lib/api/axios";
import { baseDivsApi } from "@/lib/api/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import type { divType } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import {
  deleteAllDivsForTmnt,
  deleteDiv,
  getAllDivsForTmnt,
  postDiv,
  postManyDivs,
  putDiv,
} from "@/lib/db/divs/dbDivs";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const url = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const tmntUrl = url + "/tmnt/";

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const divId = "div_1f42042f9ef24029a0a2d48cc276a088";
const tmntId = "tmt_e134ac14c5234d708d26037ae812ac33";

const manyDivs: divType[] = [
  {
    ...initDiv,
    id: "div_1f42042f9ef24029a0a2d48cc276a088",
    tmnt_id: tmntId,
    div_name: "Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true,
    hdcp_for: "Game",
    sort_order: 11,
  },
  {
    ...initDiv,
    id: "div_29b9225d8dd44a4eae276f8bde855728",
    tmnt_id: tmntId,
    div_name: "50+ Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true,
    hdcp_for: "Game",
    sort_order: 12,
  },
];

const validDiv: divType = {
  ...manyDivs[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllDivsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.divs is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "getAllDivsForTmnt failed: Error fetching divs"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        tmntUrl + tmntId
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "getAllDivsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "getAllDivsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postDiv - non standard throw cases", () => {
    it("should throw an error when response.data.div is missing", async () => {
      mockedPrivateApi.post.mockResolvedValue({
        data: {},
      });

      await expect(postDiv(validDiv)).rejects.toThrow(
        "postDiv failed: Error posting div"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDiv)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postDiv(manyDivs[0])).rejects.toThrow(
        "postDiv failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postDiv(manyDivs[0])).rejects.toThrow(
        "postDiv failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyDivs - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.post.mockResolvedValue({
        data: {},
      });

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "postManyDivs failed: Error posting divs"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyDivs)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "postManyDivs failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "postManyDivs failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putDiv - non standard throw cases", () => {
    it("should throw an error when response.data.div is missing", async () => {
      mockedPrivateApi.put.mockResolvedValue({
        data: {},
      });

      await expect(putDiv(validDiv)).rejects.toThrow(
        "putDiv failed: Error putting div"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        divUrl + validDiv.id,
        JSON.stringify(validDiv)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putDiv(validDiv)).rejects.toThrow(
        "putDiv failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putDiv(validDiv)).rejects.toThrow(
        "putDiv failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteDiv - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValue({
        data: {},
      });

      await expect(deleteDiv(divId)).rejects.toThrow(
        "deleteDiv failed: Error deleting div"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(divUrl + divId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteDiv(divId)).rejects.toThrow(
        "deleteDiv failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteDiv(divId)).rejects.toThrow(
        "deleteDiv failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllDivsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValue({
        data: {},
      });

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivsForTmnt failed: Error deleting divs for tmnt"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivsForTmnt failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivsForTmnt failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});