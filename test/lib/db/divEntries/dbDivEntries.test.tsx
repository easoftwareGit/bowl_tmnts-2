import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseDivEntriesApi } from "@/lib/api/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import type { divEntryType } from "@/lib/types/types";
import { initDivEntry } from "@/lib/db/initVals";
import {
  deleteDivEntry,
  getAllDivEntriesForDiv,
  getAllDivEntriesForSquad,
  getAllDivEntriesForTmnt,
  postDivEntry,
  putDivEntry,
  extractDivEntries,
} from "@/lib/db/divEntries/dbDivEntries";
import { cloneDeep } from "lodash";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";

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

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi;
const divEntryUrl = url + "/divEntry/";

const divEntriesToGet = [
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 220,
    },
    id: "den_652fc6c5556e407291c4b5666b2dccd7",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 221,
    },
    id: "den_ef36111c721147f7a2bf2702056947ce",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 210,
    },
    id: "den_856cce7a69644e26911e65cd02ee1b23",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    fee: "80",
  },
  {
    div: {
      hdcp_from: 230,
      hdcp_per: 0,
      int_hdcp: true,
    },
    player: {
      average: 211,
    },
    id: "den_4da45cadb7b84cfba255fc0ce36e9add",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    fee: "80",
  },
];

const hdcpDivEntriesToGet = [
  {
    ...initDivEntry,
    id: "den_198269b3a7e84208b25532a160f2be6d",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
    player_id: "ply_da674926088d4f739c69c2c72a465ccd",
    fee: 60,
    hdcp: calcHandicap(213, 230, 0.9, true),
  },
  {
    ...initDivEntry,
    id: "den_25f8398426ad4105ab752e1ec0a32d02",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
    player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
    fee: 60,
    hdcp: calcHandicap(205, 230, 0.9, true),
  },
  {
    ...initDivEntry,
    id: "den_f06b8a73a9894e058c17cc0a4fd012be",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
    player_id: "ply_92670d50aa7f44a487a172412bef8af5",
    fee: 80,
    hdcp: calcHandicap(200, 230, 0.9, true),
  },
  {
    ...initDivEntry,
    id: "den_f406329dfc44497f9769ae515cb2a0db",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_fe72ab97edf8407186c8e6df7f7fb741",
    player_id: "ply_f57669391b4c4405a4a4e0f40284712f",
    fee: 80,
    hdcp: calcHandicap(195, 230, 0.9, true),
  },
];

const scratchAndHdcpDivEntriesToGet = [
  ...hdcpDivEntriesToGet,
  {
    ...initDivEntry,
    id: "den_183ae3dd33954da59b29fcd5e6ae40f0",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    player_id: "ply_da674926088d4f739c69c2c72a465ccd",
    fee: 80,
  },
  {
    ...initDivEntry,
    id: "den_d303c754069a4857959a45718f84526b",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    player_id: "ply_8ffe9406fcc046508aa4b214ef16f647",
    fee: 80,
  },
  {
    ...initDivEntry,
    id: "den_2b98116d990046a2ac032102ba42e3a3",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    player_id: "ply_b830099ed18a4e9da06e345ec2320848",
    fee: 80,
  },
  {
    ...initDivEntry,
    id: "den_84dd57459e2340ab8808417719ae994e",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
    div_id: "div_578834e04e5e4885bbae79229d8b96e8",
    player_id: "ply_9fff21de787b4637beb65a1936967071",
    fee: 80,
  },
];

const divEntryToPost = {
  ...initDivEntry,
  id: "den_012fc6c5556e407291c4b5666b2dccd7",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
  fee: "82",
};

