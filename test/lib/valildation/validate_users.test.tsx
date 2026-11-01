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

/**
 * sanitizeUser returns SanitizedUser | null. This helper narrows away null
 * so tests can access properties without non-null assertions.
 */
const sanitizeNotNull = (user: userDataType | userFormType) => {
  const sanitized = sanitizeUser(user);
  if (!sanitized) {
    throw new Error("sanitizeUser unexpectedly returned null");
  }
  return sanitized;
};

/**
 * builds a user object whose id getter throws, to exercise catch blocks
 */
const makeThrowingUser = (): userFormType => {
  const user = cloneDeep(mockUserForm);
  Object.defineProperty(user, "id", {
    get: () => {
      throw new Error("boom");
    },
  });
  return user;
};

describe("user table data validation", () => {
  describe("gotUserData function - checks for missing data", () => {
    it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = true", () => {
      expect(gotUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.password = "";
      expect(gotUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = true", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.phone = "";
      expect(gotUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.password = "";
      toCheck.phone = "";
      expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userDataType object - checkPhone = true; checkPass = false", () => {
      expect(gotUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userDataType object - checkPhone = false; checkPass = false", () => {
      const toCheck = cloneDeep(mockUserData);
      toCheck.phone = "";
      expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when user is null", () => {
      expect(gotUserData(null as never, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.id = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when first_name is missing", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.first_name = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when sanitized first_name is blank", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.first_name = "<>   ****   ";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when last_name is missing", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.last_name = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when sanitized last_name is blank", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.last_name = "<>   ****   ";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when email is missing", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.email = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when role is missing", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.role = "" as never;
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when phone is missing and checkPhone = true", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.phone = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when password is missing and checkPass = true", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.password = "";
      expect(gotUserData(invalidUser, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.MISSING_DATA when checkPass = true for userDataType", () => {
      expect(gotUserData(mockUserData, true, true)).toBe(
        ErrorCode.MISSING_DATA,
      );
    });

    it("should return ErrorCode.OTHER_ERROR when an error is thrown", () => {
      expect(gotUserData(makeThrowingUser(), true, true)).toBe(
        ErrorCode.OTHER_ERROR,
      );
    });
  });

  describe("validUserFirstName", () => {
    it("should return true when valid first name", () => {
      expect(validUserFirstName("test")).toBe(true);
    });

    it("should return true when first name is max length", () => {
      expect(validUserFirstName("a".repeat(maxFirstNameLength))).toBe(true);
    });

    it("should return false when first name is missing", () => {
      expect(validUserFirstName("")).toBe(false);
    });

    it("should return false when first name is null", () => {
      expect(validUserFirstName(null as never)).toBe(false);
    });

    it("should return false when first name is undefined", () => {
      expect(validUserFirstName(undefined as never)).toBe(false);
    });

    it("should return false when first name is too long", () => {
      expect(validUserFirstName("a".repeat(maxFirstNameLength + 1))).toBe(
        false,
      );
    });

    it("should return false when sanitized first name is blank", () => {
      expect(validUserFirstName("<>   ****   ")).toBe(false);
    });
  });

  describe("validUserLastName", () => {
    it("should return true when valid last name", () => {
      expect(validUserLastName("test")).toBe(true);
    });

    it("should return true when last name is max length", () => {
      expect(validUserLastName("a".repeat(maxLastNameLength))).toBe(true);
    });

    it("should return false when last name is missing", () => {
      expect(validUserLastName("")).toBe(false);
    });

    it("should return false when last name is null", () => {
      expect(validUserLastName(null as never)).toBe(false);
    });

    it("should return false when last name is undefined", () => {
      expect(validUserLastName(undefined as never)).toBe(false);
    });

    it("should return false when last name is too long", () => {
      expect(validUserLastName("a".repeat(maxLastNameLength + 1))).toBe(false);
    });

    it("should return false when sanitized last name is blank", () => {
      expect(validUserLastName("<>   ****   ")).toBe(false);
    });
  });

  describe("validUserEmail", () => {
    it("should return true when valid email", () => {
      expect(validUserEmail(mockUserForm.email)).toBe(true);
    });

    it("should return false when email is missing", () => {
      expect(validUserEmail("")).toBe(false);
    });

    it("should return false when email is null", () => {
      expect(validUserEmail(null as never)).toBe(false);
    });

    it("should return false when email is undefined", () => {
      expect(validUserEmail(undefined as never)).toBe(false);
    });

    it("should return false when email is not a string", () => {
      expect(validUserEmail(123 as never)).toBe(false);
    });

    it("should return false when email is too long", () => {
      const domain = "@example.com";
      const tooLong = "a".repeat(maxEmailLength + 1 - domain.length) + domain;
      expect(tooLong.length).toBe(maxEmailLength + 1);
      expect(validUserEmail(tooLong)).toBe(false);
    });

    it("should return false when email is not in email format", () => {
      expect(validUserEmail("not an email")).toBe(false);
    });

    it("should return false when email contains script tags", () => {
      expect(validUserEmail("<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("validUserPhone", () => {
    it("should return true when valid phone", () => {
      expect(validUserPhone(mockUserForm.phone)).toBe(true);
    });

    it("should return true when valid phone in E.164 format", () => {
      expect(validUserPhone("+18005551234")).toBe(true);
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
      expect(validUserPhone("1".repeat(maxPhoneLength + 1))).toBe(false);
    });

    it("should return false when phone is too short", () => {
      expect(validUserPhone("123")).toBe(false);
    });

    it("should return false when phone contains script tags", () => {
      expect(validUserPhone("<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("validUserPassword", () => {
    it("should return true when valid password", () => {
      expect(validUserPassword(mockUserForm.password)).toBe(true);
    });

    it("should return false when password is missing", () => {
      expect(validUserPassword("")).toBe(false);
    });

    it("should return false when password is null", () => {
      expect(validUserPassword(null as never)).toBe(false);
    });

    it("should return false when password is undefined", () => {
      expect(validUserPassword(undefined as never)).toBe(false);
    });

    it("should return false when password is too short", () => {
      expect(validUserPassword("V2!x")).toBe(false);
    });

    it("should return false when password is too long", () => {
      expect(validUserPassword("Valid1234!$ButTooLong12345")).toBe(false);
    });

    it("should return false when password does not meet complexity rules", () => {
      expect(validUserPassword("invalidpassword")).toBe(false);
    });
  });

  describe("validUserData", () => {
    it("should return ErrorCode.NONE when valid userFormType data", () => {
      expect(validUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE with valid userFormType and no phone; checkPhone = false, checkPass = true", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.phone = "";
      expect(validUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE with valid userFormType and no password; checkPhone = true, checkPass = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.password = "";
      expect(validUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE with valid userFormType and no phone/password; checkPhone = false, checkPass = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.phone = "";
      toCheck.password = "";
      expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when valid userDataType data and checkPass = false", () => {
      expect(validUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE with valid userDataType and no phone; checkPhone = false, checkPass = false", () => {
      const toCheck = cloneDeep(mockUserData);
      toCheck.phone = "";
      expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when phone is invalid but checkPhone = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.phone = "not a phone";
      expect(validUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when password is invalid but checkPass = false", () => {
      const toCheck = cloneDeep(mockUserForm);
      toCheck.password = "invalidpassword";
      expect(validUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when user data is null", () => {
      expect(validUserData(null as never, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when userDataType is used with checkPass = true", () => {
      expect(validUserData(mockUserData, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.id = tmntId;
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when first_name is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.first_name = "a".repeat(maxFirstNameLength + 1);
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when last_name is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.last_name = "a".repeat(maxLastNameLength + 1);
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when email is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.email = "not an email";
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when phone is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.phone = "not a phone";
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when password is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.password = "invalidpassword";
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.INVALID_DATA when role is invalid", () => {
      const invalidUser = cloneDeep(mockUserForm);
      invalidUser.role = "not a role" as never;
      expect(validUserData(invalidUser, true, true)).toBe(
        ErrorCode.INVALID_DATA,
      );
    });

    it("should return ErrorCode.OTHER_ERROR when an error is thrown", () => {
      expect(validUserData(makeThrowingUser(), true, true)).toBe(
        ErrorCode.OTHER_ERROR,
      );
    });
  });

  describe("sanitizeUser", () => {
    it("should return sanitized userFormType when valid user form data is passed", () => {
      const sanitized = sanitizeNotNull(mockUserForm);
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
      const sanitized = sanitizeNotNull(mockUserData);
      expect(sanitized.id).toEqual(mockUserData.id);
      expect(sanitized.first_name).toEqual(mockUserData.first_name);
      expect(sanitized.last_name).toEqual(mockUserData.last_name);
      expect(sanitized.email).toEqual(mockUserData.email);
      expect(sanitized.phone).toEqual("+18005551234");
      expect("password" in sanitized).toBe(false);
      expect(sanitized.role).toEqual(mockUserData.role);
    });

    it("should not mutate the original user object", () => {
      const original = cloneDeep(mockUserForm);
      sanitizeUser(original);
      expect(original).toEqual(mockUserForm);
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

      const sanitized = sanitizeNotNull(toSanitize);

      expect(sanitized.id).toEqual("scriptascript"); // sanitized, not validated
      expect(sanitized.first_name).toEqual("scriptascript");
      expect(sanitized.last_name).toEqual("CdivEaCdivE");
      expect(sanitized.email).toEqual("");
      expect(sanitized.phone).toEqual("");
      expect("password" in sanitized ? sanitized.password : undefined).toEqual(
        "",
      );
      expect(sanitized.role).toEqual("");
    });

    it("should keep a well-formed id with a different prefix (sanitized, not validated)", () => {
      const toSanitize = cloneDeep(mockUserForm);
      toSanitize.id = tmntId;

      const sanitized = sanitizeNotNull(toSanitize);
      expect(sanitized.id).toBe(tmntId);
    });

    it("should return sanitized userFormType with invalid email/phone/password/role blanked", () => {
      const toSanitize = cloneDeep(mockUserForm);
      toSanitize.email = "not an email";
      toSanitize.phone = "123";
      toSanitize.password = "nope";
      toSanitize.role = "none" as never;

      const sanitized = sanitizeNotNull(toSanitize);

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

      const sanitized = sanitizeNotNull(toSanitize);

      expect(sanitized.email).toEqual("");
      expect(sanitized.phone).toEqual("");
      expect("password" in sanitized).toBe(false);
      expect(sanitized.role).toEqual("");
    });

    it("should return null when user data is null", () => {
      expect(sanitizeUser(null as never)).toBe(null);
    });
  });

  describe("validateUser", () => {
    describe("valid data", () => {
      it("should return ErrorCode.NONE for valid userFormType - checkPhone = true; checkPass = true", () => {
        expect(validateUser(mockUserForm, true, true)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for valid userFormType with no password - checkPhone = true; checkPass = false", () => {
        const toCheck = cloneDeep(mockUserForm);
        toCheck.password = "";
        expect(validateUser(toCheck, true, false)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for valid userFormType with no phone - checkPhone = false; checkPass = true", () => {
        const toCheck = cloneDeep(mockUserForm);
        toCheck.phone = "";
        expect(validateUser(toCheck, false, true)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for valid userFormType with no phone/password - checkPhone = false; checkPass = false", () => {
        const toCheck = cloneDeep(mockUserForm);
        toCheck.phone = "";
        toCheck.password = "";
        expect(validateUser(toCheck, false, false)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for valid userDataType - checkPhone = true; checkPass = false", () => {
        expect(validateUser(mockUserData, true, false)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for valid userDataType with no phone - checkPhone = false; checkPass = false", () => {
        const toCheck = cloneDeep(mockUserData);
        toCheck.phone = "";
        expect(validateUser(toCheck, false, false)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE for each valid role", () => {
        const roles: userFormType["role"][] = ["ADMIN", "DIRECTOR", "USER"];
        roles.forEach((role) => {
          const toCheck = cloneDeep(mockUserForm);
          toCheck.role = role;
          expect(validateUser(toCheck, true, true)).toBe(ErrorCode.NONE);
        });
      });

      it("should return ErrorCode.NONE when phone is invalid but checkPhone = false", () => {
        const toCheck = cloneDeep(mockUserForm);
        toCheck.phone = "not a phone";
        expect(validateUser(toCheck, false, true)).toBe(ErrorCode.NONE);
      });

      it("should return ErrorCode.NONE when password is invalid but checkPass = false", () => {
        const toCheck = cloneDeep(mockUserForm);
        toCheck.password = "invalidpassword";
        expect(validateUser(toCheck, true, false)).toBe(ErrorCode.NONE);
      });
    });

    describe("missing data", () => {
      it("should return ErrorCode.MISSING_DATA when user is null", () => {
        expect(validateUser(null as never, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when user is undefined", () => {
        expect(validateUser(undefined as never, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when id is missing", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.id = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when first_name is missing", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.first_name = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when sanitized first_name is blank", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.first_name = "<>   ****   ";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when last_name is missing", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.last_name = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when sanitized last_name is blank", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.last_name = "<>   ****   ";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when email is missing", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.email = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when role is missing", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.role = "" as never;
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when phone is missing and checkPhone = true", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.phone = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when password is missing and checkPass = true", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.password = "";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA when userDataType is used with checkPass = true", () => {
        expect(validateUser(mockUserData, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });

      it("should return ErrorCode.MISSING_DATA (not INVALID_DATA) when data is both missing and invalid", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.id = tmntId; // invalid
        invalidUser.email = ""; // missing
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.MISSING_DATA,
        );
      });
    });

    describe("invalid data", () => {
      it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.id = tmntId;
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when id is not a valid BtDb id", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.id = "usr_123";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when first_name is too long", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.first_name = "a".repeat(maxFirstNameLength + 1);
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when last_name is too long", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.last_name = "a".repeat(maxLastNameLength + 1);
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when email is invalid", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.email = "not an email";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when phone is invalid and checkPhone = true", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.phone = "not a phone";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when password is invalid and checkPass = true", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.password = "invalidpassword";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when password is too short and checkPass = true", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.password = "V2!x";
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when role is invalid", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.role = "not a role" as never;
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });

      it("should return ErrorCode.INVALID_DATA when role is lowercase", () => {
        const invalidUser = cloneDeep(mockUserForm);
        invalidUser.role = "user" as never;
        expect(validateUser(invalidUser, true, true)).toBe(
          ErrorCode.INVALID_DATA,
        );
      });
    });

    describe("errors", () => {
      it("should return ErrorCode.OTHER_ERROR when an error is thrown while reading user data", () => {
        expect(validateUser(makeThrowingUser(), true, true)).toBe(
          ErrorCode.OTHER_ERROR,
        );
      });
    });
  });
});


// import {
//   exportedForTesting,
//   sanitizeUser,
//   validUserEmail,
//   validUserFirstName,
//   validUserLastName,
//   validUserPassword,
//   validUserPhone,
//   validateUser,
// } from "@/lib/validation/users/validate";
// import { ErrorCode } from "@/lib/enums/enums";
// import { tmntId } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { cloneDeep } from "lodash";
// import {
//   maxEmailLength,
//   maxFirstNameLength,
//   maxLastNameLength,
//   maxPhoneLength,
// } from "@/lib/validation/constants";
// import type { userDataType, userFormType } from "@/lib/types/types";

// const { gotUserData, validUserData } = exportedForTesting;

// const mockUserForm: userFormType = {
//   id: "usr_0123456789abcdef0123456789abcdef",
//   email: "test@example.com",
//   password: "Valid123!",
//   first_name: "Test",
//   last_name: "User",
//   phone: "8005551234",
//   role: "USER",
// };

// const mockUserData: userDataType = {
//   id: mockUserForm.id,
//   email: mockUserForm.email,
//   first_name: mockUserForm.first_name,
//   last_name: mockUserForm.last_name,
//   phone: mockUserForm.phone,
//   role: mockUserForm.role,
// };

// describe("user table data validation", () => {
//   describe("gotUserData function - checks for missing data", () => {
//     it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = true", () => {
//       expect(gotUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userFormType object - checkPhone = true; checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.password = "";
//       expect(gotUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = true", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.phone = "";
//       expect(gotUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userFormType object - checkPhone = false; checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.password = "";
//       toCheck.phone = "";
//       expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userDataType object - checkPhone = true; checkPass = false", () => {
//       expect(gotUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userDataType object - checkPhone = false; checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserData);
//       toCheck.phone = "";
//       expect(gotUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.MISSING_DATA when id is missing", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.id = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when first_name is missing", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.first_name = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when last_name is missing", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.last_name = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when email is missing", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.email = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when role is missing", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.role = "" as never;
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when phone is missing and checkPhone = true", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.phone = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when password is missing and checkPass = true", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.password = "";
//       expect(gotUserData(invalidUser, true, true)).toBe(
//         ErrorCode.MISSING_DATA,
//       );
//     });

//     it("should return ErrorCode.MISSING_DATA when checkPass = true for userDataType", () => {
//       expect(gotUserData(mockUserData, true, true)).toBe(ErrorCode.MISSING_DATA);
//     });
//   });

//   describe("validUserFirstName", () => {
//     it("should return true when valid first name", () => {
//       expect(validUserFirstName("test")).toBe(true);
//     });

//     it("should return false when first name is missing", () => {
//       expect(validUserFirstName("")).toBe(false);
//     });

//     it("should return false when first name is null", () => {
//       expect(validUserFirstName(null as never)).toBe(false);
//     });

//     it("should return false when first name is undefined", () => {
//       expect(validUserFirstName(undefined as never)).toBe(false);
//     });

//     it("should return false when first name is too long", () => {
//       expect(validUserFirstName("a".repeat(maxFirstNameLength + 1))).toBe(false);
//     });

//     it("should return false when sanitized first name is is blank", () => {
//       expect(validUserFirstName("<>   ****   ")).toBe(false);
//     });
//   });

//   describe("validUserLastName", () => {
//     it("should return true when valid last name", () => {
//       expect(validUserLastName("test")).toBe(true);
//     });

//     it("should return false when last name is missing", () => {
//       expect(validUserLastName("")).toBe(false);
//     });

//     it("should return false when last name is null", () => {
//       expect(validUserLastName(null as never)).toBe(false);
//     });

//     it("should return false when last name is undefined", () => {
//       expect(validUserLastName(undefined as never)).toBe(false);
//     });

//     it("should return false when last name is too long", () => {
//       expect(validUserLastName("a".repeat(maxLastNameLength + 1))).toBe(false);
//     });

//     it("should return false when sanitized last name is is blank", () => {
//       expect(validUserLastName("<>   ****   ")).toBe(false);
//     });
//   });

//   describe("validUserEmail", () => {
//     it("should return true when valid email", () => {
//       expect(validUserEmail(mockUserForm.email)).toBe(true);
//     });

//     it("should return false when email is missing", () => {
//       expect(validUserEmail("")).toBe(false);
//     });

//     it("should return false when email is null", () => {
//       expect(validUserEmail(null as never)).toBe(false);
//     });

//     it("should return false when email is undefined", () => {
//       expect(validUserEmail(undefined as never)).toBe(false);
//     });

//     it("should return false when email is too long", () => {
//       expect(validUserEmail("a".repeat(maxEmailLength + 1))).toBe(false);
//     });

//     it("should return false when sanitized email is is blank", () => {
//       expect(validUserEmail("<script>alert(1)</script>")).toBe(false);
//     });
//   });

//   describe("validUserPhone", () => {
//     it("should return true when valid phone", () => {
//       expect(validUserPhone(mockUserForm.phone)).toBe(true);
//     });

//     it("should return false when phone is blank", () => {
//       expect(validUserPhone("")).toBe(false);
//     });

//     it("should return false when phone is null", () => {
//       expect(validUserPhone(null as never)).toBe(false);
//     });

//     it("should return false when phone is undefined", () => {
//       expect(validUserPhone(undefined as never)).toBe(false);
//     });

//     it("should return false when phone is too long", () => {
//       expect(validUserPhone("a".repeat(maxPhoneLength + 1))).toBe(false);
//     });

//     it("should return false when sanitized phone is invalid", () => {
//       expect(validUserPhone("<script>alert(1)</script>")).toBe(false);
//     });
//   });

//   describe("validUserPassword", () => {
//     it("should return true when valid password", () => {
//       expect(validUserPassword(mockUserForm.password)).toBe(true);
//     });

//     it("should return false when password is missing", () => {
//       expect(validUserPassword("")).toBe(false);
//     });

//     it("should return false when password is null", () => {
//       expect(validUserPassword(null as never)).toBe(false);
//     });

//     it("should return false when password is undefined", () => {
//       expect(validUserPassword(undefined as never)).toBe(false);
//     });

//     it("should return false when password is too short", () => {
//       expect(validUserPassword("V2!x")).toBe(false);
//     });

//     it("should return false when password is too long", () => {
//       expect(validUserPassword("Valid1234!$ButTooLong12345")).toBe(false);
//     });
//   });

//   describe("validUserData", () => {
//     it("should return ErrorCode.NONE when valid userFormType data", () => {
//       expect(validUserData(mockUserForm, true, true)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE with valid userFormType and no phone; checkPhone = false, checkPass = true", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.phone = "";
//       expect(validUserData(toCheck, false, true)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE with valid userFormType and no password; checkPhone = true, checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.password = "";
//       expect(validUserData(toCheck, true, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE with valid userFormType and no phone/password; checkPhone = false, checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserForm);
//       toCheck.phone = "";
//       toCheck.password = "";
//       expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE when valid userDataType data and checkPass = false", () => {
//       expect(validUserData(mockUserData, true, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.NONE with valid userDataType and no phone; checkPhone = false, checkPass = false", () => {
//       const toCheck = cloneDeep(mockUserData);
//       toCheck.phone = "";
//       expect(validUserData(toCheck, false, false)).toBe(ErrorCode.NONE);
//     });

//     it("should return ErrorCode.INVALID_DATA when user data is null", () => {
//       expect(validUserData(null as never, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when userDataType is used with checkPass = true", () => {
//       expect(validUserData(mockUserData, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.id = tmntId;
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when first_name is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.first_name = "a".repeat(maxFirstNameLength + 1);
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when last_name is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.last_name = "a".repeat(maxLastNameLength + 1);
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when email is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.email = "not an email";
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when phone is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.phone = "not a phone";
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when password is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.password = "invalidpassword";
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });

//     it("should return ErrorCode.INVALID_DATA when role is invalid", () => {
//       const invalidUser = cloneDeep(mockUserForm);
//       invalidUser.role = "not a role" as never;
//       expect(validUserData(invalidUser, true, true)).toBe(
//         ErrorCode.INVALID_DATA,
//       );
//     });
//   });

//   describe("sanitizeUser", () => {
//     it("should return sanitized userFormType when valid user form data is passed", () => {
//       const sanitized = sanitizeUser(mockUserForm);
//       expect(sanitized.id).toEqual(mockUserForm.id);
//       expect(sanitized.first_name).toEqual(mockUserForm.first_name);
//       expect(sanitized.last_name).toEqual(mockUserForm.last_name);
//       expect(sanitized.email).toEqual(mockUserForm.email);
//       expect(sanitized.phone).toEqual("+18005551234");
//       expect("password" in sanitized ? sanitized.password : undefined).toEqual(
//         mockUserForm.password,
//       );
//       expect(sanitized.role).toEqual(mockUserForm.role);
//     });

//     it("should return sanitized userDataType when valid user data is passed", () => {
//       const sanitized = sanitizeUser(mockUserData);
//       expect(sanitized.id).toEqual(mockUserData.id);
//       expect(sanitized.first_name).toEqual(mockUserData.first_name);
//       expect(sanitized.last_name).toEqual(mockUserData.last_name);
//       expect(sanitized.email).toEqual(mockUserData.email);
//       expect(sanitized.phone).toEqual("+18005551234");
//       expect("password" in sanitized).toBe(false);
//       expect(sanitized.role).toEqual(mockUserData.role);
//     });

//     it("should return sanitized userFormType with data needing sanitizing", () => {
//       const toSanitize = cloneDeep(mockUserForm);
//       toSanitize.id = "<script>a</script>";
//       toSanitize.first_name = "<script>a</script>";
//       toSanitize.last_name = "%3Cdiv%3Ea%3C/div%3E";
//       toSanitize.email = "<script>a</script>";
//       toSanitize.phone = "<script>a</script>";
//       toSanitize.password = "<script>a</script>";
//       toSanitize.role = "<script>a</script>" as never;

//       const sanitized = sanitizeUser(toSanitize);

//       expect(sanitized.id).toEqual("scriptascript"); // sanitized, not validated
//       expect(sanitized.first_name).toEqual("scriptascript");
//       expect(sanitized.last_name).toEqual("CdivEaCdivE");
//       expect(sanitized.email).toEqual("");
//       expect(sanitized.phone).toEqual("");
//       expect("password" in sanitized ? sanitized.password : undefined).toEqual(
//         "",
//       );
//       expect(sanitized.role).toEqual("");
//     });

//     it("should leave id blank when user.id is invalid", () => {
//       const toSanitize = cloneDeep(mockUserForm);
//       toSanitize.id = tmntId;

//       const sanitized = sanitizeUser(toSanitize);
//       expect(sanitized.id).toBe("tmt_0123388a8fc4641a2e37233f1d6bebd1"); // sanitized, not validated
//     });

//     it("should return sanitized userFormType with invalid email/phone/password/role blanked", () => {
//       const toSanitize = cloneDeep(mockUserForm);
//       toSanitize.email = "not an email";
//       toSanitize.phone = "123";
//       toSanitize.password = "nope";
//       toSanitize.role = "none" as never;

//       const sanitized = sanitizeUser(toSanitize);

//       expect(sanitized.email).toEqual("");
//       expect(sanitized.phone).toEqual("");
//       expect("password" in sanitized ? sanitized.password : undefined).toEqual(
//         "",
//       );
//       expect(sanitized.role).toEqual("");
//     });

//     it("should return sanitized userDataType with invalid email/phone/role blanked", () => {
//       const toSanitize = cloneDeep(mockUserData);
//       toSanitize.email = "not an email";
//       toSanitize.phone = "123";
//       toSanitize.role = "none" as never;

//       const sanitized = sanitizeUser(toSanitize);

//       expect(sanitized.email).toEqual("");
//       expect(sanitized.phone).toEqual("");
//       expect("password" in sanitized).toBe(false);
//       expect(sanitized.role).toEqual("");
//     });

//     it("should return null when user data is null", () => {
//       expect(sanitizeUser(null as never)).toBe(null);
//     });
//   });

// });
