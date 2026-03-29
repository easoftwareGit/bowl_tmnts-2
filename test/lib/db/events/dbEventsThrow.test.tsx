import { publicApi, privateApi } from "@/lib/api/axios";
import { baseEventsApi } from "@/lib/api/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import type { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import {
  deleteEvent,
  getAllEventsForTmnt,
  postEvent,
  putEvent,
} from "@/lib/db/events/dbEvents";

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

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const url = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;
const eventUrl = url + "/event/";

const eventId = "evt_9a58f0a486cb4e6c92ca3348702b1a63";
const tmntId = "tmt_e134ac14c5234d708d26037ae812ac33";

const manyEvent: eventType[] = [
  {
    ...initEvent,
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a63",
    tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
    event_name: "Test 1",
    tab_title: "Test 1",
    team_size: 1,
    games: 6,
    entry_fee: "80",
    lineage: "18",
    prize_fund: "55",
    other: "2",
    expenses: "5",
    added_money: "0",
    lpox: "80",
    sort_order: 11,
  },
  {
    ...initEvent,
    id: "evt_cb55703a8a084acb86306e2944320e8e",
    tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
    event_name: "Test 2",
    tab_title: "Test 2",
    team_size: 2,
    games: 6,
    entry_fee: "160",
    lineage: "36",
    prize_fund: "110",
    other: "4",
    expenses: "10",
    added_money: "0",
    lpox: "160",
    sort_order: 12,
  },
];

const validEvent: eventType = {
  ...manyEvent[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllEventsForTmnt - non standard throw cases", () => {
    it("should return empty array when response.data.events is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      const result = await getAllEventsForTmnt(tmntId);

      expect(result).toEqual([]);
      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(expect.stringContaining(tmntId));
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllEventsForTmnt(tmntId)).rejects.toThrow(
        "getAllEventsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllEventsForTmnt(tmntId)).rejects.toThrow(
        "getAllEventsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postEvent - non standard throw cases", () => {
    it("should throw an error when response.data.event is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      });

      await expect(postEvent(validEvent)).rejects.toThrow(
        "postEvent failed: Error posting event"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validEvent)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postEvent(validEvent)).rejects.toThrow(
        "postEvent failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postEvent(validEvent)).rejects.toThrow(
        "postEvent failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putEvent - non standard throw cases", () => {
    it("should throw an error when response.data.event is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      });

      await expect(putEvent(validEvent)).rejects.toThrow(
        "putEvent failed: Error putting event"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        eventUrl + validEvent.id,
        JSON.stringify(validEvent)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putEvent(validEvent)).rejects.toThrow(
        "putEvent failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putEvent(validEvent)).rejects.toThrow(
        "putEvent failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteEvent - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "deleteEvent failed: Error deleting event"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(eventUrl + eventId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "deleteEvent failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "deleteEvent failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});
