import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const DB_RECHECK_MS = Number(process.env.AUTH_DB_RECHECK_MINUTES ?? 5);

type AppUser = {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: string;
};

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
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
            password_hash: true,
          },
        });

        if (!dbUser) return null;
        if (!dbUser.password_hash) return null;

        const isPasswordValid = await compare(password, dbUser.password_hash);
        if (!isPasswordValid) return null;

        // This becomes `user` in jwt() when provider === "credentials"
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: `${dbUser.first_name} ${dbUser.last_name}`.trim(),
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          role: dbUser.role,
        } satisfies AppUser;
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
          email: profile.email,
          image: (profile as any).picture,
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

    async jwt({ token, user, account, session, trigger }) {
      // 1) Handle useSession().update(...) payloads      
      if (trigger === "update" && session) {
        // session here is the update payload, not a full Session
        const s = session as Partial<{
          first_name: string;
          last_name: string;
          email: string;
        }>;

        if (s.first_name) token.first_name = s.first_name;
        if (s.last_name) token.last_name = s.last_name;
        if (s.email) token.email = s.email;

        token.name = `${token.first_name ?? ""} ${token.last_name ?? ""}`.trim();
      }
      
      // 2) Initial sign-in (user is present only at sign-in time)
      if (user) {
        if (account?.provider === "credentials") {
          const u = user as AppUser;

          token.id = u.id;
          token.first_name = u.first_name;
          token.last_name = u.last_name;
          token.role = u.role;
          token.name = u.name;

          // user exists in database (just authenticated)
          token.dbCheckedAt = Date.now();

          return token;
        }

        // oauth (google)
        const name = user.name ?? "";
        let firstName = "none";
        let lastName = "none";

        try {
          if (name) {
            const parts = name.split(" ");
            firstName = parts[0] || "none";
            lastName = name.substring(firstName.length + 1) || "none";
          }
        } catch {
          firstName = "none";
          lastName = "none";
        }

        token.first_name = firstName;
        token.last_name = lastName;
        token.name = `${firstName} ${lastName}`.trim();

        // Option B: fetch id/role from DB using email
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role ?? "USER";

            // confirmed in DB
            token.dbCheckedAt = Date.now();
          } else {
            // rare; signIn upsert should have created it
            token.role = "USER";
            token.dbCheckedAt = Date.now();
          }
        } else {
          token.role = "USER";
          token.dbCheckedAt = Date.now();
        }

        return token;
      }
      
      // 3) Periodic DB validation for existing sessions
      // (runs on normal requests when `user` is NOT present)
      const now = Date.now();
      const lastChecked = token.dbCheckedAt ?? 0;
      const shouldRecheck = !lastChecked || now - lastChecked > DB_RECHECK_MS;

      if (shouldRecheck) {
        // If we can't identify the user, invalidate the session
        if (!token.id) return null;

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, role: true },
        });

        // If user was deleted, invalidate session => middleware redirects to login
        if (!dbUser) return null;

        // Keep token synced
        token.role = dbUser.role ?? "USER";

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

      const given = (googleInfo as any).given_name as string | undefined;
      const family = (googleInfo as any).family_name as string | undefined;

      let fName = given && given.trim() ? given.trim() : "none";
      let lName = family && family.trim() ? family.trim() : "none";

      if (fName === "none" && lName === "none" && profile.name) {
        fName = profile.name;
      }

      await prisma.user.upsert({
        where: { email: googleInfo.email },
        create: {
          email: googleInfo.email,
          first_name: fName,
          last_name: lName,
        },
        update: {
          first_name: fName,
          last_name: lName,
        },
      });

      return true;
    },
  },
});

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";

// import { prisma } from "@/lib/prisma";
// import { compare } from "bcrypt";

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// const DB_RECHECK_MINUTES = 5;
// const DB_RECHECK_MS = DB_RECHECK_MINUTES * 60 * 1000;

// type AppUser = {
//   id: string;
//   email: string;
//   name: string;
//   first_name: string;
//   last_name: string;
//   role: string;
// };

// export const { auth, handlers, signIn, signOut } = NextAuth({
//   pages: {
//     signIn: "/login",
//   },

//   session: {
//     strategy: "jwt",
//   },

//   providers: [
//     CredentialsProvider({
//       name: "Email and Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const email =
//           typeof credentials?.email === "string" ? credentials.email.trim() : "";
//         const password =
//           typeof credentials?.password === "string" ? credentials.password : "";

