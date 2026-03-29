import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import {
  deleteBrktEntry,
  postBrktEntry,
  putBrktEntry,
} from "@/lib/db/brktEntries/dbBrktEntries";
import type { brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePost = privateApi.post as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;
const mockPrivateDelete = privateApi.delete as jest.Mock;

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;
const brktEntryUrl = `${url}/brktEntry/`;

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const brktEntryId = "ben_093a0902e01e46dbbe9f111acefc17da";

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postBrktEntry - non standard throw cases", () => {
    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: "ben_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      num_brackets: 7,
      num_refunds: 1,
      fee: "45",
      time_stamp: 1739259269537,
    };

    it("should throw an error when response.data.brktEntry is missing", async () => {
      mockPrivatePost.mockResolvedValueOnce({
        data: {},
      });

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Error posting brktEntry"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(
        url,
        JSON.stringify(validBrktEntry)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: testing 123"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBrktEntry - non standard throw cases", () => {
    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: "ben_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      num_brackets: 10,
      num_refunds: 1,
      fee: "50",
      time_stamp: 1739259269537,
    };

    it("should throw an error when response.data.brktEntry is missing", async () => {
      mockPrivatePut.mockResolvedValueOnce({
        data: {},
      });

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Error putting brktEntry"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        brktEntryUrl + validBrktEntry.id,
        JSON.stringify(validBrktEntry)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBrktEntry - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockPrivateDelete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: Error deleting brktEntry"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
      expect(mockPrivateDelete).toHaveBeenCalledWith(brktEntryUrl + brktEntryId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockPrivateDelete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: Network Error"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockPrivateDelete.mockRejectedValueOnce("testing 123");

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: testing 123"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
    });
  });
});

// import axios from "axios";
// import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
// import { testBaseBrktEntriesApi } from "../../../testApi";
// import {
//   deleteBrktEntry,
//   getAllBrktEntriesForBrkt,
//   getAllBrktEntriesForDiv,
//   getAllBrktEntriesForSquad,
//   getAllBrktEntriesForTmnt,
//   postBrktEntry,  
//   putBrktEntry,  
// } from "@/lib/db/brktEntries/dbBrktEntries";
// import type { brktEntryType } from "@/lib/types/types";
// import { initBrktEntry } from "@/lib/db/initVals";

// const url = testBaseBrktEntriesApi.startsWith("undefined")
//   ? baseBrktEntriesApi
//   : testBaseBrktEntriesApi;
// const brktEntryUrl = url + "/brktEntry/";

// jest.mock("axios");

// const mockedAxios = axios as jest.Mocked<typeof axios>;

// const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
// const squadId = "sqd_7116ce5f80164830830a7157eb093396";
// const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
// const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
// const brktEntryId = "ben_093a0902e01e46dbbe9f111acefc17da";

// describe("non standard throw cases", () => { 

//   describe('getAllBrktEntriesForTmnt - non standard throw cases', () => { 
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 200", async () => {
//       mockedAxios.get.mockResolvedValue({
//         status: 500,
//         data: {},
//       });

//       await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
//         "Unexpected status 500 when fetching brktEntries"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.get).toHaveBeenCalledWith(
//         expect.stringContaining(tmntId),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
//         "getAllBrktEntriesForTmnt failed: Network Error"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.get.mockRejectedValueOnce("testing 123");

//       await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
//         "getAllBrktEntriesForTmnt failed: testing 123"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });

//   })

//   describe('getAllBrktEntriesForDiv - non standard throw cases', () => { 
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 200", async () => {
//       mockedAxios.get.mockResolvedValue({
//         status: 500,
//         data: {},
//       });

//       await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
//         "Unexpected status 500 when fetching brktEntries"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.get).toHaveBeenCalledWith(
//         expect.stringContaining(divId),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
//         "getAllBrktEntriesForDiv failed: Network Error"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.get.mockRejectedValueOnce("testing 123");

//       await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
//         "getAllBrktEntriesForDiv failed: testing 123"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//   })

