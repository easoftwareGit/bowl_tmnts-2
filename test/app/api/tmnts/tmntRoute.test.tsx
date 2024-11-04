import axios, { AxiosError } from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../testApi";
import { bowlType, tmntType, YearObj } from "@/lib/types/types";
import { initBowl, initTmnt } from "@/lib/db/initVals";
import { compareAsc, startOfToday } from "date-fns";
import { startOfDayFromString, todayStr } from "@/lib/dateTools";
import { btDbUuid } from "@/lib/uuid";

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed  
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar, 
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode. 

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;   
const oneTmntUrl = url + "/tmnt/"
const oneUserUrl = url + "/user/"
const yearsUrl = url + "/years/";
const allResultsUrl = url + "/results"
const resultsUrl = url + "/results/"

describe('Tmnts - API: /api/tmnts', () => { 

  const tmntId = "tmt_f4d563425ba04b7dac3a97c0a90fc2c9"; // not in database
  const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const bowlId = "bwl_561540bd64974da9abdd97765fdb3659";

  const testTmntName = "Test Tournament";

  const testTmnt: tmntType = {
    ...initTmnt,
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    start_date: startOfDayFromString('2022-10-23') as Date, 
    end_date: startOfDayFromString('2022-10-23') as Date,
  }
  const testBowl: bowlType = {
    ...initBowl,
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
  }

  const blankTmnt = {
    id: testTmnt.id,
    user_id: testTmnt.user_id,
  }

  const notFoundId = "tmt_01234567890123456789012345678901";
  const notFoundBowlId = "bwl_01234567890123456789012345678901";  
  const notFoundUserId = "usr_01234567890123456789012345678901";  
  const nonTmntId = "evt_01234567890123456789012345678901";
  
  const tmnt2Id = "tmt_56d916ece6b50e6293300248c6792316";
  const bowl2Id = 'bwl_8b4a5c35ad1247049532ff53a12def0a';
  const bowl3Id = 'bwl_ff4cd62b03f24017beea81c1d6e047e7';
  const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const user2Id = "usr_516a113083983234fc316e31fb695b85";
    
  const deletePostedTmnt = async () => { 
    const response = await axios.get(url);
    const tmnts = response.data.tmnts;
    const toDel = tmnts.find((t: tmntType) => t.tmnt_name === testTmntName);
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneTmntUrl + toDel.id          
        });        
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  const resetTmnt = async () => { 
    // make sure test tmnt is reset in database
    const tmntJSON = JSON.stringify(testTmnt);
    const response = await axios({
      method: "put",
      data: tmntJSON,
      withCredentials: true,
      url: oneTmntUrl + testTmnt.id,
    })
  }

  describe('GET', () => { 
    
    beforeAll(async () => {
      await deletePostedTmnt();
    })

    it('should get all tmnts', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 10 rows in prisma/seed.ts
      expect(response.data.tmnts).toHaveLength(10);
    })

  })

  // describe('GET tmnt by ID - API: API: /api/tmnts/tmnt/:id', () => {
    
  //   it('should get a tmnt by ID', async () => {
  //     const urlToUse = oneTmntUrl + testTmnt.id;
  //     // const urlToUse = url + '/' + testTmnt.id;
  //     const response = await axios.get(urlToUse);
  //     const tmnt = response.data.tmnt;
  //     expect(response.status).toBe(200);
  //     expect(tmnt.id).toBe(testTmnt.id);
  //     expect(tmnt.tmnt_name).toBe(testTmnt.tmnt_name);
  //     expect(tmnt.bowl_id).toBe(testTmnt.bowl_id);
  //     expect(tmnt.user_id).toBe(testTmnt.user_id);
  //     const gotStartDate = new Date(tmnt.start_date);
  //     expect(compareAsc(gotStartDate, testTmnt.start_date)).toBe(0);
  //     const gotEndDate = new Date(tmnt.start_date);
  //     expect(compareAsc(gotEndDate, testTmnt.end_date)).toBe(0);
  //     expect(tmnt.bowls).not.toBeNull();
  //     expect(tmnt.bowls.bowl_name).toBe(testBowl.bowl_name);
  //     expect(tmnt.bowls.city).toBe(testBowl.city);
  //     expect(tmnt.bowls.state).toBe(testBowl.state);
  //     expect(tmnt.bowls.url).toBe(testBowl.url);
  //   })
  //   it('should NOT get a tmnt by ID when ID is invalid', async () => {
  //     try {
  //       const response = await axios.get(oneTmntUrl + 'test');        
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT get a tmnt by ID when ID is valid, but not a tmnt ID', async () => {
  //     try {
  //       const response = await axios.get(oneTmntUrl + nonTmntId);
  //       // const response = await axios.get(url + '/' + nonTmntId);
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT get a tmnt by ID when ID is not found', async () => {
  //     try {
  //       const response = await axios.get(oneTmntUrl + notFoundId);
  //       // const response = await axios.get(url + '/' + notFoundId);
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })

  // })

  // describe('GET tmnts for user - API: API: /api/tmnts/user/:userId', () => { 

  //   it('should get all tmnts for user', async () => {
  //     const response = await axios.get(oneUserUrl + userId);
  //     expect(response.status).toBe(200);
  //     // 7 tmnt rows for user in prisma/seed.ts
  //     expect(response.data.tmnts).toHaveLength(7);
  //     const tmnts = response.data.tmnts;
  //     expect(tmnts[0].user_id).toBe(userId);
  //     expect(tmnts[6].user_id).toBe(userId);
  //     // tmnts sorted by date, newest to oldest
  //     expect(tmnts[0].id).toBe('tmt_e134ac14c5234d708d26037ae812ac33')
  //     expect(compareAsc(tmnts[0].start_date, startOfDayFromString('2025-08-19'))).toBe(0)
  //     expect(tmnts[1].id).toBe('tmt_9a34a65584f94f548f5ce3b3becbca19')
  //     expect(compareAsc(tmnts[1].start_date, startOfDayFromString('2024-01-05'))).toBe(0)
  //     expect(tmnts[2].id).toBe('tmt_fe8ac53dad0f400abe6354210a8f4cd1')
  //     expect(compareAsc(tmnts[2].start_date, startOfDayFromString('2023-12-31'))).toBe(0)
  //     expect(tmnts[3].id).toBe('tmt_718fe20f53dd4e539692c6c64f991bbe')
  //     expect(compareAsc(tmnts[3].start_date, startOfDayFromString('2023-12-20'))).toBe(0)
  //     expect(tmnts[4].id).toBe('tmt_467e51d71659d2e412cbc64a0d19ecb4')
  //     expect(compareAsc(tmnts[4].start_date, startOfDayFromString('2023-09-16'))).toBe(0)
  //     expect(tmnts[5].id).toBe('tmt_a78f073789cc0f8a9a0de8c6e273eab1')
  //     expect(compareAsc(tmnts[5].start_date, startOfDayFromString('2023-01-02'))).toBe(0)
  //     expect(tmnts[6].id).toBe('tmt_fd99387c33d9c78aba290286576ddce5')
  //     expect(compareAsc(tmnts[6].start_date, startOfDayFromString('2022-10-23'))).toBe(0)

  //     expect(tmnts[0].bowls).not.toBeNull();
  //   })
  //   it('should NOT get all tmnts for user when user_id is invalid', async () => {
  //     try {
  //       const response = await axios.get(oneUserUrl + 'test');
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT get all tmnts for user when user_id is valid, but not a user ID', async () => {
  //     try {
  //       const response = await axios.get(oneUserUrl + tmntId);
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT get all tmnts for user when user_id is not found', async () => {
  //     const response = await axios.get(oneUserUrl + notFoundUserId);
  //     expect(response.status).toBe(200);
  //     expect(response.data.tmnts).toHaveLength(0);
  //   })
  // })

  // describe('GET list of years from tmnts - API: /api/tmnts/years/year', () => { 

  //   beforeAll(async () => {
  //     // if row left over from post test, then delete it
  //     await deletePostedTmnt();
  //   })    

  //   it('should get array of years from 2023 and older API: /api/tmnts/years/yyyy', async () => {      
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: yearsUrl + '2023',
  //     });
  //     expect(response.status).toBe(200);
  //     expect(response.data.years).toHaveLength(2);
  //     const years: YearObj[] = response.data.years;
  //     // years sorted newest to oldest
  //     expect(years[0].year).toBe('2023');
  //     expect(years[1].year).toBe('2022');
  //   })
  //   it('should get array of all years from today and before API: /api/tmnts/years/yyyy', async () => {
  //     const yearStr = todayStr.substring(0, 4);
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: yearsUrl + yearStr,
  //     });
  //     expect(response.status).toBe(200);
  //     expect(response.data.years.length).toBeGreaterThanOrEqual(1)
  //     const years: YearObj[] = response.data.years;
  //     // years sorted newest to oldest
  //     for (let i = 0; i < years.length -1; i++) {
  //       expect(Number(years[i].year)).toBeGreaterThan(Number(years[i+1].year));
  //     }
  //   })
  // })

  // describe('GET all tmnt results - API: /api/tmnts/results', () => { 

  //   beforeAll(async () => {
  //     // if row left over from post test, then delete it
  //     await deletePostedTmnt();
  //   })    

  //   it('should get array of all tmnt results API: /api/tmnts/results', async () => {
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: allResultsUrl,
  //     });
  //     expect(response.status).toBe(200);
  //     // 9 rows for results in prisma/seed.ts
  //     expect(response.data.tmnts).toHaveLength(9);
  //     const tmnts = response.data.tmnts;
  //     expect(tmnts[0].bowls).not.toBeNull();      
  //   })
  //   it('should get array of tmnt results by year for 2022 API: /api/tmnts/results/yyyy', async () => {
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: resultsUrl + '2022',
  //     });
  //     expect(response.status).toBe(200);
  //     // 3 rows for results in prisma/seed.ts for 2022
  //     expect(response.data.tmnts).toHaveLength(3);
  //     const tmnts = response.data.tmnts;
  //     expect(tmnts[0].bowls).not.toBeNull();
  //   })
  //   it('should get array of tmnt results by year for 2000 API: /api/tmnts/results/yyyy', async () => {      
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: resultsUrl + '2000',
  //     });
  //     expect(response.status).toBe(200);
  //     // 0 rows for results in prisma/seed.ts for 2022
  //     expect(response.data.tmnts).toHaveLength(0);
  //   })
  // })

  // describe('GET upcoming tmnt - API: /api/tmnts/upcoming', () => { 

  //   beforeAll(async () => {
  //     // if row left over from post test, then delete it
  //     await deletePostedTmnt();
  //   })    

  //   it('should get array of upcoming tmnts API: /api/tmnts/upcoming', async () => {
  //     const upcomingUrl = url + "/upcoming";
  //     const response = await axios({
  //       method: "get",
  //       withCredentials: true,
  //       url: upcomingUrl,
  //     });
  //     expect(response.status).toBe(200);
  //     // 1 rows for upcoming in prisma/seed.ts
  //     expect(response.data.tmnts).toHaveLength(1);
  //     const tmnts = response.data.tmnts;
  //     expect(tmnts[0].bowls).not.toBeNull();
  //   }) 
  // })

  describe('POST', () => {

    const tmntToPost = {
      ...initTmnt,      
      user_id: user1Id,
      tmnt_name: "Test Tournament",
      bowl_id: bowlId,
      start_date: startOfToday(),
      end_date: startOfToday(),
    }

    let createdTmnt = false;

    beforeAll(async () => {
      await deletePostedTmnt();
    })

    beforeEach(() => {
      createdTmnt = false;
    })

    afterEach(async () => {
      if (createdTmnt) {
        await deletePostedTmnt();
      }
    })

    it('should create a new tmnt', async () => {
      const tmntJSON = JSON.stringify(tmntToPost);
      const response = await axios({
        method: "post",
        data: tmntJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      const postedTmnt = response.data.tmnt;
      createdTmnt = true
      expect(postedTmnt.id).toBe(tmntToPost.id);
      expect(postedTmnt.tmnt_name).toBe(tmntToPost.tmnt_name);
      expect(postedTmnt.user_id).toBe(tmntToPost.user_id);
      expect(postedTmnt.bowl_id).toBe(tmntToPost.bowl_id);
      // postedTmnt.start_date is a string, convert it to date for comparison
      const postedStartDate = new Date(postedTmnt.start_date);
      expect(compareAsc(postedStartDate, tmntToPost.start_date)).toBe(0);    
      // postedTmnt.end_date is a string, convert it to date for comparison
      const postedEndDate = new Date(postedTmnt.end_date);
      expect(compareAsc(postedEndDate, tmntToPost.end_date)).toBe(0);            
    })
    it('should not create a new tmnt with bowl_id that does not exist', async () => { 
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: notFoundBowlId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new tmnt with user_id that does not exist', async () => { 
      const invalidTmnt = {
        ...tmntToPost,
        user_id: notFoundUserId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing tmnt_name', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        tmnt_name: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing bowl_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing user_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: "",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date: null as any,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with missing end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date: null as any,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with non data start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date: "test",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with non data end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date: "test",
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with tmnt_name is too long', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        tmnt_name: "a".repeat(100),
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid start_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        start_date: startOfDayFromString('1800-01-01') as Date,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid end_date', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        end_date: startOfDayFromString('2300-01-01') as Date,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid bowl_id', async () => { 
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: 'invalid',        
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with valid id, but not a bowl_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        bowl_id: nonTmntId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with invalid user_id', async () => { 
      const invalidTmnt = {
        ...tmntToPost,
        user_id: 'invalid',
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new tmnt with valid id, but not a user_id', async () => {
      const invalidTmnt = {
        ...tmntToPost,
        user_id: nonTmntId,
      }
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios({
          method: "post",
          data: tmntJSON,
          withCredentials: true,
          url: url,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not create a new tmnt with duplicate id', async () => { 
      const tmntJSON = JSON.stringify(tmntToPost);
      const response = await axios({
        method: "post",
        data: tmntJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      createdTmnt = true;
      try {
        const response2 = await axios({
          method: "post",
          data: tmntJSON, 
          withCredentials: true,
          url: url,
        })
        expect(response2.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })    
    it('should create a new tmnt with sanitized data', async () => {
      const toSanitizeTmnt = {
        ...tmntToPost,
        id: btDbUuid('tmt'),
        tmnt_name: "    <script>" + tmntToPost.tmnt_name + "</script>   ",
      }
      const tmntJSON = JSON.stringify(toSanitizeTmnt);
      const response = await axios({
        method: "post",
        data: tmntJSON,
        withCredentials: true,
        url: url,
      })
      expect(response.status).toBe(201);
      const postedTmnt = response.data.tmnt;
      createdTmnt = true;
      expect(postedTmnt.id).toBe(toSanitizeTmnt.id); // use toSanitizeTmnt.id here
      expect(postedTmnt.tmnt_name).toBe(tmntToPost.tmnt_name);
      expect(compareAsc(postedTmnt.start_date, tmntToPost.start_date)).toBe(0);
      expect(compareAsc(postedTmnt.end_date, tmntToPost.end_date)).toBe(0);      
    })
    
  })

  // describe('PUT by ID - API: API: /api/tmnts/tmnt/:id', () => {

  //   const putTmnt = {
  //     ...testTmnt,
  //     tmnt_name: "Test Tournament",
  //     bowl_id: bowl2Id,
  //     user_id: user2Id,
  //     start_date: startOfDayFromString('2022-11-01') as Date,
  //     end_date: startOfDayFromString('2022-11-01') as Date,
  //   }

  //   beforeAll(async () => {
  //     await resetTmnt();
  //   })

  //   afterEach(async () => {
  //     await resetTmnt();
  //   })

  //   it('should update a tmnt by ID', async () => {
  //     const tmntJSON = JSON.stringify(putTmnt);
  //     const putResponse = await axios({
  //       method: "put",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl + testTmnt.id,
  //     })
  //     const tmnt = putResponse.data.tmnt;
  //     expect(putResponse.status).toBe(200);
  //     expect(tmnt.tmnt_name).toBe(putTmnt.tmnt_name);
  //     expect(tmnt.bowl_id).toBe(putTmnt.bowl_id);
  //     // for user_id, compare to testTmnt.user_id
  //     expect(tmnt.user_id).toBe(testTmnt.user_id);
  //     const puttedStartDate = new Date(tmnt.start_date);
  //     expect(compareAsc(puttedStartDate, putTmnt.start_date)).toBe(0);
  //     const puttedEndDate = new Date(tmnt.end_date);
  //     expect(compareAsc(tmnt.end_date, putTmnt.end_date)).toBe(0);
  //   })
  //   it('should NOT update a tmnt with when ID is invalid', async () => {
  //     try {
  //       const tmntJSON = JSON.stringify(putTmnt);
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + 'test',
  //       })
  //       expect(putResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt when ID is valid, but not a tmnt ID', async () => {
  //     try {
  //       const tmntJSON = JSON.stringify(putTmnt);
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + nonTmntId,
  //       })
  //       expect(putResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when ID is not found', async () => {
  //     try {
  //       const tmntJSON = JSON.stringify(putTmnt);
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + notFoundId,
  //       })
  //       expect(putResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID whne tmnt_name is missing', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       tmnt_name: "",
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,          
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when bowl_id is missing', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       bowl_id: "",
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when user_id is missing', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       user_id: "",
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when start_date is missing', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       start_date: null as any,
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when end_date is missing', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       end_date: null as any,
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when tmnt_name is too long', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       tmnt_name: 'a'.repeat(256),
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //     }
  //     catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when start_date is after end_date', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       start_date: startOfDayFromString('2022-11-04') as Date, 
  //       end_date: startOfDayFromString('2022-11-02') as Date,
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when bowl_id is invalid', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       bowl_id: 'test',
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when bowl_id is valid, but not a bowl ID', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       bowl_id: notFoundId, // valid tmnt ID, but not a user ID
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when bowl_id is not found', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       bowl_id: notFoundBowlId, 
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       } 
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when user_id is invalid', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       user_id: 'test',
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       } 
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when user_id is valid, but not a user ID', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       user_id: notFoundId, // valid tmnt ID, but not a user ID
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when start_date is invalid', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       start_date: startOfDayFromString('1800-11-01') as Date,
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT update a tmnt by ID when end_date is invalid', async () => {
  //     const invalidTmnt = {
  //       ...putTmnt,
  //       end_date: startOfDayFromString('2300-11-01') as Date,
  //     }
  //     const tmntJSON = JSON.stringify(invalidTmnt);
  //     try {
  //       const putResponse = await axios({
  //         method: "put",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })
  //       expect(putResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should update a tmnt by ID with sanitized data', async () => {
  //     const toSanitizeTmnt = {
  //       ...putTmnt,
  //       tmnt_name: "    <script>Sample Tournament</script>   ",
  //     }
  //     const tmntJSON = JSON.stringify(toSanitizeTmnt);
  //     const response = await axios({
  //       method: "put",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl + testTmnt.id,
  //     })
  //     expect(response.status).toBe(200);
  //     const puttedTmnt = response.data.tmnt;
  //     expect(puttedTmnt.tmnt_name).toBe('Sample Tournament');
  //   })

  // })

  // describe('PATCH by ID - API: API: /api/tmnts/tmnt/:id', () => {

  //   beforeAll(async () => {
  //     await resetTmnt();
  //   })
      
  //   afterEach(async () => {
  //     await resetTmnt();
  //   })

  //   it('should patch a tmnt tmnt_name by ID', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,
  //       tmnt_name: 'patched tmnt name',
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);
  //     const patchedTmnt = patchResponse.data.tmnt;
  //     expect(patchedTmnt.tmnt_name).toBe(patchTmnt.tmnt_name);
  //   })
  //   it('should patch a tmnt bowl_id by ID', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,
  //       bowl_id: bowl2Id,
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);    
  //     const patchedTmnt = patchResponse.data.tmnt;      
  //     expect(patchedTmnt.bowl_id).toBe(patchTmnt.bowl_id);
  //   })
  //   it('should patch a tmnt start_date by ID', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,
  //       start_date: startOfDayFromString('2022-08-22') as Date, 
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);
  //     const patchedTmnt = patchResponse.data.tmnt;
  //     const patchedStartDate = new Date(patchedTmnt.start_date);
  //     expect(compareAsc(patchedStartDate, patchTmnt.start_date)).toBe(0);
  //   })
  //   it('should patch a tmnt end_date by ID', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,        
  //       end_date: startOfDayFromString('2022-10-26') as Date, 
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);
  //     const patchedTmnt = patchResponse.data.tmnt;
  //     const patchedEndDate = new Date(patchedTmnt.end_date);
  //     expect(compareAsc(patchedEndDate, patchTmnt.end_date)).toBe(0);
  //   })
  //   it('should NOT patch a tmnt user_id by ID', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,
  //       user_id: user2Id,
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);
  //     const patchedTmnt = patchResponse.data.tmnt;
  //     // for user_id, compare to blankTmnt.user_id
  //     expect(patchedTmnt.user_id).toBe(blankTmnt.user_id);
  //   })
  //   it('should NOT patch a tmnt when ID is invalid', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         tmnt_name: 'patched tmnt name',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: url + "/" + 'test',
  //       })
  //       expect(patchResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt when ID is not found', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         tmnt_name: 'patched tmnt name',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: url + "/" + notFoundId,
  //       })
  //       expect(patchResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt when ID is valid, but not a tmnt ID', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         tmnt_name: 'patched tmnt name',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: url + "/" + nonTmntId,
  //       })
  //       expect(patchResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when tmnt_name is missing', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         tmnt_name: '',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when user_id is missing', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         user_id: '',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when bowl_id is missing', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         bowl_id: '',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when start_date is missing', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         start_date: null as any,
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when end_date is missing', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         end_date: null as any,
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when tmnt_name is too long', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         tmnt_name: 'a'.repeat(101),
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when start_date is after end_date', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,          
  //         start_date: startOfDayFromString('2022-10-26') as Date, 
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when start_date is too far in the past', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         start_date: startOfDayFromString('1800-10-24') as Date,
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when end_date is too far in the future', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         end_date: startOfDayFromString('2300-10-24') as Date,
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when bowl_id is invalid', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         bowl_id: 'invalid',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when bowl_id is valid, but not a bowl ID', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         bowl_id: notFoundId, // tmnt id
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch a tmnt by ID when bowl_id is not found', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         bowl_id: notFoundBowlId, // tmnt id
  //       } 
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when user_id is invalid', async () => { 
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         user_id: 'invalid',
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT patch a tmnt by ID when user_id is valid, bit not a user ID', async () => {
  //     try {
  //       const patchTmnt = {
  //         ...blankTmnt,
  //         user_id: notFoundId, // tmnt id
  //       }
  //       const tmntJSON = JSON.stringify(patchTmnt);
  //       const patchResponse = await axios({
  //         method: "patch",
  //         data: tmntJSON,
  //         withCredentials: true,
  //         url: oneTmntUrl  + blankTmnt.id,
  //       })
  //       expect(patchResponse.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should patch a tmnt by ID whith a sanitized tmnt_name', async () => {
  //     const patchTmnt = {
  //       ...blankTmnt,
  //       tmnt_name: "    <script>Patched Tmnt Name</script>   ",
  //     }
  //     const tmntJSON = JSON.stringify(patchTmnt);
  //     const patchResponse = await axios({
  //       method: "patch",
  //       data: tmntJSON,
  //       withCredentials: true,
  //       url: oneTmntUrl  + blankTmnt.id,
  //     })
  //     expect(patchResponse.status).toBe(200);
  //     const patchedTmnt = patchResponse.data.tmnt;
  //     expect(patchedTmnt.tmnt_name).toBe("Patched Tmnt Name");
  //   })

  // })

  // describe('DELETE by ID - API: API: /api/tmnts/tmnt/:id', () => { 

  //   const toDelTmnt = {
  //     ...initTmnt,
  //     id: "tmt_e134ac14c5234d708d26037ae812ac33",          
  //     user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  //     tmnt_name: "Gold Pin",
  //     bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
  //     start_date: startOfDayFromString('2025-08-19') as Date,
  //     end_date: startOfDayFromString('2025-08-19') as Date,
  //   }

  //   const repostTmnt = async () => {
  //     const response = await axios.get(url);
  //     const tmnts = response.data.tmnts;
  //     const found = tmnts.find((t: tmntType) => t.id === toDelTmnt.id);
  //     if (!found) {
  //       try {
  //         const tmntJSON = JSON.stringify(toDelTmnt);
  //         const response = await axios({
  //           method: 'post',
  //           data: tmntJSON,
  //           withCredentials: true,
  //           url: url
  //         })          
  //       } catch (err) {
  //         if (err instanceof AxiosError) console.log(err.message);
  //       }
  //     }  
  //   }

  //   let didDel = false

  //   beforeAll(async () => {
  //     await repostTmnt()
  //   })

  //   beforeEach(() => {
  //     didDel = false;
  //   })

  //   afterEach(async () => {
  //     if (!didDel) return;
  //     await repostTmnt()
  //   })

  //   it('should delete a tmnt by ID', async () => { 
  //     try {
  //       const delResponse = await axios({
  //         method: "delete",
  //         withCredentials: true,
  //         url: oneTmntUrl + toDelTmnt.id,
  //       })  
  //       didDel = true;
  //       expect(delResponse.status).toBe(200);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(200);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a tmnt by ID when ID is invalid', async () => {
  //     try {
  //       const delResponse = await axios({
  //         method: "delete",
  //         withCredentials: true,
  //         url: oneTmntUrl + 'test',
  //       })  
  //       expect(delResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a tmnt by ID when ID is not found', async () => {
  //     try {
  //       const delResponse = await axios({
  //         method: "delete",
  //         withCredentials: true,
  //         url: oneTmntUrl + notFoundId,
  //       })  
  //       expect(delResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a tmnt by ID when ID is valid, but not a tmnt ID', async () => { 
  //     try {
  //       const delResponse = await axios({
  //         method: "delete",
  //         withCredentials: true,
  //         url: oneTmntUrl + nonTmntId,
  //       })  
  //       expect(delResponse.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a tmnt by ID when tmnt has child rows', async () => {
  //     try {
  //       const delResponse = await axios({
  //         method: "delete",
  //         withCredentials: true,
  //         url: oneTmntUrl + testTmnt.id,
  //       })  
  //       expect(delResponse.status).toBe(409);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(409);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })

  // })

})