import Link from "next/link";

export default function Denied() {
  return (
    <div>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      {/* Add a link to the home page */}
      <Link href="/" className="">
        Return to Home Page
      </Link>
    </div>
  )
}