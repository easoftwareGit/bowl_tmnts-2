import axios, { AxiosError } from "axios";
import { baseStagesApi } from "@/lib/api/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import type { fullStageType, justStageType, tmntFullType } from "@/lib/types/types";
import {
  getFullStageForSquad,
  getJustStage,
  getJustStageOverride,
  postFullStage,
  patchJustStage,
  patchJustStageOverride,
  deleteFullStage,
  postInitialStageForSquad
} from "@/lib/db/stages/dbStages";
import { SquadStage } from "@prisma/client";
import { linkedInitTmntFullData } from "@/lib/db/initVals";
import { mockSquadsToPost, mockStageToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { deleteSquad, postSquad } from "@/lib/db/squads/dbSquads";
import { isValidBtDbId, maxReasonLength } from "@/lib/validation/validation";

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

const url = testBaseStagesApi.startsWith("undefined")
  ? baseStagesApi
  : testBaseStagesApi;
const oneStageUrl = url + "/stage/";
const testStageUrl = url + "/testing/";

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5"
const eventId = "evt_cb97b73cb538418ab993fc867f860510";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";
const notFoundStageId = "stg_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";

// from prisma/seed.ts
const testStage: fullStageType = {
  id: stageId,
  squad_id: squadId,
  stage: "DEFINE",
  stage_set_at: '2022-10-23T12:00:00.000Z',
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',
}
const wholeTmntStage: fullStageType = {
  id: "stg_124dd9efc30f4352b691dfd93d1e284e",
  squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
  stage: "ENTRIES",
  stage_set_at: new Date("2024-07-01").toISOString(),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',
}

const testStageAllFields: fullStageType = {
  id: stageId,
  squad_id: squadId,
  stage: "SCORES",
  stage_set_at: new Date("2022-10-23").toISOString(),
  scores_started_at: null,
  stage_override_enabled: true,
  stage_override_at: null,
  stage_override_reason: 'Test override reason',
}

const testOverrideStage: fullStageType = {
  id: stageId,
  squad_id: squadId,
  stage: "ENTRIES",
  stage_set_at: new Date("2022-10-23").toISOString(),  
  scores_started_at: null,
  stage_override_enabled: true,
  stage_override_at: new Date("2022-10-23").toISOString(),
  stage_override_reason: 'Test override reason',
}

const validFullTmnt: tmntFullType = linkedInitTmntFullData(userId)
validFullTmnt.tmnt.id = tmntId;
validFullTmnt.events[0].tmnt_id = tmntId;
validFullTmnt.events[0].id = eventId;
validFullTmnt.squads[0].event_id = eventId;
validFullTmnt.squads[0].id = squadId;

const deletePostedStage = async (stageId: string) => {
  const response = await axios.get(url);
  const stages = response.data.stages;
  const toDel = stages.find((s: fullStageType) => s.id === stageId);
  if (toDel) {
    try {      
      const delResponse = await axios.delete(
        oneStageUrl + toDel.id,
        { withCredentials: true }
    );
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }
}

const resetStage = async (fullStage: fullStageType) => {
  // make sure fullStage is reset in database
  try {
    const stageJSON = JSON.stringify(fullStage);
    const response = await axios.put(
      testStageUrl + fullStage.id,
      stageJSON,
      { withCredentials: true }
    );
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

const rePostStage = async (fullStage: fullStageType) => {
  try {
    // if stage already in database, then don't re-post
    const getResponse = await axios.get(oneStageUrl + fullStage.id);
    const found = getResponse.data.stage;
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
    const stageJSON = JSON.stringify(fullStage);
    const response = await axios({
      method: "post",
      withCredentials: true,
      url: url,
      data: stageJSON,
    });
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
};

describe("dbStages", () => {

  describe('getFullStageForSquad()', () => {
    it("should return a stage", async () => {
      const fullStage = await getFullStageForSquad(testStage.squad_id);
      expect(fullStage).toBeDefined();
      expect(fullStage).not.toBeNull();
      if (fullStage == null) return;
      expect(fullStage.id).toBe(testStage.id);
      expect(fullStage.stage_set_at).toEqual(testStage.stage_set_at);
      expect(fullStage.stage).toBe(testStage.stage);
      expect(fullStage.squad_id).toBe(testStage.squad_id);
      expect(fullStage.scores_started_at).toBe(testStage.scores_started_at);
      expect(fullStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(fullStage.stage_override_at).toEqual(testStage.stage_override_at);
      expect(fullStage.stage_override_reason).toBe(testStage.stage_override_reason);
    });
    it("should return null if squad id does not exist", async () => {
      try {
        await getFullStageForSquad(notFoundSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getFullStageForSquad failed: Request failed with status code 404");
      }
    });
    it('should return null if squad id is invalid', async () => {
      try {
        await getFullStageForSquad('testing');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should return null if squad id is valid, but not a squad id", async () => {
      try {
        await getFullStageForSquad(testStage.id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it('should return null if passed null or undefined', async () => {
      try {
        await getFullStageForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
      try {
        await getFullStageForSquad(undefined as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  })

  describe('getJustStage()', () => {
    it('should return justStage when passed stage id ', async () => {
      const justStage = await getJustStage(validFullTmnt.squads[0].id);
      expect(justStage).toBeDefined();
      expect(justStage).not.toBeNull();
      if (justStage == null) return;
      expect(justStage.id).toBe(testStage.id);
      expect(justStage.squad_id).toBe(testStage.squad_id);
      expect(justStage.stage_set_at).toEqual(testStage.stage_set_at);
      expect(justStage.stage).toBe(testStage.stage);
      expect(justStage.squad_id).toBe(testStage.squad_id);
      expect(justStage.scores_started_at).toBe(testStage.scores_started_at);
    })
    it('should return justStage when passed full tmnt', async () => {
      const justStage = await getJustStage(validFullTmnt);
      expect(justStage).toBeDefined();
      expect(justStage).not.toBeNull();
      if (justStage == null) return;
      expect(justStage.id).toBe(testStage.id);
      expect(justStage.squad_id).toBe(testStage.squad_id);
      expect(justStage.stage_set_at).toEqual(testStage.stage_set_at);
      expect(justStage.stage).toBe(testStage.stage);
      expect(justStage.squad_id).toBe(testStage.squad_id);
      expect(justStage.scores_started_at).toBe(testStage.scores_started_at);
    })
    it('should throw error if stage id does not exist', async () => {
      try {
        await getJustStage(notFoundStageId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getJustStage failed: Invalid squad id");
      }
    })
    it('should throw error if stage id is invalid', async () => {
      try {
        await getJustStage('testing');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getJustStage failed: Invalid squad id");
      }
    })
    it('should throw error if stage id is valid, but not a stage id', async () => {
      try {
        await getJustStage(testStage.id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getJustStage failed: Invalid squad id");
      }
    })
    it('should throw error if passed non object', async () => {
      try {
        await getJustStage('test' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getJustStage failed: Invalid squad id");
      }
    })
    it('should throw error if passed non tournament object', async () => {
      try {
        await getJustStage(validFullTmnt.events[0] as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if passed null or undefined', async () => {
      try {
        await getJustStage(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
      try {
        await getJustStage(undefined as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
  })

  describe('getJustStageOverride()', () => {
    it('should return justStageOverride when passed squadId', async () => {
      const justStage = await getJustStageOverride(validFullTmnt.squads[0].id);
      expect(justStage).toBeDefined();
      expect(justStage).not.toBeNull();
      if (justStage == null) return;
      expect(justStage.id).toBe(testStage.id);
      expect(justStage.squad_id).toEqual(testStage.squad_id);
      expect(justStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(justStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(justStage.stage_override_reason).toBe(testStage.stage_override_reason);
    })
    it('should return justStageOverride when passed full tmnt', async () => {
      const justStage = await getJustStageOverride(validFullTmnt);
      expect(justStage).toBeDefined();
      expect(justStage).not.toBeNull();
      if (justStage == null) return;
      expect(justStage.id).toBe(testStage.id);
      expect(justStage.squad_id).toBe(testStage.squad_id);
      expect(justStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(justStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(justStage.stage_override_reason).toBe(testStage.stage_override_reason);
    })
    it('should throw error if squad id does not exist', async () => {
      try {
        await getJustStageOverride(notFoundSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("getFullStageForSquad failed: Request failed with status code 404");
      }
    })
    it('should throw error if squad id is invalid', async () => {
      try {
        await getJustStageOverride('testing');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if squad id is valid, but not a squad id', async () => {
      try {
        await getJustStageOverride(testStage.id);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if passed non object', async () => {
      try {
        await getJustStageOverride('test' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if passed non tournament object', async () => {
      try {
        await getJustStageOverride(validFullTmnt.events[0] as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should throw error if passed null or undefined', async () => {
      try {
        await getJustStageOverride(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
      try {
        await getJustStageOverride(undefined as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
  })

  describe('postFullStage()', () => {

    let didPost: boolean = false;

    beforeAll(async () => {
      await deleteSquad(mockSquadsToPost[0].id); // also deletes posted mock stage      
      await postSquad(mockSquadsToPost[0]);
    })

    beforeEach(async () => {
      didPost = false;
    })

    afterEach(async () => {
      if (didPost) await deletePostedStage(mockStageToPost.id);
    })

    afterAll(async () => {
      await deleteSquad(mockSquadsToPost[0].id); // also deletes posted mock stage      
    })

    it('should post a full stage', async () => {
      const before = Date.now();
      const postedStage = await postFullStage(mockStageToPost);
      expect(postedStage).toBeDefined();
      expect(postedStage).not.toBeNull();
      didPost = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();

      if (postedStage == null) return;
      expect(postedStage.id).toBe(mockStageToPost.id);
      expect(postedStage.squad_id).toBe(mockStageToPost.squad_id);
      expect(postedStage.stage).toBe(mockStageToPost.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(postedStage.scores_started_at).toBe(mockStageToPost.scores_started_at);
      expect(postedStage.stage_override_enabled).toBe(mockStageToPost.stage_override_enabled);
      expect(postedStage.stage_override_at).toBe(mockStageToPost.stage_override_at);
      expect(postedStage.stage_override_reason).toBe(mockStageToPost.stage_override_reason);
    })
    it('should post a full stage - all fields', async () => {
      const before = Date.now();
      const allStageFields: fullStageType = {
        ...mockStageToPost,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: "test reason"
      }

      const postedStage = await postFullStage(allStageFields);
      expect(postedStage).toBeDefined();
      expect(postedStage).not.toBeNull();
      didPost = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(postedStage.scores_started_at!).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at!).getTime();
            
      expect(postedStage.id).toBe(allStageFields.id);
      expect(postedStage.squad_id).toBe(allStageFields.squad_id);
      expect(postedStage.stage).toBe(allStageFields.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(postedStage.stage_override_enabled).toBe(allStageFields.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(postedStage.stage_override_reason).toBe(allStageFields.stage_override_reason);
    })
    it('should post a full stage - all fields and ignore dates passed in. system sets dates', async () => {
      const before = new Date();
      const dateStr = "2022-01-01T00:00:00.000Z"
      const ignoreDatesStage: fullStageType = {
        ...mockStageToPost,
        stage: SquadStage.SCORES,
        stage_set_at: dateStr,
        scores_started_at: dateStr,
        stage_override_enabled: true,
        stage_override_at: dateStr,
        stage_override_reason: 'test reason',
      };

      const postedStage = await postFullStage(ignoreDatesStage);
      expect(postedStage).toBeDefined();
      expect(postedStage).not.toBeNull();
      didPost = true;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(postedStage.scores_started_at!).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at!).getTime();
            
      expect(postedStage.id).toBe(ignoreDatesStage.id);
      expect(postedStage.squad_id).toBe(ignoreDatesStage.squad_id);
      expect(postedStage.stage).toBe(ignoreDatesStage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_enabled).toBe(ignoreDatesStage.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_reason).toBe(ignoreDatesStage.stage_override_reason);
    })
    it('should NOT post a full stage when id is missing', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: null as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when id is invalid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: 'test',
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when id is valid, but not a stage id', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: squadId,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when squad id is missing', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: null as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when squad id is invalid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: 'test',
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    });
    it('should NOT post a full stage when squad id is valid, but not a squad id', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: userId,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage is missing', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage: null as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage is invalid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage: 'test' as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enabled is missing', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: null as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enabled is invalid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: 'test' as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enable = true and stage_override_reason is missing', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: true,
        stage_override_reason: null as any,
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enabled = true and stage_override_reason is blank', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: true,
        stage_override_reason: '',
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enabled = true and stage_override_reason is invalid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: true,
        stage_override_reason: 'a'.repeat(maxReasonLength + 1),
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should NOT post a full stage when stage_override_enabled = false and stage_override_reason is valid', async () => {
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: false,
        stage_override_reason: 'testinng',
      };
      try {
        await postFullStage(invalidStage);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage data");
      }
    })
    it('should post a full stage when sanitized', async () => {
      const before = new Date();
      const sanitizedStage: fullStageType = {
        ...mockStageToPost,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: '<alert>   test reason  ***   </alert>',
      };

      const postedStage = await postFullStage(sanitizedStage);
      expect(postedStage).toBeDefined();
      expect(postedStage).not.toBeNull();
      didPost = true;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(postedStage.scores_started_at!).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at!).getTime();
            
      expect(postedStage.id).toBe(sanitizedStage.id);
      expect(postedStage.squad_id).toBe(sanitizedStage.squad_id);
      expect(postedStage.stage).toBe(sanitizedStage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_enabled).toBe(sanitizedStage.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_reason).toBe('test reason');
    })

  })

  describe('postInitialStageForSquad()', () => { 

    let didPost: boolean = false;

    beforeAll(async () => {
      await deleteSquad(mockSquadsToPost[0].id); // also deletes posted mock stage      
      await postSquad(mockSquadsToPost[0]);
    })

    beforeEach(async () => {
      didPost = false;
    })

    afterEach(async () => {
      if (didPost) await deletePostedStage(mockStageToPost.id);
    })

    afterAll(async () => {
      await deleteSquad(mockSquadsToPost[0].id); // also deletes posted mock stage      
    })

    it('should post an initial full stage', async () => {
      const before = Date.now();
      const initialStage = await postInitialStageForSquad(mockStageToPost.squad_id);
      expect(initialStage).toBeDefined();
      expect(initialStage).not.toBeNull();
      didPost = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(initialStage.stage_set_at).getTime();

      if (initialStage == null) return;
      expect(isValidBtDbId(initialStage.id, 'stg')).toBe(true);
      expect(initialStage.squad_id).toBe(mockStageToPost.squad_id);
      expect(initialStage.stage).toBe(SquadStage.DEFINE);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(initialStage.scores_started_at).toBe(mockStageToPost.scores_started_at);
      expect(initialStage.stage_override_enabled).toBe(false);
      expect(initialStage.stage_override_at).toBe(mockStageToPost.stage_override_at);
      expect(initialStage.stage_override_reason).toBe(mockStageToPost.stage_override_reason);
    })
    it('should NOT post initial full stage when squad id is null', async () => {
      try {
        await postInitialStageForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should NOT post a full stage when squad id is invalid', async () => {
      try {
        await postInitialStageForSquad('test');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })
    it('should NOT post a full stage when squadId is valid, but not a squad id', async () => {
      try {
        await postInitialStageForSquad(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    })

  })

  describe('patchJustStage()', () => {

    let didUpdate = false;

    beforeAll(async () => {
      await resetStage(testStage)
    });

    beforeEach(() => {
      didUpdate = false;
    })

    afterEach(async () => {
      if (didUpdate) {
        await resetStage(testStage)
      }
    })

    afterAll(async () => {
      await resetStage(testStage)
    })

    it('should patch a justStage', async () => {
      const before = new Date();
      const patchedStage = await patchJustStage(testStage.id, SquadStage.ENTRIES);
      expect(patchedStage).not.toBeNull();
      didUpdate = true;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(patchedStage.stage_set_at).getTime();

      expect(patchedStage.id).toBe(testStage.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);
      expect(patchedStage.stage).toBe(SquadStage.ENTRIES);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(patchedStage.scores_started_at).toBe(null);
    })
    it('should patch a justStage - stage = SCORES', async () => {
      const before = new Date();
      const stageToPatch: justStageType = {
        ...testStage,
        stage: SquadStage.SCORES
      }
      const patchedStage = await patchJustStage(testStage.id, SquadStage.SCORES);
      expect(patchedStage).not.toBeNull();
      didUpdate = true;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(patchedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(patchedStage.stage_set_at).getTime();

      expect(patchedStage.id).toBe(testStage.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);
      expect(patchedStage.stage).toBe(SquadStage.SCORES);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);
    })
    it('should not patch a justStage when id is missing', async () => {
      try {
        await patchJustStage(null as any, SquadStage.ENTRIES);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid justStage data");
      }
    })
    it('should not patch a justStage when id is invalid', async () => {
      try {
        await patchJustStage('test', SquadStage.ENTRIES);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid justStage data");
      }
    })
    it('should not patch a justStage when id is valid, but not a stage id', async () => {
      try {
        await patchJustStage(userId, SquadStage.ENTRIES);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid justStage data");
      }
    })
    it('should not patch a justStage when stage is invalid', async () => {
      try {
        await patchJustStage(testStage.id, 'test' as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid justStage data");
      }
    })
    it('should not patch a justStage when stage is missing', async () => {
      try {
        await patchJustStage(testStage.id, null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid justStage data");
      }
    })
  })

  describe('patchJustStageOverride()', () => {

    describe('patchJustStageOverride() - setting stage_override_enabled to true', () => {

      let didUpdate = false;
      const testReason = 'testing resaon';

      beforeAll(async () => {
        await resetStage(testStage)
      });

      beforeEach(() => {
        didUpdate = false;
      })

      afterEach(async () => {
        if (didUpdate) {
          await resetStage(testStage)
        }
      })

      afterAll(async () => {
        await resetStage(testStage)
      })

      it('should patch a justStageOverride', async () => {
        const before = new Date();
        const patchedStage = await patchJustStageOverride(testStage.id, true, testReason);
        expect(patchedStage).not.toBeNull();
        didUpdate = true;

        const after = new Date();
        const twoMinutes = 2 * 60 * 1000;
        expect(patchedStage.stage_override_at).not.toBeNull();
        const stageOverrideAtMs = new Date(patchedStage.stage_override_at!).getTime();

        expect(patchedStage.id).toBe(testStage.id);
        expect(patchedStage.squad_id).toBe(testStage.squad_id);
        expect(patchedStage.stage_override_enabled).toBe(true);

        expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
        expect(stageOverrideAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

        expect(patchedStage.stage_override_reason).toBe(testReason);
      })
      it('should not patch a justStageOverride when id is missing', async () => {
        try {
          await patchJustStageOverride(null as any, true, testReason);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
      it('should not patch a justStageOverride when id is invalid', async () => {
        try {
          await patchJustStageOverride('test', true, testReason);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
      it('should not patch a justStageOverride when id is valid, but not a stage id', async () => {
        try {
          await patchJustStageOverride(userId, true, testReason);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
      it('should not patch a justStageOverride when enabled = true, but reason is missing', async () => {
        try {
          await patchJustStageOverride(testStage.id, true, null as any);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
      it('should not patch a justStageOverride when enabled = true, but reason is invalid', async () => {
        try {
          await patchJustStageOverride(testStage.id, true, 'a'.repeat(maxReasonLength + 1));
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
    })

    describe('getJustStageOverride() - setting stage_override_enabled to false', () => {
  
      let didUpdate = false;
      const testReason = 'testing resaon';

      beforeAll(async () => {
        await resetStage(testOverrideStage)
      });

      beforeEach(() => {
        didUpdate = false;
      })

      afterEach(async () => {
        if (didUpdate) {
          await resetStage(testOverrideStage)
        }
      })

      afterAll(async () => {
        await resetStage(testStage) // do not use testOverrideStage here
      })

      it('should patch a justStageOverride', async () => {
        const patchedStage = await patchJustStageOverride(testStage.id, false, '');
        expect(patchedStage).not.toBeNull();
        didUpdate = true;

        expect(patchedStage.id).toBe(testStage.id);
        expect(patchedStage.squad_id).toBe(testStage.squad_id);
        expect(patchedStage.stage_override_enabled).toBe(false);
        expect(patchedStage.stage_override_at).toBe(null);
        expect(patchedStage.stage_override_reason).toBe('');
      })
      it('should patch a justStageOverride setting enabled to false, reason ignored', async () => {
        const patchedStage = await patchJustStageOverride(testStage.id, false, 'ignore me');
        expect(patchedStage).not.toBeNull();
        didUpdate = true;

        expect(patchedStage.id).toBe(testStage.id);
        expect(patchedStage.squad_id).toBe(testStage.squad_id);
        expect(patchedStage.stage_override_enabled).toBe(false);
        expect(patchedStage.stage_override_at).toBe(null);
        expect(patchedStage.stage_override_reason).toBe('');
      })
      it('should not patch a justStageOverride when enabled = false, but reason is not ""', async () => {
        try {
          await patchJustStageOverride(testStage.id, false, testReason);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toBe("Invalid justStageOverride data");
        }
      })
      
    })
  })

  describe("deleteFullStage()", () => {
    // toDeleteStage is data from prisma/seeds.ts
    const toDeleteStage: fullStageType = {
      id: "stg_57f542b0c5664845a631be0148bc8b89",
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
      stage: "DEFINE",
      stage_set_at: "2023-09-16T00:00:00.000Z",
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: '',  
    }

    let didDel = false;

    beforeAll(async () => {
      await rePostStage(toDeleteStage);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostStage(toDeleteStage);
      }
    });

    it("should delete a stage", async () => {
      const deleted = await deleteFullStage(toDeleteStage.id);
      expect(deleted).toBe(1);
      didDel = true;
    });
    it("should throw error when trying to delete a stage when id is not found", async () => {
      try {
        await deleteFullStage(notFoundStageId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deleteFullStage failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete a stage when id is invalid", async () => {
      try {
        await deleteFullStage("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage id");
      }
    });
    it("should throw error when trying to delete a stage when id is valid, but not a stage id", async () => {
      try {
        await deleteFullStage(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage id");
      }
    });
    it("should throw error when trying to delete a stage when id is null", async () => {
      try {
        await deleteFullStage(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid stage id");
      }
    });

  })

})