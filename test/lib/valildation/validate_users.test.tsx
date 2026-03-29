import {
  exportedForTesting,
  sanitizeUser,
  validUserEmail,
  validUserFirstName,
  validUserLastName,
  validUserPassword,
  validUserPhone,
  validateUser,
} from "@/lib/validation/users/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { tmntId } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import {
  maxEmailLength,
  maxFirstNameLength,
  maxLastNameLength,
  maxPhoneLength,
} from "@/lib/validation/constants";
import type { userDataType, userFormType } from "@/lib/types/types";

const { gotUserData, validUserData } = exportedForTesting;

const mockUserForm: userFormType = {
  id: "usr_0123456789abcdef0123456789abcdef",
  email: "test@example.com",
  password: "Valid123!",
  first_name: "Test",
  last_name: "User",
  phone: "8005551234",
  role: "USER",
};

const mockUserData: userDataType = {
  id: mockUserForm.id,
  email: mockUserForm.email,
  first_name: mockUserForm.first_name,
  last_name: mockUserForm.last_name,
  phone: mockUserForm.phone,
  role: mockUserForm.role,
};

describe("user table data validation", () => {
  // describe("gotUserData function - checks for missing data", () => {
  //   it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = true", () => {
  //     expect(gotUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.password = "";
  //     expect(gotUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = true", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.phone = "";
  //     expect(gotUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.password = "";
  //     toCheck.phone = "";
  //     expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userDataType object - checkPhone = true; checkPass = false", () => {
  //     expect(gotUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userDataType object - checkPhone = false; checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserData);
  //     toCheck.phone = "";
  //     expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.MISSING_DATA when id is missing", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.id = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when first_name is missing", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.first_name = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when last_name is missing", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.last_name = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when email is missing", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.email = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when role is missing", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.role = "" as never;
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when phone is missing and checkPhone = true", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.phone = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when password is missing and checkPass = true", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.password = "";
  //     expect(gotUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when checkPass = true for userDataType", () => {
  //     expect(gotUserData(mockUserData, true, true)).toBe(ErrorCode.MISSING_DATA);
  //   });
  // });

  // describe("validUserFirstName", () => {
  //   it("should return true when valid first name", () => {
  //     expect(validUserFirstName("test")).toBe(true);
  //   });

  //   it("should return false when first name is missing", () => {
  //     expect(validUserFirstName("")).toBe(false);
  //   });

  //   it("should return false when first name is null", () => {
  //     expect(validUserFirstName(null as never)).toBe(false);
  //   });

  //   it("should return false when first name is undefined", () => {
  //     expect(validUserFirstName(undefined as never)).toBe(false);
  //   });

  //   it("should return false when first name is too long", () => {
  //     expect(validUserFirstName("a".repeat(maxFirstNameLength + 1))).toBe(false);
  //   });

  //   it("should return false when sanitized first name is is blank", () => {
  //     expect(validUserFirstName("<>   ****   ")).toBe(false);
  //   });
  // });

  // describe("validUserLastName", () => {
  //   it("should return true when valid last name", () => {
  //     expect(validUserLastName("test")).toBe(true);
  //   });

  //   it("should return false when last name is missing", () => {
  //     expect(validUserLastName("")).toBe(false);
  //   });

  //   it("should return false when last name is null", () => {
  //     expect(validUserLastName(null as never)).toBe(false);
  //   });

  //   it("should return false when last name is undefined", () => {
  //     expect(validUserLastName(undefined as never)).toBe(false);
  //   });

  //   it("should return false when last name is too long", () => {
  //     expect(validUserLastName("a".repeat(maxLastNameLength + 1))).toBe(false);
  //   });

  //   it("should return false when sanitized last name is is blank", () => {
  //     expect(validUserLastName("<>   ****   ")).toBe(false);
  //   });
  // });

  // describe("validUserEmail", () => {
  //   it("should return true when valid email", () => {
  //     expect(validUserEmail(mockUserForm.email)).toBe(true);
  //   });

  //   it("should return false when email is missing", () => {
  //     expect(validUserEmail("")).toBe(false);
  //   });

  //   it("should return false when email is null", () => {
  //     expect(validUserEmail(null as never)).toBe(false);
  //   });

  //   it("should return false when email is undefined", () => {
  //     expect(validUserEmail(undefined as never)).toBe(false);
  //   });

  //   it("should return false when email is too long", () => {
  //     expect(validUserEmail("a".repeat(maxEmailLength + 1))).toBe(false);
  //   });

  //   it("should return false when sanitized email is is blank", () => {
  //     expect(validUserEmail("<script>alert(1)</script>")).toBe(false);
  //   });
  // });

  describe("validUserPhone", () => {
    it("should return true when valid phone", () => {
      expect(validUserPhone(mockUserForm.phone)).toBe(true);
    });

    it("should return false when phone is blank", () => {
      expect(validUserPhone("")).toBe(false);
    });

    it("should return false when phone is null", () => {
      expect(validUserPhone(null as never)).toBe(false);
    });

    it("should return false when phone is undefined", () => {
      expect(validUserPhone(undefined as never)).toBe(false);
    });

    it("should return false when phone is too long", () => {
      expect(validUserPhone("a".repeat(maxPhoneLength + 1))).toBe(false);
    });

    it("should return false when sanitized phone is invalid", () => {
      expect(validUserPhone("<script>alert(1)</script>")).toBe(false);
    });
  });

  // describe("validUserPassword", () => {
  //   it("should return true when valid password", () => {
  //     expect(validUserPassword(mockUserForm.password)).toBe(true);
  //   });

  //   it("should return false when password is missing", () => {
  //     expect(validUserPassword("")).toBe(false);
  //   });

  //   it("should return false when password is null", () => {
  //     expect(validUserPassword(null as never)).toBe(false);
  //   });

  //   it("should return false when password is undefined", () => {
  //     expect(validUserPassword(undefined as never)).toBe(false);
  //   });

  //   it("should return false when password is too short", () => {
  //     expect(validUserPassword("V2!x")).toBe(false);
  //   });

  //   it("should return false when password is too long", () => {
  //     expect(validUserPassword("Valid1234!$ButTooLong12345")).toBe(false);
  //   });
  // });

  // describe("validUserData", () => {
  //   it("should return ErrorCode.NONE when valid userFormType data", () => {
  //     expect(validUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE with valid userFormType and no phone; checkPhone = false, checkPass = true", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.phone = "";
  //     expect(validUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE with valid userFormType and no password; checkPhone = true, checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.password = "";
  //     expect(validUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE with valid userFormType and no phone/password; checkPhone = false, checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.phone = "";
  //     toCheck.password = "";
  //     expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userDataType data and checkPass = false", () => {
  //     expect(validUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE with valid userDataType and no phone; checkPhone = false, checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserData);
  //     toCheck.phone = "";
  //     expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.INVALID_DATA when user data is null", () => {
  //     expect(validUserData(null as never, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when userDataType is used with checkPass = true", () => {
  //     expect(validUserData(mockUserData, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.id = tmntId;
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when first_name is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.first_name = "a".repeat(maxFirstNameLength + 1);
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when last_name is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.last_name = "a".repeat(maxLastNameLength + 1);
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when email is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.email = "not an email";
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when phone is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.phone = "not a phone";
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when password is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.password = "invalidpassword";
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when role is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.role = "not a role" as never;
  //     expect(validUserData(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });
  // });

  describe("sanitizeUser", () => {
    it("should return sanitized userFormType when valid user form data is passed", () => {
      const sanitized = sanitizeUser(mockUserForm);
      expect(sanitized.id).toEqual(mockUserForm.id);
      expect(sanitized.first_name).toEqual(mockUserForm.first_name);
      expect(sanitized.last_name).toEqual(mockUserForm.last_name);
      expect(sanitized.email).toEqual(mockUserForm.email);
      expect(sanitized.phone).toEqual("+18005551234");
      expect("password" in sanitized ? sanitized.password : undefined).toEqual(
        mockUserForm.password,
      );
      expect(sanitized.role).toEqual(mockUserForm.role);
    });

    it("should return sanitized userDataType when valid user data is passed", () => {
      const sanitized = sanitizeUser(mockUserData);
      expect(sanitized.id).toEqual(mockUserData.id);
      expect(sanitized.first_name).toEqual(mockUserData.first_name);
      expect(sanitized.last_name).toEqual(mockUserData.last_name);
      expect(sanitized.email).toEqual(mockUserData.email);
      expect(sanitized.phone).toEqual("+18005551234");
      expect("password" in sanitized).toBe(false);
      expect(sanitized.role).toEqual(mockUserData.role);
    });

    it("should return sanitized userFormType with data needing sanitizing", () => {
      const toSanitize = cloneDeep(mockUserForm);
      toSanitize.id = "<script>a</script>";
      toSanitize.first_name = "<script>a</script>";
      toSanitize.last_name = "%3Cdiv%3Ea%3C/div%3E";
      toSanitize.email = "<script>a</script>";
      toSanitize.phone = "<script>a</script>";
      toSanitize.password = "<script>a</script>";
      toSanitize.role = "<script>a</script>" as never;

      const sanitized = sanitizeUser(toSanitize);

      expect(sanitized.id).toEqual("");
      expect(sanitized.first_name).toEqual("scriptascript");
      expect(sanitized.last_name).toEqual("CdivEaCdivE");
      expect(sanitized.email).toEqual("");
      expect(sanitized.phone).toEqual("");
      expect("password" in sanitized ? sanitized.password : undefined).toEqual(
        "",
      );
      expect(sanitized.role).toEqual("");
    });

    it("should leave id blank when user.id is invalid", () => {
      const toSanitize = cloneDeep(mockUserForm);
      toSanitize.id = tmntId;

      const sanitized = sanitizeUser(toSanitize);

      expect(sanitized.id).toBe("");
    });

    it("should return sanitized userFormType with invalid email/phone/password/role blanked", () => {
      const toSanitize = cloneDeep(mockUserForm);
      toSanitize.email = "not an email";
      toSanitize.phone = "123";
      toSanitize.password = "nope";
      toSanitize.role = "none" as never;

      const sanitized = sanitizeUser(toSanitize);

      expect(sanitized.email).toEqual("");
      expect(sanitized.phone).toEqual("");
      expect("password" in sanitized ? sanitized.password : undefined).toEqual(
        "",
      );
      expect(sanitized.role).toEqual("");
    });

    it("should return sanitized userDataType with invalid email/phone/role blanked", () => {
      const toSanitize = cloneDeep(mockUserData);
      toSanitize.email = "not an email";
      toSanitize.phone = "123";
      toSanitize.role = "none" as never;

      const sanitized = sanitizeUser(toSanitize);

      expect(sanitized.email).toEqual("");
      expect(sanitized.phone).toEqual("");
      expect("password" in sanitized).toBe(false);
      expect(sanitized.role).toEqual("");
    });

    it("should return null when user data is null", () => {
      expect(sanitizeUser(null as never)).toBe(null);
    });
  });

  // describe("validateUser", () => {
  //   it("should return ErrorCode.NONE when valid userFormType data is passed", () => {
  //     expect(validateUser(mockUserForm, true, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userDataType data is passed with checkPass = false", () => {
  //     expect(validateUser(mockUserData, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType data, no phone, checkPhone = false, checkPass = true", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.phone = "";
  //     expect(validateUser(toCheck, false, true)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType data, no password, checkPhone = true, checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.password = "";
  //     expect(validateUser(toCheck, true, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.NONE when valid userFormType data, no phone, checkPhone = false, checkPass = false", () => {
  //     const toCheck = cloneDeep(mockUserForm);
  //     toCheck.phone = "";
  //     toCheck.password = "";
  //     expect(validateUser(toCheck, false, false)).toBe(ErrorCode.NONE);
  //   });

  //   it("should return ErrorCode.MISSING_DATA when user data is null", () => {
  //     expect(validateUser(null as never, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.MISSING_DATA when userDataType is used with checkPass = true", () => {
  //     expect(validateUser(mockUserData, true, true)).toBe(ErrorCode.MISSING_DATA);
  //   });

  //   it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.id = tmntId;
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when first name is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.first_name = "a".repeat(maxFirstNameLength + 1);
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it('should return ErrorCode.MISSING_DATA when first name is sanitized to ""', () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.first_name = "<> ****  ";
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when last name is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.last_name = "a".repeat(maxLastNameLength + 1);
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it('should return ErrorCode.MISSING_DATA when last name is sanitized to ""', () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.last_name = "<> ****  ";
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.MISSING_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when email is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.email = "not an email";
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when phone is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.phone = "not a phone";
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when password is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.password = "abc";
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });

  //   it("should return ErrorCode.INVALID_DATA when role is invalid", () => {
  //     const invalidUser = cloneDeep(mockUserForm);
  //     invalidUser.role = "not a role" as never;
  //     expect(validateUser(invalidUser, true, true)).toBe(
  //       ErrorCode.INVALID_DATA,
  //     );
  //   });
  // });
});
