import axios, { AxiosError } from "axios";
import { baseUsersApi, baseRegisterApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi, testBaseRegisterApi } from "../../../testApi";
import type { userDataType, userFormType } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";

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

const userUrl = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;

const oneUserUrl = userUrl + "/user/";

describe("auth route", () => {
  const user1email = "adam@email.com";

  describe("register route POST", () => {
    const url = testBaseRegisterApi.startsWith("undefined")
      ? baseRegisterApi
      : testBaseRegisterApi;

    let createdUser = false;

    const registerUser: userFormType = {
      ...initUserForm,
      email: "test@email.com",
      first_name: "Zach",
      last_name: "Jones",
      password: "Test123!",
      phone: "+18005559999",
    };

    const deleteTestUser = async () => {
      try {
        const response = await axios.get(userUrl);
        const users = response.data.users as userDataType[];
        const toDel = users.find(
          (u: userDataType) =>
            u.email === "test@email.com" || u.email === "test2@email.com"
        );

        try {
          if (toDel) {
            await axios({
              method: "delete",
              withCredentials: true,
              url: oneUserUrl + toDel.id,
            });
          }
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    beforeAll(async () => {
      await deleteTestUser();
    });

    beforeEach(() => {
      createdUser = false;
    });

    afterEach(async () => {
      if (createdUser) {
        await deleteTestUser();
      }
    });

    it("should register a new user", async () => {
      const userJSON = JSON.stringify(registerUser);
      const response = await axios({
        method: "post",
        data: userJSON,
        withCredentials: true,
        url,
      });

      expect(response.status).toBe(201);
      const postedUser: userDataType = response.data.user;
      createdUser = true;

      expect(postedUser.id).toEqual(registerUser.id);
      expect(postedUser.first_name).toEqual(registerUser.first_name);
      expect(postedUser.last_name).toEqual(registerUser.last_name);
      expect(postedUser.email).toEqual(registerUser.email);
      expect(postedUser.phone).toEqual(registerUser.phone);
      expect(postedUser.role).toEqual("USER");
    });

    it("should register a new user with a missing phone", async () => {
      const validUser: userFormType = {
        ...registerUser,
        id: btDbUuid("usr"),
        email: "test2@email.com",
        phone: "",
      };

      const userJSON = JSON.stringify(validUser);
      const response = await axios({
        method: "post",
        data: userJSON,
        withCredentials: true,
        url,
      });

      expect(response.status).toBe(201);
      const postedUser: userDataType = response.data.user;
      createdUser = true;

      expect(postedUser.phone).toEqual("");
    });

    it("should not register a new user with a missing first name", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        first_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with a missing last name", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        last_name: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with a missing email", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        email: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with a missing password", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        password: "",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with an invalid email", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        email: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with an invalid phone", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        phone: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with an invalid password", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        password: "test",
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should not register a new user with a duplicate email", async () => {
      const invalidUser: userFormType = {
        ...registerUser,
        email: user1email,
      };
      const userJSON = JSON.stringify(invalidUser);

      try {
        const response = await axios({
          method: "post",
          data: userJSON,
          withCredentials: true,
          url,
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

    it("should register a new user with sanitized data", async () => {
      const toSanitizeUser: userFormType = {
        ...registerUser,
        first_name: "    <script>" + "abc" + "</script>   ",
        last_name: "%3Cdiv%3E" + "xyz" + "%3C/div%3E%20%3Cp%3E!%3C/p%3E",
      };

      const userJSON = JSON.stringify(toSanitizeUser);
      const response = await axios({
        method: "post",
        data: userJSON,
        withCredentials: true,
        url,
      });

      const postedUser: userDataType = response.data.user;
      createdUser = true;

      expect(response.status).toBe(201);
      expect(postedUser.first_name).toEqual("scriptabcscript");
      expect(postedUser.last_name).toEqual("CdivExyzCdivECpECpE");
      expect(postedUser.email).toEqual(registerUser.email);
      expect(postedUser.phone).toEqual(registerUser.phone);
    });
  });
});
