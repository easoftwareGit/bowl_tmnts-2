import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function SecretPage() {

  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('api/auth/signin');
  }

  return (
    <div>
      <h1>Secret Page</h1>      
    </div>
  )
}