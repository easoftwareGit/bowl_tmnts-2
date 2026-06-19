import { AxiosError } from "axios";
import { privateApi } from "@/lib/api/axios";
import { baseBowlsApi, baseDivsApi, baseEventsApi, baseTmntsApi, baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi, testBaseDivsApi, testBaseEventsApi, testBaseTmntsApi, testBaseUsersApi } from "../../../testApi";
import type { bowlType, brktSeedType, tmntType, userDataType } from "@/lib/types/types";
import { blankBrktSeed, initTmnt } from "@/lib/db/initVals";
import { dateTo_yyyyMMdd, removeTimeFromISODateStr, todayStr } from "@/lib/dateTools";
import { getTmntFullData } from "@/lib/db/tmnts/dbTmnts";
import {
  mockBowl,
  bowlId,
  mockByePlayer,
  mockTmntFullData,
  oneBrktId1,
  oneBrktId2,
  mockUser,
  userId,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { SquadStage } from "@prisma/client";
import { maxTmntNameLength } from "@/lib/validation/constants";
import { cloneDeep } from "lodash";
import { addDays } from "date-fns";

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
const url = process.env.NODE_ENV === "test" && testBaseTmntsApi
  ? testBaseTmntsApi
  : baseTmntsApi;

const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";
const oneTmntUrl = url + "/tmnt/";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const userUrl = process.env.NODE_ENV === "test" && testBaseUsersApi
  ? testBaseUsersApi
  : baseUsersApi;  

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const bowlUrl = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;  

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const eventsUrl = process.env.NODE_ENV === "test" && testBaseEventsApi
  ? testBaseEventsApi
  : baseEventsApi;  

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const divsUrl = process.env.NODE_ENV === "test" && testBaseDivsApi
  ? testBaseDivsApi
  : baseDivsApi;

describe("Tmnts - API: /api/tmnts", () => {  
  const notFoundTmntId = "tmt_00000000000000000000000000000000"; // not in database

  const testTmnt: tmntType = {
    ...initTmnt,
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    start_date_str: "2022-10-23",
    end_date_str: "2022-10-23",
  };

  const notFoundId = "tmt_01234567890123456789012345678901";
  const notFoundBowlId = "bwl_01234567890123456789012345678901";
  const nonTmntId = "evt_01234567890123456789012345678901";

  const bowl2Id = "bwl_8b4a5c35ad1247049532ff53a12def0a";
  const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const user2Id = "usr_516a113083983234fc316e31fb695b85";

  const deleteTmnt = async (tmntId: string) => {

    try {
      await privateApi.delete(oneTmntUrl + tmntId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const resetTmnt = async () => {
    try {
      // make sure test tmnt is reset in database
      const tmntJSON = JSON.stringify(testTmnt);  
      await privateApi.put(oneTmntUrl + testTmnt.id, tmntJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deleteBowl = async (bowlId: string) => {
    try {
      await privateApi.delete(bowlUrl + '/bowl/' +  bowlId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await privateApi.delete(userUrl + '/user/' + userId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const postBowl = async (bowl: bowlType) => {
    try {
      const bowlJSON = JSON.stringify(bowl);
      await privateApi.post(bowlUrl, bowlJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const postUser = async (user: userDataType) => {
    try {
      const userJSON = JSON.stringify(user);
      // await privateApi.post(userUrl, userJSON, { withCredentials: true });
      await privateApi.post(userUrl, userJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("PUT tmnt - API: /api/tmnts/tmnt/:id", () => {
    let updatedTmnt = false;

    beforeAll(async () => {
      await resetTmnt();
    });

    beforeEach(() => {
      updatedTmnt = false;
    });

    afterEach(async () => {
      if (updatedTmnt) {
        await resetTmnt();
      }
    })

    afterAll(async () => {
      await resetTmnt();
    })

    it('should put a tournament - no child tables updated', async () => {
      const toPutTmnt = {
        ...testTmnt,
        tmnt_name: "New Tournament Name",
        bowl_id: bowl2Id, // change bowl id too
        start_date_str: "2023-02-12",
        end_date_str: "2023-02-12",
      }

      const tmntJSON = JSON.stringify(toPutTmnt);
      const response = await privateApi.put(oneTmntUrl + testTmnt.id, tmntJSON);;
      expect(response.status).toBe(200);
      updatedTmnt = true;

      const puttedTmnt = response.data.tmnt;
      expect(puttedTmnt.tmnt_name).toBe(toPutTmnt.tmnt_name);
      expect(puttedTmnt.bowl_id).toBe(toPutTmnt.bowl_id);
      expect(puttedTmnt.start_date.slice(0,10)).toBe(toPutTmnt.start_date_str);
      expect(puttedTmnt.end_date.slice(0,10)).toBe(toPutTmnt.end_date_str);
    })
    it('should put a sanitized tournament - no child tables updated', async () => {
      const toSanitize = {
        ...testTmnt,
        tmnt_name: "<script>Name</script>",
        bowl_id: bowl2Id, // change bowl id too
        start_date_str: "2023-02-12",
        end_date_str: "2023-02-12",
      }

      const tmntJSON = JSON.stringify(toSanitize);
      const response = await privateApi.put(oneTmntUrl + testTmnt.id, tmntJSON);;
      expect(response.status).toBe(200);
      updatedTmnt = true;

      const puttedTmnt = response.data.tmnt;
      expect(puttedTmnt.tmnt_name).toBe('scriptNamescript');
      expect(puttedTmnt.bowl_id).toBe(toSanitize.bowl_id);
      expect(puttedTmnt.start_date.slice(0,10)).toBe(toSanitize.start_date_str);
      expect(puttedTmnt.end_date.slice(0,10)).toBe(toSanitize.end_date_str);
    })
    it('should NOT put a tournament when ID is invalid', async () => {
      try {
        const tmntJSON = JSON.stringify(testTmnt);
        const response = await privateApi.put(oneTmntUrl + 'invalid', tmntJSON, {
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
    it('should NOT put a tournament when ID does not exist', async () => {
      try {
        const tmntJSON = JSON.stringify(testTmnt);
        const response = await privateApi.put(oneTmntUrl + notFoundTmntId, tmntJSON, {
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
    it('should NOT put a tournament when ID is valid, but not a tmnt id', async () => {
      try {
        const tmntJSON = JSON.stringify(testTmnt);
        const response = await privateApi.put(oneTmntUrl + userId, tmntJSON, {
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
    it('should not put a tournament when tmnt_name is too long', async () => {
      const invalidTmnt = {
        ...testTmnt,
        tmnt_name: 'a'.repeat(maxTmntNameLength + 1),
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when tmnt_name is blank', async () => {
      const invalidTmnt = {
        ...testTmnt,
        tmnt_name: '',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when tmnt_name is missing', async () => {
      const invalidTmnt = {
        ...testTmnt,
        tmnt_name: null as any,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when user_id is invalid', async () => {
      const invalidTmnt = {
        ...testTmnt,
        user_id: 'test',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when user_id is valid, but not a user id', async () => {
      const invalidTmnt = {
        ...testTmnt,
        user_id: bowlId,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when user_id is blank', async () => {
      const invalidTmnt = {
        ...testTmnt,
        user_id: '',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when user_id is missing', async () => {
      const invalidTmnt = {
        ...testTmnt,
        user_id: null as any,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when bowl_id is invalid', async () => {
      const invalidTmnt = {
        ...testTmnt,
        bowl_id: 'test',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when bowl_id is valid, but not a bowl id', async () => {
      const invalidTmnt = {
        ...testTmnt,
        bowl_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when bowl_id is blank', async () => {
      const invalidTmnt = {
        ...testTmnt,
        bowl_id: '',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when bowl_id is missing', async () => {
      const invalidTmnt = {
        ...testTmnt,
        bowl_id: null as any,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when start_date is invalid', async () => {
      const invalidTmnt = {
        ...testTmnt,
        start_date_str: 'test',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when start_date is and invalid date', async () => {
      const invalidTmnt = {
        ...testTmnt,
        start_date_str: '2022-13-13',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when start_date is blank', async () => {
      const invalidTmnt = {
        ...testTmnt,
        start_date_str: '',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when start_date is missing', async () => {
      const invalidTmnt = {
        ...testTmnt,
        start_date_str: null as any,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when end_date is invalid', async () => {
      const invalidTmnt = {
        ...testTmnt,
        end_date_str: 'test',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when end_date is and invalid date', async () => {
      const invalidTmnt = {
        ...testTmnt,
        end_date_str: '2022-13-13',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when end_date is blank', async () => {
      const invalidTmnt = {
        ...testTmnt,
        end_date_str: '',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when end_date is missing', async () => {
      const invalidTmnt = {
        ...testTmnt,
        end_date_str: null as any,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
    it('should not put a tournament when start_date is after end_date', async () => {
      const invalidTmnt = {
        ...testTmnt,
        start_date_str: '2023-01-01',
        end_date_str: '2022-01-01',
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(oneTmntUrl + invalidTmnt.id, invalidJSON, {
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
  })

  describe("PUT tmnt full data - API: /api/tmnts/full/:id", () => {

    // note:
    // PUT tmnt full does a full delete and insert of the tmnt row and
    // all child and grandchild rows    

    let updatedTmnt = false;

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);        
        await deleteBowl(mockBowl.id);
        await deleteUser(mockUser.id);
        await postUser(mockUser);
        await postBowl(mockBowl);
      } catch {
        // do nothing if cannot delete
      }
    });

    beforeEach(() => {
      updatedTmnt = false;
    });

    afterEach(async () => {
      if (updatedTmnt) {
        await resetTmnt();
      }
    });

    afterAll(async () => {
      await deleteTmnt(mockTmntFullData.tmnt.id);
      await deleteBowl(mockBowl.id);
      await deleteUser(mockUser.id);
    });

    it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {
      const before = Date.now();
      const tmntJSON = JSON.stringify(mockTmntFullData);

      const response = await privateApi.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON);
      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const puttedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(puttedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(puttedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);
      expect(puttedTmnt.tmnt.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
      expect(puttedTmnt.tmnt.start_date_str).toBe(
        mockTmntFullData.tmnt.start_date_str
      );
      expect(puttedTmnt.tmnt.end_date_str).toBe(
        mockTmntFullData.tmnt.end_date_str
      );
      // required child tables
      // events
      expect(puttedTmnt.events).toEqual(mockTmntFullData.events);

      // divs
      expect(puttedTmnt.divs).toHaveLength(mockTmntFullData.divs.length);

      const actualDivsById = Object.fromEntries(
        puttedTmnt.divs.map((div) => [div.id, div])
      );

      for (const expectedDiv of mockTmntFullData.divs) {
        expect(actualDivsById[expectedDiv.id]).toMatchObject({
          tmnt_id: expectedDiv.tmnt_id,
          div_name: expectedDiv.div_name,
          hdcp_per: expectedDiv.hdcp_per,
          hdcp_from: expectedDiv.hdcp_from,
          int_hdcp: expectedDiv.int_hdcp,
          hdcp_for: expectedDiv.hdcp_for,
          sort_order: expectedDiv.sort_order,
        });
      }

      // squads
      expect(puttedTmnt.squads).toEqual(mockTmntFullData.squads);

      // stage
      expect(puttedTmnt.stage).not.toBeNull();
      expect(puttedTmnt.stage.id).toBe(mockTmntFullData.stage.id);
      expect(puttedTmnt.stage.squad_id).toBe(mockTmntFullData.stage.squad_id);
      
      const stageSetAtMs = new Date(puttedTmnt.stage.stage_set_at).getTime(); 
      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedTmnt.stage.scores_started_at).toBe(mockTmntFullData.stage.scores_started_at);
      expect(puttedTmnt.stage.stage_override_enabled).toBe(mockTmntFullData.stage.stage_override_enabled);
      expect(puttedTmnt.stage.stage_override_reason).toBe(mockTmntFullData.stage.stage_override_reason);

      // lanes
      expect(puttedTmnt.lanes).toEqual(mockTmntFullData.lanes);

      // optional child tables
      // pots
      expect(puttedTmnt.pots).toEqual(mockTmntFullData.pots);

      // brkts
      expect(puttedTmnt.brkts).toEqual(mockTmntFullData.brkts);

      // elims
      expect(puttedTmnt.elims).toEqual(mockTmntFullData.elims);

      // run tmnt grandchild / great grandchild tables
      // players
      expect(puttedTmnt.players).toHaveLength(mockTmntFullData.players.length);

      const actualPlayersById = Object.fromEntries(
        puttedTmnt.players.map((player) => [player.id, player])
      );

      for (const expectedPlayer of mockTmntFullData.players) {
        expect(actualPlayersById[expectedPlayer.id]).toMatchObject({
          squad_id: expectedPlayer.squad_id,
          first_name: expectedPlayer.first_name,
          last_name: expectedPlayer.last_name,
          average: expectedPlayer.average,
          lane: expectedPlayer.lane,
          position: expectedPlayer.position,
        });
      }

      // div entries
      expect(puttedTmnt.divEntries).toHaveLength(mockTmntFullData.divEntries.length);

      const actualDivEntriesById = Object.fromEntries(
        puttedTmnt.divEntries.map((divEntry) => [divEntry.id, divEntry])
      );

      for (const expectedDivEntry of mockTmntFullData.divEntries) {
        expect(actualDivEntriesById[expectedDivEntry.id]).toMatchObject({
          squad_id: expectedDivEntry.squad_id,
          div_id: expectedDivEntry.div_id,
          player_id: expectedDivEntry.player_id,
          fee: expectedDivEntry.fee,
        });
      }

      // potEntries
      expect(puttedTmnt.potEntries).toHaveLength(mockTmntFullData.potEntries.length);

      const actualPotEntriesById = Object.fromEntries(
        puttedTmnt.potEntries.map((pe) => [pe.id, pe])
      );

      for (const expectedPotEntry of mockTmntFullData.potEntries) {
        expect(actualPotEntriesById[expectedPotEntry.id]).toMatchObject({
          pot_id: expectedPotEntry.pot_id,
          player_id: expectedPotEntry.player_id,          
          fee: expectedPotEntry.fee,          
        });
      }

      // bracketEntries
      expect(puttedTmnt.brktEntries).toHaveLength(mockTmntFullData.brktEntries.length);

      const actualBrktEntriesById = Object.fromEntries(
        puttedTmnt.brktEntries.map((be) => [be.id, be])
      );

      for (const expectedBrktEntry of mockTmntFullData.brktEntries) {
        expect(actualBrktEntriesById[expectedBrktEntry.id]).toMatchObject({
          brkt_id: expectedBrktEntry.brkt_id,
          player_id: expectedBrktEntry.player_id,          
          fee: expectedBrktEntry.fee,
          num_brackets: expectedBrktEntry.num_brackets,
          num_refunds: expectedBrktEntry.num_refunds,
          time_stamp: expectedBrktEntry.time_stamp,
        });
      }      

      // oneBrkts
      expect(puttedTmnt.oneBrkts).toHaveLength(mockTmntFullData.oneBrkts.length);

      const actualOneBrktsById = Object.fromEntries(
        puttedTmnt.oneBrkts.map((ob) => [ob.id, ob])
      );

      for (const expectedOneBrkt of mockTmntFullData.oneBrkts) {
        expect(actualOneBrktsById[expectedOneBrkt.id]).toMatchObject({
          brkt_id: expectedOneBrkt.brkt_id,
          bindex: expectedOneBrkt.bindex,
        });
      }

      // brktSeeds
      expect(puttedTmnt.brktSeeds).toEqual(mockTmntFullData.brktSeeds);

      // elimEntries
      expect(puttedTmnt.elimEntries).toHaveLength(mockTmntFullData.elimEntries.length);

      const actualElimEntriesById = Object.fromEntries(
        puttedTmnt.elimEntries.map((ee) => [ee.id, ee])
      );

      for (const expectedElimEntry of mockTmntFullData.elimEntries) {
        expect(actualElimEntriesById[expectedElimEntry.id]).toMatchObject({
          elim_id: expectedElimEntry.elim_id,
          player_id: expectedElimEntry.player_id,          
          fee: expectedElimEntry.fee,          
        });
      }

      // moneys
      expect(puttedTmnt.moneys).toEqual(mockTmntFullData.moneys);
    });
    it("should PUT (replace) a full tmnt; stage info: stage = 'SCORES", async () => {
      const stageTmntFullData = cloneDeep(mockTmntFullData);

      // set SCORES stage - need to set scores_started_at for test
      stageTmntFullData.stage.scores_started_at = new Date().toISOString();
      stageTmntFullData.stage.stage = SquadStage.SCORES;      

      const before = Date.now();
      const tmntJSON = JSON.stringify(stageTmntFullData);

      const response = await privateApi.put(
        fullUrl + stageTmntFullData.tmnt.id,
        tmntJSON
      );

      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const puttedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(puttedTmnt).not.toBeNull();

      // stage
      const puttedStage = puttedTmnt.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();            
      const scoresSetAtMs = new Date(puttedStage.scores_started_at!).getTime();

      expect(puttedStage).not.toBeNull();
      expect(puttedStage.id).toBe(stageTmntFullData.stage.id);
      expect(puttedStage.squad_id).toBe(stageTmntFullData.stage.squad_id);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(stageTmntFullData.stage.stage_override_enabled);
      expect(puttedStage.stage_override_reason).toBe(stageTmntFullData.stage.stage_override_reason);
    });
    it("should PUT (replace) a full tmnt; stage info: stage_override_enabled = true", async () => {
      const stageTmntFullData = cloneDeep(mockTmntFullData);

      // set SCORES stage - need to set scores_started_at for test
      stageTmntFullData.stage.stage_override_at = new Date().toISOString();
      stageTmntFullData.stage.stage = SquadStage.ENTRIES;    
      stageTmntFullData.stage.stage_override_enabled = true;
      stageTmntFullData.stage.stage_override_reason = "test reason";

      const before = Date.now();
      const tmntJSON = JSON.stringify(stageTmntFullData);

      const response = await privateApi.put(
        fullUrl + stageTmntFullData.tmnt.id,
        tmntJSON);

      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const puttedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(puttedTmnt).not.toBeNull();

      // stage
      const puttedStage = puttedTmnt.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();            
      const overrideSetAtMs = new Date(puttedStage.stage_override_at!).getTime();

      expect(puttedStage).not.toBeNull();
      expect(puttedStage.id).toBe(stageTmntFullData.stage.id);
      expect(puttedStage.squad_id).toBe(stageTmntFullData.stage.squad_id);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(overrideSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(overrideSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(stageTmntFullData.stage.stage_override_enabled);
      expect(puttedStage.stage_override_reason).toBe(stageTmntFullData.stage.stage_override_reason);
    });

    it("should NOT PUT (replace) a full tmnt with invalid tmnt data", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = "";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no events", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.events = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid events", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.events[0].id = "invalid";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no divs", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.divs = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid divs", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.divs[0].id = "invalid";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with no squads", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.squads = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid squads", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.squads[0].id = "invalid";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should NOT PUT (replace) a full tmnt with no stage', async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.stage = null as any;
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT PUT (replace) a full tmnt with invalid stage', async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.stage.id = 'invalid';
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should NOT PUT (replace) a full tmnt with no lanes", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.lanes = [];
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid lanes", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.lanes[0].id = "invalid";
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid pots", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.pots[0].id = 'invalid'
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid brkts", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.brkts[0].id = 'invalid'
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt with invalid elims", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.elims[0].id = 'invalid'
      const tmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should rollback a PUT (replace) of a full tmnt', async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await privateApi.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON);

      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);
      const getTmntResponse1 = await privateApi.get(fullUrl + mockTmntFullData.tmnt.id);
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = 'Rollback';
      invalidTmnt.pots[1].id = invalidTmnt.pots[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await privateApi.get(fullUrl + mockTmntFullData.tmnt.id);
      expect(getTmntResponse2.status).toBe(200);
      const tmntFullData2 = getTmntResponse2.data.tmntFullData;
      // tmntFullData2 should not be changed
      expect(tmntFullData2.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
    })
  });

  describe("PUT tmnt full entries data - API: /api/tmnts/fullEntries/:id", () => {

    // note:
    // PUT tmnt fullEntries does a full delete and insert of the tmnt row and
    // entries child and grand child rows.
    // child tables with rows NOT updated:
    //   events, divs, squads, lanes, pots, brkts, elims

    let updatedTmnt = false;

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);
        await deleteBowl(mockBowl.id)
        await deleteUser(mockUser.id)
        await postBowl(mockBowl)
        await postUser(mockUser)
      } catch {
        // do nothing if cannot delete
      }
    });

    beforeEach(async () => {
      updatedTmnt = false;

      const tmntJSON = JSON.stringify(mockTmntFullData);
      const response = await privateApi.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON);
      
      if (response.status === 200) {
        updatedTmnt = true;  
      }
    });

    afterEach(async () => {
      if (updatedTmnt) {
        await deleteTmnt(mockTmntFullData.tmnt.id);
      }
    });

    afterAll(async () => { 
      await deleteTmnt(mockTmntFullData.tmnt.id);
      await deleteBowl(mockBowl.id)
      await deleteUser(mockUser.id)
    })

    it("should PUT (replace) a full tmnt, all child, grandchild tables", async () => {      
      const postedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);

      const tmntEntries = cloneDeep(mockTmntFullData);
      // values that will not update
      tmntEntries.tmnt.tmnt_name = 'DoNotUpdate';
      tmntEntries.events[0].event_name = 'DoNotUpdate';
      tmntEntries.divs[0].div_name = 'DoNotUpdate';
      tmntEntries.squads[0].squad_name = 'DoNotUpdate';
      tmntEntries.lanes[0].lane_number = 100;
      tmntEntries.pots[0].pot_type = 'Series';
      tmntEntries.brkts[0].start = 2;
      tmntEntries.elims[0].start = 2;
      // values that will update
      tmntEntries.players[0].first_name = 'Updated';
      tmntEntries.players[0].last_name = 'ThisToo';
      tmntEntries.divEntries[0].fee = '100';
      tmntEntries.potEntries[0].fee = '10';
      tmntEntries.potEntries[0].pot_id = mockTmntFullData.pots[1].id;
      tmntEntries.brktEntries[0].num_brackets = 100;
      tmntEntries.brktEntries[0].num_refunds = 92;
      tmntEntries.oneBrkts[0].bindex = 7;
      tmntEntries.brktSeeds[0].seed = 7;
      tmntEntries.elimEntries[0].player_id = mockTmntFullData.players[2].id;
      
      const before = Date.now();

      const tmntEntriesJSON = JSON.stringify(tmntEntries);
      const response = await privateApi.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON);
      expect(response.status).toBe(200);      
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      
      const puttedStage = response.data.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();            
      expect(puttedStage.id).toBe(mockTmntFullData.stage.id);
      expect(puttedStage.squad_id).toBe(mockTmntFullData.stage.squad_id);
      expect(puttedStage.stage).toBe(mockTmntFullData.stage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(mockTmntFullData.stage.stage_override_enabled);
      expect(puttedStage.stage_override_at).toBe(mockTmntFullData.stage.stage_override_at);
      expect(puttedStage.stage_override_reason).toBe(mockTmntFullData.stage.stage_override_reason);
      
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
      expect(postedEntries).not.toBeNull();

      // non updated values
      expect(postedEntries.tmnt.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);
      expect(postedEntries.events[0].event_name).toBe(mockTmntFullData.events[0].event_name);
      for (let i = 0; i < postedEntries.divs.length; i++) {
        if (postedEntries.divs[i].id === mockTmntFullData.divs[0].id) {
          expect(postedEntries.divs[i].div_name).toBe(mockTmntFullData.divs[0].div_name);
        }
      }
      expect(postedEntries.squads[0].squad_name).toBe(mockTmntFullData.squads[0].squad_name);
      for (let i = 0; i < postedEntries.lanes.length; i++) {
        if (postedEntries.lanes[i].id === mockTmntFullData.lanes[0].id) {
          expect(postedEntries.lanes[i].lane_number).toBe(mockTmntFullData.lanes[0].lane_number);
        }
      }
      for (let i = 0; i < postedEntries.pots.length; i++) {
        if (postedEntries.pots[i].id === mockTmntFullData.pots[0].id) {
          expect(postedEntries.pots[i].pot_type).toBe(mockTmntFullData.pots[0].pot_type);
        }
      }
      for (let i = 0; i < postedEntries.brkts.length; i++) {
        if (postedEntries.brkts[i].id === mockTmntFullData.brkts[0].id) {
          expect(postedEntries.brkts[i].start).toBe(mockTmntFullData.brkts[0].start);
        }
      }
      for (let i = 0; i < postedEntries.elims.length; i++) {
        if (postedEntries.elims[i].id === mockTmntFullData.elims[0].id) {
          expect(postedEntries.elims[i].start).toBe(mockTmntFullData.elims[0].start);
        }
      }

      // updated values
      for (let i = 0; i < postedEntries.players.length; i++) {
        if (postedEntries.players[i].id === tmntEntries.players[0].id) {
          expect(postedEntries.players[i].first_name).toBe('Updated');
          expect(postedEntries.players[i].last_name).toBe('ThisToo');
        }
      }
      for (let i = 0; i < postedEntries.divEntries.length; i++) {
        if (postedEntries.divEntries[i].id === tmntEntries.divEntries[0].id) {
          expect(postedEntries.divEntries[i].fee).toBe('100')
        }
      }
      for (let i = 0; i < postedEntries.potEntries.length; i++) {
        if (postedEntries.potEntries[i].id === tmntEntries.potEntries[0].id) {
          expect(postedEntries.potEntries[i].fee).toBe('10');
          expect(postedEntries.potEntries[i].pot_id).toBe(mockTmntFullData.pots[1].id);
        }
      }
      for (let i = 0; i < postedEntries.brktEntries.length; i++) {
        if (postedEntries.brktEntries[i].id === tmntEntries.brktEntries[0].id) {
          expect(postedEntries.brktEntries[i].num_brackets).toBe(100);
          expect(postedEntries.brktEntries[i].num_refunds).toBe(92);
        }
      }
      for (let i = 0; i < postedEntries.oneBrkts.length; i++) {
        if (postedEntries.oneBrkts[i].id === tmntEntries.oneBrkts[0].id) {
          expect(postedEntries.oneBrkts[i].bindex).toBe(7);
        }
      }
      for (let i = 0; i < postedEntries.brktSeeds.length; i++) {
        if (
          postedEntries.brktSeeds[i].player_id === tmntEntries.brktSeeds[0].player_id &&
          postedEntries.brktSeeds[i].one_brkt_id === tmntEntries.oneBrkts[0].id
        ) {
          expect(postedEntries.brktSeeds[i].seed).toBe(7);
        }
      }
      for (let i = 0; i < postedEntries.elimEntries.length; i++) {
        if (postedEntries.elimEntries[i].player_id === tmntEntries.elimEntries[0].player_id) {
          expect(postedEntries.elimEntries[i].player_id).toBe(mockTmntFullData.players[2].id);
        }
      }

      // check to make sure correct # of refunds saved
      const brktEntries = postedEntries.brktEntries;
      expect(brktEntries).not.toBeNull();      
      if (!brktEntries) return;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === tmntEntries.brktEntries[0].id) {
          expect(brktEntries[i].num_refunds).toBe(92);
        }
      }

      const moneys = postedEntries.moneys;
      expect(moneys).not.toBeNull();
      if (!moneys) return;
      for (let i = 0; i < moneys.length; i++) {
        if (moneys[i].id === tmntEntries.moneys[1].id) {
          expect(moneys[i].amount).toBe(340);
        }
      }
    });
    it("should PUT (replace) stage info: stage = 'SCORES", async () => {      
      const postedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);

      const tmntEntries = cloneDeep(mockTmntFullData);
      // values that will not update
      tmntEntries.tmnt.tmnt_name = 'DoNotUpdate';
      tmntEntries.events[0].event_name = 'DoNotUpdate';
      tmntEntries.divs[0].div_name = 'DoNotUpdate';
      tmntEntries.squads[0].squad_name = 'DoNotUpdate';
      tmntEntries.lanes[0].lane_number = 100;
      tmntEntries.pots[0].pot_type = 'Series';
      tmntEntries.brkts[0].start = 2;
      tmntEntries.elims[0].start = 2;
      // values that will update
      tmntEntries.players[0].first_name = 'Updated';
      tmntEntries.players[0].last_name = 'ThisToo';
      tmntEntries.divEntries[0].fee = '100';
      tmntEntries.potEntries[0].fee = '10';
      tmntEntries.potEntries[0].pot_id = mockTmntFullData.pots[1].id;
      tmntEntries.brktEntries[0].num_brackets = 100;
      tmntEntries.brktEntries[0].num_refunds = 92;
      tmntEntries.oneBrkts[0].bindex = 7;
      tmntEntries.brktSeeds[0].seed = 7;
      tmntEntries.elimEntries[0].player_id = mockTmntFullData.players[2].id;

      // set SCORES stage - need to set scores_started_at for test
      tmntEntries.stage.scores_started_at = new Date().toISOString();
      tmntEntries.stage.stage = SquadStage.SCORES;      

      const before = Date.now();

      const tmntEntriesJSON = JSON.stringify(tmntEntries);
      const response = await privateApi.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON);
      expect(response.status).toBe(200);      
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      
      const puttedStage = response.data.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();            
      const scoresSetAtMs = new Date(puttedStage.scores_started_at!).getTime();

      expect(puttedStage.id).toBe(tmntEntries.stage.id);
      expect(puttedStage.squad_id).toBe(tmntEntries.stage.squad_id);
      expect(puttedStage.stage).toBe(tmntEntries.stage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(tmntEntries.stage.stage_override_enabled);
      expect(puttedStage.stage_override_at).toBe(tmntEntries.stage.stage_override_at);
      expect(puttedStage.stage_override_reason).toBe(tmntEntries.stage.stage_override_reason);
      
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
      expect(postedEntries).not.toBeNull();
    });
    it("should PUT (replace) stage info: stage_override_enabled = true", async () => {      
      const postedTmnt = await getTmntFullData(mockTmntFullData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(mockTmntFullData.tmnt.id);

      const tmntEntries = cloneDeep(mockTmntFullData);
      // values that will not update
      tmntEntries.tmnt.tmnt_name = 'DoNotUpdate';
      tmntEntries.events[0].event_name = 'DoNotUpdate';
      tmntEntries.divs[0].div_name = 'DoNotUpdate';
      tmntEntries.squads[0].squad_name = 'DoNotUpdate';
      tmntEntries.lanes[0].lane_number = 100;
      tmntEntries.pots[0].pot_type = 'Series';
      tmntEntries.brkts[0].start = 2;
      tmntEntries.elims[0].start = 2;
      // values that will update
      tmntEntries.players[0].first_name = 'Updated';
      tmntEntries.players[0].last_name = 'ThisToo';
      tmntEntries.divEntries[0].fee = '100';
      tmntEntries.potEntries[0].fee = '10';
      tmntEntries.potEntries[0].pot_id = mockTmntFullData.pots[1].id;
      tmntEntries.brktEntries[0].num_brackets = 100;
      tmntEntries.brktEntries[0].num_refunds = 92;
      tmntEntries.oneBrkts[0].bindex = 7;
      tmntEntries.brktSeeds[0].seed = 7;
      tmntEntries.elimEntries[0].player_id = mockTmntFullData.players[2].id;

      // set ENTRIES stage - need to set stage_override_at for test
      tmntEntries.stage.stage_override_at = new Date().toISOString();
      tmntEntries.stage.stage = SquadStage.ENTRIES;      
      tmntEntries.stage.stage_override_enabled = true;
      tmntEntries.stage.stage_override_reason = 'Test Override';

      const before = Date.now();

      const tmntEntriesJSON = JSON.stringify(tmntEntries);
      const response = await privateApi.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON);
      expect(response.status).toBe(200);      
      expect(response.data.success).toBe(true);

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      
      const puttedStage = response.data.stage;
      const stageSetAtMs = new Date(puttedStage.stage_set_at).getTime();            
      const overrideSetAtMs = new Date(puttedStage.stage_override_at!).getTime();

      expect(puttedStage.id).toBe(tmntEntries.stage.id);
      expect(puttedStage.squad_id).toBe(tmntEntries.stage.squad_id);
      expect(puttedStage.stage).toBe(tmntEntries.stage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(overrideSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(overrideSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(puttedStage.stage_override_enabled).toBe(tmntEntries.stage.stage_override_enabled);
      expect(puttedStage.stage_override_reason).toBe(tmntEntries.stage.stage_override_reason);
      
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
      expect(postedEntries).not.toBeNull();
    });
    it("should NOT PUT (replace) a full tmnt entries with invalid player data ", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = "";
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt entries with invalid pot entries data ", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.potEntries[0].fee = '-1';
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt entries with invalid brkt Entries data ", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.brktEntries[0].num_brackets = -1;
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should NOT PUT (replace) a full tmnt entries with invalid elim entries data ", async () => {
      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.elimEntries[0].fee = '-1';
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should rollback a PUT (replace) of a full tmnt', async () => {
      const getTmntResponse1 = await privateApi.get(fullUrl + mockTmntFullData.tmnt.id);
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = 'Rollback';
      invalidTmnt.elimEntries[1].id = invalidTmnt.elimEntries[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await privateApi.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON);
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await privateApi.get(fullUrl + mockTmntFullData.tmnt.id);
      expect(getTmntResponse2.status).toBe(200);
      const tmntFullData2 = getTmntResponse2.data.tmntFullData;
      expect(tmntFullData2.events[0].squads[0].players[0].first_name).toBe(mockTmntFullData.players[0].first_name);
    });
  });

  describe("PUT tmnt full entries data with bye player - API: /api/tmnts/fullEntries/:id", () => {

    // note:
    // PUT tmnt fullEntries does a full delete and insert of the tmnt row and
    // entries child and grand child rows.
    // child tables with rows NOT updated:
    //   events, divs, squads, lanes, pots, brkts, elims

    let updatedTmnt = false;

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);
        await deleteBowl(mockBowl.id)
        await deleteUser(mockUser.id)
        await postUser(mockUser)
        await postBowl(mockBowl)
      } catch {
        // do nothing if cannot delete
      }
    });

    beforeEach(async () => {
      updatedTmnt = false;
    });

    afterEach(async () => {
      if (updatedTmnt) {
        await deleteTmnt(mockTmntFullData.tmnt.id);
      }
    });

    afterAll(async () => {
      await deleteTmnt(mockTmntFullData.tmnt.id);
      await deleteBowl(mockBowl.id)
      await deleteUser(mockUser.id)
    })

    it("should PUT (replace) a full tmnt, all child, grandchild tables - bye player", async () => {
      const byeData = cloneDeep(mockTmntFullData);      
      byeData.players.push(mockByePlayer)
      const byeBrktSeed1: brktSeedType = {
        ...blankBrktSeed,
        one_brkt_id: oneBrktId1,
        seed: 4,
        player_id: mockByePlayer.id
      }
      const byeBrktSeed2: brktSeedType = {
        ...blankBrktSeed,
        one_brkt_id: oneBrktId2,
        seed: 4,
        player_id: mockByePlayer.id
      }
      byeData.brktSeeds.push(byeBrktSeed1, byeBrktSeed2);

      // must put full tmnt first before putting full entries
      const tmntJSON = JSON.stringify(byeData);
      const response = await privateApi.put(
        fullUrl + byeData.tmnt.id,
        tmntJSON);

      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);

      const postedTmnt = await getTmntFullData(byeData.tmnt.id);
      expect(postedTmnt).not.toBeNull();

      // required parent table - tmnt
      expect(postedTmnt.tmnt.id).toBe(byeData.tmnt.id);

      const tmntEntries = cloneDeep(byeData);

      // values that will update
      tmntEntries.players[0].first_name = 'Updated';
      tmntEntries.players[0].last_name = 'ThisToo';
      tmntEntries.divEntries[0].fee = '100';
      tmntEntries.potEntries[0].fee = '10';
      tmntEntries.potEntries[0].pot_id = byeData.pots[1].id;
      tmntEntries.brktEntries[0].num_brackets = 100;
      tmntEntries.oneBrkts[0].bindex = 7;
      tmntEntries.brktSeeds[0].seed = 7;
      tmntEntries.elimEntries[0].player_id = byeData.players[2].id;

      // now can test PUT fullEntries
      const tmntEntriesJSON = JSON.stringify(tmntEntries);
      const response2 = await privateApi.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON);

      expect(response2.status).toBe(200);
      updatedTmnt = true;
      expect(response2.data.success).toBe(true);

      const postedEntries = await getTmntFullData(tmntEntries.tmnt.id);
      expect(postedEntries).not.toBeNull();

      // updated values
      for (let i = 0; i < postedEntries.players.length; i++) {
        if (postedEntries.players[i].id === tmntEntries.players[0].id) {
          expect(postedEntries.players[i].first_name).toBe('Updated');
          expect(postedEntries.players[i].last_name).toBe('ThisToo');
        } else if (postedEntries.players[i].id.startsWith('bye')) {
          expect(postedEntries.players[i].first_name).toBe('Bye');
          expect(postedEntries.players[i].last_name).toBeNull();
          expect(postedEntries.players[i].average).toBe(0);
          expect(postedEntries.players[i].lane).toBeNull();
          expect(postedEntries.players[i].position).toBeNull();
        }
      }
      for (let i = 0; i < postedEntries.divEntries.length; i++) {
        if (postedEntries.divEntries[i].id === tmntEntries.divEntries[0].id) {
          expect(postedEntries.divEntries[i].fee).toBe('100')
        }
      }
      for (let i = 0; i < postedEntries.potEntries.length; i++) {
        if (postedEntries.potEntries[i].id === tmntEntries.potEntries[0].id) {
          expect(postedEntries.potEntries[i].fee).toBe('10');
          expect(postedEntries.potEntries[i].pot_id).toBe(byeData.pots[1].id);
        }
      }
      for (let i = 0; i < postedEntries.brktEntries.length; i++) {
        if (postedEntries.brktEntries[i].id === tmntEntries.brktEntries[0].id) {
          expect(postedEntries.brktEntries[i].num_brackets).toBe(100);
        }
      }
      for (let i = 0; i < postedEntries.oneBrkts.length; i++) {
        if (postedEntries.oneBrkts[i].id === tmntEntries.oneBrkts[0].id) {
          expect(postedEntries.oneBrkts[i].bindex).toBe(7);
        }
      }
      for (let i = 0; i < postedEntries.brktSeeds.length; i++) {
        if (
          postedEntries.brktSeeds[i].player_id === tmntEntries.brktSeeds[0].player_id &&
          postedEntries.brktSeeds[i].one_brkt_id === tmntEntries.oneBrkts[0].id
        ) {
          expect(postedEntries.brktSeeds[i].seed).toBe(7);
        } else if (postedEntries.brktSeeds[i].seed === 4) { 
          expect(postedEntries.brktSeeds[i].player_id).toBe(mockByePlayer.id);
        }
      }
      for (let i = 0; i < postedEntries.elimEntries.length; i++) {
        if (postedEntries.elimEntries[i].player_id === tmntEntries.elimEntries[0].player_id) {
          expect(postedEntries.elimEntries[i].player_id).toBe(byeData.players[2].id);
        }
      }
    });

  });

  describe('PATCH by ID - API: API: /api/tmnts/tmnt/:id', () => {

    const toPatchId = "tmt_e134ac14c5234d708d26037ae812ac33";

    const toPatch = {
      ...initTmnt,
      id: "tmt_e134ac14c5234d708d26037ae812ac33",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Gold Pin",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: "2026-08-19",
      end_date_str: "2026-08-19"
    }

    const resetPatched = async () => {
      // make sure toPatch is reset in database
      const tmntJSON = JSON.stringify(toPatch);
      await privateApi.put(oneTmntUrl + toPatch.id, tmntJSON);      
    }

    let didPatch = false;

    beforeAll(async () => {
      await resetPatched();
    })

    beforeEach(() => {
      didPatch = false;
    })

    afterEach(async () => {
      if (didPatch) {
        await resetPatched();
      }      
    })

    it('should patch a tmnt tmnt_name by ID', async () => {
      const patchTmnt = {        
        tmnt_name: 'patched tmnt name',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await privateApi.patch(oneTmntUrl + toPatchId, tmntJSON);
      expect(response.status).toBe(200);
      didPatch = true;
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe(patchTmnt.tmnt_name);
    })
    it('should patch a tmnt by ID whith a sanitized tmnt_name', async () => {
      const patchTmnt = {        
        tmnt_name: "    <script>Patched</script>   ",
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await privateApi.patch(oneTmntUrl + toPatchId, tmntJSON)
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe("scriptPatchedscript");
    })
    it('should patch a tmnt bowl_id by ID', async () => {
      const patchTmnt = {        
        bowl_id: bowl2Id,
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await privateApi.patch(oneTmntUrl + toPatchId, tmntJSON);      
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.bowl_id).toBe(patchTmnt.bowl_id);
    })
    it('should patch a tmnt start_date by ID', async () => {
      const patchTmnt = {        
        start_date_str: '2022-08-22',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await privateApi.patch(oneTmntUrl + toPatchId, tmntJSON);      
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.start_date)).toBe(patchTmnt.start_date_str);
    })
    it('should patch a tmnt end_date by ID', async () => {
      const endDate = addDays(new Date(toPatch.end_date_str), 1);
      const patchTmnt = {        
        end_date_str: dateTo_yyyyMMdd(endDate),
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await privateApi.patch(oneTmntUrl + toPatchId, tmntJSON);      
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.end_date)).toBe(patchTmnt.end_date_str);
    })

    it('should not patch tmnt by ID when just passing in ID', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          id: toPatchId,
        })
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch tmnt by ID when ID is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          tmnt_name: 'test',
        })
        const response = await privateApi.patch(oneTmntUrl + 'test', invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch tmnt by ID when ID is valid, but not found', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          tmnt_name: 'test',
        })
        const response = await privateApi.patch(oneTmntUrl + notFoundId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch tmnt by ID when ID is valid, but not a tmnt id', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          tmnt_name: 'test',
        })
        const response = await privateApi.patch(oneTmntUrl + userId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT patch a tmnt user_id by ID', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          user_id: user2Id,
        })
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    
    it('should NOT patch a tmnt by ID when tmnt_name is blank', async () => {
      try {
        const invalidTmnt = {          
          tmnt_name: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when tmnt_name is too long', async () => {
      try {
        const invalidTmnt = {          
          tmnt_name: 'a'.repeat(101),
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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

    it('should NOT patch a tmnt by ID when bowl_id is blank', async () => {
      try {
        const invalidTmnt = {          
          bowl_id: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when bowl_id is invalid', async () => {
      try {
        const invalidTmnt = {          
          bowl_id: 'invalid',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when bowl_id is valid, but not a bowl ID', async () => {
      try {
        const invalidTmnt = {          
          bowl_id: notFoundId, // tmnt id
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should not patch a tmnt by ID when bowl_id is not found', async () => {
      try {
        const invalidTmnt = {          
          bowl_id: notFoundBowlId, 
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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

    it('should NOT patch a tmnt by ID when start_date is blank', async () => {
      try {
        const invalidTmnt = {          
          start_date_str: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when start_date is too far in the past', async () => {
      try {
        const invalidTmnt = {          
          start_date_str: '1800-10-24',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when start_date is too in the future', async () => {
      try {
        const invalidTmnt = {          
          start_date_str: '2300-10-24',
          end_date_str: '2300-10-24',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when end_date is blank', async () => {
      try {
        const invalidTmnt = {          
          end_date_str: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when start_date is after end_date', async () => {
      try {
        const invalidTmnt = {          
          start_date_str: '2022-10-26',
          end_date_str: '2022-10-25',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when end_date is too far in the future', async () => {
      try {
        const invalidTmnt = {          
          end_date_str: '2300-10-24',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await privateApi.patch(oneTmntUrl + toPatchId, invalidJSON, {
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

  })

  describe('DELETE by ID - API: API: /api/tmnts/tmnt/:id', () => {

    const toDelTmnt = {
      ...initTmnt,
      id: "tmt_e134ac14c5234d708d26037ae812ac33",
      user_id: user1Id,
      tmnt_name: "Gold Pin to Delete",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
      start_date_str: '2026-08-19',
      end_date_str: '2026-08-19',
    }
    
    const repostTmnt = async () => {      
      const response = await privateApi.get(url);
      const tmnts = response.data.tmnts;
      const found = tmnts.find((t: tmntType) => t.id === toDelTmnt.id);
      if (!found) {
        try {
          const tmntJSON = JSON.stringify(toDelTmnt);
          await privateApi.post(url, tmntJSON, { withCredentials: true })                    
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    }

    let didDel = false

    beforeAll(async () => {
      await repostTmnt()
    })

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      await repostTmnt()
    })

    it('should delete a tmnt by ID', async () => {
      const response = await privateApi.delete(oneTmntUrl + toDelTmnt.id, { withCredentials: true })      
      expect(response.status).toBe(200);
      didDel = true;
      expect(response.data.count).toBe(1)
    })
    it('should return 0 when delete a tmnt by ID when ID is not found', async () => {
      const response = await privateApi.delete(oneTmntUrl + notFoundId, { withCredentials: true })      
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
    it('should NOT delete a tmnt by ID when ID is invalid', async () => {
      try {
        const response = await privateApi.delete(oneTmntUrl + 'test', { withCredentials: true })        
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a tmnt by ID when ID is valid, but not a tmnt ID', async () => {
      try {
        const response = await privateApi.delete(oneTmntUrl + nonTmntId, { withCredentials: true })        
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

  describe('DELETE by ID, also deletes child and grandchild rows - API: API: /api/tmnts/tmnt/:id', () => { 

    beforeAll(async () => {
      try {
        await deleteTmnt(mockTmntFullData.tmnt.id);        
        await deleteBowl(mockBowl.id);
        await deleteUser(mockUser.id);
        await postUser(mockUser);
        await postBowl(mockBowl);
      } catch {
        // do nothing if cannot delete
      }
    });

    afterAll(async () => {
      await deleteTmnt(mockTmntFullData.tmnt.id);
      await deleteBowl(mockBowl.id);
      await deleteUser(mockUser.id);
    });

    it('should delete a tmnt by ID, also deleting child rows', async () => {
      const tmntJSON = JSON.stringify(mockTmntFullData);

      const response = await privateApi.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON);
      expect(response.status).toBe(200);      
      expect(response.data.success).toBe(true);
      
      const delResponse = await privateApi.delete(oneTmntUrl + mockTmntFullData.tmnt.id);
      expect(delResponse.status).toBe(200);
      expect(delResponse.data.count).toBe(1);

      try {
        const getResponse = await privateApi.get(eventsUrl + mockTmntFullData.events[0].id);
        expect(getResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
      try {
        const getResponse = await privateApi.get(divsUrl + mockTmntFullData.divs[0].id);
        expect(getResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })    

  })
});
