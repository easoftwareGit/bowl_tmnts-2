import axios, { AxiosError } from "axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import type { userDataType, userFormType } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";

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
const oneUserUrl = url + "/user/";
const emailUrl = url + "/email/";

type userDbResponseType = userDataType & {
  password_hash?: string;
};

describe("Users - API: /api/users", () => {
  const testUser: userFormType = {
    ...initUserForm,
    id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    email: "adam@email.com",
    first_name: "Adam",
    last_name: "Smith",
    password: "Test123!",
    phone: "+18005551212",
    role: "ADMIN",
  };

  const notFoundId = "usr_01234567890123456789012345678901";
  const nonUserId = "tmt_01234567890123456789012345678901";

  const user2Id = "usr_516a113083983234fc316e31fb695b85";
  const user2Email = "chad@email.com";

  const deletePostedUser = async (userId: string) => {
    try {
      await axios.delete(oneUserUrl + userId, { withCredentials: true });        
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  const resetUser = async () => {
    // make sure test user is reset in database
    try {
      const userJSON = JSON.stringify(testUser);
      await axios.put(oneUserUrl + testUser.id, userJSON, {
        withCredentials: true,
      });      
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("GET", () => {
    it("should get all users", async () => {
      const response = await axios.get(url);
      expect(response.status).toBe(200);
      // 6 rows in prisma/seed.ts
      expect(response.data.users).toHaveLength(6);
    });
  });

  describe("GET by ID - API: API: /api/users/user/:id", () => {
    it("should get a user by ID", async () => {
      const response = await axios.get(oneUserUrl + testUser.id);
      const user: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(user.first_name).toEqual(testUser.first_name);
      expect(user.last_name).toEqual(testUser.last_name);
      expect(user.email).toEqual(testUser.email);
      expect(user.phone).toEqual(testUser.phone);
    });

    it("should NOT get a user by ID when ID is invalid", async () => {
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
    });

    it("should NOT get a user by ID when ID is valid, but not a user ID", async () => {
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
    });

    it("should NOT get a user by ID when ID is not found", async () => {
      try {
        const response = await axios.get(oneUserUrl + notFoundId);
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

  describe("GET by eMail - API: API: /api/users/email/:email", () => {
    it("should get a user by email", async () => {
      const encodedEmail = encodeURIComponent(testUser.email);
      const response = await axios.get(emailUrl + encodedEmail);
      const user: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(user.id).toEqual(testUser.id);
      expect(user.first_name).toEqual(testUser.first_name);
      expect(user.last_name).toEqual(testUser.last_name);
      expect(user.email).toEqual(testUser.email);
      expect(user.phone).toEqual(testUser.phone);
    });

    it("should NOT get a user by email when email is invalid", async () => {
      try {        
        const response = await axios.get(emailUrl + "test");
        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT get a user by email when email is not found", async () => {
      const notFoundEmail = 'notfound@email.com';
      const encodedEmail = encodeURIComponent(notFoundEmail);
      const response = await axios.get(emailUrl + encodedEmail);
      expect(response.status).toBe(200);
      expect(response.data.user).toBe(null);
    });
  });

  describe("POST", () => {
    const userToPost: userFormType = {
      ...initUserForm,
      id: "usr_1234567890abcdef1234567890abcdef",      
      email: "test@email.com",
      password: "Test123!",
      first_name: "Test",
      last_name: "Last",
      phone: "+18005551212",
      role: "USER",
    };

    let createdUser = false;

    beforeAll(async () => {
      await deletePostedUser(userToPost.id);
    });

    beforeEach(() => {
      createdUser = false;
    });

    afterEach(async () => {
      if (createdUser) {
        await deletePostedUser(userToPost.id);
      }
    });

    it("should create a new user", async () => {
      const userJSON = JSON.stringify(userToPost);
      const response = await axios.post(url, userJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(201);
      const postedUser: userDbResponseType = response.data.user;
      createdUser = true;

      expect(postedUser.id).toEqual(userToPost.id);
      expect(postedUser.first_name).toEqual(userToPost.first_name);
      expect(postedUser.last_name).toEqual(userToPost.last_name);
      expect(postedUser.email).toEqual(userToPost.email);
      expect(postedUser.phone).toEqual(userToPost.phone);
      expect(postedUser.role).toEqual(userToPost.role);
      expect(postedUser.password_hash).not.toBe('');
    });

    it("should create a new user with usa phone", async () => {
      const usaPhoneUser = {
        ...userToPost,
        phone: "(800) 555-1212",
      }
      const userJSON = JSON.stringify(usaPhoneUser);
      const response = await axios.post(url, userJSON, {
        withCredentials: true,
      })
      expect(response.status).toBe(201);
      const postedUser: userDbResponseType = response.data.user;
      createdUser = true;

      // use userToPost values instead of usaPhoneUser
      expect(postedUser.id).toEqual(userToPost.id);
      expect(postedUser.first_name).toEqual(userToPost.first_name);
      expect(postedUser.last_name).toEqual(userToPost.last_name);
      expect(postedUser.email).toEqual(userToPost.email);
      expect(postedUser.phone).toEqual(userToPost.phone); 
      expect(postedUser.role).toEqual(userToPost.role);
      expect(postedUser.password_hash).not.toBe('');
    });

    it("should create a new user when missing password", async () => {
      const noPasswordUser: userFormType = {
        ...userToPost,
        password: "",
      };
      const userJSON = JSON.stringify(noPasswordUser);
      const response = await axios.post(url, userJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      createdUser = true;
      const postedUser: userDbResponseType = response.data.user;

      expect(postedUser.id).toEqual(noPasswordUser.id);
      expect(postedUser.password_hash).toBe('');
    });    

    it("should create a new user when missing phone", async () => {
      const noPhoneUser: userFormType = {
        ...userToPost,
        phone: "",
      };
      const userJSON = JSON.stringify(noPhoneUser);
      const response = await axios.post(url, userJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(201);
      createdUser = true;
      const postedUser: userDbResponseType = response.data.user;

      expect(postedUser.id).toEqual(noPhoneUser.id);
      expect(postedUser.phone).toBe('');
    });

    it("should NOT create a new user when missing id", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        id: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  
    it("should NOT create a new user when missing first name", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        first_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user when missing last name", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        last_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user when missing email", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        email: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with invalid id", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        id: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with valid id but not a user id", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        id: nonUserId,
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with invalid email", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        email: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with invalid phone", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        phone: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with invalid password", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        password: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT create a new user with duplicate email", async () => {
      const invalidUser: userFormType = {
        ...userToPost,
        email: user2Email,
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.post(url, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should create a new user with sanitized data", async () => {
      const toSanitizeUser: userFormType = {
        ...userToPost,
        first_name: "    <script>" + "abc" + "</script>   ",
        last_name: "%3Cdiv%3E" + "xyz" + "%3C/div%3E",
      };
      const userJSON = JSON.stringify(toSanitizeUser);
      const response = await axios.post(url, userJSON, {
        withCredentials: true,
      })

      const postedUser: userDbResponseType = response.data.user;
      createdUser = true;

      expect(response.status).toBe(201);
      expect(postedUser.id).toEqual(toSanitizeUser.id);
      expect(postedUser.first_name).toEqual("scriptabcscript");
      expect(postedUser.last_name).toEqual("CdivExyzCdivE");
      expect(postedUser.email).toEqual(userToPost.email);
      expect(postedUser.phone).toEqual(userToPost.phone);
      expect(postedUser.role).toEqual(userToPost.role);
    });

  });

  describe("PUT by ID - API: API: /api/users/user/:id", () => {
    const putUser: userFormType = {
      ...testUser,
      first_name: "Zach",
      last_name: "Jones",
      email: "zach@email.com",
      password: "321Test!",
      phone: "+18005559999",
    };

    let didPut = false;

    beforeAll(async () => {
      await resetUser();
    });

    beforeEach(async () => {
      didPut = false;
    });

    afterEach(async () => {
      if (didPut) {
        await resetUser();
      }
    });

    it("should update a user by ID", async () => {
      const userJSON = JSON.stringify(putUser);
      const response = await axios.put(oneUserUrl + testUser.id, userJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(200);
      didPut = true;      
      const user: userDbResponseType = response.data.user;

      expect(user.first_name).toEqual(putUser.first_name);
      expect(user.last_name).toEqual(putUser.last_name);
      expect(user.email).toEqual(putUser.email);
      expect(user.phone).toEqual(putUser.phone);
      expect(user.role).toEqual(putUser.role);
      expect(user.password_hash).not.toEqual('');
    });

    it("should update a user by ID when phone is missing", async () => {
      const noPhoneUser: userFormType = {
        ...putUser,
        phone: "",
      };

      const userJSON = JSON.stringify(noPhoneUser);
      const response = await axios.put(oneUserUrl + noPhoneUser.id, userJSON, {
        withCredentials: true,
      });
      expect(response.status).toBe(200);
      didPut = true;      
      const user: userDbResponseType = response.data.user;

      expect(user.phone).toEqual(noPhoneUser.phone);      
    });

    it("should update a user by ID when password is missing", async () => {
      const noPasswordUser: userFormType = {
        ...putUser,
        password: "",
      };      
      const userJSON = JSON.stringify(noPasswordUser);      
      const response = await axios.put(oneUserUrl + noPasswordUser.id, userJSON, {
        withCredentials: true,
      });

      expect(response.status).toBe(200);
      didPut = true;
      const user: userDbResponseType = response.data.user;

      expect(user.password_hash).toEqual('');
    });

    it("should NOT update a user by ID when ID is invalid", async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios.put(oneUserUrl + "test", userJSON, {
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
    });

    it("should NOT update a user by ID when ID is valid, but not a user ID", async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios.put(oneUserUrl + nonUserId, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID when ID is not found", async () => {
      try {
        const userJSON = JSON.stringify(putUser);
        const response = await axios.put(oneUserUrl + notFoundId, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID when first name is missing", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        first_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID when last name is missing", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        last_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID when email is missing", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        email: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID with invalid email", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        email: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID with invalid phone", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        phone: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID with invalid password", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        password: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT update a user by ID when email is a dublicate", async () => {
      const invalidUser: userFormType = {
        ...putUser,
        email: user2Email,
      };

      try {
        const userJSON = JSON.stringify(invalidUser);
        const response = await axios.put(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        })
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should update a user by ID with sanitized data", async () => {
      const toSanitizeUser: userFormType = {
        ...putUser,
        first_name: "    <script>" + "abc" + "</script>   ",
        last_name: "%3Cdiv%3E" + "xyz" + "%3C/div%3E%20%3Cp%3E!%3C/p%3E",
      };
      const userJSON = JSON.stringify(toSanitizeUser);
      const response = await axios.put(oneUserUrl + toSanitizeUser.id, userJSON, {
        withCredentials: true,
      });      

      expect(response.status).toBe(200);
      const puttedUser: userDataType = response.data.user;
      expect(puttedUser.first_name).toEqual("scriptabcscript");
      expect(puttedUser.last_name).toEqual("CdivExyzCdivECpECpE");
    });
  });

  describe("PATCH by ID - API: API: /api/users/user/:id", () => {
    let user2: userDbResponseType | undefined;

    const toPatchUser = {
      id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    };

    beforeAll(async () => {
      const response = await axios.get(url);
      const users: userDbResponseType[] = response.data.users;
      user2 = users.find((u) => u.id === user2Id);

      const userJSON = JSON.stringify(testUser);
      await axios.put(oneUserUrl + testUser.id, userJSON, {
        withCredentials: true,
      })
    });

    afterEach(async () => {
      try {
        const userJSON = JSON.stringify(testUser);
        await axios.put(oneUserUrl + testUser.id, userJSON, {
          withCredentials: true,
        })
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    });

    it("should patch a user first name by ID", async () => {
      const patchUser = {
        ...testUser,
        first_name: "Zach",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.first_name).toEqual(patchUser.first_name);
    });

    it("should patch a user last name by ID", async () => {
      const patchUser = {
        ...testUser,
        last_name: "Jones",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.last_name).toEqual(patchUser.last_name);
    });

    it("should patch a user email by ID", async () => {
      const patchUser = {
        ...testUser,
        email: "zach@email.com",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.email).toEqual(patchUser.email);
    });

    it("should patch a user phone by ID", async () => {
      const patchUser = {
        ...testUser,
        phone: "+18005559999",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.phone).toEqual(patchUser.phone);
    });

    it("should patch a user by ID when phone is missing", async () => {
      const patchUser = {
        ...testUser,
        phone: "",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.phone).toEqual(patchUser.phone);
    });

    it("should patch a user password by ID", async () => {
      const patchUser = {
        ...testUser,
        password: "321Test!",
      }
      const userJSON = JSON.stringify(patchUser);
      const response = await axios.patch(oneUserUrl + patchUser.id, userJSON, {
        withCredentials: true,
      })

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.password_hash).not.toEqual(user2?.password_hash);
    });

    it("should NOT patch a user by ID when ID is invalid", async () => {
      try {
        const userJSON = JSON.stringify(toPatchUser);
        const response = await axios.patch(oneUserUrl + "test", userJSON, {
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
    });

    it("should NOT patch a user by ID when ID is not found", async () => {
      try {
        const userJSON = JSON.stringify(toPatchUser);
        const response = await axios.patch(oneUserUrl + notFoundId, userJSON, {
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
    });

    it("should NOT patch a user by ID when ID is valid, but not a user ID", async () => {
      try {
        const userJSON = JSON.stringify(toPatchUser);
        const response = await axios.patch(oneUserUrl + nonUserId, userJSON, {
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
    });

    it("should NOT patch a user by ID when first name is missing", async () => {
      const invalidUser = {
        ...toPatchUser,
        first_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT patch a user by ID when last name is missing", async () => {
      const invalidUser = {
        ...toPatchUser,
        last_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT patch a user by ID when email is missing", async () => {
      const invalidUser = {
        ...toPatchUser,
        email: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT patch a user by ID when password is missing and currently have a password ", async () => {
      const invalidUser = {
        ...toPatchUser,
        password: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should not patch a user by ID when first name is too long", async () => {
      const invalidUser = {
        ...toPatchUser,
        first_name: "a".repeat(51),
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should not patch a user by ID when last name is too long", async () => {
      const invalidUser = {
        ...toPatchUser,
        last_name: "a".repeat(51),
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should not patch a user by ID when email is too long", async () => {
      const invalidUser = {
        ...toPatchUser,
        email: "a".repeat(256),
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should not patch a user by ID when phone is too long", async () => {
      const invalidUser = {
        ...toPatchUser,
        phone: "a".repeat(256),
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(422);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(422);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should not patch a user by ID when email is a duplicate", async () => {
      const invalidUser = {
        ...toPatchUser,
        email: user2Email,
      }
      const userJSON = JSON.stringify(invalidUser);
      try {
        const response = await axios.patch(oneUserUrl + invalidUser.id, userJSON, {
          withCredentials: true,
        });
        expect(response.status).toBe(409);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(409);
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should patch a user by ID with sanitized first name", async () => {
      const toSanitizeUser = {
        ...toPatchUser,
        first_name: "<script>abc</script>",
      }
      const userJSON = JSON.stringify(toSanitizeUser);

      const response = await axios.patch(oneUserUrl + toSanitizeUser.id, userJSON, {
        withCredentials: true,
      });      

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.first_name).toEqual("scriptabcscript");
    });

    it("should patch a user by ID with sanitized last name", async () => {
      const toSanitizeUser = {
        ...toPatchUser,
        last_name: "   Jones ***",
      }
      const userJSON = JSON.stringify(toSanitizeUser);

      const response = await axios.patch(oneUserUrl + toSanitizeUser.id, userJSON, {
        withCredentials: true,
      });      

      const patchedUser: userDbResponseType = response.data.user;
      expect(response.status).toBe(200);
      expect(patchedUser.last_name).toEqual("Jones");
    });
  });

  describe("PATCH by ID - API: /api/users/user/:id/changePassword", () => {
    const newPassword = "321Test!";
    const badPassword = "Wrong123!";

    const noPasswordUser: userFormType = {
      ...initUserForm,
      id: "usr_0f1e2d3c4b5a69788776655443322110",
      email: "nopassword@email.com",
      password: "",
      first_name: "No",
      last_name: "Password",
      phone: "+18005550123",
      role: "USER",
    };

    let createdNoPasswordUser = false;

    const changePasswordUrl = (userId: string) => `${oneUserUrl}${userId}/changePassword`;
    
    const createNoPasswordUser = async () => {
      try {
        await deletePostedUser(noPasswordUser.id);
        const userJSON = JSON.stringify(noPasswordUser);
        await axios.post(url, userJSON, {
          withCredentials: true,
        });
        createdNoPasswordUser = true;
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    const deleteNoPasswordUser = async () => {
      if (!createdNoPasswordUser) return;
      try {
        await axios.delete(oneUserUrl + noPasswordUser.id, {
          withCredentials: true,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      } finally {
        createdNoPasswordUser = false;
      }
    };

    beforeAll(async () => {
      await resetUser();
      await deletePostedUser(noPasswordUser.id);
    });

    beforeEach(async () => {
      await resetUser();
    });

    afterEach(async () => {
      await resetUser();
      await deleteNoPasswordUser();
    });

    it("should change a user's password", async () => {
      const pwdJSON = JSON.stringify({
        currentPassword: testUser.password,
        newPassword,
      });

      const response = await axios.patch(
        changePasswordUrl(testUser.id),
        pwdJSON,
        { withCredentials: true }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it("should NOT change password when ID is invalid", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl("test"),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when ID is valid, but not a user ID", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl(nonUserId),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when ID is not found", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl(notFoundId),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(404);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("not found");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when current password is invalid format", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: "test",
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl(testUser.id),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
          expect(err.response?.data.error).toBe("Invalid password");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when new password is invalid format", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword: "test",
        });

        const response = await axios.patch(
          changePasswordUrl(testUser.id),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
          expect(err.response?.data.error).toBe("Invalid password");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when new password is the same as current password", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword: testUser.password,
        });

        const response = await axios.patch(
          changePasswordUrl(testUser.id),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
          expect(err.response?.data.error).toBe("New password must be different");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when current password is incorrect", async () => {
      try {
        const pwdJSON = JSON.stringify({
          currentPassword: badPassword,
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl(testUser.id),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
          expect(err.response?.data.error).toBe("Current Password is incorrect");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });

    it("should NOT change password when user has no password", async () => {
      await createNoPasswordUser();

      try {
        const pwdJSON = JSON.stringify({
          currentPassword: testUser.password,
          newPassword,
        });

        const response = await axios.patch(
          changePasswordUrl(noPasswordUser.id),
          pwdJSON,
          { withCredentials: true }
        );

        expect(response.status).toBe(400);
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(400);
          expect(err.response?.data.error).toBe("User has no password");
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
  });

  describe("DELETE by ID - API: API: /api/users/user/:id", () => {
    const toDelUser: userFormType = {
      ...initUserForm,
      id: "usr_07de11929565179487c7a04759ff9866",
      email: "fred@email.com",
      password: "Test123!",
      first_name: "Fred",
      last_name: "Green",
      phone: "+18005554321",
      role: "USER",
    };

    let didDel = false;

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) return;

      try {
        const userJSON = JSON.stringify(toDelUser);
        await axios.post(url, userJSON, {
          withCredentials: true,
        });        
      } catch (err) {
        if (err instanceof Error) console.log(err.message);
      }
    });

    it("should delete a user by ID", async () => {
      const response = await axios.delete(oneUserUrl + toDelUser.id, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      didDel = true;
      expect(response.data.count).toBe(1);
    });

    it("should NOT delete a user when ID is not found", async () => {
      const response = await axios.delete(oneUserUrl + notFoundId, {
        withCredentials: true
      });
      expect(response.status).toBe(200);
      expect(response.data.count).toBe(0);
    });

    it("should NOT delete a user when ID is invalid", async () => {
      try {
        const response = await axios.delete(oneUserUrl + "test", {
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
    });

    it("should NOT delete a user when ID is valid, but not a user ID", async () => {
      try {
        const response = await axios.delete(oneUserUrl + nonUserId, {
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
    });
  });
});