const notFoundId = "den_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe("dbDivEntries", () => {
  const rePostDivEntry = async (divEntry: divEntryType) => {
    try {
      // if divEntry already in database, then don't re-post
      const getResponse = await publicApi.get(divEntryUrl + divEntry.id);
      const found = getResponse.data.divEntry;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }

    try {
      // if not in database, then re-post
      const divEntryJSON = JSON.stringify(divEntry);
      await privateApi.post(url, divEntryJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deletePostedDivEntry = async () => {
    try {
      await privateApi.delete(divEntryUrl + divEntryToPost.id);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("extractDivEntries", () => {
    it("should correctly map raw divEntries to divEntryType", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
          extraField: "ignore me",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      const expected: divEntryType = {
        ...initDivEntry,
        id: "den_652fc6c5556e407291c4b5666b2dccd7",
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
        player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
        fee: "80",
        hdcp: 17,
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankDivEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      expect(result[0].squad_id_err).toBe("");
      expect(result[0].div_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
      expect(result[0].player_id_err).toBe("");
    });

    it("should process multiple divEntries", () => {
      const rawDivEntries = [
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 211,
          },
          id: "den_652fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
        {
          div: {
            hdcp_from: 230,
            hdcp_per: 0.9,
            int_hdcp: true,
          },
          player: {
            average: 215,
          },
          id: "den_752fc6c5556e407291c4b5666b2dccd7",
          squad_id: "sqd_7116ce5f80164830830a7157eb093396",
          div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
          player_id: "ply_99be0472be3d476ea1caa99dd05953fa",
          fee: "80",
        },
      ];

      const result = extractDivEntries(rawDivEntries);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("den_652fc6c5556e407291c4b5666b2dccd7");
      expect(result[0].player_id).toBe("ply_88be0472be3d476ea1caa99dd05953fa");
      expect(result[0].hdcp).toBe(17);
      expect(result[1].id).toBe("den_752fc6c5556e407291c4b5666b2dccd7");
      expect(result[1].player_id).toBe("ply_99be0472be3d476ea1caa99dd05953fa");
      expect(result[1].hdcp).toBe(13);
    });

    it("should return an empty array when passed an empty array", () => {
      const result = extractDivEntries([]);
      expect(result).toEqual([]);
    });

    it("should return an empty array when passed null", () => {
      const result = extractDivEntries(null);
      expect(result).toEqual([]);
    });

    it("should return an empty when passed non array", () => {
      const result = extractDivEntries("not an array" as any);
      expect(result).toEqual([]);
    });
  });

  describe("getAllDivEntriesForTmnt()", () => {
    it("should get all divEntries for tmnt", async () => {
      const getTmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
      const divEntries = await getAllDivEntriesForTmnt(getTmntId);
      expect(divEntries).toHaveLength(scratchAndHdcpDivEntriesToGet.length);

      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[0].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[0].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[0].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[0].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[1].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[1].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[1].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[1].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[2].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[2].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[2].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[2].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[3].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[3].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[3].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[3].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[4].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[4].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[4].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[4].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[4].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[5].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[5].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[5].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[5].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[5].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[6].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[6].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[6].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[6].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[6].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[7].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[7].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[7].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[7].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[7].div_id
          );
        } else {
          expect(true).toBe(false);
        }

        expect(divEntries[i].squad_id).toEqual(
          scratchAndHdcpDivEntriesToGet[i].squad_id
        );
      }
    });

    it("should return 0 divEntries for not found tmnt", async () => {
      const divEntries = await getAllDivEntriesForTmnt(notFoundTmntId);
      expect(divEntries).toHaveLength(0);
    });

    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getAllDivEntriesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllDivEntriesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });

    it("should return null if tmnt id is null", async () => {
      try {
        await getAllDivEntriesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllDivEntriesForSquad()", () => {
    beforeAll(async () => {
      await deletePostedDivEntry();
    });

    it("should get all divEntries for squad - 2 divs, one scratch one with hdcp", async () => {
      const divEntries = await getAllDivEntriesForSquad(
        scratchAndHdcpDivEntriesToGet[0].squad_id
      );
      expect(divEntries).toHaveLength(scratchAndHdcpDivEntriesToGet.length);

      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[0].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[0].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[0].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[0].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[1].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[1].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[1].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[1].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[2].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[2].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[2].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[2].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[3].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[3].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[3].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[3].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[4].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[4].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[4].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[4].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[4].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[5].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[5].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[5].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[5].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[5].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[6].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[6].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[6].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[6].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[6].div_id
          );
        } else if (divEntries[i].id === scratchAndHdcpDivEntriesToGet[7].id) {
          expect(divEntries[i].player_id).toEqual(
            scratchAndHdcpDivEntriesToGet[7].player_id
          );
          expect(divEntries[i].fee).toEqual(
            scratchAndHdcpDivEntriesToGet[7].fee + ""
          );
          expect(divEntries[i].hdcp).toEqual(scratchAndHdcpDivEntriesToGet[7].hdcp);
          expect(divEntries[i].div_id).toEqual(
            scratchAndHdcpDivEntriesToGet[7].div_id
          );
        } else {
          expect(true).toBe(false);
        }

        expect(divEntries[i].squad_id).toEqual(
          scratchAndHdcpDivEntriesToGet[i].squad_id
        );
      }
    });

    it("should return 0 divEntries for not found squad", async () => {
      const divEntries = await getAllDivEntriesForSquad(notFoundSquadId);
      expect(divEntries).toHaveLength(0);
    });

    it("should return null if squad id is invalid", async () => {
      try {
        await getAllDivEntriesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should return null if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllDivEntriesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });

    it("should return null if squad id is null", async () => {
      try {
        await getAllDivEntriesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("getAllDivEntriesForDiv()", () => {
    it("should get all divEntries for div - no hdcp", async () => {
      const divEntries = await getAllDivEntriesForDiv(divEntriesToGet[0].div_id);
      expect(divEntries).toHaveLength(divEntriesToGet.length);

      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === divEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[0].player_id);
        } else if (divEntries[i].id === divEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[1].player_id);
        } else if (divEntries[i].id === divEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[2].player_id);
        } else if (divEntries[i].id === divEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(divEntriesToGet[3].player_id);
        } else {
          expect(true).toBe(false);
        }

        expect(divEntries[i].squad_id).toEqual(divEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(divEntriesToGet[i].div_id);
        expect(divEntries[i].fee).toEqual(divEntriesToGet[i].fee + "");
        expect(divEntries[i].hdcp).toEqual(0);
      }
    });

    it("should get all divEntries for div - with hdcp", async () => {
      const divEntries = await getAllDivEntriesForDiv(hdcpDivEntriesToGet[0].div_id);
      expect(divEntries).toHaveLength(hdcpDivEntriesToGet.length);

      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === hdcpDivEntriesToGet[0].id) {
          expect(divEntries[i].player_id).toEqual(hdcpDivEntriesToGet[0].player_id);
          expect(divEntries[i].fee).toEqual(hdcpDivEntriesToGet[0].fee + "");
          expect(divEntries[i].hdcp).toEqual(hdcpDivEntriesToGet[0].hdcp);
        } else if (divEntries[i].id === hdcpDivEntriesToGet[1].id) {
          expect(divEntries[i].player_id).toEqual(hdcpDivEntriesToGet[1].player_id);
          expect(divEntries[i].fee).toEqual(hdcpDivEntriesToGet[1].fee + "");
          expect(divEntries[i].hdcp).toEqual(hdcpDivEntriesToGet[1].hdcp);
        } else if (divEntries[i].id === hdcpDivEntriesToGet[2].id) {
          expect(divEntries[i].player_id).toEqual(hdcpDivEntriesToGet[2].player_id);
          expect(divEntries[i].fee).toEqual(hdcpDivEntriesToGet[2].fee + "");
          expect(divEntries[i].hdcp).toEqual(hdcpDivEntriesToGet[2].hdcp);
        } else if (divEntries[i].id === hdcpDivEntriesToGet[3].id) {
          expect(divEntries[i].player_id).toEqual(hdcpDivEntriesToGet[3].player_id);
          expect(divEntries[i].fee).toEqual(hdcpDivEntriesToGet[3].fee + "");
          expect(divEntries[i].hdcp).toEqual(hdcpDivEntriesToGet[3].hdcp);
        } else {
          expect(true).toBe(false);
        }

        expect(divEntries[i].squad_id).toEqual(hdcpDivEntriesToGet[i].squad_id);
        expect(divEntries[i].div_id).toEqual(hdcpDivEntriesToGet[i].div_id);
      }
    });

    it("should return 0 divEntries for not found div", async () => {
      const divEntries = await getAllDivEntriesForDiv(notFoundDivId);
      expect(divEntries).toHaveLength(0);
    });

    it("should return null if div id is invalid", async () => {
      try {
        await getAllDivEntriesForDiv("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });

    it("should return null if div id is a valid id, but not a div id", async () => {
      try {
        await getAllDivEntriesForDiv(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });

    it("should return null if div id is null", async () => {
      try {
        await getAllDivEntriesForDiv(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid div id");
      }
    });
  });

  describe("postDivEntry()", () => {
    let createdDivEntry = false;

    beforeAll(async () => {
      await deletePostedDivEntry();
    });

    beforeEach(() => {
      createdDivEntry = false;
    });

    afterEach(async () => {
      if (createdDivEntry) {
        await deletePostedDivEntry();
      }
    });

    it("should post one divEntry", async () => {
      const postedDivEntry = await postDivEntry(divEntryToPost);
      expect(postedDivEntry).not.toBeNull();
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(divEntryToPost.id);
      expect(postedDivEntry.squad_id).toEqual(divEntryToPost.squad_id);
      expect(postedDivEntry.div_id).toEqual(divEntryToPost.div_id);
      expect(postedDivEntry.player_id).toEqual(divEntryToPost.player_id);
      expect(postedDivEntry.fee).toEqual(divEntryToPost.fee);
    });

    it("should post a sanitzed divEntry", async () => {
      const toSanitizse = {
        ...divEntryToPost,
        position: "   82  ",
      };
      const postedDivEntry = await postDivEntry(toSanitizse as any);
      expect(postedDivEntry).not.toBeNull();
      createdDivEntry = true;
      expect(postedDivEntry.id).toEqual(toSanitizse.id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.div_id).toEqual(toSanitizse.div_id);
      expect(postedDivEntry.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedDivEntry.player_id).toEqual(toSanitizse.player_id);
      expect(postedDivEntry.fee).toEqual("82");
    });

    it("should throw error when post a divEntry if got invalid divEntry id", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPost,
          id: "test",
        };
        await postDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });

    it("should throw error when post a divEntry if got invalid data", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPost,
          fee: "-1",
        };
        await postDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postDivEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when post a divEntry when passed null", async () => {
      try {
        await postDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
  });

  describe("putDivEntry()", () => {
    const divEntryToPut = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
      fee: "83",
    };

    const putUrl = divEntryUrl + divEntryToPut.id;

    const resetDivEntry = {
      ...initDivEntry,
      id: "den_652fc6c5556e407291c4b5666b2dccd7",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
      fee: "80",
    };

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetDivEntry);
        await privateApi.put(putUrl, playerJSON);
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

    it("should put a divEntry", async () => {
      const puttedDivEntry = await putDivEntry(divEntryToPut);
      expect(puttedDivEntry).not.toBeNull();
      if (!puttedDivEntry) return;
      didPut = true;
      expect(puttedDivEntry.squad_id).toBe(divEntryToPut.squad_id);
      expect(puttedDivEntry.div_id).toBe(divEntryToPut.div_id);
      expect(puttedDivEntry.player_id).toBe(divEntryToPut.player_id);
      expect(puttedDivEntry.fee).toBe(divEntryToPut.fee);
    });

    it('should throw error when put a divEntry with sanitization, fee value sanitized to ""', async () => {
      try {
        const toSanitize = cloneDeep(divEntryToPut);
        toSanitize.fee = "  84  ";
        await putDivEntry(toSanitize);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putDivEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when put a divEntry with invalid data", async () => {
      try {
        const invalidDivEntry = {
          ...divEntryToPut,
          fee: "-1",
        };
        await putDivEntry(invalidDivEntry);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putDivEntry failed: Request failed with status code 422"
        );
      }
    });

    it("should throw error when put a divEntry when passed null", async () => {
      try {
        await putDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });

    it("should throw error when put a divEntry when passed non object", async () => {
      try {
        await putDivEntry("testing" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry data");
      }
    });
  });

  describe("deleteDivEntry()", () => {
    const toDel = {
      ...initDivEntry,
      id: "den_a55c6cd27d1b482aa0ff248d5fb496ed",
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
      div_id: "div_1f42042f9ef24029a0a2d48cc276a087",
      player_id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
      fee: "80",
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostDivEntry(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostDivEntry(toDel);
      }
    });

    it("should delete a divEntry", async () => {
      const deleted = await deleteDivEntry(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should throw error when delete a divEntry when id is not found", async () => {
      try {
        await deleteDivEntry(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteDivEntry failed: Request failed with status code 404"
        );
      }
    });

    it("should throw error when delete a divEntry when id is invalid", async () => {
      try {
        await deleteDivEntry("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });

    it("should throw error when delete a divEntry when id is valid, but not a divEntry id", async () => {
      try {
        await deleteDivEntry(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });

    it("should throw error when delete a divEntry when id is null", async () => {
      try {
        await deleteDivEntry(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid divEntry id");
      }
    });
  });
});