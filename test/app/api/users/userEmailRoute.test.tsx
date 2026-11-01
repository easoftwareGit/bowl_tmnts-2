/**
 * @jest-environment node
 */
// Tests for src/app/api/users/email/[email]/route.ts using mocked prisma.
// The real isEmail validation runs.
// No database or server needed.
import type { User } from "@prisma/client";
import { GET } from "@/app/api/users/email/[email]/route";
import { prismaMock } from "../../../prismaMock";
import { maxEmailLength } from "@/lib/validation/constants";

// The URL only needs to be valid; the route reads the email from params, not the URL
const url = "http://localhost:3000/api/users/email";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (email: string) => ({ params: Promise.resolve({ email }) });

const getRequest = () => new Request(url, { method: "GET" });

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const adamEmail = "adam@email.com";
const hashedPassword = "hashed-Test123!";
const lockedUntil = "2026-12-31T00:00:00.000Z";

// what the route sends to prisma for a given (normalized) email
const findArgs = (email: string) => ({
  where: { email },
  select: { id: true },
});

/**
 * builds a well-formed email of an exact length, so length tests check the
 * route's length rule and not isEmail's other rules. The local part is 64
 * chars (the most an email allows) and each domain label is at most 63.
 */
const emailOfLength = (len: number): string => {
  const local = "a".repeat(64);
  const tld = ".com";
  let domainLen = len - local.length - 1 - tld.length;
  const labels: string[] = [];
  while (domainLen > 0) {
    // leave room for a dot and at least 1 more char when splitting
    const size = domainLen > 63 ? Math.min(63, domainLen - 2) : domainLen;
    labels.push("b".repeat(size));
    domainLen -= size;
    if (domainLen > 0) domainLen -= 1; // the dot between labels
  }
  return `${local}@${labels.join(".")}${tld}`;
};

// a full row, like prisma returns with NO select (used to prove the route
// never sends user data back, even if the select is ever removed)
const adamFullRow: User = {
  id: userId,
  email: adamEmail,
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "ADMIN",
  password_hash: hashedPassword,
  failed_pwd_attempts: 5,
  pwd_locked_until: new Date(lockedUntil),
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

describe("Users - API: /api/users/email/:email", () => {
  describe("GET", () => {
    beforeEach(() => {
      // default for every test: a user has the email
      prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);
    });

    describe("found / not found", () => {
      it("should return gotUser true when a user has the email", async () => {
        const response = await GET(getRequest(), ctx(adamEmail));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ gotUser: true });
        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(adamEmail),
        );
      });

      it("should return gotUser false when no user has the email", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const response = await GET(getRequest(), ctx("nobody@email.com"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ gotUser: false });
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs("nobody@email.com"),
        );
      });

      it.each([
        ["a plus tag", "adam+bowling@email.com"],
        ["a subdomain", "adam@mail.email.com"],
        ["dots in the name", "adam.smith@email.com"],
        ["a hyphen in the domain", "adam@my-email.com"],
        ["digits", "adam123@email123.com"],
      ])("should accept an email with %s", async (_label, email) => {
        const response = await GET(getRequest(), ctx(email));

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(email),
        );
      });
    });

    describe("never leaks user data", () => {
      it("should only send gotUser, never the user id", async () => {
        const response = await GET(getRequest(), ctx(adamEmail));
        const body = await response.json();

        expect(Object.keys(body)).toEqual(["gotUser"]);
        expect(JSON.stringify(body)).not.toContain(userId);
      });

      it("should only select the id, never the private fields", async () => {
        await GET(getRequest(), ctx(adamEmail));

        const args = prismaMock.user.findUnique.mock.calls[0][0];
        expect(args.select).toEqual({ id: true });
      });

      it("should only send gotUser even if the database returns a full row", async () => {
        // e.g. if the select were removed from the route
        prismaMock.user.findUnique.mockResolvedValue(adamFullRow);

        const response = await GET(getRequest(), ctx(adamEmail));
        const body = await response.json();
        const text = JSON.stringify(body);

        expect(response.status).toBe(200);
        expect(body).toEqual({ gotUser: true });
        [
          userId,
          "password_hash",
          hashedPassword,
          "failed_pwd_attempts",
          "pwd_locked_until",
          lockedUntil,
          "Adam",
          "+18005551212",
        ].forEach((secret) => expect(text).not.toContain(secret));
      });
    });

    describe("normalizing the email", () => {
      it("should search with the email in lower case", async () => {
        const response = await GET(getRequest(), ctx("Adam@Email.COM"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ gotUser: true });
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(adamEmail),
        );
      });

      it.each([
        ["leading spaces", "   adam@email.com"],
        ["trailing spaces", "adam@email.com   "],
        ["leading and trailing spaces", "  adam@email.com  "],
        ["tabs and newlines", "\t adam@email.com \n"],
      ])("should trim %s before searching", async (_label, email) => {
        const response = await GET(getRequest(), ctx(email));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ gotUser: true });
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(adamEmail),
        );
      });

      it("should trim and lower case the email together", async () => {
        const response = await GET(getRequest(), ctx("  Adam@Email.COM  "));

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(adamEmail),
        );
      });

      it("should NOT remove spaces inside the email", async () => {
        const response = await GET(getRequest(), ctx("adam @email.com"));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid email" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });
    });

    describe("email length", () => {
      it("should build test emails of the exact length asked for", () => {
        // guards the helper itself, so the length tests mean what they say
        expect(emailOfLength(maxEmailLength).length).toBe(maxEmailLength);
        expect(emailOfLength(maxEmailLength + 1).length).toBe(
          maxEmailLength + 1,
        );
      });

      it("should accept an email of exactly the max length", async () => {
        const email = emailOfLength(maxEmailLength);

        const response = await GET(getRequest(), ctx(email));

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(email),
        );
      });

      it("should return 400 and not touch the database when email is too long", async () => {
        const response = await GET(
          getRequest(),
          ctx(emailOfLength(maxEmailLength + 1)),
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid email" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });

      it("should check the length after trimming", async () => {
        // max length + spaces: too long as sent, OK once trimmed
        const email = emailOfLength(maxEmailLength);

        const response = await GET(getRequest(), ctx(`  ${email}  `));

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          findArgs(email),
        );
      });
    });

    describe("invalid email", () => {
      it.each([
        ["empty", ""],
        ["only spaces", "   "],
        ["only whitespace", "\t \n"],
        ["missing the @", "adam.email.com"],
        ["missing the domain", "adam@"],
        ["missing the name", "@email.com"],
        ["two @ signs", "adam@@email.com"],
        ["missing the top-level domain", "adam@email"],
        ["not an email", "test"],
        ["not an email with spaces", "  test  "],
        ["a script tag", "<script>alert(1)</script>"],
        ["SQL text", "adam@email.com' OR '1'='1"],
      ])(
        "should return 400 and not touch the database when email is %s",
        async (_label, email) => {
          const response = await GET(getRequest(), ctx(email));
          const body = await response.json();

          expect(response.status).toBe(400);
          expect(body).toEqual({ error: "invalid email" });
          expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        },
      );

      it.each([
        ["undefined", undefined],
        ["null", null],
      ])(
        "should return 400 and not touch the database when email is %s",
        async (_label, email) => {
          const response = await GET(getRequest(), ctx(email as never));
          const body = await response.json();

          expect(response.status).toBe(400);
          expect(body).toEqual({ error: "invalid email" });
          expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        },
      );
    });

    describe("errors", () => {
      it("should return 500 when the database throws", async () => {
        prismaMock.user.findUnique.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await GET(getRequest(), ctx(adamEmail));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error getting user by email - connection failed",
        });
      });

      it("should return 500 when reading the params throws", async () => {
        const response = await GET(getRequest(), {
          params: Promise.reject(new Error("params failed")),
        });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error getting user by email - params failed",
        });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });
    });
  });
});

