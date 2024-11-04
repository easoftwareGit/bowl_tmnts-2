import axios, { AxiosError } from "axios";
import { baseBowlsApi } from "@/lib/db/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/bowlsAxios";
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

const notFoundId = "bwl_00000000000000000000000000000000";
const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_00000000000000000000000000000000";

const testBowlName = "Test Bowl";

describe('bowlsAxios', () => { 

  // data from prisma/seeds.ts
  const firstBowl = {
    ...initBowl,
    id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl_name: "Earl Anthony's Dublin Bowl",
    city: "Dublin",
    state: "CA",
    url: "https://www.earlanthonysdublinbowl.com",
  }

  const deletePostedBowl = async () => { 
    const response = await axios.get(url);
    const bowls = response.data.bowls;
    const toDel = bowls.find((b: bowlType) => b.bowl_name === testBowlName);
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

  describe('getBowls()', () => {

    it('should return all bowls data', async () => {      
      const result = await getBowls();
      expect(result).toHaveLength(4); // from prisma/seed.ts      
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
      const gotBowl = await getBowl(notFoundId);
      expect(gotBowl).toBeNull();      
    })
    it('should not get a bowl when bowl id is not valid', async () => { 
      const gotBowl = await getBowl("test");
      expect(gotBowl).toBeNull();
    })
    it('should not get a bowl when bowl id is valid, but not a bowl id', async () => { 
      const gotBowl = await getBowl(user1Id);
      expect(gotBowl).toBeNull();
    })

  })

  describe('postBowl()', () => { 

    const bowlToPost: bowlType = {
      ...initBowl,      
      bowl_name: testBowlName,
      city: "Somehwere",
      state: "CA",
      url: "https://www.google.com",
    }

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
      const invalidTmnt = {
        ...bowlToPost,
        bowl_name: "  ",
      };
      const postedTmnt = await postBowl(invalidTmnt);
      expect(postedTmnt).toBeNull();
    });

  })

  describe('putBowl()', () => { 
    const bowlToPut = {
      ...initBowl,
      id: firstBowl.id,
      bowl_name: "Updated Bowl Name",
      city: "Updated City",
      state: "US",
      url: "https://www.updated.com",
    }

    const sampleBowl = {
      ...bowlToPut,
      id: '',
      bowl_name: "Test Bowl Name",
      city: "Test City",
      state: "TS",
      url: "https://www.test.com",
    }

    const doResetBowl = async () => {
      const tmntJSON = JSON.stringify(firstBowl);
      const response = await axios({
        method: "put",
        data: tmntJSON,
        withCredentials: true,
        url: oneBowlUrl + firstBowl.id,
      });
    };

    let didPut = false;

    beforeAll(async () => {
      await doResetBowl();
    });

    beforeEach = () => {
      didPut = false;
    };

    afterEach(async () => {
      if (didPut) {
        await doResetBowl();
      }
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
      const invalidTmnt = {
        ...bowlToPut,
        bowl_name: "",
      };
      const puttedTmnt = await putBowl(invalidTmnt);
      expect(puttedTmnt).toBeNull();
    })
  })

})
