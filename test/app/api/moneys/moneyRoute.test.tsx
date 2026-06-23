import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { baseMoneyApi } from "@/lib/api/apiPaths";
import { testBaseMoneysApi } from "../../../testApi";
import type { tmntMoneyType } from "@/lib/types/types";
import { initTmntMoney } from "@/lib/db/initVals";
import { maxMoney, maxSortOrder } from "@/lib/validation/constants";

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
const url = process.env.NODE_ENV === "test" && testBaseMoneysApi
  ? testBaseMoneysApi
  : baseMoneyApi;

const oneMoneyUrl = url + "/money/";
const tmntUrl = url + "/tmnt/"; 

const notFoundId = "mon_01234567890123456789012345678901";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('Moneys - GETs and POST API: /api/moneys', () => { 

  const testMoney: tmntMoneyType = {
    ...initTmntMoney,
    id: "mon_03b6e6fcaa8343d0b18b56a71e8c160a",
    event_id: "evt_4ff710c8493f4a218d2e2b045442974a",
    squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
    div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
    descrip: "ENTRIES",
    flow: "IN",
    amount: 600,
    pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
    brkt_id: null as any,
    elim_id: null as any,
    sort_order: 3,
  }

  const moneyToPost: tmntMoneyType = {
    ...initTmntMoney,
    id: "mon_bbb6e6fcaa8343d0b18b56a71e8c160a",
    event_id: "evt_4ff710c8493f4a218d2e2b045442974a",
    squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
    div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
    descrip: "ENTRIES",
    flow: "IN",
    amount: 500,
    pot_id: null as any,
    brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
    elim_id: null as any,
    sort_order: 2,
  }

  const deletePostedMoney = async (moneyId: string) => {
    try {
      await privateApi.delete(oneMoneyUrl + moneyId);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  describe('GET - API: API: /api/moneys/money/:id', () => {

    beforeAll(async () => {
      await deletePostedMoney(moneyToPost.id);
    });

    it('should get all moneys', async () => {
      const response = await privateApi.get(url);
      expect(response.status).toBe(200);
      // 23 rows in prisma/seed.ts
      expect(response.data.moneys).toHaveLength(23);
      const moneys: tmntMoneyType[] = response.data.moneys;
      moneys.forEach((money: tmntMoneyType) => {
        expect(money.event_id).not.toBeNull();
        expect(money.squad_id).not.toBeNull();
        expect(money.div_id).not.toBeNull();
        expect(money.descrip).not.toBeNull();
        expect(money.flow).not.toBeNull();
        expect(money.amount).not.toBeNull();
        expect(money.sort_order).not.toBeNull();
      })
    });
  });

  describe('GET by ID - API: API: /api/moneys/money/:id', () => {

    beforeAll(async () => {
      await deletePostedMoney(moneyToPost.id);
    });

    it('should get one money', async () => {
      const response = await privateApi.get(oneMoneyUrl + testMoney.id);
      expect(response.status).toBe(200);
      // the "GET" returns json'ed data, so decimal values return as strings
      const money: tmntMoneyType = response.data.money;
      expect(money.id).toBe(testMoney.id);
      expect(money.event_id).toBe(testMoney.event_id);
      expect(money.squad_id).toBe(testMoney.squad_id);
      expect(money.div_id).toBe(testMoney.div_id);
      expect(money.descrip).toBe(testMoney.descrip);
      expect(money.flow).toBe(testMoney.flow);
      expect(Number(money.amount)).toBe(testMoney.amount);
      expect(money.sort_order).toBe(testMoney.sort_order);
      expect(money.pot_id).toBe(testMoney.pot_id);
      expect(money.brkt_id).toBe(testMoney.brkt_id);
      expect(money.elim_id).toBe(testMoney.elim_id);
    });
    it('should not get one money when ID is invalid', async () => {
      try {
        const response = await privateApi.get(oneMoneyUrl + "/test");
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it('should not get one money when ID is valid, but not a money ID', async () => {
      try {
        const response = await privateApi.get(oneMoneyUrl + userId);
        expect(true).toBeFalsy();
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not get one money when ID is not found', async () => {
      try {
        const response = await privateApi.get(oneMoneyUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

  });

  describe('GET all moneys for a tmnt - API: /api/moneys/tmnt/:tmntId', () => { 

    beforeAll(async () => {
      await deletePostedMoney(moneyToPost.id);
    });

    it('should get all moneys for a tournament', async () => { 
      // const values taken from prisma/seed.ts
      const tmntId = "tmt_d237a388a8fc4641a2e37233f1d6bebd";
      const eventId = "evt_4ff710c8493f4a218d2e2b045442974a";
      const squadId = "sqd_8e4266e1174642c7a1bcec47a50f275f";
      const divId = "div_99a3cae28786485bb7a036935f0f6a0a";

      const response = await privateApi.get(tmntUrl + tmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      // 18 money rows for tmnt in prisma/seed.ts
      expect(response.data.moneys).toHaveLength(18);
      const moneys: tmntMoneyType[] = response.data.moneys;
      // query in /api/moneys/tmnt GET sorts by sort_order
      for (let i = 0; i < moneys.length; i++) {
        expect(moneys[i].event_id).toBe(eventId);
        expect(moneys[i].squad_id).toBe(squadId);
        expect(moneys[i].div_id).toBe(divId);
        expect(moneys[i].descrip).not.toBeNull();
        expect(moneys[i].flow).not.toBeNull();
        expect(moneys[i].amount).not.toBeNull();        
        expect(moneys[i].sort_order).toBe(i + 1);
      }
    });
    it('should return status 200 when tmnt id is not found', async () => {
      const response = await privateApi.get(tmntUrl + notFoundTmntId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.moneys).toHaveLength(0);
    });
    it('should return status 404 when tmntId is invalid', async () => { 
      try {
        const response = await privateApi.get(tmntUrl + 'invalid', {
          withCredentials: true
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
    it('should return starus 404 when tmntId is valid, but not a tmnt id', async () => { 
      try {
        const response = await privateApi.get(tmntUrl + userId, {
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
  })

  describe('POST one money API: /api/moneys', () => { 

    let createdMoney = false;    

    beforeAll(async () => { 
      await deletePostedMoney(moneyToPost.id);
    })

    beforeEach(() => {
      createdMoney = false;
    })

    afterEach(async () => {
      if (createdMoney) {
        await deletePostedMoney(moneyToPost.id);
      }      
    })

    it('should create a new money', async () => { 
      const moneyJSON = JSON.stringify(moneyToPost);
      const response = await privateApi.post(url, moneyJSON);
      expect(response.status).toBe(201);
      // the "POST" returns json'ed data, so decimal values return as strings
      const postedMoney = response.data.money;
      createdMoney = true;
      expect(postedMoney.id).toEqual(moneyToPost.id);
      expect(postedMoney.event_id).toEqual(moneyToPost.event_id);
      expect(postedMoney.squad_id).toEqual(moneyToPost.squad_id);
      expect(postedMoney.div_id).toEqual(moneyToPost.div_id);
      expect(postedMoney.descrip).toEqual(moneyToPost.descrip);
      expect(postedMoney.flow).toEqual(moneyToPost.flow);
      expect(Number(postedMoney.amount)).toEqual(moneyToPost.amount);
      expect(postedMoney.pot_id).toEqual(moneyToPost.pot_id);
      expect(postedMoney.brkt_id).toEqual(moneyToPost.brkt_id);
      expect(postedMoney.elim_id).toEqual(moneyToPost.elim_id);
      expect(postedMoney.sort_order).toEqual(moneyToPost.sort_order);
    })  
    
    it('should NOT create a new money when ID is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when ID is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when ID is valid, but not a money ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when event_id is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        event_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when event_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        event_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when event_id is valid, but not an event ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        event_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when squad_id is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        squad_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when squad_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        squad_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when squad_id is valid, but not an squad ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        squad_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when div_id is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        div_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when div_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        div_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when div_id is valid, but not an div ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        div_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when descrip is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        descrip: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when descrip is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        descrip: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when flow is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        flow: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when flow is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        flow: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when amount is blank', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        amount: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when amount is too low', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        amount: -1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when amount is too high', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        amount: maxMoney + 1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when amount is not a number', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        amount: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when pot_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        pot_id: "test",
        brkt_id: null,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when pot_id is valid, but not an pot ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        pot_id: userId,
        brkt_id: null,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when brkt_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        brkt_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when brkt_id is valid, but not an brkt ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        brkt_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when elim_id is invalid', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        brkt_id: null,
        elim_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when elim_id is valid, but not an elim ID', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        brkt_id: null,
        elim_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when got both pot_id and brkt_id', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
        brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when got both pot_id and elim_id', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
        brkt_id: null,
        elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new money when got both elim_id and elim_id', async () => { 
      const invalidMoney = {
        ...moneyToPost,
        brkt_id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
        elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.post(url, invalidJSON);
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

  describe('PUT one money API: /api/moneys/money/:id', () => { 

    const resetMoney = async () => {
      // make sure test event is reset in database
      const moneyJSON = JSON.stringify(testMoney);
      await privateApi.put(oneMoneyUrl + testMoney.id, moneyJSON);      
    }

    const putMoney = {
      ...testMoney,      
      descrip: "PRIZEFUND",
      flow: "OUT",
      amount: 2000,
      pot_id: null,
      brkt_id: null,
      elim_id: null,
      sort_order: 30,
    }

    let didPut = false;

    beforeAll(async () => {
      await resetMoney()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetMoney()
      }      
    })

    it('should update a money by ID', async () => { 
      const moneyJSON = JSON.stringify(putMoney);
      const response = await privateApi.put(oneMoneyUrl + testMoney.id, moneyJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedMoney = response.data.money;      
      expect(puttedMoney.id).toEqual(putMoney.id);
      expect(puttedMoney.event_id).toEqual(putMoney.event_id);
      expect(puttedMoney.squad_id).toEqual(putMoney.squad_id);
      expect(puttedMoney.div_id).toEqual(putMoney.div_id);
      expect(puttedMoney.descrip).toEqual(putMoney.descrip);
      expect(puttedMoney.flow).toEqual(putMoney.flow);
      expect(Number(puttedMoney.amount)).toEqual(putMoney.amount);
      expect(puttedMoney.sort_order).toEqual(putMoney.sort_order);
      expect(puttedMoney.pot_id).toEqual(putMoney.pot_id);
      expect(puttedMoney.brkt_id).toEqual(putMoney.brkt_id);
      expect(puttedMoney.elim_id).toEqual(putMoney.elim_id);
    })

    it('should update a money by ID and update pot_id', async () => { 
      const otherMoney = {
        ...putMoney,
        amount: 123,
        pot_id: 'pot_771fb6d8a9a04cb4b3372e212da2a3b0', // pot from another tmnt
        sort_order: 32,
      }
      const moneyJSON = JSON.stringify(otherMoney);
      const response = await privateApi.put(oneMoneyUrl + otherMoney.id, moneyJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedMoney = response.data.money;      
      expect(puttedMoney.id).toEqual(otherMoney.id);
      expect(Number(puttedMoney.amount)).toEqual(otherMoney.amount);
      expect(puttedMoney.sort_order).toEqual(otherMoney.sort_order);
      expect(puttedMoney.pot_id).toEqual(otherMoney.pot_id);
    })
    it('should update a money by ID and update brkt_id', async () => { 
      const otherMoney = {
        ...putMoney,
        amount: 123,
        brkt_id: 'brk_d037ea07dbc6453a8a705f4bb7599ed4', // brkt from another tmnt
        sort_order: 32,
      }
      const moneyJSON = JSON.stringify(otherMoney);
      const response = await privateApi.put(oneMoneyUrl + otherMoney.id, moneyJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedMoney = response.data.money;      
      expect(puttedMoney.id).toEqual(otherMoney.id);
      expect(Number(puttedMoney.amount)).toEqual(otherMoney.amount);
      expect(puttedMoney.sort_order).toEqual(otherMoney.sort_order);
      expect(puttedMoney.brkt_id).toEqual(otherMoney.brkt_id);
    })
    it('should update a money by ID and update elim_id', async () => { 
      const otherMoney = {
        ...putMoney,
        amount: 123,
        elim_id: 'elm_c03077494c2d4d9da166d697c08c28d2', // elim from another tmnt
        sort_order: 32,
      }
      const moneyJSON = JSON.stringify(otherMoney);
      const response = await privateApi.put(oneMoneyUrl + otherMoney.id, moneyJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedMoney = response.data.money;      
      expect(puttedMoney.id).toEqual(otherMoney.id);
      expect(Number(puttedMoney.amount)).toEqual(otherMoney.amount);
      expect(puttedMoney.sort_order).toEqual(otherMoney.sort_order);
      expect(puttedMoney.elim_id).toEqual(otherMoney.elim_id);
    })
    it('should update a money by ID and update sanitized amount', async () => { 
      const otherMoney = {
        ...putMoney,
        amount: 123.123,        
        sort_order: 32,
      }
      const moneyJSON = JSON.stringify(otherMoney);
      const response = await privateApi.put(oneMoneyUrl + otherMoney.id, moneyJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedMoney = response.data.money;      
      expect(puttedMoney.id).toEqual(otherMoney.id);
      expect(Number(puttedMoney.amount)).toEqual(123.12);
      expect(puttedMoney.sort_order).toEqual(otherMoney.sort_order);
      expect(puttedMoney.elim_id).toEqual(otherMoney.elim_id);
    })

    it('should NOT update a money by ID when ID is invalid', async () => {
      const moneyJSON = JSON.stringify(putMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + 'test', moneyJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID when ID is valid, but not a money ID', async () => {
      const moneyJSON = JSON.stringify(putMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + userId, moneyJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID when ID is not found', async () => {
      const moneyJSON = JSON.stringify(putMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + notFoundId, moneyJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing event_id', async () => {
      const invalidMoney = {
        ...putMoney,
        event_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with invalid event_id', async () => {
      const invalidMoney = {
        ...putMoney,
        event_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid event_id, but not an event ID', async () => {
      const invalidMoney = {
        ...putMoney,
        event_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing squad_id', async () => {
      const invalidMoney = {
        ...putMoney,
        squad_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with invalid squad_id', async () => {
      const invalidMoney = {
        ...putMoney,
        squad_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid squad_id, but not an squad ID', async () => {
      const invalidMoney = {
        ...putMoney,
        squad_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing div_id', async () => {
      const invalidMoney = {
        ...putMoney,
        div_id: "",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with invalid div_id', async () => {
      const invalidMoney = {
        ...putMoney,
        div_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid div_id, but not an div ID', async () => {
      const invalidMoney = {
        ...putMoney,
        div_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing descrip', async () => {
      const invalidMoney = {
        ...putMoney,
        descrip: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with invalid descrip', async () => {
      const invalidMoney = {
        ...putMoney,
        descrip: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing flow', async () => {
      const invalidMoney = {
        ...putMoney,
        flow: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with invalid flow', async () => {
      const invalidMoney = {
        ...putMoney,
        flow: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing amount', async () => {
      const invalidMoney = {
        ...putMoney,
        amount: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with amount too low', async () => {
      const invalidMoney = {
        ...putMoney,
        amount: -1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with amount too high', async () => {
      const invalidMoney = {
        ...putMoney,
        amount: maxMoney + 1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with amount not a number', async () => {
      const invalidMoney = {
        ...putMoney,
        amount: 'test',
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when invalid pot_id', async () => {
      const invalidMoney = {
        ...putMoney,
        pot_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid pot_id, but not a pot ID', async () => {
      const invalidMoney = {
        ...putMoney,
        pot_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when invalid brkt_id', async () => {
      const invalidMoney = {
        ...putMoney,
        brkt_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid brkt_id, but not a brkt ID', async () => {
      const invalidMoney = {
        ...putMoney,
        brkt_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when invalid elim_id', async () => {
      const invalidMoney = {
        ...putMoney,
        elim_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with valid elim_id, but not an elim ID', async () => {
      const invalidMoney = {
        ...putMoney,
        elim_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when have pot and brkt ids', async () => {
      const invalidMoney = {
        ...putMoney,        
        pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
        brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID when have pot and elim ids', async () => {
      const invalidMoney = {
        ...putMoney,        
        pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
        elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID when have brkt and elim ids', async () => {
      const invalidMoney = {
        ...putMoney,                
        brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
        elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a money by ID when missing sort_order', async () => {
      const invalidMoney = {
        ...putMoney,
        sort_order: null as any,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with sort_order too low', async () => {
      const invalidMoney = {
        ...putMoney,
        sort_order: -1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with sort_order too high', async () => {
      const invalidMoney = {
        ...putMoney,
        sort_order: maxSortOrder + 1,
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a money by ID with sort_order not a number', async () => {
      const invalidMoney = {
        ...putMoney,
        sort_order: 'test',
      }
      const invalidJSON = JSON.stringify(invalidMoney);
      try {
        const response = await privateApi.put(oneMoneyUrl + invalidMoney.id, invalidJSON);
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

  describe('PATCH by ID - API: /api/moneys/money/:id', () => { 

    const toPatchId = 'mon_b2b49fef395c43c7bc588e566b7efe91';
    
    const toPatch = {
      ...initTmntMoney,
      id: toPatchId,
      event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
      div_id: "div_24b1cd5dee0542038a1244fc2978e862",
      descrip: "ENTRIES",
      flow: "IN",
      amount: 1,
      pot_id: null,
      brkt_id: null,
      elim_id: null,
      sort_order: 3,      
    }

    const resetPatched = async () => {
      // make sure toPatch is reset in database
      const moneyJSON = JSON.stringify(toPatch);
      await privateApi.put(oneMoneyUrl + toPatch.id, moneyJSON);      
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

    it('should patch event_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        event_id: testMoney.event_id,
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.event_id).toEqual(patchMoney.event_id);
    })
    it('should patch squad_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        squad_id: testMoney.squad_id,
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.squad_id).toEqual(patchMoney.squad_id);
    })
    it('should patch div_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        div_id: testMoney.div_id,
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.div_id).toEqual(patchMoney.div_id);
    })

    it('should patch descrip when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        descrip: 'OTHER',
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.descrip).toEqual(patchMoney.descrip);
    })
    it('should patch flow when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        flow: 'OUT',
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.flow).toEqual(patchMoney.flow);
    })

    it('should patch amount when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        amount: 1234,
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(Number(patchedMoney.amount)).toEqual(patchMoney.amount);
    })

    it('should patch pot_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        pot_id: "pot_89fd8f787de942a1a92aaa2df3e7c185",
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.pot_id).toEqual(patchMoney.pot_id);
    })
    it('should patch brkt_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        brkt_id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.brkt_id).toEqual(patchMoney.brkt_id);
    })
    it('should patch elim_id when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        elim_id: "elm_c47a4ec07f824b0e93169ae78e8b4b1e",
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.elim_id).toEqual(patchMoney.elim_id);
    })

    it('should patch sort_order when patching a money by ID', async () => { 
      const patchMoney = {
        id: toPatchId,
        sort_order: 1234,
      }
      const moneyJSON = JSON.stringify(patchMoney);
      const response = await privateApi.patch(oneMoneyUrl + patchMoney.id, moneyJSON);
      const patchedMoney = response.data.money;
      expect(response.status).toBe(200);
      didPatch = true;
      expect(patchedMoney.sort_order).toEqual(patchMoney.sort_order);
    })

    it('should not patch money by ID when just passing in ID', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          id: toPatchId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch money by ID when ID is invalid', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: 1234,
        })
        const response = await privateApi.patch(oneMoneyUrl + 'test', invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch money by ID when ID is valid, but not found', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: 1234,
        })
        const response = await privateApi.patch(oneMoneyUrl + notFoundId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch money by ID when ID is valid, but not a money id', async () => {
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: 1234,
        })
        const response = await privateApi.patch(oneMoneyUrl + userId, invalidJSON)
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch event_id when patching a money by ID when event_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          event_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch event_id when patching a money by ID when event_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          event_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch squad_id when patching a money by ID when squad_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          squad_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch squad_id when patching a money by ID when squad_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          squad_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch div_id when patching a money by ID when div_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          div_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch div_id when patching a money by ID when div_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          div_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch descrip when patching a money by ID when descrip is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          descrip: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch flow when patching a money by ID when flow is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          flow: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch amount when patching a money by ID when amount is too low', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          amount: -1,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching a money by ID when amount is too high', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          amount: maxMoney + 1,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch amount when patching a money by ID when amount is not a number', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          amount: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch pot_id when patching a money by ID when pot_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          pot_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch pot_id when patching a money by ID when pot_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          pot_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch brkt_id when patching a money by ID when brkt_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          brkt_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch brkt_id when patching a money by ID when brkt_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          brkt_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch elim_id when patching a money by ID when elim_id is invalid', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          elim_id: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch elim_id when patching a money by ID when elim_id is valid, but not an event_id', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          elim_id: userId,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should not patch sort_order when patching a money by ID when sort_order is too low', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: -1,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch sort_order when patching a money by ID when sort_order is too high', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: maxSortOrder + 1,
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not patch sort_order when patching a money by ID when sort_order is not a number', async () => { 
      try {
        const invalidJSON = JSON.stringify({          
          sort_order: 'test',
        })
        const response = await privateApi.patch(oneMoneyUrl + toPatchId, invalidJSON)
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

  describe('DELETE by ID - API: /api/moneys/money/:id', () => { 

    const toDelMoney = {
      ...initTmntMoney,
      id: "mon_b2b49fef395c43c7bc588e566b7efe91",
      event_id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
      squad_id: "sqd_3397da1adc014cf58c44e07c19914f71",
      div_id: "div_24b1cd5dee0542038a1244fc2978e862",
      descrip: "ENTRIES",
      amount: 1,
      pot_id: null,
      brkt_id: null,
      elim_id: null,
      sort_order: 3,
    }

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted event, add event back
      try {
        const moneyJSON = JSON.stringify(toDelMoney);
        await privateApi.post(url, moneyJSON);
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a money by ID', async () => {
      try {
        const response = await privateApi.delete(oneMoneyUrl + toDelMoney.id)
        expect(response.status).toBe(200);
        didDel = true;
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a money by ID when ID is valid, but not found', async () => {
      const response = await privateApi.delete(oneMoneyUrl + notFoundId);
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    })    
    it('should NOT delete a money by ID when ID is invalid', async () => {
      try {
        const response = await privateApi.delete(oneMoneyUrl + 'test');
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a money by ID when ID is valid, but not a money ID', async () => {
      try {
        const response = await privateApi.delete(oneMoneyUrl + userId);
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

})