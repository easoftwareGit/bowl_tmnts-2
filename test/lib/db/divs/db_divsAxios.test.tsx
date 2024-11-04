import axios, { AxiosError } from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import { divType, HdcpForTypes } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import { deleteAllTmntDivs, deleteDiv, getAllDivsForTmnt, postDiv, postManyDivs, putDiv } from "@/lib/db/divs/divsAxios";
import { mockDivsToPost } from "../../../mocks/tmnts/twoDivs/mockDivs";

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
const oneDivUrl = url + "/div/";

const notFoundId = "div_00000000000000000000000000000000";
const notFoundTmntId = "tmt_00000000000000000000000000000000"

describe("divsAxios", () => {

  describe('getAllDivsForTmnt', () => { 

    // from prisma/seeds.ts
    const divsToGet: divType[] = [
      {
        ...initDiv,
        id: "div_1f42042f9ef24029a0a2d48cc276a087",
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true, 
        hdcp_for: 'Game',
        sort_order: 1,
      },
      {
        ...initDiv,
        id: "div_29b9225d8dd44a4eae276f8bde855729",
        tmnt_id: "tmt_56d916ece6b50e6293300248c6792316",
        div_name: "50+ Scratch",
        hdcp_per: 0,
        hdcp_from: 230,
        int_hdcp: true, 
        hdcp_for: 'Game',
        sort_order: 2,
      },
    ]

    it("should get divs for tmnt", async () => { 
      const divs = await getAllDivsForTmnt(divsToGet[0].tmnt_id);
      expect(divs).toHaveLength(divsToGet.length);
      if (!divs) return;      
      for (let i = 0; i < divs.length; i++) {
        expect(divs[i].id).toBe(divsToGet[i].id);
        expect(divs[i].tmnt_id).toBe(divsToGet[i].tmnt_id);
        expect(divs[i].div_name).toBe(divsToGet[i].div_name);
        expect(divs[i].hdcp_per).toBe(divsToGet[i].hdcp_per);
        expect(divs[i].hdcp_from).toBe(divsToGet[i].hdcp_from);
        expect(divs[i].int_hdcp).toBe(divsToGet[i].int_hdcp);
        expect(divs[i].hdcp_for).toBe(divsToGet[i].hdcp_for);
        expect(divs[i].sort_order).toBe(divsToGet[i].sort_order);
      }
    })
    it("should return 0 divs for not found tmnt", async () => { 
      const divs = await getAllDivsForTmnt(notFoundTmntId);
      expect(divs).toHaveLength(0);
    })
    it('should return null if tmnt id is invalid', async () => { 
      const divs = await getAllDivsForTmnt('test');
      expect(divs).toBeNull();
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      const divs = await getAllDivsForTmnt(divsToGet[0].id);
      expect(divs).toBeNull();
    })
  })

  describe("postDiv", () => {
    const divToPost = {
      ...initDiv,
      tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
      div_name: "Test Div",
      hdcp_per: 0.8,
      hdcp_from: 230,
    };

    const deletePostedDiv = async () => {
      const response = await axios.get(url);
      const divs = response.data.divs;
      const toDel = divs.find((d: divType) => d.div_name === "Test Div");
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: oneDivUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    let createdDiv = false;

    beforeAll(async () => {
      await deletePostedDiv();
    });

    beforeEach(() => {
      createdDiv = false;
    });

    afterEach(async () => {
      if (createdDiv) {
        await deletePostedDiv();
      }
    });

    it("should post a div", async () => {
      const postedDiv = await postDiv(divToPost);
      expect(postedDiv).not.toBeNull();
      if (!postedDiv) return;
      createdDiv = true;
      expect(postedDiv.id).toBe(divToPost.id);
      expect(postedDiv.tmnt_id).toBe(divToPost.tmnt_id);
      expect(postedDiv.div_name).toBe(divToPost.div_name);
      expect(postedDiv.hdcp_per).toBe(divToPost.hdcp_per);
      expect(postedDiv.hdcp_from).toBe(divToPost.hdcp_from);
      expect(postedDiv.int_hdcp).toBe(divToPost.int_hdcp);
      expect(postedDiv.hdcp_for).toBe(divToPost.hdcp_for);
      expect(postedDiv.sort_order).toBe(divToPost.sort_order);
    });
    it("should NOT post a div with invalid data", async () => {
      const invalidDiv = {
        ...divToPost,
        hdcp_from: -1,
      };
      const postedDiv = await postDiv(invalidDiv);
      expect(postedDiv).toBeNull();
    });
  });

  describe('postManyDivs', () => { 

    let didPost = false;
    
    beforeAll(async () => {
      await deleteAllTmntDivs(mockDivsToPost[0].tmnt_id);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllTmntDivs(mockDivsToPost[0].tmnt_id);
      }
    });

    it('should post many divs', async () => { 
      const postedDivs = await postManyDivs(mockDivsToPost);
      expect(postedDivs).not.toBeNull();
      if (!postedDivs) return;
      didPost = true;
      expect(postedDivs.length).toBe(mockDivsToPost.length);
      for (let i = 0; i < mockDivsToPost.length; i++) {
        expect(postedDivs[i].id).toBe(mockDivsToPost[i].id);
        expect(postedDivs[i].tmnt_id).toBe(mockDivsToPost[i].tmnt_id);
        expect(postedDivs[i].div_name).toBe(mockDivsToPost[i].div_name);
        expect(postedDivs[i].hdcp_per).toBe(mockDivsToPost[i].hdcp_per);
        expect(postedDivs[i].hdcp_from).toBe(mockDivsToPost[i].hdcp_from);
        expect(postedDivs[i].int_hdcp).toBe(mockDivsToPost[i].int_hdcp);
        expect(postedDivs[i].hdcp_for).toBe(mockDivsToPost[i].hdcp_for);
        expect(postedDivs[i].sort_order).toBe(mockDivsToPost[i].sort_order);
      }
    })
    it('should post sanitized values', async () => {
      const toSanitzie = [
        {
          ...mockDivsToPost[0],
          div_name: "    " + mockDivsToPost[0].div_name + "  ***  ",
        }, 
        {
          ...mockDivsToPost[1],
          div_name: "<script>" + mockDivsToPost[1].div_name + "</script>",
        }
      ]
      const postedDivs = await postManyDivs(toSanitzie);
      expect(postedDivs).not.toBeNull();
      if (!postedDivs) return;
      didPost = true;
      expect(postedDivs.length).toBe(toSanitzie.length);
      expect(postedDivs[0].div_name).toBe(mockDivsToPost[0].div_name);
      expect(postedDivs[1].div_name).toBe(mockDivsToPost[1].div_name);
    })
    it('should NOT post many divs with no data', async () => {
      const postedDivs = await postManyDivs([]);
      expect(postedDivs).toBeNull();
    })
    it('should NOT post many divs with invalid data', async () => { 
      const invalidDivs = [
        {
          ...mockDivsToPost[0],
          div_name: '',
        },
        {
          ...mockDivsToPost[1],
        }
      ]
      const postedDivs = await postManyDivs(invalidDivs);
      expect(postedDivs).toBeNull();
    })
    it("should NOT post many divs when all tmnt_id's are not the same", async () => { 
      const invalidDivs = [
        {
          ...mockDivsToPost[0],
        },
        {
          ...mockDivsToPost[1],
          tmnt_id: 'tmt_00000000000000000000000000000000',
        }
      ]
      const postedDivs = await postManyDivs(invalidDivs);
      expect(postedDivs).toBeNull();
    })
    
  })

  describe('putDiv', () => {
    const divToPut = {
      ...initDiv,
      id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      div_name: "Test Div",
      hdcp_per: 0.9,
      hdcp_from: 220,
      int_hdcp: false, 
      hdcp_for: 'Series' as HdcpForTypes,
      sort_order: 1,
    }

    const putUrl = oneDivUrl + divToPut.id

    const resetDiv = {
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

    const doReset = async () => {
      try {
        const tmntJSON = JSON.stringify(resetDiv);
        const response = await axios({
          method: "put",
          data: tmntJSON,
          withCredentials: true,
          url: putUrl,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    let didPut = false;

    beforeAll(async () => {
      await doReset();
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
    if (!didPut) return;
      await doReset();
    });

    it("should put a div", async () => {
      const puttedDiv = await putDiv(divToPut); 
      expect(puttedDiv).not.toBeNull();
      if (!puttedDiv) return;
      didPut = true;
      expect(puttedDiv?.id).toEqual(divToPut.id);
      expect(puttedDiv?.tmnt_id).toEqual(divToPut.tmnt_id);
      expect(puttedDiv?.div_name).toEqual(divToPut.div_name);
      expect(puttedDiv?.hdcp_per).toEqual(divToPut.hdcp_per);
      expect(puttedDiv?.hdcp_from).toEqual(divToPut.hdcp_from);
      expect(puttedDiv?.int_hdcp).toEqual(divToPut.int_hdcp);
      expect(puttedDiv?.hdcp_for).toEqual(divToPut.hdcp_for);
      expect(puttedDiv?.sort_order).toEqual(divToPut.sort_order);
    });
    it("should NOT put a div with invalid data", async () => {
      const invalidDiv = {
        ...divToPut,
        hdcp_from: -1,
      };
      const puttedDiv = await putDiv(invalidDiv);
      expect(puttedDiv).toBeNull();
    });
  })

  describe('deleteDiv', () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initDiv,
      id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      tmnt_id: "tmt_fe8ac53dad0f400abe6354210a8f4cd1",
      div_name: "Women's",
      hdcp_per: 0.90,
      hdcp_from: 230,
      int_hdcp: true, 
      hdcp_for: 'Game',
      sort_order: 4,
    }
    
    const rePostToDel = async () => {
      const response = await axios.get(url);
      const divs = response.data.divs;
      const foundToDel = divs.find(
        (d: divType) => d.id === toDel.id
      );
      if (!foundToDel) {
        try {
          const eventJSON = JSON.stringify(toDel);
          const rePostedResponse = await axios({
            method: "post",
            data: eventJSON,
            withCredentials: true,
            url: url,
          });          
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }
    
    let didDel = false;

    beforeAll(async () => {     
      await rePostToDel();
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostToDel();
      }
    });

    it("should delete a div", async () => {
      const deleted = await deleteDiv(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should NOT delete a div when ID is not found", async () => {
      const deleted = await deleteDiv(notFoundId);
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a div when ID is invalid", async () => {
      const deleted = await deleteDiv('test');
      expect(deleted).toBe(-1);
    });
    it("should NOT delete a div when ID is valid, but to a div id", async () => {
      const deleted = await deleteDiv(toDel.tmnt_id);
    })
    it('should NOT delete a div when ID blank', async () => { 
      const deleted = await deleteDiv('');
      expect(deleted).toBe(-1);
    })
    it('should NOT delete a div when ID null', async () => { 
      const deleted = await deleteDiv(null as any);
      expect(deleted).toBe(-1);
    })
  });

  describe('deleteAllTmntDivs', () => { 

    const multiDivs = [...mockDivsToPost];

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const divs = response.data.divs;
      const foundToDel = divs.find(
        (d: divType) => d.id === multiDivs[0].id
      );
      if (!foundToDel) {
        try {
          const postedDivs: divType[] = [];
          for await (const div of multiDivs) {
            const postedDiv = await postDiv(div);
            if (!postedDiv) return 
            postedDivs.push(postedDiv); 
          }
          console.log('postedDivs: ', postedDivs.length);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }      
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      await deleteAllTmntDivs(multiDivs[0].tmnt_id);
    });

    it('should delete all divs for a tmnt', async () => { 
      const deleted = await deleteAllTmntDivs(multiDivs[0].tmnt_id);
      expect(deleted).toBe(2);
      didDel = true;
    })
    it('should NOT delete all divs for a tmnt when ID is invalid', async () => { 
      const deleted = await deleteAllTmntDivs('test');
      expect(deleted).toBe(-1);
    })
    it("should NOT delete all divs for a tmnt when ID is not found", async () => {
      const deleted = await deleteAllTmntDivs(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should NOT delete all divs for a tmnt when ID is valid, but not a tmnt id', async () => { 
      const deleted = await deleteAllTmntDivs(multiDivs[0].id); // event it
      expect(deleted).toBe(-1);
    })

  })

});
