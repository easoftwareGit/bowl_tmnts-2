import axios, { AxiosError } from "axios";
import { baseBowlsApi } from "@/lib/db/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowl, getBowls, postBowl, putBowl, upsertBowl } from "@/lib/db/bowls/dbBowls";
import { initBowl } from "@/lib/db/initVals";
import { bowlType } from "@/lib/types/types";

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

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;
const oneBowlUrl = url + "/bowl/";

const testBowlId = 'bwl_012342f8b85942929f2584318b3d49a2' // not in database
const notFoundId = "bwl_00000000000000000000000000000000";
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_00000000000000000000000000000000";

describe('dbBowls', () => { 

  // data from prisma/seeds.ts
  const firstBowl = {
    ...initBowl,
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
  }

  const bowlToPost: bowlType = {
    ...initBowl,   
    id: testBowlId,
    bowl_name: "Test Bowl",
    city: "Somehwere",
    state: "CA",
    url: "https://www.google.com",
  }

  const bowlToPut = {
    ...initBowl,
    id: bowlToPost.id,
    bowl_name: "Updated Bowl Name",
    city: "Updated City",
    state: "US",
    url: "https://www.updated.com",
  }

  const deletePostedBowl = async () => { 
    const response = await axios.get(url);
    const bowls = response.data.bowls;
    const toDel = bowls.find((b: bowlType) => b.id === testBowlId);
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneBowlUrl + toDel.id
        });        
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  const resetBowl = async () => { 
    // make sure test user is reset in database
    // do not use put command, use delete and post
    const bowlJSON = JSON.stringify(bowlToPost);
    try { 
      await deletePostedBowl();
      await axios.post(url, bowlJSON, {withCredentials: true,});      
    } catch (err) { 
      // do nothing      
    }
  }

  describe('getBowls()', () => {

    const bowlsToGet: bowlType[] = [
      {
        ...initBowl,
        id: "bwl_561540bd64974da9abdd97765fdb3659",
        bowl_name: "Earl Anthony's Dublin Bowl",
        city: "Dublin",
        state: "CA",
        url: "https://www.earlanthonysdublinbowl.com",
      }, 
      {
        ...initBowl,
        id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
        bowl_name: "Yosemite Lanes",
        city: "Modesto",
        state: "CA",
        url: "http://yosemitelanes.com",
      },
      {
        ...initBowl,
        id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
        bowl_name: "Coconut Bowl",
        city: "Sparks",
        state: "NV",
        url: "https://wildisland.com/bowl",
      },
      {
        ...initBowl,
        id: "bwl_91c6f24db58349e8856fe1d919e54b9e",
        bowl_name: "Diablo Lanes",
        city: "Concord",
        state: "CA",
        url: "http://diablolanes.com",
      },
    ];

    it('should return all bowls data', async () => {      
      const bowls = await getBowls();
      expect(bowls).toHaveLength(4); // from prisma/seed.ts      
      if (!bowls) return;
      for (let i = 0; i < bowls.length; i++) {
        if (bowls[i].id === bowlsToGet[0].id) {
          expect(bowls[i].bowl_name).toBe(bowlsToGet[0].bowl_name);
          expect(bowls[i].city).toBe(bowlsToGet[0].city);
          expect(bowls[i].state).toBe(bowlsToGet[0].state);
          expect(bowls[i].url).toBe(bowlsToGet[0].url);
        } else if (bowls[i].id === bowlsToGet[1].id) {
          expect(bowls[i].bowl_name).toBe(bowlsToGet[1].bowl_name);
          expect(bowls[i].city).toBe(bowlsToGet[1].city);
          expect(bowls[i].state).toBe(bowlsToGet[1].state);
          expect(bowls[i].url).toBe(bowlsToGet[1].url);
        } else if (bowls[i].id === bowlsToGet[2].id) {
          expect(bowls[i].bowl_name).toBe(bowlsToGet[2].bowl_name);
          expect(bowls[i].city).toBe(bowlsToGet[2].city);
          expect(bowls[i].state).toBe(bowlsToGet[2].state);
          expect(bowls[i].url).toBe(bowlsToGet[2].url);
        } else if (bowls[i].id === bowlsToGet[3].id) {
          expect(bowls[i].bowl_name).toBe(bowlsToGet[3].bowl_name);
          expect(bowls[i].city).toBe(bowlsToGet[3].city);
          expect(bowls[i].state).toBe(bowlsToGet[3].state);
          expect(bowls[i].url).toBe(bowlsToGet[3].url);
        } else { 
          expect(true).toBeFalsy();
        }
      }
    });
  })

  describe('getBowl()', () => { 

    it('should get a single bowl', async () => {
      const gotBowl = await getBowl(firstBowl.id);
      expect(gotBowl).not.toBeNull();
      if (!gotBowl) return;
      expect(gotBowl.id).toBe(firstBowl.id);      
      expect(gotBowl.bowl_name).toBe(firstBowl.bowl_name);
      expect(gotBowl.city).toBe(firstBowl.city);
      expect(gotBowl.state).toBe(firstBowl.state);
      expect(gotBowl.url).toBe(firstBowl.url);
    })
    it('should not get a bowl that does not exist', async () => { 
      try { 
        await getBowl(notFoundId);        
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('getBowl failed: Request failed with status code 404');
      }
    })
    it('should throw an error when bowl id is not valid', async () => { 
      try { 
        await getBowl("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid bowl id');
      }
    })
    it('should throw an error when bowl id is valid, but not a bowl id', async () => { 
      try { 
        await getBowl(notFoundUserId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid bowl id');
      }
    })

  })

  describe('postBowl()', () => { 

    let createdBowl = false

    beforeAll(async () => { 
      await deletePostedBowl();
    })

    beforeEach(() => {
      createdBowl = false;
    })

    afterEach(async () => {
      if (createdBowl) {
        await deletePostedBowl();
      }      
    })

    it('should create a new bowl', async () => {       
      const postedBowl = await postBowl(bowlToPost); 
      expect(postedBowl).not.toBeNull();
      if (!postedBowl) return;
      createdBowl = true;
      expect(postedBowl.id).toBe(bowlToPost.id);
      expect(postedBowl.bowl_name).toBe(bowlToPost.bowl_name);
      expect(postedBowl.city).toBe(bowlToPost.city);
      expect(postedBowl.state).toBe(bowlToPost.state);
      expect(postedBowl.url).toBe(bowlToPost.url);      
    })

    it("should NOT post a bowl with invalid data", async () => {
      try { 
        const invalidTmnt = {
          ...bowlToPost,
          bowl_name: "  ",
        };
        await postBowl(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('postBowl failed: Request failed with status code 422');
      }
    });

  })

  describe('putBowl()', () => { 

    let didPut = false;

    beforeAll(async () => {
      await resetBowl();
    });

    beforeEach = () => {
      didPut = false;
    };

    afterEach(async () => {
      if (didPut) {
        await resetBowl();
      }
    });

    afterAll(async () => {
      await deletePostedBowl();
    });

    it('should update a bowl by ID', async () => {
      const puttedBowl = await putBowl(bowlToPut);
      expect(puttedBowl).not.toBeNull();
      if (!puttedBowl) return;
      didPut = true;
      expect(puttedBowl.id).toBe(bowlToPut.id);
      expect(puttedBowl.bowl_name).toBe(bowlToPut.bowl_name);
      expect(puttedBowl.city).toBe(bowlToPut.city);
      expect(puttedBowl.state).toBe(bowlToPut.state);
      expect(puttedBowl.url).toBe(bowlToPut.url);
    })
    it('should  NOT update a bowl with invalid data', async () => { 
      try { 
        const invalidTmnt = {
          ...bowlToPut,
          bowl_name: "",
        };
        await putBowl(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('putBowl failed: Request failed with status code 422');
      }
    })
  })

  describe('upsertBowl() - insert', () => {

    beforeAll(async () => {
      await deletePostedBowl();
    });

    afterAll(async () => {
      await deletePostedBowl();
    });

    it('should upsert (insert) a bowl', async () => {
      const upsertedBowl = await upsertBowl(bowlToPost);
      expect(upsertedBowl).not.toBeNull();
      if (!upsertedBowl) return;
      expect(upsertedBowl.id).toBe(bowlToPost.id);
      expect(upsertedBowl.bowl_name).toBe(bowlToPost.bowl_name);
      expect(upsertedBowl.city).toBe(bowlToPost.city);
      expect(upsertedBowl.state).toBe(bowlToPost.state);
      expect(upsertedBowl.url).toBe(bowlToPost.url);
    });
  });

  describe('upsertBowl() - update', () => {

    beforeAll(async () => {
      await resetBowl();
    });

    afterEach(async () => {
      await resetBowl();
    });

    afterAll(async () => {
      await deletePostedBowl();
    });

    it('should upsert (update) a bowl', async () => {
      const upsertedBowl = await upsertBowl(bowlToPut);
      expect(upsertedBowl).not.toBeNull();
      if (!upsertedBowl) return;
      expect(upsertedBowl.id).toBe(bowlToPut.id);
      expect(upsertedBowl.bowl_name).toBe(bowlToPut.bowl_name);
      expect(upsertedBowl.city).toBe(bowlToPut.city);
      expect(upsertedBowl.state).toBe(bowlToPut.state);
      expect(upsertedBowl.url).toBe(bowlToPut.url);
    });
    it('should NOT upsert a bowl with invalid data', async () => {
      try {
        const invalidTmnt = {
          ...bowlToPut,
          bowl_name: "",
        };
        await upsertBowl(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('upsertBowl failed: Request failed with status code 422');
      }
    });
    it('should not upsert a bowl with invalid ID', async () => {
      try {
        const invalidTmnt = {
          ...bowlToPut,
          id: "invalid",
        };
        await upsertBowl(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid bowl data');
      }
    });
    it('should not upsert a bowl with valid id, but not a bowl id', async () => {
      try {
        const invalidTmnt = {
          ...bowlToPut,
          id: userId,
        };
        await upsertBowl(invalidTmnt);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid bowl data');
      }
    })
    it('shoudl not upsert a bowl when passed null', async () => {
      try {
        await upsertBowl(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid bowl data');
      }
    });
  });

})
