import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function userFromServer() {
  try {
    const session = await getServerSession(authOptions)
    return JSON.stringify(session)
  } catch (error) {
    return JSON.stringify(null);
  }
  // const session = await getServerSession(authOptions)
  // return JSON.stringify(session)
}