import axios, { AxiosError } from "axios";
import { baseBowlsApi, baseEventsApi, baseTmntsApi, baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi, testBaseDivsApi, testBaseEventsApi, testBaseTmntsApi, testBaseUsersApi } from "../../../testApi";
import type { bowlType, brktSeedType, tmntType, userDataType } from "@/lib/types/types";
import { blankBrktSeed, initTmnt } from "@/lib/db/initVals";
import { removeTimeFromISODateStr } from "@/lib/dateTools";
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

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;
const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";
const tmntUrl = url + "/tmnt/";

const userUrl = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;

const bowlUrl = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;

const eventsUrl = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi + "/event/"
  : testBaseEventsApi + "/event/";

const divsUrl = testBaseDivsApi.startsWith("undefined")
  ? baseEventsApi + "/div/"
  : testBaseDivsApi + "/div/";

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

  const toPatchTmnt = {
    id: testTmnt.id,
    user_id: testTmnt.user_id,
  };

  const notFoundId = "tmt_01234567890123456789012345678901";
  const notFoundBowlId = "bwl_01234567890123456789012345678901";
  const nonTmntId = "evt_01234567890123456789012345678901";

  const bowl2Id = "bwl_8b4a5c35ad1247049532ff53a12def0a";
  const user1Id = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
  const user2Id = "usr_516a113083983234fc316e31fb695b85";

  const deleteTmnt = async (tmntId: string) => {

    try {
      await axios.delete(tmntUrl + tmntId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const resetTmnt = async () => {
    try {
      // make sure test tmnt is reset in database
      const tmntJSON = JSON.stringify(testTmnt);  
      await axios.put(tmntUrl + testTmnt.id, tmntJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deleteBowl = async (bowlId: string) => {
    try {
      await axios.delete(bowlUrl + '/bowl/' +  bowlId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await axios.delete(userUrl + '/user/' + userId, { withCredentials: true });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const postBowl = async (bowl: bowlType) => {
    try {
      const bowlJSON = JSON.stringify(bowl);
      await axios.post(bowlUrl, bowlJSON, { withCredentials: true });
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const postUser = async (user: userDataType) => {
    try {
      const userJSON = JSON.stringify(user);
      await axios.post(userUrl, userJSON, { withCredentials: true });
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
      const response = await axios.put(tmntUrl + testTmnt.id, tmntJSON, {
        withCredentials: true
      });
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
      const response = await axios.put(tmntUrl + testTmnt.id, tmntJSON, {
        withCredentials: true
      });
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
        const response = await axios.put(tmntUrl + 'invalid', tmntJSON, {
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
        const response = await axios.put(tmntUrl + notFoundTmntId, tmntJSON, {
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
        const response = await axios.put(tmntUrl + userId, tmntJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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
        const response = await axios.put(tmntUrl + invalidTmnt.id, invalidJSON, {
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

      const response = await axios.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON, {
        withCredentials: true,
      });
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
      expect(puttedTmnt.events).toHaveLength(mockTmntFullData.events.length);
      const event = puttedTmnt.events[0];
      const testEvent = mockTmntFullData.events[0];
      expect(event.id).toBe(testEvent.id);
      expect(event.tmnt_id).toBe(testEvent.tmnt_id);
      expect(event.event_name).toBe(testEvent.event_name);
      expect(event.team_size).toBe(testEvent.team_size);
      expect(event.games).toBe(testEvent.games);
      expect(event.entry_fee).toBe(testEvent.entry_fee);
      expect(event.lineage).toBe(testEvent.lineage);
      expect(event.prize_fund).toBe(testEvent.prize_fund);
      expect(event.other).toBe(testEvent.other);
      expect(event.expenses).toBe(testEvent.expenses);
      expect(event.added_money).toBe(testEvent.added_money);
      expect(event.sort_order).toBe(testEvent.sort_order);
      // divs
      expect(puttedTmnt.divs).toHaveLength(mockTmntFullData.divs.length);
      const divs = puttedTmnt.divs;
      const testDivs = mockTmntFullData.divs;
      for (let i = 0; i < divs.length; i++) {
        if (divs[i].id === testDivs[0].id) {
          expect(divs[i].tmnt_id).toBe(testDivs[0].tmnt_id);
          expect(divs[i].div_name).toBe(testDivs[0].div_name);
          expect(divs[i].hdcp_per).toBe(testDivs[0].hdcp_per);
          expect(divs[i].hdcp_from).toBe(testDivs[0].hdcp_from);
          expect(divs[i].int_hdcp).toBe(testDivs[0].int_hdcp);
          expect(divs[i].hdcp_for).toBe(testDivs[0].hdcp_for);
          expect(divs[i].sort_order).toBe(testDivs[0].sort_order);
        } else if (divs[i].id === testDivs[1].id) {
          expect(divs[i].tmnt_id).toBe(testDivs[1].tmnt_id);
          expect(divs[i].div_name).toBe(testDivs[1].div_name);
          expect(divs[i].hdcp_per).toBe(testDivs[1].hdcp_per);
          expect(divs[i].hdcp_from).toBe(testDivs[1].hdcp_from);
          expect(divs[i].int_hdcp).toBe(testDivs[1].int_hdcp);
          expect(divs[i].hdcp_for).toBe(testDivs[1].hdcp_for);
          expect(divs[i].sort_order).toBe(testDivs[1].sort_order);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // squads
      expect(puttedTmnt.squads).toHaveLength(mockTmntFullData.squads.length);
      const squad = puttedTmnt.squads[0];
      const testSquad = mockTmntFullData.squads[0];
      expect(squad.id).toBe(testSquad.id);
      expect(squad.event_id).toBe(testSquad.event_id);
      expect(squad.squad_name).toBe(testSquad.squad_name);
      expect(squad.games).toBe(testSquad.games);
      expect(squad.starting_lane).toBe(testSquad.starting_lane);
      expect(squad.lane_count).toBe(testSquad.lane_count);
      expect(squad.squad_date_str).toBe(testSquad.squad_date_str);
      expect(squad.squad_time).toBe(testSquad.squad_time);
      expect(squad.sort_order).toBe(testSquad.sort_order);

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
      expect(puttedTmnt.lanes).toHaveLength(mockTmntFullData.lanes.length);
      const lanes = puttedTmnt.lanes;
      const testLanes = mockTmntFullData.lanes;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i].id === testLanes[0].id) {
          expect(lanes[i].squad_id).toBe(testLanes[0].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[0].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[0].in_use);
        } else if (lanes[i].id === testLanes[1].id) {
          expect(lanes[i].squad_id).toBe(testLanes[1].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[1].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[1].in_use);
        } else if (lanes[i].id === testLanes[2].id) {
          expect(lanes[i].squad_id).toBe(testLanes[2].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[2].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[2].in_use);
        } else if (lanes[i].id === testLanes[3].id) {
          expect(lanes[i].squad_id).toBe(testLanes[3].squad_id);
          expect(lanes[i].lane_number).toBe(testLanes[3].lane_number);
          expect(lanes[i].in_use).toBe(testLanes[3].in_use);
        } else {
          expect(true).toBeFalsy();
        }
      }

      // optional child tables
      // pots
      expect(puttedTmnt.pots).toHaveLength(mockTmntFullData.pots.length);
      const pots = puttedTmnt.pots;
      const testPots = mockTmntFullData.pots;
      for (let i = 0; i < pots.length; i++) {
        if (pots[i].id === testPots[0].id) {
          expect(pots[0].squad_id).toBe(testPots[0].squad_id);
          expect(pots[0].div_id).toBe(testPots[0].div_id);
          expect(pots[0].sort_order).toBe(testPots[0].sort_order);
          expect(pots[0].fee).toBe(testPots[0].fee);
          expect(pots[0].pot_type).toBe(testPots[0].pot_type);
        } else if (pots[i].id === testPots[1].id) {
          expect(pots[1].squad_id).toBe(testPots[1].squad_id);
          expect(pots[1].div_id).toBe(testPots[1].div_id);
          expect(pots[1].sort_order).toBe(testPots[1].sort_order);
          expect(pots[1].fee).toBe(testPots[1].fee);
          expect(pots[1].pot_type).toBe(testPots[1].pot_type);
        } else if (pots[i].id === testPots[2].id) {
          expect(pots[2].squad_id).toBe(testPots[2].squad_id);
          expect(pots[2].div_id).toBe(testPots[2].div_id);
          expect(pots[2].sort_order).toBe(testPots[2].sort_order);
          expect(pots[2].fee).toBe(testPots[2].fee);
          expect(pots[2].pot_type).toBe(testPots[2].pot_type);
        } else if (pots[i].id === testPots[3].id) {
          expect(pots[3].squad_id).toBe(testPots[3].squad_id);
          expect(pots[3].div_id).toBe(testPots[3].div_id);
          expect(pots[3].sort_order).toBe(testPots[3].sort_order);
          expect(pots[3].fee).toBe(testPots[3].fee);
          expect(pots[3].pot_type).toBe(testPots[3].pot_type);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // brkts
      expect(puttedTmnt.brkts).toHaveLength(mockTmntFullData.brkts.length);
      const brkts = puttedTmnt.brkts;
      const testBrkts = mockTmntFullData.brkts;
      for (let i = 0; i < brkts.length; i++) {
        if (brkts[i].id === testBrkts[0].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[0].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[0].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[0].sort_order);
          expect(brkts[i].start).toBe(testBrkts[0].start);
          expect(brkts[i].games).toBe(testBrkts[0].games);
          expect(brkts[i].players).toBe(testBrkts[0].players);
          expect(brkts[i].fee).toBe(testBrkts[0].fee);
          expect(brkts[i].first).toBe(testBrkts[0].first);
          expect(brkts[i].second).toBe(testBrkts[0].second);
          expect(brkts[i].admin).toBe(testBrkts[0].admin);
        } else if (brkts[i].id === testBrkts[1].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[1].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[1].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[1].sort_order);
          expect(brkts[i].start).toBe(testBrkts[1].start);
          expect(brkts[i].games).toBe(testBrkts[1].games);
          expect(brkts[i].players).toBe(testBrkts[1].players);
          expect(brkts[i].fee).toBe(testBrkts[1].fee);
          expect(brkts[i].first).toBe(testBrkts[1].first);
          expect(brkts[i].second).toBe(testBrkts[1].second);
          expect(brkts[i].admin).toBe(testBrkts[1].admin);
        } else if (brkts[i].id === testBrkts[2].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[2].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[2].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[2].sort_order);
          expect(brkts[i].start).toBe(testBrkts[2].start);
          expect(brkts[i].games).toBe(testBrkts[2].games);
          expect(brkts[i].players).toBe(testBrkts[2].players);
          expect(brkts[i].fee).toBe(testBrkts[2].fee);
          expect(brkts[i].first).toBe(testBrkts[2].first);
          expect(brkts[i].second).toBe(testBrkts[2].second);
          expect(brkts[i].admin).toBe(testBrkts[2].admin);
        } else if (brkts[i].id === testBrkts[3].id) {
          expect(brkts[i].squad_id).toBe(testBrkts[3].squad_id);
          expect(brkts[i].div_id).toBe(testBrkts[3].div_id);
          expect(brkts[i].sort_order).toBe(testBrkts[3].sort_order);
          expect(brkts[i].start).toBe(testBrkts[3].start);
          expect(brkts[i].games).toBe(testBrkts[3].games);
          expect(brkts[i].players).toBe(testBrkts[3].players);
          expect(brkts[i].fee).toBe(testBrkts[3].fee);
          expect(brkts[i].first).toBe(testBrkts[3].first);
          expect(brkts[i].second).toBe(testBrkts[3].second);
          expect(brkts[i].admin).toBe(testBrkts[3].admin);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // elims
      expect(puttedTmnt.elims).toHaveLength(mockTmntFullData.elims.length);
      const elims = puttedTmnt.elims;
      const testElims = mockTmntFullData.elims;
      for (let i = 0; i < elims.length; i++) {
        if (elims[i].id === testElims[0].id) {
          expect(elims[i].squad_id).toBe(testElims[0].squad_id);
          expect(elims[i].div_id).toBe(testElims[0].div_id);
          expect(elims[i].sort_order).toBe(testElims[0].sort_order);
          expect(elims[i].start).toBe(testElims[0].start);
          expect(elims[i].games).toBe(testElims[0].games);
          expect(elims[i].fee).toBe(testElims[0].fee);
        } else if (elims[i].id === testElims[1].id) {
          expect(elims[i].squad_id).toBe(testElims[1].squad_id);
          expect(elims[i].div_id).toBe(testElims[1].div_id);
          expect(elims[i].sort_order).toBe(testElims[1].sort_order);
          expect(elims[i].start).toBe(testElims[1].start);
          expect(elims[i].games).toBe(testElims[1].games);
          expect(elims[i].fee).toBe(testElims[1].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }

      // run tmnt grandchild / great grandchild tables
      // players
      expect(puttedTmnt.players).toHaveLength(mockTmntFullData.players.length);
      const players = puttedTmnt.players;
      const testPlayers = mockTmntFullData.players;
      for (let i = 0; i < players.length; i++) {
        if (players[i].id === testPlayers[0].id) {
          expect(players[i].squad_id).toBe(testPlayers[0].squad_id);
          expect(players[i].first_name).toBe(testPlayers[0].first_name);
          expect(players[i].last_name).toBe(testPlayers[0].last_name);
          expect(players[i].average).toBe(testPlayers[0].average);
          expect(players[i].lane).toBe(testPlayers[0].lane);
          expect(players[i].position).toBe(testPlayers[0].position);
        } else if (players[i].id === testPlayers[1].id) {
          expect(players[i].squad_id).toBe(testPlayers[1].squad_id);
          expect(players[i].first_name).toBe(testPlayers[1].first_name);
          expect(players[i].last_name).toBe(testPlayers[1].last_name);
          expect(players[i].average).toBe(testPlayers[1].average);
          expect(players[i].lane).toBe(testPlayers[1].lane);
          expect(players[i].position).toBe(testPlayers[1].position);
        } else if (players[i].id === testPlayers[2].id) {
          expect(players[i].squad_id).toBe(testPlayers[2].squad_id);
          expect(players[i].first_name).toBe(testPlayers[2].first_name);
          expect(players[i].last_name).toBe(testPlayers[2].last_name);
          expect(players[i].average).toBe(testPlayers[2].average);
          expect(players[i].lane).toBe(testPlayers[2].lane);
          expect(players[i].position).toBe(testPlayers[2].position);
        } else if (players[i].id === testPlayers[3].id) {
          expect(players[i].squad_id).toBe(testPlayers[3].squad_id);
          expect(players[i].first_name).toBe(testPlayers[3].first_name);
          expect(players[i].last_name).toBe(testPlayers[3].last_name);
          expect(players[i].average).toBe(testPlayers[3].average);
          expect(players[i].lane).toBe(testPlayers[3].lane);
          expect(players[i].position).toBe(testPlayers[3].position);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // div entries
      expect(puttedTmnt.divEntries).toHaveLength(
        mockTmntFullData.divEntries.length
      );
      const divEntries = puttedTmnt.divEntries;
      const testDivEntries = mockTmntFullData.divEntries;
      for (let i = 0; i < divEntries.length; i++) {
        if (divEntries[i].id === testDivEntries[0].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[0].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[0].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[0].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[0].fee);
        } else if (divEntries[i].id === testDivEntries[1].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[1].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[1].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[1].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[1].fee);
        } else if (divEntries[i].id === testDivEntries[2].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[2].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[2].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[2].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[2].fee);
        } else if (divEntries[i].id === testDivEntries[3].id) {
          expect(divEntries[i].squad_id).toBe(testDivEntries[3].squad_id);
          expect(divEntries[i].div_id).toBe(testDivEntries[3].div_id);
          expect(divEntries[i].player_id).toBe(testDivEntries[3].player_id);
          expect(divEntries[i].fee).toBe(testDivEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // potEntries
      expect(puttedTmnt.potEntries).toHaveLength(
        mockTmntFullData.potEntries.length
      );
      const potEntries = puttedTmnt.potEntries;
      const testPotEntries = mockTmntFullData.potEntries;
      for (let i = 0; i < potEntries.length; i++) {
        if (potEntries[i].id === testPotEntries[0].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[0].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[0].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[0].fee);
        } else if (potEntries[i].id === testPotEntries[1].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[1].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[1].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[1].fee);
        } else if (potEntries[i].id === testPotEntries[2].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[2].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[2].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[2].fee);
        } else if (potEntries[i].id === testPotEntries[3].id) {
          expect(potEntries[i].pot_id).toBe(testPotEntries[3].pot_id);
          expect(potEntries[i].player_id).toBe(testPotEntries[3].player_id);
          expect(potEntries[i].fee).toBe(testPotEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // bracketEntries
      expect(puttedTmnt.brktEntries).toHaveLength(
        mockTmntFullData.brktEntries.length
      );
      const brktEntries = puttedTmnt.brktEntries;
      const testBrktEntries = mockTmntFullData.brktEntries;
      for (let i = 0; i < brktEntries.length; i++) {
        if (brktEntries[i].id === testBrktEntries[0].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[0].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[0].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[0].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(
            testBrktEntries[0].num_refunds
          );
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[0].fee);
          expect(brktEntries[i].time_stamp).toBe(testBrktEntries[0].time_stamp);
        } else if (brktEntries[i].id === testBrktEntries[1].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[1].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[1].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[1].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(0);
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[1].fee);
          expect(brktEntries[i].time_stamp).toBe(testBrktEntries[1].time_stamp);
        } else if (brktEntries[i].id === testBrktEntries[2].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[2].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[2].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[2].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(
            testBrktEntries[2].num_refunds
          );
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[2].fee);
          expect(brktEntries[i].time_stamp).toBe(testBrktEntries[2].time_stamp);
        } else if (brktEntries[i].id === testBrktEntries[3].id) {
          expect(brktEntries[i].brkt_id).toBe(testBrktEntries[3].brkt_id);
          expect(brktEntries[i].player_id).toBe(testBrktEntries[3].player_id);
          expect(brktEntries[i].num_brackets).toBe(
            testBrktEntries[3].num_brackets
          );
          expect(brktEntries[i].num_refunds).toBe(0);
          expect(brktEntries[i].fee + "").toBe(testBrktEntries[3].fee);
          expect(brktEntries[i].time_stamp).toBe(testBrktEntries[3].time_stamp);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // oneBrkts
      expect(puttedTmnt.oneBrkts).toHaveLength(
        mockTmntFullData.oneBrkts.length
      );
      const oneBrkts = puttedTmnt.oneBrkts;
      const testOneBrkts = mockTmntFullData.oneBrkts;
      for (let i = 0; i < oneBrkts.length; i++) {
        if (oneBrkts[i].id === testOneBrkts[0].id) {
          expect(oneBrkts[i].brkt_id).toBe(testOneBrkts[0].brkt_id);
          expect(oneBrkts[i].bindex).toBe(testOneBrkts[0].bindex);
        } else if (oneBrkts[i].id === testOneBrkts[1].id) {
          expect(oneBrkts[i].brkt_id).toBe(testOneBrkts[1].brkt_id);
          expect(oneBrkts[i].bindex).toBe(testOneBrkts[1].bindex);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // brktSeeds
      expect(puttedTmnt.brktSeeds).toHaveLength(
        mockTmntFullData.brktSeeds.length
      );
      const brktSeeds = puttedTmnt.brktSeeds;
      const testBrktSeeds = mockTmntFullData.brktSeeds;
      for (let i = 0; i < brktSeeds.length; i++) {
        if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[0].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[0].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[0].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[0].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[1].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[1].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[1].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[1].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[2].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[2].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[2].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[2].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[3].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[3].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[3].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[3].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[4].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[4].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[4].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[4].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[5].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[5].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[5].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[5].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[6].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[6].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[6].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[6].player_id);
        } else if (
          brktSeeds[i].one_brkt_id === testBrktSeeds[7].one_brkt_id &&
          brktSeeds[i].seed === testBrktSeeds[7].seed
        ) {
          expect(brktSeeds[i].one_brkt_id).toBe(testBrktSeeds[7].one_brkt_id);
          expect(brktSeeds[i].player_id).toBe(testBrktSeeds[7].player_id);
        } else {
          expect(true).toBeFalsy();
        }
      }
      // elimEntries
      expect(puttedTmnt.elimEntries).toHaveLength(
        mockTmntFullData.elimEntries.length
      );
      const elimEntries = puttedTmnt.elimEntries;
      const testElimEntries = mockTmntFullData.elimEntries;
      for (let i = 0; i < elimEntries.length; i++) {
        if (elimEntries[i].id === testElimEntries[0].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[0].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[0].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[0].fee);
        } else if (elimEntries[i].id === testElimEntries[1].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[1].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[1].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[1].fee);
        } else if (elimEntries[i].id === testElimEntries[2].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[2].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[2].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[2].fee);
        } else if (elimEntries[i].id === testElimEntries[3].id) {
          expect(elimEntries[i].elim_id).toBe(testElimEntries[3].elim_id);
          expect(elimEntries[i].player_id).toBe(testElimEntries[3].player_id);
          expect(elimEntries[i].fee).toBe(testElimEntries[3].fee);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should PUT (replace) a full tmnt; stage info: stage = 'SCORES", async () => {
      const stageTmntFullData = cloneDeep(mockTmntFullData);

      // set SCORES stage - need to set scores_started_at for test
      stageTmntFullData.stage.scores_started_at = new Date().toISOString();
      stageTmntFullData.stage.stage = SquadStage.SCORES;      

      const before = Date.now();
      const tmntJSON = JSON.stringify(stageTmntFullData);

      const response = await axios.put(
        fullUrl + stageTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
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

      const response = await axios.put(
        fullUrl + stageTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          tmntJSON,
          {
            withCredentials: true,
          }
        );
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
      const response = await axios.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON, {
        withCredentials: true,
      });

      expect(response.status).toBe(200);
      updatedTmnt = true;
      expect(response.data.success).toBe(true);
      const getTmntResponse1 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.tmnt.tmnt_name = 'Rollback';
      invalidTmnt.pots[1].id = invalidTmnt.pots[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
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
      const response = await axios.put(
        fullUrl + mockTmntFullData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );
      
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
      const response = await axios.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON,
        {
          withCredentials: true,
        }
      );
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
      const response = await axios.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON,
        {
          withCredentials: true,
        }
      );
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
      const response = await axios.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON,
        {
          withCredentials: true,
        }
      );
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
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
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
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
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
      const getTmntResponse1 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(getTmntResponse1.status).toBe(200);
      const tmntFullData1 = getTmntResponse1.data.tmntFullData;
      expect(tmntFullData1.tmnt_name).toBe(mockTmntFullData.tmnt.tmnt_name);

      const invalidTmnt = cloneDeep(mockTmntFullData);
      invalidTmnt.players[0].first_name = 'Rollback';
      invalidTmnt.elimEntries[1].id = invalidTmnt.elimEntries[0].id; // create dupilcate id's
      const invalidTmntJSON = JSON.stringify(invalidTmnt);
      try {
        const response = await axios.put(
          fullEntriesUrl + mockTmntFullData.tmnt.id,
          invalidTmntJSON,
          {
            withCredentials: true,
          }
        );
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
      const getTmntResponse2 = await axios.get(fullUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
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
      const response = await axios.put(
        fullUrl + byeData.tmnt.id,
        tmntJSON,
        {
          withCredentials: true,
        }
      );

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
      const response2 = await axios.put(
        fullEntriesUrl + tmntEntries.tmnt.id,
        tmntEntriesJSON,
        {
          withCredentials: true,
        }
      );

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

    beforeAll(async () => {
      await resetTmnt();
    })

    afterEach(async () => {
      await resetTmnt();
    })

    it('should patch a tmnt tmnt_name by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        tmnt_name: 'patched tmnt name',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(tmntUrl  + toPatchTmnt.id, tmntJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe(patchTmnt.tmnt_name);
    })
    it('should patch a tmnt by ID whith a sanitized tmnt_name', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        tmnt_name: "    <script>Patched</script>   ",
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await axios({
        method: "patch",
        data: tmntJSON,
        withCredentials: true,
        url: tmntUrl  + toPatchTmnt.id,
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.tmnt_name).toBe("scriptPatchedscript");
    })
    it('should patch a tmnt bowl_id by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        bowl_id: bowl2Id,
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(tmntUrl  + toPatchTmnt.id, tmntJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(patchedTmnt.bowl_id).toBe(patchTmnt.bowl_id);
    })
    it('should patch a tmnt start_date by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        start_date_str: '2022-08-22',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(tmntUrl  + toPatchTmnt.id, tmntJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.start_date)).toBe(patchTmnt.start_date_str);
    })
    it('should patch a tmnt end_date by ID', async () => {
      const patchTmnt = {
        ...toPatchTmnt,
        end_date_str: '2022-10-26',
      }
      const tmntJSON = JSON.stringify(patchTmnt);
      const response = await axios.patch(tmntUrl  + toPatchTmnt.id, tmntJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      expect(removeTimeFromISODateStr(patchedTmnt.end_date)).toBe(patchTmnt.end_date_str);
    })
    it('should NOT patch a tmnt user_id by ID', async () => {
      const invalidTmnt = {
        ...toPatchTmnt,
        user_id: user2Id,
      }
      const invalidJSON = JSON.stringify(invalidTmnt);
      const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
        withCredentials: true
      })
      expect(response.status).toBe(200);
      const patchedTmnt = response.data.tmnt;
      // for user_id, compare to blankTmnt.user_id
      expect(patchedTmnt.user_id).toBe(toPatchTmnt.user_id);
    })
    it('should NOT patch a tmnt when ID is invalid', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const response = await axios.patch(tmntUrl  + 'test', tmntJSON, {
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
    it('should NOT patch a tmnt when ID is not found', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const response = await axios.patch(tmntUrl  + notFoundId, tmntJSON, {
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
    it('should NOT patch a tmnt when ID is valid, but not a tmnt ID', async () => {
      try {
        const patchTmnt = {
          ...toPatchTmnt,
          tmnt_name: 'patched tmnt name',
        }
        const tmntJSON = JSON.stringify(patchTmnt);
        const response = await axios.patch(tmntUrl  + nonTmntId, tmntJSON, {
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
    it('should NOT patch a tmnt by ID when tmnt_name is missing', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          tmnt_name: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when user_id is missing', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          user_id: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when bowl_id is missing', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          bowl_id: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when start_date is blank', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          start_date_str: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          end_date_str: '',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          tmnt_name: 'a'.repeat(101),
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          start_date_str: '2022-10-26',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          start_date_str: '1800-10-24',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          end_date_str: '2300-10-24',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          bowl_id: 'invalid',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          bowl_id: notFoundId, // tmnt id
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
          ...toPatchTmnt,
          bowl_id: notFoundBowlId, // tmnt id
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when user_id is invalid', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          user_id: 'invalid',
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
    it('should NOT patch a tmnt by ID when user_id is valid, bit not a user ID', async () => {
      try {
        const invalidTmnt = {
          ...toPatchTmnt,
          user_id: notFoundId, // tmnt id
        }
        const invalidJSON = JSON.stringify(invalidTmnt);
        const response = await axios.patch(tmntUrl  + invalidTmnt.id, invalidJSON, {
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
      const response = await axios.get(url);
      const tmnts = response.data.tmnts;
      const found = tmnts.find((t: tmntType) => t.id === toDelTmnt.id);
      if (!found) {
        try {
          const tmntJSON = JSON.stringify(toDelTmnt);
          await axios.post(url, tmntJSON, { withCredentials: true })                    
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
      const response = await axios.delete(tmntUrl + toDelTmnt.id, { withCredentials: true })      
      expect(response.status).toBe(200);
      didDel = true;
      expect(response.data.count).toBe(1)
    })
    // it('should return 0 when delete a tmnt by ID when ID is not found', async () => {
    //   const response = await axios.delete(tmntUrl + notFoundId, { withCredentials: true })      
    //   expect(response.status).toBe(200);
    //   expect(response.data.count).toBe(0);
    // })
    // it('should NOT delete a tmnt by ID when ID is invalid', async () => {
    //   try {
    //     const response = await axios.delete(tmntUrl + 'test', { withCredentials: true })        
    //     expect(response.status).toBe(404);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(404);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }
    //   }
    // })
    // it('should NOT delete a tmnt by ID when ID is valid, but not a tmnt ID', async () => {
    //   try {
    //     const response = await axios.delete(tmntUrl + nonTmntId, { withCredentials: true })        
    //     expect(response.status).toBe(404);
    //   } catch (err) {
    //     if (err instanceof AxiosError) {
    //       expect(err.response?.status).toBe(404);
    //     } else {
    //       expect(true).toBeFalsy();
    //     }
    //   }
    // })
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

      const response = await axios.put(fullUrl + mockTmntFullData.tmnt.id, tmntJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(200);      
      expect(response.data.success).toBe(true);
      
      const delResponse = await axios.delete(tmntUrl + mockTmntFullData.tmnt.id, {
        withCredentials: true,
      });
      expect(delResponse.status).toBe(200);
      expect(delResponse.data.count).toBe(1);

      try {
        const getResponse = await axios.get(eventsUrl + mockTmntFullData.events[0].id);
        expect(getResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
      try {
        const getResponse = await axios.get(divsUrl + mockTmntFullData.divs[0].id);
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
