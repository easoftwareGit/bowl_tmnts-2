import { auth } from "@/auth";
import { redirect } from "next/navigation"

export default async function SecretPage() {

  const session = await auth();
  if (!session) {
    redirect('api/auth/signin');
  }

  return (
    <div>
      <h1>Secret Page</h1>      
    </div>
  )
}