// /**
//  * @jest-environment node
//  */
// // Tests for src/app/api/users/email/[email]/route.ts using mocked prisma.
// // The real isEmail validation runs.
// // No database or server needed.
// import type { User } from "@prisma/client";
// import { GET } from "@/app/api/users/email/[email]/route";
// import { prismaMock } from "../../../prismaMock";
// import { maxEmailLength } from "@/lib/validation/constants";

// // The URL only needs to be valid; the route reads the email from params, not the URL
// const url = "http://localhost:3000/api/users/email";

// // Next.js passes route params as a Promise; this builds the 2nd argument
// const ctx = (email: string) => ({ params: Promise.resolve({ email }) });

// const getRequest = () => new Request(url, { method: "GET" });

// const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
// const adamEmail = "adam@email.com";
// const hashedPassword = "hashed-Test123!";
// const lockedUntil = "2026-12-31T00:00:00.000Z";

// // a full row, like prisma returns with NO select (used to prove the route
// // never sends user data back, even if the select is ever removed)
// const adamFullRow: User = {
//   id: userId,
//   email: adamEmail,
//   first_name: "Adam",
//   last_name: "Smith",
//   phone: "+18005551212",
//   role: "ADMIN",
//   password_hash: hashedPassword,
//   failed_pwd_attempts: 5,
//   pwd_locked_until: new Date(lockedUntil),
//   createdAt: new Date("2025-01-01T00:00:00.000Z"),
//   updatedAt: new Date("2025-01-01T00:00:00.000Z"),
// };

// describe("Users - API: /api/users/email/:email", () => {
//   describe("GET", () => {
//     it("should return gotUser true when a user has the email", async () => {
//       prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//       const response = await GET(getRequest(), ctx(adamEmail));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body).toEqual({ gotUser: true });
//       expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
//       expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//         where: { email: adamEmail },
//         select: { id: true },
//       });
//     });

//     it("should return gotUser false when no user has the email", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(null);

