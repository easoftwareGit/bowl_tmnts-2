import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  // keep jwt strategy here (no DB required)
  session: {
    strategy: "jwt",
  },

  // NextAuth expects a providers array; middleware doesn't need providers to *check* auth,
  // but config still wants the field present in many setups.
  // IMPORTANT:
  // Keep providers empty so middleware stays Edge-safe (no prisma/bcrypt imports).
  providers: [],

  callbacks: {
    /**
     * Copy custom fields from the JWT into the session object that middleware sees as `req.auth`.
     * This is what makes `req.auth.user.role` available in `src/middleware.ts`.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).first_name = (token as any).first_name;
        (session.user as any).last_name = (token as any).last_name;
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },  

} satisfies NextAuthConfig;