//         if (!email || !password) return null;

//         const dbUser = await prisma.user.findUnique({
//           where: { email },
//         });
//         if (!dbUser) return null;
//         if (!dbUser.password_hash) return null;

//         const isPasswordValid = await compare(password, dbUser.password_hash);
//         if (!isPasswordValid) return null;

//         // This object becomes `user` in the jwt() callback when provider === "credentials"
//         return {
//           id: dbUser.id,
//           email: dbUser.email,
//           name: `${dbUser.first_name} ${dbUser.last_name}`.trim(),
//           first_name: dbUser.first_name,
//           last_name: dbUser.last_name,
//           role: dbUser.role,
//         } satisfies AppUser;
//       },
//     }),

//     GoogleProvider({
//       clientId: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       profile(profile: GoogleProfile) {
//         // Keep this minimal; role comes from YOUR DB, not Google.
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: (profile as any).picture, // GoogleProfile typing differs a bit across versions
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id ?? "";
//         session.user.first_name = token.first_name ?? "";
//         session.user.last_name = token.last_name ?? "";
//         session.user.role = token.role ?? "USER";
//         session.user.name = `${session.user.first_name} ${session.user.last_name}`.trim();
//       }
//       return session;
//     },

//     async jwt({ token, user, account, session, trigger }) {
//       // Handle useSession().update(...) payloads
//       if (trigger === "update" && session) {
//         const s = session as Partial<{
//           first_name: string;
//           last_name: string;
//           email: string;
//         }>;

//         if (s.first_name) token.first_name = s.first_name;
//         if (s.last_name) token.last_name = s.last_name;
//         if (s.email) token.email = s.email;

//         token.name = `${token.first_name ?? ""} ${token.last_name ?? ""}`.trim();
//       }

//       // Initial sign-in (or when `user` is present)
//       if (user) {
//         if (account?.provider === "credentials") {
//           const u = user as AppUser;
//           token.id = u.id;
//           token.first_name = u.first_name;
//           token.last_name = u.last_name;
//           token.role = u.role;
//           token.name = u.name;
//           // mark as checked now since we KNOW user exists
//           token.dbCheckedAt = Date.now();

//           return token;
//         }

//         // oauth (google)
//         const name = user.name ?? "";
//         let firstName = "none";
//         let lastName = "none";

//         try {
//           if (name) {
//             const parts = name.split(" ");
//             firstName = parts[0] || "none";
//             lastName = name.substring(firstName.length + 1) || "none";
//           }
//         } catch {
//           firstName = "none";
//           lastName = "none";
//         }

//         token.first_name = firstName;
//         token.last_name = lastName;
//         token.name = `${firstName} ${lastName}`.trim();

//         // IMPORTANT (Option B):
//         // Pull id/role from YOUR database using email, and set them on the token.
//         if (user.email) {
//           const dbUser = await prisma.user.findUnique({
//             where: { email: user.email },
//           });

//           if (dbUser) {
//             token.id = dbUser.id;
//             token.role = dbUser.role ?? "USER";
//           } else {
//             // fallback (should be rare if signIn upsert works)
//             token.role = "USER";
//           }
//         } else {
//           token.role = "USER";
//         }

//         return token;
//       }

//       return token;
//     },

//     async signIn({ account, profile }) {
//       if (account?.provider === "credentials") return true;

//       // oauth (google)
//       if (!profile?.email) throw new Error("No Profile email");

//       const googleInfo = profile as unknown as GoogleProfile;

//       // Prefer given/family name when available
//       const given = (googleInfo as any).given_name as string | undefined;
//       const family = (googleInfo as any).family_name as string | undefined;

//       let fName = given && given.trim() ? given.trim() : "none";
//       let lName = family && family.trim() ? family.trim() : "none";

//       // Fallback to profile.name if both are missing
//       if (fName === "none" && lName === "none" && profile.name) {
//         fName = profile.name;
//       }

//       // Ensure user exists / updated in DB.
//       // Role is stored in DB and will be read in jwt() above.
//       await prisma.user.upsert({
//         where: { email: googleInfo.email },
//         create: {
//           email: googleInfo.email,
//           first_name: fName,
//           last_name: lName,
//         },
//         update: {
//           first_name: fName,
//           last_name: lName,
//         },
//       });

//       return true;
//     },
//   },
// });
