import axios, { AxiosError } from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import { divType, HdcpForTypes } from "@/lib/types/types";
import { blankDiv, initDiv } from "@/lib/db/initVals";
import { deleteAllDivsForTmnt, deleteDiv, extractDivs, getAllDivsForTmnt, postDiv, postManyDivs, putDiv } from "@/lib/db/divs/dbDivs";
import { mockDivsToPost, mockEventToPost, mockSquads, mockBrkts, tmntToDelId } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { cloneDeep } from "lodash";
import { replaceManyDivs } from "@/lib/db/divs/dbDivsReplaceMany";
import { deleteAllSquadsForTmnt, postSquad } from "@/lib/db/squads/dbSquads";
import { deleteAllEventsForTmnt, postEvent } from "@/lib/db/events/dbEvents";
import { deleteAllBrktsForDiv, getAllBrktsForSquad, postManyBrkts } from "@/lib/db/brkts/dbBrkts";

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
const tmntId = mockDivsToPost[0].tmnt_id;
const userId = "usr_01234567890123456789012345678901";

describe("dbDivs", () => {

  describe('extractDivs', () => { 
    it("should map a single div correctly", () => {
      const rawDivs = [
        {
          id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division A",
          hdcp_per: 0.75,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 1,
          extraField: "ignore me", // should be ignored          
        },
      ];

      const result = extractDivs(rawDivs);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...blankDiv,
        id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        tmnt_id: tmntId,
        div_name: "Division A",
        tab_title: "Division A",
        hdcp_per: 0.75,
        hdcp_per_str: "75.00",
        hdcp_from: 230,
        int_hdcp: true,
        hdcp_for: "Game",
        sort_order: 1,
      });
    });
    it('should process multiple divs', () => { 
      const rawDivs = [
        {
          id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division A",
          hdcp_per: 0.75,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 1,
          extraField: "ignore me", // should be ignored          
        },
        {
          id: "div_030aea2c534f4cfe87f4315531cef8ef",
          tmnt_id: tmntId,
          div_name: "Division B",
          hdcp_per: 0,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: "Game",
          sort_order: 2,
          extraField: "ignore me", // should be ignored          
        },
      ];

      const result = extractDivs(rawDivs);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("div_f30aea2c534f4cfe87f4315531cef8ef");
      expect(result[0].div_name).toBe("Division A");
      expect(result[0].hdcp_per).toBe(0.75);      

      expect(result[1].id).toBe("div_030aea2c534f4cfe87f4315531cef8ef");
      expect(result[1].div_name).toBe("Division B");      
      expect(result[1].hdcp_per).toBe(0);
    })
    it('should return empty array when passed empty array', () => { 
      const result = extractDivs([]);
      expect(result).toEqual([]);
    })
    it('should return empty array when passed null', () => {
      const result = extractDivs(null as any);
      expect(result).toEqual([]);
    });
    it('should return empty array when passed non array', () => {
      const result = extractDivs('not an array' as any);
      expect(result).toEqual([]);
    });
  })

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
    it('should throw error when tmnt id is invalid', async () => { 
      try {
        await getAllDivsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error when tmnt id is valid but not a tmnt id', async () => { 
      try {
        await getAllDivsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should return null if tmnt id is valid, but not a tmnt id', async () => { 
      try {
        await getAllDivsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
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
    it("should post a div with sanitized data", async () => {
      const toSanitize = cloneDeep(divToPost);
      toSanitize.div_name = "    <script>Testing</script>   ";
      const postedDiv = await postDiv(toSanitize);
      expect(postedDiv).not.toBeNull();
      if (!postedDiv) return;
      createdDiv = true;
      expect(postedDiv.id).toBe(divToPost.id);
      expect(postedDiv.tmnt_id).toBe(divToPost.tmnt_id);
      expect(postedDiv.div_name).toBe("Testing");
      expect(postedDiv.hdcp_per).toBe(divToPost.hdcp_per);
      expect(postedDiv.hdcp_from).toBe(divToPost.hdcp_from);
      expect(postedDiv.int_hdcp).toBe(divToPost.int_hdcp);
      expect(postedDiv.hdcp_for).toBe(divToPost.hdcp_for);
      expect(postedDiv.sort_order).toBe(divToPost.sort_order);
    });
    it("should throw error when posting div with invalid data", async () => {
      try {
        const invalidDiv = {
          ...divToPost,
          hdcp_from: -1,
        };
        await postDiv(invalidDiv);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postDiv failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when posting div with null", async () => {
      try {
        await postDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    });
    it("should throw error when posting div with non object", async () => {
      try {
        await postDiv("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    })
  });

  describe('postManyDivs', () => { 

    let didPost = false;    

    beforeAll(async () => {
      await deleteAllDivsForTmnt(tmntId);
    });

    beforeEach(() => {
      didPost = false;
    });

    afterEach(async () => {
      if (didPost) {
        await deleteAllDivsForTmnt(tmntId);
      }
    });

    it('should post many divs', async () => { 
      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      didPost = true;
      const postedDivs = await getAllDivsForTmnt(tmntId);
      expect(postedDivs).not.toBeNull();
      if (!postedDivs) return;      
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
      const count = await postManyDivs(toSanitzie);
      expect(count).toBe(toSanitzie.length);
      didPost = true;
      const postedDivs = await getAllDivsForTmnt(mockDivsToPost[0].tmnt_id);
      expect(postedDivs).not.toBeNull();
      if (!postedDivs) return;      
      expect(postedDivs.length).toBe(toSanitzie.length);
      expect(postedDivs[0].div_name).toBe(mockDivsToPost[0].div_name);
      expect(postedDivs[1].div_name).toBe(mockDivsToPost[1].div_name);
    })
    it('should NOT post many divs with no data', async () => {
      const count = await postManyDivs([]);
      expect(count).toBe(0);
    })
    it("should return 0 when passed empty array", async () => {
      const count = await postManyDivs([]);
      expect(count).toBe(0);
    });
    it("should throw error when posting many divs when all tmnt_id's are not the same", async () => { 
      try {
        const invalidDivs = [
          {
            ...mockDivsToPost[0],
          },
          {
            ...mockDivsToPost[1],
            tmnt_id: 'tmt_00000000000000000000000000000000',
          }
        ]
        await postManyDivs(invalidDivs);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid div data at index 1"
        );
      }
    })
    it("should throw error when invalid data in first item", async () => {
      try {
        const invalidDivs = cloneDeep(mockDivsToPost);
        invalidDivs[0].hdcp_per = -1;
        await postManyDivs(invalidDivs);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid div data at index 0"
        );
      }
    });
    it("should throw error when with invalid data in second item", async () => {
      try {
        const invalidDivs = cloneDeep(mockDivsToPost);
        invalidDivs[1].hdcp_from = -1;
        await postManyDivs(invalidDivs);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "Invalid div data at index 1"
        );
      }
    });
    it('should return -1 when passed a non array', async () => {
      try {
        await postManyDivs('not an array' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    });
    it('should return -1 when passed null', async () => {
      try {
        await postManyDivs(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
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

    it("should put a div", async () => {
      const toSanitize = cloneDeep(divToPut);
      toSanitize.div_name = "  ***  Testing  ***  ";
      const puttedDiv = await putDiv(toSanitize); 
      expect(puttedDiv).not.toBeNull();
      if (!puttedDiv) return;
      didPut = true;
      expect(puttedDiv?.id).toEqual(divToPut.id);
      expect(puttedDiv?.tmnt_id).toEqual(divToPut.tmnt_id);
      expect(puttedDiv?.div_name).toEqual('Testing');
      expect(puttedDiv?.hdcp_per).toEqual(divToPut.hdcp_per);
      expect(puttedDiv?.hdcp_from).toEqual(divToPut.hdcp_from);
      expect(puttedDiv?.int_hdcp).toEqual(divToPut.int_hdcp);
      expect(puttedDiv?.hdcp_for).toEqual(divToPut.hdcp_for);
      expect(puttedDiv?.sort_order).toEqual(divToPut.sort_order);
    });
    it("should throw error when putting a div with invalid div id", async () => {
      try {
        const invalidDiv = {
          ...divToPut,
          id: 'test',
        };
        await putDiv(invalidDiv);        
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    });
    it("should throw error when putting a div with invalid data", async () => {
      try {
        const invalidDiv = {
          ...divToPut,
          hdcp_from: -1,
        };
        await putDiv(invalidDiv);        
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putDiv failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when putting a div when passed null", async () => {
      try {
        await putDiv(null as any);        
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    });
    it("should throw error when putting a div when passed non object", async () => {
      try {
        await putDiv('non object' as any);        
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div data");
      }
    });

  })

  describe("replaceManyDivs()", () => {
    const rmTmntId = mockDivsToPost[0].tmnt_id;    
    let createdDivs = false;
    
    beforeAll(async () => {
      await deleteAllDivsForTmnt(rmTmntId);
    });

    beforeEach(() => {
      createdDivs = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdDivs) {
        await deleteAllDivsForTmnt(rmTmntId);
      }
    });

    it("should update, insert, delete many players", async () => {      

      const toInsert: divType[] = [
        {
          ...mockDivsToPost[0],
          id: "div_1f42042f9ef24029a0a2d48cc276a08a", // changed last digit to make unique
          div_name: "Handicap",
          hdcp_per: .90,
          hdcp_from: 230,
          int_hdcp: true, 
          hdcp_for: 'Game',
          sort_order: 20,
        },
      ];

      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      createdDivs = true;
      const divs = await getAllDivsForTmnt(rmTmntId);
      if (!divs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divs.length).toEqual(mockDivsToPost.length);

      const divsToUpdate = [
        {
          ...mockDivsToPost[0],
          hdcpFrom: 200,
        },
        {
          ...toInsert[0],
        },
      ];

      const replaceCount = await replaceManyDivs(divsToUpdate, rmTmntId);
      expect(replaceCount).toBe(divsToUpdate.length);
      const replacedDivs = await getAllDivsForTmnt(rmTmntId);
      if (!replacedDivs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedDivs.length).toEqual(divsToUpdate.length);
      for (let i = 0; i < replacedDivs.length; i++) {
        if (replacedDivs[i].id === divsToUpdate[0].id) {
          expect(replacedDivs[i].tmnt_id).toEqual(divsToUpdate[0].tmnt_id);
          expect(replacedDivs[i].div_name).toEqual(divsToUpdate[0].div_name);
          expect(replacedDivs[i].hdcp_per).toEqual(divsToUpdate[0].hdcp_per);
          expect(replacedDivs[i].hdcp_from).toEqual(divsToUpdate[0].hdcp_from);
          expect(replacedDivs[i].int_hdcp).toEqual(divsToUpdate[0].int_hdcp);
          expect(replacedDivs[i].hdcp_for).toEqual(divsToUpdate[0].hdcp_for);
          expect(replacedDivs[i].sort_order).toEqual(divsToUpdate[0].sort_order);
        } else if (replacedDivs[i].id === divsToUpdate[1].id) {
          expect(replacedDivs[i].tmnt_id).toEqual(divsToUpdate[1].tmnt_id);
          expect(replacedDivs[i].div_name).toEqual(divsToUpdate[1].div_name);
          expect(replacedDivs[i].hdcp_per).toEqual(divsToUpdate[1].hdcp_per);
          expect(replacedDivs[i].hdcp_from).toEqual(divsToUpdate[1].hdcp_from);
          expect(replacedDivs[i].int_hdcp).toEqual(divsToUpdate[1].int_hdcp);
          expect(replacedDivs[i].hdcp_for).toEqual(divsToUpdate[1].hdcp_for);
          expect(replacedDivs[i].sort_order).toEqual(divsToUpdate[1].sort_order);
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many divs - sanitized div names", async () => {
      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      createdDivs = true;
      const divs = await getAllDivsForTmnt(rmTmntId);      
      if (!divs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divs.length).toEqual(mockDivsToPost.length);

      const divsToUpdate = [
        {
          ...mockDivsToPost[0],
          div_name: "<script>alert(1)</script>",          
        },
        {
          ...mockDivsToPost[1],
          div_name: "    abcdef***",
        },
      ];

      const replaceCount = await replaceManyDivs(divsToUpdate, rmTmntId);
      expect(replaceCount).toBe(divsToUpdate.length);
      const replacedDivs = await getAllDivsForTmnt(rmTmntId);
      if (!replacedDivs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedDivs.length).toEqual(divsToUpdate.length);
      for (let i = 0; i < replacedDivs.length; i++) {
        if (replacedDivs[i].id === divsToUpdate[0].id) {
          expect(replacedDivs[i].tmnt_id).toEqual(divsToUpdate[0].tmnt_id);
          expect(replacedDivs[i].div_name).toEqual('alert1');
          expect(replacedDivs[i].hdcp_per).toEqual(divsToUpdate[0].hdcp_per);
          expect(replacedDivs[i].hdcp_from).toEqual(divsToUpdate[0].hdcp_from);
          expect(replacedDivs[i].int_hdcp).toEqual(divsToUpdate[0].int_hdcp);
          expect(replacedDivs[i].hdcp_for).toEqual(divsToUpdate[0].hdcp_for);
          expect(replacedDivs[i].sort_order).toEqual(divsToUpdate[0].sort_order);
        } else if (replacedDivs[i].id === divsToUpdate[1].id) {
          expect(replacedDivs[i].tmnt_id).toEqual(divsToUpdate[1].tmnt_id);
          expect(replacedDivs[i].div_name).toEqual('abcdef');
          expect(replacedDivs[i].hdcp_per).toEqual(divsToUpdate[1].hdcp_per);
          expect(replacedDivs[i].hdcp_from).toEqual(divsToUpdate[1].hdcp_from);
          expect(replacedDivs[i].int_hdcp).toEqual(divsToUpdate[1].int_hdcp);
          expect(replacedDivs[i].hdcp_for).toEqual(divsToUpdate[1].hdcp_for);
          expect(replacedDivs[i].sort_order).toEqual(divsToUpdate[1].sort_order);
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      createdDivs = true;
      const divs = await getAllDivsForTmnt(rmTmntId);      
      if (!divs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divs.length).toEqual(mockDivsToPost.length);

      const replaceCount = await replaceManyDivs([], rmTmntId);
      expect(replaceCount).toBe(0);
      const replacedDivs = await getAllDivsForTmnt(rmTmntId);
      if (!replacedDivs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedDivs.length).toEqual(0);
    });
    it("should throw an error for invalid div data in first item", async () => {
      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      createdDivs = true;
      const divs = await getAllDivsForTmnt(rmTmntId);      
      if (!divs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divs.length).toEqual(mockDivsToPost.length);

      const divsToUpdate = [
        {
          ...mockDivsToPost[0],
          id: "",
        },
        {
          ...mockDivsToPost[1],
        },
      ];
      await expect(replaceManyDivs(divsToUpdate, rmTmntId)).rejects.toThrow(
        "Invalid div data at index 0"
      );
    });
    it("should throw an error for invalid div data in second item", async () => {
      const count = await postManyDivs(mockDivsToPost);
      expect(count).toBe(mockDivsToPost.length);
      createdDivs = true;
      const divs = await getAllDivsForTmnt(rmTmntId);      
      if (!divs) {
        expect(true).toBeFalsy();
        return;
      }
      expect(divs.length).toEqual(mockDivsToPost.length);

      const divsToUpdate = [
        {
          ...mockDivsToPost[0],          
        },
        {
          ...mockDivsToPost[1],
          hdcp_per: -1,
        },
      ];
      await expect(replaceManyDivs(divsToUpdate, rmTmntId)).rejects.toThrow(
        "Invalid div data at index 1"
      );
    });
    it("should throw an error if passed null as players", async () => {
      await expect(replaceManyDivs(null as any, rmTmntId)).rejects.toThrow(
        "Invalid divs"
      );
    });
    it("should throw an error if players is not an array", async () => {
      await expect(replaceManyDivs("not-an-array" as any, rmTmntId)).rejects.toThrow(
        "Invalid divs"
      );
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(replaceManyDivs(mockDivsToPost, null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyDivs(mockDivsToPost, 'test')).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(replaceManyDivs(mockDivsToPost, userId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });    
  });

  describe('deleteDiv', () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initDiv,
      id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
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
          const divJSON = JSON.stringify(toDel);
          const rePostedResponse = await axios({
            method: "post",
            data: divJSON,
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
    it("should throw error when delete a div when ID is not found", async () => {
      try { 
        await deleteDiv(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteDiv failed: Request failed with status code 404"
        );
      }
    });    
    it("should throw error when delete a div when ID is invalid", async () => {
      try { 
        await deleteDiv('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
    it("should throw error when delete a div when ID is valid, but to a div id", async () => {
      try { 
        await deleteDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
    it('should throw error when delete a div when ID null', async () => { 
      try { 
        await deleteDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    })
  });

  describe('deleteAllDivsForTmnt', () => { 

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
      await deleteAllDivsForTmnt(multiDivs[0].tmnt_id);
    });

    it('should delete all divs for a tmnt', async () => { 
      const deleted = await deleteAllDivsForTmnt(multiDivs[0].tmnt_id);
      expect(deleted).toBe(2);
      didDel = true;
    })
    it("should NOT delete all divs for a tmnt when ID is not found", async () => {
      const deleted = await deleteAllDivsForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    })
    it('should throw error when delete all divs for a tmnt when ID is invalid', async () => { 
      try {
        await deleteAllDivsForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error when delete all divs for a tmnt when ID is valid, but not a tmnt id', async () => { 
      try {
        await deleteAllDivsForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
    it('should throw error when delete all divs for a tmnt when passed null', async () => { 
      try {
        await deleteAllDivsForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    })
  })

  describe('deleteAllDivsForTmnt - cascade delete', () => { 

    const multiDivs = [...mockDivsToPost];
    const multiBrkts = [
      {
        ...mockBrkts[0],
        div_id: multiDivs[0].id,
        squad_id: mockSquads[0].id,
      },
      {
        ...mockBrkts[1],
        div_id: multiDivs[0].id,
        squad_id: mockSquads[0].id,
      }      
    ];
    
    beforeAll(async () => {
      await deleteAllBrktsForDiv(multiDivs[0].id);
      await deleteAllDivsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllEventsForTmnt(tmntToDelId);

      await postEvent(mockEventToPost[0]);
      await postSquad(mockSquads[0]);
      await postManyDivs(multiDivs);
      await postManyBrkts(multiBrkts);
    })

    afterAll(async () => {
      await deleteAllBrktsForDiv(multiDivs[0].id);
      await deleteAllDivsForTmnt(tmntToDelId);
      await deleteAllSquadsForTmnt(tmntToDelId);
      await deleteAllEventsForTmnt(tmntToDelId);
    })

    it('should cascade delete all divs for a tmnt', async () => {
      const divsPreDel = await getAllDivsForTmnt(multiDivs[0].tmnt_id);
      expect(divsPreDel).not.toBeNull();
      if (!divsPreDel) return;
      expect(divsPreDel.length).toBe(multiDivs.length);
      const brktsPreDel = await getAllBrktsForSquad(mockSquads[0].id);
      expect(brktsPreDel).not.toBeNull();
      if (!brktsPreDel) return;
      expect(brktsPreDel.length).toBe(multiBrkts.length);
      
      const deleted = await deleteAllDivsForTmnt(multiDivs[0].tmnt_id);
      expect(deleted).toBe(multiDivs.length);

      const brktsPostDel = await getAllBrktsForSquad(mockSquads[0].id);
      expect(brktsPostDel).not.toBeNull();
      if (!brktsPostDel) return;
      expect(brktsPostDel.length).toBe(0);
    });
  })

});
