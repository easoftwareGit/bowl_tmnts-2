import axios, { AxiosError } from "axios";
import { baseStagesApi } from "@/lib/db/apiPaths";
import { testBaseStagesApi } from "../../../testApi";
import { fullStageType } from "@/lib/types/types";
import { mockStageToPost, mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { maxReasonLength } from "@/lib/validation/validation";
import { SquadStage } from "@prisma/client";
import { deleteSquad, postSquad } from "@/lib/db/squads/dbSquads";

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
const oneStageUrl = url + "/stage/"
const testStageUrl = url + "/testing/"
const squadUrl = url + "/squad/"

const notFoundStageId = "stg_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const toPostStageId = mockStageToPost.id;
const toPostSquadId = mockSquadsToPost[0].id;

// from prisma/seed.ts
const testStage: fullStageType = {
  id: "stg_c5f562c4c4304d919ac43fead73123e2",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  stage: "DEFINE",
  stage_set_at: new Date("2022-10-23"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',
}
const wholeTmntStage: fullStageType = {
  id: "stg_124dd9efc30f4352b691dfd93d1e284e",
  squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
  stage: "ENTRIES",
  stage_set_at: new Date("2024-07-01"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',
}
const toDeleteStage: fullStageType = {
  id: "stg_57f542b0c5664845a631be0148bc8b89",
  squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
  stage: "DEFINE",
  stage_set_at: new Date("2023-09-16"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',  
}

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
  // make sure test stage is reset in database
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

const rePostStage = async (stageToRepost: fullStageType) => {
  
  try {
    await axios.get(oneStageUrl + stageToRepost.id);    
    return; // stage already in database
  } catch (err) { 
    // status 404 is OK, not found error
    if (err instanceof AxiosError) {
      if (err.status !== 404) {
        console.log(err.message);        
        return;
      }
    } 
  }
  try {
    const stageJSON = JSON.stringify(stageToRepost);
    await axios.post(
      testStageUrl,
      stageJSON,
      { withCredentials: true }
    );
  } catch (err) {
    if (err instanceof AxiosError) console.log(err.message);
  }
}

describe('Stages - API: /api/stages', () => { 

  describe('GET all stages API: /api/stages', () => { 

    beforeAll(async () => {
      await deletePostedStage(toPostStageId);      
      await rePostStage(toDeleteStage)
    })

    it('should get all stages', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 12 rows in prisma/seed.ts
      expect(response.data.stages).toHaveLength(12);
    })  
  })

  describe('GET one stage API: /api/stages/:id', () => { 

    beforeAll(async () => {
      await deletePostedStage(toPostStageId);
      await resetStage(testStage);
    })

    it('should get one stage', async () => {
      const response = await axios.get(oneStageUrl + testStage.id);
      expect(response.status).toBe(200);
      const gotStage = response.data.stage;
      expect(gotStage.id).toBe(testStage.id);
      expect(gotStage.squad_id).toBe(testStage.squad_id);
      expect(gotStage.stage).toBe(testStage.stage);
      expect(gotStage.stage_set_at).toBe(testStage.stage_set_at.toISOString());
      expect(gotStage.scores_started_at).toBe(testStage.scores_started_at);
      expect(gotStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(gotStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(        
        gotStage.stage_override_reason === "" ||
        gotStage.stage_override_reason === null
      ).toBe(true);
    })
    it('should get one stage - Whole tmnt', async () => {       
      const response = await axios.get(oneStageUrl + wholeTmntStage.id);
      expect(response.status).toBe(200);
      const gotStage = response.data.stage;
      expect(gotStage.id).toBe(wholeTmntStage.id);
      expect(gotStage.squad_id).toBe(wholeTmntStage.squad_id);
      expect(gotStage.stage).toBe(wholeTmntStage.stage);
      expect(gotStage.stage_set_at).toBe(wholeTmntStage.stage_set_at.toISOString());
      expect(gotStage.scores_started_at).toBe(wholeTmntStage.scores_started_at);
      expect(gotStage.stage_override_enabled).toBe(wholeTmntStage.stage_override_enabled);
      expect(gotStage.stage_override_at).toBe(wholeTmntStage.stage_override_at);
      expect(        
        gotStage.stage_override_reason === "" ||
        gotStage.stage_override_reason === null
      ).toBe(true);
    })
    it('should NOT get a stage by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneStageUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a stage by ID when ID is valid, but not a stage ID', async () => {
      try {
        const response = await axios.get(oneStageUrl + toPostSquadId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a squad by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneStageUrl + notFoundStageId);        
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    describe('get an edited stage API: /api/stages/stage/:id', () => {

      const editedStage: fullStageType = {
        ...testStage,
        stage: SquadStage.SCORES,
        stage_set_at: new Date("2025-09-01T00:00:00.000Z"),
        scores_started_at: new Date("2025-09-01T00:00:00.000Z"),
        stage_override_enabled: true,
        stage_override_at: new Date("2025-09-01T00:00:00.000Z"),
        stage_override_reason: "test reason"
      }

      beforeAll(async () => {
        await deletePostedStage(toPostStageId);        
        try {
          const response = await axios.put(
            testStageUrl + testStage.id,
            JSON.stringify(editedStage),
            { withCredentials: true }
          );
        }
        catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      })

      afterAll(async () => {
        await resetStage(testStage);
      })

      it('should get an edited stage', async () => {

        const response = await axios.get(oneStageUrl + editedStage.id);
        expect(response.status).toBe(200);
        const postedStage = response.data.stage;
        expect(postedStage.id).toBe(editedStage.id);
        expect(postedStage.squad_id).toBe(editedStage.squad_id);
        expect(postedStage.stage).toBe(editedStage.stage);
        expect(postedStage.stage_set_at).toBe(editedStage.stage_set_at.toISOString());
        expect(postedStage.scores_started_at).toBe(editedStage.scores_started_at?.toISOString());
        expect(postedStage.stage_override_enabled).toBe(editedStage.stage_override_enabled);
        expect(postedStage.stage_override_at).toBe(editedStage.stage_override_at?.toISOString());
        expect(postedStage.stage_override_reason).toBe(editedStage.stage_override_reason);
      })
    })
  })

  describe('GET one stage from squad API: /api/stages/squad/:squadId', () => { 

    beforeAll(async () => {
      await deletePostedStage(toPostStageId);
      await resetStage(testStage);
    })

    it('should get one stage', async () => {
      const response = await axios.get(squadUrl + testStage.squad_id);
      expect(response.status).toBe(200);
      const gotStage = response.data.stage;
      expect(gotStage.id).toBe(testStage.id);
      expect(gotStage.squad_id).toBe(testStage.squad_id);
      expect(gotStage.stage).toBe(testStage.stage);
      expect(gotStage.stage_set_at).toBe(testStage.stage_set_at.toISOString());
      expect(gotStage.scores_started_at).toBe(testStage.scores_started_at);
      expect(gotStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(gotStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(        
        gotStage.stage_override_reason === "" ||
        gotStage.stage_override_reason === null
      ).toBe(true);
    })
    it('should get one stage - Whole tmnt', async () => {       
      const response = await axios.get(squadUrl + wholeTmntStage.squad_id);
      expect(response.status).toBe(200);
      const gotStage = response.data.stage;
      expect(gotStage.id).toBe(wholeTmntStage.id);
      expect(gotStage.squad_id).toBe(wholeTmntStage.squad_id);
      expect(gotStage.stage).toBe(wholeTmntStage.stage);
      expect(gotStage.stage_set_at).toBe(wholeTmntStage.stage_set_at.toISOString());
      expect(gotStage.scores_started_at).toBe(wholeTmntStage.scores_started_at);
      expect(gotStage.stage_override_enabled).toBe(wholeTmntStage.stage_override_enabled);
      expect(gotStage.stage_override_at).toBe(wholeTmntStage.stage_override_at);
      expect(        
        gotStage.stage_override_reason === "" ||
        gotStage.stage_override_reason === null
      ).toBe(true);
    })
    it('should NOT get a stage by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(squadUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a stage by ID when ID is valid, but not a squad ID', async () => {
      try {
        const response = await axios.get(squadUrl + toPostStageId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a squad by ID when ID is not found', async () => {
      try {
        const response = await axios.get(squadUrl + notFoundSquadId);        
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    describe('get an edited stage API: /api/stages/squad/:sqiadId', () => {

      const editedStage: fullStageType = {
        ...testStage,
        stage: SquadStage.SCORES,
        stage_set_at: new Date("2025-09-01T00:00:00.000Z"),
        scores_started_at: new Date("2025-09-01T00:00:00.000Z"),
        stage_override_enabled: true,
        stage_override_at: new Date("2025-09-01T00:00:00.000Z"),
        stage_override_reason: "test reason"
      }

      beforeAll(async () => {
        await deletePostedStage(toPostStageId);        
        try {
          const response = await axios.put(
            testStageUrl + testStage.id,
            JSON.stringify(editedStage),
            { withCredentials: true }
          );
        }
        catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      })

      afterAll(async () => {
        await resetStage(testStage);
      })

      it('should get an edited stage', async () => {

        const response = await axios.get(squadUrl + editedStage.squad_id);
        expect(response.status).toBe(200);
        const postedStage = response.data.stage;
        expect(postedStage.id).toBe(editedStage.id);
        expect(postedStage.squad_id).toBe(editedStage.squad_id);
        expect(postedStage.stage).toBe(editedStage.stage);
        expect(postedStage.stage_set_at).toBe(editedStage.stage_set_at.toISOString());
        expect(postedStage.scores_started_at).toBe(editedStage.scores_started_at?.toISOString());
        expect(postedStage.stage_override_enabled).toBe(editedStage.stage_override_enabled);
        expect(postedStage.stage_override_at).toBe(editedStage.stage_override_at?.toISOString());
        expect(postedStage.stage_override_reason).toBe(editedStage.stage_override_reason);
      })
    })

  })

  describe('POST API: /api/stages', () => {

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
      const response = await axios.post(
        url,
        JSON.stringify(mockStageToPost),
        { withCredentials: true }
      );
      expect(response.status).toBe(201);
      didPost = true;
      const postedStage = response.data.stage;
      
      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();      
      
      expect(postedStage.id).toBe(mockStageToPost.id);
      expect(postedStage.squad_id).toBe(mockStageToPost.squad_id);
      expect(postedStage.stage).toBe(mockStageToPost.stage);
      
      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      // expect(postedStage.stage_set_at).toBe(mockStageToPost.stage_set_at.toISOString());
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
      const response = await axios.post(
        url,
        JSON.stringify(allStageFields),
        { withCredentials: true }
      );
      expect(response.status).toBe(201);
      didPost = true;
      const postedStage = response.data.stage;
      
      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(allStageFields.stage_set_at).getTime(); 
      const scoresStartedAtMs = new Date(postedStage.scores_started_at as Date).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at as Date).getTime();
      
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
      const aDate = new Date("2022-01-01");
      const ignoreDatesStage: fullStageType = {
        ...mockStageToPost,
        stage: SquadStage.SCORES,
        stage_set_at: aDate,
        scores_started_at: aDate,
        stage_override_enabled: true,
        stage_override_at: aDate,
        stage_override_reason: 'test reason',
      };
      const response = await axios.post(
        url,
        JSON.stringify(ignoreDatesStage),
        { withCredentials: true }
      );
      expect(response.status).toBe(201);
      didPost = true;
      const postedStage = response.data.stage;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();      
      const scoresStartedAtMs = new Date(postedStage.scores_started_at as Date).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at as Date).getTime();

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
    });
    it('should NOT post a full stage when id is missing', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when id is blank', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when id is valid, but not a stage id', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        id: toPostSquadId,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when squad_id is missing', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when squad_id is blank', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when squad_id is valid, but not a squad id', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: toPostStageId,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when squad_id is a valid squad id, but squad is not in database', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        squad_id: notFoundSquadId,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT post a full stage when stage is missing', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage is invalid', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage: 'test' as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage_override_enabled is missing', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage_override_enabled is invalid', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: 'testing' as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage_override_enabled = true and stage_override_reason is blank', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: true,
        stage_override_at: new Date(),
        stage_override_reason: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage_override_enabled = true and stage_override_reason is invalid', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: true,
        stage_override_at: new Date(),
        stage_override_reason: 'a'.repeat(maxReasonLength + 1),
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT post a full stage when stage_override_enabled = false and stage_override_reason has a value', async () => { 
      const invalidStage: fullStageType = {
        ...mockStageToPost,
        stage_override_enabled: false,
        stage_override_reason: 'test',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.post(
          url,
          stageJSON,
          { withCredentials: true }
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
    it('should post a full stage with all values sanitized', async () => {
      const before = new Date();
      const aDate = new Date("2022-01-01");
      const toSanitzeStage: fullStageType = {
        ...mockStageToPost,
        stage: SquadStage.SCORES,
        stage_set_at: aDate,
        scores_started_at: aDate,
        stage_override_enabled: true,
        stage_override_at: aDate,
        stage_override_reason: '<alert>   test reason*****</alert>',
      };
      const response = await axios.post(
        url,
        JSON.stringify(toSanitzeStage),
        { withCredentials: true }
      );
      expect(response.status).toBe(201);
      didPost = true;
      const postedStage = response.data.stage;

      const after = new Date();
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();      
      const scoresStartedAtMs = new Date(postedStage.scores_started_at as Date).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at as Date).getTime();

      expect(postedStage.id).toBe(toSanitzeStage.id);
      expect(postedStage.squad_id).toBe(toSanitzeStage.squad_id);
      expect(postedStage.stage).toBe(toSanitzeStage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_enabled).toBe(toSanitzeStage.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before.getTime() - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after.getTime() + twoMinutes);

      expect(postedStage.stage_override_reason).toBe("test reason");
    });
  })

  describe('PUT by ID - update - API: /api/stages/stage/:id', () => {

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

    it('should update a stage - Just stage', async () => {
      const before = Date.now();
      const stageToPut: fullStageType = {
        ...testStage,
        stage: SquadStage.ENTRIES,        
      }
      const response = await axios.put(
        oneStageUrl + stageToPut.id,
        JSON.stringify(stageToPut),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const updatedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const stageSetAtMs = new Date(updatedStage.stage_set_at).getTime();

      expect(updatedStage.id).toBe(stageToPut.id);
      expect(updatedStage.squad_id).toBe(stageToPut.squad_id);
      expect(updatedStage.stage).toBe(stageToPut.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      
      expect(updatedStage.scores_started_at).toBe(null);
      expect(updatedStage.stage_override_enabled).toBe(stageToPut.stage_override_enabled);
      expect(updatedStage.stage_override_at).toBe(null);
      expect(updatedStage.stage_override_reason).toBe(stageToPut.stage_override_reason);
    })
    it('should update a stage - Stage = "SCORES"', async () => {
      const before = Date.now();
      const stageToPut: fullStageType = {
        ...testStage,
        stage: SquadStage.SCORES,
      }
      const response = await axios.put(
        oneStageUrl + stageToPut.id,
        JSON.stringify(stageToPut),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const updatedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const stageSetAtMs = new Date(updatedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(updatedStage.scores_started_at as Date).getTime();

      expect(updatedStage.id).toBe(stageToPut.id);
      expect(updatedStage.squad_id).toBe(stageToPut.squad_id);
      expect(updatedStage.stage).toBe(stageToPut.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(updatedStage.stage_override_enabled).toBe(stageToPut.stage_override_enabled);
      expect(updatedStage.stage_override_at).toBe(null);
      expect(updatedStage.stage_override_reason).toBe(stageToPut.stage_override_reason);
    })
    it('should update a stage - Just Override Enabled', async () => {
      const before = Date.now();
      const stageToPut: fullStageType = {
        ...testStage,
        stage_override_enabled: true,                
        stage_override_reason: "test reason",
      }
      const response = await axios.put(
        oneStageUrl + stageToPut.id,
        JSON.stringify(stageToPut),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const updatedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const stageSetAtMs = new Date(updatedStage.stage_set_at).getTime();
      const stageOverrideAtMs = new Date(updatedStage.stage_override_at).getTime();      

      expect(updatedStage.id).toBe(stageToPut.id);
      expect(updatedStage.squad_id).toBe(stageToPut.squad_id);
      expect(updatedStage.stage).toBe(stageToPut.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);      

      expect(updatedStage.scores_started_at).toBe(null);
      expect(updatedStage.stage_override_enabled).toBe(stageToPut.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);
      
      expect(updatedStage.stage_override_reason).toBe(stageToPut.stage_override_reason);
    })
    it('should update a stage - full stage, and ignore date fields', async () => {
      const before = Date.now();
      const stageToPut: fullStageType = {
        ...testStage,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,                
        stage_override_reason: "test reason",
      }
      const response = await axios.put(
        oneStageUrl + stageToPut.id,
        JSON.stringify(stageToPut),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const updatedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const stageSetAtMs = new Date(updatedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(updatedStage.scores_started_at as Date).getTime();
      const stageOverrideAtMs = new Date(updatedStage.stage_override_at).getTime();      

      expect(updatedStage.id).toBe(stageToPut.id);
      expect(updatedStage.squad_id).toBe(stageToPut.squad_id);
      expect(updatedStage.stage).toBe(stageToPut.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after + twoMinutes);
      
      expect(updatedStage.stage_override_enabled).toBe(stageToPut.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);
      
      expect(updatedStage.stage_override_reason).toBe(stageToPut.stage_override_reason);
    })
    it('should NOT put a full stage when id is missing', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        id: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT put a full stage when id is blank', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        id: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT put a full stage when id is valid, but not a stage id', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        id: testStage.squad_id,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT put a full stage when id is not found', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        id: notFoundStageId,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT put a full stage when squad_id is missing', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        squad_id: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when squad_id is blank', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        squad_id: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when squad_id is valid, but not a squad id', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        squad_id: testStage.id,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when stage is missing', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        stage: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when stage is invalid', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        stage: 'test' as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when stage_override_enabled is missing', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        stage_override_enabled: null as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when stage_override_enabled is invalid', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        stage_override_enabled: 'test' as any,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT put a full stage when stage_override_enabled = true and stage_override_reason is blank', async () => { 
      const invalidStage: fullStageType = {
        ...testStage,
        stage_override_enabled: true,
        stage_override_at: new Date(),
        stage_override_reason: '',
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.put(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should put a full stage with all values sanitized', async () => {
      const before = Date.now();
      const toSanitzeStage: fullStageType = {
        ...testStage,
        stage: SquadStage.SCORES,
        stage_override_enabled: true,
        stage_override_reason: '<alert>   test reason*****</alert>',
      };
      const response = await axios.put(
        oneStageUrl + toSanitzeStage.id,
        JSON.stringify(toSanitzeStage),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didUpdate = true;
      const postedStage = response.data.stage;

      const after = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      const stageSetAtMs = new Date(postedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(postedStage.scores_started_at as Date).getTime();
      const stageOverrideAtMs = new Date(postedStage.stage_override_at as Date).getTime();

      expect(postedStage.id).toBe(toSanitzeStage.id);
      expect(postedStage.squad_id).toBe(toSanitzeStage.squad_id);
      expect(postedStage.stage).toBe(toSanitzeStage.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after + twoMinutes);
    
      expect(postedStage.stage_override_enabled).toBe(toSanitzeStage.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(postedStage.stage_override_reason).toBe("test reason");
    });

  })

  describe('PATCH by ID - API: /api/stages/stage/:id', () => { 

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

    it('should patch a stage - Just stage', async () => {
      const before = Date.now();
      const stageToPatch = {
        id: testStage.id,
        stage: SquadStage.ENTRIES,        
      }
      const response = await axios.patch(
        oneStageUrl + stageToPatch.id,
        JSON.stringify(stageToPatch),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const patchedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now()
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(patchedStage.stage_set_at).getTime();
      
      expect(patchedStage.id).toBe(stageToPatch.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);
      expect(patchedStage.stage).toBe(stageToPatch.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(patchedStage.scores_started_at).toBe(testStage.scores_started_at);
      expect(patchedStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(patchedStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(patchedStage.stage_override_reason).toBe(testStage.stage_override_reason);
    })
    it('should patch a stage - Just stage when .stage = "SCORES"', async () => {
      const before = Date.now();
      const stageToPatch = {
        id: testStage.id,
        stage: SquadStage.SCORES,
      }
      const response = await axios.patch(
        oneStageUrl + stageToPatch.id,
        JSON.stringify(stageToPatch),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const patchedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now()
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(patchedStage.stage_set_at).getTime();      
      
      expect(patchedStage.id).toBe(stageToPatch.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);
      expect(patchedStage.stage).toBe(stageToPatch.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);      

      expect(patchedStage.stage_override_enabled).toBe(testStage.stage_override_enabled);
      expect(patchedStage.stage_override_at).toBe(testStage.stage_override_at);
      expect(patchedStage.stage_override_reason).toBe(testStage.stage_override_reason);
    })
    it('should patch a stage - just stage_override_enabled', async () => {
      const before = Date.now();
      const stageToPatch = {
        id: testStage.id,
        stage_override_enabled: true,
        stage_override_reason: "test reason"
      }
      const response = await axios.patch(
        oneStageUrl + stageToPatch.id,
        JSON.stringify(stageToPatch),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const patchedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now()
      const twoMinutes = 2 * 60 * 1000;
      const stageOverrideAtMs = new Date(patchedStage.stage_override_at).getTime();
      
      expect(patchedStage.id).toBe(stageToPatch.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);      
      expect(patchedStage.stage_override_enabled).toBe(stageToPatch.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);            

      expect(patchedStage.stage_override_reason).toBe(stageToPatch.stage_override_reason);
    })
    it('should patch a full stage, and ignore dates', async () => {
      const before = Date.now();
      const stageToPatch = {
        id: testStage.id,
        stage: SquadStage.SCORES,        
        stage_set_at: new Date("2022-01-01T00:00:00.000Z"),
        scores_started_at: new Date("2022-01-01T00:00:00.000Z"),
        stage_override_enabled: true,
        stage_override_at: new Date("2022-01-01T00:00:00.000Z"),
        stage_override_reason: "test reason 3"
      }
      const response = await axios.patch(
        oneStageUrl + stageToPatch.id,
        JSON.stringify(stageToPatch),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const patchedStage = response.data.stage;
      didUpdate = true;

      const after = Date.now()
      const twoMinutes = 2 * 60 * 1000;
      const stageSetAtMs = new Date(patchedStage.stage_set_at).getTime();
      const scoresStartedAtMs = new Date(patchedStage.scores_started_at).getTime();
      const stageOverrideAtMs = new Date(patchedStage.stage_override_at).getTime();
      
      expect(patchedStage.id).toBe(stageToPatch.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);      
      expect(patchedStage.stage).toBe(stageToPatch.stage);

      expect(stageSetAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageSetAtMs).toBeLessThanOrEqual(after + twoMinutes);
      expect(scoresStartedAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(scoresStartedAtMs).toBeLessThanOrEqual(after + twoMinutes);

      expect(patchedStage.stage_override_enabled).toBe(stageToPatch.stage_override_enabled);

      expect(stageOverrideAtMs).toBeGreaterThanOrEqual(before - twoMinutes);
      expect(stageOverrideAtMs).toBeLessThanOrEqual(after + twoMinutes);            
      
      expect(patchedStage.stage_override_reason).toBe(stageToPatch.stage_override_reason);
    })
    it('should ignore squad_id', async () => {
      const stageToPatch = {
        id: testStage.id,
        squad_id: testStage.squad_id,
        stage: SquadStage.ENTRIES
      }
      const response = await axios.patch(
        oneStageUrl + stageToPatch.id,
        JSON.stringify(stageToPatch),
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      const patchedStage = response.data.stage;
      expect(patchedStage.id).toBe(stageToPatch.id);
      expect(patchedStage.squad_id).toBe(testStage.squad_id);
      expect(patchedStage.stage).toBe(stageToPatch.stage);
    })
    it('should NOT patch a full stage when id is missing', async () => { 
      const invalidStage = {        
        id: null,
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a full stage when id is blank', async () => { 
      const invalidStage = {        
        id: "",
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a full stage when id is invalid', async () => { 
      const invalidStage = {        
        id: "test",
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a full stage when id is not found', async () => { 
      const invalidStage = {        
        id: notFoundStageId,
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a full stage when id is valid, but not a stage id', async () => { 
      const invalidStage = {        
        id: testStage.squad_id,
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
        );
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT patch a full stage when squad_id is null', async () => { 
      const invalidStage = {        
        id: testStage.id,
        squad_id: null,
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when squad_id is blank', async () => { 
      const invalidStage = {        
        id: testStage.id,
        squad_id: '',
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when squad_id is valid, but not a squad id', async () => { 
      const invalidStage = {        
        id: testStage.id,
        squad_id: testStage.id,
        stage: SquadStage.ENTRIES,        
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage is null', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage: null
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage is invalid', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage: 'test'
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled is null', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: null,
        stage_override_reason: 'test reason'
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled is invalid', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: 'test',
        stage_override_reason: 'test reason'
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled = TRUE and stage_override_reason is missing', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: true,
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled = TRUE and stage_override_reason is null', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: true,
        stage_override_reason: null
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled = TRUE and stage_override_reason is blank', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: true,
        stage_override_reason: ''
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled = TRUE and stage_override_reason is invalid', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: true,
        stage_override_reason: 'a'.repeat(maxReasonLength + 1)
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
    it('should NOT patch a full stage when stage_override_enabled = FALSE and stage_override_reason is valid', async () => { 
      const invalidStage = {        
        id: testStage.id,        
        stage_override_enabled: false,
        stage_override_reason: 'test reason'
      };
      const stageJSON = JSON.stringify(invalidStage);
      try {
        const response = await axios.patch(
          oneStageUrl + invalidStage.id,
          stageJSON,
          { withCredentials: true }
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
  })

  describe('DELETE stage - API: /api/stages/stage/:id', () => {

    let didDelete = false;

    beforeAll(async () => {
      await rePostStage(toDeleteStage);      
    })  

    beforeEach(() => {
      didDelete = false;
    })

    afterEach(async () => {
      if (!didDelete) return;
      await rePostStage(toDeleteStage);
    })

    afterAll(async () => {
      await rePostStage(toDeleteStage);
    })

    it('should delete a stage', async () => {
      const response = await axios.delete(
        oneStageUrl + toDeleteStage.id,
        { withCredentials: true }
      );
      expect(response.status).toBe(200);
      didDelete = true;
    })
    it('should NOT delete a stage when ID is invalid', async () => {
      try {
        const response = await axios.delete(oneStageUrl + "/invalid", {
          withCredentials: true,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a stage when ID is valid, but not a stage ID', async () => {
      try {
        const response = await axios.delete(oneStageUrl + '/' + toDeleteStage.squad_id, {
          withCredentials: true,
        });
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not delete a stage when id is not found', async () => {
      const response = await axios.delete(oneStageUrl + notFoundStageId, {
        withCredentials: true,
      });
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })
  })  

})