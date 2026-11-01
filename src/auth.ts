import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { accountLockedCode, normalizeEmail } from "@/lib/auth/authUtils";
import {
  authorizeCredentials,
  type AppUser,
} from "@/lib/auth/authorizeCredentials";
import { btDbUuid } from "@/lib/uuid";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// the env var is in MINUTES; Date.now() math is in milliseconds
const DB_RECHECK_MS =
  Number(process.env.AUTH_DB_RECHECK_MINUTES ?? 5) * 60 * 1000;

// thrown by authorize() so the login form gets res.code === "account_locked"
// instead of the generic "CredentialsSignin"
class AccountLockedError extends CredentialsSignin {
  code = accountLockedCode;
}

// the user fields the token keeps in sync with the database
const tokenUserSelect = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  role: true,
} as const;

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // the email + password check and the lockout live in
        // authorizeCredentials.ts, where they are unit tested
        const result = await authorizeCredentials(credentials);

        if (result.status === "locked") throw new AccountLockedError();
        if (result.status === "invalid") return null;

        // This becomes `user` in jwt() when provider === "credentials"
        return result.user satisfies AppUser;
      },
    }),

    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      profile(profile: GoogleProfile) {
        // Keep it minimal; role/id from YOUR DB in jwt() branch.
        return {
          id: profile.sub,
          name: profile.name,
          email: normalizeEmail(profile.email),
          image: profile.picture,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.first_name = (token.first_name as string) ?? "";
        session.user.last_name = (token.last_name as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";
        session.user.name = `${session.user.first_name} ${session.user.last_name}`.trim();
      }
      return session;
    },

    async jwt({ token, user, account, trigger }) {
      // 1) Initial sign-in (user is present only at sign-in time)
      if (user) {
        if (account?.provider === "credentials") {
          const u = user as AppUser;

          token.id = u.id;
          token.email = u.email;
          token.first_name = u.first_name;
          token.last_name = u.last_name;
          token.role = u.role;
          token.name = u.name;

          // user exists in database (just authenticated)
          token.dbCheckedAt = Date.now();

          return token;
        }

        // oauth (google): signIn() has already created/found the row, so
        // read id, names and role from the database, not from Google
        const email = user.email ? normalizeEmail(user.email) : "";
        if (!email) return null;

        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: tokenUserSelect,
        });
        if (!dbUser) return null;

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.first_name = dbUser.first_name;
        token.last_name = dbUser.last_name;
        token.role = dbUser.role ?? "USER";
        token.name = `${dbUser.first_name} ${dbUser.last_name}`.trim();
        token.dbCheckedAt = Date.now();

        return token;
      }

      // 2) useSession().update() or periodic check: re-read the user from
      // the database. The update() payload comes from the browser, so it is
      // never trusted; the account page saves to the db first, then calls
      // update() so the token picks up the new values here.
      const now = Date.now();
      const lastChecked = token.dbCheckedAt ?? 0;
      const shouldRecheck =
        trigger === "update" || !lastChecked || now - lastChecked > DB_RECHECK_MS;

      if (shouldRecheck) {
        // If we can't identify the user, invalidate the session
        if (!token.id) return null;

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: tokenUserSelect,
        });

        // If user was deleted, invalidate session => middleware redirects to login
        if (!dbUser) return null;

        // Keep token synced with the database
        token.email = dbUser.email;
        token.first_name = dbUser.first_name;
        token.last_name = dbUser.last_name;
        token.role = dbUser.role ?? "USER";
        token.name = `${dbUser.first_name} ${dbUser.last_name}`.trim();

        // Update timestamp so we don't recheck too often
        token.dbCheckedAt = now;
      }

      return token;
    },

    async signIn({ account, profile }) {
      if (account?.provider === "credentials") return true;

      // oauth (google)
      if (!profile?.email) throw new Error("No Profile email");

      const googleInfo = profile as unknown as GoogleProfile;

      // SECURITY: only trust an email Google has verified. Otherwise anyone
      // could sign in as an existing account that uses that email.
      if (!googleInfo.email_verified) return false;

      const email = normalizeEmail(googleInfo.email);

      const given = googleInfo.given_name?.trim();
      const family = googleInfo.family_name?.trim();

      let fName = given || "none";
      const lName = family || "none";

      if (fName === "none" && lName === "none" && profile.name) {
        fName = profile.name;
      }

      await prisma.user.upsert({
        where: { email },
        create: {
          id: btDbUuid("usr"),
          email,
          first_name: fName,
          last_name: lName,
          role: "DIRECTOR", // currently all new users are directors
        },
        // existing user: keep the names they may have edited in the app
        update: {},
      });

      return true;
    },
  },
});
