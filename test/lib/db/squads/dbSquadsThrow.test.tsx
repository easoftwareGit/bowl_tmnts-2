import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../testApi";
import { squadType } from "@/lib/types/types";
import { blankSquad } from "@/lib/db/initVals";
import {
  deleteAllSquadsForEvent,
  deleteAllSquadsForTmnt,
  deleteSquad,  
  getAllOneBrktsAndSeedsForSquad,
  getAllSquadsForTmnt,
  postManySquads,
  postSquad,
  putSquad,
} from "@/lib/db/squads/dbSquads";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;
const entriesUrl = url + "/entries/";
const eventUrl = url + "/event/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const eventId = "evt_9a58f0a486cb4e6c92ca3348702b1a62";
const squadId = "sqd_3397da1adc014cf58c44e07c19914f71";
const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";

const manySquads: squadType[] = [
  {
    ...blankSquad,
    id: "sqd_20c24199328447f8bbe95c05e1b84645",
    squad_name: "Test 1",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: "2022-08-01",
    squad_time: "10:00 AM",
    games: 6,
    lane_count: 10,
    starting_lane: 11,
    sort_order: 1,
  },
  {
    ...blankSquad,
    id: "sqd_20c24199328447f8bbe95c05e1b84646",
    squad_name: "Test 2",
    event_id: "evt_bd63777a6aee43be8372e4d008c1d6d0",
    squad_date_str: "2022-08-01",
    squad_time: "03:00 PM",
    games: 6,
    lane_count: 12,
    starting_lane: 1,
    sort_order: 2,
  },
];

const validSquad: squadType = {
  ...manySquads[0],
};

describe("non standard throw cases", () => {
  describe("getAllSquadsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching squads"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "getAllSquadsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "getAllSquadsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllOneBrktsAndSeedsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching oneBrkts and seeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsAndSeedsForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsAndSeedsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsAndSeedsForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postSquad(validSquad)).rejects.toThrow(
        "Error posting squad"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validSquad),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postSquad(validSquad)).rejects.toThrow(
        "postSquad failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postSquad(validSquad)).rejects.toThrow(
        "postSquad failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManySquads - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManySquads(manySquads)).rejects.toThrow(
        "Error posting squads"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manySquads),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManySquads(manySquads)).rejects.toThrow(
        "postManySquads failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManySquads(manySquads)).rejects.toThrow(
        "postManySquads failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putSquad(validSquad)).rejects.toThrow("Error putting squad");

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        squadUrl + validSquad.id,
        JSON.stringify(validSquad),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putSquad(validSquad)).rejects.toThrow(
        "putSquad failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putSquad(validSquad)).rejects.toThrow(
        "putSquad failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "Error deleting squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "deleteSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteSquad(squadId)).rejects.toThrow(
        "deleteSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllSquadsForEvent - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllSquadsForEvent(eventId)).rejects.toThrow(
        "Error deleting squads for event"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(eventUrl + eventId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllSquadsForEvent(eventId)).rejects.toThrow(
        "deleteAllSquadsForEvent failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllSquadsForEvent(eventId)).rejects.toThrow(
        "deleteAllSquadsForEvent failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllSquadsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting squads for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllSquadsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllSquadsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllSquadsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });
});
