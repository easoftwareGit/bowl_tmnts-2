import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/dbBowls";
import type { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePost = privateApi.post as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;
const oneBowlUrl = `${url}/bowl/`;

const notFoundId = "bwl_00000000000000000000000000000000";
const testBowlId = "bwl_012342f8b85942929f2584318b3d49a2";
const testBowlName = "Test Bowl";

const bowlToPost: bowlType = {
  ...initBowl,
  id: testBowlId,
  bowl_name: testBowlName,
  city: "Somehwere",
  state: "CA",
  url: "https://www.google.com",
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBowls - non standard throw cases", () => {
    it("should throw an error when response.data.bowls is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: Invalid bowls response"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(url);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: testing 123"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: Invalid bowl response"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(oneBowlUrl + notFoundId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: testing 123"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("postBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPrivatePost.mockResolvedValue({
        data: {},
      });

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: Error posting bowl"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(
        url,
        JSON.stringify(bowlToPost)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: testing 123"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: Error putting bowl"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        oneBowlUrl + bowlToPost.id,
        JSON.stringify(bowlToPost)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });
  });
});

// import { publicApi, privateApi } from "@/lib/api/axios";
// import { baseBowlsApi } from "@/lib/api/apiPaths";
// import { testBaseBowlsApi } from "../../../testApi";
// import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/dbBowls";
// import type { bowlType } from "@/lib/types/types";
// import { initBowl } from "@/lib/db/initVals";

// jest.mock("@/lib/api/apiPaths", () => ({
//   __esModule: true,
//   baseBowlsApi: "/bowls",
//   publicApi: {
//     get: jest.fn(),
//   },
//   privateApi: {
//     post: jest.fn(),
//     put: jest.fn(),
//   },
// }));

// const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
// const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

// const url = testBaseBowlsApi.startsWith("undefined")
//   ? baseBowlsApi
//   : testBaseBowlsApi;
// const oneBowlUrl = url + "/bowl/";

// const notFoundId = "bwl_00000000000000000000000000000000";
// const testBowlId = "bwl_012342f8b85942929f2584318b3d49a2";
// const testBowlName = "Test Bowl";

// const bowlToPost: bowlType = {
//   ...initBowl,
//   id: testBowlId,
//   bowl_name: testBowlName,
//   city: "Somehwere",
//   state: "CA",
//   url: "https://www.google.com",
// };

// describe("non standard throw cases", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("getBowls - non standard throw cases", () => {
//     it("should throw an error when response.data.bowls is missing", async () => {
//       mockedPublicApi.get.mockResolvedValue({
//         data: {},
//       } as any);

//       await expect(getBowls()).rejects.toThrow(
//         "getBowls failed: Invalid bowls response"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//       expect(mockedPublicApi.get).toHaveBeenCalledWith(url);
//     });

//     it("should throw with custom message if publicApi.get rejects", async () => {
//       mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getBowls()).rejects.toThrow(
//         "getBowls failed: Network Error"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//     });

//     it("should throw an error when publicApi.get rejects with non-error", async () => {
//       mockedPublicApi.get.mockRejectedValueOnce("testing 123");

//       await expect(getBowls()).rejects.toThrow(
//         "getBowls failed: testing 123"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("getBowl - non standard throw cases", () => {
//     it("should throw an error when response.data.bowl is missing", async () => {
//       mockedPublicApi.get.mockResolvedValue({
//         data: {},
//       } as any);

//       await expect(getBowl(notFoundId)).rejects.toThrow(
//         "getBowl failed: Invalid bowl response"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//       expect(mockedPublicApi.get).toHaveBeenCalledWith(oneBowlUrl + notFoundId);
//     });

//     it("should throw with custom message if publicApi.get rejects", async () => {
//       mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(getBowl(notFoundId)).rejects.toThrow(
//         "getBowl failed: Network Error"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//     });

//     it("should throw an error when publicApi.get rejects with non-error", async () => {
//       mockedPublicApi.get.mockRejectedValueOnce("testing 123");

