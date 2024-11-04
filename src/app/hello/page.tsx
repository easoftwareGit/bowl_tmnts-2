import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/components/users/userFromClient";
import { LoginButton, LogoutButton } from "@/components/auth";

export default async function Hello() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <h1>Hello</h1>
      <LoginButton />
      <LogoutButton />
      <h2>Server</h2>
      <pre>{JSON.stringify(session)}</pre>      
      <h2>Client</h2>
      <User />
    </div>
  );
}
