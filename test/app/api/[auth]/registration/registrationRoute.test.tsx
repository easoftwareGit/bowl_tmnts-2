/**
 * @jest-environment node
 */
// Tests for src/app/api/auth/register/route.ts using mocked prisma and doHash.
// The real sanitizeUser and validateUser run. No database or server needed.
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { prismaMock } from "../../../../prismaMock";
import { doHash } from "@/lib/server/hashServer";
import { btDbUuid } from "@/lib/uuid";
import {
  maxFirstNameLength,
  maxLastNameLength,
} from "@/lib/validation/constants";
import { isBetaRegistrationOpen } from "@/lib/auth/registration";

// Replace password hashing with a mock so tests are fast and predictable
jest.mock("@/lib/server/hashServer", () => ({
  doHash: jest.fn(),
}));
const mockDoHash = doHash as jest.MockedFunction<typeof doHash>;

// Replace only btDbUuid so every new user gets a known id. The rest of
// @/lib/uuid stays real, because validateUser may use its id checks.
jest.mock("@/lib/uuid", () => ({
  ...jest.requireActual<object>("@/lib/uuid"),
  btDbUuid: jest.fn(),
}));
const mockBtDbUuid = btDbUuid as jest.MockedFunction<typeof btDbUuid>;

// Registration is controlled by REGISTRATION_MODE; mock it so these tests
// don't depend on what's in the local .env file
jest.mock("@/lib/auth/registration", () => ({
  isBetaRegistrationOpen: jest.fn(),
}));
const mockIsOpen = isBetaRegistrationOpen as jest.MockedFunction<
  typeof isBetaRegistrationOpen
>;

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/auth/register";

const hashedPassword = "hashed-Test123!";

// the role the route gives every new user (see route.ts)
const newUserRole = "DIRECTOR";

// the signup form data; no id or role, the server sets those
const registerUser = {
  email: "test@email.com",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  password: "Test123!",
};

// the select the route sends to prisma.user.create (never password_hash)
const userSelect = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  role: true,
};

// the id the mocked btDbUuid("usr") returns; must be a valid user id
const serverId = "usr_5bf8a2f3c2f14d5a9f4b2e8c1a0d3e7f";
// an id a client might try to send; the route must ignore it
const clientId = "usr_ffffffffffffffffffffffffffffffff";

// what prisma.user.create returns: only the selected fields.
// "as never" because the mock is typed as the full User row, but with a
// select prisma only returns these fields.
const createdRow = (user: typeof registerUser, role: string = newUserRole) =>
  ({
    id: serverId,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone || null,
    role,
  }) as never;

// an existing user row returned by prisma.user.findUnique
const existingRow = {
  id: "usr_01234567890123456789012345678901",
  email: registerUser.email,
  first_name: registerUser.first_name,
  last_name: registerUser.last_name,
  phone: registerUser.phone,
  password_hash: hashedPassword,
  role: newUserRole,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
} as never;

// builds a POST request with a JSON body
const postRequest = (body: unknown) =>
  new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// checks that nothing after validation ran
const expectNoDbWork = () => {
  expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  expect(mockDoHash).not.toHaveBeenCalled();
  expect(prismaMock.user.create).not.toHaveBeenCalled();
};

