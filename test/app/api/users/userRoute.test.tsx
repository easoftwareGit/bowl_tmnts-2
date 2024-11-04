import axios, { AxiosError } from "axios";
import { baseUsersApi } from "@/lib/db/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";
import { User } from "@prisma/client";

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

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;    
const oneUserUrl = url + "/user/"

describe('Users - API: /api/users', () => { 
    
  const testUser: userType = {
    ...initUser,
    id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    email: "adam@email.com",    
    first_name: "Adam",
    last_name: "Smith",
    password: "Test123!",
    phone: "+18005551212",
    role: 'ADMIN',
  }                     
  const notFoundId = "usr_01234567890123456789012345678901";
  const nonUserId = "tmt_01234567890123456789012345678901";
  
  const user2Id = "usr_516a113083983234fc316e31fb695b85";
  const user2Email = "chad@email.com"

  const deletePostedUser = async () => {
    const response = await axios.get(url);
    const users = response.data.users;
    const toDel = users.find((u: userType) => u.email === 'test@email.com');
    if (toDel) {
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + toDel.id
        });        
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    }
  }

  const resetUser = async () => { 
    // make sure test user is reset in database
    const userJSON = JSON.stringify(testUser);
    const response = await axios({
      method: "put",
      data: userJSON,
      withCredentials: true,
      url: oneUserUrl + testUser.id,
    })
  }

  describe('GET', () => { 

    beforeAll(async () => {
      await deletePostedUser();
    })

    it('should get all users', async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 6 rows in prisma/seed.ts 
      expect(response.data.users).toHaveLength(6) 
    })
  
  })

  describe('POST', () => {

    const userToPost: userType = {
      ...initUser,      
      email: "test@email.com",
      password: "Test123!",
      first_name: "Test",
      last_name: "Last",
      phone: "+18005551212",
    };
  
    let createdUser = false;

    beforeAll(async () => {
      await deletePostedUser();
    })

    beforeEach(() => {
      createdUser = false;
    })

    afterEach(async () => {
      if (createdUser) {
        await deletePostedUser();
      }
    })

    it('should create a new user', async () => {
      const userJSON = JSON.stringify(userToPost);
      const response = await axios({
        method: "post",
        data: userJSON,
        withCredentials: true,
        url: url,
      });
      expect(response.status).toBe(201);
      const postedUser: userType = response.data.user;
      createdUser = true;
      expect(postedUser.id).toEqual(userToPost.id);
      expect(postedUser.first_name).toEqual(userToPost.first_name);
      expect(postedUser.last_name).toEqual(userToPost.last_name);
      expect(postedUser.email).toEqual(userToPost.email);
      expect(postedUser.phone).toEqual(userToPost.phone);      
    })
    it('should NOT create a new user when missing id', async () => {
      const invalidUser = {
        ...userToPost,
        id: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user when missing first name', async () => {
      const invalidUser = {
        ...userToPost,
        first_name: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user when missing last name', async () => {
      const invalidUser = {
        ...userToPost,
        last_name: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user when missing email', async () => {
      const invalidUser = {
        ...userToPost,
        email: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user when missing password', async () => {
      const invalidUser = {
        ...userToPost,
        password: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user when missing phone', async () => {
      const invalidUser = {
        ...userToPost,
        phone: "",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT create a new user with invalid id', async () => {
      const invalidUser = {
        ...userToPost,
        id: "test",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new user with valid id but not a user id', async () => {
      const invalidUser = {
        ...userToPost,
        id: nonUserId,
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new user with invalid email', async () => {
      const invalidUser = {
        ...userToPost,
        email: "test",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new user with invalid phone', async () => {
      const invalidUser = {
        ...userToPost,
        phone: "test",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new user with invalid password', async () => {
      const invalidUser = {
        ...userToPost,
        password: "test",
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should NOT create a new user with duplicate email', async () => {
      const invalidUser = {
        ...userToPost,
        email: user2Email,
      }
      const userJSON = JSON.stringify(invalidUser);      
      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
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
    it('should create a new user with sanitized data', async () => {
      const toSanitizeUser = {
        ...userToPost,
        first_name: "    <script>" + userToPost.first_name + "</script>   ",
        last_name: "%3Cdiv%3E" + userToPost.last_name + "%3C/div%3E%20%3Cp%3E!%3C/p%3E",
      }
      const userJSON = JSON.stringify(toSanitizeUser);
      const response = await axios({
        method: "post",
        data: userJSON,
        withCredentials: true,
        url: url,
      });
      const postedUser: userType = response.data.user;
      createdUser = true;
      expect(response.status).toBe(201);
      expect(postedUser.id).toEqual(toSanitizeUser.id); // use toSanitizeUser.id 
      expect(postedUser.first_name).toEqual(userToPost.first_name);
      expect(postedUser.last_name).toEqual(userToPost.last_name);
      expect(postedUser.email).toEqual(userToPost.email);
      expect(postedUser.phone).toEqual(userToPost.phone);
    })
  
  })
  
  describe('GET by ID - API: API: /api/users/user/:id', () => {

    it('should get a user by ID', async () => {
      const response = await axios.get(oneUserUrl + testUser.id);
      const user = response.data.user;
      expect(response.status).toBe(200);      
      expect(user.first_name).toEqual(testUser.first_name);
      expect(user.last_name).toEqual(testUser.last_name);
      expect(user.email).toEqual(testUser.email);
      expect(user.phone).toEqual(testUser.phone);
    })

    it('should NOT get a user by ID when ID is invalid', async () => {
      try {
        const response = await axios.get(oneUserUrl + "test");
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a user by ID when ID is valid, but not a user ID', async () => {
      try {
        const response = await axios.get(oneUserUrl + nonUserId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT get a user by ID when ID is not found', async () => {
      try {
        const response = await axios.get(oneUserUrl + notFoundId);
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        // } else if ('response' in err) {
        //   expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  })

  describe("PUT by ID - API: API: /api/users/user/:id", () => {

    const putUser = {
      ...testUser,
      first_name: "Zach",
      last_name: "Jones",
      email: "zach@email.com",
      password: "321Test!",
      phone: "+18005559999",
    }

    const sampleUser: userType = {
      ...initUser,
      id: "",
      email: "test@email.com",
      password: "Test123!",
      first_name: "Test",
      last_name: "Last",
      phone: "+18005551212",
    };

    let user2: User;

    beforeAll(async () => {
      // get user 2 - only need user 2 for user route tests
      const response = await axios.get(url);
      const users = response.data.users;
      user2 = users.find((u: userType) => u.id === user2Id);

      await resetUser();
    })

    afterEach(async () => {
      await resetUser();
    })

    it('should update a user by ID', async () => {
      const userJSON = JSON.stringify(putUser);
      const response = await axios({
        method: "put",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      });
      const user = response.data.user;
      expect(response.status).toBe(200);      
      expect(user.first_name).toEqual(putUser.first_name);
      expect(user.last_name).toEqual(putUser.last_name);
      expect(user.email).toEqual(putUser.email);
      expect(user.phone).toEqual(putUser.phone);
      // all seeded uses have same password, and therefore same password_hash
      // check to see password_hash has been updated
      expect(user.password_hash).not.toEqual(user2.password_hash);
    })
    it('should NOT update a user by ID when ID is invalid', async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + 'test'
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
    it('should NOT update a user by ID when ID is valid, but not a user ID', async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + nonUserId
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
    it('should NOT update a user by ID when ID is not found', async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + notFoundId
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
    it('should NOT update a user by ID when first name is missing', async () => {
      const invalidUser = {
        ...putUser,
        first_name: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID when last name is missing', async () => {
      const invalidUser = {
        ...putUser,
        last_name: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID when email is missing', async () => {
      const invalidUser = {
        ...putUser,
        email: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID when phone is missing', async () => {
      const invalidUser = {
        ...putUser,
        phone: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID when password is missing', async () => {
      const invalidUser = {
        ...putUser,
        password: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID with invalid email', async () => {
      const invalidUser = {
        ...putUser,
        email: "test",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID with invalid phone', async () => {
      const invalidUser = {
        ...putUser,
        phone: "test",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID with invalid password', async () => {
      const invalidUser = {
        ...putUser,
        password: "test",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT update a user by ID when email is a dublicate', async () => {
      const invalidUser = {
        ...putUser,
        email: user2Email,
      }
      try {        
        const userJSON = JSON.stringify(invalidUser);
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should update a user by ID with sanitized data', async () => {
      const toSanitizeUser = {
        ...putUser,
        first_name: "    <script>" + sampleUser.first_name + "</script>   ",
        last_name: "%3Cdiv%3E" + sampleUser.last_name + "%3C/div%3E%20%3Cp%3E!%3C/p%3E",
      }
      const userJSON = JSON.stringify(toSanitizeUser);
      const response = await axios({
        method: "put",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      expect(response.status).toBe(200);
      const puttedUser = response.data.user;
      expect(puttedUser.first_name).toEqual(sampleUser.first_name);
      expect(puttedUser.last_name).toEqual(sampleUser.last_name);
    })

  })

  describe('PATCH by ID - API: API: /api/users/user/:id', () => { 

    let user2: User;

    beforeAll(async () => {
      // get user 2 - only need user 2 for user route tests
      const response = await axios.get(url);
      const users = response.data.users;
      user2 = users.find((u: userType) => u.id === user2Id);

      // make sure test user is reset in database
      const userJSON = JSON.stringify(testUser);
      const putResponse = await axios({
        method: "put",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
    })

    afterEach(async () => {
      try {
        const userJSON = JSON.stringify(testUser);
        const putResponse = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    })

    it('should patch a user first name by ID', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        first_name: "Zach",
      })

      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.first_name).toEqual("Zach");
    })
    it('should patch a user last name by ID', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        last_name: "Jones",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.last_name).toEqual("Jones");
    })
    it('should patch a user email by ID', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        email: "zach@email.com",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.email).toEqual("zach@email.com");
    })
    it('should patch a user phone by ID', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        phone: "+18005559999",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.phone).toEqual("+18005559999");
    })  
    it('should patch a user password by ID', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        password: "321Test!",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.password_hash).not.toEqual(user2.password_hash);
    })
    it('should NOT patch a user by ID when ID is invalid', async () => { 
      try {
        const userJSON = JSON.stringify({
          ...testUser,
          first_name: "Zach",
        })
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + 'test',
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
    it('should NOT patch a user by ID when ID is not found', async () => { 
      try {
        const userJSON = JSON.stringify({
          ...testUser,
          first_name: "Zach",
        })
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + notFoundId,
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
    it('should NOT patch a user by ID when ID is valid, but not a user ID', async () => {
      try {
        const userJSON = JSON.stringify({
          ...testUser,
          first_name: "Zach",
        })
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + nonUserId,
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
    it('should NOT patch a user by ID when first name is missing', async () => { 
      const invalidUser = {
        ...testUser,
        first_name: "",
      } 
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should NOT patch a user by ID when last name is missing', async () => { 
      const invalidUser = {
        ...testUser,
        last_name: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should NOT patch a user by ID when email is missing', async () => { 
      const invalidUser = {
        ...testUser,
        email: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should NOT patch a user by ID when phone is missing', async () => {
      const invalidUser = {
        ...testUser,
        phone: "",
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should NOT patch a user by ID when password is missing', async () => { 
      const invalidUser = {
        ...testUser,
        password: "",
      } 
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should not patch a user by ID when first name is too long', async () => {
      const invalidUser = {
        ...testUser,
        first_name: "a".repeat(51),
      }      
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should not patch a user by ID when last name is too long', async () => {
      const invalidUser = {
        ...testUser,
        last_name: "a".repeat(51),
      } 
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should not patch a user by ID when email is too long', async () => {
      const invalidUser = {
        ...testUser,
        email: "a".repeat(256),
      } 
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should not patch a user by ID when phone is too long', async () => {
      const invalidUser = {
        ...testUser,
        phone: "a".repeat(256),
      } 
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should not patch a user by ID when email is a duplicate', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        email: user2Email,
      })
      try {
        const response = await axios({
          method: "patch",
          data: userJSON,
          withCredentials: true,
          url: oneUserUrl + testUser.id,
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
    it('should patch a user by ID with sanitized first name', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        first_name: "<script>alert(1)</script>",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.first_name).toEqual("alert1");
    })
    it('should patch a user by ID with sanitized last name', async () => { 
      const userJSON = JSON.stringify({
        ...testUser,
        last_name: "   Jones ***",
      })
      const response = await axios({
        method: "patch",
        data: userJSON,
        withCredentials: true,
        url: oneUserUrl + testUser.id,
      })
      const patchedUser = response.data.user;
      expect(response.status).toBe(200);      
      expect(patchedUser.last_name).toEqual("Jones");
    })

  })

  describe('DELETE by ID - API: API: /api/users/user/:id', () => {     
        
    const toDelUser = {
      ...initUser,      
      id: "usr_07de11929565179487c7a04759ff9866",      
      email: "fred@email.com",
      password: 'Test123!',
      first_name: "Fred",
      last_name: "Green",
      phone: "+18005554321",      
    }   

    let didDel = false

    beforeEach(() => {
      didDel = false;
    })

    afterEach(async () => {
      if (!didDel) return;
      // if deleted user, add user back
      try {
        const userJSON = JSON.stringify(toDelUser);
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url: url,
        });  
        console.log('response.status: ', response.status)
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    })

    it('should delete a user by ID', async () => {      
      try {          
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + toDelUser.id
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
    })
    it('should NOT delete a user when ID is invalid', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + "test"
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })        
    it('should NOT delete a user when ID is not found', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + notFoundId
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a user when ID is valid, but not a user ID', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + nonUserId
        });
        expect(delResponse.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should NOT delete a user when user has child rows', async () => { 
      try {
        const delResponse = await axios({
          method: "delete",
          withCredentials: true,
          url: oneUserUrl + testUser.id
        });
        expect(delResponse.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    })

  })

})  