//       await expect(getBowl(notFoundId)).rejects.toThrow(
//         "getBowl failed: testing 123"
//       );

//       expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("postBowl - non standard throw cases", () => {
//     it("should throw an error when response.data.bowl is missing", async () => {
//       mockedPrivateApi.post.mockResolvedValue({
//         data: {},
//       } as any);

//       await expect(postBowl(bowlToPost)).rejects.toThrow(
//         "postBowl failed: Error posting bowl"
//       );

//       expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
//       expect(mockedPrivateApi.post).toHaveBeenCalledWith(
//         url,
//         JSON.stringify(bowlToPost)
//       );
//     });

//     it("should throw with custom message if privateApi.post rejects", async () => {
//       mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(postBowl(bowlToPost)).rejects.toThrow(
//         "postBowl failed: Network Error"
//       );

//       expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
//     });

//     it("should throw an error when privateApi.post rejects with non-error", async () => {
//       mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

//       await expect(postBowl(bowlToPost)).rejects.toThrow(
//         "postBowl failed: testing 123"
//       );

//       expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("putBowl - non standard throw cases", () => {
//     it("should throw an error when response.data.bowl is missing", async () => {
//       mockedPrivateApi.put.mockResolvedValue({
//         data: {},
//       } as any);

//       await expect(putBowl(bowlToPost)).rejects.toThrow(
//         "putBowl failed: Error putting bowl"
//       );

//       expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
//       expect(mockedPrivateApi.put).toHaveBeenCalledWith(
//         oneBowlUrl + bowlToPost.id,
//         JSON.stringify(bowlToPost)
//       );
//     });

//     it("should throw with custom message if privateApi.put rejects", async () => {
//       mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

//       await expect(putBowl(bowlToPost)).rejects.toThrow(
//         "putBowl failed: Network Error"
//       );

//       expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
//     });

//     it("should throw an error when privateApi.put rejects with non-error", async () => {
//       mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

//       await expect(putBowl(bowlToPost)).rejects.toThrow(
//         "putBowl failed: testing 123"
//       );

//       expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
//     });
//   });
// });

// // import axios, { AxiosError } from "axios";
// // import { baseBowlsApi } from "@/lib/api/apiPaths";
// // import { testBaseBowlsApi } from "../../../testApi";
// // import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/dbBowls";
// // import type { bowlType } from "@/lib/types/types";
// // import { initBowl } from "@/lib/db/initVals";

// // const url = testBaseBowlsApi.startsWith("undefined")
// //   ? baseBowlsApi
// //   : testBaseBowlsApi;
// // const oneBowlUrl = url + "/bowl/";

// // jest.mock("axios");

// // const mockedAxios = axios as jest.Mocked<typeof axios>;

// // const notFoundId = "bwl_00000000000000000000000000000000";
// // const testBowlName = "Test Bowl";

// // const bowlToPost: bowlType = {
// //   ...initBowl,
// //   bowl_name: testBowlName,
// //   city: "Somehwere",
// //   state: "CA",
// //   url: "https://www.google.com",
// // }

// // describe('non standard throw cases', () => {

// //   describe('getBowls - non standard throw cases', () => {
    
// //     afterEach(() => {
// //       jest.restoreAllMocks();
// //       jest.clearAllMocks();
// //     })

// //     it('should throw an error when response.status !== 200', async () => {
// //       mockedAxios.get.mockResolvedValue({
// //         status: 500,
// //         data: {}
// //       });

// //       await expect(getBowls())
// //         .rejects
// //         .toThrow('Unexpected status 500 when fetching bowls');
      
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //       expect(mockedAxios.get).toHaveBeenCalledWith(
// //         url,
// //         { withCredentials: true }
// //       )
// //     })
// //     it('should throw with custom message if axios.get rejects', async () => {
// //       mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

// //       await expect(getBowls())
// //         .rejects
// //         .toThrow('getBowls failed: Network Error');

// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //     });
// //     it('should throw an error when axios.get rejects with non-error', async () => {
// //       mockedAxios.get.mockRejectedValueOnce("testing 123");

