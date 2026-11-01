import {
  publicUserSelect,
  publicUserWithHashSelect,
  toPublicUser,
} from "@/lib/server/publicUser";

const hashValue = "$2b$10$abcdefghijklmnopqrstuv";
const lockedUntil = new Date("2026-12-31T00:00:00.000Z");

// a sample row shaped like a user from the database
const makeUser = (password_hash: string | null | undefined) => ({
  id: "usr_5bf5e3c1a2b44d6e8f9a0b1c2d3e4f50",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  phone: "+18005551212",
  role: "DIRECTOR",
  password_hash,
  failed_pwd_attempts: 0,
  pwd_locked_until: null as Date | null,
});

// a sample row for a user locked out after too many bad passwords
const makeLockedUser = () => ({
  ...makeUser(hashValue),
  failed_pwd_attempts: 5,
  pwd_locked_until: lockedUntil,
});

// a full row like prisma.user.findUnique() returns with no select
const makeFullRow = () => ({
  ...makeLockedUser(),
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
});

const privateFields = ["password_hash", "failed_pwd_attempts", "pwd_locked_until"];
const publicFields = ["email", "first_name", "id", "last_name", "phone", "role"];

describe("publicUser", () => {
  describe("publicUserSelect", () => {
    it("selects exactly the public user fields", () => {
      expect(Object.keys(publicUserSelect).sort()).toEqual([...publicFields].sort());
    });

    it.each(privateFields)("does not select %s", (field) => {
      expect(publicUserSelect).not.toHaveProperty(field);
    });

    it("sets every selected field to true", () => {
      Object.values(publicUserSelect).forEach((value) => {
        expect(value).toBe(true);
      });
    });
  });

  describe("publicUserWithHashSelect", () => {
    it("selects exactly the public user fields plus password_hash", () => {
      expect(Object.keys(publicUserWithHashSelect).sort()).toEqual(
        [...publicFields, "password_hash"].sort()
      );
    });

    it("includes every field in publicUserSelect", () => {
      expect(publicUserWithHashSelect).toEqual(
        expect.objectContaining(publicUserSelect)
      );
    });

    it.each(["failed_pwd_attempts", "pwd_locked_until"])(
      "does not select %s",
      (field) => {
        expect(publicUserWithHashSelect).not.toHaveProperty(field);
      }
    );

    it("sets every selected field to true", () => {
      Object.values(publicUserWithHashSelect).forEach((value) => {
        expect(value).toBe(true);
      });
    });

    it("does not change publicUserSelect", () => {
      expect(publicUserSelect).not.toHaveProperty("password_hash");
    });
  });

  describe("toPublicUser", () => {
    describe("removes password_hash", () => {
      it("removes password_hash when it has a value", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(result).not.toHaveProperty("password_hash");
      });

      it("removes password_hash when it is null", () => {
        const result = toPublicUser(makeUser(null));

        expect(result).not.toHaveProperty("password_hash");
      });

      it("removes password_hash when it is undefined", () => {
        const result = toPublicUser(makeUser(undefined));

        expect(result).not.toHaveProperty("password_hash");
      });

      it("never includes the hash value anywhere in the serialized result", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(JSON.stringify(result)).not.toContain(hashValue);
        expect(JSON.stringify(result)).not.toContain("password_hash");
      });
    });

    describe("removes the password lockout fields", () => {
      it.each([0, 1, 5])("removes failed_pwd_attempts when it is %i", (attempts) => {
        const result = toPublicUser({ ...makeUser(hashValue), failed_pwd_attempts: attempts });

        expect(result).not.toHaveProperty("failed_pwd_attempts");
      });

      it("removes pwd_locked_until when it is null", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(result).not.toHaveProperty("pwd_locked_until");
      });

      it("removes pwd_locked_until when it is a date", () => {
        const result = toPublicUser(makeLockedUser());

        expect(result).not.toHaveProperty("pwd_locked_until");
      });

      it("removes failed_pwd_attempts and pwd_locked_until together", () => {
        const result = toPublicUser(makeLockedUser());

        expect(result).not.toHaveProperty("failed_pwd_attempts");
        expect(result).not.toHaveProperty("pwd_locked_until");
      });

      it("never includes the lockout fields anywhere in the serialized result", () => {
        const text = JSON.stringify(toPublicUser(makeLockedUser()));

        expect(text).not.toContain("failed_pwd_attempts");
        expect(text).not.toContain("pwd_locked_until");
        expect(text).not.toContain(lockedUntil.toISOString());
      });

      it("works when the lockout fields are missing", () => {
        const result = toPublicUser({ id: "usr_1", password_hash: "hash" });

        expect(result).toEqual({ id: "usr_1", has_password: true });
      });

      it("works with an object that has only the lockout fields", () => {
        const result = toPublicUser({
          failed_pwd_attempts: 5,
          pwd_locked_until: lockedUntil,
        });

        expect(result).toEqual({ has_password: false });
      });
    });

    describe("has_password flag", () => {
      it("is true when password_hash has a value", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(result.has_password).toBe(true);
      });

      it("is false when password_hash is null", () => {
        const result = toPublicUser(makeUser(null));

        expect(result.has_password).toBe(false);
      });

      it("is false when password_hash is undefined", () => {
        const result = toPublicUser(makeUser(undefined));

        expect(result.has_password).toBe(false);
      });

      it("is false when password_hash is an empty string", () => {
        const result = toPublicUser(makeUser(""));

        expect(result.has_password).toBe(false);
      });

      it("is false when the password_hash field is missing", () => {
        const user: { id: string; email: string; password_hash?: string | null } = {
          id: "usr_1",
          email: "a@b.com",
        };

        const result = toPublicUser(user);

        expect(result.has_password).toBe(false);
      });

      it("is a boolean, not the hash value", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(typeof result.has_password).toBe("boolean");
      });

      it("is still true when the user is locked out", () => {
        const result = toPublicUser(makeLockedUser());

        expect(result.has_password).toBe(true);
      });

      it("overrides an existing has_password field on the input", () => {
        const result = toPublicUser({
          id: "usr_1",
          password_hash: null,
          has_password: true,
        });

        expect(result.has_password).toBe(false);
      });
    });

    describe("keeps the other fields", () => {
      it("returns all other fields unchanged", () => {
        const result = toPublicUser(makeUser(hashValue));

        expect(result).toEqual({
          id: "usr_5bf5e3c1a2b44d6e8f9a0b1c2d3e4f50",
          email: "john.doe@example.com",
          first_name: "John",
          last_name: "Doe",
          phone: "+18005551212",
          role: "DIRECTOR",
          has_password: true,
        });
      });

      it("returns only the public fields from a full database row", () => {
        const result = toPublicUser(makeFullRow());

        expect(result).toEqual({
          id: "usr_5bf5e3c1a2b44d6e8f9a0b1c2d3e4f50",
          email: "john.doe@example.com",
          first_name: "John",
          last_name: "Doe",
          phone: "+18005551212",
          role: "DIRECTOR",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-01T00:00:00.000Z"),
          has_password: true,
        });
      });

      it("keeps extra fields not in publicUserSelect", () => {
        const result = toPublicUser({
          id: "usr_1",
          password_hash: "hash",
          created_at: "2026-10-29",
        });

        expect(result).toEqual({
          id: "usr_1",
          created_at: "2026-10-29",
          has_password: true,
        });
      });

      it("keeps null field values", () => {
        const result = toPublicUser({
          id: "usr_1",
          phone: null,
          password_hash: null,
        });

        expect(result).toEqual({
          id: "usr_1",
          phone: null,
          has_password: false,
        });
      });

      it("works with an object that has only password_hash", () => {
        const result = toPublicUser({ password_hash: "hash" });

        expect(result).toEqual({ has_password: true });
      });

      it("works with an empty object", () => {
        const result = toPublicUser({});

        expect(result).toEqual({ has_password: false });
      });
    });

    describe("does not change the input", () => {
      it("does not mutate the original user", () => {
        const user = makeUser(hashValue);
        const copy = { ...user };

        toPublicUser(user);

        expect(user).toEqual(copy);
        expect(user.password_hash).toBe(hashValue);
        expect(user).not.toHaveProperty("has_password");
      });

      it("does not remove the lockout fields from the original user", () => {
        const user = makeLockedUser();

        toPublicUser(user);

        expect(user.failed_pwd_attempts).toBe(5);
        expect(user.pwd_locked_until).toBe(lockedUntil);
        expect(user.password_hash).toBe(hashValue);
      });

      it("returns a new object", () => {
        const user = makeUser("hash");

        const result = toPublicUser(user);

        expect(result).not.toBe(user);
      });
    });

    describe("usage with arrays", () => {
      it("maps a list of users", () => {
        const users = [
          { id: "usr_1", password_hash: "hash1", failed_pwd_attempts: 0, pwd_locked_until: null },
          { id: "usr_2", password_hash: null, failed_pwd_attempts: 3, pwd_locked_until: null },
          { id: "usr_3", password_hash: "", failed_pwd_attempts: 5, pwd_locked_until: lockedUntil },
        ];

        const result = users.map(toPublicUser);

        expect(result).toEqual([
          { id: "usr_1", has_password: true },
          { id: "usr_2", has_password: false },
          { id: "usr_3", has_password: false },
        ]);
      });
    });

    describe("types", () => {
      it("removes password_hash from the return type", () => {
        const result = toPublicUser(makeUser("hash"));

        // @ts-expect-error - password_hash is omitted from the return type
        const hash = result.password_hash;

        expect(hash).toBeUndefined();
      });

      it("removes failed_pwd_attempts from the return type", () => {
        const result = toPublicUser(makeLockedUser());

        // @ts-expect-error - failed_pwd_attempts is omitted from the return type
        const attempts = result.failed_pwd_attempts;

        expect(attempts).toBeUndefined();
      });

      it("removes pwd_locked_until from the return type", () => {
        const result = toPublicUser(makeLockedUser());

        // @ts-expect-error - pwd_locked_until is omitted from the return type
        const lockedDate = result.pwd_locked_until;

        expect(lockedDate).toBeUndefined();
      });
    });
  });
});
