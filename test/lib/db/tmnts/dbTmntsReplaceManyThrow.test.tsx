import axios from "axios";
import { replaceTmntFullData, replaceTmntEntriesData } from "@/lib/db/tmnts/dbTmntsReplaceFull";
import { tmntFullType } from "@/lib/types/types";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("replaceTmntFullData - non standard throw cases", () => { 
  
  const validTmnt: tmntFullType = mockTmntFullData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw when axios.put rejects", async () => {
    mockedAxios.put.mockRejectedValue(new Error("network fail"));

    await expect(replaceTmntFullData(validTmnt))
      .rejects.toThrow("replaceTmntFullData failed: network fail");
  });

  it("should throw when response.status !== 200", async () => {
    mockedAxios.put.mockResolvedValue({ status: 500, data: {} });

    await expect(replaceTmntFullData(validTmnt))
      .rejects.toThrow("Error replacing full tmnt");
  });

  it("should throw when response.data.success !== true", async () => {
    mockedAxios.put.mockResolvedValue({ status: 200, data: { success: false } });

    await expect(replaceTmntFullData(validTmnt))
      .rejects.toThrow("Error replacing full tmnt");
  });  
})

describe("replaceTmntFullEntriesData - non standard throw cases", () => { 
  
  const validTmnt: tmntFullType = mockTmntFullData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw when axios.put rejects", async () => {
    mockedAxios.put.mockRejectedValue(new Error("network fail"));

    await expect(replaceTmntEntriesData(validTmnt))
      .rejects.toThrow("replaceTmntFullEntriesData failed: network fail");
  });

  it("should throw when response.status !== 200", async () => {
    mockedAxios.put.mockResolvedValue({ status: 500, data: {} });

    await expect(replaceTmntEntriesData(validTmnt))
      .rejects.toThrow("Error replacing full tmnt entries");
  });

  it("should throw when response.data.success !== true", async () => {
    mockedAxios.put.mockResolvedValue({ status: 200, data: { success: false } });

    await expect(replaceTmntEntriesData(validTmnt))
      .rejects.toThrow("Error replacing full tmnt entries");
  });  
})