// //       await expect(getBowls())
// //         .rejects
// //         .toThrow('getBowls failed: testing 123');
      
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //     })
// //   })

// //   describe('getBowl - non standard throw cases', () => {
    
// //     afterEach(() => {
// //       jest.restoreAllMocks();
// //       jest.clearAllMocks();
// //     })

// //     it('should throw an error when response.status !== 200', async () => {
// //       mockedAxios.get.mockResolvedValue({
// //         status: 500,
// //         data: {}
// //       });

// //       await expect(getBowl(notFoundId))
// //         .rejects
// //         .toThrow('Unexpected status 500 when fetching bowl');
      
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //       expect(mockedAxios.get).toHaveBeenCalledWith(
// //         oneBowlUrl + notFoundId,
// //         { withCredentials: true }
// //       );
// //     })
// //     it('should throw with custom message if axios.get rejects', async () => {
// //       mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

// //       await expect(getBowl(notFoundId))
// //         .rejects
// //         .toThrow('getBowl failed: Network Error');

// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //     });
// //     it('should throw an error when axios.get rejects with non-error', async () => {
// //       mockedAxios.get.mockRejectedValueOnce("testing 123");

// //       await expect(getBowl(notFoundId))
// //         .rejects
// //         .toThrow('getBowl failed: testing 123');
      
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(1);
// //     })
// //   })

// //   describe('postBowl - non standard throw cases', () => {
    
// //     afterEach(() => {
// //       jest.restoreAllMocks();
// //       jest.clearAllMocks();
// //     })

// //     it('should throw an error when response.status !== 200', async () => {
// //       mockedAxios.post.mockResolvedValue({
// //         status: 200,
// //         data: {}
// //       });

// //       await expect(postBowl(bowlToPost))
// //         .rejects
// //         .toThrow('Error posting bowl');
      
// //       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
// //       expect(mockedAxios.post).toHaveBeenCalledWith(
// //         url,
// //         JSON.stringify(bowlToPost),
// //         { withCredentials: true }
// //       );
// //     })
// //     it('should throw with custom message if axios.post rejects', async () => {
// //       mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

// //       await expect(postBowl(bowlToPost))
// //         .rejects
// //         .toThrow('postBowl failed: Network Error');

// //       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
// //     });
// //     it('should throw an error when axios.post rejects with non-error', async () => {
// //       mockedAxios.post.mockRejectedValueOnce("testing 123");

// //       await expect(postBowl(bowlToPost))
// //         .rejects
// //         .toThrow('postBowl failed: testing 123');
      
// //       expect(mockedAxios.post).toHaveBeenCalledTimes(1);
// //     })
// //   })

// //   describe('putBowl - non standard throw cases', () => {
    
// //     afterEach(() => {
// //       jest.restoreAllMocks();
// //       jest.clearAllMocks();
// //     })

// //     it('should throw an error when response.status !== 200', async () => {
// //       mockedAxios.put.mockResolvedValue({
// //         status: 500,
// //         data: {}
// //       });

// //       await expect(putBowl(bowlToPost))
// //         .rejects
// //         .toThrow('Error putting bowl');
      
// //       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
// //       expect(mockedAxios.put).toHaveBeenCalledWith(
// //         oneBowlUrl + bowlToPost.id,
// //         JSON.stringify(bowlToPost),
// //         { withCredentials: true }
// //       );
// //     })
// //     it('should throw with custom message if axios.put rejects', async () => {
// //       mockedAxios.put.mockRejectedValueOnce(new Error('Network Error'));

// //       await expect(putBowl(bowlToPost))
// //         .rejects
// //         .toThrow('putBowl failed: Network Error');

// //       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
// //     });
// //     it('should throw an error when axios.put rejects with non-error', async () => {
// //       mockedAxios.put.mockRejectedValueOnce("testing 123");

// //       await expect(putBowl(bowlToPost))
// //         .rejects
// //         .toThrow('putBowl failed: testing 123');
      
// //       expect(mockedAxios.put).toHaveBeenCalledTimes(1);
// //     })
// //   })
// // })