import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseLanesApi } from "@/lib/api/apiPaths";
import { testBaseLanesApi } from "../../../testApi";
import type { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import {
  deleteLane,
  extractLanes,
  getAllLanesForSquad,
  getAllLanesForTmnt,
  postLane,
  putLane,
} from "@/lib/db/lanes/dbLanes";

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
const url = process.env.NODE_ENV === "test" && testBaseLanesApi
  ? testBaseLanesApi
  : baseLanesApi;

const laneUrl = url + "/lane/";

const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

describe("dbLanes", () => {
  const rePostLane = async (lane: laneType) => {
    try {
      // if lane already in database, then don't re-post
      const getResponse = await publicApi.get(laneUrl + lane.id);
      const found = getResponse.data?.lane;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }

    try {
      // if not in database, then re-post
      const laneJSON = JSON.stringify(lane);
      await privateApi.post(url, laneJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("extractLanes()", () => {
    it("should return an empty array when given an empty array", () => {
      const squads = extractLanes([]);
      expect(squads).toEqual([]);
    });

    it("should correctly extract lanes when given array of lanes", () => {
      const rawLanes = [
        {
          id: "lan_123",
          squad_id: "sqd_123",
          lane_number: 1,
          in_use: true,
          extraField: "ignore me",
        },
      ];

      const result = extractLanes(rawLanes);

      const expectedLane: laneType = {
        ...initLane,
        id: "lan_123",
        squad_id: "sqd_123",
        lane_number: 1,
        in_use: true,
      };

      expect(result).toEqual([expectedLane]);
    });

    it("should replace multiple lanes corectly", () => {
      const rawLanes = [
        {
          id: "lan_123",
          squad_id: "sqd_123",
          lane_number: 1,
          in_use: true,
          extraField: "ignore me",
        },
        {
          id: "lan_456",
          squad_id: "sqd_123",
          lane_number: 2,
          in_use: true,
          extraField: "ignore me",
        },
      ];

      const result = extractLanes(rawLanes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual("lan_123");
      expect(result[0].lane_number).toEqual(1);
      expect(result[1].id).toEqual("lan_456");
      expect(result[1].lane_number).toEqual(2);
    });

    it("should return an empty array when given null", () => {
      const result = extractLanes(null);
      expect(result).toEqual([]);
    });

    it("should return an empty array when given a non-array", () => {
      const result = extractLanes("not an array");
      expect(result).toEqual([]);
    });
  });

  describe("getAllLanesForSquad", () => {
    // from prisma/seed.ts
    const lanesToGet: laneType[] = [
      {
        ...initLane,
        id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 29,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8590d9693f8e45558b789a6595b1675b",
        lane_number: 30,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 31,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6123",
        lane_number: 32,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6234",
        lane_number: 33,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6345",
        lane_number: 34,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6456",
        lane_number: 35,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6567",
        lane_number: 36,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6678",
        lane_number: 37,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6789",
        lane_number: 38,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6890",
        lane_number: 39,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc",
        lane_number: 40,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
    ];

    it("should get all lanes for a squad", async () => {
      const lanes = await getAllLanesForSquad(lanesToGet[0].squad_id);
      expect(lanes).toHaveLength(lanesToGet.length);

      for (let i = 0; i < lanesToGet.length; i++) {
        expect(lanes[i].id).toEqual(lanesToGet[i].id);
        expect(lanes[i].lane_number).toEqual(lanesToGet[i].lane_number);
        expect(lanes[i].squad_id).toEqual(lanesToGet[i].squad_id);
        expect(lanes[i].in_use).toEqual(lanesToGet[i].in_use);
      }
    });

    it("should return 0 lanes for not found squad", async () => {
      const lanes = await getAllLanesForSquad(notFoundSquadId);
      expect(lanes).toHaveLength(0);
    });

    it("should throw error if squad id is invalid", async () => {
      await expect(getAllLanesForSquad("test")).rejects.toThrow("Invalid squad id");
    });

    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      await expect(getAllLanesForSquad(userId)).rejects.toThrow("Invalid squad id");
    });

    it("should throw error if squad id is null", async () => {
      await expect(getAllLanesForSquad(null as any)).rejects.toThrow("Invalid squad id");
    });
  });

  describe("getAllLanesForTmnt", () => {
    // from prisma/seed.ts
    const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
    const lanesToGet: laneType[] = [
      {
        ...initLane,
        id: "lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 29,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8590d9693f8e45558b789a6595b1675b",
        lane_number: 30,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 31,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6123",
        lane_number: 32,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6234",
        lane_number: 33,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6345",
        lane_number: 34,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6456",
        lane_number: 35,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6567",
        lane_number: 36,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6678",
        lane_number: 37,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6789",
        lane_number: 38,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6890",
        lane_number: 39,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_8b78890d8b8e4c5b9f6b7d9e7f9b6abc",
        lane_number: 40,
        squad_id: "sqd_7116ce5f80164830830a7157eb093396",
        in_use: true,
      },
    ];

    it("should get all lanes for a tmnt", async () => {
      const lanes = await getAllLanesForTmnt(tmntId);
      expect(lanes).toHaveLength(lanesToGet.length);
      if (!lanes) return;
      for (let i = 0; i < lanesToGet.length; i++) {
        expect(lanes[i].id).toEqual(lanesToGet[i].id);
        expect(lanes[i].lane_number).toEqual(lanesToGet[i].lane_number);
        expect(lanes[i].squad_id).toEqual(lanesToGet[i].squad_id);
        expect(lanes[i].in_use).toEqual(lanesToGet[i].in_use);
      }
    });

    it("should return 0 lanes for not found tmnt", async () => {
      const lanes = await getAllLanesForTmnt(notFoundTmntId);
      expect(lanes).toHaveLength(0);
    });

    it("should throw error if tmnt id is invalid", async () => {
      await expect(getAllLanesForTmnt("test")).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error if tmnt id is valid, but not a tmnt id", async () => {
      await expect(getAllLanesForTmnt(userId)).rejects.toThrow("Invalid tmnt id");
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getAllLanesForTmnt(null as any)).rejects.toThrow("Invalid tmnt id");
    });
  });

  describe("postLane", () => {
    const deletePostedLane = async (laneId: string) => {
      try {
        await privateApi.delete(laneUrl + laneId);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    const laneToPost = {
      ...initLane,
      id: "lan_1234567890abcdef1234567890abcdef",
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      lane_number: 101,
    };

    let createdLane = false;

    beforeAll(async () => {
      await deletePostedLane(laneToPost.id);
    });

    beforeEach(() => {
      createdLane = false;
    });

    afterEach(async () => {
      if (createdLane) {
        await deletePostedLane(laneToPost.id);
      }
    });

    it("should post a lane", async () => {
      const postedLane = await postLane(laneToPost);
      createdLane = true;

      expect(postedLane).not.toBeNull();
      expect(postedLane.id).toBe(laneToPost.id);
      expect(postedLane.squad_id).toBe(laneToPost.squad_id);
      expect(postedLane.lane_number).toBe(laneToPost.lane_number);
    });

    it("should throw error when trying to post a lane with invalid data", async () => {
      const invalidLane = {
        ...laneToPost,
        lane_number: 0,
      };

      await expect(postLane(invalidLane)).rejects.toThrow(
        "postLane failed: Request failed with status code 422"
      );
    });

    it("should throw error when trying to post a lane with invalid lane id", async () => {
      const invalidLane = {
        ...laneToPost,
        id: "test",
      };

      await expect(postLane(invalidLane)).rejects.toThrow("Invalid lane data");
    });

    it("should throw error when trying to post a lane when passed null", async () => {
      await expect(postLane(null as any)).rejects.toThrow("Invalid lane data");
    });

    it("should throw error when trying to post a lane with non lane object", async () => {
      await expect(postLane("test" as any)).rejects.toThrow("Invalid lane data");
    });
  });

  describe("putLane", () => {
    const laneToPut = {
      ...initLane,
      id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
      lane_number: 99,
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
    };

    const resetLane = {
      ...initLane,
      id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
      lane_number: 9,
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
    };

    const doReset = async () => {
      try {
        const laneJSON = JSON.stringify(resetLane);
        await privateApi.put(laneUrl + laneToPut.id, laneJSON);
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

    it("should put a lane", async () => {
      const puttedLane = await putLane(laneToPut);
      didPut = true;

      expect(puttedLane).not.toBeNull();
      expect(puttedLane.id).toEqual(laneToPut.id);
      expect(puttedLane.squad_id).toEqual(laneToPut.squad_id);
      expect(puttedLane.lane_number).toEqual(laneToPut.lane_number);
    });

    it("should throw error when trying to put a lane with invalid data", async () => {
      const invalidLane = {
        ...laneToPut,
        lane_number: 1234567890,
      };

      await expect(putLane(invalidLane)).rejects.toThrow(
        "putLane failed: Request failed with status code 422"
      );
    });

    it("should throw error when trying to put a lane with invalid id", async () => {
      const invalidLane = {
        ...laneToPut,
        id: "test",
      };

      await expect(putLane(invalidLane)).rejects.toThrow("Invalid lane data");
    });

    it("should throw error when trying to put a lane passed null", async () => {
      await expect(putLane(null as any)).rejects.toThrow("Invalid lane data");
    });

    it("should throw error when trying to put a lane with non lane object", async () => {
      await expect(putLane("test" as any)).rejects.toThrow("Invalid lane data");
    });
  });

  describe("deleteLane", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
      ...initLane,
      id: "lan_255dd3b8755f4dea956445e7a3511d91",
      lane_number: 99,
      squad_id: "sqd_bb2de887bf274242af5d867476b029b8",
    };

    const nonFoundId = "lan_00000000000000000000000000000000";

    let didDel = false;

    beforeAll(async () => {
      await rePostLane(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostLane(toDel);
      }
    });

    it("should delete a lane", async () => {
      const deleted = await deleteLane(toDel.id);
      didDel = true;
      expect(deleted).toBe(1);
    });

    it("should retrun 0 when trying to delete a lane when ID is not found", async () => {
      const deleted = await deleteLane(nonFoundId);
      didDel = true;
      expect(deleted).toBe(0);
    });

    it("should throw error when trying to delete a lane when ID is invalid", async () => {
      await expect(deleteLane("test")).rejects.toThrow("Invalid lane id");
    });

    it("should throw error when trying to delete a lane when ID is valid, but not a lane ID", async () => {
      await expect(deleteLane(userId)).rejects.toThrow("Invalid lane id");
    });

    it("should throw error when trying to delete a lane when ID is null", async () => {
      await expect(deleteLane(null as any)).rejects.toThrow("Invalid lane id");
    });
  });
});
