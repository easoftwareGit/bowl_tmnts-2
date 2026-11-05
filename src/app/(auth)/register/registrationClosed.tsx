import Link from "next/link";

export function RegistrationClosed() {
  return (
    <div>
      <h2 className="mb-3">Registration Closed</h2>
      <p>New accounts are not being accepted right now.</p>
      <p>
        Tournament director accounts are created by the site administrator. If
        you need one, please <Link href="/contact">contact us</Link>.
      </p>
      <p className="mb-0">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}