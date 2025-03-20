import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function userFromServer() {
  try {
    const session = await getServerSession(authOptions)
    return JSON.stringify(session)
  } catch (error) {
    return JSON.stringify(null);
  }
}