//       const response = await GET(getRequest(), ctx("nobody@email.com"));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body).toEqual({ gotUser: false });
//     });

//     it("should only send gotUser, never the user id", async () => {
//       prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//       const response = await GET(getRequest(), ctx(adamEmail));
//       const body = await response.json();

//       expect(Object.keys(body)).toEqual(["gotUser"]);
//       expect(JSON.stringify(body)).not.toContain(userId);
//     });

//     it("should only select the id, never the private fields", async () => {
//       prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//       await GET(getRequest(), ctx(adamEmail));

//       const args = prismaMock.user.findUnique.mock.calls[0][0];
//       expect(args.select).toEqual({ id: true });
//       expect(args.select).not.toHaveProperty("password_hash");
//       expect(args.select).not.toHaveProperty("failed_pwd_attempts");
//       expect(args.select).not.toHaveProperty("pwd_locked_until");
//     });

//     it("should only send gotUser even if the database returns a full row", async () => {
//       // e.g. if the select were removed from the route
//       prismaMock.user.findUnique.mockResolvedValue(adamFullRow);

//       const response = await GET(getRequest(), ctx(adamEmail));
//       const body = await response.json();
//       const text = JSON.stringify(body);

//       expect(response.status).toBe(200);
//       expect(body).toEqual({ gotUser: true });
//       expect(text).not.toContain(userId);
//       expect(text).not.toContain("password_hash");
//       expect(text).not.toContain(hashedPassword);
//       expect(text).not.toContain("failed_pwd_attempts");
//       expect(text).not.toContain("pwd_locked_until");
//       expect(text).not.toContain(lockedUntil);
//     });

//     describe("normalizing the email", () => {
//       it("should search with the email in lower case", async () => {
//         prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//         const response = await GET(getRequest(), ctx("Adam@Email.COM"));
//         const body = await response.json();

//         expect(response.status).toBe(200);
//         expect(body).toEqual({ gotUser: true });
//         expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//           where: { email: adamEmail },
//           select: { id: true },
//         });
//       });

//       it.each([
//         ["leading spaces", "   adam@email.com"],
//         ["trailing spaces", "adam@email.com   "],
//         ["leading and trailing spaces", "  adam@email.com  "],
//         ["tabs and newlines", "\t adam@email.com \n"],
//       ])("should trim %s before searching", async (_label, email) => {
//         prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//         const response = await GET(getRequest(), ctx(email));
//         const body = await response.json();

//         expect(response.status).toBe(200);
//         expect(body).toEqual({ gotUser: true });
//         expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//           where: { email: adamEmail },
//           select: { id: true },
//         });
//       });

//       it("should trim and lower case the email together", async () => {
//         prismaMock.user.findUnique.mockResolvedValue({ id: userId } as never);

//         const response = await GET(getRequest(), ctx("  Adam@Email.COM  "));

//         expect(response.status).toBe(200);
//         expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//           where: { email: adamEmail },
//           select: { id: true },
//         });
//       });

//       it("should NOT remove spaces inside the email", async () => {
//         const response = await GET(getRequest(), ctx("adam @email.com"));
//         const body = await response.json();

//         expect(response.status).toBe(400);
//         expect(body).toEqual({ error: "invalid email" });
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });
//     });

//     describe("invalid email", () => {
//       it.each([
//         ["empty", ""],
//         ["only spaces", "   "],
//         ["only whitespace", "\t \n"],
//         ["missing the @", "adam.email.com"],
//         ["missing the domain", "adam@"],
//         ["missing the name", "@email.com"],
//         ["not an email", "test"],
//         ["not an email with spaces", "  test  "],
//       ])("should return 400 and not touch the database when email is %s", async (_label, email) => {
//         const response = await GET(getRequest(), ctx(email));
//         const body = await response.json();

//         expect(response.status).toBe(400);
//         expect(body).toEqual({ error: "invalid email" });
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });

//       it("should return 400 and not touch the database when email is too long", async () => {
//         const domain = "@email.com";
//         const tooLong = "a".repeat(maxEmailLength + 1 - domain.length) + domain;
//         expect(tooLong.length).toBe(maxEmailLength + 1);

//         const response = await GET(getRequest(), ctx(tooLong));
//         const body = await response.json();

//         expect(response.status).toBe(400);
//         expect(body).toEqual({ error: "invalid email" });
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });

//       it("should return 400 when email is too long even after trimming", async () => {
//         const domain = "@email.com";
//         const tooLong = "a".repeat(maxEmailLength + 1 - domain.length) + domain;

//         const response = await GET(getRequest(), ctx(`  ${tooLong}  `));
//         const body = await response.json();

//         expect(response.status).toBe(400);
//         expect(body).toEqual({ error: "invalid email" });
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });
//     });

//     it("should return 500 when the database throws", async () => {
//       prismaMock.user.findUnique.mockRejectedValue(new Error("connection failed"));

//       const response = await GET(getRequest(), ctx(adamEmail));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error getting user by email - connection failed" });
//     });
//   });
// });
