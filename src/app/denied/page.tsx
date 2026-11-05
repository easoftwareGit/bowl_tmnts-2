import Link from "next/link";

export default function Denied() {
  return (
    <div className="container mt-4">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <Link href="/">
        Return to Home Page
      </Link>
    </div>
  );
}
