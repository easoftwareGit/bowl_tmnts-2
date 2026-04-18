import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseDivsApi } from "@/lib/api/apiPaths";
import { testBaseDivsApi } from "../../../testApi";
import type { divType, HdcpForTypes } from "@/lib/types/types";
import { blankDiv, initDiv } from "@/lib/db/initVals";
import {
  deleteDiv,
  extractDivs,
  getAllDivsForTmnt,
  postDiv,
  putDiv,
} from "@/lib/db/divs/dbDivs";
import { mockDivsToPost } from "../../../mocks/tmnts/twoDivs/mockDivs";
import { cloneDeep } from "lodash";

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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivsApi
  ? testBaseDivsApi
  : baseDivsApi;  

const oneDivUrl = url + "/div/";

const notFoundId = "div_00000000000000000000000000000000";
const notFoundTmntId = "tmt_00000000000000000000000000000000";
const tmntId = mockDivsToPost[0].tmnt_id;
const userId = "usr_01234567890123456789012345678901";

describe("dbDivs", () => {
  describe("extractDivs", () => {
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
          extraField: "ignore me",
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

    it("should process multiple divs", () => {
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
          extraField: "ignore me",
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
          extraField: "ignore me",
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
    });

    it("should return empty array when passed empty array", () => {
      const result = extractDivs([]);
      expect(result).toEqual([]);
    });

    it("should return empty array when passed null", () => {
      const result = extractDivs(null as any);
      expect(result).toEqual([]);
    });

    it("should return empty array when passed non array", () => {
      const result = extractDivs("not an array" as any);
      expect(result).toEqual([]);
    });
  });

  describe("getAllDivsForTmnt", () => {
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
        hdcp_for: "Game",
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
        hdcp_for: "Game",
        sort_order: 2,
      },
    ];

    it("should get divs for tmnt", async () => {
      const divs = await getAllDivsForTmnt(divsToGet[0].tmnt_id);
      expect(divs).toHaveLength(divsToGet.length);

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
    });

    it("should return 0 divs for not found tmnt", async () => {
      const divs = await getAllDivsForTmnt(notFoundTmntId);
      expect(divs).toHaveLength(0);
    });

    it("should throw error when tmnt id is invalid", async () => {
      await expect(getAllDivsForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error when tmnt id is valid but not a tmnt id", async () => {
      await expect(getAllDivsForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error when tmnt id is null", async () => {
      await expect(getAllDivsForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });

  describe("postDiv", () => {
    const divToPost = {
      ...initDiv,
      id: "div_1234567890abcdef1234567890abcdef",
      tmnt_id: "tmt_e134ac14c5234d708d26037ae812ac33",
      div_name: "Test Div",
      hdcp_per: 0.8,
      hdcp_from: 230,
    };

    const deletePostedDiv = async () => {
      try {
        await privateApi.delete(oneDivUrl + divToPost.id);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
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
      expect(postedDiv.div_name).toBe("scriptTestingscript");
      expect(postedDiv.hdcp_per).toBe(divToPost.hdcp_per);
      expect(postedDiv.hdcp_from).toBe(divToPost.hdcp_from);
      expect(postedDiv.int_hdcp).toBe(divToPost.int_hdcp);
      expect(postedDiv.hdcp_for).toBe(divToPost.hdcp_for);
      expect(postedDiv.sort_order).toBe(divToPost.sort_order);
    });

    it("should throw error when posting div with invalid data", async () => {
      const invalidDiv = {
        ...divToPost,
        hdcp_from: -1,
      };

      await expect(postDiv(invalidDiv)).rejects.toThrow(
        "postDiv failed: Request failed with status code 422"
      );
    });

    it("should throw error when posting div with null", async () => {
      await expect(postDiv(null as any)).rejects.toThrow("Invalid div data");
    });

    it("should throw error when posting div with non object", async () => {
      await expect(postDiv("test" as any)).rejects.toThrow("Invalid div data");
    });
  });

  describe("putDiv", () => {
    const divToPut = {
      ...initDiv,
      id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      div_name: "Test Div",
      hdcp_per: 0.9,
      hdcp_from: 220,
      int_hdcp: false,
      hdcp_for: "Series" as HdcpForTypes,
      sort_order: 1,
    };

    const putUrl = oneDivUrl + divToPut.id;

    const resetDiv = {
      ...initDiv,
      id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
      div_name: "Scratch",
      hdcp_per: 0,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game" as HdcpForTypes,
      sort_order: 1,
    };

    const doReset = async () => {
      try {
        const divJSON = JSON.stringify(resetDiv);
        await privateApi.put(putUrl, divJSON);
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
      expect(puttedDiv.id).toEqual(divToPut.id);
      expect(puttedDiv.tmnt_id).toEqual(divToPut.tmnt_id);
      expect(puttedDiv.div_name).toEqual(divToPut.div_name);
      expect(puttedDiv.hdcp_per).toEqual(divToPut.hdcp_per);
      expect(puttedDiv.hdcp_from).toEqual(divToPut.hdcp_from);
      expect(puttedDiv.int_hdcp).toEqual(divToPut.int_hdcp);
      expect(puttedDiv.hdcp_for).toEqual(divToPut.hdcp_for);
      expect(puttedDiv.sort_order).toEqual(divToPut.sort_order);
    });

    it("should put a div with sanitized data", async () => {
      const toSanitize = cloneDeep(divToPut);
      toSanitize.div_name = "  ***  Testing  ***  ";

      const puttedDiv = await putDiv(toSanitize);
      expect(puttedDiv).not.toBeNull();
      if (!puttedDiv) return;

      didPut = true;
      expect(puttedDiv.id).toEqual(divToPut.id);
      expect(puttedDiv.tmnt_id).toEqual(divToPut.tmnt_id);
      expect(puttedDiv.div_name).toEqual("Testing");
      expect(puttedDiv.hdcp_per).toEqual(divToPut.hdcp_per);
      expect(puttedDiv.hdcp_from).toEqual(divToPut.hdcp_from);
      expect(puttedDiv.int_hdcp).toEqual(divToPut.int_hdcp);
      expect(puttedDiv.hdcp_for).toEqual(divToPut.hdcp_for);
      expect(puttedDiv.sort_order).toEqual(divToPut.sort_order);
    });

    it("should throw error when putting a div with invalid div id", async () => {
      const invalidDiv = {
        ...divToPut,
        id: "test",
      };

      await expect(putDiv(invalidDiv)).rejects.toThrow("Invalid div data");
    });

    it("should throw error when putting a div with invalid data", async () => {
      const invalidDiv = {
        ...divToPut,
        hdcp_from: -1,
      };

      await expect(putDiv(invalidDiv)).rejects.toThrow(
        "putDiv failed: Request failed with status code 422"
      );
    });

    it("should throw error when putting a div when passed null", async () => {
      await expect(putDiv(null as any)).rejects.toThrow("Invalid div data");
    });

    it("should throw error when putting a div when passed non object", async () => {
      await expect(putDiv("non object" as any)).rejects.toThrow(
        "Invalid div data"
      );
    });
  });

  describe("deleteDiv", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initDiv,
      id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
      tmnt_id: "tmt_9a34a65584f94f548f5ce3b3becbca19",
      div_name: "Women's",
      hdcp_per: 0.9,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game" as HdcpForTypes,
      sort_order: 4,
    };

    const rePostToDel = async () => {
      const response = await publicApi.get(url);
      const divs = response.data?.divs ?? [];
      const foundToDel = divs.find((d: divType) => d.id === toDel.id);

      if (!foundToDel) {
        try {
          const divJSON = JSON.stringify(toDel);
          await privateApi.post(url, divJSON);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

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

    it("should return 0 when delete a div when ID is not found", async () => {
      const deleted = await deleteDiv(notFoundId);
      expect(deleted).toBe(0);
    });

    it("should throw error when delete a div when ID is invalid", async () => {
      await expect(deleteDiv("test")).rejects.toThrow("Invalid div id");
    });

    it("should throw error when delete a div when ID is valid, but to a div id", async () => {
      await expect(deleteDiv(userId)).rejects.toThrow("Invalid div id");
    });

    it("should throw error when delete a div when ID null", async () => {
      await expect(deleteDiv(null as any)).rejects.toThrow("Invalid div id");
    });
  });
});