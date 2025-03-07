import axios, { AxiosError } from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../testApi";
import { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { deleteAllDivElims, deleteAllSquadElims, postManyElims } from "@/lib/db/elims/dbElims";
import { deleteAllTmntSquads, postManySquads } from "@/lib/db/squads/dbSquads";
import { deleteAllTmntDivs, postManyDivs } from "@/lib/db/divs/dbDivs";
import { mockElimsToPost, mockSquadsToPost, mockDivsToPost, tmntToDelId } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

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

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;
const oneElimUrl = url + "/elim/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";

const notFoundId = "elm_01234567890123456789012345678901";
const nonElimId = "usr_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";

const elim3Id = "elm_b4c3939adca140898b1912b75b3725f8";

const div2Id = "div_1f42042f9ef24029a0a2d48cc276a087";
const squad2Id = "sqd_1a6c885ee19a49489960389193e8f819";

const toDelDivSquadElims = [
  {
    ...initElim,
    id: "elm_de24c5cc04f6463d89f24e6e19a12601",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
    sort_order: 1,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_de24c5cc04f6463d89f24e6e19a12602",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
    sort_order: 2,
    start: 2,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_de24c5cc04f6463d89f24e6e19a12603",
    squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
    div_id: "div_18997d3fd7ef4eb7ad2b53a9e93f9ce5",
    sort_order: 3,
    start: 3,
    games: 3,
    fee: '5',
  },
]

describe("Elims - PUT, PATCH, DELETE", () => {
  const testElim: elimType = {
    ...initElim,
    id: "elm_45d884582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    start: 1,
    games: 3,
    fee: "5",
    sort_order: 1,
  };

  const blankElim = {
    id: "elm_45d884582e7042bb95b4818ccdd9974c",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  };

  const resetElim = async () => { 
    // make sure test elim is reset in database
    const elimJSON = JSON.stringify(testElim);
    const response = await axios({
      method: "put",
      data: elimJSON,
      withCredentials: true,
      url: oneElimUrl + testElim.id,
    })
  }

  describe("PUT by ID - API: /api/elim/elim/:id", () => {

    const putElim = {
      ...testElim,
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      div_id: "div_29b9225d8dd44a4eae276f8bde855729",
      start: 2,
      games: 4,
      fee: "13",
      sort_order: 11,
    };

    beforeAll(async () => {
      await resetElim();
    });

    afterEach(async () => {
      await resetElim();
    });

    it("should update a elim by ID", async () => {
      const elimJSON = JSON.stringify(putElim);
      const response = await axios({
        method: "put",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(response.status).toBe(200);
      const elim = response.data.elim;      
      expect(elim.squad_id).toBe(putElim.squad_id);
      expect(elim.div_id).toBe(putElim.div_id);      
      expect(elim.start).toBe(putElim.start);
      expect(elim.games).toBe(putElim.games);
      expect(elim.fee).toBe(putElim.fee);
      expect(elim.sort_order).toBe(putElim.sort_order);
    });
    it("should NOT update elim by ID when ID is invalid", async () => {
      try {
        const elimJSON = JSON.stringify(putElim);
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + "test",
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when ID is valid, but not an elim ID", async () => {
      try {
        const elimJSON = JSON.stringify(putElim);
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + nonElimId,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when ID is not found", async () => {
      try {
        const elimJSON = JSON.stringify(putElim);
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + notFoundId,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when squad_id is blank", async () => {
      const invalidElim = {
        ...putElim,
        squad_id: "",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when div_id is blank", async () => {
      const invalidElim = {
        ...putElim,
        div_id: "",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when start is null", async () => {
      const invalidElim = {
        ...putElim,
        start: null,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when games is null", async () => {
      const invalidElim = {
        ...putElim,
        games: null,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when fee is blank", async () => {
      const invalidElim = {
        ...putElim,
        fee: "",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when sort_order is null", async () => {
      const invalidElim = {
        ...putElim,
        sort_order: null,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when start is too low", async () => {
      const invalidElim = {
        ...putElim,
        start: 0,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when start is too high", async () => {
      const invalidElim = {
        ...putElim,
        start: 100,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when start is not an integer", async () => {
      const invalidElim = {
        ...putElim,
        start: 1.5,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when start is not a number", async () => {
      const invalidElim = {
        ...putElim,
        start: "abc" as any,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when games is too low", async () => {
      const invalidElim = {
        ...putElim,
        games: 0,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when games is too high", async () => {
      const invalidElim = {
        ...putElim,
        games: 100,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when games is not an integer", async () => {
      const invalidElim = {
        ...putElim,
        games: 1.5,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when games is not a number", async () => {
      const invalidElim = {
        ...putElim,
        games: "abc" as any,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when fee is too low", async () => {
      const invalidElim = {
        ...putElim,
        fee: "0",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when fee is too high", async () => {
      const invalidElim = {
        ...putElim,
        fee: "1234567",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when fee is not a number", async () => {
      const invalidElim = {
        ...putElim,
        fee: "abc",
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when sort_order is too low", async () => {
      const invalidElim = {
        ...putElim,
        sort_order: 0,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when sort_order is too high", async () => {
      const invalidElim = {
        ...putElim,
        sort_order: 1234567,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when sort_order is not an integer", async () => {
      const invalidElim = {
        ...putElim,
        sort_order: 1.5,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when sort_order is not a number", async () => {
      const invalidElim = {
        ...putElim,
        sort_order: "abc" as any,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when div_id + start + games is not unique", async () => {
      const noUpDivId = 'div_99a3cae28786485bb7a036935f0f6a0a';
      const noUpSquadId = 'sqd_8e4266e1174642c7a1bcec47a50f275f';

      const invalidElim = {
        ...putElim,        
        squad_id: noUpSquadId,
        div_id: noUpDivId,
        start: 1,
        games: 3,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const response = await axios({
          method: "put",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should update elom by id with sanitized data", async () => {
      const toSanitizeElim = {
        ...putElim,
        fee: "5.460",
      };
      const elimJSON = JSON.stringify(toSanitizeElim);
      const putResponse = await axios({
        method: "put",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(putResponse.status).toBe(200);
      const elim = putResponse.data.elim;
      expect(elim.fee).toBe("5.46");
    });

  });

  describe("PATCH by ID - API: /api/elims/elim/:id", () => {

    beforeAll(async () => {
      await resetElim();
    });

    afterEach(async () => {
      await resetElim();
    });

    it("should patch start for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        start: 2,
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      expect(elim.start).toBe(2);
    });
    it("should patch games for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        games: 4,
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      expect(elim.games).toBe(4);
    });
    it("should patch fee for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        fee: "13",
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      expect(elim.fee).toBe("13");
    });
    it("should patch sort_order for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: 12,
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      expect(elim.sort_order).toBe(12);
    });
    it("should NOT patch squad_id for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        squad_id: squad2Id,
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      // for squad_id, compare to blackElim.squad_id
      expect(elim.squad_id).toBe(blankElim.squad_id);
    });
    it("should NOT patch div_id for a elim by id", async () => {
      const patchElim = {
        ...blankElim,
        div_id: div2Id,
      };
      const elimJSON = JSON.stringify(patchElim);
      const patchResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(patchResponse.status).toBe(200);
      const elim = patchResponse.data.elim;
      // for div_id, compare to blackElim.div_id
      expect(elim.div_id).toBe(blankElim.div_id);
    });
    it("should NOT patch an elim when ID is invalid", async () => {
      const patchElim = {
        ...blankElim,
        fee: "13",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + "test",
        });
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when ID is not found", async () => {
      const patchElim = {
        ...blankElim,
        fee: "13",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + notFoundId,
        });
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when ID is valid, but not an elim ID", async () => {
      const patchElim = {
        ...blankElim,
        fee: "13",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + nonElimId,
        });
        expect(patchResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when start is null", async () => {
      const patchElim = {
        ...blankElim,
        start: null,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when games is null", async () => {
      const patchElim = {
        ...blankElim,
        games: null,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when fee is blank", async () => {
      const patchElim = {
        ...blankElim,
        fee: "",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an sort_order when start is null", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: null,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when start is too low", async () => {
      const patchElim = {
        ...blankElim,
        start: 0,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when start is too high", async () => {
      const patchElim = {
        ...blankElim,
        start: 100,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when start is not an integer", async () => {
      const patchElim = {
        ...blankElim,
        start: 1.5,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when start is not a number", async () => {
      const patchElim = {
        ...blankElim,
        start: "abc",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when games is too low", async () => {
      const patchElim = {
        ...blankElim,
        games: 0,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when games is too high", async () => {
      const patchElim = {
        ...blankElim,
        games: 100,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when games is not an integer", async () => {
      const patchElim = {
        ...blankElim,
        games: 1.5,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when games is not a number", async () => {
      const patchElim = {
        ...blankElim,
        games: "abc",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when fee is too low", async () => {
      const patchElim = {
        ...blankElim,
        fee: "0",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when fee is too high", async () => {
      const patchElim = {
        ...blankElim,
        fee: "1234567",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when fee is not a number", async () => {
      const patchElim = {
        ...blankElim,
        fee: "abc",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when sort_order is too low", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: 0,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when sort_order is too high", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: 1234567,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when sort_order is not an integer", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: 1.5,
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT patch an elim when sort_order is not a number", async () => {
      const patchElim = {
        ...blankElim,
        sort_order: "abc",
      };
      const elimJSON = JSON.stringify(patchElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + blankElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT update elim by ID when div_id + start + games is not unique", async () => {
      const invalidElim = {
        ...blankElim,
        id: elim3Id,
        div_id: div2Id,
        start: 4,
        games: 3,
      };
      const elimJSON = JSON.stringify(invalidElim);
      try {
        const patchResponse = await axios({
          method: "patch",
          data: elimJSON,
          withCredentials: true,
          url: oneElimUrl + testElim.id,
        });
        expect(patchResponse.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should update elom by id with sanitized data", async () => {
      const toSanitizeElim = {
        ...blankElim,
        fee: "5.460",
      };
      const elimJSON = JSON.stringify(toSanitizeElim);
      const putResponse = await axios({
        method: "patch",
        data: elimJSON,
        withCredentials: true,
        url: oneElimUrl + testElim.id,
      });
      expect(putResponse.status).toBe(200);
      const elim = putResponse.data.elim;
      expect(elim.fee).toBe("5.46");
    });

  });

  describe("DELETE by ID - API: /api/elim/elim/:id", () => {

    const toDelElim = {
      ...initElim,
      id: "elm_4c5aad9baa7246c19e07f215561e58c4",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      start: 3,
      games: 4,
      fee: "10",
      sort_order: 3,
    };

    let didDel = false;

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      try {
        const elimJSON = JSON.stringify(toDelElim);
        const response = await axios({
          method: "post",
          data: elimJSON,
          withCredentials: true,
          url: url,
        });        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    });

    it("should delete elim by ID", async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimUrl + toDelElim.id,
        });
        didDel = true;
        expect(delResponse.status).toBe(200);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(200);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT delete an elim by ID when ID is invalid", async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimUrl + "test",
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT delete an elim by ID when ID is not found", async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimUrl + notFoundId,
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT delete an elim by ID when ID is valid, but not an pot id", async () => {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneElimUrl + nonElimId,
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe('DELETE all elims for a squad API: /api/elims/squad/:squadId', () => { 
    
    let didDel = false

    beforeAll(async () => {
      await postManyElims(toDelDivSquadElims);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await postManyElims(toDelDivSquadElims);
    })

    afterAll(async () => {      
      await deleteAllDivElims(toDelDivSquadElims[0].div_id);
    })

    it('should delete all elims for a squad', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + toDelDivSquadElims[0].squad_id
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(toDelDivSquadElims.length);
    })
    it('should return 404 when elims id is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: squadUrl + "test"
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elims for a squad when squad id is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: squadUrl + notFoundSquadId
      })  
      expect(response.status).toBe(200);
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })
  })

  describe('DELETE all elims for a div API: /api/elims/div/:divId', () => { 
    let didDel = false

    beforeAll(async () => {
      await postManyElims(toDelDivSquadElims);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await postManyElims(toDelDivSquadElims);
    })

    afterAll(async () => {      
      await deleteAllSquadElims(toDelDivSquadElims[0].squad_id);
    })

    it('should delete all elims for a div', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: divUrl + toDelDivSquadElims[0].div_id
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(toDelDivSquadElims.length);
    })
    it('should return 404 when div id is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: divUrl + "test"
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elims for a div when div id is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: divUrl + notFoundDivId
      })  
      expect(response.status).toBe(200);
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })

  })

  describe('DELETE all elims for a tmnt API: /api/elims/tmnt/:tmntId', () => { 

    let didDel = false

    beforeAll(async () => {
      // clean up any left over data      
      await deleteAllSquadElims(mockSquadsToPost[0].id);      
      await deleteAllSquadElims(mockSquadsToPost[1].id);      
      await deleteAllTmntSquads(tmntToDelId)
      await deleteAllTmntDivs(tmntToDelId)

      // setup data 
      await postManyDivs(mockDivsToPost)
      await postManySquads(mockSquadsToPost)
      await postManyElims(mockElimsToPost);
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await postManyElims(mockElimsToPost);
    })

    afterAll(async () => {      
      await deleteAllSquadElims(mockSquadsToPost[0].id);      
      await deleteAllSquadElims(mockSquadsToPost[1].id);      
      await deleteAllTmntSquads(tmntToDelId)
      await deleteAllTmntDivs(tmntToDelId)
    })

    it('should delete all elims for a tmnt', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: tmntUrl + tmntToDelId
      })
      expect(response.status).toBe(200);
      didDel = true;
      const count = response.data.deleted.count;
      expect(count).toBe(mockElimsToPost.length);
    })
    it('should return 404 when div id is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: tmntUrl + "test"
        })  
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete all elims for a div when div id is not found', async () => {
      const response = await axios({
        method: "delete",
        withCredentials: true,
        url: tmntUrl + notFoundTmntId
      })  
      expect(response.status).toBe(200);
      const count = response.data.deleted.count;
      expect(count).toBe(0);
    })

  })  

});
