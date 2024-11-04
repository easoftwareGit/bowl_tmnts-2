"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function SecretPage() {

  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // the user is not authenticated, handle it here
      // console.log('Not Logged in!')
      redirect('/')
    },
  })

  if (status === "loading") {
    return 'loading or unauthenticated'
  }

  return (
    <div>
      <h1>Secret Page</h1>      
    </div>
  )
}