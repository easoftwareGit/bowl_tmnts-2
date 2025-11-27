import axios, { AxiosError } from "axios";
import { baseLanesApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi } from "../../../testApi";
import { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import {
  deleteAllLanesForSquad,
  deleteAllLanesForTmnt,
  deleteLane,
  extractLanes,
  getAllLanesForSquad,
  getAllLanesForTmnt,
  postLane,
  postManyLanes,
  putLane,
} from "@/lib/db/lanes/dbLanes";
import {
  mockLanesToPost,
  mockSquadsToPost,  
} from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {  
  deleteSquad,  
  postSquad,
} from "@/lib/db/squads/dbSquads";
import { btDbUuid } from "@/lib/uuid";
import { replaceManyLanes } from "@/lib/db/lanes/dbLanesReplaceMany";

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

const url = testBaseLanesApi.startsWith("undefined")
  ? baseLanesApi
  : testBaseLanesApi;
const laneUrl = url + "/lane/";

const tmntToDelId = 'tmt_d9b1af944d4941f65b2d2d4ac160cdea';
const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

describe("dbLanes", () => {
  const rePostLane = async (lane: laneType) => {
    try {
      // if lane already in database, then don't re-post
      const getResponse = await axios.get(laneUrl + lane.id);
      const found = getResponse.data.lane;
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
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: laneJSON,
      });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe('extractLanes()', () => {
    it('should return an empty array when given an empty array', () => {
      const squads = extractLanes([]);
      expect(squads).toEqual([]);
    });
    it('should correctly extract lanes when given array of lanes', () => {
      const rawLanes = [
        {
          id: "lan_123",
          squad_id: "sqd_123",
          lane_number: 1,
          in_use: true,
          extraField: "ignore me", // should be ignored
        }
      ];

      const result = extractLanes(rawLanes);

      const expectedLane: laneType = {
        ...initLane,
        id: "lan_123",
        squad_id: "sqd_123",
        lane_number: 1,
        in_use: true
      };

      expect(result).toEqual([expectedLane]);
    });
    it('should replace multiple lanes corectly', () => {
      const rawLanes = [
        {
          id: "lan_123",
          squad_id: "sqd_123",
          lane_number: 1,
          in_use: true,
          extraField: "ignore me", // should be ignored
        },
        {
          id: "lan_456",
          squad_id: "sqd_123",
          lane_number: 2,
          in_use: true,
          extraField: "ignore me", // should be ignored
        }
      ];

      const result = extractLanes(rawLanes);

      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual("lan_123");
      expect(result[0].lane_number).toEqual(1);
      expect(result[1].id).toEqual("lan_456");
      expect(result[1].lane_number).toEqual(2);
    });
    it('should return an empty array when given null', () => {
      const result = extractLanes(null);
      expect(result).toEqual([]);
    });
    it('should return an empty array when given a non-array', () => {
      const result = extractLanes('not an array');
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
      if (!lanes) return;
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
      try {
        await getAllLanesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllLanesForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is null", async () => {
      try {
        await getAllLanesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
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
      try {
        await getAllLanesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should return null if tmnt id is valid, but not a tmnt id", async () => {
      try {
        await getAllLanesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getAllLanesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("postLane", () => {
    const deletePostedLane = async () => {
      const response = await axios.get(url);
      const lanes = response.data.lanes;
      const toDel = lanes.find((l: laneType) => l.lane_number === 101);
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: laneUrl + toDel.id,
          });
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    const laneToPost = {
      ...initLane,
      id: btDbUuid('lan'),
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      lane_number: 101,
    };

    let createdLane = false;

    beforeAll(async () => {
      await deletePostedLane();
    });

    beforeEach(() => {
      createdLane = false;
    });

    afterEach(async () => {
      if (createdLane) {
        await deletePostedLane();
      }
    });

    it("should post a lane", async () => {
      const postedLane = await postLane(laneToPost);
      expect(postedLane).not.toBeNull();
      if (!postedLane) return;
      createdLane = true;
      expect(postedLane.id).toBe(laneToPost.id);
      expect(postedLane.squad_id).toBe(laneToPost.squad_id);
      expect(postedLane.lane_number).toBe(laneToPost.lane_number);
    });
    it("should throw error when trying to post a lane with invalid data", async () => {
      try {
        const invalidLane = {
          ...laneToPost,
          lane_number: 0,
        };
        await postLane(invalidLane);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postLane failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when trying to post a lane with invalid lane id", async () => {
      try {
        const invalidLane = {
          ...laneToPost,
          id: "test",
        };
        await postLane(invalidLane);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
    it("should throw error when trying to post a lane when passed null", async () => {
      try {
        await postLane(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
    it("should throw error when trying to post a lane with non lane object", async () => {
      try {
        await postLane("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
  });

  describe("postManyLanes", () => {
    let createdLanes = false;

    beforeAll(async () => {
      // remove any old test data
      await deleteAllLanesForTmnt(tmntToDelId);
    });

    beforeEach(() => {
      createdLanes = false;
    });

    afterEach(async () => {
      if (createdLanes) {
        await deleteAllLanesForTmnt(tmntToDelId);
      }
    });

    afterAll(async () => {
      await deleteAllLanesForTmnt(tmntToDelId);
    });

    it("should post many lanes", async () => {
      const count = await postManyLanes(mockLanesToPost);
      expect(count).toBe(mockLanesToPost.length);
      createdLanes = true;
      const postedLanes = await getAllLanesForTmnt(tmntToDelId);
      if (!postedLanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(postedLanes.length).toBe(mockLanesToPost.length);
      for (let i = 0; i < postedLanes.length; i++) {
        expect(postedLanes[i].id).toEqual(mockLanesToPost[i].id);
        expect(postedLanes[i].squad_id).toEqual(mockLanesToPost[i].squad_id);
        expect(postedLanes[i].lane_number).toEqual(
          mockLanesToPost[i].lane_number
        );
      }
    });
    it("should return 0 lanes when passed an empty array", async () => {
      const count = await postManyLanes([]);
      expect(count).toBe(0);
    });
    it("should throw error when trying to post many lanes with invalid data in first item", async () => {
      try {
        const invalidLanes = [
          {
            ...mockLanesToPost[0],
            lane_number: 0,
          },
          {
            ...mockLanesToPost[1],
          },
          {
            ...mockLanesToPost[2],
          },
          {
            ...mockLanesToPost[3],
          },
        ];
        await postManyLanes(invalidLanes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data at index 0");
      }
    });
    it("should throw error when trying to post many lanes with invalid data in first item", async () => {
      try {
        const invalidLanes = [
          {
            ...mockLanesToPost[0],
          },
          {
            ...mockLanesToPost[1],
            in_use: "test" as any,
          },
          {
            ...mockLanesToPost[2],
          },
          {
            ...mockLanesToPost[3],
          },
        ];
        await postManyLanes(invalidLanes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data at index 1");
      }
    });
    it("should throw error when passed a non array", async () => {
      try {
        await postManyLanes("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lanes data");
      }
    });
    it("should throw error when trying to post many lanes with invalid lane id in first item", async () => {
      try {
        const invalidLanes = [
          {
            ...mockLanesToPost[0],
            id: "test",
          },
          {
            ...mockLanesToPost[1],
          },
          {
            ...mockLanesToPost[2],
          },
          {
            ...mockLanesToPost[3],
          },
        ];
        await postManyLanes(invalidLanes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data at index 0");
      }
    });
    it("should throw error when trying to post many lanes with invalid lane id in first item", async () => {
      try {
        const invalidLanes = [
          {
            ...mockLanesToPost[0],
          },
          {
            ...mockLanesToPost[1],
            id: "test",
          },
          {
            ...mockLanesToPost[2],
          },
          {
            ...mockLanesToPost[3],
          },
        ];
        await postManyLanes(invalidLanes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data at index 1");
      }
    });
  });

  describe("putLane", () => {
    const laneToPut = {
      ...initLane,
      id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
      lane_number: 99,
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
    };

    const putUrl = laneUrl + laneToPut.id;

    const resetLane = {
      ...initLane,
      id: "lan_4e24c5cc04f6463d89f24e6e19a126a2",
      lane_number: 9,
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
    };

    const doReset = async () => {
      try {
        const laneJSON = JSON.stringify(resetLane);
        const response = await axios({
          method: "put",
          data: laneJSON,
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

    it("should put a lane", async () => {
      const puttedLane = await putLane(laneToPut);
      expect(puttedLane).not.toBeNull();
      if (!puttedLane) return;
      didPut = true;
      expect(puttedLane.id).toEqual(laneToPut.id);
      expect(puttedLane.squad_id).toEqual(laneToPut.squad_id);
      expect(puttedLane.lane_number).toEqual(laneToPut.lane_number);
    });
    it("should throw error when trying to put a lane with invalid data", async () => {
      try { 
        const invalidLane = {
          ...laneToPut,
          lane_number: 1234567890
        }
        await putLane(invalidLane);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putLane failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when trying to put a lane with invalid id", async () => {
      try { 
        const invalidLane = {
          ...laneToPut,
          id: "test"
        }
        await putLane(invalidLane);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
    it("should throw error when trying to put a lane passed null", async () => {
      try { 
        await putLane(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
    it("should throw error when trying to put a lane with non lane object", async () => {
      try {
        await putLane("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane data");
      }
    });
  });

  describe("replaceManyLanes()", () => {
    const rmSquadId = "sqd_1234ec18b3d44c0189c83f6ac5fd4ad6";
    let createdLanes = false;    
    const mockLanesForSquad: laneType[] = [
      {
        ...mockLanesToPost[0],
      },
      {
        ...mockLanesToPost[1],
      },
      {
        ...mockLanesToPost[2],
      },
      {
        ...mockLanesToPost[3],
      },
    ]

    beforeAll(async () => {
      await deleteAllLanesForSquad(rmSquadId);      
    });

    beforeEach(() => {
      createdLanes = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdLanes) {
        await deleteAllLanesForSquad(rmSquadId);
      }
    });

    it("should update, insert, delete many players", async () => {

      const toInsert: laneType[] = [
        {
          ...initLane,
          id: 'lan_20c24199328447f8bbe95c05e1b84605',
          lane_number: 5,
          squad_id: rmSquadId,          
        },
        {
          ...initLane,
          id: 'lan_20c24199328447f8bbe95c05e1b84606',
          lane_number: 6,
          squad_id: rmSquadId,  
        },
      ];

      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);      
      if (!lanes) {
        expect(true).toBeFalsy();        
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[2],
          in_use: false,
        },
        {
          ...mockLanesForSquad[3],
          in_use: false,
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyLanes(lanesToUpdate, rmSquadId);
      expect(replaceCount).toBe(lanesToUpdate.length);
      const replacedLanes = await getAllLanesForSquad(rmSquadId);      
      if (!replacedLanes) {
        expect(true).toBeFalsy();        
      }
      expect(replacedLanes.length).toEqual(lanesToUpdate.length);
      for (let i = 0; i < replacedLanes.length; i++) {
        if (replacedLanes[i].id === lanesToUpdate[0].id) {
          expect(replacedLanes[i].lane_number).toEqual(lanesToUpdate[0].lane_number);
          expect(replacedLanes[i].in_use).toEqual(lanesToUpdate[0].in_use);          
        } else if (replacedLanes[i].id === lanesToUpdate[1].id) {
          expect(replacedLanes[i].lane_number).toEqual(lanesToUpdate[1].lane_number);
          expect(replacedLanes[i].in_use).toEqual(lanesToUpdate[1].in_use);          
        } else if (replacedLanes[i].id === lanesToUpdate[2].id) {
          expect(replacedLanes[i].lane_number).toEqual(lanesToUpdate[2].lane_number);
          expect(replacedLanes[i].in_use).toEqual(lanesToUpdate[2].in_use);          
        } else if (replacedLanes[i].id === lanesToUpdate[3].id) {
          expect(replacedLanes[i].lane_number).toEqual(lanesToUpdate[3].lane_number);
          expect(replacedLanes[i].in_use).toEqual(lanesToUpdate[3].in_use);          
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const replaceCount = await replaceManyLanes([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedLanes = await getAllLanesForSquad(rmSquadId);
      if (!replacedLanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedLanes.length).toEqual(0);
    });
    it("should throw an error for scanitized to invalid data", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[0],
          lane_number: Number.MAX_SAFE_INTEGER + 1,
        },
        {
          ...mockLanesForSquad[1],          
        },
        {
          ...mockLanesForSquad[2],
        },
        {
          ...mockLanesForSquad[3],
        },
      ];
      await expect(replaceManyLanes(lanesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid lane data at index 0"
      );
    });
    it("should throw an error for invalid lane ID in first item", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[0],
          id: 'test',
        },
        {
          ...mockLanesForSquad[1],          
        },
        {
          ...mockLanesForSquad[2],
        },
        {
          ...mockLanesForSquad[3],
        },
      ];
      await expect(replaceManyLanes(lanesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid lane data at index 0"
      );
    });
    it("should throw an error for invalid lane ID in third item", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[0],          
        },
        {
          ...mockLanesForSquad[1],          
        },
        {
          ...mockLanesForSquad[2],
          id: 'test',
        },
        {
          ...mockLanesForSquad[3],
        },
      ];
      await expect(replaceManyLanes(lanesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid lane data at index 2"
      );
    });
    it("should throw an error for invalid lane data in first item", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[0],
          lane_number: 0,
        },
        {
          ...mockLanesForSquad[1],          
        },
        {
          ...mockLanesForSquad[2],          
        },
        {
          ...mockLanesForSquad[3],
        },
      ];
      await expect(replaceManyLanes(lanesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid lane data at index 0"
      );
    });
    it("should throw an error for invalid lane data in second item", async () => {
      const count = await postManyLanes(mockLanesForSquad);
      expect(count).toBe(mockLanesForSquad.length);
      createdLanes = true;
      const lanes = await getAllLanesForSquad(rmSquadId);  
      if (!lanes) {
        expect(true).toBeFalsy();
        return;
      }
      expect(lanes.length).toEqual(mockLanesForSquad.length);

      const lanesToUpdate = [
        {
          ...mockLanesForSquad[0],          
        },
        {
          ...mockLanesForSquad[1],
          squad_id: 'test',
        },
        {
          ...mockLanesForSquad[2],          
        },
        {
          ...mockLanesForSquad[3],
        },
      ];
      await expect(replaceManyLanes(lanesToUpdate, rmSquadId)).rejects.toThrow(
        "Invalid lane data at index 1"
      );
    });
    it("should throw an error if passed null as lanes", async () => {
      await expect(replaceManyLanes(null as any, rmSquadId)).rejects.toThrow(
        "Invalid lanes"
      );
    });
    it("should throw an error if lanes is not an array", async () => {
      await expect(replaceManyLanes("not-an-array" as any, rmSquadId)).rejects.toThrow(
        "Invalid lanes"
      );
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(replaceManyLanes(mockLanesForSquad, null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(replaceManyLanes(mockLanesForSquad, 'test')).rejects.toThrow(
        "Invalid squad id"
      );
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(replaceManyLanes(mockLanesForSquad, userId)).rejects.toThrow(
        "Invalid squad id"
      );
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
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should throw error when trying to delete a lane when ID is not found", async () => {
      try { 
        await deleteLane(nonFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteLane failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete a lane when ID is invalid", async () => {
      try { 
        await deleteLane("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane id");
      }
    });
    it("should throw error when trying to delete a lane when ID is valid, but not a lane ID", async () => {
      try { 
        await deleteLane(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane id");
      }
    });
    it("should throw error when trying to delete a lane when ID is null", async () => {
      try { 
        await deleteLane(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid lane id");
      }
    });
  });

  describe("deleteAllSquadLanes", () => {
    const multiLanes = [
      {
        ...mockLanesToPost[0],
      },
      {
        ...mockLanesToPost[1],
      },
      {
        ...mockLanesToPost[2],
      },
      {
        ...mockLanesToPost[3],
      },
    ];

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const lanes = response.data.lanes;
      // find first test lane
      const foundToDel = lanes.find((l: laneType) => l.id === multiLanes[0].id);
      if (!foundToDel) {
        try {
          await postManyLanes(multiLanes);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    let didDel = false;

    beforeAll(async () => {
      await postSquad(mockSquadsToPost[0]);
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
      await deleteAllLanesForSquad(multiLanes[0].squad_id);
      await deleteSquad(mockSquadsToPost[0].id);
    });

    it("should delete all lanes for a squad", async () => {
      const deleted = await deleteAllLanesForSquad(multiLanes[0].squad_id);
      expect(deleted).toBe(multiLanes.length);
      didDel = true;
    });
    it("should not delete all lanes for a squad when squad id is not found", async () => {
      const deleted = await deleteAllLanesForSquad(notFoundSquadId);
      expect(deleted).toBe(0);      
    });
    it("should throw error when trying to delete all lanes for a squad when ID is invalid", async () => {
      try {
        await deleteAllLanesForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error when trying to delete all lanes for a squad when ID is null", async () => {
      try {
        await deleteAllLanesForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("deleteAllTmntLanes", () => {
    const toDelSquadId = 'sqd_853edbcc963745b091829e3eadfcf064';
    const toDelTmntId = 'tmt_2d494e9bb51f4b9abba428c3f37131c9';
    const lanesToDel: laneType[] = [
      {
        id: 'lan_10c24199328447f8bbe95c05e1b84601',
        lane_number: 1,
        squad_id: toDelSquadId,
        in_use: true,
      },
      {
        id: 'lan_10c24199328447f8bbe95c05e1b84602',
        lane_number: 2,
        squad_id: toDelSquadId,
        in_use: true,
      },
      {
        id: 'lan_10c24199328447f8bbe95c05e1b84603',
        lane_number: 3,
        squad_id: toDelSquadId,
        in_use: true,
      },
      {
        id: 'lan_10c24199328447f8bbe95c05e1b84604',
        lane_number: 4,
        squad_id: toDelSquadId,
        in_use: true,
      },
    ];    

    let didDel = false;

    beforeAll(async () => {
      // cleanup before tests
      await deleteAllLanesForSquad(toDelSquadId);
      // setup for tests
      await postManyLanes(lanesToDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;
      await postManyLanes(lanesToDel);
    });

    afterAll(async () => {
      await deleteAllLanesForSquad(toDelSquadId);
    });

    it("should delete all lanes for a tmnt", async () => {
      const deleted = await deleteAllLanesForTmnt(toDelTmntId);
      didDel = true;
      expect(deleted).toBe(lanesToDel.length);
    });
    it("show not delete all lanes for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllLanesForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw error when trying to delete all lanes for a tmnt when ID is invalid", async () => {
      try {
        await deleteAllLanesForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all lanes for a tmnt when tmnt ID is not found", async () => {
      try {
        await deleteAllLanesForTmnt(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error when trying to delete all lanes for a tmnt when ID is null", async () => {
      try {
        await deleteAllLanesForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });
});
