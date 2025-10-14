import axios from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../testApi";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { deleteAllEventsForTmnt, deleteEvent, getAllEventsForTmnt, postEvent, postManyEvents, putEvent } from "@/lib/db/events/dbEvents";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const url = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;
const eventUrl = url + "/event/";
const manyUrl = url + "/many";  
const tmntUrl = url + "/tmnt/";

const eventId = "evt_9a58f0a486cb4e6c92ca3348702b1a63"
const tmntId = 'tmt_e134ac14c5234d708d26037ae812ac33'

const manyEvent: eventType[] = [
  {
    ...initEvent,
    id: "evt_9a58f0a486cb4e6c92ca3348702b1a63", // changed last digit to make unique
    tmnt_id: 'tmt_e134ac14c5234d708d26037ae812ac33',
    event_name: "Test 1",
    tab_title: "Test 1",
    team_size: 1,
    games: 6,
    entry_fee: '80',
    lineage: '18',
    prize_fund: '55',
    other: '2',
    expenses: '5',
    added_money: '0',    
    lpox: '80',
    sort_order: 11,
  },
  { 
    ...initEvent,
    id: "evt_cb55703a8a084acb86306e2944320e8e", // changed last digit to make unique
    tmnt_id: 'tmt_e134ac14c5234d708d26037ae812ac33',
    event_name: "Test 2",
    tab_title: "Test 2",
    team_size: 2,
    games: 6,
    entry_fee: '160',
    lineage: '36',
    prize_fund: '110',
    other: '4',
    expenses: '10',
    added_money: '0',
    lpox: '160',
    sort_order: 12,      
  } 
]

const validEvent: eventType = {
  ...manyEvent[0],
}

describe("non standard throw cases", () => { 

  describe("getAllEventsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllEventsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching events"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllEventsForTmnt(tmntId)).rejects.toThrow(
        "getAllEventsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllEventsForTmnt(tmntId)).rejects.toThrow(
        "getAllEventsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postEvent - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postEvent(validEvent)).rejects.toThrow(
        "Error posting event"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validEvent),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postEvent(validEvent)).rejects.toThrow(
        "postEvent failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postEvent(validEvent)).rejects.toThrow(
        "postEvent failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyEvents - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyEvents(manyEvent)).rejects.toThrow(
        "Error posting events"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyEvent),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyEvents(manyEvent)).rejects.toThrow(
        "postManyEvents failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyEvents(manyEvent)).rejects.toThrow(
        "postManyEvents failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putEvent - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putEvent(validEvent)).rejects.toThrow(
        "Error putting event"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        eventUrl + validEvent.id,
        JSON.stringify(validEvent),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putEvent(validEvent)).rejects.toThrow(
        "putEvent failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putEvent(validEvent)).rejects.toThrow(
        "putEvent failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteEvent - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "Error deleting event"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(eventUrl + eventId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "deleteEvent failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteEvent(eventId)).rejects.toThrow(
        "deleteEvent failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllEventsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllEventsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting events for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllEventsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllEventsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllEventsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllEventsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})