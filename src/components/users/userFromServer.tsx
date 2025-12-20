import { auth } from "@/auth";

export async function userFromServer() {
  try {
    const session = await auth();
    return JSON.stringify(session)
  } catch (error) {
    return JSON.stringify(null);
  }
}