//   describe('getAllBrktEntriesForBrkt - non standard throw cases', () => {
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 200", async () => {
//       mockedAxios.get.mockResolvedValue({
//         status: 500,
//         data: {},
//       });

//       await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
//         "Unexpected status 500 when fetching brktEntries"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.get).toHaveBeenCalledWith(
//         expect.stringContaining(brktId),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
//         "getAllBrktEntriesForBrkt failed: Network Error"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.get.mockRejectedValueOnce("testing 123");

//       await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
//         "getAllBrktEntriesForBrkt failed: testing 123"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe('getAllBrktEntriesForSquad - non standard throw cases', () => {
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 200", async () => {
//       mockedAxios.get.mockResolvedValue({
//         status: 500,
//         data: {},
//       });

//       await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
//         "Unexpected status 500 when fetching brktEntries"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.get).toHaveBeenCalledWith(
//         expect.stringContaining(squadId),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
//         "getAllBrktEntriesForSquad failed: Network Error"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.get.mockRejectedValueOnce("testing 123");

//       await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
//         "getAllBrktEntriesForSquad failed: testing 123"
//       );

//       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("postBrktEntry - non standard throw cases", () => {

//     const validBrktEntry: brktEntryType = {
//       ...initBrktEntry,
//       id: 'ben_0123c6c5556e407291c4b5666b2dccd7',
//       brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
//       player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
//       num_brackets: 7,
//       num_refunds: 1,
//       fee: '45',
//       time_stamp: 1739259269537
//     }
  
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 201", async () => {
//       mockedAxios.post.mockResolvedValueOnce({
//         status: 200,
//         data: {},
//       });

//       await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
//         "Error posting brktEntry"
//       );

//       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.post).toHaveBeenCalledWith(
//         url,
//         JSON.stringify(validBrktEntry),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
//         "postBrktEntry failed: Network Error"
//       );

//       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.post.mockRejectedValueOnce("testing 123");

//       await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
//         "postBrktEntry failed: testing 123"
//       );

//       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("putBrktEntry - non standard throw cases", () => {

//     const validBrktEntry: brktEntryType = {
//       ...initBrktEntry,
//       id: 'ben_0123c6c5556e407291c4b5666b2dccd7',
//       brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
//       player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
//       num_brackets: 10,
//       num_refunds: 1,
//       fee: '50',
//       time_stamp: 1739259269537
//     }
  
//     afterEach(() => {
//       jest.restoreAllMocks();
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 201", async () => {
//       mockedAxios.put.mockResolvedValueOnce({
//         status: 200,
//         data: {},
//       });

//       await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
//         "Error putting brktEntry"
//       );

//       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.put).toHaveBeenCalledWith(
//         brktEntryUrl + validBrktEntry.id,
//         JSON.stringify(validBrktEntry),
//         { withCredentials: true }
//       );
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
//         "putBrktEntry failed: Network Error"
//       );

//       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.put.mockRejectedValueOnce("testing 123");

//       await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
//         "putBrktEntry failed: testing 123"
//       );

//       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("deleteBrktEntry - non standard throw cases", () => {
//     afterEach(() => {
//       jest.clearAllMocks();
//     });

//     it("should throw an error when response.status !== 200", async () => {
//       mockedAxios.delete.mockResolvedValueOnce({
//         status: 500,
//         data: {},
//       });

//       await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
//         "Error deleting brktEntry"
//       );

//       expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
//       expect(mockedAxios.delete).toHaveBeenCalledWith(brktEntryUrl + brktEntryId, {
//         withCredentials: true,
//       });
//     });
//     it("should throw with custom message if axios.get rejects", async () => {
//       mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
//         "deleteBrktEntry failed: Network Error"
//       );

//       expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
//     });
//     it("should throw an error when axios.get rejects with non-error", async () => {
//       mockedAxios.delete.mockRejectedValueOnce("testing 123");

//       await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
//         "deleteBrktEntry failed: testing 123"
//       );

//       expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
//     });
//   });

// })
