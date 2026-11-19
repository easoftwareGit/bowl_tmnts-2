import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Layout for every page under (private): dataEntry, reports and user.
 * Sends visitors who aren't logged in to /login.
 *
 * @param props.children - the page being rendered
 * @returns the page, if the user is logged in
 */
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // reads the session cookie on the server and runs the jwt callback in auth.ts;
  // returns null if no one is logged in or the user was deleted from the database
  const session = await auth();

  // no session or no user means not logged in
  if (!session?.user) {
    // throws a redirect, so nothing below this line runs
    redirect("/login");
  }

  // logged in: render the page; the fragment (<>...</>) adds no extra HTML
  return <>{children}</>;
}