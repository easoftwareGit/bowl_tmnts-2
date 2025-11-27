import axios, { AxiosError } from "axios";
import { baseBowlsApi } from "@/lib/db/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/dbBowls";
import { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;
const oneBowlUrl = url + "/bowl/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const notFoundId = "bwl_00000000000000000000000000000000";
const testBowlName = "Test Bowl";

const bowlToPost: bowlType = {
  ...initBowl,
  bowl_name: testBowlName,
  city: "Somehwere",
  state: "CA",
  url: "https://www.google.com",
}

describe('non standard throw cases', () => {

  describe('getBowls - non standard throw cases', () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    })

    it('should throw an error when response.status !== 200', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {}
      });

      await expect(getBowls())
        .rejects
        .toThrow('Unexpected status 500 when fetching bowls');
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        url,
        { withCredentials: true }
      )
    })
    it('should throw with custom message if axios.get rejects', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getBowls())
        .rejects
        .toThrow('getBowls failed: Network Error');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it('should throw an error when axios.get rejects with non-error', async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getBowls())
        .rejects
        .toThrow('getBowls failed: testing 123');
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    })
  })

  describe('getBowl - non standard throw cases', () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    })

    it('should throw an error when response.status !== 200', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {}
      });

      await expect(getBowl(notFoundId))
        .rejects
        .toThrow('Unexpected status 500 when fetching bowl');
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        oneBowlUrl + notFoundId,
        { withCredentials: true }
      );
    })
    it('should throw with custom message if axios.get rejects', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(getBowl(notFoundId))
        .rejects
        .toThrow('getBowl failed: Network Error');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it('should throw an error when axios.get rejects with non-error', async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getBowl(notFoundId))
        .rejects
        .toThrow('getBowl failed: testing 123');
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    })
  })

  describe('postBowl - non standard throw cases', () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    })

    it('should throw an error when response.status !== 200', async () => {
      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: {}
      });

      await expect(postBowl(bowlToPost))
        .rejects
        .toThrow('Error posting bowl');
      
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(bowlToPost),
        { withCredentials: true }
      );
    })
    it('should throw with custom message if axios.post rejects', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(postBowl(bowlToPost))
        .rejects
        .toThrow('postBowl failed: Network Error');

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it('should throw an error when axios.post rejects with non-error', async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postBowl(bowlToPost))
        .rejects
        .toThrow('postBowl failed: testing 123');
      
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    })
  })

  describe('putBowl - non standard throw cases', () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    })

    it('should throw an error when response.status !== 200', async () => {
      mockedAxios.put.mockResolvedValue({
        status: 500,
        data: {}
      });

      await expect(putBowl(bowlToPost))
        .rejects
        .toThrow('Error putting bowl');
      
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        oneBowlUrl + bowlToPost.id,
        JSON.stringify(bowlToPost),
        { withCredentials: true }
      );
    })
    it('should throw with custom message if axios.put rejects', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Network Error'));

      await expect(putBowl(bowlToPost))
        .rejects
        .toThrow('putBowl failed: Network Error');

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it('should throw an error when axios.put rejects with non-error', async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putBowl(bowlToPost))
        .rejects
        .toThrow('putBowl failed: testing 123');
      
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    })
  })
})