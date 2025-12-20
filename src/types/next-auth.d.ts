import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      role: string;
    } & DefaultSession["user"];
  }

  // make these OPTIONAL so OAuth profile() can return minimal fields
  interface User extends DefaultUser {
    id?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    dbCheckedAt?: number; // epoch milliseconds
  }
}