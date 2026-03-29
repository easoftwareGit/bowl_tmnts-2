import axios, { AxiosError } from "axios";
import { baseDivsApi } from "@/lib/api/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import type { divType } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import { mockDivsToPost, tmntToDelId } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { deleteAllDivsForTmnt, getAllDivsForTmnt, postDiv } from "@/lib/db/divs/dbDivs";
import { userId } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

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

const url = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;   
const oneDivUrl = url + "/div/"

const notFoundId = "div_01234567890123456789012345678901";
const notfoundTmntId = "tmt_01234567890123456789012345678901";
const nonDivId = "usr_01234567890123456789012345678901";

const div3Id = 'div_29b9225d8dd44a4eae276f8bde855729';
const tmnt2Id = 'tmt_56d916ece6b50e6293300248c6792316';

describe('Divs - API: /api/divs', () => { 

  const divToPost: divType = {
    ...initDiv,      
    id: "div_1234567890abcdef1234567890abcdef",
    tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
    div_name: "Test Div",
    hdcp_per: .9,
    hdcp_from: 220,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 1,
  }

  const testDiv: divType = {
    ...initDiv,
    id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
    div_name: "Scratch",
    hdcp_per: 0,
    hdcp_from: 230,
    int_hdcp: true, 
    hdcp_for: 'Game',
    sort_order: 1,
  }

  const blankDiv = {
    id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  }

  const deletePostedDiv = async () => {
    try {
      await axios.delete(oneDivUrl + divToPost.id, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }

  const resetDiv = async () => { 
    // make sure test div is reset in database
    const divJSON = JSON.stringify(testDiv);
    await axios.put(oneDivUrl + testDiv.id, divJSON, { withCredentials: true }); 
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedDiv();
    })

    it('should get all divs', async () => { 
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 12 rows in prisma/seed.ts
      expect(response.data.divs).toHaveLength(12);
    })

  })

  describe('GET by ID - API: API: /api/divs/div/:id', () => { 

    beforeAll(async () => {
      await deletePostedDiv();
    })

    it('should get a div by ID', async () => {
      const response = await axios.get(oneDivUrl + testDiv.id);
      const div = response.data.div;
      expect(response.status).toBe(200);
      expect(div.id).toBe(testDiv.id);
      expect(div.div_name).toBe(testDiv.div_name);
      expect(div.hdcp_per).toBe(testDiv.hdcp_per);
      expect(div.hdcp_from).toBe(testDiv.hdcp_from);      
      expect(div.int_hdcp).toBe(testDiv.int_hdcp);
      expect(div.hdcp_for).toBe(testDiv.hdcp_for);
      expect(div.sort_order).toBe(testDiv.sort_order);
    })
    it('should NOT get a div by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneDivUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a div by ID when ID is valid, but not a div ID', async () => {
      try {
        const response = await axios.get(oneDivUrl + nonDivId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a div by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneDivUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  })

  describe('GET div for a tmnt API: /api/divs/tmnt/:tmntId', () => {

    beforeAll(async () => {
      await deletePostedDiv();
    })

    it('should get all divs for a tournament', async () => { 
      // const values taken from prisma/seed.ts
      const multiDivTmntId = "tmt_56d916ece6b50e6293300248c6792316";
      const tmntDivId1 = 'div_1f42042f9ef24029a0a2d48cc276a087';
      const tmntDivId2 = 'div_29b9225d8dd44a4eae276f8bde855729';

      const multiDivUrl = url + '/tmnt/' + multiDivTmntId;
      const response = await axios.get(multiDivUrl, { withCredentials: true });
      expect(response.status).toBe(200);
      // 2 rows for tmnt in prisma/seed.ts
      expect(response.data.divs).toHaveLength(2);
      const divs: divType[] = response.data.divs;
      // query in /api/divs/tmnt GET sorts by sort_order
      expect(divs[0].id).toBe(tmntDivId1);
      expect(divs[1].id).toBe(tmntDivId2);      
    })
  
  })

  describe('POST', () => { 
  
    let createdDiv = false;

    beforeAll(async () => {
      await deletePostedDiv();
    })

    beforeEach(() => {
      createdDiv = false;
    })

    afterEach(async () => {
      if (createdDiv) {
        await deletePostedDiv();
      }
    })

    it('should create a new div', async () => { 
      const divJSON = JSON.stringify(divToPost);
      const response = await axios.post(url, divJSON, { withCredentials: true });
      expect(response.status).toBe(201);      
      createdDiv = true
      const postedDiv = response.data.div;    
      expect(postedDiv.id).toBe(divToPost.id);
      expect(postedDiv.tmnt_id).toBe(divToPost.tmnt_id);
      expect(postedDiv.div_name).toBe(divToPost.div_name);
      expect(postedDiv.hdcp_per).toBe(divToPost.hdcp_per);
      expect(postedDiv.hdcp_from).toBe(divToPost.hdcp_from);
      expect(postedDiv.int_hdcp).toBe(divToPost.int_hdcp);
      expect(postedDiv.hdcp_for).toBe(divToPost.hdcp_for);
      expect(postedDiv.sort_order).toBe(divToPost.sort_order);      
    })
    it('should create a new div with hdcp_for as "Series"', async () => { 
      const seriesDiv = {
        ...divToPost,
        hdcp_for: 'Series',
      }
      const divJSON = JSON.stringify(seriesDiv);
      const response = await axios.post(url, divJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      createdDiv = true;
      const postedDiv = response.data.div;      
      expect(postedDiv.hdcp_for).toBe(seriesDiv.hdcp_for);
    })
    it('should NOT create a new div when tmnt_id that does not exist', async () => { 
      const invalidDiv = {
        ...divToPost,
        tmnt_id: notfoundTmntId,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when tmnt_id is blank', async () => { 
      const invalidDiv = {
        ...divToPost,
        tmnt_id: "",
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when div_name is blank', async () => { 
      const invalidDiv = {
        ...divToPost,
        div_name: "",
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_per is null', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_per: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_from is null', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_from: null as any,
      } 
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when int_hdcp is null', async () => { 
      const invalidDiv = {
        ...divToPost,
        int_hdcp: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_for is blank', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_for: '',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        } 
      }
    })
    it('should NOT create a new div when sort_order is null', async () => { 
      const invalidDiv = {
        ...divToPost,
        sort_order: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when tmnt_id is invalid', async () => { 
      const invalidDiv = {
        ...divToPost,
        tmnt_id: 'invalid',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when tmnt_id is valid, but not a tmnt_id', async () => { 
      const invalidDiv = {
        ...divToPost,
        tmnt_id: nonDivId,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when div_name is too long', async () => { 
      const invalidDiv = {
        ...divToPost,
        div_name: 'a'.repeat(51),
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_per is negative', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_per: -1,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_per is too high', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_per: 2, // 200%
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_per is not a number', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_per: 'abc' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_from is negative', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_from: -1,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_from is too high', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_from: 301,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_from is not an integer', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_from: 233.3,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_from is not a number', async () => { 
      const invalidDiv = {
        ...divToPost,
        hdcp_from: 'abc' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when int_hdcp is not a boolean', async () => { 
      const invalidDiv = {
        ...divToPost,
        int_hdcp: 'true' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when hdcp_for is anything other than "Game" or "Series"', async () => {
      const invalidDiv = {
        ...divToPost,
        hdcp_for: 'invalid' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }      
    })
    it('should NOT create a new div when sort_order is too low', async () => { 
      const invalidDiv = {
        ...divToPost,
        sort_order: 0,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new div when sort_order is too high', async () => { 
      const invalidDiv = {
        ...divToPost,
        sort_order: 1234567,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })    
    it('should NOT create a new div when sort_order is not an integer', async () => { 
      const invalidDiv = {
        ...divToPost,
        sort_order: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })    
    it('should NOT create a new div when sort_order is not a number', async () => { 
      const invalidDiv = {
        ...divToPost,
        sort_order: 'abc' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })    
    it('should NOT create a new div when tmnt_id + div_name is not unique', async () => { 
      const invalidDiv = {
        ...divToPost,
        tmnt_id: tmnt2Id,
        div_name: 'Scratch',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.post(url, invalidJSON, { withCredentials: true });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        } 
      }
    })
    it('should create a new div with sanitized data', async () => { 
      const toSanitizeDiv = {
        ...divToPost,
        div_name: "    <script>" + divToPost.div_name + "</script>   ",
      }
      const divJSON = JSON.stringify(toSanitizeDiv);
      const response = await axios.post(url, divJSON, { withCredentials: true });
      expect(response.status).toBe(201);
      createdDiv = true
      const postedDiv = response.data.div;      
      expect(postedDiv.div_name).toBe('script' + divToPost.div_name + 'script');
    })

  })

  describe('PUT by ID - API: API: /api/divs/div/:id', () => { 

    const putDiv = {
      ...testDiv,
      tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      div_name: "Test Div",
      hdcp_per: .95,
      hdcp_from: 225,
      int_hdcp: false,
      hdcp_for: "Game",
      sort_order: 1
    }

    const sampleDiv = {
      ...initDiv,
      id: '',
      tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      div_name: "Test Div",
      hdcp_per: 1,
      hdcp_from: 220,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 1
    }

    let didPut = false;

    beforeAll(async () => {
      await resetDiv();
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {
        await resetDiv();
      }      
    })

    it('should update a div by ID', async () => { 
      const divJSON = JSON.stringify(putDiv);
      const response = await axios.put(oneDivUrl + testDiv.id, divJSON, {
        withCredentials: true
      });
      const div = response.data.div;
      expect(response.status).toBe(200);
      didPut = true;
      // did not update tmnt_id
      expect(div.tmnt_id).toBe(testDiv.tmnt_id);
      // all other fields updated
      expect(div.div_name).toBe(putDiv.div_name);
      expect(div.hdcp_per).toBe(putDiv.hdcp_per);
      expect(div.hdcp_from).toBe(putDiv.hdcp_from);
      expect(div.int_hdcp).toBe(putDiv.int_hdcp);
      expect(div.hdcp_for).toBe(putDiv.hdcp_for);
      expect(div.sort_order).toBe(putDiv.sort_order);
    }) 
    it('should not update a div when ID is invalid', async () => { 
      try {
        const divJSON = JSON.stringify(putDiv);
        const response = await axios.put(oneDivUrl + 'test', divJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }      
    })
    it('should NOT update a div when ID is valid, but not a div ID', async () => {
      try {
        const divJSON = JSON.stringify(putDiv);
        const response = await axios.put(oneDivUrl + nonDivId, divJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divby ID when ID is not found', async () => {
      try {
        const divJSON = JSON.stringify(putDiv);
        const response = await axios.put(oneDivUrl + notFoundId, divJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a div when div name is blank', async () => { 
      const invalidDiv = {
        ...putDiv,
        div_name: '',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when hdcp_per is blank', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_per: '',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when hdcp_from is blank', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_from: '',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when int_hdcp is null', async () => { 
      const invalidDiv = {
        ...putDiv,
        int_hdcp: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when hdcp_for is null', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_for: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when hdcp_for is blank', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_for: '',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT update a div when sort_order is null', async () => { 
      const invalidDiv = {
        ...putDiv,
        sort_order: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when div_name is too long', async () => { 
      const invalidDiv = {
        ...putDiv,
        div_name: 'a'.repeat(51),
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_per is negative', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_per: -1, 
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_per is too high', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_per: 2, // 200%
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_per is not a number', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_per: 'abc' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_from is negative', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_from: -1, 
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_from is too high', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_from: 301,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_from is not an integer', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_from: 244.4,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_from is not a number', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_from: 'abc' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when int_hdcp is not boolean', async () => { 
      const invalidDiv = {
        ...putDiv,
        int_hdcp: 'true' as any,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when hdcp_for is not "Game" or "Series"', async () => { 
      const invalidDiv = {
        ...putDiv,
        hdcp_for: 'test',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when sort order is too low', async () => { 
      const invalidDiv = {
        ...putDiv,
        sort_order: 0,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when sort order is too high', async () => { 
      const invalidDiv = {
        ...putDiv,
        sort_order: 1234567,
      } 
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when sort order is not an integer', async () => { 
      const invalidDiv = {
        ...putDiv,
        sort_order: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + testDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should NOT update a div when tmnt_id + div_name is not unique', async () => { 
      const invalidDiv = {
        ...initDiv,
        id: div3Id,
        tmnt_id: tmnt2Id,
        div_name: 'Scratch',
      }
      const invalidJSON = JSON.stringify(invalidDiv);
      try {
        const response = await axios.put(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('it should update a div with sanitized data', async () => { 
      const toSanitizeDiv = {
        ...putDiv,
        div_name: '<script>' + sampleDiv.div_name + '</script>',
      }
      const divJSON = JSON.stringify(toSanitizeDiv);
      const response = await axios.put(oneDivUrl + testDiv.id, divJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      const puttedDiv = response.data.div;
      didPut = true;
      expect(puttedDiv.div_name).toEqual('script' + sampleDiv.div_name + 'script');
    })

  })

  describe('PATCH by ID - API: /api/divs/div/:id', () => { 

    const doResetDiv = async () => {
      try {
        const divJSON = JSON.stringify(testDiv);
        await axios.put(oneDivUrl + testDiv.id, divJSON, { withCredentials: true });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }

    let didPatch = false;

    beforeAll(async () => {
      await doResetDiv();
    })
      
    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await doResetDiv();
      }
    })

    it('should patch a div_name by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        div_name: 'Patched Div Name',
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;      
      expect(patchedDiv.div_name).toEqual(patchDiv.div_name);
    })
    it('should patch a div_name by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        div_name: 'Patched Div Name',
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;      
      expect(patchedDiv.div_name).toEqual(patchDiv.div_name);
    })
    it('should return 200 when just tmnt_id is passed, tmnt_id is ignored', async () => {
      const patchDiv = {
        ...blankDiv,
        tmnt_id: tmnt2Id,
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;      
      expect(patchedDiv.tmnt_id).toEqual(blankDiv.tmnt_id);
    })
    it('should patch a hdcp_per by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        hdcp_per: .5,
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.hdcp_per).toEqual(patchDiv.hdcp_per);
    })
    it('should patch a hdcp_from by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        hdcp_from: 215,
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.hdcp_from).toEqual(patchDiv.hdcp_from);
    })
    it('should patch a int_hdcp by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        int_hdcp: false,
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.int_hdcp).toEqual(patchDiv.int_hdcp);
    })
    it('should patch hdcp_for by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        hdcp_for: 'Series',
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.hdcp_for).toEqual(patchDiv.hdcp_for);
    })
    it('should patch sort_order by ID', async () => {
      const patchDiv = {
        ...blankDiv,
        sort_order: 20,
      }
      const divJSON = JSON.stringify(patchDiv);
      const response = await axios.patch(oneDivUrl + patchDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.sort_order).toEqual(patchDiv.sort_order);
    })
    it('should NOT patch tmnt_id by ID', async () => {
      const invalidDiv = {
        ...blankDiv,
        tmnt_id: tmnt2Id,
      } 
      const divJSON = JSON.stringify(invalidDiv);
      const response = await axios.patch(oneDivUrl + invalidDiv.id, divJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      // for tmnt_id, compare to blankDiv.tmnt_id
      expect(patchedDiv.tmnt_id).toBe(blankDiv.tmnt_id);
    })
    it('should NOT patch a div when ID is invalid', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          tmnt_name: 'patched div name',
        }
        const invalidJSON = JSON.stringify(invalidDiv);    
        const response = await axios.patch(oneDivUrl + 'test', invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a div when ID is not found', async () => {
      try {
        const invalidDiv = {
          ...blankDiv,
          tmnt_name: 'patched div name',
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + notFoundId, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a div when ID is valid, but not a div ID', async () => {
      try {
        const invalidDiv = {
          ...blankDiv,
          tmnt_name: 'updated tmnt name',
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + userId, invalidJSON, {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a div when div_name is blank', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          div_name: '',
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_per is null', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_per: null as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_from is null', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_from: null as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when int_hdcp is null', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          int_hdcp: null as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when sort_order is null', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          sort_order: null as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when div_name is too long', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          div_name: 'a'.repeat(256),
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_per is negative', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_per: -1,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_per is too large', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_per: 3,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_per is not a number', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_per: 'abc' as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_from is negative', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_from: -1,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_from is too large', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_from: 301,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_from is not an integer', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_from: 233.33,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_from is not a number', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_from: 'abc' as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when int_hdcp is not a boolean', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          int_hdcp: 'true',
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when hdcp_for is not "Game" or "Series"', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          hdcp_for: "test",
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when sort_order is too low', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          sort_order: 0,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when sort_order is too high', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          sort_order: 1234567,
        } 
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should NOT patch a div when sort_order is not a number', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          sort_order: 'abc' as any,
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
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
    it('should not patch a div when tmnt_id + div_name is not unique', async () => { 
      try {
        const invalidDiv = {
          ...blankDiv,
          id: div3Id,
          tmnt_id: tmnt2Id,
          div_name: "Scratch",
        }
        const invalidJSON = JSON.stringify(invalidDiv);
        const response = await axios.patch(oneDivUrl + invalidDiv.id, invalidJSON, {
          withCredentials: true
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })      
    it('should patch a div with a sanitzed div name', async () => { 
      const patchTmnt = {
        ...blankDiv,
        div_name: "    <script>Patched</script>   ",
      }
      const divJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(oneDivUrl + blankDiv.id, divJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.div_name).toBe("scriptPatchedscript");
    })
    it('should patch a div with "Series" for hdcp_for', async () => { 
      const patchTmnt = {
        ...blankDiv,
        hdcp_for: "Series",
      }
      const divJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(oneDivUrl + blankDiv.id, divJSON, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedDiv = response.data.div;
      expect(patchedDiv.hdcp_for).toBe("Series");
    })

  })

  describe('DELETE by id - API: /api/divs/div/:id', () => {

    const toDelDiv = {
      ...initDiv,
      id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
      div_name: "Women's",
      hdcp_per: 0.9,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 4,
    }

    let didDel = false    

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      try {
        const divJSON = JSON.stringify(toDelDiv);
        await axios.post(url, divJSON, {
          withCredentials: true
        })
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a div by ID', async () => {
      const response = await axios.delete(oneDivUrl + toDelDiv.id, {
        withCredentials: true
      })
      didDel = true;
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(1);
    })
    it('should NOT delete a div by ID when ID is invalid', async () => { 
      try {
        const response = await axios.delete(oneDivUrl + 'test', {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a div by ID when ID is not found', async () => { 
      const response = await axios.delete(oneDivUrl + notFoundId, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a div by ID when ID is valid, bit not an div id', async () => { 
      try {
        const response = await axios.delete(oneDivUrl + nonDivId, {
          withCredentials: true
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

})