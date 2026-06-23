import { privateApi } from "@/lib/api/axios";
import { AxiosError } from "axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../testApi";
import type { divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import { maxMoney, maxPosition } from "@/lib/validation/constants";

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
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;

const oneDivPfUrl = url + "/divPf/";
const divUrl = url + "/div/"; 

const notFoundId = "dpf_01234567890123456789012345678901";
const notFoundDivId = "div_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

describe('Events - GETs and POST API: /api/events', () => {

  const testDivPf: divPfType = {
    ...initDivPf,
    id: "dpf_ce55c52bd60d4943bb747590a03c9732",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    position: 1,
    amount: 300,
  }

  const divPfToPost: divPfType = {
    ...initDivPf,
    id: "dpf_bbb6e6fcaa8343d0b18b56a71e8c160a",
    div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
    position: 100,
    amount: 500,
  }

  const deletePostedDivPf = async (divPfId: string) => {
    try {
      await privateApi.delete(oneDivPfUrl + divPfId);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  }  

  // describe('GET - API: API: /api/divPfs/divPf/:id', () => {

  //   beforeAll(async () => {
  //     await deletePostedDivPf(divPfToPost.id);
  //   });

  //   it('should get all divPfs', async () => {
  //     const response = await privateApi.get(url);
  //     expect(response.status).toBe(200);
  //     // 16 rows in prisma/seed.ts
  //     expect(response.data.divPfs).toHaveLength(16);
  //     const divPfs: divPfType[] = response.data.divPfs;
  //     divPfs.forEach((divPf: divPfType) => {
  //       expect(divPf.div_id).not.toBeNull();
  //       expect(divPf.position).not.toBeNull();
  //       expect(divPf.amount).not.toBeNull();
  //     })
  //   });
  // });

  // describe('GET by ID - API: API: /api/divPfs/divPf/:id', () => {

  //   beforeAll(async () => {
  //     await deletePostedDivPf(divPfToPost.id);
  //   });

  //   it('should get one money', async () => {
  //     const response = await privateApi.get(oneDivPfUrl + testDivPf.id);
  //     expect(response.status).toBe(200);
  //     // the "GET" returns json'ed data, so decimal values return as strings
  //     const divPf: divPfType = response.data.divPf;
  //     expect(divPf.id).toBe(testDivPf.id);
  //     expect(divPf.div_id).toBe(testDivPf.div_id);
  //     expect(divPf.position).toBe(testDivPf.position);
  //     expect(Number(divPf.amount)).toBe(testDivPf.amount);
  //   });
  //   it('should not get one money when ID is invalid', async () => {
  //     try {
  //       const response = await privateApi.get(oneDivPfUrl + "/test");
  //       expect(true).toBeFalsy();
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   });
  //   it('should not get one money when ID is valid, but not a money ID', async () => {
  //     try {
  //       const response = await privateApi.get(oneDivPfUrl + userId);
  //       expect(true).toBeFalsy();
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not get one money when ID is not found', async () => {
  //     try {
  //       const response = await privateApi.get(oneDivPfUrl + notFoundId);
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   });
  // });

  // describe('GET all divPfs for a div - API: /api/divPfs/div/:divId', () => {

  //   beforeAll(async () => {
  //     await deletePostedDivPf(divPfToPost.id);
  //   });

  //   it('should get all divPfs for a division', async () => {
  //     // const values taken from prisma/seed.ts
  //     const divId = "div_99a3cae28786485bb7a036935f0f6a0a";

  //     const response = await privateApi.get(divUrl + divId, {
  //       withCredentials: true
  //     });
  //     expect(response.status).toBe(200);
  //     // 18 money rows for tmnt in prisma/seed.ts
  //     expect(response.data.divPfs).toHaveLength(9);
  //     const divPfs: divPfType[] = response.data.divPfs;
  //     // query in /api/divPfs/div GET sorts by position
  //     for (let i = 0; i < divPfs.length; i++) {
  //       expect(divPfs[i].div_id).toBe(divId);
  //       expect(divPfs[i].position).toBe(i + 1);
  //       expect(divPfs[i].amount).not.toBeNull();
  //     }
  //   });
  //   it('should return status 200 when div id is not found', async () => {
  //     const response = await privateApi.get(divUrl + notFoundDivId, {
  //       withCredentials: true
  //     });
  //     expect(response.status).toBe(200);
  //     expect(response.data.divPfs).toHaveLength(0);
  //   });
  //   it('should return status 404 when divId is invalid', async () => {
  //     try {
  //       const response = await privateApi.get(divUrl + 'invalid', {
  //         withCredentials: true
  //       });
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should return starus 404 when divId is valid, but not a div id', async () => {
  //     try {
  //       const response = await privateApi.get(divUrl + userId, {
  //         withCredentials: true
  //       })
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  // })

  // describe('POST one money API: /api/divPfs', () => { 

  //   let createdDivPf = false;    

  //   beforeAll(async () => { 
  //     await deletePostedDivPf(divPfToPost.id);
  //   })

  //   beforeEach(() => {
  //     createdDivPf = false;
  //   })

  //   afterEach(async () => {
  //     if (createdDivPf) {
  //       await deletePostedDivPf(divPfToPost.id);
  //     }      
  //   })

  //   it('should create a new divPf', async () => { 
  //     const divPfJSON = JSON.stringify(divPfToPost);
  //     const response = await privateApi.post(url, divPfJSON);
  //     expect(response.status).toBe(201);
  //     // the "POST" returns json'ed data, so decimal values return as strings
  //     const postedDivPf = response.data.divPf;
  //     createdDivPf = true;
  //     expect(postedDivPf.id).toEqual(divPfToPost.id);
  //     expect(postedDivPf.div_id).toEqual(divPfToPost.div_id);
  //     expect(Number(postedDivPf.position)).toEqual(divPfToPost.position);
  //     expect(Number(postedDivPf.amount)).toEqual(divPfToPost.amount);
  //   })  
    
  //   it('should NOT create a new divPf when ID is blank', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       id: "",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when ID is invalid', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       id: "test",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when ID is valid, but not a divPf ID', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       id: userId,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when div_id is blank', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       div_id: "",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when div_id is invalid', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       div_id: "test",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when div_id is valid, but not an divPf ID', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       div_id: userId,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when position is null', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       position: null as any,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when position is too low', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       position: 0,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when position is too high', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       position: maxPosition + 1,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when position is not a number', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       position: "test",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when position is not an integer', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       position: 1.5,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when amount is null', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       amount: null as any,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when amount is too low', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       amount: -1,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when amount is too high', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       amount: maxMoney + 1,
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT create a new divPf when amount is not a number', async () => { 
  //     const invalidDivPf = {
  //       ...divPfToPost,
  //       amount: "test",
  //     }
  //     const invalidJSON = JSON.stringify(invalidDivPf);
  //     try {
  //       const response = await privateApi.post(url, invalidJSON);
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  // })  

  describe('PUT one money API: /api/divPfs/divPf/:id', () => { 

    const resetDivPf = async () => {
      // make sure test event is reset in database
      const difPfJSON = JSON.stringify(testDivPf);
      await privateApi.put(oneDivPfUrl + testDivPf.id, difPfJSON);      
    }

    const putDivPf = {
      ...testDivPf,      
      sort_order: 30,
    }

    let didPut = false;

    beforeAll(async () => {
      await resetDivPf()
    })

    beforeEach(() => {
      didPut = false;
    })

    afterEach(async () => {
      if (didPut) {        
        await resetDivPf()
      }      
    })

    it('should update a divPf by ID', async () => { 
      const difPfJSON = JSON.stringify(putDivPf);
      const response = await privateApi.put(oneDivPfUrl + testDivPf.id, difPfJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedDivPf = response.data.divPf;      
      expect(puttedDivPf.id).toEqual(putDivPf.id);
      expect(puttedDivPf.div_id).toEqual(putDivPf.div_id);
      expect(Number(puttedDivPf.position)).toEqual(putDivPf.position);
      expect(Number(puttedDivPf.amount)).toEqual(putDivPf.amount);
    })

    it('should update a divPf by ID and update sanitized amount', async () => { 
      const otherDivPf = {
        ...putDivPf,
        amount: 123.123,        
        position: 32,
      }
      const difPfJSON = JSON.stringify(otherDivPf);
      const response = await privateApi.put(oneDivPfUrl + otherDivPf.id, difPfJSON);
      expect(response.status).toBe(200);
      didPut = true;
      // the "PUT" returns json'ed data, so decimal values return as strings
      const puttedDivPf = response.data.divPf;      
      expect(puttedDivPf.id).toEqual(otherDivPf.id);
      expect(Number(puttedDivPf.position)).toEqual(otherDivPf.position);
      expect(Number(puttedDivPf.amount)).toEqual(123.12);      
    })

    it('should NOT update a divPf by ID when ID is invalid', async () => {
      const difPfJSON = JSON.stringify(putDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + 'test', difPfJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when ID is valid, but not a divPf ID', async () => {
      const difPfJSON = JSON.stringify(putDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + userId, difPfJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when ID is not found', async () => {
      const difPfJSON = JSON.stringify(putDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + notFoundId, difPfJSON);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a divPf by ID when missing div_id', async () => {
      const invalidDivPf = {
        ...putDivPf,
        div_id: "",
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID with invalid div_id', async () => {
      const invalidDivPf = {
        ...putDivPf,
        div_id: "test",
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID with valid div_id, but not an div ID', async () => {
      const invalidDivPf = {
        ...putDivPf,
        div_id: userId,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a divPf by ID when missing position', async () => {
      const invalidDivPf = {
        ...putDivPf,
        position: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when position too low', async () => {
      const invalidDivPf = {
        ...putDivPf,
        position: 0,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when position too high', async () => {
      const invalidDivPf = {
        ...putDivPf,
        position: maxPosition + 1,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when position is not a number', async () => {
      const invalidDivPf = {
        ...putDivPf,
        position: 'test',
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID when position is not an integer', async () => {
      const invalidDivPf = {
        ...putDivPf,
        position: 1.5,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

    it('should NOT update a divPf by ID when missing amount', async () => {
      const invalidDivPf = {
        ...putDivPf,
        amount: null as any,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID with amount too low', async () => {
      const invalidDivPf = {
        ...putDivPf,
        amount: -1,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID with amount too high', async () => {
      const invalidDivPf = {
        ...putDivPf,
        amount: maxMoney + 1,
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a divPf by ID with amount not a number', async () => {
      const invalidDivPf = {
        ...putDivPf,
        amount: 'test',
      }
      const invalidJSON = JSON.stringify(invalidDivPf);
      try {
        const response = await privateApi.put(oneDivPfUrl + invalidDivPf.id, invalidJSON);
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

  describe('PUT many divPfs API: /api/divPfs/divPf/:id', () => {

    const pmDivPf1 = {
      ...initDivPf,
      id: "dpf_ce55c52bd60d4943bb747590a03c9732",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      position: 1,
      amount: 300,
    }
    const pmDivPf2 = {
      ...initDivPf,
      id: "dpf_ce55c52bd60d4943bb747590a03c9733",
      div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
      position: 2,
      amount: 200,
    }
    const restoreDivPfs = async () => {
      await privateApi.delete(divUrl + pmDivPf1.div_id);
      await privateApi.delete(divUrl + pmDivPf2.div_id);
      const pm1JSON = JSON.stringify(pmDivPf1);
      await privateApi.post(divUrl + pmDivPf1.div_id, pm1JSON);
      const pm2JSON = JSON.stringify(pmDivPf2);
      await privateApi.post(divUrl + pmDivPf2.div_id, pm2JSON);
    }

    let putMany = false;

    beforeAll(async () => {
      await restoreDivPfs();
    })

    afterEach(async () => {
      if (putMany) {
        await restoreDivPfs();
      }
      putMany = false;
    })

    it('should update many divPfs for a div', async () => {})

  })

  // describe('PATCH by ID - API: /api/divPfs/divPf/:id', () => { 

  //   const toPatchId = 'dpf_880335b1a15845c8aeb59efad19d6100';
    
  //   const toPatch = {
  //     ...initDivPf,
  //     id: toPatchId,
  //     div_id: "div_24b1cd5dee0542038a1244fc2978e862",
  //     position: 20,
  //     amount: 1234,
  //   }

  //   const resetPatched = async () => {
  //     // make sure toPatch is reset in database
  //     const divPfJSON = JSON.stringify(toPatch);
  //     await privateApi.put(oneDivPfUrl + toPatch.id, divPfJSON);      
  //   }

  //   let didPatch = false;

  //   beforeAll(async () => {
  //     await resetPatched();
  //   })

  //   beforeEach(() => {
  //     didPatch = false;
  //   })

  //   afterEach(async () => {
  //     if (didPatch) {
  //       await resetPatched();
  //     }
  //   })

  //   it('should patch position when patching a divPf by ID', async () => { 
  //     const patchDivPf = {
  //       id: toPatchId,
  //       position: 321,
  //     }
  //     const divPfJSON = JSON.stringify(patchDivPf);
  //     const response = await privateApi.patch(oneDivPfUrl + patchDivPf.id, divPfJSON);
  //     const patchedDivPf = response.data.divPf;
  //     expect(response.status).toBe(200);
  //     didPatch = true;
  //     expect(Number(patchedDivPf.position)).toEqual(patchDivPf.position);
  //   })

  //   it('should patch amount when patching a divPf by ID', async () => { 
  //     const patchDivPf = {
  //       id: toPatchId,
  //       amount: 4321,
  //     }
  //     const divPfJSON = JSON.stringify(patchDivPf);
  //     const response = await privateApi.patch(oneDivPfUrl + patchDivPf.id, divPfJSON);
  //     const patchedDivPf = response.data.divPf;
  //     expect(response.status).toBe(200);
  //     didPatch = true;
  //     expect(Number(patchedDivPf.amount)).toEqual(patchDivPf.amount);
  //   })

  //   it('should not patch divPf by ID when just passing in ID', async () => {
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         id: toPatchId,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(400);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(400);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch divPf by ID when ID is invalid', async () => {
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 321,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + 'test', invalidJSON)
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch divPf by ID when ID is valid, but not found', async () => {
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 321,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + notFoundId, invalidJSON)
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch divPf by ID when ID is valid, but not a divPf id', async () => {
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 321,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + userId, invalidJSON)
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })

  //   it('should NOT patch div_id when patching a divPf by ID', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         id: toPatchId,
  //         div_id: testDivPf.div_id,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(400);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(400);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch div_id when patching a divPf by ID when div_id is invalid', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         div_id: 'test',
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(400);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(400);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch div_id when patching a divPf by ID when div_id is valid, but not an event_id', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         div_id: userId,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(400);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(400);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })

  //   it('should not patch position when patching a divPf by ID when position is too low', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 0,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch position when patching a divPf by ID when position is too high', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: maxPosition + 1,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch position when patching a divPf by ID when position is not a number', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 'test',
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch position when patching a divPf by ID when position is not an integer', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         position: 1.5,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })


  //   it('should not patch amount when patching a divPf by ID when amount is too low', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         amount: -1,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch amount when patching a divPf by ID when amount is too high', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         amount: maxMoney + 1,
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should not patch amount when patching a divPf by ID when amount is not a number', async () => { 
  //     try {
  //       const invalidJSON = JSON.stringify({          
  //         amount: 'test',
  //       })
  //       const response = await privateApi.patch(oneDivPfUrl + toPatchId, invalidJSON)
  //       expect(response.status).toBe(422);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(422);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  // })  

  // describe('DELETE by ID - API: /api/moneys/money/:id', () => { 

  //   const toDelDivPf = {
  //     ...initDivPf,
  //     id: "dpf_880335b1a15845c8aeb59efad19d6100",
  //     div_id: "div_24b1cd5dee0542038a1244fc2978e862",
  //     position: 1,
  //     amount: 123,
  //   }

  //   let didDel = false

  //   beforeEach(() => {
  //     didDel = false;
  //   })

  //   afterEach(async () => {
  //     if (!didDel) return;
  //     // if deleted event, add event back
  //     try {
  //       const divPfJSON = JSON.stringify(toDelDivPf);
  //       await privateApi.post(url, divPfJSON);
  //     } catch (err) {
  //       if (err instanceof Error) console.log(err.message);
  //     }
  //   })

  //   it('should delete a divPf by ID', async () => {
  //     try {
  //       const response = await privateApi.delete(oneDivPfUrl + toDelDivPf.id)
  //       expect(response.status).toBe(200);
  //       didDel = true;
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a divPf by ID when ID is valid, but not found', async () => {
  //     const response = await privateApi.delete(oneDivPfUrl + notFoundId);
  //     expect(response.status).toBe(200);
  //     expect(response.data.count).toBe(0);
  //   })    
  //   it('should NOT delete a divPf by ID when ID is invalid', async () => {
  //     try {
  //       const response = await privateApi.delete(oneDivPfUrl + 'test');
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  //   it('should NOT delete a divPf by ID when ID is valid, but not a divPf ID', async () => {
  //     try {
  //       const response = await privateApi.delete(oneDivPfUrl + userId);
  //       expect(response.status).toBe(404);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         expect(err.response?.status).toBe(404);
  //       } else {
  //         expect(true).toBeFalsy();
  //       }
  //     }
  //   })
  // })

});