import axios from "axios";
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

const url = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = "div_1f42042f9ef24029a0a2d48cc276a088";
const tmntId = "tmt_e134ac14c5234d708d26037ae812ac33";

const manyDivs: divType[] = [
  {
    ...initDiv,
    id: "div_1f42042f9ef24029a0a2d48cc276a088", // changed last digit to make unique
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
    id: "div_29b9225d8dd44a4eae276f8bde855728", // changed last digit to make unique
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
} 

describe("non standard throw cases", () => {
  describe("getAllDivsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching divs"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "getAllDivsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivsForTmnt(tmntId)).rejects.toThrow(
        "getAllDivsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.post.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(postDiv(validDiv)).rejects.toThrow("Error posting div");

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDiv),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postDiv(manyDivs[0])).rejects.toThrow(
        "postDiv failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postDiv(manyDivs[0])).rejects.toThrow(
        "postDiv failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyDivs - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.post.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "Error posting divs"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyDivs),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "postManyDivs failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyDivs(manyDivs)).rejects.toThrow(
        "postManyDivs failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(putDiv(validDiv)).rejects.toThrow("Error putting div");

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        divUrl + validDiv.id,
        JSON.stringify(validDiv),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putDiv(validDiv)).rejects.toThrow(
        "putDiv failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putDiv(validDiv)).rejects.toThrow(
        "putDiv failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(deleteDiv(divId)).rejects.toThrow("Error deleting div");

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteDiv(divId)).rejects.toThrow(
        "deleteDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteDiv(divId)).rejects.toThrow(
        "deleteDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllDivsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting divs for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllDivsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });
});