describe("Auth - API: /api/auth/register", () => {
  describe("POST", () => {
    beforeEach(() => {
      // reset non-prisma mocks first, so calls do not leak between tests
      mockDoHash.mockReset();
      mockBtDbUuid.mockReset();
      mockIsOpen.mockReset();
      // default for every test: registration is open, email is not in use,
      // hashing works, and the server makes serverId for the new user
      mockIsOpen.mockReturnValue(true);
      prismaMock.user.findUnique.mockResolvedValue(null);
      mockDoHash.mockResolvedValue(hashedPassword);
      mockBtDbUuid.mockReturnValue(serverId);
    });

    describe("registration closed - 403", () => {
      beforeEach(() => {
        mockIsOpen.mockReturnValue(false);
      });

      it("should return 403 and not register a valid user", async () => {
        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body).toEqual({ error: "Registration is closed." });
        expectNoDbWork();
        expect(mockBtDbUuid).not.toHaveBeenCalled();
      });

      // the check runs before the body is read, so a closed route gives
      // nothing away about what it would accept
      it("should return 403, not 400, for a body that is not valid JSON", async () => {
        const response = await POST(
          new NextRequest(url, {
            method: "POST",
            body: "not json",
            headers: { "Content-Type": "application/json" },
          }),
        );

        expect(response.status).toBe(403);
        expectNoDbWork();
      });

      it("should return 403, not 422, for invalid user data", async () => {
        const response = await POST(postRequest({}));

        expect(response.status).toBe(403);
        expectNoDbWork();
      });

      it("should return 403 even when the client sends role ADMIN", async () => {
        const response = await POST(
          postRequest({ ...registerUser, role: "ADMIN" }),
        );

        expect(response.status).toBe(403);
        expect(prismaMock.user.create).not.toHaveBeenCalled();
      });

      it("should check the registration mode once per request", async () => {
        await POST(postRequest(registerUser));

        expect(mockIsOpen).toHaveBeenCalledTimes(1);
      });
    });

    describe("success", () => {
      it("should register a new user", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body).toEqual({
          user: {
            id: serverId,
            email: registerUser.email,
            first_name: registerUser.first_name,
            last_name: registerUser.last_name,
            phone: registerUser.phone,
            role: newUserRole,
          },
        });
      });

      it("should check for an existing user by email", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        await POST(postRequest(registerUser));

        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { email: registerUser.email },
        });
      });

      it("should hash the password and save only the hash", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        await POST(postRequest(registerUser));

        expect(mockDoHash).toHaveBeenCalledTimes(1);
        expect(mockDoHash).toHaveBeenCalledWith(registerUser.password);
        expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.create).toHaveBeenCalledWith({
          data: {
            id: serverId,
            first_name: registerUser.first_name,
            last_name: registerUser.last_name,
            email: registerUser.email,
            phone: registerUser.phone,
            password_hash: hashedPassword,
            role: newUserRole,
          },
          select: userSelect,
        });
      });

      it("should never return the password or password hash", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.user).not.toHaveProperty("password");
        expect(body.user).not.toHaveProperty("password_hash");
        expect(JSON.stringify(body)).not.toContain(registerUser.password);
        expect(JSON.stringify(body)).not.toContain(hashedPassword);
      });

      it("should save the phone in E.164 format", async () => {
        const localPhone = { ...registerUser, phone: "8005559999" };
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(postRequest(localPhone));

        expect(response.status).toBe(201);
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ phone: "+18005559999" }),
          }),
        );
      });

      it("should register a new user with an empty phone, saved as null", async () => {
        const noPhone = { ...registerUser, phone: "" };
        prismaMock.user.create.mockResolvedValue(createdRow(noPhone));

        const response = await POST(postRequest(noPhone));
        const body = await response.json();

        expect(response.status).toBe(201);
        // null phone from the database is returned as ""
        expect(body.user.phone).toBe("");
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ phone: null }),
          }),
        );
      });

      it("should register a new user when phone is not sent at all", async () => {
        const noPhone: Record<string, string> = { ...registerUser };
        delete noPhone.phone;
        prismaMock.user.create.mockResolvedValue(
          createdRow({ ...registerUser, phone: "" }),
        );

        const response = await POST(postRequest(noPhone));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.user.phone).toBe("");
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ phone: null }),
          }),
        );
      });

      it("should register a new user with sanitized data", async () => {
        const toSanitize = {
          ...registerUser,
          first_name: "    <script>" + "abc" + "</script>   ",
          last_name: "%3Cdiv%3E" + "xyz" + "%3C/div%3E%20%3Cp%3E!%3C/p%3E",
        };
        const sanitized = {
          ...registerUser,
          first_name: "scriptabcscript",
          last_name: "CdivExyzCdivECpECpE",
        };
        prismaMock.user.create.mockResolvedValue(createdRow(sanitized));

        const response = await POST(postRequest(toSanitize));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.user.first_name).toBe(sanitized.first_name);
        expect(body.user.last_name).toBe(sanitized.last_name);
        // the real check: the route sent SANITIZED data to the database
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              first_name: sanitized.first_name,
              last_name: sanitized.last_name,
            }),
          }),
        );
      });

      it("should ignore extra fields sent by the client", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(
          postRequest({
            ...registerUser,
            password_hash: "attacker-hash",
            createdAt: "2000-01-01",
          }),
        );

        expect(response.status).toBe(201);
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ password_hash: hashedPassword }),
          }),
        );
        const { data } = prismaMock.user.create.mock.calls[0][0];
        expect(data).not.toHaveProperty("createdAt");
      });

      it("should save the email trimmed and in lower case", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(
          postRequest({ ...registerUser, email: "  Test@Email.COM  " }),
        );

        expect(response.status).toBe(201);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { email: "test@email.com" },
        });
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ email: "test@email.com" }),
          }),
        );
      });      
    });

    describe("role", () => {
      it(`should save role ${newUserRole} when no role is sent`, async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.user.role).toBe(newUserRole);
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ role: newUserRole }),
          }),
        );
      });

      it("should return the role saved in the database", async () => {
        // the response role comes from createdUser.role, not the request
        // or the value the route sent; use a different role to prove it
        prismaMock.user.create.mockResolvedValue(
          createdRow(registerUser, "USER"),
        );

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.user.role).toBe("USER");
      });

      // SECURITY: signup is public, so a role sent by the client must be
      // ignored and every new account saved with the server-chosen role.
      it.each(["ADMIN", "USER", "SUPERUSER", ""])(
        `should ignore role '%s' sent by the client and save ${newUserRole}`,
        async (role) => {
          prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

          const response = await POST(postRequest({ ...registerUser, role }));
          const body = await response.json();

          expect(response.status).toBe(201);
          expect(body.user.role).toBe(newUserRole);
          expect(prismaMock.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({ role: newUserRole }),
            }),
          );
        },
      );
    });

    describe("id", () => {
      // SECURITY: the server makes the id with btDbUuid("usr")
      it("should make the user id on the server with btDbUuid", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(mockBtDbUuid).toHaveBeenCalledTimes(1);
        expect(mockBtDbUuid).toHaveBeenCalledWith("usr");
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ id: serverId }),
          }),
        );
        expect(body.user.id).toBe(serverId);
      });

      it("should ignore an id sent by the client", async () => {
        prismaMock.user.create.mockResolvedValue(createdRow(registerUser));

        const response = await POST(
          postRequest({ ...registerUser, id: clientId }),
        );

        expect(response.status).toBe(201);
        expect(prismaMock.user.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ id: serverId }),
          }),
        );
        expect(prismaMock.user.create).not.toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ id: clientId }),
          }),
        );
      });
    });

    describe("missing data - 422", () => {
      // runs the same test once for each field
      it.each(["first_name", "last_name", "email", "password"])(
        "should not register a new user with missing %s",
        async (field) => {
          const response = await POST(
            postRequest({ ...registerUser, [field]: "" }),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoDbWork();
        },
      );

      it.each(["first_name", "last_name", "email", "password"])(
        "should not register a new user when %s is not sent",
        async (field) => {
          const partial: Record<string, string> = { ...registerUser };
          delete partial[field];

          const response = await POST(postRequest(partial));
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoDbWork();
        },
      );

      it.each(["first_name", "last_name"])(
        "should not register a new user when %s sanitizes to blank",
        async (field) => {
          const response = await POST(
            postRequest({ ...registerUser, [field]: "<>   ****   " }),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoDbWork();
        },
      );

      it("should not register a new user with an empty object", async () => {
        const response = await POST(postRequest({}));
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({ error: "missing data" });
        expectNoDbWork();
      });

      // sanitizeUser blanks an invalid email, phone or password before
      // validateUser runs, so these are reported as "missing data"
      it.each(["email", "phone", "password"])(
        "should not register a new user with an invalid %s",
        async (field) => {
          const response = await POST(
            postRequest({ ...registerUser, [field]: "test" }),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoDbWork();
        },
      );
    });

    describe("invalid data - 422", () => {
      it("should not register a new user when first_name is too long", async () => {
        const response = await POST(
          postRequest({
            ...registerUser,
            first_name: "a".repeat(maxFirstNameLength + 1),
          }),
        );
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({ error: "invalid data" });
        expectNoDbWork();
      });

      it("should not register a new user when last_name is too long", async () => {
        const response = await POST(
          postRequest({
            ...registerUser,
            last_name: "a".repeat(maxLastNameLength + 1),
          }),
        );
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({ error: "invalid data" });
        expectNoDbWork();
      });

      // SECURITY: non-string values must never create a user. Depending on
      // which helper sees them first they give 422 or 500, so only check
      // that nothing was saved.
      it.each([
        ["email", 12345],
        ["email", { $ne: "" }],
        ["password", true],
        ["password", { $ne: "" }],
      ])(
        "should not register a new user when %s is not a string (%p)",
        async (field, value) => {
          const response = await POST(
            postRequest({ ...registerUser, [field]: value }),
          );

          expect(response.status).not.toBe(201);
          expect(mockDoHash).not.toHaveBeenCalled();
          expect(prismaMock.user.create).not.toHaveBeenCalled();
        },
      );
    });

    describe("duplicate email - 409", () => {
      it("should not register a new user with a duplicate email", async () => {
        // findUnique finds an existing user with this email
        prismaMock.user.findUnique.mockResolvedValue(existingRow);

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body).toEqual({ error: "Email already in use" });
        expect(mockDoHash).not.toHaveBeenCalled();
        expect(prismaMock.user.create).not.toHaveBeenCalled();
      });

      it("should return 409 with the same message when create hits a unique constraint", async () => {
        // e.g. another signup with the same email between findUnique and create
        prismaMock.user.create.mockRejectedValue({ code: "P2002" });

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(409);
        // same shape and text as the findUnique check, so the form handles both
        expect(body).toEqual({ error: "Email already in use" });
      });
    });

    describe("server errors - 500", () => {
      it("should return 500 when create throws", async () => {
        prismaMock.user.create.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error registering user - connection failed",
        });
      });

      it("should return 500 when findUnique throws", async () => {
        prismaMock.user.findUnique.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error registering user - connection failed",
        });
        expect(mockDoHash).not.toHaveBeenCalled();
        expect(prismaMock.user.create).not.toHaveBeenCalled();
      });

      it("should return 500 when hashing fails", async () => {
        mockDoHash.mockRejectedValue(new Error("hash failed"));

        const response = await POST(postRequest(registerUser));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error registering user - hash failed",
        });
        expect(prismaMock.user.create).not.toHaveBeenCalled();
      });
    });

    describe("bad request body - 400", () => {
      // Bad JSON is a client error, so it returns 400, not 500
      it("should return 400 for a body that is not valid JSON", async () => {
        const response = await POST(
          new NextRequest(url, {
            method: "POST",
            body: "not json",
            headers: { "Content-Type": "application/json" },
          }),
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expectNoDbWork();
      });

      it("should return 400 for an empty body", async () => {
        const response = await POST(new NextRequest(url, { method: "POST" }));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expectNoDbWork();
      });

      // valid JSON, but not an object of user fields
      it.each([
        ["null", null],
        ["an array", []],
        ["a string", "abc"],
        ["a number", 5],
        ["a boolean", true],
      ])("should return 400 when the body is %s", async (_label, value) => {
        const response = await POST(postRequest(value));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expectNoDbWork();
      });
    });
  });
});
